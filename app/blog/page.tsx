import type { Metadata } from 'next'
import { SiteNav, SiteFooter } from '@/app/components/SiteChrome'
import { getAllPosts, getAllSeriesNames } from '@/lib/blog'
import BlogGrid from './BlogGrid'

export const metadata: Metadata = {
  title: 'Bible Guides for Parents — 500+ Free Resources',
  description: 'Free Bible guides for Christian parents and Sunday school teachers: trivia, printables, lesson ideas, devotions and discussion questions for every age.',
  keywords: ['bible guides for parents', 'sunday school lesson ideas', 'bible activities for kids', 'christian parenting resources', 'bible trivia for kids', 'family devotion ideas'],
  openGraph: {
    title: 'Bible Guides for Parents — 500+ Free Resources',
    description: 'Free Bible guides for Christian parents and Sunday school teachers: trivia, printables, lesson ideas and discussion questions for every age.',
    url: 'https://faithfulkids.app/blog',
    siteName: 'Faithful Kids',
    type: 'website',
    images: [{
      url: 'https://d3g07v1w0lehiv.cloudfront.net/blog-images/david-and-goliath-for-kids-hero.webp',
      width: 1792,
      height: 1024,
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bible Guides for Parents — 500+ Free Resources',
    description: 'Free Bible guides, trivia, printables and lesson ideas for parents and teachers.',
    images: ['https://d3g07v1w0lehiv.cloudfront.net/blog-images/david-and-goliath-for-kids-hero.webp'],
  },
  alternates: {
    canonical: 'https://faithfulkids.app/blog',
  },
}

export default function BlogIndex() {
  const posts = getAllPosts()
  const seriesList = getAllSeriesNames()

  // Serialize only what the client needs
  const postCards = posts.map(p => ({
    title: p.title,
    slug: p.slug,
    series: p.series,
    seriesSlug: p.seriesSlug,
    episode: p.episode,
    book: p.book,
    themes: p.themes,
    metaDescription: p.metaDescription,
    age: p.age,
  }))

  return (
    <>
      {/* NAV */}
      <SiteNav active="blog" />

      {/* HERO */}
      <section className="blog-hero">
        <span className="section-label">Free Bible Story Guides</span>
        <h1>Bible Stories for Kids</h1>
        <p className="blog-hero-sub">
          {posts.length}+ free Bible story guides for parents. Simple retellings, discussion
          questions, key verses, and video lessons — from Genesis to Revelation.
        </p>
        <a href="/quiz" className="btn-primary btn-lg" style={{ textDecoration: 'none', display: 'inline-block' }}>
          Watch the Video Lessons Free
        </a>
        <p className="blog-hero-note">3-day free trial. No commitment. Cancel anytime.</p>
      </section>

      {/* SERIES STATS BAR */}
      <div className="blog-stats-bar">
        <div className="blog-stats-inner">
          <div className="blog-stat-item">
            <strong>{posts.length}+</strong> Story Guides
          </div>
          <div className="blog-stat-item">
            <strong>{seriesList.length}</strong> Series
          </div>
          <div className="blog-stat-item">
            <strong>Genesis–Revelation</strong> Complete
          </div>
          <div className="blog-stat-item">
            <strong>Ages 5+</strong> Kid-Friendly
          </div>
        </div>
      </div>

      {/* BLOG CONTENT */}
      <section className="blog-content">
        <BlogGrid posts={postCards} seriesList={seriesList} />
      </section>

      {/* BOTTOM CTA */}
      <section className="blog-bottom-cta">
        <div className="blog-bottom-cta-inner">
          <h2>Want your kids to watch these stories?</h2>
          <p>
            Every story above has a short video lesson on Faithful Kids — narrated, animated, and followed
            by a comprehension quiz. Your child will actually remember what they learned.
          </p>
          <a href="/quiz" className="btn-primary btn-lg" style={{ textDecoration: 'none', display: 'inline-block' }}>
            Get started
          </a>
          <div className="blog-cta-badges">
            <span>No ads, ever</span>
            <span>30-day money-back guarantee</span>
            <span>Cancel anytime</span>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <SiteFooter />
    </>
  )
}
