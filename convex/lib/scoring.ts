/**
 * Gamification: points, levels, and daily streaks. Pure and unit-tested.
 */

export type PlayMode = 'multipleChoice' | 'textInput'

/** Base points awarded for a correct answer, by play mode. */
export const BASE_POINTS: Record<PlayMode, number> = {
  multipleChoice: 1,
  textInput: 2,
}

export const DEFAULT_DAILY_GOAL = 30

/**
 * Points for a single answer. Correct answers earn the mode's base points plus
 * a small bonus for in-session answer streaks (capped). Wrong answers earn 0.
 */
export function pointsForAnswer(mode: PlayMode, correct: boolean, answerStreak = 0): number {
  if (!correct) return 0
  const base = BASE_POINTS[mode]
  const bonus = Math.min(Math.floor(answerStreak / 5), 3)
  return base + bonus
}

/**
 * Player level derived from lifetime points. Uses a gentle square-root curve so
 * early levels come quickly and later ones require more play.
 */
export function levelForPoints(points: number): number {
  if (points <= 0) return 1
  return Math.floor(Math.sqrt(points / 50)) + 1
}

/** Total points required to reach a given level (inverse of `levelForPoints`). */
export function pointsForLevel(level: number): number {
  if (level <= 1) return 0
  return (level - 1) * (level - 1) * 50
}

export interface LevelProgress {
  level: number
  pointsIntoLevel: number
  pointsForNextLevel: number
  percent: number
}

/** Progress toward the next level, for a progress bar. */
export function levelProgress(points: number): LevelProgress {
  const level = levelForPoints(points)
  const floor = pointsForLevel(level)
  const ceil = pointsForLevel(level + 1)
  const span = ceil - floor
  const into = points - floor
  return {
    level,
    pointsIntoLevel: into,
    pointsForNextLevel: ceil - points,
    percent: span > 0 ? Math.round((into / span) * 100) : 0,
  }
}

/** Number of whole days between two YYYY-MM-DD date strings (b - a). */
export function daysBetween(a: string, b: string): number {
  const da = Date.parse(`${a}T00:00:00Z`)
  const db = Date.parse(`${b}T00:00:00Z`)
  return Math.round((db - da) / 86_400_000)
}

export interface StreakState {
  dailyStreak: number
  longestStreak: number
  lastPlayedDate: string
}

/**
 * Update the daily streak when the learner plays on `today` (YYYY-MM-DD).
 * - Same day: unchanged.
 * - Consecutive day: +1.
 * - Gap (or first ever): reset to 1.
 */
export function updateStreak(prev: StreakState, today: string): StreakState {
  if (!prev.lastPlayedDate) {
    return { dailyStreak: 1, longestStreak: Math.max(1, prev.longestStreak), lastPlayedDate: today }
  }
  const gap = daysBetween(prev.lastPlayedDate, today)
  if (gap <= 0) return prev // already played today (or clock skew)
  const dailyStreak = gap === 1 ? prev.dailyStreak + 1 : 1
  return {
    dailyStreak,
    longestStreak: Math.max(prev.longestStreak, dailyStreak),
    lastPlayedDate: today,
  }
}

/** Format a timestamp as a UTC YYYY-MM-DD date key. */
export function dateKey(timestamp: number): string {
  return new Date(timestamp).toISOString().slice(0, 10)
}
