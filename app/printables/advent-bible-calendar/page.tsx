import { SiteNav, SiteFooter } from '../../components/SiteChrome'
import PrintButton from '../PrintButton'
import adventReadings from '@/lib/advent-readings.json'

const EMERALD = '#059669'

export const metadata = {
  title: 'Printable Advent Bible Calendar — 25 Daily Readings',
  description:
    'A free printable Advent Bible reading calendar: 25 short daily readings from the first promise to the manger, with one-line summaries. No sign-up, free PDF.',
  alternates: { canonical: 'https://faithfulkids.app/printables/advent-bible-calendar' },
  openGraph: {
    title: 'Printable Advent Bible Calendar — 25 Daily Readings',
    description: 'Free printable Advent reading plan: 25 short Bible readings, December 1 to Christmas Day.',
    images: [{ url: 'https://d3g07v1w0lehiv.cloudfront.net/jesse-tree/advent-hero.png', width: 1536, height: 1024 }],
  },
}

type Day = { day: number; title: string; scripture: string; summary: string }
const days = adventReadings as Day[]

const faqs = [
  {
    q: 'What is an Advent Bible reading calendar?',
    a: 'It is a reading plan shaped like an Advent calendar: one short Bible passage for each day from December 1 to Christmas Day. This plan follows the story in order — ten days of promises and prophecies, then the events of the first Christmas from Gabriel\'s announcement to the Word made flesh — so by December 25 your family has read the whole Christmas story from Scripture itself, not just the highlights.',
  },
  {
    q: 'How long does each day take?',
    a: 'Most readings are ten to twenty verses — about three to five minutes read aloud. The one-line summary beside each day works as a conversation starter: read the passage, then let a child put it in their own words.',
  },
  {
    q: 'What ages is this for?',
    a: 'The readings come straight from the Bible, so it works for any age that can listen to Scripture read aloud — roughly 5 and up. For younger children, read the passage and lean on the one-line summary; older kids can take turns reading the passages themselves.',
  },
  {
    q: 'Can I print copies for my church or class?',
    a: 'Yes — the plan and the PDF are free with no sign-up, and you are welcome to photocopy them for your family, Sunday school class, or church. The printed page carries our web address so families can find it again at home.',
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
            Printable Advent Bible Reading Calendar
          </h1>
          <p style={{ margin: '0.5rem 0 0', color: '#4b5563', fontSize: '1.02rem', lineHeight: 1.6 }}>
            A free Advent reading plan for families: <strong>25 short Bible readings</strong>, one
            for each day from December 1 to Christmas Day — starting with the first promise in the
            garden and ending at the manger. Ten days of prophecy, fifteen days of the Christmas
            story itself, a few minutes a night.
          </p>
          <p className="no-print" style={{ margin: '0.9rem 0 0' }}>
            <a
              href="https://d3g07v1w0lehiv.cloudfront.net/printables/advent-bible-calendar.pdf"
              style={{ display: 'inline-block', background: EMERALD, color: '#fff', fontWeight: 700, padding: '12px 22px', borderRadius: 12, textDecoration: 'none', boxShadow: '0 4px 0 #047857' }}
            >
              Download the free PDF calendar &rarr;
            </a>
            <span style={{ display: 'inline-block', marginLeft: 12, color: '#6b7280', fontSize: '0.9rem' }}>
              One sheet to print, check off, and read from all season
            </span>
          </p>
        </header>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.01em' }}>
            The 25 Readings
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
              <thead>
                <tr style={{ background: '#ecfdf5', textAlign: 'left' }}>
                  <th style={{ padding: '8px 10px' }}>Day</th>
                  <th style={{ padding: '8px 10px' }}>Title</th>
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

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.01em' }}>Advent Reading Questions</h2>
          {faqs.map(f => (
            <div key={f.q} style={{ marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 4px' }}>{f.q}</h3>
              <p style={{ margin: 0, color: '#4b5563', lineHeight: 1.65 }}>{f.a}</p>
            </div>
          ))}
        </section>

        <section className="no-print" style={{ borderTop: `2px solid ${EMERALD}`, paddingTop: '1.25rem', marginBottom: '2.5rem' }}>
          <p style={{ color: '#4b5563', lineHeight: 1.65 }}>
            Make it a full Advent: hang an ornament a day with our printable{' '}
            <a href="/printables/jesse-tree" style={{ color: EMERALD, fontWeight: 700 }}>Jesse Tree set</a>, add the{' '}
            <a href="/printables/bible-word-search/christmas" style={{ color: EMERALD, fontWeight: 700 }}>Christmas word search</a>,{' '}
            <a href="/printables/christmas-coloring-pages" style={{ color: EMERALD, fontWeight: 700 }}>Christmas coloring pages</a>, and{' '}
            <a href="/blog/christmas-bible-trivia" style={{ color: EMERALD, fontWeight: 700 }}>80 Christmas Bible trivia questions</a>{' '}
            for the party.
          </p>
          <p style={{ color: '#4b5563', lineHeight: 1.65 }}>
            And for the other eleven months: Faithful Kids tells the whole Bible in 300+ short video
            lessons with a quiz after every story.{' '}
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
