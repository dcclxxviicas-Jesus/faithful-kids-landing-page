import type { Metadata } from 'next'
import { TriviaQuizGame } from './TriviaQuizGame'
import { EmbedBox } from './EmbedBox'
import { EASY, MEDIUM, HARD } from '@/lib/trivia-game-questions'

export const metadata: Metadata = {
  title: 'Free Bible Trivia Game for Kids — 100 Questions, 3 Levels',
  description:
    'Play free Bible trivia online: 100 kid-friendly questions in easy, medium, and hard levels, every answer with its verse. Perfect for family night, Sunday school, or the car — and free to embed on your own website.',
  alternates: { canonical: 'https://faithfulkids.app/bible-trivia' },
}

const EMERALD = '#059669'

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

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 style={{ fontSize: '1.45rem', fontWeight: 800, margin: '0 0 12px', color: '#111827' }}>{children}</h2>
}

export default function BibleTriviaPage() {
  return (
    <main
      style={{
        background: 'linear-gradient(180deg, #f0fdf9 0%, #ffffff 340px)',
        minHeight: '100vh',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        color: '#333',
        lineHeight: 1.7,
      }}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(quizSchema) }} />
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '36px 20px 60px' }}>
        {/* Hero */}
        <header style={{ textAlign: 'center', marginBottom: 28 }}>
          <a href="/" style={{ color: EMERALD, fontWeight: 800, textDecoration: 'none', fontSize: '0.9rem' }}>
            💚 Faithful Kids
          </a>
          <h1 style={{ fontSize: 'clamp(1.9rem, 5vw, 2.6rem)', fontWeight: 900, margin: '10px 0 8px', color: '#111827', lineHeight: 1.15 }}>
            Bible Trivia for Kids
          </h1>
          <p style={{ color: '#6b7280', fontSize: '1.05rem', margin: '0 auto', maxWidth: 540 }}>
            100 questions, 3 levels, every answer backed by a verse. Play together at dinner, in the
            car, or in Sunday school — free, no sign-up, no ads.
          </p>
        </header>

        {/* The game */}
        <TriviaQuizGame />

        {/* How to play / audience */}
        <section style={{ marginTop: 48 }}>
          <SectionTitle>How to play</SectionTitle>
          <p style={{ margin: '0 0 12px' }}>
            Pick a level — <strong>Easy</strong> (ages 5–8), <strong>Medium</strong> (ages 9–12),{' '}
            <strong>Hard</strong> (teens and adults, with a few famous trick questions), or{' '}
            <strong>Mixed</strong> for family play. Each round deals 10 random questions from our
            100-question pool, so you can play again and again. Correct answers build a streak for
            bonus points, and every answer shows the Bible verse it comes from — so a missed
            question always turns into a story to look up together.
          </p>
          <p style={{ margin: 0 }}>
            Prefer paper? The whole question set is also a{' '}
            <a href="/printables/bible-trivia-pack" style={{ color: EMERALD, fontWeight: 700 }}>
              free printable trivia pack
            </a>{' '}
            (with answer key), part of our{' '}
            <a href="/printables" style={{ color: EMERALD, fontWeight: 700 }}>
              free Bible printables
            </a>{' '}
            for families.
          </p>
        </section>

        {/* Embed section */}
        <section
          id="embed"
          style={{
            marginTop: 44,
            background: '#ecfdf5',
            border: '2px solid #34d399',
            borderRadius: 20,
            padding: '26px 24px',
          }}
        >
          <SectionTitle>🧩 Put this game on your own website — free</SectionTitle>
          <p style={{ margin: '0 0 16px' }}>
            Churches, ministries, homeschool blogs, and newsletters: you&apos;re welcome to embed
            this trivia game on your site, completely free. Copy the code below and paste it into
            any page (it works in WordPress, Squarespace, Wix, and plain HTML). Your visitors play
            right on your page.
          </p>
          <EmbedBox />
          <p style={{ fontSize: '0.85rem', color: '#4b5563', margin: '14px 0 0' }}>
            Questions or a custom request (your own verse set, your church&apos;s name on it)? Email{' '}
            <a href="mailto:team@faithfulkids.app" style={{ color: EMERALD, fontWeight: 700 }}>
              team@faithfulkids.app
            </a>
            {' '}— we love helping ministries.
          </p>
        </section>

        {/* For parents and teachers */}
        <section style={{ marginTop: 44 }}>
          <SectionTitle>For parents, teachers &amp; kids&apos; ministry leaders</SectionTitle>
          <p style={{ margin: '0 0 12px' }}>
            Trivia works because it turns review into play — kids who would sigh at a worksheet will
            beg for one more round. Use Easy questions as a warm-up with young kids, let older kids
            chase a perfect Hard round, or run Mixed as a family tournament. Every question cites
            its verse, so the game doubles as a map of where the great stories live: creation and
            the flood in Genesis, the exodus, David and Goliath, Daniel in the lions&apos; den, the
            life of Jesus, and the early church.
          </p>
          <p style={{ margin: 0 }}>
            If your kids enjoy this, they&apos;ll love{' '}
            <a href="/" style={{ color: EMERALD, fontWeight: 700 }}>Faithful Kids</a> — a Bible
            learning app where kids watch short video episodes of Bible stories, then answer quizzes
            just like these to earn levels and streaks. 670 episodes from Genesis to Revelation,
            with a{' '}
            <a href="/quiz" style={{ color: EMERALD, fontWeight: 700 }}>free 7-day trial</a>.
          </p>
        </section>

        {/* Footer */}
        <footer style={{ marginTop: 56, paddingTop: 20, borderTop: '1px solid #e5e7eb', textAlign: 'center', fontSize: '0.85rem', color: '#9ca3af' }}>
          <p style={{ margin: 0 }}>
            Made with 💚 by <a href="/" style={{ color: EMERALD, fontWeight: 700 }}>Faithful Kids</a> ·{' '}
            <a href="/printables" style={{ color: EMERALD, fontWeight: 700 }}>Free printables</a> ·{' '}
            <a href="/churches" style={{ color: EMERALD, fontWeight: 700 }}>Free for churches</a> ·{' '}
            <a href="/blog" style={{ color: EMERALD, fontWeight: 700 }}>Blog</a>
          </p>
        </footer>
      </div>
    </main>
  )
}
