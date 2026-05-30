import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

/**
 * Offenmeister data model.
 *
 * Auth tables live inside the Better Auth Convex component; the `users` table
 * below is our own app-side mirror, kept in sync by triggers in `auth.ts`.
 */
export default defineSchema({
  // --- Identity (synced from Better Auth) -----------------------------------
  users: defineTable({
    authId: v.string(),
    displayName: v.optional(v.string()),
    email: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    // The language pair the learner is currently studying.
    activePairId: v.optional(v.id('languagePairs')),
    dailyGoal: v.optional(v.number()),
    // Answer-matching preferences for typed answers.
    caseSensitive: v.optional(v.boolean()),
    accentSensitive: v.optional(v.boolean()),
    defaultMode: v.optional(v.union(v.literal('multipleChoice'), v.literal('textInput'))),
  })
    .index('by_auth_id', ['authId'])
    .index('by_email', ['email']),

  // --- Content --------------------------------------------------------------
  languages: defineTable({
    code: v.string(), // ISO 639-1, e.g. "es"
    name: v.string(), // English name, e.g. "Spanish"
    nativeName: v.string(), // e.g. "Español"
    flag: v.string(), // emoji
  }).index('by_code', ['code']),

  languagePairs: defineTable({
    slug: v.string(), // e.g. "es-from-en"
    targetLangId: v.id('languages'), // language being learned
    baseLangId: v.id('languages'), // language the learner already knows
    targetCode: v.string(),
    baseCode: v.string(),
    name: v.string(), // e.g. "Spanish from English"
  }).index('by_slug', ['slug']),

  collections: defineTable({
    pairId: v.id('languagePairs'),
    slug: v.string(), // unique, e.g. "es-fast-track-1-50"
    name: v.string(), // e.g. "Fast Track 1–50"
    description: v.string(),
    order: v.number(),
    sentenceCount: v.number(),
  })
    .index('by_pair', ['pairId', 'order'])
    .index('by_slug', ['slug']),

  sentences: defineTable({
    collectionId: v.id('collections'),
    pairId: v.id('languagePairs'),
    text: v.string(), // full target-language sentence
    tokens: v.array(v.string()), // render tokens (see lib/cloze.tokenize)
    clozeIndex: v.number(), // index into tokens that is blanked
    clozeWord: v.string(), // the missing word (answer)
    translation: v.string(), // base-language translation
    distractors: v.array(v.string()), // wrong options for multiple choice
    hint: v.optional(v.string()),
    frequencyRank: v.number(), // lower = more common
    // Cached on-demand AI explanation (see ai.ts), if generated.
    explanation: v.optional(
      v.object({
        grammar: v.string(),
        hint: v.string(),
        example: v.string(),
        generatedAt: v.number(),
      }),
    ),
  })
    .index('by_collection', ['collectionId', 'frequencyRank'])
    .index('by_pair', ['pairId', 'frequencyRank']),

  // --- Per-user learning state ---------------------------------------------
  progress: defineTable({
    userId: v.id('users'),
    sentenceId: v.id('sentences'),
    collectionId: v.id('collections'),
    pairId: v.id('languagePairs'),
    srsLevel: v.number(),
    status: v.union(v.literal('new'), v.literal('learning'), v.literal('mastered')),
    nextReviewAt: v.number(),
    lastReviewedAt: v.number(),
    timesSeen: v.number(),
    timesCorrect: v.number(),
    timesWrong: v.number(),
  })
    .index('by_user_sentence', ['userId', 'sentenceId'])
    .index('by_user_due', ['userId', 'pairId', 'nextReviewAt'])
    .index('by_user_collection', ['userId', 'collectionId']),

  userStats: defineTable({
    userId: v.id('users'),
    pairId: v.id('languagePairs'),
    points: v.number(),
    level: v.number(),
    dailyStreak: v.number(),
    longestStreak: v.number(),
    lastPlayedDate: v.string(), // YYYY-MM-DD (UTC)
    playedToday: v.number(),
    totalAnswered: v.number(),
    totalCorrect: v.number(),
    masteredCount: v.number(),
  }).index('by_user_pair', ['userId', 'pairId']),

  reviewLog: defineTable({
    userId: v.id('users'),
    pairId: v.id('languagePairs'),
    sentenceId: v.id('sentences'),
    correct: v.boolean(),
    mode: v.union(v.literal('multipleChoice'), v.literal('textInput')),
  }).index('by_user', ['userId']),
})
