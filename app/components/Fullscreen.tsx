'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import './fullscreen.css'

/**
 * Full-screen mode for the Bible trivia games.
 *
 * Shared by all three: the per-post games (`app/blog/TriviaGame.tsx`, ~82 blog
 * posts plus the 81 `/embed/trivia/<slug>` games), the hub game
 * (`TriviaQuizGame`, on `/bible-trivia`, `/bible-quiz` and
 * `/embed/bible-trivia`) and Bible Jeopardy.
 *
 * A CSS overlay and the real Fullscreen API, and the layering is the point:
 *
 * - The overlay is what always works. Safari on iPhone has no
 *   `Element.requestFullscreen` at all — only `<video>` carries its own — so a
 *   native-only implementation would hand kids on phones a dead button.
 * - Native fullscreen goes on top where it exists, because it also takes the
 *   browser's chrome, which is what a projector or a TV actually needs.
 *
 * A rejected native request is normal and needs no handling: the overlay is
 * already up and stands on its own. What DOES need handling is leaving native
 * fullscreen by a route we did not initiate (Escape, F11, the browser's own
 * control) — `fullscreenchange` has to take the overlay with it, or the page
 * is left covered by a panel with no way out.
 *
 * `canNative` exists for the embeds. Inside a third-party iframe the native
 * call needs `allow="fullscreen"` on the host's tag; without it
 * `document.fullscreenEnabled` is false, and the embed hides the button rather
 * than offering a "full screen" that fills a 780px frame on someone's blog.
 */

/* Prefixed variants: only Safari still needs them, and only on desktop/iPad. */
type NativeEl = { requestFullscreen?: () => Promise<void>; webkitRequestFullscreen?: () => Promise<void> | void }
type NativeDoc = {
  fullscreenEnabled?: boolean
  webkitFullscreenEnabled?: boolean
  fullscreenElement?: Element | null
  webkitFullscreenElement?: Element | null
  exitFullscreen?: () => Promise<void>
  webkitExitFullscreen?: () => Promise<void> | void
}

const LOCK_CLASS = 'fk-fs-lock'

function nativeElement(): Element | null {
  const d = document as Document & NativeDoc
  return d.fullscreenElement ?? d.webkitFullscreenElement ?? null
}

export function useFullscreen() {
  const hostRef = useRef<HTMLDivElement>(null)
  const [full, setFull] = useState(false)
  /* Read after mount, never during render: in a blocked iframe this is false
     while on the server it is simply unknowable, and branching on it in the
     first paint would be a hydration mismatch. */
  const [canNative, setCanNative] = useState(false)
  const wentNative = useRef(false)

  useEffect(() => {
    const d = document as Document & NativeDoc
    setCanNative(Boolean(d.fullscreenEnabled ?? d.webkitFullscreenEnabled))
  }, [])

  const exit = useCallback(() => {
    const d = document as Document & NativeDoc
    if (wentNative.current && nativeElement()) {
      try {
        const p = d.exitFullscreen?.() ?? d.webkitExitFullscreen?.()
        if (p && typeof (p as Promise<void>).catch === 'function') (p as Promise<void>).catch(() => {})
      } catch {
        // already out, or the document never granted it
      }
    }
    wentNative.current = false
    setFull(false)
  }, [])

  const enter = useCallback(() => {
    setFull(true)
    const el = hostRef.current as (HTMLDivElement & NativeEl) | null
    if (!el) return
    const req = el.requestFullscreen ?? el.webkitRequestFullscreen
    if (!req) return // iPhone Safari: the overlay is the whole answer
    try {
      const p = req.call(el)
      wentNative.current = true
      if (p && typeof p.catch === 'function') p.catch(() => { wentNative.current = false })
    } catch {
      wentNative.current = false
    }
  }, [])

  const toggle = useCallback(() => { if (full) exit(); else enter() }, [full, enter, exit])

  /* Escape. Native fullscreen swallows the key itself and answers with
     `fullscreenchange`, but the overlay-only case has nothing listening. */
  useEffect(() => {
    if (!full) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') exit() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [full, exit])

  useEffect(() => {
    const sync = () => {
      if (wentNative.current && !nativeElement()) {
        wentNative.current = false
        setFull(false)
      }
    }
    document.addEventListener('fullscreenchange', sync)
    document.addEventListener('webkitfullscreenchange', sync)
    return () => {
      document.removeEventListener('fullscreenchange', sync)
      document.removeEventListener('webkitfullscreenchange', sync)
    }
  }, [])

  /* Hold the page still behind the overlay, and give the class back on
     unmount — a round that ends with a navigation must not leave the document
     unscrollable. */
  useEffect(() => {
    if (!full) return
    document.documentElement.classList.add(LOCK_CLASS)
    return () => document.documentElement.classList.remove(LOCK_CLASS)
  }, [full])

  return { hostRef, full, toggle, exit, canNative }
}

export type FullscreenApi = ReturnType<typeof useFullscreen>

/** The button that turns it on. Hidden by the caller where it cannot work. */
export function FullscreenButton({
  onClick,
  variant,
  label = 'Full screen',
}: {
  onClick: () => void
  /** `on-dark` for the per-post game's green banner, `in-corner` to pin it. */
  variant?: 'on-dark' | 'in-corner'
  label?: string
}) {
  return (
    <button
      type="button"
      className={`fk-fs-open${variant ? ` ${variant}` : ''}`}
      onClick={onClick}
      aria-label="Play full screen"
      title="Play full screen"
    >
      <span aria-hidden>{'⛶'}</span>
      <span>{label}</span>
    </button>
  )
}

/**
 * Wraps a game. Off, the three divs are unstyled blocks and the page looks
 * exactly as it did; on, they become the overlay, its bar and a centring
 * scroller. The host div is also the element handed to `requestFullscreen`,
 * so everything the game renders inside it — including its own fixed-position
 * modals, like Jeopardy's clue card — survives native fullscreen, where the
 * browser paints nothing outside that subtree.
 */
export function FullscreenShell({
  fs,
  title,
  children,
}: {
  fs: FullscreenApi
  /** Shown in the bar, so a projector audience knows what they are playing. */
  title: string
  children: React.ReactNode
}) {
  return (
    <div
      ref={fs.hostRef}
      className={`fk-fs${fs.full ? ' is-full' : ''}`}
      role={fs.full ? 'region' : undefined}
      aria-label={fs.full ? `${title} — full screen` : undefined}
    >
      {fs.full && (
        <div className="fk-fs-bar">
          <span className="fk-fs-title">{title}</span>
          <button type="button" className="fk-fs-exit" onClick={fs.exit}>
            {'✕'} Exit full screen
          </button>
        </div>
      )}
      <div className="fk-fs-scroll">
        <div className="fk-fs-inner">{children}</div>
      </div>
    </div>
  )
}
