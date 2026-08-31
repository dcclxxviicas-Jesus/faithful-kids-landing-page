'use client'

import { useState } from 'react'
import posthog from 'posthog-js'

/* Shared pieces for the checkout variants.

   Every fact here is verified against ground truth (see CLAUDE.md):
   310 lessons -> "300+", 31 series, ~2 min per lesson, annual $77.77/yr
   ($6.48/mo) with a 3-day trial, monthly $8.88 with no trial.

   Deliberately absent, because none of it is true:
   - "400+ lessons"            (real figure is 310)
   - "12,000+ parents"         (8 active non-test subscriptions)
   - "Screen time controls"    (no such feature exists in the app)
   - a countdown to an offer that never expires
*/

export const ANNUAL_YEAR = 77.77
export const ANNUAL_MONTH = 6.48
export const MONTHLY = 8.88
export const TRIAL_DAYS = 3
/** Full price of 12 monthly payments, for the honest saving figure. */
export const SAVED = +(MONTHLY * 12 - ANNUAL_YEAR).toFixed(2)
export const SAVED_PCT = Math.round((1 - ANNUAL_YEAR / (MONTHLY * 12)) * 100)

export type PlanId = 'annual' | 'monthly'

/** Real, verified feature list. */
export const INCLUDED = [
  '300+ video lessons, Genesis to Revelation',
  '31 series, in order — not on shuffle',
  'A quiz and reflection after every lesson',
  'Up to 5 child profiles',
  'Parent dashboard with each child’s progress',
  'Reviewed for doctrinal accuracy',
  'Catholic, Evangelical or Non-denominational',
  'No ads, ever',
]

export function useCheckout() {
  const [plan, setPlan] = useState<PlanId>('annual')
  const [loading, setLoading] = useState(false)

  function select(id: PlanId, variant: string) {
    setPlan(id)
    try { posthog.capture('plan_select', { plan: id, variant }) } catch { /* never block the UI */ }
  }

  async function go(variant: string) {
    setLoading(true)
    try { posthog.capture('checkout_continue', { plan, variant, due_today: plan === 'annual' ? 0 : MONTHLY }) } catch { /* ignore */ }
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (data.url) { window.location.href = data.url; return }
    } catch { /* fall through to the shared failure path */ }
    alert('Something went wrong. Please try again.')
    setLoading(false)
  }

  const ctaLabel = loading
    ? 'Taking you to payment…'
    : plan === 'annual' ? 'Start my 3 free days' : 'Continue to payment'

  return { plan, setPlan: select, loading, go, ctaLabel }
}

/** The exact date the trial converts, so the page can state it rather than imply it. */
export function trialEndDate() {
  const d = new Date()
  d.setDate(d.getDate() + TRIAL_DAYS)
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
}

export function Header({ back = '/' }: { back?: string }) {
  return (
    <header className="cv-header">
      <a href={back} className="cv-back">&larr; Back</a>
      <span className="cv-brand">
        <img src="/logo-sm.png" alt="" width={30} height={30} />
        Faithful Kids
      </span>
      <span className="cv-secure">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
          <rect x="4" y="10" width="16" height="11" rx="2" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        </svg>
        Secure
      </span>
    </header>
  )
}

export function Trust() {
  return (
    <div className="cv-trust">
      <span>{'✓'} 30-day money-back guarantee</span>
      <span>{'✓'} Cancel anytime</span>
      <span>{'✓'} No ads, ever</span>
      <span>{'✓'} Payments secured by Stripe</span>
    </div>
  )
}

export function SignIn() {
  return (
    <p className="cv-cta-note">
      Already have an account? <a href="https://app.faithfulkids.app/login">Sign in</a>
    </p>
  )
}

export function StickyBar({ plan, loading, onGo }: { plan: PlanId; loading: boolean; onGo: () => void }) {
  return (
    <div className="cv-sticky">
      <div className="cv-sticky-info">
        <span className="cv-sticky-price">
          {plan === 'annual' ? '$0.00 today' : `$${MONTHLY.toFixed(2)} today`}
        </span>
        <span className="cv-sticky-sub">
          {plan === 'annual' ? `Then $${ANNUAL_YEAR}/year` : 'Renews monthly'}
        </span>
      </div>
      <button className="cv-cta" onClick={onGo} disabled={loading}>
        {loading ? '…' : plan === 'annual' ? 'Start free' : 'Continue'}
      </button>
    </div>
  )
}

export const FAQS = [
  {
    q: 'What happens when the 3 days are up?',
    a: `Your first year bills at $${ANNUAL_YEAR} unless you cancel before then. The confirmation email we send the moment you sign up states the exact date, the amount, and how to cancel — so it is written down before the trial even starts.`,
  },
  {
    q: 'How do I cancel?',
    a: 'From the parent dashboard, in two taps — it opens the Stripe billing portal where you can cancel immediately. No email, no phone call, no retention script.',
  },
  {
    q: 'How long is a lesson?',
    a: 'About two minutes, then a short quiz and one reflection question. Most families run a lesson in five to ten minutes.',
  },
  {
    q: 'Can more than one child use it?',
    a: 'Yes — up to five child profiles on one subscription, each with their own age setting and progress. There are no per-child fees.',
  },
]

export function Faq({ items = FAQS }: { items?: { q: string; a: string }[] }) {
  return (
    <div className="cv-faq">
      {items.map((f) => (
        <details key={f.q} className="cv-faq-item">
          <summary className="cv-faq-q">{f.q}</summary>
          <p className="cv-faq-a">{f.a}</p>
        </details>
      ))}
    </div>
  )
}
