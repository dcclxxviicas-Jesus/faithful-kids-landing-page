/**
 * Email-capture state shared across the site.
 *
 * fk_capture_submitted (localStorage) is set by EmailCaptureCard on ANY
 * successful submit, anywhere on the site. The printable gate
 * (app/printables/PrintableGate.tsx) lets a visitor straight through once it
 * is set, so nobody is asked twice.
 *
 * Every read and write is wrapped: in a private window or with site data
 * blocked these throw. A visitor whose browser cannot store the flag is simply
 * asked again next visit; nothing breaks.
 */

const SUBMITTED_KEY = 'fk_capture_submitted'

export function markCaptureSubmitted() {
  try { localStorage.setItem(SUBMITTED_KEY, String(Date.now())) } catch { /* private mode */ }
}

export function hasSubmittedCapture(): boolean {
  try { return !!localStorage.getItem(SUBMITTED_KEY) } catch { return false }
}

export type Magnet = 'challenge' | 'trivia-pack' | 'bedtime-kit' | 'coloring-pages' | 'quiz-plan' | 'advent'

/** Same rule as the blog's DEFAULT_MAGNET (app/blog/[slug]/page.tsx, from
    7180bc2): Advent readings in November and December, the Bedtime Kit
    otherwise. Evaluated at runtime here, since this runs in the browser. */
export function seasonalDefaultMagnet(now = new Date()): Magnet {
  return [10, 11].includes(now.getMonth()) ? 'advent' : 'bedtime-kit'
}

/** Which drip magnet a printable page's gate signs the visitor up for. */
export function magnetForPrintablePath(path: string): Magnet {
  const p = path.replace(/^\/printables\/?/, '')
  if (/^(bible|christmas|easter)-coloring-pages/.test(p)) return 'coloring-pages'
  // Not on the trivia pack's own page: offering the PDF they just unlocked is pointless.
  if (/^(bible-word-search|bible-crossword)/.test(p)) return 'trivia-pack'
  if (/^(jesse-tree|advent-)/.test(p)) return 'advent'
  return seasonalDefaultMagnet()
}
