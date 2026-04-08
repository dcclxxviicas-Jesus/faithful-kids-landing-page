'use client'

import { useEffect } from 'react'
import posthog from 'posthog-js'

export default function Success() {
  useEffect(() => {
    posthog.capture('purchase_complete')
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#faf8f3',
      padding: 24,
    }}>
      <div style={{
        maxWidth: 520,
        textAlign: 'center',
        background: 'white',
        borderRadius: 20,
        padding: '48px 36px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
      }}>
        <div style={{ fontSize: '3rem', marginBottom: 16 }}>🎉</div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 8, color: '#1e293b' }}>
          Welcome to FaithfulKids!
        </h1>
        <p style={{ fontSize: '1.05rem', color: '#4b5563', marginBottom: 24, lineHeight: 1.6 }}>
          Your 7-day free trial has started. Your kids can start watching Bible stories right now.
        </p>
        <div style={{
          background: '#e6f4ea',
          borderRadius: 12,
          padding: '16px 20px',
          marginBottom: 24,
          textAlign: 'left',
        }}>
          <p style={{ fontSize: '0.9rem', color: '#16a34a', fontWeight: 600, marginBottom: 8 }}>
            What happens next:
          </p>
          <ul style={{ fontSize: '0.88rem', color: '#4b5563', paddingLeft: 18, lineHeight: 1.8 }}>
            <li>Your trial is active for 7 days, completely free</li>
            <li>You will not be charged until the trial ends</li>
            <li>Cancel anytime from your account if it is not for you</li>
            <li>We will send setup instructions to your email</li>
          </ul>
        </div>
        <a
          href="/"
          style={{
            display: 'inline-block',
            padding: '14px 32px',
            background: '#4338ca',
            color: 'white',
            borderRadius: 12,
            textDecoration: 'none',
            fontWeight: 700,
            fontSize: '0.95rem',
          }}
        >
          Back to Home
        </a>
        <p style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: 16 }}>
          Questions? Email us anytime.
        </p>
      </div>
    </div>
  )
}
