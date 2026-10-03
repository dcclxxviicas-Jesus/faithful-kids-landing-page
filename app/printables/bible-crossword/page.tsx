import type { Metadata } from 'next'
import { SiteNav, SiteFooter } from '../../components/SiteChrome'
import puzzles from '@/lib/crosswords.json'
import { CrosswordGame, type Clue } from './CrosswordGame'
import { CrosswordSheet } from './CrosswordSheet'
import PrintButton from '../PrintButton'
import { PrintableCta } from '../PrintableCta'
import printableVideos from '@/lib/printable-videos.json'

/**
 * Bible crossword hub.
 *
 * Target: "bible crossword puzzles" 2,400/mo at keyword difficulty 10
 * (DataForSEO clickstream, Oct 2026) -- the games-night cluster's puzzle
 * anchor, same architecture as /printables/bible-word-search.
 *
 * The general puzzle plays ON this hub and has NO detail route, exactly like
 * the word search hub -- a /bible-crossword/bible page would be near-identical
 * to this one and compete for the same head term. Keep that exclusion if you
 * add puzzles.
 *
 * Grids render as HTML tables, so clues and structure are real text on the
 * page. A crossword shipped as an image is invisible to Google and unusable
 * with a screen reader.
 */

export const metadata: Metadata = {
  title: 'Bible Crossword Puzzles — 7 Free Printables',
  description:
    'Seven free Bible crossword puzzles for kids — play online or print. Christmas, Noah, Moses, David and Goliath, Easter. Clues, answer keys, no sign-up.',
  keywords: [
    'bible crossword puzzles', 'bible crossword', 'bible crossword printable',
    'free bible crossword puzzles', 'bible crossword for kids',
    'sunday school crossword', 'printable bible puzzles',
  ],
  alternates: { canonical: 'https://faithfulkids.app/printables/bible-crossword' },
  openGraph: {
    title: 'Bible Crossword Puzzles — 7 Free Printables',
    description:
      'Seven free Bible crossword puzzles for kids — play online or print, with answer keys. No sign-up.',
    url: 'https://faithfulkids.app/printables/bible-crossword',
    siteName: 'Faithful Kids',
    type: 'website',
    images: [{ url: 'https://d3g07v1w0lehiv.cloudfront.net/wordsearch-images/bible.png', width: 1536, height: 1024 }],
  },
}

