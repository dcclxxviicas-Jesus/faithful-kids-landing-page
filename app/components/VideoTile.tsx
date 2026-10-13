'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import posthog from 'posthog-js'

/**
 * The one video pattern for the whole site.
 *
 * By default the tile shows its poster and downloads nothing. Pressing the
 * button opens the lesson full size, with sound, from zero.
 *
 * The hero passes autoplay — there the tile loops muted as an ambient preview.
 * Everywhere else no video is fetched until the button is pressed. See the
 * autoplay prop for why that split exists.
 *
 * The button reads "Watch what your kids will see" in every case. It used to
 * say "Unmute and watch" on the hero, which described the mechanism rather
 * than the offer, and meant the same control was named two different things
 * on one page.
 */
export function VideoTile({
  src,
  loopSrc,
  poster,
  tilePoster,
  title,
  badge,
  blurb,
  location,
  className = '',
  showLabels = true,
  autoplay = false,
  playDisc = false,
  captionsUrl,
  ctaHref = '/quiz',
  ctaLabel = 'See more videos like this',
  onHalfway,
  onEnded,
  onOpen,
}: {
  src: string
  loopSrc?: string
  poster?: string
  /**
   * A smaller poster for the TILE only; the modal keeps the full-size one.
   * A tile renders ~320px wide, so a 1280px poster is 3x the bytes for no
   * visible gain — but the modal fills the screen and a soft first frame
   * there is the one place it would show.
   */
  tilePoster?: string
  title: string
  badge?: string
  blurb?: string
  /** Where on the site this tile lives — goes into every event. */
  location: string
  className?: string
  /** Hero uses false: the art alone, no caption furniture. */
  showLabels?: boolean
  /**
   * Muted ambient loop. ONLY the hero should set this true.
   *
   * Measured on a full scroll: the homepage pulled ~82MB, /homeschool ~139MB,
   * and a single blog post ~44MB. At ~2,880 blog visitors a month that was
   * ~127GB of video nobody asked for, on the pages that actually rank — plus
   * a video starting under the eyes of someone who came to read.
   *
   * The hero keeps it because there the video IS the pitch, above the fold,
   * and it is the difference between "here is an app" and "here is what your
   * child would be watching".
   */
  autoplay?: boolean
  /**
   * The big centred play disc with "Play this story" under it, instead of
   * the pill button along the bottom edge. The homepage shelf shipped this
   * first (Oct 12, 2026) and the owner asked for the same control on every
   * story post the next day. Styles: `.video-tile--disc` in globals.css.
   */
  playDisc?: boolean
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

  // Only autoplaying tiles need to fetch on approach. A poster-first tile
  // downloads nothing until the button is pressed.
  useEffect(() => {
    if (!autoplay) return
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
  }, [autoplay])

  const openPlayer = useCallback(() => {
    tileRef.current?.pause()
    setNear(true)
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
    <div ref={wrapRef} className={`video-tile ${playDisc ? 'video-tile--disc' : ''} ${className}`.replace(/\s+/g, ' ').trim()}>
      <div className="video-tile-screen">
        <video
          ref={tileRef}
          src={autoplay && near ? (loopSrc || src) : undefined}
          poster={tilePoster || poster}
          autoPlay={autoplay}
          muted
          loop={autoplay}
          playsInline
          preload={autoplay && near ? 'metadata' : 'none'}
          className="video-tile-video"
        />

        {showLabels && (title || badge) && (
          <div className="video-tile-overlay">
            <span className="video-tile-title">{title}</span>
            {badge && <span className="video-tile-badge">{badge}</span>}
          </div>
        )}

        {/* Three tiles side by side otherwise all announce "Watch what your
            kids will see", which tells a screen reader user nothing about
            which story they are opening. The label KEEPS the visible text and
            appends the title: an accessible name that drops the words on the
            button breaks voice control, and axe flags it
            (label-content-name-mismatch). */}
        <button
          className="video-tile-btn"
          onClick={openPlayer}
          aria-label={title ? `${'\u25B6'} Watch what your kids will see: ${title}` : undefined}
        >
          {`${'\u25B6'} Watch what your kids will see`}
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
