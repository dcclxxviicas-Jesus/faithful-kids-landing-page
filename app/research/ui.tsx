import type { Metadata } from 'next'
import { SiteNav, SiteFooter } from '@/app/components/SiteChrome'
import { V2Shell } from '@/app/v2-shell'

/* Shared furniture for the /research studies. Numbers never live here or in a
   page's prose as literals: every page reads its lib/research/<study>.json. */

export const CDN = 'https://d3g07v1w0lehiv.cloudfront.net'
export const fmt = (n: number) => n.toLocaleString('en-US')
export const pctOf = (a: number, b: number) => (b ? (100 * a) / b : 0)
export const rd = (x: number) => Math.round(x)

export type Study = {
  path: string; title: string; h1: string; description: string; updated: string; updatedIso: string
  dataLabel: string; temporal: string; datasetName: string; datasetDescription: string; measured: string[]; art: string; artAlt: string
}

export function studyMetadata(s: Study): Metadata {
  const url = `https://faithfulkids.app${s.path}`
  return {
    title: s.title, description: s.description, alternates: { canonical: url },
    openGraph: { title: s.h1, description: s.description, url, siteName: 'Faithful Kids', type: 'article', modifiedTime: s.updatedIso, publishedTime: s.updatedIso, images: [{ url: s.art, alt: s.artAlt }] },
    twitter: { card: 'summary_large_image', title: s.title, description: s.description, images: [s.art] },
  }
}

function schema(s: Study) {
  const url = `https://faithfulkids.app${s.path}`
  const org = { '@type': 'Organization', name: 'Faithful Kids', url: 'https://faithfulkids.app' }
  return [
    { '@context': 'https://schema.org', '@type': 'Article', headline: s.h1, description: s.description, url, mainEntityOfPage: url, datePublished: s.updatedIso, dateModified: s.updatedIso, image: s.art, author: org, publisher: { ...org, logo: { '@type': 'ImageObject', url: 'https://faithfulkids.app/logo-sm.png' } }, isBasedOn: `${url}#dataset`, inLanguage: 'en' },
    { '@context': 'https://schema.org', '@type': 'Dataset', '@id': `${url}#dataset`, name: s.datasetName, description: s.datasetDescription, url, creator: org, temporalCoverage: s.temporal, dateModified: s.updatedIso, variableMeasured: s.measured, isAccessibleForFree: true, license: 'https://creativecommons.org/licenses/by/4.0/' },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Faithful Kids', item: 'https://faithfulkids.app' },
      { '@type': 'ListItem', position: 2, name: 'Research', item: 'https://faithfulkids.app/research' },
      { '@type': 'ListItem', position: 3, name: s.datasetName, item: url },
    ] },
  ]
}

export function StudyPage({ s, lede, cap, stats, children }: {
  s: Study; lede: React.ReactNode; cap: React.ReactNode; stats: { value: string; label: string }[]; children: React.ReactNode
}) {
  return (
    <V2Shell>
      <div className="rs">
        <SiteNav />
        {schema(s).map((b, i) => <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(b) }} />)}
        <main id="main-content">
          <header className="rs-hero">
            <div className="rs-hero-inner">
              <div>
                <p className="rs-crumb"><a href="/research">Research</a> / {s.datasetName}</p>
                <p className="hv-eyebrow">Original research</p>
                <h1>{s.h1}</h1>
                <p className="rs-updated"><span>Last updated: <b>{s.updated}</b></span><span>Data: {s.dataLabel}</span></p>
                <p className="rs-lede">{lede}</p>
                <div className="rs-ctas"><a className="rs-link" href="#findings">Read the findings</a><a className="rs-link" href="#method">How it was measured</a></div>
              </div>
              <figure className="rs-hero-art"><img src={s.art} alt={s.artAlt} width={1536} height={1024} fetchPriority="high" /><figcaption>{cap}</figcaption></figure>
            </div>
            <div className="rs-stats" aria-label="Headline numbers">
              {stats.map(x => <div className="rs-stat" key={x.label}><b>{x.value}</b><span>{x.label}</span></div>)}
            </div>
          </header>
          {children}
          <section className="rs-band">
            <h2>Get started with Faithful Kids</h2>
            <p>Short Bible story videos for kids, Genesis to Revelation, each with a quiz and a reflection.</p>
            <a className="hv-cta" href="/quiz" data-testid="rs-cta"><span className="hv-cta-play" aria-hidden="true" />Get started</a>
          </section>
          <section className="v2-section" style={{ paddingTop: 36, paddingBottom: 44 }}>
            <p className="rs-soft">Part of <a href="/research">Faithful Kids Research</a>, which studies how people actually learn the Bible. Figures may be reused with attribution (CC BY 4.0). Questions or corrections: <a href="mailto:christian@faithfulkids.app">christian@faithfulkids.app</a>.</p>
          </section>
        </main>
        <SiteFooter />
      </div>
    </V2Shell>
  )
}

