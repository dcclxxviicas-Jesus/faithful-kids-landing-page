import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SiteNav, SiteFooter } from '../../../components/SiteChrome'
import PrintButton from '../../PrintButton'
import puzzles from '@/lib/crosswords.json'
import { CrosswordGame, type Clue } from '../CrosswordGame'
import { CrosswordSheet } from '../CrosswordSheet'
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
  const title = `${p.title} Crossword — Free Printable`
  const clues = p.across.length + p.down.length
  const desc = `A free printable ${p.title} Bible crossword for kids (${p.scripture}). ${clues} clues, answer key included, plays in the browser too. No sign-up.`
  const url = `https://faithfulkids.app/printables/bible-crossword/${p.slug}`
  return {
    // absolute: the root layout appends " | Faithful Kids", which truncated
    // 11 of 12 word-search titles in the SERP. Same fix here from day one.
    title: { absolute: title },
    description: desc,
    keywords: [
      `${p.title.toLowerCase()} crossword`,
      'bible crossword', 'bible crossword printable',
      'free bible crossword puzzles', 'sunday school crossword',
    ],
    alternates: { canonical: url },
    openGraph: {
      title, description: desc, url, siteName: 'Faithful Kids', type: 'article',
      images: [{ url: `https://d3g07v1w0lehiv.cloudfront.net/wordsearch-images/${p.slug}.png`, width: 1536, height: 1024 }],
    },
  }
}

export default async function CrosswordPuzzle(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const p = get(slug)
  if (!p) notFound()

  // Exclude 'bible' — played on the hub, no detail route, so linking to it
  // from here would be a dead link.
  const others = puzzles.filter(o => o.slug !== p.slug && o.slug !== 'bible')
  const pairedCp = getColoringPage(WORDSEARCH_TO_COLORING[p.slug] ?? '')
  const storySlug = WORDSEARCH_STORY[p.slug]
  const vids = printableVideos as Record<string, { videoSrc: string; posterSrc: string; videoTitle: string; duration: string | null }>
  const clip = vids[p.slug] ?? vids._default
  const clueCount = p.across.length + p.down.length

  return (
    <>
      <div className="no-print"><SiteNav active="printables" /></div>

      <section className="cpd-head no-print">
        <nav className="cpd-crumb">
          <a href="/printables">Printables</a>
          <span>›</span>
          <a href="/printables/bible-crossword">Bible Crossword</a>
        </nav>
        <h1>{p.title} Crossword</h1>
        <p className="cpd-meta">
          {p.scripture} · {p.ages} · {clueCount} clues · Free to print
        </p>
      </section>

      <div className="ws-hero no-print">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://d3g07v1w0lehiv.cloudfront.net/wordsearch-images/${p.slug}.png`}
          alt={`${p.title} — Bible crossword puzzle for kids, ${p.scripture}`}
          width={1536}
          height={1024}
        />
      </div>

      <section className="ws-play no-print">
        <CrosswordGame
          grid={p.grid}
          nums={p.nums as unknown as Record<string, number>}
          across={p.across as unknown as Clue[]}
          down={p.down as unknown as Clue[]}
          slug={p.slug}
          title={p.title}
        />
      </section>

      <CrosswordSheet
        grid={p.grid}
        nums={p.nums as unknown as Record<string, number>}
        across={p.across as unknown as Clue[]}
        down={p.down as unknown as Clue[]}
        title={p.title}
        scripture={p.scripture}
      />

      <div className="cpd-actions no-print"><PrintButton /></div>

      <section className="cpd-body no-print">
        <p>
          {clueCount} clues from {p.scripture}, every answer crossing at least one other. Best for{' '}
          {p.ages.toLowerCase()} — younger children can do the same puzzle with a grown-up reading
          the clues aloud, and every crossing letter they have already solved works as a hint.
        </p>

        {storySlug && (
          <p>
            The clues make more sense once they know the story:{' '}
            <a href={`/blog/${storySlug}`}>{p.title} retold for kids</a> — a short version with the
            video lesson and a quiz.
          </p>
        )}
        <p>
          Prefer finding words to spelling them? The{' '}
          <a href={`/printables/bible-word-search/${p.slug}`}>{p.title} word search</a> uses the
          same story&rsquo;s vocabulary in an easier format — a good warm-up before this puzzle.
        </p>
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
          <table className="cw-table cw-answers">
            <tbody>
              {p.grid.map((row, r) => (
                <tr key={r}>
                  {row.map((ch, c) => {
                    const key = `${r},${c}`
                    if (ch === null) return <td key={c} className="cw-void" />
                    return (
                      <td key={c} className="cw-open cw-solved">
                        {(p.nums as unknown as Record<string, number>)[key] && (
                          <span className="cw-num">{(p.nums as unknown as Record<string, number>)[key]}</span>
                        )}
                        {ch}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </details>

        <h2>More Bible crosswords</h2>
        <div className="ws-more">
          {others.map(o => (
            <a key={o.slug} href={`/printables/bible-crossword/${o.slug}`}>
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
          sourcePost={`crossword-${p.slug}`}
          title="🖍️ Free too: all 26 Bible coloring pages"
          subtitle="One PDF, Creation to the Empty Tomb — the set that pairs with these puzzles."
        />
      </section>

      <PrintableCta
        {...clip}
        duration={clip.duration ?? undefined}
        heading="Solving the clues is not the same as knowing the story"
        body={`${clueCount} clues is review. ${clip.videoTitle} tells the story in about two minutes and ends with a quiz, so you find out what actually landed — one of 300+ episodes, Genesis to Revelation.`}
        source="crossword-detail"
      />

      <section className="blog-bottom-cta no-print">
        <div className="blog-bottom-cta-inner">
          <h2>They solved the clues. Do they know the story?</h2>
          <p>
            Filling {clueCount} answers is recall, not understanding. The {p.title} episode takes
            about two minutes and ends with a quiz that tells you what actually landed — one of
            300+ episodes covering the whole Bible in order.
          </p>
          <a className="btn-primary" href="/quiz?ref=crossword-detail">
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
