import type { Metadata } from 'next'
import '../home.css'
import '../v2-pages.css'
import './bible-literacy/research.css'
import { SiteNav, SiteFooter } from '@/app/components/SiteChrome'
import { V2Shell } from '@/app/v2-shell'
import literacy from '@/lib/research/bible-literacy.json'

/**
 * /research: the hub for Faithful Kids' original research.
 *
 * Owner's framing (Nov 4, 2026): the goal of the research program is to find
 * the best ways to teach people the Bible, using data we actually have, and
 * to publish what we find. The hub lists published studies (with live numbers
 * pulled from each study's JSON so the cards never drift from the pages) and
 * the studies in the works, labelled PLANNED with their data source and a
 * target window. Nothing in the planned list may carry a result; a planned
 * study moves to "Published" only when its page exists.
 *
 * No em-dashes anywhere on this page (site rule since Nov 4, 2026).
 */

const URL = 'https://faithfulkids.app/research'
const CDN = 'https://d3g07v1w0lehiv.cloudfront.net'
const fmt = (n: number) => n.toLocaleString('en-US')

const lit = {
  manger: literacy.questions.find(q => q.q.toLowerCase().includes('lay baby jesus'))!,
  measured: literacy.questions.filter(q => q.n >= literacy.min_n).length,
}

type Study = {
  slug?: string
  tag: 'Published' | 'Planned'
  when: string
  title: string
  blurb: string
  source: string
  art?: string
  alt?: string
}

const PUBLISHED: Study[] = [
  {
    slug: '/research/bible-literacy',
    tag: 'Published',
    when: 'November 2026, refreshed quarterly',
    title: 'Could You Pass a Children’s Bible Quiz? Half of These Players Couldn’t.',
    blurb: `${fmt(literacy.corpus.answers)} graded answers from ${fmt(literacy.corpus.players)} players of our free Bible trivia games. A ${Math.round(literacy.hub.pct)}% average across ${lit.measured} questions, the Christmas story half-remembered (${Math.round(lit.manger.pct)}% knew Jesus was laid in a manger), and ${literacy.bands.below_25} questions that scored worse than guessing.`,
    source: 'Faithful Kids trivia games, Sep 15 to Nov 4, 2026',
    art: `${CDN}/blog-images/born-in-a-manger-for-kids-hero.webp?v=3`,
    alt: 'The nativity: Mary and Joseph beside the manger, shepherds and animals gathered round',
  },
]

/* Every planned study names the data it will rest on. The sizes quoted are
   the ones verified on Nov 4, 2026 and are deliberately rounded down. */
const PLANNED: Study[] = [
  {
    tag: 'Planned',
    when: 'January 2027',
    title: 'What Christian parents told us about screen time, ages and worries',
    blurb: 'More than 800 parents have answered our short onboarding questions since August: their children’s ages, daily screen time, what success would look like and their biggest screen time frustration. Reported in aggregate, with the questions shown exactly as asked.',
    source: 'Faithful Kids parent questionnaire, Aug 2026 onward',
  },
  {
    tag: 'Planned',
    when: 'March 2027',
    title: 'Bible Literacy Study, Easter edition',
    blurb: 'The same study with the full corpus to date, which should pass 40,000 answers by then, plus the Holy Week and Resurrection questions in their season.',
    source: 'Faithful Kids trivia games, Sep 2026 onward',
  },
  {
    tag: 'Planned',
    when: 'When the sample passes 1,000 quizzes',
    title: 'What children remember after a two-minute Bible story',
    blurb: 'Every lesson in the app ends with a short quiz and a reflection. Which stories stick, which do not, and how children say they feel afterward. A few hundred completed quizzes so far; we publish when there are enough to say something honest.',
    source: 'Faithful Kids app, aggregate and anonymous',
  },
  {
    tag: 'Planned',
    when: 'Early 2027',
    title: 'Do people finish a two-minute Bible story online?',
    blurb: 'Two hundred free story videos sit on our site. How many people who press play reach the end, where they stop, and whether the opening seconds predict it.',
    source: 'Faithful Kids story pages, Aug 2026 onward',
  },
  {
    tag: 'Planned',
    when: 'Early 2027',
    title: 'How AI assistants answer children’s Bible questions',
    blurb: 'Parents increasingly ask a chatbot before they ask a pastor. We put the questions children actually ask to the major assistants and grade the answers against the text, with the sources they cite.',
    source: 'Faithful Kids answer-engine harness',
  },
  {
    tag: 'Planned',
    when: 'Early 2027',
    title: 'The questions parents search when they try to teach the Bible',
    blurb: 'What people type into a search engine about teaching the Bible to children, how often, and in what season, from a year of search data on our own pages and the wider market.',
    source: 'Google Search Console and third-party search data',
  },
]

const TITLE = 'Research on How People Learn the Bible'
const DESCRIPTION = 'Original research from Faithful Kids on how children and families learn the Bible: published studies with exact counts, what is in progress, and how we work.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: {
    title: `${TITLE}: Faithful Kids`,
    description: DESCRIPTION,
    url: URL,
    siteName: 'Faithful Kids',
    type: 'website',
    images: [{ url: PUBLISHED[0].art!, width: 1792, height: 1024, alt: PUBLISHED[0].alt }],
  },
}

const schemaBlocks = [
  {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Faithful Kids Research',
    description: DESCRIPTION,
    url: URL,
    publisher: { '@type': 'Organization', name: 'Faithful Kids', url: 'https://faithfulkids.app' },
    hasPart: PUBLISHED.map(s => ({ '@type': 'Article', headline: s.title, url: `https://faithfulkids.app${s.slug}` })),
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Faithful Kids', item: 'https://faithfulkids.app' },
      { '@type': 'ListItem', position: 2, name: 'Research', item: URL },
    ],
  },
]

