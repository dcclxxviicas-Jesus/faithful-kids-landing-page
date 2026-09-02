'use client'

import '../variants.css'
import { VideoTile } from '../../components/VideoTile'
import { STORIES } from '../../components/stories'
import {
  Header, Trust, SignIn, StickyBar, Faq, useCheckout,
  ANNUAL_YEAR, ANNUAL_MONTH, MONTHLY, SAVED, trialEndDate,
} from '../kit'

/* VARIANT 3 — "See it before you pay"
   Every other page on the site now shows a real lesson. Checkout — the one
   place a parent is about to commit ($97 today) — shows nothing at all. Plenty of
   people reach /checkout straight from a pricing link or a search result and
   have never watched a single lesson.
   Uses the site's one video pattern, so it downloads nothing until pressed. */

// Resolve by name, never by index — the array order has shifted before.
const LESSON = STORIES.find((s) => s.title === 'In the Beginning: Creation')!

export default function V3() {
  const { plan, setPlan, loading, go, ctaLabel } = useCheckout()

  return (
    <div className="cv-page">
      <Header />
      <div className="cv-wrap cv-wrap-wide">
        <h1 className="cv-h1">Start your <span className="cv-green">free trial</span></h1>
        <p className="cv-sub">
          300+ lessons across 31 series, Genesis to Revelation. About two minutes each,
          with a quiz after every one.
        </p>

        <div className="cv-split">
          <div>
            <div className="cv-plans">
              <button className={`cv-plan ${plan === 'annual' ? 'on' : ''}`} onClick={() => setPlan('annual', 'v3')}>
                <span className="cv-radio" />
                <span className="cv-plan-mid">
                  <span className="cv-plan-top">
                    <span className="cv-plan-name">Yearly</span>
                    <span className="cv-flag">3 days free</span>
                    <span className="cv-flag cv-flag-save">Save ${SAVED}</span>
                  </span>
                  <span className="cv-plan-note">Billed ${ANNUAL_YEAR} a year</span>
                </span>
                <span className="cv-plan-right">
                  <span className="cv-plan-big">${ANNUAL_MONTH}<small>/mo</small></span>
                  <span className="cv-plan-sub">$0.00 today</span>
                </span>
              </button>

              <button className={`cv-plan ${plan === 'monthly' ? 'on' : ''}`} onClick={() => setPlan('monthly', 'v3')}>
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

            <p className="cv-terms">
              {plan === 'annual' ? (
                <>Free until <strong>{trialEndDate()}</strong>, then ${ANNUAL_YEAR} a year unless you cancel.</>
              ) : (
                <><strong>${MONTHLY} today</strong>, then every month until you cancel.</>
              )}
            </p>

            <button className="cv-cta" onClick={() => go('v3')} disabled={loading}>{ctaLabel}</button>
            <SignIn />
            <Trust />
            <Faq />
          </div>

          <aside className="cv-video-panel">
            <h3>Watch a real lesson first</h3>
            <p>No signup, no email. This is exactly what your child sees.</p>
            <VideoTile
              src={LESSON.src}
              poster={LESSON.poster}
              title={LESSON.title}
              badge={LESSON.badge}
              blurb={LESSON.blurb}
              location="checkout-v3"
              ctaLabel="See more videos like this"
            />
            <p className="cv-vid-foot">
              One of <strong>310</strong> lessons. Every one runs about two minutes and ends
              with a quiz.
            </p>
          </aside>
        </div>
      </div>
      <StickyBar plan={plan} loading={loading} onGo={() => go('v3')} />
    </div>
  )
}
