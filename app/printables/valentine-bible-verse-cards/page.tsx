import { SiteNav, SiteFooter } from '../../components/SiteChrome'
import PrintButton from '../PrintButton'
import { PrintableCta } from '../PrintableCta'
import printableVideos from '@/lib/printable-videos.json'
import { VALENTINE_CARDS } from '@/lib/valentine-cards'
import './valentine-cards.css'

const GREEN = '#16a34a'
const GREEN_DARK = '#15803d'
const CDN = 'https://d3g07v1w0lehiv.cloudfront.net/valentine-cards'

/* Target: "valentines bible verses" cluster — 4,400/mo ads KD 0 annualized,
   February peak much higher (DataForSEO, verified Oct 13 + 29, 2026). The
   page-1 winners on the kids variant are printable VERSE CARDS, not
   articles — so this ships the cards. */
export const metadata = {
  title: { absolute: 'Valentine Bible Verse Cards — Free Printable for Kids' },
  description: `${VALENTINE_CARDS.length} free printable Valentine cards with short Bible verses about love — line art kids can color, then hand out at school, church, or class. No sign-up.`,
  alternates: { canonical: 'https://faithfulkids.app/printables/valentine-bible-verse-cards' },
  openGraph: {
    title: 'Valentine Bible Verse Cards — Free Printable for Kids',
    description: `${VALENTINE_CARDS.length} printable Valentine cards with Bible verses about love, drawn as line art kids color themselves. Free, no sign-up.`,
    url: 'https://faithfulkids.app/printables/valentine-bible-verse-cards',
    siteName: 'Faithful Kids',
    type: 'article',
    images: [{ url: `${CDN}/love-one-another.png`, width: 1024, height: 1024 }],
  },
}

