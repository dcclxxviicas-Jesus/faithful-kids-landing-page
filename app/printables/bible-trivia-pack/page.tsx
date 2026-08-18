import PrintButton from '../PrintButton';
import { SiteNav, SiteFooter } from '../../components/SiteChrome';

export const metadata = {
  title: 'Printable Bible Trivia Pack — 100 Questions | Faithful Kids',
  description:
    '100 free printable Bible trivia questions for kids in three difficulty levels, each answer with its Scripture reference. Print-ready for family game night or Sunday school.',
  alternates: { canonical: 'https://faithfulkids.app/printables/bible-trivia-pack' },
};

type Trivia = { q: string; a: string; ref: string };

const easy: Trivia[] = [
  { q: 'What is the very first sentence in the Bible?', a: '"In the beginning God created the heavens and the earth"', ref: 'Genesis 1:1' },
  { q: 'How many days did God take to create the world?', a: 'Six days — and he rested on the seventh', ref: 'Genesis 1:31–2:2' },
  { q: 'Who were the first man and woman?', a: 'Adam and Eve', ref: 'Genesis 2:7, 3:20' },
  { q: 'What was the name of the garden where Adam and Eve lived?', a: 'The Garden of Eden', ref: 'Genesis 2:8' },
  { q: 'Who built a giant ark to save his family and the animals?', a: 'Noah', ref: 'Genesis 6:13-14' },
  { q: 'What sign did God put in the sky as a promise never to flood the whole earth again?', a: 'A rainbow', ref: 'Genesis 9:13' },
  { q: 'What baby was hidden in a basket on the Nile River?', a: 'Moses', ref: 'Exodus 2:3' },
  { q: 'What sea did God part so the Israelites could walk through on dry ground?', a: 'The Red Sea', ref: 'Exodus 14:21-22' },
  { q: 'How many commandments did God give Moses?', a: 'Ten', ref: 'Exodus 20:1-17' },
  { q: 'What food did God send from heaven to feed the Israelites in the desert?', a: 'Manna', ref: 'Exodus 16:14-15' },
  { q: 'Which city’s walls came tumbling down when Israel marched around them and shouted?', a: 'Jericho', ref: 'Joshua 6:20' },
  { q: 'Finish Joshua’s famous words: "As for me and my household..."', a: '"We will serve the LORD"', ref: 'Joshua 24:15' },
  { q: 'Who was the strongest man in the Bible, whose strength was connected to his long hair?', a: 'Samson', ref: 'Judges 16:17' },
  { q: 'How many soldiers did God let Gideon keep to fight the huge Midianite army?', a: 'Three hundred', ref: 'Judges 7:7' },
  { q: 'Who was the mother-in-law that Ruth refused to leave?', a: 'Naomi', ref: 'Ruth 1:14-16' },
  { q: 'What did David use to defeat the giant Goliath?', a: 'A sling and a stone', ref: '1 Samuel 17:49-50' },
  { q: 'Who was Israel’s very first king?', a: 'Saul', ref: '1 Samuel 10:24' },
  { q: 'Who was David’s best friend, the king’s own son?', a: 'Jonathan', ref: '1 Samuel 18:1-3' },
  { q: 'Which king asked God for wisdom instead of money or long life?', a: 'Solomon', ref: '1 Kings 3:9-12' },
  { q: 'Which prophet was fed by ravens during a long drought?', a: 'Elijah', ref: '1 Kings 17:4-6' },
  { q: 'What did the army commander Naaman have to do to be healed of leprosy?', a: 'Wash himself seven times in the Jordan River', ref: '2 Kings 5:10, 14' },
  { q: 'What did Esther become in the land of Persia?', a: 'The queen', ref: 'Esther 2:17' },
  { q: 'Finish the most famous verse in Psalms: "The LORD is my ___."', a: 'Shepherd', ref: 'Psalm 23:1' },
  { q: 'Which tiny insect does Proverbs tell lazy people to watch and learn from?', a: 'The ant — "Go to the ant, you sluggard"', ref: 'Proverbs 6:6' },
  { q: 'Those who hope in the LORD will soar on wings like what bird?', a: 'Eagles', ref: 'Isaiah 40:31' },
  { q: 'Who was thrown into a den of lions for praying to God?', a: 'Daniel', ref: 'Daniel 6:16' },
  { q: 'Where were Shadrach, Meshach, and Abednego thrown for refusing to bow to the gold statue?', a: 'Into a blazing furnace', ref: 'Daniel 3:20-21' },
  { q: 'What swallowed Jonah when he ran away from God?', a: 'A huge fish that God provided', ref: 'Jonah 1:17' },
  { q: 'In what town was Jesus born?', a: 'Bethlehem', ref: 'Matthew 2:1' },
  { q: 'What did the wise men follow to find young Jesus?', a: 'A star', ref: 'Matthew 2:2, 9' },
  { q: 'What three gifts did the wise men bring?', a: 'Gold, frankincense, and myrrh', ref: 'Matthew 2:11' },
  { q: 'Where did Mary lay baby Jesus after he was born?', a: 'In a manger', ref: 'Luke 2:7' },
  { q: 'Who did the angels first tell the good news of Jesus’ birth?', a: 'Shepherds watching their flocks at night', ref: 'Luke 2:8-11' },
  { q: 'Who baptized Jesus in the Jordan River?', a: 'John the Baptist', ref: 'Matthew 3:13' },
  { q: 'How many disciples did Jesus choose?', a: 'Twelve', ref: 'Matthew 10:1-2' },
  { q: 'How many loaves and fish did Jesus use to feed more than 5,000 people?', a: 'Five loaves and two fish', ref: 'Matthew 14:17-21' },
  { q: 'What did Jesus turn water into at a wedding — his very first miracle?', a: 'Wine', ref: 'John 2:9-11' },
  { q: 'What short tax collector climbed a sycamore-fig tree to see Jesus?', a: 'Zacchaeus', ref: 'Luke 19:2-4' },
  { q: 'Finish the most famous verse in the Bible: "For God so loved the world that he gave his one and only ___"', a: 'Son', ref: 'John 3:16' },
  { q: 'What happened on the third day after Jesus died on the cross?', a: 'He rose from the dead', ref: 'Matthew 28:5-6' },
];

