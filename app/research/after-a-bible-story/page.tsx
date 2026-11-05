import '../../home.css'
import '../../v2-pages.css'
import '../bible-literacy/research.css'
import d from '@/lib/research/children.json'
import { Bars, CDN, Finding, Honest, Method, StudyPage, Takeaways, fmt, pctOf, rd, studyMetadata, type Study } from '../ui'

/* Children's data. Aggregate only: every age group holds at least 10 children,
   and free-text notes never leave the database (the build script keeps only
   the fixed tap-card labels). Figures from lib/research/children.json. No em-dashes. */
const score = d.score as Record<string, number>
const perfect = pctOf(score['3'] ?? 0, d.quizzes)
const feel = d.feelings as Record<string, number>
const feelTotal = Object.values(feel).reduce((a, b) => a + b, 0)
const resp = d.responses as Record<string, number>
const respTotal = Object.values(resp).reduce((a, b) => a + b, 0)
const age = d.by_age as Record<string, { kids: number; lessons: number; quizzes: number; perfect: number }>
const depth = d.depth as Record<string, number>
const AGE_LABEL: Record<string, string> = { '4-6': 'Ages 4 to 6', '7-9': 'Ages 7 to 9', '10-12': 'Ages 10 to 12' }

const s: Study = {
  path: '/research/after-a-bible-story',
  title: 'What Children Do After a Bible Story',
  h1: 'What Children Do After a Two-Minute Bible Story: An Early Look',
  description: `${fmt(d.quizzes)} lesson quizzes and ${fmt(d.reflections)} reflections from ${fmt(d.kids)} children in the Faithful Kids app. A small early sample, reported in aggregate.`,
  updated: 'November 4, 2026', updatedIso: '2026-11-04', dataLabel: 'all lessons to Nov 4, 2026', temporal: '../2026-11-04',
  datasetName: 'After a Bible Story, Early Look',
  datasetDescription: `Aggregate quiz scores and tap-card reflections from ${fmt(d.kids)} children in ${fmt(d.family_n)} paying families in the Faithful Kids app. No individual child is identifiable.`,
  measured: ['lesson quiz completion', 'quiz score', 'reflection completion', 'feelings chosen after a lesson'],
  art: `${CDN}/blog-images/birthday-bible-verses-for-kids-hero.webp?v=3`, artAlt: 'A group of children smiling around an open Bible',
}
export const metadata = studyMetadata(s)

