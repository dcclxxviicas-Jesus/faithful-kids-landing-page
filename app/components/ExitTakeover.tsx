'use client'

import { useEffect } from 'react'
import posthog from 'posthog-js'

/**
 * The full-screen exit takeover — one implementation, two surfaces.
 *
 * Modelled on the Octane AI pattern the owner found on kiierr.com: a full
 * page rather than a corner modal, opening with a QUESTION rather than an
 * offer, so the first thing asked of a leaving visitor is a tap.
 *
 * It does not link to /quiz — it IS question one. Answering seeds
 * `fk_quiz_state` and the quiz resumes at question two, so the flow reads as
 * one thing instead of a popup that then makes you start over.
 *
 * SHARED ON PURPOSE. The blog and the homepage each keep their own trigger
 * rules (they differ, and for good reason) but render this. Two copies of
 * this markup would drift, and this codebase has a documented history of copy
 * surviving in one place after being "removed" in another.
 *
 * Callers own: when to show it, and what dismissing means.
 */

const CDN = 'https://d3g07v1w0lehiv.cloudfront.net'

/* Question one of the PARENT path, quoted from app/quiz/page.tsx. If that
   question changes, change it here too — the seed below claims the visitor
   answered it, so the two must stay the same question. */
export const QUESTION = 'How many kids are in your family?'
const OPTIONS = [
  { label: '1 child', val: '1', emoji: '1️⃣' },
  { label: '2 children', val: '2', emoji: '2️⃣' },
  { label: '3 children', val: '3', emoji: '3️⃣' },
  { label: '4 or more', val: '4+', emoji: '4️⃣' },
]

export function ExitTakeover({
  surface,
  postSlug,
  onDismiss,
}: {
  /** 'blog' | 'homepage' — goes on every event so the two stay comparable. */
  surface: string
  postSlug?: string
  onDismiss: () => void
}) {
  // Lock the page behind the takeover so it cannot be scrolled underneath.
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onDismiss() }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function answer(val: string) {
    try {
      posthog.capture('exit_intent_answer', { surface, post: postSlug, question: 'num_kids', answer: val })
    } catch { /* never block the handoff */ }
    try {
      sessionStorage.setItem('fk_quiz_state', JSON.stringify({
        seed: true, phase: 'quiz', path: 'parent',
        answers: { num_kids: val }, step: 1,
      }))
    } catch { /* private mode — the quiz just starts from the top */ }
    window.location.href = `/quiz?ref=exit-${surface}`
  }

  return (
    <div className="fk-takeover" role="dialog" aria-modal="true" aria-label="Build your kids' Bible plan">
      <button className="fk-takeover-close" onClick={onDismiss} aria-label="Close">{'✕'}</button>

      <div className="fk-takeover-inner">
        {/* Treatment A, refined. The plain version led with a headline and put
            the question in small text underneath — the one thing we want acted
            on was the least visible thing on the screen. The QUESTION is now
            the headline; everything else is support. No hero image: this
            treatment's whole argument is that nothing should compete with the
            ask, and it is also the only version that costs no bandwidth. */}
        <img src="/logo-sm.png" alt="" className="fk-takeover-logo" width={44} height={44} />
        <p className="fk-takeover-eyebrow">One quick question</p>
        <h2 className="fk-takeover-q-hero">{QUESTION}</h2>
        <p className="fk-takeover-lead">
          We&rsquo;ll build a Bible plan around them &mdash; Genesis to Revelation,
          matched to their ages.
        </p>

        <div className="fk-takeover-opts">
          {OPTIONS.map(o => (
            <button key={o.val} className="fk-takeover-opt" onClick={() => answer(o.val)}>
              <span className="fk-takeover-opt-emoji">{o.emoji}</span>
              <span>{o.label}</span>
            </button>
          ))}
        </div>

        <div className="fk-takeover-reassure">
          <span>{'\u2713'} About a minute</span>
          <span>{'\u2713'} No sign-up</span>
          <span>{'\u2713'} Free to see</span>
        </div>

        <button className="fk-takeover-skip" onClick={onDismiss}>
          {surface === 'blog' ? 'No thanks, keep reading' : 'No thanks'}
        </button>
      </div>
    </div>
  )
}
