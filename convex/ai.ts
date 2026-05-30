import { v } from 'convex/values'
import { action, internalMutation, internalQuery } from './_generated/server'
import { internal } from './_generated/api'

const MODEL = process.env.AI_MODEL ?? 'claude-haiku-4-5-20251001'

export const getSentenceForAi = internalQuery({
  args: { sentenceId: v.id('sentences') },
  handler: async (ctx, { sentenceId }) => {
    const sentence = await ctx.db.get(sentenceId)
    if (!sentence) return null
    const pair = await ctx.db.get(sentence.pairId)
    const target = pair ? await ctx.db.get(pair.targetLangId) : null
    return {
      text: sentence.text,
      clozeWord: sentence.clozeWord,
      translation: sentence.translation,
      language: target?.name ?? 'the target language',
      explanation: sentence.explanation ?? null,
    }
  },
})

export const cacheExplanation = internalMutation({
  args: {
    sentenceId: v.id('sentences'),
    grammar: v.string(),
    hint: v.string(),
    example: v.string(),
  },
  handler: async (ctx, { sentenceId, grammar, hint, example }) => {
    await ctx.db.patch(sentenceId, {
      explanation: { grammar, hint, example, generatedAt: Date.now() },
    })
  },
})

interface Explanation {
  grammar: string
  hint: string
  example: string
}

/**
 * On-demand AI assistance for a sentence: a short grammar breakdown, a
 * contextual hint about the missing word, and an extra example sentence.
 *
 * Results are cached on the sentence so repeat requests are free. When
 * `ANTHROPIC_API_KEY` is not configured, returns `{ available: false }` so the
 * UI can hide the feature gracefully.
 */
export const explainSentence = action({
  args: { sentenceId: v.id('sentences') },
  handler: async (ctx, { sentenceId }): Promise<{ available: boolean; explanation?: Explanation }> => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error('Not authenticated')

    const apiKey = process.env.ANTHROPIC_API_KEY
    const sentence = await ctx.runQuery(internal.ai.getSentenceForAi, { sentenceId })
    if (!sentence) throw new Error('Sentence not found')

    if (sentence.explanation) {
      return { available: true, explanation: sentence.explanation }
    }
    if (!apiKey) return { available: false }

    const prompt = `You are a concise language tutor. For the ${sentence.language} sentence below, the learner is practicing the missing word "${sentence.clozeWord}".

Sentence: ${sentence.text}
English translation: ${sentence.translation}

Respond with ONLY a JSON object (no markdown) with exactly these string keys:
- "grammar": one or two sentences explaining the grammar/role of "${sentence.clozeWord}" in this sentence.
- "hint": a short hint that helps recall the word without giving it away outright.
- "example": one new short ${sentence.language} example sentence using "${sentence.clozeWord}", followed by its English translation in parentheses.`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 400,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) {
      throw new Error(`AI request failed (${response.status})`)
    }

    const data = (await response.json()) as { content?: { text?: string }[] }
    const text = data.content?.[0]?.text ?? ''
    const explanation = parseExplanation(text)
    if (!explanation) throw new Error('Could not parse AI response')

    await ctx.runMutation(internal.ai.cacheExplanation, { sentenceId, ...explanation })
    return { available: true, explanation }
  },
})

/** Extract the JSON object from the model's reply, tolerating stray prose. */
function parseExplanation(text: string): Explanation | null {
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end === -1) return null
  try {
    const parsed = JSON.parse(text.slice(start, end + 1)) as Partial<Explanation>
    if (typeof parsed.grammar === 'string' && typeof parsed.hint === 'string' && typeof parsed.example === 'string') {
      return { grammar: parsed.grammar, hint: parsed.hint, example: parsed.example }
    }
  } catch {
    return null
  }
  return null
}
