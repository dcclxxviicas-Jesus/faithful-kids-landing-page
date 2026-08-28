import type { Metadata } from 'next'
import { TriviaQuizGame } from './TriviaQuizGame'
import { EmbedBox } from './EmbedBox'
import { SiteNav, SiteFooter } from '../components/SiteChrome'
import { EASY, MEDIUM, HARD } from '@/lib/trivia-game-questions'
import { BY_AGE, BY_FORMAT, SEASONAL, OT_TRIVIA, NT_TRIVIA, ALL_TRIVIA_LINKS } from './trivia-directory'
import type { TriviaLink } from './trivia-directory'

export const metadata: Metadata = {
  title: 'Free Bible Trivia for Kids — 100 Questions',
  description:
    'Play free Bible trivia online: 100 kid-friendly questions across easy, medium and hard levels, every answer with its verse. Free to embed on your site.',
  alternates: { canonical: 'https://faithfulkids.app/bible-trivia' },
}

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

export default function BibleTriviaPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(quizSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(directorySchema) }} />
      <SiteNav active="trivia" />

      {/* Hero */}
      <section className="blog-hero" style={{ paddingBottom: 28 }}>
        <span className="section-label">Free Bible Game</span>
        <h1>
          Bible Trivia <span style={{ color: 'var(--primary)' }}>for Kids</span>
        </h1>
        <p className="blog-hero-sub">
          This is our all-of-the-Bible quiz: 100 questions from Genesis to Revelation, 3 levels,
          every answer backed by a verse. Play together at dinner, in the car, or in Sunday school —
          free, no sign-up, no ads. Want one book, one age group, or a printable?{' '}
          <a href="#all-trivia" style={{ color: 'var(--primary)', fontWeight: 700 }}>
            Every trivia game we have is listed below
          </a>.
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

      {/* Directory of every trivia page — the hub's job is to hand visitors
          (and link equity) to the specific game they want. Sits below the
          game on purpose: play first, browse after. */}
      <section id="all-trivia" style={{ maxWidth: 960, margin: '0 auto', padding: '24px 24px 72px' }}>
        <style dangerouslySetInnerHTML={{ __html: `
          .td-group { margin-bottom: 40px; }
          .td-group h3 { font-size: 1.25rem; font-weight: 800; letter-spacing: -0.01em; margin: 0 0 14px; }
          .td-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(270px, 1fr)); gap: 12px; }
          .td-card { display: block; border: 1px solid var(--border, #e5e7eb); border-radius: 12px; padding: 14px 16px; text-decoration: none; background: var(--card-bg, #fff); transition: border-color .15s, transform .15s; }
          .td-card:hover { border-color: var(--primary); transform: translateY(-1px); }
          .td-card strong { color: var(--primary); font-weight: 700; display: block; margin-bottom: 3px; }
          .td-card span { color: var(--text-muted, #6b7280); font-size: 0.88rem; line-height: 1.45; }
          .td-chips { display: flex; flex-wrap: wrap; gap: 8px; }
          .td-chip { display: inline-block; border: 1px solid var(--border, #e5e7eb); border-radius: 999px; padding: 6px 14px; font-size: 0.9rem; font-weight: 600; color: var(--primary); text-decoration: none; background: var(--card-bg, #fff); transition: border-color .15s; }
          .td-chip:hover { border-color: var(--primary); }
        ` }} />
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <span className="section-label">The Whole Collection</span>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 12px' }}>
            All Our Bible Trivia Games
          </h2>
          <p className="section-sub" style={{ margin: '0 auto' }}>
            The game above covers the whole Bible. These pages go narrower and deeper — pick an age,
            a format, a season, or any of the 66 books.
          </p>
        </div>

        <div className="td-group">
          <h3>By age</h3>
          <div className="td-cards">
            {BY_AGE.map((l: TriviaLink) => (
              <a key={l.href} className="td-card" href={l.href}>
                <strong>{l.title}</strong>
                <span>{l.note}</span>
              </a>
            ))}
          </div>
        </div>

        <div className="td-group">
          <h3>By format</h3>
          <div className="td-cards">
            {BY_FORMAT.map((l: TriviaLink) => (
              <a key={l.href} className="td-card" href={l.href}>
                <strong>{l.title}</strong>
                <span>{l.note}</span>
              </a>
            ))}
          </div>
        </div>

        <div className="td-group">
          <h3>By season</h3>
          <div className="td-cards">
            {SEASONAL.map((l: TriviaLink) => (
              <a key={l.href} className="td-card" href={l.href}>
                <strong>{l.title}</strong>
                <span>{l.note}</span>
              </a>
            ))}
          </div>
        </div>

        <div className="td-group">
          <h3>By book of the Bible — Old Testament</h3>
          <div className="td-chips">
            {OT_TRIVIA.map((l: TriviaLink) => (
              <a key={l.href} className="td-chip" href={l.href}>{l.title}</a>
            ))}
          </div>
        </div>

        <div className="td-group" style={{ marginBottom: 0 }}>
          <h3>By book of the Bible — New Testament</h3>
          <div className="td-chips">
            {NT_TRIVIA.map((l: TriviaLink) => (
              <a key={l.href} className="td-chip" href={l.href}>{l.title}</a>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta-section">
        <h2>If your kids love this game, they&apos;ll love Faithful Kids</h2>
        <p>
          Short Bible story videos with quizzes just like these — 300+ episodes from Genesis to
          Revelation, with levels, streaks, and zero ads.
        </p>
        <a href="/quiz" className="btn-primary btn-hero" style={{ textDecoration: 'none' }}>
          Start Your Free Trial
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
