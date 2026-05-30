import { query } from './_generated/server'

/** List every available language pair with display metadata (flags, names). */
export const listPairs = query({
  args: {},
  handler: async (ctx) => {
    const pairs = await ctx.db.query('languagePairs').collect()
    const result = []
    for (const pair of pairs) {
      const target = await ctx.db.get(pair.targetLangId)
      const base = await ctx.db.get(pair.baseLangId)
      const collections = await ctx.db
        .query('collections')
        .withIndex('by_pair', (q) => q.eq('pairId', pair._id))
        .collect()
      const sentenceCount = collections.reduce((sum, c) => sum + c.sentenceCount, 0)
      result.push({
        _id: pair._id,
        slug: pair.slug,
        name: pair.name,
        target: target && { name: target.name, nativeName: target.nativeName, flag: target.flag, code: target.code },
        base: base && { name: base.name, flag: base.flag, code: base.code },
        collectionCount: collections.length,
        sentenceCount,
      })
    }
    return result.sort((a, b) => a.name.localeCompare(b.name))
  },
})
