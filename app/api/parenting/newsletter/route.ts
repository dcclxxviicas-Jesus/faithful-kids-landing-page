import { NextResponse, after } from 'next/server'
import { syncEmail } from '@/lib/resend-contacts'
import { upsertSubscriber, ipHash, dbConfigured, TableMissing } from '@/lib/parenting-db'
import { sendNewsletterWelcome } from '@/lib/parenting-emails'

export const dynamic = 'force-dynamic'

/*
 * Parenting newsletter signup. No confirmation step (owner decision, Nov 17,
 * 2026): a sign-up is subscribed at once and gets the welcome email. An
 * address that is already subscribed gets a quiet ok (no duplicate email, no
 * information leak about who is subscribed).
 */

const hits = new Map<string, { n: number; t: number }>()
function rateLimited(ip: string): boolean {
  const now = Date.now()
  const h = hits.get(ip)
  if (!h || now - h.t > 3600_000) { hits.set(ip, { n: 1, t: now }); return false }
  h.n++
  return h.n > 10
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export async function POST(req: Request) {
  let body: Record<string, unknown>
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Bad request.' }, { status: 400 }) }
  if (body.website) return NextResponse.json({ ok: true })

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (rateLimited(ip)) return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })

  const email = String(body.email || '').toLowerCase().trim()
  if (!EMAIL_RE.test(email) || email.length > 254) return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
  const source = String(body.source || 'parenting').slice(0, 80)
  const sourcePath = String(body.path || '').slice(0, 200)

  if (!dbConfigured()) return NextResponse.json({ error: 'Signup is not available yet.' }, { status: 503 })

  try {
    const { sendWelcome } = await upsertSubscriber({
      email, source, source_path: sourcePath, ip_hash: ipHash(ip),
      user_agent: (req.headers.get('user-agent') || '').slice(0, 300),
    })
    if (sendWelcome) await sendNewsletterWelcome(email)
    after(() => syncEmail(email))
    return NextResponse.json({ ok: true })
  } catch (err) {
    if (err instanceof TableMissing) {
      console.error(err.message)
      return NextResponse.json({ error: 'Signup is not available yet.' }, { status: 503 })
    }
    console.error('newsletter error', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
