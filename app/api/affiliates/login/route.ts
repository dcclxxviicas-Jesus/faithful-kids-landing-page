import { NextResponse } from 'next/server'
import { affiliatesByEmail, SITE_URL } from '@/lib/affiliates'
import { signLink } from '@/lib/affiliate-session'
import { signInEmail, send } from '@/lib/affiliates-emails'

export const dynamic = 'force-dynamic'

/* Emails a one-hour sign-in link to an approved affiliate. Always answers
   the same way, so the form cannot be used to test which emails belong to
   affiliates. */
const hits = new Map<string, { n: number; t: number }>()
function limited(k: string, max: number): boolean {
  const now = Date.now(), h = hits.get(k)
  if (!h || now - h.t > 3600_000) { hits.set(k, { n: 1, t: now }); return false }
  return ++h.n > max
}

export async function POST(req: Request) {
  let body: { email?: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Bad request.' }, { status: 400 }) }
  const email = String(body.email || '').trim().toLowerCase().slice(0, 254)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return NextResponse.json({ error: 'Please enter the email you applied with.' }, { status: 400 })
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (limited(`ip:${ip}`, 10) || limited(`em:${email}`, 4)) return NextResponse.json({ error: 'Too many requests. Please try again in an hour.' }, { status: 429 })

  const list = await affiliatesByEmail(email).catch(() => [])
  const a = list.find(x => x.email.toLowerCase() === email && ['active', 'paused', 'closed'].includes(x.status))
  if (a) await send(signInEmail(a, `${SITE_URL}/affiliates/signin?t=${encodeURIComponent(signLink(a.id))}`))
  return NextResponse.json({ ok: true })
}
