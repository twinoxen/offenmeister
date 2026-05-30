import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import type { Doc } from './_generated/dataModel'
import { checkAnswer } from './lib/cloze'
import { initialState, review, type SrsState } from './lib/srs'
import { DEFAULT_DAILY_GOAL, dateKey, levelForPoints, pointsForAnswer, updateStreak } from './lib/scoring'
import { getCurrentUser, getOrCreateStats, requireCurrentUser } from './model/users'

const playMode = v.union(v.literal('multipleChoice'), v.literal('textInput'))

function toSrsState(progress: Doc<'progress'> | null, now: number): SrsState {
  if (!progress) return initialState(now)
  return {
    srsLevel: progress.srsLevel,
    status: progress.status,
    nextReviewAt: progress.nextReviewAt,
    lastReviewedAt: progress.lastReviewedAt,
    timesSeen: progress.timesSeen,
    timesCorrect: progress.timesCorrect,
    timesWrong: progress.timesWrong,
  }
}

/**
 * Build a play queue for a collection: due reviews first (oldest first), then
 * never-seen sentences in frequency order. Mastered cards that aren't due are
 * skipped. The answer + distractors are returned so the client can render and
 * the server can still authoritatively grade `submitAnswer`.
 */
export const getQueue = query({
  args: { collectionId: v.id('collections'), limit: v.optional(v.number()) },
  handler: async (ctx, { collectionId, limit }) => {
    const user = await getCurrentUser(ctx)
    const collection = await ctx.db.get(collectionId)
    if (!collection) return null

    const sentences = await ctx.db
      .query('sentences')
      .withIndex('by_collection', (q) => q.eq('collectionId', collectionId))
      .collect()

    const progressBySentence = new Map<string, Doc<'progress'>>()
    if (user) {
      const rows = await ctx.db
        .query('progress')
        .withIndex('by_user_collection', (q) => q.eq('userId', user._id).eq('collectionId', collectionId))
        .collect()
      for (const row of rows) progressBySentence.set(row.sentenceId, row)
    }

    const now = Date.now()
    const due: { sentence: Doc<'sentences'>; progress: Doc<'progress'> }[] = []
    const fresh: Doc<'sentences'>[] = []
    for (const sentence of sentences) {
      const progress = progressBySentence.get(sentence._id)
      if (!progress) fresh.push(sentence)
      else if (progress.nextReviewAt <= now && progress.status !== 'mastered') due.push({ sentence, progress })
    }
    due.sort((a, b) => a.progress.nextReviewAt - b.progress.nextReviewAt)
    fresh.sort((a, b) => a.frequencyRank - b.frequencyRank)

    const ordered = [
      ...due.map((d) => ({ sentence: d.sentence, progress: d.progress })),
      ...fresh.map((sentence) => ({ sentence, progress: undefined as Doc<'progress'> | undefined })),
    ].slice(0, limit ?? 20)

    return {
      collection: { _id: collection._id, name: collection.name, slug: collection.slug },
      dueCount: due.length,
      newCount: fresh.length,
      cards: ordered.map(({ sentence, progress }) => ({
        _id: sentence._id,
        tokens: sentence.tokens,
        clozeIndex: sentence.clozeIndex,
        clozeWord: sentence.clozeWord,
        translation: sentence.translation,
        distractors: sentence.distractors,
        hint: sentence.hint,
        hasExplanation: !!sentence.explanation,
        srsLevel: progress?.srsLevel ?? 0,
        status: progress?.status ?? ('new' as const),
        isNew: !progress,
      })),
    }
  },
})

/**
 * Grade an answer authoritatively, advance the SRS schedule, and update points,
 * streaks, and aggregate stats. Returns everything the UI needs for feedback.
 */
