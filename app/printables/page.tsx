import type { Metadata } from 'next'
import { SiteNav, SiteFooter } from '../components/SiteChrome'

export const metadata: Metadata = {
  title: 'Free Printable Bible Activities for Kids',
  description:
    'Free printable Bible resources for families: 100 Bible trivia questions, a 30-day family Bible challenge, and a bedtime Bible kit. No sign-up required.',
  alternates: { canonical: 'https://faithfulkids.app/printables' },
}

const PACKS = [
  {
    href: '/printables/christmas-coloring-pages',
    emoji: '\u2B50',
    title: 'Christmas & Nativity Coloring Pages',
    description:
      'Six nativity pages following the Christmas story in order — the angel and Mary, the journey to Bethlehem, the stable, the shepherds on the hillside, and the wise men who arrived much later than the cards suggest.',
    details: 'One a week through Advent · No email, no sign-up',
  },
  {
    href: '/printables/easter-coloring-pages',
    emoji: '\u271D\uFE0F',
    title: 'Easter & Holy Week Coloring Pages',
    description:
      'Six pages walking Holy Week from Palm Sunday to the road to Emmaus. The cross page shows the empty cross rather than the crucifixion, so it works with younger children too.',
    details: 'One a day, Sunday to Sunday · No email, no sign-up',
  },
  {
    href: '/printables/bible-word-search',
    emoji: '🔍',
    title: 'Bible Word Search — 10 Puzzles',
    description:
      'Ten printable Bible word searches, each built from one story or theme — Noah, Christmas, Easter, David and Goliath, the armor of God. Twelve words hidden in all eight directions, answer key on the page.',
    details: 'Ages 6+ · Answer keys included · No email, no sign-up',
  },
  {
    href: '/printables/bible-coloring-pages',
    emoji: '🖍️',
    title: 'Bible Coloring Pages — 26 Printables',
    description:
      '26 Bible scenes drawn as clean line art for young children, Creation through the Empty Tomb, including full Christmas and Easter sets. Bold simple outlines with room for thick crayons, each with its Scripture reference.',
    details: 'Print the whole set or one page · No email, no sign-up',
  },
  {
    href: '/printables/bible-trivia-pack',
    emoji: '🏆',
    title: 'Bible Trivia Pack — 100 Questions',
    description:
      '100 kid-friendly Bible trivia questions in three difficulty levels, every answer with its Scripture reference. Perfect for family game night, Sunday school, road trips, or homeschool review.',
    details: 'Easy, medium & hard rounds · Answer key with verse references',
  },
  {
    href: '/printables/30-day-challenge',
    emoji: '📅',
    title: '30-Day Family Bible Challenge',
    description:
      'One month of short daily readings that walk your family through the big story of the Bible — creation to resurrection — with a summary and a discussion question for each day.',
    details: '30 daily readings · Discussion questions · Genesis through the Gospels',
  },
  {
    href: '/printables/bedtime-bible-kit',
    emoji: '🌙',
    title: 'Bedtime Bible Kit',
    description:
      'Seven nights of calm end-of-day routines: short Bible stories, memory verses, and simple prayers designed for the last ten minutes before lights out.',
    details: '7 nights · Bedtime stories · Memory verses · Simple prayers',
  },
]

export default function Printables() {
  return (
    <>
      <SiteNav active="printables" />

      {/* Hero */}
      <section className="blog-hero" style={{ paddingBottom: 24 }}>
        <span className="section-label">Free Downloads</span>
        <h1>
          Free Printable <span style={{ color: 'var(--primary)' }}>Bible Activities</span>
        </h1>
        <p className="blog-hero-sub">
          Print-ready Bible resources for families, homeschoolers, and Sunday school teachers.
          Completely free — no sign-up, no email required. Print as many copies as you like for
          your family, class, or church group.
        </p>
      </section>

      {/* Packs */}
      <div className="asset-grid">
        {PACKS.map(pack => (
          <a key={pack.href} href={pack.href} className="asset-card">
            <div className="asset-card-icon">{pack.emoji}</div>
            <h3>{pack.title}</h3>
            <p>{pack.description}</p>
            <div className="asset-card-meta">{pack.details}</div>
            <span className="asset-card-link">View &amp; print free →</span>
          </a>
        ))}
      </div>

      {/* Who makes these + linking invitation */}
      <section className="features-section">
        <span className="section-label">Who Makes These?</span>
        <h2>A gift from Faithful Kids</h2>
        <p className="section-sub">
          These printables are made by Faithful Kids, a Bible video learning app for kids ages
          7–15 — short story episodes, quizzes, and reflections that make Scripture stick. The
          printables are our gift to families either way. And if your kids like trivia on paper,
          they&apos;ll love the <a href="/bible-trivia" style={{ color: 'var(--primary)', fontWeight: 700 }}>free online trivia game</a>.
        </p>
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'left' }}>
          <div className="feature-item">
            <div className="feature-icon">🔗</div>
            <h3>Bloggers, churches &amp; newsletters</h3>
            <p>
              You&apos;re welcome to link to this page or any individual printable, and to use one
              screenshot of each pack in a roundup. Questions? Email{' '}
              <a href="mailto:team@faithfulkids.app" style={{ color: 'var(--primary)', fontWeight: 700 }}>team@faithfulkids.app</a>.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta-section">
        <h2>Want the stories behind the trivia?</h2>
        <p>
          Faithful Kids brings every one of these stories to life — 670 short video episodes with
          quizzes and reflections, Genesis to Revelation.
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
