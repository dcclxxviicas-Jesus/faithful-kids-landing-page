import type { Metadata } from 'next'
import '../home.css'
import '../v2-pages.css'
import '../hub.css'
import { SiteNav, SiteFooter } from '@/app/components/SiteChrome'
import { getAllPosts } from '@/lib/blog'
import { HOLIDAYS, MIN_POSTS, byNext, type Holiday } from '@/lib/holidays'
import { V2Shell, V2Hero } from '@/app/v2-shell'

/* Rebuilt every six hours so the season that is coming up next moves to the
   front on its own, without a deploy (owner request, Nov 17, 2026). */
export const revalidate = 21600

export const metadata: Metadata = {
  title: { absolute: 'Bible Activities for Every Holiday' },
  description:
    'Free Bible resources for kids by season: Christmas and Advent, Easter and Holy Week, Thanksgiving, back to school, and Halloween alternatives.',
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
  const live = byNext(HOLIDAYS.filter(h => postsFor(h).length >= MIN_POSTS))

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

      <SiteNav />

      <main id="main-content" className="hb">

      {/* No visible breadcrumb (owner, Nov 17, 2026); the BreadcrumbList
          schema above still tells search engines where the page sits. */}
      {/* Live header kept (owner, Nov 17, 2026). */}
      <V2Hero
        short
        art="holidays"
        alt="A windowsill through the seasons: an Advent candle and evergreen, spring blossom and a decorated egg, summer wildflowers, then autumn leaves and a small pumpkin"
        eyebrow={`${live.length} seasons, ordered by what is next`}
        title={<>Bible Activities for Every <span className="hv-love"><span className="l l1">H</span><span className="l l2">o</span><span className="l l3">l</span><span className="l l4">i</span><span className="l l1">d</span><span className="l l2">a</span><span className="l l3">y</span></span></>}
        sub={<>Every season gathered in one place, the stories, verses, trivia and free
          printables we have for Christmas, Easter, Thanksgiving, the first week of school, and
          the end of October. Everything here is free.</>}
      />

      {/* The season coming next leads, picture and words side by side; the
          rest follow in pairs. Same cards, same order, same words. */}
      <section className="hb-section is-tight-top">
        <div className="hb-wrap">
          <div className="hb-shelf is-2">
            {live.map((h, i) => {
              const n = postsFor(h).length
              return (
                <a key={h.slug} href={`/holidays/${h.slug}`} className={`hb-item${i === 0 ? ' is-lead' : ''}`}>
                  <span className="hb-thumb">
                    {/* Card-sized copy. The originals run 183-506KB each and
                        five of them is 1.4MB for cards that render about 360px
                        wide. These are 760px. */}
                    <img
                      src={`https://d3g07v1w0lehiv.cloudfront.net/blog-images/sm/${h.heroSlug}-hero.webp?v=3`}
                      alt={h.name}
                      width={760}
                      height={434}
                      loading={i === 0 ? 'eager' : 'lazy'}
                      decoding="async"
                    />
                    <span className="hb-tag">{h.peak}</span>
                  </span>
                  <span className="hb-item-text">
                    <h3>{h.name}</h3>
                    <p>{h.metaDescription}</p>
                    <span className="hb-go">
                      {n} free {n === 1 ? 'resource' : 'resources'} &rarr;
                    </span>
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
          From Genesis to Revelation, safe, ad-free, and made for kids.
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
