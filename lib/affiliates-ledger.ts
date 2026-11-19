import Stripe from 'stripe'
import { TEST_EMAILS } from '@/lib/admin-stats'
import {
  TERMS, listAffiliates, getReferral, upsertReferral, insertCommission, commissionByKey,
  patchCommission, listCommissions, supa, type Affiliate, type Commission,
} from '@/lib/affiliates'

/*
 * The affiliate commission ledger, computed from Stripe. Runs daily as a step
 * inside /api/leads/drip (Vercel Hobby allows two crons and both are taken),
 * and on demand from /cas-admin/affiliates. Idempotent: every commission is
 * keyed by its Stripe invoice id, so a rerun never double-counts.
 *
 * Attribution: the checkout routes copy the visitor's fk_aff cookie into the
 * subscription's metadata (fk_affiliate). Stripe snapshots subscription
 * metadata onto every invoice, so each paid invoice says which affiliate it
 * belongs to without any join on our side.
 *
 * Steps: (1) record referred subscriptions, (2) one commission per paid
 * invoice inside the 12-month window, (3) re-check recent commissions for
 * refunds and disputes, (4) release commissions whose 30-day hold is over.
 */

const DAY = 86400_000
const META_KEY = 'fk_affiliate'

function stripe(): Stripe {
  // The ledger only reads, so it prefers the restricted read-only key.
  const key = process.env.STRIPE_READONLY_KEY || process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('Stripe key missing')
  return new Stripe(key, { apiVersion: '2025-04-30.basil' } as ConstructorParameters<typeof Stripe>[1])
}

const commissionOf = (cents: number) => Math.round(cents * TERMS.ratePct / 100)
const iso = (unix: number) => new Date(unix * 1000).toISOString()

export interface LedgerReport {
  referralsSeen: number
  commissionsAdded: number
  refundsApplied: number
  released: number
  skippedOutsideWindow: number
  unknownCodes: string[]
  errors: string[]
}

/** Which affiliate a code credits: they must have been approved before the purchase. */
function creditable(a: Affiliate | undefined, atIso: string): a is Affiliate {
  if (!a || !a.approved_at) return false
  if (!['active', 'paused', 'closed'].includes(a.status)) return false
  return new Date(a.approved_at).getTime() <= new Date(atIso).getTime() + 60_000
}

function isSelfReferral(a: Affiliate, email: string | null): boolean {
  if (!email) return false
  const e = email.toLowerCase().trim()
  return TEST_EMAILS.has(e) || e === a.email.toLowerCase().trim() || (!!a.payout_email && e === a.payout_email.toLowerCase().trim())
}

function paymentIntentOf(inv: Stripe.Invoice): string | null {
  for (const p of inv.payments?.data || []) {
    const pi = p.payment?.payment_intent
    if (pi) return typeof pi === 'string' ? pi : pi.id
  }
  return null
}

async function firstPaidAt(s: Stripe, subscriptionId: string): Promise<string | null> {
  let min: number | null = null
  for await (const inv of s.invoices.list({ subscription: subscriptionId, status: 'paid', limit: 100 })) {
    const t = inv.status_transitions?.paid_at
    if (inv.amount_paid > 0 && t && (min === null || t < min)) min = t
  }
  return min ? iso(min) : null
}

