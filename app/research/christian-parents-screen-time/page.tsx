import '../../home.css'
import '../../v2-pages.css'
import '../bible-literacy/research.css'
import d from '@/lib/research/parents.json'
import { Bars, CDN, Finding, Honest, Method, StudyPage, Takeaways, fmt, pctOf, rd, studyMetadata, type Study } from '../ui'

/* Every figure comes from lib/research/parents.json (build-research-data.py parents).
   Self-reported answers from a sales-funnel quiz: say so wherever it matters. No em-dashes. */
type Tally = Record<string, number>
const Q = d.questions as unknown as Record<string, { n: number; answers: Tally }>
const share = (q: string, a: string) => pctOf(Q[q].answers[a] ?? 0, Q[q].n)
const rows = (q: string, labels: Record<string, string>) => Object.entries(labels).map(([k, label]) => ({ label, pct: share(q, k), n: Q[q].n }))
const X = d.cross as unknown as Record<string, Record<string, Tally>>
const sum = (t: Tally) => Object.values(t).reduce((a, b) => a + b, 0)
const cell = (c: string, a: string, b: string) => pctOf(X[c][a][b] ?? 0, sum(X[c][a]))

const SCREEN = { '<1hr': 'Under 1 hour', '1-2hr': '1 to 2 hours', '2-4hr': '2 to 4 hours', '4hr+': '4 hours or more' }
const AGES = { '4-5': '4 to 5', '6-7': '6 to 7', '8-9': '8 to 9', '10-12': '10 to 12', '13+': '13 and over' }
const under = share('screen_time', '<1hr')

const s: Study = {
  path: '/research/christian-parents-screen-time',
  title: 'What Christian Parents Say About Screen Time',
  h1: `We Asked Christian Parents About Screen Time. ${rd(under)}% Said Under an Hour.`,
  description: `${fmt(Q.screen_time.n)} parents on a Christian kids' site told us their children's daily screen time and biggest frustration. Self-reported answers, shown exactly as asked.`,
  updated: 'November 4, 2026', updatedIso: '2026-11-04', dataLabel: 'Aug 15 to Nov 4, 2026', temporal: '2026-08-15/2026-11-04',
  datasetName: 'Christian Parent Questionnaire',
  datasetDescription: `Answers from ${fmt(d.parents_any)} people who identified as parents in the Faithful Kids onboarding quiz, one latest answer per person per question. Self-selected and self-reported; not a probability sample.`,
  measured: ['daily screen time', "youngest child's age", 'number of children', 'biggest screen time frustration', 'what success looks like', 'faith tradition'],
  art: `${CDN}/blog-images/christmas-family-devotions-hero.webp?v=3`, artAlt: 'A mother and father on a sofa reading a large Bible with their two children',
}
export const metadata = studyMetadata(s)

