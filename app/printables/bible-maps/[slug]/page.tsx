import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SiteNav, SiteFooter } from '../../../components/SiteChrome'
import PrintButton from '../../PrintButton'
import PdfDownloadLink from '../../PdfDownloadLink'
import { PrintableCta } from '../../PrintableCta'
import printableVideos from '@/lib/printable-videos.json'
import { EmailCaptureCard } from '../../../blog/EmailCaptureCard'
import { MAPS, REGIONS, getMap } from '@/lib/bible-maps'
import { BibleMapSvg, MapLegend } from '../BibleMapSvg'
import '../maps.css'

/* Per-map SEO: exact-match phrase leads every title (artifact-SERP doctrine).
   Volumes are DataForSEO clickstream/ads, US, Nov 2, 2026 — all empty-AIO
   artifact SERPs held by 1990s map sites and stock photos. */
const META: Record<string, { title: string; desc: string }> = {
  'ancient-israel': {
    // "ancient israel map" 968/8,100 KD 0 · "old testament map" 458/1,300 KD 2
    title: 'Ancient Israel Map for Kids: Free Printable',
    desc: 'A free printable map of ancient Israel, Jerusalem, the two kingdoms, the Jordan, and 23 labeled places from the Old Testament. Real geography.',
  },
  'israel-in-jesus-time': {
    // "map of israel in jesus time" 815/3,600 KD 0 · "new testament map" 305/880
    title: "Map of Israel in Jesus' Time: Free Printable",
    desc: "A free printable map of Israel in Jesus' time, Galilee, Samaria, Judea, the Sea of Galilee, and the Gospel towns from Bethlehem to Capernaum.",
  },
  'the-exodus': {
    // "map of the exodus" 407/1,000 KD 9 · "where is mount sinai" 855/8,100 KD 10
    title: 'Map of the Exodus: Free Printable Route Map',
    desc: 'A free printable Exodus route map, Egypt, the Red Sea, Mount Sinai and the wilderness road to the Promised Land, traditional stops labeled.',
  },
  'pauls-missionary-journeys': {
    // "paul's missionary journeys" 654/1,900 KD 6
    title: "Paul's Missionary Journeys Map: Free Printable",
    desc: "A free printable map of Paul's missionary journeys, all three journeys plus the voyage to Rome from Acts, color-coded with 27 labeled cities.",
  },
  'twelve-tribes-of-israel': {
    // "12 tribes of israel map" 352/2,400 KD 10
    title: '12 Tribes of Israel Map: Free Printable',
    desc: 'A free printable map of the 12 tribes of Israel, every territory from Joshua 13–19 shown honestly as approximate areas, with the story behind the division.',
  },
  'the-promised-land': {
    // "map of canaan" 407/3,600 KD 4
    title: 'Map of Canaan: Free Printable for Kids',
    desc: 'A free printable map of the land of Canaan, the Promised Land as Joshua found it, with the walled cities and the seven nations the Bible names.',
  },
}

