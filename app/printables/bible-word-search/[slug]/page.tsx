import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SiteNav, SiteFooter } from '../../../components/SiteChrome'
import PrintButton from '../../PrintButton'
import puzzles from '@/lib/word-searches.json'
import { WordSearchGame } from '../WordSearchGame'
import { PrintableCta } from '../../PrintableCta'
import printableVideos from '@/lib/printable-videos.json'
import { EmailCaptureCard } from '../../../blog/EmailCaptureCard'
import { WORDSEARCH_TO_COLORING, WORDSEARCH_STORY } from '@/lib/printable-pairs'
import { getColoringPage } from '@/lib/coloring-pages'

type Puzzle = (typeof puzzles)[number]

const get = (slug: string) =>
  (slug === 'bible' ? undefined : puzzles.find(p => p.slug === slug)) as Puzzle | undefined

export function generateStaticParams() {
  // 'bible' is played on the hub itself; giving it a detail page too would put
  // two near-identical pages against the same head term.
  return puzzles.filter(p => p.slug !== 'bible').map(p => ({ slug: p.slug }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params
  const p = get(slug)
  if (!p) return {}
  const title = `${p.title} Word Search — Free Printable`
  const desc = `A free printable ${p.title} Bible word search for kids (${p.scripture}). ${p.words.length} words, ${p.size}×${p.size} grid, answer key included. No sign-up.`
  const url = `https://faithfulkids.app/printables/bible-word-search/${p.slug}`
  return {
    title,
    description: desc,
    keywords: [
      `${p.title.toLowerCase()} word search`,
      'bible word search', 'bible word search printable',
      'free bible word search', 'sunday school word search',
    ],
    alternates: { canonical: url },
    openGraph: {
      title, description: desc, url, siteName: 'Faithful Kids', type: 'article',
      images: [{ url: `https://d3g07v1w0lehiv.cloudfront.net/wordsearch-images/${p.slug}.png`, width: 1536, height: 1024 }],
    },
  }
}

export default async function WordSearchPuzzle(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const p = get(slug)
  if (!p) notFound()

  // Exclude 'bible' — it is played on the hub and has no detail route, so
  // linking to it from here would be a dead link.
  const others = puzzles.filter(o => o.slug !== p.slug && o.slug !== 'bible').slice(0, 6)
  // The coloring sheet and the blog retelling of the same story. The coloring
  // detail pages already link out to their story; these had neither.
  const pairedCp = getColoringPage(WORDSEARCH_TO_COLORING[p.slug] ?? '')
  const storySlug = WORDSEARCH_STORY[p.slug]
  const vids = printableVideos as Record<string, { videoSrc: string; posterSrc: string; videoTitle: string; duration: string | null }>
  const clip = vids[p.slug] ?? vids._default

  // Cells that belong to a hidden word, for the answer key rendering.
  type Placement = { row: number; col: number; dr: number; dc: number }
  const answers = p.answers as unknown as Record<string, Placement>
  const solution = new Set<string>()
  for (const [word, a] of Object.entries(answers)) {
    for (let i = 0; i < word.length; i++) {
      solution.add(`${a.row + a.dr * i},${a.col + a.dc * i}`)
    }
  }

  return (
    <>
      <div className="no-print"><SiteNav active="printables" /></div>

      <section className="cpd-head no-print">
        <nav className="cpd-crumb">
          <a href="/printables">Printables</a>
          <span>›</span>
          <a href="/printables/bible-word-search">Bible Word Search</a>
        </nav>
        <h1>{p.title} Word Search</h1>
        <p className="cpd-meta">
          {p.scripture} · {p.ages} · {p.words.length} words · Free to print
        </p>
      </section>

      <div className="ws-hero no-print">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://d3g07v1w0lehiv.cloudfront.net/wordsearch-images/${p.slug}.png`}
          alt={`${p.title} — Bible word search puzzle for kids, ${p.scripture}`}
          width={1536}
          height={1024}
        />
      </div>

      <div className="ws-sheet">
        <h2 className="ws-sheet-title">{p.title} Word Search</h2>
        <WordSearchGame
          grid={p.grid}
          words={p.words}
          answers={answers}
          slug={p.slug}
          title={p.title}
        />
        <p className="ws-credit">
          <strong>FaithfulKids.app</strong>
          <span>Watch the {p.title} story free &middot; faithfulkids.app/bible-stories-for-kids</span>
        </p>
      </div>

      <div className="cpd-actions no-print"><PrintButton /></div>

      <section className="cpd-body no-print">
        <p>
          Twelve words from {p.scripture}, hidden in all eight directions including backwards.
          Best for {p.ages.toLowerCase().replace('ages ', 'ages ')} — younger children can do the
          same grid if you read the list aloud and let them find three or four rather than all
          twelve.
        </p>

        {storySlug && (
          <p>
            The words mean more once they know the story:{' '}
            <a href={`/blog/${storySlug}`}>{p.title} retold for kids</a> — a short version with the
            video lesson and a quiz.
          </p>
        )}
        {pairedCp && (
          <p>
            Younger children in the same room can color instead:{' '}
            <a href={`/printables/bible-coloring-pages/${pairedCp.slug}`}>
              the {pairedCp.title} coloring page
            </a>{' '}
            covers the same story and prints on one sheet.
          </p>
        )}

        <details className="ws-key">
          <summary>
            <span className="ws-key-caret" aria-hidden="true">&#9656;</span>
            Show the answer key
          </summary>
          <p className="ws-key-note">
            Closed by default so nobody spots it over a shoulder mid-puzzle.
          </p>
          <table className="ws-table ws-answers">
            <tbody>
              {p.grid.map((row, r) => (
                <tr key={r}>
                  {row.map((ch, c) => (
                    <td key={c} className={solution.has(`${r},${c}`) ? 'ws-hit' : undefined}>{ch}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </details>

        <h2>More Bible word searches</h2>
        <div className="ws-more">
          {others.map(o => (
            <a key={o.slug} href={`/printables/bible-word-search/${o.slug}`}>
              <strong>{o.title}</strong>
              <span>{o.scripture}</span>
            </a>
          ))}
        </div>
      </section>

      <section className="cp-capture no-print">
        <EmailCaptureCard
          magnet="coloring-pages"
          source="blog-inline"
          sourcePost={`word-search-${p.slug}`}
          title="🖍️ Free too: all 26 Bible coloring pages"
          subtitle="One PDF, Creation to the Empty Tomb — the set that pairs with these puzzles."
        />
      </section>

      <PrintableCta
        {...clip}
        duration={clip.duration ?? undefined}
        heading="Finding the words is not the same as knowing the story"
        body={`Twelve words is vocabulary. ${clip.videoTitle} tells the story in about two minutes and ends with a quiz, so you find out what actually landed — one of 300+ episodes, Genesis to Revelation.`}
        source="word-search-detail"
      />

      <section className="blog-bottom-cta no-print">
        <div className="blog-bottom-cta-inner">
          <h2>They found the words. Do they know the story?</h2>
          <p>
            Finding {p.words.length} words is vocabulary, not comprehension. The {p.title} episode
            takes about two minutes and ends with a quiz that tells you what actually landed — one
            of 300+ episodes covering the whole Bible in order.
          </p>
          <a className="btn-primary" href="/quiz?ref=word-search-detail">
            Watch {p.title} free
          </a>
          <div className="blog-cta-badges">
            <span>200 stories</span><span>Quiz after every one</span><span>No ads, ever</span>
          </div>
        </div>
      </section>

      <div className="no-print"><SiteFooter /></div>
    </>
  )
}
