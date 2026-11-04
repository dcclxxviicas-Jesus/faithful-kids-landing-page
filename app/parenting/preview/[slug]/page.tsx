import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { SiteFooter } from '@/app/components/SiteChrome'
import { ParentingHeader } from '../../ui'
import { getArticle, getRelated, resourcesFor, fmtDate, articleUrl } from '@/lib/parenting'
import { hasAdminCookie } from '@/lib/parenting-admin-auth'
import { Kicker, Byline, AuthorCard, ArticleCard } from '../../ui'

/*
 * Draft preview. Renders ANY article on disk (draft, scheduled, sample or
 * published) for an editor holding the admin cookie, which /cas-admin/parenting
 * sets after the password check. Without the cookie the route 404s: it must
 * not reveal that a draft exists. Never indexed, never cached.
 */
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Preview',
  robots: { index: false, follow: false, nocache: true },
}

export default async function PreviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const jar = await cookies()
  if (!(await hasAdminCookie(jar.get('fk_admin')?.value))) notFound()
  const a = getArticle(slug)
  if (!a) notFound()
  const related = getRelated(a, 3, [])
  const resources = resourcesFor(a)
  return (
    <>
      <ParentingHeader />
      <div className="pt-sample" role="note">
        Preview &middot; status: <strong>{a.status}</strong> &middot; dates {a.datePublished}{a.dateModified !== a.datePublished ? ` / ${a.dateModified}` : ''} &middot; {a.wordCount} words &middot; not public
        {' '}&middot; <a href="/cas-admin/parenting" style={{ color: 'inherit' }}>back to the desk</a>
      </div>
      <main id="main-content">
        <nav className="pt-crumb" aria-label="Breadcrumb"><a href="/parenting">Parenting</a><span>/</span><span>{a.section.label}</span></nav>
        <header className="pt-article-head">
          <Kicker section={a.section} link={false} />
          <h1>{a.title}</h1>
          {a.subtitle && <p className="pt-dek">{a.subtitle}</p>}
          <Byline article={a} withDate={false} />
          <div className="pt-article-meta">
            <span>Would publish <time dateTime={a.datePublished}>{fmtDate(a.datePublished)}</time></span>
          </div>
          {a.type === 'opinion' && <p className="pt-opinion-note"><strong>Opinion.</strong> This essay is the author&rsquo;s own view.</p>}
        </header>
        {a.image ? (
          <figure className="pt-hero">
            <img src={a.image} alt={a.imageAlt} width={1600} height={900} />
            {(a.imageCaption || a.imageCredit) && <figcaption>{a.imageCaption} {a.imageCredit}</figcaption>}
          </figure>
        ) : (
          <p className="pt-draft-note" style={{ maxWidth: 680, margin: '20px auto 0' }}>No hero image yet. A public article needs one; it is also the social card.</p>
        )}
        <article className="pt-article">
          <div className="pt-prose" dangerouslySetInnerHTML={{ __html: a.contentHtml }} />
          {a.sources.length > 0 && (
            <section className="pt-sources"><h2>Sources</h2><ol>{a.sources.map(s => <li key={s.href}><a href={s.href}>{s.label}</a></li>)}</ol></section>
          )}
          {a.disclosure && <p className="pt-disclosure"><strong>Disclosure.</strong> {a.disclosure}</p>}
          <AuthorCard author={a.author} />
          {resources.length > 0 && (
            <section className="pt-resources"><h2>From Faithful Kids</h2><ul>{resources.map(r => <li key={r.href}><a href={r.href}>{r.label}</a></li>)}</ul></section>
          )}
        </article>
        {related.length > 0 && (
          <section className="pt-related"><h2>More from Parenting</h2><div className="pt-grid">{related.map(r => <ArticleCard key={r.slug} article={r} />)}</div></section>
        )}
        <div className="pt-back"><a href={articleUrl(a)}>Public URL once published: {articleUrl(a)}</a></div>
        <div className="pt-footgap" />
      </main>
      <SiteFooter />
    </>
  )
}
