import type { Metadata } from 'next'
import '../home.css'
import '../v2-pages.css'

import { SiteNav, SiteFooter } from '@/app/components/SiteChrome'
import { V2Shell, V2Hero, V2Head } from '@/app/v2-shell'
import { PrintableCta } from '@/app/printables/PrintableCta'
import printableVideos from '@/lib/printable-videos.json'

export const metadata: Metadata = {
  title: 'Free Printable Bible Activities for Kids',
  description:
    'Free printable Bible resources for families: 100 Bible trivia questions, a 30-day family Bible challenge, and a bedtime Bible kit. No sign-up required.',
  alternates: { canonical: 'https://faithfulkids.app/printables' },
}

const g = { color: 'var(--hv-green-dark)', fontWeight: 800 }

/* The ten packs, copied verbatim from app/printables/page.tsx — every href,
   title, description and detail line unchanged. */
const PACKS = [
  {
    href: '/printables/jesse-tree',
    emoji: '\u{1F384}',
    title: 'Jesse Tree — 25 Ornaments & Readings',
    description:
      'The whole Bible story from Creation to the manger, one ornament a day through Advent. Twenty-five printable ornaments drawn for coloring, each with its daily Scripture reading and a one-line summary to start the conversation.',
    details: 'December 1-25 \u00b7 Free PDF \u00b7 No email, no sign-up',
  },
  {
    href: '/printables/advent-bible-calendar',
    emoji: '\u{1F4C5}',
    title: 'Advent Bible Reading Calendar',
    description:
      'Twenty-five short readings from the first promise in the garden to the Word made flesh -- ten days of prophecy, then the Christmas story itself, a few minutes a night from December 1 to Christmas Day.',
    details: 'One sheet to print and check off \u00b7 Free PDF',
  },
  {
    href: '/printables/christmas-coloring-pages',
    emoji: '\u2B50',
    title: 'Christmas & Nativity Coloring Pages',
    description:
      'Six nativity pages following the Christmas story in order — the angel and Mary, the journey to Bethlehem, the stable, the shepherds on the hillside, and the wise men who arrived much later than the cards suggest.',
    details: 'One a week through Advent · No email, no sign-up',
  },
  {
    href: '/printables/easter-coloring-pages',
    emoji: '\u271D\uFE0F',
    title: 'Easter & Holy Week Coloring Pages',
    description:
      'Six pages walking Holy Week from Palm Sunday to the road to Emmaus. The cross page shows the empty cross rather than the crucifixion, so it works with younger children too.',
    details: 'One a day, Sunday to Sunday · No email, no sign-up',
  },
  {
    href: '/printables/bible-word-search',
    emoji: '🔍',
    title: 'Bible Word Search — 12 Puzzles',
    description:
      'Twelve printable Bible word searches — the whole-Bible classic plus story and season puzzles: Noah, Christmas, Thanksgiving, Easter, David and Goliath, the armor of God. Answer keys on the page.',
    details: 'Ages 6+ · Answer keys included · No email, no sign-up',
  },
  {
    href: '/printables/bible-crossword',
    emoji: '✏️',
    title: 'Bible Crossword Puzzles — 7 Puzzles',
    description:
      'Seven interlocking crosswords with clues drawn from the stories themselves — the whole-Bible puzzle plus Christmas, Noah, Moses, David and Goliath, Easter, and the miracles of Jesus. Playable in the browser, printable with answer keys.',
    details: 'Ages 6+ · Answer keys included · No email, no sign-up',
  },
  {
    href: '/printables/bible-coloring-pages',
    emoji: '🖍️',
    title: 'Bible Coloring Pages — 26 Printables',
    description:
      '26 Bible scenes drawn as clean line art for young children, Creation through the Empty Tomb, including full Christmas and Easter sets. Bold simple outlines with room for thick crayons, each with its Scripture reference.',
    details: 'Print the whole set or one page · No email, no sign-up',
  },
  {
    href: '/printables/books-of-the-bible',
    emoji: '📚',
    title: 'Books of the Bible — Chart & Bookmarks',
    description:
      'All 66 books in order on one chart, grouped the way the Bible groups them with chapter counts for every book, plus cut-out bookmarks for their Bibles. The groups are the memory trick.',
    details: 'One-page chart · 2 bookmarks · Free PDF · No sign-up',
  },
  {
    href: '/printables/bible-trivia-pack',
    emoji: '🏆',
    title: 'Bible Trivia Pack — 100 Questions',
    description:
      '100 kid-friendly Bible trivia questions in three difficulty levels, every answer with its Scripture reference. Perfect for family game night, Sunday school, road trips, or homeschool review.',
    details: 'Easy, medium & hard rounds · Answer key with verse references',
  },
  {
    href: '/printables/30-day-challenge',
    emoji: '📅',
    title: '30-Day Family Bible Challenge',
    description:
      'One month of short daily readings that walk your family through the big story of the Bible — creation to resurrection — with a summary and a discussion question for each day.',
    details: '30 daily readings · Discussion questions · Genesis through the Gospels',
  },
  {
    href: '/printables/bedtime-bible-kit',
    emoji: '🌙',
    title: 'Bedtime Bible Kit',
    description:
      'Seven nights of calm end-of-day routines: short Bible stories, memory verses, and simple prayers designed for the last ten minutes before lights out.',
    details: '7 nights · Bedtime stories · Memory verses · Simple prayers',
  },
]

