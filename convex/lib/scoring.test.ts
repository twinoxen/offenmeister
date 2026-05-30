import { describe, expect, it } from 'vitest'
import {
  dateKey,
  daysBetween,
  levelForPoints,
  levelProgress,
  pointsForAnswer,
  pointsForLevel,
  updateStreak,
} from './scoring'

describe('pointsForAnswer', () => {
  it('awards more for typing than multiple choice', () => {
    expect(pointsForAnswer('multipleChoice', true)).toBe(1)
    expect(pointsForAnswer('textInput', true)).toBe(2)
  })

  it('awards nothing for wrong answers', () => {
    expect(pointsForAnswer('textInput', false, 20)).toBe(0)
  })

  it('adds a capped streak bonus', () => {
    expect(pointsForAnswer('multipleChoice', true, 5)).toBe(2)
    expect(pointsForAnswer('multipleChoice', true, 100)).toBe(4) // base 1 + capped bonus 3
  })
})

describe('levels', () => {
  it('starts at level 1', () => {
    expect(levelForPoints(0)).toBe(1)
  })

  it('is the inverse of pointsForLevel', () => {
    for (const level of [1, 2, 3, 5, 8]) {
      expect(levelForPoints(pointsForLevel(level))).toBe(level)
    }
  })

  it('reports progress toward the next level', () => {
    const p = levelProgress(pointsForLevel(3))
    expect(p.level).toBe(3)
    expect(p.pointsIntoLevel).toBe(0)
    expect(p.percent).toBe(0)
  })
})

describe('streaks', () => {
  it('starts a streak on first play', () => {
    const s = updateStreak({ dailyStreak: 0, longestStreak: 0, lastPlayedDate: '' }, '2026-05-30')
    expect(s.dailyStreak).toBe(1)
    expect(s.longestStreak).toBe(1)
  })

  it('increments on consecutive days', () => {
    const s = updateStreak(
      { dailyStreak: 4, longestStreak: 4, lastPlayedDate: '2026-05-29' },
      '2026-05-30',
    )
    expect(s.dailyStreak).toBe(5)
    expect(s.longestStreak).toBe(5)
  })

  it('does not change on the same day', () => {
    const prev = { dailyStreak: 4, longestStreak: 9, lastPlayedDate: '2026-05-30' }
    expect(updateStreak(prev, '2026-05-30')).toEqual(prev)
  })

  it('resets after a gap but keeps the longest', () => {
    const s = updateStreak(
      { dailyStreak: 8, longestStreak: 8, lastPlayedDate: '2026-05-20' },
      '2026-05-30',
    )
    expect(s.dailyStreak).toBe(1)
    expect(s.longestStreak).toBe(8)
  })
})

describe('date helpers', () => {
  it('computes whole days between dates', () => {
    expect(daysBetween('2026-05-29', '2026-05-30')).toBe(1)
    expect(daysBetween('2026-05-01', '2026-05-31')).toBe(30)
  })

  it('derives a UTC date key', () => {
    expect(dateKey(Date.parse('2026-05-30T12:34:56Z'))).toBe('2026-05-30')
  })
})
