import { confirmUrl, newsletterUnsubscribeUrl, listConfirmedEmails, claimSends, markSend } from './parenting-db'
import { buildEmail } from './email-system'
import { buildIssue, issueProblems, type Issue } from './newsletter-issues'

/*
 * Transactional email for the Parenting desk, via Resend's REST API.
 *
 * Sender rule (owner decision, Nov 16 2026): everything goes out as
 * "Faithful Kids" from team@ and is signed by the team. A pitch receipt sets
 * reply-to to the editor's inbox so the writer's answer reaches the desk.
 *
 * In development nothing is sent: the message is logged instead, so a test
 * pitch never lands in the real inbox. PARENTING_EMAIL_LIVE=1 overrides.
 */

const RESEND_KEY = process.env.RESEND_API_KEY
const TEAM_FROM = `Faithful Kids <${process.env.RESEND_FROM_EMAIL || 'team@faithfulkids.app'}>`
// Shows as the brand; replies still go to the editor's inbox via replyTo.
const CHRISTIAN_FROM = TEAM_FROM
export const EDITOR_INBOX = 'team@faithfulkids.app'

// PARENTING_EMAIL_LIVE=0 is a hard off switch for local production-mode test
// runs (`next start` sets NODE_ENV=production, which would otherwise send).
const LIVE = process.env.PARENTING_EMAIL_LIVE === '0'
  ? false
  : (process.env.NODE_ENV === 'production' || process.env.PARENTING_EMAIL_LIVE === '1')

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function shell(body: string, footer: string): string {
  return `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#ffffff;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
<div style="max-width:560px;margin:0 auto;padding:28px 20px;color:#1f2937;font-size:15px;line-height:1.65;">
${body}
<p style="margin:24px 0 0;color:#9ca3af;font-size:12px;line-height:1.5;">${footer}</p>
</div></body></html>`
}

function button(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:22px auto;"><tr><td style="background:#16a34a;border-radius:999px;">
  <a href="${href}" style="display:inline-block;padding:13px 30px;color:#ffffff;font-weight:700;text-decoration:none;font-size:15px;">${label}</a>
</td></tr></table>`
}

async function send(opts: { from: string; to: string; replyTo?: string; subject: string; html: string; headers?: Record<string, string> }): Promise<boolean> {
  if (!LIVE) {
    console.log(`[parenting email: not sent in development]\n  from: ${opts.from}\n  to: ${opts.to}\n  subject: ${opts.subject}`)
    return true
  }
  if (!RESEND_KEY) { console.error('RESEND_API_KEY missing'); return false }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: opts.from,
      to: [opts.to],
      ...(opts.replyTo ? { reply_to: opts.replyTo } : {}),
      subject: opts.subject,
      html: opts.html,
      ...(opts.headers ? { headers: opts.headers } : {}),
    }),
  })
  if (!res.ok) console.error('resend error', res.status, await res.text())
  return res.ok
}

/* -------------------------------------------------------------- pitches */

export async function sendPitchReceipt(to: string, name: string, topic: string, wantsInterview: boolean): Promise<boolean> {
  const first = name.trim().split(/\s+/)[0] || 'there'
  // Someone who asked to be interviewed is told how that works instead of
  // being told they will write it. Same letter otherwise.
  const e = buildEmail('writers/received', { parent: first, topic: topic.slice(0, 120) }, {
    unsubscribeUrl: null,
    ...(wantsInterview ? { replaceText: [
      'If it’s a fit, we’ll agree on length and timing together, and you’ll see every edit before anything is published.',
      'You said you’d rather be interviewed than write it yourself. If it’s a fit, we’ll suggest a couple of times for a short call, then draft the piece in your voice for you to approve.',
    ] as [string, string] } : {}),
  })
  return send({ from: CHRISTIAN_FROM, to, replyTo: EDITOR_INBOX, subject: e.subject, html: e.html })
}

export async function sendPitchNotification(s: {
  id: string; name: string; email: string; role: string; topic: string; pitch: string; experience?: string | null; url?: string | null; wantsInterview: boolean; source?: string | null
}): Promise<boolean> {
  const row = (k: string, v: string) => `<tr><td style="padding:6px 10px 6px 0;color:#6b7280;vertical-align:top;white-space:nowrap;">${k}</td><td style="padding:6px 0;">${v}</td></tr>`
  const html = shell(`
<p><strong>New Parenting pitch</strong>${s.wantsInterview ? ' (would rather be interviewed)' : ''}</p>
<table style="border-collapse:collapse;font-size:14px;">
${row('From', `${esc(s.name)} &lt;${esc(s.email)}&gt;`)}
${row('Role', esc(s.role))}
${row('Topic', `<strong>${esc(s.topic)}</strong>`)}
${row('Pitch', esc(s.pitch).replace(/\n/g, '<br/>'))}
${s.experience ? row('Experience', esc(s.experience).replace(/\n/g, '<br/>')) : ''}
${s.url ? row('Link', `<a href="${esc(s.url)}">${esc(s.url)}</a>`) : ''}
${s.source ? row('Page', esc(s.source)) : ''}
</table>
${button('https://faithfulkids.app/cas-admin/parenting', 'Open the desk')}
<p style="color:#6b7280;font-size:13px;">Reply to this email to answer the contributor directly (reply-to is set to them).</p>`,
  `Submission ${esc(s.id)}.`)
  return send({ from: TEAM_FROM, to: EDITOR_INBOX, replyTo: s.email, subject: `Pitch: ${s.topic.slice(0, 80)} — ${s.name}`, html })
}

/* ----------------------------------------------------------- newsletter */

export async function sendNewsletterConfirm(to: string): Promise<boolean> {
  const e = buildEmail('weekly/confirm', { newsletter_confirmation_url: confirmUrl(to) }, { unsubscribeUrl: newsletterUnsubscribeUrl(to) })
  return send({
    from: TEAM_FROM, to, subject: e.subject, html: e.html,
    headers: { 'List-Unsubscribe': `<${newsletterUnsubscribeUrl(to)}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' },
  })
}

