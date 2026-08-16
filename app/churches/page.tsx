import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Free for Churches — Bible Videos & Quizzes for Your Kids Ministry',
  description:
    'Faithful Kids is free for churches: give your Sunday school or kids ministry full access to 670 Bible video episodes with quizzes, plus free printables and an embeddable trivia game.',
  alternates: { canonical: 'https://faithfulkids.app/churches' },
}

const EMERALD = '#059669'

const mailto =
  'mailto:team@faithfulkids.app?subject=Church%20partnership%20—%20%5Byour%20church%20name%5D&body=Hi%20Faithful%20Kids%20team%2C%0A%0AChurch%2Fministry%20name%3A%0AWebsite%3A%0AAbout%20how%20many%20kids%20in%20your%20class%3A%0A%0AWe%27d%20love%20free%20access%20for%20our%20kids%20ministry!'

const steps = [
  {
    n: '1',
    title: 'Email us from your church',
    body: 'One short email with your church or ministry name and roughly how many kids you serve. No forms, no calls.',
  },
  {
    n: '2',
    title: 'We set up free access',
    body: 'Your Sunday school class or kids ministry gets full access to everything — the same product families pay for, free for your ministry.',
  },
  {
    n: '3',
    title: 'If it blesses your kids, tell your families',
    body: 'That’s the whole deal. If Faithful Kids is a blessing to your class, we simply ask that you consider adding it to your church’s online resources page so your families can find it. No obligation, ever.',
  },
]

const included = [
  ['📺', '670 Bible video episodes', 'Short story episodes across 67 series, Genesis to Revelation — each followed by a quiz and reflection.'],
  ['🏆', 'Quizzes, levels & streaks', 'The gamified structure keeps kids coming back — great for weekly memory-verse and story review.'],
  ['📄', 'Free printables', '100-question trivia pack, a 30-day family Bible challenge, and a bedtime Bible kit — print unlimited copies for your class.'],
  ['🧩', 'Embeddable trivia game', 'Put our free Bible trivia game directly on your church website — kids play right on your page.'],
  ['🛡️', 'Safe by design', 'Zero ads, COPPA-compliant privacy, parent dashboard. Nothing in the app links out to the open internet.'],
]

