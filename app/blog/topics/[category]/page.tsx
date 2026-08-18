import type { Metadata } from 'next'
import { SiteNav, SiteFooter } from '@/app/components/SiteChrome'
import { notFound } from 'next/navigation'
import { getAllPosts } from '@/lib/blog'
import {
  GUIDE_CATEGORIES,
  getCategoryBySlug,
  getGuideCategory,
} from '@/lib/guide-categories'

type Props = {
  params: Promise<{ category: string }>
}

function postsForCategory(name: string) {
  return getAllPosts().filter(
    p => !p.series && getGuideCategory(p.slug) === name
  )
}

export async function generateStaticParams() {
  // Only build hubs that actually have posts
  return GUIDE_CATEGORIES.filter(c => postsForCategory(c.name).length > 0).map(
    c => ({ category: c.slug })
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params
  const cat = getCategoryBySlug(category)
  if (!cat) return { title: 'Not Found' }

  return {
    title: cat.title,
    description: cat.description,
    openGraph: {
      title: cat.title,
      description: cat.description,
      url: `https://faithfulkids.app/blog/topics/${cat.slug}`,
      siteName: 'Faithful Kids',
      type: 'website',
    },
    alternates: {
      canonical: `https://faithfulkids.app/blog/topics/${cat.slug}`,
    },
  }
}

export default async function TopicHubPage({ params }: Props) {
  const { category } = await params
  const cat = getCategoryBySlug(category)
  if (!cat) notFound()

  const posts = postsForCategory(cat.name)
  if (posts.length === 0) notFound()

  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: cat.title,
    description: cat.description,
    url: `https://faithfulkids.app/blog/topics/${cat.slug}`,
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
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://faithfulkids.app/blog' },
      { '@type': 'ListItem', position: 3, name: cat.title },
    ],
  }

  const otherCats = GUIDE_CATEGORIES.filter(
    c => c.slug !== cat.slug && postsForCategory(c.name).length > 0
  )

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* NAV */}
      <SiteNav active="blog" />

      <main>
        {/* BREADCRUMB */}
        <div className="blog-breadcrumb">
          <a href="/blog">Blog</a>
          <span className="blog-breadcrumb-sep">/</span>
          <span className="blog-breadcrumb-current">{cat.title}</span>
        </div>

        {/* HEADER */}
        <header className="blog-article-header" style={{ maxWidth: '900px', margin: '0 auto', padding: '0 20px' }}>
          <h1 className="blog-article-title">{cat.title}</h1>
          <p style={{ color: '#555', fontSize: '1.05rem', lineHeight: 1.6, margin: '12px 0 8px' }}>
            {cat.intro}
          </p>
          <p className="blog-result-count">
            {posts.length} {posts.length === 1 ? 'guide' : 'guides'}
          </p>
        </header>

        {/* GRID */}
        <div className="blog-grid" style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px' }}>
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
                  <span className="blog-card-badge blog-card-badge-guide">{cat.name}</span>
                </div>
                <h3 className="blog-card-title">{post.title.split(':')[0]}</h3>
                <p className="blog-card-desc">{post.metaDescription}</p>
                <span className="blog-card-link">Read &rarr;</span>
              </div>
            </a>
          ))}
        </div>

        {/* OTHER TOPICS */}
        {otherCats.length > 0 && (
          <section style={{ maxWidth: '900px', margin: '48px auto 0', padding: '0 20px' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '12px' }}>Browse More Topics</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {otherCats.map(c => (
                <a
                  key={c.slug}
                  href={`/blog/topics/${c.slug}`}
                  className="blog-filter-tab blog-filter-tab-guide"
                  style={{ textDecoration: 'none' }}
                >
                  {c.name}
                </a>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="blog-bottom-cta">
          <div className="blog-bottom-cta-inner">
            <h2>Start Your Child&apos;s Bible Journey</h2>
            <p>
              400+ narrated video lessons with comprehension quizzes after every story.
              From Genesis to Revelation — safe, ad-free, and made for kids.
            </p>
            <a href="/quiz" className="btn-primary btn-lg" style={{ textDecoration: 'none', display: 'inline-block' }}>
              Try Faithful Kids Free for 3 Days
            </a>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <SiteFooter />
    </>
  )
}