export default function CrosswordHub() {
  const general = puzzles.find(p => p.slug === 'bible')!
  const themed = puzzles.filter(p => p.slug !== 'bible')

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Bible Crossword Puzzles',
    description: `${puzzles.length} free printable Bible crossword puzzles for children, with clues and answer keys.`,
    url: 'https://faithfulkids.app/printables/bible-crossword',
    isFamilyFriendly: true,
    inLanguage: 'en',
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: themed.length,
      itemListElement: themed.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: `${p.title} crossword`,
        url: `https://faithfulkids.app/printables/bible-crossword/${p.slug}`,
      })),
    },
  }

  const vids = printableVideos as Record<string, { videoSrc: string; posterSrc: string; videoTitle: string; duration: string | null }>

  return (
    <>
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <div className="no-print"><SiteNav active="printables" /></div>

      <section className="blog-hero no-print">
        <span className="section-label">Free · No Sign-Up</span>
        <h1>Bible Crossword Puzzles</h1>
        <p className="blog-hero-sub">
          Seven crosswords — one covering the whole Bible, playable right here, and six more built
          from a single story each. All free to print, clues and answer key included.
        </p>
      </section>

      <section className="cp-intro no-print">
        <p>
          These are interlocking crosswords in the format kids&rsquo; Bible puzzles actually use:
          every answer crosses at least one other, and every clue comes from the story itself
          rather than generic religious vocabulary. Solving one means a child has recalled ten or
          twelve facts from a passage — which makes a crossword the rare worksheet that is
          actually a comprehension check in disguise.
        </p>
        <p>
          Each puzzle plays in the browser — right answers lock in green on their own — and prints
          on a single sheet with an empty grid and the clues, so the same page works for a quiet
          Sunday afternoon and a Sunday school class of thirty.
        </p>
      </section>

      <section className="ws-play no-print">
        <h2>Play the Bible crossword now</h2>
        <p className="section-sub">
          Twelve answers from across the whole Bible. Tap a clue, type the answer — it works on a
          phone, and nothing needs printing.
        </p>
        <CrosswordGame
          grid={general.grid}
          nums={general.nums as unknown as Record<string, number>}
          across={general.across as unknown as Clue[]}
          down={general.down as unknown as Clue[]}
          slug={general.slug}
          title="Bible"
        />
      </section>

      <CrosswordSheet
        grid={general.grid}
        nums={general.nums as unknown as Record<string, number>}
        across={general.across as unknown as Clue[]}
        down={general.down as unknown as Clue[]}
        title="Bible"
        scripture={general.scripture}
      />
      <div className="cpd-actions no-print"><PrintButton /></div>

      <section className="ws-themed-head no-print">
        <h2>Crosswords by Bible story</h2>
        <p className="section-sub">
          Six more puzzles, each built from one story. Every one plays in the browser and prints
          on a single sheet with its clues.
        </p>
      </section>

      <div className="ws-grid no-print">
        {themed.map(p => (
          <a key={p.slug} className="ws-card" href={`/printables/bible-crossword/${p.slug}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="ws-card-img"
              src={`https://d3g07v1w0lehiv.cloudfront.net/wordsearch-images/${p.slug}.png`}
              alt={`${p.title} Bible crossword for kids`}
              loading="lazy"
              width={1536}
              height={1024}
            />
            <strong>{p.title}</strong>
            <span className="ws-meta">{p.scripture} · {p.ages}</span>
            <span className="ws-words">
              {p.across.length + p.down.length} clues · {p.rows}&times;{p.cols} grid
            </span>
          </a>
        ))}
      </div>

      <section className="cp-outro no-print">
        <h2>Which puzzle suits which age</h2>
        <p>
          Noah&rsquo;s Ark and David and Goliath use the shortest answers and the most familiar
          names, so they suit six and seven year olds — especially with a grown-up reading the
          clues aloud. The all-Bible puzzle above is the hardest, because its answers span
          Genesis to Revelation and a child has to place each clue in the right story first.
        </p>
        <p>
          A crossword is more forgiving than it looks: every crossing letter is a free hint, so a
          child stuck on a clue can solve the words around it and come back. Teach that move once
          and you have taught them how every crossword in the world works.
        </p>

        <h2>Printing these for a class</h2>
        <p>
          Print as many copies as you need for a Sunday school, a homeschool co-op, a camp or a
          church group — no licence, no attribution required. The printed page is the empty grid
          with clues; the answer key lives on each puzzle&rsquo;s page behind a &ldquo;show the
          answer key&rdquo; fold, so it never prints over a shoulder by accident.
        </p>

        <h2>How to use a Bible crossword well</h2>
        <p>
          Use it after the story, not before. A word search works as a vocabulary preview, but a
          crossword asks what happened and why — &ldquo;how many stones did David pick up?&rdquo;
          only lands once they have heard the answer. Straight after the lesson it is review that
          does not feel like review; a week later it tells you what actually stuck.
        </p>
        <p>
          More paper games: {' '}
          <a href="/printables/bible-word-search">eleven Bible word searches</a>, 26 free{' '}
          <a href="/printables/bible-coloring-pages">Bible coloring pages</a>, and{' '}
          <a href="/bible-trivia">a Bible trivia game</a> you can play in the browser.
        </p>
      </section>

      <PrintableCta
        {...vids._default}
        duration={vids._default.duration ?? undefined}
        heading="The puzzle is the review. This is the lesson."
        body="A crossword checks what they remember. The episode behind it takes about two minutes, ends with a quiz, and is one of 300+ covering the whole Bible in order."
        source="crossword-hub"
      />

      <section className="blog-bottom-cta no-print">
        <div className="blog-bottom-cta-inner">
          <h2>The stories behind the puzzles</h2>
          <p>
            Every theme here is an episode in the Faithful Kids library — a few minutes long, with
            a quiz afterwards so you can see what your child actually understood.
          </p>
          <a className="btn-primary" href="/quiz?ref=crossword">
            Start your child&rsquo;s Bible journey
          </a>
        </div>
      </section>

      <div className="no-print"><SiteFooter /></div>
    </>
  )
}
