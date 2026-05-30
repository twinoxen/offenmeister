/**
 * Spaced-repetition scheduling.
 *
 * A simplified Leitner/SM-2 ladder: each sentence has an integer `srsLevel`
 * (0..MAX_LEVEL). Answering correctly promotes it up the ladder with an
 * increasing review interval; answering incorrectly demotes it for quicker
 * re-review. Pure and unit-tested — no Convex runtime required.
 */

export type ReviewStatus = 'new' | 'learning' | 'mastered'

export const MINUTE = 60 * 1000
export const HOUR = 60 * MINUTE
export const DAY = 24 * HOUR

/** Review interval (ms) the card waits at each level before it is due again. */
export const INTERVALS = [
  10 * MINUTE, // level 0 (just seen / relearning)
  1 * DAY, // level 1
  3 * DAY, // level 2
  7 * DAY, // level 3
  30 * DAY, // level 4
  180 * DAY, // level 5 (mastered)
] as const

export const MAX_LEVEL = INTERVALS.length - 1

/** Human-friendly mastery tiers shown in the UI (level -> label + percent). */
export const MASTERY_TIERS = [
  { level: 0, label: 'New', percent: 0 },
  { level: 1, label: 'Learning', percent: 25 },
  { level: 2, label: 'Familiar', percent: 50 },
  { level: 3, label: 'Confident', percent: 75 },
  { level: 4, label: 'Advanced', percent: 90 },
  { level: 5, label: 'Mastered', percent: 100 },
] as const

export function masteryPercent(level: number): number {
  const tier = MASTERY_TIERS[clamp(level, 0, MAX_LEVEL)]
  return tier ? tier.percent : 0
}

export function masteryLabel(level: number): string {
  const tier = MASTERY_TIERS[clamp(level, 0, MAX_LEVEL)]
  return tier ? tier.label : 'New'
}

export interface SrsState {
  srsLevel: number
  status: ReviewStatus
  nextReviewAt: number
  lastReviewedAt: number
  timesSeen: number
  timesCorrect: number
  timesWrong: number
}

/** The state for a sentence the learner has never answered. */
export function initialState(now: number): SrsState {
  return {
    srsLevel: 0,
    status: 'new',
    nextReviewAt: now,
    lastReviewedAt: 0,
    timesSeen: 0,
    timesCorrect: 0,
    timesWrong: 0,
  }
}

/**
 * Compute the next SRS state after the learner answers a card.
 *
 * - Correct: promote one level (capped at MAX_LEVEL) and schedule the next
 *   review using that level's interval. Reaching MAX_LEVEL marks it mastered.
 * - Incorrect: demote one level (floored at 0) and re-show it soon.
 */
export function review(prev: SrsState, correct: boolean, now: number): SrsState {
  const nextLevel = correct
    ? clamp(prev.srsLevel + 1, 0, MAX_LEVEL)
    : clamp(prev.srsLevel - 1, 0, MAX_LEVEL)

  const interval = correct ? INTERVALS[nextLevel]! : INTERVALS[0]!
  const status: ReviewStatus = nextLevel >= MAX_LEVEL ? 'mastered' : 'learning'

  return {
    srsLevel: nextLevel,
    status,
    nextReviewAt: now + interval,
    lastReviewedAt: now,
    timesSeen: prev.timesSeen + 1,
    timesCorrect: prev.timesCorrect + (correct ? 1 : 0),
    timesWrong: prev.timesWrong + (correct ? 0 : 1),
  }
}

/** Whether a card is due for review at `now`. */
export function isDue(state: Pick<SrsState, 'nextReviewAt'>, now: number): boolean {
  return state.nextReviewAt <= now
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}
