/**
 * Shared guards for the full-screen exit takeover.
 *
 * Two surfaces render <ExitTakeover/>: the homepage (app/page.tsx) and blog
 * posts (app/blog/BlogExitIntent.tsx). They share these keys ON PURPOSE —
 * one takeover per person per day across the whole site. Someone who lands on
 * a post from search and later opens the homepage should not be shown the
 * same full screen twice in a day.
 *
 * Every read and write is wrapped. In a private window, or with site data
 * blocked, these throw rather than returning null, and the page still has to
 * render correctly — so a failure here must only ever mean "show it", never
 * a crash.
 */

export const EXIT_SHOWN_KEY = 'fk_exit_shown_at'
export const EXIT_SESSION_KEY = 'fk_exit_session'
export const QUIZ_CLICK_KEY = 'fk_quiz_cta_clicked'
export const TRIVIA_KEY = 'fk_trivia_started'
export const SUPPRESS_DAYS = 1

export function safeGet(store: Storage, key: string): string | null {
  try { return store.getItem(key) } catch { return null }
}

export function safeSet(store: Storage, key: string, val: string) {
  try { store.setItem(key, val) } catch { /* private mode */ }
}

/**
 * True when the takeover must not be shown: already shown this session or
 * within SUPPRESS_DAYS, or the visitor has already engaged with the quiz or
 * the trivia game (in which case they are not a cold leaver).
 */
export function takeoverSuppressed(): boolean {
  if (safeGet(sessionStorage, EXIT_SESSION_KEY)) return true
  if (safeGet(sessionStorage, TRIVIA_KEY)) return true
  if (safeGet(sessionStorage, QUIZ_CLICK_KEY)) return true
  const last = Number(safeGet(localStorage, EXIT_SHOWN_KEY) || 0)
  if (last && Date.now() - last < SUPPRESS_DAYS * 86_400_000) return true
  return false
}

export function markTakeoverShown() {
  safeSet(sessionStorage, EXIT_SESSION_KEY, '1')
  safeSet(localStorage, EXIT_SHOWN_KEY, String(Date.now()))
}
