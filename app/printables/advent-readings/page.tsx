import PrintButton from '../PrintButton';
import { SiteNav, SiteFooter } from '../../components/SiteChrome';
import { PrintableCta } from '../PrintableCta'
import printableVideos from '@/lib/printable-videos.json'

/* Targets (DataForSEO, Nov 1, 2026): "advent readings" 880-1,000/mo KD 0-17,
   "bible verses for advent calendar" ~390/mo KD 0. Same artifact serves both:
   a 25-day reading plan whose daily verse doubles as calendar text.
   This is also the seasonal lead magnet ('advent' in lib/lead-emails.ts). */
export const metadata = {
  title: 'Advent Bible Readings for Kids, 25 Days, Printable',
  description:
    'Free printable Advent readings for kids: 25 short daily Bible readings from the first promise to the manger, with a discussion question for each day of December.',
  alternates: { canonical: 'https://faithfulkids.app/printables/advent-readings' },
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
    title: 'The Promise in the Garden',
    read: 'Genesis 3:8-15',
    summary: 'On the very day sin enters the world, God promises a rescuer will come.',
    question: 'Why do you think God made a rescue promise right away instead of waiting?',
  },
  {
    day: 2,
    title: 'A Light in the Darkness',
    read: 'Isaiah 9:2, 6-7',
    summary: 'Seven hundred years early, Isaiah announces a child: Wonderful Counselor, Prince of Peace.',
    question: 'Which of the child’s four names means the most to you tonight?',
  },
  {
    day: 3,
    title: 'The Branch from the Stump',
    read: 'Isaiah 11:1-9',
    summary: 'From the family tree of Jesse, cut down and hopeless, new life will grow.',
    question: 'Has something in your life ever looked finished, and then God grew something new from it?',
  },
  {
    day: 4,
    title: 'Immanuel',
    read: 'Isaiah 7:10-14',
    summary: 'The sign of all signs: a virgin will have a son named Immanuel, "God with us."',
    question: 'What changes when you remember God is WITH you, not just watching you?',
  },
  {
    day: 5,
    title: 'Little Bethlehem',
    read: 'Micah 5:2-5',
    summary: 'The tiniest town in Judah is picked as the birthplace of the eternal King.',
    question: 'Why does God so often choose small places and small people for big things?',
  },
  {
    day: 6,
    title: 'The Messenger Promise',
    read: 'Malachi 3:1',
    summary: 'The Old Testament closes with a promise: a messenger will prepare the way. Then, 400 years of silence.',
    question: 'What is the hardest part of waiting for something good?',
  },
  {
    day: 7,
    title: 'An Angel in the Temple',
    read: 'Luke 1:5-25',
    summary: 'The silence breaks: Gabriel tells old Zechariah his son will get the world ready for the Lord.',
    question: 'Zechariah doubted and Gabriel made him wait in silence. What would YOU have said to an angel?',
  },
  {
    day: 8,
    title: 'Gabriel Visits Mary',
    read: 'Luke 1:26-38',
    summary: 'A teenager in Nazareth hears the impossible, and answers, "Let it be to me as you have said."',
    question: 'What makes Mary’s yes so brave?',
  },
  {
    day: 9,
    title: 'Mary Runs to Elizabeth',
    read: 'Luke 1:39-56',
    summary: 'Baby John leaps in Elizabeth’s womb, and Mary sings the happiest song in the Bible.',
    question: 'What would your family’s thank-you song to God say?',
  },
  {
    day: 10,
    title: 'Joseph’s Dream',
    read: 'Matthew 1:18-25',
    summary: 'An angel tells Joseph the baby’s name, Jesus, "because He will save His people from their sins."',
    question: 'Joseph obeyed as soon as he woke up. Why is quick obedience so hard?',
  },
  {
    day: 11,
    title: 'John Is Born',
    read: 'Luke 1:57-66, 76-79',
    summary: 'Zechariah’s voice comes back, and his first words bless the God who keeps promises.',
    question: 'If you lost your voice for nine months, what would your first sentence be?',
  },
  {
    day: 12,
    title: 'The Journey to Bethlehem',
    read: 'Luke 2:1-5',
    summary: 'A census moves Mary and Joseph ninety miles, landing them exactly where Micah said the King would be born.',
    question: 'The emperor thought the census was HIS idea. How does God work through things that seem ordinary?',
  },
  {
    day: 13,
    title: 'No Room',
    read: 'Luke 2:6-7',
    summary: 'The King of the universe is born in a stable and laid in a feeding trough.',
    question: 'Why do you think God chose a manger instead of a palace?',
  },
  {
    day: 14,
    title: 'Shepherds in the Fields',
    read: 'Luke 2:8-14',
    summary: 'The birth announcement goes not to kings but to night-shift shepherds, with an army of angels.',
    question: 'Why did God tell the shepherds first?',
  },
  {
    day: 15,
    title: 'The Shepherds Run',
    read: 'Luke 2:15-20',
    summary: 'They run to the manger, then tell everyone, and Mary treasures every word in her heart.',
    question: 'The shepherds couldn’t keep the news in. When did you last share good news about God?',
  },
  {
    day: 16,
    title: 'The Name of Jesus',
    read: 'Luke 2:21; Matthew 1:21',
    summary: 'Eight days old, the baby officially receives the name the angel gave: Jesus, "God saves."',
    question: 'Your name was chosen for you too. What do you want your name to remind people of?',
  },
  {
    day: 17,
    title: 'Simeon’s Song',
    read: 'Luke 2:22-35',
    summary: 'An old man who was promised he’d see the Messiah holds the baby and says he can die in peace.',
    question: 'Simeon waited his whole life for one promise. What promise of God are you holding onto?',
  },
  {
    day: 18,
    title: 'Anna the Prophetess',
    read: 'Luke 2:36-40',
    summary: 'Eighty-four-year-old Anna sees the baby and tells everyone waiting for rescue that He has come.',
    question: 'Anna had prayed in the temple for decades. What does her story say about praying a long time?',
  },
  {
    day: 19,
    title: 'The Star in the East',
    read: 'Matthew 2:1-2',
    summary: 'Scholars from a faraway land follow a star, asking: where is the one born King?',
    question: 'The wise men studied the sky and found God. Where do you see clues about God in the world?',
  },
  {
    day: 20,
    title: 'Herod and the Scholars',
    read: 'Matthew 2:3-8',
    summary: 'The scribes know the prophecy says Bethlehem, but only the foreigners actually go.',
    question: 'The scribes knew the answer and stayed home. What’s the difference between knowing and going?',
  },
  {
    day: 21,
    title: 'Gifts for a King',
    read: 'Matthew 2:9-12',
    summary: 'The wise men fall down before a toddler and open treasures: gold, frankincense, and myrrh.',
    question: 'What gift could you give Jesus this Christmas that money can’t buy?',
  },
  {
    day: 22,
    title: 'Escape to Egypt',
    read: 'Matthew 2:13-15',
    summary: 'Warned in a dream, Joseph carries the child to safety by night, God’s Son, a refugee.',
    question: 'How does it change Christmas to know Jesus’ family had to flee for their lives?',
  },
  {
    day: 23,
    title: 'The Word Became Flesh',
    read: 'John 1:1-14',
    summary: 'John tells the same story from heaven’s side: the Word who made everything moved into our neighborhood.',
    question: 'What’s the most amazing part, that God made the world, or that He joined it?',
  },
  {
    day: 24,
    title: 'Christmas Eve: The Whole Story',
    read: 'Luke 2:1-20',
    summary: 'Tonight, read the whole story aloud by candlelight or tree light, slowly, like it’s the first time.',
    question: 'Everyone answers: what’s one thing in the story you never noticed before?',
  },
  {
    day: 25,
    title: 'Christmas: God With Us',
    read: 'Matthew 1:22-23; John 3:16-17',
    summary: 'Immanuel has come. God so loved the world that He gave, and that is what every gift today echoes.',
    question: 'Merry Christmas! How will your family carry "God with us" into the new year?',
  },
];

