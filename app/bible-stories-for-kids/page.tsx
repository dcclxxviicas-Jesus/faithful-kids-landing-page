import type { Metadata } from 'next'
import { SiteNav, SiteFooter } from '@/app/components/SiteChrome'
import { getAllPosts } from '@/lib/blog'

/**
 * Hub page for "bible stories for kids" — 1,479 searches/month (DataForSEO
 * clickstream; Google Ads suppresses this niche and reports 0).
 *
 * Why a dedicated page instead of leaning on /blog: the live SERP for this term
 * is held by dltk-bible.com, bibleforchildren.org, kidscorner.net and
 * lifehopeandtruth.com — small, mostly dated resource sites, with no app-store
 * listings and no YouVersion. It is winnable, unlike "bible app for kids" where
 * 8 of the top 10 are YouVersion properties. We had ZERO impressions for this
 * term despite owning 200 story posts, because nothing was built to compete.
 *
 * /blog is retargeted at the guides/resources intent so the two do not
 * cannibalise each other.
 */

export const metadata: Metadata = {
  title: '200 Bible Stories for Kids, Retold Simply',
  description:
    '200 Bible stories for kids, Genesis to Revelation, each retold simply with its scripture reference, discussion questions and a video lesson. No sign-up.',
  keywords: [
    'bible stories for kids', 'kids bible stories', 'short bible stories for kids',
    'best bible stories for kids', 'bible stories for children',
    'stories from the bible for kids', 'free bible stories for kids',
    'bedtime bible stories for kids',
  ],
  alternates: { canonical: 'https://faithfulkids.app/bible-stories-for-kids' },
  openGraph: {
    title: '200 Bible Stories for Kids, Retold Simply',
    description:
      '200 Bible stories for kids, Genesis to Revelation, each with the scripture reference, discussion questions and a video lesson. Free, no sign-up.',
    url: 'https://faithfulkids.app/bible-stories-for-kids',
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
    title: '200 Bible Stories for Kids, Retold Simply',
    description: '200 Bible stories for kids, Genesis to Revelation. Free, no sign-up.',
    images: ['https://d3g07v1w0lehiv.cloudfront.net/blog-images/david-and-goliath-for-kids-hero.webp'],
  },
}

const FAQS = [
  {
    q: 'What are the best Bible stories to start with for kids?',
    a: 'Creation, Noah and the ark, David and Goliath, Daniel in the lions’ den, and the birth of Jesus are the usual first five, because each one has a clear beginning, middle and end that a young child can retell afterwards. Retelling is the real test of whether a story landed, so starting with stories that are easy to retell builds confidence before you move into longer arcs like Joseph or the Exodus.',
  },
  {
    q: 'What age should kids start learning Bible stories?',
    a: 'Around age three most children can follow a short read-aloud story, though they are following the pictures more than the plot. Ages five to seven is where stories genuinely start to stick, and by eight to ten most kids can handle full arcs with cause and effect, like Joseph being sold by his brothers and later forgiving them. The stories on this page are grouped by age for that reason.',
  },
  {
    q: 'How long should a Bible story be for a child?',
    a: 'Shorter than most parents expect. Three to five minutes holds a five-year-old; ten minutes is a stretch. It is better to tell one short story well and talk about it for two minutes than to read a long passage nobody remembers. Every story here is written to be read aloud in a few minutes.',
  },
  {
    q: 'Are these Bible stories free?',
    a: 'Yes. All 200 stories on this page are free to read with no sign-up, no email required and no ads. Each one includes the scripture reference so you can read the passage in your own Bible translation alongside it.',
  },
  {
    q: 'Which Bible stories teach the best lessons for children?',
    a: 'For courage, David and Goliath, Daniel in the lions’ den, and Esther. For forgiveness, Joseph and his brothers and the prodigal son. For kindness, the good Samaritan. For honesty, Ananias and Sapphira, which is uncomfortable but memorable. The point is rarely the moral on its own, though — children remember the story and grow into the meaning.',
  },
  {
    q: 'How do I explain hard Bible stories to kids?',
    a: 'Tell the truth at the level they can carry, and do not fill silence with speculation. It is fine to say that a story is sad, that people made bad choices, or that you do not know why something happened. Children handle honest uncertainty better than a tidy answer that stops making sense when they are older.',
  },
]

