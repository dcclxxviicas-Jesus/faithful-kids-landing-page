/**
 * Pointer continuity into the quiz.
 *
 * Someone presses "Get started" on the homepage and the next thing they have
 * to press is "Begin" on the quiz welcome screen. Measured before this
 * existed, Begin landed **203-387px below** where their cursor already was —
 * worst on phones (358px on a 430px-wide screen, more than a third of the
 * display, thumb travel on the single most important click in the funnel).
 *
 * So the entry screen moves to the pointer rather than making the pointer
 * move to it.
 *
 * Recorded for EVERY anchor/button click rather than wired into each CTA
 * one at a time: the quiz is entered from the homepage, /homeschool, blog
 * sticky bars, printable pages and the exit popup, and a per-CTA list would
 * silently rot as CTAs are added. The freshness window makes that safe — a
 * click that did not navigate here is overwritten by the next one, and
 * anything older than FRESH_MS is ignored, so a stale value can never
 * misplace the button.
 */
const KEY = 'fk_cta_y'
const FRESH_MS = 5000

/* Which PROMISE the CTA made, captured in the same capture-phase listener.
 *
 * 311 CTAs across the site say "Start your free trial" — but only the annual
 * plan has a trial (7 days, web). Someone who clicked a free-trial CTA and
 * then lands on a plan screen pre-selected to monthly ($12.99, no trial) has
 * been quietly contradicted at the moment of decision. This flag lets the
 * result screen pre-select the plan that keeps the promise, while everyone
 * else keeps the monthly-first default (owner's Sep 8 call from the numbers).
 *
 * Longer freshness than the pointer anchor on purpose: the pointer matters
 * for the very next paint, but the promise holds across the whole quiz
 * (~2-4 minutes of answering between the click and the plan screen). */
const TRIAL_KEY = 'fk_cta_trial'
const TRIAL_FRESH_MS = 30 * 60 * 1000
const TRIAL_RE = /free\s+(trial|week|days?)/i

export function startCtaTracking() {
  if (typeof document === 'undefined') return
  const w = window as unknown as { __fkCtaTracking?: boolean }
  if (w.__fkCtaTracking) return
  w.__fkCtaTracking = true

  document.addEventListener(
    'click',
    e => {
      const t = e.target
      if (!(t instanceof Element)) return
      if (!t.closest('a[href], button')) return
      // clientY is viewport-relative, which is exactly the frame the next
      // page paints in. A keyboard-activated click reports 0 — skip it,
      // there is no pointer to match.
      const el = t.closest('a[href], button') as Element
      try {
        if (TRIAL_RE.test(el.textContent || '')) {
          sessionStorage.setItem(TRIAL_KEY, JSON.stringify({ t: Date.now() }))
        }
      } catch { /* private mode */ }
      const y = (e as MouseEvent).clientY
      if (!y) return
      try {
        sessionStorage.setItem(KEY, JSON.stringify({ y, t: Date.now() }))
      } catch {
        // private mode — the screen just uses its normal centred layout
      }
    },
    true,
  )
}

/** True if the click that brought them here promised a free trial. */
export function arrivedViaTrialCta(): boolean {
  try {
    const raw = sessionStorage.getItem(TRIAL_KEY)
    if (!raw) return false
    const { t } = JSON.parse(raw)
    return typeof t === 'number' && Date.now() - t < TRIAL_FRESH_MS
  } catch {
    return false
  }
}

/** Viewport y of the click that brought them here, or null. */
export function recentCtaY(): number | null {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return null
    const { y, t } = JSON.parse(raw)
    if (typeof y !== 'number' || typeof t !== 'number') return null
    return Date.now() - t < FRESH_MS ? y : null
  } catch {
    return null
  }
}
