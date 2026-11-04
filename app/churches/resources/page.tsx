import type { Metadata } from 'next'
import '../../home.css'
import '../../v2-pages.css'

import { SiteNav, SiteFooter } from '@/app/components/SiteChrome'
import { V2Shell, V2Hero, V2Head } from '@/app/v2-shell'

/**
 * /churches/resources — the curated children's-ministry resource hub
 * (Nov 2026 church-resources brief, Deliverable E).
 *
 * This page is a DISCOVERY experience, not a second content database: every
 * card links to the one canonical URL of an existing resource (rule: an
 * article has one URL and may be featured in several hubs). Do not duplicate
 * content here.
 *
 * Keyword reality (DataForSEO Nov 3, 2026): the children's-ministry cluster
 * is a LOW-VOLUME, high-authority space ("children's ministry" 310/mo cs at
 * KD 84; "how to start a children's ministry" ~0). This hub exists for
 * link-earning, kidmin outreach (the backlink engine pitches it), and
 * serving church decision-makers — judge it by referring domains and
 * /churches signups, not impressions.
 *
 * Pattern borrowed from the Nov 2026 competitor study: MinistrySpark's
 * role-based hubs + Ministry-to-Children's organize-by-job library, with
 * our genuinely-free church offer where they put "try curriculum free".
 */

export const metadata: Metadata = {
  title: { absolute: "Children's Ministry Resources, Free Library" },
  description:
    "A free resource library for children's ministry leaders and Sunday school teachers, lesson guides, games, printables, Bible maps and trivia. No sign-up.",
  alternates: { canonical: 'https://faithfulkids.app/churches/resources' },
  openGraph: {
    title: "Children's Ministry Resources, Free Library",
    description:
      "Lesson guides, games, printables, Bible maps and trivia for children's ministry leaders and Sunday school teachers. All free.",
    url: 'https://faithfulkids.app/churches/resources',
    siteName: 'Faithful Kids',
    type: 'website',
    images: [{ url: 'https://d3g07v1w0lehiv.cloudfront.net/home/hero-churches-1536.webp', width: 1536, height: 1024 }],
  },
}

type Card = { href: string; title: string; blurb: string }
type Section = { emoji: string; title: string; sub: string; cards: Card[] }

const SECTIONS: Section[] = [
  {
    emoji: '🚀',
    title: 'Start a Ministry',
    sub: 'From first conversation to first Sunday, the complete roadmap.',
    cards: [
      { href: '/blog/how-to-start-a-childrens-ministry', title: "How to Start a Children's Ministry", blurb: 'The complete step-by-step guide: planning, child safety, volunteers, curriculum, launch, and growth.' },
      { href: 'https://d3g07v1w0lehiv.cloudfront.net/printables/childrens-ministry-launch-kit.pdf', title: 'Children’s Ministry Launch Kit (PDF)', blurb: 'Fifteen designed templates, launch timeline, safety policy outline, volunteer role cards, screening tracker, rota, budget, check-in cards, incident form, first-Sunday checklist.' },
      { href: '/blog/how-to-start-kids-bible-study-group', title: 'Start a Kids Bible Study Group', blurb: 'The smaller first step: a weekly group, from first invite to routine.' },
    ],
  },
  {
    emoji: '🧭',
    title: 'Teach the Bible',
    sub: 'Lesson plans and teaching guides by age, ready for this Sunday.',
    cards: [
      { href: '/blog/sunday-school-lessons-for-kids', title: 'Sunday School Lessons for Kids', blurb: 'The core lesson library, stories, structure, and discussion questions.' },
      { href: '/blog/sunday-school-lessons-for-preschoolers', title: 'Lessons for Preschoolers', blurb: 'Short attention spans, big truths, lessons scaled for ages 3-5.' },
      { href: '/blog/sunday-school-lessons-for-teens', title: 'Lessons for Teens', blurb: 'Discussion-first lessons that survive contact with teenagers.' },
      { href: '/blog/free-sunday-school-lessons', title: 'Free Sunday School Lessons', blurb: 'Where to find genuinely free lessons, including ours.' },
      { href: '/blog/how-to-teach-kids-the-bible', title: 'How to Teach Kids the Bible', blurb: 'The methods that work by age, from story to application.' },
      { href: '/blog/free-bible-curriculum-for-kids-ministry', title: 'Free Bible Curriculum for Kids Ministry', blurb: 'Free curriculum options compared honestly, ours included.' },
    ],
  },
  {
    emoji: '🎲',
    title: 'Games & Classroom Activities',
    sub: 'Review games, icebreakers, crafts and object lessons that hold a room.',
    cards: [
      { href: '/blog/sunday-school-games-for-kids', title: 'Sunday School Games', blurb: '35 games organized by age and group size.' },
      { href: '/blog/bible-review-games-for-sunday-school', title: 'Bible Review Games', blurb: 'Make last week’s lesson stick before this week’s starts.' },
      { href: '/bible-jeopardy', title: 'Bible Jeopardy (playable)', blurb: 'A ready-to-play classroom game board, six categories, team scoring.' },
      { href: '/bible-trivia', title: 'Bible Trivia Game (playable)', blurb: 'The browser trivia game, also embeddable on your church site.' },
      { href: '/blog/bible-object-lessons-for-kids', title: 'Object Lessons', blurb: 'Everyday props, memorable points.' },
      { href: '/blog/bible-crafts-for-sunday-school', title: 'Bible Crafts', blurb: 'Crafts that connect to the lesson instead of decorating around it.' },
    ],
  },
  {
    emoji: '🖨️',
    title: 'Print & Hand Out',
    sub: 'Free printables that photocopy well, no email wall, no license to buy.',
    cards: [
      { href: '/printables', title: 'The Whole Printables Library', blurb: 'Coloring pages, word searches, crosswords, trivia packs and more.' },
      { href: '/printables/bible-maps', title: 'Bible Maps (6 printable maps)', blurb: 'Real-geography maps, the Exodus, Paul’s journeys, the 12 tribes.' },
      { href: '/printables/bible-timeline', title: 'Bible Timeline Chart', blurb: 'The whole story in order on one wall sheet.' },
      { href: '/printables/books-of-the-bible', title: 'Books of the Bible Chart', blurb: 'All 66 books with chapter counts, plus cut-out bookmarks.' },
      { href: '/printables/bible-coloring-pages', title: 'Bible Coloring Pages', blurb: '26 scenes, Creation to the Empty Tomb.' },
      { href: '/blog/bible-memory-verse-cards-printable', title: 'Memory Verse Cards', blurb: 'Printable verse cards for weekly memory work.' },
    ],
  },
  {
    emoji: '🏠',
    title: 'Send Faith Home',
    sub: 'Tools that keep the lesson going between Sundays.',
    cards: [
      { href: '/blog/15-minute-family-devotions', title: '15-Minute Family Devotions', blurb: 'A realistic weekly rhythm for busy families.' },
      { href: '/blog/30-day-family-bible-challenge', title: '30-Day Family Bible Challenge', blurb: 'One month through the big story, printable tracker included.' },
      { href: '/blog/family-bible-trivia-night', title: 'Family Bible Trivia Night', blurb: 'Turn review into a family event parents actually attend.' },
      { href: '/blog/bedtime-prayers-for-kids', title: 'Bedtime Prayers for Kids', blurb: 'Send the day home quietly, short prayers families can keep.' },
    ],
  },
]

