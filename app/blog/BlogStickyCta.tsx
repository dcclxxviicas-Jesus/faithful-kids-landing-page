'use client'

import { AppStoreBadge, useIsAppleTouch } from '../components/AppStore'

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
  const ctaHref = '/quiz'
  const isAppleTouch = useIsAppleTouch()
  const [visible, setVisible] = useState(false)
  const [gone, setGone] = useState(false)
  // Steps aside while the verse CTA is on screen — three asks in one viewport
  // (header, verse CTA, this bar) said the same thing three ways. Suppressed,
  // not removed: this is still the best-converting CTA on mobile, and its own
  // blog_sticky_click event will show whether the handoff costs anything.
  const [verseCtaOnScreen, setVerseCtaOnScreen] = useState(false)
  // The inline video CTA (PrintableCta) does the same handoff.
  const [inlineCtaOnScreen, setInlineCtaOnScreen] = useState(false)

  useEffect(() => {
    try {
      const at = Number(localStorage.getItem(DISMISS_KEY) || 0)
      if (at && Date.now() - at < DISMISS_MS) { setGone(true); return }
    } catch { /* private mode */ }

    function onScroll() {
      setVisible(window.scrollY > window.innerHeight * SHOW_AFTER_SCREENS)
    }
    function onVerseVisibility(e: Event) {
      setVerseCtaOnScreen(Boolean((e as CustomEvent).detail?.visible))
    }
    function onInlineVisibility(e: Event) {
      setInlineCtaOnScreen(Boolean((e as CustomEvent).detail?.visible))
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('fk-verse-cta-visibility', onVerseVisibility)
    window.addEventListener('fk-inline-cta-visibility', onInlineVisibility)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('fk-verse-cta-visibility', onVerseVisibility)
      window.removeEventListener('fk-inline-cta-visibility', onInlineVisibility)
    }
  }, [])

  if (gone) return null

  return (
    <div className={`blog-sticky-cta${isAppleTouch ? ' is-app' : ''}${visible && !verseCtaOnScreen && !inlineCtaOnScreen ? '' : ' is-hidden'}`}>
      <div className="blog-sticky-inner">
        <span className="blog-sticky-text">
          <strong>Start your child&apos;s Bible journey</strong>
        </span>
        {/* On an iPhone, installing is genuinely the lower-friction path:
            Face ID beats typing card details into mobile Safari. The trial is
            real either way — the app carries its own subscribe flow with the
            same 3 free days (ENABLE_NATIVE_PURCHASE is on). Everywhere else
            keeps the web CTA. */}
        {isAppleTouch ? (
          <span className="blog-sticky-app">
            <span className="blog-sticky-app-label">Start your kids&apos; Bible journey!</span>
            <AppStoreBadge location={`blog-sticky:${postSlug}`} height={36} />
          </span>
        ) : (
          <a
            href={ctaHref}
            className="btn-primary blog-sticky-btn"
            onClick={() => {
              try { posthog.capture('blog_sticky_click', { post: postSlug }) } catch { /* never break the page */ }
            }}
          >
            Get started
          </a>
        )}
      </div>
    </div>
  )
}