const medium: Trivia[] = [
  { q: 'What fruit did Adam and Eve eat in the Garden of Eden?', a: 'Trick question — the Bible only says "fruit," never an apple', ref: 'Genesis 3:6' },
  { q: 'Who were Adam and Eve’s first two sons?', a: 'Cain and Abel', ref: 'Genesis 4:1-2' },
  { q: 'Whose wife turned into a pillar of salt when she looked back at Sodom?', a: 'Lot’s wife', ref: 'Genesis 19:26' },
  { q: 'What did Esau trade his birthright for?', a: 'A meal of bread and lentil stew', ref: 'Genesis 25:33-34' },
  { q: 'What new name did God give Jacob after he wrestled with God?', a: 'Israel', ref: 'Genesis 32:28' },
  { q: 'What was the first of the ten plagues on Egypt?', a: 'The Nile turned to blood', ref: 'Exodus 7:20' },
  { q: 'What did the Israelites put on their doorframes so the final plague would pass over their homes?', a: 'The blood of a lamb', ref: 'Exodus 12:7, 13' },
  { q: 'Where exactly did Rahab hide the two Israelite spies?', a: 'On her roof, under stalks of flax', ref: 'Joshua 2:6' },
  { q: 'What amazing thing happened in the sky during the battle at Gibeon?', a: 'The sun stood still and the moon stopped until Israel won', ref: 'Joshua 10:12-13' },
  { q: 'Which woman defeated the mighty general Sisera with a tent peg and a hammer?', a: 'Jael', ref: 'Judges 4:21' },
  { q: 'What two-part test did Gideon ask God for using a piece of wool?', a: 'The fleece test — wet fleece on dry ground, then dry fleece on wet ground', ref: 'Judges 6:36-40' },
  { q: 'Who was Ruth’s sister-in-law who kissed Naomi goodbye and went back to Moab?', a: 'Orpah', ref: 'Ruth 1:14' },
  { q: 'What did the priest Eli wrongly think Hannah was doing as she prayed for a son?', a: 'He thought she was drunk, because her lips moved but no sound came out', ref: '1 Samuel 1:13-14' },
  { q: 'Where was Saul found when it was time to announce him as king?', a: 'Hiding among the supplies (the baggage)', ref: '1 Samuel 10:22' },
  { q: 'What city was the giant Goliath from?', a: 'Gath', ref: '1 Samuel 17:4' },
  { q: 'When two women both claimed the same baby, what did Solomon order — and how did it reveal the real mother?', a: '"Cut the living child in two" — the real mother begged him to give the baby to the other woman instead', ref: '1 Kings 3:24-27' },
  { q: 'Who was the wicked foreign queen who married King Ahab and pushed Baal worship in Israel?', a: 'Jezebel', ref: '1 Kings 16:31' },
  { q: 'What did Elisha ask Elijah for before Elijah was taken up to heaven?', a: 'A double portion of Elijah’s spirit', ref: '2 Kings 2:9' },
  { q: 'Which queen lost her crown for refusing to appear at King Xerxes’ banquet?', a: 'Queen Vashti', ref: 'Esther 1:10-12, 19' },
  { q: 'Finish Mordecai’s famous challenge: "Who knows but that you have come to your royal position for such a..."', a: '"...time as this?"', ref: 'Esther 4:14' },
  { q: 'How many verses are in Psalm 119, the longest chapter in the whole Bible?', a: '176', ref: 'Psalm 119' },
  { q: 'By which rivers did the exiles sit and weep when they remembered Zion?', a: 'The rivers of Babylon', ref: 'Psalm 137:1' },
  { q: 'The wife of noble character in Proverbs 31 is worth far more than what?', a: 'Rubies', ref: 'Proverbs 31:10' },
  { q: 'What six-winged heavenly creatures did Isaiah see around God’s throne — found nowhere else in the Bible?', a: 'Seraphim', ref: 'Isaiah 6:2' },
  { q: 'In King Nebuchadnezzar’s dream of a giant statue, what was the head made of?', a: 'Gold', ref: 'Daniel 2:32, 38' },
  { q: 'What words did the mysterious hand write on the palace wall during Belshazzar’s feast?', a: 'Mene, Mene, Tekel, Parsin', ref: 'Daniel 5:25' },
  { q: 'Was Jonah swallowed by a whale?', a: 'Trick question — the Bible says "a huge fish," and never calls it a whale', ref: 'Jonah 1:17' },
  { q: 'What does the name Immanuel mean?', a: '"God with us"', ref: 'Matthew 1:23' },
  { q: 'What is the Golden Rule?', a: '"Do to others what you would have them do to you"', ref: 'Matthew 7:12' },
  { q: 'Peter asked if he should forgive someone seven times. What did Jesus say?', a: 'Not seven times, but seventy-seven times', ref: 'Matthew 18:21-22' },
  { q: 'What job did the prodigal son end up doing in the far country when his money ran out?', a: 'Feeding pigs', ref: 'Luke 15:15' },
  { q: 'How did four friends get their paralyzed friend to Jesus in a packed house?', a: 'They dug through the roof and lowered him down on his mat', ref: 'Mark 2:4' },
  { q: 'What did the poor widow put in the temple offering, and what did Jesus say about it?', a: 'Two very small copper coins — Jesus said she gave more than all the others, because she gave everything she had', ref: 'Mark 12:42-44' },
  { q: 'What did Jesus tell Nicodemus a person must be to see the kingdom of God?', a: 'Born again', ref: 'John 3:3' },
  { q: 'In which city were believers first called Christians?', a: 'Antioch', ref: 'Acts 11:26' },
];

