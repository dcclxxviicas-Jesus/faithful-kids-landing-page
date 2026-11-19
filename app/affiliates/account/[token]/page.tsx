import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import '../../../home.css'
import '../../../v2-pages.css'
import '../../affiliates.css'
import { V2Shell } from '@/app/v2-shell'
import {
  TERMS, affiliateByToken, clickCounts, listReferrals, listCommissions, listPayouts, balanceOf,
  linkFor, money, fmtDate, nextPayoutDate,
} from '@/lib/affiliates'
import { CopyButton, PayoutEmailForm } from './client'

/* An affiliate's private stats page. The token in the URL is the only key,
   so it is noindexed, blocked in robots.txt, and never linked from anywhere
   public. Numbers come from the ledger, which updates daily from Stripe. */

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'Your affiliate page | Faithful Kids',
  robots: { index: false, follow: false },
}

export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const a = await affiliateByToken(token).catch(() => null)
  if (!a || !a.code || a.status === 'applied' || a.status === 'declined') notFound()

  const [clicks, refs, coms, pays] = await Promise.all([
    clickCounts(a.id), listReferrals(a.id), listCommissions(`&affiliate_id=eq.${a.id}`), listPayouts(a.id),
  ])
  const valid = refs.filter(r => r.flag !== 'self_referral')
  const paying = valid.filter(r => r.first_paid_at).length
  const b = balanceOf(coms)
  const link = linkFor(a.code)
  const next = nextPayoutDate()

  return (
    <V2Shell>
      <main id="main-content" className="af-acct">
        <p className="hv-eyebrow"><a href="/" style={{ color: 'inherit' }}>Faithful Kids</a> affiliate program</p>
        <h1>Hi {a.name.split(/\s+/)[0]}, here are your numbers</h1>
        <p className="af-sub">{a.status === 'active' ? 'Your link is active.' : a.status === 'paused' ? 'Your link is paused: new clicks are not being credited. Email team@faithfulkids.app with questions.' : 'This affiliate account is closed. Earned commission is still paid on schedule.'} Updated daily.</p>

        <div className="af-card">
          <h2>Your link</h2>
          <div className="af-link"><code>{link.replace('https://', '')}</code><CopyButton text={link} /></div>
          <p style={{ marginTop: 12 }}>To send people to a particular page, add <code>?to=</code> and the page, for example <code>{link.replace('https://', '')}?to=/bible-trivia</code>. Adding <code>?ref={a.code}</code> to any faithfulkids.app address works too.</p>
          <p>Remember to say it is an affiliate link wherever you share it.</p>
        </div>

        <div className="af-stats">
          <div className="af-stat"><b>{clicks.last30}</b><span>clicks, last 30 days</span></div>
          <div className="af-stat"><b>{clicks.total}</b><span>clicks, all time</span></div>
          <div className="af-stat"><b>{valid.length}</b><span>sign-ups (incl. free trials)</span></div>
          <div className="af-stat"><b>{paying}</b><span>paying families</span></div>
        </div>
        <div className="af-stats">
          <div className="af-stat"><b>{money(b.pendingCents)}</b><span>in the {TERMS.holdDays}-day hold</span></div>
          <div className="af-stat"><b>{money(b.payableCents)}</b><span>cleared, to be paid {fmtDate(next)}</span></div>
          <div className="af-stat"><b>{money(b.paidCents)}</b><span>paid to you so far</span></div>
        </div>

        <div className="af-card">
          <h2>Getting paid</h2>
          <p>We pay by PayPal on the {TERMS.payoutDay}th of each month once your cleared balance is over {money(TERMS.minimumCents)}. {a.tax_form === 'none' ? 'Before your first payout we will email you to collect a tax form (W-9 in the US, W-8BEN elsewhere).' : 'Your tax form is on file.'}</p>
          <PayoutEmailForm token={token} current={a.payout_email} />
        </div>

        <div className="af-card">
          <h2>Earnings</h2>
          {coms.length === 0 ? <p>No paid sales yet. A free trial shows up under sign-ups first, and earns commission once it becomes a paid subscription.</p> : (
            <div className="af-scroll"><table className="af-table">
              <thead><tr><th>Date</th><th>Family paid</th><th>Your commission</th><th>Status</th></tr></thead>
              <tbody>{coms.map(c => (
                <tr key={c.id}>
                  <td>{fmtDate(c.charged_at)}</td>
                  <td>{c.kind === 'sale' ? money(c.amount_paid_cents) : 'Refund adjustment'}{c.refunded_cents ? ` (refunded ${money(c.refunded_cents)})` : ''}</td>
                  <td>{money(c.commission_cents)}</td>
                  <td><span className={`af-pill ${c.status}`}>{c.status === 'pending' ? `clears ${fmtDate(c.payable_at)}` : c.status === 'payable' ? 'cleared' : c.status === 'void' ? (c.void_reason || 'cancelled').replace('_', ' ') : 'paid'}</span></td>
                </tr>
              ))}</tbody>
            </table></div>
          )}
        </div>

        {pays.length > 0 && (
          <div className="af-card">
            <h2>Payouts</h2>
            <div className="af-scroll"><table className="af-table">
              <thead><tr><th>Date</th><th>Amount</th><th>Sent to</th><th>PayPal reference</th></tr></thead>
              <tbody>{pays.map(p => <tr key={p.id}><td>{fmtDate(p.created_at)}</td><td>{money(p.amount_cents)}</td><td>{p.sent_to}</td><td>{p.reference}</td></tr>)}</tbody>
            </table></div>
          </div>
        )}

        <p className="cr-updated">Program terms: <a href="/affiliates/terms">faithfulkids.app/affiliates/terms</a>. Questions or something to share: <a href="mailto:team@faithfulkids.app">team@faithfulkids.app</a>. Keep this page&rsquo;s address private.</p>
      </main>
    </V2Shell>
  )
}
