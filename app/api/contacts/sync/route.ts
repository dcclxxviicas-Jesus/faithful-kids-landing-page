import { NextResponse, after } from 'next/server'
import { syncEmail } from '@/lib/resend-contacts'

/* Called by the app (bible-kids src/lib/contact-sync.ts) when a family's
   status changes, so the Resend audience copy updates right away.
   POST {email} with Authorization: Bearer CONTACT_SYNC_SECRET. */
export async function POST(req: Request) {
  const secret = process.env.CONTACT_SYNC_SECRET
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  let email = ''
  try { email = String((await req.json()).email || '').toLowerCase().trim() } catch { /* fall through */ }
  if (!email || email.length > 254 || !email.includes('@')) return NextResponse.json({ error: 'bad request' }, { status: 400 })
  after(() => syncEmail(email))
  return NextResponse.json({ ok: true }, { status: 202 })
}
