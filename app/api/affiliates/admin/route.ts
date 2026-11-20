import { NextRequest, NextResponse } from 'next/server'
import { adminPassword } from '@/lib/admin-stats'
import {
  TERMS, CODE_RE, listAffiliates, getAffiliate, patchAffiliate, insertAffiliate, affiliateByCode,
  listReferrals, listCommissions, listPayouts, insertPayout, patchCommission, allClickCounts,
  balanceOf, newToken, suggestCode, linkFor, accountUrl, TableMissing, type Affiliate,
} from '@/lib/affiliates'
import { approvalEmail, declineEmail, payoutEmail, send } from '@/lib/affiliates-emails'
import { runAffiliateLedger } from '@/lib/affiliates-ledger'

export const dynamic = 'force-dynamic'
export const maxDuration = 120

/*
 * The affiliate desk API (/cas-admin/affiliates). Same gate as the rest of
 * /cas-admin: the x-admin-password header. Email only ever sends from an
 * explicit `send: true` action the owner pressed after a preview.
 */

async function authed(req: NextRequest): Promise<boolean> {
  const pw = req.headers.get('x-admin-password') || ''
  const expected = await adminPassword()
  return !!expected && pw === expected
}
const unauthorized = () => NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
const bad = (error: string, status = 400) => NextResponse.json({ error }, { status })

export async function GET(req: NextRequest) {
  if (!await authed(req)) return unauthorized()
  try {
    const [affiliates, referrals, commissions, payouts, clicks] = await Promise.all([
      listAffiliates(), listReferrals(), listCommissions(), listPayouts(), allClickCounts(),
    ])
    const rows = affiliates.map(a => {
      const mine = commissions.filter(c => c.affiliate_id === a.id)
      const refs = referrals.filter(r => r.affiliate_id === a.id)
      return {
        ...a,
        link: a.code ? linkFor(a.code) : null,
        account: a.token ? accountUrl(a.token) : null,
        suggestedCode: a.code || suggestCode(a.name),
        clicks30: clicks.get(a.id) || 0,
        signups: refs.length,
        paying: new Set(mine.filter(c => c.kind === 'sale' && c.status !== 'void').map(c => c.subscription_id)).size,
        flagged: refs.filter(r => r.flag).length,
        balance: balanceOf(mine),
      }
    })
    return NextResponse.json({ terms: TERMS, affiliates: rows, commissions, payouts, referrals })
  } catch (e) {
    if (e instanceof TableMissing) return NextResponse.json({ missingTable: true, terms: TERMS, affiliates: [], commissions: [], payouts: [], referrals: [] })
    console.error(e)
    return bad(e instanceof Error ? e.message : 'failed', 500)
  }
}

type Body = {
  action?: string; id?: string; code?: string; send?: boolean; kind?: string; days?: number; reference?: string
  fields?: Partial<Pick<Affiliate, 'name' | 'email' | 'website' | 'audience' | 'plan' | 'country' | 'payout_email' | 'tax_form' | 'admin_notes' | 'status'>>
}

const EDITABLE = new Set(['name', 'email', 'website', 'audience', 'plan', 'country', 'payout_email', 'tax_form', 'admin_notes', 'status'])

