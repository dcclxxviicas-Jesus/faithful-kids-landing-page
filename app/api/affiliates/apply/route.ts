import { NextResponse } from 'next/server'
import {
  TERMS, dbConfigured, insertAffiliate, affiliatesByEmail, ipHash, TableMissing, type Affiliate,
} from '@/lib/affiliates'
import { applicationReceipt, teamNotification, send } from '@/lib/affiliates-emails'

export const dynamic = 'force-dynamic'

/*
 * Affiliate application intake (/affiliates form). Nothing is approved here:
 * every row lands as 'applied' for the owner to review in
 * /cas-admin/affiliates. Accepting the terms checkbox records the terms
 * version and time (clickwrap). If the table does not exist yet the
 * application is still emailed to team@ so it is never lost. Spam defences
 * match the other forms: honeypot, minimum time-to-submit, per-IP limit.
 */

const hits = new Map<string, { n: number; t: number }>()
function rateLimited(ip: string): boolean {
  const now = Date.now()
  const h = hits.get(ip)
  if (!h || now - h.t > 3600_000) { hits.set(ip, { n: 1, t: now }); return false }
  return ++h.n > 5
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const clean = (v: unknown, max: number) => String(v ?? '').replace(/\u0000/g, '').trim().slice(0, max)

export async function POST(req: Request) {
  let body: Record<string, unknown>
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Bad request.' }, { status: 400 }) }

  if (clean(body.company_site, 10)) return NextResponse.json({ ok: true }) // honeypot
  const elapsed = Number(body.elapsedMs)
  if (Number.isFinite(elapsed) && elapsed >= 0 && elapsed < 4000) return NextResponse.json({ ok: true })

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (rateLimited(ip)) return NextResponse.json({ error: 'Too many applications from this connection. Please try again later.' }, { status: 429 })

  const name = clean(body.name, 120)
  const email = clean(body.email, 254).toLowerCase()
  const website = clean(body.website, 600)
  const audience = clean(body.audience, 1200)
  const plan = clean(body.plan, 1500)
  const country = clean(body.country, 60)

  const errors: Record<string, string> = {}
  if (name.length < 2) errors.name = 'Please add your name.'
  if (!EMAIL_RE.test(email)) errors.email = 'Please add an email we can reply to.'
  if (website.length < 4) errors.website = 'Where do you publish? A link or handle is enough.'
  if (audience.length < 10) errors.audience = 'A sentence about who follows you helps us reply well.'
  if (plan.length < 10) errors.plan = 'A sentence about how you would share Faithful Kids.'
  if (!country) errors.country = 'Choose where you live (we need it for tax forms).'
  if (body.agree !== true) errors.agree = 'Please read and accept the program terms.'
  if (Object.keys(errors).length) return NextResponse.json({ error: 'A few details need a look.', fields: errors }, { status: 400 })

  const draft = {
    name, email, website, audience, plan, country,
    status: 'applied' as const,
    terms_version: TERMS.version,
    terms_accepted_at: new Date().toISOString(),
    source: clean(body.source, 200) || '/affiliates',
    ip_hash: ipHash(ip),
  }

  let stored = false
  let row: Affiliate = { ...draft, id: '', created_at: draft.terms_accepted_at } as unknown as Affiliate
  if (dbConfigured()) {
    try {
      const prior = await affiliatesByEmail(email)
      const open = prior.find(p => p.status === 'applied' || p.status === 'active')
      if (open) {
        return NextResponse.json({
          error: open.status === 'active'
            ? 'You are already an approved affiliate. Your link is in the welcome email; reply to it if you cannot find it.'
            : 'We already have an application from this email and will reply soon.',
        }, { status: 409 })
      }
      row = await insertAffiliate(draft)
      stored = true
    } catch (e) {
      if (!(e instanceof TableMissing)) console.error('affiliate insert failed', e)
    }
  }

  const notified = await send(teamNotification(row, stored), email)
  if (!stored && !notified) return NextResponse.json({ error: 'Something went wrong on our side. Please email team@faithfulkids.app instead.' }, { status: 500 })
  await send(applicationReceipt(row))
  return NextResponse.json({ ok: true })
}