export default function Churches() {
  return (
    <main
      style={{
        background: 'linear-gradient(180deg, #f0fdf9 0%, #ffffff 360px)',
        minHeight: '100vh',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        color: '#333',
        lineHeight: 1.7,
      }}
    >
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '36px 20px 60px' }}>
        {/* Hero */}
        <header style={{ textAlign: 'center', marginBottom: 36 }}>
          <a href="/" style={{ color: EMERALD, fontWeight: 800, textDecoration: 'none', fontSize: '0.9rem' }}>
            💚 Faithful Kids
          </a>
          <h1 style={{ fontSize: 'clamp(1.9rem, 5vw, 2.6rem)', fontWeight: 900, margin: '10px 0 8px', color: '#111827', lineHeight: 1.15 }}>
            Faithful Kids is free for churches
          </h1>
          <p style={{ color: '#6b7280', fontSize: '1.05rem', margin: '0 auto 22px', maxWidth: 560 }}>
            Give your Sunday school or kids ministry full access to our Bible video learning app —
            670 story episodes with quizzes and reflections — at no cost. We built this to serve
            families, and that starts with the church.
          </p>
          <a
            href={mailto}
            style={{
              display: 'inline-block',
              background: EMERALD,
              color: '#fff',
              fontWeight: 800,
              fontSize: '1rem',
              padding: '14px 32px',
              borderRadius: 999,
              textDecoration: 'none',
            }}
          >
            Request free access →
          </a>
          <p style={{ fontSize: '0.82rem', color: '#9ca3af', margin: '10px 0 0' }}>
            One email. Usually set up within 24 hours.
          </p>
        </header>

        {/* How it works */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, margin: '0 0 16px', color: '#111827' }}>How it works</h2>
          <div style={{ display: 'grid', gap: 14 }}>
            {steps.map(s => (
              <div key={s.n} style={{ display: 'flex', gap: 16, background: '#fff', border: '2px solid #d1fae5', borderRadius: 16, padding: '18px 20px' }}>
                <div style={{ flexShrink: 0, width: 36, height: 36, borderRadius: '50%', background: EMERALD, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.05rem' }}>
                  {s.n}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '2px 0 4px', color: '#065f46' }}>{s.title}</h3>
                  <p style={{ margin: 0, fontSize: '0.93rem' }}>{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* What's included */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, margin: '0 0 16px', color: '#111827' }}>What your ministry gets</h2>
          <div style={{ display: 'grid', gap: 12 }}>
            {included.map(([emoji, title, body]) => (
              <div key={title} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1.5rem', lineHeight: 1.3 }}>{emoji}</span>
                <p style={{ margin: 0, fontSize: '0.95rem' }}>
                  <strong style={{ color: '#111827' }}>{title}.</strong> {body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Free stuff right now */}
        <section
          style={{ background: '#ecfdf5', border: '2px solid #34d399', borderRadius: 20, padding: '24px', marginBottom: 40 }}
        >
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 10px', color: '#065f46' }}>
            Don&apos;t want to email anyone? Start with the free stuff
          </h2>
          <p style={{ margin: '0 0 8px', fontSize: '0.95rem' }}>
            No sign-up needed for any of these:
          </p>
          <ul style={{ margin: 0, paddingLeft: 22, fontSize: '0.95rem' }}>
            <li><a href="/bible-trivia" style={{ color: EMERALD, fontWeight: 700 }}>Play the Bible trivia game</a> — or <a href="/bible-trivia#embed" style={{ color: EMERALD, fontWeight: 700 }}>embed it on your church website</a></li>
            <li><a href="/printables" style={{ color: EMERALD, fontWeight: 700 }}>Print the free Bible activity packs</a> for your class</li>
            <li><a href="/blog" style={{ color: EMERALD, fontWeight: 700 }}>Browse 400+ Bible story guides</a> for lesson prep</li>
          </ul>
        </section>

        {/* Honest FAQ */}
        <section style={{ marginBottom: 44 }}>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, margin: '0 0 14px', color: '#111827' }}>Common questions</h2>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: '18px 0 4px' }}>What&apos;s the catch?</h3>
          <p style={{ margin: 0, fontSize: '0.95rem' }}>
            There isn&apos;t one. Families pay for Faithful Kids at home; ministry use is free. If it
            blesses your kids, we hope you&apos;ll mention us on your church&apos;s resources page —
            that&apos;s a request, not a condition.
          </p>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: '18px 0 4px' }}>What&apos;s your doctrinal position?</h3>
          <p style={{ margin: 0, fontSize: '0.95rem' }}>
            We&apos;re nondenominational and Scripture-first: episodes retell the Bible&apos;s own
            stories and cite chapter and verse, without denominational teaching layered on top.
            We&apos;re happy to share sample episodes so you can review the content yourself before
            using it with your class.
          </p>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: '18px 0 4px' }}>Is it safe for kids?</h3>
          <p style={{ margin: 0, fontSize: '0.95rem' }}>
            Yes — no ads, no external links, no chat, COPPA-compliant privacy, and a PIN-protected
            parent area. See our <a href="/privacy" style={{ color: EMERALD, fontWeight: 700 }}>privacy policy</a>.
          </p>
        </section>

        {/* Bottom CTA */}
        <section style={{ textAlign: 'center', background: '#fff', border: '2px solid #d1fae5', borderRadius: 20, padding: '28px 24px' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 900, margin: '0 0 8px', color: '#111827' }}>
            Ready to try it with your class?
          </h2>
          <p style={{ color: '#6b7280', margin: '0 0 16px', fontSize: '0.95rem' }}>
            Email us your church name and class size — we&apos;ll take it from there.
          </p>
          <a
            href={mailto}
            style={{ display: 'inline-block', background: EMERALD, color: '#fff', fontWeight: 800, fontSize: '1rem', padding: '14px 32px', borderRadius: 999, textDecoration: 'none' }}
          >
            team@faithfulkids.app →
          </a>
        </section>

        <footer style={{ marginTop: 48, paddingTop: 20, borderTop: '1px solid #e5e7eb', textAlign: 'center', fontSize: '0.85rem', color: '#9ca3af' }}>
          <p style={{ margin: 0 }}>
            Made with 💚 by <a href="/" style={{ color: EMERALD, fontWeight: 700 }}>Faithful Kids</a> ·{' '}
            <a href="/bible-trivia" style={{ color: EMERALD, fontWeight: 700 }}>Bible trivia</a> ·{' '}
            <a href="/printables" style={{ color: EMERALD, fontWeight: 700 }}>Free printables</a>
          </p>
        </footer>
      </div>
    </main>
  )
}
