'use client'

import '../variants.css'
import {
  Header, Trust, SignIn, StickyBar, Faq, useCheckout,
  ANNUAL_YEAR, ANNUAL_MONTH, MONTHLY, SAVED, trialEndDate,
} from '../kit'

/* VARIANT 1 — "Focused Confirm" (the Headspace pattern)
   One decision, then pay. No feature list, no testimonials, no urgency device.
   The bet: someone on a checkout page has already decided to buy; every extra
   element is another chance to leave. Headspace's own subscription page runs
   this shape — plan rows, exact renewal terms directly beneath, then the CTA. */

export default function V1() {
  const { plan, setPlan, loading, go, ctaLabel } = useCheckout()

  return (
    <div className="cv-page">
      <Header />
      <div className="cv-wrap">
        <h1 className="cv-h1">Start your <span className="cv-green">free trial</span></h1>
        <p className="cv-sub">
          300+ Bible lessons for ages 5&ndash;15. Pick a plan &mdash; you can change or cancel it later.
        </p>

        <div className="cv-plans">
          <button className={`cv-plan ${plan === 'annual' ? 'on' : ''}`} onClick={() => setPlan('annual', 'v1')}>
            <span className="cv-radio" />
            <span className="cv-plan-mid">
              <span className="cv-plan-top">
                <span className="cv-plan-name">Yearly</span>
                <span className="cv-flag">3 days free</span>
              </span>
              <span className="cv-plan-note">Billed ${ANNUAL_YEAR} a year &middot; save ${SAVED}</span>
            </span>
            <span className="cv-plan-right">
              <span className="cv-plan-big">${ANNUAL_MONTH}<small>/mo</small></span>
              <span className="cv-plan-sub">$0.00 today</span>
            </span>
          </button>

          <button className={`cv-plan ${plan === 'monthly' ? 'on' : ''}`} onClick={() => setPlan('monthly', 'v1')}>
            <span className="cv-radio" />
            <span className="cv-plan-mid">
              <span className="cv-plan-top"><span className="cv-plan-name">Monthly</span></span>
              <span className="cv-plan-note">No free trial on monthly</span>
            </span>
            <span className="cv-plan-right">
              <span className="cv-plan-big">${MONTHLY}<small>/mo</small></span>
              <span className="cv-plan-sub">${MONTHLY} today</span>
            </span>
          </button>
        </div>

        {/* The terms, stated plainly, before they hand over a card. */}
        <p className="cv-terms">
          {plan === 'annual' ? (
            <>
              Free until <strong>{trialEndDate()}</strong>. After that it renews at{' '}
              <strong>${ANNUAL_YEAR} a year</strong> unless you cancel first. We email you the
              exact date and amount as soon as you sign up.
            </>
          ) : (
            <>
              <strong>${MONTHLY} today</strong>, then ${MONTHLY} every month until you cancel.
              The monthly plan has no free trial.
            </>
          )}
        </p>

        <button className="cv-cta" onClick={() => go('v1')} disabled={loading}>{ctaLabel}</button>
        <SignIn />
        <Trust />
        <Faq />
      </div>
      <StickyBar plan={plan} loading={loading} onGo={() => go('v1')} />
    </div>
  )
}
