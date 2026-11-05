import '../../home.css'
import '../../v2-pages.css'
import '../bible-literacy/research.css'
import d from '@/lib/research/easter.json'
import { Bars, CDN, Finding, Honest, Method, StudyPage, Takeaways, fmt, rd, studyMetadata, type Study } from '../ui'

/* Three questions only, and the page says so. Figures from lib/research/easter.json.
   Same players and honesty rules as the literacy study. No em-dashes. */
const third = d.hub.find(q => q.q.includes('third day'))!
const missed = 100 - third.pct

const s: Study = {
  path: '/research/easter-first-look',
  title: 'The Easter Question Players Missed',
  h1: `${rd(missed)}% of Bible Trivia Players Missed the Easter Question`,
  description: `Asked what happened on the third day after Jesus died, ${rd(missed)}% of players on our Bible trivia game answered wrong. A first look before the March edition.`,
  updated: 'November 4, 2026', updatedIso: '2026-11-04', dataLabel: 'Sep 15 to Nov 4, 2026', temporal: '2026-09-15/2026-11-04',
  datasetName: 'Easter Questions, First Look',
  datasetDescription: `Results for the ${d.hub.length} Holy Week and Resurrection questions in the Faithful Kids Bible trivia game. Self-selected players, four-option multiple choice.`,
  measured: ['share of answers correct per question', 'answers per question'],
  art: `${CDN}/blog-images/the-empty-tomb-for-kids-hero.webp?v=3`, artAlt: 'Jesus standing in light at the mouth of the tomb, with people kneeling on the steps',
}
export const metadata = studyMetadata(s)

export default function Page() {
  return (
    <StudyPage s={s}
      lede={<>&ldquo;What happened on the third day after Jesus died on the cross?&rdquo; is on the easiest round of our Bible trivia game, with four options. {rd(third.pct)}% of players chose &ldquo;He rose from the dead&rdquo;. The other {rd(missed)}% chose something else. This is a first look, from the only {d.hub.length} Easter questions in the game so far.</>}
      cap={<><b>{rd(third.pct)}%</b> answered the third-day question correctly ({third.n} answers)</>}
      stats={[
        { value: `${d.hub.length}`, label: 'Easter questions in the game so far' },
        { value: `${rd(third.pct)}%`, label: 'got the third-day question right' },
        { value: `${rd(d.hub_average)}%`, label: 'average across the whole game' },
        { value: fmt(d.hub.reduce((a, q) => a + q.n, 0)), label: 'answers across the three questions' },
      ]}>
      <Honest title="Why this is a first look, not a finding">
        <p>Three questions cannot describe what anyone knows about Easter. We are publishing them because the first result is worth attention, and the full Easter edition of the <a className="rs-link" href="/research/bible-literacy">Bible Literacy Study</a> follows in March 2027.</p>
        <p>Players chose to play Bible trivia on a Christian kids&rsquo; site: parents, teachers, teens and kids. We do not know any player&rsquo;s age, so these are not children&rsquo;s scores or adults&rsquo; scores. The easy round is written for young children, but anyone can choose it. Some players may click quickly or play for fun, which could lower any score.</p>
      </Honest>
      <Finding id="findings" num="The results" title="The Resurrection question holds up better than the details, but not by as much as you might hope" intro={<>The third-day question scored above the game&rsquo;s {rd(d.hub_average)}% average. It is also the central claim of the Christian faith, so we expected far more. The two harder questions fell well below it.</>}>
        <div className="rs-rowgrid">
          <Bars title="Share of players who answered correctly" sub="Four options, so a blind guess scores 25%" rows={[...d.hub].sort((a, b) => b.pct - a.pct).map(q => ({ label: q.q, sub: `${q.answer} (${q.ref}), ${q.n} answers`, pct: q.pct, n: q.n }))} />
        </div>
      </Finding>
      <Takeaways items={[
        <>Do not assume the central story is the secure one. With an audience that came looking for Bible trivia, a third missed it. Worth telling plainly and often, not only at Easter.</>,
        <>A single multiple-choice question cannot say why someone missed it. Hurrying, clicking for fun and real gaps all look the same in this data.</>,
        <>Try it with your family: ask what happened on the third day, then read Matthew 28 together.</>,
      ]} />
      <Method cards={[
        { h: 'What was counted', p: <>Every answer to these {d.hub.length} questions on the game at <a className="rs-link" href="/bible-trivia">faithfulkids.app/bible-trivia</a>, September 15 to November 4, 2026. Four-option multiple choice, options shuffled.</> },
        { h: 'Who the players are', p: <>Self-selected visitors to a Christian children&rsquo;s platform. Not a sample of Americans or Christians, and with no age data, so nothing here compares children with adults.</> },
        { h: 'What is next', p: <>The March 2027 edition uses the full window to date. We would like to add more Holy Week questions to the game first, so that the edition rests on more than three.</> },
      ]} />
    </StudyPage>
  )
}
