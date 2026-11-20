import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import '../../home.css'
import '../../v2-pages.css'
import '../affiliates.css'
import { V2Shell } from '@/app/v2-shell'
import {
  TERMS, getAffiliate, clickCounts, recentClicks, listReferrals, listCommissions, listPayouts, balanceOf,
  linkFor, money, fmtDate, nextPayoutDate,
} from '@/lib/affiliates'
import { SESSION_COOKIE, verifySession } from '@/lib/affiliate-session'
import { CopyButton, PayoutEmailForm } from './client'

/* The signed-in affiliate's own page: visits from their link, sign-ups,
   sales, earnings and payouts. Session = signed cookie from
   /affiliates/signin. Families are never named here: an affiliate sees dates,
   plans and statuses, not who subscribed. Numbers come from the ledger, which
   updates daily from Stripe; visits are live. */

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'Your affiliate page | Faithful Kids',
  robots: { index: false, follow: false },
}

const STATUS: Record<string, string> = {
  trialing: 'Free trial', active: 'Paying', canceled: 'Cancelled', past_due: 'Payment issue',
  unpaid: 'Payment issue', incomplete: 'Not completed', incomplete_expired: 'Not completed', paused: 'Paused',
}

function topN(values: (string | null)[], n: number): [string, number][] {
  const m = new Map<string, number>()
  for (const v of values) { const k = v || '(direct or hidden)'; m.set(k, (m.get(k) || 0) + 1) }
  return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, n)
}