const schema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: "Children's Ministry Resources",
  description: "A free curated resource library for children's ministry leaders and Sunday school teachers.",
  url: 'https://faithfulkids.app/churches/resources',
  isFamilyFriendly: true,
  inLanguage: 'en',
  mainEntity: {
    '@type': 'ItemList',
    numberOfItems: SECTIONS.reduce((n, s) => n + s.cards.length, 0),
    itemListElement: SECTIONS.flatMap(s => s.cards).map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.title,
      url: `https://faithfulkids.app${c.href}`,
    })),
  },
}

function ResourcesV2() {
  return (
    <>
      <SiteNav active="churches" />

      <main id="main-content">
        <V2Hero
          art="churches"
          alt="A bright Sunday school classroom with children's Bible activity sheets, crayons and a felt storyboard"
          eyebrow="For Ministry Leaders"
          title={<>Children&rsquo;s Ministry <span className="hv-love"><span className="l l1">R</span><span className="l l2">e</span><span className="l l3">s</span><span className="l l4">o</span><span className="l l1">u</span><span className="l l2">r</span><span className="l l3">c</span><span className="l l4">e</span><span className="l l1">s</span></span></>}
          sub={<>Everything here is free and photocopy-friendly, lesson guides, games,
            printables, maps and trivia, organized by the job you&rsquo;re actually doing this
            week. No sign-up, no license, no email wall.</>}
        />

        {SECTIONS.map((section, i) => (
          <section className={i % 2 ? 'v2-section is-alt' : 'v2-section'} key={section.title}>
            <V2Head
              eyebrow={section.emoji}
              title={section.title}
              sub={<>{section.sub}</>}
            />
            <div className="v2-wrap">
              <div className="v2-grid is-3">
                {section.cards.map(card => (
                  <a key={card.href} href={card.href} className="v2-asset">
                    <h3>{card.title}</h3>
                    <p>{card.blurb}</p>
                    <span className="v2-asset-go">Open free &rarr;</span>
                  </a>
                ))}
              </div>
            </div>
          </section>
        ))}

        <section className="v2-section">
          <V2Head
            eyebrow="The Curriculum Question"
            title="Faithful Kids is free for churches"
            sub={<>When you reach the &ldquo;what will we actually teach?&rdquo; step: Faithful
              Kids gives churches and Sunday schools free access to 300+ short Bible video
              lessons with quizzes and reflections, Genesis to Revelation, the same
              library families pay for. Not a trial, not a sample pack.{' '}
              <a href="/churches" style={{ color: 'var(--hv-green-dark)', fontWeight: 800 }}>How the church offer works &rarr;</a></>}
          />
        </section>

        <section className="hv-close">
          <h2>Teaching this Sunday?</h2>
          <p className="hv-close-fine" style={{ margin: '0 auto 22px', maxWidth: '36em' }}>
            Pick a lesson, print an activity, and let the episode do the storytelling.
            each one runs about two minutes and ends with a quiz your class can take together.
          </p>
          <a className="hv-cta" href="/churches">
            <span className="hv-cta-play" aria-hidden="true" />
            Get free church access
          </a>
        </section>
      </main>

      <SiteFooter />
    </>
  )
}

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <V2Shell>
        <ResourcesV2 />
      </V2Shell>
    </>
  )
}
