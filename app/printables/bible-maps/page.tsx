import type { Metadata } from 'next'
import { SiteNav, SiteFooter } from '../../components/SiteChrome'
import { PrintableCta } from '../PrintableCta'
import printableVideos from '@/lib/printable-videos.json'
import { MAPS, REGIONS, MAP_COUNT, PLACE_COUNT } from '@/lib/bible-maps'
import { BibleMapSvg } from './BibleMapSvg'
import './maps.css'

/**
 * Bible maps hub.
 *
 * Target: "bible map" 1,376/mo clickstream (8,100 ads) KD 18, "bible maps"
 * 968/8,100 KD 28 — plus six detail pages each owning a KD 0-10 term
 * (DataForSEO Nov 2, 2026). The SERP is 1990s map archives, stock photos and
 * PDFs, with an EMPTY AI Overview: an artifact SERP, same shape as the word
 * searches and coloring pages that built this engine.
 *
 * The maps are traced from real Natural Earth coastline data with every city
 * at its genuine coordinates — say so on the page, because it is the thing no
 * competitor on this SERP can claim.
 */

export const metadata: Metadata = {
  title: { absolute: `Bible Maps for Kids, ${MAP_COUNT} Free Printable Maps` },
  description: `${MAP_COUNT} free printable Bible maps for kids, the Exodus route, Israel in Jesus' time, Paul's journeys, the 12 tribes and more. Real geography, no sign-up.`,
  keywords: [
    'bible maps', 'bible map', 'bible maps for kids', 'printable bible maps',
    'bible maps printable', 'sunday school maps', 'bible geography for kids',
  ],
  alternates: { canonical: 'https://faithfulkids.app/printables/bible-maps' },
  openGraph: {
    title: `Bible Maps for Kids, ${MAP_COUNT} Free Printable Maps`,
    description: `${MAP_COUNT} printable Bible maps with real geography, the Exodus, Paul's journeys, Israel in Jesus' time and more. Free, no sign-up.`,
    url: 'https://faithfulkids.app/printables/bible-maps',
    siteName: 'Faithful Kids',
    type: 'website',
    images: [{ url: 'https://d3g07v1w0lehiv.cloudfront.net/bible-maps/ancient-israel-og.png', width: 1200, height: 630 }],
  },
}

const faqs = [
  {
    q: 'Are these Bible maps accurate?',
    a: `Yes, and that is the point of the set. The coastlines, lakes and rivers are traced from real cartographic data (the same Natural Earth dataset professional mapmakers use), and all ${PLACE_COUNT} places sit at their genuine coordinates, so distances and directions are true. Where a site is traditional rather than certain, Mount Sinai, the Red Sea crossing, the map says so with an asterisk instead of pretending the question is settled.`,
  },
  {
    q: 'Can I print these for my Sunday school class or co-op?',
    a: 'Yes. Every map is free with no sign-up, and you are welcome to photocopy them for your family, class, homeschool co-op, camp or church group. Each printed sheet carries our web address so families can find the set again at home.',
  },
  {
    q: 'What order should kids learn the maps in?',
    a: "Follow the story: Canaan (the land as promised), the Exodus (the journey to it), the Twelve Tribes (how it was divided), Ancient Israel (the kingdoms), Israel in Jesus' time, and Paul's journeys last, by then the map has grown from one small land to the whole Mediterranean, which is itself the story of the Bible.",
  },
  {
    q: 'Why do kids need Bible maps at all?',
    a: 'Because the Bible happened in places, and places make stories concrete. A child who can see that Nazareth to Bethlehem is a four-day walk understands Mary differently; a child who finds the Sea of Galilee understands why fishermen. Geography turns a list of names into one connected world.',
  },
]

