import type { Metadata } from 'next'
import '../home.css'
import '../v2-pages.css'

import { SiteNav, SiteFooter } from '@/app/components/SiteChrome'
import { getAllPosts, getAllSeriesNames } from '@/lib/blog'
import BlogGrid from '@/app/blog/BlogGrid'
import { V2Shell, V2Hero } from '@/app/v2-shell'

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

/**
 * VISUAL TEST of /blog. The grid itself is the live BlogGrid component, with
 * the same posts in the same order, so all 569 links are identical — that grid
 * IS the page's SEO value and there was no reason to touch it.
 */
function BlogV2() {
  const posts = getAllPosts()
  const seriesList = getAllSeriesNames()

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

  const storyCount = posts.filter(p => p.series).length

  return (
    <>
      <SiteNav active="blog" />

      <main id="main-content">

      <V2Hero
        short
        art="parents"
        alt="A family kitchen table at golden evening with an open Bible, two mugs of tea, a jar of crayons, children's drawings and a window onto green hills"
        eyebrow="Free Resources Library"
        title={<>Bible <span className="hv-love"><span className="l l1">G</span><span className="l l2">u</span><span className="l l3">i</span><span className="l l4">d</span><span className="l l1">e</span><span className="l l2">s</span></span> for Parents &amp; Teachers</>}
        sub={<>{posts.length}+ free guides: Bible trivia, printables, lesson ideas, devotions
          and discussion questions for every age.</>}
      >
        <div className="v2-ctarow">
          <a className="hv-cta" href="/quiz">
            <span className="hv-cta-play" aria-hidden="true" />
            Watch the video lessons free
          </a>
          <a className="hv-cta is-ghost" href="/bible-stories-for-kids">
            Just want the stories?
          </a>
        </div>
        <p className="hv-close-fine" style={{ marginTop: 16 }}>
          7-day free trial. No commitment. Cancel anytime.
        </p>
      </V2Hero>

      {/* The counts, which the live page shows as a stat bar. Same four
          figures, all derived rather than typed. */}
      <div className="bv-stats">
        <div className="bv-stats-inner">
          <div><b>{posts.length}+</b><span>free guides</span></div>
          <div><b>{seriesList.length}</b><span>story series</span></div>
          <div><b>{storyCount}</b><span>Bible stories</span></div>
          <div><b>Ages 5+</b><span>kid-friendly</span></div>
        </div>
      </div>

      <section className="v2-section" style={{ paddingTop: 34 }}>
        <div className="v2-wrap" style={{ maxWidth: 1180 }}>
          <BlogGrid posts={postCards} seriesList={seriesList} />
        </div>
      </section>

      <section className="hv-close">
        <ul className="hv-chips">
          <li><span aria-hidden="true">🚫</span>No ads, ever</li>
          <li><span aria-hidden="true">💸</span>30-day money-back</li>
          <li><span aria-hidden="true">🔓</span>Cancel anytime</li>
        </ul>
        <h2>Want your kids to watch these stories?</h2>
        <p className="hv-close-fine" style={{ margin: '0 auto 22px', maxWidth: '40em' }}>
          Every story above has a short video lesson on Faithful Kids &mdash; narrated, animated,
          and followed by a comprehension quiz. Your child will actually remember what they learned.
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
      <BlogV2 />
    </V2Shell>
  )
}
