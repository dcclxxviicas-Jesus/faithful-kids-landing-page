/**
 * Our own browsing, excluded from every number.
 *
 * There are two layers here on purpose, because the first one alone has
 * already failed once.
 *
 * 1. A PostHog super-property (`internal: true`) set on the browser. It is the
 *    right mechanism — it follows the person across IPs, which matters on
 *    mobile — but it lives in browser storage, so a cleared cache, a second
 *    profile, a private window or a new device all silently drop it. It also
 *    only starts working the day it is set: it cannot retag the past.
 *
 * 2. This list of distinct_ids, applied server-side at query time. It is
 *    retroactive and cannot be cleared. That is what makes it worth the
 *    maintenance: the flag shipped 2026-08-26 and, as of 2026-09-04, had
 *    tagged exactly zero of the 3,207 events from the two browsers that have
 *    opened /cas-admin. Every one of those events was being counted as a
 *    stranger's.
 *
 * Why it matters beyond tidiness: one of these browsers clicked the Mark 10:14
 * verse CTA eight times. That single person made the worst-performing verse of
 * the three look like the winner (3.6% vs its real 0.8%), and a copy decision
 * was very nearly made on it.
 *
 * To add a browser: open https://faithfulkids.app/?internal=1 on it once —
 * that sets the flag from then on. Add its id here too if you want its history
 * removed as well; find it in PostHog under the person's properties.
 */
export const INTERNAL_DISTINCT_IDS = [
  '019fe96e-1fbf-7f9c-ba23-8c2dd643990e', // primary browser — 2,747 events from 2026-08-10
  '01a00afa-e9cf-7514-8288-840c88a3f6cd', // second browser/device — 460 events
]

/** SQL fragment excluding the ids above. Safe to interpolate: ids are UUIDs. */
export const NOT_INTERNAL_IDS =
  INTERNAL_DISTINCT_IDS.length === 0
    ? '1 = 1'
    : `distinct_id NOT IN (${INTERNAL_DISTINCT_IDS.map(id => `'${id.replace(/'/g, '')}'`).join(', ')})`
