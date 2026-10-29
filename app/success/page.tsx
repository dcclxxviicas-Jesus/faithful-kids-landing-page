import type { CSSProperties } from 'react'
import PurchaseBeacon from './PurchaseBeacon'

/* Post-purchase hop. Stripe sends web buyers here (faithfulkids.app/success)
   before the app's /activate so that:
   1. purchase_complete fires under the same browser distinct_id that did the
      quiz and the checkout click (see PurchaseBeacon).
   2. Google Ads has a faithfulkids.app URL to count as a purchase conversion.

   SERVER component on purpose: the "Continue" button is rendered into the
   HTML from the query string, so a paying customer is never stranded even if
   JavaScript fails or the auto-forward does not fire. This page is the money
   path; that button is non-negotiable.

   Without a session_id (bookmark, bare revisit): no beacon, no redirect, so
   neither PostHog nor the Google Ads URL goal overcounts. */

const ACTIVATE = 'https://app.faithfulkids.app/activate'
const LOGIN = 'https://app.faithfulkids.app/login'

// Any non-empty session_id is treated as a purchase. Validating the Stripe id
// format here would buy almost nothing and could strand a real buyer if the
// format ever changed; /activate does the real verification against Stripe.

const page: CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#faf8f3',
  padding: 24,
}
const card: CSSProperties = {
  maxWidth: 520,
  width: '100%',
  textAlign: 'center',
  background: 'white',
  borderRadius: 20,
  padding: '44px 32px',
  boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
}
const button: CSSProperties = {
  display: 'block',
  width: '100%',
  boxSizing: 'border-box',
  padding: '18px 28px',
  background: '#16a34a',
  color: 'white',
  borderRadius: 14,
  textDecoration: 'none',
  fontWeight: 800,
  fontSize: '1.1rem',
  lineHeight: 1.3,
  boxShadow: '0 4px 0 #15803d',
}
const h1: CSSProperties = { fontSize: '1.7rem', fontWeight: 800, marginBottom: 8, color: '#1e293b' }
const lead: CSSProperties = { fontSize: '1.05rem', color: '#4b5563', marginBottom: 24, lineHeight: 1.6 }

type Search = Record<string, string | string[] | undefined>

export default async function Success({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams
  const raw = sp.session_id
  const sessionId = typeof raw === 'string' && raw.trim() ? raw.trim() : null

  if (sessionId) {
    const href = `${ACTIVATE}?session_id=${encodeURIComponent(sessionId)}`
    return (
      <div style={page}>
        <div style={card}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>🎉</div>
          <h1 style={h1}>Payment confirmed</h1>
          <p style={lead}>One more step: set up your account so your kids can start watching.</p>
          <a href={href} style={button} data-testid="continue-activate">
            Continue to set up your account →
          </a>
          <PurchaseBeacon sessionId={sessionId} href={href} />
        </div>
      </div>
    )
  }

  return (
    <div style={page}>
      <div style={card}>
        <div style={{ fontSize: '3rem', marginBottom: 12 }}>👋</div>
        <h1 style={h1}>Welcome to Faithful Kids</h1>
        <p style={lead}>Already have an account? Sign in to keep watching. Looking around? Head back home.</p>
        <a href={LOGIN} style={button}>Sign in to the app →</a>
        <a href="/" style={{ display: 'inline-block', marginTop: 16, color: '#16a34a', fontWeight: 700, textDecoration: 'none', fontSize: '0.95rem' }}>
          Back to faithfulkids.app
        </a>
      </div>
    </div>
  )
}
