import { mutation } from './_generated/server'
import type { Id } from './_generated/dataModel'
import { normalizeAnswer, tokenize } from './lib/cloze'
import { LANGUAGES, PAIRS, type SeedSentence } from './seed/data'

/** Locate the token index for the cloze word within a tokenized sentence. */
function findClozeIndex(tokens: string[], clozeWord: string): number {
  let index = tokens.indexOf(clozeWord)
  if (index !== -1) return index
  // Fall back to an accent-insensitive comparison, keeping accents significant
  // so we never blank the wrong inflected form.
  index = tokens.findIndex(
    (t) => normalizeAnswer(t, { accentSensitive: true }) === normalizeAnswer(clozeWord, { accentSensitive: true }),
  )
  if (index === -1) {
    throw new Error(`Cloze word "${clozeWord}" not found in sentence tokens: ${tokens.join('')}`)
  }
  return index
}

/**
 * Idempotently load the bundled content. Safe to run repeatedly: it skips
 * languages, pairs, and collections that already exist. Run with
 * `npx convex run seed:run`.
 */
export const run = mutation({
  args: {},
  handler: async (ctx) => {
    const summary = { languages: 0, pairs: 0, collections: 0, sentences: 0 }

    // 1. Languages -----------------------------------------------------------
    const langIdByCode = new Map<string, Id<'languages'>>()
    for (const lang of LANGUAGES) {
      const existing = await ctx.db
        .query('languages')
        .withIndex('by_code', (q) => q.eq('code', lang.code))
        .first()
      if (existing) {
        langIdByCode.set(lang.code, existing._id)
        continue
      }
      const id = await ctx.db.insert('languages', lang)
      langIdByCode.set(lang.code, id)
      summary.languages++
    }

    // 2. Pairs, collections, sentences --------------------------------------
    for (const pair of PAIRS) {
      const targetLangId = langIdByCode.get(pair.targetCode)
      const baseLangId = langIdByCode.get(pair.baseCode)
      if (!targetLangId || !baseLangId) {
        throw new Error(`Missing language for pair ${pair.slug}`)
      }

      const pairDoc = await ctx.db
        .query('languagePairs')
        .withIndex('by_slug', (q) => q.eq('slug', pair.slug))
        .first()
      let pairId: Id<'languagePairs'>
      if (pairDoc) {
        pairId = pairDoc._id
      } else {
        pairId = await ctx.db.insert('languagePairs', {
          slug: pair.slug,
          name: pair.name,
          targetLangId,
          baseLangId,
          targetCode: pair.targetCode,
          baseCode: pair.baseCode,
        })
        summary.pairs++
      }

      let order = 0
      let frequencyRank = 0
      for (const collection of pair.collections) {
        const existingCollection = await ctx.db
          .query('collections')
          .withIndex('by_slug', (q) => q.eq('slug', collection.slug))
          .first()
        order++
        frequencyRank += collection.sentences.length
        if (existingCollection) continue

        const collectionId = await ctx.db.insert('collections', {
          pairId,
          slug: collection.slug,
          name: collection.name,
          description: collection.description,
          order,
          sentenceCount: collection.sentences.length,
        })
        summary.collections++

        let rank = frequencyRank - collection.sentences.length
        for (const sentence of collection.sentences as SeedSentence[]) {
          const tokens = tokenize(sentence.text)
          const clozeIndex = findClozeIndex(tokens, sentence.clozeWord)
          await ctx.db.insert('sentences', {
            collectionId,
            pairId,
            text: sentence.text,
            tokens,
            clozeIndex,
            clozeWord: sentence.clozeWord,
            translation: sentence.translation,
            distractors: sentence.distractors,
            hint: sentence.hint,
            frequencyRank: rank++,
          })
          summary.sentences++
        }
      }
    }

    return summary
  },
})
