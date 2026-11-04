import type { Metadata } from 'next'
import { SiteNav, SiteFooter } from '../../components/SiteChrome'
import PrintButton from '../PrintButton'
import { PrintableCta } from '../PrintableCta'
import printableVideos from '@/lib/printable-videos.json'
import { EmailCaptureCard } from '../../blog/EmailCaptureCard'
import { TIMELINE, ERA_COUNT } from '@/lib/bible-maps'
import '../bible-maps/maps.css'

/**
 * Bible timeline.
 *
 * Target: "bible timeline" 2,956/mo clickstream (9,900 ads) at KD 15 — the
 * single biggest term in the geography/history sweep (DataForSEO Nov 2,
 * 2026) — plus "bible timeline for kids" and "printable bible timeline".
 * The SERP is small church sites and one Google Play app; its AI Overview
 * cites only 6 refs. Artifact shape: searchers want the chart.
 *
 * Dating policy (do not "fix"): conventional/traditional dates with
 * uncertainty stated in-line. Genesis 1–11 gets NO dates — inventing them
 * would take a side the product deliberately doesn't take (see /beliefs).
 */

export const metadata: Metadata = {
  title: { absolute: 'Bible Timeline for Kids, Free Printable Chart' },
  description: `The whole Bible in order on one free printable timeline, ${ERA_COUNT} eras from Creation to the early church, with dates, key events and books. No sign-up.`,
  keywords: [
    'bible timeline', 'bible timeline for kids', 'printable bible timeline',
    'bible timeline printable', 'bible history timeline', 'old testament timeline',
  ],
  alternates: { canonical: 'https://faithfulkids.app/printables/bible-timeline' },
  openGraph: {
    title: 'Bible Timeline for Kids, Free Printable Chart',
    description: `${ERA_COUNT} eras from Creation to the early church on one printable chart, dates, key events, and the books of the Bible each era lives in.`,
    url: 'https://faithfulkids.app/printables/bible-timeline',
    siteName: 'Faithful Kids',
    type: 'article',
    images: [{ url: 'https://d3g07v1w0lehiv.cloudfront.net/bible-maps/bible-timeline-og.png', width: 1200, height: 630 }],
  },
}

const faqs = [
  {
    q: 'How many years does the Bible cover?',
    a: 'From Abraham (around 2000 BC) to John’s vision on Patmos (around AD 95) is roughly 2,100 years of history the Bible itself dates. Genesis 1–11, Creation through Babel, stands before that span, and the Bible gives those chapters no dates, so an honest timeline doesn’t either.',
  },
  {
    q: 'When did Jesus live?',
    a: 'He was born around 6–4 BC, the monk who later invented our calendar miscounted by a few years, which is why "BC" ends slightly before Jesus’ birth, and was crucified and raised around AD 30 or 33. His public ministry lasted about three years.',
  },
  {
    q: 'What are the "400 silent years"?',
    a: 'The gap between Malachi, the last Old Testament book (around 430 BC), and the events of the Gospels. No new Scripture was written, but the map changed completely: Alexander the Great brought Greek language and culture, the Maccabees won a short independence, and then Rome took over, which is why the New Testament opens with Roman soldiers, Greek-speaking crowds, and a King Herod nobody voted for.',
  },
  {
    q: 'Are the dates on this timeline exact?',
    a: 'The late ones are solid, Assyria took the northern kingdom in 722 BC and Babylon destroyed Jerusalem in 586 BC, dates confirmed by records outside the Bible. The early ones are traditional approximations: the exodus is traditionally dated around 1446 BC while many scholars argue for around 1270 BC, and the chart says so rather than picking a side. Anything marked "c." (circa) means "around."',
  },
]

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(f => ({
    '@type': 'Question', name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
}

export default function BibleTimelinePage() {
  const vids = printableVideos as Record<string, { videoSrc: string; posterSrc: string; videoTitle: string; duration: string | null }>
  const clip = vids._default
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <div className="no-print"><SiteNav active="printables" /></div>

      <main className="bm-wrap">
        <div className="no-print" style={{ textAlign: 'right', marginBottom: '0.5rem' }}>
          <PrintButton />
        </div>
        <nav className="bm-crumb no-print">
          <a href="/printables">Printables</a>
          <span>›</span>
          <span>Bible Timeline</span>
        </nav>

        <header className="bm-head">
          <h1>Bible Timeline for Kids, the Whole Story in Order</h1>
          <p className="bm-sub">
            {ERA_COUNT} eras from Creation to the early church, what happened, roughly when, and
            which books of the Bible each era lives in. Honest about dates: firm where history is
            firm, &ldquo;c.&rdquo; where it isn&rsquo;t, and silent where the Bible is silent.
          </p>
          <p className="no-print" style={{ margin: '0.9rem 0 0' }}>
            <a className="bm-dl" href="https://d3g07v1w0lehiv.cloudfront.net/printables/bible-timeline.pdf">
              Download the free PDF &rarr;
            </a>
            <span className="bm-dl-note">One-sheet wall chart, Letter size</span>
          </p>
        </header>

        <div className="bt-rail">
          {TIMELINE.map(era => (
            <article className="bt-era" key={era.era}>
              <h2>{era.era}</h2>
              <div>
                <span className="bt-dates">{era.dates}</span>
                <span className="bt-books">{era.books}</span>
              </div>
              {era.note && <p className="bt-note">{era.note}</p>}
              <div className="bt-events">
                {era.events.map(e => <span key={e}>{e}</span>)}
              </div>
              {era.storySlug && (
                <p className="bt-watch no-print">
                  <a href={`/blog/${era.storySlug}`}>Read a story from this era &rarr;</a>
                </p>
              )}
            </article>
          ))}
        </div>

        <div className="bm-body">
          <section>
            <h2>How to use the timeline</h2>
            <p>
              The Bible is arranged by type of book, not by time, Job sits near Psalms though its
              story is patriarch-era, and the prophets cluster at the Old Testament&rsquo;s end
              though they preached in the middle of its history. That is why children (and plenty
              of adults) lose the plot. A timeline fixes it: thirteen eras, learned in order, give
              every story a shelf to sit on. When this week&rsquo;s lesson is Daniel, one finger on
              &ldquo;The Exile&rdquo; shows why he is in Babylon at all.
            </p>
            <p>
              It pairs naturally with the{' '}
              <a href="/printables/books-of-the-bible">books of the Bible chart</a> one sheet for
              where a book sits on the shelf, one for where it sits in time, and with the{' '}
              <a href="/printables/bible-maps">six printable Bible maps</a>, which do the same job
              for place that this chart does for time.
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
        </div>

        <section className="cp-capture no-print">
          <EmailCaptureCard
            magnet="coloring-pages"
            source="blog-inline"
            sourcePost="bible-timeline"
            title="🖍️ Free too: all 26 Bible coloring pages"
            subtitle="One PDF, Creation to the Empty Tomb, in the same order as this timeline."
          />
        </section>

        <PrintableCta
          {...clip}
          duration={clip.duration ?? undefined}
          heading="The timeline is the shelf. The episodes are the books."
          body={`Faithful Kids tells these eras as 300+ short video stories in order, Genesis to Revelation, ${clip.videoTitle} runs about two minutes and ends with a quiz so you can see what stuck.`}
          source="bible-timeline"
        />
      </main>

      <div className="no-print"><SiteFooter /></div>
    </>
  )
}
