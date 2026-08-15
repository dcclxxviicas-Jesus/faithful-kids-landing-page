'use client'

import { useEffect, useRef, useState } from 'react'
import posthog from 'posthog-js'
import { EmailCaptureCard } from './EmailCaptureCard'

const SHOWN_KEY = 'fk_exit_shown_at'
const SESSION_KEY = 'fk_exit_session'
const QUIZ_CLICK_KEY = 'fk_quiz_cta_clicked'
const TRIVIA_KEY = 'fk_trivia_started'
const SUPPRESS_DAYS = 1
const MIN_TIME_MS = 20_000
const MIN_SCROLL = 0.35

type Variant = 'trivia' | 'story' | 'guide'

const COPY: Record<Variant, { head: string; sub: string }> = {
  trivia: {
    head: 'Wait — the quiz doesn’t have to end 🎮',
    sub: '200 Bible quizzes with video lessons, levels, and streaks. Kids beg to play.',
  },
  story: {
    head: 'Watch this exact story as a video ▶️',
    sub: 'Every Bible story as a 60-second lesson narrated by Jesus, with a quiz after.',
  },
  guide: {
    head: '5 minutes a day changes everything 🌱',
    sub: 'Turn tonight’s story into a daily faith habit your kids actually ask for.',
  },
}

function safeGet(store: Storage, key: string): string | null {
  try { return store.getItem(key) } catch { return null }
}
function safeSet(store: Storage, key: string, val: string) {
  try { store.setItem(key, val) } catch { /* private mode */ }
}

