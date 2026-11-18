/* Resend Audience mirror (Nov 17, 2026, owner request).

   Supabase stays the source of truth: the drip, trial and lifecycle emails
   read leads / families / newsletter_subscribers and nothing here changes
   that. This file copies everyone we may email into Resend Contacts so the
   list can be seen, exported and broadcast to from the Resend dashboard.

   The free Resend plan allows THREE segments (owner chose to stay free, Nov
   17, 2026), so the broad groups are segments (Leads, Newsletter, Customers)
   and the detail rides on each contact as properties:
     came_from  Printable / Quiz / Newsletter / App sign-up (comma-joined)
     status     Lead / Never paid / Free trial / Paying / Payment failed / Canceled
     bought_on  Web / App / Web and App
     printable  which freebie they asked for
   If the plan is ever upgraded, more segments can be added to SEGMENTS.

   - New leads and newsletter sign-ups are pushed the moment they arrive, and
     unsubscribes the moment they happen (syncEmail, from those routes).
   - Customer status changes happen in the app's Stripe / RevenueCat webhooks,
     which call /api/contacts/sync for that address.
   - The daily reconcile runs FIRST inside the drip cron as the safety net. It
     fixes segment membership for everyone; Resend's list endpoints do not
     return properties, so it rewrites the properties of a seventh of the
     contacts each day.
   - Unsubscribes travel both ways and only ever towards "unsubscribed":
     Supabase -> Resend on every push, Resend -> Supabase on the daily
     reconcile (someone who unsubscribes from a Broadcast is taken off every
     Supabase list before that day's drip sends). Nothing here re-subscribes.
   - Free church accounts (gifted: active, no Stripe, no app-store purchase)
     are left out on purpose: they never opted into email and would blow
     through the free plan's 1,000-contact cap.

   Only the segments named in SEGMENTS are managed; anything made by hand in
   the dashboard is left alone. */

import { familyUnsubscribed, unsubscribeFamilies, updateLead } from '@/lib/leads'

const RESEND = 'https://api.resend.com'
const KEY = () => process.env.RESEND_CONTACTS_KEY || ''
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY
const RC_KEY = () => process.env.REVENUECAT_V2_KEY || ''
const RC_PROJECT = 'proj93f8232b'

export const SEGMENTS = {
  leads: 'Leads',           // printable + quiz sign-ups, and app sign-ups who never paid
  newsletter: 'Newsletter', // Raising Faithful Kids subscribers
  customers: 'Customers',   // anyone who has paid: paying, trial, failed payment, canceled
} as const
type SegKey = keyof typeof SEGMENTS
const MANAGED = new Set<string>(Object.values(SEGMENTS))

/* The first build created per-source segments before the 3-segment cap was
   known; they are renamed into place rather than deleted. */
const RENAME: Record<string, string> = { 'Printable leads': 'Leads', 'Quiz leads': 'Customers', General: 'Newsletter' }

const PROPS = ['came_from', 'status', 'bought_on', 'printable'] as const
type Props = Record<(typeof PROPS)[number], string>

const PRINTABLE_NAMES: Record<string, string> = {
  advent: 'Advent', 'trivia-pack': 'Trivia Pack', 'coloring-pages': 'Coloring Pages',
  'bedtime-kit': 'Bedtime Kit', challenge: '30-Day Challenge', 'quiz-plan': 'Quiz plan',
}
const STATUS_RANK = ['', 'Lead', 'Never paid', 'Canceled', 'Payment failed', 'Free trial', 'Paying']

/* An app-store buyer's family row looks exactly like a gifted church account
   (active, no Stripe id), so RevenueCat is asked. Anyone already in the
   Customers segment counts as known (that membership is the cache);
   otherwise only families created in the last week are checked daily. */
const RC_RECHECK_DAYS = 7

interface Desired {
  email: string
  firstName: string | null
  segments: Set<string>
  unsubscribed: boolean
  cameFrom: Set<string>
  status: string
  boughtOn: Set<string>
  printable: string
}
interface Current {
  id: string
  unsubscribed: boolean
  firstName: string | null
  segments: Set<string>
}

