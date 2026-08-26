'use client'

import { useEffect, useState } from 'react'
import posthog from 'posthog-js'

const DISMISS_KEY = 'fk_sticky_dismissed_at'
const DISMISS_MS = 24 * 60 * 60 * 1000
// A fraction of ONE SCREEN, not of the page. These posts run 12k-30k px, so a
// percentage of document height meant 4-9 screens of scrolling before the bar
// appeared -- it would have been invisible for most of the visit.
const SHOW_AFTER_SCREENS = 0.6

/**
 * Bottom CTA bar. It is the best-converting CTA on mobile blog pages, so it
 * stays -- but it no longer covers the article the instant you land, it is one
 * compact row on phones instead of two.
 *
 * The dismiss button was removed on Aug 26: it drew 6 uses against 2 clicks,
 * i.e. it was retiring the CTA faster than the CTA converted. Existing
 * dismissals are still honoured so nobody who hid it gets it forced back.
 */
export function BlogStickyCta({ postSlug }: { postSlug: string }) {
  const [visible, setVisible] = useState(false)
  const [gone, setGone] = useState(false)

  useEffect(() => {
    try {
      const at = Number(localStorage.getItem(DISMISS_KEY) || 0)
      if (at && Date.now() - at < DISMISS_MS) { setGone(true); return }
    } catch { /* private mode */ }

    function onScroll() {
      setVisible(window.scrollY > window.innerHeight * SHOW_AFTER_SCREENS)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (gone) return null

  return (
    <div className={`blog-sticky-cta${visible ? '' : ' is-hidden'}`}>
      <div className="blog-sticky-inner">
        <span className="blog-sticky-text">
          <strong>Start your child&apos;s Bible journey</strong>
          <span className="blog-sticky-long"> &mdash; 3 days free</span>
        </span>
        <a
          href="/quiz"
          className="btn-primary blog-sticky-btn"
          onClick={() => {
            try { posthog.capture('blog_sticky_click', { post: postSlug }) } catch { /* never break the page */ }
          }}
        >
          Try Free
        </a>
      </div>
    </div>
  )
}