export async function runAffiliateLedger(opts: { days?: number; budgetMs?: number } = {}): Promise<LedgerReport> {
  const days = opts.days ?? 45
  const deadline = Date.now() + (opts.budgetMs ?? 60_000)
  const s = stripe()
  const report: LedgerReport = {
    referralsSeen: 0, commissionsAdded: 0, refundsApplied: 0, released: 0, skippedOutsideWindow: 0, unknownCodes: [], errors: [],
  }

  const affiliates = await listAffiliates()
  const byCode = new Map(affiliates.filter(a => a.code).map(a => [a.code as string, a]))
  const since = Math.floor((Date.now() - days * DAY) / 1000)
  const unknown = new Set<string>()

  // (1) Referred subscriptions, so the stats page can show trials and sign-ups
  // before any money moves.
  for await (const sub of s.subscriptions.list({ status: 'all', created: { gte: since }, limit: 100, expand: ['data.customer'] })) {
    if (Date.now() > deadline) { report.errors.push('time budget reached in subscriptions'); break }
    const code = sub.metadata?.[META_KEY]
    if (!code) continue
    const a = byCode.get(code)
    if (!creditable(a, iso(sub.created))) { unknown.add(code); continue }
    const cust = typeof sub.customer === 'string' ? null : (sub.customer as Stripe.Customer)
    const email = cust && !('deleted' in cust && cust.deleted) ? cust.email : null
    const existing = await getReferral(sub.id)
    await upsertReferral({
      subscription_id: sub.id,
      affiliate_id: a.id,
      customer_id: typeof sub.customer === 'string' ? sub.customer : sub.customer.id,
      customer_email: email,
      plan: sub.items.data[0]?.price?.recurring?.interval === 'year' ? 'annual' : 'monthly',
      sub_status: sub.status,
      started_at: iso(sub.created),
      first_paid_at: existing?.first_paid_at ?? null,
      flag: isSelfReferral(a, email) ? 'self_referral' : (existing?.flag ?? null),
    })
    report.referralsSeen++
  }

  // (2) One commission per paid invoice that carries an affiliate code.
  for await (const inv of s.invoices.list({ status: 'paid', created: { gte: since }, limit: 100, expand: ['data.payments'] })) {
    if (Date.now() > deadline) { report.errors.push('time budget reached in invoices'); break }
    const details = inv.parent?.subscription_details
    const code = details?.metadata?.[META_KEY]
    if (!code || !inv.id || inv.amount_paid <= 0) continue
    const paidUnix = inv.status_transitions?.paid_at || inv.created
    const a = byCode.get(code)
    if (!creditable(a, iso(paidUnix))) { unknown.add(code); continue }
    if (await commissionByKey(inv.id)) continue

    const subId = typeof details?.subscription === 'string' ? details.subscription : details?.subscription?.id
    if (!subId) continue
    let ref = await getReferral(subId)
    if (!ref || !ref.first_paid_at) {
      const first = await firstPaidAt(s, subId)
      const email = inv.customer_email
      await upsertReferral({
        subscription_id: subId,
        affiliate_id: a.id,
        customer_id: typeof inv.customer === 'string' ? inv.customer : inv.customer?.id ?? null,
        customer_email: ref?.customer_email ?? email,
        first_paid_at: first,
        flag: ref?.flag ?? (isSelfReferral(a, email) ? 'self_referral' : null),
      })
      ref = await getReferral(subId)
    }
    if (!ref) continue
    const first = ref.first_paid_at ? new Date(ref.first_paid_at).getTime() : paidUnix * 1000
    if (paidUnix * 1000 - first >= TERMS.windowDays * DAY) { report.skippedOutsideWindow++; continue }

    const self = ref.flag === 'self_referral' || isSelfReferral(a, inv.customer_email)
    await insertCommission({
      key: inv.id,
      kind: 'sale',
      affiliate_id: a.id,
      subscription_id: subId,
      invoice_id: inv.id,
      payment_intent: paymentIntentOf(inv),
      amount_paid_cents: inv.amount_paid,
      refunded_cents: 0,
      commission_cents: self ? 0 : commissionOf(inv.amount_paid),
      charged_at: iso(paidUnix),
      payable_at: new Date(paidUnix * 1000 + TERMS.holdDays * DAY).toISOString(),
      status: self ? 'void' : 'pending',
      void_reason: self ? 'self_referral' : null,
    })
    report.commissionsAdded++
  }

  // (3) Refunds and disputes on anything charged in the last 120 days.
  const recent = await listCommissions(`&kind=eq.sale&charged_at=gte.${encodeURIComponent(new Date(Date.now() - 120 * DAY).toISOString())}`)
  for (const c of recent) {
    if (Date.now() > deadline) { report.errors.push('time budget reached in refund sweep'); break }
    if (!c.payment_intent || c.void_reason === 'self_referral') continue
    try {
      const pi = await s.paymentIntents.retrieve(c.payment_intent, { expand: ['latest_charge'] })
      const ch = pi.latest_charge && typeof pi.latest_charge !== 'string' ? pi.latest_charge : null
      if (!ch) continue
      const refunded = ch.amount_refunded || 0
      const disputed = !!ch.disputed
      const target = disputed ? 0 : commissionOf(Math.max(0, c.amount_paid_cents - refunded))
      if (c.status === 'pending' || c.status === 'payable') {
        if (target !== c.commission_cents || refunded !== c.refunded_cents) {
          await patchCommission(c.id, {
            commission_cents: target,
            refunded_cents: refunded,
            ...(target === 0 ? { status: 'void', void_reason: disputed ? 'disputed' : 'refunded' } : {}),
          })
          report.refundsApplied++
        }
      } else if (c.status === 'paid') {
        const diff = target - c.commission_cents
        if (diff >= 0) continue
        const adj = await commissionByKey(`${c.invoice_id}:adj`)
        if (!adj) {
          await insertCommission({
            key: `${c.invoice_id}:adj`, kind: 'adjustment', affiliate_id: c.affiliate_id, subscription_id: c.subscription_id,
            invoice_id: c.invoice_id, payment_intent: c.payment_intent, amount_paid_cents: 0, refunded_cents: refunded,
            commission_cents: diff, charged_at: new Date().toISOString(), payable_at: new Date().toISOString(),
            status: 'payable', void_reason: disputed ? 'disputed' : 'refunded',
          })
          report.refundsApplied++
        } else if (adj.status !== 'paid' && adj.commission_cents !== diff) {
          await patchCommission(adj.id, { commission_cents: diff, refunded_cents: refunded })
          report.refundsApplied++
        }
      }
    } catch (e) {
      report.errors.push(`refund check ${c.invoice_id}: ${e instanceof Error ? e.message : 'failed'}`)
    }
  }

  // (4) Release commissions whose hold is over.
  const res = await supa(
    `/affiliate_commissions?status=eq.pending&payable_at=lte.${encodeURIComponent(new Date().toISOString())}`,
    { method: 'PATCH', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ status: 'payable', updated_at: new Date().toISOString() }) },
  )
  if (res.ok) report.released = ((await res.json()) as Commission[]).length
  else report.errors.push(`release: ${res.status}`)

  report.unknownCodes = [...unknown]
  return report
}
