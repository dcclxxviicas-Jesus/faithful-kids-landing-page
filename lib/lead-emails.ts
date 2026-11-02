import { SITE_URL, unsubscribeUrl, type Lead } from './leads'

// The 5-email nurture sequence for captured leads.
// Stage N = the Nth email. Timing between stages lives in DRIP_SCHEDULE.

export const DRIP_SCHEDULE: Record<number, number> = {
  // stage just sent -> days until next stage
  1: 2, // delivery -> day 2
  2: 2, // day 2 -> day 4
  3: 2, // day 4 -> day 6
  4: 3, // day 6 -> day 9
}

/* The quiz-plan recovery sequence is deliberately SHORTER (3 emails) and on
   its own clock: these people already saw the product and a price — they are
   warm abandoners, not cold printable-downloaders, and five nurture emails
   at that temperature reads as pestering. */
const QUIZ_PLAN_SCHEDULE: Record<number, number> = {
  1: 2, // plan delivered -> day 2
  2: 3, // day 2 -> day 5 (final)
}

/** Days until the next stage for this lead's sequence, or undefined = done. */
export function nextDripDays(magnet: string, stage: number): number | undefined {
  return magnet === 'quiz-plan' ? QUIZ_PLAN_SCHEDULE[stage] : DRIP_SCHEDULE[stage]
}

/* Link that restores the lead's exact plan: answers (the child's NAME is
   never stored or mailed — it stays in the quiz-taker's browser) packed as
   base64url into ?rp=, which /quiz decodes straight to the reveal. No
   server lookup, nothing sensitive in the URL. */
export function planRestoreUrl(lead: Lead, stage: number): string {
  const { child_name: _cn, ...safe } = lead.quiz_answers || {}
  const payload = Buffer.from(JSON.stringify({ a: safe, p: 'parent' }))
    .toString('base64url')
  return utm(`${SITE_URL}/quiz?rp=${payload}`, stage).replace('lead-drip', 'plan-drip')
}

const MAGNET_INFO = {
  challenge: {
    name: 'The 30-Day Family Bible Challenge',
    shortName: '30-Day Challenge',
    url: `${SITE_URL}/printables/30-day-challenge`,
    line: 'One story a night — read it together, talk about it, check it off.',
  },
  'coloring-pages': {
    name: 'The Bible Coloring Pages Pack',
    shortName: 'Bible Coloring Pack',
    url: 'https://d3g07v1w0lehiv.cloudfront.net/coloring-pages/faithful-kids-bible-coloring-pages.pdf',
    line: 'All 26 pages in one PDF — Creation to the Empty Tomb, ready to print.',
  },
  'trivia-pack': {
    name: 'The Family Bible Trivia Pack',
    shortName: 'Bible Trivia Pack',
    url: `${SITE_URL}/printables/bible-trivia-pack`,
    line: '100 questions for game night, car rides, and Sunday school — answers in the back.',
  },
  'bedtime-kit': {
    name: 'The Bedtime Bible Kit',
    shortName: 'Bedtime Bible Kit',
    url: `${SITE_URL}/printables/bedtime-bible-kit`,
    line: 'Seven nights of five-minute stories — a story, a prayer, and one question to whisper about.',
  },
  advent: {
    name: 'The 25-Day Advent Bible Readings',
    shortName: 'Advent Readings',
    url: `${SITE_URL}/printables/advent-readings`,
    line: 'December 1 to 25 — one short reading a night, from the first promise to the manger.',
  },
} as const

/* Every drip email after the first gives something free before it asks for
   anything. Rewritten Nov 1, 2026 on the click data: email 1 (the gift) drew
   59 clickers in 60 days, email 2 (the first pitch) drew 5, emails 3-5
   drew 1-2 each. This audience opens gifts and ignores pitches, so each
   stage leads with a real free thing and carries the trial as the P.S. until
   the closer. The second printable is the one they don't already have. */
function crossGift(magnet: string) {
  const other = magnet === 'bedtime-kit' ? 'trivia-pack'
    : magnet === 'coloring-pages' ? 'bedtime-kit'
    : magnet === 'challenge' ? 'trivia-pack'
    : 'bedtime-kit' // trivia-pack leads get the bedtime kit
  return MAGNET_INFO[other as keyof typeof MAGNET_INFO]
}

function utm(url: string, stage: number): string {
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}utm_source=email&utm_medium=nurture&utm_campaign=lead-drip-${stage}`
}

function wrap(email: string, bodyHtml: string): string {
  // Deliberately minimal — looks like a note from a person, not a campaign.
  // Heavy branded chrome (colored headers, boxed footers) pushes Gmail
  // toward the Promotions tab.
  return `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#ffffff;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
