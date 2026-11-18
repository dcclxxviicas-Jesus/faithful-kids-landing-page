import data from './christian-apps.json'

/*
 * Christian Apps for Kids directory (/christian-apps).
 *
 * Two sources, one shape:
 *  1. lib/christian-apps.json: listings we researched ourselves, every field
 *     read from the live App Store / Google Play page or the maker's site on
 *     `checkedOn`. Rebuild from fresh research, never edit prices from memory.
 *  2. Approved submissions from Supabase (app_directory_submissions with
 *     status 'approved'), fetched at request time with a one-hour cache and a
 *     tag the admin desk revalidates on approve. These are the maker's own
 *     description and are labelled that way on the page.
 *
 * Owner decision (Nov 17, 2026): listings are approved at our discretion. The
 * page says nothing either way about link-back rules. Outbound links to
 * SUBMITTED listings carry rel="ugc"; our own researched listings link plainly.
 */

import { type Listing } from './christian-apps-meta'
export * from './christian-apps-meta'

export const CHECKED_ON: string = data.checkedOn
export const CURATED: Listing[] = data.apps as Listing[]
export const GONE: { name: string; status: string; evidence: string }[] = data.gone

/** The directory is a list, not an ad: Faithful Kids is listed, never first. */
export function sortListings(list: Listing[]): Listing[] {
  return [...list].sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }))
}


export function prettyDate(iso: string | null | undefined): string {
  if (!iso) return 'not shown'
  const d = new Date(iso + 'T12:00:00Z')
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
}

/** An app not updated in two years is worth flagging to a parent. */
export function isStale(iso: string | null): boolean {
  if (!iso) return false
  return Date.now() - new Date(iso).getTime() > 730 * 86400_000
}

export const DIRECTORY_TAG = 'christian-apps'

/*
 * Apps Faithful Kids genuinely competes with: Bible stories, lessons, shows
 * and games for kids. Their pages frame our ad as "an alternative to X".
 * Everything else (adult streaming, prayer apps, parent tools) gets a plain ad,
 * because calling us an alternative to Covenant Eyes would be false.
 */
export const ALTERNATIVE_TO = new Set([
  'bible-app-for-kids', 'superbook-kids-bible', 'minno', 'yippee-tv', 'truplay', 'kids-bible-pray-com',
  'godly-kids', 'bible-kids-bcc-media', 'god-for-kids', 'sunscool', 'i-read-bible-app-for-kids',
  'bible-stories-for-the-young', 'bible-for-kids-bedtime-stories', 'adventures-in-odyssey-club',
  'holy-heroes', 'saintlings', 'catholic-bible-storybook', 'theo', 'windowseat', 'noahs-ark-kids-bible-game',
  'heroes-bible-trivia', 'bible-trivia-quiz-no-ads', 'bible-quiz-dh3', 'keys-for-kids', 'kids-corner-bible-devotions',
  'vom-kids', 'listener-kids', 'jesus-loves-me-listener-kids', 'bible-coloring-book-for-kids', 'formed',
])
export const FK_SLUG = 'faithful-kids'
