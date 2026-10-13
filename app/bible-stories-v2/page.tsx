import { SiteNav, SiteFooter } from '@/app/components/SiteChrome'
import { getAllPosts } from '@/lib/blog'
import { seriesLabel, seriesRank, spreadBySeries } from '@/lib/series-order'

/**
 * VISUAL TEST of /bible-stories-for-kids, in the same storybook language as the
 * homepage. Noindexed and unlinked (see layout.tsx); the live page is unchanged.
 *
 * Same data, same copy, and every one of the 200 story links preserved. What
 * changes is the presentation, plus three things the live page is missing and
 * should have when this replaces it:
 *   - every series leads with the hero illustration of its first episode (those
 *     200 images were already on the CDN and the live page uses none of them);
 *   - the illustrations carry real alt text rather than being marked decorative;
 *   - the FAQ is <details>, so the answers are in the HTML whether or not the
 *     item is open.
 */

const CDN = 'https://d3g07v1w0lehiv.cloudfront.net'
const SITE = 'https://faithfulkids.app'

/* The storytime painting, not the homepage's meadow: four children round an
   open book. It is the only hero on the site that depicts what the page is
   about, which is also why it gets real alt text and the meadow does not. */
const HERO = `${CDN}/home/hero-storytime-1536.webp`
const HERO_SET = [768, 1152, 1536].map(w => `${CDN}/home/hero-storytime-${w}.webp ${w}w`).join(', ')

/* Card-sized copies of the twenty series illustrations. The originals are
   1536px and 150-450KB each; twenty of those is 7MB for cards that render
   about 380px wide. These are 760px (2x the card) and 1MB for the set. */
const hero = (slug: string) => `${CDN}/blog-images/sm/${slug}-hero.webp`
const clean = (t: string) => t.replace(/ for Kids.*$/i, '').replace(/:.*$/, '')

/* One colour per theme card. Deliberately the same pastel family as the
   homepage's step circles so the two pages read as one site. */
const THEME_STYLE: Record<string, { tint: string; ink: string; icon: string }> = {
  courage:     { tint: '#fee2e2', ink: '#b91c1c', icon: '🦁' },
  faith:       { tint: '#dbeafe', ink: '#1d4ed8', icon: '🕊️' },
  forgiveness: { tint: '#f3e8ff', ink: '#7e22ce', icon: '🤝' },
  kindness:    { tint: '#fce7f3', ink: '#be185d', icon: '💗' },
  hope:        { tint: '#fef3c7', ink: '#854d0e', icon: '🌅' },
  prayer:      { tint: '#e0e7ff', ink: '#4338ca', icon: '🙏' },
  obedience:   { tint: '#dcfce7', ink: '#15803d', icon: '🌱' },
  love:        { tint: '#ffe4e6', ink: '#be123c', icon: '❤️' },
}

const AGE_TINT = ['#dbeafe', '#dcfce7', '#fef3c7']

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

