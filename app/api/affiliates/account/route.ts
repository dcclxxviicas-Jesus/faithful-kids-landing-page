import { NextResponse } from 'next/server'
import { affiliateByToken, patchAffiliate } from '@/lib/affiliates'

export const dynamic = 'force-dynamic'

/* The one thing an affiliate can change themselves: where we pay them.
   Authorised by the private token in their stats-page link. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export async function POST(req: Request) {
  let body: { token?: string; payoutEmail?: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Bad request.' }, { status: 400 }) }
  const a = await affiliateByToken(String(body.token || '')).catch(() => null)
  if (!a || a.status === 'declined' || a.status === 'applied') return NextResponse.json({ error: 'Not found.' }, { status: 404 })
  const email = String(body.payoutEmail || '').trim().toLowerCase().slice(0, 254)
  if (!EMAIL_RE.test(email)) return NextResponse.json({ error: 'That does not look like an email address.' }, { status: 400 })
  await patchAffiliate(a.id, { payout_email: email })
  return NextResponse.json({ ok: true })
}
