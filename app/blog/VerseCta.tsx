'use client'

/**
 * Scripture pull-quote CTA — the blog→quiz experiment (Aug 29, 2026).
 *
 * The funnel loses 95% of visitors between reading a post and reaching /quiz;
 * the end-of-post CTAs are invisible to the 81% who bounce first. This sits
 * high (after the first H2 section — value first) and is styled as a
 * pull-quote, not an ad unit, because the posts already format verses this
 * way and content outperforms interruptions.
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

  // Impression = actually seen, not merely rendered.
  useEffect(() => {
    if (!variant || !ref.current) return
    const fire = () => {
      if (shownFired.current) return
      shownFired.current = true
      try { posthog.capture('verse_cta_shown', { variant, post: postSlug }) } catch { /* never break the page */ }
    }
    if (typeof IntersectionObserver === 'undefined') { fire(); return }
    const io = new IntersectionObserver(
      entries => { if (entries.some(e => e.isIntersecting)) { fire(); io.disconnect() } },
      { threshold: 0.5 },
    )
    io.observe(ref.current)
    return () => io.disconnect()
  }, [variant, postSlug])

  if (!variant) return null
  const v = VARIANTS[variant]

  return (
    <div ref={ref} className="verse-cta" style={{ margin: '40px auto', maxWidth: 640, padding: '4px 0 4px 22px', borderLeft: '4px solid #059669' }}>
      <p style={{ fontSize: '1.28rem', lineHeight: 1.55, fontStyle: 'italic', color: '#1f2937', margin: 0, fontFamily: 'Georgia, "Times New Roman", serif' }}>
        &ldquo;{v.text}&rdquo;
      </p>
      <p style={{ margin: '10px 0 0', fontWeight: 700, color: '#059669', fontSize: '0.95rem', letterSpacing: '0.02em' }}>
        — {v.ref}
      </p>
      <p style={{ margin: '18px 0 0', color: '#4b5563', fontSize: '1rem', lineHeight: 1.6 }}>
        Three minutes at bedtime is enough to start. A story narrated by Jesus, a few questions,
        and one thing to talk about together.
      </p>
      <a
        href="/quiz"
        onClick={() => { try { posthog.capture('verse_cta_click', { variant, post: postSlug }) } catch { /* never break the page */ } }}
        style={{ display: 'inline-block', marginTop: 16, background: '#059669', color: '#fff', fontWeight: 700, padding: '12px 22px', borderRadius: 12, textDecoration: 'none', boxShadow: '0 4px 0 #047857' }}
      >
        Start your kids&apos; Bible journey &rarr;
      </a>
    </div>
  )
}
