import { SiteNav, SiteFooter } from '../../components/SiteChrome'
import PrintButton from '../PrintButton'
import jesseTree from '@/lib/jesse-tree.json'

const EMERALD = '#059669'
const CDN = 'https://d3g07v1w0lehiv.cloudfront.net/jesse-tree'

export const metadata = {
  title: 'Printable Jesse Tree Ornaments & Readings — Free Set of 25',
  description:
    'Free printable Jesse Tree set: 25 ornaments to color, one for each day of Advent, with the daily Scripture reading for each symbol. No sign-up, free PDF.',
  alternates: { canonical: 'https://faithfulkids.app/printables/jesse-tree' },
  openGraph: {
    title: 'Printable Jesse Tree Ornaments & Readings — Free Set of 25',
    description: 'Free printable Jesse Tree: 25 ornaments to color plus the daily Advent Scripture readings.',
    images: [{ url: `${CDN}/hero.png`, width: 1536, height: 1024 }],
  },
}

type Day = { day: number; slug: string; title: string; symbol: string; scripture: string; summary: string }
const days = jesseTree as Day[]

const faqs = [
  {
    q: 'What is a Jesse Tree?',
    a: 'A Jesse Tree is an Advent tradition that tells the whole story of the Bible leading up to Christmas. Each day from December 1 to 25, families hang one ornament — each a symbol of a Bible story, from Creation to the manger — and read the short Scripture passage it stands for. The name comes from Isaiah 11:1: "A shoot will come up from the stump of Jesse; from his roots a Branch will bear fruit." Jesse was King David\'s father, and the "Branch" is Jesus.',
  },
  {
    q: 'How do you use these printable ornaments?',
    a: 'Print the ornaments (they are drawn as coloring pages, so kids can color each one), cut them out, and hang one each day on a small tree, a branch in a jar, or a ribbon on the wall. Before hanging, read that day\'s passage from the table above — two or three minutes, once a day, and by Christmas Eve your family has walked the entire story of Scripture together.',
  },
  {
    q: 'What order do the Jesse Tree readings go in?',
    a: 'The readings follow the Bible\'s own storyline: Creation and the Fall, God\'s promises to Noah and Abraham, the exodus, the kings and prophets, and finally the events of the first Christmas. The table above lists all 25 days in order with each symbol and its Scripture reference.',
  },
  {
    q: 'Is this really free? Can I print copies for my class or church?',
    a: 'Yes — the ornaments, the readings, and the PDF are free with no sign-up, and you are welcome to photocopy them for your family, Sunday school class, homeschool co-op, or church. Printed pages carry our web address so families can find the readings again at home.',
  },
]

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(f => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
}