<div style="max-width:560px;margin:0 auto;padding:28px 20px;color:#1f2937;font-size:15px;line-height:1.65;">
${bodyHtml}
<p style="margin:26px 0 0;">— The Faithful Kids Team<br/><span style="color:#6b7280;font-size:13px;">faithfulkids.app</span></p>
<p style="margin:24px 0 0;color:#9ca3af;font-size:12px;line-height:1.5;">
  You're receiving this because you requested a free resource at faithfulkids.app.
  <a href="${unsubscribeUrl(email)}" style="color:#9ca3af;">Unsubscribe</a>
</p>
</div></body></html>`
}

function button(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:22px auto;"><tr><td style="background:#16a34a;border-radius:999px;">
  <a href="${href}" style="display:inline-block;padding:13px 30px;color:#ffffff;font-weight:700;text-decoration:none;font-size:15px;">${label}</a>
</td></tr></table>`
}

function quizRecap(lead: Lead): string {
  const a = lead.quiz_answers || {}
  const bits: string[] = []
  if (a.age) bits.push(`<li>Lessons matched for <strong>ages ${a.age}</strong></li>`)
  if (a.hero) bits.push(`<li>Starting with the heroes your child picked</li>`)
  /* No "learning path" per denomination — that feature does not exist (same
     false claim scrubbed from /beliefs, checkout and the quiz screens). */
  if (a.goal_date === 'christmas') bits.push(`<li>Paced to be a habit <strong>by Christmas</strong></li>`)
  else if (a.goal_date === 'school-year') bits.push(`<li>Paced to be a habit <strong>this school year</strong></li>`)
  if (a.goal === 'replace' || a.pain) bits.push(`<li>Built to replace junk screen time with Scripture</li>`)
  if (!bits.length) return ''
  return `<p style="margin:16px 0 6px;"><strong>Your family's plan is saved and ready:</strong></p><ul style="margin:0 0 12px;padding-left:20px;">${bits.join('')}</ul>`
}

/* Recovery sequence for people who built a plan in the quiz, left their
   email at the gate, and did not buy. Warm audience, so every email leads
   with THEIR plan, not a pitch. */
function buildQuizPlanEmail(lead: Lead, stage: number): { subject: string; html: string } {
  const planUrl = planRestoreUrl(lead, stage)
  const a = lead.quiz_answers || {}
  const ages = a.age ? ` for ages ${a.age}` : ''
  switch (stage) {
    case 1:
      return {
        subject: 'Your Bible plan is saved — here’s the link',
        html: wrap(lead.email, `
<p style="font-size:17px;font-weight:700;margin:0 0 12px;">The plan you built is saved.</p>
<p>One tap brings the whole thing back — the first week of episodes${ages}, exactly as you left it. Day one, <em>Creation</em>, is free to watch right now, no signup.</p>
${button(planUrl, 'Open the plan →')}
${quizRecap(lead)}
<p style="color:#6b7280;font-size:13px;">Each episode is about two minutes, ends with a quiz, and there are 300+ of them from Genesis to Revelation.</p>`),
      }
    case 2:
      return {
        subject: 'Day one is still free',
        html: wrap(lead.email, `
<p>The first episode of your plan — <em>Creation</em> — is free, start to finish, no account needed. Two minutes.</p>
<p>Most parents tell us the moment it clicked wasn’t reading about the app. It was their kid asking for episode two.</p>
${button(planUrl, 'Watch day one with them →')}
<p style="color:#6b7280;font-size:13px;">Your plan is saved at that link whenever you’re ready.</p>`),
      }
    case 3:
    default:
      return {
        subject: 'Last note about the plan',
        html: wrap(lead.email, `
<p>This is the last email about the plan you built — we promised not to clutter your inbox.</p>
<p>One honest thought before we go: the yearly plan starts with <strong>7 days completely free</strong> ($0.00 today), and there’s a 30-day money-back guarantee after that. The whole risk of trying it is one tap and one week of two-minute stories.</p>
${button(planUrl, 'Open the plan — start free →')}
<p>Either way, thank you for building it. The door stays open. \u{1F49A}</p>`),
      }
  }
}

