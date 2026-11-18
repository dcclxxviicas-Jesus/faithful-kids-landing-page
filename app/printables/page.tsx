import type { Metadata } from 'next'
import '../home.css'
import '../v2-pages.css'
import '../hub.css'

import { SiteNav, SiteFooter } from '@/app/components/SiteChrome'
import { V2Shell, V2Hero } from '@/app/v2-shell'
import { HubHead } from '@/app/hub-ui'
import { PrintableCta } from '@/app/printables/PrintableCta'
import printableVideos from '@/lib/printable-videos.json'

export const metadata: Metadata = {
  title: 'Free Printable Bible Activities for Kids',
  description:
    'Free printable Bible resources for families: 100 Bible trivia questions, a 30-day family Bible challenge, and a bedtime Bible kit. Free to print and share.',
  alternates: { canonical: 'https://faithfulkids.app/printables' },
}


/* The ten packs, copied verbatim from app/printables/page.tsx — every href,
   title, description and detail line unchanged. */
const PACKS = [
  {
    href: '/printables/jesse-tree',
    emoji: '\u{1F384}',
    title: 'Jesse Tree: 25 Ornaments & Readings',
    description:
      'The whole Bible story from Creation to the manger, one ornament a day through Advent. Twenty-five printable ornaments drawn for coloring, each with its daily Scripture reading and a one-line summary to start the conversation.',
    details: 'December 1-25 \u00b7 Free PDF',
  },
  {
    href: '/printables/advent-bible-calendar',
    emoji: '\u{1F4C5}',
    title: 'Advent Bible Reading Calendar',
    description:
      'Twenty-five short readings from the first promise in the garden to the Word made flesh, ten days of prophecy, then the Christmas story itself, a few minutes a night from December 1 to Christmas Day.',
    details: 'One sheet to print and check off \u00b7 Free PDF',
  },
  {
    href: '/printables/christmas-coloring-pages',
    emoji: '\u2B50',
    title: 'Christmas & Nativity Coloring Pages',
    description:
      'Six nativity pages following the Christmas story in order, the angel and Mary, the journey to Bethlehem, the stable, the shepherds on the hillside, and the wise men who arrived much later than the cards suggest.',
    details: 'One a week through Advent',
  },
  {
    href: '/printables/easter-coloring-pages',
    emoji: '\u271D\uFE0F',
    title: 'Easter & Holy Week Coloring Pages',
    description:
      'Six pages walking Holy Week from Palm Sunday to the road to Emmaus. The cross page shows the empty cross rather than the crucifixion, so it works with younger children too.',
    details: 'One a day, Sunday to Sunday',
  },
  {
    href: '/printables/bible-word-search',
    emoji: '🔍',
    title: 'Bible Word Search: 12 Puzzles',
    description:
      'Twelve printable Bible word searches, the whole-Bible classic plus story and season puzzles: Noah, Christmas, Thanksgiving, Easter, David and Goliath, the armor of God. Answer keys on the page.',
    details: 'Ages 6+ · Answer keys included',
  },
  {
    href: '/printables/bible-crossword',
    emoji: '✏️',
    title: 'Bible Crossword Puzzles: 7 Puzzles',
    description:
      'Seven interlocking crosswords with clues drawn from the stories themselves, the whole-Bible puzzle plus Christmas, Noah, Moses, David and Goliath, Easter, and the miracles of Jesus. Playable in the browser, printable with answer keys.',
    details: 'Ages 6+ · Answer keys included',
  },
  {
    href: '/printables/bible-coloring-pages',
    emoji: '🖍️',
    title: 'Bible Coloring Pages: 26 Printables',
    description:
      '26 Bible scenes drawn as clean line art for young children, Creation through the Empty Tomb, including full Christmas and Easter sets. Bold simple outlines with room for thick crayons, each with its Scripture reference.',
    details: 'Print the whole set or one page',
  },
  {
    href: '/printables/bible-maps',
    emoji: '\u{1F5FA}️',
    title: 'Bible Maps: 6 Printable Maps',
    description:
      'Six maps with real geography, the Promised Land, the Exodus route, the 12 tribes, ancient Israel, Israel in Jesus’ time, and Paul’s journeys. Over 100 labeled places, every one at its true coordinates.',
    details: 'Real coastlines · Free PDFs',
  },
  {
    href: '/printables/bible-timeline',
    emoji: '\u{1F4DC}',
    title: 'Bible Timeline: Wall Chart',
    description:
      'The whole story in order on one sheet, thirteen eras from Creation to the early church, with dates where history gives them, key events, and the books of the Bible each era lives in.',
    details: 'One-page chart · Free PDF',
  },
  {
    href: '/printables/valentine-bible-verse-cards',
    emoji: '\u{1F48C}',
    title: 'Valentine Bible Verse Cards: 12 to Color',
    description:
      'Twelve printable Valentine cards, each with a short Bible verse about love and a line-art picture kids color themselves before handing them out, school exchange, Sunday school, or the fridge door.',
    details: '4 per sheet · To/From lines · Color-your-own',
  },
  {
    href: '/printables/books-of-the-bible',
    emoji: '📚',
    title: 'Books of the Bible: Chart & Bookmarks',
    description:
      'All 66 books in order on one chart, grouped the way the Bible groups them with chapter counts for every book, plus cut-out bookmarks for their Bibles. The groups are the memory trick.',
    details: 'One-page chart · 2 bookmarks · Free PDF',
  },
  {
    href: '/printables/bible-trivia-pack',
    emoji: '🏆',
    title: 'Bible Trivia Pack: 100 Questions',
    description:
      '100 kid-friendly Bible trivia questions in three difficulty levels, every answer with its Scripture reference. Perfect for family game night, Sunday school, road trips, or homeschool review.',
    details: 'Easy, medium & hard rounds · Answer key with verse references',
  },
  {
    href: '/printables/advent-readings',
    emoji: '🕯️',
    title: 'Advent Bible Readings: 25 Days',
    description:
      'December 1 to 25: one short reading a night from the first promise in Genesis to the manger, with a discussion question for each day. The readings double as Bible verses for a homemade Advent calendar.',
    details: '25 daily readings · Discussion questions · Prophecies through Christmas morning',
  },
  {
    href: '/printables/30-day-challenge',
    emoji: '📅',
    title: '30-Day Family Bible Challenge',
    description:
      'One month of short daily readings that walk your family through the big story of the Bible, creation to resurrection, with a summary and a discussion question for each day.',
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

/* A picture of every pack. The art is each printable's own (its og:image or
   the illustration its page already uses), cut down to 720px for the grid:
   the originals run 1-3.5MB each, which is 25MB for one page of cards. */
const THUMB = (slug: string) => `https://d3g07v1w0lehiv.cloudfront.net/hub-thumbs/printables/${slug}.webp`
const slugOf = (href: string) => href.replace('/printables/', '')

/* Grouped by what a parent or teacher is looking for, rather than one long
   grid of fifteen identical boxes. Every pack appears exactly once; the
   season group leads while it is the season. */
const GROUPS: { id: string; title: string; note: string; hrefs: string[] }[] = [
  { id: 'advent-christmas', title: 'Advent & Christmas', note: 'Count down to Christmas with the whole story.',
    hrefs: ['/printables/jesse-tree', '/printables/advent-bible-calendar', '/printables/christmas-coloring-pages', '/printables/advent-readings'] },
  { id: 'puzzles', title: 'Puzzles & trivia', note: 'Word searches, crosswords and quiz questions, all with answer keys.',
    hrefs: ['/printables/bible-word-search', '/printables/bible-crossword', '/printables/bible-trivia-pack'] },
  { id: 'coloring', title: 'Coloring pages & cards', note: 'Bold line art with room for thick crayons.',
    hrefs: ['/printables/bible-coloring-pages', '/printables/easter-coloring-pages', '/printables/valentine-bible-verse-cards'] },
  { id: 'maps-charts', title: 'Maps & wall charts', note: 'For the classroom wall or the front of a Bible.',
    hrefs: ['/printables/bible-maps', '/printables/bible-timeline', '/printables/books-of-the-bible'] },
  { id: 'family', title: 'Family Bible routines', note: 'A few minutes a day, at the table or at bedtime.',
    hrefs: ['/printables/30-day-challenge', '/printables/bedtime-bible-kit'] },
]
const BY_HREF = Object.fromEntries(PACKS.map(p => [p.href, p]))
if (GROUPS.flatMap(g => g.hrefs).sort().join() !== PACKS.map(p => p.href).sort().join()) {
  throw new Error('printables: every pack must appear in exactly one group')
}

function Pack({ pack, lead = false }: { pack: (typeof PACKS)[number]; lead?: boolean }) {
  return (
    <a href={pack.href} className={`hb-item${lead ? ' is-lead' : ''}`}>
      <span className="hb-thumb">
        <img src={THUMB(slugOf(pack.href))} alt="" width={720} height={540}
             loading={lead ? 'eager' : 'lazy'} decoding="async" />
      </span>
      <span className="hb-item-text">
        <h3>{pack.title}</h3>
        <p>{pack.description}</p>
        <span className="hb-meta">{pack.details}</span>
        <span className="hb-go">View &amp; print free &rarr;</span>
      </span>
    </a>
  )
}

const JUMP_ICON: Record<string, string> = {
  'advent-christmas': '🎄',
  puzzles: '🧩',
  coloring: '🖍️',
  'maps-charts': '🗺️',
  family: '🏡',
}

function PrintablesV2() {
  return (
    <>
      <SiteNav active="printables" />

      <main id="main-content" className="hb">

      {/* Live header, kept by owner's call (Nov 17, 2026). */}
      <V2Hero
        art="printables"
        alt="A craft table with freshly printed Bible activity sheets fanned out, a jar of coloured pencils, crayons, scissors and paper stars"
        eyebrow="Free Downloads"
        title={<>Free Printable <span className="hv-love"><span className="l l1">B</span><span className="l l2">i</span><span className="l l3">b</span><span className="l l4">l</span><span className="l l1">e</span></span> Activities</>}
        sub={<>Print-ready Bible resources for families, homeschoolers, and Sunday school teachers.
          Completely free. Print as many copies as you like
          for your family, class, or church group.</>}
      />

      {/* Clear pill buttons with a label above (owner, Nov 17, 2026). The
          bare counts beside each name read as part of the label
          ("Advent & Christmas4"), so they are gone. */}
      <nav className="hb-jump is-pills" aria-label="Printables by type">
        <p className="hb-jump-label">Jump to a section</p>
        <ul>
          {GROUPS.map(g => (
            <li key={g.id}><a href={`#${g.id}`}><span aria-hidden="true">{JUMP_ICON[g.id] ?? '📄'}</span>{g.title}</a></li>
          ))}
        </ul>
      </nav>

      {GROUPS.map((g, gi) => (
        <section key={g.id} id={g.id} className={`hb-section${gi === 0 ? '' : ' is-tight-top'}`}>
          <div className="hb-wrap">
            <HubHead title={g.title} sub={g.note} />
            <div className="hb-shelf">
              {g.hrefs.map((href, i) => (
                <Pack key={href} pack={BY_HREF[href]} lead={gi === 0 && i === 0} />
              ))}
            </div>
          </div>
        </section>
      ))}

      <section className="hb-section">
        <div className="hb-wrap hb-split">
          <HubHead
            eyebrow="Who Makes These?"
            title="A gift from Faithful Kids"
          />
          <div>
            <div className="hb-prose">
              <p>These printables are made by Faithful Kids, a Bible video learning app for kids
                ages 7&ndash;15, short story episodes, quizzes, and reflections that make
                Scripture stick. The printables are our gift to families either way. And if your kids
                like trivia on paper, they&apos;ll love the{' '}
                <a href="/bible-trivia">free online trivia game</a>.</p>
            </div>
            <div className="hb-note" style={{ marginTop: 24 }}>
              <h3>Bloggers, churches &amp; newsletters</h3>
              <p>You&apos;re welcome to link to this page or any individual printable, and to use one
                screenshot of each pack in a roundup. Questions? Email{' '}
                <a href="mailto:team@faithfulkids.app">team@faithfulkids.app</a>.</p>
            </div>
          </div>
        </div>
      </section>


      {/* The one closing pitch on this page: it plays a real episode beside
          the words. Copy rewritten Nov 17, 2026 (owner: the old "Free is the
          start, not the whole thing" made no sense to him); a second close
          block that asked about "the stories behind the trivia" sat right
          above it and was removed as a duplicate. */}
      <PrintableCta
        {...(printableVideos as Record<string, { videoSrc: string; posterSrc: string; videoTitle: string; duration: string | null }>)._default}
        duration={(printableVideos as Record<string, { duration: string | null }>)._default.duration ?? undefined}
        heading="Every printable here is a story your kids can watch"
        body="The coloring pages, puzzles and readings all come from the Faithful Kids library of short Bible video lessons. Print the sheet, then press play: a two-minute episode tells the story, and a quiz afterwards shows you what your child took in. 300+ episodes, Genesis to Revelation."
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