export default function JesseTreePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <SiteNav active="printables" />

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '24px' }}>
        <div className="no-print" style={{ textAlign: 'right', marginBottom: '0.75rem' }}>
          <PrintButton />
        </div>

        <header style={{ borderBottom: `3px solid ${EMERALD}`, paddingBottom: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-sm.png" alt="Faithful Kids logo" width={36} height={36} style={{ display: 'block' }} />
            <span style={{ fontSize: '1.05rem', fontWeight: 700, color: EMERALD }}>Faithful Kids</span>
          </div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
            Printable Jesse Tree Ornaments &amp; Readings
          </h1>
          <p style={{ margin: '0.5rem 0 0', color: '#4b5563', fontSize: '1.02rem', lineHeight: 1.6 }}>
            A free Jesse Tree set for Advent: <strong>25 ornaments to color</strong> — one for each
            day from December 1 to 25 — each with its <strong>daily Scripture reading</strong>, so
            your family walks the whole Bible story from Creation to the manger, a few minutes a
            day. No sign-up, no email. Print it, color it, hang it.
          </p>
          <p className="no-print" style={{ margin: '0.9rem 0 0' }}>
            <a
              href="https://d3g07v1w0lehiv.cloudfront.net/printables/jesse-tree.pdf"
              style={{ display: 'inline-block', background: EMERALD, color: '#fff', fontWeight: 700, padding: '12px 22px', borderRadius: 12, textDecoration: 'none', boxShadow: '0 4px 0 #047857' }}
            >
              Download the free Jesse Tree PDF &rarr;
            </a>
            <span style={{ display: 'inline-block', marginLeft: 12, color: '#6b7280', fontSize: '0.9rem' }}>
              All 25 ornaments + the readings plan in one file
            </span>
          </p>
        </header>

        {/* Readings table — HTML on purpose: crawlable, screen-readable, printable */}
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.01em' }}>
            The 25 Days: Symbols &amp; Readings
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
              <thead>
                <tr style={{ background: '#ecfdf5', textAlign: 'left' }}>
                  <th style={{ padding: '8px 10px' }}>Day</th>
                  <th style={{ padding: '8px 10px' }}>Ornament</th>
                  <th style={{ padding: '8px 10px' }}>Reading</th>
                  <th style={{ padding: '8px 10px' }}>The story in one line</th>
                </tr>
              </thead>
              <tbody>
                {days.map(d => (
                  <tr key={d.day} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '8px 10px', fontWeight: 700, color: EMERALD }}>Dec {d.day}</td>
                    <td style={{ padding: '8px 10px', fontWeight: 600 }}>{d.title}</td>
                    <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>{d.scripture}</td>
                    <td style={{ padding: '8px 10px', color: '#4b5563' }}>{d.summary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Ornament grid */}
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.01em' }}>
            The Ornaments — Ready to Color
          </h2>
          <p style={{ color: '#4b5563', lineHeight: 1.6 }}>
            Each ornament is drawn as simple line art so kids can color it before it goes on the
            tree. Print straight from this page, or grab the PDF above for all 25 on clean sheets
            with the readings included.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
            {days.map(d => (
              <figure key={d.slug} style={{ margin: 0, textAlign: 'center' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${CDN}/${d.slug}.png`}
                  alt={`${d.title} — printable Jesse Tree ornament to color (${d.scripture})`}
                  width={512}
                  height={512}
                  loading="lazy"
                  style={{ width: '100%', height: 'auto', border: '1px solid #e5e7eb', borderRadius: 12 }}
                />
                <figcaption style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: 4 }}>
                  Dec {d.day} &middot; {d.title}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.01em' }}>Jesse Tree Questions</h2>
          {faqs.map(f => (
            <div key={f.q} style={{ marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 4px' }}>{f.q}</h3>
              <p style={{ margin: 0, color: '#4b5563', lineHeight: 1.65 }}>{f.a}</p>
            </div>
          ))}
        </section>

        {/* Cross-links + offer */}
        <section className="no-print" style={{ borderTop: `2px solid ${EMERALD}`, paddingTop: '1.25rem', marginBottom: '2.5rem' }}>
          <p style={{ color: '#4b5563', lineHeight: 1.65 }}>
            More free Advent and Christmas resources: our printable{' '}
            <a href="/printables/advent-bible-calendar" style={{ color: EMERALD, fontWeight: 700 }}>Advent Bible reading calendar</a>,{' '}
            <a href="/printables/christmas-coloring-pages" style={{ color: EMERALD, fontWeight: 700 }}>Christmas coloring pages</a>, the{' '}
            <a href="/printables/bible-word-search/christmas" style={{ color: EMERALD, fontWeight: 700 }}>Christmas word search</a>, and{' '}
            <a href="/blog/christmas-bible-trivia" style={{ color: EMERALD, fontWeight: 700 }}>80 Christmas Bible trivia questions</a>.
          </p>
          <p style={{ color: '#4b5563', lineHeight: 1.65 }}>
            And when the ornament is hung and the reading is done, the same story exists as a video
            your kids will ask for: Faithful Kids tells the whole Bible in 300+ short video lessons
            with a quiz after every story.{' '}
            <a href="/quiz" style={{ color: EMERALD, fontWeight: 700 }}>Start your free trial</a>
            {' '}&middot; churches and Sunday schools get it{' '}
            <a href="/churches" style={{ color: EMERALD, fontWeight: 700 }}>free</a>.
          </p>
        </section>
      </main>

      <SiteFooter />
    </>
  )
}