const EMERALD = '#16a34a';

export default function AdventReadingsPrintable() {
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
          Advent Bible Readings for Kids
        </h1>
        <p style={{ fontSize: '0.95rem', color: '#374151', margin: 0 }}>
          25 days from the first promise to the manger, one short reading a night, December 1 to 25.
        </p>
      </header>

      {/* 25-day grid */}
      <section className="fk-grid">
        {DAYS.map((d) => (
          <article key={d.day} className="fk-card">
            <span className="fk-checkbox" aria-hidden="true" />
            <div style={{ fontSize: '0.72rem', lineHeight: 1.35 }}>
              <div style={{ fontWeight: 700, fontSize: '0.78rem', color: '#111827' }}>
                Dec {d.day}: <span style={{ color: EMERALD }}>{d.title}</span>
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

      {/* Also serves "bible verses for advent calendar" intent — say so in
          the page's own words, on screen and in print. */}
      <section style={{ marginTop: '1.4rem', fontSize: '0.9rem', color: '#374151', lineHeight: 1.6 }}>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#111827', margin: '0 0 0.4rem' }}>
          Using these as Advent calendar verses
        </h2>
        <p style={{ margin: 0 }}>
          Each day&rsquo;s reading doubles as a Bible verse for a homemade Advent calendar: copy the
          reference onto a slip of paper for each pocket or door, and let your child look the verse up
          when the day arrives. The readings are in story order, so the calendar tells the whole road
          to Bethlehem by Christmas morning.
        </p>
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
        <strong style={{ color: EMERALD }}>faithfulkids.app</strong> free 7-day trial.
      </footer>
    </main>
      <PrintableCta
        {...(printableVideos as Record<string, { videoSrc: string; posterSrc: string; videoTitle: string; duration: string | null }>).christmas}
        duration={(printableVideos as Record<string, { duration: string | null }>).christmas.duration ?? undefined}
        heading="Watch the Christmas story come alive"
        body="Born in a Manger is one of 300+ short video lessons your child will love, the whole Bible in order, each episode ending in a quiz. Advent is the perfect month to start."
        source="advent-readings"
      />

    <SiteFooter />
    </>
  );
}
