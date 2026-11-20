import { renderEmail, escapeHtml as esc, type Block } from '@/lib/email-system/render'
import { TERMS, SITE_URL, LOGIN_URL, linkFor, accountUrl, money, fmtDate, nextPayoutDate, type Affiliate } from '@/lib/affiliates'

/*
 * Affiliate program email. Sender rule (Nov 16, 2026): "Faithful Kids"
 * <team@>, "we" voice, signed by the team, never a personal name. Rendered
 * with the shared email design ('home'), but kept out of lib/email-system's
 * generated catalogue, which the emails session owns.
 *
 * Only two emails send on their own: the applicant's receipt and the team@
 * notification, both triggered by the applicant submitting the form.
 * Approval, decline and payout emails send only when the owner presses the
 * button in /cas-admin/affiliates, after previewing them.
 *
 * Block strings are raw HTML: escape every value that came from a person.
 * PARENTING_EMAIL_LIVE=0 is the shared off switch for local runs.
 */

const RESEND_KEY = process.env.RESEND_API_KEY
const TEAM = 'team@faithfulkids.app'
const FROM = `Faithful Kids <${TEAM}>`

const LIVE = process.env.PARENTING_EMAIL_LIVE === '0'
  ? false
  : (process.env.NODE_ENV === 'production' || process.env.PARENTING_EMAIL_LIVE === '1')

export interface Built { to: string; subject: string; html: string }

export async function send(m: Built, replyTo?: string): Promise<boolean> {
  if (!LIVE) { console.log(`[affiliate email: not sent outside production] to ${m.to}: ${m.subject}`); return true }
  if (!RESEND_KEY) { console.error('RESEND_API_KEY missing'); return false }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM, to: [m.to], reply_to: replyTo || TEAM, subject: m.subject, html: m.html }),
  })
  if (!res.ok) console.error('resend error', res.status, await res.text())
  return res.ok
}

const page = (pre: string, reason: string, blocks: Block[]) =>
  renderEmail({ style: 'home', pre, reason, blocks, unsubscribeUrl: null })

const hello = (name: string) => {
  const first = name.trim().split(/\s+/)[0]
  return first && first.length > 1 ? `Hi ${esc(first)},` : 'Hi there,'
}

const TERMS_URL = `${SITE_URL}/affiliates/terms`

/** The program in four lines, used in more than one email. */
const termLines = (): string[] => [
  `<strong>${TERMS.ratePct}% of every payment</strong> a family you refer makes on the web, for their first ${TERMS.months} months.`,
  `Your link remembers a visitor for ${TERMS.cookieDays} days. If they subscribe on faithfulkids.app in that time, the sale is yours.`,
  `Commission clears after a ${TERMS.holdDays}-day hold, then we pay by PayPal on the ${TERMS.payoutDay}th of each month once you are over ${money(TERMS.minimumCents)}.`,
  'App Store and Google Play purchases happen outside our checkout, so they cannot be tracked or credited.',
]

// ---------------------------------------------------------------- automatic

export function applicationReceipt(a: Pick<Affiliate, 'name' | 'email'>): Built {
  return {
    to: a.email,
    subject: 'We have your Faithful Kids affiliate application',
    html: page('A real person reads every application.', 'You are receiving this because you applied to the Faithful Kids affiliate program.', [
      ['eyebrow', 'Affiliate program'],
      ['h', 'Thanks for applying'],
      ['p', hello(a.name)],
      ['p', 'We have your application to the Faithful Kids affiliate program. A real person on our team reads every one, and we reply either way, usually within a few days.'],
      ['p', 'If you are approved, the next email brings your personal link and a private page where you can see your clicks, sign-ups and earnings.'],
      ['p', `While you wait, the full program terms are here: <a href="${TERMS_URL}">faithfulkids.app/affiliates/terms</a>.`],
      ['sign', 'brand'],
    ]),
  }
}

export function teamNotification(a: Affiliate, stored: boolean): Built {
  const row = (k: string, v: string | null) => v ? `<strong>${k}:</strong> ${esc(v).replace(/\n/g, '<br>')}` : ''
  return {
    to: TEAM,
    subject: `Affiliate application: ${a.name}`,
    html: page('New affiliate application.', 'Internal notification for the Faithful Kids team.', [
      ['eyebrow', 'New affiliate application'],
      ['h', esc(a.name)],
      ...(stored ? [] : [['p', '<strong>The affiliates table is not set up yet,</strong> so this application exists only in this email. Run supabase-affiliates-migration.sql in Supabase.'] as Block]),
      ['list', [
        row('Email', a.email), row('Where they publish', a.website), row('Audience', a.audience),
        row('Plan', a.plan), row('Country', a.country),
      ].filter(Boolean)],
      ['btn', 'Review in the affiliate desk', `${SITE_URL}/cas-admin/affiliates`],
    ]),
  }
}

// ---------------------------------------------------------------- owner-sent