export function buildEmail(lead: Lead, stage: number): { subject: string; html: string } {
  if (lead.magnet === 'quiz-plan') return buildQuizPlanEmail(lead, stage)
  const m = MAGNET_INFO[lead.magnet as keyof typeof MAGNET_INFO] || MAGNET_INFO.challenge
  const quizUrl = utm(`${SITE_URL}/quiz`, stage)
  const magnetUrl = utm(m.url, stage)

  switch (stage) {
    case 1:
      return {
        subject: `Here's your free ${m.shortName} 🎉`,
        html: wrap(lead.email, `
<p style="font-size:17px;font-weight:700;margin:0 0 12px;">It's here — enjoy!</p>
<p>${m.name} is ready for you. ${m.line}</p>
${button(magnetUrl, `Open the ${m.shortName} →`)}
<p style="color:#6b7280;font-size:13px;">Tip: print it — ${lead.magnet === 'bedtime-kit' ? 'paper works better than a glowing screen at bedtime' : 'it works better where everyone can see it'}.</p>
${lead.source === 'quiz-exit' ? quizRecap(lead) : ''}
<p style="margin-top:20px;">P.S. Every story in it exists as a roughly two-minute video lesson narrated by Jesus, with a quiz after — that's what we make. <a href="${quizUrl}" style="color:#16a34a;font-weight:700;">Try it free for 7 days</a> whenever you're curious.</p>`),
      }
    case 2: {
      const gift = crossGift(lead.magnet)
      return {
        subject: `A second freebie: the ${gift.shortName}`,
        html: wrap(lead.email, `
<p>${lead.magnet === 'trivia-pack'
    ? 'Hope game night was a hit. Since the trivia pack worked for your family, here’s the companion piece:'
    : 'Hope the first night went well. Families who liked that one usually love this one too:'}</p>
<p style="font-size:17px;font-weight:700;margin:14px 0 4px;">${gift.name} — free, no strings</p>
<p>${gift.line}</p>
${button(utm(gift.url, stage), `Get the ${gift.shortName} →`)}
<p style="margin-top:20px;">And if you want tonight's story handled for you: the very first Faithful Kids episode, <em>Creation</em>, is free to watch — about two minutes, narrated by Jesus, with the same warmth the printables have. <a href="${utm(`${SITE_URL}/blog/in-the-beginning-creation-for-kids`, stage)}" style="color:#16a34a;font-weight:700;">Watch it here</a>.</p>`),
      }
    }
    case 3:
      return {
        subject: 'Free tonight: David & Goliath (and a number that stopped us cold)',
        html: wrap(lead.email, `
<p>First, tonight's story — the one every kid asks for — free, start to finish:</p>
${button(utm(`${SITE_URL}/blog/david-and-goliath-for-kids`, stage), 'Watch David & Goliath free →')}
<p>Two minutes. Watch your kid's face when the stone flies.</p>
<p style="margin-top:22px;">Now the number that stopped us cold as parents:</p>
<p style="font-size:22px;font-weight:800;margin:14px 0;color:#16a34a;">1,095 hours</p>
<p>That's what "about 3 hours of screens a day" adds up to in a year. Nobody plans it. It just happens.</p>
<p>The hopeful part: <strong>if just 5% of that became Scripture</strong>, your child would walk through the entire Bible — twice — this year. That's the whole idea behind Faithful Kids: 300+ stories like the one above, each ending with a quiz. <a href="${quizUrl}" style="color:#16a34a;font-weight:700;">It starts with a free week</a>.</p>`),
      }
    case 4:
      return {
        subject: 'One more free story: Noah and the Great Flood',
        html: wrap(lead.email, `
<p>Third free episode, on us — the animals, the ark, the rainbow:</p>
${button(utm(`${SITE_URL}/blog/noah-and-the-great-flood-for-kids`, stage), 'Watch Noah’s story free →')}
<p style="margin-top:20px;">By now your kids have seen what a Faithful Kids lesson feels like. Inside the app, this is what every day looks like: a two-minute episode, a quiz right after so you can see what stuck, and the whole Bible in order — 300+ lessons from Genesis to Revelation. No ads, no algorithm, no "up next" rabbit hole.</p>
<p style="border-left:3px solid #16a34a;padding-left:14px;margin:16px 0;">"My daughter asks for Bible stories instead of YouTube now."<br/><span style="color:#6b7280;font-size:13px;">— Maria S., mom of 3</span></p>
${button(quizUrl, 'Start your free trial →')}`),
      }
    case 5:
    default:
      return {
        subject: 'Last one from us — the door stays open',
        html: wrap(lead.email, `
<p>This is the last email in this little series — we promised not to clutter your inbox, and we meant it.</p>
<p>Everything free stays yours: the printables, and the stories we sent — <a href="${utm(`${SITE_URL}/blog/in-the-beginning-creation-for-kids`, stage)}" style="color:#16a34a;">Creation</a>, <a href="${utm(`${SITE_URL}/blog/david-and-goliath-for-kids`, stage)}" style="color:#16a34a;">David &amp; Goliath</a>, <a href="${utm(`${SITE_URL}/blog/noah-and-the-great-flood-for-kids`, stage)}" style="color:#16a34a;">Noah</a>.</p>
<p>One honest thought before we go: the parents who get the most out of Faithful Kids aren't the ones with perfect routines. They're the ones who swapped <em>one</em> YouTube session a day for one Bible story with a quiz. That swap compounds into a child who knows Scripture.</p>
<p>The 7-day trial is free, and the 30-day money-back guarantee covers the rest — there's genuinely no catch.</p>
${button(quizUrl, 'Give it a week — free')}
<p>Either way: keep the printables, enjoy the stories, and thank you for letting us into your family's inbox for a few days. 💚</p>`),
      }
  }
}
