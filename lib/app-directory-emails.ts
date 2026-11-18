/*
 * Email for the Christian Apps directory, via Resend's REST API. Sender rule
 * (Nov 16, 2026): everything is "Faithful Kids" <team@>, signed by the team.
 * The owner reviews submissions from team@, so notifications go there.
 * Development never sends; PARENTING_EMAIL_LIVE=0 is the shared off switch.
 */

const RESEND_KEY = process.env.RESEND_API_KEY
const TEAM = process.env.RESEND_FROM_EMAIL || 'team@faithfulkids.app'
const FROM = `Faithful Kids <${TEAM}>`
export const REVIEW_INBOX = 'team@faithfulkids.app'

const LIVE = process.env.PARENTING_EMAIL_LIVE === '0'
  ? false
  : (process.env.NODE_ENV === 'production' || process.env.PARENTING_EMAIL_LIVE === '1')

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function shell(body: string): string {
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#fff;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
<div style="max-width:560px;margin:0 auto;padding:28px 20px;color:#1f2937;font-size:15px;line-height:1.65;">${body}</div></body></html>`
}

async function send(o: { to: string; replyTo?: string; subject: string; html: string }): Promise<boolean> {
  if (!LIVE) { console.log(`[directory email: not sent in development] to ${o.to}: ${o.subject}`); return true }
  if (!RESEND_KEY) { console.error('RESEND_API_KEY missing'); return false }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM, to: [o.to], ...(o.replyTo ? { reply_to: o.replyTo } : {}), subject: o.subject, html: o.html }),
  })
  if (!res.ok) console.error('resend error', res.status, await res.text())
  return res.ok
}

export interface SubmissionEmail {
  id: string | null
  kind: string; name: string; maker: string; category: string; ages: string; priceModel: string; price: string
  iosUrl: string; androidUrl: string; webUrl: string; description: string
  contactName: string; contactEmail: string; contactRole: string; notes: string
}

export async function sendSubmissionNotification(s: SubmissionEmail, stored: boolean): Promise<boolean> {
  const row = (k: string, v: string) => v ? `<tr><td style="padding:6px 10px 6px 0;color:#6b7280;vertical-align:top;white-space:nowrap;">${k}</td><td style="padding:6px 0;">${v}</td></tr>` : ''
  const link = (u: string) => u ? `<a href="${esc(u)}">${esc(u)}</a>` : ''
  const html = shell(`
<p><strong>New ${s.kind === 'website' ? 'website' : 'app'} submitted to the Christian Apps directory</strong></p>
${stored ? '' : '<p style="background:#fef3c7;padding:10px 12px;border-radius:8px;">The submissions table is not set up yet, so this one exists only in this email. Run supabase-app-directory-migration.sql in Supabase to start the review list.</p>'}
<table style="border-collapse:collapse;font-size:14px;">
${row('Name', `<strong>${esc(s.name)}</strong>`)}
${row('Maker', esc(s.maker))}
${row('Category', esc(s.category))}
${row('Ages', esc(s.ages))}
${row('Price', esc(`${s.priceModel}${s.price ? `, ${s.price}` : ''}`))}
${row('App Store', link(s.iosUrl))}
${row('Google Play', link(s.androidUrl))}
${row('Website', link(s.webUrl))}
${row('Description', esc(s.description).replace(/\n/g, '<br/>'))}
${row('From', `${esc(s.contactName)} &lt;${esc(s.contactEmail)}&gt; (${esc(s.contactRole)})`)}
${row('Notes', esc(s.notes).replace(/\n/g, '<br/>'))}
</table>
<p><a href="https://faithfulkids.app/cas-admin/apps" style="color:#16a34a;font-weight:700;">Open the review list</a></p>
<p style="color:#6b7280;font-size:13px;">Reply to this email to answer the submitter directly.</p>`)
  return send({ to: REVIEW_INBOX, replyTo: s.contactEmail, subject: `Directory submission: ${s.name.slice(0, 80)}`, html })
}

export async function sendSubmissionReceipt(to: string, name: string, listingName: string): Promise<boolean> {
  const first = esc(name.trim().split(/\s+/)[0] || 'there')
  const html = shell(`
<p>Hi ${first},</p>
<p>Thanks for submitting <strong>${esc(listingName)}</strong> to the Christian Apps for Kids directory on Faithful Kids.</p>
<p>Every submission is reviewed by our team, and listings are approved at our discretion. If it's approved, we'll email you the link to its page.</p>
<p>If anything about the listing changes in the meantime, just reply to this email.</p>
<p>The Faithful Kids team</p>`)
  return send({ to, replyTo: REVIEW_INBOX, subject: `We received ${listingName.slice(0, 80)}`, html })
}

export async function sendApprovedEmail(to: string, name: string, listingName: string, url: string): Promise<boolean> {
  const first = esc(name.trim().split(/\s+/)[0] || 'there')
  const html = shell(`
<p>Hi ${first},</p>
<p><strong>${esc(listingName)}</strong> is now listed in the Christian Apps for Kids directory:</p>
<p><a href="${esc(url)}" style="color:#16a34a;font-weight:700;">${esc(url)}</a></p>
<p>If you'd like to show it, there's a "Listed on Faithful Kids" badge with a copy-and-paste snippet at the bottom of that page.</p>
<p>The Faithful Kids team</p>`)
  return send({ to, replyTo: REVIEW_INBOX, subject: `${listingName.slice(0, 80)} is now listed on Faithful Kids`, html })
}