export const submitAnswer = mutation({
  args: {
    sentenceId: v.id('sentences'),
    answer: v.string(),
    mode: playMode,
    answerStreak: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx)
    const sentence = await ctx.db.get(args.sentenceId)
    if (!sentence) throw new Error('Sentence not found')

    const correct = checkAnswer(args.answer, sentence.clozeWord, {
      caseSensitive: user.caseSensitive ?? false,
      accentSensitive: user.accentSensitive ?? false,
    })

    const now = Date.now()

    // --- SRS / progress -----------------------------------------------------
    const existing = await ctx.db
      .query('progress')
      .withIndex('by_user_sentence', (q) => q.eq('userId', user._id).eq('sentenceId', sentence._id))
      .first()
    const prevState = toSrsState(existing ?? null, now)
    const nextState = review(prevState, correct, now)

    if (existing) {
      await ctx.db.patch(existing._id, {
        srsLevel: nextState.srsLevel,
        status: nextState.status,
        nextReviewAt: nextState.nextReviewAt,
        lastReviewedAt: nextState.lastReviewedAt,
        timesSeen: nextState.timesSeen,
        timesCorrect: nextState.timesCorrect,
        timesWrong: nextState.timesWrong,
      })
    } else {
      await ctx.db.insert('progress', {
        userId: user._id,
        sentenceId: sentence._id,
        collectionId: sentence.collectionId,
        pairId: sentence.pairId,
        srsLevel: nextState.srsLevel,
        status: nextState.status,
        nextReviewAt: nextState.nextReviewAt,
        lastReviewedAt: nextState.lastReviewedAt,
        timesSeen: nextState.timesSeen,
        timesCorrect: nextState.timesCorrect,
        timesWrong: nextState.timesWrong,
      })
    }

    // --- Stats / gamification ----------------------------------------------
    const stats = await getOrCreateStats(ctx, user._id, sentence.pairId)
    const today = dateKey(now)
    const streak = updateStreak(
      { dailyStreak: stats.dailyStreak, longestStreak: stats.longestStreak, lastPlayedDate: stats.lastPlayedDate },
      today,
    )
    const gained = pointsForAnswer(args.mode, correct, args.answerStreak ?? 0)
    const points = stats.points + gained
    const playedToday = (stats.lastPlayedDate === today ? stats.playedToday : 0) + 1
    const wasMastered = existing?.status === 'mastered'
    const nowMastered = nextState.status === 'mastered'
    const masteredCount = stats.masteredCount + (nowMastered ? 1 : 0) - (wasMastered ? 1 : 0)

    await ctx.db.patch(stats._id, {
      points,
      level: levelForPoints(points),
      dailyStreak: streak.dailyStreak,
      longestStreak: streak.longestStreak,
      lastPlayedDate: today,
      playedToday,
      totalAnswered: stats.totalAnswered + 1,
      totalCorrect: stats.totalCorrect + (correct ? 1 : 0),
      masteredCount: Math.max(0, masteredCount),
    })

    await ctx.db.insert('reviewLog', {
      userId: user._id,
      pairId: sentence.pairId,
      sentenceId: sentence._id,
      correct,
      mode: args.mode,
    })

    return {
      correct,
      expected: sentence.clozeWord,
      gainedPoints: gained,
      points,
      level: levelForPoints(points),
      srsLevel: nextState.srsLevel,
      status: nextState.status,
      dailyStreak: streak.dailyStreak,
      playedToday,
      dailyGoal: user.dailyGoal ?? DEFAULT_DAILY_GOAL,
    }
  },
})

/** All currently-due reviews across the active pair (for the Review page). */
export const getDueReviews = query({
  args: { pairId: v.id('languagePairs'), limit: v.optional(v.number()) },
  handler: async (ctx, { pairId, limit }) => {
    const user = await getCurrentUser(ctx)
    if (!user) return { cards: [], dueCount: 0 }
    const now = Date.now()
    const rows = await ctx.db
      .query('progress')
      .withIndex('by_user_due', (q) => q.eq('userId', user._id).eq('pairId', pairId).lte('nextReviewAt', now))
      .collect()
    const dueRows = rows.filter((r) => r.status !== 'mastered').sort((a, b) => a.nextReviewAt - b.nextReviewAt)

    const cards = []
    for (const row of dueRows.slice(0, limit ?? 20)) {
      const sentence = await ctx.db.get(row.sentenceId)
      if (!sentence) continue
      cards.push({
        _id: sentence._id,
        tokens: sentence.tokens,
        clozeIndex: sentence.clozeIndex,
        clozeWord: sentence.clozeWord,
        translation: sentence.translation,
        distractors: sentence.distractors,
        hint: sentence.hint,
        hasExplanation: !!sentence.explanation,
        srsLevel: row.srsLevel,
        status: row.status,
        isNew: false,
      })
    }
    return { cards, dueCount: dueRows.length }
  },
})
