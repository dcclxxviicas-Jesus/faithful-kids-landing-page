import type { Metadata } from 'next'
import { SiteNav, SiteFooter } from '../components/SiteChrome'

export const metadata: Metadata = {
  title: 'Free for Churches — Kids Bible Video Lessons',
  description:
    'Free for churches: give your Sunday school or kids ministry full access to 670 Bible video episodes with quizzes, plus printables and a trivia game.',
  alternates: { canonical: 'https://faithfulkids.app/churches' },
}

const mailto =
  'mailto:team@faithfulkids.app?subject=Church%20partnership%20—%20%5Byour%20church%20name%5D&body=Hi%20Faithful%20Kids%20team%2C%0A%0AChurch%2Fministry%20name%3A%0AWebsite%3A%0AAbout%20how%20many%20kids%20in%20your%20class%3A%0A%0AWe%27d%20love%20free%20access%20for%20our%20kids%20ministry!'

export default function Churches() {
  return (
    <>
      <SiteNav active="churches" />

      {/* Hero */}
      <section className="blog-hero" style={{ paddingBottom: 32 }}>
        <span className="section-label">For Churches &amp; Kids Ministries</span>
        <h1>
          Faithful Kids is <span style={{ color: 'var(--primary)' }}>free for churches</span>
        </h1>
        <p className="blog-hero-sub">
          Give your Sunday school or kids ministry full access to our Bible video learning app —
          670 story episodes with quizzes and reflections — at no cost. We built this to serve
          families, and that starts with the church.
        </p>
        <a
          href={mailto}
          className="btn-primary btn-hero"
          style={{ textDecoration: 'none', maxWidth: '100%' }}
        >
          Request Free Access —{' '}
          <span style={{ whiteSpace: 'nowrap' }}>team@faithfulkids.app</span> →
        </a>
        <p className="blog-hero-note">
          Clicking opens your email app. Or write us directly at{' '}
          <a href={mailto} style={{ color: 'var(--primary)', fontWeight: 700 }}>
            team@faithfulkids.app
          </a>
          . One email — usually set up within 24 hours.
        </p>
      </section>

      {/* How it works */}
      <section className="features-section" style={{ paddingBottom: 56 }}>
        <span className="section-label">How It Works</span>
        <h2>Three steps, zero paperwork</h2>
        <p className="section-sub">No forms, no calls, no contracts — just an email.</p>
        <div className="steps-grid" style={{ padding: '8px 0 0' }}>
          <div className="step-card">
            <div className="step-num">1</div>
            <h3>Email us from your church</h3>
            <p>
              One short email with your church or ministry name and roughly how many kids you
              serve. That&apos;s the whole application.
            </p>
          </div>
          <div className="step-card">
            <div className="step-num">2</div>
            <h3>We set up free access</h3>
            <p>
              Your Sunday school class gets full access to everything — the same product families
              pay for, free for your ministry.
            </p>
          </div>
          <div className="step-card">
            <div className="step-num">3</div>
            <h3>If it blesses your kids, tell your families</h3>
            <p>
              That&apos;s the whole deal. If Faithful Kids is a blessing to your class, we simply
              ask that you consider adding it to your church&apos;s online resources page. No
              obligation, ever.
            </p>
          </div>
        </div>
      </section>

      {/* What's included */}
      <section style={{ maxWidth: 'var(--max-width)', margin: '0 auto', padding: '72px 24px', textAlign: 'center' }}>
        <span className="section-label">What Your Ministry Gets</span>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 12 }}>
          Everything families get — free for your class
        </h2>
        <p className="section-sub">The full app, plus free resources you can use today without signing up for anything.</p>
        <div className="features-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          <div className="feature-item">
            <div className="feature-icon">📺</div>
            <h3>670 Bible video episodes</h3>
            <p>Short story episodes across 67 series, Genesis to Revelation — each followed by a quiz and reflection.</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🏆</div>
            <h3>Quizzes, levels &amp; streaks</h3>
            <p>The gamified structure keeps kids coming back — great for weekly memory-verse and story review.</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">📄</div>
            <h3>Free printables</h3>
            <p>
              <a href="/printables" style={{ color: 'var(--primary)', fontWeight: 700 }}>Trivia pack, 30-day challenge, bedtime kit</a> — print
              unlimited copies for your class.
            </p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🧩</div>
            <h3>Embeddable trivia game</h3>
            <p>
              Put our <a href="/bible-trivia#embed" style={{ color: 'var(--primary)', fontWeight: 700 }}>free Bible trivia game</a> directly on
              your church website — kids play right on your page.
            </p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🛡️</div>
            <h3>Safe by design</h3>
            <p>Zero ads, COPPA-compliant privacy, parent dashboard. Nothing in the app links out to the open internet.</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">✝️</div>
            <h3>Scripture-first</h3>
            <p>Nondenominational: episodes retell the Bible&apos;s own stories and cite chapter and verse — no teaching layered on top.</p>
          </div>
        </div>
      </section>

      {/* Honest FAQ */}
      <section className="features-section" style={{ textAlign: 'center' }}>
        <span className="section-label">Common Questions</span>
        <h2>The honest answers</h2>
        <div style={{ maxWidth: 720, margin: '28px auto 0', textAlign: 'left', display: 'grid', gap: 14 }}>
          <div className="feature-item">
            <h3 style={{ fontSize: '1rem' }}>What&apos;s the catch?</h3>
            <p style={{ fontSize: '0.9rem' }}>
              There isn&apos;t one. Families pay for Faithful Kids at home; ministry use is free. If
              it blesses your kids, we hope you&apos;ll mention us on your church&apos;s resources
              page — that&apos;s a request, not a condition.
            </p>
          </div>
          <div className="feature-item">
            <h3 style={{ fontSize: '1rem' }}>What&apos;s your doctrinal position?</h3>
            <p style={{ fontSize: '0.9rem' }}>
              Nondenominational and Scripture-first: episodes retell the Bible&apos;s own stories
              and cite chapter and verse, without denominational teaching layered on top. We&apos;re
              happy to share sample episodes so you can review the content before using it with
              your class.
            </p>
          </div>
          <div className="feature-item">
            <h3 style={{ fontSize: '1rem' }}>Is it safe for kids?</h3>
            <p style={{ fontSize: '0.9rem' }}>
              Yes — no ads, no external links, no chat, COPPA-compliant privacy, and a
              PIN-protected parent area. See our{' '}
              <a href="/privacy" style={{ color: 'var(--primary)', fontWeight: 700 }}>privacy policy</a>.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta-section">
        <h2>Ready to try it with your class?</h2>
        <p>Email us your church name and class size — we&apos;ll take it from there.</p>
        <a href={mailto} className="btn-primary btn-hero" style={{ textDecoration: 'none' }}>
          team@faithfulkids.app →
        </a>
        <div className="final-badges">
          <span>✓ Free for ministries</span>
          <span>✓ Set up in 24 hours</span>
          <span>✓ No obligation</span>
        </div>
      </section>

      <SiteFooter />
    </>
  )
}
