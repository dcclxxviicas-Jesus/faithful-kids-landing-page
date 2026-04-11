import type { Metadata } from 'next'
import { getAllPosts, getAllSeriesNames } from '@/lib/blog'
import BlogGrid from './BlogGrid'

export const metadata: Metadata = {
  title: 'Bible Stories for Kids - Free Guides for Every Story | Faithful Kids',
  description: 'Explore 200+ Bible stories explained simply for kids ages 5+. Free parent guides with discussion questions, key verses, and video lessons for every story from Genesis to Revelation.',
  keywords: ['bible stories for kids', 'kids bible stories', 'bible for children', 'sunday school lessons', 'bible lessons for kids', 'christian stories for kids', 'bible study for kids'],
  openGraph: {
    title: 'Bible Stories for Kids - Free Guides for Every Story | Faithful Kids',
    description: 'Explore 200+ Bible stories explained simply for kids ages 5+. Free parent guides with discussion questions, key verses, and video lessons.',
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
    title: 'Bible Stories for Kids - Free Guides for Every Story',
    description: '200+ Bible stories explained simply for kids ages 5+.',
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
      <nav className="nav">
        <div className="nav-inner">
          <a href="/" className="nav-logo" style={{ textDecoration: 'none' }}>
            <img src="/logo-sm.png" alt="Faithful Kids" className="nav-logo-img" /> Faithful Kids
          </a>
          <div className="nav-links">
            <a href="/blog" style={{ color: 'var(--primary)', fontWeight: 700 }}>Blog</a>
            <a href="/quiz">Start Free Trial</a>
          </div>
          <a href="/quiz" className="btn-nav" style={{ textDecoration: 'none' }}>Try Free</a>
        </div>
      </nav>

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
        <p className="blog-hero-note">7-day free trial. No commitment. Cancel anytime.</p>
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
            Every story above has a 60-second video lesson on Faithful Kids — narrated, animated, and followed
            by a comprehension quiz. Your child will actually remember what they learned.
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
