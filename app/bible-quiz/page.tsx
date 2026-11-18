import type { Metadata } from 'next'
import { TriviaQuizGame } from '../bible-trivia/TriviaQuizGame'
import { SiteNav, SiteFooter } from '../components/SiteChrome'
import { EASY, MEDIUM, HARD } from '@/lib/trivia-game-questions'
import { BY_AGE, BY_FORMAT, SEASONAL } from '../bible-trivia/trivia-directory'
import { V2Shell } from '../v2-shell'
import { HubHead } from '../hub-ui'
import '../home.css'
import '../v2-pages.css'
import '../hub.css'

/* The all-ages twin of /bible-trivia.
 *
 * Why two hubs exist and must stay differentiated: "bible quiz" (9,900/mo,
 * KD 2) and "bible trivia" are the same intent in different words, and the
 * site only ever built for the second one. /bible-trivia is titled for kids
 * and owns the kids phrasing; THIS page owns the bare "quiz" phrasing for the
 * general searcher — graded play, test-yourself framing, answers up front.
 * Do not retitle either page onto the other's head term or they cannibalize
 * (the word-search hub/detail lesson, same shape).
 */

export const metadata: Metadata = {
  // absolute: the root layout appends " | Faithful Kids" (16 chars), which
  // pushed this past Google's ~60-char display cutoff.
  title: { absolute: 'Bible Quiz: Play Free Online, 100 Questions with Answers' },
  description:
    'Take a free Bible quiz: 100 questions from easy to expert with the verse behind every answer. Play online, test yourself, or print the PDF. All ages.',
  alternates: { canonical: 'https://faithfulkids.app/bible-quiz' },
}

// A readable, indexable sample — the game itself is JavaScript, and a page
// ranks on the text it serves. Drawn straight from the live question bank so
// the sample can never drift from what the game actually asks.
const SAMPLE = [
  ...EASY.slice(0, 5),
  ...MEDIUM.slice(0, 5),
  ...HARD.slice(0, 5),
]

const quizSchema = {
  '@context': 'https://schema.org',
  '@type': 'Quiz',
  name: 'Bible Quiz',
  about: { '@type': 'Thing', name: 'The Bible' },
  assesses: 'Bible knowledge',
  provider: { '@type': 'Organization', name: 'Faithful Kids', url: 'https://faithfulkids.app' },
  hasPart: SAMPLE.slice(0, 3).map(q => ({
    '@type': 'Question',
    eduQuestionType: 'Multiple choice',
    text: q.q,
    acceptedAnswer: { '@type': 'Answer', text: q.a },
  })),
}

const GRADED = [
  { href: '/blog/easy-bible-trivia-questions', title: 'Easy round', note: 'Warm-up questions anyone at the table can hit' },
  { href: '/blog/bible-quiz-questions-and-answers', title: '75-question self-test', note: 'Score yourself from Beginner to Bible Master' },
  { href: '/blog/hard-bible-trivia-questions', title: 'Hard round', note: 'For the person who says they know the Bible' },
  { href: '/blog/100-bible-trivia-questions-and-answers', title: 'The full hundred', note: 'One long list, answers and verses included' },
  { href: '/blog/bible-trivia-for-adults', title: 'Adult small-group set', note: 'Written for study groups, not Sunday school' },
  { href: '/blog/christmas-bible-trivia', title: 'Christmas edition', note: '80 nativity questions in four rounds, plus a carol round' },
]

