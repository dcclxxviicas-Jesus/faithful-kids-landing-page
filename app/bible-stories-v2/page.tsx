import { SiteNav, SiteFooter } from '@/app/components/SiteChrome'
import { getAllPosts } from '@/lib/blog'

/**
 * VISUAL TEST of /bible-stories-for-kids. Same data, same links, same copy —
 * only the presentation changes. See layout.tsx for why it is noindexed.
 *
 * The one substantive addition: every series leads with the hero illustration
 * of its first episode. Those 200 images were already on the CDN and the live
 * page used none of them; all 20 episode-1 heroes were HEAD-checked 200 before
 * this shipped, because a missing one renders as a broken image.
 */

const CDN = 'https://d3g07v1w0lehiv.cloudfront.net'
const hero = (slug: string) => `${CDN}/blog-images/${slug}-hero.webp`
const clean = (t: string) => t.replace(/ for Kids.*$/i, '').replace(/:.*$/, '')

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

  const ages = ['Ages 5+', 'Ages 6+', 'Ages 7+']
    .map(a => ({ label: a, items: stories.filter(p => p.age === a) }))
    .filter(a => a.items.length > 0)

  /* The live page takes the first N matches per theme, and stories tagged with
     several themes win every list — so faith/hope and forgiveness/kindness
     render IDENTICAL sets of six on production right now. Four of eight cards
     are duplicates of another, which reads as broken.

     Here each story is claimed by the first theme that wants it, so the eight
     lists are genuinely different. A theme that ends up thin is topped back up
     from its own matches rather than shown nearly empty. */
  const THEME_NAMES = ['courage', 'faith', 'forgiveness', 'kindness', 'hope', 'prayer', 'obedience', 'love']
  const claimed = new Set<string>()
  const themes = THEME_NAMES
    .map(t => {
      const matches = stories.filter(p => (p.themes || '').toLowerCase().includes(t))
      const mine = matches.filter(p => !claimed.has(p.slug)).slice(0, 8)
      for (const p of mine) claimed.add(p.slug)
      const topUp = mine.length >= 4 ? mine
        : [...mine, ...matches.filter(p => !mine.includes(p)).slice(0, 4 - mine.length)]
      return { label: t, items: topUp }
    })
    .filter(t => t.items.length >= 3)

  return (
    <>
      <div className="hv-testbar">
        Visual test — not linked from the site and not indexed. The live page is unchanged at{' '}
        <a href="/bible-stories-for-kids">/bible-stories-for-kids</a>.
      </div>

      <SiteNav active="stories" />

      <section className="hv-hero sv-hero">
        <img className="hv-hero-art" src={`${CDN}/home-v2/bg2-meadow.webp`} alt=""
             width={1536} height={1024} fetchPriority="high" />
        <div className="hv-hero-inner">
          <p className="hv-eyebrow">Free &middot; no sign-up</p>
          <h1 className="hv-h1">Bible Stories for Kids</h1>
          <p className="hv-sub">
            All {stories.length} stories, Genesis to Revelation, retold in plain language a child
            can follow. Every one lists the scripture it comes from, so you can open your own
            Bible alongside it.
          </p>
          <nav className="sv-jump">
            <a href="#old-testament">Old Testament</a>
            <a href="#new-testament">New Testament</a>
            <a href="#by-age">By age</a>
            <a href="#by-theme">By theme</a>
          </nav>
        </div>
      </section>

      <div style={{ padding: '0 20px' }}>
        <div className="sv-intro">
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
        </div>
      </div>

      {(['Old Testament', 'New Testament'] as const).map(testament => (
        <section
          key={testament}
          id={testament === 'Old Testament' ? 'old-testament' : 'new-testament'}
          className="sv-section"
        >
          <div className="sv-head">
            <h2>{testament} Bible Stories for Kids</h2>
            <p>
              {Array.from(byTestament[testament].values()).reduce((n, s) => n + s.items.length, 0)}{' '}
              stories across {byTestament[testament].size} series, in order.
            </p>
          </div>
          <div className="sv-series-grid">
            {Array.from(byTestament[testament].entries()).map(([series, { slug, items }]) => (
              <article key={slug} className="sv-series">
                <div className="sv-series-art">
                  <img src={hero(items[0].slug)} alt="" width={1536} height={576} loading="lazy" />
                  <a className="sv-series-name" href={`/blog/series/${slug}`}>{series}</a>
                  {items[0]?.scripture && <span className="sv-series-ref">{items[0].scripture}</span>}
                </div>
                <div className="sv-series-body">
                  <ol className="sv-list">
                    {items.map(p => (
                      <li key={p.slug}><a href={`/blog/${p.slug}`}>{clean(p.title)}</a></li>
                    ))}
                  </ol>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}

      <section id="by-age" className="sv-section is-alt">
        <div className="sv-head">
          <h2>Bible Stories for Kids by Age</h2>
          <p>Grouped from each story&rsquo;s own age guidance, not guessed at.</p>
        </div>
        <div className="sv-cards">
          {ages.map(a => (
            <div key={a.label} className="sv-card">
              <h3>{a.label}</h3>
              <p className="sv-card-count">{a.items.length} stories</p>
              <ul>
                {a.items.slice(0, 10).map(p => (
                  <li key={p.slug}><a href={`/blog/${p.slug}`}>{clean(p.title)}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section id="by-theme" className="sv-section">
        <div className="sv-head">
          <h2>Bible Stories for Kids by Theme</h2>
          <p>Pick the one that fits what your family is talking about this week.</p>
        </div>
        <div className="sv-cards is-4">
          {themes.map(t => (
            <div key={t.label} className="sv-card">
              <h3>{t.label}</h3>
              <p className="sv-card-count">{t.items.length} stories</p>
              <ul>
                {t.items.map(p => (
                  <li key={p.slug}><a href={`/blog/${p.slug}`}>{clean(p.title)}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="sv-section is-alt">
        <div className="sv-head">
          <h2>Questions parents ask</h2>
        </div>
        <div className="sv-faq">
          {FAQS.map(f => (
            <div key={f.q} className="sv-faq-item">
              <h3>{f.q}</h3>
              <p>{f.a}</p>
            </div>
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
          <span className="hv-cta-play">&#9654;</span>
          Start watching free
        </a>
      </section>

      <SiteFooter />
    </>
  )
}
