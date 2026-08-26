import type { Metadata } from 'next'
import { SiteNav, SiteFooter } from '../../components/SiteChrome'
import PrintButton from '../PrintButton'
import { EmailCaptureCard } from '../../blog/EmailCaptureCard'
import { COLORING_PAGES, CDN } from '@/lib/coloring-pages'
import { PrintableCta } from '../PrintableCta'
import printableVideos from '@/lib/printable-videos.json'

/**
 * Christmas coloring pages hub.
 * Target: "nativity coloring pages" — 1,632/mo at keyword difficulty 0 (DataForSEO
 * clickstream, Aug 26 2026), plus the variant cluster around it.
 */

const PAGES = COLORING_PAGES.filter(p => p.season === 'christmas')

export const metadata: Metadata = {
  title: 'Christian Christmas Coloring Pages — Free',
  description: 'Free printable nativity and Christian Christmas coloring pages: the angel and Mary, the journey to Bethlehem, the shepherds, the wise men. No sign-up.',
  keywords: ['nativity coloring pages', 'christian christmas coloring pages', 'christmas coloring pages religious', 'nativity scene coloring pages', 'advent coloring pages', 'wise men coloring page', 'shepherds coloring page'],
  alternates: { canonical: 'https://faithfulkids.app/printables/christmas-coloring-pages' },
  openGraph: {
    title: 'Christian Christmas Coloring Pages — Free',
    description: 'Free printable nativity and Christian Christmas coloring pages: the angel and Mary, the journey to Bethlehem, the shepherds, the wise men. No sign-up.',
    url: 'https://faithfulkids.app/printables/christmas-coloring-pages',
    siteName: 'Faithful Kids',
    type: 'website',
    images: [{ url: `${CDN}/nativity-scene.png`, width: 1024, height: 1536 }],
  },
}

export default function Page() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Christian Christmas Coloring Pages — Free',
    description: 'Free printable nativity and Christian Christmas coloring pages: the angel and Mary, the journey to Bethlehem, the shepherds, the wise men. No sign-up.',
    url: 'https://faithfulkids.app/printables/christmas-coloring-pages',
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
        <h1>Christian Christmas Coloring Pages</h1>
        <p className="blog-hero-sub">Six nativity pages, from the angel visiting Mary to the wise men arriving. Free to print, no email, no sign-up.</p>
        <div style={{ marginTop: 18 }}><PrintButton /></div>
      </section>

      <section className="cp-intro no-print">
        <p>The Christmas story runs longer than the stable, and these pages follow it in order — the angel and Mary, the road to Bethlehem, the manger, the shepherds on the hillside, and the wise men who turned up much later than the cards suggest.</p>
        <p>They print one to a sheet with bold outlines, which matters in December when you are handing pages to a room of children and want them to actually finish one.</p>
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
        <EmailCaptureCard magnet="coloring-pages" source="blog-inline" sourcePost="christmas-coloring-pages" />
      </section>

      <section className="cp-outro no-print">
        <h2>Which page for which week of Advent</h2>
        <p>
          In order, these six run from the angel visiting Mary through to the wise men arriving,
          which is roughly the shape of Advent. One a week through December works well, with the
          nativity scene saved for the last week because it takes the longest to finish.
        </p>
        <p>
          The wise men page is worth doing last for a second reason: they arrived long after the
          night in the stable, and coloring them separately is the easiest way a child ever learns
          that.
        </p>

        <h2>What children usually get wrong about Christmas</h2>
        <p>
          Almost every nativity set puts the wise men beside the manger on the same night, and
          almost every child therefore believes they were. They arrived considerably later, at a
          house rather than a stable, which is why they get their own page here instead of being
          crowded into the scene.
        </p>
        <p>
          The other quiet correction these pages make is the journey. Bethlehem was roughly ninety
          miles from Nazareth, and a child who colors a long road with a small town at the end of
          it remembers that the story starts with a hard walk rather than a stable door.
        </p>

        <h2>Printing these for a class</h2>
        <p>
          Print as many copies as you need for Sunday school, a nativity rehearsal, a homeschool
          group or a church. No licence, no attribution required. Every sheet carries our name in
          the bottom margin, and nothing else is asked of you.
        </p>

        <h2>Using these through Advent</h2>
        <p>One page a week through Advent works well, taken in the order they appear here. Children who color the journey to Bethlehem before they color the manger tend to remember that it was a long walk, not a short scene, and that small correction sticks for years.</p>
        <p>
          These sit alongside the full set of{' '}
          <a href="/printables/bible-coloring-pages">Bible coloring pages</a> — 26 scenes covering
          the whole story, all free to print.
        </p>
      </section>
      <PrintableCta
        {...(printableVideos as Record<string, { videoSrc: string; posterSrc: string; videoTitle: string; duration: string | null }>)._default}
        duration={(printableVideos as Record<string, { duration: string | null }>)._default.duration ?? undefined}
        heading="The Christmas story is longer than the stable"
        body="Six pages cover it in order, from the angel to the wise men. The episodes tell it properly, with a quiz afterwards, and 200 more stories waiting once December is over."
        source="christmas-hub"
      />


      <section className="blog-bottom-cta no-print">
        <div className="blog-bottom-cta-inner">
          <h2>The story behind each page</h2>
          <p>
            Every scene here is an episode in the Faithful Kids library — a few minutes long, with a
            quiz afterwards so you can see what your child actually understood.
          </p>
          <a className="btn-primary" href="/quiz?ref=christmas-coloring">Start your child&rsquo;s Bible journey</a>
        </div>
      </section>

      <div className="no-print"><SiteFooter /></div>
    </>
  )
}
