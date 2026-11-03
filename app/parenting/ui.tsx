/* Server-renderable building blocks for the Parenting section. Anything that
   needs state (share buttons, forms) lives in client.tsx. */

import type { Article, Author, Section } from '@/lib/parenting'
import { fmtDate } from '@/lib/parenting'

export const SECTION_LABEL = 'Parenting'
export const SECTION_H1 = 'Raising Faithful Kids'
export const SECTION_SUB =
  'Real stories, thoughtful perspectives, and practical wisdom from Christian parents, educators, and ministry leaders.'

export function Masthead({ inner = false, current }: { inner?: boolean; current?: string }) {
  if (inner) {
    return (
      <div className="pt-mast is-inner">
        <p className="pt-mast-label">
          <a href="/">Faithful Kids</a>
          <span className="sep">/</span>
          <a href="/parenting" className={current ? undefined : 'here'}>{SECTION_LABEL}</a>
          {current && <><span className="sep">/</span><span className="here">{current}</span></>}
        </p>
      </div>
    )
  }
  return (
    <header className="pt-mast">
      <p className="pt-mast-label">
        <a href="/">Faithful Kids</a>
        <span className="sep">/</span>
        <span className="here">{SECTION_LABEL}</span>
      </p>
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

export function ContributeBand() {
  return (
    <section className="pt-band" aria-labelledby="pt-contribute">
      <div className="pt-band-inner">
        <div>
          <h2 id="pt-contribute">Have a story worth sharing?</h2>
          <p>
            Your experiences could help another Christian family. We&rsquo;re inviting parents, teachers,
            pastors, and educators to contribute to Faithful Kids.
          </p>
          <a className="pt-btn" href="/parenting/write-for-us">Write for Faithful Kids</a>
        </div>
        <div className="pt-discover">
          <a href="/parenting/write-for-us#pitch">Pitch a story<span>A few sentences is enough. No finished draft required.</span></a>
          <a href="/parenting/write-for-us#interview">Not much of a writer?<span>Tell us your story in an interview and we&rsquo;ll write it up with you.</span></a>
          <a href="/parenting/editorial-policy">How we edit<span>Real names, checked facts, corrections in the open.</span></a>
        </div>
      </div>
    </section>
  )
}

export function DiscoverBand() {
  return (
    <section className="pt-band is-paper" aria-labelledby="pt-discover">
      <div className="pt-band-inner">
        <div>
          <p className="pt-kicker">From Faithful Kids</p>
          <h2 id="pt-discover">Explore the Bible together</h2>
          <p>
            Faithful Kids is a Bible video app for children ages 5 to 15: more than 300 short lessons in order
            from Genesis to Revelation, each followed by a quiz and a reflection question. The free library
            below is for everyone, no account needed.
          </p>
          <a className="pt-btn is-ghost" href="/quiz">See how the app works</a>
        </div>
        <div className="pt-discover">
          <a href="/bible-stories-for-kids">200 free Bible stories for kids<span>Every story, Genesis to Revelation, with discussion questions and a video.</span></a>
          <a href="/printables">Free printables<span>Coloring pages, word searches, Bible maps, a Jesse tree, and more. No email wall.</span></a>
          <a href="/homeschool">Bible curriculum for homeschool families<span>Open-and-go lessons with a quiz after every story.</span></a>
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
