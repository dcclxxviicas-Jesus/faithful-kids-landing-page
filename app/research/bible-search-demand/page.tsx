import '../../home.css'
import '../../v2-pages.css'
import '../bible-literacy/research.css'
import d from '@/lib/research/search.json'
import { Bars, CDN, Finding, Honest, Method, StudyPage, Takeaways, fmt, pctOf, rd, studyMetadata, type Study } from '../ui'

/* Figures from lib/research/search.json: DataForSEO clickstream estimates.
   Never use Google Ads volume here, it is suppressed for child-directed terms. No em-dashes. */
const C = d.categories as unknown as Record<string, { keywords: number; volume: number; top: [string, number][] }>
const aud = d.audience
const kidShare = pctOf(aud.kids.volume, d.volume)
const top = (list: [string, number][]) => list.map(([k, v]) => ({ k, v }))
const teach = d.kid_teaching_terms as unknown as [string, number][]
const howGeneral = d.general_questions as unknown as [string, number][]
const vol = (kw: string, list: [string, number][]) => list.find(x => x[0] === kw)?.[1] ?? 0
const how = vol('how to read the bible', howGeneral)
const howTeach = vol('how to teach kids about god', teach)
const kidTop = d.kid_top as unknown as [string, number][]

function Terms({ title, sub, list }: { title: string; sub?: string; list: [string, number][] }) {
  return (
    <div className="rs-table-wrap">
      <table>
        <caption><strong>{title}</strong>{sub ? `. ${sub}` : ''}</caption>
        <thead><tr><th scope="col">Search term</th><th scope="col" style={{ textAlign: 'right' }}>Estimated US searches a month</th></tr></thead>
        <tbody>{top(list).map(x => <tr key={x.k}><td>{x.k}</td><td className="num">{fmt(x.v)}</td></tr>)}</tbody>
      </table>
    </div>
  )
}

const s: Study = {
  path: '/research/bible-search-demand',
  title: 'What People Search to Learn the Bible',
  h1: 'What People Actually Search When They Try to Learn the Bible',
  description: `We mapped ${fmt(d.keywords)} search terms about learning and teaching the Bible. People look for lessons, games and things to use. Almost nobody searches how to teach it.`,
  updated: 'November 4, 2026', updatedIso: '2026-11-04', dataLabel: 'US search estimates, Nov 2026', temporal: '2026-11-04',
  datasetName: 'Bible Search Demand',
  datasetDescription: `Estimated monthly US search volume for ${fmt(d.keywords)} terms about learning and teaching the Bible, from third-party clickstream data, grouped by what the searcher wants.`,
  measured: ['estimated monthly US searches per term', 'search intent category', 'child or general audience'],
  art: `${CDN}/blog-images/christmas-sunday-school-lessons-hero.webp?v=3`, artAlt: 'Children in a classroom arranging a nativity scene on a table',
}
export const metadata = studyMetadata(s)

export default function Page() {
  return (
    <StudyPage s={s}
      lede={<>Search shows what people want when nobody is watching. We mapped {fmt(d.keywords)} terms about learning and teaching the Bible. People search for things to use: lessons, games, coloring pages. Far fewer ask how to do it. &ldquo;How to read the Bible&rdquo; gets about {fmt(how)} US searches a month, and &ldquo;how to teach kids about God&rdquo; gets about {fmt(howTeach)}.</>}
      cap={<><b>{rd(kidShare)}%</b> of mapped search volume is explicitly about children, families or Sunday school</>}
      stats={[
        { value: fmt(d.keywords), label: 'search terms mapped' },
        { value: fmt(d.volume), label: 'estimated US searches a month across them' },
        { value: fmt(how), label: 'a month for "how to read the Bible"' },
        { value: fmt(howTeach), label: 'a month for "how to teach kids about God"' },
      ]}>
      <Honest title="What these numbers are">
        <p>These are third-party estimates of US searches, not exact counts, and small terms get rounded heavily. We started from {d.seeds.length} topics and followed the suggestions they produced, so this is a map of one neighbourhood rather than every Bible search there is. Categories are ours, assigned by rule from the words in each term.</p>
        <p>A search shows interest, not who is searching or what they went on to do. A low count does not mean people do not care: many parents ask a pastor or a friend instead.</p>
      </Honest>
      <Finding id="findings" num="Finding 1" title="People search for the thing, not the method" intro={<>Grouped by what the searcher wants, lessons and study material lead, followed by games and trivia. &ldquo;Lessons&rdquo; includes adult Bible study, which is much of its size. Among terms explicitly about children, the top results are almost all resources to use right now.</>}>
        <div className="rs-chart-grid">
          <Bars neutral title="Share of mapped search volume by what people want" sub={`${fmt(d.volume)} estimated monthly searches`} rows={Object.entries(C).map(([label, c]) => ({ label, sub: `${c.keywords} terms, ${fmt(c.volume)} searches`, pct: pctOf(c.volume, d.volume), n: d.volume }))} />
          <Terms title="Top terms about children, families and Sunday school" list={kidTop.slice(0, 10)} />
        </div>
      </Finding>
      <Finding alt="is-alt" num="Finding 2" title="Adults ask how to read it. Almost nobody asks how to teach it." intro={<>Question-style searches cluster around people&rsquo;s own reading: how to start, how long it takes, what order to read in. Within this set, only {teach.length} question-style terms about teaching children the Bible had a measurable volume at all.</>}>
        <div className="rs-chart-grid">
          <Terms title="Top question-style searches" list={howGeneral.slice(0, 10)} />
          <Terms title="Every question-style term about teaching children the Bible" sub="All of them, in this set" list={teach} />
        </div>
      </Finding>
      <Takeaways items={[
        <>If you want to help parents teach the Bible, a ready-to-use lesson or game will be found far more often than advice on how to teach. The method may need to live inside the resource.</>,
        <>&ldquo;How long does it take to read the Bible&rdquo; and &ldquo;in what order&rdquo; are real questions from adults. Many people seem to be trying to start, and a clear reading path may help more than encouragement.</>,
        <>Search cannot tell us which of these resources teach well. Demand is not evidence of effectiveness.</>,
      ]} />
      <Method cards={[
        { h: 'Source', p: <>DataForSEO keyword suggestions with clickstream-based volume for the United States, pulled {d.run_date}. Clickstream is used because Google&rsquo;s advertising tool hides volume for many terms about children.</> },
        { h: 'Selection', p: <>{d.seeds.length} starting topics, including {d.seeds.slice(0, 3).join(', ')}. Only terms with a measured volume are kept. {d.brand_removed} terms naming a specific Bible translation, product or ministry were removed.</> },
        { h: 'Categories', p: <>Assigned by a fixed rule on the words in each term, checked in order, so a term falls into one category only. Terms that fit none count as Other. Audience is &ldquo;children&rdquo; when a term names children, teens, family, homeschool or Sunday school.</> },
        { h: 'Seasonality', p: <>Not reported. The monthly figures in this source looked too smooth to trust for seasonal claims, so we left them out rather than guess.</> },
      ]} />
    </StudyPage>
  )
}
