'use client'

import { useEffect, useState } from 'react'
import posthog from 'posthog-js'

const DISMISS_KEY = 'fk_sticky_dismissed_at'
const DISMISS_MS = 24 * 60 * 60 * 1000
const SHOW_AFTER_SCROLL = 0.2

/**
 * Bottom CTA bar. It is the best-converting CTA on mobile blog pages, so it
 * stays -- but it no longer covers the article the instant you land, it is one
 * compact row on phones instead of two, and it can be dismissed for a day.
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
      const docH = document.documentElement.scrollHeight - window.innerHeight
      setVisible(docH > 0 && window.scrollY / docH >= SHOW_AFTER_SCROLL)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (gone) return null

  const dismiss = () => {
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())) } catch { /* private mode */ }
    setGone(true)
    try { posthog.capture('blog_sticky_dismissed', { post: postSlug }) } catch { /* never break the page */ }
  }

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
        <button className="blog-sticky-close" onClick={dismiss} aria-label="Hide this bar">&times;</button>
      </div>
    </div>
  )
}
