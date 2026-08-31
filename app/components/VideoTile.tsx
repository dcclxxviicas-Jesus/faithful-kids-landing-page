'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import posthog from 'posthog-js'

/**
 * The one video pattern for the whole site.
 *
 * The tile autoplays muted as an ambient preview. Pressing the button opens
 * the lesson full size, with sound, RESTARTED from zero — unmuting a loop
 * already halfway through is a poor first viewing of the product.
 *
 * BANDWIDTH. These files are ~30MB and this component now renders on 200 story
 * posts. Naive autoplay would pull 30MB on every blog page view, so the src is
 * not attached until the tile is near the viewport, and playback pauses when it
 * leaves. A page view still costs nothing until the tile is actually seen.
 */
export function VideoTile({
  src,
  poster,
  title,
  badge,
  blurb,
  location,
  className = '',
  showLabels = true,
  captionsUrl,
  ctaHref = '/quiz',
  ctaLabel = 'See more videos like this',
  onHalfway,
  onEnded,
  onOpen,
}: {
  src: string
  poster?: string
  title: string
  badge?: string
  blurb?: string
  /** Where on the site this tile lives — goes into every event. */
  location: string
  className?: string
  /** Hero uses false: the art alone, no caption furniture. */
  showLabels?: boolean
  captionsUrl?: string
  ctaHref?: string
  ctaLabel?: string
  onHalfway?: () => void
  onEnded?: () => void
  onOpen?: () => void
}) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [near, setNear] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const tileRef = useRef<HTMLVideoElement>(null)
  const modalRef = useRef<HTMLVideoElement>(null)
  const halfFired = useRef(false)

  useEffect(() => setMounted(true), [])

  // Load and play only while the tile is on (or near) screen.
  useEffect(() => {
    const el = wrapRef.current
    if (!el || typeof IntersectionObserver === 'undefined') { setNear(true); return }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setNear(true)
        const v = tileRef.current
        if (!v) return
        if (entry.isIntersecting) v.play().catch(() => { /* autoplay policy */ })
        else v.pause()
      },
      { rootMargin: '300px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const openPlayer = useCallback(() => {
    tileRef.current?.pause()
    setOpen(true)
    onOpen?.()
    try { posthog.capture('video_expanded', { title, location }) } catch { /* never break playback */ }
  }, [title, location, onOpen])

  const closePlayer = useCallback(() => {
    setOpen(false)
    tileRef.current?.play().catch(() => { /* autoplay policy */ })
  }, [])

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
  }, [open, closePlayer])

  return (
    <div ref={wrapRef} className={`video-tile ${className}`.trim()}>
      <div className="video-tile-screen">
        <video
          ref={tileRef}
          src={near ? src : undefined}
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
          preload={near ? 'metadata' : 'none'}
          className="video-tile-video"
        />

        {showLabels && (title || badge) && (
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
              onTimeUpdate={e => {
                const v = e.currentTarget
                if (!halfFired.current && v.duration && v.currentTime / v.duration >= 0.5) {
                  halfFired.current = true
                  onHalfway?.()
                }
              }}
              onEnded={() => onEnded?.()}
            >
              {captionsUrl && (
                <track kind="captions" src={captionsUrl} srcLang="en" label="English" default />
              )}
            </video>
            <div className="vid-modal-meta">
              {badge && <span className="vid-modal-series">{badge}</span>}
              <strong>{title}</strong>
              {blurb && <p>{blurb}</p>}
              <a
                href={ctaHref}
                className="btn-primary"
                onClick={() => {
                  try { posthog.capture('video_cta_click', { title, location }) } catch { /* never break */ }
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
