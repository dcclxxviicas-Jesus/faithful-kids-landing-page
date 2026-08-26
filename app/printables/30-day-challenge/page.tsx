import PrintButton from '../PrintButton';
import { SiteNav, SiteFooter } from '../../components/SiteChrome';

export const metadata = {
  title: '30-Day Family Bible Challenge — Printable',
  description:
    'A free printable 30-day family Bible reading challenge: one short daily reading from creation to resurrection, with a discussion question for each.',
  alternates: { canonical: 'https://faithfulkids.app/printables/30-day-challenge' },
};

type Day = {
  day: number;
  title: string;
  read: string;
  summary: string;
  question: string;
};

const DAYS: Day[] = [
  {
    day: 1,
    title: 'Creation',
    read: 'Genesis 1:1-2:3',
    summary: 'God creates the whole world in six days and calls it very good.',
    question: 'What does it tell you about God that He made the whole universe — and then made you?',
  },
  {
    day: 2,
    title: 'The Fall',
    read: 'Genesis 3:1-24',
    summary: 'Sin enters the world, but God tucks a rescue promise into the very same day.',
    question: 'Why do you think God already had a rescue plan ready?',
  },
  {
    day: 3,
    title: 'Noah and the Flood',
    read: 'Genesis 6:9-22, 8:1-5, 9:12-17',
    summary: 'Faithful Noah builds the ark, and God seals His promise with a rainbow.',
    question: 'What does it feel like to know God keeps His promises — even when things look hopeless?',
  },
  {
    day: 4,
    title: "Abraham's Call",
    read: 'Genesis 12:1-9, 15:1-6',
    summary: 'Abraham leaves everything he knows, and God promises him descendants like the stars.',
    question: 'Abraham left home without knowing where he was going. What step of faith is God asking your family to take?',
  },
  {
    day: 5,
    title: 'Joseph: From Pit to Palace',
    read: 'Genesis 37:12-28, 41:37-43, 50:15-21',
    summary: 'Sold by his brothers, Joseph rises to rule Egypt and sees God turn evil into good.',
    question: 'Can you think of a hard time that God turned into something good?',
  },
  {
    day: 6,
    title: 'Moses and the Burning Bush',
    read: 'Exodus 3:1-14',
    summary: 'God speaks from a burning bush and sends a reluctant Moses to free His people.',
    question: 'Moses felt unqualified. When have you felt that way?',
  },
  {
    day: 7,
    title: 'The Exodus and the Red Sea',
    read: 'Exodus 14:10-31',
    summary: 'God splits the sea and Israel walks through on dry ground to freedom.',
    question: 'What impossible situation in your life needs a "Red Sea" miracle?',
  },
  {
    day: 8,
    title: 'David and Goliath',
    read: '1 Samuel 17:32-50',
    summary: 'A shepherd boy with one stone fells a giant in the name of the Lord.',
    question: 'What is your Goliath — and what name are you going to face it in?',
  },
  {
    day: 9,
    title: "Daniel in the Lion's Den",
    read: 'Daniel 6:1-28',
    summary: 'Daniel keeps praying despite the death decree, and God shuts the lions’ mouths.',
    question: 'What would you keep doing even if you got in trouble for it?',
  },
  {
    day: 10,
    title: 'Jonah: Running and Returning',
    read: 'Jonah 1:1-3:10',
    summary: 'Jonah runs from God, gets a second chance, and a whole city repents.',
    question: 'Have you ever run from something God wanted you to do?',
  },
  {
    day: 11,
    title: 'The Birth of Jesus',
    read: 'Luke 2:1-20',
    summary: 'The King of the universe is born in a stable and laid in a manger.',
    question: 'Why do you think God chose a manger instead of a palace?',
  },
  {
    day: 12,
    title: "Jesus' Baptism",
    read: 'Matthew 3:13-17',
    summary: 'The Spirit descends like a dove and the Father declares His love for His Son.',
    question: 'God was pleased with Jesus before any ministry. What does that tell you about how God sees you?',
  },
  {
    day: 13,
    title: 'The Temptation',
    read: 'Matthew 4:1-11',
    summary: 'Jesus defeats every one of Satan’s temptations with Scripture.',
    question: 'How does knowing the Bible help you when you’re tempted?',
  },
  {
    day: 14,
    title: 'Jesus Calls His Disciples',
    read: 'Mark 1:16-20, Luke 5:27-32',
    summary: 'Fishermen and a tax collector leave everything to follow Jesus.',
    question: 'If Jesus said "Follow me" to you today, what would you need to leave behind?',
  },
  {
    day: 15,
    title: 'The Sermon on the Mount',
    read: 'Matthew 5:1-16',
    summary: 'Jesus turns the world’s values upside down and calls His followers the light of the world.',
    question: 'Which Beatitude speaks to you the most right now?',
  },
  {
    day: 16,
    title: 'Jesus Feeds 5,000',
    read: 'John 6:1-14',
    summary: 'A boy’s small lunch becomes a feast for thousands with baskets left over.',
    question: 'What small thing can you offer Jesus today?',
  },
  {
    day: 17,
    title: 'Jesus Walks on Water',
    read: 'Matthew 14:22-33',
    summary: 'Peter walks on the waves toward Jesus — until he looks at the storm and starts to sink.',
    question: 'When have you taken your eyes off Jesus and started sinking?',
  },
  {
    day: 18,
    title: 'The Prodigal Son',
    read: 'Luke 15:11-32',
    summary: 'A wayward son comes home in shame, and his father runs to meet him with a party.',
    question: 'Which part surprises you most — the son’s return or the father’s reaction?',
  },
  {
    day: 19,
    title: 'The Last Supper',
    read: 'John 13:1-17, Luke 22:14-20',
    summary: 'On His last night, the King kneels to wash feet and shares bread and wine in remembrance.',
    question: 'How can you serve someone in your family today the way Jesus served His friends?',
  },
  {
    day: 20,
    title: 'The Crucifixion and Resurrection',
    read: 'Luke 23:33-49, Matthew 28:1-10',
    summary: 'Jesus dies on the cross, and three days later the tomb is empty — love wins.',
    question: 'Why is the resurrection the most important event in all of history?',
  },
  {
    day: 21,
    title: 'Jesus Appears to the Disciples',
    read: 'John 20:19-29',
    summary: 'Doubting Thomas sees the risen Jesus and cries, "My Lord and my God!"',
    question: 'Is it okay to have doubts? What did Jesus say about believing without seeing?',
  },
  {
    day: 22,
    title: 'The Great Commission',
    read: 'Matthew 28:16-20',
    summary: 'Jesus sends His followers to make disciples of all nations, promising to be with them always.',
    question: 'How can your family "make disciples" in your everyday life?',
  },
  {
    day: 23,
    title: 'Pentecost',
    read: 'Acts 2:1-21',
    summary: 'The Holy Spirit falls like wind and fire, and the Church is born with 3,000 new believers.',
    question: 'What does it mean that the Holy Spirit lives in every believer?',
  },
  {
    day: 24,
    title: 'The First Church',
    read: 'Acts 2:42-47',
    summary: 'The new believers share everything, eat together, pray, and grow every day.',
    question: 'What would it look like if your church or your family lived like this?',
  },
  {
    day: 25,
    title: 'Peter and John Heal a Beggar',
    read: 'Acts 3:1-16',
    summary: 'In the name of Jesus, a man who never walked leaps to his feet praising God.',
    question: 'Peter gave what he had. What do you have to give the people around you?',
  },
  {
    day: 26,
    title: 'Stephen: The First Martyr',
    read: 'Acts 6:8-15, 7:54-60',
    summary: 'As he is stoned, Stephen sees heaven opened and forgives his killers.',
    question: 'What does Stephen’s story teach about the strength of forgiveness?',
  },
  {
    day: 27,
    title: "Paul's Conversion",
    read: 'Acts 9:1-19',
    summary: 'Jesus meets the church’s fiercest persecutor on the Damascus road and turns him into its greatest missionary.',
    question: 'If God can change Paul, is anyone beyond God’s reach?',
  },
  {
    day: 28,
    title: 'Paul and Silas in Prison',
    read: 'Acts 16:16-34',
    summary: 'Midnight hymns in a dungeon end with an earthquake and a jailer’s whole household believing.',
    question: 'Could you praise God in the worst moment of your life?',
  },
  {
    day: 29,
    title: "Paul's Letter to the Romans",
    read: 'Romans 8:28-39',
    summary: 'Nothing in all creation can separate us from the love of God in Christ Jesus.',
    question: 'What makes you feel separated from God’s love — and what does this passage say about that?',
  },
  {
    day: 30,
    title: 'The Promise of Heaven',
    read: 'Revelation 21:1-7',
    summary: 'God wipes away every tear — the story that began in a garden ends with Him dwelling with His people forever.',
    question: 'What are you most looking forward to about heaven?',
  },
];

