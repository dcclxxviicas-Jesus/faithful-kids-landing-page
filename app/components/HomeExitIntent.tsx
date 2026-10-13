'use client'

import { useState, useEffect, useRef } from 'react'
import posthog from 'posthog-js'
import { ExitTakeover } from './ExitTakeover'
import { takeoverSuppressed, markTakeoverShown } from '@/lib/exit-intent'

/**
 * The homepage exit takeover, lifted out of app/page.tsx verbatim when the
 * homepage became a server component. Behaviour is unchanged — this is the
 * same code, in its own file, so the page itself can ship without shipping a
 * client bundle for the whole document.
 *
 * The ONLY trigger: the pointer leaves through the TOP of the viewport,
 * heading for the tab's X or the address bar. That is real exit intent.
 *
 * Scroll-up (300px of cumulative upward scroll) and a 45-second timer used to
 * fire this as well. Both were removed on Oct 9 2026 — the owner's words were
 * "it comes too often ... feels a little too strict", and they were right
 * twice over:
 *
 *  - the scroll handler was commented "Mobile", but `scroll` fires on desktop
 *    too, so flicking back up the page threw a full-screen takeover at someone
 *    who was still reading;
 *  - the timer fired at 45s regardless of whether anyone was leaving.
 *
 * The blog dropped scroll-up for this exact reason (see the header of
 * BlogExitIntent) and the homepage simply never got the same fix.
 *
 * DELIBERATE CONSEQUENCE: touch devices have no mouseleave, so the homepage
 * takeover is DESKTOP ONLY. If mobile coverage is wanted back, copy the blog's
 * back-button approach (arm a history entry and spend it) — never scroll-up,
 * which is what was just taken out.
 */
export function HomeExitIntent() {
  const [show, setShow] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const triggered = useRef(false)

  useEffect(() => {
    function trigger(source: string) {
      if (triggered.current || dismissed) return
      if (takeoverSuppressed()) return
      triggered.current = true
      markTakeoverShown()
      setShow(true)
      posthog.capture('exit_intent_shown', { source, surface: 'homepage', format: 'takeover' })
    }
    function handleMouseLeave(e: MouseEvent) {
      if (e.clientY < 10) trigger('mouse_leave')
    }
    document.addEventListener('mouseleave', handleMouseLeave)
    return () => document.removeEventListener('mouseleave', handleMouseLeave)
  }, [dismissed])

  if (!show || dismissed) return null

  return <ExitTakeover surface="homepage" onDismiss={() => setDismissed(true)} />
}
