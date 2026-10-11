'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import posthog from 'posthog-js'

/* Static markup, usable as the Suspense fallback (no hooks). */
export function GiftHeroShell({ name }: { name: string }) {
  return (
    <section className="blog-hero">
      <span className="section-label">A gift for your family</span>
      <h1>Free Bible stories your kids will actually ask for</h1>
      <p className="blog-hero-sub">
        {name
          ? <>With love from <strong>{name}</strong> — 200 Bible stories retold for kids, plus
              printable games and coloring pages. All free. No signup, no email, no catch.</>
          : <>With love from your church family — 200 Bible stories retold for kids, plus
              printable games and coloring pages. All free. No signup, no email, no catch.</>}
      </p>
      <a className="btn-primary" href="/bible-stories-for-kids">Open the stories &rarr;</a>
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
