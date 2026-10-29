import type { Metadata } from 'next'
import '../home.css'
import '../v2-pages.css'
import './jeopardy.css'

import { JeopardyGame } from './JeopardyGame'
import { CATEGORIES, FINAL_CLUE, CLUE_COUNT } from '@/lib/jeopardy-board'
import { SiteNav, SiteFooter } from '@/app/components/SiteChrome'
import { V2Shell, V2Hero, V2Head } from '@/app/v2-shell'

/* Target: "bible jeopardy" — 3,600/mo ads, 2,548/mo clickstream, KD 0, flat
   year-round (DataForSEO Oct 29, 2026). Page 1 is jeopardylabs.com user-made
   template boards and YouTube videos; nobody owns the term with a real page.
   Exact phrase leads the title — same rule that fixed the Christmas word
   search. Absolute title: the layout suffix would push this past Google's
   ~60-char display cutoff. */
export const metadata: Metadata = {
  title: { absolute: 'Bible Jeopardy — Free Game with Questions & Answers' },
  description:
    `Play Bible Jeopardy free: a ${CATEGORIES.length}-category board, ${CLUE_COUNT} questions, team scoring, and a verse with every answer. For Sunday school, youth group, or family night.`,
  alternates: { canonical: 'https://faithfulkids.app/bible-jeopardy' },
  keywords: [
    'bible jeopardy', 'bible jeopardy game', 'bible jeopardy questions',
    'bible jeopardy for kids', 'bible jeopardy for youth',
  ],
  openGraph: {
    title: 'Bible Jeopardy — Free Game with Questions & Answers',
    description:
      `A real ${CATEGORIES.length}-category Bible Jeopardy board with ${CLUE_COUNT} questions, team scoring, and every answer backed by its verse. Free, no sign-up.`,
    url: 'https://faithfulkids.app/bible-jeopardy',
    siteName: 'Faithful Kids',
    type: 'website',
    images: [{ url: 'https://d3g07v1w0lehiv.cloudfront.net/home/hero-trivia-1536.webp', width: 1536, height: 1024 }],
  },
}

const quizSchema = {
  '@context': 'https://schema.org',
  '@type': 'Quiz',
  name: 'Bible Jeopardy',
  about: { '@type': 'Thing', name: 'The Bible' },
  educationalLevel: 'beginner',
  assesses: 'Bible knowledge',
  provider: { '@type': 'Organization', name: 'Faithful Kids', url: 'https://faithfulkids.app' },
  hasPart: [CATEGORIES[0].clues[0], CATEGORIES[3].clues[0], CATEGORIES[5].clues[2]].map(q => ({
    '@type': 'Question',
    eduQuestionType: 'Multiple choice',
    text: q.q,
    acceptedAnswer: { '@type': 'Answer', text: q.a },
  })),
}

const g = { color: 'var(--hv-green-dark)', fontWeight: 800 }

function BibleJeopardy() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(quizSchema) }} />
      <SiteNav active="trivia" />

      <main id="main-content">

      <V2Hero
        short
        art="trivia"
        alt="A family game-night table at lamplight with a fan of colourful question cards, a small gold trophy, wooden counters, a bell and scattered paper stars"
        eyebrow="Free Bible game"
        title={<>Bible <span className="hv-love"><span className="l l1">J</span><span className="l l2">e</span><span className="l l3">o</span><span className="l l4">p</span><span className="l l1">a</span><span className="l l2">r</span><span className="l l3">d</span><span className="l l4">y</span></span></>}
        sub={<>A real Jeopardy board for Bible knowledge: {CATEGORIES.length} categories, {CLUE_COUNT} questions from $100 to
          $500, up to four teams, and every answer backed by its verse. Built for Sunday school,
          youth group, and family game night &mdash; free, no sign-up, no ads. Prefer paper?{' '}
          <a href="#questions" style={g}>All {CLUE_COUNT} questions and answers are below</a>.</>}
      />

      <section className="v2-section" style={{ paddingTop: 34 }}>
        <div className="v2-wrap"><JeopardyGame /></div>
      </section>

      <section className="v2-section is-alt">
        <V2Head eyebrow="How to Host" title="Run it like a game show"
                sub="Thirty clues takes a group about 25–40 minutes — one Sunday school session, one youth group opener, or one family night." />
        <div className="v2-wrap">
          <div className="v2-grid is-4">
            <div className="v2-card">
              <div className="v2-ico" aria-hidden="true">📺</div>
              <h3>Put it on a screen</h3>
              <p>Open this page on a TV or projector and let teams call out their category and
                dollar amount, just like the show. One person taps; everyone plays.</p>
            </div>
            <div className="v2-card">
              <div className="v2-ico" aria-hidden="true">👥</div>
              <h3>Teams take turns</h3>
              <p>The answering team rotates automatically after every clue, so one loud kid
                can&apos;t run the whole board. Solo mode works too.</p>
            </div>
            <div className="v2-card">
              <div className="v2-ico" aria-hidden="true">💰</div>
              <h3>Points, not penalties</h3>
              <p>A right answer earns the dollar value; a wrong one just reveals the answer and
                its verse. No negative scores &mdash; nobody plays scared.</p>
            </div>
            <div className="v2-card">
              <div className="v2-ico" aria-hidden="true">📖</div>
              <h3>Every clue cites its verse</h3>
              <p>Each reveal shows where the story lives, so a missed question becomes the
                passage you look up together afterwards.</p>
            </div>
          </div>
        </div>
      </section>

      {/* The full board as crawlable text. The game above is JavaScript; this
          list is what the page actually SAYS — and it is the printable,
          host-cheat-sheet version for anyone running the game off a phone. */}
      <section id="questions" className="v2-section">
        <V2Head eyebrow="The Question Bank" title={`All ${CLUE_COUNT} Bible Jeopardy questions and answers`}
                sub="Hosting without a screen? Read from the list — categories left to right, $100 to $500. Answers and verses included." />
        <div className="v2-wrap is-narrow">
          {CATEGORIES.map(cat => (
            <details key={cat.name} className="v2-details">
              <summary>{cat.name}</summary>
              <ol>
                {cat.clues.map(c => (
                  <li key={c.value} style={{ marginBottom: 10 }}>
                    <strong>${c.value}:</strong> {c.q}<br />
                    <em>Answer:</em> {c.a} <span style={{ color: '#6b7280' }}>({c.ref})</span>
                  </li>
                ))}
              </ol>
            </details>
          ))}
          <details className="v2-details">
            <summary>Bonus — the final question</summary>
            <p style={{ margin: '10px 0 0' }}>
              {FINAL_CLUE.q}<br />
              <em>Answer:</em> {FINAL_CLUE.a} <span style={{ color: '#6b7280' }}>({FINAL_CLUE.ref})</span>
            </p>
          </details>
          <div className="v2-body" style={{ marginTop: 22 }}>
            <p>Need more rounds? Our <a href="/bible-trivia" style={g}>Bible trivia game</a> deals
              fresh 10-question rounds from a 100-question pool across four difficulty levels, and
              the <a href="/printables/bible-trivia-pack" style={g}>printable trivia pack</a> puts
              the whole set on paper with an answer key. Playing with teens? The{' '}
              <a href="/blog/bible-trivia-for-youth" style={g}>youth group trivia guide</a> has
              formats sized for a whole room, and the{' '}
              <a href="/bible-quiz" style={g}>all-ages Bible quiz</a> runs harder questions with a
              test-yourself framing.</p>
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

export default function Page() {
  return (
    <V2Shell>
      <BibleJeopardy />
    </V2Shell>
  )
}
