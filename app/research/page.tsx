import type { Metadata } from 'next'
import '../home.css'
import '../v2-pages.css'
import './bible-literacy/research.css'
import { SiteNav, SiteFooter } from '@/app/components/SiteChrome'
import { V2Shell } from '@/app/v2-shell'
import literacy from '@/lib/research/bible-literacy.json'
import parents from '@/lib/research/parents.json'
import video from '@/lib/research/video.json'
import children from '@/lib/research/children.json'
import ai from '@/lib/research/ai.json'
import search from '@/lib/research/search.json'
import easter from '@/lib/research/easter.json'

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

const pc = (a: number, b: number) => Math.round((100 * a) / b)
const third = easter.hub.find(q => q.q.includes('third day'))!
const pq = parents.questions as unknown as Record<string, { n: number; answers: Record<string, number> }>
const aiS = ai.summary as Record<string, { right: number; n: number }>

const PUBLISHED: Study[] = [
  {
    slug: '/research/bible-literacy',
    tag: 'Published',
    when: 'November 2026, refreshed quarterly',
    title: 'Could You Pass a Children\u2019s Bible Quiz? Half of These Players Couldn\u2019t.',
    blurb: `${fmt(literacy.corpus.answers)} graded answers from ${fmt(literacy.corpus.players)} players of our free Bible trivia games. A ${Math.round(literacy.hub.pct)}% average across ${lit.measured} questions, the Christmas story half-remembered (${Math.round(lit.manger.pct)}% knew Jesus was laid in a manger), and ${literacy.bands.below_25} questions that scored worse than guessing.`,
    source: 'Faithful Kids trivia games, Sep 15 to Nov 4, 2026',
    art: `${CDN}/blog-images/born-in-a-manger-for-kids-hero.webp?v=3`,
    alt: 'The nativity: Mary and Joseph beside the manger, shepherds and animals gathered round',
  },
]

const MORE: Study[] = [
  {
    slug: '/research/ai-bible-quiz', tag: 'Published', when: 'November 2026',
    title: 'We Gave a Children\u2019s Bible Quiz to AI',
    blurb: `People average ${Math.round(literacy.hub.pct)}% on our quiz. Three OpenAI models scored ${Math.min(...ai.models.map(m => pc(aiS[m].right, aiS[m].n)))}% or better, then answered an 8-year-old in language several school years too hard, and all led with the wrong answer on Noah.`,
    source: 'Tests run Nov 4, 2026, one company\u2019s models',
    art: `${CDN}/blog-images/100-bible-trivia-questions-and-answers-hero.webp?v=3`, alt: 'Rows of small orange flags across a golden valley rising from an open book',
  },
  {
    slug: '/research/christian-parents-screen-time', tag: 'Published', when: 'November 2026',
    title: 'What Christian Parents Told Us About Screen Time',
    blurb: `${fmt(pq.screen_time.n)} parents reported their children\u2019s daily screen time and ${fmt(pq.pain.n)} named their biggest frustration. Parents reporting the least screen time most often worry that it teaches nothing.`,
    source: 'Parent questionnaire, Aug 15 to Nov 4, 2026',
    art: `${CDN}/blog-images/christmas-family-devotions-hero.webp?v=3`, alt: 'A mother and father on a sofa reading a large Bible with their two children',
  },
  {
    slug: '/research/bible-video-completion', tag: 'Published', when: 'November 2026',
    title: 'Do People Finish a Two-Minute Bible Story?',
    blurb: `${fmt(video.people)} people pressed play. ${pc(video.pairs.half, video.pairs.players)}% reached halfway and ${pc(video.pairs.complete, video.pairs.players)}% reached the end. Most of the drop-off comes early, and length mattered less than the story.`,
    source: 'Free story videos, Sep 1 to Nov 4, 2026',
    art: `${CDN}/blog-images/in-the-beginning-creation-for-kids-hero.webp?v=3`, alt: 'An illustration of the creation of the world',
  },
  {
    slug: '/research/bible-search-demand', tag: 'Published', when: 'November 2026',
    title: 'What People Actually Search When They Try to Learn the Bible',
    blurb: `${fmt(search.keywords)} search terms mapped. People look for lessons, games and things to use, and adults ask how to read it. Almost nobody searches how to teach it.`,
    source: 'Third-party US search estimates, Nov 2026',
    art: `${CDN}/blog-images/christmas-sunday-school-lessons-hero.webp?v=3`, alt: 'Children in a classroom arranging a nativity scene on a table',
  },
  {
    slug: '/research/after-a-bible-story', tag: 'Published', when: 'Early look, November 2026',
    title: 'What Children Do After a Two-Minute Bible Story',
    blurb: `${fmt(children.kids)} children, ${fmt(children.lessons)} lessons. Nearly all went on to the quiz and the reflection. A small sample and not yet a test of memory, and the page says why.`,
    source: 'Faithful Kids app, aggregate and anonymous',
    art: `${CDN}/blog-images/birthday-bible-verses-for-kids-hero.webp?v=3`, alt: 'A group of children smiling around an open Bible',
  },
  {
    slug: '/research/easter-first-look', tag: 'Published', when: 'First look, November 2026',
    title: `${Math.round(100 - third.pct)}% of Bible Trivia Players Missed the Easter Question`,
    blurb: `Three Easter questions from our trivia game, ahead of the full March edition. ${Math.round(third.pct)}% knew what happened on the third day (${third.n} answers).`,
    source: 'Faithful Kids trivia game, Sep 15 to Nov 4, 2026',
    art: `${CDN}/blog-images/the-empty-tomb-for-kids-hero.webp?v=3`, alt: 'Jesus standing in light at the mouth of the tomb, with people kneeling on the steps',
  },
]

/* A planned study names the data it will rest on and never carries a result. */
const PLANNED: Study[] = [
  {
    tag: 'Planned', when: 'March 2027',
    title: 'Bible Literacy Study, Easter edition',
    blurb: 'The full literacy study with all answers to date, with more Holy Week and Resurrection questions added to the game first.',
    source: 'Faithful Kids trivia games, Sep 2026 onward',
  },
  {
    tag: 'Planned', when: 'When the sample passes 1,000 quizzes',
    title: 'Do children remember a Bible story days later?',
    blurb: 'A real memory test: first attempts logged separately, and the question asked again days after the lesson. Needs a small change in the app before it can start.',
    source: 'Faithful Kids app, aggregate and anonymous',
  },
  {
    tag: 'Planned', when: 'Next edition',
    title: 'AI and the Bible quiz, more assistants',
    blurb: 'The same tests across other companies\u2019 assistants, not only OpenAI\u2019s models.',
    source: 'Faithful Kids test questions',
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
    hasPart: [...PUBLISHED, ...MORE].map(s => ({ '@type': 'Article', headline: s.title, url: `https://faithfulkids.app${s.slug}` })),
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
                  in it are, and we share the underlying figures with anyone who asks, apart from anything
                  about an individual child.
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
              <p>Each one has a last-updated date at the top and a methodology section a statistics teacher could check.</p>
            </div>
            <div className="rs-study-grid is-featured">
              {PUBLISHED.map(s => <StudyCard key={s.title} s={s} />)}
            </div>
            <div className="rs-study-grid" style={{ marginTop: 18 }}>
              {MORE.map(s => <StudyCard key={s.title} s={s} />)}
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
              <div className="v2-card"><h3>Open to anyone</h3><p>Figures may be reused with attribution (CC BY 4.0). Journalists and researchers can request question-level data by email (never child-level data), and corrections are published on the study page, not buried.</p></div>
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