/* ---------- HTTP ---------- */

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
let lastCall = 0
async function resend(path: string, init: RequestInit = {}): Promise<Response> {
  // Resend allows 10 requests/second for the whole team, and the drip sends
  // through the same team. Stay well under it.
  for (let attempt = 0; attempt < 5; attempt++) {
    const wait = lastCall + 220 - Date.now()
    if (wait > 0) await sleep(wait)
    lastCall = Date.now()
    const res = await fetch(`${RESEND}${path}`, {
      ...init,
      headers: { Authorization: `Bearer ${KEY()}`, 'Content-Type': 'application/json', 'User-Agent': 'faithfulkids-sync', ...(init.headers || {}) },
    })
    if (res.status !== 429) return res
    await sleep(1000 * (attempt + 1))
  }
  throw new Error(`resend ${path}: rate limited`)
}

async function supaAll<T>(query: string): Promise<T[]> {
  if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error('Supabase env missing')
  const out: T[] = []
  for (let off = 0; ; off += 1000) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${query}`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, Range: `${off}-${off + 999}` },
    })
    if (!res.ok) throw new Error(`supabase ${query.split('?')[0]}: ${res.status}`)
    const rows = (await res.json()) as T[]
    out.push(...rows)
    if (rows.length < 1000) return out
  }
}

async function boughtInApp(familyId: string): Promise<boolean> {
  if (!RC_KEY()) return false
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(`https://api.revenuecat.com/v2/projects/${RC_PROJECT}/customers/${familyId}/subscriptions`, {
        headers: { Authorization: `Bearer ${RC_KEY()}` },
      })
      if (res.status === 404) return false
      if (res.status === 429) { await sleep(2000); continue }
      if (!res.ok) return false
      const body = await res.json()
      return Array.isArray(body.items) && body.items.length > 0
    } catch {
      await sleep(500)
    }
  }
  return false
}

/* ---------- segments + properties ---------- */

let segIds: Map<string, string> | null = null
async function segmentIds(): Promise<Map<string, string>> {
  if (segIds) return segIds
  const res = await resend('/segments')
  if (!res.ok) throw new Error(`list segments: ${res.status}`)
  const have = new Map<string, string>(((await res.json()).data || []).map((s: { name: string; id: string }) => [s.name, s.id]))
  for (const [from, to] of Object.entries(RENAME)) {
    const id = have.get(from)
    if (!id || have.has(to)) continue
    const r = await resend(`/segments/${id}`, { method: 'PATCH', body: JSON.stringify({ name: to }) })
    if (r.ok) { have.delete(from); have.set(to, id) }
  }
  for (const name of MANAGED) {
    if (have.has(name)) continue
    const r = await resend('/segments', { method: 'POST', body: JSON.stringify({ name }) })
    if (!r.ok) throw new Error(`create segment ${name}: ${r.status} ${await r.text()}`)
    have.set(name, (await r.json()).id)
  }
  // Contact properties must exist before a contact can carry them.
  const pr = await resend('/contact-properties')
  const haveProps = new Set<string>(pr.ok ? ((await pr.json()).data || []).map((p: { key: string }) => p.key) : [])
  for (const key of PROPS) {
    if (haveProps.has(key)) continue
    const r = await resend('/contact-properties', { method: 'POST', body: JSON.stringify({ key, type: 'string' }) })
    if (!r.ok) throw new Error(`create property ${key}: ${r.status} ${await r.text()}`)
  }
  segIds = have
  return have
}

function propsOf(d: Desired): Props {
  return {
    came_from: [...d.cameFrom].join(', '),
    status: d.status,
    bought_on: d.boughtOn.size === 2 ? 'Web and App' : [...d.boughtOn][0] || '',
    printable: d.printable,
  }
}

/* ---------- what each address should look like ---------- */

interface LeadRow { email: string; magnet: string; unsubscribed: boolean }
interface FamilyRow {
  id: string; parent_email: string | null; parent_name: string | null; created_at: string
  subscription_status: string | null; stripe_customer_id: string | null; subscription_id: string | null
  email_notifications: unknown
}
interface NewsRow { email: string; status: string }

const norm = (e: string) => e.toLowerCase().trim()

function firstNameOf(name: string | null): string | null {
  const n = (name || '').trim().split(/\s+/)[0]
  return n && n.length <= 40 ? n : null
}

