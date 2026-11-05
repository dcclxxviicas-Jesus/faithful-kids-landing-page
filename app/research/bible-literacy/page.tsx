import type { Metadata } from 'next'
import '../../home.css'
import '../../v2-pages.css'
import './research.css'
import { SiteNav, SiteFooter } from '@/app/components/SiteChrome'
import { V2Shell } from '@/app/v2-shell'
import data from '@/lib/research/bible-literacy.json'

/**
 * /research/bible-literacy: the flagship original-research page and the link
 * target of the December 2026 press release ("Could You Pass a Children's
 * Bible Quiz? Half of These Players Couldn't.").
 *
 * EVERY NUMBER ON THIS PAGE COMES FROM lib/research/bible-literacy.json, which
 * build-bible-literacy-research.py regenerates from PostHog + the question
 * bank. Do not type a statistic into this file. A quarterly refresh is: run the
 * script with the new window, bump UPDATED below, redeploy. The lookups throw
 * at build time if a finding's question disappears from the data, so a refresh
 * cannot silently publish a stale or empty chart.
 *
 * Honesty framing is load-bearing and goes out in the press kit verbatim:
 * players are self-selected visitors of a Christian kids' platform (parents,
 * teachers, teens, kids). Never "Americans", never "kids' scores", never
 * "adults did worse than kids" (there is no age segmentation). The blog-game
 * dataset is used for exactly one stat and is flagged where it appears.
 *
 * No em-dashes anywhere on this page (site rule since Nov 4, 2026).
 */

const UPDATED = 'November 4, 2026'
const UPDATED_ISO = '2026-11-04'
const PUBLISHED_ISO = '2026-11-04'
const URL = 'https://faithfulkids.app/research/bible-literacy'
const CDN = 'https://d3g07v1w0lehiv.cloudfront.net'
const ART = {
  nativity: `${CDN}/blog-images/born-in-a-manger-for-kids-hero.webp?v=3`,
  wisemen: `${CDN}/blog-images/the-wise-men-for-kids-hero.webp?v=3`,
  noah: `${CDN}/blog-images/noah-and-the-great-flood-for-kids-hero.webp?v=3`,
  antioch: `${CDN}/blog-images/the-church-at-antioch-for-kids-hero.webp?v=3`,
  saul: `${CDN}/blog-images/saul-the-first-king-for-kids-hero.webp?v=3`,
}

type Q = (typeof data.questions)[number]
const Qs: Q[] = data.questions

/* Find one question by a phrase in its text or reference. Throws so a data
   refresh that loses a question fails the build instead of shipping a hole. */
function pick(needle: string, where: 'q' | 'ref' = 'q'): Q {
  const hit = Qs.find(x => x[where].toLowerCase().includes(needle.toLowerCase()))
  if (!hit) throw new Error(`bible-literacy: no question matching "${needle}"`)
  return hit
}
const fmt = (n: number) => n.toLocaleString('en-US')
const pct = (x: number) => Math.round(x)
const wrongPct = (q: Q) => Math.round((100 * (q.n - q.right)) / q.n)

/* Strict graded corpus: hub answers since Sep 15 + blog answers since the blog
   games became multiple choice (Oct 6, 2026 12:00 UTC). The script enforces the
   blog cutoff; the page never adds the two itself. */
const TOTAL = data.corpus.answers
const PLAYERS = data.corpus.players
const THOUSANDS = `${Math.floor(TOTAL / 1000).toLocaleString('en-US')},000+`
const PLAYERS_ROUND = `${Math.floor(PLAYERS / 100) * 100}`
const measured = Qs.filter(q => q.n >= data.min_n)
const nMin = Math.min(...measured.map(q => q.n))
const nMax = Math.max(...measured.map(q => q.n))

