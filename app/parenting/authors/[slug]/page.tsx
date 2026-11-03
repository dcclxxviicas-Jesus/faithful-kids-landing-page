import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SiteNav, SiteFooter } from '@/app/components/SiteChrome'
import { getPublicAuthors, getAuthor, articlesByAuthor, isPublic } from '@/lib/parenting'
import { Masthead, Avatar, ArticleCard, QuietStrip } from '../../ui'

type Props = { params: Promise<{ slug: string }> }

/* Only authors with at least one public article get a page. */
export async function generateStaticParams() {
  return getPublicAuthors().map(a => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const a = getAuthor(slug)
  if (!a || a.hidden) return {}
  const url = `https://faithfulkids.app/parenting/authors/${a.slug}`
  const desc = a.bioText.slice(0, 155)
  const hasSampleOnly = articlesByAuthor(a.slug).every(p => p.isSample)
  return {
    title: { absolute: `${a.name}${a.role ? `: ${a.role}` : ''} | Parenting at Faithful Kids` },
    description: desc,
    alternates: { canonical: url },
    robots: hasSampleOnly ? { index: false, follow: false } : undefined,
    openGraph: { type: 'profile', title: a.name, description: desc, url, siteName: 'Faithful Kids', images: a.photo ? [{ url: a.photo }] : undefined },
  }
}

export default async function AuthorPage({ params }: Props) {
  const { slug } = await params
  const a = getAuthor(slug)
  if (!a || a.hidden) notFound()
  const articles = articlesByAuthor(a.slug).filter(isPublic)
  if (articles.length === 0) notFound()
  const url = `https://faithfulkids.app/parenting/authors/${a.slug}`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url,
    mainEntity: {
      '@type': 'Person',
      '@id': a.personId,
      name: a.name,
      url,
      ...(a.role ? { jobTitle: a.role } : {}),
      ...(a.affiliation ? { affiliation: { '@type': 'Organization', name: a.affiliation } } : {}),
      ...(a.photo ? { image: a.photo } : {}),
      description: a.bioText,
      ...(a.sameAs.length ? { sameAs: a.sameAs } : {}),
    },
    hasPart: articles.filter(p => !p.isSample).map(p => ({ '@type': 'Article', headline: p.title, url: `https://faithfulkids.app/parenting/${p.slug}`, datePublished: p.datePublished })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteNav active="parenting" />
      <main id="main-content">
        <Masthead inner current="Contributors" />
        <section className="pt-profile">
          <Avatar author={a} size="xl" />
          <div>
            <h1>{a.name}</h1>
            {(a.role || a.affiliation) && <p className="role">{[a.role, a.affiliation].filter(Boolean).join(', ')}</p>}
            <div className="bio" dangerouslySetInnerHTML={{ __html: a.bioHtml }} />
            {(a.website || a.links.length > 0) && (
              <div className="pt-profile-links">
                {a.website && <a href={a.website} rel="noopener" target="_blank">Website</a>}
                {a.links.map(l => <a key={l.href} href={l.href} rel="noopener" target="_blank">{l.label}</a>)}
              </div>
            )}
            {a.pseudonym && <p className="note">{a.name} is a pen name. The editor has verified the writer&rsquo;s identity, which is withheld for privacy reasons the writer explained to us.</p>}
            {a.disclosure && <p className="note"><strong>Disclosure.</strong> {a.disclosure}</p>}
          </div>
        </section>

        <section className="pt-section">
          <div className="pt-section-head"><h2>By {a.name}</h2></div>
          <div className="pt-grid">
            {articles.map((p, i) => <ArticleCard key={p.slug} article={p} eager={i < 3} />)}
          </div>
        </section>

        <QuietStrip source={`author:${a.slug}`} />
        <div className="pt-footgap" />
      </main>
      <SiteFooter />
    </>
  )
}
