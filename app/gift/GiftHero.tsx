'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import posthog from 'posthog-js'
import { CDN } from '@/app/components/stories'

/* Four real lesson illustrations, not stock art and not an icon set. A parent
   scanning a QR in a church foyer should see what their kids would see within
   a second of landing. These are the same heroes the story posts use, so they
   are already on the CDN and already warm in cache for anyone who has read
   one. Slugs verified live (200) before shipping — a 403 here would render as
   four grey rectangles at the top of the page. */
const STRIP = [
  { slug: 'in-the-beginning-creation-for-kids', alt: 'Illustration of the creation of the world' },
  { slug: 'noah-and-the-great-flood-for-kids', alt: 'Illustration of Noah and the ark' },
  { slug: 'a-baby-in-a-basket-for-kids', alt: 'Illustration of baby Moses in a basket' },
  { slug: 'an-angel-visits-mary-for-kids', alt: 'Illustration of the angel visiting Mary' },
]

/* Static markup, usable as the Suspense fallback (no hooks). */
export function GiftHeroShell({ name }: { name: string }) {
  return (
    <section className="gift-hero">
      <div className="gift-hero-inner">
        <span className="gift-ribbon">
          {name ? <>A gift from {name}</> : <>A gift from your church</>}
        </span>
        <h1 className="gift-hero-h1">
          Free Bible stories your kids
          <br />
          will actually ask for
        </h1>
        <p className="gift-hero-sub">
          200 stories retold for children, each with a short video. Printable coloring pages,
          puzzles and games. A trivia game that plays in the browser.{' '}
          <strong>All free, and none of it asks you to sign up.</strong>
        </p>

        {/* Images, not a video: the hero must paint instantly on a phone over
            church wifi. The playable lessons start one section down, where a
            press is a deliberate choice rather than an ambush. */}
        <div className="gift-hero-strip" aria-hidden="false">
          {STRIP.map(s => (
            <img
              key={s.slug}
              className="gift-hero-art"
              src={`${CDN}/blog-images/${s.slug}-hero.webp`}
              alt={s.alt}
              width={320}
              height={213}
              loading="eager"
              decoding="async"
            />
          ))}
        </div>

        <a className="btn-primary btn-hero" href="#start">
          Start watching &mdash; it&rsquo;s free
        </a>
        <p className="gift-hero-note">No account. No email. Nothing to cancel.</p>
      </div>
    </section>
  )
}

/* The personalized hero: church slug + display name ride the QR URL itself
   (?church=slug&n=Name), so no lookup can fail. The slug goes to PostHog
   for per-church distribution measurement; the display name only goes on
   screen. Both are stripped and capped so a hand-edited URL cannot inject
   anything weird into the page. */
export function GiftHero() {
  const params = useSearchParams()
  const slug = (params?.get('church') || '').replace(/[^a-z0-9-]/gi, '').slice(0, 60)
  const name = (params?.get('n') || '').replace(/[^\p{L}\p{N} .,'&-]/gu, '').slice(0, 60).trim()

  useEffect(() => {
    if (slug) {
      try { posthog.capture('gift_page_view', { church: slug }) } catch { /* never block */ }
    }
  }, [slug])

  return <GiftHeroShell name={name} />
}
