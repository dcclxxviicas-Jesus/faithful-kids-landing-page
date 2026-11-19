import { createHash, randomBytes } from 'crypto'

/*
 * Faithful Kids affiliate program: terms + data access.
 *
 * PROGRAM TERMS (owner decisions, Nov 19, 2026). Every page, email and the
 * ledger read these constants, so a change here changes all of them. Do not
 * change one without Cas's word, and tell the aeo session when the public
 * terms change (it tracks how LLMs quote /affiliates).
 *   - 50% of what the customer actually pays, on web (Stripe) subscriptions
 *   - for the first 12 months from that customer's first payment
 *   - 30-day hold, then paid monthly on the 15th by PayPal, $25 minimum
 *   - no audience discount; App Store and Google Play purchases do not count
 *   - 30-day last-click link window (Claude's default, flagged to Cas)
 *
 * Talks to Supabase via PostgREST with the service key, no SDK (matches
 * lib/leads.ts). All tables are RLS-on with no policies.
 */

export const TERMS = {
  version: '2026-11-19',
  ratePct: 50,
  months: 12,
  // A payment counts while it is within this many days of the first payment.
  // 360, not 365: a monthly customer's 13th charge and an annual customer's
  // first renewal both land on day ~365 and are outside "the first 12 months".
  windowDays: 360,
  holdDays: 30,
  payoutDay: 15,
  minimumCents: 2500,
  cookieDays: 30,
} as const

export const SITE_URL = 'https://faithfulkids.app'
export const REF_COOKIE = 'fk_aff'
export const CODE_RE = /^[a-z0-9][a-z0-9-]{1,30}[a-z0-9]$/

export const linkFor = (code: string) => `${SITE_URL}/r/${code}`
export const accountUrl = (token: string) => `${SITE_URL}/affiliates/account/${token}`

