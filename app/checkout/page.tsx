'use client'

import { useState, useEffect } from 'react'
import posthog from 'posthog-js'
import { useTimer } from '../use-timer'
import './checkout.css'

const PLANS = [
  {
    id: 'annual',
    name: 'Annual Plan',
    price: 7.99,
    period: '/mo',
    total: 95.88,
    weekly: 1.84,
    savings: 47,
    label: 'Best Value',
  },
  {
    id: 'monthly',
    name: 'Monthly Plan',
    price: 14.99,
    period: '/mo',
    total: 14.99,
    weekly: 3.46,
    savings: null,
    label: null,
  },
]

const FEATURES = [
  'New Bible story videos added weekly',
  'Doctrinally reviewed content',
  'Up to 5 child profiles',
  'Parent dashboard & reports',
  'Screen time controls',
  'Zero ads, ever',
  'Age-specific content for your child',
  'Denomination-specific paths',
]

const TESTIMONIALS = [
  { quote: 'Best decision for our family. My kids ask for Bible stories instead of YouTube now.', name: 'Maria S.' },
  { quote: 'Cancelled YouTube Kids. This replaced it completely. Worth every penny.', name: 'Michael T.' },
  { quote: 'The parent dashboard alone is worth the subscription. I know exactly what they watch.', name: 'Sarah R.' },
]

export default function Checkout() {
  const [selected, setSelected] = useState('annual')
  const { minutes, seconds } = useTimer()

  const plan = PLANS.find((p) => p.id === selected)!

  useEffect(() => {
  }, [])

  const [loading, setLoading] = useState(false)

  async function handleContinue() {
    setLoading(true)
    posthog.capture('checkout_continue', {
      plan: selected,
      price: plan.price,
      total: plan.total,
    })

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selected }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Something went wrong. Please try again.')
        setLoading(false)
      }
    } catch {
      alert('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  function handlePlanSelect(id: string) {
    setSelected(id)
    posthog.capture('plan_select', { plan: id })
  }

  return (
    <div className="checkout-page">
      {/* Header */}
      <header className="checkout-header">
        <a href="/" className="checkout-back">&larr; Back</a>
        <div className="checkout-logo"><img src="/logo.png" alt="Faithful Kids" className="checkout-logo-img" /> Faithful Kids</div>
        <span className="checkout-secure">Secure checkout</span>
      </header>

      {/* Promo banner */}
      <div className="promo-banner">
        <span className="promo-text">Limited time offer!</span>
        <span className="promo-timer">
          {String(minutes).padStart(2, '0')} min : {String(seconds).padStart(2, '0')} sec
        </span>
      </div>

      <div className="checkout-layout">
        {/* Left column */}
        <div className="checkout-main">
          <h1>Choose your plan</h1>
          <p className="checkout-sub">The longer you commit, the more you save.</p>

          {/* Content depth */}
          <div className="checkout-depth">
            <span className="checkout-depth-num">400+</span>
            <span className="checkout-depth-label">lessons, quizzes, and activities. New content every week.</span>
          </div>

          {/* Plan cards */}
          <div className="plan-list">
            {PLANS.map((p) => (
              <button
                key={p.id}
                className={`plan-card ${selected === p.id ? 'selected' : ''}`}
                onClick={() => handlePlanSelect(p.id)}
              >
                <div className="plan-radio">
                  <div className={`radio-dot ${selected === p.id ? 'active' : ''}`} />
                </div>
                <div className="plan-info">
                  <div className="plan-name-row">
                    <span className="plan-name">{p.name}</span>
                    {p.label && <span className={`plan-label ${p.id === 'annual' ? 'best' : 'popular'}`}>{p.label}</span>}
                    {p.savings && <span className="plan-save">SAVE {p.savings}%</span>}
                  </div>
                  <span className="plan-total">${p.total.toFixed(2)} total</span>
                </div>
                <div className="plan-price-col">
                  <span className="plan-weekly">${p.weekly.toFixed(2)}/week</span>
                  <span className="plan-monthly">${p.price.toFixed(2)} {p.period}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Mobile-only checkout button */}
          <div className="mobile-checkout-btn">
            <button className="btn-checkout" onClick={handleContinue} disabled={loading}>
              {loading ? 'Redirecting to payment...' : 'Continue to Payment'}
            </button>
            <p style={{ textAlign: 'center', margin: '12px 0 0', fontSize: '14px', color: '#888' }}>
              Already have an account?{' '}
              <a href="https://app.faithfulkids.app/login" style={{ color: '#059669', fontWeight: 700, textDecoration: 'none' }}>
                Sign in
              </a>
            </p>
          </div>

          {/* What's included */}
          <div className="checkout-includes">
            <h3>What's included:</h3>
            <div className="includes-grid">
              {FEATURES.map((f) => (
                <span key={f} className="include-item">✓ {f}</span>
              ))}
            </div>
          </div>

          {/* Testimonials */}
          <div className="checkout-testimonials">
            <h3>What parents say:</h3>
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="checkout-review">
                <div className="review-stars">★★★★★</div>
                <p className="review-quote">"{t.quote}"</p>
                <div className="review-author">
                  <div className="review-avatar">{t.name[0]}</div>
                  <span className="review-name">{t.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column - Order Summary */}
        <div className="checkout-sidebar">
          <div className="summary-card">
            <h2>Order Summary</h2>
            <div className="summary-plan">
              <div>
                <p className="summary-plan-name">{plan.name}</p>
                <p className="summary-plan-desc">Bible Story Videos for Kids</p>
              </div>
              <p className="summary-plan-price">${plan.total.toFixed(2)}</p>
            </div>
            <div className="summary-line">
              <span>Per month</span>
              <span>${plan.price.toFixed(2)}/mo</span>
            </div>
            {plan.savings && (
              <div className="summary-line savings">
                <span>You save</span>
                <span>{plan.savings}% off monthly price</span>
              </div>
            )}
            <div className="summary-total">
              <span>Total today</span>
              <span>${plan.total.toFixed(2)}</span>
            </div>

            <button className="btn-checkout" onClick={handleContinue} disabled={loading}>
              {loading ? 'Redirecting to payment...' : 'Continue to Payment'}
            </button>

            <p style={{ textAlign: 'center', margin: '12px 0 0', fontSize: '14px', color: '#888' }}>
              Already have an account?{' '}
              <a href="https://app.faithfulkids.app/login" style={{ color: '#059669', fontWeight: 700, textDecoration: 'none' }}>
                Sign in
              </a>
            </p>

            <div className="summary-badges">
              <span>✓ 30-day money-back guarantee</span>
              <span>✓ Zero ads, subscription only</span>
              <span>✓ Up to 5 child profiles</span>
              <span>✓ Secure checkout</span>
              <span>★ 4.9/5 from 12,000+ parents</span>
            </div>

            <p className="summary-refund">
              Not happy? Full refund within 30 days. No questions asked.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
