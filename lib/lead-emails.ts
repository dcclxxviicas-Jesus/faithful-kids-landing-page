import { SITE_URL, unsubscribeUrl, type Lead } from './leads'
import { buildEmail as build, type BuiltEmail } from './email-system'
import { escapeHtml, type Block } from './email-system/render'

// The nurture sequences for captured leads. Copy and design live in
// lib/email-system (the "Home" design); this file decides WHICH email a lead
// gets at each stage and fills in what is specific to them.
// Stage N = the Nth email. Timing between stages lives in the schedules.

export const DRIP_SCHEDULE: Record<number, number> = {
  // stage just sent -> days until next stage
  1: 2, // delivery -> day 2
  2: 2, // day 2 -> day 4
  3: 2, // day 4 -> day 6
  4: 3, // day 6 -> day 9
}

/* The quiz-plan recovery sequence is on its own, shorter clock: these people
   already saw the product and a price, so they are warm abandoners rather
   than cold printable-downloaders. Four emails: the saved plan, a free story
   the next day, the four common questions, and a last note. */
const QUIZ_PLAN_SCHEDULE: Record<number, number> = {
  1: 1, // plan delivered -> day 1
  2: 2, // day 1 -> day 3
  3: 3, // day 3 -> day 6 (final)
}
const QUIZ_PLAN_STAGES = 4

/** Days until the next stage for this lead's sequence, or undefined = done. */
export function nextDripDays(magnet: string, stage: number): number | undefined {
  return magnet === 'quiz-plan' ? QUIZ_PLAN_SCHEDULE[stage] : DRIP_SCHEDULE[stage]
}

/* The lead's quiz answers packed as base64url for ?rp=, which /quiz decodes
   straight to the reveal. The child's NAME is never stored or mailed: it
   stays in the quiz-taker's browser. No server lookup, nothing sensitive. */
function planPayload(lead: Lead): string {
  const { child_name: _cn, ...safe } = lead.quiz_answers || {}
  return Buffer.from(JSON.stringify({ a: safe, p: 'parent' })).toString('base64url')
}

interface Magnet {
  short: string
  url: string
  img: string | null
  subject: string
  pre: string
  headline: string
  line: string
  tip: string
}

const MAGNETS: Record<string, Magnet> = {
  advent: {
    short: 'Advent Readings',
    url: `${SITE_URL}/printables/advent-readings`,
    img: 'page--advent-readings',
    subject: 'Here it is: your Advent Readings',
    pre: 'Print it tonight. One short reading for each night of December.',
    headline: 'Here are your Advent Readings',
    line: '25 short readings, one for each night of December. Night by night, your child follows the story from God’s first promise in Genesis to the manger in Bethlehem.',
    tip: 'Print it and leave it where you eat dinner. Each reading takes about five minutes. If you miss a night, just pick up where you left off.',
  },
  'bedtime-kit': {
    short: 'Bedtime Bible Kit',
    url: `${SITE_URL}/printables/bedtime-bible-kit`,
    img: 'page--bedtime-bible-kit',
    subject: 'Your Bedtime Bible Kit is here',
    pre: 'Seven nights, each with a story, a prayer and one question.',
    headline: 'Here is your Bedtime Bible Kit',
    line: 'Seven nights of short Bible stories. Each night has a story, a simple prayer and one question to talk about together.',
    tip: 'Print it and keep it by the bed. Paper works better than a glowing screen at bedtime, and each night takes about five minutes.',
  },
  'trivia-pack': {
    short: 'Bible Trivia Pack',
    url: `${SITE_URL}/printables/bible-trivia-pack`,
    img: 'page--bible-trivia-pack',
    subject: 'Your Bible Trivia Pack is here',
    pre: '100 Bible questions, with the answers in the back.',
    headline: 'Here is your Bible Trivia Pack',
    line: '100 Bible questions for game night, car rides and Sunday school, with the answers in the back.',
    tip: 'Print it, or keep it on your phone for the car. Start with five questions at dinner tonight.',
  },
  'coloring-pages': {
    short: 'Bible Coloring Pack',
    url: 'https://faithfulkids.app/printables/bible-coloring-pages.pdf',
    img: 'file--coloring-pages--faithful-kids-bible-coloring-pages',
    subject: 'Your coloring pages are here',
    pre: 'All 26 pages in one PDF, ready to print.',
    headline: 'Here are your Bible coloring pages',
    line: 'All 26 pages in one PDF, from Creation to the Empty Tomb, ready to print.',
    tip: 'Print a few at a time. While your child colors, ask them to tell you the story on the page.',
  },
  challenge: {
    short: '30-Day Challenge',
    url: `${SITE_URL}/printables/30-day-challenge`,
    img: null,
    subject: 'Your 30-Day Challenge is here',
    pre: 'One Bible story a night for 30 nights.',
    headline: 'Here is your 30-Day Family Bible Challenge',
    line: 'One Bible story a night for 30 nights: read it together, talk about it, and check it off.',
    tip: 'Print it and put it on the fridge. If you miss a night, just pick up where you left off.',
  },
}

