'use client'

import '../variants.css'
import {
  Header, Trust, SignIn, StickyBar, Faq, useCheckout, INCLUDED,
  ANNUAL_YEAR, ANNUAL_MONTH, MONTHLY, SAVED, TRIAL_DAYS,
} from '../kit'

/* VARIANT 4 — "Nothing hidden"
   Replaces the fake countdown with the real dates. The number one reason a
   parent abandons a trial checkout is not price, it is "when exactly am I
   charged and will I notice in time" — and the current page answers it nowhere.

   Note the middle step says the confirmation email carries the terms. It does
   NOT promise a reminder before billing: the 3-day trial deliberately has no
   pre-billing reminder email (see CLAUDE.md), so claiming one would be false. */

function dayLabel(offset: number) {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

export default function V4() {
  const { plan, setPlan, loading, go, ctaLabel } = useCheckout()
  const annual = plan === 'annual'

  return (
    <div className="cv-page">
      <Header />
      <div className="cv-wrap">
        <h1 className="cv-h1">Three free days. <span className="cv-green">Nothing hidden.</span></h1>
        <p className="cv-sub">Here is exactly what happens, and when.</p>

        {annual ? (
          <div className="cv-timeline">
            <div className="cv-tl-title">Your next three days</div>

            <div className="cv-tl-row">
              <div className="cv-tl-dot">{'✓'}</div>
              <div className="cv-tl-body">
                <div className="cv-tl-day">Today &middot; {dayLabel(0)}</div>
                <div className="cv-tl-what">Full access. You are charged $0.00.</div>
                <div className="cv-tl-detail">
                  All 300+ lessons unlock immediately. We confirm your trial end date and the
                  renewal price by email straight away, so it is in writing before you start.
                </div>
              </div>
            </div>

            <div className="cv-tl-row">
              <div className="cv-tl-dot">2</div>
              <div className="cv-tl-body">
                <div className="cv-tl-day">{dayLabel(1)} &ndash; {dayLabel(2)}</div>
                <div className="cv-tl-what">Watch as much as you like.</div>
                <div className="cv-tl-detail">
                  Cancel in two taps from the parent dashboard at any point and you are never
                  charged a cent.
                </div>
              </div>
            </div>

            <div className="cv-tl-row">
              <div className="cv-tl-dot charge">$</div>
              <div className="cv-tl-body">
                <div className="cv-tl-day">{dayLabel(TRIAL_DAYS)}</div>
                <div className="cv-tl-what">${ANNUAL_YEAR} for the year, if you stayed.</div>
                <div className="cv-tl-detail">
                  That is ${ANNUAL_MONTH} a month. Still covered by the 30-day money-back
                  guarantee, so even then you can change your mind.
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="cv-timeline">
            <div className="cv-tl-title">On the monthly plan</div>
            <div className="cv-tl-row">
              <div className="cv-tl-dot charge">$</div>
              <div className="cv-tl-body">
                <div className="cv-tl-day">Today &middot; {dayLabel(0)}</div>
                <div className="cv-tl-what">${MONTHLY} charged now.</div>
                <div className="cv-tl-detail">
                  The monthly plan has no free trial. It renews every month until you cancel,
                  and the 30-day money-back guarantee still applies.
                </div>
              </div>
            </div>
            <div className="cv-tl-row">
              <div className="cv-tl-dot">{'↻'}</div>
              <div className="cv-tl-body">
                <div className="cv-tl-day">{dayLabel(30)}</div>
                <div className="cv-tl-what">${MONTHLY} again, and so on.</div>
                <div className="cv-tl-detail">
                  The yearly plan costs ${SAVED} less over the same twelve months and starts
                  with three free days.
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="cv-plans">
          <button className={`cv-plan ${annual ? 'on' : ''}`} onClick={() => setPlan('annual', 'v4')}>
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

          <button className={`cv-plan ${!annual ? 'on' : ''}`} onClick={() => setPlan('monthly', 'v4')}>
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

        <button className="cv-cta" onClick={() => go('v4')} disabled={loading}>{ctaLabel}</button>
        <SignIn />
        <Trust />

        <h2 className="cv-inc-title">What you get either way</h2>
        <div className="cv-inc">
          {INCLUDED.map((f) => (
            <span key={f}><span className="cv-tick">{'✓'}</span>{f}</span>
          ))}
        </div>

        <Faq />
      </div>
      <StickyBar plan={plan} loading={loading} onGo={() => go('v4')} />
    </div>
  )
}
