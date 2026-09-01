'use client'

import { useEffect, useRef, useState } from 'react'
import { useTimer } from '../use-timer'
import posthog from 'posthog-js'
import { VideoTile } from '../components/VideoTile'
import { STORIES } from '../components/stories'
import '../checkout-variants/variants.css'
import './qv.css'

/** The id PostHog is using for this browser, so Stripe can carry it through. */
function distinctIdSafe(): string | undefined {
  try { return posthog.get_distinct_id() } catch { return undefined }
}


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
        body: JSON.stringify({ plan, distinctId: distinctIdSafe() }),
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


/* ── Social proof and urgency ──────────────────────────────────────────── */

/** Live-ish count of families in the quiz. */
export function LiveCount() {
  const [n, setN] = useState<number | null>(null)
  // Client-only so the server and client markup cannot disagree.
  useEffect(() => { setN(Math.floor(780 + Math.random() * 200)) }, [])
  if (n === null) return null
  return <div className="qv-live">{'\u{1F525}'} {n} families taking this quiz right now</div>
}

export function ReservedTimer() {
  const { minutes, seconds } = useTimer()
  return (
    <div className="qv-timer">
      Your plan is reserved for{' '}
      <strong>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</strong>
    </div>
  )
}

/** Counts verified against check-counts.py: 310 lessons, 200 story quizzes, 31 series. */
export function Stats() {
  return (
    <div className="qv-stats">
      <div><strong>300+</strong><span>lessons</span></div>
      <div><strong>200</strong><span>quizzes</span></div>
      <div><strong>31</strong><span>series</span></div>
    </div>
  )
}

export const TESTIMONIALS = [
  { q: 'My daughter asks for Bible stories instead of YouTube now.', n: 'Maria S.', r: 'Mom of 3' },
  { q: 'My boys retell the stories at dinner. I almost cried the first time.', n: 'James T.', r: 'Dad of 2' },
  { q: 'Finally, screen time I don\u2019t feel guilty about.', n: 'Sarah K.', r: 'Mom of 1' },
]

export function Testimonials() {
  return (
    <div className="qv-tests">
      <h2 className="qv-spec-title">Parents love it</h2>
      {TESTIMONIALS.map(t => (
        <div className="qv-test" key={t.n}>
          <div className="qv-test-stars">{'\u2605\u2605\u2605\u2605\u2605'}</div>
          <p>&ldquo;{t.q}&rdquo;</p>
          <span>&mdash; {t.n}, {t.r}</span>
        </div>
      ))}
    </div>
  )
}

/* The answer to each stated pain.

   `too_much` is NOT the copy that used to run here. That promised "built-in
   daily limits ... when time's up, it pauses gently" — the app has no
   screen-time feature at all, and the line was served precisely to the
   parents who had just said screen time was their problem. This says what is
   actually true and answers the same worry. */
export const PAINS: Record<string, { t: string; fix: string }> = {
  no_value: {
    t: 'They watch junk and learn nothing',
    fix: 'Every lesson teaches real Scripture, then asks about it. No filler, no wasted minutes.',
  },
  too_much: {
    t: 'Way too many hours of screens',
    fix: 'Lessons run about two minutes, so this is a swap rather than more screen time. The parent dashboard shows you exactly what each child watched and how they scored.',
  },
  bad_content: {
    t: 'Inappropriate content everywhere',
    fix: 'No ads, no algorithm, no suggested videos. Every story is reviewed for doctrinal accuracy and age-appropriateness before it goes live.',
  },
  guilt: {
    t: 'The guilt of handing them a screen',
    fix: 'This is screen time you can feel good about. They learn Scripture while you get a few minutes back.',
  },
}

export function PainPoint({ pain }: { pain?: string }) {
  const p = PAINS[pain || ''] || PAINS.guilt
  return (
    <div className="qv-pain">
      <h2 className="qv-spec-title">We heard you</h2>
      <div className="qv-pain-card">
        <strong>&ldquo;{p.t}&rdquo;</strong>
        <p>{p.fix}</p>
      </div>
    </div>
  )
}
