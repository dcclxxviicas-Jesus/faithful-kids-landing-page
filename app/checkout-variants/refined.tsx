'use client'

import './variants.css'
import {
  Header, Trust, SignIn, Faq, useCheckout, INCLUDED,
  ANNUAL_YEAR, ANNUAL_MONTH, trialEndDate,
} from './kit'

/* V2 refined — every element exists to make the yearly plan the obvious pick.

   The live page today shows "$77.77/year" beside "$8.88/month" and leaves the
   parent to divide. That is almost certainly why plan_select fires 20x on
   monthly against 13x on annual while 9 of 13 continues are annual: they are
   toggling back and forth doing the arithmetic in their heads.

   Nothing here is an invented anchor. $6.48 is the real annual rate per month
   and the struck-through figure is our real monthly price, so the comparison
   is between two prices a customer can actually pay. */

export function Refined({ monthly, tag }: { monthly: number; tag: string }) {
  const { plan, setPlan, loading, go, ctaLabel } = useCheckout()

  const monthlyYear = +(monthly * 12).toFixed(2)
  const saved = +(monthlyYear - ANNUAL_YEAR).toFixed(2)
  const pct = Math.round((1 - ANNUAL_YEAR / monthlyYear) * 100)
  const monthsFree = Math.floor(12 - ANNUAL_YEAR / monthly)
  const annual = plan === 'annual'

  return (
    <div className="cv-page">
      <Header />
      <div className="cv-wrap">
        <h1 className="cv-h1">Choose your plan</h1>
        <p className="cv-sub">
          Same everything on both. One of them costs ${saved} less a year and starts free.
        </p>

        <div className="cv-cards">
          <button className={`cv-card cv-card-hero ${annual ? 'on' : ''}`} onClick={() => setPlan('annual', tag)}>
            <span className="cv-card-ribbon">Save {pct}%</span>
            <div className="cv-card-name">Yearly</div>
            {/* The struck figure is our real monthly rate, not a fake list price. */}
            <div className="cv-was">${monthly.toFixed(2)}</div>
            <div className="cv-card-price">${ANNUAL_MONTH}<small>/mo</small></div>
            <div className="cv-card-billed">Billed ${ANNUAL_YEAR} once a year</div>
            <div className="cv-card-trial">3 days free</div>
          </button>

          <button className={`cv-card cv-card-lesser ${!annual ? 'on' : ''}`} onClick={() => setPlan('monthly', tag)}>
            <div className="cv-card-name">Monthly</div>
            <div className="cv-card-price">${monthly.toFixed(2)}<small>/mo</small></div>
            <div className="cv-card-billed">Billed every month</div>
            <div className="cv-card-trial none">No free trial</div>
          </button>
        </div>

        {/* The comparison the current page makes the visitor do in their head. */}
        <div className="cv-compare">
          <div className={`cv-compare-row ${annual ? 'win' : ''}`}>
            <span className="cv-compare-label">Yearly, 12 months</span>
            <span className="cv-compare-val">${ANNUAL_YEAR}</span>
          </div>
          <div className={`cv-compare-row ${!annual ? 'win' : ''}`}>
            <span className="cv-compare-label">Monthly, same 12 months</span>
            <span className="cv-compare-val">${monthlyYear}</span>
          </div>
          <div className="cv-compare-row cv-compare-diff">
            <span className="cv-compare-label">You keep</span>
            <span className="cv-compare-val">${saved}</span>
          </div>
        </div>

        {annual ? (
          <p className="cv-terms">
            <strong>$0.00 today.</strong> Free until {trialEndDate()}, then ${ANNUAL_YEAR} for the
            year &mdash; ${saved} less than paying monthly, or about {monthsFree} months free.
            Cancel any time before then and you are charged nothing.
          </p>
        ) : (
          <div className="cv-warn">
            <p>
              Monthly costs <strong>${saved} more</strong> over a year and has no free trial.
            </p>
            <button className="cv-warn-btn" onClick={() => setPlan('annual', tag)}>
              Switch to yearly and save ${saved} &rarr;
            </button>
          </div>
        )}

        <button className="cv-cta" onClick={() => go(tag)} disabled={loading}>{ctaLabel}</button>
        <SignIn />
        <Trust />

        <h2 className="cv-inc-title">Included on both plans</h2>
        <div className="cv-inc">
          {INCLUDED.map((f) => (
            <span key={f}><span className="cv-tick">{'✓'}</span>{f}</span>
          ))}
        </div>

        <Faq />
      </div>

      {/* Sticky bar carries the saving, not just the price. */}
      <div className="cv-sticky">
        <div className="cv-sticky-info">
          <span className="cv-sticky-price">{annual ? '$0.00 today' : `$${monthly.toFixed(2)} today`}</span>
          <span className="cv-sticky-sub">
            {annual ? `Then $${ANNUAL_YEAR}/yr · save $${saved}` : `$${saved} more than yearly`}
          </span>
        </div>
        <button className="cv-cta" onClick={() => go(tag)} disabled={loading}>
          {loading ? '…' : annual ? 'Start free' : 'Continue'}
        </button>
      </div>
    </div>
  )
}
