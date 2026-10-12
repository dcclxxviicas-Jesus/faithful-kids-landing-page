import type { Metadata } from 'next'
import { Suspense } from 'react'
import { SiteNav, SiteFooter } from '@/app/components/SiteChrome'
import { VideoTile } from '@/app/components/VideoTile'
import { STORIES } from '@/app/components/stories'
import { GiftHero, GiftHeroShell } from './GiftHero'

/**
 * /gift — the landing page behind the church parent-kit QR codes
 * (v1 Oct 11 2026; expanded v2 Oct 12 2026, both Cas-approved scope).
 *
 * A church hands a parent a bulletin insert; the QR lands here. Rules of
 * this page, set in the routing decision:
 *   - The gift is REAL and already free: the 200 story retellings and the
 *     printables library. Zero signup, zero email wall.
 *   - NO quiz/trial/checkout as a primary CTA — a church bulletin must not
 *     turn out to be an ad. The site's normal nav/footer exist; selling
 *     happens later, on the parent's initiative.
 *   - ?church=<slug> + UTMs make each church's distribution measurable;
 *     &n=<Display Name> personalizes the headline. No lookup table — the
 *     QR URL carries everything, so the page can never 404 on an unknown
 *     church.
 *   - noindex: this is a distribution page, not an SEO asset, and it would
 *     only ever be thin-content competition for the real library pages.
 *
 * WHY v2 LEADS WITH PLAYABLE VIDEO, not a list of links.
 * GROWTH-PLAYBOOK.md measured the thing this page exists to fix: 906 free
 * accounts were gifted to churches and groups, and only 2.5% ever watched
 * anything. The gift does not fail at the hand-off, it fails at the first
 * screen — a parent scans a QR in a church foyer, sees prose, and leaves.
 * So the first thing under the headline is four real lessons that play on
 * the spot, with nothing to create and nothing to enter. Everything below
 * that is a shelf, not a funnel.
 *
 * TWO TRAPS THIS PAGE HAS TO DODGE, both easy to reintroduce:
 *   1. VideoTile's ctaHref DEFAULTS TO /quiz. Every tile here overrides it
 *      to that story's own post. Left at the default, the modal's own
 *      button would walk a parent straight into the checkout funnel and
 *      quietly break the one rule the page is built on.
 *   2. Every count below is ground truth from check-counts.py, which is the
 *      arbiter (CLAUDE.md). The free gift is the 200 story retellings and
 *      the printables — NOT the app's 310 lessons / 31 series, which are
 *      behind a subscription. Do not blur the two to make the gift sound
 *      bigger; that is the exact kind of claim this project removes.
 */

export const metadata: Metadata = {
  title: 'A Gift for Your Family',
  description:
    'Free Bible stories for your kids — 200 retellings from Genesis to Revelation, plus printable games and coloring pages. No signup needed.',
  robots: { index: false, follow: true },
  alternates: { canonical: 'https://faithfulkids.app/gift' },
}

/** Resolve a lesson BY TITLE, never by index — the array order has shifted
 *  before (A Baby in a Basket was inserted mid-list) and silently repointed
 *  a whole section to the wrong video. CLAUDE.md records that one. */
function lesson(title: string) {
  const s = STORIES.find(v => v.title === title)
  if (!s) throw new Error(`/gift: no lesson titled "${title}" in stories.ts`)
  return s
}

/** The four openers, each paired with its own post so the modal CTA has
 *  somewhere honest to go. Slugs verified live before shipping. */
const STARTERS = [
  { title: 'In the Beginning: Creation', slug: 'in-the-beginning-creation-for-kids' },
  { title: 'Noah & the Great Flood', slug: 'noah-and-the-great-flood-for-kids' },
  { title: 'A Baby in a Basket', slug: 'a-baby-in-a-basket-for-kids' },
  { title: 'An Angel Visits Mary', slug: 'an-angel-visits-mary-for-kids' },
]

/* Counts are ground truth (check-counts.py). If a set grows, that script
   fails the build until the copy catches up — do not hardcode around it. */
