import { createHash } from 'crypto'
import distractors from './trivia-distractors.json'
import type { TriviaQuestion } from './blog'

/**
 * Attach multiple-choice distractors to extracted trivia questions.
 *
 * Resolved on the SERVER and passed down, never imported by the game
 * component: the full distractor file is ~228KB and would otherwise ship to
 * every blog page in the bundle. A post only needs its own questions.
 *
 * Keyed by a hash of the question text rather than by slug + index, so
 * re-extraction, reordering, or the same question appearing in several posts
 * all resolve to the same entry. 228 questions are shared across posts and
 * are generated once.
 *
 * Questions with no entry keep `wrong` undefined and the game drops them from
 * the round rather than rendering a broken option list. Every post still
 * clears ten playable questions at 94% coverage — verified before this
 * shipped, and worth re-checking if the markdown changes.
 */
export type TriviaChoiceQuestion = TriviaQuestion & { wrong?: string[] }

const BANK = distractors as Record<string, string[]>

export function questionKey(q: string): string {
  return createHash('sha1').update(q.trim().toLowerCase().replace(/\s+/g, ' ')).digest('hex').slice(0, 16)
}

export function attachChoices(questions: TriviaQuestion[]): TriviaChoiceQuestion[] {
  return questions.map(q => {
    const wrong = BANK[questionKey(q.question)]
    return wrong && wrong.length === 3 ? { ...q, wrong } : q
  })
}

/** How many of these questions can actually be played as multiple choice. */
export function playableCount(questions: TriviaQuestion[]): number {
  return questions.filter(q => BANK[questionKey(q.question)]?.length === 3).length
}
