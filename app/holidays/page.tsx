import type { Metadata } from 'next'
import { SiteNav, SiteFooter } from '@/app/components/SiteChrome'
import { getAllPosts } from '@/lib/blog'
import { HOLIDAYS, MIN_POSTS, monthsUntil, type Holiday } from '@/lib/holidays'

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

function postsFor(h: Holiday) {
  return getAllPosts().filter(p => h.match.test(p.slug))
}

export default function HolidaysIndexPage() {
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

      <main>
        <header className="blog-article-header" style={{ maxWidth: '900px', margin: '0 auto', padding: '0 20px' }}>
          <h1 className="blog-article-title">Bible Activities for Every Holiday</h1>
          <p style={{ color: '#555', fontSize: '1.05rem', lineHeight: 1.6, margin: '12px 0 8px' }}>
            Every season gathered in one place — the stories, verses, trivia and free printables
            we have for Christmas, Easter, Thanksgiving, the first week of school, and the end of
            October. Everything here is free and nothing asks for an email address.
          </p>
          <p className="blog-result-count">{live.length} seasons, ordered by what is next</p>
        </header>

        <div className="blog-grid" style={{ maxWidth: '1100px', margin: '24px auto 0', padding: '0 20px' }}>
          {live.map(h => {
            const n = postsFor(h).length
            return (
              <a key={h.slug} href={`/holidays/${h.slug}`} className="blog-card">
                <div className="blog-card-body">
                  <div className="blog-card-header">
                    <span className="blog-card-badge blog-card-badge-guide">{h.peak}</span>
                  </div>
                  <h3 className="blog-card-title">{h.name}</h3>
                  <p className="blog-card-desc">{h.metaDescription}</p>
                  <span className="blog-card-link">
                    {n} free {n === 1 ? 'resource' : 'resources'} &rarr;
                  </span>
                </div>
              </a>
            )
          })}
        </div>

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
