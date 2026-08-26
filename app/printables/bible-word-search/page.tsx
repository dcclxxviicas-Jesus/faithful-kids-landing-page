import type { Metadata } from 'next'
import { SiteNav, SiteFooter } from '../../components/SiteChrome'
import puzzles from '@/lib/word-searches.json'
import { WordSearchGame } from './WordSearchGame'
import { PrintableCta } from '../PrintableCta'
import printableVideos from '@/lib/printable-videos.json'

/**
 * Bible word search hub.
 *
 * Target: "bible word search puzzles" 5,400/mo at keyword difficulty 4
 * (DataForSEO clickstream), with 41 variants in the same range.
 *
 * Grids render as HTML tables rather than images so the letters and the word
 * lists are real text on the page. A word search shipped as a PNG is invisible
 * to Google and unusable with a screen reader.
 */

export const metadata: Metadata = {
  title: 'Bible Word Search — 11 Free Puzzles',
  description:
    'Eleven free Bible word search puzzles for kids — play online or print. Noah, Christmas, Easter, David and Goliath, the armor of God and more. Answer keys included.',
  keywords: [
    'bible word search', 'bible word search puzzles', 'bible word search printable',
    'free bible word search', 'bible word search for kids', 'sunday school word search',
    'printable bible puzzles',
  ],
  alternates: { canonical: 'https://faithfulkids.app/printables/bible-word-search' },
  openGraph: {
    title: 'Bible Word Search — 10 Free Printables',
    description:
      'Eleven free Bible word search puzzles for kids — play online or print, with answer keys. No sign-up.',
    url: 'https://faithfulkids.app/printables/bible-word-search',
    siteName: 'Faithful Kids',
    type: 'website',
    images: [{ url: 'https://d3g07v1w0lehiv.cloudfront.net/wordsearch-images/bible.png', width: 1536, height: 1024 }],
  },
}

export default function WordSearchHub() {
  // The general puzzle lives ONLY here, not on its own detail route, so the hub
  // and a near-identical child page never compete for "bible word search".
  const general = puzzles.find(p => p.slug === 'bible')!
  const themed = puzzles.filter(p => p.slug !== 'bible')

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Bible Word Search Puzzles',
    description: `${puzzles.length} free printable Bible word search puzzles for children, with answer keys.`,
    url: 'https://faithfulkids.app/printables/bible-word-search',
    isFamilyFriendly: true,
    inLanguage: 'en',
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: puzzles.length,
      itemListElement: themed.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: `${p.title} word search`,
        url: `https://faithfulkids.app/printables/bible-word-search/${p.slug}`,
      })),
    },
  }

  return (
    <>
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <SiteNav active="printables" />

      <section className="blog-hero">
        <span className="section-label">Free · No Sign-Up</span>
        <h1>Bible Word Search Puzzles</h1>
        <p className="blog-hero-sub">
          Eleven puzzles — one covering the whole Bible, playable right here, and ten more built from a
          single story each. All free to print, with the answer key on every page.
        </p>
      </section>

      <section className="cp-intro">
        <p>
          Every puzzle here is a 14&times;14 grid with twelve words hidden in all eight directions,
          including backwards. That is deliberately harder than the four-direction puzzles aimed at
          the youngest children, because the age that actually enjoys a word search is seven and up
          and those puzzles bore them in a minute.
        </p>
        <p>
          The word lists come from the story itself rather than a generic religious vocabulary, so
          finishing one means a child has read twelve words that belong to a passage — useful before
          you teach it, and better still as review afterwards.
        </p>
      </section>

      <section className="ws-play">
        <h2>Play the Bible word search now</h2>
        <p className="section-sub">
          Twelve words from across the whole Bible. Drag across a word or tap its first and last
          letter — it works on a phone, and nothing needs printing.
        </p>
        <WordSearchGame
          grid={general.grid}
          words={general.words}
          answers={general.answers as unknown as Record<string, { row: number; col: number; dr: number; dc: number }>}
          slug={general.slug}
          title="Bible"
        />
      </section>

      <section className="ws-themed-head">
        <h2>Word searches by Bible story</h2>
        <p className="section-sub">
          Ten more puzzles, each built from one story or theme. Every one plays in the browser and
          prints on a single sheet with its answer key.
        </p>
      </section>

      <div className="ws-grid">
        {themed.map(p => (
          <a key={p.slug} className="ws-card" href={`/printables/bible-word-search/${p.slug}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="ws-card-img"
              src={`https://d3g07v1w0lehiv.cloudfront.net/wordsearch-images/${p.slug}.png`}
              alt={`${p.title} Bible word search for kids`}
              loading="lazy"
              width={1536}
              height={1024}
            />
            <strong>{p.title}</strong>
            <span className="ws-meta">{p.scripture} · {p.ages}</span>
            <span className="ws-words">{p.words.slice(0, 6).join(' · ')}…</span>
          </a>
        ))}
      </div>

      <section className="cp-outro">
        <h2>Which puzzle suits which age</h2>
        <p>
          The Noah, Christmas and David and Goliath grids use the shortest words and the most
          familiar names, so they suit six and seven year olds who are still reading slowly. Books
          of the Bible and fruit of the Spirit are the hardest, partly because the words are longer
          and partly because a child has to know them already to spot them quickly.
        </p>
        <p>
          Every grid is the same size, so a class working at different levels can be given
          different puzzles without anyone noticing they got the easy one.
        </p>

        <h2>Printing these for a class</h2>
        <p>
          Print as many copies as you need for a Sunday school, a homeschool co-op, a camp or a
          church group. There is no licence to buy and no attribution required. The answer key sits
          below the puzzle on the page rather than on a separate sheet, so fold it under before you
          hand it out, or print only the top half.
        </p>

        <h2>How to use a Bible word search well</h2>
        <p>
          A word search is a vocabulary exercise, not a lesson, and it works best either just before
          a story or straight after it. Hand it out first and a child meets the names before they
          hear them, which makes the reading easier. Hand it out after and it is review that does not
          feel like review.
        </p>
        <p>
          For younger children who find a 14&times;14 grid discouraging, read the word list aloud
          first and let them find three words rather than twelve. Finishing something small beats
          abandoning something large.
        </p>
        <p>
          Looking for something to color instead? There are 26 free{' '}
          <a href="/printables/bible-coloring-pages">Bible coloring pages</a> on our site, and{' '}
          <a href="/bible-trivia">a Bible trivia game</a> you can play in the browser.
        </p>
      </section>
      <PrintableCta
        {...(printableVideos as Record<string, { videoSrc: string; posterSrc: string; videoTitle: string; duration: string | null }>)._default}
        duration={(printableVideos as Record<string, { duration: string | null }>)._default.duration ?? undefined}
        heading="The puzzle is the warm-up. This is the story."
        body="A word search teaches twelve words. The episode behind it takes about two minutes, ends with a quiz, and is one of 200 covering the whole Bible in order."
        source="word-search-hub"
      />


      <section className="blog-bottom-cta">
        <div className="blog-bottom-cta-inner">
          <h2>The stories behind the puzzles</h2>
          <p>
            Every theme here is an episode in the Faithful Kids library — a few minutes long, with a
            quiz afterwards so you can see what your child actually understood.
          </p>
          <a className="btn-primary" href="/quiz?ref=word-search">
            Start your child&rsquo;s Bible journey
          </a>
        </div>
      </section>

      <SiteFooter />
    </>
  )
}