/* The second email gives a printable the lead does not already have: the
   Bedtime Bible Kit for everyone except the people who asked for that one,
   who get the Trivia Pack. */
const giftFor = (magnet: string) => (magnet === 'bedtime-kit' ? MAGNETS['trivia-pack'] : MAGNETS['bedtime-kit'])

const HEROES: Record<string, string> = {
  david: 'David', moses: 'Moses', noah: 'Noah', daniel: 'Daniel', esther: 'Esther', jesus: 'Jesus', joseph: 'Joseph', ruth: 'Ruth',
}

// Only what the lead actually chose, and never anything that claims a
// per-denomination path (that feature does not exist).
function quizRecap(lead: Lead): Block | null {
  const a = lead.quiz_answers || {}
  const lines: string[] = []
  if (a.age) lines.push(`Age range selected: ${escapeHtml(String(a.age).replace('-', ' to '))}`)
  if (a.hero && HEROES[String(a.hero).toLowerCase()]) lines.push(`Bible hero selected: ${HEROES[String(a.hero).toLowerCase()]}`)
  if (a.goal_date === 'christmas') lines.push('Your goal: make Bible time a habit by Christmas')
  else if (a.goal_date === 'school-year') lines.push('Your goal: make Bible time a habit this school year')
  else if (a.goal_date === '30-days') lines.push('Your goal: make Bible time a habit in 30 days')
  return lines.length ? ['recap', lines] : null
}

export function buildEmail(lead: Lead, stage: number): { subject: string; html: string } {
  const opts = { unsubscribeUrl: unsubscribeUrl(lead.email) }
  const source = lead.source || 'blog-inline'
  let e: BuiltEmail

  if (lead.magnet === 'quiz-plan') {
    const step = Math.min(Math.max(stage, 1), QUIZ_PLAN_STAGES)
    e = build(`quiz/${step}`, { safe_plan_payload: planPayload(lead), source }, { ...opts, replace: { recap: quizRecap(lead) } })
    return { subject: e.subject, html: e.html }
  }

  const m = MAGNETS[lead.magnet] || MAGNETS.challenge
  const gift = giftFor(lead.magnet)
  const sep = (url: string) => url + (url.includes('?') ? '&' : '?')
  const vars: Record<string, string> = {
    source,
    magnet_subject: m.subject,
    magnet_pre: m.pre,
    magnet_headline: m.headline,
    magnet_short: m.short,
    magnet_line: m.line,
    magnet_tip: m.tip,
    magnet_url: sep(m.url),
    magnet_img: m.img || '',
    gift_short: gift.short,
    gift_url: sep(gift.url),
  }
  switch (stage) {
    case 1:
      // The challenge has no cover image, so its email goes without one.
      e = build('printable/1', m.img ? vars : { ...vars, magnet_img: 'none' }, m.img ? opts : { ...opts, replace: { img: null } })
      break
    case 2:
      e = build(lead.magnet === 'bedtime-kit' ? 'printable/2-trivia' : 'printable/2', vars, opts)
      break
    case 3:
    case 4:
      e = build(`printable/${stage}`, vars, opts)
      break
    default:
      e = build('printable/5', vars, opts)
  }
  return { subject: e.subject, html: e.html }
}
