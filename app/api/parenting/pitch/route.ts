import { NextResponse } from 'next/server'
import { insertSubmission, recentSubmissionsByEmail, ipHash, dbConfigured, TableMissing } from '@/lib/parenting-db'
import { sendPitchReceipt, sendPitchNotification } from '@/lib/parenting-emails'

export const dynamic = 'force-dynamic'

/*
 * Contributor pitch intake. Validates server-side regardless of what the
 * client did, stores the pitch privately, emails the editor, and sends the
 * contributor a receipt. Spam defences: honeypot field, minimum time-to-submit,
 * per-IP rate limit (per instance), and a per-email cap in the database.
 */

const hits = new Map<string, { n: number; t: number }>()
function rateLimited(ip: string): boolean {
  const now = Date.now()
  const h = hits.get(ip)
  if (!h || now - h.t > 3600_000) { hits.set(ip, { n: 1, t: now }); return false }
  h.n++
  return h.n > 5
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const ROLES = new Set([
  'Parent', 'Homeschool parent', 'Sunday school teacher', "Children's ministry director", 'Pastor',
  'Christian educator', 'Writer or creator', 'Researcher', 'Other',
])

function clean(v: unknown, max: number): string {
  return String(v ?? '').replace(/\u0000/g, '').trim().slice(0, max)
}

export async function POST(req: Request) {
  let body: Record<string, unknown>
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Bad request.' }, { status: 400 }) }

  // Honeypot: a real person never sees this field. Answer as if it worked.
  if (clean(body.website, 10)) return NextResponse.json({ ok: true })

  // Bots submit in milliseconds. A person reading the form takes longer than 4s.
  const elapsed = Number(body.elapsedMs)
  if (Number.isFinite(elapsed) && elapsed >= 0 && elapsed < 4000) return NextResponse.json({ ok: true })

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (rateLimited(ip)) return NextResponse.json({ error: 'Too many submissions from this connection. Please try again later.' }, { status: 429 })

  const name = clean(body.name, 120)
  const email = clean(body.email, 254).toLowerCase()
  const role = clean(body.role, 60)
  const topic = clean(body.topic, 160)
  const pitch = clean(body.pitch, 2000)
  const experience = clean(body.experience, 1500)
  const url = clean(body.url, 300)
  const wantsInterview = body.interview === true
  const adult = body.adult === true
  const terms = body.terms === true

  const errors: Record<string, string> = {}
  if (name.length < 2) errors.name = 'Please tell us your name.'
  if (!EMAIL_RE.test(email)) errors.email = 'Please enter a valid email address.'
  if (!ROLES.has(role)) errors.role = 'Choose the option that fits best.'
  if (topic.length < 5) errors.topic = 'Give your idea a working title.'
  if (pitch.length < 60) errors.pitch = 'A few sentences, please (at least 60 characters).'
  if (url && !/^https?:\/\/\S+\.\S+/.test(url)) errors.url = 'Links should start with http:// or https://'
  if (!adult) errors.adult = 'Contributors must be 18 or older.'
  if (!terms) errors.terms = 'Please read and accept the submission terms.'
  if (Object.keys(errors).length) return NextResponse.json({ error: 'Please check the highlighted fields.', fields: errors }, { status: 400 })

  if (!dbConfigured()) return NextResponse.json({ error: 'Submissions are not configured yet. Please email christian@faithfulkids.app instead.' }, { status: 503 })

  try {
    if (await recentSubmissionsByEmail(email, 24) >= 3) {
      return NextResponse.json({ error: 'You have already sent several pitches today. We have them; please give us a few days to reply.' }, { status: 429 })
    }
    const row = await insertSubmission({
      name, email, role, topic, pitch,
      experience: experience || null,
      url: url || null,
      wants_interview: wantsInterview,
      source: clean(body.source, 200) || '/parenting/write-for-us',
      referrer: clean(req.headers.get('referer'), 300) || null,
      ip_hash: ipHash(ip),
      user_agent: clean(req.headers.get('user-agent'), 300) || undefined,
      status: 'received',
      consent_terms_at: new Date().toISOString(),
      consent_adult: true,
    })
    // Emails are best-effort: the pitch is already stored.
    await Promise.all([
      sendPitchNotification({ id: row.id, name, email, role, topic, pitch, experience, url, wantsInterview, source: row.source }),
      sendPitchReceipt(email, name, topic, wantsInterview),
    ]).catch(err => console.error('pitch email error', err))
    return NextResponse.json({ ok: true })
  } catch (err) {
    if (err instanceof TableMissing) {
      console.error(err.message)
      return NextResponse.json({ error: 'Submissions are not configured yet. Please email christian@faithfulkids.app instead.' }, { status: 503 })
    }
    console.error('pitch error', err)
    return NextResponse.json({ error: 'Something went wrong on our side. Please try again, or email christian@faithfulkids.app.' }, { status: 500 })
  }
}
