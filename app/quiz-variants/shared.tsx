'use client'

import { useEffect, useRef, useState } from 'react'
import posthog from 'posthog-js'
import { VideoTile } from '../components/VideoTile'
import { STORIES } from '../components/stories'
import '../checkout-variants/variants.css'
import './qv.css'

/* Post-quiz checkout, three treatments.

   What the data says this page has to do: 131 people reached it in 90 days
   and 37 clicked through to payment (28%), but only FOUR ever tapped a plan.
   Nearly everyone takes the annual default. So this is not a pricing screen —
   the quiz already did the persuading. Its job is to confirm what they built,
   be believable, and get the tap.

   Removed from all three, because none of it is true:
   - "908 families taking this quiz right now" (144 people started it in 90 days)
   - "Your plan is reserved for 09:57" — nothing is reserved, and it ran twice
   - "Built-in daily limits ... when time's up, it pauses gently" — there is no
     screen-time feature in the app, and this was shown precisely to parents
     who said too much screen time was their problem
   - a lesson count of 400+ (310) and "20+" series (31)
   - three named testimonials nobody said
*/

export const ANNUAL = 97
export const ANNUAL_MO = 8.08
export const MONTHLY = 12.99
export const SAVED = +(MONTHLY * 12 - ANNUAL).toFixed(2)
export const PCT = Math.round((1 - ANNUAL / (MONTHLY * 12)) * 100)

export type Answers = Record<string, string>

export function useBuy(variant: string, extra: Record<string, unknown> = {}) {
  const [plan, setPlan] = useState<'annual' | 'monthly'>('annual')
  const [loading, setLoading] = useState(false)
  function choose(p: 'annual' | 'monthly') {
    setPlan(p)
    try { posthog.capture('quiz_plan_select', { plan: p, variant, ...extra }) } catch { /* never block */ }
  }
  async function buy(answers: Answers) {
    setLoading(true)
    try { posthog.capture('quiz_checkout_click', { ...answers, plan, variant, ...extra }) } catch { /* ignore */ }
    try {
      const r = await fetch('/api/checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const d = await r.json()
      if (d.url) { window.location.href = d.url; return }
    } catch { /* shared failure path below */ }
    setLoading(false)
  }
  return { plan, choose, loading, buy }
}

/** The approved /checkout price block, reused so the two pages feel like one product. */
export function PriceBlock({ plan, choose, loading, onBuy, ctaRef }: {
  plan: 'annual' | 'monthly'
  choose: (p: 'annual' | 'monthly') => void
  loading: boolean
  onBuy: () => void
  ctaRef?: React.Ref<HTMLButtonElement>
}) {
  const annual = plan === 'annual'
  return (
    <>
      <div className="cv-seg">
        <button className={`cv-seg-btn ${annual ? 'on' : ''}`} onClick={() => choose('annual')}>
          Yearly <span className="cv-seg-badge">&minus;{PCT}%</span>
        </button>
        <button className={`cv-seg-btn ${!annual ? 'on' : ''}`} onClick={() => choose('monthly')}>
          Monthly
        </button>
      </div>

      <div className={`cv-onecard ${annual ? '' : 'alt'}`}>
        <div className="cv-onecard-price">
          {annual && <span className="cv-onecard-was">${MONTHLY}</span>}
          <span className="cv-onecard-amt">${annual ? ANNUAL_MO : MONTHLY}</span>
          <span className="cv-onecard-per">/month</span>
        </div>
        <p className="cv-onecard-billed">
          {annual ? <>Billed <strong>${ANNUAL}</strong> once a year</> : <>Billed <strong>${MONTHLY}</strong> every month</>}
        </p>
        <ul className="cv-onecard-list">
          {annual ? (
            <>
              <li><span className="cv-tick">{'✓'}</span>Free for 3 days &mdash; $0.00 today</li>
              <li><span className="cv-tick">{'✓'}</span><span><strong>${SAVED} cheaper</strong> than 12 monthly payments (${(MONTHLY * 12).toFixed(2)})</span></li>
            </>
          ) : (
            <>
              <li><span className="cv-tick">{'✓'}</span>Cancel any time</li>
              <li><span className="cv-dash">&ndash;</span>No free trial on monthly</li>
            </>
          )}
        </ul>
      </div>

      <button ref={ctaRef} className="cv-cta" onClick={onBuy} disabled={loading}>
        {loading ? 'Taking you to payment…' : annual ? 'Start my 3 free days' : 'Continue to payment'}
      </button>
      <p className="qv-fine">
        {annual
          ? <>$0.00 today. Cancel any time in the first three days and you are charged nothing.</>
          : <>${MONTHLY} today, then every month until you cancel.</>}
      </p>
    </>
  )
}

export function TrustRow() {
  return (
    <div className="qv-trust">
      <span>{'✓'} 30-day money-back guarantee</span>
      <span>{'✓'} Cancel anytime</span>
      <span>{'✓'} No ads, ever</span>
    </div>
  )
}

/* Show the bar only once the real button has scrolled away.

   It used to be display:flex from first paint. That was fine when the price
   sat below the fold, but the reorder put the primary CTA at ~549px — so a
   visitor at scroll 0 saw "Start my 3 free days" and a sticky "Start free" at
   the same time: two buttons for one action, one of them covering the page.
   Same behaviour the blog sticky bar already has. */
export function useStickyAfter<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [past, setPast] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(
      ([e]) => setPast(!e.isIntersecting && e.boundingClientRect.top < 0),
      { threshold: 0 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return { ref, past }
}

export function StickyBuy({ plan, loading, onBuy, show = true }: { plan: string; loading: boolean; onBuy: () => void; show?: boolean }) {
  return (
    <div className={`qv-sticky ${show ? '' : 'is-hidden'}`}>
      <div>
        <strong>{plan === 'annual' ? '$0.00 today' : `$${MONTHLY} today`}</strong>
        <span>{plan === 'annual' ? `Then $${ANNUAL} for the year` : `$${SAVED} more than yearly`}</span>
      </div>
      <button className="cv-cta" onClick={onBuy} disabled={loading}>
        {loading ? '…' : plan === 'annual' ? 'Start free' : 'Continue'}
      </button>
    </div>
  )
}

/** Verified facts only — checked against check-counts.py and the app source. */
export const GETS = (age: string, denom: string) => [
  '300+ video lessons narrated by Jesus',
  `Stories matched to ages ${age}`,
  `${denom} learning path`,
  'A quiz and reflection after every story',
  'Parent dashboard with each child’s progress',
  'Up to 5 kid profiles',
  'No ads, ever',
]

export const LESSON = STORIES.find(s => s.title === 'A Baby in a Basket')!
export { VideoTile }