export function BlogExitIntent({
  postSlug,
  variant,
  videoSrc,
  fallbackSrc,
  posterSrc,
}: {
  postSlug: string
  variant: Variant
  videoSrc: string
  fallbackSrc: string
  posterSrc?: string
}) {
  const [show, setShow] = useState(false)
  const [mode, setMode] = useState<'offer' | 'email'>('offer')
  const [isMobile, setIsMobile] = useState(false)
  const [src, setSrc] = useState(videoSrc)
  const triggered = useRef(false)
  const mountedAt = useRef(0)
  const deepScrolled = useRef(false)
  const lastY = useRef(0)
  const upDistance = useRef(0)

  function blocked(): boolean {
    if (triggered.current) return true
    if (Date.now() - mountedAt.current < MIN_TIME_MS) return true
    if (!deepScrolled.current) return true
    if (safeGet(sessionStorage, SESSION_KEY)) return true
    if (safeGet(sessionStorage, TRIVIA_KEY)) return true
    if (safeGet(sessionStorage, QUIZ_CLICK_KEY)) return true
    const last = Number(safeGet(localStorage, SHOWN_KEY) || 0)
    if (last && Date.now() - last < SUPPRESS_DAYS * 86_400_000) return true
    return false
  }

  function trigger(source: string) {
    if (blocked()) return
    triggered.current = true
    safeSet(sessionStorage, SESSION_KEY, '1')
    safeSet(localStorage, SHOWN_KEY, String(Date.now()))
    setShow(true)
    posthog.capture('exit_intent_shown', { source, post: postSlug, variant, surface: 'blog' })
  }

  function dismiss() {
    setShow(false)
    posthog.capture('exit_intent_dismissed', { post: postSlug, variant, surface: 'blog' })
  }

  useEffect(() => {
    mountedAt.current = Date.now()
    setIsMobile(window.innerWidth < 768)

    // Track scroll depth + mobile fast-scroll-up trigger
    function onScroll() {
      const y = window.scrollY
      const docH = document.documentElement.scrollHeight - window.innerHeight
      if (docH > 0 && y / docH >= MIN_SCROLL) deepScrolled.current = true

      if (y < lastY.current && y > window.innerHeight && deepScrolled.current) {
        upDistance.current += lastY.current - y
        if (upDistance.current > 300 && window.innerWidth < 768) trigger('scroll_up')
      } else if (y > lastY.current) {
        upDistance.current = 0
      }
      lastY.current = y
    }

    // Desktop: mouse leaves top of viewport
    function onMouseLeave(e: MouseEvent) {
      if (e.clientY < 10 && window.innerWidth >= 768) trigger('mouse_leave')
    }

    // If the reader clicks any quiz CTA, never popup on them this session
    function onClick(e: MouseEvent) {
      const a = (e.target as HTMLElement).closest?.('a[href^="/quiz"]')
      if (a) safeSet(sessionStorage, QUIZ_CLICK_KEY, '1')
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    document.addEventListener('mouseleave', onMouseLeave)
    document.addEventListener('click', onClick, true)
    return () => {
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('mouseleave', onMouseLeave)
      document.removeEventListener('click', onClick, true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!show) return null

  const copy = COPY[variant]
  const emerald = '#059669'

  const overlay: React.CSSProperties = {
    position: 'fixed', inset: 0, zIndex: 1000,
    background: 'rgba(0,0,0,0.55)',
    display: 'flex',
    alignItems: isMobile ? 'flex-end' : 'center',
    justifyContent: 'center',
  }
  const panel: React.CSSProperties = isMobile
    ? {
        background: '#fff', width: '100%', maxHeight: '75vh', overflowY: 'auto',
        borderRadius: '20px 20px 0 0', padding: '22px 20px 26px',
        textAlign: 'center', animation: 'fk-sheet-up 0.25s ease-out',
      }
    : {
        background: '#fff', width: 'min(520px, 92vw)', maxHeight: '90vh', overflowY: 'auto',
        borderRadius: '20px', padding: '28px 26px', textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }

  return (
    <div style={overlay} onClick={dismiss}>
      <style>{'@keyframes fk-sheet-up { from { transform: translateY(100%);} to { transform: translateY(0);} }'}</style>
      <div style={panel} onClick={e => e.stopPropagation()}>
        <button
          onClick={dismiss}
          aria-label="Close"
          style={{ position: 'relative', float: 'right', background: 'none', border: 'none', fontSize: '1.3rem', color: '#999', cursor: 'pointer', lineHeight: 1 }}
        >
          ✕
        </button>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '4px 0 8px', clear: 'both' }}>{copy.head}</h2>
        <p style={{ color: '#555', fontSize: '0.95rem', margin: '0 0 14px' }}>{copy.sub}</p>
        <video
          src={src}
          poster={posterSrc}
          controls
          autoPlay
          muted
          playsInline
          preload="none"
          onError={() => { if (src !== fallbackSrc) setSrc(fallbackSrc) }}
          style={{ width: '100%', borderRadius: '12px', background: '#000', marginBottom: '16px' }}
        />
        {mode === 'offer' ? (
          <>
            <a
              href="/quiz"
              onClick={() => posthog.capture('exit_intent_cta', { post: postSlug, variant, surface: 'blog' })}
              style={{
                display: 'block', background: emerald, color: '#fff', fontWeight: 700,
                fontSize: '1.05rem', padding: '14px 24px', borderRadius: '999px', textDecoration: 'none',
              }}
            >
              Try Faithful Kids Free
            </a>
            <p style={{ fontSize: '0.8rem', color: '#888', margin: '12px 0 0' }}>
              7-day free trial · 30-day money-back guarantee · Cancel anytime
            </p>
            <button
              onClick={() => {
                setMode('email')
                posthog.capture('email_capture_shown', { source: 'blog-exit', post: postSlug })
              }}
              style={{ background: 'none', border: 'none', color: emerald, fontWeight: 700, cursor: 'pointer', fontSize: '0.88rem', marginTop: '10px' }}
            >
              Not ready? Get the free {variant === 'trivia' ? 'Bible Trivia Pack' : 'Bedtime Bible Kit'} by email →
            </button>
          </>
        ) : (
          <EmailCaptureCard
            magnet={variant === 'trivia' ? 'trivia-pack' : 'bedtime-kit'}
            source="blog-exit"
            sourcePost={postSlug}
          />
        )}
      </div>
    </div>
  )
}
