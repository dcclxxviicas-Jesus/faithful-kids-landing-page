import { SiteNav, SiteFooter } from '../../components/SiteChrome'
import PrintButton from '../PrintButton'
import { PrintableCta } from '../PrintableCta'
import printableVideos from '@/lib/printable-videos.json'
import {
  OT_GROUPS, NT_GROUPS, OT_BOOKS, NT_BOOKS, ALL_BOOKS, OT_CHAPTERS, NT_CHAPTERS,
} from '@/lib/books-of-the-bible'

const GREEN = '#16a34a'
const GREEN_DARK = '#15803d'

/* Target: "books of the bible printable" — 1,000/mo ads, 402/mo clickstream,
   KD 0; "books of the bible bookmark" 390/mo KD 0 (DataForSEO Oct 29, 2026).
   SERP is Pinterest, Etsy and worksheet blogs. Exact phrase leads the title. */
export const metadata = {
  title: { absolute: 'Books of the Bible — Free Printable Chart & Bookmarks' },
  description: `All ${ALL_BOOKS.length} books of the Bible on one free printable chart — in order, in their groups, with chapter counts — plus cut-out bookmarks. No sign-up.`,
  alternates: { canonical: 'https://faithfulkids.app/printables/books-of-the-bible' },
  openGraph: {
    title: 'Books of the Bible — Free Printable Chart & Bookmarks',
    description: `All ${ALL_BOOKS.length} books in order with chapter counts, plus printable bookmarks. Free, no sign-up.`,
    url: 'https://faithfulkids.app/printables/books-of-the-bible',
    siteName: 'Faithful Kids',
    type: 'article',
    images: [{ url: 'https://d3g07v1w0lehiv.cloudfront.net/wordsearch-images/books-of-the-bible.png', width: 1536, height: 1024 }],
  },
}

const faqs = [
  {
    q: 'How many books are in the Bible?',
    a: `Protestant Bibles have ${ALL_BOOKS.length} books: ${OT_BOOKS.length} in the Old Testament and ${NT_BOOKS.length} in the New Testament. Catholic Bibles include seven more Old Testament books (the deuterocanonical books, such as Tobit and 1–2 Maccabees), and Orthodox Bibles a few beyond that — so if your child's count differs from a friend's, both may be right for their tradition. This chart shows the ${ALL_BOOKS.length} books all those traditions share.`,
  },
  {
    q: 'What order are the books of the Bible in?',
    a: 'The Old Testament runs from Genesis to Malachi, grouped as Law, History, Poetry and Wisdom, and the Prophets. The New Testament runs from Matthew to Revelation: the four Gospels, Acts, the letters, and Revelation. The order is by type of book, not by when events happened — which is why a chart grouped by section is easier to memorize than a bare list.',
  },
  {
    q: 'How many chapters are in the Bible?',
    a: `${(OT_CHAPTERS + NT_CHAPTERS).toLocaleString()} chapters in all — ${OT_CHAPTERS} in the Old Testament and ${NT_CHAPTERS} in the New. The longest book is Psalms with 150 chapters; several letters, like Philemon, Jude, and 2 and 3 John, are a single chapter each.`,
  },
  {
    q: 'Can I print copies for my class or church?',
    a: 'Yes. The chart and bookmarks are free with no sign-up, and you are welcome to photocopy them for your family, Sunday school class, homeschool co-op, or church. The printed page carries our web address so families can find it again at home.',
  },
  {
    q: 'What is the best way for kids to memorize the books of the Bible?',
    a: 'In groups, not as one 66-item list. Learn the five books of the Law first, then the Gospels — the groups on this chart are the natural chunks. A bookmark in their Bible keeps the order in front of them every time they look something up, and the books-of-the-Bible song from Sunday school works because melody carries lists further than repetition alone.',
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

function GroupBlock({ name, blurb, books }: { name: string; blurb: string; books: { name: string; chapters: number }[] }) {
  return (
    <div style={{ marginBottom: '0.9rem' }}>
      <h3 style={{ fontSize: '1.02rem', fontWeight: 800, margin: '0 0 2px', color: GREEN_DARK }}>
        {name} <span style={{ fontWeight: 600, color: '#6b7280', fontSize: '0.85rem' }}>· {books.length} {books.length === 1 ? 'book' : 'books'}</span>
      </h3>
      <p style={{ margin: '0 0 7px', color: '#6b7280', fontSize: '0.88rem' }}>{blurb}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {books.map(book => (
          <span key={book.name} style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '4px 10px', fontSize: '0.9rem', fontWeight: 600 }}>
            {book.name} <span style={{ color: '#6b7280', fontWeight: 500, fontSize: '0.8rem' }}>{book.chapters}</span>
          </span>
        ))}
      </div>
    </div>
  )
}

