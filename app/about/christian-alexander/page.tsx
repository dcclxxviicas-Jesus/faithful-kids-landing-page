import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteNav, SiteFooter } from '@/app/components/SiteChrome'

/**
 * Author / founder entity page.
 *
 * Why this exists: every blog post declared `author: { '@type': 'Person',
 * name: 'Faithful Kids Team' }` — a Person node whose name is not a person,
 * which is an invalid entity and gave Google nothing to resolve. Meanwhile
 * the founder published an op-ed in The Christian Post (Sept 1, 2026) under
 * a real byline with its own author archive, and nothing on this site
 * connected the two.
 *
 * The fix is deliberately narrow:
 * - Blog posts are authored by the ORGANISATION, not by a person. Nobody
 *   hand-wrote 533 posts, and fabricated bylines are a documented spam
 *   pattern. Do not "improve" this by bylining the library.
 * - This page carries the one canonical Person node (@id below). The
 *   Organization references it as `founder`. That lets Google connect
 *   brand -> founder -> the Christian Post byline without any false claim.
 *
 * Rules for editing:
 * - `sameAs` may only list profiles that genuinely belong to him and
 *   resolve to a live page. Verified 2026-09-02: the Christian Post author
 *   archive returns 200 and is indexable. Never pad this array.
 * - Ages stated here must match /about (5 to 15). The op-ed bio said 7 to 15;
 *   the site's canonical claim is 5 to 15, so this page uses that.
 */

const PERSON_ID = 'https://faithfulkids.app/about/christian-alexander#person'

const BIO =
  'Christian Alexander writes about faith formation and screens in family life. He is the founder of Faithful Kids, a Bible video app for kids ages 5 to 15 built for the 10-minute version of family devotions: one short story from Genesis to Revelation, one quiz, and one reflection question written to start a conversation at the table rather than end one on a screen.'

export const metadata: Metadata = {
  title: 'Christian Alexander — Founder of Faithful Kids',
  description:
    'Christian Alexander is the founder of Faithful Kids, a Bible video app for kids ages 5-15. He writes about faith formation and screens in family life.',
  alternates: { canonical: 'https://faithfulkids.app/about/christian-alexander' },
  openGraph: {
    title: 'Christian Alexander — Founder of Faithful Kids',
    description:
      'Founder of Faithful Kids. Writes about faith formation and screens in family life.',
    url: 'https://faithfulkids.app/about/christian-alexander',
    siteName: 'Faithful Kids',
    type: 'profile',
  },
}

export default function AuthorPage() {
  const profileSchema = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url: 'https://faithfulkids.app/about/christian-alexander',
    mainEntity: {
      '@type': 'Person',
      '@id': PERSON_ID,
      name: 'Christian Alexander',
      url: 'https://faithfulkids.app/about/christian-alexander',
      jobTitle: 'Founder',
      description: BIO,
      worksFor: {
        '@type': 'Organization',
        name: 'Faithful Kids',
        url: 'https://faithfulkids.app',
      },
      knowsAbout: [
        'Christian parenting',
        'faith formation',
        'children and screen time',
        'family devotions',
        'Bible education for children',
      ],
      // Only profiles that genuinely belong to him and resolve live.
      sameAs: ['https://www.christianpost.com/by/christian-alexander'],
    },
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://faithfulkids.app' },
      { '@type': 'ListItem', position: 2, name: 'About', item: 'https://faithfulkids.app/about' },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Christian Alexander',
        item: 'https://faithfulkids.app/about/christian-alexander',
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(profileSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <SiteNav />

      <section className="blog-hero">
        <span className="section-label">Founder</span>
        <h1>Christian Alexander</h1>
        <p className="blog-hero-sub">
          Founder of Faithful Kids. Writes about faith formation and screens in family life.
        </p>
      </section>

      <section className="stories-intro">
        <p>{BIO}</p>
        <p>
          He built Faithful Kids for his own children, as an alternative to the autoplay feed: a
          screen where every video ends in a question instead of another video. The app now covers
          the whole Bible in order across more than 300 episodes, and the site gives away a large
          free library — Bible story retellings, printable{' '}
          <Link href="/printables/bible-coloring-pages">coloring pages</Link> and{' '}
          <Link href="/printables/bible-word-search">word searches</Link>, and a 100-question{' '}
          <Link href="/bible-trivia">Bible trivia game</Link> — with no sign-up at all.
        </p>
      </section>

      <section className="stories-section">
        <h2>Published writing</h2>
        <ul>
          <li>
            <a
              href="https://www.christianpost.com/voices/i-took-my-kids-screens-away-heres-why-it-didnt-work.html"
              target="_blank"
              rel="noopener"
            >
              I took my kids&apos; screens away. Here&apos;s why it didn&apos;t work.
            </a>{' '}
            — The Christian Post, September 1, 2026
          </li>
        </ul>
        <p>
          More on the thinking behind the app is on the{' '}
          <Link href="/about">about page</Link>, which lays out pricing, ages, and how the app
          treats kids&apos; data in plain language.
        </p>
      </section>

      <section className="blog-bottom-cta">
        <h2>See what he built</h2>
        <p>
          Short Bible video lessons for kids ages 5 to 15 — each one followed by a quiz and a
          question worth talking about.
        </p>
        <Link href="/quiz" className="btn-primary">
          Get started
        </Link>
      </section>

      <SiteFooter />
    </>
  )
}
