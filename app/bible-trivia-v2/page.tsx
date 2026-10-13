import { TriviaQuizGame } from '@/app/bible-trivia/TriviaQuizGame'
import { EmbedBox } from '@/app/bible-trivia/EmbedBox'
import { getPlayableTrivia } from '@/lib/blog'
import { SiteNav, SiteFooter } from '@/app/components/SiteChrome'
import { EASY, MEDIUM, HARD } from '@/lib/trivia-game-questions'
import { BY_AGE, BY_FORMAT, SEASONAL, OT_TRIVIA, NT_TRIVIA, ALL_TRIVIA_LINKS } from '@/app/bible-trivia/trivia-directory'
import type { TriviaLink } from '@/app/bible-trivia/trivia-directory'
import { V2Hero, V2Head } from '@/app/v2-shell'

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

const g = { color: 'var(--hv-green-dark)', fontWeight: 800 }

export default function BibleTriviaV2() {
  // Ground truth, never a hardcoded number: the same list
  // generateStaticParams() builds /embed/trivia/<slug> from.
  const embeddableCount = getPlayableTrivia().length
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(quizSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(directorySchema) }} />
      <SiteNav active="trivia" />

      <main id="main-content">

      <V2Hero
        short
        art="trivia"
        alt="A family game-night table at lamplight with a fan of colourful question cards, a small gold trophy, wooden counters, a bell and scattered paper stars"
        eyebrow="Free Bible game"
        title={<>Bible <span className="hv-love"><span className="l l1">T</span><span className="l l2">r</span><span className="l l3">i</span><span className="l l4">v</span><span className="l l1">i</span><span className="l l2">a</span></span> for Kids</>}
        sub={<>This is our all-of-the-Bible quiz: 100 questions from Genesis to Revelation, 3 levels,
          every answer backed by a verse. Play together at dinner, in the car, or in Sunday school
          &mdash; free, no sign-up, no ads. Want one book, one age group, or a printable?{' '}
          <a href="#all-trivia" style={g}>Every trivia game we have is listed below</a>.</>}
      />

      {/* The game itself, unchanged. */}
      <section className="v2-section" style={{ paddingTop: 34 }}>
        <div className="v2-wrap"><TriviaQuizGame /></div>
      </section>

      <section className="v2-section is-alt">
        <V2Head eyebrow="How to Play" title="Pick a level. Deal 10 questions. Chase the streak."
                sub="Every round is dealt fresh from our 100-question pool, so you can play again and again." />
        <div className="v2-wrap">
          <div className="v2-grid is-4">
            <div className="v2-card">
              <div className="v2-ico" aria-hidden="true">🌱</div>
              <h3>Four levels</h3>
              <p>Easy (ages 5&ndash;8), Medium (ages 9&ndash;12), Hard (teens &amp; adults &mdash;
                with famous trick questions), or Mixed for family play.</p>
            </div>
            <div className="v2-card">
              <div className="v2-ico" aria-hidden="true">🔥</div>
              <h3>Streaks &amp; points</h3>
              <p>Correct answers build a streak for bonus points. Finish a round to earn a rank
                &mdash; from Brave Beginner to Bible Master.</p>
            </div>
            <div className="v2-card">
              <div className="v2-ico" aria-hidden="true">📖</div>
              <h3>Every answer cites its verse</h3>
              <p>A missed question always turns into a story to look up together &mdash; the game
                doubles as a map of where the great stories live.</p>
            </div>
            <div className="v2-card">
              <div className="v2-ico" aria-hidden="true">📄</div>
              <h3>Prefer paper?</h3>
              <p>The whole set is also a{' '}
                <a href="/printables/bible-trivia-pack" style={g}>free printable pack</a> with
                answer key &mdash; part of our <a href="/printables" style={g}>free printables</a>.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="embed" className="v2-section">
        <V2Head
          eyebrow="For Churches & Bloggers"
          title="Put this game on your own website — free"
          sub={<>Churches, ministries, homeschool blogs, and newsletters are welcome to embed this
            trivia game, completely free. Copy the code and paste it into any page &mdash;
            WordPress, Squarespace, Wix, or plain HTML. Your visitors play right on your page.</>}
        />
        <div className="v2-wrap is-narrow" style={{ textAlign: 'center' }}>
          <EmbedBox />
          <div className="v2-body" style={{ marginTop: 18, textAlign: 'left' }}>
            <p>Need platform-specific steps?{' '}
              <a href="/blog/bible-trivia-embed-for-church-website" style={g}>The embed guide</a>{' '}
              covers WordPress, Squarespace, Wix, and plain HTML &mdash; one line, no plugin.</p>
            {/* Every trivia post is separately embeddable. A children's ministry
                writing about Exodus wants an Exodus game, not a mixed one, and
                each placement links back to that post rather than every embed on
                the internet pointing at this single page. */}
            <p className="v2-note">
              Want a game on one book or theme instead? Every trivia page below has its own embed
              &mdash; {embeddableCount} of them, from Genesis to Revelation. Open any one and click{' '}
              <em>Put this game on your site</em>.{' '}
              <a href="#all-trivia" style={g}>Browse them all &darr;</a>
            </p>
            <p>Playing with teens or adults too? The{' '}
              <a href="/bible-quiz" style={g}>all-ages Bible quiz</a> uses the same question bank
              with a test-yourself framing and answers on the page.</p>
            <p style={{ fontSize: '.9rem' }}>Questions, or want a custom version with your
              church&apos;s name on it? Email{' '}
              <a href="mailto:team@faithfulkids.app" style={g}>team@faithfulkids.app</a> &mdash; we
              love helping ministries.</p>
          </div>
        </div>
      </section>

      {/* The directory. Its job is to hand visitors, and link equity, to the
          specific game they want. Below the game on purpose: play first,
          browse after. */}
      <section id="all-trivia" className="v2-section is-sky">
        <V2Head eyebrow="The Whole Collection" title="All Our Bible Trivia Games"
                sub="The game above covers the whole Bible. These pages go narrower and deeper — pick an age, a format, a season, or any of the 66 books." />
        <div className="v2-wrap">
          <div className="v2-group">
            <p className="v2-subhead">By age</p>
            <div className="v2-grid is-3">
              {BY_AGE.map((l: TriviaLink) => (
                <a key={l.href} className="v2-mini" href={l.href}>
                  <strong>{l.title}</strong><span>{l.note}</span>
                </a>
              ))}
            </div>
          </div>
          <div className="v2-group">
            <p className="v2-subhead">By format</p>
            <div className="v2-grid is-3">
              {BY_FORMAT.map((l: TriviaLink) => (
                <a key={l.href} className="v2-mini" href={l.href}>
                  <strong>{l.title}</strong><span>{l.note}</span>
                </a>
              ))}
            </div>
          </div>
          <div className="v2-group">
            <p className="v2-subhead">By season</p>
            <div className="v2-grid is-3">
              {SEASONAL.map((l: TriviaLink) => (
                <a key={l.href} className="v2-mini" href={l.href}>
                  <strong>{l.title}</strong><span>{l.note}</span>
                </a>
              ))}
            </div>
          </div>
          <div className="v2-group">
            <p className="v2-subhead">By book of the Bible &mdash; Old Testament</p>
            <div className="v2-chips">
              {OT_TRIVIA.map((l: TriviaLink) => (
                <a key={l.href} className="v2-chip" href={l.href}>{l.title}</a>
              ))}
            </div>
          </div>
          <div className="v2-group">
            <p className="v2-subhead">By book of the Bible &mdash; New Testament</p>
            <div className="v2-chips">
              {NT_TRIVIA.map((l: TriviaLink) => (
                <a key={l.href} className="v2-chip" href={l.href}>{l.title}</a>
              ))}
            </div>
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
          Short Bible story videos with quizzes just like these &mdash; 300+ episodes from Genesis
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