export async function POST(req: NextRequest) {
  if (!await authed(req)) return unauthorized()
  let body: Body
  try { body = await req.json() } catch { return bad('Bad request') }

  try {
    if (body.action === 'reconcile') {
      const days = Math.min(Math.max(Number(body.days) || 45, 1), 730)
      return NextResponse.json({ ok: true, report: await runAffiliateLedger({ days, budgetMs: 100_000 }) })
    }

    if (body.action === 'create') {
      const f = body.fields || {}
      if (!f.name || !f.email) return bad('Name and email are required.')
      const row = await insertAffiliate({
        name: String(f.name).slice(0, 120), email: String(f.email).toLowerCase().trim().slice(0, 254),
        website: f.website || null, audience: f.audience || null, plan: f.plan || null, country: f.country || null,
        status: 'applied', source: 'added by hand in /cas-admin/affiliates', admin_notes: f.admin_notes || null,
      })
      return NextResponse.json({ ok: true, affiliate: row })
    }

    const a = await getAffiliate(body.id || '')
    if (!a) return bad('No such affiliate.', 404)

    if (body.action === 'approve') {
      const code = String(body.code || a.code || suggestCode(a.name)).toLowerCase().trim()
      if (!CODE_RE.test(code)) return bad('Codes are 3 to 32 lowercase letters, digits or hyphens.')
      const taken = await affiliateByCode(code)
      if (taken && taken.id !== a.id) return bad(`The code "${code}" belongs to ${taken.name}.`)
      const now = new Date().toISOString()
      const row = await patchAffiliate(a.id, {
        status: 'active', code, token: a.token || newToken(),
        approved_at: a.approved_at || now, decided_at: now,
      })
      return NextResponse.json({ ok: true, affiliate: row })
    }

    if (body.action === 'decline') {
      const row = await patchAffiliate(a.id, { status: 'declined', decided_at: new Date().toISOString() })
      return NextResponse.json({ ok: true, affiliate: row })
    }

    if (body.action === 'update') {
      const patch: Record<string, unknown> = {}
      for (const [k, v] of Object.entries(body.fields || {})) if (EDITABLE.has(k)) patch[k] = v === '' ? null : v
      if (patch.status && !['active', 'paused', 'closed', 'declined', 'applied'].includes(String(patch.status))) return bad('Unknown status.')
      if (patch.status === 'active' && !a.code) return bad('Use Approve to activate, so a code and link are created.')
      if (patch.tax_form && !['none', 'w9', 'w8ben', 'w8bene'].includes(String(patch.tax_form))) return bad('Unknown tax form.')
      if ('tax_form' in patch) patch.tax_form_received_at = patch.tax_form && patch.tax_form !== 'none' ? new Date().toISOString() : null
      if (patch.tax_form === null) patch.tax_form = 'none'
      const row = await patchAffiliate(a.id, patch as Partial<Affiliate>)
      return NextResponse.json({ ok: true, affiliate: row })
    }

    if (body.action === 'email') {
      const built = body.kind === 'approval' ? approvalEmail(a) : body.kind === 'decline' ? declineEmail(a) : null
      if (!built) return bad('Unknown email.')
      if (!body.send) return NextResponse.json({ ok: true, preview: built })
      const ok = await send(built)
      if (ok) await patchAffiliate(a.id, { admin_notes: `${a.admin_notes ? a.admin_notes + '\n' : ''}${new Date().toISOString().slice(0, 10)}: ${body.kind} email sent` })
      return NextResponse.json({ ok })
    }

    if (body.action === 'payout') {
      if (!a.payout_email) return bad('This affiliate has not given a PayPal email yet (they add it on their affiliate page).')
      const due = (await listCommissions(`&affiliate_id=eq.${a.id}&status=eq.payable`))
      const total = due.reduce((n, c) => n + c.commission_cents, 0)
      const yearStart = `${new Date().getUTCFullYear()}-01-01T00:00:00Z`
      const paidThisYear = (await listPayouts(a.id)).filter(p => p.created_at >= yearStart).reduce((n, p) => n + p.amount_cents, 0)
      if (a.tax_form === 'none' && paidThisYear + total >= TERMS.taxFormAtCents) return bad(`This payout takes ${a.name} to ${(paidThisYear + total) / 100} dollars this year, over the ${TERMS.taxFormAtCents / 100} dollar line where a tax form is needed. Collect a W-9 (US) or W-8BEN (outside the US), tick it under Details, then record the payout.`)
      if (total < TERMS.minimumCents) return bad(`Payable balance is ${(total / 100).toFixed(2)}, under the ${(TERMS.minimumCents / 100).toFixed(2)} minimum. It rolls over to next month.`)
      const reference = String(body.reference || '').trim().slice(0, 120)
      if (!reference) return bad('Paste the PayPal transaction id first, so the payout can be traced.')
      const payout = await insertPayout({
        affiliate_id: a.id, amount_cents: total, method: 'paypal', sent_to: a.payout_email, reference,
        note: `${due.length} commission line(s)`,
      })
      for (const c of due) await patchCommission(c.id, { status: 'paid', payout_id: payout.id })
      let emailed = false
      if (body.send) emailed = await send(payoutEmail(a, total, a.payout_email, reference))
      return NextResponse.json({ ok: true, payout, emailed })
    }

    return bad('Unknown action.')
  } catch (e) {
    if (e instanceof TableMissing) return bad('The affiliate tables do not exist yet. Run supabase-affiliates-migration.sql in Supabase first.', 503)
    console.error(e)
    return bad(e instanceof Error ? e.message : 'failed', 500)
  }
}
