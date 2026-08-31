'use client'

import './variants.css'
import {
  Header, Trust, SignIn, Faq, useCheckout, INCLUDED,
  ANNUAL_YEAR, ANNUAL_MONTH, trialEndDate,
} from './kit'

/* Three ways to make the yearly plan the obvious choice WITHOUT greying the
   monthly one out. Desaturating a real, purchasable option is the crude
   version of this: it reads as a disabled control, and it makes the person who
   genuinely wants monthly feel they are being handled.

   Each of these instead gives yearly more to say than monthly has. */

export const MONTHLY = 10.99

function useMath(monthly = MONTHLY, year = ANNUAL_YEAR) {
  const monthlyYear = +(monthly * 12).toFixed(2)
  const saved = +(monthlyYear - year).toFixed(2)
  const pct = Math.round((1 - year / monthlyYear) * 100)
  const monthsFree = Math.round(12 - year / monthly)
  const yearMonth = +(year / 12).toFixed(2)
  return { monthlyYear, saved, pct, monthsFree, yearMonth }
}

function Shell({ children, plan, loading, go, ctaLabel, saved, monthly = MONTHLY, year = ANNUAL_YEAR }: {
  children: React.ReactNode; plan: string; loading: boolean
  go: () => void; ctaLabel: string; saved: number
  monthly?: number; year?: number
}) {
  const annual = plan === 'annual'
  return (
    <>
      {children}
      <button className="cv-cta" onClick={go} disabled={loading}>{ctaLabel}</button>
      <SignIn />
      <Trust />
      <h2 className="cv-inc-title">Included on both plans</h2>
      <div className="cv-inc">
        {INCLUDED.map((f) => <span key={f}><span className="cv-tick">{'✓'}</span>{f}</span>)}
      </div>
      <Faq />
      <div className="cv-sticky">
        <div className="cv-sticky-info">
          <span className="cv-sticky-price">{annual ? '$0.00 today' : `$${monthly.toFixed(2)} today`}</span>
          <span className="cv-sticky-sub">
            {annual ? `Then $${year}/yr · save $${saved}` : `$${saved} more than yearly`}
          </span>
        </div>
        <button className="cv-cta" onClick={go} disabled={loading}>
          {loading ? '…' : annual ? 'Start free' : 'Continue'}
        </button>
      </div>
    </>
  )
}

/* ---------------------------------------------------------------- TOGGLE
   One card, a segmented control on top. Neither option is uglier than the
   other — they are the same beautiful card — but yearly is preselected and
   carries the badge. The card's contents change beneath the switch.
   This is the Linear / Framer / Notion pricing pattern. */