export function Honest({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="v2-section" style={{ paddingBottom: 20 }}><div className="rs-honest"><div className="rs-ico" aria-hidden="true">🔍</div><div><h2>{title}</h2>{children}</div></div></section>
}

export function Finding({ num, title, intro, id, alt, children }: { num: string; title: string; intro: React.ReactNode; id?: string; alt?: 'is-alt' | 'is-sky'; children: React.ReactNode }) {
  return (
    <section className={`v2-section ${alt ?? ''}`} id={id}>
      <div className="rs-finding-head"><span className="rs-num">{num}</span><h2>{title}</h2><p>{intro}</p></div>
      {children}
    </section>
  )
}

export type Row = { label: string; sub?: string; pct: number; n?: number }

/* neutral: the bar is a share of an audience, not a score, so it stays one
   colour rather than reading as right or wrong. */
export function Bars({ title, sub, rows, neutral = false }: { title: string; sub?: string; rows: Row[]; neutral?: boolean }) {
  const summary = rows.map(r => `${r.label}: ${rd(r.pct)}%${r.n ? ` of ${fmt(r.n)}` : ''}`).join('; ')
  const cls = (p: number) => neutral ? 'rs-fill' : p < 25 ? 'rs-fill is-low' : p < 50 ? 'rs-fill is-mid' : 'rs-fill'
  return (
    <figure className="rs-chart" role="img" aria-label={`${title}. ${summary}.`}>
      <figcaption><p className="rs-chart-title">{title}</p>{sub && <p className="rs-chart-sub">{sub}</p>}</figcaption>
      <div aria-hidden="true">
        {rows.map(r => (
          <div className="rs-row" key={r.label}>
            <div className="rs-row-q">{r.label}{r.sub && <small>{r.sub}</small>}</div>
            <div className="rs-track"><i className={cls(r.pct)} style={{ width: `${r.pct}%` }} />{r.pct >= 80
              ? <span className="rs-pct is-in" style={{ right: `${100 - r.pct}%` }}>{rd(r.pct)}%</span>
              : <span className="rs-pct" style={{ left: `${r.pct}%` }}>{rd(r.pct)}%</span>}</div>
          </div>
        ))}
      </div>
    </figure>
  )
}

export function Method({ cards }: { cards: { h: string; p: React.ReactNode }[] }) {
  return (
    <section className="v2-section is-alt" id="method">
      <div className="rs-finding-head"><span className="rs-num">Method</span><h2>How this was measured</h2><p>Written so a journalist, a pastor or a statistics teacher can check it.</p></div>
      <div className="rs-method">{cards.map(c => <div className="v2-card" key={c.h}><h3>{c.h}</h3><p>{c.p}</p></div>)}</div>
    </section>
  )
}

export function Takeaways({ items }: { items: React.ReactNode[] }) {
  return (
    <section className="v2-section is-sky">
      <div className="rs-finding-head"><span className="rs-num">For teaching</span><h2>What this suggests, and what it does not prove</h2></div>
      <ul className="rs-take">{items.map((x, i) => <li key={i}>{x}</li>)}</ul>
    </section>
  )
}
