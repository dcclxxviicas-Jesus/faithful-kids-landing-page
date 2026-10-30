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
 *
 * DWELL GATE, added Oct 30 2026 (owner's call, from PostHog): the takeover
 * stays silent for the first 15 seconds on the page. Measured over 60 days and
 * 1,434 homepage sessions, the MEDIAN time on this page is 15s, the 25th
 * percentile is 3s, and 284 sessions (20%) never register a second event at
 * all. So a pointer leaving in the first seconds is someone who never engaged,
 * or a cursor flicking to the tab bar on arrival — not an exit worth
 * interrupting. At 15s the person has stayed longer than a typical visitor,
 * which is the whole claim the takeover makes on their attention.
 *
 * Wall-clock since mount, not active time: a page left open in a background
 * tab and returned to is still someone who chose to come back.
 */
/** Milliseconds on the page before an exit is worth interrupting. */
const DWELL_MS = 15_000

export function HomeExitIntent() {
  const [show, setShow] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const triggered = useRef(false)
  const armedAt = useRef(0)

  useEffect(() => {
    // Set once. The effect re-runs when `dismissed` flips, and restarting the
    // clock there would re-arm the gate rather than hold it.
    if (!armedAt.current) armedAt.current = Date.now()

    function trigger(source: string) {
      if (triggered.current || dismissed) return
      // Not `triggered = true`: they may leave again later, and by then they
      // will have earned it.
      if (Date.now() - armedAt.current < DWELL_MS) return
      if (takeoverSuppressed()) return
      triggered.current = true
      markTakeoverShown()
      setShow(true)
      posthog.capture('exit_intent_shown', { source, surface: 'homepage', format: 'takeover', dwell_s: Math.round((Date.now() - armedAt.current) / 1000) })
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
