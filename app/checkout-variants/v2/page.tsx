'use client'

import '../variants.css'
import {
  Header, Trust, SignIn, StickyBar, Faq, useCheckout, INCLUDED,
  ANNUAL_YEAR, ANNUAL_MONTH, MONTHLY, SAVED, SAVED_PCT, trialEndDate,
} from '../kit'

/* VARIANT 2 — "Side by Side" (the Minno pattern)
   Both plans priced in the SAME unit so the comparison needs no arithmetic.
   When this was written the live page showed the previous, lower yearly price against the previous monthly one (repriced Aug 31, 2026 to $97/yr and $12.99/mo) and leaves the
   visitor to divide — which is likely why plan_select fires 20 times on monthly
   but only 13 on annual, while 9 of 13 continues are annual: they are toggling
   back and forth working it out. */

export default function V2() {
  const { plan, setPlan, loading, go, ctaLabel } = useCheckout()

  return (
    <div className="cv-page">
      <Header />
      <div className="cv-wrap">
        <h1 className="cv-h1">Choose your plan</h1>
        <p className="cv-sub">Same everything on both. The yearly plan is cheaper and starts free.</p>

        <div className="cv-cards">
          <button className={`cv-card ${plan === 'annual' ? 'on' : ''}`} onClick={() => setPlan('annual', 'v2')}>
            <span className="cv-card-ribbon">Save {SAVED_PCT}%</span>
            <div className="cv-card-name">Yearly</div>
            <div className="cv-card-price">${ANNUAL_MONTH}<small>/mo</small></div>
            <div className="cv-card-billed">Billed ${ANNUAL_YEAR} once a year</div>
            <div className="cv-card-trial">3 days free</div>
          </button>

          <button className={`cv-card ${plan === 'monthly' ? 'on' : ''}`} onClick={() => setPlan('monthly', 'v2')}>
            <div className="cv-card-name">Monthly</div>
            <div className="cv-card-price">${MONTHLY}<small>/mo</small></div>
            <div className="cv-card-billed">Billed every month</div>
            <div className="cv-card-trial none">No free trial</div>
          </button>
        </div>

        <p className="cv-terms">
          {plan === 'annual' ? (
            <>
              <strong>$0.00 today.</strong> Free until {trialEndDate()}, then ${ANNUAL_YEAR} a year
              &mdash; ${SAVED} less than paying monthly. Cancel any time before then and you are
              charged nothing.
            </>
          ) : (
            <>
              <strong>${MONTHLY} today</strong>, then ${MONTHLY} every month until you cancel.
              Switching to yearly later saves you ${SAVED}.
            </>
          )}
        </p>

        <button className="cv-cta" onClick={() => go('v2')} disabled={loading}>{ctaLabel}</button>
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
      <StickyBar plan={plan} loading={loading} onGo={() => go('v2')} />
    </div>
  )
}
