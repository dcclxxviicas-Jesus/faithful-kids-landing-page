'use client'

import { useEffect, useRef, useState } from 'react'
import posthog from 'posthog-js'
import { markCaptureSeen, markCaptureSubmitted, postActionShownThisVisit } from '@/lib/capture-state'

export function EmailCaptureCard({
  magnet,
  source,
  sourcePost,
  quizAnswers,
  title,
  subtitle,
  compact = false,
  placement,
}: {
  magnet: 'challenge' | 'trivia-pack' | 'bedtime-kit' | 'coloring-pages' | 'quiz-plan' | 'advent'
  source: 'blog-inline' | 'blog-exit' | 'quiz-exit' | 'game-end' | 'printable-postaction'
  sourcePost: string
  quizAnswers?: Record<string, string>
  title?: string
  subtitle?: string
  /** Tighter padding + margins for constrained surfaces like the exit sheet. */
  compact?: boolean
  /** Where on the page this card sits ('mid', 'end', 'trivia-end', 'ws-end').
      When set, the card fires email_capture_shown on first 50% visibility —
      the blog card never reported visibility before Nov 1, 2026, so its
      0.18% submit rate couldn't be split into "unseen" vs "seen and declined".
      Quiz surfaces fire their own shown event and pass no placement; adding
      one there would double-count. */
  placement?: string
}) {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const cardRef = useRef<HTMLDivElement>(null)
  const shownRef = useRef(false)

  /* On a printable page, the post-action ask (PostActionCapture) and the
     inline card share one budget: if the ask already showed this visit, the
     inline card steps aside instead of asking a second time. */
  const [stepAside, setStepAside] = useState(false)
  useEffect(() => {
    if (source !== 'printable-postaction' && location.pathname.startsWith('/printables') && postActionShownThisVisit()) {
      setStepAside(true)
    }
  }, [source])

  useEffect(() => {
    const el = cardRef.current
    if (!el || shownRef.current) return
    const io = new IntersectionObserver(entries => {
      if (shownRef.current || !entries.some(e => e.isIntersecting)) return
      shownRef.current = true
      // Recorded for every card so the post-action ask never doubles up.
      if (source !== 'printable-postaction') markCaptureSeen()
      if (placement) posthog.capture('email_capture_shown', { magnet, source, post: sourcePost, placement })
      io.disconnect()
    }, { threshold: 0.5 })
    io.observe(el)
    return () => io.disconnect()
  }, [placement, magnet, source, sourcePost, stepAside])

  const COPY = {
    'coloring-pages': {
      heading: '🖍️ Free: All 26 Bible Coloring Pages',
      sub: 'One PDF, Creation to the Empty Tomb, print the whole set at once instead of page by page.',
      name: 'Bible Coloring Pack',
    },
    'trivia-pack': {
      heading: '🎯 Free: The Family Bible Trivia Pack',
      sub: '100 printable questions for game night, car rides, and Sunday school, answers included.',
      name: 'Trivia Pack',
    },
    'bedtime-kit': {
      heading: '🌙 Free: The Bedtime Bible Kit',
      sub: 'Seven nights of five-minute stories, a story, a prayer, and one question to whisper about.',
      name: 'Bedtime Bible Kit',
    },
    'quiz-plan': {
      heading: '\u{1F4EC} Email me my plan',
      sub: 'A link that brings the whole plan back, day one stays free.',
      name: 'Bible plan',
    },
    challenge: {
      heading: '📬 Free: The 30-Day Family Bible Challenge',
      sub: 'One story a night, printable for the fridge. Read it, talk about it, check it off.',
      name: '30-Day Challenge',
    },
    advent: {
      heading: '🕯️ Free: 25 Days of Advent Bible Readings',
      sub: 'December 1 to 25, one short reading a night, from the first promise to the manger. Printable for the fridge.',
      name: 'Advent Readings',
    },
  }[magnet]
  const heading = title === undefined ? COPY.heading : title
  const sub = subtitle === undefined ? COPY.sub : subtitle

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (state === 'sending' || state === 'done') return
    setState('sending')
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, magnet, source, sourcePost, quizAnswers }),
      })
      if (!res.ok) throw new Error(String(res.status))
      setState('done')
      markCaptureSubmitted()
      /* First join between the anonymous browsing id and a real identity —
         this is what makes a later purchase attributable to a funnel. */
      try { posthog.identify(email.trim().toLowerCase()) } catch { /* fine */ }
      posthog.capture('email_capture_submitted', { magnet, source, post: sourcePost, placement })
    } catch {
      setState('error')
    }
  }

  const emerald = '#16a34a'

  if (stepAside && state === 'idle') return null

  if (state === 'done') {
    return (
      <div style={{ background: '#f0fdf4', border: '2px solid #bbf7d0', borderRadius: '16px', padding: '24px', textAlign: 'center', margin: '32px 0' }}>
        <div style={{ fontSize: '1.8rem' }}>🎉</div>
        <p style={{ fontWeight: 800, fontSize: '1.05rem', margin: '6px 0 4px' }}>Check your inbox!</p>
        <p style={{ color: '#555', fontSize: '0.92rem', margin: 0 }}>
          Your {COPY.name} is on its way to {email}.
        </p>
      </div>
    )
  }

  return (
    <div ref={cardRef} style={{ background: '#f0fdf4', border: '2px solid #dcfce7', borderRadius: '16px', padding: compact ? '14px' : '24px', textAlign: 'center', margin: compact ? '14px 0 10px' : '32px 0' }}>
      {heading && <p style={{ fontWeight: 800, fontSize: '1.1rem', margin: '0 0 6px' }}>{heading}</p>}
      {sub && <p style={{ color: '#555', fontSize: '0.92rem', margin: '0 0 16px' }}>{sub}</p>}
      <form onSubmit={submit} style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {/* Honeypot — humans never see or fill this */}
        <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true"
          style={{ position: 'absolute', left: '-9999px', height: 0, width: 0, opacity: 0 }}
          onChange={() => { /* bots only */ }} />
        <input
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Your email"
          aria-label="Email address"
          style={{
            flex: '1 1 220px', maxWidth: '280px', padding: '12px 16px',
            borderRadius: '999px', border: '2px solid #dcfce7', fontSize: '0.95rem', outline: 'none',
          }}
        />
        <button
          type="submit"
          disabled={state === 'sending'}
          style={{
            background: emerald, color: '#fff', fontWeight: 700, fontSize: '0.95rem',
            padding: '12px 24px', borderRadius: '999px', border: 'none', cursor: 'pointer',
            opacity: state === 'sending' ? 0.7 : 1,
          }}
        >
          {state === 'sending' ? 'Sending…' : 'Send it to me'}
        </button>
      </form>
      {state === 'error' && (
        <p style={{ color: '#b91c1c', fontSize: '0.85rem', margin: '10px 0 0' }}>
          Something went wrong, please try again.
        </p>
      )}
      <p style={{ color: '#9ca3af', fontSize: '0.78rem', margin: '10px 0 0' }}>
        Free printable + a few helpful emails. Unsubscribe anytime.
      </p>
    </div>
  )
}