function StudyCard({ s }: { s: Study }) {
  const inner = (
    <>
      {s.art && <div className="rs-study-art"><img src={s.art} alt={s.alt ?? ''} width={1792} height={1024} loading="lazy" /></div>}
      <div className="rs-study-body">
        <p className="rs-study-meta"><span className={`rs-tag is-${s.tag.toLowerCase()}`}>{s.tag}</span> {s.when}</p>
        <h3>{s.title}</h3>
        <p>{s.blurb}</p>
        <p className="rs-study-source">Data: {s.source}</p>
        {s.slug && <span className="rs-link">Read the study</span>}
      </div>
    </>
  )
  return s.slug
    ? <a className="rs-study is-link" href={s.slug}>{inner}</a>
    : <div className="rs-study">{inner}</div>
}

export default function ResearchHub() {
  return (
    <V2Shell>
      <div className="rs">
        <SiteNav />
        {schemaBlocks.map((b, i) => (
          <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(b) }} />
        ))}

        <main id="main-content">
          <header className="rs-hero rs-hero-hub">
            <div className="rs-hero-inner is-one">
              <div>
                <p className="hv-eyebrow">Faithful Kids Research</p>
                <h1>How do people actually learn the Bible?</h1>
                <p className="rs-lede">
                  We want to find the ways of teaching the Bible that work, and share them. So we study
                  the question with data we actually have: the answers people give on our free trivia
                  games, what parents tell us, what children remember after a story. Every study
                  publishes its exact counts, its sample sizes and its method, says plainly who the people
                  in it are, and offers the raw numbers to anyone who asks.
                </p>
                <div className="rs-ctas">
                  <a className="rs-link" href="#published">Published studies</a>
                  <a className="rs-link" href="#planned">In the works</a>
                  <a className="rs-link" href="#how">How we work</a>
                </div>
              </div>
            </div>
          </header>

          <section className="v2-section" id="published">
            <div className="rs-finding-head">
              <span className="rs-num">Published</span>
              <h2>Studies you can cite today</h2>
              <p>Each one has a last-updated date at the top, a methodology section a statistics teacher could check, and a full data table.</p>
            </div>
            <div className="rs-study-grid is-featured">
              {PUBLISHED.map(s => <StudyCard key={s.title} s={s} />)}
            </div>
          </section>

          <section className="v2-section is-alt" id="planned">
            <div className="rs-finding-head">
              <span className="rs-num">In the works</span>
              <h2>What we are studying next</h2>
              <p>
                Listed before they are finished so you can hold us to them. A planned study has no
                result yet, only a question, the data it will rest on and a target. When one is published it
                moves up and gets its own page.
              </p>
            </div>
            <div className="rs-study-grid">
              {PLANNED.map(s => <StudyCard key={s.title} s={s} />)}
            </div>
            <p className="rs-soft" style={{ marginTop: 26 }}>
              Have a question you think we should study, or data you would like to see cut a different way?{' '}
              <a href="mailto:christian@faithfulkids.app">christian@faithfulkids.app</a>. Suggestions from
              teachers, pastors and researchers shape this list.
            </p>
          </section>

          <section className="v2-section" id="how">
            <div className="rs-finding-head">
              <span className="rs-num">How we work</span>
              <h2>The rules every study follows</h2>
              <p>Written down so they are harder to bend when a result is tempting.</p>
            </div>
            <div className="rs-method">
              <div className="v2-card"><h3>Our own data first</h3><p>We publish what we can measure ourselves and can therefore stand behind: answers, completions, questionnaires. When we use outside data we say whose it is.</p></div>
              <div className="v2-card"><h3>Exact counts, every time</h3><p>Totals, sample sizes and dates are printed as they are, not rounded up. Every chart is drawn to scale from the same file the text is generated from, so the two cannot disagree.</p></div>
              <div className="v2-card"><h3>Who the people are</h3><p>Our audiences choose us: parents, teachers, teens and children who came looking for Bible content. We say so in the first screen of every study, and we never dress a self-selected sample up as the population.</p></div>
              <div className="v2-card"><h3>Children stay anonymous</h3><p>App data is reported only in aggregate. No child, family or church is ever identifiable, and we do not collect more than a lesson needs.</p></div>
              <div className="v2-card"><h3>Refreshed, not abandoned</h3><p>Studies carry a last-updated date and are re-run on a schedule with the full window to date, so samples grow and findings can be checked against their earlier editions.</p></div>
              <div className="v2-card"><h3>Open to anyone</h3><p>Figures may be reused with attribution (CC BY 4.0). Journalists and researchers can request question-level data by email, and corrections are published on the study page, not buried.</p></div>
            </div>
          </section>

          <section className="rs-band">
            <h2>Get started with Faithful Kids</h2>
            <p>Short Bible story videos for kids, Genesis to Revelation, each with a quiz and a reflection.</p>
            <a className="hv-cta" href="/quiz" data-testid="rs-cta-hub"><span className="hv-cta-play" aria-hidden="true" />Get started</a>
          </section>

          <section className="v2-section" style={{ paddingTop: 36, paddingBottom: 44 }}>
            <p className="rs-soft">
              Faithful Kids is a Bible video platform for children ages 5 to 15: short story lessons from
              Genesis to Revelation, each with a quiz and a reflection. The research program exists because
              we would rather know what works than guess.{' '}
              <a href="/">About the app</a>, <a href="/parenting">Parenting essays</a>, or{' '}
              <a href="/churches">free access for churches</a>.
            </p>
          </section>
        </main>

        <SiteFooter />
      </div>
    </V2Shell>
  )
}