export default function BibleStoriesV2() {
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

  // Spread across series, or the first ten "Ages 5+" stories are all Genesis
  // and the card reads as one book rather than a reading level.
  const ages = ['Ages 5+', 'Ages 6+', 'Ages 7+']
    .map(a => {
      const all = stories.filter(p => p.age === a)
      return { label: a, items: spreadBySeries(all, 10), total: all.length }
    })
    .filter(a => a.items.length > 0)

  /* Each story is claimed by the FIRST theme that wants it. Taking the first
     six matches per theme independently made "forgiveness" and "kindness"
     render the same six cards, because most stories carry several themes. */
  const themeKeys = ['courage', 'faith', 'forgiveness', 'kindness', 'hope', 'prayer', 'obedience', 'love']
  const claimed = new Set<string>()
  const themes = themeKeys
    .map(t => {
      const items = spreadBySeries(
        stories.filter(p => !claimed.has(p.slug) && (p.themes || '').toLowerCase().includes(t)),
        6,
      )
      items.forEach(p => claimed.add(p.slug))
      return { label: t, items }
    })
    .filter(t => t.items.length >= 3)

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Bible Stories for Kids',
    description: `${stories.length} Bible stories for children, retold simply, from Genesis to Revelation.`,
    url: `${SITE}/bible-stories-for-kids`,
    isFamilyFriendly: true,
    inLanguage: 'en',
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: stories.length,
      itemListElement: stories.slice(0, 100).map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: p.title,
        url: `${SITE}/blog/${p.slug}`,
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <link rel="preload" as="image" href={HERO} imageSrcSet={HERO_SET}
            imageSizes="100vw" fetchPriority="high" />

      <SiteNav active="stories" />

      <main id="main-content">

      <section className="hv-hero sv-hero">
        <img className="hv-hero-art"
             src={HERO} srcSet={HERO_SET} sizes="100vw"
             alt="Four children sitting in a meadow at sunset around a large open Bible, laughing"
             width={1536} height={1024} fetchPriority="high" />
        <div className="hv-hero-inner">
          <p className="hv-eyebrow">Free &middot; no sign-up &middot; no email wall</p>
          <h1 className="hv-h1">
            Bible{' '}
            <span className="hv-love">
              <span className="l l1">s</span><span className="l l2">t</span>
              <span className="l l3">o</span><span className="l l4">r</span>
              <span className="l l1">i</span><span className="l l2">e</span>
              <span className="l l3">s</span>
            </span>{' '}
            for Kids
          </h1>
          <p className="hv-sub">
            All {stories.length} stories, Genesis to Revelation, retold in plain language a child
            can follow. Every one lists the scripture it comes from, so you can open your own
            Bible alongside it.
          </p>
        </div>
      </section>

      <div className="sv-cardwrap">
        <div className="sv-card-top">
          <nav className="sv-jump" aria-label="Jump to a section">
            <a href="#old-testament"><span aria-hidden="true">📜</span>Old Testament</a>
            <a href="#new-testament"><span aria-hidden="true">✨</span>New Testament</a>
            <a href="#by-age"><span aria-hidden="true">🎈</span>By age</a>
            <a href="#by-theme"><span aria-hidden="true">💛</span>By theme</a>
          </nav>
          <div className="sv-intro">
            <p>
              Most collections of Bible stories for kids give you the same eight or nine favorites.
              Noah, David and Goliath, Jonah, the nativity, and then they stop. Children work
              through those quickly and are left with the impression that the Bible is a short book
              of disconnected episodes.
            </p>
            <p>
              This is the whole story instead, in the order it happened, from creation through the
              early church. Each retelling is a few minutes read aloud, written for children roughly
              five and up, and ends with questions worth asking at the dinner table.
            </p>
          </div>
          <p className="sv-signpost">
            Not sure where to begin?{' '}
            <a href="/blog/best-bible-stories-for-kids">Start with the 25 best Bible stories for kids</a>
            , chosen for how easily a young child can follow them and retell them afterwards.
          </p>
        </div>
      </div>

      {(['Old Testament', 'New Testament'] as const).map(testament => {
        const entries = Array.from(byTestament[testament].entries())
        const count = entries.reduce((n, [, s]) => n + s.items.length, 0)
        return (
          <section
            key={testament}
            id={testament === 'Old Testament' ? 'old-testament' : 'new-testament'}
            className={`sv-section${testament === 'New Testament' ? ' is-alt' : ''}`}
          >
            <div className="sv-head">
              <p className="hv-eyebrow">{testament}</p>
              <h2>{testament} Bible Stories for Kids</h2>
              <p className="sv-head-sub">
                {count} stories across {entries.length} series, in the order they happened.
              </p>
            </div>
            <div className="sv-series-grid">
              {entries.map(([series, { slug, items }]) => {
                const name = seriesLabel(slug, series)
                return (
                  <article key={slug} className="sv-series">
                    <a className="sv-series-art" href={`/blog/series/${slug}`}>
                      <img
                        src={hero(items[0].slug)}
                        /* Real alt, not decorative: these illustrations are the
                           only picture of what a series contains, and image
                           search is a live channel for a page like this. */
                        alt={`${name}: illustration from ${clean(items[0].title)}`}
                        width={760} height={507} loading="lazy" decoding="async"
                      />
                      <span className="sv-series-part">Part {seriesRank(slug) + 1}</span>
                      <span className="sv-series-meta">
                        <strong>{name}</strong>
                        {/* 14 of the 20 episode-1 posts have no `scripture`
                            field, so keying on items[0] left most cards with no
                            reference at all. First episode that has one. */}
                        {(items.find(p => p.scripture)?.scripture
                          || items.find(p => p.book)?.book) && (
                          <em>{items.find(p => p.scripture)?.scripture
                               || items.find(p => p.book)?.book}</em>
                        )}
                      </span>
                    </a>
                    <ol className="sv-list">
                      {items.map(p => (
                        <li key={p.slug}><a href={`/blog/${p.slug}`}>{clean(p.title)}</a></li>
                      ))}
                    </ol>
                  </article>
                )
              })}
            </div>
          </section>
        )
      })}

      <section id="by-age" className="sv-section">
        <div className="sv-head">
          <p className="hv-eyebrow">Where to start</p>
          <h2>Bible Stories for Kids by Age</h2>
          <p className="sv-head-sub">Grouped from each story&rsquo;s own age guidance, not guessed at.</p>
        </div>
        <div className="sv-cards is-3">
          {ages.map((a, i) => (
            <div key={a.label} className="sv-card" style={{ background: AGE_TINT[i % AGE_TINT.length] }}>
              <h3>{a.label}</h3>
              <p className="sv-card-count">{a.total} stories</p>
              <ul>
                {a.items.map(p => (
                  <li key={p.slug}><a href={`/blog/${p.slug}`}>{clean(p.title)}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section id="by-theme" className="sv-section is-alt">
        <div className="sv-head">
          <p className="hv-eyebrow">For the conversation you are having</p>
          <h2>Bible Stories for Kids by Theme</h2>
          <p className="sv-head-sub">Pick the one that fits what your family is talking about this week.</p>
        </div>
        <div className="sv-cards is-4">
          {themes.map(t => {
            const s = THEME_STYLE[t.label] ?? { tint: '#f1f5f9', ink: '#334155', icon: '📖' }
            return (
              <div key={t.label} className="sv-card sv-theme" style={{ background: s.tint }}>
                <span className="sv-theme-icon" aria-hidden="true">{s.icon}</span>
                <h3 style={{ color: s.ink }}>{t.label}</h3>
                <ul>
                  {t.items.map(p => (
                    <li key={p.slug}><a href={`/blog/${p.slug}`}>{clean(p.title)}</a></li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </section>

      <section className="sv-section">
        <div className="sv-head">
          <h2>Questions parents ask about Bible stories for kids</h2>
        </div>
        <div className="hv-faq-list sv-faq">
          {FAQS.map(f => (
            <details className="hv-faq-item" key={f.q}>
              <summary>
                <h3>{f.q}</h3>
                <span className="hv-faq-mark" aria-hidden="true" />
              </summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="hv-close">
        <ul className="hv-chips">
          <li><span aria-hidden="true">📖</span>Read it</li>
          <li><span aria-hidden="true">▶️</span>Watch it</li>
          <li><span aria-hidden="true">💬</span>Talk about it</li>
        </ul>
        <h2>Every story has a two-minute video too</h2>
        <a className="hv-cta" href="/quiz">
          <span className="hv-cta-play" aria-hidden="true" />
          Start watching free
        </a>
        <p className="hv-close-fine">Free to try &middot; no ads, ever</p>
      </section>

      </main>

      <SiteFooter />
    </>
  )
}
