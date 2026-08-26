import type { Metadata } from 'next'
import { SiteNav, SiteFooter } from '../../components/SiteChrome'
import PrintButton from '../PrintButton'
import { EmailCaptureCard } from '../../blog/EmailCaptureCard'
import { COLORING_PAGES, CDN } from '@/lib/coloring-pages'

/**
 * Easter coloring pages hub.
 * Target: "religious easter coloring pages" — 1,900/mo at keyword difficulty 0 (DataForSEO
 * clickstream, Aug 26 2026), plus the variant cluster around it.
 */

const PAGES = COLORING_PAGES.filter(p => p.season === 'easter')

export const metadata: Metadata = {
  title: 'Religious Easter Coloring Pages — Free Printables',
  description: 'Free printable religious Easter coloring pages for kids: Palm Sunday, the Last Supper, the cross, and resurrection morning. Bold outlines, no sign-up.',
  keywords: ['religious easter coloring pages', 'christian easter coloring pages', 'easter coloring pages religious', 'palm sunday coloring page', 'resurrection coloring page', 'cross coloring page', 'holy week coloring pages'],
  alternates: { canonical: 'https://faithfulkids.app/printables/easter-coloring-pages' },
  openGraph: {
    title: 'Religious Easter Coloring Pages — Free Printables',
    description: 'Free printable religious Easter coloring pages for kids: Palm Sunday, the Last Supper, the cross, and resurrection morning. Bold outlines, no sign-up.',
    url: 'https://faithfulkids.app/printables/easter-coloring-pages',
    siteName: 'Faithful Kids',
    type: 'website',
    images: [{ url: `${CDN}/resurrection-morning.png`, width: 1024, height: 1536 }],
  },
}

export default function Page() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Religious Easter Coloring Pages — Free Printables',
    description: 'Free printable religious Easter coloring pages for kids: Palm Sunday, the Last Supper, the cross, and resurrection morning. Bold outlines, no sign-up.',
    url: 'https://faithfulkids.app/printables/easter-coloring-pages',
    isFamilyFriendly: true,
    inLanguage: 'en',
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: PAGES.length,
      itemListElement: PAGES.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: `${p.title} coloring page`,
        url: `https://faithfulkids.app/printables/bible-coloring-pages/${p.slug}`,
      })),
    },
  }

  return (
    <>
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <div className="no-print"><SiteNav active="printables" /></div>

      <section className="blog-hero no-print">
        <span className="section-label">Free · No Sign-Up</span>
        <h1>Religious Easter Coloring Pages</h1>
        <p className="blog-hero-sub">Five pages walking Holy Week from Palm Sunday to the road to Emmaus. Free to print, no email, no sign-up.</p>
        <div style={{ marginTop: 18 }}><PrintButton /></div>
      </section>

      <section className="cp-intro no-print">
        <p>Most Easter coloring pages you find are rabbits and painted eggs. These are the actual story — the donkey and the palm branches, the table with the bread and cup, the empty cross, the tomb at sunrise.</p>
        <p>They are drawn gently on purpose. The cross page shows the cross empty with a cloth over it rather than the crucifixion, so it can be used with younger children whose families are not ready for the rest of it yet.</p>
      </section>

      <div className="cp-grid">
        {PAGES.map(p => (
          <figure key={p.slug} className="cp-item">
            <a href={`/printables/bible-coloring-pages/${p.slug}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${CDN}/${p.slug}.png`}
                alt={`${p.title} coloring page for kids — free printable`}
                width={1024} height={1536} loading="lazy"
              />
            </a>
            <figcaption>
              <strong>{p.title}</strong>
              <span>{p.scripture} · Preview &amp; print</span>
            </figcaption>
          </figure>
        ))}
      </div>

      <section className="cp-capture no-print">
        <EmailCaptureCard magnet="coloring-pages" source="blog-inline" sourcePost="easter-coloring-pages" />
      </section>

      <section className="cp-outro no-print">
        <h2>Using these through Holy Week</h2>
        <p>If you are working through the week day by day, the order on this page is the order it happened: Palm Sunday, the Last Supper, the cross, resurrection morning, then the road to Emmaus. One page a day from Sunday to Sunday gives a child the shape of the week without a single worksheet.</p>
        <p>
          These sit alongside the full set of{' '}
          <a href="/printables/bible-coloring-pages">Bible coloring pages</a> — 26 scenes covering
          the whole story, all free to print.
        </p>
      </section>

      <section className="blog-bottom-cta no-print">
        <div className="blog-bottom-cta-inner">
          <h2>The story behind each page</h2>
          <p>
            Every scene here is an episode in the Faithful Kids library — a few minutes long, with a
            quiz afterwards so you can see what your child actually understood.
          </p>
          <a className="btn-primary" href="/quiz?ref=easter-coloring">Start your child&rsquo;s Bible journey</a>
        </div>
      </section>

      <div className="no-print"><SiteFooter /></div>
    </>
  )
}
