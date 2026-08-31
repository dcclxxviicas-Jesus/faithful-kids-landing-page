'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import posthog from 'posthog-js'

/**
 * The one video pattern for the whole site.
 *
 * The tile autoplays muted as an ambient preview — cheap, no permission
 * prompt, and it shows the art immediately. Pressing the button opens the
 * lesson full size, with sound, RESTARTED from zero: unmuting a loop already
 * halfway through is a poor first viewing of the product.
 *
 * Every video on the site routes through here so the behaviour, the poster
 * handling and the analytics stay identical wherever a lesson appears.
 */
export function VideoTile({
  src,
  poster,
  title,
  badge,
  blurb,
  location,
  className = '',
  ctaHref = '/quiz',
  ctaLabel = 'See more videos like this',
}: {
  src: string
  poster?: string
  title: string
  badge?: string
  blurb?: string
  /** Where on the site this tile lives — goes into every event. */
  location: string
  className?: string
  ctaHref?: string
  ctaLabel?: string
}) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const tileRef = useRef<HTMLVideoElement>(null)
  const modalRef = useRef<HTMLVideoElement>(null)

  useEffect(() => setMounted(true), [])

  function openPlayer() {
    tileRef.current?.pause()
    setOpen(true)
    try {
      posthog.capture('video_expanded', { title, location })
    } catch { /* analytics must never break playback */ }
  }

  function closePlayer() {
    setOpen(false)
    tileRef.current?.play().catch(() => { /* autoplay policy — fine */ })
  }

  // Always from the beginning, always with sound.
  useEffect(() => {
    if (!open) return
    const el = modalRef.current
    if (el) {
      el.currentTime = 0
      el.muted = false
      el.play().catch(() => { /* the controls are right there */ })
    }
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closePlayer() }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  return (
    <div className={`video-tile ${className}`.trim()}>
      <div className="video-tile-screen">
        <video
          ref={tileRef}
          src={src}
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="video-tile-video"
        />

        {(title || badge) && (
          <div className="video-tile-overlay">
            <span className="video-tile-title">{title}</span>
            {badge && <span className="video-tile-badge">{badge}</span>}
          </div>
        )}

        <button className="video-tile-btn" onClick={openPlayer}>
          {'\u{1F50A}'} Unmute and watch
        </button>
      </div>

      {mounted && open && createPortal(
        <div className="vid-modal" role="dialog" aria-modal="true" aria-label={title}>
          <button className="vid-modal-scrim" aria-label="Close video" onClick={closePlayer} />
          <div className="vid-modal-inner">
            <button className="vid-modal-close" onClick={closePlayer} aria-label="Close video">&times;</button>
            <video
              ref={modalRef}
              src={src}
              poster={poster}
              controls
              playsInline
              className="vid-modal-video"
            />
            <div className="vid-modal-meta">
              {badge && <span className="vid-modal-series">{badge}</span>}
              <strong>{title}</strong>
              {blurb && <p>{blurb}</p>}
              <a
                href={ctaHref}
                className="btn-primary"
                onClick={() => {
                  try {
                    posthog.capture('video_cta_click', { title, location })
                  } catch { /* never break the page */ }
                }}
              >
                {ctaLabel}
              </a>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