/* knownApp: addresses already in Customers (no need to ask RevenueCat again).
   rcFor: whether to ask RevenueCat about this family. */
async function buildDesired(
  leads: LeadRow[], families: FamilyRow[], news: NewsRow[],
  knownApp: Set<string>, rcFor: (f: FamilyRow) => boolean,
): Promise<Map<string, Desired>> {
  const out = new Map<string, Desired>()
  const get = (email: string) => {
    const e = norm(email)
    let d = out.get(e)
    if (!d) {
      d = { email: e, firstName: null, segments: new Set(), unsubscribed: false, cameFrom: new Set(), status: '', boughtOn: new Set(), printable: '' }
      out.set(e, d)
    }
    return d
  }
  const add = (d: Desired, k: SegKey) => d.segments.add(SEGMENTS[k])
  const setStatus = (d: Desired, s: string) => { if (STATUS_RANK.indexOf(s) > STATUS_RANK.indexOf(d.status)) d.status = s }

  for (const l of leads) {
    const d = get(l.email)
    add(d, 'leads')
    d.cameFrom.add(l.magnet === 'quiz-plan' ? 'Quiz' : 'Printable')
    d.printable = PRINTABLE_NAMES[l.magnet] || l.magnet
    setStatus(d, 'Lead')
    if (l.unsubscribed) d.unsubscribed = true
  }
  for (const n of news) {
    if (n.status !== 'confirmed') continue
    const d = get(n.email)
    add(d, 'newsletter')
    d.cameFrom.add('Newsletter')
    setStatus(d, 'Lead')
  }
  for (const f of families) {
    if (!f.parent_email) continue
    const status = f.subscription_status || 'none'
    const email = norm(f.parent_email)
    // Comped accounts ('comp:lifetime' etc.) were given the product free:
    // not customers, and not opted into email, so they are left out.
    if ((f.subscription_id || '').startsWith('comp')) continue
    // Some web buyers carry the Stripe subscription id without the customer id.
    let paid = !!f.stripe_customer_id || (f.subscription_id || '').startsWith('sub_')
    let app = false
    if (!paid && status !== 'none') {
      app = (knownApp.has(email) && !families.some((x) => x !== f && (x.stripe_customer_id || (x.subscription_id || '').startsWith('sub_')) && norm(x.parent_email || '') === email))
        || (rcFor(f) && (await boughtInApp(f.id)))
      paid = app
    }
    if (status === 'none') {
      const d = get(email)
      d.cameFrom.add('App sign-up')
      add(d, 'leads')
      setStatus(d, 'Never paid')
      d.firstName ||= firstNameOf(f.parent_name)
      if (familyUnsubscribed(f.email_notifications)) d.unsubscribed = true
      continue
    }
    if (!paid) continue // free church / comp account: not mirrored
    const d = get(email)
    d.firstName ||= firstNameOf(f.parent_name)
    add(d, 'customers')
    d.cameFrom.add('App sign-up')
    d.boughtOn.add(app ? 'App' : 'Web')
    setStatus(d, ({ active: 'Paying', trialing: 'Free trial', past_due: 'Payment failed', canceled: 'Canceled' } as Record<string, string>)[status] || 'Paying')
    if (familyUnsubscribed(f.email_notifications)) d.unsubscribed = true
  }
  // Someone who has paid is a customer, not a lead, whatever else they signed up for.
  for (const d of out.values()) if (d.segments.has(SEGMENTS.customers)) d.segments.delete(SEGMENTS.leads)
  // Drop addresses Resend would reject.
  for (const e of out.keys()) if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e) || /\.@|^\.|\.\./.test(e)) out.delete(e)
  return out
}

/* ---------- push ---------- */

