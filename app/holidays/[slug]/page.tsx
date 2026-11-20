import type { Metadata } from 'next'
import { SiteNav, SiteFooter } from '@/app/components/SiteChrome'
import { notFound } from 'next/navigation'
import { getAllPosts } from '@/lib/blog'
import { HOLIDAYS, getHoliday, MIN_POSTS, byNext, type Holiday } from '@/lib/holidays'
import { EmailCaptureCard } from '@/app/blog/EmailCaptureCard'
import { V2Shell } from '@/app/v2-shell'
import '../../home.css'
import '../../v2-pages.css'
import '../../hub.css'
import './season.css'

type Props = { params: Promise<{ slug: string }> }

// Not exported: a Next.js page file may only export the framework's own
// names (default, generateMetadata, generateStaticParams, ...). Anything
// else fails the build with "does not match the required types of a Page".
function postsForHoliday(h: Holiday) {
  // Story posts first (they carry the video), then guides, each newest first.
  return getAllPosts()
    .filter(p => h.match.test(p.slug))
    .sort((a, b) => (b.dateModified || '').localeCompare(a.dateModified || ''))
}

function liveHolidays() {
  return HOLIDAYS.filter(h => postsForHoliday(h).length >= MIN_POSTS)
}

/* Rebuilt every six hours so "Other seasons" stays in coming-up order and
   the sign-up below offers the right seasonal printable. */
export const revalidate = 21600

export async function generateStaticParams() {
  return liveHolidays().map(h => ({ slug: h.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const h = getHoliday(slug)
  if (!h) return { title: 'Not Found' }
  return {
    // absolute: the root layout appends " | Faithful Kids", which costs 16 of
    // the ~60 characters Google displays. See app/blog/[slug]/page.tsx.
    title: { absolute: h.title },
    description: h.metaDescription,
    alternates: { canonical: `https://faithfulkids.app/holidays/${h.slug}` },
    openGraph: {
      title: h.title,
      description: h.metaDescription,
      url: `https://faithfulkids.app/holidays/${h.slug}`,
      siteName: 'Faithful Kids',
      type: 'website',
    },
  }
}

export default async function HolidayHubPage({ params }: Props) {
  const { slug } = await params
  const h = getHoliday(slug)
  if (!h) notFound()

  const posts = postsForHoliday(h)
  if (posts.length < MIN_POSTS) notFound()

  const url = `https://faithfulkids.app/holidays/${h.slug}`

  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: h.title,
    description: h.metaDescription,
    url,
    isPartOf: { '@type': 'WebSite', name: 'Faithful Kids', url: 'https://faithfulkids.app' },
    hasPart: posts.map(p => ({
      '@type': 'Article',
      headline: p.title,
      url: `https://faithfulkids.app/blog/${p.slug}`,
      description: p.metaDescription,
    })),
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://faithfulkids.app' },
      { '@type': 'ListItem', position: 2, name: 'Holidays', item: 'https://faithfulkids.app/holidays' },
      { '@type': 'ListItem', position: 3, name: h.name },
    ],
  }

  const others = byNext(liveHolidays()).filter(o => o.slug !== h.slug)
  // The first email delivers a printable. Christmas always gets the Advent
  // readings; other seasons follow the site-wide rule (Advent readings in
  // November and December, the Bedtime Bible Kit otherwise).
  const magnet = h.slug === 'christmas' || [10, 11].includes(new Date().getMonth()) ? 'advent' : 'bedtime-kit'

  return (
    <V2Shell>
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }} />
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <SiteNav />

      {/* Redesigned Nov 2026 to match the /holidays hub: the season's own
          painting in the header, printables as buttons beside the intro, the
          guides as picture cards. Every word and link is unchanged. */}
      <main className="hb ss">

        <header className="hb-hero ss-hero">
          <div className="hb-hero-text">
            <h1 className="hv-h1 hb-h1">{h.title}</h1>
            <p className="hb-lede">{h.intro}</p>
            <p className="ss-count">
              {posts.length} free {posts.length === 1 ? 'resource' : 'resources'} &middot; busiest in {h.peak}
            </p>
            {/* Printables first where they exist — the artifact is what the
                seasonal searcher actually wants, and these are the pages with
                the lowest competition in the whole niche. */}
            {h.printables.length > 0 && (
              <section className="ss-printables">
                <h2>Free printables</h2>
                <div className="ss-printable-links">
                  {h.printables.map(p => (
                    <a key={p.href} href={p.href}>{p.label} &rarr;</a>
                  ))}
                </div>
              </section>
            )}
          </div>
          <div className="hb-hero-art">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://d3g07v1w0lehiv.cloudfront.net/blog-images/${h.heroSlug}-hero.webp?v=3`}
              srcSet={`https://d3g07v1w0lehiv.cloudfront.net/blog-images/sm/${h.heroSlug}-hero.webp?v=3 760w, https://d3g07v1w0lehiv.cloudfront.net/blog-images/${h.heroSlug}-hero.webp?v=3 1792w`}
              sizes="(min-width: 960px) 560px, 100vw"
              alt={`${h.name} Bible story illustration for kids`} width={1792} height={1024} fetchPriority="high"
            />
          </div>
        </header>

        {/* Owner request, Nov 17, 2026: an email sign-up right under the
            header. Same card and same drip as the blog sign-ups. */}
        <div className="hb-wrap ss-signup">
          <EmailCaptureCard
            magnet={magnet}
            source="blog-inline"
            sourcePost={`holiday-${h.slug}`}
            placement="season-top"
            title={`\u{1F4EC} Get ${h.name} Bible activities to do with your kids`}
            subtitle="Free printables, Bible stories and easy ideas for the whole family, sent to your inbox, starting with a free printable today."
          />
        </div>

        <section className="hb-section is-tight-top">
          <div className="hb-wrap">
            <div className="hb-shelf">
              {posts.map(post => (
                <a key={post.slug} href={`/blog/${post.slug}`} className="hb-item">
                  <span className="hb-thumb">
                    <img
                      src={`https://d3g07v1w0lehiv.cloudfront.net/blog-images/${post.slug}-hero.webp?v=3`}
                      alt={post.title}
                      width={896}
                      height={512}
                      loading="lazy"
                    />
                    <span className="hb-tag">{h.name}</span>
                  </span>
                  <span className="hb-item-text">
                    <h3>{post.title.split(':')[0]}</h3>
                    <p>{post.metaDescription}</p>
                    <span className="hb-go">Read &rarr;</span>
                  </span>
                </a>
              ))}
            </div>

            {others.length > 0 && (
              <section className="ss-others">
                <h2>Other seasons</h2>
                <div className="ss-printable-links">
                  {others.map(o => (
                    <a key={o.slug} href={`/holidays/${o.slug}`}>{o.name}</a>
                  ))}
                </div>
              </section>
            )}
          </div>
        </section>

        <section className="blog-bottom-cta">
          <div className="blog-bottom-cta-inner">
            <h2>Start Your Child&apos;s Bible Journey</h2>
            <p>
              300+ narrated video lessons with comprehension quizzes after every story.
              From Genesis to Revelation, safe, ad-free, and made for kids.
            </p>
            <a href="/quiz" className="btn-primary btn-lg" style={{ textDecoration: 'none', display: 'inline-block' }}>
              Get started
            </a>
          </div>
        </section>
      </main>

      <SiteFooter />
    </V2Shell>
  )
}
