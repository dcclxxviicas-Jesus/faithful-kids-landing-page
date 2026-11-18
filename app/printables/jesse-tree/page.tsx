import { SiteNav, SiteFooter } from '../../components/SiteChrome'
import PrintButton from '../PrintButton'
import PdfDownloadLink from '../PdfDownloadLink'
import { PrintableCta } from '../PrintableCta'
import printableVideos from '@/lib/printable-videos.json'
import { EmailCaptureCard } from '../../blog/EmailCaptureCard'
import jesseTree from '@/lib/jesse-tree.json'
import '../printable-page.css'

const EMERALD = '#16a34a'
const CDN = 'https://d3g07v1w0lehiv.cloudfront.net/jesse-tree'

export const metadata = {
  title: 'Printable Jesse Tree Ornaments & Readings: Free Set of 25',
  description:
    'Free printable Jesse Tree set: 25 ornaments to color, one for each day of Advent, with the daily Scripture reading for each symbol. Free PDF.',
  alternates: { canonical: 'https://faithfulkids.app/printables/jesse-tree' },
  openGraph: {
    title: 'Printable Jesse Tree Ornaments & Readings: Free Set of 25',
    description: 'Free printable Jesse Tree: 25 ornaments to color plus the daily Advent Scripture readings.',
    images: [{ url: `${CDN}/hero.png`, width: 1536, height: 1024 }],
  },
}

type Day = { day: number; slug: string; title: string; symbol: string; scripture: string; summary: string }
const days = jesseTree as Day[]