/* The findings. Each is a lookup, not a number. */
const christmas = [pick('lay baby Jesus'), pick('town was Jesus born'), pick('three gifts'), pick('How many wise men'), pick('follow to find')]
const manger = christmas[0], bethlehem = christmas[1], gifts = christmas[2], wiseCount = christmas[3]
const noah = pick('clean animal')
const godHelps = data.god_helps!
const worseThanGuessing = measured.filter(q => q.pct < 25).sort((a, b) => a.pct - b.pct)
const antioch = pick('first called Christians')
const strong = [pick('For God so loved'), pick('first man and woman'), pick('giant ark'), pick('name of the garden'), pick('water into'), pick('defeat the giant Goliath')]
  .sort((a, b) => b.pct - a.pct)
const fading = [pick('very first king'), pick('walls came tumbling'), pick('food did God send'), pick('Gideon keep'), pick('Sisera')]
  .sort((a, b) => a.pct - b.pct)
const bands = [
  { label: 'Below 25%', note: 'worse than guessing', n: measured.filter(q => q.pct < 25).length },
  { label: '25% to 49%', note: '', n: measured.filter(q => q.pct >= 25 && q.pct < 50).length },
  { label: '50% to 74%', note: '', n: measured.filter(q => q.pct >= 50 && q.pct < 75).length },
  { label: '75% and above', note: '', n: measured.filter(q => q.pct >= 75).length },
]
const tiers = [
  { label: 'Easy round (written for ages 5 to 8)', ...data.tiers.easy },
  { label: 'Medium round (ages 9 to 12)', ...data.tiers.medium },
  { label: 'Hard round (teens and adults)', ...data.tiers.hard },
]

/* <=44 chars: the layout appends " | Faithful Kids" and the audit caps at 60. */
const TITLE = `Bible Literacy Study: ${THOUSANDS} Answers Graded`
const DESCRIPTION = `Faithful Kids analyzed ${fmt(TOTAL)} graded Bible trivia answers. Only ${pct(manger.pct)}% knew Jesus was laid in a manger. See every question and sample size, then test yourself.`

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: {
    title: 'Could You Pass a Children’s Bible Quiz? Half of These Players Couldn’t.',
    description: DESCRIPTION,
    url: URL,
    siteName: 'Faithful Kids',
    type: 'article',
    publishedTime: PUBLISHED_ISO,
    modifiedTime: UPDATED_ISO,
    images: [{ url: ART.nativity, width: 1792, height: 1024, alt: 'The nativity: Mary and Joseph beside the manger, shepherds and animals gathered round' }],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ART.nativity] },
}

/* ---------- chart pieces (HTML/CSS, drawn to scale) ---------- */

function fillClass(p: number) {
  return p < 25 ? 'rs-fill is-low' : p < 50 ? 'rs-fill is-mid' : 'rs-fill'
}

function BarRows({ title, sub, rows, guessLine = false }: {
  title: string
  sub?: string
  rows: { label: string; sub?: string; pct: number; n: number }[]
  guessLine?: boolean
}) {
  const summary = rows.map(r => `${r.label}: ${pct(r.pct)}% correct of ${r.n}`).join('; ')
  return (
    <figure className="rs-chart" role="img" aria-label={`${title}. ${summary}.`}>
      <figcaption>
        <p className="rs-chart-title">{title}</p>
        {sub && <p className="rs-chart-sub">{sub}</p>}
      </figcaption>
      <div aria-hidden="true">
        {rows.map(r => (
          <div className="rs-row" key={r.label}>
            <div className="rs-row-q">{r.label}{r.sub && <small>{r.sub}</small>}</div>
            <div className="rs-track">
              <i className={fillClass(r.pct)} style={{ width: `${r.pct}%` }} />
              {guessLine && <i className="rs-guess" style={{ left: '25%' }} />}
              {r.pct >= 80
                ? <span className="rs-pct is-in" style={{ right: `${100 - r.pct}%` }}>{pct(r.pct)}%</span>
                : <span className="rs-pct" style={{ left: `${r.pct}%` }}>{pct(r.pct)}%</span>}
            </div>
          </div>
        ))}
        {guessLine && <p className="rs-guess-label">Dashed line: 25%, the score random clicking earns on a four-option question.</p>}
      </div>
    </figure>
  )
}

