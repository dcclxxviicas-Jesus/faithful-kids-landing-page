'use client'

/**
 * Scripture pull-quote CTA — the blog→quiz experiment (Aug 29, 2026).
 *
 * The funnel loses 95% of visitors between reading a post and reaching /quiz;
 * the end-of-post CTAs are invisible to the 81% who bounce first. This sits
 * high, after the first H2 section — value first.
 *
 * RESTYLED Aug 31 2026 (owner call). It was originally a pull-quote on the
 * theory that content outperforms interruptions; in practice it read as part
 * of the article and people scrolled past it. It is now a distinct card with
 * its own ground, an eyebrow and a lesson still, so it reads as an offer.
 * The prior styling had 57 impressions and 2 clicks — far from significance —
 * so the arm data is not worth preserving. Treat Aug 31 as the new baseline.
 *
 * Experiment contract (the /cas-admin "Verse CTA experiment" panel reads
 * these exactly — do not rename properties or variant keys):
 *   posthog.capture('verse_cta_shown', { variant, post })  — on first entry
 *     into the viewport (IntersectionObserver), never on page load.
 *   posthog.capture('verse_cta_click', { variant, post })
 *   variant ∈ mark_10_14 | psalm_78_4 | deut_6_6, assigned randomly once and
 *     persisted in localStorage so a returning reader keeps their arm.
 * One variable only: the verse. Button copy and placement stay constant for
 * the life of the test.
 */

import { useEffect, useRef, useState } from 'react'
import posthog from 'posthog-js'

const VARIANTS = {
  mark_10_14: {
    text: 'Let the little children come to me, and do not hinder them.',
    ref: 'Mark 10:14',
  },
  psalm_78_4: {
    text: 'We will tell the next generation the praiseworthy deeds of the Lord, and the wonders he has done.',
    ref: 'Psalm 78:4',
  },
  deut_6_6: {
    text: 'These commandments that I give you today are to be on your hearts. Impress them on your children. Talk about them when you sit at home and when you walk along the road, when you lie down and when you get up.',
    ref: 'Deuteronomy 6:6-7',
  },
} as const

type VariantKey = keyof typeof VARIANTS
const KEYS = Object.keys(VARIANTS) as VariantKey[]
const STORAGE_KEY = 'fk_verse_cta_variant'

export function VerseCta({ postSlug }: { postSlug: string }) {
  const [variant, setVariant] = useState<VariantKey | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  const shownFired = useRef(false)

  // Assign after mount (never during SSR/hydration): random on first view,
  // persisted so a returning reader keeps the same arm.
  useEffect(() => {
    let v: VariantKey | null = null
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored && KEYS.includes(stored as VariantKey)) v = stored as VariantKey
    } catch { /* private mode etc. — fall through to per-view random */ }
    if (!v) {
      v = KEYS[Math.floor(Math.random() * KEYS.length)]
      try { localStorage.setItem(STORAGE_KEY, v) } catch { /* per-view arm is still valid data */ }
    }
    setVariant(v)
  }, [])

  // Impression = actually seen, not merely rendered. The same observer also
  // broadcasts visibility so the sticky bar can step aside while this CTA is
  // on screen (three asks in one viewport was one too many).
  useEffect(() => {
    if (!variant || !ref.current) return
    const fire = () => {
      if (shownFired.current) return
      shownFired.current = true
      try { posthog.capture('verse_cta_shown', { variant, post: postSlug }) } catch { /* never break the page */ }
    }
    const broadcast = (visible: boolean) => {
      try { window.dispatchEvent(new CustomEvent('fk-verse-cta-visibility', { detail: { visible } })) } catch { /* never break the page */ }
    }
    if (typeof IntersectionObserver === 'undefined') { fire(); return }
    const io = new IntersectionObserver(
      entries => {
        // Any visible pixel drives the sticky-bar handoff; the impression
        // keeps its stricter half-on-screen bar.
        const entry = entries[entries.length - 1]
        broadcast(entry.isIntersecting)
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) fire()
      },
      { threshold: [0, 0.5] },
    )
    io.observe(ref.current)
    return () => { io.disconnect(); broadcast(false) }
  }, [variant, postSlug])

  if (!variant) return null
  const v = VARIANTS[variant]

  return (
    <aside ref={ref} className="verse-cta" aria-label="Try Faithful Kids">
      <div className="verse-cta-body">
        <span className="verse-cta-eyebrow">From Faithful Kids</span>
        <p className="verse-cta-verse">&ldquo;{v.text}&rdquo;</p>
        <p className="verse-cta-ref">&mdash; {v.ref}</p>
        <p className="verse-cta-pitch">
          Bible time with your kids, made easy: a two-minute story narrated by Jesus,
          then a few questions to talk about together.
        </p>
        <a
          href="/quiz"
          className="verse-cta-btn"
          onClick={() => { try { posthog.capture('verse_cta_click', { variant, post: postSlug }) } catch { /* never break the page */ } }}
        >
          Start your kids&apos; Bible journey &rarr;
        </a>
        <span className="verse-cta-fine">Cancel anytime &middot; no ads, ever</span>
      </div>

      <img
        className="verse-cta-art"
        src="https://d3g07v1w0lehiv.cloudfront.net/video-posters/an-angel-visits-mary.webp"
        alt="A still from the Faithful Kids lesson An Angel Visits Mary"
        width={720}
        height={405}
        loading="lazy"
      />
    </aside>
  )
}
