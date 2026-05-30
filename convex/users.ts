import { query } from './_generated/server'
import { DEFAULT_DAILY_GOAL } from './lib/scoring'
import { getCurrentUser } from './model/users'

/**
 * The current learner's profile and preferences, or `null` when signed out.
 * Used by the app header, settings page, and play screen defaults.
 */
export const me = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx)
    if (!user) return null

    let activePair = null
    if (user.activePairId) {
      const pair = await ctx.db.get(user.activePairId)
      if (pair) activePair = { _id: pair._id, slug: pair.slug, name: pair.name }
    }

    return {
      _id: user._id,
      displayName: user.displayName ?? null,
      email: user.email ?? null,
      avatarUrl: user.avatarUrl ?? null,
      activePairId: user.activePairId ?? null,
      activePair,
      dailyGoal: user.dailyGoal ?? DEFAULT_DAILY_GOAL,
      caseSensitive: user.caseSensitive ?? false,
      accentSensitive: user.accentSensitive ?? false,
      defaultMode: user.defaultMode ?? 'multipleChoice',
    }
  },
})
