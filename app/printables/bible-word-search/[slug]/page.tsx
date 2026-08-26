import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SiteNav, SiteFooter } from '../../../components/SiteChrome'
import PrintButton from '../../PrintButton'
import puzzles from '@/lib/word-searches.json'

type Puzzle = (typeof puzzles)[number]

const get = (slug: string) => puzzles.find(p => p.slug === slug) as Puzzle | undefined

export function generateStaticParams() {
  return puzzles.map(p => ({ slug: p.slug }))
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
    openGraph: { title, description: desc, url, siteName: 'Faithful Kids', type: 'article' },
  }
}

export default async function WordSearchPuzzle(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const p = get(slug)
  if (!p) notFound()

  const others = puzzles.filter(o => o.slug !== p.slug).slice(0, 6)

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

      <div className="ws-sheet">
        <h2 className="ws-sheet-title">{p.title} Word Search</h2>
        <table className="ws-table">
          <tbody>
            {p.grid.map((row, r) => (
              <tr key={r}>
                {row.map((ch, c) => <td key={c}>{ch}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
        <ul className="ws-list">
          {p.words.map(w => <li key={w}>{w}</li>)}
        </ul>
        <p className="ws-credit">FaithfulKids.app</p>
      </div>

      <div className="cpd-actions no-print"><PrintButton /></div>

      <section className="cpd-body no-print">
        <p>
          Twelve words from {p.scripture}, hidden in all eight directions including backwards.
          Best for {p.ages.toLowerCase().replace('ages ', 'ages ')} — younger children can do the
          same grid if you read the list aloud and let them find three or four rather than all
          twelve.
        </p>

        <h2>Answer key</h2>
        <p>Fold this under before you hand the sheet over, or check it afterwards together.</p>
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

      <section className="blog-bottom-cta no-print">
        <div className="blog-bottom-cta-inner">
          <h2>The story behind the puzzle</h2>
          <p>
            {p.title} is an episode in the Faithful Kids library — a few minutes long, with a quiz
            afterwards so you can see what your child actually understood.
          </p>
          <a className="btn-primary" href="/quiz?ref=word-search-detail">
            Start your child&rsquo;s Bible journey
          </a>
        </div>
      </section>

      <div className="no-print"><SiteFooter /></div>
    </>
  )
}