export default function Page() {
  return (
    <StudyPage s={s}
      lede={<>Every lesson in our app ends with a short quiz and a reflection, where a child taps how the story made them feel. Almost every watched lesson went on to both: {rd(pctOf(d.quizzes, d.lessons))}% took the quiz and {rd(pctOf(d.reflections, d.lessons))}% finished the reflection. This is an early look at {fmt(d.kids)} children, and it is too small to prove much.</>}
      cap={<><b>{rd(pctOf(d.reflections, d.lessons))}%</b> of lessons ended with a finished reflection ({fmt(d.lessons)} lessons)</>}
      stats={[
        { value: fmt(d.kids), label: `children in ${fmt(d.family_n)} families` },
        { value: fmt(d.lessons), label: 'lessons watched' },
        { value: `${rd(pctOf(d.quizzes, d.lessons))}%`, label: 'of lessons went on to the quiz' },
        { value: `${rd(perfect)}%`, label: 'of quizzes ended on a full score, retries allowed' },
      ]}>
      <Honest title="Read this before quoting anything here">
        <p><strong>This is not yet a test of memory.</strong> A child can retry a quiz for more stars, and the quiz comes straight after the video. A high score here shows a child finished the quiz and could get the answers, possibly on a later try. It does not show what they will remember next week. We said we would wait for 1,000 quizzes before drawing conclusions, and that still stands: this is {fmt(d.quizzes)}.</p>
        <p>These are children of families who pay for a Bible app and chose to use it. Most lessons so far come from the first series, Genesis, because that is where children start.</p>
      </Honest>
      <Finding id="findings" num="Finding 1" title="Children who watch a lesson tend to do the quiz and reflection too" intro={<>Once a lesson was watched, the quiz and the reflection that follow it were rarely skipped. That says the three-step shape holds attention in this small group. It does not tell us how many children never opened a lesson at all.</>}>
        <div className="rs-chart-grid">
          <Bars title="Share of watched lessons that went on to each step" sub={`${fmt(d.lessons)} lessons`} rows={[{ label: 'Took the quiz', pct: pctOf(d.quizzes, d.lessons), n: d.lessons }, { label: 'Finished the reflection', pct: pctOf(d.reflections, d.lessons), n: d.lessons }]} />
          <Bars neutral title="Lessons per child so far" sub={`${fmt(d.kids)} children`} rows={Object.entries(depth).map(([k, v]) => ({ label: `${k} lesson${k === '1' ? '' : 's'}`, sub: `${v} children`, pct: pctOf(v, d.kids), n: d.kids }))} />
        </div>
      </Finding>
      <Finding alt="is-alt" num="Finding 2" title="Full scores are common, and they mean less than they seem to" intro={<>{rd(perfect)}% of quizzes ended on a full three out of three. With retries allowed and the video seconds old, we read that as a sign the quizzes are within reach, including for the youngest group, rather than as evidence of learning.</>}>
        <div className="rs-chart-grid">
          <Bars title="Share of quizzes ending on a full score, by age" sub="Age groups with at least 10 children only" rows={Object.entries(age).sort().map(([k, v]) => ({ label: AGE_LABEL[k] ?? k, sub: `${v.kids} children, ${v.quizzes} quizzes`, pct: pctOf(v.perfect, v.quizzes), n: v.quizzes }))} />
          <Bars neutral title="Final quiz score" sub={`${fmt(d.quizzes)} quizzes`} rows={['3', '2', '1', '0'].map(k => ({ label: `${k} out of 3`, sub: `${score[k] ?? 0} quizzes`, pct: pctOf(score[k] ?? 0, d.quizzes), n: d.quizzes }))} />
        </div>
      </Finding>
      <Finding num="Finding 3" title="What children say they feel afterward" intro={<>After each lesson a child can tap feelings from a set list. Thankful, peaceful, brave and loved came up most. &ldquo;Confused&rdquo; was the least chosen, at {rd(pctOf(feel.Confused, feelTotal))}% of taps. &ldquo;I need to think about this more&rdquo; was the second most chosen response, which is a good sign for a story meant to stay with someone.</>}>
        <div className="rs-chart-grid">
          <Bars neutral title="Feelings tapped after a lesson" sub={`${fmt(feelTotal)} taps; a child can choose more than one`} rows={Object.entries(feel).map(([label, v]) => ({ label, pct: pctOf(v, feelTotal), n: feelTotal }))} />
          <Bars neutral title="Response chosen after a lesson" sub={`${fmt(respTotal)} responses`} rows={Object.entries(resp).map(([label, v]) => ({ label, pct: pctOf(v, respTotal), n: respTotal }))} />
        </div>
      </Finding>
      <Takeaways items={[
        <>A short story followed by a small task and a moment to respond seems to hold children through to the end in this group. That is a reasonable shape to try at home: tell the story, ask a question or two, then ask how it made them feel.</>,
        <>These numbers cannot say whether the shape helps a child remember. To test that we would need to log each child&rsquo;s first try separately and ask again days later. That is the next version of this study.</>,
        <>The choices a child can tap were written by us and lean positive, so the feelings chart shows relative pull between those options, not a free description of how children feel.</>,
      ]} />
      <Method cards={[
        { h: 'What was counted', p: <>Lesson records in the Faithful Kids app: watched, quiz completed, final score and reflection completed. {fmt(d.lessons)} lessons from {fmt(d.kids)} children. This includes the iOS and Android apps.</> },
        { h: 'Who was removed', p: <>Only families verified as paying through Stripe ({d.families.stripe}) or an app store ({d.families.app_store}) are included. Families on gifted or free accounts ({d.families.other_excluded}) and our own test or review accounts ({d.families.test_excluded}) are excluded.</> },
        { h: 'Children’s privacy', p: <>Reported only in aggregate. Any age group or series with fewer than 10 children is left out, which removes the older age groups and every series after Genesis for now. Notes children type are private: they are not read, counted or published here.</> },
        { h: 'Data sharing', p: <>Unlike our other studies, no child-level data is available on request, to anyone. Only the totals on this page are published.</> },
      ]} />
    </StudyPage>
  )
}