const hard: Trivia[] = [
  { q: 'Who is the oldest person recorded in the Bible, and how long did he live?', a: 'Methuselah — 969 years', ref: 'Genesis 5:27' },
  { q: 'How many of every clean animal did Noah take aboard the ark?', a: 'Seven pairs — not just two', ref: 'Genesis 7:2' },
  { q: 'What mysterious priest-king brought out bread and wine and blessed Abram?', a: 'Melchizedek, king of Salem', ref: 'Genesis 14:18' },
  { q: 'Which two Hebrew midwives bravely disobeyed Pharaoh’s order to kill baby boys?', a: 'Shiphrah and Puah', ref: 'Exodus 1:15-17' },
  { q: 'What was Joshua’s original name before Moses renamed him?', a: 'Hoshea', ref: 'Numbers 13:16' },
  { q: 'What password did the men of Gilead use at the Jordan River because the Ephraimites couldn’t pronounce it?', a: '"Shibboleth" — the Ephraimites could only say "Sibboleth"', ref: 'Judges 12:5-6' },
  { q: 'What did Samuel name the memorial stone after God routed the Philistines, and what does it mean?', a: 'Ebenezer — "Thus far the LORD has helped us"', ref: '1 Samuel 7:12' },
  { q: 'How many people in Israel did God say had never bowed to Baal, when Elijah thought he was the only one left?', a: 'Seven thousand', ref: '1 Kings 19:18' },
  { q: 'How many Assyrian soldiers did the angel of the LORD strike down in one night?', a: 'A hundred and eighty-five thousand', ref: '2 Kings 19:35' },
  { q: 'What is famously missing from the entire book of Esther?', a: 'Any mention of God’s name — yet his providence drives every "coincidence" in the story', ref: 'Esther' },
  { q: 'What mysterious Hebrew word appears 71 times in Psalms and probably signals a musical pause?', a: 'Selah', ref: 'e.g. Psalm 3:2' },
  { q: 'Which psalm did Jesus quote from the cross — "My God, my God, why have you forsaken me?"', a: 'Psalm 22', ref: 'Psalm 22:1; Matthew 27:46' },
  { q: 'A long stretch of Daniel isn’t written in Hebrew. What language is Daniel 2:4–7:28 written in?', a: 'Aramaic', ref: 'Daniel 2:4' },
  { q: 'What was the name of Jonah’s father?', a: 'Amittai', ref: 'Jonah 1:1' },
  { q: 'How many wise men does the Bible say visited Jesus?', a: 'Trick question — Matthew never gives a number; we assume three because of the three gifts', ref: 'Matthew 2:1, 11' },
  { q: 'Who appeared with Jesus at the transfiguration?', a: 'Moses and Elijah', ref: 'Matthew 17:3' },
  { q: 'Where did Jesus tell Peter to find a coin to pay the temple tax?', a: 'In the mouth of the first fish he caught', ref: 'Matthew 17:27' },
  { q: 'What word does Mark use more than 40 times to keep his fast-paced Gospel racing along?', a: '"Immediately"', ref: 'Gospel of Mark' },
  { q: 'What was the name of the servant whose ear Peter cut off — a detail only John records?', a: 'Malchus', ref: 'John 18:10' },
  { q: 'In what three languages was the sign over the cross written?', a: 'Aramaic, Latin, and Greek', ref: 'John 19:20' },
  { q: 'Exactly how many fish were in the net when the risen Jesus met the disciples at the shore?', a: '153', ref: 'John 21:11' },
  { q: 'Trick question: when did God change Saul’s name to Paul?', a: 'He didn’t — the Bible simply says Saul "was also called Paul." He had both names all along', ref: 'Acts 13:9' },
  { q: 'Who fell asleep and dropped from a third-story window during Paul’s long sermon — and what happened?', a: 'Eutychus — Paul raised him alive', ref: 'Acts 20:9-10' },
  { q: 'Paul spoke the letter to the Romans aloud — who actually wrote it down, and even adds his own hello?', a: 'Tertius', ref: 'Romans 16:22' },
  { q: 'Why is there no temple in the new Jerusalem?', a: 'Because the Lord God Almighty and the Lamb are its temple', ref: 'Revelation 21:22' },
];

