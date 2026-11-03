import type { Metadata } from 'next'
import { SiteNav, SiteFooter } from '@/app/components/SiteChrome'
import {
  getPublicArticles, getFeatured, liveSections, articlesInSection, SECTIONS,
} from '@/lib/parenting'
import {
  Masthead, SectionNav, FeaturedStory, ArticleCard, SectionBlock, ContributeBand, DiscoverBand,
  EmptyState, SECTION_H1, SECTION_SUB,
} from './ui'
import { NewsletterCard } from './client'

const URL = 'https://faithfulkids.app/parenting'

export const metadata: Metadata = {
  title: { absolute: 'Raising Faithful Kids: Christian Parenting Stories & Perspectives' },
  description: SECTION_SUB,
  alternates: { canonical: URL },
  openGraph: {
    title: 'Raising Faithful Kids',
    description: SECTION_SUB,
    url: URL,
    siteName: 'Faithful Kids',
    type: 'website',
    images: [{ url: 'https://d3g07v1w0lehiv.cloudfront.net/home/hero-parents-1536.webp', width: 1536, height: 1024, alt: 'A family kitchen table with an open Bible' }],
  },
  twitter: { card: 'summary_large_image', title: 'Raising Faithful Kids', description: SECTION_SUB },
}

export default function ParentingHome() {
  const articles = getPublicArticles()
  const featured = getFeatured(articles)
  const sections = liveSections(articles)
  const latest = articles.filter(a => a.slug !== featured?.slug).slice(0, 6)

  /* Category rows only where a section has something beyond what the page
     already showed. Empty modules are the fastest way to look abandoned. */
  const shown = new Set([featured?.slug, ...latest.map(a => a.slug)])
  const rows = SECTIONS.map(s => ({ s, items: articlesInSection(s, articles).filter(a => !shown.has(a.slug)).slice(0, 3) }))
    .filter(r => r.items.length >= 2)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${URL}#page`,
    name: SECTION_H1,
    alternateName: 'Parenting at Faithful Kids',
    url: URL,
    description: SECTION_SUB,
    isPartOf: { '@type': 'WebSite', name: 'Faithful Kids', url: 'https://faithfulkids.app' },
    publisher: { '@type': 'Organization', '@id': 'https://faithfulkids.app/#organization' },
    hasPart: articles.filter(a => !a.isSample).slice(0, 20).map(a => ({
      '@type': 'Article', headline: a.title, url: `${URL}/${a.slug}`, datePublished: a.datePublished,
      author: { '@type': 'Person', name: a.author.name, url: `${URL}/authors/${a.author.slug}` },
    })),
  }
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://faithfulkids.app' },
      { '@type': 'ListItem', position: 2, name: 'Parenting' },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <SiteNav active="parenting" />
      <main id="main-content">
        <Masthead />
        <SectionNav sections={sections} current="latest" />

        {featured ? (
          <>
            <FeaturedStory article={featured} />
            {latest.length > 0 && (
              <SectionBlock title="Latest">
                <div className="pt-grid">
                  {latest.map((a, i) => <ArticleCard key={a.slug} article={a} eager={i < 3} />)}
                </div>
              </SectionBlock>
            )}
            {rows.map(({ s, items }) => (
              <SectionBlock key={s.slug} title={s.title} href={`/parenting/${s.slug}`} hrefLabel={`All ${s.label.toLowerCase()}`}>
                <div className="pt-grid">
                  {items.map(a => <ArticleCard key={a.slug} article={a} />)}
                </div>
              </SectionBlock>
            ))}
          </>
        ) : (
          <EmptyState
            title="The first stories are on their way."
            body="Parenting at Faithful Kids publishes real stories, interviews, reporting and research from Christian parents, educators and ministry leaders. If you have one to tell, we would like to read it."
          />
        )}

        <ContributeBand />

        <section className="pt-section" aria-label="Newsletter">
          <div className="pt-grid is-2" style={{ alignItems: 'center' }}>
            <div>
              <p className="pt-kicker">Faithful Kids Weekly</p>
              <h2 className="pt-serif" style={{ fontWeight: 600, fontSize: 'clamp(1.7rem, 3.2vw, 2.3rem)', lineHeight: 1.12, margin: '8px 0 12px', letterSpacing: '-0.015em' }}>
                A weekly letter for parents who want faith to stick.
              </h2>
              <p style={{ color: 'var(--pt-ink-soft)', fontWeight: 600, lineHeight: 1.65, margin: 0, maxWidth: '34em' }}>
                The best piece from this section, one practical family activity, one thing worth knowing, and one
                Bible lesson to explore together. Written for grown-ups, sent once a week.
              </p>
            </div>
            <NewsletterCard source="parenting-home" compact />
          </div>
        </section>

        <DiscoverBand />
        <div className="pt-footgap" />
      </main>
      <SiteFooter />
    </>
  )
}