const EMERALD = '#059669';

export default function ThirtyDayChallengePrintable() {
  return (
    <>
    <SiteNav active="printables" />
    <main
      style={{
        backgroundColor: '#ffffff',
        color: '#111827',
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        maxWidth: '52rem',
        margin: '0 auto',
        padding: '2rem 1.5rem',
      }}
    >
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: #ffffff !important; }
          .fk-card { break-inside: avoid; page-break-inside: avoid; }
          .fk-header { break-after: avoid; }
          @page { margin: 1.2cm; }
        }
        .fk-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.6rem;
        }
        @media screen and (max-width: 600px) {
          .fk-grid { grid-template-columns: 1fr; }
        }
        .fk-checkbox {
          flex-shrink: 0;
          width: 0.9rem;
          height: 0.9rem;
          border: 1.5px solid #111827;
          border-radius: 3px;
          margin-top: 0.15rem;
        }
        .fk-card {
          break-inside: avoid;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          padding: 0.6rem 0.7rem;
          display: flex;
          gap: 0.55rem;
          align-items: flex-start;
        }
      `}</style>

      {/* Print button */}
      <div className="no-print" style={{ textAlign: 'right', marginBottom: '1rem' }}>
        <PrintButton />
      </div>

      {/* Branded header */}
      <header
        className="fk-header"
        style={{
          textAlign: 'center',
          marginBottom: '1.5rem',
          borderBottom: `3px solid ${EMERALD}`,
          paddingBottom: '1rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            marginBottom: '0.5rem',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-sm.png"
            alt="Faithful Kids logo"
            width={32}
            height={32}
            style={{ width: '32px', height: '32px', maxWidth: '100%' }}
          />
          <span style={{ fontWeight: 700, fontSize: '1.05rem', color: EMERALD }}>
            Faithful Kids
          </span>
        </div>
        <h1
          style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            color: EMERALD,
            margin: '0 0 0.35rem 0',
            lineHeight: 1.2,
          }}
        >
          The 30-Day Family Bible Challenge
        </h1>
        <p style={{ fontSize: '0.95rem', color: '#374151', margin: 0 }}>
          One story a night. Read it, talk about it, check it off.
        </p>
      </header>

      {/* 30-day grid */}
      <section className="fk-grid">
        {DAYS.map((d) => (
          <article key={d.day} className="fk-card">
            <span className="fk-checkbox" aria-hidden="true" />
            <div style={{ fontSize: '0.72rem', lineHeight: 1.35 }}>
              <div style={{ fontWeight: 700, fontSize: '0.78rem', color: '#111827' }}>
                Day {d.day} — <span style={{ color: EMERALD }}>{d.title}</span>
              </div>
              <div style={{ margin: '0.1rem 0' }}>
                <strong>Read: {d.read}</strong>
              </div>
              <div style={{ color: '#1f2937' }}>{d.summary}</div>
              <div style={{ fontStyle: 'italic', color: '#374151', marginTop: '0.1rem' }}>
                {d.question}
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* Footer */}
      <footer
        style={{
          marginTop: '1.5rem',
          paddingTop: '0.9rem',
          borderTop: `2px solid ${EMERALD}`,
          textAlign: 'center',
          fontSize: '0.85rem',
          color: '#111827',
        }}
      >
        Want every story as a video with a quiz? Visit{' '}
        <strong style={{ color: EMERALD }}>faithfulkids.app</strong> — free 3-day trial.
      </footer>
    </main>
    <SiteFooter />
    </>
  );
}