const FAQS: Record<string, { q: string; a: string }[]> = {
  'ancient-israel': [
    {
      q: 'How big was ancient Israel?',
      a: 'About 150 miles from Dan in the north to Beersheba in the south, and roughly 50 miles across, around the size of New Jersey or Wales. "From Dan to Beersheba" is how the Bible itself says "the whole land" (Judges 20:1). Almost every Old Testament story happens inside that small rectangle.',
    },
    {
      q: 'Why did Israel split into two kingdoms?',
      a: "After Solomon died, the ten northern tribes refused his son Rehoboam and followed Jeroboam instead (1 Kings 12). From then on the map shows two kingdoms: Israel in the north with its capital at Samaria, and Judah in the south with Jerusalem. Assyria destroyed the north in 722 BC; Babylon took the south in 586 BC.",
    },
    {
      q: 'What is the Salt Sea on the map?',
      a: "The Bible's name for the Dead Sea, the lowest place on the earth's surface, about 1,400 feet below sea level. The Jordan River flows in and nothing flows out, so the water concentrates salt until nothing can live in it.",
    },
  ],
  'israel-in-jesus-time': [
    {
      q: "What were the regions of Israel in Jesus' time?",
      a: 'Three main ones, west of the Jordan: Galilee in the north, where Jesus grew up and did most of his ministry; Judea in the south, with Jerusalem and Bethlehem; and Samaria between them. East of the Jordan lay Perea and the ten Greek cities of the Decapolis. The Gospels name these regions on nearly every page.',
    },
    {
      q: 'How far did Jesus travel?',
      a: 'Most of the ministry happened within about a day’s walk of Capernaum, on the north shore of the Sea of Galilee. The longest regular trip was Galilee to Jerusalem for the festivals, about 90 miles, four or five days on foot, usually down the Jordan valley through Jericho. He also went north to Tyre and Sidon and Caesarea Philippi (Mark 7, Matthew 16).',
    },
    {
      q: 'How big is the Sea of Galilee?',
      a: "It is really a freshwater lake, about 13 miles long and 8 miles wide, small enough to see across on a clear day, and set so low between hills that sudden storms funnel onto it, which is exactly what the fishermen in Mark 4 were afraid of.",
    },
  ],
  'the-exodus': [
    {
      q: 'Where is Mount Sinai?',
      a: "The traditional answer, held since at least the 300s AD, is Jebel Musa, “the mountain of Moses,” in the southern Sinai peninsula, where St. Catherine's Monastery still stands at the foot of the mountain. Some scholars argue for other peaks in the Sinai or in northwest Arabia. The Bible describes the mountain but never gives its position, which is why this map marks Sinai as a traditional site.",
    },
    {
      q: 'Where did the Israelites cross the Red Sea?',
      a: 'Nobody knows the exact spot. The traditional route crosses near the Gulf of Suez or the lakes just north of it, and that is what this map shows. The Hebrew name is yam suph, "sea of reeds," and scholars have proposed sites from the Bitter Lakes to the Gulf of Aqaba. The map marks the crossing as traditional rather than pretending the question is settled.',
    },
    {
      q: 'How long did the Exodus journey take?',
      a: 'The walking distance from Egypt to Canaan is about 250 miles, two weeks by the coast road. Israel took forty years. They reached Sinai in about three months (Exodus 19:1), spent nearly a year there, and then waited out the forty years at Kadesh-barnea after refusing to enter the land (Numbers 13–14). The route on the map is short; the story is about trust.',
    },
  ],
  'pauls-missionary-journeys': [
    {
      q: 'How many missionary journeys did Paul take?',
      a: 'Three, plus the voyage to Rome as a prisoner, four routes on this map. The first (Acts 13–14) reaches Cyprus and Galatia, the second (Acts 15–18) crosses into Europe at Philippi, the third (Acts 18–21) is anchored by three years in Ephesus, and the last voyage (Acts 27–28) ends in shipwreck on Malta and arrival in Rome.',
    },
    {
      q: 'How far did Paul travel?',
      a: 'Added together, roughly 10,000 miles, on foot and in small wooden sailing ships, over about fifteen years. For scale, that is four times across the United States, done at walking pace by a man who was also stoned, beaten, and shipwrecked along the way (2 Corinthians 11).',
    },
    {
      q: 'Which Bible books were written to cities on this map?',
      a: "Find Ephesus, Philippi, Thessalonica, Corinth and Rome and you are looking at the addresses of Ephesians, Philippians, 1–2 Thessalonians, 1–2 Corinthians and Romans. Galatians went to the region of the first journey, and Timothy received his letters while serving in Ephesus.",
    },
  ],
  'twelve-tribes-of-israel': [
    {
      q: 'Why does a 12 tribes map show 13 areas?',
      a: "Because Joseph's one share became two: his sons Ephraim and Manasseh each received land (Genesis 48), and Manasseh's is split again across both sides of the Jordan. Meanwhile Levi, the priests' tribe, received no territory at all, 48 towns scattered through the other tribes instead (Joshua 21). Twelve tribes, thirteen areas, and the arithmetic still comes out to twelve inheritances.",
    },
    {
      q: 'Which tribe was Jesus from?',
      a: 'Judah, the large southern territory on the map that contains both Bethlehem, where he was born, and Jerusalem. Genesis 49:10 had pointed at Judah centuries earlier, and Revelation 5:5 calls Jesus "the Lion of the tribe of Judah."',
    },
    {
      q: 'Are the tribal borders on this map exact?',
      a: 'No, and no honest map’s are. Joshua 13–19 defines each territory as a list of boundary towns, many of which can no longer be located. That is why this map shows soft tinted areas instead of hard border lines: the areas and neighbors are right, the exact lines are lost.',
    },
  ],
  'the-promised-land': [
    {
      q: 'What was the land of Canaan?',
      a: 'The land God promised Abraham in Genesis 12, roughly the territory between the Jordan River and the Mediterranean, from the Negev desert north toward Sidon. Israel finally entered it under Joshua, about half a millennium after the promise, which is why the Bible also calls it the Promised Land.',
    },
    {
      q: 'Who lived in Canaan before Israel?',
      a: 'Deuteronomy 7:1 lists seven nations, Hittites, Girgashites, Amorites, Canaanites, Perizzites, Hivites and Jebusites, "seven nations greater and mightier than you." They lived in walled city-states like Jericho, Hazor and Megiddo rather than one unified kingdom, and the Philistines held the southern coast.',
    },
    {
      q: 'Why was Jericho conquered first?',
      a: "Look at the map: Jericho sits right where Israel crossed the Jordan, guarding the roads up into the hill country. There was no way into the land that did not pass it, which is why the walls had to fall first (Joshua 6).",
    },
  ],
}

