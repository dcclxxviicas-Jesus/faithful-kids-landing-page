import type { Metadata } from 'next'
import { TriviaQuizGame } from './TriviaQuizGame'
import { EmbedBox } from './EmbedBox'
import { SiteNav, SiteFooter } from '../components/SiteChrome'
import { EASY, MEDIUM, HARD } from '@/lib/trivia-game-questions'

export const metadata: Metadata = {
  title: 'Free Bible Trivia for Kids — 100 Questions',
  description:
    'Play free Bible trivia online: 100 kid-friendly questions across easy, medium and hard levels, every answer with its verse. Free to embed on your site.',
  alternates: { canonical: 'https://faithfulkids.app/bible-trivia' },
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

export default function BibleTriviaPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(quizSchema) }} />
      <SiteNav active="trivia" />

      {/* Hero */}
      <section className="blog-hero" style={{ paddingBottom: 28 }}>
        <span className="section-label">Free Bible Game</span>
        <h1>
          Bible Trivia <span style={{ color: 'var(--primary)' }}>for Kids</span>
        </h1>
        <p className="blog-hero-sub">
          100 questions, 3 levels, every answer backed by a verse. Play together at dinner, in the
          car, or in Sunday school — free, no sign-up, no ads.
        </p>
      </section>

      {/* The game */}
      <section style={{ padding: '0 24px 64px' }}>
        <TriviaQuizGame />
      </section>

      {/* How to play — warm band */}
      <section className="features-section">
        <span className="section-label">How to Play</span>
        <h2>Pick a level. Deal 10 questions. Chase the streak.</h2>
        <p className="section-sub">
          Every round is dealt fresh from our 100-question pool, so you can play again and again.
        </p>
        <div className="features-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))' }}>
          <div className="feature-item">
            <div className="feature-icon">🌱</div>
            <h3>Four levels</h3>
            <p>Easy (ages 5–8), Medium (ages 9–12), Hard (teens &amp; adults — with famous trick questions), or Mixed for family play.</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🔥</div>
            <h3>Streaks &amp; points</h3>
            <p>Correct answers build a streak for bonus points. Finish a round to earn a rank — from Brave Beginner to Bible Master.</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">📖</div>
            <h3>Every answer cites its verse</h3>
            <p>A missed question always turns into a story to look up together — the game doubles as a map of where the great stories live.</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">📄</div>
            <h3>Prefer paper?</h3>
            <p>
              The whole set is also a <a href="/printables/bible-trivia-pack" style={{ color: 'var(--primary)', fontWeight: 700 }}>free printable pack</a> with
              answer key — part of our <a href="/printables" style={{ color: 'var(--primary)', fontWeight: 700 }}>free printables</a>.
            </p>
          </div>
        </div>
      </section>

      {/* Embed section */}
      <section id="embed" style={{ maxWidth: 760, margin: '0 auto', padding: '72px 24px', textAlign: 'center' }}>
        <span className="section-label">For Churches &amp; Bloggers</span>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 12 }}>
          Put this game on your own website — free
        </h2>
        <p className="section-sub">
          Churches, ministries, homeschool blogs, and newsletters are welcome to embed this trivia
          game, completely free. Copy the code and paste it into any page — WordPress, Squarespace,
          Wix, or plain HTML. Your visitors play right on your page.
        </p>
        <EmbedBox />
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 16 }}>
          Questions, or want a custom version with your church&apos;s name on it? Email{' '}
          <a href="mailto:team@faithfulkids.app" style={{ color: 'var(--primary)', fontWeight: 700 }}>
            team@faithfulkids.app
          </a>{' '}
          — we love helping ministries.
        </p>
      </section>

      {/* Final CTA */}
      <section className="final-cta-section">
        <h2>If your kids love this game, they&apos;ll love Faithful Kids</h2>
        <p>
          Short Bible story videos with quizzes just like these — 670 episodes from Genesis to
          Revelation, with levels, streaks, and zero ads.
        </p>
        <a href="/quiz" className="btn-primary btn-hero" style={{ textDecoration: 'none' }}>
          Start Your Free Week
        </a>
        <div className="final-badges">
          <span>✓ 3-day free trial</span>
          <span>✓ Cancel anytime</span>
          <span>✓ Zero ads, ever</span>
        </div>
      </section>

      <SiteFooter />
    </>
  )
}
