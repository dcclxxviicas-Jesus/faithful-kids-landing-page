import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAffiliate, patchAffiliate } from '@/lib/affiliates'
import { SESSION_COOKIE, verifySession } from '@/lib/affiliate-session'

export const dynamic = 'force-dynamic'

/* The one thing an affiliate can change themselves: where we pay them.
   Authorised by the signed session cookie. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export async function POST(req: Request) {
  const id = verifySession((await cookies()).get(SESSION_COOKIE)?.value)
  const a = id ? await getAffiliate(id).catch(() => null) : null
  if (!a || !['active', 'paused', 'closed'].includes(a.status)) return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 })
  let body: { payoutEmail?: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Bad request.' }, { status: 400 }) }
  const email = String(body.payoutEmail || '').trim().toLowerCase().slice(0, 254)
  if (!EMAIL_RE.test(email)) return NextResponse.json({ error: 'That does not look like an email address.' }, { status: 400 })
  await patchAffiliate(a.id, { payout_email: email })
  return NextResponse.json({ ok: true })
}
