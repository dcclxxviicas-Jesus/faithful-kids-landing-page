import type { Metadata } from 'next'
import { Suspense } from 'react'
import { SiteNav, SiteFooter } from '@/app/components/SiteChrome'
import { GiftHero, GiftHeroShell } from './GiftHero'

/**
 * /gift — the landing page behind the church parent-kit QR codes
 * (Special Projects step 1, Oct 11 2026; Cas-approved scope).
 *
 * A church hands a parent a bulletin insert; the QR lands here. Rules of
 * this page, set in the routing decision:
 *   - The gift is REAL and already free: the 200 story retellings and the
 *     printables library. Zero signup, zero email wall.
 *   - NO quiz/trial/checkout as a primary CTA — a church bulletin must not
 *     turn out to be an ad. The site's normal nav/footer exist; selling
 *     happens later, on the parent's initiative.
 *   - ?church=<slug> + UTMs make each church's distribution measurable;
 *     &n=<Display Name> personalizes the headline. No lookup table — the
 *     QR URL carries everything, so the page can never 404 on an unknown
 *     church.
 *   - noindex: this is a distribution page, not an SEO asset, and it would
 *     only ever be thin-content competition for the real library pages.
 */

export const metadata: Metadata = {
  title: 'A Gift for Your Family',
  description:
    'Free Bible stories for your kids — 200 retellings from Genesis to Revelation, plus printable games and coloring pages. No signup needed.',
  robots: { index: false, follow: true },
  alternates: { canonical: 'https://faithfulkids.app/gift' },
}

export default function GiftPage() {
  return (
    <>
      <SiteNav />
      {/* Query-param personalization needs a client boundary; Suspense keeps
          the static shell fast and the fallback is the un-personalized copy. */}
      <Suspense fallback={<GiftHeroShell name="" />}>
        <GiftHero />
      </Suspense>

      <section className="cp-intro">
        <h2>What&rsquo;s inside the gift</h2>
        <ul>
          <li>
            <strong><a href="/bible-stories-for-kids">200 Bible stories, retold for kids</a></strong> —
            the whole Bible from Genesis to Revelation, each story told simply with a short
            video lesson beside it. Free to read and watch, no account needed.
          </li>
          <li>
            <strong><a href="/printables">A library of free printables</a></strong> — Bible
            coloring pages, word searches, crosswords, trivia packs, charades and bingo for
            family game night. Free to print and photocopy for home, class, or church.
          </li>
          <li>
            <strong><a href="/bible-trivia">A Bible trivia game</a></strong> — 100 questions,
            playable right in the browser, no signup.
          </li>
        </ul>
        <p>
          Nothing on this page asks for your email or your card. It&rsquo;s a gift — from a
          church that cares about your family, and from ours. Enjoy it.
        </p>
      </section>

      <SiteFooter />
    </>
  )
}
