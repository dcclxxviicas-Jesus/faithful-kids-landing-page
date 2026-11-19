import { getPostBySlug } from '@/lib/blog'

/*
 * "More guides" on the app directories, in the same card grid the blog uses
 * for Related Guides (globals.css .blog-related / .blog-card-compact), so a
 * set of links looks the same everywhere on the site.
 * An item is a blog slug or a site page with its own image and copy.
 */

const CDN = 'https://d3g07v1w0lehiv.cloudfront.net'

export type GuideItem =
  | { slug: string; badge?: string }
  | { href: string; title: string; desc: string; img: string; badge: string }

export function RelatedGuides({ title = 'More Guides', items }: { title?: string; items: GuideItem[] }) {
  const cards = items.map(it => {
    if ('slug' in it) {
      const p = getPostBySlug(it.slug)
      if (!p) return null
      return { href: `/blog/${p.slug}`, title: p.title.split(':')[0].replace(/\s*\(\d{4}\)\s*$/, ''), desc: p.metaDescription, img: `${CDN}/blog-images/${p.slug}-hero.webp?v=3`, badge: it.badge || 'Guide' }
    }
    return it
  }).filter((c): c is { href: string; title: string; desc: string; img: string; badge: string } => Boolean(c))

  return (
    <section className="blog-related" style={{ borderTop: 0, padding: '48px 0 20px' }}>
      <h2>{title}</h2>
      <div className="blog-related-grid">
        {cards.map(c => (
          <a key={c.href} href={c.href} className="blog-card blog-card-compact">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={c.img} alt={c.title} width={1792} height={1024} loading="lazy"
              style={{ width: '100%', height: 'auto', aspectRatio: '16 / 9', objectFit: 'cover', borderRadius: '12px 12px 0 0' }} />
            <div className="blog-card-header"><span className="blog-card-badge">{c.badge}</span></div>
            <h3 className="blog-card-title">{c.title}</h3>
            <p className="blog-card-desc">{c.desc}</p>
            <span className="blog-card-link">Read more &rarr;</span>
          </a>
        ))}
      </div>
    </section>
  )
}

export const KIDS_HUB: GuideItem = {
  href: '/christian-apps', badge: 'Directory', title: 'The Best Christian Apps for Kids',
  desc: 'More than 50 Christian apps for kids compared on price, ages, ads and updates.',
  img: `${CDN}/app-icons/og-christian-apps.png`,
}
export const CATHOLIC_HUB: GuideItem = {
  href: '/best-catholic-apps', badge: 'Directory', title: 'The Best Catholic Apps',
  desc: 'Catholic apps for daily readings, the Hours, the Rosary, Bible study and kids, each checked on its store.',
  img: `${CDN}/app-icons/og-best-catholic-apps.png`,
}
export const ADULTS_HUB: GuideItem = {
  href: '/best-christian-apps', badge: 'Directory', title: 'The Best Christian Apps',
  desc: 'Bible, prayer, study, worship and Catholic apps for adults, each checked on its store.',
  img: `${CDN}/app-icons/og-best-christian-apps.png`,
}