export default function Page() {
  return (
    <StudyPage s={s}
      lede={<>Parents starting our quiz answer a few quick questions about their family. {fmt(Q.screen_time.n)} told us their children&rsquo;s daily screen time, and most reported less of it than you might expect. The older the youngest child, the more that changes: {rd(cell('age_screen', '13+', '4hr+'))}% of parents whose youngest is a teen reported four hours or more, against {rd(cell('age_screen', '4-5', '4hr+'))}% of those whose youngest is 4 or 5.</>}
      cap={<><b>{rd(under)}%</b> reported under an hour a day ({fmt(Q.screen_time.n)} parents)</>}
      stats={[
        { value: fmt(d.parents_any), label: 'parents answered at least one question' },
        { value: `${rd(under)}%`, label: 'report under an hour of screens a day' },
        { value: `${rd(share('num_kids', '4+'))}%`, label: 'say they have four or more children' },
        { value: `${rd(share('faith', 'central') + share('faith', 'very'))}%`, label: 'call faith central or very important at home' },
      ]}>
      <Honest title="Who these parents are, and are not">
        <p>Everyone here chose to start a quiz on a Christian kids&rsquo; site, and that quiz leads to a paid product. They are not a sample of Christian parents in general, and they are likely more faith-minded than most. Answers are self-reported, and parents often understate screen time, so treat the low figures as what parents say rather than what a meter would record.</p>
        <p>The quiz asks about the <em>youngest</em> child, so a family with a teen and a toddler counts under the toddler. The frustration and success questions offer four fixed choices that we wrote. Fewer people reach the later questions, so each chart shows its own count.</p>
      </Honest>
      <Finding id="findings" num="Finding 1" title="Most of these parents report modest screen time" intro={<>The question was &ldquo;Daily screen time?&rdquo; with four choices. Together, under an hour and one to two hours make up {rd(share('screen_time', '<1hr') + share('screen_time', '1-2hr'))}% of answers.</>}>
        <div className="rs-chart-grid">
          <Bars neutral title="Daily screen time" sub={`${fmt(Q.screen_time.n)} parents`} rows={rows('screen_time', SCREEN)} />
          <Bars neutral title="Reporting four hours or more, by age of youngest child" sub="Share of parents in each age group" rows={Object.entries(AGES).map(([k, label]) => ({ label, sub: `${fmt(sum(X.age_screen[k]))} parents`, pct: cell('age_screen', k, '4hr+'), n: sum(X.age_screen[k]) }))} />
        </div>
      </Finding>
      <Finding alt="is-alt" num="Finding 2" title="What frustrates parents changes with the hours" intro={<>Overall the three main frustrations are nearly tied. Split by reported screen time they separate: parents under an hour most often said &ldquo;They learn nothing&rdquo; ({rd(cell('screen_pain', '<1hr', 'no_value'))}%), and parents at four hours or more most often said &ldquo;Way too many hours&rdquo; ({rd(cell('screen_pain', '4hr+', 'too_much'))}%).</>}>
        <div className="rs-chart-grid">
          <Bars neutral title="Biggest screen time frustration" sub={`${fmt(Q.pain.n)} parents`} rows={rows('pain', { no_value: 'They learn nothing', bad_content: 'Inappropriate content', too_much: 'Way too many hours', guilt: 'I feel guilty about it' })} />
          <Bars neutral title="Saying &ldquo;They learn nothing&rdquo;, by reported screen time" sub="Share of parents in each group" rows={Object.entries(SCREEN).map(([k, label]) => ({ label, sub: `${fmt(sum(X.screen_pain[k]))} parents`, pct: cell('screen_pain', k, 'no_value'), n: sum(X.screen_pain[k]) }))} />
        </div>
      </Finding>
      <Finding num="Finding 3" title="What they watch, and what success looks like" intro={<>YouTube is the most common answer by a wide margin, named by {rd(pctOf(Q.content.answers.youtube, Q.content.n))}% of parents who answered. Asked what success looks like, only {rd(share('goal', 'replace'))}% chose replacing junk screen time on its own. Most wanted Bible knowledge, real faith, or all of it.</>}>
        <div className="rs-chart-grid">
          <Bars neutral title="What do they usually watch?" sub={`${fmt(Q.content.n)} parents; choose as many as apply, so shares add up to more than 100%`} rows={Object.entries({ youtube: 'YouTube', other: 'Other', games: 'Games', disney: 'Disney+', netflix: 'Netflix', tiktok: 'TikTok' }).map(([k, label]) => ({ label, pct: pctOf(Q.content.answers[k] ?? 0, Q.content.n), n: Q.content.n }))} />
          <Bars neutral title="What does success look like?" sub={`${fmt(Q.goal.n)} parents`} rows={rows('goal', { all: 'All of the above', faith: 'Build real faith early', knowledge: 'My kid knows the Bible', replace: 'Replace junk screen time' })} />
        </div>
      </Finding>
      <Finding alt="is-alt" num="Finding 4" title="Who answered" intro="The families behind the figures above. Reported to describe the sample, not to compare one tradition with another.">
        <div className="rs-chart-grid">
          <Bars neutral title="Age of youngest child" sub={`${fmt(Q.age.n)} parents`} rows={rows('age', AGES)} />
          <Bars neutral title="Number of children" sub={`${fmt(Q.num_kids.n)} parents`} rows={rows('num_kids', { '1': '1 child', '2': '2 children', '3': '3 children', '4+': '4 or more' })} />
          <Bars neutral title="How central is faith in your home?" sub={`${fmt(Q.faith.n)} parents`} rows={rows('faith', { central: 'Everything revolves around it', very: 'Very important to us', somewhat: 'We’re working on it', exploring: 'Just starting out' })} />
          <Bars neutral title="Your faith tradition?" sub={`${fmt(Q.denomination.n)} parents; four fixed choices`} rows={rows('denomination', { evangelical: 'Evangelical', nondenominational: 'Non-denominational', exploring: 'Exploring', catholic: 'Catholic' })} />
        </div>
      </Finding>
      <Takeaways items={[
        <>For many of these parents the concern is not only hours. A family reporting under an hour a day still most often says the time teaches nothing, which points at what is on the screen rather than how long it is on.</>,
        <>The screen time jump shows up at the teen years in this data. It is a snapshot of different families, not the same children followed over time, so it cannot show that any one child&rsquo;s use rises with age.</>,
        <>Nothing here shows that any teaching method works. It describes what these parents say they want, which is more than a screen time swap.</>,
      ]} />
      <Method cards={[
        { h: 'What was counted', p: <>Answers to the Faithful Kids onboarding quiz from August 15 to November 4, 2026, from people who chose the parent path. One latest answer per person per question. The start date is when our analytics began counting this quiz reliably.</> },
        { h: 'What was removed', p: <>People who arrived from paid ads ({fmt(d.ad_people_excluded)} among parents), because some early ad traffic was low quality. Children using the separate kid path are not included. Children&rsquo;s names, which the quiz can ask for, are not part of this study.</> },
        { h: 'Question wording', p: <>Chart labels are the exact questions and answer choices. &ldquo;What do they usually watch?&rdquo; identifies parents by their path answer because that question was not tagged the same way earlier on, so its count is lower.</> },
        { h: 'What it cannot show', p: <>Self-reported, self-selected and collected in a quiz that leads to a purchase. No figure here describes Christian parents as a whole, and we do not compare traditions against each other.</> },
      ]} />
    </StudyPage>
  )
}
