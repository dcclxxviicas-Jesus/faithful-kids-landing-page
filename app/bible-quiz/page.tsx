import type { Metadata } from 'next'
import { TriviaQuizGame } from '../bible-trivia/TriviaQuizGame'
import { SiteNav, SiteFooter } from '../components/SiteChrome'
import { EASY, MEDIUM, HARD } from '@/lib/trivia-game-questions'
import { BY_AGE, BY_FORMAT, SEASONAL } from '../bible-trivia/trivia-directory'

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
  title: { absolute: 'Bible Quiz — Play Free Online, 100 Questions with Answers' },
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
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(quizSchema) }} />
      <style dangerouslySetInnerHTML={{ __html: `
        .td-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(270px, 1fr)); gap: 12px; }
        .td-card { display: flex; flex-direction: column; gap: 4px; background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 14px 16px; text-decoration: none; color: var(--text); transition: border-color .15s, transform .15s; }
        .td-card:hover { border-color: var(--primary); transform: translateY(-2px); }
        .td-card strong { font-weight: 800; }
        .td-card span { color: var(--text-muted); font-size: .9rem; }
      ` }} />
      <SiteNav />
      <main style={{ maxWidth: 860, margin: '0 auto', padding: '40px 20px 80px' }}>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 12 }}>
          Bible Quiz
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
          One hundred questions, easy to expert, with the verse behind every answer.
          Pick a level and play a ten-question round right here — no sign-up, no ads — or
          scroll down to <a href="#sample" style={{ color: 'var(--primary)', fontWeight: 700 }}>read questions with the answers shown</a> and
          grab a <a href="#printable" style={{ color: 'var(--primary)', fontWeight: 700 }}>printable PDF</a>.
        </p>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: 28 }}>
          Playing with younger children? The <a href="/bible-trivia" style={{ color: 'var(--primary)', fontWeight: 700 }}>kids&apos; Bible trivia game</a> uses
          the same bank with gentler pacing.
        </p>

        <TriviaQuizGame />

        <section id="sample" style={{ marginTop: 56 }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 8 }}>
            Fifteen Bible quiz questions and answers to start
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
            Five from each level, exactly as the game asks them. Read the question aloud,
            take answers from the room, then read the verse — that last step is what turns
            a quiz into the best five-minute Bible study of the week.
          </p>
          {[['Easy', SAMPLE.slice(0, 5)], ['Medium', SAMPLE.slice(5, 10)], ['Hard', SAMPLE.slice(10, 15)]].map(([label, qs]) => (
            <div key={label as string} style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: 10 }}>{label as string}</h3>
              <ol style={{ paddingLeft: 22, display: 'grid', gap: 10 }}>
                {(qs as typeof SAMPLE).map(q => (
                  <li key={q.q} style={{ color: 'var(--text)' }}>
                    {q.q}{' '}
                    <strong>{q.a}</strong>{' '}
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>({q.ref})</span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
          <p style={{ color: 'var(--text-secondary)' }}>
            The other 85 are in the game above — it deals a fresh round every time, so it
            never plays the same twice.
          </p>
        </section>

        <section style={{ marginTop: 48 }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 16 }}>
            Pick your quiz by difficulty
          </h2>
          <div className="td-cards">
            {GRADED.map(l => (
              <a key={l.href} className="td-card" href={l.href}>
                <strong>{l.title}</strong>
                <span>{l.note}</span>
              </a>
            ))}
          </div>
        </section>

        <section id="printable" style={{ marginTop: 48 }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 8 }}>
            Printable Bible quiz (free PDF)
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 12 }}>
            Running this on paper — a classroom, a church table, a long car ride?{' '}
            <a href="https://d3g07v1w0lehiv.cloudfront.net/printables/bible-quiz-questions-for-kids.pdf" style={{ color: 'var(--primary)', fontWeight: 700 }}>
              Download the quiz sheets
            </a>{' '}
            with the answer key on its own page, free to photocopy. The{' '}
            <a href="https://d3g07v1w0lehiv.cloudfront.net/printables/christmas-bible-trivia.pdf" style={{ color: 'var(--primary)', fontWeight: 700 }}>
              Christmas edition PDF
            </a>{' '}
            does the same for December. More paper games live in our{' '}
            <a href="/printables" style={{ color: 'var(--primary)', fontWeight: 700 }}>free printables library</a>.
          </p>
        </section>

        <section style={{ marginTop: 48 }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 16 }}>
            More quizzes by age, format, and season
          </h2>
          <div className="td-cards">
            {[...BY_AGE, ...BY_FORMAT.slice(0, 3), ...SEASONAL.slice(0, 2)].map(l => (
              <a key={l.href} className="td-card" href={l.href}>
                <strong>{l.title}</strong>
                <span>{l.note}</span>
              </a>
            ))}
          </div>
          <p style={{ marginTop: 14 }}>
            <a href="/bible-trivia#all-trivia" style={{ color: 'var(--primary)', fontWeight: 700 }}>
              Browse every book of the Bible — all 66 quizzes &rarr;
            </a>
          </p>
        </section>

        <section style={{ marginTop: 56, textAlign: 'center', background: 'var(--bg-warm)', borderRadius: 16, padding: '36px 24px' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 10 }}>
            If this quiz was fun, the lessons behind it are better
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 560, margin: '0 auto 18px' }}>
            Every answer here comes from a two-minute video lesson in the Faithful Kids app —
            300+ of them, Genesis to Revelation, each with its own quiz and reflection. No ads, ever.
          </p>
          <a href="/quiz" className="btn-primary btn-hero" style={{ textDecoration: 'none' }}>
            Start your free trial
          </a>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