export default function BibleQuizPage() {
  return (
    <V2Shell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(quizSchema) }} />
      <SiteNav />

      {/* Redesigned Nov 2026 in the same family as /bible-trivia (centred
          header, the game straight under it) but without the kids' painting:
          this page is the all-ages quiz and should not look like the kids'
          one. Every word, link and heading is unchanged. */}
      <main id="main-content" className="hb bq">
        <section className="bq-head">
          <h1 className="hv-h1">Bible Quiz</h1>
          <p className="bq-lede">
            One hundred questions, easy to expert, with the verse behind every answer.
            Pick a level and play a ten-question round right here, no sign-up, no ads; or
            scroll down to <a href="#sample">read questions with the answers shown</a> and
            grab a <a href="#printable">printable PDF</a>.
          </p>
          <p className="bq-aside">
            Playing with younger children? The <a href="/bible-trivia">kids&apos; Bible trivia game</a> uses
            the same bank with gentler pacing.
          </p>
        </section>

        <section className="hb-game-band bq-game">
          <div className="hb-play"><TriviaQuizGame /></div>
        </section>

        <section id="sample" className="hb-section">
          <div className="hb-wrap">
            <HubHead
              title="Fifteen Bible quiz questions and answers to start"
              sub={<>Five from each level, exactly as the game asks them. Read the question aloud,
                take answers from the room, then read the verse, that last step is what turns
                a quiz into the best five-minute Bible study of the week.</>}
            />
            <div className="bq-levels">
              {[['Easy', SAMPLE.slice(0, 5)], ['Medium', SAMPLE.slice(5, 10)], ['Hard', SAMPLE.slice(10, 15)]].map(([label, qs]) => (
                <div key={label as string} className="bq-level">
                  <h3>{label as string}</h3>
                  <ol>
                    {(qs as typeof SAMPLE).map(q => (
                      <li key={q.q}>
                        <span className="bq-q">{q.q}</span>{' '}
                        <strong>{q.a}</strong>{' '}
                        <span className="bq-ref">({q.ref})</span>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
            <p className="bq-after">
              The other 85 are in the game above, it deals a fresh round every time, so it
              never plays the same twice.
            </p>
          </div>
        </section>

        <section className="hb-section is-paper">
          <div className="hb-wrap bq-twin">
            <div>
              <HubHead title="Pick your quiz by difficulty" />
              <ul className="hb-links">
                {GRADED.map(l => (
                  <li key={l.href}><a href={l.href}><strong>{l.title}</strong><span>{l.note}</span></a></li>
                ))}
              </ul>
            </div>
            <div>
              <HubHead title="More quizzes by age, format, and season" />
              <ul className="hb-links">
                {[...BY_AGE, ...BY_FORMAT.slice(0, 3), ...SEASONAL.slice(0, 2)].map(l => (
                  <li key={l.href}><a href={l.href}><strong>{l.title}</strong><span>{l.note}</span></a></li>
                ))}
              </ul>
              <p className="bq-all">
                <a href="/bible-trivia#all-trivia">
                  Browse every book of the Bible, all 66 quizzes &rarr;
                </a>
              </p>
            </div>
          </div>
        </section>

        <section id="printable" className="hb-section">
          <div className="hb-wrap is-narrow">
            <div className="bq-print">
              <h2>Printable Bible quiz (free PDF)</h2>
              <p>
                Running this on paper, a classroom, a church table, a long car ride?{' '}
                <a href="https://faithfulkids.app/printables/bible-quiz-questions-for-kids.pdf">
                  Download the quiz sheets
                </a>{' '}
                with the answer key on its own page, free to photocopy. The{' '}
                <a href="https://faithfulkids.app/printables/christmas-bible-trivia.pdf">
                  Christmas edition PDF
                </a>{' '}
                does the same for December. More paper games live in our{' '}
                <a href="/printables">free printables library</a>.
              </p>
            </div>
          </div>
        </section>

        <section className="hv-close">
          <h2>If this quiz was fun, the lessons behind it are better</h2>
          <p className="hv-close-fine" style={{ maxWidth: 560, margin: '0 auto 22px' }}>
            Every answer here comes from a two-minute video lesson in the Faithful Kids app,
            300+ of them, Genesis to Revelation, each with its own quiz and reflection. No ads, ever.
          </p>
          <a href="/quiz" className="hv-cta">
            <span className="hv-cta-play" aria-hidden="true" />
            Start your free trial
          </a>
        </section>
      </main>
      <SiteFooter />
    </V2Shell>
  )
}
