'use client'

import { useState } from 'react'
import posthog from 'posthog-js'

export function EmailCaptureCard({
  magnet,
  source,
  sourcePost,
  quizAnswers,
  title,
  subtitle,
}: {
  magnet: 'challenge' | 'trivia-pack' | 'bedtime-kit'
  source: 'blog-inline' | 'blog-exit' | 'quiz-exit'
  sourcePost: string
  quizAnswers?: Record<string, string>
  title?: string
  subtitle?: string
}) {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')

  const COPY = {
    'trivia-pack': {
      heading: '🎯 Free: The Family Bible Trivia Pack',
      sub: '100 printable questions for game night, car rides, and Sunday school — answers included.',
      name: 'Trivia Pack',
    },
    'bedtime-kit': {
      heading: '🌙 Free: The Bedtime Bible Kit',
      sub: 'Seven nights of five-minute stories — a story, a prayer, and one question to whisper about.',
      name: 'Bedtime Bible Kit',
    },
    challenge: {
      heading: '📬 Free: The 30-Day Family Bible Challenge',
      sub: 'One story a night, printable for the fridge. Read it, talk about it, check it off.',
      name: '30-Day Challenge',
    },
  }[magnet]
  const heading = title ?? COPY.heading
  const sub = subtitle ?? COPY.sub

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
      posthog.capture('email_capture_submitted', { magnet, source, post: sourcePost })
    } catch {
      setState('error')
    }
  }

  const emerald = '#059669'

  if (state === 'done') {
    return (
      <div style={{ background: '#ecfdf5', border: '2px solid #a7f3d0', borderRadius: '16px', padding: '24px', textAlign: 'center', margin: '32px 0' }}>
        <div style={{ fontSize: '1.8rem' }}>🎉</div>
        <p style={{ fontWeight: 800, fontSize: '1.05rem', margin: '6px 0 4px' }}>Check your inbox!</p>
        <p style={{ color: '#555', fontSize: '0.92rem', margin: 0 }}>
          Your {COPY.name} is on its way to {email}.
        </p>
      </div>
    )
  }

  return (
    <div style={{ background: '#f0fdf4', border: '2px solid #d1fae5', borderRadius: '16px', padding: '24px', textAlign: 'center', margin: '32px 0' }}>
      <p style={{ fontWeight: 800, fontSize: '1.1rem', margin: '0 0 6px' }}>{heading}</p>
      <p style={{ color: '#555', fontSize: '0.92rem', margin: '0 0 16px' }}>{sub}</p>
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
            borderRadius: '999px', border: '2px solid #d1fae5', fontSize: '0.95rem', outline: 'none',
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
          Something went wrong — please try again.
        </p>
      )}
      <p style={{ color: '#9ca3af', fontSize: '0.78rem', margin: '10px 0 0' }}>
        Free printable + a few helpful emails. Unsubscribe anytime.
      </p>
    </div>
  )
}
