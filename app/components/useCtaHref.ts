'use client'

import { useEffect, useState } from 'react'

/* Where a content CTA should send someone.
 *
 * The quiz is a warming device: it works on a reader who landed cold on a
 * story page and does not know who we are. It is wasted on someone who has
 * already answered its eight questions — and until now every blog CTA sent
 * them back through it regardless.
 *
 * Homepage CTAs deliberately do NOT use this. A homepage visitor has just
 * read the pitch and goes straight to checkout; /checkout converts 5.8% of
 * its visitors against the quiz's 1.7%.
 *
 * Returns /quiz until proven otherwise, so the server render and the first
 * client paint agree.
 */
export const QUIZ_DONE_KEY = 'fk_quiz_done'
/** A completion counts for this long; after that they take the quiz again.
    Short on purpose — a stale answer set is worse than no answer set, and
    someone returning a week later is a different visitor than the one who
    finished the quiz. */
const REMEMBER_DAYS = 3

export function useCtaHref(fallback = '/quiz') {
  const [href, setHref] = useState(fallback)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(QUIZ_DONE_KEY)
      if (!raw) return
      const at = parseInt(raw, 10)
      if (!Number.isFinite(at)) return
      if (Date.now() - at < REMEMBER_DAYS * 864e5) setHref('/checkout')
    } catch { /* private mode — keep the quiz */ }
  }, [])
  return href
}

/** Called when someone finishes the quiz. */
export function markQuizDone() {
  try { localStorage.setItem(QUIZ_DONE_KEY, String(Date.now())) } catch { /* ignore */ }
}
