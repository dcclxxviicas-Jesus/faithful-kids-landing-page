import type { Metadata } from 'next'
import {
  getAllPosts,
  getPostBySlug,
  getPostsBySeriesSlug,
  extractFaqFromContent,
  extractDiscussionQuestions,
  getReadingTime,
  getHeroStoryLinks,
} from '@/lib/blog'
import { notFound } from 'next/navigation'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map(post => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return { title: 'Not Found' }

  return {
    title: post.title,
    description: post.metaDescription,
    keywords: post.keywords,
    openGraph: {
      title: post.title,
      description: post.metaDescription,
      url: `https://faithfulkids.app/blog/${post.slug}`,
      siteName: 'Faithful Kids',
      type: 'article',
      images: [{
        url: `https://d3g07v1w0lehiv.cloudfront.net/blog-images/${post.slug}-hero.webp`,
        width: 1792,
        height: 1024,
        alt: `${post.title} - Bible Story Illustration`,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.metaDescription,
      images: [`https://d3g07v1w0lehiv.cloudfront.net/blog-images/${post.slug}-hero.webp`],
    },
    alternates: {
      canonical: `https://faithfulkids.app/blog/${post.slug}`,
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()

  const relatedPosts = getPostsBySeriesSlug(post.seriesSlug)
    .filter(p => p.slug !== post.slug)
    .slice(0, 6)

  const readingTime = getReadingTime(post.content)
  const faqs = extractFaqFromContent(post.content)
  const discussionQuestions = extractDiscussionQuestions(post.content)
  const heroStories = getHeroStoryLinks(post.slug, post.seriesSlug)

  // Use only real FAQ items (not discussion questions) for FAQPage schema
  const faqItems = faqs

  // JSON-LD Article schema (enhanced for AEO)
  const titleWithoutForKids = post.title.replace(/ for Kids.*$/, '')
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.metaDescription,
    image: `https://d3g07v1w0lehiv.cloudfront.net/blog-images/${post.slug}-hero.webp`,
    author: { '@type': 'Person', name: 'Faithful Kids Team' },
    publisher: {
      '@type': 'Organization',
      name: 'Faithful Kids',
      url: 'https://faithfulkids.app',
      logo: {
        '@type': 'ImageObject',
        url: 'https://faithfulkids.app/logo.png',
      },
    },
    datePublished: '2026-04-01',
    dateModified: '2026-04-10',
    keywords: post.keywords,
    mainEntityOfPage: `https://faithfulkids.app/blog/${post.slug}`,
    educationalLevel: 'beginner',
    audience: { '@type': 'EducationalAudience', educationalRole: 'parent' },
    isPartOf: { '@type': 'CreativeWorkSeries', name: `${post.series} - Faithful Kids Bible Series` },
    about: { '@type': 'Thing', name: `${titleWithoutForKids} Bible Story` },
  }

  // FAQ schema — uses extracted FAQ section only
  const faqJsonLd = faqItems.length > 0
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.map(faq => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      }
    : null

  // VideoObject schema
  const videoJsonLd = post.videoUrl
    ? {
        '@context': 'https://schema.org',
        '@type': 'VideoObject',
        name: `${post.title} — Bible Story Video`,
        description: post.metaDescription,
        thumbnailUrl: 'https://faithfulkids.app/logo.png',
        uploadDate: '2026-01-01',
        duration: 'PT1M30S',
        contentUrl: `https://faithfulkids.app${post.videoUrl}`,
        publisher: { '@type': 'Organization', name: 'Faithful Kids' },
        educationalLevel: 'beginner',
        inLanguage: 'en',
      }
    : null

  // ImageObject schema for hero image
  const imageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ImageObject',
    contentUrl: `https://d3g07v1w0lehiv.cloudfront.net/blog-images/${post.slug}-hero.webp`,
    name: `${post.title} - Bible Story Illustration for Kids`,
    description: post.metaDescription,
    width: 1792,
    height: 1024,
    representativeOfPage: true,
    creator: { '@type': 'Organization', name: 'Faithful Kids' },
  }

  // Split content to inject mid-article CTA
  const contentParts = splitContentForCTA(post.content)

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      {videoJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(videoJsonLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(imageJsonLd) }}
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
        <a href={`/blog/series/${post.seriesSlug}`}>{post.series}</a>
        <span className="blog-breadcrumb-sep">/</span>
        <span className="blog-breadcrumb-current">{post.title.split(':')[0]}</span>
      </div>

      {/* HERO IMAGE */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 20px' }}>
        <img
          src={`https://d3g07v1w0lehiv.cloudfront.net/blog-images/${slug}-hero.webp`}
          alt={`${post.title} - Bible Story Illustration for Kids`}
          width={1792}
          height={1024}
          style={{ width: '100%', height: 'auto', borderRadius: '16px', marginBottom: '24px' }}
        />
      </div>

      {/* ARTICLE */}
      <article className="blog-article">
        {/* Header */}
        <header className="blog-article-header">
          <div className="blog-article-meta-row">
            <span className="blog-card-badge">{post.series}</span>
            <span className="blog-article-meta-sep">&middot;</span>
            <span className="blog-article-meta-text">Episode {post.episode}</span>
            {post.book && (
              <>
                <span className="blog-article-meta-sep">&middot;</span>
                <span className="blog-article-meta-text">{post.book}</span>
              </>
            )}
            {post.scripture && (
              <>
                <span className="blog-article-meta-sep">&middot;</span>
                <span className="blog-article-meta-text">{post.scripture}</span>
              </>
            )}
          </div>
          <h1 className="blog-article-title">{post.title}</h1>
          <div className="blog-article-info">
            <span>{post.age}</span>
            <span>&middot;</span>
            <span>{readingTime} min read</span>
            <span>&middot;</span>
            <span>{post.testament}</span>
            <span>&middot;</span>
            <span>By Faithful Kids Team</span>
          </div>
          {post.themes && (
            <div className="blog-article-themes">
              {post.themes.split(',').map(t => (
                <span key={t.trim()} className="blog-card-theme">{t.trim()}</span>
              ))}
            </div>
          )}
        </header>

        {/* Body — first half */}
        <div
          className="blog-article-body"
          dangerouslySetInnerHTML={{ __html: contentParts.first }}
        />

        {/* Inline image 1 — after first content section */}
        <img
          src={`https://d3g07v1w0lehiv.cloudfront.net/blog-images/${slug}-1.webp`}
          alt={`Illustration from ${post.title}`}
          width={1024}
          height={1024}
          loading="lazy"
          style={{ width: '100%', maxWidth: '600px', height: 'auto', borderRadius: '12px', margin: '24px auto', display: 'block' }}
        />

        {/* Mid-article CTA */}
        <div className="blog-mid-cta">
          <div className="blog-mid-cta-icon">&#9654;</div>
          <h3>Watch This Story Come Alive</h3>
          <p>
            See <strong>{post.title.split(':')[0]}</strong> in a 60-second narrated video lesson
            your child will love. Followed by a fun quiz to check what they learned.
          </p>
          <a href="/quiz" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>
            Watch Free for 7 Days
          </a>
        </div>

        {/* Inline image 2 — before discussion/quiz section */}
        {contentParts.second && (
          <img
            src={`https://d3g07v1w0lehiv.cloudfront.net/blog-images/${slug}-2.webp`}
            alt={`${post.title} - Key Moment Illustration`}
            width={1024}
            height={1024}
            loading="lazy"
            style={{ width: '100%', maxWidth: '600px', height: 'auto', borderRadius: '12px', margin: '24px auto', display: 'block' }}
          />
        )}

        {/* Body — second half */}
        {contentParts.second && (
          <div
            className="blog-article-body"
            dangerouslySetInnerHTML={{ __html: contentParts.second }}
          />
        )}
      </article>

      {/* RELATED POSTS */}
      {relatedPosts.length > 0 && (
        <section className="blog-related">
          <h2>More from the {post.series} Series</h2>
          <div className="blog-related-grid">
            {relatedPosts.map(rp => (
              <a key={rp.slug} href={`/blog/${rp.slug}`} className="blog-card blog-card-compact">
                <img
                  src={`https://d3g07v1w0lehiv.cloudfront.net/blog-images/${rp.slug}-hero.webp`}
                  alt={`${rp.title} - Bible Story Illustration`}
                  width={1792}
                  height={1024}
                  loading="lazy"
                  style={{ width: '100%', height: 'auto', borderRadius: '12px 12px 0 0' }}
                />
                <div className="blog-card-header">
                  <span className="blog-card-badge">{rp.series}</span>
                  <span className="blog-card-episode">Ep. {rp.episode}</span>
                </div>
                <h3 className="blog-card-title">{rp.title.split(':')[0]}</h3>
                <p className="blog-card-book">
                  {rp.book && <>{rp.book} &middot; </>}{rp.age}
                </p>
                <span className="blog-card-link">Read More &rarr;</span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* RELATED STORIES FROM OTHER SERIES */}
      {heroStories.length > 0 && (
        <section className="blog-related">
          <h2>Related Bible Stories</h2>
          <div className="blog-related-grid">
            {heroStories.map(story => (
              <a key={story.slug} href={`/blog/${story.slug}`} className="blog-card blog-card-compact">
                <img
                  src={`https://d3g07v1w0lehiv.cloudfront.net/blog-images/${story.slug}-hero.webp`}
                  alt={`${story.title} - Bible Story Illustration`}
                  width={1792}
                  height={1024}
                  loading="lazy"
                  style={{ width: '100%', height: 'auto', borderRadius: '12px 12px 0 0' }}
                />
                <div className="blog-card-header">
                  <span className="blog-card-badge">{story.series}</span>
                  <span className="blog-card-episode">Ep. {story.episode}</span>
                </div>
                <h3 className="blog-card-title">{story.title.split(':')[0]}</h3>
                <p className="blog-card-desc">{story.metaDescription}</p>
                <span className="blog-card-link">Read Story &rarr;</span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* BOTTOM CTA */}
      <section className="blog-bottom-cta">
        <div className="blog-bottom-cta-inner">
          <h2>Start Your Child's Bible Journey</h2>
          <p>
            {getAllPosts().length}+ narrated video lessons. Comprehension quizzes after every story.
            From Genesis to Revelation — safe, ad-free, and made for kids.
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

      {/* STICKY BOTTOM CTA */}
      <div className="blog-sticky-cta">
        <div className="blog-sticky-inner">
          <span className="blog-sticky-text">
            <strong>Start your child&apos;s Bible journey</strong> &mdash; 7 days free
          </span>
          <a href="/quiz" className="btn-primary" style={{ textDecoration: 'none', padding: '10px 24px', fontSize: '0.88rem' }}>
            Try Free
          </a>
        </div>
      </div>

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

/**
 * Split content roughly in half at a heading boundary to insert a CTA in the middle.
 */
function splitContentForCTA(html: string): { first: string; second: string } {
  // Find all h2 positions
  const h2Positions: number[] = []
  const regex = /<h2>/g
  let match
  while ((match = regex.exec(html)) !== null) {
    h2Positions.push(match.index)
  }

  if (h2Positions.length < 3) {
    return { first: html, second: '' }
  }

  // Split after the 2nd or 3rd h2 (roughly middle of content)
  const splitIndex = h2Positions.length >= 5
    ? h2Positions[Math.floor(h2Positions.length / 2)]
    : h2Positions[2]

  return {
    first: html.slice(0, splitIndex),
    second: html.slice(splitIndex),
  }
}
