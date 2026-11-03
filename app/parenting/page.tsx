import type { Metadata } from 'next'
import { SiteNav, SiteFooter } from '@/app/components/SiteChrome'
import { getPublicArticles, getFeatured, liveSections } from '@/lib/parenting'
import {
  Masthead, SectionNav, FeaturedStory, ArticleCard, SectionBlock, RailList, QuietStrip,
  EmptyState, SECTION_H1, SECTION_SUB,
} from './ui'

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
  /* Newspaper front: one lead story, a headline-only rail of the next four,
     then every remaining story with its picture. Nothing is held back; when
     the library outgrows one grid, split it into section rows here. */
  const rest = articles.filter(a => a.slug !== featured?.slug)
  const rail = rest.slice(0, 4)
  const grid = rest.slice(4)

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
            <div className="pt-lead">
              <FeaturedStory article={featured} />
              <RailList title="Latest" articles={rail} />
            </div>
            {grid.length > 0 && (
              <SectionBlock title="More stories">
                <div className="pt-grid">
                  {grid.map((a, i) => <ArticleCard key={a.slug} article={a} eager={i < 3} />)}
                </div>
              </SectionBlock>
            )}
          </>
        ) : (
          <EmptyState
            title="The first stories are on their way."
            body="Parenting at Faithful Kids publishes real stories, interviews, reporting and research from Christian parents, educators and ministry leaders. If you have one to tell, we would like to read it."
          />
        )}

        <QuietStrip source="parenting-home" />
        <div className="pt-footgap" />
      </main>
      <SiteFooter />
    </>
  )
}
