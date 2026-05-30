import { describe, expect, it } from 'vitest'
import {
  DAY,
  INTERVALS,
  MAX_LEVEL,
  initialState,
  isDue,
  masteryLabel,
  masteryPercent,
  review,
} from './srs'

const NOW = 1_700_000_000_000

describe('initialState', () => {
  it('starts new and immediately due', () => {
    const s = initialState(NOW)
    expect(s.srsLevel).toBe(0)
    expect(s.status).toBe('new')
    expect(isDue(s, NOW)).toBe(true)
  })
})

describe('review', () => {
  it('promotes a level and schedules by interval on a correct answer', () => {
    const s = review(initialState(NOW), true, NOW)
    expect(s.srsLevel).toBe(1)
    expect(s.status).toBe('learning')
    expect(s.nextReviewAt).toBe(NOW + INTERVALS[1])
    expect(s.timesCorrect).toBe(1)
    expect(s.timesSeen).toBe(1)
  })

  it('demotes and re-shows soon on a wrong answer', () => {
    let s = initialState(NOW)
    s = review(s, true, NOW) // level 1
    s = review(s, true, NOW) // level 2
    const wrong = review(s, false, NOW)
    expect(wrong.srsLevel).toBe(1)
    expect(wrong.nextReviewAt).toBe(NOW + INTERVALS[0])
    expect(wrong.timesWrong).toBe(1)
  })

  it('marks mastered after enough correct answers and caps the level', () => {
    let s = initialState(NOW)
    for (let i = 0; i < MAX_LEVEL + 3; i++) s = review(s, true, NOW)
    expect(s.srsLevel).toBe(MAX_LEVEL)
    expect(s.status).toBe('mastered')
    expect(s.nextReviewAt).toBe(NOW + INTERVALS[MAX_LEVEL])
  })

  it('never goes below level 0', () => {
    const s = review(initialState(NOW), false, NOW)
    expect(s.srsLevel).toBe(0)
  })
})

describe('mastery display', () => {
  it('maps levels to percent and label', () => {
    expect(masteryPercent(0)).toBe(0)
    expect(masteryPercent(MAX_LEVEL)).toBe(100)
    expect(masteryLabel(MAX_LEVEL)).toBe('Mastered')
  })
})

describe('isDue', () => {
  it('is not due before nextReviewAt', () => {
    const s = review(initialState(NOW), true, NOW)
    expect(isDue(s, NOW + DAY / 2)).toBe(false)
    expect(isDue(s, NOW + DAY)).toBe(true)
  })
})