async function push(d: Desired, cur: Current | undefined, ids: Map<string, string>, refreshProps: boolean): Promise<'created' | 'updated' | 'same'> {
  if (!cur) {
    if (!d.segments.size) return 'same' // nothing to file them under
    const body: Record<string, unknown> = {
      email: d.email,
      unsubscribed: d.unsubscribed,
      segments: [...d.segments].map((n) => ({ id: ids.get(n) })).filter((s) => s.id),
      properties: propsOf(d),
    }
    if (d.firstName) body.first_name = d.firstName
    const r = await resend('/contacts', { method: 'POST', body: JSON.stringify(body) })
    if (!r.ok) throw new Error(`create ${d.email}: ${r.status} ${await r.text()}`)
    return 'created'
  }
  let changed = false
  const patch: Record<string, unknown> = {}
  if (d.unsubscribed && !cur.unsubscribed) patch.unsubscribed = true // never the other way
  if (d.firstName && !cur.firstName) patch.first_name = d.firstName
  const segChange = [...MANAGED].some((n) => d.segments.has(n) !== cur.segments.has(n))
  if (refreshProps || segChange) patch.properties = propsOf(d)
  if (Object.keys(patch).length) {
    const r = await resend(`/contacts/${cur.id}`, { method: 'PATCH', body: JSON.stringify(patch) })
    if (!r.ok) throw new Error(`update ${d.email}: ${r.status} ${await r.text()}`)
    if (patch.unsubscribed || patch.first_name || segChange) changed = true
  }
  for (const name of MANAGED) {
    const want = d.segments.has(name)
    if (want === cur.segments.has(name)) continue
    const id = ids.get(name)
    if (!id) continue
    const r = await resend(`/contacts/${cur.id}/segments/${id}`, { method: want ? 'POST' : 'DELETE' })
    if (!r.ok && r.status !== 404) throw new Error(`${want ? 'add' : 'remove'} ${d.email} ${name}: ${r.status}`)
    changed = true
  }
  return changed ? 'updated' : 'same'
}

/* ---------- Resend -> Supabase unsubscribes ---------- */

async function applyUnsubscribe(email: string, inLeads: boolean, inNews: boolean): Promise<void> {
  const jobs: Promise<unknown>[] = [unsubscribeFamilies(email)]
  if (inLeads) jobs.push(updateLead(email, { unsubscribed: true, next_send_at: null }))
  if (inNews && SUPABASE_URL && SUPABASE_KEY) {
    jobs.push(fetch(`${SUPABASE_URL}/rest/v1/newsletter_subscribers?email=eq.${encodeURIComponent(email)}`, {
      method: 'PATCH',
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'unsubscribed', unsubscribed_at: new Date().toISOString() }),
    }))
  }
  await Promise.all(jobs)
}

function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

/* ---------- full reconcile (daily, and the first import) ---------- */

