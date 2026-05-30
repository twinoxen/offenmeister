import { describe, expect, it } from 'vitest'
import {
  buildChoices,
  checkAnswer,
  foldAccents,
  normalizeAnswer,
  shuffle,
  tokenize,
  wordTokenIndexes,
} from './cloze'

describe('tokenize', () => {
  it('keeps words and punctuation as separate tokens', () => {
    expect(tokenize('Yo no sé.')).toEqual(['Yo', ' ', 'no', ' ', 'sé', '.'])
  })

  it('reconstructs the original sentence when joined', () => {
    const text = "C'est la vie, n'est-ce pas ?"
    expect(tokenize(text).join('')).toBe(text)
  })

  it('identifies word token indexes', () => {
    const tokens = tokenize('Hola, mundo!')
    expect(wordTokenIndexes(tokens).map((i) => tokens[i])).toEqual(['Hola', 'mundo'])
  })
})

describe('accent + answer matching', () => {
  it('folds accents', () => {
    expect(foldAccents('está')).toBe('esta')
    expect(foldAccents('Über')).toBe('Uber')
  })

  it('normalizes by trimming punctuation and lowering case by default', () => {
    expect(normalizeAnswer('  ¡Hola!  ')).toBe('hola')
  })

  it('matches case- and accent-insensitively by default', () => {
    expect(checkAnswer('Esta', 'está')).toBe(true)
    expect(checkAnswer('SÉ', 'sé')).toBe(true)
  })

  it('respects strict options', () => {
    expect(checkAnswer('esta', 'está', { accentSensitive: true })).toBe(false)
    expect(checkAnswer('Hola', 'hola', { caseSensitive: true })).toBe(false)
  })

  it('rejects empty input', () => {
    expect(checkAnswer('', 'word')).toBe(false)
  })
})

describe('multiple choice', () => {
  it('always includes the answer and dedupes distractors', () => {
    const choices = buildChoices('casa', ['perro', 'casa', 'gato'], 42)
    expect(choices).toContain('casa')
    expect(choices.filter((c) => c === 'casa')).toHaveLength(1)
    expect(choices).toHaveLength(3)
  })
})

describe('shuffle', () => {
  it('is deterministic for a given seed and preserves elements', () => {
    const a = shuffle([1, 2, 3, 4, 5], 7)
    const b = shuffle([1, 2, 3, 4, 5], 7)
    expect(a).toEqual(b)
    expect([...a].sort()).toEqual([1, 2, 3, 4, 5])
  })
})
