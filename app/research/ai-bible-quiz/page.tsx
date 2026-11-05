import '../../home.css'
import '../../v2-pages.css'
import '../bible-literacy/research.css'
import d from '@/lib/research/ai.json'
import lit from '@/lib/research/bible-literacy.json'
import { Bars, CDN, Finding, Honest, Method, StudyPage, Takeaways, fmt, pctOf, rd, studyMetadata, type Study } from '../ui'

/* Figures from lib/research/ai.json. Myth answers were graded by a person
   reading each one; raw answers are in lib/research/ai-myth-answers.json.
   One company's models only: never write "AI assistants in general". No em-dashes. */
const S = d.summary as Record<string, { right: number; n: number }>
const low = Math.min(...d.models.map(m => pctOf(S[m].right, S[m].n)))
const totalN = d.models.reduce((a, m) => a + S[m].n, 0)
type G = { correct: number; partial: number; repeats: number }
const myths = d.myths as unknown as { q: string; truth: string; models: Record<string, G> }[]
const tot = (m: string, k: keyof G) => myths.reduce((a, r) => a + r.models[m][k], 0)
const R = d.reading as Record<string, { grade: number; words: number }>
const gradeLow = Math.min(...d.models.map(m => R[m].grade)), gradeHigh = Math.max(...d.models.map(m => R[m].grade))

const s: Study = {
  path: '/research/ai-bible-quiz',
  title: 'We Gave a Children’s Bible Quiz to AI',
  h1: `We Gave a Children's Bible Quiz to AI. People Average ${rd(lit.hub.pct)}%. The Models Scored ${rd(low)}% or Better.`,
  description: `Three AI models took our Bible quiz and answered common myths for an 8-year-old. Near-perfect scores, and one myth none of them led with correctly.`,
  updated: 'November 4, 2026', updatedIso: '2026-11-04', dataLabel: 'tests run Nov 4, 2026', temporal: '2026-11-04',
  datasetName: 'AI Bible Quiz Test',
  datasetDescription: `${d.models.join(', ')} took the Faithful Kids 100-question Bible quiz ${d.trials} times each with shuffled options, and answered ${myths.length} open questions about common Bible myths ${d.myth_trials} times each, hand graded.`,
  measured: ['multiple-choice accuracy', 'hand-graded accuracy on open questions', 'reading grade level of answers'],
  art: `${CDN}/blog-images/100-bible-trivia-questions-and-answers-hero.webp?v=3`, artAlt: 'Rows of small orange flags across a golden valley rising from an open book',
}
export const metadata = studyMetadata(s)

