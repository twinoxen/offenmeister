import type { Doc, Id } from '../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../_generated/server'
import { authComponent } from '../auth'
import { levelForPoints } from '../lib/scoring'

/**
 * Resolve the app-side `users` row for the currently authenticated request, or
 * `null` when signed out. Auth identity comes from the Better Auth component;
 * `authId` links it to our mirrored user row.
 */
export async function getCurrentUser(ctx: QueryCtx | MutationCtx): Promise<Doc<'users'> | null> {
  const authUser = await authComponent.safeGetAuthUser(ctx)
  if (!authUser) return null
  return await ctx.db
    .query('users')
    .withIndex('by_auth_id', (q) => q.eq('authId', authUser._id))
    .first()
}

/** Like {@link getCurrentUser} but throws when unauthenticated. */
export async function requireCurrentUser(
  ctx: QueryCtx | MutationCtx,
): Promise<Doc<'users'>> {
  const user = await getCurrentUser(ctx)
  if (!user) throw new Error('Not authenticated')
  return user
}

/** Fetch the user's stats row for a pair, creating it on first use. */
export async function getOrCreateStats(
  ctx: MutationCtx,
  userId: Id<'users'>,
  pairId: Id<'languagePairs'>,
): Promise<Doc<'userStats'>> {
  const existing = await ctx.db
    .query('userStats')
    .withIndex('by_user_pair', (q) => q.eq('userId', userId).eq('pairId', pairId))
    .first()
  if (existing) return existing

  const id = await ctx.db.insert('userStats', {
    userId,
    pairId,
    points: 0,
    level: levelForPoints(0),
    dailyStreak: 0,
    longestStreak: 0,
    lastPlayedDate: '',
    playedToday: 0,
    totalAnswered: 0,
    totalCorrect: 0,
    masteredCount: 0,
  })
  return (await ctx.db.get(id))!
}
