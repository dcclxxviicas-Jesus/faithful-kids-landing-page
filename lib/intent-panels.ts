/**
 * Intent panels — per-page product blocks for high-intent guide pages.
 *
 * Why these pages (21-day entry analysis, Oct 2026): visitors landing here are
 * searching for Christian screen content or a Christian gift for their kid —
 * the product's exact buyer — yet 0–3% ever started the quiz, against 7–14%
 * on comparable parent-intent pages carrying the same generic CTAs. The fix is
 * the where-to-watch lesson: name the match in the page's own terms.
 *
 * Rendered by app/blog/[slug]/page.tsx in the VerseCta slot (high, after the
 * first section) via PrintableCta; the generic mid-article CTA is suppressed
 * on these slugs so a reader never sees two near-identical sales panels.
 *
 * TRUTH RULE: `body` receives the title of the episode actually playing beside
 * it (topical match from lib/guide-videos.json where one exists, else the
 * deterministic sampler episode). Copy may name that episode; it must never
 * claim a topical match the video resolution doesn't guarantee, and every
 * count must be one check-counts.py verifies (300+ lessons, about two
 * minutes, a quiz after every lesson).
 */

export type IntentPanelCopy = {
  eyebrow: string
  heading: string
  body: (videoTitle: string) => string
}

const panels: Record<string, IntentPanelCopy> = {
  'christian-youtube-channels-for-kids': {
    eyebrow: 'Instead of the algorithm',
    heading: 'What if the whole channel was built for your kid?',
    body: v =>
      `Even the best YouTube channel sits one autoplay away from everything else. Faithful Kids is the walled-garden version: 300+ short Bible lessons in order, a quiz after every one, no ads and no recommendations. Press play on ${v} — a complete lesson, exactly as your child sees it.`,
  },
  'christian-movies-for-kids': {
    eyebrow: 'For the nights between movie nights',
    heading: 'Bible lessons the length of a movie trailer',
    body: v =>
      `A film is an event; a habit is what forms them. Faithful Kids lessons run about two minutes each — short enough for a school night, 300+ of them from Genesis to Revelation, each ending in a quiz. Watch ${v} right here and see the pace for yourself.`,
  },
  'halloween-alternatives-for-christian-families': {
    eyebrow: 'An alternative for the screen, too',
    heading: 'Swap the spooky feed for something good',
    body: v =>
      `The same season that fills the calendar with alternatives fills every app with ghosts. Faithful Kids gives kids a screen they can keep: 300+ Bible story lessons with a quiz after each, no ads, no algorithm. Here’s ${v} — a real lesson from the app, free to watch.`,
  },
  'christian-gifts-for-kids': {
    eyebrow: 'The gift that lasts all year',
    heading: 'Give a year of Bible stories',
    body: v =>
      `Most gifts on this list get loved for a week. A Faithful Kids membership shows up every day: 300+ video lessons covering the whole Bible in order, a quiz after every episode, no ads — a gift grandparents especially love giving. Press play on ${v} to see what they’d be unwrapping.`,
  },
  'kids-christmas-program-ideas': {
    eyebrow: 'After rehearsal',
    heading: 'Let them watch the story they’re performing',
    body: v =>
      `Kids act the Christmas story best when they know it by heart. ${v} is one of 300+ short video lessons in Faithful Kids — about two minutes each, a quiz after every one, the whole Bible in order. Watch it free right here.`,
  },
  'christian-parenting-resources': {
    eyebrow: 'The resource kids ask for',
    heading: 'A Bible habit they’ll actually ask for',
    body: v =>
      `Most resources on this list equip you. This one your kids will ask for by name: 300+ two-minute Bible lessons with a quiz after each, no ads, no algorithm — and a parent dashboard that shows you what stuck. Press play on ${v} for a complete lesson.`,
  },
  'worship-songs-for-kids': {
    eyebrow: 'From singing to knowing',
    heading: 'The stories behind the songs they sing',
    body: v =>
      `Worship sticks deepest when kids know the story they’re singing about. ${v} is one of 300+ short Bible lessons in Faithful Kids — each about two minutes with a quiz at the end, covering the whole Bible in order. Watch it free right here.`,
  },
}

export function getIntentPanel(slug: string): IntentPanelCopy | undefined {
  return panels[slug]
}
