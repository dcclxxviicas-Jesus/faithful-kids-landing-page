/**
 * Front-page layout candidates for /parenting (Nov 3, 2026).
 *
 * Built from a survey of how editorial sites compose a front page:
 *   A  Broadsheet   The Atlantic / The Gospel Coalition / Christian Post:
 *                   three columns, text-led left, dominant centre lead,
 *                   thumbnails right, then a text row.
 *   B  Cover        The New Yorker / Aeon: one full-bleed cover image with
 *                   the headline on it, then a uniform card grid.
 *   C  Feature+list Desiring God: split hero (art left, big headline right),
 *                   then a dated text list of everything else.
 *   D  Current      Plough-style lead + headline rail + grid (what is live).
 *
 * Rendered at /parenting/layouts/<a|b|c|d> (noindex) so the owner can pick.
 * Once a winner is chosen, port it into page.tsx and delete this file and
 * the route; nothing here is meant to live on production.
 */
import type { Article } from '@/lib/parenting'
import { fmtDate } from '@/lib/parenting'
import { Kicker, Byline, FeaturedStory, RailList, SectionBlock, ArticleCard } from './ui'

type Props = { featured: Article; rest: Article[] }

function href(a: Article) { return `/parenting/${a.slug}` }

function shortDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
}

/* ---------- A. Broadsheet ---------- */
export function BroadsheetFront({ featured, rest }: Props) {
  const left = rest.slice(0, 2)
  const right = rest.slice(2, 4)
  const row = rest.slice(4, 7)
  const overflow = rest.slice(7)
  return (
    <>
      <section className="pt-bs" aria-label="Front page">
        <div className="pt-bs-col pt-bs-left">
          {left.map(a => (
            <article key={a.slug} className="pt-bs-text">
              <Kicker section={a.section} />
              <h3><a href={href(a)}>{a.title}</a></h3>
              <p>{a.excerpt}</p>
              <Byline article={a} withAvatar={false} withDate={false} />
            </article>
          ))}
        </div>
        <article className="pt-bs-lead">
          <a className="pt-bs-lead-art" href={href(featured)} tabIndex={-1} aria-hidden="true">
            {featured.image && <img src={featured.image} alt="" width={1600} height={900} fetchPriority="high" />}
          </a>
          <Kicker section={featured.section} />
          <h2><a href={href(featured)}>{featured.title}</a></h2>
          <p className="pt-bs-dek">{featured.subtitle || featured.excerpt}</p>
          <div className="pt-bs-by"><Byline article={featured} /></div>
        </article>
        <div className="pt-bs-col pt-bs-right">
          {right.map(a => (
            <article key={a.slug} className="pt-bs-thumb">
              <a className="pt-bs-thumb-art" href={href(a)} tabIndex={-1} aria-hidden="true">
                {a.image && <img src={a.image} alt="" width={800} height={450} loading="lazy" />}
              </a>
              <Kicker section={a.section} />
              <h3><a href={href(a)}>{a.title}</a></h3>
              <Byline article={a} withAvatar={false} withDate={false} />
            </article>
          ))}
        </div>
      </section>
      {row.length > 0 && (
        <section className="pt-bs-row" aria-label="More stories">
          {row.map(a => (
            <article key={a.slug} className="pt-bs-text">
              <Kicker section={a.section} />
              <h3><a href={href(a)}>{a.title}</a></h3>
              <p>{a.excerpt}</p>
              <Byline article={a} withAvatar={false} withDate={false} />
            </article>
          ))}
        </section>
      )}
      {overflow.length > 0 && (
        <SectionBlock title="More stories">
          <div className="pt-grid">{overflow.map(a => <ArticleCard key={a.slug} article={a} />)}</div>
        </SectionBlock>
      )}
    </>
  )
}

