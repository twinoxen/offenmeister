import { v } from 'convex/values'
import { query } from './_generated/server'
import type { Doc } from './_generated/dataModel'
import { getCurrentUser } from './model/users'

/**
 * Collections for a pair, each annotated with the current learner's progress
 * (played / mastered / due counts). Progress is zeroed when signed out.
 */
export const listForPair = query({
  args: { pairId: v.id('languagePairs') },
  handler: async (ctx, { pairId }) => {
    const collections = await ctx.db
      .query('collections')
      .withIndex('by_pair', (q) => q.eq('pairId', pairId))
      .collect()

    const user = await getCurrentUser(ctx)
    const progressByCollection = new Map<string, Doc<'progress'>[]>()
    if (user) {
      const rows = await ctx.db
        .query('progress')
        .withIndex('by_user_due', (q) => q.eq('userId', user._id).eq('pairId', pairId))
        .collect()
      for (const row of rows) {
        const list = progressByCollection.get(row.collectionId) ?? []
        list.push(row)
        progressByCollection.set(row.collectionId, list)
      }
    }

    const now = Date.now()
    return collections
      .map((c) => {
        const rows = progressByCollection.get(c._id) ?? []
        const mastered = rows.filter((r) => r.status === 'mastered').length
        const played = rows.length
        const due = rows.filter((r) => r.nextReviewAt <= now && r.status !== 'mastered').length
        return {
          _id: c._id,
          slug: c.slug,
          name: c.name,
          description: c.description,
          order: c.order,
          sentenceCount: c.sentenceCount,
          played,
          mastered,
          due,
          percentMastered: c.sentenceCount > 0 ? Math.round((mastered / c.sentenceCount) * 100) : 0,
        }
      })
      .sort((a, b) => a.order - b.order)
  },
})

/** Look up a collection (and its pair) by slug, for the play screen header. */
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const collection = await ctx.db
      .query('collections')
      .withIndex('by_slug', (q) => q.eq('slug', slug))
      .first()
    if (!collection) return null
    const pair = await ctx.db.get(collection.pairId)
    return { collection, pair }
  },
})