function Legend() {
  return (
    <p className="rs-legend" aria-hidden="true">
      <span><i style={{ background: 'var(--hv-coral)' }} />below the 25% guessing floor</span>
      <span><i style={{ background: 'var(--hv-sun)' }} />under half right</span>
      <span><i style={{ background: 'var(--hv-green)' }} />half or better</span>
    </p>
  )
}

/* Vertical bars: how many of the measured questions landed in each band. */
function Histogram() {
  const W = 640, H = 300, padL = 36, padB = 64, padT = 36
  const max = Math.max(...bands.map(b => b.n))
  const bw = (W - padL - 20) / bands.length
  const colors = ['var(--hv-coral)', 'var(--hv-sun)', '#86efac', 'var(--hv-green)']
  const label = bands.map(b => `${b.label}${b.note ? ` (${b.note})` : ''}: ${b.n} questions`).join('; ')
  return (
    <figure className="rs-chart">
      <figcaption>
        <p className="rs-chart-title">Where the {measured.length} measured questions landed</p>
        <p className="rs-chart-sub">Each question answered at least {data.min_n} times. Average score across all of them: {pct(data.hub.pct)}%.</p>
      </figcaption>
      <svg className="rs-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Bar chart of questions by accuracy band. ${label}.`}>
        <title>Questions by accuracy band</title>
        {bands.map((b, i) => {
          const h = (b.n / max) * (H - padB - padT)
          const x = padL + i * bw + bw * 0.15
          const y = H - padB - h
          return (
            <g key={b.label}>
              <rect x={x} y={y} width={bw * 0.7} height={h} rx={10} fill={colors[i]} />
              <text className="val" x={x + bw * 0.35} y={y - 10} textAnchor="middle">{b.n}</text>
              <text className="axis" x={x + bw * 0.35} y={H - padB + 20} textAnchor="middle">{b.label}</text>
              {b.note && <text className="cap" x={x + bw * 0.35} y={H - padB + 38} textAnchor="middle">{b.note}</text>}
            </g>
          )
        })}
        <line x1={padL} y1={H - padB} x2={W - 10} y2={H - padB} stroke="#cbd5e1" strokeWidth={2} />
        <text className="cap" x={padL} y={H - 8}>Number of questions, by share of players who answered correctly</text>
      </svg>
    </figure>
  )
}

function StatRow({ q, children }: { q: Q; children?: React.ReactNode }) {
  return <span>{children}<small> ({q.n} answers)</small></span>
}

/* ---------- schema ----------
   Three separate JSON-LD blocks rather than one @graph: identical to Google,
   but every validator and our own onpage-audit read the top-level @type. */
