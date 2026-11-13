/**
 * Shared state for email captures, so the surfaces that ask for an email do
 * not ask the same person twice.
 *
 *  - fk_capture_submitted (localStorage): set by EmailCaptureCard on ANY
 *    successful submit, anywhere on the site. Once set, the printable
 *    post-action ask never shows again.
 *  - fk_postaction_shown_at (localStorage): the post-action ask shows at most
 *    once a day.
 *  - fk_capture_seen (sessionStorage): an inline capture card was on screen
 *    this visit, so the post-action ask stays away (no double-asking).
 *  - fk_postaction_session (sessionStorage): the post-action ask showed this
 *    visit, so inline printable cards step aside.
 *
 * Every read and write is wrapped: in a private window or with site data
 * blocked these throw, and a failure must never break the page or the
 * download it sits beside.
 */

const SUBMITTED_KEY = 'fk_capture_submitted'
const POSTACTION_SHOWN_KEY = 'fk_postaction_shown_at'
const SEEN_KEY = 'fk_capture_seen'
const POSTACTION_SESSION_KEY = 'fk_postaction_session'
const DAY_MS = 86_400_000

function get(kind: 'local' | 'session', key: string): string | null {
  try { return (kind === 'local' ? localStorage : sessionStorage).getItem(key) } catch { return null }
}
function set(kind: 'local' | 'session', key: string, val: string) {
  try { (kind === 'local' ? localStorage : sessionStorage).setItem(key, val) } catch { /* private mode */ }
}

export function markCaptureSubmitted() { set('local', SUBMITTED_KEY, String(Date.now())) }
export function markCaptureSeen() { set('session', SEEN_KEY, '1') }
export function postActionShownThisVisit(): boolean { return !!get('session', POSTACTION_SESSION_KEY) }

export function postActionSuppressed(): boolean {
  if (get('local', SUBMITTED_KEY)) return true
  if (get('session', SEEN_KEY)) return true
  if (get('session', POSTACTION_SESSION_KEY)) return true
  const last = Number(get('local', POSTACTION_SHOWN_KEY) || 0)
  return !!last && Date.now() - last < DAY_MS
}

export function markPostActionShown() {
  set('session', POSTACTION_SESSION_KEY, '1')
  set('local', POSTACTION_SHOWN_KEY, String(Date.now()))
}

export type Magnet = 'challenge' | 'trivia-pack' | 'bedtime-kit' | 'coloring-pages' | 'quiz-plan' | 'advent'

/** Same rule as the blog's DEFAULT_MAGNET (app/blog/[slug]/page.tsx, from
    7180bc2): Advent readings in November and December, the Bedtime Kit
    otherwise. Evaluated at runtime here, since this runs in the browser. */
export function seasonalDefaultMagnet(now = new Date()): Magnet {
  return [10, 11].includes(now.getMonth()) ? 'advent' : 'bedtime-kit'
}

/** Which magnet a printable page offers after a download or print. */
export function magnetForPrintablePath(path: string): Magnet {
  const p = path.replace(/^\/printables\/?/, '')
  if (/^(bible|christmas|easter)-coloring-pages/.test(p)) return 'coloring-pages'
  if (/^(bible-trivia-pack|bible-word-search|bible-crossword)/.test(p)) return 'trivia-pack'
  if (/^(jesse-tree|advent-)/.test(p)) return 'advent'
  return seasonalDefaultMagnet()
}