export default async function Page() {
  const id = verifySession((await cookies()).get(SESSION_COOKIE)?.value)
  const a = id ? await getAffiliate(id).catch(() => null) : null
  if (!a || !a.code || !['active', 'paused', 'closed'].includes(a.status)) redirect('/affiliates/login')

  const [counts, clicks, refs, coms, pays] = await Promise.all([
    clickCounts(a.id), recentClicks(a.id, 30), listReferrals(a.id), listCommissions(`&affiliate_id=eq.${a.id}`), listPayouts(a.id),
  ])
  const valid = refs.filter(r => r.flag !== 'self_referral')
  // A paying family = at least one payment that stood (not refunded/void).
  const paidSubs = new Set(coms.filter(c => c.kind === 'sale' && c.status !== 'void').map(c => c.subscription_id))
  const paying = valid.filter(r => paidSubs.has(r.subscription_id)).length
  const b = balanceOf(coms)
  const link = linkFor(a.code)
  const next = nextPayoutDate()

  // Visits per day for the last 30 days (New York days, matching the admin).
  const dayKey = (d: Date) => d.toLocaleDateString('en-CA', { timeZone: 'America/New_York' })
  const days: { key: string; label: string; n: number }[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400_000)
    days.push({ key: dayKey(d), label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'America/New_York' }), n: 0 })
  }
  const idx = new Map(days.map((d, i) => [d.key, i]))
  for (const c of clicks) { const i = idx.get(dayKey(new Date(c.at))); if (i !== undefined) days[i].n++ }
  const peak = Math.max(1, ...days.map(d => d.n))
  const sources = topN(clicks.map(c => c.referrer_host), 5)
  const pages = topN(clicks.map(c => c.path), 5)

  const earned = b.pendingCents + b.payableCents + b.paidCents
  const owed = b.pendingCents + b.payableCents
  const nextAmount = b.payableCents >= TERMS.minimumCents ? b.payableCents : 0
  const sales = coms.filter(c => c.status !== 'void' || c.kind === 'sale')

  return (
    <V2Shell>
      <main id="main-content" className="af-acct">
        <div className="af-top">
          <p className="hv-eyebrow" style={{ margin: 0 }}><a href="/" style={{ color: 'inherit' }}>Faithful Kids</a> affiliate</p>
          <a className="af-signout" href="/affiliates/signout">Sign out</a>
        </div>
        <h1>Hi {a.name.split(/\s+/)[0]}</h1>
        {a.status !== 'active' && <p className="af-sub">{a.status === 'paused' ? 'Your link is paused, so new visitors are not being credited. Email team@faithfulkids.app with questions.' : 'This affiliate account is closed. Commission you earned is still paid on schedule.'}</p>}

        <div className="af-stats af-stats-4">
          <div className="af-stat"><b>{counts.last30}</b><span>visitors, last 30 days</span></div>
          <div className="af-stat"><b>{valid.length}</b><span>sign-ups</span></div>
          <div className="af-stat"><b>{paying}</b><span>paying families</span></div>
          <div className="af-stat"><b>{money(earned)}</b><span>earned in total</span></div>
        </div>

        <div className="af-card af-payline">
          <div><span>Next payout, {fmtDate(next)}</span><b>{money(nextAmount)}</b></div>
          <div><span>Still clearing ({TERMS.holdDays}-day hold)</span><b>{money(b.pendingCents)}</b></div>
          <div><span>Paid to you so far</span><b>{money(b.paidCents)}</b></div>
        </div>
        {b.payableCents > 0 && b.payableCents < TERMS.minimumCents && <p className="af-note">Your cleared {money(b.payableCents)} rolls over until it reaches {money(TERMS.minimumCents)}.</p>}

        <div className="af-card">
          <h2>Visitors from your link</h2>
          {counts.last30 === 0 ? <p>No visitors in the last 30 days yet. Each person who clicks your link shows up here, counted once.</p> : (
            <>
              <div className="af-bars" role="img" aria-label={`Visitors per day over the last 30 days, ${counts.last30} in total`}>
                {days.map(d => (
                  <div key={d.key} className="af-bar" title={`${d.label}: ${d.n} visitor${d.n === 1 ? '' : 's'}`}>
                    <span style={{ height: `${d.n ? Math.max(6, (d.n / peak) * 100) : 0}%` }} />
                  </div>
                ))}
              </div>
              <div className="af-bars-axis"><span>{days[0].label}</span><span>{days[29].label}</span></div>
            </>
          )}
        </div>

        <div className="af-card">
          <h2>Your link</h2>
          <div className="af-link"><code>{link.replace('https://', '')}</code><CopyButton text={link} /></div>
          <p style={{ marginTop: 12 }}>Point it at any page by adding <code>?to=</code>, for example <code>{link.replace('https://', '')}?to=/bible-trivia</code>. Please say it is an affiliate link wherever you share it.</p>
        </div>

        <div className="af-card">
          <h2>Your sales</h2>
          {sales.length === 0 ? <p>No paid sales yet. A family who starts a free trial shows up under sign-ups, and becomes a sale when their first payment goes through.</p> : (
            <div className="af-scroll"><table className="af-table">
              <thead><tr><th>Date</th><th>Family paid</th><th>You earn</th><th>Status</th></tr></thead>
              <tbody>{sales.slice(0, 12).map(c => (
                <tr key={c.id}>
                  <td>{fmtDate(c.charged_at)}</td>
                  <td>{c.kind === 'sale' ? money(c.amount_paid_cents) : 'Refund'}{c.refunded_cents && c.kind === 'sale' ? ` (refunded ${money(c.refunded_cents)})` : ''}</td>
                  <td>{money(c.commission_cents)}</td>
                  <td><span className={`af-pill ${c.status}`}>{c.status === 'pending' ? `clears ${fmtDate(c.payable_at)}` : c.status === 'payable' ? 'cleared' : c.status === 'void' ? (c.void_reason || 'cancelled').replace('_', ' ') : 'paid'}</span></td>
                </tr>
              ))}</tbody>
            </table></div>
          )}
        </div>

        <div className="af-card">
          <h2>Where we pay you</h2>
          <p>PayPal, on the {TERMS.payoutDay}th of each month. {a.tax_form === 'none' ? 'Before your first payout we will email you for a tax form (W-9 in the US, W-8BEN elsewhere).' : 'Your tax form is on file.'}</p>
          <PayoutEmailForm current={a.payout_email} />
        </div>

        <details className="af-card af-more">
          <summary>More detail</summary>
          <div className="af-two" style={{ marginTop: 14 }}>
            <div>
              <p className="af-mini">Where visitors came from (30 days)</p>
              {sources.length ? <table className="af-table"><tbody>{sources.map(([k, n]) => <tr key={k}><td>{k}</td><td style={{ textAlign: 'right' }}>{n}</td></tr>)}</tbody></table> : <p>Nothing yet.</p>}
            </div>
            <div>
              <p className="af-mini">Pages they landed on (30 days)</p>
              {pages.length ? <table className="af-table"><tbody>{pages.map(([k, n]) => <tr key={k}><td>{k}</td><td style={{ textAlign: 'right' }}>{n}</td></tr>)}</tbody></table> : <p>Nothing yet.</p>}
            </div>
          </div>
          <p className="af-mini" style={{ marginTop: 18 }}>All sign-ups ({valid.length}), without names</p>
          {valid.length ? <div className="af-scroll"><table className="af-table">
            <thead><tr><th>Signed up</th><th>Plan</th><th>Status</th><th>First payment</th></tr></thead>
            <tbody>{valid.map(r => (
              <tr key={r.subscription_id}><td>{fmtDate(r.started_at)}</td><td>{r.plan === 'annual' ? 'Annual' : r.plan === 'monthly' ? 'Monthly' : ''}</td><td>{STATUS[r.sub_status || ''] || r.sub_status || ''}</td><td>{r.first_paid_at ? fmtDate(r.first_paid_at) : 'Not yet'}</td></tr>
            ))}</tbody>
          </table></div> : <p>None yet.</p>}
          {pays.length > 0 && <>
            <p className="af-mini" style={{ marginTop: 18 }}>Payouts</p>
            <div className="af-scroll"><table className="af-table">
              <thead><tr><th>Date</th><th>Amount</th><th>Sent to</th><th>PayPal reference</th></tr></thead>
              <tbody>{pays.map(p => <tr key={p.id}><td>{fmtDate(p.created_at)}</td><td>{money(p.amount_cents)}</td><td>{p.sent_to}</td><td>{p.reference}</td></tr>)}</tbody>
            </table></div>
          </>}
          <p style={{ marginTop: 16 }}>Visitors count each person once per 30 days, and leave out link previews and bots. Sign-ups and sales come straight from our payment system and update every morning. All-time visitors: {counts.total}. Owed to you now, cleared or clearing: {money(owed)}.</p>
        </details>

        <p className="cr-updated">Program terms: <a href="/affiliates/terms">faithfulkids.app/affiliates/terms</a>. Questions, or want images to share? <a href="mailto:team@faithfulkids.app">team@faithfulkids.app</a>.</p>
      </main>
    </V2Shell>
  )
}
