import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SiteNav, SiteFooter } from '@/app/components/SiteChrome'
import {
  getPublicArticles, getPublicArticle, getSection, articlesInSection, liveSections, getRelated,
  resourcesFor, fmtDate, articleUrl, type Article, type Section,
} from '@/lib/parenting'
import {
  Masthead, SectionNav, Kicker, Byline, ArticleCard, AuthorCard, SampleRibbon, QuietStrip,
} from '../ui'
import { ShareRow } from '../client'

type Props = { params: Promise<{ slug: string }> }

/* One dynamic segment serves both /parenting/<section> and /parenting/<article>.
   Next cannot host two sibling dynamic routes, and article slugs are checked
   against the section names at load time, so the two can never collide. */
export async function generateStaticParams() {
  const articles = getPublicArticles()
  return [
    ...liveSections(articles).map(s => ({ slug: s.slug })),
    ...articles.map(a => ({ slug: a.slug })),
  ]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const section = getSection(slug)
  if (section) {
    const url = `https://faithfulkids.app/parenting/${section.slug}`
    return {
      title: { absolute: `${section.title}: Raising Faithful Kids` },
      description: section.description,
      alternates: { canonical: url },
      openGraph: { title: `${section.title} | Raising Faithful Kids`, description: section.description, url, siteName: 'Faithful Kids', type: 'website' },
    }
  }
  const a = getPublicArticle(slug)
  if (!a) return {}
  const url = articleUrl(a)
  return {
    title: { absolute: a.seoTitle },
    description: a.metaDescription,
    authors: [{ name: a.author.name, url: `https://faithfulkids.app/parenting/authors/${a.author.slug}` }],
    alternates: {
      canonical: a.canonical || url,
      types: { 'text/markdown': `${url}.md` },
    },
    // Explicit on purpose: `robots: undefined` here dropped the root layout's robots meta
    // from every article (verified live Nov 3, 2026), and Google Discover needs max-image-preview:large.
    robots: a.isSample ? { index: false, follow: false } : { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 } },
    openGraph: {
      type: 'article',
      title: a.title,
      description: a.metaDescription,
      url,
      siteName: 'Faithful Kids',
      publishedTime: `${a.datePublished}T00:00:00Z`,
      modifiedTime: `${a.dateModified}T00:00:00Z`,
      section: a.section.label,
      tags: a.tags,
      authors: [`https://faithfulkids.app/parenting/authors/${a.author.slug}`],
      images: a.image ? [{ url: a.image, alt: a.imageAlt }] : undefined,
    },
    twitter: { card: 'summary_large_image', title: a.title, description: a.metaDescription, images: a.image ? [a.image] : undefined },
  }
}

export default async function ParentingSlugPage({ params }: Props) {
  const { slug } = await params
  const section = getSection(slug)
  if (section) return <SectionPage section={section} />
  const article = getPublicArticle(slug)
  if (!article) notFound()
  return <ArticlePage article={article} />
}

/* ------------------------------------------------------------ section */

function SectionPage({ section }: { section: Section }) {
  const all = getPublicArticles()
  const items = articlesInSection(section, all)
  if (items.length === 0) notFound()
  const url = `https://faithfulkids.app/parenting/${section.slug}`
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: section.title,
    url,
    description: section.description,
    isPartOf: { '@type': 'CollectionPage', name: 'Raising Faithful Kids', url: 'https://faithfulkids.app/parenting' },
    hasPart: items.filter(a => !a.isSample).map(a => ({ '@type': section.schemaType, headline: a.title, url: articleUrl(a), datePublished: a.datePublished })),
  }
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://faithfulkids.app' },
      { '@type': 'ListItem', position: 2, name: 'Parenting', item: 'https://faithfulkids.app/parenting' },
      { '@type': 'ListItem', position: 3, name: section.label },
    ],
  }
  const [lead, ...rest] = items
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <SiteNav active="parenting" />
      <main id="main-content">
        <Masthead inner current={section.label} />
        <div className="pt-page" style={{ textAlign: 'center', paddingBottom: 0 }}>
          <h1>{section.title}</h1>
          <p className="pt-lede" style={{ marginBottom: 10 }}>{section.intro}</p>
        </div>
        <SectionNav sections={liveSections(all)} current={section.slug} />
        <section className="pt-section">
          <div className="pt-grid">
            <ArticleCard article={lead} eager />
            {rest.map(a => <ArticleCard key={a.slug} article={a} />)}
          </div>
        </section>
        <QuietStrip source={`section:${section.slug}`} />
        <div className="pt-footgap" />
      </main>
      <SiteFooter />
    </>
  )
}

/* ------------------------------------------------------------ article */

