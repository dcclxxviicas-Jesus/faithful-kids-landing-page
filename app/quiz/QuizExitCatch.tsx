'use client'

import { useEffect, useRef, useState } from 'react'
import posthog from 'posthog-js'
import { EmailCaptureCard } from '../blog/EmailCaptureCard'
import { ANNUAL } from '../quiz-variants/shared'

/* Derived, never hardcoded: a reprice can't leave a stale figure here. */
const OFF_PCT = 20
const ANNUAL_OFF = +(ANNUAL * (1 - OFF_PCT / 100)).toFixed(2)

// Abandonment catch on the quiz RESULT page only: when a non-buyer moves to
// leave the plan page.
//
// PARENT path (Oct 5 2026, owner's call): a ONE-TIME 20% discount on the
// annual plan — the Cal AI decline-offer pattern — with "email me the plan"
// as the quiet fallback (which feeds the quiz-plan recovery drip).
// "One-time" is enforced, not implied: a localStorage flag means this
// browser never sees the offer twice, so the copy stays true.
// KID path: email-only. No discounts are ever shown on a screen a child
// may still be holding.

export function QuizExitCatch({ answers, path }: { answers: Record<string, string>; path: 'kid' | 'parent' | null }) {
  const [show, setShow] = useState(false)
  const [mode, setMode] = useState<'offer' | 'email'>(path === 'kid' ? 'email' : 'offer')
  const [claiming, setClaiming] = useState(false)
  const triggered = useRef(false)
  const mountedAt = useRef(0)
  const lastY = useRef(0)
  const upDistance = useRef(0)

  function trigger(source: string) {
    if (triggered.current) return
    try {
      // localStorage, not sessionStorage: the offer says "one time" and a
      // flag that survives the session is what makes that sentence true.
      if (localStorage.getItem('fk_decline_offer_shown')) return
      localStorage.setItem('fk_decline_offer_shown', '1')
    } catch { /* private mode */ }
    triggered.current = true
    setShow(true)
    if (path === 'kid') {
      posthog.capture('email_capture_shown', { source: 'quiz-exit', trigger: source, path })
    } else {
      posthog.capture('decline_offer_shown', { trigger: source, path })
    }
  }

  useEffect(() => {
    mountedAt.current = Date.now()

    function armed() {
      // Give the result page a fair chance to sell before catching exits
      return Date.now() - mountedAt.current > 8000
    }

    function onMouseLeave(e: MouseEvent) {
      if (e.clientY < 10 && window.innerWidth >= 768 && armed()) trigger('mouse_leave')
    }

    function onScroll() {
      const y = window.scrollY
      if (y < lastY.current && y > window.innerHeight && armed()) {
        upDistance.current += lastY.current - y
        if (upDistance.current > 350 && window.innerWidth < 768) trigger('scroll_up')
      } else if (y > lastY.current) {
        upDistance.current = 0
      }
      lastY.current = y
    }

    document.addEventListener('mouseleave', onMouseLeave)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      document.removeEventListener('mouseleave', onMouseLeave)
      window.removeEventListener('scroll', onScroll)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function claim() {
    setClaiming(true)
    posthog.capture('decline_offer_claim', { path })
    try {
      let distinctId: string | undefined
      try { distinctId = posthog.get_distinct_id() } catch { /* fine */ }
      const r = await fetch('/api/checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'annual', discount: true, distinctId }),
      })
      const d = await r.json()
      if (d.url) { window.location.href = d.url; return }
    } catch { /* fall through to re-enable the button */ }
    setClaiming(false)
  }

  if (!show) return null

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
      }}
      onClick={() => setShow(false)}
    >
      <div
        style={{
          background: '#fff', width: 'min(480px, 94vw)', borderRadius: '20px',
          padding: '26px 24px', textAlign: 'center', maxHeight: '90vh', overflowY: 'auto',
        }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={() => setShow(false)}
          aria-label="Close"
          style={{ float: 'right', background: 'none', border: 'none', fontSize: '1.3rem', color: '#999', cursor: 'pointer', lineHeight: 1 }}
        >
          ✕
        </button>
        {mode === 'offer' ? (
          <>
            <div style={{ fontSize: '2rem', clear: 'both' }}>🎁</div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '4px 0 6px' }}>
              Before you go — one-time offer
            </h2>
            <p style={{ color: '#555', fontSize: '0.93rem', margin: '0 0 14px' }}>
              Start the yearly plan now and take <strong>{OFF_PCT}% off your first year</strong>:
              7 days free, then <strong>${ANNUAL_OFF}</strong> instead of ${ANNUAL}. Renews at
              the normal ${ANNUAL}/yr after. We only show this once.
            </p>
            <button
              onClick={claim}
              disabled={claiming}
              style={{
                width: '100%', background: '#16a34a', color: '#fff', border: 'none',
                borderRadius: '999px', padding: '14px 20px', fontSize: '1rem',
                fontWeight: 800, cursor: 'pointer',
              }}
            >
              {claiming ? 'Taking you to payment…' : `Claim ${OFF_PCT}% off — $0.00 today`}
            </button>
            <p style={{ color: '#9ca3af', fontSize: '0.78rem', margin: '10px 0 0' }}>
              Cancel any time in the first 7 days and you&apos;re charged nothing.
            </p>
            <button
              onClick={() => { setMode('email'); posthog.capture('decline_offer_email', { path }) }}
              style={{
                background: 'none', border: 'none', color: '#9ca3af', fontSize: '0.85rem',
                fontWeight: 600, cursor: 'pointer', textDecoration: 'underline',
                textUnderlineOffset: '3px', marginTop: '12px',
              }}
            >
              Not now — email me the plan instead
            </button>
          </>
        ) : (
          <>
            <div style={{ fontSize: '2rem', clear: 'both' }}>💌</div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '4px 0 6px' }}>
              Before you go — keep {path === 'kid' ? 'the adventure' : 'your plan'}
            </h2>
            <p style={{ color: '#555', fontSize: '0.93rem', margin: '0 0 4px' }}>
              We&apos;ll email you a link that brings {path === 'kid' ? 'the adventure' : 'the whole plan'} back
              any time — day one stays free to watch, no commitment.
            </p>
            <EmailCaptureCard
              magnet="quiz-plan"
              source="quiz-exit"
              sourcePost="quiz"
              quizAnswers={(() => { const { child_name: _cn, ...safe } = answers; return safe })()}
              title="📬 Email me the plan"
              subtitle=""
            />
          </>
        )}
      </div>
    </div>
  )
}