export default function Page() {
  return (
    <StudyPage s={s}
      lede={<>A family can now ask a chatbot a Bible question as easily as it can ask a pastor. So we gave three OpenAI models the same four-option quiz that people average {rd(lit.hub.pct)}% on. They nearly aced it. Then we asked about common Bible myths in the voice of an 8-year-old. They mostly got those right too, in language pitched several school years too high, and every model led with the same wrong answer on Noah.</>}
      cap={<><b>{fmt(d.models.reduce((a, m) => a + S[m].right, 0))} of {fmt(totalN)}</b> quiz answers correct across three models</>}
      stats={[
        { value: `${rd(lit.hub.pct)}%`, label: 'average for people on the same quiz' },
        { value: `${rd(low)}%+`, label: 'score for every model tested' },
        { value: `${d.models.reduce((a, m) => a + tot(m, 'correct'), 0)} of ${d.models.length * myths.length * d.myth_trials}`, label: 'myth answers graded fully correct' },
        { value: `Grade ${rd(gradeLow)} to ${rd(gradeHigh)}`, label: 'reading level of answers to an 8-year-old' },
      ]}>
      <Honest title="What this does and does not test">
        <p>This covers three models from one company, called directly through its developer service, on one day. The consumer apps may answer differently, models change often, and <strong>we did not test other companies&rsquo; assistants</strong>. So this is not a verdict on AI in general.</p>
        <p>A model is not a person, and the people comparison is not a contest. Models are trained on huge amounts of text that includes the Bible. The study asks what a family gets when it asks, not whether AI &ldquo;knows God&rdquo; or should teach anyone.</p>
      </Honest>
      <Finding id="findings" num="Finding 1" title="On multiple choice, the models are nearly perfect" intro={<>Each model answered all 100 questions {d.trials} times, with the options reshuffled each time. The only misses came from the oldest of the three models. We checked every miss against the verse, and the quiz&rsquo;s answer key held up each time.</>}>
        <div className="rs-rowgrid">
          <Bars title="Share of quiz answers correct" sub="Same questions, same four-option format" rows={[{ label: 'People on our trivia game', sub: `${fmt(lit.hub.answers)} answers`, pct: lit.hub.pct, n: lit.hub.answers }, ...d.models.map(m => ({ label: m, sub: `${S[m].right} of ${S[m].n} answers`, pct: pctOf(S[m].right, S[m].n), n: S[m].n }))]} />
        </div>
      </Finding>
      <Finding alt="is-alt" num="Finding 2" title="Asked in a child's words, one myth beat all of them" intro={<>We asked {myths.length} open questions, each starting &ldquo;I&rsquo;m 8 years old.&rdquo; Each model answered {d.myth_trials} times. A person read and graded all {d.models.length * myths.length * d.myth_trials} answers. Noah is the telling one: every answer led with two of each, and the seven pairs of clean animals in Genesis 7:2 arrived, if at all, as a footnote. That is the same question only {rd(lit.questions.find(q => q.q.includes('clean animal'))!.pct)}% of people got right on our quiz.</>}>
        <div className="rs-table-wrap">
          <table>
            <caption>Grades out of {d.myth_trials} answers per model. Green: states what the text says. Amber: mentions it but leads with or leans on the popular version. Red: repeats the popular version without correcting it.</caption>
            <thead><tr><th scope="col">Question</th><th scope="col">What the text says</th>{d.models.map(m => <th key={m} scope="col">{m}</th>)}</tr></thead>
            <tbody>
              {myths.map(r => (
                <tr key={r.q}><td>{r.q}</td><td>{r.truth}</td>
                  {d.models.map(m => <td key={m} className="num">{r.models[m].correct > 0 && <span className="rs-grade c" aria-label={`${r.models[m].correct} correct`}>{r.models[m].correct}</span>}{r.models[m].partial > 0 && <span className="rs-grade p" aria-label={`${r.models[m].partial} partial`}>{r.models[m].partial}</span>}{r.models[m].repeats > 0 && <span className="rs-grade r" aria-label={`${r.models[m].repeats} repeated the myth`}>{r.models[m].repeats}</span>}</td>)}
                </tr>
              ))}
              <tr><td><strong>Total</strong></td><td />{d.models.map(m => <td key={m} className="num"><span className="rs-grade c">{tot(m, 'correct')}</span>{tot(m, 'partial') > 0 && <span className="rs-grade p">{tot(m, 'partial')}</span>}{tot(m, 'repeats') > 0 && <span className="rs-grade r">{tot(m, 'repeats')}</span>}</td>)}</tr>
            </tbody>
          </table>
        </div>
      </Finding>
      <Finding num="Finding 3" title="Told they were talking to an 8-year-old, they still wrote for a teenager" intro={<>Answers averaged a reading grade of {gradeLow} to {gradeHigh} on a standard readability formula, where an 8-year-old typically reads around grade 3. The formula is rough and counts only word and sentence length, but the gap is wide.</>}>
        <div className="rs-table-wrap">
          <table>
            <caption>Average across {myths.length * d.myth_trials} answers per model.</caption>
            <thead><tr><th scope="col">Model</th><th scope="col" style={{ textAlign: 'right' }}>Reading grade</th><th scope="col" style={{ textAlign: 'right' }}>Words per answer</th></tr></thead>
            <tbody>{d.models.map(m => <tr key={m}><td>{m}</td><td className="num">{R[m].grade}</td><td className="num">{R[m].words}</td></tr>)}</tbody>
          </table>
        </div>
      </Finding>
      <Takeaways items={[
        <>Facts are no longer the scarce part. People average {rd(lit.hub.pct)}% on a quiz a free model nearly aces, and the answers are a question away. That suggests the gap in Bible knowledge is less about access than about whether the stories were ever told and retold.</>,
        <>Check what a chatbot tells your child on anything that sounds familiar. When an answer leads with the popular version, the correction can be easy for a child to miss. Noah here is the example.</>,
        <>Sit with a child when they ask. The reading level alone means an 8-year-old may need a grown-up to put the answer in their own words.</>,
      ]} />
      <Method cards={[
        { h: 'The quiz test', p: <>All 100 questions from <a className="rs-link" href="/bible-trivia">our trivia game</a>, four options, shuffled differently on each of {d.trials} trials, with the instruction to answer with the letter only. Scored automatically against the answer key.</> },
        { h: 'The myth test', p: <>{myths.length} open questions chosen by us because the popular answer differs from the text. Prompts began &ldquo;I&rsquo;m 8 years old.&rdquo; with no other instruction. A person graded each answer on whether it states what the text says.</> },
        { h: 'Limits of the grading', p: <>One grader, who works for Faithful Kids, and a question list we selected, so it is not a neutral sample of what children ask. The grades reflect what the text says, not any tradition&rsquo;s reading of it. Every answer is available on request so the grades can be checked.</> },
        { h: 'Models', p: <>{d.models.join(', ')}, default settings, called through the developer service on {d.run_date}. We plan to add other companies&rsquo; assistants in the next edition.</> },
      ]} />
    </StudyPage>
  )
}
