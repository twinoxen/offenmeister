/**
 * Cloze (fill-in-the-blank) helpers.
 *
 * Pure, framework-agnostic functions shared between the Convex backend and the
 * Nuxt frontend. A "cloze" is a sentence with exactly one word removed; the
 * learner supplies the missing word in context.
 */

export const BLANK_PLACEHOLDER = ' ____ '

/**
 * Split a sentence into render tokens. Words and punctuation are kept as
 * separate tokens so the UI can blank out a single word while preserving
 * surrounding punctuation.
 *
 * Example: "Yo no sé." -> ["Yo", " ", "no", " ", "sé", "."]
 */
export function tokenize(text: string): string[] {
  // Match runs of letters/digits/apostrophes (a "word") OR any other single char.
  const matches = text.match(/[\p{L}\p{N}]+(?:[''-][\p{L}\p{N}]+)*|\s+|[^\s]/gu)
  return matches ?? []
}

/** Indexes of the tokens that are "words" (eligible to be the cloze word). */
export function wordTokenIndexes(tokens: string[]): number[] {
  const indexes: number[] = []
  tokens.forEach((token, i) => {
    if (/[\p{L}\p{N}]/u.test(token)) indexes.push(i)
  })
  return indexes
}

/**
 * Strip diacritics so "está" compares equal to "esta" when accent sensitivity
 * is turned off.
 */
export function foldAccents(input: string): string {
  return input.normalize('NFD').replace(/[̀-ͯ]/g, '')
}

export interface MatchOptions {
  /** When false (default), comparison ignores letter case. */
  caseSensitive?: boolean
  /** When false (default), comparison ignores accents/diacritics. */
  accentSensitive?: boolean
}

/** Normalize a single answer token for comparison. */
export function normalizeAnswer(value: string, options: MatchOptions = {}): string {
  let result = value.trim()
  // Drop surrounding punctuation that the learner shouldn't need to type.
  result = result.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '')
  if (!options.caseSensitive) result = result.toLocaleLowerCase()
  if (!options.accentSensitive) result = foldAccents(result)
  return result
}

/**
 * Check a typed/selected answer against the expected cloze word. Lenient by
 * default (case- and accent-insensitive) which mirrors how most learners
 * expect typing practice to behave.
 */
export function checkAnswer(
  input: string,
  expected: string,
  options: MatchOptions = {},
): boolean {
  if (!input) return false
  return normalizeAnswer(input, options) === normalizeAnswer(expected, options)
}

/**
 * Build a set of multiple-choice options: the correct word plus distractors,
 * shuffled deterministically when a seed is provided (stable SSR rendering).
 */
export function buildChoices(
  answer: string,
  distractors: string[],
  seed?: number,
): string[] {
  const unique = [answer, ...distractors.filter((d) => normalizeAnswer(d) !== normalizeAnswer(answer))]
  return shuffle(unique, seed)
}

/** Deterministic (seeded) Fisher–Yates shuffle. Falls back to Math.random. */
export function shuffle<T>(items: T[], seed?: number): T[] {
  const arr = [...items]
  let rng: () => number
  if (seed === undefined) {
    rng = Math.random
  } else {
    let s = seed % 2147483647
    if (s <= 0) s += 2147483646
    rng = () => {
      s = (s * 16807) % 2147483647
      return (s - 1) / 2147483646
    }
  }
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j]!, arr[i]!]
  }
  return arr
}
