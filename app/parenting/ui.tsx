/* Server-renderable building blocks for the Parenting section. Anything that
   needs state (share buttons, forms) lives in client.tsx. */

import type { Article, Author, Section } from '@/lib/parenting'
import { fmtDate } from '@/lib/parenting'
import { NewsletterInline } from './client'

export const SECTION_LABEL = 'Parenting'
export const SECTION_H1 = 'Raising Faithful Kids'
export const SECTION_SUB =
  'Real stories, thoughtful perspectives, and practical wisdom from Christian parents, educators, and ministry leaders.'

/**
 * The section's own header: one centred wordmark linking to the homepage.
 * Parenting pages do not render the site nav (owner decision, Nov 3, 2026):
 * a news section reads as a news section when the only thing above the
 * masthead is the publisher's name. Sign-in and the app live in the footer.
 */
export function ParentingHeader() {
  return (
    <header className="pt-top">
      <a href="/" className="pt-top-logo" aria-label="Faithful Kids home">
        <img src="/logo-sm.png" alt="" width={32} height={32} />
        <span>Faithful Kids</span>
      </a>
    </header>
  )
}

export function Masthead({ inner = false }: { inner?: boolean; current?: string }) {
  if (inner) {
    return (
      <div className="pt-mast is-inner">
        <p className="pt-mast-label"><a href="/parenting">{SECTION_H1}</a></p>
      </div>
    )
  }
  return (
    <header className="pt-mast">
      <h1>{SECTION_H1}</h1>
      <p className="pt-mast-sub">{SECTION_SUB}</p>
      <div className="pt-mast-rule" aria-hidden="true" />
    </header>
  )
}