const faqs = [
  {
    q: 'How do I print and use these Valentine Bible verse cards?',
    a: `Press print — the ${VALENTINE_CARDS.length} cards lay out four to a sheet with cut lines. Kids color the picture, sign the To and From lines, cut them out, and hand them to classmates, church friends, teachers, or grandparents. They work for a class Valentine exchange anywhere a store-bought card would.`,
  },
  {
    q: 'Are these cards okay for a public school Valentine exchange?',
    a: 'That depends on your school: students sharing cards with religious messages is generally permitted as personal speech in US public schools, but policies vary, so check with the teacher first. For church, Sunday school, Christian school, co-op, or family use, they are exactly what they look like.',
  },
  {
    q: 'What Bible verses work best for Valentine\'s Day?',
    a: 'Short love verses children can read themselves: "Love one another" (John 13:34), "A friend loves at all times" (Proverbs 17:17), "Love is patient, love is kind" (1 Corinthians 13:4), and "We love because he first loved us" (1 John 4:19). Each card carries one short verse with its reference so kids and recipients can look it up.',
  },
  {
    q: 'Can I photocopy these for my class or church?',
    a: 'Yes. The cards are free with no sign-up, and you are welcome to print or photocopy them for your family, classroom, Sunday school, or church. The printed sheet carries our web address so families can find the set again at home.',
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

export default function ValentineCardsPage() {
  const vids = printableVideos as Record<string, { videoSrc: string; posterSrc: string; videoTitle: string; duration: string | null }>
  const clip = vids._default
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <SiteNav active="printables" />

      <main style={{ maxWidth: 960, margin: '0 auto', padding: '24px' }}>
        <div className="no-print" style={{ textAlign: 'right', marginBottom: '0.75rem' }}>
          <PrintButton />
        </div>

        <header className="vc-head" style={{ borderBottom: `3px solid ${GREEN}`, paddingBottom: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-sm.png" alt="Faithful Kids logo" width={36} height={36} style={{ display: 'block' }} />
            <span style={{ fontSize: '1.05rem', fontWeight: 700, color: GREEN }}>Faithful Kids</span>
          </div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
            Valentine Bible Verse Cards for Kids
          </h1>
          <p style={{ margin: '0.5rem 0 0', color: '#4b5563', fontSize: '1.02rem', lineHeight: 1.6 }}>
            <strong>{VALENTINE_CARDS.length} free printable Valentine cards</strong>, each with a short
            Bible verse about love and a picture drawn as line art — so kids color their own cards
            before handing them out. Four to a sheet, To/From lines, cut and go. Free, no sign-up.
          </p>
        </header>

        <section className="vc-grid-wrap">
          <div className="vc-grid">
            {VALENTINE_CARDS.map(card => (
              <div key={card.slug} className="vc-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${CDN}/${card.slug}.png`}
                  alt={`Valentine Bible verse coloring card — ${card.verse} (${card.ref})`}
                  width={1024}
                  height={1024}
                  loading="lazy"
                />
                <p className="vc-verse">{card.verse}</p>
                <p className="vc-ref">{card.ref}</p>
                <div className="vc-tofrom">
                  <span>To: ______________</span>
                  <span>From: ______________</span>
                </div>
                <p className="vc-credit">FaithfulKids.app</p>
              </div>
            ))}
          </div>
        </section>

        <section className="no-print" style={{ margin: '2rem 0' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.01em' }}>How families use these</h2>
          <p style={{ color: '#4b5563', lineHeight: 1.65 }}>
            Print one sheet per child and let them color at the kitchen table the week before
            Valentine&apos;s Day — the coloring is the point, since a card they made beats a card
            they bought. Sunday school classes print a stack and make it the craft; homeschool
            co-ops pair them with copywork of each verse. Because each card carries its reference,
            every card handed out is a verse someone can look up.
          </p>
          <p style={{ color: '#4b5563', lineHeight: 1.65 }}>
            Want to go deeper than the fragments on the cards? Our{' '}
            <a href="/blog/bible-verses-about-love-for-kids" style={{ color: GREEN, fontWeight: 700 }}>Bible verses about love for kids</a>{' '}
            guide walks through the full passages, and{' '}
            <a href="/blog/love-one-another-for-kids" style={{ color: GREEN, fontWeight: 700 }}>the Love One Another story</a>{' '}
            tells where John 13:34 comes from.
          </p>
        </section>

        <section className="no-print" style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.01em' }}>Common questions</h2>
          {faqs.map(f => (
            <div key={f.q} style={{ marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 4px' }}>{f.q}</h3>
              <p style={{ margin: 0, color: '#4b5563', lineHeight: 1.65 }}>{f.a}</p>
            </div>
          ))}
        </section>

        <PrintableCta
          {...clip}
          duration={clip.duration ?? undefined}
          heading="The verses are the start. The stories are the rest."
          body={`Each card carries one line of Scripture — ${clip.videoTitle} tells a whole story in about two minutes and ends with a quiz, one of 300+ episodes from Genesis to Revelation.`}
          source="valentine-cards"
        />

        <section className="no-print" style={{ borderTop: `2px solid ${GREEN}`, paddingTop: '1.25rem', margin: '2rem 0 2.5rem' }}>
          <p style={{ color: '#4b5563', lineHeight: 1.65 }}>
            More free printables:{' '}
            <a href="/printables/bible-coloring-pages" style={{ color: GREEN, fontWeight: 700 }}>26 Bible coloring pages</a>,{' '}
            <a href="/printables/bible-word-search" style={{ color: GREEN, fontWeight: 700 }}>12 word searches</a>,{' '}
            <a href="/printables/books-of-the-bible" style={{ color: GREEN, fontWeight: 700 }}>the books of the Bible chart</a>, and{' '}
            <a href="/printables" style={{ color: GREEN, fontWeight: 700 }}>the whole library</a>.
          </p>
          <p style={{ color: '#4b5563', lineHeight: 1.65 }}>
            And past February: Faithful Kids tells the whole Bible in 300+ short video lessons with
            a quiz after every story.{' '}
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
