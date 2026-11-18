import type { Metadata } from 'next'
import '../home.css'
import '../v2-pages.css'
import '../hub.css'

import { TriviaQuizGame } from '@/app/bible-trivia/TriviaQuizGame'
import { EmbedBox } from '@/app/bible-trivia/EmbedBox'
import { getPlayableTrivia } from '@/lib/blog'
import { SiteNav, SiteFooter } from '@/app/components/SiteChrome'
import { EASY, MEDIUM, HARD } from '@/lib/trivia-game-questions'
import { OT_GROUPS, NT_GROUPS } from '@/lib/books-of-the-bible'
import { BY_AGE, BY_FORMAT, SEASONAL, OT_TRIVIA, NT_TRIVIA, ALL_TRIVIA_LINKS } from '@/app/bible-trivia/trivia-directory'
import type { TriviaLink } from '@/app/bible-trivia/trivia-directory'
import { V2Shell, V2Hero } from '@/app/v2-shell'
import { HubHead } from '@/app/hub-ui'

export const metadata: Metadata = {
  title: 'Free Bible Trivia for Kids: 100 Questions',
  description:
    'Play free Bible trivia online: 100 kid-friendly questions across easy, medium and hard levels, every answer with its verse. Free to embed on your site.',
  alternates: { canonical: 'https://faithfulkids.app/bible-trivia' },
}

/* Both schema blocks are the live page's, unchanged: the Quiz node is what
   makes this page eligible for a quiz rich result, and the ItemList is the
   directory of every trivia page we have. */
const directorySchema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Bible Trivia by Age, Format, Season, and Book',
  itemListElement: ALL_TRIVIA_LINKS.map((l, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: l.title,
    url: `https://faithfulkids.app${l.href}`,
  })),
}

const quizSchema = {
  '@context': 'https://schema.org',
  '@type': 'Quiz',
  name: 'Bible Trivia for Kids',
  about: { '@type': 'Thing', name: 'The Bible' },
  educationalLevel: 'beginner',
  assesses: 'Bible knowledge',
  provider: { '@type': 'Organization', name: 'Faithful Kids', url: 'https://faithfulkids.app' },
  hasPart: [EASY[0], MEDIUM[1], HARD[0]].map(q => ({
    '@type': 'Question',
    eduQuestionType: 'Multiple choice',
    text: q.q,
    acceptedAnswer: { '@type': 'Answer', text: q.a },
  })),
}