export function SectionNav({ sections, current }: { sections: Section[]; current?: string }) {
  if (sections.length === 0) return null
  return (
    <nav className="pt-secnav" aria-label="Parenting sections">
      <ul>
        <li><a href="/parenting" aria-current={current === 'latest' ? 'page' : undefined}>Latest</a></li>
        {sections.map(s => (
          <li key={s.slug}>
            <a href={`/parenting/${s.slug}`} aria-current={current === s.slug ? 'page' : undefined}>{s.label}</a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export function Kicker({ section, link = true }: { section: Section; link?: boolean }) {
  const cls = `pt-kicker is-${section.type}`
  return link ? <a className={cls} href={`/parenting/${section.slug}`}>{section.label}</a> : <span className={cls}>{section.label}</span>
}

export function Avatar({ author, size }: { author: Author; size?: 'lg' | 'xl' }) {
  const cls = `pt-avatar${size ? ` is-${size}` : ''}`
  if (author.photo) return <img className={cls} src={author.photo} alt="" width={size === 'xl' ? 112 : size === 'lg' ? 64 : 34} height={size === 'xl' ? 112 : size === 'lg' ? 64 : 34} loading="lazy" />
  const initials = author.name.split(/\s+/).map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()
  return <span className={cls} aria-hidden="true">{initials}</span>
}

export function Byline({ article, withDate = true, withAvatar = true }: { article: Article; withDate?: boolean; withAvatar?: boolean }) {
  const a = article.author
  return (
    <div className="pt-byline">
      {withAvatar && <Avatar author={a} />}
      <span>By <a href={`/parenting/authors/${a.slug}`}>{a.name}</a></span>
      {withDate && <><span className="dot">&middot;</span><time dateTime={article.datePublished}>{fmtDate(article.datePublished)}</time></>}
      <span className="dot">&middot;</span>
      <span>{article.readingMinutes} min read</span>
    </div>
  )
}

export function ArticleCard({ article, row = false, eager = false }: { article: Article; row?: boolean; eager?: boolean }) {
  const href = `/parenting/${article.slug}`
  return (
    <article className={`pt-card${row ? ' is-row' : ''}`}>
      {article.image && (
        <a className="pt-card-art" href={href} tabIndex={-1} aria-hidden="true">
          <img src={article.image} alt="" width={1200} height={800} loading={eager ? 'eager' : 'lazy'} />
        </a>
      )}
      <Kicker section={article.section} />
      <h3><a href={href}>{article.title}</a></h3>
      {!row && <p>{article.excerpt}</p>}
      <Byline article={article} withAvatar={false} />
    </article>
  )
}

export function FeaturedStory({ article }: { article: Article }) {
  const href = `/parenting/${article.slug}`
  return (
    <section className="pt-featured" aria-label="Featured story">
      <a className="pt-featured-art" href={href} tabIndex={-1} aria-hidden="true">
        {article.image && <img src={article.image} alt="" width={1600} height={1067} fetchPriority="high" />}
      </a>
      <div>
        <Kicker section={article.section} />
        <h2><a href={href}>{article.title}</a></h2>
        {article.subtitle ? <p className="pt-featured-dek">{article.subtitle}</p> : <p className="pt-featured-dek">{article.excerpt}</p>}
        <Byline article={article} />
      </div>
    </section>
  )
}

export function SectionBlock({ title, href, hrefLabel = 'See all', children }: { title: string; href?: string; hrefLabel?: string; children: React.ReactNode }) {
  return (
    <section className="pt-section">
      <div className="pt-section-head">
        <h2>{title}</h2>
        {href && <a href={href}>{hrefLabel} &rarr;</a>}
      </div>
      {children}
    </section>
  )
}

/* Headline-only list for the rail beside the lead story: kicker, title,
   byline. No images, so five stories fit in the height of one. */
export function RailList({ title, articles }: { title: string; articles: Article[] }) {
  if (articles.length === 0) return null
  return (
    <aside className="pt-rail" aria-label={title}>
      <h2>{title}</h2>
      <ol>
        {articles.map(a => (
          <li key={a.slug}>
            <Kicker section={a.section} />
            <h3><a href={`/parenting/${a.slug}`}>{a.title}</a></h3>
            <Byline article={a} withAvatar={false} />
          </li>
        ))}
      </ol>
    </aside>
  )
}

/* The one place the section asks for anything: a hairline strip at the foot
   of a page with the newsletter field on one side and a sentence about
   writing for us on the other. Small type, no headline, no card stack. The
   app pitch is deliberately absent; the nav, footer and each article's
   resource links already carry it. */
export function QuietStrip({ source }: { source: string }) {
  return (
    <section className="pt-strip" id="newsletter" aria-label="Newsletter and contributing">
      <div className="pt-strip-inner">
        <div className="pt-strip-news">
          <p className="pt-strip-label">Faithful Kids Weekly</p>
          <p className="pt-strip-text">One email a week for parents: the best piece from this section and one Bible lesson to explore together. Adults only, confirmed by email, one-click unsubscribe.</p>
          <NewsletterInline source={source} />
        </div>
        <div className="pt-strip-write">
          <p className="pt-strip-label">Write for us</p>
          <p className="pt-strip-text">
            This section is written by parents, teachers, pastors and educators. If you have a story worth telling,
            a few sentences is enough to start. <a href="/parenting/write-for-us">Pitch a story</a> or read
            <a href="/parenting/editorial-policy"> how we edit</a>.
          </p>
        </div>
      </div>
    </section>
  )
}

export function SampleRibbon({ article }: { article?: Article }) {
  if (!article?.isSample) return null
  return (
    <div className="pt-sample" role="note">
      Sample article for layout testing. Not a real contributor, not a real story. This page never appears in production.
    </div>
  )
}

export function AuthorCard({ author }: { author: Author }) {
  return (
    <aside className="pt-author-card" aria-label="About the author">
      <Avatar author={author} size="lg" />
      <div>
        <h3><a href={`/parenting/authors/${author.slug}`}>{author.name}</a></h3>
        {author.role && <p className="role">{author.role}{author.affiliation ? `, ${author.affiliation}` : ''}</p>}
        <div className="bio" dangerouslySetInnerHTML={{ __html: author.bioHtml }} />
        <a className="more" href={`/parenting/authors/${author.slug}`}>More from {author.name.split(' ')[0]} &rarr;</a>
      </div>
    </aside>
  )
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="pt-empty">
      <h2>{title}</h2>
      <p>{body}</p>
      <a className="pt-btn is-sm" href="/parenting/write-for-us">Write for Faithful Kids</a>
    </div>
  )
}
