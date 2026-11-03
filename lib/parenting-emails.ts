import { confirmUrl, newsletterUnsubscribeUrl } from './parenting-db'

/*
 * Transactional email for the Parenting desk, via Resend's REST API.
 *
 * Sender rule (owner decision, Aug 24 2026): mail that invites a reply from a
 * person goes out as "Christian at Faithful Kids" from the monitored inbox;
 * brand mail (newsletter confirmation) goes out as "Faithful Kids" from
 * team@. First name only, never a surname, in the sign-off.
 *
 * In development nothing is sent: the message is logged instead, so a test
 * pitch never lands in the real inbox. PARENTING_EMAIL_LIVE=1 overrides.
 */

const RESEND_KEY = process.env.RESEND_API_KEY
const TEAM_FROM = `Faithful Kids <${process.env.RESEND_FROM_EMAIL || 'team@faithfulkids.app'}>`
const CHRISTIAN_FROM = 'Christian at Faithful Kids <christian@faithfulkids.app>'
export const EDITOR_INBOX = 'christian@faithfulkids.app'

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
  const first = esc(name.trim().split(/\s+/)[0] || 'there')
  const html = shell(`
<p>Hi ${first},</p>
<p>Thank you for sending a pitch to Parenting at Faithful Kids. I read every one myself. Here is what I have:</p>
<blockquote style="margin:16px 0;padding:12px 16px;border-left:3px solid #16a34a;background:#f0fdf4;color:#166534;"><strong>${esc(topic)}</strong></blockquote>
<p>${wantsInterview
  ? 'You said you would rather be interviewed than write it up yourself. Good. If it is a fit I will suggest a couple of times for a short call, and I will draft the piece in your voice for you to approve.'
  : 'If it is a fit I will reply with a rough length and a deadline, and you write. You see every edit before anything is published.'}</p>
<p>Expect an answer within about a week either way. If you do not hear from me by then, reply to this email and it comes straight to me.</p>
<p style="margin:26px 0 0;">— Christian from Faithful Kids<br/><span style="color:#6b7280;font-size:13px;">faithfulkids.app/parenting</span></p>`,
  `You are receiving this because you submitted a pitch at faithfulkids.app/parenting/write-for-us. We keep your pitch and email private and use them only to consider your piece.`)
  return send({ from: CHRISTIAN_FROM, to, replyTo: EDITOR_INBOX, subject: `Got your pitch: ${topic.slice(0, 70)}`, html })
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
  const url = confirmUrl(to)
  const html = shell(`
<p>One click and you are in.</p>
<p>You asked to receive <strong>Faithful Kids Weekly</strong>, our once-a-week letter for Christian parents: one story worth your time, one practical family activity, one thing worth knowing, and one Bible lesson to explore with your kids.</p>
${button(url, 'Confirm my subscription')}
<p style="color:#6b7280;font-size:13px;">If you did not request this, ignore this email and nothing further will be sent. The link works for 14 days.</p>
<p style="margin:26px 0 0;">— The Faithful Kids Team<br/><span style="color:#6b7280;font-size:13px;">faithfulkids.app/parenting</span></p>`,
  `Sent to ${esc(to)} because this address was entered at faithfulkids.app. <a href="${newsletterUnsubscribeUrl(to)}" style="color:#9ca3af;">Unsubscribe</a>`)
  return send({
    from: TEAM_FROM, to, subject: 'Confirm your Faithful Kids Weekly subscription', html,
    headers: { 'List-Unsubscribe': `<${newsletterUnsubscribeUrl(to)}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' },
  })
}
