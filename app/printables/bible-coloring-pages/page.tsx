import type { Metadata } from 'next'
import { SiteNav, SiteFooter } from '../../components/SiteChrome'
import PrintButton from '../PrintButton'
import { EmailCaptureCard } from '../../blog/EmailCaptureCard'

/**
 * Free printable Bible coloring pages.
 *
 * Target: "bible coloring pages" — 5,400/mo at keyword difficulty 5
 * (DataForSEO clickstream, Aug 26 2026). Sibling terms in the same cluster:
 * "bible verse coloring pages" 2,900/mo KD 0, "free bible coloring pages"
 * 1,300/mo KD 8, "bible coloring pages for preschoolers" 1,300/mo KD 16.
 *
 * We already had FIVE blog posts on this topic drawing ZERO impressions in 90
 * days, because they are articles ABOUT coloring pages that send readers
 * elsewhere. The intent is "give me pages to print". This gives them pages.
 */

import { COLORING_PAGES, CDN } from '@/lib/coloring-pages'

const PAGES = COLORING_PAGES

export const metadata: Metadata = {
  title: 'Free Bible Coloring Pages — 26 Printables',
  description:
    '26 free printable Bible coloring pages, from Creation to the Empty Tomb. Bold simple outlines for young children. No sign-up, no email, just print.',
  keywords: [
    'bible coloring pages', 'free bible coloring pages', 'bible coloring pages for kids',
    'printable bible coloring pages', 'bible verse coloring pages',
    'bible coloring pages for preschoolers', 'sunday school coloring pages',
    'bible story coloring pages',
  ],
  alternates: { canonical: 'https://faithfulkids.app/printables/bible-coloring-pages' },
  openGraph: {
    title: 'Free Bible Coloring Pages — 26 Printables',
    description:
      '26 free printable Bible coloring pages, Creation to the Empty Tomb. No sign-up, just print.',
    url: 'https://faithfulkids.app/printables/bible-coloring-pages',
    siteName: 'Faithful Kids',
    type: 'website',
    images: [{ url: `${CDN}/noahs-ark.png`, width: 1024, height: 1536 }],
  },
}

export default function BibleColoringPages() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Free Bible Coloring Pages',
    description: `${PAGES.length} printable Bible coloring pages for children, from Creation to the Empty Tomb.`,
    url: 'https://faithfulkids.app/printables/bible-coloring-pages',
    isFamilyFriendly: true,
    inLanguage: 'en',
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: PAGES.length,
      itemListElement: PAGES.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: `${p.title} coloring page`,
        url: `${CDN}/${p.slug}.png`,
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
        <h1>Bible Coloring Pages</h1>
        <p className="blog-hero-sub">
          {PAGES.length} printable pages, Creation to the Empty Tomb. Bold simple outlines made for
          small hands and thick crayons. Print the whole set, or click any single page to print just
          that one.
        </p>
        <div style={{ marginTop: 18 }}><PrintButton /></div>
      </section>

      <section className="cp-intro no-print">
        <p>
          Every page here is drawn as a single clear scene rather than a busy illustration, because
          a four-year-old with a fat crayon needs room to work. There is no email wall and nothing to
          sign up for — right-click any page to save it, or use the print button above for the set.
        </p>
        <p>
          If you are using these in Sunday school, the scripture reference under each page is there
          on purpose: coloring while the story is read aloud is one of the few ways a young child
          will sit through the whole thing.
        </p>
      </section>

      <div className="cp-grid">
        {PAGES.map(p => (
          <figure key={p.slug} className="cp-item">
            <a href={`/printables/bible-coloring-pages/${p.slug}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${CDN}/${p.slug}.png`}
                alt={`${p.title} Bible coloring page for kids — free printable`}
                width={1024}
                height={1536}
                loading="lazy"
              />
            </a>
            <figcaption>
              <strong>{p.title}</strong>
              <span>{p.scripture} · Preview &amp; print</span>
            </figcaption>
          </figure>
        ))}
      </div>

      {/* Email capture for the BUNDLE, not the pages.
          The pages themselves stay free and crawlable -- gating them would
          destroy the only reason this page exists (5,400/mo at KD 5, and
          Google cannot index what it cannot fetch). The PDF is the upgrade:
          the Sunday school teacher who wants all 26 in one file is the
          higher-intent visitor, and that is worth an address. */}
      <section className="cp-capture no-print">
        <EmailCaptureCard
          magnet="coloring-pages"
          source="blog-inline"
          sourcePost="bible-coloring-pages"
        />
      </section>

      <section className="cp-seasons no-print">
        <a href="/printables/christmas-coloring-pages">
          <strong>Christmas &amp; Nativity</strong>
          <span>6 pages — the angel, Bethlehem, the shepherds, the wise men</span>
        </a>
        <a href="/printables/easter-coloring-pages">
          <strong>Easter &amp; Holy Week</strong>
          <span>5 pages — Palm Sunday through resurrection morning</span>
        </a>
      </section>

      <section className="cp-outro no-print">
        <h2>How to use Bible coloring pages that actually teach something</h2>
        <p>
          Coloring on its own is a quiet activity, not a lesson. What turns it into one is the order
          you do things in. Read or watch the story first, while the page is still blank, then hand
          it over. The child colors the scene they have just met, and the picture becomes a memory
          aid rather than a distraction.
        </p>
        <p>
          Ask one question while they color, not five. &ldquo;What do you think Noah was thinking
          when it started raining?&rdquo; will get you further than a quiz, because a child answering
          with their hands busy tends to say what they actually think.
        </p>
        <h2>Which pages work at which age</h2>
        <p>
          Ages 3 to 5 do best with the big-shape pages — Noah&rsquo;s ark, the good shepherd, baby
          Jesus in the manger. Ages 6 to 8 can handle the busier scenes like Creation and the armor
          of God. Older children often prefer coloring while a story plays rather than coloring as
          the main event, which is worth knowing before you plan a whole session around it.
        </p>
      </section>

      <section className="blog-bottom-cta no-print">
        <div className="blog-bottom-cta-inner">
          <h2>Want the story that goes with the page?</h2>
          <p>
            Every scene here is an episode in the Faithful Kids library — a few minutes long, with a
            quiz afterwards so you can see what your child actually understood.
          </p>
          <a className="btn-primary" href="/quiz?ref=coloring-pages">Start your child&rsquo;s Bible journey</a>
          <div className="blog-cta-badges">
            <span>200 free story pages</span><span>No ads, ever</span><span>Cancel anytime</span>
          </div>
        </div>
      </section>

      <div className="no-print"><SiteFooter /></div>
    </>
  )
}
