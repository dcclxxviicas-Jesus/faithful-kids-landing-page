import { NextResponse } from 'next/server'
import { upsertLead, getLeadByEmail, updateLead, sendLeadEmail } from '@/lib/leads'
import { buildEmail, DRIP_SCHEDULE } from '@/lib/lead-emails'

// Basic per-IP rate limiting (per serverless instance — good enough to stop
// casual abuse; the honeypot catches the dumb bots).
const hits = new Map<string, { n: number; t: number }>()
function rateLimited(ip: string): boolean {
  const now = Date.now()
  const h = hits.get(ip)
  if (!h || now - h.t > 3600_000) {
    hits.set(ip, { n: 1, t: now })
    return false
  }
  h.n++
  return h.n > 10
}

const VALID_MAGNETS = new Set(['challenge', 'trivia-pack', 'bedtime-kit'])
const VALID_SOURCES = new Set(['blog-inline', 'blog-exit', 'quiz-exit'])
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export async function POST(req: Request) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'bad request' }, { status: 400 })
  }

  // Honeypot: real users never fill this hidden field
  if (body.website) return NextResponse.json({ ok: true })

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (rateLimited(ip)) return NextResponse.json({ error: 'too many requests' }, { status: 429 })

  const email = String(body.email || '').toLowerCase().trim()
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json({ error: 'invalid email' }, { status: 400 })
  }
  const magnet = VALID_MAGNETS.has(String(body.magnet)) ? String(body.magnet) : 'challenge'
  const source = VALID_SOURCES.has(String(body.source)) ? String(body.source) : 'blog-inline'
  const sourcePost = String(body.sourcePost || '').slice(0, 200) || null
  const quizAnswers =
    source === 'quiz-exit' && body.quizAnswers && typeof body.quizAnswers === 'object'
      ? (body.quizAnswers as Record<string, string>)
      : null

  try {
    const { created } = await upsertLead({ email, magnet, source, source_post: sourcePost, quiz_answers: quizAnswers })

    if (created) {
      const lead = await getLeadByEmail(email)
      if (lead) {
        const { subject, html } = buildEmail(lead, 1)
        const sent = await sendLeadEmail(email, subject, html)
        if (sent) {
          const next = new Date(Date.now() + DRIP_SCHEDULE[1] * 86400_000).toISOString()
          await updateLead(email, { sequence_stage: 1, next_send_at: next })
        }
      }
    }
    // Repeat subscribers just get a friendly ok — no duplicate emails
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('subscribe error:', e)
    return NextResponse.json({ error: 'something went wrong' }, { status: 500 })
  }
}