const schemaBlocks = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      '@id': `${URL}#article`,
      headline: 'Could You Pass a Children’s Bible Quiz? Half of These Players Couldn’t.',
      alternativeHeadline: TITLE,
      description: DESCRIPTION,
      url: URL,
      mainEntityOfPage: URL,
      datePublished: PUBLISHED_ISO,
      dateModified: UPDATED_ISO,
      image: ART.nativity,
      author: { '@type': 'Organization', name: 'Faithful Kids', url: 'https://faithfulkids.app' },
      publisher: { '@type': 'Organization', name: 'Faithful Kids', url: 'https://faithfulkids.app', logo: { '@type': 'ImageObject', url: 'https://faithfulkids.app/logo-sm.png' } },
      about: ['Bible literacy', 'Bible trivia', 'Christmas story', 'Christian education'],
      isBasedOn: `${URL}#dataset`,
      inLanguage: 'en',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Dataset',
      '@id': `${URL}#dataset`,
      name: 'Faithful Kids Bible Literacy Study, November 2026',
      description: `${fmt(TOTAL)} graded answers from Faithful Kids' free online Bible trivia games (four-option multiple choice, shuffled), ${data.window.from} to ${UPDATED_ISO}. Primary set: ${fmt(data.hub.answers)} answers from about ${fmt(data.hub.players)} players of the standalone game at faithfulkids.app/bible-trivia, ${measured.length} questions with at least ${data.min_n} answers each. Players are self-selected visitors, not a probability sample.`,
      url: URL,
      creator: { '@type': 'Organization', name: 'Faithful Kids', url: 'https://faithfulkids.app' },
      temporalCoverage: `${data.window.from}/${UPDATED_ISO}`,
      dateModified: UPDATED_ISO,
      variableMeasured: ['share of answers correct per question', 'answers per question', 'question difficulty tier'],
      measurementTechnique: 'Four-option multiple-choice quiz, options shuffled, one graded event per answer',
      isAccessibleForFree: true,
      license: 'https://creativecommons.org/licenses/by/4.0/',
      includedInDataCatalog: { '@type': 'DataCatalog', name: 'Faithful Kids Research' },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Faithful Kids', item: 'https://faithfulkids.app' },
        { '@type': 'ListItem', position: 2, name: 'Research', item: 'https://faithfulkids.app/research' },
        { '@type': 'ListItem', position: 3, name: 'Bible Literacy Study', item: URL },
      ],
    },
]

