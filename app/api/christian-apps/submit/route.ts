import { NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { insertAppSubmission, recentByEmail, dbConfigured, TableMissing } from '@/lib/app-directory-db'
import { sendSubmissionNotification, sendSubmissionReceipt, type SubmissionEmail } from '@/lib/app-directory-emails'
import { CATEGORIES, AGE_GROUPS, PRICE_LABEL } from '@/lib/christian-apps'

export const dynamic = 'force-dynamic'

/*
 * Christian Apps directory intake. Nothing publishes from here: every row
 * lands as 'received' for the owner to approve in /cas-admin/apps. If the
 * table does not exist yet, the submission is still emailed to team@ so it is
 * never lost. Spam defences match the Parenting pitch form: honeypot, minimum
 * time-to-submit, per-IP limit, per-email cap.
 */

const hits = new Map<string, { n: number; t: number }>()
function rateLimited(ip: string): boolean {
  const now = Date.now()
  const h = hits.get(ip)
  if (!h || now - h.t > 3600_000) { hits.set(ip, { n: 1, t: now }); return false }
  return ++h.n > 6
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const URL_RE = /^https?:\/\/[^\s]+\.[^\s]+$/
const CATS = new Set<string>(CATEGORIES.map(c => c.key))
const AGES = new Set<string>(AGE_GROUPS.map(a => a.key))
const PRICES = new Set(Object.keys(PRICE_LABEL))
const ROLES = new Set(['I made it', 'I work for the maker', 'I am a parent or user', 'Other'])

function clean(v: unknown, max: number): string {
  return String(v ?? '').replace(/\u0000/g, '').trim().slice(0, max)
}

function ipHash(ip: string): string {
  const day = new Date().toISOString().slice(0, 10)
  return createHash('sha256').update(`${process.env.DRIP_SECRET || ''}:${ip}:${day}`).digest('hex').slice(0, 32)
}

export async function POST(req: Request) {
  let body: Record<string, unknown>
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Bad request.' }, { status: 400 }) }

  if (clean(body.company_site, 10)) return NextResponse.json({ ok: true }) // honeypot
  const elapsed = Number(body.elapsedMs)
  if (Number.isFinite(elapsed) && elapsed >= 0 && elapsed < 5000) return NextResponse.json({ ok: true })

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (rateLimited(ip)) return NextResponse.json({ error: 'Too many submissions from this connection. Please try again later.' }, { status: 429 })

  const kind = body.kind === 'website' ? 'website' : 'app'
  const name = clean(body.name, 120)
  const maker = clean(body.maker, 120)
  const category = kind === 'website' ? 'websites' : clean(body.category, 40)
  const ages = clean(body.ages, 60)
  const ageGroups = Array.isArray(body.ageGroups) ? body.ageGroups.map(a => clean(a, 20)).filter(a => AGES.has(a)) : []
  const priceModel = clean(body.priceModel, 20)
  const price = clean(body.price, 160)
  const iosUrl = clean(body.iosUrl, 300)
  const androidUrl = clean(body.androidUrl, 300)
  const webUrl = clean(body.webUrl, 300)
  const description = clean(body.description, 900)
  const contactName = clean(body.contactName, 120)
  const contactEmail = clean(body.contactEmail, 254).toLowerCase()
  const contactRole = clean(body.contactRole, 60)
  const notes = clean(body.notes, 1000)

  const errors: Record<string, string> = {}
  if (name.length < 2) errors.name = 'What is it called?'
  if (!CATS.has(category)) errors.category = 'Choose the closest category.'
  if (!PRICES.has(priceModel)) errors.priceModel = 'Choose how it is priced.'
  if (!ageGroups.length) errors.ageGroups = 'Choose at least one age group.'
  for (const [k, v] of [['iosUrl', iosUrl], ['androidUrl', androidUrl], ['webUrl', webUrl]] as const) {
    if (v && !URL_RE.test(v)) errors[k] = 'Links should start with https://'
  }
  if (iosUrl && !/apps\.apple\.com/.test(iosUrl)) errors.iosUrl = 'This should be an apps.apple.com link.'
  if (androidUrl && !/play\.google\.com/.test(androidUrl)) errors.androidUrl = 'This should be a play.google.com link.'
  if (kind === 'app' && !iosUrl && !androidUrl && !webUrl) errors.iosUrl = 'Add at least one store link or a web address.'
  if (kind === 'website' && !webUrl) errors.webUrl = 'Add the website address.'
  if (description.length < 60) errors.description = 'A few sentences, please (at least 60 characters).'
  if (contactName.length < 2) errors.contactName = 'Please tell us your name.'
  if (!EMAIL_RE.test(contactEmail)) errors.contactEmail = 'Please enter a valid email address.'
  if (!ROLES.has(contactRole)) errors.contactRole = 'Choose the option that fits best.'
  if (body.confirm !== true) errors.confirm = 'Please confirm the details are accurate.'
  if (Object.keys(errors).length) return NextResponse.json({ error: 'Please check the highlighted fields.', fields: errors }, { status: 400 })

  const mail: SubmissionEmail = {
    id: null, kind, name, maker, category, ages, priceModel, price, iosUrl, androidUrl, webUrl,
    description, contactName, contactEmail, contactRole, notes,
  }

  let stored = false
  if (dbConfigured()) {
    try {
      if (await recentByEmail(contactEmail, 24) >= 5) {
        return NextResponse.json({ error: 'We already have several submissions from you today. We will review them soon.' }, { status: 429 })
      }
      const row = await insertAppSubmission({
        kind, name, maker: maker || null, category: category as never, ages: ages || null, age_groups: ageGroups as never,
        price_model: priceModel as never, price: price || null,
        ios_url: iosUrl || null, android_url: androidUrl || null, web_url: webUrl || null,
        description, contact_name: contactName, contact_email: contactEmail, contact_role: contactRole,
        notes_from_submitter: notes || null, status: 'received',
        source: clean(body.source, 200) || '/christian-apps/submit',
        referrer: clean(req.headers.get('referer'), 300) || null,
        ip_hash: ipHash(ip), user_agent: clean(req.headers.get('user-agent'), 300) || undefined,
      })
      mail.id = row.id
      stored = true
    } catch (err) {
      if (!(err instanceof TableMissing)) console.error('app submission store error', err)
      else console.error(err.message)
    }
  }

  // The notification is the fallback record when the table is missing, so a
  // failed send there is a real failure for the submitter.
  const notified = await sendSubmissionNotification(mail, stored).catch(e => { console.error(e); return false })
  if (!stored && !notified) {
    return NextResponse.json({ error: 'Something went wrong on our side. Please email team@faithfulkids.app with the details.' }, { status: 500 })
  }
  await sendSubmissionReceipt(contactEmail, contactName, name).catch(e => console.error('receipt error', e))
  return NextResponse.json({ ok: true })
}