export function money(cents: number): string {
  const neg = cents < 0
  const v = Math.abs(cents) / 100
  return `${neg ? '-' : ''}$${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/** The next payout date (the 15th) on or after `from`, as a Date at 12:00 UTC. */
export function nextPayoutDate(from = new Date()): Date {
  const y = from.getUTCFullYear(), m = from.getUTCMonth()
  const thisMonth = new Date(Date.UTC(y, m, TERMS.payoutDay, 12))
  return from.getTime() <= thisMonth.getTime() ? thisMonth : new Date(Date.UTC(y, m + 1, TERMS.payoutDay, 12))
}

export function fmtDate(d: string | Date | null | undefined): string {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'America/New_York' })
}

/** The cookie Domain: shared by faithfulkids.app and app.faithfulkids.app in production. */
export function cookieDomain(host: string | null): string | undefined {
  return host && /(^|\.)faithfulkids\.app$/.test(host.split(':')[0]) ? '.faithfulkids.app' : undefined
}

/** Read the affiliate code from a Cookie header (used by both checkout routes). */
export function refFromCookieHeader(cookie: string | null): string | null {
  if (!cookie) return null
  const m = cookie.match(new RegExp(`(?:^|;\\s*)${REF_COOKIE}=([^;]+)`))
  if (!m) return null
  const v = decodeURIComponent(m[1]).toLowerCase()
  return CODE_RE.test(v) ? v : null
}

export function newToken(): string {
  return randomBytes(24).toString('base64url')
}

export function ipHash(ip: string): string {
  const day = new Date().toISOString().slice(0, 10)
  return createHash('sha256').update(`${process.env.DRIP_SECRET || ''}:aff:${ip}:${day}`).digest('hex').slice(0, 32)
}

/** A readable default code from a name: "Sarah Jones" -> "sarahjones". */
export function suggestCode(name: string): string {
  const base = name.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '').slice(0, 24)
  return base.length >= 3 ? base : `fk${base}${randomBytes(2).toString('hex')}`
}

// ---------------------------------------------------------------- types

export type AffiliateStatus = 'applied' | 'active' | 'declined' | 'paused' | 'closed'

export interface Affiliate {
  id: string
  created_at: string
  updated_at: string
  status: AffiliateStatus
  name: string
  email: string
  website: string | null
  audience: string | null
  plan: string | null
  country: string | null
  code: string | null
  token: string | null
  payout_method: string
  payout_email: string | null
  tax_form: 'none' | 'w9' | 'w8ben' | 'w8bene'
  tax_form_received_at: string | null
  terms_version: string | null
  terms_accepted_at: string | null
  approved_at: string | null
  decided_at: string | null
  admin_notes: string | null
  source: string | null
}

export interface Referral {
  subscription_id: string
  affiliate_id: string
  customer_id: string | null
  customer_email: string | null
  plan: string | null
  sub_status: string | null
  started_at: string | null
  first_paid_at: string | null
  flag: string | null
}

export interface Commission {
  id: string
  key: string
  kind: 'sale' | 'adjustment'
  affiliate_id: string
  subscription_id: string | null
  invoice_id: string
  payment_intent: string | null
  amount_paid_cents: number
  refunded_cents: number
  commission_cents: number
  charged_at: string
  payable_at: string
  status: 'pending' | 'payable' | 'paid' | 'void'
  void_reason: string | null
  payout_id: string | null
}

export interface Payout {
  id: string
  created_at: string
  affiliate_id: string
  amount_cents: number
  method: string
  sent_to: string | null
  reference: string | null
  note: string | null
}

// ---------------------------------------------------------------- db

export class TableMissing extends Error {}

export function dbConfigured(): boolean {
  return !!(process.env.SUPABASE_URL && process.env.SUPABASE_SECRET_KEY)
}

export async function supa(path: string, init: RequestInit = {}): Promise<Response> {
  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SECRET_KEY
  if (!url || !key) throw new Error('Supabase env missing')
  const res = await fetch(`${url}/rest/v1${path}`, {
    ...init,
    cache: 'no-store',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  })
  if (res.status === 404) {
    const t = await res.clone().text()
    if (/relation .* does not exist|Could not find the table/i.test(t)) throw new TableMissing(t)
  }
  return res
}

async function rows<T>(path: string): Promise<T[]> {
  const res = await supa(path)
  if (!res.ok) throw new Error(`supabase ${path.split('?')[0]}: ${res.status} ${await res.text()}`)
  return res.json()
}

async function write<T>(path: string, method: 'POST' | 'PATCH', body: unknown, prefer = 'return=representation'): Promise<T[]> {
  const res = await supa(path, { method, headers: { Prefer: prefer }, body: JSON.stringify(body) })
  if (!res.ok) throw new Error(`supabase ${method} ${path.split('?')[0]}: ${res.status} ${await res.text()}`)
  return prefer.includes('return=representation') ? res.json() : []
}

const enc = encodeURIComponent

export async function insertAffiliate(a: Partial<Affiliate> & { name: string; email: string }): Promise<Affiliate> {
  const [row] = await write<Affiliate>('/affiliates', 'POST', [a])
  return row
}

export async function patchAffiliate(id: string, patch: Partial<Affiliate>): Promise<Affiliate | null> {
  const r = await write<Affiliate>(`/affiliates?id=eq.${enc(id)}`, 'PATCH', { ...patch, updated_at: new Date().toISOString() })
  return r[0] || null
}

export async function listAffiliates(): Promise<Affiliate[]> {
  return rows<Affiliate>('/affiliates?order=created_at.desc&limit=1000')
}

export async function getAffiliate(id: string): Promise<Affiliate | null> {
  return (await rows<Affiliate>(`/affiliates?id=eq.${enc(id)}&limit=1`))[0] || null
}

export async function affiliateByCode(code: string): Promise<Affiliate | null> {
  if (!CODE_RE.test(code)) return null
  return (await rows<Affiliate>(`/affiliates?code=eq.${enc(code)}&limit=1`))[0] || null
}

export async function affiliateByToken(token: string): Promise<Affiliate | null> {
  if (!/^[A-Za-z0-9_-]{20,64}$/.test(token)) return null
  return (await rows<Affiliate>(`/affiliates?token=eq.${enc(token)}&limit=1`))[0] || null
}

export async function affiliatesByEmail(email: string): Promise<Affiliate[]> {
  return rows<Affiliate>(`/affiliates?email=ilike.${enc(email.trim())}&limit=20`)
}

export async function recordClick(affiliateId: string, path: string | null, referrerHost: string | null): Promise<void> {
  await write('/affiliate_clicks', 'POST', [{ affiliate_id: affiliateId, path, referrer_host: referrerHost }], 'return=minimal')
}

export async function clickCounts(affiliateId: string): Promise<{ last30: number; total: number }> {
  const since = new Date(Date.now() - 30 * 86400_000).toISOString()
  const count = async (q: string) => {
    const res = await supa(`/affiliate_clicks?select=id&affiliate_id=eq.${enc(affiliateId)}${q}`, {
      method: 'HEAD', headers: { Prefer: 'count=exact', Range: '0-0' },
    })
    const cr = res.headers.get('content-range') || ''
    return Number(cr.split('/')[1]) || 0
  }
  const [last30, total] = await Promise.all([count(`&at=gte.${enc(since)}`), count('')])
  return { last30, total }
}

export async function allClickCounts(): Promise<Map<string, number>> {
  const since = new Date(Date.now() - 30 * 86400_000).toISOString()
  const list = await rows<{ affiliate_id: string }>(`/affiliate_clicks?select=affiliate_id&at=gte.${enc(since)}&limit=50000`)
  const m = new Map<string, number>()
  for (const r of list) m.set(r.affiliate_id, (m.get(r.affiliate_id) || 0) + 1)
  return m
}

export async function listReferrals(affiliateId?: string): Promise<Referral[]> {
  return rows<Referral>(`/affiliate_referrals?order=started_at.desc&limit=5000${affiliateId ? `&affiliate_id=eq.${enc(affiliateId)}` : ''}`)
}

export async function upsertReferral(r: Partial<Referral> & { subscription_id: string; affiliate_id: string }): Promise<void> {
  await write('/affiliate_referrals?on_conflict=subscription_id', 'POST', [{ ...r, updated_at: new Date().toISOString() }],
    'resolution=merge-duplicates,return=minimal')
}

export async function getReferral(subscriptionId: string): Promise<Referral | null> {
  return (await rows<Referral>(`/affiliate_referrals?subscription_id=eq.${enc(subscriptionId)}&limit=1`))[0] || null
}

export async function listCommissions(q = ''): Promise<Commission[]> {
  return rows<Commission>(`/affiliate_commissions?order=charged_at.desc&limit=10000${q}`)
}

export async function commissionByKey(key: string): Promise<Commission | null> {
  return (await rows<Commission>(`/affiliate_commissions?key=eq.${enc(key)}&limit=1`))[0] || null
}

export async function insertCommission(c: Omit<Commission, 'id' | 'payout_id'> & { payout_id?: string | null }): Promise<void> {
  await write('/affiliate_commissions?on_conflict=key', 'POST', [c], 'resolution=ignore-duplicates,return=minimal')
}

export async function patchCommission(id: string, patch: Partial<Commission>): Promise<void> {
  await write(`/affiliate_commissions?id=eq.${enc(id)}`, 'PATCH', { ...patch, updated_at: new Date().toISOString() }, 'return=minimal')
}

export async function listPayouts(affiliateId?: string): Promise<Payout[]> {
  return rows<Payout>(`/affiliate_payouts?order=created_at.desc&limit=2000${affiliateId ? `&affiliate_id=eq.${enc(affiliateId)}` : ''}`)
}

export async function insertPayout(p: Omit<Payout, 'id' | 'created_at'>): Promise<Payout> {
  const [row] = await write<Payout>('/affiliate_payouts', 'POST', [p])
  return row
}

// ---------------------------------------------------------------- summaries

export interface Balance {
  pendingCents: number    // inside the 30-day hold
  payableCents: number    // out of the hold, not yet paid (adjustments net in)
  paidCents: number
  voidCount: number
}

export function balanceOf(list: Commission[]): Balance {
  const b: Balance = { pendingCents: 0, payableCents: 0, paidCents: 0, voidCount: 0 }
  for (const c of list) {
    if (c.status === 'pending') b.pendingCents += c.commission_cents
    else if (c.status === 'payable') b.payableCents += c.commission_cents
    else if (c.status === 'paid') b.paidCents += c.commission_cents
    else b.voidCount++
  }
  return b
}