export default function BibleLiteracyResearch() {
  return (
    <V2Shell>
      <div className="rs">
        <SiteNav />
        {schemaBlocks.map((b, i) => (
          <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(b) }} />
        ))}

        <main id="main-content">
          {/* ---------- hero ---------- */}
          <header className="rs-hero">
            <div className="rs-hero-inner">
              <div>
                <p className="rs-crumb"><a href="/research">Research</a> / Bible Literacy Study</p>
                <p className="hv-eyebrow">Original research</p>
                <h1>Could You Pass a Children&rsquo;s Bible Quiz? Half of These Players Couldn&rsquo;t.</h1>
                <p className="rs-updated">
                  <span>Last updated: <b>{UPDATED}</b></span>
                  <span>Data: Sep 15 to Nov 4, 2026</span>
                  <span>Refreshed quarterly, next edition Easter 2027</span>
                </p>
                {/* Plain counts, by Cas's call (Nov 4, 2026): a "one answer every
                    three minutes" rate was rejected as sounding odd. The press
                    story deliberately understates ("thousands", "25,000+"); this
                    page shows the exact figures it points to. Do not round down. */}
                <p className="rs-lede">
                  This fall, thousands of people played Faithful Kids&rsquo; free Bible trivia games:{' '}
                  <b>{fmt(TOTAL)}</b> graded answers from more than {fmt(Number(PLAYERS_ROUND))} players
                  in {data.corpus.days} days. They were not a random sample of anyone. They chose to play
                  Bible trivia on a Christian kids&rsquo; site. Even so, the Christmas story came back
                  half-remembered, and three questions scored worse than guessing.
                </p>
                <div className="rs-ctas">
                  <a className="hv-cta" href="/bible-trivia" data-testid="rs-cta-hero">
                    <span className="hv-cta-play" aria-hidden="true" />Take the quiz yourself
                  </a>
                  <a className="rs-link" href="#findings">Read the findings</a>
                </div>
                <p className="rs-chart-sub" style={{ marginTop: 12 }}>Free, no signup, about 90 seconds. Rounds for kids, teens and adults.</p>
              </div>
              <figure className="rs-hero-art">
                <img src={ART.nativity} alt="The nativity: Mary and Joseph beside the manger, shepherds and animals gathered round" width={1792} height={1024} fetchPriority="high" />
                <figcaption><b>{pct(manger.pct)}%</b> knew Jesus was laid in a manger ({manger.n} answers)</figcaption>
              </figure>
            </div>

            <div className="rs-stats" aria-label="Headline numbers">
              <div className="rs-stat"><b>{fmt(TOTAL)}</b><span>graded answers</span></div>
              <div className="rs-stat"><b>{pct(data.hub.pct)}%</b><span>average score on the main game</span></div>
              <div className="rs-stat"><b>{fmt(PLAYERS)}</b><span>players over {data.corpus.days} days</span></div>
              <div className="rs-stat"><b>{data.bands.at_least_75} of {measured.length}</b><span>questions scored 75% or better</span></div>
            </div>
          </header>

          {/* ---------- who took it ---------- */}
          <section className="v2-section" style={{ paddingBottom: 20 }}>
            <div className="rs-honest">
              <div className="rs-ico" aria-hidden="true">🔍</div>
              <div>
                <h2>Who these players are, and are not</h2>
                <p>
                  Everyone in this data chose to play a Bible trivia game on faithfulkids.app: parents,
                  Sunday school teachers, homeschoolers, teens and kids. They are not a sample of Americans,
                  of Christians, or of any population, and we do not know any player&rsquo;s age. So these
                  are not &ldquo;kids&rsquo; scores&rdquo; and they are not &ldquo;adults&rsquo; scores&rdquo;. They are the scores of
                  people motivated enough to seek out Bible trivia, which is exactly what makes the gaps
                  worth noticing.
                </p>
                <p>
                  {measured.length} questions were answered often enough to report ({data.min_n} answers or more each). Every question is four-option multiple choice with the options shuffled, so random
                  clicking scores 25%. Each statistic below shows how many answers it rests on.
                  Full method at the <a className="rs-link" href="#method">bottom of the page</a>.
                </p>
              </div>
            </div>
          </section>

          {/* ---------- finding 1: Christmas ---------- */}
          <section className="v2-section" id="findings">
            <div className="rs-finding-head" id="christmas">
              <span className="rs-num">Finding 1</span>
              <h2>The Christmas story is half forgotten</h2>
              <p>
                Five questions about the nativity, asked to people who came looking for Bible trivia.
                Only {pct(manger.pct)}% knew Mary laid Jesus in a manger. Barely half could name
                Bethlehem. And {wrongPct(wiseCount)}% confidently picked a number of wise men, when
                the Bible never gives one: Matthew counts the gifts, not the givers.
              </p>
            </div>
            <div className="rs-two">
              <div>
                <BarRows
                  title="Share of players who answered correctly"
                  sub="Main game, Sep 15 to Nov 4, 2026. Answers per question in brackets."
                  rows={christmas.map(q => ({ label: q.q, sub: `${q.answer} (${q.ref}), ${q.n} answers`, pct: q.pct, n: q.n }))}
                />
                <Legend />
              </div>
              <div>
                <div className="rs-art">
                  <img src={ART.wisemen} alt="The wise men on camels following the star across the desert at night" width={1792} height={1024} loading="lazy" />
                </div>
                <blockquote className="rs-quote">
                  &ldquo;Among people who chose to play Bible trivia, barely half could say Jesus was laid in
                  a manger or born in Bethlehem, and {wrongPct(wiseCount)}% were sure of a number of wise men
                  the Bible never states.&rdquo;
                  <small>Quotable summary. Figures: manger {pct(manger.pct)}% of {manger.n}, Bethlehem {pct(bethlehem.pct)}% of {bethlehem.n}, three gifts {pct(gifts.pct)}% of {gifts.n}, wise-men count {pct(wiseCount.pct)}% of {wiseCount.n}.</small>
                </blockquote>
              </div>
            </div>
          </section>

          {/* ---------- finding 2: things the Bible never says ---------- */}
          <section className="v2-section is-alt">
            <div className="rs-finding-head" id="never-says">
              <span className="rs-num">Finding 2</span>
              <h2>Things the Bible never says, that most players believe</h2>
              <p>
                Some of what people &ldquo;know&rdquo; about the Bible comes from Christmas cards, children&rsquo;s
                books and proverbs, not from the text. Three questions were built to catch exactly that.
              </p>
            </div>
            <div className="rs-two is-flip">
              <div className="rs-art">
                <img src={ART.noah} alt="Noah's ark on the water with animals aboard" width={1536} height={1024} loading="lazy" />
              </div>
              <div>
                <BarRows
                  title="Share of players who answered correctly"
                  rows={[
                    { label: wiseCount.q, sub: `${wiseCount.answer} (${wiseCount.ref}), ${wiseCount.n} answers`, pct: wiseCount.pct, n: wiseCount.n },
                    { label: noah.q, sub: `${noah.answer} (${noah.ref}), ${noah.n} answers`, pct: noah.pct, n: noah.n },
                    { label: godHelps.q, sub: `Nowhere: it is not in the Bible. Blog-game dataset, ${godHelps.n} answers, see note`, pct: godHelps.pct, n: godHelps.n },
                  ]}
                />
                <Legend />
                <p className="rs-chart-sub" style={{ marginTop: 14 }}>
                  Note on the third bar: that question is asked only in our blog-post games, where the
                  article above the game prints the answers. Scores there run high ({pct(data.blog.pct)}%
                  average across the blog games), so {pct(godHelps.pct)}% is a generous reading. Even
                  with the answer on the page, one player in three placed Benjamin Franklin&rsquo;s proverb in
                  Scripture.
                </p>
              </div>
            </div>
          </section>

          {/* ---------- quiz band ---------- */}
          <section className="rs-band">
            <h2>How would you score?</h2>
            <p>The questions in this study are the questions in the game. Pick kids, teens or adults, play one round, and see where you land against a {pct(data.hub.pct)}% average.</p>
            <a className="hv-cta" href="/bible-trivia" data-testid="rs-cta-mid"><span className="hv-cta-play" aria-hidden="true" />Play the Bible trivia game</a>
            <small>Free. No signup. Every answer shows its verse.</small>
          </section>

          {/* ---------- finding 3: worse than guessing ---------- */}
          <section className="v2-section">
            <div className="rs-finding-head" id="guessing">
              <span className="rs-num">Finding 3</span>
              <h2>{worseThanGuessing.length} questions scored worse than guessing</h2>
              <p>
                With four options, random clicking scores 25%. {worseThanGuessing.length === 3 ? 'Three' : worseThanGuessing.length} questions
                landed below that floor, which means the wrong answers were more convincing than the
                truth. Asked where believers were first called Christians, only {pct(antioch.pct)}%
                said Antioch.
              </p>
            </div>
            <div className="rs-two">
              <div>
                <BarRows
                  title="Share of players who answered correctly"
                  sub="The dashed line is the 25% guessing floor."
                  guessLine
                  rows={worseThanGuessing.map(q => ({ label: q.q, sub: `${q.answer} (${q.ref}), ${q.n} answers`, pct: q.pct, n: q.n }))}
                />
              </div>
              <div className="rs-art">
                <img src={ART.antioch} alt="Early believers gathered in the city of Antioch" width={1536} height={1024} loading="lazy" />
              </div>
            </div>
          </section>

          {/* ---------- finding 4: holds vs fading ---------- */}
          <section className="v2-section is-sky">
            <div className="rs-finding-head" id="holds">
              <span className="rs-num">Finding 4</span>
              <h2>The preschool stories hold. The middle of the Bible is fading.</h2>
              <p>
                Genesis and the most famous Gospel moments survive: {pct(strong[0].pct)}% finished John 3:16,
                and Adam and Eve, Noah&rsquo;s ark, Eden and David&rsquo;s sling all cleared 75%. Judges, Ruth, the
                kings and the early church did not. Only {pct(fading[0].pct)}% named Saul as Israel&rsquo;s first king.
              </p>
            </div>
            <div className="rs-chart-grid">
              <BarRows
                title="Still strong"
                sub="The stories most children meet first."
                rows={strong.map(q => ({ label: q.q, sub: `${q.answer} (${q.ref}), ${q.n} answers`, pct: q.pct, n: q.n }))}
              />
              <BarRows
                title="Fading"
                sub="Judges, the first king, the wilderness."
                rows={fading.map(q => ({ label: q.q, sub: `${q.answer} (${q.ref}), ${q.n} answers`, pct: q.pct, n: q.n }))}
              />
            </div>
            <div className="rs-two" style={{ marginTop: 22 }}>
              <div className="rs-art">
                <img src={ART.saul} alt="Samuel anointing Saul as the first king of Israel" width={1536} height={1024} loading="lazy" />
              </div>
              <div className="rs-prose" style={{ margin: 0 }}>
                <p>
                  The pattern is not random. The stories that survive are the ones told to five-year-olds:
                  creation, the ark, the giant. The ones that fade sit between the picture-book stories and
                  the Gospels, where a child&rsquo;s Bible education often thins out. That gap is the reason our
                  own <a href="/bible-stories-for-kids">story library</a> runs Genesis to Revelation
                  rather than stopping at the famous five.
                </p>
              </div>
            </div>
          </section>

          {/* ---------- the shape of the whole thing ---------- */}
          <section className="v2-section">
            <div className="rs-finding-head" id="distribution">
              <span className="rs-num">The whole picture</span>
              <h2>{data.bands.below_50} of {measured.length} questions were missed by most players</h2>
              <p>
                Across every question with at least {data.min_n} answers, the average score was {pct(data.hub.pct)}%.
                Only {data.bands.at_least_75} cleared 75%. The questions we wrote for the youngest round were not
                much easier for this audience than the hard ones.
              </p>
            </div>
            <div className="rs-chart-grid">
              <Histogram />
              <div>
                <BarRows
                  title="Average score by round"
                  sub="The rounds are written for different ages, but every player can choose any round."
                  rows={tiers.map(t => ({ label: t.label, sub: `${t.questions} questions, ${fmt(t.answers)} answers`, pct: t.pct ?? 0, n: t.answers }))}
                />
                <Legend />
              </div>
            </div>
          </section>

          {/* ---------- methodology ---------- */}
          <section className="v2-section is-alt" id="method">
            <div className="rs-finding-head">
              <span className="rs-num">Method</span>
              <h2>How this was measured</h2>
              <p>Written so a journalist, a pastor or a statistics teacher can check it.</p>
            </div>
            <div className="rs-method">
              <div className="v2-card">
                <h3>What was counted</h3>
                <p>One graded event per answer on Faithful Kids&rsquo; free online Bible trivia games: {fmt(TOTAL)} answers from {fmt(PLAYERS)} distinct players over {data.corpus.days} days (September 15 to November 4, 2026 for the main game; October 6 onward for the blog games, the day they became multiple choice). Every question is four-option multiple choice with the options shuffled on each play, so a blind guess scores 25%.</p>
              </div>
              <div className="v2-card">
                <h3>Primary dataset</h3>
                <p>The standalone game at <a className="rs-link" href="/bible-trivia">faithfulkids.app/bible-trivia</a>: {fmt(data.hub.answers)} answers from about {fmt(data.hub.players)} players. Every headline figure on this page comes from it. {measured.length} questions were answered at least {data.min_n} times (range {nMin} to {nMax}) and only those are reported. {data.hub.answers_unlabelled} answers logged without a question label are excluded.</p>
              </div>
              <div className="v2-card">
                <h3>Secondary dataset, used once</h3>
                <p>The multiple-choice games under {`85`} blog posts: {fmt(data.blog.answers)} answers from about {fmt(data.blog.players)} players since October 6. The article above each game prints the answers, so accuracy there ({pct(data.blog.pct)}%) is inflated. It is used for one statistic, the &ldquo;God helps those who help themselves&rdquo; question, and flagged where it appears.</p>
              </div>
              <div className="v2-card">
                <h3>Who the players are</h3>
                <p>Self-selected visitors to a Christian children&rsquo;s platform. We do not collect age, so nothing here compares children with adults, and nothing here describes Americans or Christians in general. Correct answers were verified against the published question bank, each with its verse.</p>
              </div>
              <div className="v2-card">
                <h3>What changes next time</h3>
                <p>This page is refreshed quarterly with the full window to date, so the sample grows rather than resets. The Easter 2027 edition will add the Resurrection and Holy Week questions. The last-updated line at the top is the version marker.</p>
              </div>
              <div className="v2-card">
                <h3>Get the data</h3>
                <p>The question-level table is below. The raw per-answer export is available to journalists and researchers on request: <a className="rs-link" href="mailto:christian@faithfulkids.app">christian@faithfulkids.app</a>. Figures may be reused with attribution (CC BY 4.0).</p>
              </div>
            </div>
            <div className="rs-cite">
              <strong>How to cite:</strong> Faithful Kids, <em>Bible Literacy Study</em>, November 2026 edition,{' '}
              <code>faithfulkids.app/research/bible-literacy</code>. Suggested wording: &ldquo;an analysis of
              {' '}{fmt(TOTAL)} answers on Faithful Kids&rsquo; free Bible trivia games found that only {pct(manger.pct)}% of
              players knew Jesus was laid in a manger.&rdquo;
            </div>
          </section>

          {/* ---------- full table ---------- */}
          <section className="v2-section" id="table">
            <div className="rs-finding-head">
              <span className="rs-num">Every question</span>
              <h2>All {measured.length} measured questions, hardest first</h2>
              <p>The complete table behind the findings: question, correct answer with its verse, the round it belongs to, how many times it was answered, and the share answered correctly.</p>
            </div>
            <div className="rs-table-wrap">
              <table>
                <caption>Main game at faithfulkids.app/bible-trivia, Sep 15 to Nov 4, 2026. Questions with fewer than {data.min_n} answers are not shown.</caption>
                <thead>
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">Question and correct answer</th>
                    <th scope="col">Round</th>
                    <th scope="col" style={{ textAlign: 'right' }}>Answers</th>
                    <th scope="col">Correct</th>
                  </tr>
                </thead>
                <tbody>
                  {measured.map((q, i) => (
                    <tr key={q.q}>
                      <td className="num">{i + 1}</td>
                      <td>{q.q}<span className="rs-ans">{q.answer} ({q.ref})</span></td>
                      <td><span className="rs-tier">{q.tier}</span></td>
                      <td className="num">{q.n}</td>
                      <td className="num"><span className="rs-mini" aria-hidden="true"><i className={fillClass(q.pct).replace('rs-fill', '').trim()} style={{ width: `${q.pct}%` }} /></span>{q.pct.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ---------- closing CTA ---------- */}
          <section className="rs-band">
            <h2>Now try it yourself</h2>
            <p>Ten questions, about 90 seconds, every answer with its verse. Then share your score with the person who thinks they would do better.</p>
            <a className="hv-cta" href="/bible-trivia" data-testid="rs-cta-end"><span className="hv-cta-play" aria-hidden="true" />Take the quiz</a>
            <small>Teachers: the <a className="rs-link" style={{ color: '#fff' }} href="/blog/christmas-bible-trivia">Christmas round</a> and the <a className="rs-link" style={{ color: '#fff' }} href="/bible-quiz">all-ages quiz</a> are free to use in class.</small>
          </section>

          <section className="v2-section" style={{ paddingTop: 36, paddingBottom: 44 }}>
            <p className="rs-soft">
              Faithful Kids is a Bible video platform for children ages 5 to 15: short story lessons from
              Genesis to Revelation, each with a quiz and a reflection. It is family-built and independent.{' '}
              <a href="/">About the app</a>, or <a href="/churches">free access for churches</a>.
            </p>
          </section>
        </main>

        <SiteFooter />
      </div>
    </V2Shell>
  )
}