function ArticlePage({ article: a }: { article: Article }) {
  const url = articleUrl(a)
  const related = getRelated(a)
  const resources = resourcesFor(a)
  const personId = a.author.personId

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': a.section.schemaType,
    '@id': `${url}#article`,
    headline: a.title,
    alternativeHeadline: a.subtitle || undefined,
    description: a.metaDescription,
    url,
    mainEntityOfPage: url,
    image: a.image || undefined,
    datePublished: `${a.datePublished}T00:00:00Z`,
    dateModified: `${a.dateModified}T00:00:00Z`,
    articleSection: a.section.label,
    keywords: a.tags.join(', '),
    wordCount: a.wordCount,
    inLanguage: 'en-US',
    isAccessibleForFree: true,
    author: {
      '@type': 'Person',
      '@id': personId,
      name: a.author.name,
      url: `https://faithfulkids.app/parenting/authors/${a.author.slug}`,
      ...(a.author.role ? { jobTitle: a.author.role } : {}),
      ...(a.author.sameAs.length ? { sameAs: a.author.sameAs } : {}),
    },
    publisher: { '@type': 'Organization', '@id': 'https://faithfulkids.app/#organization', name: 'Faithful Kids', logo: { '@type': 'ImageObject', url: 'https://faithfulkids.app/logo-sm.png' } },
    isPartOf: { '@type': 'CollectionPage', name: 'Raising Faithful Kids', url: 'https://faithfulkids.app/parenting' },
    ...(a.sources.length ? { citation: a.sources.map(s => s.href) } : {}),
  }
  if (a.type === 'interview' && a.interviewee) jsonLd.about = { '@type': 'Person', name: a.interviewee.split(',')[0].trim() }
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://faithfulkids.app' },
      { '@type': 'ListItem', position: 2, name: 'Parenting', item: 'https://faithfulkids.app/parenting' },
      { '@type': 'ListItem', position: 3, name: a.section.label, item: `https://faithfulkids.app/parenting/${a.section.slug}` },
      { '@type': 'ListItem', position: 4, name: a.title },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <SiteNav active="parenting" />
      <SampleRibbon article={a} />
      <main id="main-content">
        <nav className="pt-crumb" aria-label="Breadcrumb">
          <a href="/parenting">Parenting</a><span>/</span>
          <a href={`/parenting/${a.section.slug}`}>{a.section.label}</a>
        </nav>

        <header className="pt-article-head">
          <Kicker section={a.section} />
          <h1>{a.title}</h1>
          {a.subtitle && <p className="pt-dek">{a.subtitle}</p>}
          <Byline article={a} withDate={false} />
          <div className="pt-article-meta">
            <span>Published <time dateTime={a.datePublished}>{fmtDate(a.datePublished)}</time></span>
            {a.dateModified !== a.datePublished && <><span>&middot;</span><span>Updated <time dateTime={a.dateModified}>{fmtDate(a.dateModified)}</time></span></>}
            {a.interviewee && <><span>&middot;</span><span>With {a.interviewee}</span></>}
          </div>
          {a.type === 'opinion' && (
            <p className="pt-opinion-note">Opinion. The author&rsquo;s own view, not the position of Faithful Kids.</p>
          )}
        </header>

        {a.image && (
          <figure className="pt-hero">
            <img src={a.image} alt={a.imageAlt} width={1600} height={900} fetchPriority="high" />
            {(a.imageCaption || a.imageCredit) && (
              <figcaption>
                {a.imageCaption}{a.imageCaption && a.imageCredit ? ' ' : ''}
                {a.imageCredit && (a.imageCreditUrl ? <a href={a.imageCreditUrl} rel="noopener nofollow" target="_blank">{a.imageCredit}</a> : a.imageCredit)}
              </figcaption>
            )}
          </figure>
        )}

        <article className="pt-article">
          <div className="pt-prose" dangerouslySetInnerHTML={{ __html: a.contentHtml }} />

          {a.sources.length > 0 && (
            <section className="pt-sources" aria-label="Sources">
              <h2>Sources</h2>
              <ol>
                {a.sources.map(s => <li key={s.href}><a href={s.href} rel="noopener" target="_blank">{s.label}</a></li>)}
              </ol>
            </section>
          )}
          {a.disclosure && <p className="pt-disclosure"><strong>Disclosure.</strong> {a.disclosure}</p>}

          <ShareRow url={url} title={a.title} />
          <AuthorCard author={a.author} />

          {resources.length > 0 && (
            <section className="pt-resources" aria-label="Related Faithful Kids resources">
              <h2>From Faithful Kids</h2>
              <ul>
                {resources.map(r => <li key={r.href}><a href={r.href}>{r.label}</a></li>)}
              </ul>
              <p>Faithful Kids publishes this section. Our free Bible stories and printables need no account.</p>
            </section>
          )}
        </article>

        {related.length > 0 && (
          <section className="pt-related" aria-label="Related articles">
            <h2>More from Parenting</h2>
            <div className="pt-grid">
              {related.map(r => <ArticleCard key={r.slug} article={r} />)}
            </div>
          </section>
        )}

        <QuietStrip source={`article:${a.slug}`} />
        <div className="pt-back"><a href="/parenting">&larr; Back to Parenting</a></div>
        <div className="pt-footgap" />
      </main>
      <SiteFooter />
    </>
  )
}