export function approvalEmail(a: Affiliate): Built {
  if (!a.code || !a.token) throw new Error('approve the affiliate (code + token) before building this email')
  const link = linkFor(a.code)
  return {
    to: a.email,
    subject: 'You are in: your Faithful Kids affiliate link',
    html: page(`Your link is ${link}`, 'You are receiving this because you were approved for the Faithful Kids affiliate program.', [
      ['eyebrow', 'Affiliate program'],
      ['h', 'Welcome to the program'],
      ['p', hello(a.name)],
      ['p', 'Thank you for wanting to share Faithful Kids with the families who trust you. You are approved, and here is everything you need.'],
      ['h3', 'Your affiliate page'],
      ['p', 'Your own page shows visitors from your link as they arrive, plus sign-ups, sales, earnings and payouts within minutes. This button signs you straight in:'],
      ['btn', 'Sign in to your affiliate page', accountUrl(a.token)],
      ['p', `Any time after that, sign in at <a href="${LOGIN_URL}">faithfulkids.app/affiliates/login</a> with this email address (${esc(a.email)}) and we will email you a sign-in link. No password to remember. Please keep this email private, since the button above signs in as you.`],
      ['p', 'Once you are in, add the PayPal email you want to be paid at.'],
      ['h3', 'Your link'],
      ['p', `<a href="${link}" style="font-weight:800;font-size:18px;">${esc(link.replace('https://', ''))}</a>`],
      ['small', `To send people to a particular page, add it after <code>?to=</code>, for example ${esc(link.replace('https://', ''))}?to=/bible-trivia`],
      ['h3', 'How it works'],
      ['list', termLines()],
      ['h3', 'Three rules that protect you and us'],
      ['list', [
        'Say it is an affiliate link, clearly and near the link, every time (for example "I earn a commission if you subscribe"). The FTC requires it.',
        'Talk to parents, not to children. Faithful Kids is for kids, but the person deciding is a parent.',
        'Do not bid on "Faithful Kids" in search ads, and do not promise discounts or features we do not offer.',
      ]],
      ['p', `The full terms you agreed to when you applied are at <a href="${TERMS_URL}">faithfulkids.app/affiliates/terms</a>.`],
      ['p', 'Questions, ideas, or want something to share (images, a sample lesson, an honest answer to a hard question)? Just reply. We read everything.'],
      ['sign', 'brand'],
    ]),
  }
}

export function declineEmail(a: Affiliate): Built {
  return {
    to: a.email,
    subject: 'Your Faithful Kids affiliate application',
    html: page('Thank you for applying.', 'You are receiving this because you applied to the Faithful Kids affiliate program.', [
      ['p', hello(a.name)],
      ['p', 'Thank you for applying to the Faithful Kids affiliate program, and for thinking of us.'],
      ['p', 'We are not able to approve this application right now. That is usually about fit with the families we serve rather than about you or the size of your audience, and it is not a permanent answer. If your work changes, you are welcome to apply again.'],
      ['sign', 'brand'],
    ]),
  }
}

export function payoutEmail(a: Affiliate, amountCents: number, sentTo: string, reference: string | null): Built {
  const next = nextPayoutDate(new Date(Date.now() + 86400_000))
  return {
    to: a.email,
    subject: `Your Faithful Kids affiliate payout: ${money(amountCents)}`,
    html: page(`${money(amountCents)} is on its way.`, 'You are receiving this because you are a Faithful Kids affiliate.', [
      ['eyebrow', 'Affiliate payout'],
      ['h', `${money(amountCents)} sent`],
      ['p', hello(a.name)],
      ['p', `We have sent ${money(amountCents)} to your PayPal account (${esc(sentTo)})${reference ? `, PayPal transaction ${esc(reference)}` : ''}. Thank you for every family you have pointed our way.`],
      ['p', `Your affiliate page shows exactly which payments this covers. The next payout date is ${fmtDate(next)}.`],
      ['btn', 'See your affiliate page', LOGIN_URL],
      ['sign', 'brand'],
    ]),
  }
}

export function signInEmail(a: Affiliate, link: string): Built {
  return {
    to: a.email,
    subject: 'Your Faithful Kids affiliate sign-in link',
    html: page('Sign in to your affiliate page.', 'You are receiving this because someone asked to sign in to this Faithful Kids affiliate account.', [
      ['eyebrow', 'Affiliate program'],
      ['h', 'Sign in to your affiliate page'],
      ['p', hello(a.name)],
      ['p', 'Here is your sign-in link. It works for one hour.'],
      ['btn', 'Sign in', link],
      ['small', 'If you did not ask for this, you can ignore it. Nobody can sign in without this email.'],
      ['sign', 'brand'],
    ]),
  }
}

export interface DueRow { name: string; email: string; payoutEmail: string | null; cents: number; needsTaxForm: boolean }

/** The owner's monthly "who to pay" email, sent to team@ on payout day. */
export function payoutReport(rows: DueRow[], under: { name: string; cents: number }[], payDate: Date): Built {
  const total = rows.reduce((n, r) => n + r.cents, 0)
  const line = (r: DueRow) =>
    `<strong>${esc(r.name)}</strong>: <strong>${money(r.cents)}</strong> to ${r.payoutEmail ? `PayPal <strong>${esc(r.payoutEmail)}</strong>` : `<span style="color:#b91c1c;">no PayPal email yet (ask ${esc(r.email)})</span>`}${r.needsTaxForm ? ' <span style="color:#b91c1c;">(collect a W-9 or W-8BEN first: over $2,000 this year)</span>' : ''}`
  return {
    to: TEAM,
    subject: `Affiliate payouts due ${fmtDate(payDate)}: ${money(total)} to ${rows.length} affiliate${rows.length === 1 ? '' : 's'}`,
    html: page(`${money(total)} to pay today.`, 'Internal monthly payout report for the Faithful Kids team.', [
      ['eyebrow', 'Affiliate payouts'],
      ['h', `${money(total)} to pay`],
      ['p', `These affiliates have cleared commission over the ${money(TERMS.minimumCents)} minimum. Send each amount by PayPal, then record it in the desk with the PayPal transaction id so their page shows it as paid.`],
      ['list', rows.map(line)],
      ...(under.length ? [['small', `Under the minimum, rolling over to next month: ${under.map(u => `${esc(u.name)} ${money(u.cents)}`).join(', ')}.`] as Block] : []),
      ['btn', 'Open the affiliate desk', `${SITE_URL}/cas-admin/affiliates`],
    ]),
  }
}
