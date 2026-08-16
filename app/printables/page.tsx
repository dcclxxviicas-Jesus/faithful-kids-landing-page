import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Free Printable Bible Activities for Kids | Faithful Kids',
  description:
    'Free printable Bible resources for families: 100 Bible trivia questions, a 30-day family Bible challenge, and a bedtime Bible kit. No sign-up required.',
  alternates: { canonical: 'https://faithfulkids.app/printables' },
}

const PACKS = [
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
    <section style={{ maxWidth: 720, margin: '0 auto', padding: '40px 20px', fontFamily: 'system-ui, sans-serif', color: '#333', lineHeight: 1.7, fontSize: '0.95rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 8 }}>Free Printable Bible Activities for Kids</h1>
      <p style={{ color: '#666', marginBottom: 32, fontSize: '1.05rem' }}>
        Print-ready Bible resources for families, homeschoolers, and Sunday school teachers. Everything on this page is completely free — no sign-up, no email required. Print as many copies as you like for your family, class, or church group.
      </p>

      {PACKS.map(pack => (
        <a
          key={pack.href}
          href={pack.href}
          style={{ display: 'block', textDecoration: 'none', color: 'inherit', background: '#ffffff', border: '2px solid #d1fae5', borderRadius: 16, padding: 24, marginBottom: 20 }}
        >
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 8, color: '#065f46' }}>
            {pack.emoji} {pack.title}
          </h2>
          <p style={{ marginBottom: 10 }}>{pack.description}</p>
          <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: 10 }}>{pack.details}</p>
          <span style={{ color: '#059669', fontWeight: 700 }}>View &amp; print free →</span>
        </a>
      ))}

      <div style={{ background: '#ecfdf5', border: '2px solid #34d399', borderRadius: 16, padding: 24, marginTop: 36 }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 12, color: '#065f46' }}>Who makes these?</h2>
        <p style={{ marginBottom: 8 }}>
          These printables are made by <a href="/" style={{ color: '#059669', fontWeight: 600 }}>Faithful Kids</a>, a Bible video learning app for kids ages 7–15 — short story episodes, quizzes, and reflections that make Scripture stick. The printables are our gift to families either way.
        </p>
        <p style={{ marginBottom: 0 }}>
          Bloggers, churches, and newsletter writers: you&apos;re welcome to link to this page or any individual printable, and to use one screenshot of each pack in a roundup. Questions? Email{' '}
          <a href="mailto:team@faithfulkids.app" style={{ color: '#059669', fontWeight: 600 }}>team@faithfulkids.app</a>.
        </p>
      </div>
    </section>
  )
}