/* Sent once, the moment a subscriber confirms. */
export async function sendNewsletterWelcome(to: string): Promise<boolean> {
  const e = buildEmail('weekly/welcome', {}, { unsubscribeUrl: newsletterUnsubscribeUrl(to) })
  return send({
    from: TEAM_FROM, to, subject: e.subject, html: e.html,
    headers: { 'List-Unsubscribe': `<${newsletterUnsubscribeUrl(to)}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' },
  })
}

/* ------------------------------------------------------- weekly issues */

const unsubHeaders = (to: string) => ({ 'List-Unsubscribe': `<${newsletterUnsubscribeUrl(to)}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' })

/** One copy of an issue to one address, for Cas to read before sending. Not logged. */
export async function sendIssueTest(issue: Issue, to: string): Promise<boolean> {
  const problems = issueProblems(issue)
  if (problems.length) throw new Error(problems.join('; '))
  const e = buildIssue(issue, to)
  return send({ from: TEAM_FROM, to, subject: e.subject, html: e.html, headers: unsubHeaders(to) })
}

/*
 * Send an issue to every confirmed subscriber who has not had it. Only ever
 * run from the desk when Cas presses the button. Each address is claimed in
 * newsletter_sends first (primary key issue+email), so a second press, a
 * retry or two tabs can never deliver it twice. Resend's batch endpoint takes
 * up to 100 messages a call; we pause between calls to stay under its rate.
 */
export async function sendIssueToAll(issue: Issue): Promise<{ claimed: number; sent: number; failed: number; skipped: number }> {
  const problems = issueProblems(issue)
  if (problems.length) throw new Error(problems.join('; '))
  // A local run with email off must not touch the real send log: it would
  // mark every subscriber as sent and the real send would then skip them.
  if (!LIVE) throw new Error('Email is off on this server (PARENTING_EMAIL_LIVE=0 or development), so nothing was sent or logged')
  const all = await listConfirmedEmails()
  const mine = await claimSends(issue.id, all)
  let sent = 0, failed = 0
  for (let i = 0; i < mine.length; i += 100) {
    const chunk = mine.slice(i, i + 100)
    const msgs = chunk.map(to => { const e = buildIssue(issue, to); return { from: TEAM_FROM, to: [to], subject: e.subject, html: e.html, headers: unsubHeaders(to) } })
    let ids: (string | null)[] = chunk.map(() => null)
    let err: string | null = null
    if (!RESEND_KEY) {
      err = 'RESEND_API_KEY missing'
    } else {
      const res = await fetch('https://api.resend.com/emails/batch', {
        method: 'POST', headers: { Authorization: `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify(msgs),
      })
      const json = await res.json().catch(() => ({})) as { data?: { id: string }[]; message?: string }
      if (res.ok && Array.isArray(json.data)) ids = chunk.map((_, k) => json.data![k]?.id ?? null)
      else err = `resend ${res.status}: ${json.message || 'batch failed'}`
    }
    for (let k = 0; k < chunk.length; k++) {
      const ok = !err && Boolean(ids[k])
      await markSend(issue.id, chunk[k], ok, ok ? ids[k] : (err || 'no id returned'))
      if (ok) sent++; else failed++
    }
    if (i + 100 < mine.length) await new Promise(r => setTimeout(r, 700))
  }
  return { claimed: mine.length, sent, failed, skipped: all.length - mine.length }
}