export function ToggleTreatment({
  monthly = MONTHLY, year = ANNUAL_YEAR, tag = 'toggle',
}: { monthly?: number; year?: number; tag?: string } = {}) {
  const { plan, setPlan, loading, go, ctaLabel } = useCheckout()
  const { saved, pct, monthsFree, yearMonth } = useMath(monthly, year)
  const annual = plan === 'annual'

  return (
    <div className="cv-page">
      <Header />
      <div className="cv-wrap">
        <h1 className="cv-h1">Choose your plan</h1>
        <p className="cv-sub">Everything is included on both. Switch whenever you like.</p>

        <Shell plan={plan} loading={loading} go={() => go(tag)} ctaLabel={ctaLabel} saved={saved} monthly={monthly} year={year}>
          <div className="cv-seg">
            <button className={`cv-seg-btn ${annual ? 'on' : ''}`} onClick={() => setPlan('annual', tag)}>
              Yearly <span className="cv-seg-badge">&minus;{pct}%</span>
            </button>
            <button className={`cv-seg-btn ${!annual ? 'on' : ''}`} onClick={() => setPlan('monthly', tag)}>
              Monthly
            </button>
          </div>

          <div className={`cv-onecard ${annual ? '' : 'alt'}`}>
            <div className="cv-onecard-price">
              {annual && <span className="cv-onecard-was">${monthly.toFixed(2)}</span>}
              <span className="cv-onecard-amt">${annual ? yearMonth : monthly.toFixed(2)}</span>
              <span className="cv-onecard-per">/month</span>
            </div>
            <p className="cv-onecard-billed">
              {annual
                ? <>Billed <strong>${year}</strong> once a year</>
                : <>Billed <strong>${monthly.toFixed(2)}</strong> every month</>}
            </p>
            <ul className="cv-onecard-list">
              {annual ? (
                <>
                  <li><span className="cv-tick">{'✓'}</span>Free for 3 days &mdash; $0.00 today</li>
                  <li><span className="cv-tick">{'✓'}</span>You keep <strong>${saved}</strong> versus monthly</li>
                  <li><span className="cv-tick">{'✓'}</span>That is about <strong>{monthsFree} months free</strong></li>
                </>
              ) : (
                <>
                  <li><span className="cv-tick">{'✓'}</span>Cancel any time</li>
                  <li><span className="cv-dash">&ndash;</span>No free trial on monthly</li>
                  <li><span className="cv-dash">&ndash;</span>${saved} more over a year</li>
                </>
              )}
            </ul>
          </div>

          <p className="cv-terms">
            {annual
              ? <>Free until <strong>{trialEndDate()}</strong>, then ${year} for the year unless you cancel.</>
              : <><strong>${monthly.toFixed(2)} today</strong>, then every month until you cancel.</>}
          </p>
        </Shell>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- HERO
   Only ONE plan is a card. Monthly is a quiet line of text underneath that
   swaps the card when tapped. Nothing is greyed out because there is no
   second card to grey — the alternative is simply offered in words.
   This is what Duolingo and Calm do on mobile. */
export function HeroTreatment() {
  const { plan, setPlan, loading, go, ctaLabel } = useCheckout()
  const { saved, pct, monthsFree } = useMath()
  const annual = plan === 'annual'

  return (
    <div className="cv-page">
      <Header />
      <div className="cv-wrap">
        <h1 className="cv-h1">Start your <span className="cv-green">free trial</span></h1>
        <p className="cv-sub">300+ Bible lessons for ages 5&ndash;15, in order, with a quiz after each one.</p>

        <Shell plan={plan} loading={loading} go={() => go('hero')} ctaLabel={ctaLabel} saved={saved}>
          <div className={`cv-hero-card ${annual ? '' : 'alt'}`}>
            {annual && <span className="cv-hero-ribbon">Best value &middot; save {pct}%</span>}
            <div className="cv-hero-name">{annual ? 'Yearly' : 'Monthly'}</div>
            <div className="cv-hero-price">
              {annual && <span className="cv-hero-was">${MONTHLY}</span>}
              <span className="cv-hero-amt">${annual ? ANNUAL_MONTH : MONTHLY}</span>
              <span className="cv-hero-per">/mo</span>
            </div>
            <p className="cv-hero-billed">
              {annual
                ? <>Billed ${ANNUAL_YEAR} once a year &middot; <strong>$0.00 today</strong></>
                : <>Billed ${MONTHLY} every month &middot; <strong>${MONTHLY} today</strong></>}
            </p>
            <div className="cv-hero-rows">
              {annual ? (
                <>
                  <div><span className="cv-tick">{'✓'}</span>3 days free, then ${ANNUAL_YEAR}</div>
                  <div><span className="cv-tick">{'✓'}</span>Keeps <strong>${saved}</strong> in your pocket</div>
                  <div><span className="cv-tick">{'✓'}</span>About <strong>{monthsFree} months free</strong></div>
                </>
              ) : (
                <>
                  <div><span className="cv-tick">{'✓'}</span>Cancel any time</div>
                  <div><span className="cv-dash">&ndash;</span>No free trial</div>
                  <div><span className="cv-dash">&ndash;</span>${saved} more a year than yearly</div>
                </>
              )}
            </div>
          </div>

          <button className="cv-switch" onClick={() => setPlan(annual ? 'monthly' : 'annual', 'hero')}>
            {annual
              ? <>Prefer to pay monthly? <strong>${MONTHLY}/mo</strong> &rarr;</>
              : <>Switch to yearly and save <strong>${saved}</strong> &rarr;</>}
          </button>
        </Shell>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- TWIN
   Two cards, both white, both crisp, neither desaturated. Yearly wins on
   CONTENT rather than on colour: a gradient crown, a ribbon, and two rows of
   value that monthly has nothing to put in. Monthly stays dignified — it is
   a real option someone may genuinely want. */
export function TwinTreatment() {
  const { plan, setPlan, loading, go, ctaLabel } = useCheckout()
  const { monthlyYear, saved, pct, monthsFree } = useMath()
  const annual = plan === 'annual'

  return (
    <div className="cv-page">
      <Header />
      <div className="cv-wrap">
        <h1 className="cv-h1">Choose your plan</h1>
        <p className="cv-sub">Same everything on both. One costs ${saved} less a year and starts free.</p>

        <Shell plan={plan} loading={loading} go={() => go('twin')} ctaLabel={ctaLabel} saved={saved}>
          <div className="cv-twins">
            <button className={`cv-twin best ${annual ? 'on' : ''}`} onClick={() => setPlan('annual', 'twin')}>
              <span className="cv-twin-crown">Save {pct}%</span>
              <span className="cv-twin-name">Yearly</span>
              <span className="cv-twin-price">
                <span className="cv-twin-was">${MONTHLY}</span>
                <span className="cv-twin-amt">${ANNUAL_MONTH}</span><span className="cv-twin-per">/mo</span>
              </span>
              <span className="cv-twin-billed">${ANNUAL_YEAR} once a year</span>
              <span className="cv-twin-rows">
                <span><span className="cv-tick">{'✓'}</span>3 days free</span>
                <span><span className="cv-tick">{'✓'}</span>Save ${saved}</span>
                <span><span className="cv-tick">{'✓'}</span>~{monthsFree} months free</span>
              </span>
            </button>

            <button className={`cv-twin ${!annual ? 'on' : ''}`} onClick={() => setPlan('monthly', 'twin')}>
              <span className="cv-twin-name">Monthly</span>
              <span className="cv-twin-price">
                <span className="cv-twin-amt">${MONTHLY}</span><span className="cv-twin-per">/mo</span>
              </span>
              <span className="cv-twin-billed">${monthlyYear} across a year</span>
              <span className="cv-twin-rows">
                <span><span className="cv-tick">{'✓'}</span>Cancel any time</span>
                <span><span className="cv-tick">{'✓'}</span>Same 300+ lessons</span>
                <span><span className="cv-tick">{'✓'}</span>Switch to yearly whenever</span>
              </span>
            </button>
          </div>

          <p className="cv-terms">
            {annual
              ? <><strong>$0.00 today.</strong> Free until {trialEndDate()}, then ${ANNUAL_YEAR} for the year &mdash; ${saved} less than paying monthly.</>
              : <><strong>${MONTHLY} today</strong>, then every month. Over a year that is ${saved} more than the yearly plan.</>}
          </p>
        </Shell>
      </div>
    </div>
  )
}
