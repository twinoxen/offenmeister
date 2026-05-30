import { v } from 'convex/values'
import { mutation } from './_generated/server'
import { requireCurrentUser } from './model/users'

/** Set the language pair the learner is currently studying. */
export const setActivePair = mutation({
  args: { pairId: v.id('languagePairs') },
  handler: async (ctx, { pairId }) => {
    const user = await requireCurrentUser(ctx)
    const pair = await ctx.db.get(pairId)
    if (!pair) throw new Error('Language pair not found')
    await ctx.db.patch(user._id, { activePairId: pairId, updatedAt: Date.now() })
    return { ok: true }
  },
})

/** Update gameplay preferences (daily goal, answer matching, default mode). */
export const updatePreferences = mutation({
  args: {
    dailyGoal: v.optional(v.number()),
    caseSensitive: v.optional(v.boolean()),
    accentSensitive: v.optional(v.boolean()),
    defaultMode: v.optional(v.union(v.literal('multipleChoice'), v.literal('textInput'))),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx)
    const patch: Record<string, unknown> = { updatedAt: Date.now() }
    if (args.dailyGoal !== undefined) patch.dailyGoal = Math.max(5, Math.min(500, args.dailyGoal))
    if (args.caseSensitive !== undefined) patch.caseSensitive = args.caseSensitive
    if (args.accentSensitive !== undefined) patch.accentSensitive = args.accentSensitive
    if (args.defaultMode !== undefined) patch.defaultMode = args.defaultMode
    await ctx.db.patch(user._id, patch)
    return { ok: true }
  },
})