/* Story posts behind the places — every slug verified to exist on disk the
   day this shipped; check-links re-verifies on every build. */
const STORIES: Record<string, { slug: string; label: string }[]> = {
  'ancient-israel': [
    { slug: 'david-and-goliath-for-kids', label: 'David and Goliath' },
    { slug: 'god-calls-samuel-for-kids', label: 'God calls Samuel at Shiloh' },
    { slug: 'elijah-and-the-ravens-for-kids', label: 'Elijah and the ravens' },
  ],
  'israel-in-jesus-time': [
    { slug: 'born-in-a-manger-for-kids', label: 'Born in a manger, Bethlehem' },
    { slug: 'calming-the-storm-for-kids', label: 'Calming the storm, the Sea of Galilee' },
    { slug: 'the-woman-at-the-well-for-kids', label: 'The woman at the well, Samaria' },
  ],
  'the-exodus': [
    { slug: 'the-burning-bush-for-kids', label: 'The burning bush' },
    { slug: 'crossing-the-red-sea-for-kids', label: 'Crossing the Red Sea' },
    { slug: 'the-ten-commandments-for-kids', label: 'The Ten Commandments at Sinai' },
  ],
  'pauls-missionary-journeys': [
    { slug: 'paul-and-silas-in-prison-for-kids', label: 'Paul and Silas in prison, Philippi' },
    { slug: 'paul-in-athens-for-kids', label: 'Paul in Athens' },
    { slug: 'shipwrecked-for-kids', label: 'Shipwrecked, the voyage to Rome' },
  ],
  'twelve-tribes-of-israel': [
    { slug: 'joshua-takes-command-for-kids', label: 'Joshua takes command' },
    { slug: 'deborah-a-brave-leader-for-kids', label: 'Deborah, a brave leader' },
    { slug: 'gideons-300-for-kids', label: "Gideon's 300" },
  ],
  'the-promised-land': [
    { slug: 'the-twelve-spies-for-kids', label: 'The twelve spies' },
    { slug: 'rahab-and-the-spies-for-kids', label: 'Rahab and the spies' },
    { slug: 'the-walls-of-jericho-for-kids', label: 'The walls of Jericho' },
  ],
}

