import PrintButton from '../PrintButton';
import { SiteNav, SiteFooter } from '../../components/SiteChrome';

export const metadata = {
  title: 'The Bedtime Bible Kit — 7 Nights, Free Printable | Faithful Kids',
  description:
    'A free printable week of calm Bible bedtimes: seven nights of short stories, memory verses, and simple prayers for the last ten minutes before lights out.',
  alternates: { canonical: 'https://faithfulkids.app/printables/bedtime-bible-kit' },
};

type Night = {
  night: number;
  emoji: string;
  title: string;
  story: string;
  scripture: string;
  whisper: string;
  prayer: string[];
};

const NIGHTS: Night[] = [
  {
    night: 1,
    emoji: '🌙',
    title: 'God Made the Light and the Quiet Dark',
    story:
      'A long, long time ago, before there were stars or oceans or sleepy children, there was only God. And God began to make everything. He said, "Let there be light" — and warm, golden light appeared. God smiled and called the light "day." Then He made the soft, quiet dark, and He called it "night." The dark was not scary. It was God\'s idea — a gentle blanket for the world to rest under. Night after night, God kept making wonderful things: the sky, the sea, tall trees, twinkly stars, splashing fish, singing birds, and every kind of animal. Last of all, He made people, because He wanted a family to love. God looked at everything He had made and said, "It is very good." And that includes you. God made the day for playing, and the night for resting — and He watches over both.',
    scripture: 'Genesis 1:1-31',
    whisper: 'What is your favorite thing God made — and did you know He made the nighttime, too?',
    prayer: [
      'Dear God, thank You for the light and for the quiet dark.',
      'Thank You for making me and calling me very good.',
      'Tuck the whole world in tonight,',
      'and tuck me in, too. Amen.',
    ],
  },
  {
    night: 2,
    emoji: '🌈',
    title: "Noah's Rainbow Promise",
    story:
      'Noah loved God, and God gave him a very big job: build a boat — a huge one, called an ark. Noah hammered and sawed until it was ready. Then the animals came, two by two — elephants and bunnies, lions and ladybugs — and Noah\'s family climbed in with them. God shut the door, safe and snug. Then the rain came down, pitter-patter, for forty days. But inside the ark, everyone was warm and dry, because God was taking care of them the whole time. At last the rain stopped, the water dried up, and Noah\'s family stepped out onto fresh green grass. Then God painted something brand new across the sky — a rainbow, glowing with color. "This is My promise," God said. "I will always remember you." Every rainbow you ever see is God whispering, "I keep My promises." And He always, always does.',
    scripture: 'Genesis 9:12-17',
    whisper: 'When you see a rainbow, what do you think God wants you to remember?',
    prayer: [
      'Dear God, thank You for keeping Noah safe in the ark.',
      'Thank You for the rainbow that says You keep Your promises.',
      'Keep me safe and snug tonight,',
      'just like the animals in the ark. Amen.',
    ],
  },
  {
    night: 3,
    emoji: '⭐',
    title: 'God Speaks to Samuel in the Night',
    story:
      'Samuel was a boy who lived in God\'s house, helping a kind old priest named Eli. One night, Samuel was lying in his bed when he heard a voice call his name: "Samuel!" He hopped up and ran to Eli. "Here I am! You called me!" But Eli said, "I didn\'t call you, child. Go back and lie down." It happened again. And again! The third time, wise old Eli understood. "Samuel," he said gently, "it is God calling you. Next time, say: Speak, Lord, for Your servant is listening." So Samuel snuggled back into bed. The voice came once more, soft and kind: "Samuel! Samuel!" And Samuel answered, "Speak, Lord. I\'m listening." God was so happy to talk with him. God knows your name, too. Even while you sleep, He is near, and His voice is always gentle.',
    scripture: '1 Samuel 3:1-10',
    whisper: 'If God whispered your name tonight, what would you say back to Him?',
    prayer: [
      'Dear God, thank You for knowing my name.',
      'Help me listen for You like Samuel did.',
      'Speak, Lord — I\'m listening,',
      'even as I fall asleep. Amen.',
    ],
  },
  {
    night: 4,
    emoji: '🌟',
    title: 'David the Shepherd Boy',
    story:
      'Before David was ever a king, he was a shepherd boy on the quiet green hills. All day he watched over his sheep — leading them to soft grass for munching and still, calm water for drinking. At night, David would look up at the sparkly stars and sing songs to God with his harp. He knew that just like he took care of his sheep, God was taking care of him. So he sang: "The Lord is my shepherd. I have everything I need. He lets me rest in green meadows. He leads me beside peaceful streams." Even when the hills got dark, David wasn\'t afraid — because his Shepherd never fell asleep and never wandered off. God was watching over him all night long. And the very same Shepherd who watched over David is watching over you tonight, all through the dark until morning.',
    scripture: 'Psalm 23:1-4',
    whisper: 'What do you think it feels like to be one of God\'s little lambs?',
    prayer: [
      'Dear God, You are my Shepherd, and I am Your lamb.',
      'Thank You for green meadows and peaceful streams.',
      'Watch over me all night long,',
      'and lead me into a happy tomorrow. Amen.',
    ],
  },
  {
    night: 5,
    emoji: '🌊',
    title: 'Jesus Calms the Storm',
    story:
      'One evening, Jesus and His friends climbed into a boat to sail across the lake. Jesus was so tired from helping people all day that He lay down on a soft cushion in the back of the boat and fell fast asleep. While He slept, the wind began to blow. The waves got bigger and bigger — splish, splash, SPLASH! Water sloshed into the boat, and His friends got scared. They shook Jesus awake. "Teacher! Help us!" Jesus stood up, calm as can be. He looked at the wild waves and the roaring wind and said, "Peace. Be still." And right away — everything went quiet. The waves lay down flat like a smooth blanket. The wind hushed. His friends whispered in wonder, "Even the wind and waves obey Him!" When things feel stormy, Jesus is right there with you, and His voice can make everything peaceful again.',
    scripture: 'Mark 4:35-41',
    whisper: 'What makes you feel worried sometimes — and can we let Jesus say "Peace, be still" to it right now?',
    prayer: [
      'Dear Jesus, You told the storm to be still, and it listened.',
      'When I feel scared, remind me You are in my boat.',
      'Say "peace" over my heart tonight,',
      'and give me calm, happy dreams. Amen.',
    ],
  },
  {
    night: 6,
    emoji: '🌛',
    title: 'Jesus Blesses the Children',
    story:
      'One day, mommies and daddies brought their children to see Jesus. They wanted Him to bless them — babies, toddlers, big kids, all of them. But Jesus\' helpers frowned and said, "Shoo! Jesus is much too busy for children." When Jesus heard that, He was not happy with His helpers at all. "Let the little children come to Me," He said. "Do not stop them! God\'s kingdom belongs to children just like these." So the children came running — and Jesus didn\'t just wave hello. He scooped them up into His arms, one by one. He put His hands on their heads and blessed them. Imagine how warm and safe they felt, snuggled close to Jesus! He was never too busy for children, and He is never too busy for you. Right now, tonight, Jesus is glad you came close to Him.',
    scripture: 'Mark 10:13-16',
    whisper: 'How do you think it felt to get a hug from Jesus?',
    prayer: [
      'Dear Jesus, thank You for loving children like me.',
      'Thank You that You are never too busy for me.',
      'Hold me close in Your arms tonight,',
      'like the children in the story. Amen.',
    ],
  },
  {
    night: 7,
    emoji: '💤',
    title: 'The Good Shepherd',
    story:
      'Jesus once told His friends who He really is. "I am the Good Shepherd," He said. A good shepherd knows every one of his sheep by name. When he calls, "Come along, little one!" they follow him, because they know his kind voice. He leads them to the yummiest grass and the safest resting places. If one little sheep wanders off, the good shepherd doesn\'t give up — he goes looking until he finds it, then carries it home on his shoulders, happy as can be. "My sheep know My voice," Jesus said, "and I know them. No one can ever snatch them out of My hand." That means you. Jesus knows your name. He knows your giggles and your tears and your sleepy yawns. You are His little lamb, held gently in His strong hands — tonight, tomorrow, and always.',
    scripture: 'John 10:11-15, 27-28',
    whisper: 'Jesus knows your name and your voice. What would you like to tell Him before you sleep?',
    prayer: [
      'Dear Jesus, You are my Good Shepherd.',
      'Thank You for knowing my name and never letting go of me.',
      'Carry me gently into sleep tonight,',
      'safe in Your strong hands. Amen.',
    ],
  },
];

