import { createHash, createHmac, timingSafeEqual } from 'crypto'

/*
 * Supabase access for the Parenting desk: pitches, outreach, newsletter.
 * PostgREST over fetch with the service key, no SDK, matching lib/leads.ts.
 * Every function here runs on the server only.
 */

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY
const SECRET = process.env.DRIP_SECRET || ''

export function dbConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_KEY)
}

async function supa(path: string, init: RequestInit = {}): Promise<Response> {
  if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error('Supabase env missing')
  return fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    ...init,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
    cache: 'no-store',
  })
}

/** A table that has not been created yet answers 404 with PGRST205. The
 *  routes turn that into a clear "not configured" instead of a generic 500. */
export class TableMissing extends Error {}

async function expectOk(res: Response, what: string): Promise<Response> {
  if (res.ok) return res
  const text = await res.text()
  if (res.status === 404 && /PGRST205|Could not find the table/.test(text)) throw new TableMissing(`${what}: table missing. Run supabase-parenting-migration.sql.`)
  throw new Error(`${what} failed: ${res.status} ${text.slice(0, 300)}`)
}

/** Privacy: never store a raw IP. A per-day salted hash is enough to spot a
 *  burst from one address and nothing more. */
export function ipHash(ip: string): string {
  const day = new Date().toISOString().slice(0, 10)
  return createHash('sha256').update(`${SECRET}:${ip}:${day}`).digest('hex').slice(0, 32)
}

/* ---------------------------------------------------------------- pitches */

export type SubmissionStatus =
  | 'received' | 'under_review' | 'accepted' | 'drafting' | 'editing' | 'awaiting_approval'
  | 'scheduled' | 'published' | 'declined' | 'withdrawn' | 'archived'

export const SUBMISSION_STATUSES: SubmissionStatus[] = [
  'received', 'under_review', 'accepted', 'drafting', 'editing', 'awaiting_approval',
  'scheduled', 'published', 'declined', 'withdrawn', 'archived',
]

export interface Submission {
  id: string
  created_at: string
  updated_at: string
  name: string
  email: string
  role: string
  topic: string
  pitch: string
  experience: string | null
  url: string | null
  wants_interview: boolean
  source: string | null
  referrer: string | null
  status: SubmissionStatus
  assigned_to: string | null
  notes: string | null
  consent_terms_at: string | null
  consent_adult: boolean
  consent_publish_at: string | null
  consent_publish_note: string | null
  article_slug: string | null
  author_slug: string | null
}

export async function insertSubmission(row: Omit<Partial<Submission>, 'id' | 'created_at' | 'updated_at'> & { ip_hash?: string; user_agent?: string }): Promise<Submission> {
  const res = await expectOk(await supa('/parenting_submissions', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify([row]),
  }), 'insert submission')
  const rows = await res.json()
  return rows[0]
}

export async function recentSubmissionsByEmail(email: string, hours = 24): Promise<number> {
  const since = new Date(Date.now() - hours * 3600_000).toISOString()
  const res = await expectOk(await supa(
    `/parenting_submissions?select=id&email=eq.${encodeURIComponent(email)}&created_at=gte.${encodeURIComponent(since)}`,
    { headers: { Prefer: 'count=exact' } },
  ), 'count submissions')
  const range = res.headers.get('content-range') || ''
  const n = Number(range.split('/')[1])
  return Number.isFinite(n) ? n : (await res.json()).length
}

export async function listSubmissions(limit = 500): Promise<Submission[]> {
  const res = await expectOk(await supa(`/parenting_submissions?select=*&order=created_at.desc&limit=${limit}`), 'list submissions')
  return res.json()
}

export async function patchSubmission(id: string, patch: Partial<Submission>): Promise<Submission | null> {
  const res = await expectOk(await supa(`/parenting_submissions?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(patch),
  }), 'update submission')
  const rows = await res.json()
  return rows[0] || null
}

/* --------------------------------------------------------------- outreach */

export type OutreachStatus = 'not_contacted' | 'contacted' | 'interested' | 'pitched' | 'accepted' | 'published' | 'declined' | 'do_not_contact'
export const OUTREACH_STATUSES: OutreachStatus[] = ['not_contacted', 'contacted', 'interested', 'pitched', 'accepted', 'published', 'declined', 'do_not_contact']

export interface Outreach {
  id: string
  created_at: string
  updated_at: string
  name: string
  organization: string | null
  email: string | null
  role: string | null
  relationship_source: string | null
  expertise: string | null
  suggested_topic: string | null
  status: OutreachStatus
  last_contact_at: string | null
  next_follow_up_at: string | null
  notes: string | null
  contact_preference: string | null
  do_not_contact: boolean
  submission_id: string | null
  article_slug: string | null
}

export async function listOutreach(limit = 1000): Promise<Outreach[]> {
  const res = await expectOk(await supa(`/parenting_outreach?select=*&order=updated_at.desc&limit=${limit}`), 'list outreach')
  return res.json()
}

export async function insertOutreach(row: Partial<Outreach>): Promise<Outreach> {
  const res = await expectOk(await supa('/parenting_outreach', {
    method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify([row]),
  }), 'insert outreach')
  return (await res.json())[0]
}

export async function patchOutreach(id: string, patch: Partial<Outreach>): Promise<Outreach | null> {
  const res = await expectOk(await supa(`/parenting_outreach?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH', headers: { Prefer: 'return=representation' }, body: JSON.stringify(patch),
  }), 'update outreach')
  return (await res.json())[0] || null
}

