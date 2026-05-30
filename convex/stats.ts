import { v } from 'convex/values'
import { query } from './_generated/server'
import { DEFAULT_DAILY_GOAL, dateKey, levelProgress } from './lib/scoring'
import { getCurrentUser } from './model/users'

/**
 * Dashboard/stats summary for a pair: points, level (+ progress to next),
 * streaks, daily-goal progress, mastery counts, and accuracy.
 */
export const summary = query({
  args: { pairId: v.id('languagePairs') },
  handler: async (ctx, { pairId }) => {
    const user = await getCurrentUser(ctx)
    if (!user) return null

    const stats = await ctx.db
      .query('userStats')
      .withIndex('by_user_pair', (q) => q.eq('userId', user._id).eq('pairId', pairId))
      .first()

    const totalSentences = (
      await ctx.db
        .query('sentences')
        .withIndex('by_pair', (q) => q.eq('pairId', pairId))
        .collect()
    ).length

    const progressRows = await ctx.db
      .query('progress')
      .withIndex('by_user_due', (q) => q.eq('userId', user._id).eq('pairId', pairId))
      .collect()

    const now = Date.now()
    const today = dateKey(now)
    const played = progressRows.length
    const mastered = progressRows.filter((r) => r.status === 'mastered').length
    const due = progressRows.filter((r) => r.nextReviewAt <= now && r.status !== 'mastered').length

    const points = stats?.points ?? 0
    const playedToday = stats && stats.lastPlayedDate === today ? stats.playedToday : 0
    const dailyGoal = user.dailyGoal ?? DEFAULT_DAILY_GOAL
    const totalAnswered = stats?.totalAnswered ?? 0
    const totalCorrect = stats?.totalCorrect ?? 0

    return {
      points,
      ...levelProgress(points),
      dailyStreak: stats?.dailyStreak ?? 0,
      longestStreak: stats?.longestStreak ?? 0,
      dailyGoal,
      playedToday,
      goalPercent: dailyGoal > 0 ? Math.min(100, Math.round((playedToday / dailyGoal) * 100)) : 0,
      totalSentences,
      played,
      mastered,
      due,
      completionPercent: totalSentences > 0 ? Math.round((mastered / totalSentences) * 100) : 0,
      accuracy: totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0,
      totalAnswered,
    }
  },
})