const EMERALD = '#059669';

export default function BedtimeBibleKitPrintable() {
  return (
    <>
    <SiteNav active="printables" />
    <main
      style={{
        backgroundColor: '#ffffff',
        color: '#111827',
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        maxWidth: '44rem',
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
        .fk-card {
          break-inside: avoid;
          border: 1px solid #d1d5db;
          border-radius: 10px;
          padding: 1rem 1.15rem;
          margin-bottom: 1rem;
        }
        .fk-story {
          font-size: 0.95rem;
          line-height: 1.75;
          color: #1f2937;
          margin: 0.5rem 0;
        }
        .fk-label {
          font-weight: 700;
          color: ${EMERALD};
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
          The Bedtime Bible Kit
        </h1>
        <p style={{ fontSize: '0.95rem', color: '#374151', margin: 0, lineHeight: 1.5 }}>
          Seven nights of five-minute Bible stories — a story, a prayer, and one question to
          whisper about.
        </p>
      </header>

      {/* 7 nights */}
      <section>
        {NIGHTS.map((n) => (
          <article key={n.night} className="fk-card">
            <h2
              style={{
                fontSize: '1.15rem',
                fontWeight: 800,
                color: '#111827',
                margin: '0 0 0.35rem 0',
                lineHeight: 1.3,
              }}
            >
              <span aria-hidden="true" style={{ marginRight: '0.4rem' }}>
                {n.emoji}
              </span>
              Night {n.night} — <span style={{ color: EMERALD }}>{n.title}</span>
            </h2>
            <p className="fk-story">{n.story}</p>
            <p style={{ margin: '0.5rem 0', fontSize: '0.9rem' }}>
              <strong>{n.scripture}</strong>
            </p>
            <p style={{ margin: '0.5rem 0', fontSize: '0.92rem', lineHeight: 1.6 }}>
              <span className="fk-label">Whisper about it:</span>{' '}
              <span style={{ fontStyle: 'italic', color: '#374151' }}>{n.whisper}</span>
            </p>
            <div style={{ margin: '0.5rem 0 0 0', fontSize: '0.92rem', lineHeight: 1.7 }}>
              <span className="fk-label">Goodnight prayer:</span>
              <div style={{ fontStyle: 'italic', color: '#374151', marginTop: '0.2rem' }}>
                {n.prayer.map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* Night 8 and beyond */}
      <section
        className="fk-card"
        style={{
          border: `2px solid ${EMERALD}`,
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            fontSize: '1.05rem',
            fontWeight: 800,
            color: EMERALD,
            margin: '0 0 0.35rem 0',
          }}
        >
          Night 8 and beyond…
        </h2>
        <p style={{ margin: 0, fontSize: '0.92rem', lineHeight: 1.6, color: '#1f2937' }}>
          There are 200 more stories — each with a 60-second video narrated by Jesus and a quiz —
          at <strong style={{ color: EMERALD }}>faithfulkids.app</strong>. Free for 3 days.
        </p>
      </section>
    </main>
    <SiteFooter />
    </>
  );
}
