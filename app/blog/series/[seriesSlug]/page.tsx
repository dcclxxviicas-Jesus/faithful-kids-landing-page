import type { Metadata } from 'next'
import { getAllPosts, getPostsBySeriesSlug, getAllSeriesNames } from '@/lib/blog'
import { notFound } from 'next/navigation'

type Props = {
  params: Promise<{ seriesSlug: string }>
}

export async function generateStaticParams() {
  const series = getAllSeriesNames()
  return series.map(s => ({ seriesSlug: s.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { seriesSlug } = await params
  const posts = getPostsBySeriesSlug(seriesSlug)
  if (posts.length === 0) return { title: 'Not Found' }

  const seriesName = posts[0].series
  const testament = posts[0].testament
  const title = `${seriesName} — Bible Stories for Kids | Faithful Kids`
  const description = `All ${posts.length} episodes in the ${seriesName} series. ${testament} Bible stories explained simply for kids ages 5+, with videos, quizzes, and discussion questions.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://faithfulkids.app/blog/series/${seriesSlug}`,
      siteName: 'Faithful Kids',
      type: 'website',
      images: [{
        url: `https://d3g07v1w0lehiv.cloudfront.net/blog-images/${posts[0].slug}-hero.webp`,
        width: 1792,
        height: 1024,
        alt: `${seriesName} - Bible Story Series for Kids`,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`https://d3g07v1w0lehiv.cloudfront.net/blog-images/${posts[0].slug}-hero.webp`],
    },
    alternates: {
      canonical: `https://faithfulkids.app/blog/series/${seriesSlug}`,
    },
  }
}

export default async function SeriesPage({ params }: Props) {
  const { seriesSlug } = await params
  const posts = getPostsBySeriesSlug(seriesSlug)
  if (posts.length === 0) notFound()

  const seriesName = posts[0].series
  const testament = posts[0].testament
  const totalPosts = getAllPosts().length

  // CreativeWorkSeries JSON-LD
  const seriesJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWorkSeries',
    name: `${seriesName} - Faithful Kids Bible Series`,
    description: `${posts.length} Bible story episodes in the ${seriesName} series, designed for kids ages 5+.`,
    url: `https://faithfulkids.app/blog/series/${seriesSlug}`,
    publisher: {
      '@type': 'Organization',
      name: 'Faithful Kids',
      url: 'https://faithfulkids.app',
    },
    numberOfEpisodes: posts.length,
    genre: 'Religious Education',
    audience: { '@type': 'EducationalAudience', educationalRole: 'parent' },
    hasPart: posts.map(p => ({
      '@type': 'Article',
      name: p.title,
      url: `https://faithfulkids.app/blog/${p.slug}`,
      position: p.episode,
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(seriesJsonLd) }}
      />

      {/* NAV */}
      <nav className="nav">
        <div className="nav-inner">
          <a href="/" className="nav-logo" style={{ textDecoration: 'none' }}>
            <img src="/logo-sm.png" alt="Faithful Kids" className="nav-logo-img" /> Faithful Kids
          </a>
          <div className="nav-links">
            <a href="/blog">Blog</a>
            <a href="/quiz">Start Free Trial</a>
          </div>
          <a href="/quiz" className="btn-nav" style={{ textDecoration: 'none' }}>Try Free</a>
        </div>
      </nav>

      {/* BREADCRUMB */}
      <div className="blog-breadcrumb">
        <a href="/blog">Blog</a>
        <span className="blog-breadcrumb-sep">/</span>
        <span className="blog-breadcrumb-current">{seriesName}</span>
      </div>

      {/* SERIES HEADER */}
      <section className="series-header">
        <span className="series-testament-badge">{testament}</span>
        <h1 className="series-title">{seriesName}</h1>
        <p className="series-subtitle">
          {posts.length} episodes &middot; Bible stories explained simply for kids ages 5+
        </p>
        <p className="series-description">
          Explore every story in the {seriesName} series. Each episode includes a 60-second
          narrated video, a comprehension quiz, and discussion questions for families.
        </p>
      </section>

      {/* EPISODE GRID */}
      <section className="series-episodes">
        <div className="blog-grid">
          {posts
            .sort((a, b) => a.episode - b.episode)
            .map(post => (
            <a key={post.slug} href={`/blog/${post.slug}`} className="blog-card">
              <img
                src={`https://d3g07v1w0lehiv.cloudfront.net/blog-images/${post.slug}-hero.webp`}
                alt={`${post.title} - Bible Story Illustration for Kids`}
                width={1792}
                height={1024}
                loading="lazy"
                style={{ width: '100%', height: 'auto', borderRadius: '12px 12px 0 0' }}
              />
              <div className="blog-card-header">
                <span className="blog-card-badge">{post.series}</span>
                <span className="blog-card-episode">Ep. {post.episode}</span>
              </div>
              <h3 className="blog-card-title">{post.title.split(':')[0]}</h3>
              <p className="blog-card-desc">{post.metaDescription}</p>
              <div className="blog-card-footer">
                {post.book && <span className="blog-card-book-inline">{post.book}</span>}
                {post.scripture && <span className="blog-card-scripture">{post.scripture}</span>}
              </div>
              {post.themes && (
                <div className="blog-card-themes">
                  {post.themes.split(',').slice(0, 3).map(t => (
                    <span key={t.trim()} className="blog-card-theme">{t.trim()}</span>
                  ))}
                </div>
              )}
              <span className="blog-card-link">Read Story &rarr;</span>
            </a>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="blog-bottom-cta">
        <div className="blog-bottom-cta-inner">
          <h2>Watch the {seriesName} Series</h2>
          <p>
            All {posts.length} episodes available as 60-second narrated video lessons with
            comprehension quizzes. Part of {totalPosts}+ Bible stories on Faithful Kids.
          </p>
          <a href="/quiz" className="btn-primary btn-lg" style={{ textDecoration: 'none', display: 'inline-block' }}>
            Try Faithful Kids Free for 7 Days
          </a>
          <div className="blog-cta-badges">
            <span>No ads, ever</span>
            <span>30-day money-back guarantee</span>
            <span>Cancel anytime</span>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-logo">
            <img src="/logo-sm.png" alt="Faithful Kids" className="nav-logo-img" /> Faithful Kids
          </div>
          <div className="footer-links">
            <a href="/blog">Blog</a>
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
            <a href="mailto:team@faithfulkids.app">Contact</a>
          </div>
          <p className="footer-copy">&copy; 2026 Faithful Kids. All rights reserved.</p>
        </div>
      </footer>
    </>
  )
}
