import type { Metadata } from 'next'
import '../home.css'
import '../v2-pages.css'
import { SiteNav, SiteFooter } from '@/app/components/SiteChrome'
import { getAllPosts } from '@/lib/blog'
import { HOLIDAYS, MIN_POSTS, monthsUntil, type Holiday } from '@/lib/holidays'
import { V2Shell, V2Hero } from '@/app/v2-shell'

export const metadata: Metadata = {
  title: { absolute: 'Bible Activities for Every Holiday' },
  description:
    'Free Bible resources for kids by season: Christmas and Advent, Easter and Holy Week, Thanksgiving, back to school, and Halloween alternatives. No sign-up.',
  alternates: { canonical: 'https://faithfulkids.app/holidays' },
  openGraph: {
    title: 'Bible Activities for Every Holiday',
    description:
      'Free Bible resources for kids by season: Christmas, Easter, Thanksgiving, back to school and more.',
    url: 'https://faithfulkids.app/holidays',
    siteName: 'Faithful Kids',
    type: 'website',
  },
}

/** VISUAL TEST of /holidays. Same seasons, same order, same links, same copy,
 *  both schema blocks unchanged. Only the presentation moves. */

function postsFor(h: Holiday) {
  return getAllPosts().filter(p => h.match.test(p.slug))
}

function HolidaysV2() {
  // Only seasons with real content, ordered by what is coming next.
  const live = HOLIDAYS.filter(h => postsFor(h).length >= MIN_POSTS).sort(
    (a, b) => monthsUntil(a.peakMonth) - monthsUntil(b.peakMonth)
  )

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Bible Activities for Every Holiday',
    url: 'https://faithfulkids.app/holidays',
    isPartOf: { '@type': 'WebSite', name: 'Faithful Kids', url: 'https://faithfulkids.app' },
    hasPart: live.map(h => ({
      '@type': 'CollectionPage',
      name: h.title,
      url: `https://faithfulkids.app/holidays/${h.slug}`,
      description: h.metaDescription,
    })),
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://faithfulkids.app' },
      { '@type': 'ListItem', position: 2, name: 'Holidays' },
    ],
  }

  return (
    <>
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <SiteNav active="blog" />

      <main id="main-content">

      {/* The breadcrumb stays above the hero and matches the BreadcrumbList
          schema above it. */}
      <div className="v2-crumb">
        <a href="/blog">For Parents</a>
        <span aria-hidden="true">/</span>
        <span className="is-current">Holidays</span>
      </div>

      <V2Hero
        short
        art="holidays"
        alt="A windowsill through the seasons: an Advent candle and evergreen, spring blossom and a decorated egg, summer wildflowers, then autumn leaves and a small pumpkin"
        eyebrow={`${live.length} seasons, ordered by what is next`}
        title={<>Bible Activities for Every <span className="hv-love"><span className="l l1">H</span><span className="l l2">o</span><span className="l l3">l</span><span className="l l4">i</span><span className="l l1">d</span><span className="l l2">a</span><span className="l l3">y</span></span></>}
        sub={<>Every season gathered in one place &mdash; the stories, verses, trivia and free
          printables we have for Christmas, Easter, Thanksgiving, the first week of school, and
          the end of October. Everything here is free and nothing asks for an email address.</>}
      />

      <section className="v2-section">
        <div className="v2-wrap">
          <div className="v2-grid is-3">
            {live.map(h => {
              const n = postsFor(h).length
              return (
                <a key={h.slug} href={`/holidays/${h.slug}`} className="v2-asset hd-card">
                  <span className="hd-art">
                    {/* Card-sized copy. The originals run 183-506KB each and
                        five of them is 1.4MB for cards that render about 360px
                        wide — the live page pays that too. These are 760px. */}
                    <img
                      src={`https://d3g07v1w0lehiv.cloudfront.net/blog-images/sm/${h.heroSlug}-hero.webp`}
                      alt={h.name}
                      width={760}
                      height={434}
                      loading="lazy"
                      decoding="async"
                    />
                    <span className="hd-peak">{h.peak}</span>
                  </span>
                  <h3>{h.name}</h3>
                  <p>{h.metaDescription}</p>
                  <span className="v2-asset-go">
                    {n} free {n === 1 ? 'resource' : 'resources'} &rarr;
                  </span>
                </a>
              )
            })}
          </div>
        </div>
      </section>

      <section className="hv-close">
        <ul className="hv-chips">
          <li><span aria-hidden="true">📖</span>300+ lessons</li>
          <li><span aria-hidden="true">✅</span>Quiz after every story</li>
          <li><span aria-hidden="true">🚫</span>Safe and ad-free</li>
        </ul>
        <h2>Start Your Child&apos;s Bible Journey</h2>
        <p className="hv-close-fine" style={{ margin: '0 auto 22px', maxWidth: '40em' }}>
          300+ narrated video lessons with comprehension quizzes after every story.
          From Genesis to Revelation &mdash; safe, ad-free, and made for kids.
        </p>
        <a className="hv-cta" href="/quiz">
          <span className="hv-cta-play" aria-hidden="true" />
          Get started
        </a>
      </section>

      </main>

      <SiteFooter />
    </>
  )
}

export default function Page() {
  return (
    <V2Shell>
      <HolidaysV2 />
    </V2Shell>
  )
}