function PrintablesV2() {
  return (
    <>
      <SiteNav active="printables" />

      <main id="main-content">

      <V2Hero
        art="printables"
        alt="A craft table with freshly printed Bible activity sheets fanned out, a jar of coloured pencils, crayons, scissors and paper stars"
        eyebrow="Free Downloads"
        title={<>Free Printable <span className="hv-love"><span className="l l1">B</span><span className="l l2">i</span><span className="l l3">b</span><span className="l l4">l</span><span className="l l1">e</span></span> Activities</>}
        sub={<>Print-ready Bible resources for families, homeschoolers, and Sunday school teachers.
          Completely free &mdash; no sign-up, no email required. Print as many copies as you like
          for your family, class, or church group.</>}
      />

      <section className="v2-section">
        <div className="v2-wrap">
          <div className="v2-grid is-3">
            {PACKS.map(pack => (
              <a key={pack.href} href={pack.href} className="v2-asset">
                <div className="v2-ico" aria-hidden="true">{pack.emoji}</div>
                <h3>{pack.title}</h3>
                <p>{pack.description}</p>
                <div className="v2-asset-meta">{pack.details}</div>
                <span className="v2-asset-go">View &amp; print free &rarr;</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="v2-section is-alt">
        <V2Head
          eyebrow="Who Makes These?"
          title="A gift from Faithful Kids"
          sub={<>These printables are made by Faithful Kids, a Bible video learning app for kids
            ages 7&ndash;15 &mdash; short story episodes, quizzes, and reflections that make
            Scripture stick. The printables are our gift to families either way. And if your kids
            like trivia on paper, they&apos;ll love the{' '}
            <a href="/bible-trivia" style={g}>free online trivia game</a>.</>}
        />
        <div className="v2-wrap is-narrow">
          <div className="v2-card">
            <div className="v2-ico" aria-hidden="true">🔗</div>
            <h3>Bloggers, churches &amp; newsletters</h3>
            <p>You&apos;re welcome to link to this page or any individual printable, and to use one
              screenshot of each pack in a roundup. Questions? Email{' '}
              <a href="mailto:team@faithfulkids.app" style={g}>team@faithfulkids.app</a>.</p>
          </div>
        </div>
      </section>

      <section className="hv-close">
        <ul className="hv-chips">
          <li><span aria-hidden="true">🎁</span>7-day free trial</li>
          <li><span aria-hidden="true">🔓</span>Cancel anytime</li>
          <li><span aria-hidden="true">🚫</span>Zero ads, ever</li>
        </ul>
        <h2>Want the stories behind the trivia?</h2>
        <p className="hv-close-fine" style={{ margin: '0 auto 22px', maxWidth: '36em' }}>
          Faithful Kids brings every one of these stories to life &mdash; 300+ short video episodes
          with quizzes and reflections, Genesis to Revelation.
        </p>
        <a className="hv-cta" href="/quiz">
          <span className="hv-cta-play" aria-hidden="true" />
          Get started
        </a>
      </section>

      {/* Unchanged component, unchanged copy: this block plays the actual
          episode beside the pitch and is the conversion path on every
          printable page. */}
      <PrintableCta
        {...(printableVideos as Record<string, { videoSrc: string; posterSrc: string; videoTitle: string; duration: string | null }>)._default}
        duration={(printableVideos as Record<string, { duration: string | null }>)._default.duration ?? undefined}
        heading="Free is the start, not the whole thing"
        body="Every printable here comes from a story in the Faithful Kids library. The episodes tell it properly — a few minutes each, with a quiz afterwards so you can see what your child actually understood, across 200 stories in order."
        source="printables-index"
      />

      </main>

      <SiteFooter />
    </>
  )
}

export default function Page() {
  return (
    <V2Shell>
      <PrintablesV2 />
    </V2Shell>
  )
}
