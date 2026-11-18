/**
 * Seasonal hubs.
 *
 * Why these exist: seasonal demand in this niche is enormous and almost
 * entirely concentrated in one month. Measured with DataForSEO on 2026-09-11
 * (US, clickstream + ads, peak month from the 12-month curve):
 *
 *   thanksgiving bible verses        18,100 avg -> 165,000 in November
 *   christmas word search            14,800 avg -> 165,000 in December
 *   thanksgiving word search         12,100 avg -> 135,000 in November
 *   bible verses about thankfulness  22,200 avg -> 110,000 in November
 *   easter word search                3,600 avg ->  40,500 in April
 *   new year bible verses             2,400 avg ->  33,100 in December
 *
 * The posts to serve that demand mostly already exist — 28 Christmas/Advent
 * posts, 12 Easter, 6 Thanksgiving — but they were scattered with no page
 * gathering them, so nothing pointed at them and nothing ranked. These hubs
 * are an internal-linking instrument first and a landing page second.
 *
 * IMPORTANT — the rule this does NOT break. CLAUDE.md says not to chase
 * generic holiday demand ("Thanksgiving 33,100/mo ... that demand is turkeys
 * and hearts"). That finding came from scanning *coloring* terms and it is
 * still correct for those. The faith-specific demand is in *Bible verses*,
 * which that scan never covered: "bible verses about thankfulness" alone
 * peaks at 110,000. Every hub below is anchored on scripture content we
 * already publish. Do not add a hub for a holiday where our only angle would
 * be turkeys, hearts or shamrocks.
 *
 * Only build a hub where real posts exist. An empty or near-empty hub is the
 * thin-content trap, and this site has 267 pages already drawing impressions
 * with zero clicks — it does not need more pages, it needs better-connected
 * ones. MIN_POSTS enforces that.
 */

export const MIN_POSTS = 3

export interface Holiday {
  slug: string
  name: string
  /** SERP title. Keep under 60 characters — see app/blog/[slug]/page.tsx. */
  title: string
  metaDescription: string
  /** Peak search month, shown to readers and used for ordering. */
  peak: string
  peakMonth: number
  intro: string
  /** Post whose hero image represents this season on the /holidays index.
   *  Must be a real post with a hero on the CDN -- a 404 here renders a
   *  broken image on the hub. Check:
   *  d3g07v1w0lehiv.cloudfront.net/blog-images/<heroSlug>-hero.webp?v=3 */
  heroSlug: string
  /** Slug patterns for posts that belong to this season. */
  match: RegExp
  /** Existing printables worth featuring. Only list routes that exist. */
  printables: { href: string; label: string }[]
}

export const HOLIDAYS: Holiday[] = [
  {
    slug: 'christmas',
    name: 'Christmas',
    title: 'Christmas Bible Activities for Kids',
    metaDescription:
      'Free Christmas Bible resources for kids: the nativity story, Advent devotions, Christmas trivia, printable nativity coloring pages and a Christmas word search.',
    peak: 'December',
    peakMonth: 12,
    intro:
      'Everything we have for the Christmas season in one place: the nativity story retold for children, Advent devotions and calendars, Christmas trivia, and free printables you can hand a child in about ten seconds. All of it is free.',
    heroSlug: 'the-christmas-story-for-kids',
    match: /christmas|advent|nativity|bethlehem|wise-men|manger/,
    printables: [
      { href: '/printables/christmas-coloring-pages', label: 'Nativity coloring pages' },
      { href: '/printables/bible-word-search/christmas', label: 'Christmas word search' },
    ],
  },
  {
    slug: 'thanksgiving',
    name: 'Thanksgiving',
    title: 'Thanksgiving Bible Verses & Activities for Kids',
    metaDescription:
      'Free Thanksgiving Bible resources for kids: verses about thankfulness, Bible stories about gratitude, Thanksgiving trivia, prayers and family devotions.',
    peak: 'November',
    peakMonth: 11,
    intro:
      'Thanksgiving is the easiest holiday of the year to point back at scripture, because gratitude is already the whole subject. These are the Bible verses, stories, prayers and trivia we use for it, written for children, free, and short enough to actually get through at a table full of relatives.',
    heroSlug: 'thanksgiving-bible-stories-for-kids',
    match: /thanksgiving|thankful|gratitude|grateful/,
    printables: [
      { href: '/printables/bible-word-search/thanksgiving', label: 'Thanksgiving word search (Psalm 100 vocabulary)' },
    ],
  },
  {
    slug: 'easter',
    name: 'Easter',
    title: 'Easter Bible Activities for Kids',
    metaDescription:
      'Free Easter Bible resources for kids: the Easter story, Holy Week and Palm Sunday, Easter trivia, resurrection coloring pages and an Easter word search.',
    peak: 'April',
    peakMonth: 4,
    intro:
      'The Easter story told for children, plus Holy Week explained day by day, Easter trivia, Sunday school lessons and free printables. Easter is the hardest part of the Bible to explain to a young child, so these lean on plain language rather than softening what happened.',
    heroSlug: 'easter-story-in-the-bible',
    match: /easter|resurrection|palm-sunday|good-friday|lent|empty-tomb|last-supper|gethsemane/,
    printables: [
      { href: '/printables/easter-coloring-pages', label: 'Easter coloring pages' },
      { href: '/printables/bible-word-search/easter', label: 'Easter word search' },
    ],
  },
  {
    slug: 'back-to-school',
    name: 'Back to School',
    title: 'Back to School Bible Verses for Kids',
    metaDescription:
      'Bible verses and prayers for the first day of school, plus stories about courage and worry for kids starting a new year, and morning prayers for school days.',
    peak: 'August',
    peakMonth: 8,
    intro:
      'The start of a school year is when children are most likely to say out loud that they are frightened. These are the verses, prayers and stories we point parents at for it, for first days, new schools, and the ordinary dread of a Monday morning.',
    heroSlug: 'back-to-school-bible-stories-for-kids',
    match: /back-to-school|first-day-of-school|morning-prayers|about-courage|for-anxious-kids/,
    printables: [],
  },
  {
    slug: 'halloween',
    name: 'Halloween & Fall',
    title: 'Christian Halloween Alternatives for Families',
    metaDescription:
      'Christian alternatives to Halloween for families, plus Bible verses and stories about fear for kids who find the season frightening rather than fun.',
    peak: 'October',
    peakMonth: 10,
    intro:
      'Families land in very different places on Halloween, and this page does not argue for one of them. It gathers what we have: alternatives for families who skip it, and verses and stories about fear for any child who finds late October more frightening than fun.',
    heroSlug: 'halloween-alternatives-for-christian-families',
    match: /halloween|all-saints|about-fear|fear-and-anxiety/,
    printables: [],
  },
]