function Bookmark({ title, groups }: { title: string; groups: typeof OT_GROUPS }) {
  return (
    <div style={{ border: '2px dashed #9ca3af', borderRadius: 6, padding: '14px 12px', width: 210, flexShrink: 0 }}>
      <p style={{ margin: '0 0 2px', fontWeight: 800, fontSize: '0.92rem', color: GREEN_DARK, textAlign: 'center' }}>{title}</p>
      <p style={{ margin: '0 0 8px', textAlign: 'center', color: '#6b7280', fontSize: '0.7rem' }}>
        {groups.reduce((n, g) => n + g.books.length, 0)} books
      </p>
      {groups.map(g => (
        <div key={g.name} style={{ marginBottom: 7 }}>
          <p style={{ margin: '0 0 1px', fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.03em', color: GREEN }}>{g.name}</p>
          <p style={{ margin: 0, fontSize: '0.74rem', lineHeight: 1.45, color: '#374151' }}>
            {g.books.map(book => book.name).join(' · ')}
          </p>
        </div>
      ))}
      <p style={{ margin: '8px 0 0', textAlign: 'center', fontSize: '0.62rem', color: '#9ca3af' }}>FaithfulKids.app</p>
    </div>
  )
}

export default function BooksOfTheBiblePage() {
  const vids = printableVideos as Record<string, { videoSrc: string; posterSrc: string; videoTitle: string; duration: string | null }>
  const clip = vids._default
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <SiteNav active="printables" />

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '24px' }}>
        <div className="no-print" style={{ textAlign: 'right', marginBottom: '0.75rem' }}>
          <PrintButton />
        </div>

        <header style={{ borderBottom: `3px solid ${GREEN}`, paddingBottom: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-sm.png" alt="Faithful Kids logo" width={36} height={36} style={{ display: 'block' }} />
            <span style={{ fontSize: '1.05rem', fontWeight: 700, color: GREEN }}>Faithful Kids</span>
          </div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
            Books of the Bible — Printable Chart &amp; Bookmarks
          </h1>
          <p style={{ margin: '0.5rem 0 0', color: '#4b5563', fontSize: '1.02rem', lineHeight: 1.6 }}>
            All <strong>{ALL_BOOKS.length} books of the Bible in order</strong> — {OT_BOOKS.length} Old
            Testament, {NT_BOOKS.length} New Testament — grouped the way the Bible groups them, with
            chapter counts for every book. Print the chart for the wall and the bookmarks for their
            Bibles. Free, no sign-up.
          </p>
          <p className="no-print" style={{ margin: '0.9rem 0 0' }}>
            <a
              href="https://d3g07v1w0lehiv.cloudfront.net/printables/books-of-the-bible-chart.pdf"
              style={{ display: 'inline-block', background: GREEN, color: '#fff', fontWeight: 700, padding: '12px 22px', borderRadius: 12, textDecoration: 'none', boxShadow: `0 4px 0 ${GREEN_DARK}` }}
            >
              Download the free PDF &rarr;
            </a>
            <span style={{ display: 'inline-block', marginLeft: 12, color: '#6b7280', fontSize: '0.9rem' }}>
              Chart + bookmarks, two sheets
            </span>
          </p>
        </header>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.01em' }}>
            The Old Testament <span style={{ fontWeight: 600, color: '#6b7280', fontSize: '1rem' }}>— {OT_BOOKS.length} books · {OT_CHAPTERS} chapters</span>
          </h2>
          {OT_GROUPS.map(g => <GroupBlock key={g.name} {...g} />)}
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.01em' }}>
            The New Testament <span style={{ fontWeight: 600, color: '#6b7280', fontSize: '1rem' }}>— {NT_BOOKS.length} books · {NT_CHAPTERS} chapters</span>
          </h2>
          {NT_GROUPS.map(g => <GroupBlock key={g.name} {...g} />)}
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.01em' }}>Cut-Out Bookmarks</h2>
          <p style={{ color: '#4b5563', lineHeight: 1.6 }}>
            Print this page, cut along the dashed lines, and the whole order of Scripture lives in
            their Bible — in front of them every time they look a verse up.
          </p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Bookmark title="Old Testament" groups={OT_GROUPS} />
            <Bookmark title="New Testament" groups={NT_GROUPS} />
          </div>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.01em' }}>How to actually memorize them</h2>
          <p style={{ color: '#4b5563', lineHeight: 1.65 }}>
            Nobody memorizes a {ALL_BOOKS.length}-item list — they memorize the groups. Start with
            the five books of the Law, then the four Gospels: nine books in, the two Testaments
            already have shape. Add one group a week and let the chart do the reviewing. For
            practice that doesn&apos;t feel like review, our free{' '}
            <a href="/printables/bible-word-search/books-of-the-bible" style={{ color: GREEN, fontWeight: 700 }}>books of the Bible word search</a>{' '}
            hides twelve of them in a grid, and every book below has its own trivia page.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.01em' }}>Common questions</h2>
          {faqs.map(f => (
            <div key={f.q} style={{ marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 4px' }}>{f.q}</h3>
              <p style={{ margin: 0, color: '#4b5563', lineHeight: 1.65 }}>{f.a}</p>
            </div>
          ))}
        </section>

        <section className="no-print" style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.01em' }}>
            Know the order? Now test the stories
          </h2>
          <p style={{ color: '#4b5563', lineHeight: 1.6 }}>
            Every book on the chart has its own free trivia page — tap any book:
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {ALL_BOOKS.map(book => (
              <a key={book.name} href={`/blog/${book.triviaSlug}`} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '4px 10px', fontSize: '0.88rem', fontWeight: 600, color: '#374151', textDecoration: 'none' }}>
                {book.name}
              </a>
            ))}
          </div>
        </section>

        <PrintableCta
          {...clip}
          duration={clip.duration ?? undefined}
          heading="The order is the map. The stories are the point."
          body={`Knowing where Exodus sits is the start — knowing what happened there is the goal. ${clip.videoTitle} tells its story in about two minutes and ends with a quiz, one of 300+ episodes from Genesis to Revelation.`}
          source="books-of-the-bible"
        />

        <section className="no-print" style={{ borderTop: `2px solid ${GREEN}`, paddingTop: '1.25rem', margin: '2rem 0 2.5rem' }}>
          <p style={{ color: '#4b5563', lineHeight: 1.65 }}>
            More free printables: the{' '}
            <a href="/printables/bible-trivia-pack" style={{ color: GREEN, fontWeight: 700 }}>100-question trivia pack</a>,{' '}
            <a href="/printables/bible-word-search" style={{ color: GREEN, fontWeight: 700 }}>12 Bible word searches</a>,{' '}
            <a href="/printables/bible-crossword" style={{ color: GREEN, fontWeight: 700 }}>7 crosswords</a>, and{' '}
            <a href="/printables/bible-coloring-pages" style={{ color: GREEN, fontWeight: 700 }}>26 coloring pages</a> — all free,{' '}
            <a href="/printables" style={{ color: GREEN, fontWeight: 700 }}>the whole library here</a>.
          </p>
          <p style={{ color: '#4b5563', lineHeight: 1.65 }}>
            And when they&apos;re ready to go book by book for real: Faithful Kids tells the whole
            Bible in 300+ short video lessons with a quiz after every story.{' '}
            <a href="/quiz" style={{ color: GREEN, fontWeight: 700 }}>Start your free trial</a>
            {' '}&middot; churches and Sunday schools get it{' '}
            <a href="/churches" style={{ color: GREEN, fontWeight: 700 }}>free</a>.
          </p>
        </section>
      </main>

      <SiteFooter />
    </>
  )
}