function BibleTriviaV2() {
  // Ground truth, never a hardcoded number: the same list
  // generateStaticParams() builds /embed/trivia/<slug> from.
  const embeddableCount = getPlayableTrivia().length
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(quizSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(directorySchema) }} />
      <SiteNav active="trivia" />

      <main id="main-content" className="hb">

      {/* The game itself, unchanged, now in the hero on the game-night
          painting: the page's whole job is a round played, and on the old
          layout it started below a screenful of words. */}
      <V2Hero
        short
        art="trivia"
        alt="A family game-night table at lamplight with a fan of colourful question cards, a small gold trophy, wooden counters, a bell and scattered paper stars"
        eyebrow="Free Bible game"
        title={<>Bible <span className="hv-love"><span className="l l1">T</span><span className="l l2">r</span><span className="l l3">i</span><span className="l l4">v</span><span className="l l1">i</span><span className="l l2">a</span></span> for Kids</>}
        sub={<>This is our all-of-the-Bible quiz: 100 questions from Genesis to Revelation, 3 levels,
          every answer backed by a verse. Play together at dinner, in the car, or in Sunday school,
          free, no sign-up, no ads. Want one book, one age group, or a printable?{' '}
          <a href="#all-trivia">Every trivia game we have is listed below</a>.</>}
      />

      {/* The game straight under the header, pulled up so it starts inside
          the first screen. */}
      <section className="hb-game-band">
        <div id="play" className="hb-play">
            <TriviaQuizGame />
          </div>
      </section>


      <section className="hb-section">
        <div className="hb-wrap">
        <HubHead eyebrow="How to Play" title="Pick a level. Deal 10 questions. Chase the streak."
                sub="Every round is dealt fresh from our 100-question pool, so you can play again and again." />
          <ul className="hb-cols" style={{ '--n': 4 } as React.CSSProperties}>
            <li>
              <h3>Four levels</h3>
              <p>Easy (ages 5&ndash;8), Medium (ages 9&ndash;12), Hard (teens &amp; adults, 
                with famous trick questions), or Mixed for family play.</p>
            </li>
            <li>
              <h3>Streaks &amp; points</h3>
              <p>Correct answers build a streak for bonus points. Finish a round to earn a rank,
                from Brave Beginner to Bible Master.</p>
            </li>
            <li>
              <h3>Every answer cites its verse</h3>
              <p>A missed question always turns into a story to look up together, the game
                doubles as a map of where the great stories live.</p>
            </li>
            <li>
              <h3>Prefer paper?</h3>
              <p>The whole set is also a{' '}
                <a href="/printables/bible-trivia-pack">free printable pack</a> with
                answer key, part of our <a href="/printables">free printables</a>.</p>
            </li>
          </ul>
        </div>
      </section>

      {/* Embedding is for the few site owners who want it, not for the families
          playing, so it is one quiet line that opens in place. Every word and
          the code are still in the HTML (a closed <details> is indexed), and
          #embed, which /churches links to, opens it. */}
      <section className="hb-section hb-embed-band">
        <div className="hb-wrap is-narrow">
          <details id="embed" className="hb-embed">
            <summary>
              <span className="hb-embed-kicker">For Churches &amp; Bloggers</span>
              <h2>Put this game on your own website, free</h2>
              <span className="hb-embed-toggle" aria-hidden="true">Get the code</span>
            </summary>
            <div className="hb-embed-body">
              <p className="hb-embed-sub">Churches, ministries, homeschool blogs, and newsletters are welcome to embed this
            trivia game, completely free. Copy the code and paste it into any page.
            WordPress, Squarespace, Wix, or plain HTML. Your visitors play right on your page.</p>
              <EmbedBox />
              <div className="hb-prose hb-embed-notes">
            <p>Need platform-specific steps?{' '}
              <a href="/blog/bible-trivia-embed-for-church-website">The embed guide</a>{' '}
              covers WordPress, Squarespace, Wix, and plain HTML; one line, no plugin.</p>
            {/* Every trivia post is separately embeddable. A children's ministry
                writing about Exodus wants an Exodus game, not a mixed one, and
                each placement links back to that post rather than every embed on
                the internet pointing at this single page. */}
            <p className="hb-callout">
              Want a game on one book or theme instead? Every trivia page below has its own embed,{' '}
              {embeddableCount} of them, from Genesis to Revelation. Open any one and click{' '}
              <em>Put this game on your site</em>.{' '}
              <a href="#all-trivia">Browse them all &darr;</a>
            </p>
            <p>Playing with teens or adults too? The{' '}
              <a href="/bible-quiz">all-ages Bible quiz</a> uses the same question bank
              with a test-yourself framing and answers on the page.</p>
            <p style={{ fontSize: '.9rem' }}>Questions, or want a custom version with your
              church&apos;s name on it? Email{' '}
              <a href="mailto:team@faithfulkids.app">team@faithfulkids.app</a>, we
              love helping ministries.</p>
              </div>
            </div>
          </details>
          <script dangerouslySetInnerHTML={{ __html:
            "(function(){function o(){if(location.hash==='#embed'){var d=document.getElementById('embed');if(d){d.open=true;d.scrollIntoView()}}}o();addEventListener('hashchange',o)})()" }} />
        </div>
      </section>

      {/* The directory. Its job is to hand visitors, and link equity, to the
          specific game they want. Below the game on purpose: play first,
          browse after. */}
      <section id="all-trivia" className="hb-section">
        <div className="hb-wrap">
          <HubHead eyebrow="The Whole Collection" title="All Our Bible Trivia Games"
                   sub="The game above covers the whole Bible. These pages go narrower and deeper; pick an age, a format, a season, or any of the 66 books." />
          <div className="hb-dir">
            {([['By age', BY_AGE], ['By format', BY_FORMAT], ['By season', SEASONAL]] as const).map(([label, links]) => (
              <div key={label} className="hb-dir-group">
                <p className="hb-dir-label">{label}</p>
                <ul className="hb-links">
                  {links.map((l: TriviaLink) => (
                    <li key={l.href}><a href={l.href}><strong>{l.title}</strong><span>{l.note}</span></a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          {/* The 66 books grouped the way the Bible groups them (the same
              groups as the Books of the Bible chart), instead of one long
              alphabet-soup list. Every book link is still here exactly once. */}
          <div className="hb-books">
            {([
              ['Old Testament', 'By book of the Bible: Old Testament', OT_TRIVIA, OT_GROUPS],
              ['New Testament', 'By book of the Bible: New Testament', NT_TRIVIA, NT_GROUPS],
            ] as const).map(([testament, label, links, groups]) => {
              const byName = new Map(links.map((l: TriviaLink) => [l.title, l]))
              const grouped = groups.map(g => ({
                name: g.name,
                links: g.books.map(bk => byName.get(bk.name)).filter((l): l is TriviaLink => Boolean(l)),
              }))
              if (grouped.reduce((n, g) => n + g.links.length, 0) !== links.length) {
                throw new Error(`bible-trivia: ${testament} book links and book groups disagree`)
              }
              return (
                <div key={testament} className="hb-testament">
                  <div className="hb-testament-head">
                    <p className="hb-dir-label">{label}</p>
                    <span className="hb-testament-count">{links.length} books, one game each</span>
                  </div>
                  <div className="hb-bookgroups">
                    {grouped.map(g => (
                      <div key={g.name} className="hb-bookgroup">
                        <p className="hb-bookgroup-name">{g.name}</p>
                        <ul>
                          {g.links.map(l => (
                            <li key={l.href}><a href={l.href}>{l.title}</a></li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="hv-close">
        <ul className="hv-chips">
          <li><span aria-hidden="true">🎁</span>7-day free trial</li>
          <li><span aria-hidden="true">🔓</span>Cancel anytime</li>
          <li><span aria-hidden="true">🚫</span>Zero ads, ever</li>
        </ul>
        <h2>If your kids love this game, they&apos;ll love Faithful Kids</h2>
        <p className="hv-close-fine" style={{ margin: '0 auto 22px', maxWidth: '38em' }}>
          Short Bible story videos with quizzes just like these; 300+ episodes from Genesis
          to Revelation, with levels, streaks, and zero ads.
        </p>
        <a className="hv-cta" href="/quiz">
          <span className="hv-cta-play" aria-hidden="true" />
          Get started
        </a>
      </section>

      </main>

      <SiteFooter />
    </>
  )
}

export default function Page() {
  return (
    <V2Shell>
      <BibleTriviaV2 />
    </V2Shell>
  )
}