export function getHoliday(slug: string): Holiday | undefined {
  return HOLIDAYS.find(h => h.slug === slug)
}

/** Months away from `now`, wrapping the year — used to surface what is next. */
export function monthsUntil(peakMonth: number, now = new Date()): number {
  const diff = peakMonth - (now.getMonth() + 1)
  return diff < 0 ? diff + 12 : diff
}

/* ---------- Day-accurate "what is coming next" (Nov 17, 2026) ----------
   monthsUntil() only knows the month, so the whole of November ranked
   Thanksgiving first even after Thanksgiving had passed. These work to the
   day, in New York time, and a season stays "next" through its own day.
   /holidays and /holidays/<slug> revalidate a few times a day (see their
   `revalidate` exports), so the order changes on its own without a deploy. */

/** Western Easter Sunday (anonymous Gregorian algorithm). */
function easter(y: number): [number, number] {
  const a = y % 19, b = Math.floor(y / 100), c = y % 100
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  return [month, ((h + l - 7 * m + 114) % 31) + 1]
}

/** The season's own day in a given year, as [month 1-12, day]. */
function keyDay(slug: string, y: number, peakMonth: number): [number, number] {
  switch (slug) {
    case 'christmas': return [12, 25]
    case 'easter': return easter(y)
    case 'halloween': return [10, 31]
    // Most US schools start in the second half of August.
    case 'back-to-school': return [8, 20]
    case 'thanksgiving': {
      // Fourth Thursday of November.
      const firstDow = new Date(Date.UTC(y, 10, 1)).getUTCDay()
      return [11, 1 + ((4 - firstDow + 7) % 7) + 21]
    }
    default: return [peakMonth, 15]
  }
}

/** Today's calendar date in New York, as a UTC midnight timestamp. */
function todayNY(now: Date): number {
  const p = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', year: 'numeric', month: 'numeric', day: 'numeric' })
    .formatToParts(now)
  const n = (t: string) => Number(p.find(x => x.type === t)!.value)
  return Date.UTC(n('year'), n('month') - 1, n('day'))
}

/** Days until the season's next day (0 on the day itself). */
export function daysUntil(h: Holiday, now = new Date()): number {
  const today = todayNY(now)
  const y = new Date(today).getUTCFullYear()
  for (const year of [y, y + 1]) {
    const [m, d] = keyDay(h.slug, year, h.peakMonth)
    const t = Date.UTC(year, m - 1, d)
    if (t >= today) return Math.round((t - today) / 86400000)
  }
  return 365
}

/** Seasons ordered by which one comes next. */
export function byNext<T extends Holiday>(list: T[], now = new Date()): T[] {
  return [...list].sort((a, b) => daysUntil(a, now) - daysUntil(b, now))
}
