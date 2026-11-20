import type { Metadata } from 'next'
import '../home.css'
import '../v2-pages.css'
import '../hub.css'

import { SiteNav, SiteFooter } from '@/app/components/SiteChrome'
import { getAllPosts, getAllSeriesNames } from '@/lib/blog'
import BlogGrid from '@/app/blog/BlogGrid'
import { V2Shell, V2Hero } from '@/app/v2-shell'
import { HubHead } from '@/app/hub-ui'
import { GUIDE_CATEGORIES, getGuideCategory } from '@/lib/guide-categories'
import './blog-index.css'

export const metadata: Metadata = {
  title: 'Bible Guides for Parents: 500+ Free Resources',
  description: 'Free Bible guides for Christian parents and Sunday school teachers: trivia, printables, lesson ideas, devotions and discussion questions for every age.',
  keywords: ['bible guides for parents', 'sunday school lesson ideas', 'bible activities for kids', 'christian parenting resources', 'bible trivia for kids', 'family devotion ideas'],
  openGraph: {
    title: 'Bible Guides for Parents: 500+ Free Resources',
    description: 'Free Bible guides for Christian parents and Sunday school teachers: trivia, printables, lesson ideas and discussion questions for every age.',
    url: 'https://faithfulkids.app/blog',
    siteName: 'Faithful Kids',
    type: 'website',
    images: [{
      url: 'https://d3g07v1w0lehiv.cloudfront.net/blog-images/david-and-goliath-for-kids-hero.webp?v=3',
      width: 1792,
      height: 1024,
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bible Guides for Parents: 500+ Free Resources',
    description: 'Free Bible guides, trivia, printables and lesson ideas for parents and teachers.',
    images: ['https://d3g07v1w0lehiv.cloudfront.net/blog-images/david-and-goliath-for-kids-hero.webp?v=3'],
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

  // Topic shelf: every topic hub with its real post count and, as its
  // picture, the hero of its most recently updated guide.
  const guides = posts.filter(p => !p.series)
  const topics = GUIDE_CATEGORIES.map(c => {
    const inCat = guides
      .filter(p => getGuideCategory(p.slug) === c.name)
      .sort((a, b) => (b.dateModified || '').localeCompare(a.dateModified || ''))
    return { ...c, count: inCat.length, cover: inCat[0]?.slug }
  }).filter(t => t.count > 0).sort((a, b) => b.count - a.count)

  return (
    <>
      <SiteNav />

      <main id="main-content" className="hb">

      {/* Live header kept (owner, Nov 17, 2026). */}
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
            Watch the video lessons
          </a>
          <a className="hv-cta is-ghost" href="/bible-stories-for-kids">
            Just want the stories?
          </a>
        </div>
        <p className="hv-close-fine" style={{ marginTop: 16 }}>
          7-day free trial. No commitment. Cancel anytime.
        </p>
        {/* One contextual pointer between the two parent-facing lanes: this
            library is reference material; Parenting is where other parents,
            pastors and teachers write in their own names. */}
        <p className="hv-close-fine" style={{ marginTop: 10 }}>
          Looking for real stories from other Christian parents? Read <a href="/parenting" style={{ fontWeight: 800 }}>Raising Faithful Kids</a>, our Parenting section.
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

      {/* Nov 17, 2026 pass: the live page went straight from the stat bar
          into 500+ cards. These two shelves give a parent a way in first:
          a topic, or a story series. Every link is a real hub page. */}
      <section className="hb-section bx-topics">
        <div className="hb-wrap">
          <HubHead center title="Start with a topic" sub="Every guide sorted by the job you are doing this week." />
          <div className="bx-topic-grid">
            {topics.map(t => (
              <a key={t.slug} href={`/blog/topics/${t.slug}`} className="bx-topic">
                <span className="bx-topic-img" aria-hidden="true">
                  {t.cover && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`https://d3g07v1w0lehiv.cloudfront.net/blog-images/${t.cover}-hero.webp?v=3`} alt={t.title} width={760} height={434} loading="lazy" decoding="async" />
                  )}
                </span>
                <span className="bx-topic-text">
                  <strong>{t.name}</strong>
                  <span>{t.count} {t.count === 1 ? 'guide' : 'guides'}</span>
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="hb-section is-paper bx-series">
        <div className="hb-wrap">
          <HubHead center title="Bible stories, series by series" sub={<>{storyCount} stories in {seriesList.length} series, Genesis to Revelation. <a href="/bible-stories-for-kids">See them all in order &rarr;</a></>} />
          <nav className="bx-series-list" aria-label="Story series">
            {seriesList.map(s => (
              <a key={s.slug} href={`/blog/series/${s.slug}`}>{s.name}<span>{s.count}</span></a>
            ))}
          </nav>
        </div>
      </section>

      <section className="v2-section" style={{ paddingTop: 34 }}>
        <div className="v2-wrap" style={{ maxWidth: 1180 }}>
          <HubHead center title="Every guide and story" />
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
          Every story above has a short video lesson on Faithful Kids, narrated, animated.
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