const sections = [
  { name: 'Easy', ages: 'Ages 5–8', questions: easy, start: 1 },
  { name: 'Medium', ages: 'Ages 9–12', questions: medium, start: easy.length + 1 },
  { name: 'Hard', ages: 'Teens & Adults', questions: hard, start: easy.length + medium.length + 1 },
];

const allQuestions: Trivia[] = [...easy, ...medium, ...hard];

const EMERALD = '#059669';

export default function BibleTriviaPackPage() {
  return (
    <>
    <SiteNav active="printables" />
    <main
      style={{
        maxWidth: '52rem',
        margin: '0 auto',
        padding: '1.5rem 1.25rem 3rem',
        color: '#111827',
        backgroundColor: '#ffffff',
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        lineHeight: 1.45,
      }}
    >
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: #ffffff; }
          @page { margin: 14mm; }
        }
        .trivia-q { break-inside: avoid; page-break-inside: avoid; }
        .answer-key { break-before: page; page-break-before: always; }
        .answer-key-cols {
          column-count: 2;
          column-gap: 1.5rem;
        }
        @media (min-width: 640px) {
          .answer-key-cols { column-count: 3; }
        }
        @media print {
          .answer-key-cols { column-count: 3; }
        }
      `}</style>

      {/* Print button */}
      <div className="no-print" style={{ textAlign: 'right', marginBottom: '0.75rem' }}>
        <PrintButton />
      </div>

      {/* Branded header */}
      <header
        style={{
          borderBottom: `3px solid ${EMERALD}`,
          paddingBottom: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-sm.png" alt="Faithful Kids logo" width={36} height={36} style={{ display: 'block' }} />
          <span style={{ fontSize: '1.05rem', fontWeight: 700, color: EMERALD }}>Faithful Kids</span>
        </div>
        <h1 style={{ fontSize: '1.9rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
          The Family Bible Trivia Pack
        </h1>
        <p style={{ margin: '0.4rem 0 0', color: '#4b5563', fontSize: '1rem' }}>
          100 questions for game night, car rides, and Sunday school — answers in the back.
        </p>
      </header>

      {/* Question sections */}
      {sections.map((section) => (
        <section key={section.name} style={{ marginBottom: '1.75rem' }}>
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              color: EMERALD,
              margin: '0 0 0.25rem',
              borderBottom: '1px solid #d1d5db',
              paddingBottom: '0.25rem',
            }}
          >
            {section.name}{' '}
            <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#6b7280' }}>({section.ages})</span>
          </h2>
          <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {section.questions.map((item, i) => (
              <li
                key={section.start + i}
                className="trivia-q"
                style={{
                  padding: '0.3rem 0',
                  borderBottom: '1px dotted #e5e7eb',
                  fontSize: '0.95rem',
                }}
              >
                <span style={{ fontWeight: 700, color: EMERALD, marginRight: '0.4rem' }}>
                  {section.start + i}.
                </span>
                {item.q}
              </li>
            ))}
          </ol>
        </section>
      ))}

      {/* Answer key */}
      <section className="answer-key">
        <h2
          style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            color: EMERALD,
            margin: '0 0 0.75rem',
            borderBottom: `3px solid ${EMERALD}`,
            paddingBottom: '0.35rem',
          }}
        >
          Answer Key
        </h2>
        <div className="answer-key-cols">
          {allQuestions.map((item, i) => (
            <p
              key={i}
              className="trivia-q"
              style={{ margin: '0 0 0.45rem', fontSize: '0.78rem', color: '#1f2937' }}
            >
              <strong style={{ color: EMERALD }}>{i + 1}.</strong> {item.a}{' '}
              <span style={{ color: '#6b7280' }}>({item.ref})</span>
            </p>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          marginTop: '2rem',
          paddingTop: '0.75rem',
          borderTop: `2px solid ${EMERALD}`,
          fontSize: '0.85rem',
          color: '#374151',
        }}
      >
        Want trivia with videos, levels, and streaks? Visit{' '}
        <strong style={{ color: EMERALD }}>faithfulkids.app</strong> — free 3-day trial.
      </footer>
    </main>
    <SiteFooter />
    </>
  );
}