const faqs = [
  {
    q: 'What is a Jesse Tree?',
    a: 'A Jesse Tree is an Advent tradition that tells the whole story of the Bible leading up to Christmas. Each day from December 1 to 25, families hang one ornament, each a symbol of a Bible story, from Creation to the manger, and read the short Scripture passage it stands for. The name comes from Isaiah 11:1: "A shoot will come up from the stump of Jesse; from his roots a Branch will bear fruit." Jesse was King David\'s father, and the "Branch" is Jesus.',
  },
  {
    q: 'How do you use these printable ornaments?',
    a: 'Print the ornaments (they are drawn as coloring pages, so kids can color each one), cut them out, and hang one each day on a small tree, a branch in a jar, or a ribbon on the wall. Before hanging, read that day\'s passage from the table above, two or three minutes, once a day, and by Christmas Eve your family has walked the entire story of Scripture together.',
  },
  {
    q: 'What order do the Jesse Tree readings go in?',
    a: 'The readings follow the Bible\'s own storyline: Creation and the Fall, God\'s promises to Noah and Abraham, the exodus, the kings and prophets, and finally the events of the first Christmas. The table above lists all 25 days in order with each symbol and its Scripture reference.',
  },
  {
    q: 'Is this really free? Can I print copies for my class or church?',
    a: 'Yes, everything is free: enter your email once and the download and print buttons open from then on. You are welcome to photocopy the pages for your family, Sunday school class, homeschool co-op, or church. Printed pages carry our web address so families can find the readings again at home.',
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

      <main className="pp">
        <header className="pp-head">
          <div>
            <div className="print-brand" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-sm.png" alt="Faithful Kids logo" width={36} height={36} style={{ display: 'block' }} />
              <span style={{ fontSize: '1.05rem', fontWeight: 700, color: EMERALD }}>Faithful Kids</span>
            </div>
            <p className="pp-eyebrow no-print" aria-hidden="true">Free Advent printable</p>
            <h1 className="pp-h1">Printable Jesse Tree Ornaments &amp; Readings</h1>
            <p className="pp-lede">
              A free Jesse Tree set for Advent: <strong>25 ornaments to color</strong> one for each
              day from December 1 to 25, each with its <strong>daily Scripture reading</strong>, so
              your family walks the whole Bible story from Creation to the manger, a few minutes a
              day. Print it, color it, hang it.
            </p>
            {/* Download and Print side by side: the print button used to float
                alone above the title, away from the thing it prints. */}
            <div className="pp-actions no-print">
              <PrintButton
                align="start"
                pdf={{ href: 'https://faithfulkids.app/printables/jesse-tree.pdf', printable: 'jesse-tree', label: 'Download the free Jesse Tree PDF' }}
              />
              <p className="pp-actions-note">All 25 ornaments + the readings plan in one file</p>
            </div>
          </div>
          <PdfDownloadLink className="pp-hero-art no-print pp-coverlink" href="https://faithfulkids.app/printables/jesse-tree.pdf" printable="jesse-tree">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://d3g07v1w0lehiv.cloudfront.net/hub-thumbs/heroes/jesse-tree-1200.webp"
              srcSet="https://d3g07v1w0lehiv.cloudfront.net/hub-thumbs/heroes/jesse-tree-720.webp 720w, https://d3g07v1w0lehiv.cloudfront.net/hub-thumbs/heroes/jesse-tree-1200.webp 1200w"
              sizes="(min-width: 900px) 540px, 100vw"
              alt="Children hanging hand-colored ornaments on a small Jesse Tree branch beside a lit candle"
              width={1200} height={800} fetchPriority="high"
            />
          </PdfDownloadLink>
        </header>

        {/* Readings table — HTML on purpose: crawlable, screen-readable, printable.
            On screen it renders as a calendar list with each day's ornament;
            in print it is the same plain table it always was. */}
        <section className="pp-section">
          <h2 className="pp-h2">The 25 Days: Symbols &amp; Readings</h2>
          <div className="pp-tablewrap">
            <table className="pp-table has-thumbs">
              <thead>
                <tr>
                  <th>Day</th>
                  <th className="pp-thumb no-print" aria-hidden="true"></th>
                  <th>Ornament</th>
                  <th>Reading</th>
                  <th>The story in one line</th>
                </tr>
              </thead>
              <tbody>
                {days.map(d => (
                  <tr key={d.day}>
                    <td className="pp-day">Dec <b>{d.day}</b></td>
                    <td className="pp-thumb no-print" aria-hidden="true">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`${CDN}/${d.slug}.png`} alt="" width={64} height={64} loading="lazy" decoding="async" />
                    </td>
                    <td className="pp-title">{d.title}</td>
                    <td className="pp-ref">{d.scripture}</td>
                    <td className="pp-sum">{d.summary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Ornament grid */}
        <section className="pp-section">
          <h2 className="pp-h2">The Ornaments, Ready to Color</h2>
          <p className="pp-muted">
            Each ornament is drawn as simple line art so kids can color it before it goes on the
            tree. Print straight from this page, or grab the PDF above for all 25 on clean sheets
            with the readings included.
          </p>
          <div className="pp-ornaments">
            {days.map(d => (
              <figure key={d.slug}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${CDN}/${d.slug}.png`}
                  alt={`${d.title}, printable Jesse Tree ornament to color (${d.scripture})`}
                  width={512}
                  height={512}
                  loading="lazy"
                />
                <figcaption>
                  Dec {d.day} &middot; {d.title}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* Advent-kit email capture: the printable above stays ungated; this
            offers the companion nightly reading plan by email */}
        <section className="no-print pp-capture" style={{ margin: '0 0 2rem' }}>
          <EmailCaptureCard
            magnet="advent"
            source="blog-inline"
            sourcePost="jesse-tree"
            title="🎄 Free too: the 25-Day Advent readings as one PDF"
            subtitle="The companion to this tree: December 1 to 25, one short nightly reading, from the first promise to the manger."
          />
        </section>

        {/* FAQ */}
        <section className="pp-section pp-faq">
          <h2 className="pp-h2">Jesse Tree Questions</h2>
          <div>
            {faqs.map(f => (
              <div key={f.q} className="pp-faq-item">
                <h3>{f.q}</h3>
                <p>{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Cross-links + offer */}
        <section className="no-print pp-more">
          <p>
            More free Advent and Christmas resources: our printable{' '}
            <a href="/printables/advent-bible-calendar">Advent Bible reading calendar</a>,{' '}
            <a href="/printables/christmas-coloring-pages">Christmas coloring pages</a>, the{' '}
            <a href="/printables/bible-word-search/christmas">Christmas word search</a>, and{' '}
            <a href="/blog/christmas-bible-trivia">80 Christmas Bible trivia questions</a>.
          </p>
          <p>
            And when the ornament is hung and the reading is done, the same story exists as a video
            your kids will ask for: Faithful Kids tells the whole Bible in 300+ short video lessons
            with a quiz after every story.{' '}
            <a href="/quiz">Start your free trial</a>
            {' '}&middot; churches and Sunday schools get it{' '}
            <a href="/churches">free</a>.
          </p>
        </section>
      </main>

      {/* Owner request, Nov 17, 2026: the same "try Faithful Kids" close the
          other printables carry. Screen only (PrintableCta is no-print). */}
      <PrintableCta
        {...(printableVideos as Record<string, { videoSrc: string; posterSrc: string; videoTitle: string; duration: string | null }>).christmas}
        duration={(printableVideos as Record<string, { duration: string | null }>).christmas.duration ?? undefined}
        heading="Every ornament is a story. Now let them watch it."
        body="Faithful Kids tells the whole Bible, Creation to the manger and beyond, in 300+ short video lessons, about two minutes each, with a quiz after every story so you can see what your child took in. Here is the manger, the last ornament on the tree."
        source="jesse-tree"
      />

      <SiteFooter />
    </>
  )
}