export function generateStaticParams() {
  return MAPS.map(m => ({ slug: m.slug }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params
  const m = getMap(slug)
  const meta = META[slug]
  if (!m || !meta) return {}
  const url = `https://faithfulkids.app/printables/bible-maps/${m.slug}`
  return {
    title: { absolute: meta.title },
    description: meta.desc,
    keywords: [m.keyword, 'bible map', 'printable bible maps', 'bible maps for kids', 'sunday school maps'],
    alternates: { canonical: url },
    openGraph: {
      title: meta.title, description: meta.desc, url, siteName: 'Faithful Kids', type: 'article',
      images: [{ url: `https://d3g07v1w0lehiv.cloudfront.net/bible-maps/${m.slug}-og.png`, width: 1200, height: 630 }],
    },
  }
}

export default async function BibleMapPage(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const m = getMap(slug)
  if (!m || !META[slug]) notFound()

  const region = REGIONS[m.region]
  const faqs = FAQS[slug] ?? []
  const stories = STORIES[slug] ?? []
  const others = MAPS.filter(o => o.slug !== m.slug)
  const vids = printableVideos as Record<string, { videoSrc: string; posterSrc: string; videoTitle: string; duration: string | null }>
  const clip = vids._default

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question', name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <div className="no-print"><SiteNav active="printables" /></div>

      <main className="bm-wrap">
        <div className="no-print" style={{ textAlign: 'right', marginBottom: '0.5rem' }}>
          <PrintButton />
        </div>
        <nav className="bm-crumb no-print">
          <a href="/printables">Printables</a>
          <span>›</span>
          <a href="/printables/bible-maps">Bible Maps</a>
        </nav>

        <header className="bm-head">
          <h1>{m.title}Printable Bible Map</h1>
          <p className="bm-sub">
            {m.intro} <strong>{m.places.length} labeled places</strong> · {m.scripture} · free to
            print for your family, class, or church group.
          </p>
          <p className="no-print" style={{ margin: '0.9rem 0 0' }}>
            <PdfDownloadLink className="bm-dl" href={`https://d3g07v1w0lehiv.cloudfront.net/printables/bible-maps/${m.slug}.pdf`} printable={`bible-maps/${m.slug}`}>
              Download the free PDF &rarr;
            </PdfDownloadLink>
            <span className="bm-dl-note">Letter size · prints on one sheet</span>
          </p>
        </header>

        <div className="bm-sheet">
          <BibleMapSvg map={m} region={region} />
        </div>
        <MapLegend map={m} />

        {m.disclaimer && <p className="bm-disclaimer">{m.disclaimer}</p>}

        <div className="bm-body">
          <section>
            <h2>Every place on this map</h2>
            <ul className="bm-places">
              {m.places.map(p => (
                <li key={p.name}>
                  <strong>{p.name}{p.traditional ? <span className="bm-trad">*</span> : null}</strong>
                  {p.note ? <>: {p.note}</> : null}
                </li>
              ))}
            </ul>
            {m.places.some(p => p.traditional) && (
              <p style={{ fontSize: '0.88rem', color: '#92400e' }}>
                * traditional site: the Bible names the place, tradition supplies the pin, and
                scholars still debate the exact spot.
              </p>
            )}
          </section>

          <section>
            <h2>Three things to point out</h2>
            <ol className="bm-facts">
              {m.facts.map(f => <li key={f.slice(0, 32)}>{f}</li>)}
            </ol>
          </section>

          {stories.length > 0 && (
            <section className="no-print">
              <h2>The stories that happened here</h2>
              <p>
                A map sticks when it has stories pinned to it. Each of these is a free retelling
                with the two-minute video episode:
              </p>
              <ul className="bm-facts">
                {stories.map(s => (
                  <li key={s.slug}><a href={`/blog/${s.slug}`}>{s.label}</a></li>
                ))}
              </ul>
            </section>
          )}

          {faqs.length > 0 && (
            <section>
              <h2>Common questions</h2>
              {faqs.map(f => (
                <div key={f.q} style={{ marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 4px' }}>{f.q}</h3>
                  <p style={{ margin: 0 }}>{f.a}</p>
                </div>
              ))}
            </section>
          )}

          <section className="no-print">
            <h2>More printable Bible maps</h2>
            <div className="bm-more">
              {others.map(o => (
                <a key={o.slug} href={`/printables/bible-maps/${o.slug}`}>
                  <div className="bm-thumb">
                    <BibleMapSvg map={o} region={REGIONS[o.region]} preview />
                  </div>
                  <strong>{o.title}</strong>
                  <span>{o.scripture}</span>
                </a>
              ))}
            </div>
            <p style={{ marginTop: '0.9rem' }}>
              All six live on the <a href="/printables/bible-maps">Bible maps hub</a>, and the{' '}
              <a href="/printables/bible-timeline">printable Bible timeline</a> puts the whole
              story in order.
            </p>
          </section>
        </div>

        <section className="cp-capture no-print">
          <EmailCaptureCard
            magnet="coloring-pages"
            source="blog-inline"
            sourcePost={`bible-map-${m.slug}`}
            title="🖍️ Free too: all 26 Bible coloring pages"
            subtitle="One PDF, Creation to the Empty Tomb, the set teachers pair with these maps."
          />
        </section>

        <PrintableCta
          {...clip}
          duration={clip.duration ?? undefined}
          heading="The map shows where. The stories show why it matters."
          body={`A child who can find ${m.places[0].name} on a map remembers the place; a child who knows the story remembers everything. ${clip.videoTitle} runs about two minutes and ends with a quiz, one of 300+ episodes, Genesis to Revelation.`}
          source={`bible-map-${m.slug}`}
        />
      </main>

      <div className="no-print"><SiteFooter /></div>
    </>
  )
}