/* ---------- B. Cover ---------- */
export function CoverFront({ featured, rest }: Props) {
  const first = rest.slice(0, 4)
  const second = rest.slice(4)
  return (
    <>
      <section className="pt-cv" aria-label="Cover story">
        <a className="pt-cv-art" href={href(featured)} tabIndex={-1} aria-hidden="true">
          {featured.image && <img src={featured.image} alt="" width={1600} height={900} fetchPriority="high" />}
        </a>
        <div className="pt-cv-text">
          <Kicker section={featured.section} />
          <h2><a href={href(featured)}>{featured.title}</a></h2>
          <p className="pt-cv-dek">{featured.subtitle || featured.excerpt}</p>
          <Byline article={featured} withAvatar={false} />
        </div>
      </section>
      <section className="pt-cv-wrap" aria-label="Stories">
        <h2 className="pt-cv-label">Latest</h2>
        <div className="pt-cv-grid is-4">
          {first.map(a => <CoverCard key={a.slug} a={a} />)}
        </div>
        {second.length > 0 && (
          <div className="pt-cv-grid is-3">
            {second.map(a => <CoverCard key={a.slug} a={a} />)}
          </div>
        )}
      </section>
    </>
  )
}

function CoverCard({ a }: { a: Article }) {
  return (
    <article className="pt-cv-card">
      <a className="pt-cv-card-art" href={href(a)} tabIndex={-1} aria-hidden="true">
        {a.image && <img src={a.image} alt="" width={800} height={450} loading="lazy" />}
      </a>
      <Kicker section={a.section} />
      <h3><a href={href(a)}>{a.title}</a></h3>
      <p>{a.excerpt}</p>
      <Byline article={a} withAvatar={false} withDate={false} />
    </article>
  )
}

/* ---------- C. Feature + list ---------- */
export function FeatureListFront({ featured, rest }: Props) {
  return (
    <>
      <section className="pt-fl-hero" aria-label="Featured story">
        <a className="pt-fl-art" href={href(featured)} tabIndex={-1} aria-hidden="true">
          {featured.image && <img src={featured.image} alt="" width={1600} height={900} fetchPriority="high" />}
        </a>
        <div className="pt-fl-text">
          <Kicker section={featured.section} />
          <h2><a href={href(featured)}>{featured.title}</a></h2>
          <p className="pt-fl-dek">{featured.subtitle || featured.excerpt}</p>
          <Byline article={featured} />
        </div>
      </section>
      <section className="pt-fl-list" aria-label="Latest">
        <h2 className="pt-fl-label">Latest</h2>
        <ol>
          {rest.map(a => (
            <li key={a.slug}>
              <time dateTime={a.datePublished} title={fmtDate(a.datePublished)}>{shortDate(a.datePublished)}</time>
              <div className="pt-fl-main">
                <h3><a href={href(a)}>{a.title}</a></h3>
                <p className="pt-fl-sub">{a.subtitle || a.excerpt}</p>
                <Byline article={a} withAvatar={false} withDate={false} />
              </div>
              <Kicker section={a.section} />
            </li>
          ))}
        </ol>
      </section>
    </>
  )
}

/* ---------- D. Current (live) ---------- */
export function CurrentFront({ featured, rest }: Props) {
  const rail = rest.slice(0, 4)
  const grid = rest.slice(4)
  return (
    <>
      <div className="pt-lead">
        <FeaturedStory article={featured} />
        <RailList title="Latest" articles={rail} />
      </div>
      {grid.length > 0 && (
        <SectionBlock title="More stories">
          <div className="pt-grid">{grid.map((a, i) => <ArticleCard key={a.slug} article={a} eager={i < 3} />)}</div>
        </SectionBlock>
      )}
    </>
  )
}

export const LAYOUTS = {
  a: { name: 'Broadsheet', after: 'The Atlantic, The Gospel Coalition', Front: BroadsheetFront },
  b: { name: 'Cover', after: 'The New Yorker, Aeon', Front: CoverFront },
  c: { name: 'Feature and list', after: 'Desiring God', Front: FeatureListFront },
  d: { name: 'Current', after: 'Plough (what is live now)', Front: CurrentFront },
} as const

export type LayoutKey = keyof typeof LAYOUTS