export async function reconcileContacts(opts: { budgetMs?: number; full?: boolean; dry?: boolean } = {}) {
  const started = Date.now()
  const budget = opts.budgetMs ?? 90_000
  if (!KEY()) return { skipped: 'RESEND_CONTACTS_KEY not set' }
  const ids = opts.dry ? new Map<string, string>() : await segmentIds()

  // Everything Resend holds now.
  const current = new Map<string, Current>()
  let after = ''
  for (;;) {
    const r = await resend(`/contacts?limit=100${after ? `&after=${after}` : ''}`)
    if (!r.ok) throw new Error(`list contacts: ${r.status}`)
    const body = await r.json()
    for (const c of body.data || []) current.set(norm(c.email), { id: c.id, unsubscribed: !!c.unsubscribed, firstName: c.first_name || null, segments: new Set() })
    if (!body.has_more || !body.data?.length) break
    after = body.data[body.data.length - 1].id
  }
  for (const [name, id] of ids) {
    if (!MANAGED.has(name)) continue
    const r = await resend(`/segments/${id}/contacts`)
    if (!r.ok) throw new Error(`list ${name}: ${r.status}`)
    for (const c of (await r.json()).data || []) current.get(norm(c.email))?.segments.add(name)
  }

  const [leads, families, news] = await Promise.all([
    supaAll<LeadRow>('leads?select=email,magnet,unsubscribed'),
    supaAll<FamilyRow>('families?select=id,parent_email,parent_name,created_at,subscription_status,stripe_customer_id,subscription_id,email_notifications'),
    supaAll<NewsRow>('newsletter_subscribers?select=email,status'),
  ])
  const knownApp = new Set([...current].filter(([, c]) => c.segments.has(SEGMENTS.customers)).map(([e]) => e))
  const recent = Date.now() - RC_RECHECK_DAYS * 86400_000
  const desired = await buildDesired(leads, families, news, knownApp,
    (f) => !!opts.full || Date.parse(f.created_at) >= recent)

  // 1. Pull: unsubscribed in Resend (a Broadcast unsubscribe) wins.
  const leadEmails = new Set(leads.map((l) => norm(l.email)))
  const newsEmails = new Set(news.filter((n) => n.status !== 'unsubscribed').map((n) => norm(n.email)))
  let pulled = 0
  for (const [email, c] of current) {
    const d = desired.get(email)
    if (!c.unsubscribed || !d || d.unsubscribed) continue
    if (!opts.dry) await applyUnsubscribe(email, leadEmails.has(email), newsEmails.has(email))
    d.unsubscribed = true
    d.segments.delete(SEGMENTS.newsletter)
    pulled++
  }

  // 2. Push.
  const counts = { created: 0, updated: 0, same: 0, failed: 0, pulledUnsubscribes: pulled, outOfTime: 0 }
  const day = Math.floor(Date.now() / 86400_000)
  for (const d of desired.values()) {
    if (Date.now() - started > budget) { counts.outOfTime++; continue }
    if (opts.dry) { counts[current.has(d.email) ? 'same' : 'created']++; continue }
    try {
      // Properties cannot be read back cheaply, so a seventh of the list is
      // rewritten each day (all of it on a full run).
      const refresh = !!opts.full || hash(d.email) % 7 === day % 7
      counts[await push(d, current.get(d.email), ids, refresh)]++
    } catch (e) {
      counts.failed++
      console.error('contact sync:', e instanceof Error ? e.message : e)
    }
  }
  // 3. Anyone no longer on any list (e.g. an account later marked comped)
  //    leaves our segments. The contact itself stays, so an unsubscribe
  //    recorded on it is never lost.
  let removed = 0
  for (const [email, c] of current) {
    if (desired.has(email) || opts.dry) continue
    for (const name of c.segments) {
      if (Date.now() - started > budget) break
      const id = ids.get(name)
      if (!id) continue
      const r = await resend(`/contacts/${c.id}/segments/${id}`, { method: 'DELETE' })
      if (r.ok) removed++
    }
  }

  const bySegment: Record<string, number> = {}
  const byStatus: Record<string, number> = {}
  let unsubscribed = 0
  for (const d of desired.values()) {
    for (const s of d.segments) bySegment[s] = (bySegment[s] || 0) + 1
    byStatus[d.status || '(none)'] = (byStatus[d.status || '(none)'] || 0) + 1
    if (d.unsubscribed) unsubscribed++
  }
  return { ...counts, removedFromSegments: removed, contacts: desired.size, unsubscribed, bySegment, byStatus, ms: Date.now() - started }
}

/* ---------- one address, right after a sign-up or status change ---------- */

export async function syncEmail(email: string): Promise<void> {
  try {
    if (!KEY()) return
    const e = norm(email)
    const q = encodeURIComponent(e)
    const [leads, families, news] = await Promise.all([
      supaAll<LeadRow>(`leads?select=email,magnet,unsubscribed&email=eq.${q}`),
      supaAll<FamilyRow>(`families?select=id,parent_email,parent_name,created_at,subscription_status,stripe_customer_id,subscription_id,email_notifications&parent_email=ilike.${q}`),
      supaAll<NewsRow>(`newsletter_subscribers?select=email,status&email=eq.${q}`),
    ])
    const ids = await segmentIds()
    let cur: Current | undefined
    const r = await resend(`/contacts/${q}`)
    if (r.ok) {
      const c = await r.json()
      cur = { id: c.id, unsubscribed: !!c.unsubscribed, firstName: c.first_name || null, segments: new Set() }
      const s = await resend(`/contacts/${c.id}/segments`)
      if (s.ok) for (const seg of (await s.json()).data || []) cur.segments.add(seg.name)
    }
    const desired = await buildDesired(leads, families, news, new Set(), () => true)
    const d = desired.get(e)
    if (!d) return
    // An unsubscribe made in Resend is never undone here.
    if (cur?.unsubscribed) d.unsubscribed = true
    await push(d, cur, ids, true)
  } catch (err) {
    console.error('syncEmail failed:', err instanceof Error ? err.message : err)
  }
}
