import type { Metadata } from 'next'
import { SiteNav, SiteFooter } from '@/app/components/SiteChrome'
import { notFound } from 'next/navigation'
import { getAllPosts } from '@/lib/blog'
import { HOLIDAYS, getHoliday, MIN_POSTS, type Holiday } from '@/lib/holidays'

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

  const others = liveHolidays().filter(o => o.slug !== h.slug)

  return (
    <>
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }} />
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <SiteNav active="blog" />

      <main>
        <div className="blog-breadcrumb">
          <a href="/holidays">Holidays</a>
          <span className="blog-breadcrumb-sep">/</span>
          <span className="blog-breadcrumb-current">{h.name}</span>
        </div>

        <header className="blog-article-header" style={{ maxWidth: '900px', margin: '0 auto', padding: '0 20px' }}>
          <h1 className="blog-article-title">{h.title}</h1>
          <p style={{ color: '#555', fontSize: '1.05rem', lineHeight: 1.6, margin: '12px 0 8px' }}>
            {h.intro}
          </p>
          <p className="blog-result-count">
            {posts.length} free {posts.length === 1 ? 'resource' : 'resources'} &middot; busiest in {h.peak}
          </p>
        </header>

        {/* Printables first where they exist — the artifact is what the
            seasonal searcher actually wants, and these are the pages with
            the lowest competition in the whole niche. */}
        {h.printables.length > 0 && (
          <section style={{ maxWidth: '900px', margin: '8px auto 0', padding: '0 20px' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '12px' }}>Free printables</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {h.printables.map(p => (
                <a key={p.href} href={p.href} className="blog-filter-tab blog-filter-tab-guide"
                   style={{ textDecoration: 'none' }}>
                  {p.label}
                </a>
              ))}
            </div>
          </section>
        )}

        <div className="blog-grid" style={{ maxWidth: '1100px', margin: '24px auto 0', padding: '0 20px' }}>
          {posts.map(post => (
            <a key={post.slug} href={`/blog/${post.slug}`} className="blog-card">
              <img
                src={`https://d3g07v1w0lehiv.cloudfront.net/blog-images/${post.slug}-hero.webp`}
                alt={post.title}
                width={896}
                height={512}
                loading="lazy"
                className="blog-card-img"
              />
              <div className="blog-card-body">
                <div className="blog-card-header">
                  <span className="blog-card-badge blog-card-badge-guide">{h.name}</span>
                </div>
                <h3 className="blog-card-title">{post.title.split(':')[0]}</h3>
                <p className="blog-card-desc">{post.metaDescription}</p>
                <span className="blog-card-link">Read &rarr;</span>
              </div>
            </a>
          ))}
        </div>

        {others.length > 0 && (
          <section style={{ maxWidth: '900px', margin: '48px auto 0', padding: '0 20px' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '12px' }}>Other seasons</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {others.map(o => (
                <a key={o.slug} href={`/holidays/${o.slug}`} className="blog-filter-tab blog-filter-tab-guide"
                   style={{ textDecoration: 'none' }}>
                  {o.name}
                </a>
              ))}
            </div>
          </section>
        )}

        <section className="blog-bottom-cta">
          <div className="blog-bottom-cta-inner">
            <h2>Start Your Child&apos;s Bible Journey</h2>
            <p>
              300+ narrated video lessons with comprehension quizzes after every story.
              From Genesis to Revelation — safe, ad-free, and made for kids.
            </p>
            <a href="/quiz" className="btn-primary btn-lg" style={{ textDecoration: 'none', display: 'inline-block' }}>
              Get started
            </a>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  )
}