export default function BibleStoriesForKidsPage() {
  const posts = getAllPosts()
  const stories = posts.filter(p => p.seriesSlug && p.episode)

  const byTestament: Record<string, Map<string, { slug: string; items: typeof stories }>> = {
    'Old Testament': new Map(),
    'New Testament': new Map(),
  }
  for (const p of stories) {
    const bucket = byTestament[p.testament]
    if (!bucket) continue
    if (!bucket.has(p.series)) bucket.set(p.series, { slug: p.seriesSlug, items: [] })
    bucket.get(p.series)!.items.push(p)
  }
  for (const bucket of Object.values(byTestament)) {
    for (const s of bucket.values()) s.items.sort((a, b) => a.episode - b.episode)
  }

  // Age bands come from post frontmatter, not invented.
  const ages = ['Ages 5+', 'Ages 6+', 'Ages 7+']
    .map(a => ({ label: a, items: stories.filter(p => p.age === a) }))
    .filter(a => a.items.length > 0)

  const themes = ['courage', 'faith', 'forgiveness', 'kindness', 'hope', 'prayer', 'obedience', 'love']
    .map(t => ({
      label: t,
      items: stories.filter(p => (p.themes || '').toLowerCase().includes(t)).slice(0, 8),
    }))
    .filter(t => t.items.length >= 3)

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Bible Stories for Kids',
    description: `${stories.length} Bible stories for children, retold simply, from Genesis to Revelation.`,
    url: 'https://faithfulkids.app/bible-stories-for-kids',
    isFamilyFriendly: true,
    inLanguage: 'en',
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: stories.length,
      itemListElement: stories.slice(0, 100).map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: p.title,
        url: `https://faithfulkids.app/blog/${p.slug}`,
      })),
    },
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  return (
    <>
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <SiteNav active="blog" />

      <section className="blog-hero">
        <span className="section-label">Free · No Sign-Up</span>
        <h1>Bible Stories for Kids</h1>
        <p className="blog-hero-sub">
          All {stories.length} stories, Genesis to Revelation, retold in plain language a child can
          follow. Every one lists the scripture it comes from, so you can open your own Bible
          alongside it.
        </p>
      </section>

      <section className="stories-intro">
        <p>
          Most collections of Bible stories for kids give you the same eight or nine favorites.
          Noah, David and Goliath, Jonah, the nativity, and then they stop. Children work through
          those quickly and are left with the impression that the Bible is a short book of
          disconnected episodes.
        </p>
        <p>
          This is the whole story instead, in the order it happened, from creation through the
          early church. Each retelling is a few minutes read aloud, written for children roughly
          five and up, and ends with questions worth asking at the dinner table. There is nothing
          to sign up for and no email wall.
        </p>
      </section>

      {(['Old Testament', 'New Testament'] as const).map(testament => (
        <section key={testament} className="stories-section">
          <h2>{testament} Bible Stories for Kids</h2>
          <p className="section-sub">
            {Array.from(byTestament[testament].values())
              .reduce((n, s) => n + s.items.length, 0)}{' '}
            stories across {byTestament[testament].size} series, in order.
          </p>
          <div className="stories-grid">
            {Array.from(byTestament[testament].entries()).map(([series, { slug, items }]) => (
              <div key={slug} className="stories-card">
                <h3>
                  <a href={`/blog/series/${slug}`}>{series}</a>
                </h3>
                <p className="stories-scripture">{items[0]?.scripture}</p>
                <ol className="stories-list">
                  {items.map(p => (
                    <li key={p.slug}>
                      <a href={`/blog/${p.slug}`}>
                        {p.title.replace(/ for Kids.*$/i, '').replace(/:.*$/, '')}
                      </a>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </section>
      ))}

      <section className="stories-section stories-alt">
        <h2>Bible Stories for Kids by Age</h2>
        <p className="section-sub">
          Age bands are a guide, not a rule. A confident six-year-old will happily take a seven-plus
          story, especially read aloud.
        </p>
        <div className="stories-grid stories-grid-3">
          {ages.map(a => (
            <div key={a.label} className="stories-card">
              <h3>{a.label}</h3>
              <p className="stories-scripture">{a.items.length} stories</p>
              <ul className="stories-list">
                {a.items.slice(0, 8).map(p => (
                  <li key={p.slug}>
                    <a href={`/blog/${p.slug}`}>
                      {p.title.replace(/ for Kids.*$/i, '').replace(/:.*$/, '')}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="stories-section">
        <h2>Bible Stories for Kids by Theme</h2>
        <p className="section-sub">
          When you need a story for a particular conversation you are already having.
        </p>
        <div className="stories-grid stories-grid-4">
          {themes.map(t => (
            <div key={t.label} className="stories-card">
              <h3 className="stories-theme">{t.label}</h3>
              <ul className="stories-list">
                {t.items.slice(0, 6).map(p => (
                  <li key={p.slug}>
                    <a href={`/blog/${p.slug}`}>
                      {p.title.replace(/ for Kids.*$/i, '').replace(/:.*$/, '')}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="stories-section stories-alt">
        <h2>Questions parents ask about Bible stories for kids</h2>
        <div className="stories-faq">
          {FAQS.map(f => (
            <div key={f.q} className="stories-faq-item">
              <h3>{f.q}</h3>
              <p>{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="blog-bottom-cta">
        <div className="blog-bottom-cta-inner">
          <h2>Would they rather watch it?</h2>
          <p>
            Every story here also exists as a short video lesson with a quiz afterwards, so you can
            see what your child actually understood rather than guessing.
          </p>
          <a className="btn-primary" href="/quiz?ref=stories-hub">Start your free trial</a>
          <div className="blog-cta-badges">
            <span>300+ video lessons</span>
            <span>No ads, ever</span>
            <span>Cancel anytime</span>
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  )
}
