'use client'

import { useEffect, useRef, useState } from 'react'
import posthog from 'posthog-js'
import { ExitTakeover } from '@/app/components/ExitTakeover'

/**
 * Exit takeover — a full screen that opens with question one of the quiz.
 *
 * Replaced the email-capture popup on Sep 27, 2026, modelled on the Octane AI
 * pattern the owner found on kiierr.com: a full-page takeover rather than a
 * corner modal, opening with a QUESTION rather than an offer, so the first
 * thing asked of a leaving reader is a tap, not an email address.
 *
 * It does not link to /quiz — it IS question one. Tapping an answer seeds
 * `fk_quiz_state` and the quiz resumes at question two, so the flow reads as
 * one continuous thing instead of a popup that then makes you start over.
 *
 * TRIGGERS, and why they differ by device:
 *  - Desktop: mouse leaves the top of the viewport. Real exit intent.
 *  - Mobile: the BACK BUTTON, via a spent history entry. NOT scroll-up, which
 *    is what this used to do. A bottom sheet firing mid-read is tolerable; a
 *    full-screen takeover firing mid-read is precisely the shape Google's
 *    intrusive-interstitial guidance penalises, and the blog is where our
 *    organic clicks come from. Back is the one mobile signal that genuinely
 *    means leaving.
 *  - The history entry is armed ONLY once the guards would pass, so for a
 *    reader who would never be shown anything, back behaves normally.
 *
 * No email capture here any more (owner's call). The magnet still lives on
 * every post, on the quiz-abandonment catch and on every printable page, so
 * the drip keeps its sources.
 */

const SHOWN_KEY = 'fk_exit_shown_at'
const SESSION_KEY = 'fk_exit_session'
const QUIZ_CLICK_KEY = 'fk_quiz_cta_clicked'
const TRIVIA_KEY = 'fk_trivia_started'
const SUPPRESS_DAYS = 1

const MIN_TIME_MS = 8_000
const MIN_SCROLL = 0.20
const MIN_SCROLL_SCREENS = 1.5

type Variant = 'trivia' | 'story' | 'guide'

function safeGet(store: Storage, key: string): string | null {
  try { return store.getItem(key) } catch { return null }
}
function safeSet(store: Storage, key: string, val: string) {
  try { store.setItem(key, val) } catch { /* private mode */ }
}

export function BlogExitIntent({
  postSlug,
  variant,
}: {
  postSlug: string
  variant: Variant
}) {
  const [show, setShow] = useState(false)
  const triggered = useRef(false)
  const mountedAt = useRef(0)
  const deepScrolled = useRef(false)
  const armed = useRef(false)

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
    posthog.capture('exit_intent_shown', { source, post: postSlug, variant, surface: 'blog', format: 'takeover' })
  }

  function dismiss() {
    setShow(false)
    posthog.capture('exit_intent_dismissed', { post: postSlug, variant, surface: 'blog', format: 'takeover' })
  }

  useEffect(() => {
    mountedAt.current = Date.now()
    const mobile = window.innerWidth < 768

    /* Arm a history entry to spend on the back press. Only once the guards
       would actually pass — otherwise we would be interfering with back for
       readers we are never going to show anything to. */
    function arm() {
      if (armed.current || triggered.current || !mobile) return
      if (blocked()) return
      armed.current = true
      try { history.pushState({ fk: 'exit' }, '', location.href) } catch { /* older Safari */ }
    }

    function onPop() {
      if (armed.current && !triggered.current && !blocked()) {
        armed.current = false
        trigger('back_button')
        return
      }
      /* Nothing to show. The entry is already spent and the URL never
         changed, so send them where they were going. */
      armed.current = false
      history.back()
    }

    function onScroll() {
      const y = window.scrollY
      const docH = document.documentElement.scrollHeight - window.innerHeight
      const byFraction = docH > 0 && y / docH >= MIN_SCROLL
      const byScreens = y >= window.innerHeight * MIN_SCROLL_SCREENS
      if (byFraction || byScreens) {
        deepScrolled.current = true
        arm()
      }
    }

    // Desktop: mouse leaves the top of the viewport.
    function onMouseLeave(e: MouseEvent) {
      if (e.clientY < 10 && window.innerWidth >= 768) trigger('mouse_leave')
    }

    // A reader who already clicked a quiz CTA is never taken over.
    function onClick(e: MouseEvent) {
      const a = (e.target as HTMLElement).closest?.('a[href^="/quiz"]')
      if (a) safeSet(sessionStorage, QUIZ_CLICK_KEY, '1')
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('popstate', onPop)
    document.addEventListener('mouseleave', onMouseLeave)
    document.addEventListener('click', onClick, true)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('popstate', onPop)
      document.removeEventListener('mouseleave', onMouseLeave)
      document.removeEventListener('click', onClick, true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!show) return null

  return <ExitTakeover surface="blog" postSlug={postSlug} onDismiss={dismiss} />
}