const schema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Printable Bible Maps for Kids',
  description: `${MAP_COUNT} free printable Bible maps for children, with real geography and ${PLACE_COUNT} labeled places.`,
  url: 'https://faithfulkids.app/printables/bible-maps',
  isFamilyFriendly: true,
  inLanguage: 'en',
  mainEntity: {
    '@type': 'ItemList',
    numberOfItems: MAP_COUNT,
    itemListElement: MAPS.map((m, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: `${m.title} map`,
      url: `https://faithfulkids.app/printables/bible-maps/${m.slug}`,
    })),
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(f => ({
    '@type': 'Question', name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
}

export default function BibleMapsHub() {
  const vids = printableVideos as Record<string, { videoSrc: string; posterSrc: string; videoTitle: string; duration: string | null }>
  const clip = vids._default
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <SiteNav active="printables" />

      <section className="blog-hero">
        <span className="section-label">Free · No Sign-Up</span>
        <h1>Printable Bible Maps for Kids</h1>
        <p className="blog-hero-sub">
          {MAP_COUNT} maps that cover the whole story, the Promised Land, the Exodus route, the
          kingdoms, Israel in Jesus&rsquo; time, and Paul&rsquo;s journeys across the Mediterranean.
          Real geography, {PLACE_COUNT} labeled places, every map free to print.
        </p>
      </section>

      <section className="cp-intro">
        <p>
          Most printable Bible maps are hand-drawn sketches where Galilee floats wherever it fits.
          These are different: the coastlines come from real cartographic data and every city sits
          at its true coordinates, so when a child measures Nazareth to Jerusalem with a finger,
          the distance they feel is the real one. Where a location is traditional rather than
          certain, Mount Sinai, the Red Sea crossing, the map marks it with an asterisk and says
          so, because teaching kids the difference between &ldquo;the Bible says&rdquo; and
          &ldquo;tradition says&rdquo; is part of teaching the Bible honestly.
        </p>
      </section>

      <main className="bm-wrap" style={{ paddingTop: 0 }}>
        {/* h2 before the h3 cards: the audit flags h1->h3 skips */}
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.01em', margin: '0 0 0.2rem' }}>
          The six maps
        </h2>
        <div className="bm-hub-grid">
          {MAPS.map(m => (
            <a key={m.slug} href={`/printables/bible-maps/${m.slug}`}>
              <div className="bm-thumb">
                <BibleMapSvg map={m} region={REGIONS[m.region]} preview />
              </div>
              <h3>{m.title}</h3>
              <p>{m.subtitle} · {m.places.length} places · {m.scripture}</p>
              <span className="bm-go">View &amp; print free &rarr;</span>
            </a>
          ))}
        </div>

        <div className="bm-body">
          <section>
            <h2>Use them in story order</h2>
            <p>
              The set is designed to be learned as one story. Start with{' '}
              <a href="/printables/bible-maps/the-promised-land">Canaan</a> the land God promised
              Abraham. <a href="/printables/bible-maps/the-exodus">The Exodus</a> is the journey to
              it, <a href="/printables/bible-maps/twelve-tribes-of-israel">the Twelve Tribes</a> is
              how it was divided, <a href="/printables/bible-maps/ancient-israel">Ancient Israel</a>{' '}
              is the age of kings and prophets,{' '}
              <a href="/printables/bible-maps/israel-in-jesus-time">Israel in Jesus&rsquo; time</a>{' '}
              is the same land the Gospels walk through, and{' '}
              <a href="/printables/bible-maps/pauls-missionary-journeys">Paul&rsquo;s journeys</a>{' '}
              blow the map open to the whole Mediterranean. Pin them up in order and the wall tells
              the story of the Bible by itself, the{' '}
              <a href="/printables/bible-timeline">printable Bible timeline</a> makes a good
              seventh sheet.
            </p>
          </section>

          <section>
            <h2>Common questions</h2>
            {faqs.map(f => (
              <div key={f.q} style={{ marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 4px' }}>{f.q}</h3>
                <p style={{ margin: 0 }}>{f.a}</p>
              </div>
            ))}
          </section>

          <section>
            <h2>More free printables</h2>
            <p>
              The maps pair naturally with the{' '}
              <a href="/printables/bible-timeline">Bible timeline chart</a>, the{' '}
              <a href="/printables/books-of-the-bible">books of the Bible chart</a>, and the{' '}
              <a href="/printables/bible-word-search">word searches</a> built from the same
              stories, <a href="/printables">the whole free library is here</a>.
            </p>
          </section>
        </div>
      </main>

      <PrintableCta
        {...clip}
        duration={clip.duration ?? undefined}
        heading="Maps show where it happened. The episodes show what happened."
        body={`Every place on these maps has its story in the Faithful Kids library, ${clip.videoTitle} runs about two minutes and ends with a quiz, one of 300+ episodes from Genesis to Revelation.`}
        source="bible-maps-hub"
      />

      <section className="blog-bottom-cta">
        <div className="blog-bottom-cta-inner">
          <h2>They can find it on the map. Do they know the story?</h2>
          <p>
            Faithful Kids tells the whole Bible in 300+ short video episodes with a quiz after
            every story, the places on these maps, brought to life in order.
          </p>
          <a className="btn-primary" href="/quiz?ref=bible-maps">
            Start your child&rsquo;s Bible journey
          </a>
        </div>
      </section>

      <SiteFooter />
    </>
  )
}