export async function deleteOutreach(id: string): Promise<void> {
  await expectOk(await supa(`/parenting_outreach?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE' }), 'delete outreach')
}

/* ------------------------------------------------------------- newsletter */

export interface Subscriber {
  id: string
  created_at: string
  email: string
  list: string
  status: 'pending' | 'confirmed' | 'unsubscribed'
  source: string | null
  source_path: string | null
  consent_at: string
  confirmed_at: string | null
  unsubscribed_at: string | null
}

export const NEWSLETTER_LIST = 'parenting-weekly'

/** Insert or re-open a subscriber row. Returns the row and whether the
 *  welcome email should go out (new, still pending, or re-subscribing).
 *  There is no confirmation step (owner decision, Nov 17, 2026): a sign-up is
 *  subscribed at once, the way the printable and quiz sign-ups always were. */
export async function upsertSubscriber(fields: { email: string; source: string; source_path: string; ip_hash: string; user_agent: string }): Promise<{ row: Subscriber; sendWelcome: boolean }> {
  const email = fields.email.toLowerCase().trim()
  const existing = await getSubscriber(email)
  if (!existing) {
    const res = await expectOk(await supa('/newsletter_subscribers', {
      method: 'POST', headers: { Prefer: 'return=representation' },
      body: JSON.stringify([{ ...fields, email, list: NEWSLETTER_LIST, status: 'confirmed', confirmed_at: new Date().toISOString() }]),
    }), 'insert subscriber')
    return { row: (await res.json())[0], sendWelcome: true }
  }
  if (existing.status === 'confirmed') return { row: existing, sendWelcome: false }
  // pending from the old confirm flow, or unsubscribed (they asked again: new consent)
  const res = await expectOk(await supa(`/newsletter_subscribers?email=eq.${encodeURIComponent(email)}`, {
    method: 'PATCH', headers: { Prefer: 'return=representation' },
    body: JSON.stringify({ status: 'confirmed', confirmed_at: new Date().toISOString(), consent_at: new Date().toISOString(), unsubscribed_at: null, source: fields.source, source_path: fields.source_path }),
  }), 'reopen subscriber')
  return { row: (await res.json())[0], sendWelcome: true }
}

export async function getSubscriber(email: string): Promise<Subscriber | null> {
  const res = await expectOk(await supa(`/newsletter_subscribers?email=eq.${encodeURIComponent(email.toLowerCase().trim())}&limit=1`), 'get subscriber')
  const rows = await res.json()
  return rows[0] || null
}

export async function setSubscriberStatus(email: string, status: Subscriber['status']): Promise<void> {
  const patch: Record<string, unknown> = { status }
  if (status === 'confirmed') patch.confirmed_at = new Date().toISOString()
  if (status === 'unsubscribed') patch.unsubscribed_at = new Date().toISOString()
  await expectOk(await supa(`/newsletter_subscribers?email=eq.${encodeURIComponent(email.toLowerCase().trim())}`, {
    method: 'PATCH', body: JSON.stringify(patch),
  }), 'update subscriber')
}

export async function listSubscribers(limit = 200): Promise<{ rows: Subscriber[]; counts: Record<string, number> }> {
  const res = await expectOk(await supa(`/newsletter_subscribers?select=*&order=created_at.desc&limit=${limit}`), 'list subscribers')
  const rows: Subscriber[] = await res.json()
  const counts: Record<string, number> = { pending: 0, confirmed: 0, unsubscribed: 0 }
  for (const s of ['pending', 'confirmed', 'unsubscribed']) {
    const r = await expectOk(await supa(`/newsletter_subscribers?select=id&status=eq.${s}`, { headers: { Prefer: 'count=exact' }, method: 'HEAD' }), 'count subscribers')
    counts[s] = Number((r.headers.get('content-range') || '').split('/')[1]) || 0
  }
  return { rows, counts }
}

/* Signed links for confirm / unsubscribe. HMAC(email + purpose), no expiry on
   unsubscribe (it must always work), 14-day expiry on confirm. */
export function newsletterToken(email: string, purpose: 'confirm' | 'unsubscribe', exp?: number): string {
  const e = email.toLowerCase().trim()
  const base = purpose === 'confirm' ? `${purpose}:${e}:${exp}` : `${purpose}:${e}`
  return createHmac('sha256', SECRET).update(base).digest('hex')
}

export function verifyNewsletterToken(email: string, purpose: 'confirm' | 'unsubscribe', token: string, exp?: number): boolean {
  if (!SECRET || !token) return false
  if (purpose === 'confirm' && (!exp || exp < Math.floor(Date.now() / 1000))) return false
  try {
    const a = Buffer.from(newsletterToken(email, purpose, exp), 'hex')
    const b = Buffer.from(token, 'hex')
    return a.length === b.length && timingSafeEqual(a, b)
  } catch {
    return false
  }
}

export function confirmUrl(email: string): string {
  const exp = Math.floor(Date.now() / 1000) + 14 * 86400
  return `https://faithfulkids.app/api/parenting/newsletter/confirm?email=${encodeURIComponent(email)}&exp=${exp}&token=${newsletterToken(email, 'confirm', exp)}`
}

export function newsletterUnsubscribeUrl(email: string): string {
  return `https://faithfulkids.app/api/parenting/newsletter/unsubscribe?email=${encodeURIComponent(email)}&token=${newsletterToken(email, 'unsubscribe')}`
}

/* ------------------------------------------------------ newsletter sends */

/* The send log for Raising Faithful Kids newsletter issues (supabase-newsletter-sends-
   migration.sql). (issue_id, email) is the primary key, so claiming a row
   before sending is what stops an issue reaching anyone twice. */

export async function listConfirmedEmails(): Promise<string[]> {
  const out: string[] = []
  for (let from = 0; ; from += 1000) {
    const res = await expectOk(await supa(`/newsletter_subscribers?select=email&status=eq.confirmed&list=eq.${NEWSLETTER_LIST}&order=created_at.asc`, {
      headers: { Range: `${from}-${from + 999}` },
    }), 'list confirmed')
    const rows: { email: string }[] = await res.json()
    out.push(...rows.map(r => r.email))
    if (rows.length < 1000) return out
  }
}

/** Claim addresses for an issue. Returns only the ones this call claimed:
 *  new rows, plus earlier failures being retried. Addresses already sent (or
 *  being sent by another press) are left out. */
export async function claimSends(issueId: string, emails: string[]): Promise<string[]> {
  if (emails.length === 0) return []
  const res = await expectOk(await supa('/newsletter_sends?on_conflict=issue_id,email', {
    method: 'POST', headers: { Prefer: 'resolution=ignore-duplicates,return=representation' },
    body: JSON.stringify(emails.map(email => ({ issue_id: issueId, email, status: 'sending' }))),
  }), 'claim sends')
  const claimed = new Set((await res.json() as { email: string }[]).map(r => r.email))
  const failed = emails.filter(e => !claimed.has(e))
  if (failed.length) {
    const list = failed.map(e => `"${e.replace(/"/g, '')}"`).join(',')
    const r = await expectOk(await supa(`/newsletter_sends?issue_id=eq.${encodeURIComponent(issueId)}&status=eq.failed&email=in.(${encodeURIComponent(list)})`, {
      method: 'PATCH', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ status: 'sending', error: null }),
    }), 'retry sends')
    for (const row of await r.json() as { email: string }[]) claimed.add(row.email)
  }
  return emails.filter(e => claimed.has(e))
}

export async function markSend(issueId: string, email: string, ok: boolean, detail: string | null): Promise<void> {
  await expectOk(await supa(`/newsletter_sends?issue_id=eq.${encodeURIComponent(issueId)}&email=eq.${encodeURIComponent(email)}`, {
    method: 'PATCH',
    body: JSON.stringify(ok ? { status: 'sent', resend_id: detail, sent_at: new Date().toISOString() } : { status: 'failed', error: (detail || '').slice(0, 500) }),
  }), 'mark send')
}

export async function sendCounts(): Promise<Record<string, Record<string, number>>> {
  const res = await expectOk(await supa('/newsletter_sends?select=issue_id,status&limit=100000'), 'send counts')
  const out: Record<string, Record<string, number>> = {}
  for (const r of await res.json() as { issue_id: string; status: string }[]) {
    out[r.issue_id] ??= { sending: 0, sent: 0, failed: 0 }
    out[r.issue_id][r.status] = (out[r.issue_id][r.status] || 0) + 1
  }
  return out
}