const PRINT_PACKS = [
  {
    href: '/printables/bible-coloring-pages',
    emoji: '🖍️',
    title: 'Bible coloring pages',
    description:
      'Line-art scenes from the stories — Noah, David, the nativity, the Good Samaritan.',
    details: '26 pages · print or photocopy free',
  },
  {
    href: '/printables/bible-word-search',
    emoji: '🔎',
    title: 'Bible word searches',
    description:
      'Real puzzles that play on screen or on paper, each built from one story’s vocabulary.',
    details: '12 puzzles · answer keys included',
  },
  {
    href: '/printables/bible-crossword',
    emoji: '✏️',
    title: 'Bible crosswords',
    description: 'For the older end — clues drawn from the stories themselves, not trivia lists.',
    details: '7 crosswords · answer keys included',
  },
  {
    href: '/printables/bible-trivia-pack',
    emoji: '🎴',
    title: 'Printable trivia pack',
    description:
      'Question cards to cut out for a class, a car journey or a Sunday school table.',
    details: 'Print at home · no account',
  },
]

const ADVENT_PACKS = [
  {
    href: '/printables/jesse-tree',
    emoji: '🌿',
    title: 'Jesse Tree ornaments & readings',
    description:
      'The whole story of Scripture, one ornament a day, from creation to the manger.',
    details: '25 days · ornaments + readings',
  },
  {
    href: '/printables/advent-bible-calendar',
    emoji: '🕯️',
    title: 'Advent Bible calendar',
    description: 'A short reading for each day of Advent, with the passage printed on the page.',
    details: '25 daily readings',
  },
  {
    href: '/printables/christmas-coloring-pages',
    emoji: '⭐',
    title: 'Nativity coloring pages',
    description: 'The Christmas story to colour in — the angel, the shepherds, the stable.',
    details: '6 pages · print free',
  },
]

