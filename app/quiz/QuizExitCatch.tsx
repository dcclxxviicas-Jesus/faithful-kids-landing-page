'use client'

import { useEffect, useRef, useState } from 'react'
import posthog from 'posthog-js'
import { EmailCaptureCard } from '../blog/EmailCaptureCard'

// Abandonment catch on the quiz RESULT page only: when a non-buyer moves to
// leave the plan page, offer to email them their family's plan + the free
// 30-Day Challenge. Buyers and active readers never see it.

export function QuizExitCatch({ answers, path }: { answers: Record<string, string>; path: 'kid' | 'parent' | null }) {
  const [show, setShow] = useState(false)
  const triggered = useRef(false)
  const mountedAt = useRef(0)
  const lastY = useRef(0)
  const upDistance = useRef(0)

  function trigger(source: string) {
    if (triggered.current) return
    try {
      if (sessionStorage.getItem('fk_quiz_exit_shown')) return
      sessionStorage.setItem('fk_quiz_exit_shown', '1')
    } catch { /* private mode */ }
    triggered.current = true
    setShow(true)
    posthog.capture('email_capture_shown', { source: 'quiz-exit', trigger: source, path })
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
        <div style={{ fontSize: '2rem', clear: 'both' }}>💌</div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '4px 0 6px' }}>
          Before you go — keep {path === 'kid' ? 'the adventure' : 'your plan'}
        </h2>
        <p style={{ color: '#555', fontSize: '0.93rem', margin: '0 0 4px' }}>
          We&apos;ll email you {path === 'kid' ? 'your child’s adventure plan' : 'your family’s personalized plan'} plus
          the free printable 30-Day Family Bible Challenge — no commitment, yours to keep.
        </p>
        <EmailCaptureCard
          magnet="challenge"
          source="quiz-exit"
          sourcePost="quiz"
          quizAnswers={answers}
          title="📬 Email me the plan + free Challenge"
          subtitle=""
        />
      </div>
    </div>
  )
}
