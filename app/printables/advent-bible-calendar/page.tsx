import { SiteNav, SiteFooter } from '../../components/SiteChrome'
import PrintButton from '../PrintButton'
import PdfDownloadLink from '../PdfDownloadLink'
import { PrintableCta } from '../PrintableCta'
import printableVideos from '@/lib/printable-videos.json'
import adventReadings from '@/lib/advent-readings.json'
import '../printable-page.css'

const EMERALD = '#16a34a'

export const metadata = {
  title: 'Printable Advent Bible Calendar: 25 Daily Readings',
  description:
    'A free printable Advent Bible reading calendar: 25 short daily readings from the first promise to the manger, with one-line summaries. Free PDF.',
  alternates: { canonical: 'https://faithfulkids.app/printables/advent-bible-calendar' },
  openGraph: {
    title: 'Printable Advent Bible Calendar: 25 Daily Readings',
    description: 'Free printable Advent reading plan: 25 short Bible readings, December 1 to Christmas Day.',
    images: [{ url: 'https://d3g07v1w0lehiv.cloudfront.net/jesse-tree/advent-hero.png', width: 1536, height: 1024 }],
  },
}

type Day = { day: number; title: string; scripture: string; summary: string }
const days = adventReadings as Day[]

const faqs = [
  {
    q: 'What is an Advent Bible reading calendar?',
    a: 'It is a reading plan shaped like an Advent calendar: one short Bible passage for each day from December 1 to Christmas Day. This plan follows the story in order, ten days of promises and prophecies, then the events of the first Christmas from Gabriel\'s announcement to the Word made flesh, so by December 25 your family has read the whole Christmas story from Scripture itself, not just the highlights.',
  },
  {
    q: 'How long does each day take?',
    a: 'Most readings are ten to twenty verses, about three to five minutes read aloud. The one-line summary beside each day works as a conversation starter: read the passage, then let a child put it in their own words.',
  },
  {
    q: 'What ages is this for?',
    a: 'The readings come straight from the Bible, so it works for any age that can listen to Scripture read aloud, roughly 5 and up. For younger children, read the passage and lean on the one-line summary; older kids can take turns reading the passages themselves.',
  },
  {
    q: 'Can I print copies for my church or class?',
    a: 'Yes, the plan and the PDF are free, and you are welcome to photocopy them for your family, Sunday school class, or church. The printed page carries our web address so families can find it again at home.',
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

export default function AdventCalendarPage() {
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
            <h1 className="pp-h1">Printable Advent Bible Reading Calendar</h1>
            <p className="pp-lede">
              A free Advent reading plan for families: <strong>25 short Bible readings</strong>, one
              for each day from December 1 to Christmas Day, starting with the first promise in the
              garden and ending at the manger. Ten days of prophecy, fifteen days of the Christmas
              story itself, a few minutes a night.
            </p>
            <div className="pp-actions no-print">
              <PrintButton
                align="start"
                pdf={{ href: 'https://faithfulkids.app/printables/advent-bible-calendar.pdf', printable: 'advent-bible-calendar', label: 'Download the free PDF calendar' }}
              />
              <p className="pp-actions-note">One sheet to print, check off, and read from all season</p>
            </div>
          </div>
          <PdfDownloadLink className="pp-hero-art no-print pp-coverlink" href="https://faithfulkids.app/printables/advent-bible-calendar.pdf" printable="advent-bible-calendar">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://d3g07v1w0lehiv.cloudfront.net/hub-thumbs/heroes/advent-bible-calendar-1200.webp"
              srcSet="https://d3g07v1w0lehiv.cloudfront.net/hub-thumbs/heroes/advent-bible-calendar-720.webp 720w, https://d3g07v1w0lehiv.cloudfront.net/hub-thumbs/heroes/advent-bible-calendar-1200.webp 1200w"
              sizes="(min-width: 900px) 540px, 100vw"
              alt="A child opening a numbered Advent calendar door shaped like a little town, with the nativity at its centre"
              width={1200} height={800} fetchPriority="high"
            />
          </PdfDownloadLink>
        </header>

        <section className="pp-section">
          <h2 className="pp-h2">The 25 Readings</h2>
          <div className="pp-tablewrap">
            <table className="pp-table">
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Title</th>
                  <th>Reading</th>
                  <th>The story in one line</th>
                </tr>
              </thead>
              <tbody>
                {days.map(d => (
                  <tr key={d.day}>
                    <td className="pp-day">Dec <b>{d.day}</b></td>
                    <td className="pp-title">{d.title}</td>
                    <td className="pp-ref">{d.scripture}</td>
                    <td className="pp-sum">{d.summary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="pp-section pp-faq">
          <h2 className="pp-h2">Advent Reading Questions</h2>
          <div>
            {faqs.map(f => (
              <div key={f.q} className="pp-faq-item">
                <h3>{f.q}</h3>
                <p>{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="no-print pp-more">
          <p>
            Make it a full Advent: hang an ornament a day with our printable{' '}
            <a href="/printables/jesse-tree">Jesse Tree set</a>, add the{' '}
            <a href="/printables/bible-word-search/christmas">Christmas word search</a>,{' '}
            <a href="/printables/christmas-coloring-pages">Christmas coloring pages</a>, and{' '}
            <a href="/blog/christmas-bible-trivia">80 Christmas Bible trivia questions</a>{' '}
            for the party.
          </p>
          <p>
            And for the other eleven months: Faithful Kids tells the whole Bible in 300+ short video
            lessons with a quiz after every story.{' '}
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
        heading="Twenty-five readings. Now let them watch the story."
        body="Faithful Kids tells the whole Bible in 300+ short video lessons, about two minutes each, with a quiz after every story so you can see what your child took in. Here is the night the readings lead to."
        source="advent-bible-calendar"
      />

      <SiteFooter />
    </>
  )
}