export default function GiftPage() {
  return (
    <>
      <SiteNav />
      {/* Query-param personalization needs a client boundary; Suspense keeps
          the static shell fast and the fallback is the un-personalized copy. */}
      <Suspense fallback={<GiftHeroShell name="" />}>
        <GiftHero />
      </Suspense>

      {/* ---- Start here: the first screen does something, it doesn't explain ---- */}
      <section id="start" className="gift-section gift-section-tint">
        <span className="section-label">Start here</span>
        <h2>Press play. That&rsquo;s the whole setup.</h2>
        <p className="gift-lede">
          Four lessons from the library, ready now. Each one runs about two minutes and ends
          with a question worth talking about. Nothing downloads until you press a tile.
        </p>
        <div className="gift-starter-grid">
          {STARTERS.map(({ title, slug }) => {
            const v = lesson(title)
            return (
              <VideoTile
                key={slug}
                src={v.src}
                poster={v.poster}
                title={v.title}
                badge={v.series}
                blurb={v.blurb}
                location="gift_starter"
                ctaHref={`/blog/${slug}`}
                ctaLabel="Read this story →"
              />
            )
          })}
        </div>
      </section>

      {/* ---- The library ---- */}
      <section className="gift-section">
        <span className="section-label">The stories</span>
        <h2>All 200 of them, free to read and watch</h2>
        <p className="gift-lede">
          The whole Bible retold for children, Genesis to Revelation, in order. Every story has
          a page you can read together and a short lesson video beside it. No account, no email,
          no limit on how many you watch.
        </p>
        <div className="gift-cta-row">
          <a className="btn-primary" href="/bible-stories-for-kids">
            Open the story library &rarr;
          </a>
        </div>
      </section>

      {/* ---- Print and play ---- */}
      <section className="gift-section gift-section-tint">
        <span className="section-label">Print &amp; play</span>
        <h2>Things to put on the kitchen table</h2>
        <p className="gift-lede">
          Free to print at home, and free to photocopy for a class or a church group — that is
          what they are for. Every sheet carries the website, so whoever picks one up can find
          the rest.
        </p>
        <div className="asset-grid">
          {PRINT_PACKS.map(p => (
            <a key={p.href} href={p.href} className="asset-card">
              <div className="asset-card-icon">{p.emoji}</div>
              <h3>{p.title}</h3>
              <p>{p.description}</p>
              <div className="asset-card-meta">{p.details}</div>
              <span className="asset-card-link">View &amp; print free &rarr;</span>
            </a>
          ))}
        </div>
        <div className="gift-cta-row">
          <a className="asset-card-link gift-inline-link" href="/printables">
            See everything in the printables library &rarr;
          </a>
        </div>
      </section>

      {/* ---- Advent. Deliberately high on the page in autumn: a church
             handing out bulletin inserts in October is planning Advent, and
             these two sets are the most useful thing here in November. ---- */}
      <section className="gift-section">
        <span className="section-label">For Advent &amp; Christmas</span>
        <h2>Ready before you need it</h2>
        <p className="gift-lede">
          If your family keeps Advent, these are the two sets worth printing early — one reading
          a day through December, and the Jesse Tree that walks from creation to the manger.
        </p>
        <div className="asset-grid">
          {ADVENT_PACKS.map(p => (
            <a key={p.href} href={p.href} className="asset-card">
              <div className="asset-card-icon">{p.emoji}</div>
              <h3>{p.title}</h3>
              <p>{p.description}</p>
              <div className="asset-card-meta">{p.details}</div>
              <span className="asset-card-link">View &amp; print free &rarr;</span>
            </a>
          ))}
        </div>
      </section>

      {/* ---- Games ---- */}
      <section className="gift-section gift-section-tint">
        <span className="section-label">Play together</span>
        <h2>For when everyone&rsquo;s in the room</h2>
        <div className="asset-grid">
          <a href="/bible-trivia" className="asset-card">
            <div className="asset-card-icon">🎯</div>
            <h3>Bible trivia game</h3>
            <p>
              Multiple choice, three difficulty levels, plays in the browser. Easy for the
              youngest, genuinely hard at the top end.
            </p>
            <div className="asset-card-meta">100 questions · no signup</div>
            <span className="asset-card-link">Play free &rarr;</span>
          </a>
          <a href="/blog/bible-charades-for-kids" className="asset-card">
            <div className="asset-card-icon">🎭</div>
            <h3>Bible charades</h3>
            <p>A list of scenes to act out, sorted by how hard they are to guess. No kit needed.</p>
            <div className="asset-card-meta">Free to read &amp; use</div>
            <span className="asset-card-link">Open the list &rarr;</span>
          </a>
          <a href="/blog/bible-bingo-for-kids" className="asset-card">
            <div className="asset-card-icon">🎲</div>
            <h3>Bible bingo</h3>
            <p>How to run it, what goes on the cards, and which stories work best with a group.</p>
            <div className="asset-card-meta">Free to read &amp; use</div>
            <span className="asset-card-link">Open the guide &rarr;</span>
          </a>
          <a
            href="https://www.youtube.com/@FaithfulKidsApp"
            className="asset-card"
            target="_blank"
            rel="noopener"
          >
            <div className="asset-card-icon">▶️</div>
            <h3>Watch on YouTube</h3>
            <p>
              The same lessons on the TV, in Bible order, with new ones added most days. Free,
              and made for kids.
            </p>
            <div className="asset-card-meta">youtube.com/@FaithfulKidsApp</div>
            <span className="asset-card-link">Open the channel &rarr;</span>
          </a>
        </div>
      </section>

      {/* ---- Closing. No CTA by design: the page ends as a gift, not a pitch. ---- */}
      <section className="gift-section gift-close">
        <h2>It&rsquo;s yours — that&rsquo;s all</h2>
        <p className="gift-lede">
          Nothing on this page asked for your email or your card, and nothing will. Your church
          passed it on because they thought your family would enjoy it, and we made it free so
          they could. Print what&rsquo;s useful, watch what you like, share it with whoever you
          want.
        </p>
      </section>

      <SiteFooter />
    </>
  )
}
