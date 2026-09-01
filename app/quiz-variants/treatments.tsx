'use client'

import {
  useBuy, PriceBlock, TrustRow, StickyBuy, GETS, LESSON, VideoTile,
  ANNUAL, SAVED, type Answers,
} from './shared'

function Head({ kids }: { kids: string }) {
  return (
    <div className="qv-head">
      <img src="/logo-sm.png" alt="" />
      <span>Faithful Kids</span>
    </div>
  )
}

/* ─────────────────────────── A. Confirm & Buy ───────────────────────────
   The quiz already sold it. This confirms the plan exists, prices it, and
   gets out of the way. Everything else is one tap away, not one scroll. */
export function VariantA({ answers }: { answers: Answers }) {
  const { plan, choose, loading, buy } = useBuy('quiz-a')
  const kids = answers.num_kids === '1' ? 'your child' : 'your kids'
  const age = answers.age || '6-7'
  const denom = answers.denomination === 'catholic' ? 'Catholic' : answers.denomination === 'evangelical' ? 'Evangelical' : 'Christian'

  return (
    <div className="qv qv-a">
      <Head kids={kids} />
      <div className="qv-wrap">
        <div className="qv-badge">{'✨'} Your plan is ready</div>
        <h1>A Bible plan built for<br /><span className="qv-green">ages {age}</span></h1>
        <p className="qv-sub">
          {denom} path, {kids === 'your child' ? 'one profile' : 'a profile each'}, and 300+ short
          lessons in order from Genesis to Revelation.
        </p>

        <PriceBlock plan={plan} choose={choose} loading={loading} onBuy={() => buy(answers)} />
        <TrustRow />

        <details className="qv-more">
          <summary>What&rsquo;s included</summary>
          <ul>{GETS(age, denom).map(g => <li key={g}><span className="cv-tick">{'✓'}</span>{g}</li>)}</ul>
        </details>

        <p className="qv-signin">Already a member? <a href="https://app.faithfulkids.app/login">Sign in</a></p>
      </div>
      <StickyBuy plan={plan} loading={loading} onBuy={() => buy(answers)} />
    </div>
  )
}

/* ─────────────────────────── B. The Plan ────────────────────────────────
   Reads their own answers back as a spec.

   The two quiz paths share exactly ONE question (age). A parent is asked
   num_kids and denomination; a kid is asked hero and adventure and neither of
   the other two. So every row is conditional on the answer existing — the
   live page defaults a kid's family to "your kids" on a "Christian" path,
   which is inventing an answer to a question nobody was asked.

   The kid path also has to hand over to a parent partway down: the child
   picked the stories, but only an adult can pay. */

const HEROES: Record<string, string> = {
  david: 'David', noah: 'Noah', esther: 'Esther', daniel: 'Daniel', peter: 'Peter',
}
const ADVENTURES: Record<string, string> = {
  daniel: 'The Lions\u2019 Den with Daniel',
  noah: 'The Great Flood with Noah',
  water: 'Walking on Water',
  creation: 'The Very First Day of the World',
}

/* Every new account unlocks the same two series — DEFAULT_UNLOCKED_SERIES in
   bible-kids/src/types/index.ts is ['genesis', 'birth-of-jesus']. Nothing the
   quiz collects changes that, and it could not: the quiz runs on
   faithfulkids.app and the app on app.faithfulkids.app, so its answers never
   cross the origin. They reach PostHog and stop there.

   So a chosen hero does not reorder anything and a chosen adventure is not
   where anyone begins. Say what is actually true instead: you start at
   Genesis, and the story they picked is in there waiting. */
const START_SERIES = 'Genesis — In the Beginning'
const IS_UNLOCKED_AT_START = (a?: string) => a === 'creation' 

type Row = { k: string; v: string; d: string }

export function VariantB({ answers, isKid = false }: { answers: Answers; isKid?: boolean }) {
  const { plan, choose, loading, buy } = useBuy(isKid ? 'quiz-b-kid' : 'quiz-b')

  const age = answers.age
  const denom = answers.denomination === 'catholic' ? 'Catholic'
    : answers.denomination === 'evangelical' ? 'Evangelical'
    : answers.denomination ? 'Non-denominational' : null
  const nKids = answers.num_kids
  const hero = HEROES[answers.hero]
  const adventure = ADVENTURES[answers.adventure]

  /* Only rows we actually have an answer for. Nothing is defaulted. */
  const rows: Row[] = []
  if (age) rows.push({ k: 'Ages', v: age, d: 'You set each child\u2019s age at setup and the stories match it' })
  if (isKid) rows.push({ k: 'Starts at', v: START_SERIES, d: 'Everyone begins at the beginning, then unlocks the next series' })
  if (adventure) rows.push({
    k: 'Picked', v: adventure,
    d: IS_UNLOCKED_AT_START(answers.adventure)
      ? 'Unlocked from day one \u2014 it is in the first series'
      : 'Waiting in the library \u2014 unlocked as they work through the story',
  })
  if (hero) rows.push({ k: 'Favourite', v: hero, d: `${hero}\u2019s stories are in the library` })
  if (denom) rows.push({ k: 'Path', v: denom, d: 'You pick this at setup and can change it any time' })
  if (nKids) rows.push({ k: 'Profiles', v: nKids === '1' ? '1 profile' : `${nKids} profiles`, d: 'Separate progress for each child, up to five' })
  rows.push({ k: 'Each lesson', v: 'About 2 min', d: 'Then a comprehension quiz and one reflection question' })
  rows.push({ k: 'The library', v: '300+ lessons', d: '31 series, Genesis to Revelation, in order' })

  const who = nKids ? (nKids === '1' ? 'Your child\u2019s' : 'Your family\u2019s') : 'Your'

  /* A one-liner of what they built, so the personalisation lands before the
     price without spending five rows and the whole fold on it. */
  const summary = [
    age ? `ages ${age}` : null,
    denom ? `${denom} path` : null,
    nKids ? (nKids === '1' ? '1 profile' : `${nKids} profiles`) : null,
    hero ? `${hero}\u2019s stories` : null,
  ].filter(Boolean).join(' \u00b7 ')

  return (
    <div className="qv qv-b">
      <Head kids="" />
      <div className="qv-wrap">
        <div className="qv-badge">{isKid ? '\u{1F389} You built it!' : '\u2728 Your plan is ready'}</div>
        <h1>{isKid ? 'Your Bible adventure' : `${who} Bible plan`}</h1>

        {/* Price first. Only four people in ninety days ever touched a plan
            selector while thirty-seven tapped the CTA — the spec is
            reassurance, not the decision, so it must not own the fold.

            The kid path is the exception: its first reader is a child, and
            the handover has to happen before any price appears. */}
        {isKid ? (
          <>
            <div className="qv-handoff">
              <div className="qv-handoff-emoji">{'\u{1F44B}'}</div>
              <strong>Now go grab a grown-up!</strong>
              <p>Tell them: <em>&ldquo;I built a Bible adventure and I want to try it.&rdquo;</em> Then hand them the phone.</p>
            </div>
            <p className="qv-parent-note">
              <strong>For the grown-up:</strong> your child just built this themselves.
              Every lesson is a short narrated video with a comprehension quiz after it, so you
              can see what they understood. They begin at Genesis{adventure ? `, and ${adventure} is in there waiting` : ''}.
            </p>
          </>
        ) : (
          summary && <p className="qv-summary">{summary}</p>
        )}

        <PriceBlock plan={plan} choose={choose} loading={loading} onBuy={() => buy(answers)} />
        <TrustRow />

        <h2 className="qv-spec-title">{isKid ? 'What you built' : 'Built from your answers'}</h2>
        <div className="qv-spec">
          {rows.map(r => (
            <div className="qv-spec-row" key={r.k}>
              <div className="qv-spec-k">{r.k}</div>
              <div className="qv-spec-body">
                <strong>{r.v}</strong>
                <span>{r.d}</span>
              </div>
            </div>
          ))}
        </div>

        <p className="qv-signin">Already a member? <a href="https://app.faithfulkids.app/login">Sign in</a></p>
      </div>
      <StickyBuy plan={plan} loading={loading} onBuy={() => buy(answers)} />
    </div>
  )
}

/* ─────────────────────────── C. See It First ────────────────────────────
   They have answered eight questions about their child and still never seen
   a lesson. Uses the site's one video pattern, so nothing downloads until
   the button is pressed. */
export function VariantC({ answers }: { answers: Answers }) {
  const { plan, choose, loading, buy } = useBuy('quiz-c')
  const kids = answers.num_kids === '1' ? 'your child' : 'your kids'
  const age = answers.age || '6-7'
  const denom = answers.denomination === 'catholic' ? 'Catholic' : answers.denomination === 'evangelical' ? 'Evangelical' : 'Christian'

  return (
    <div className="qv qv-c">
      <Head kids={kids} />
      <div className="qv-wrap">
        <div className="qv-badge">{'✨'} Your plan is ready</div>
        <h1>This is what {kids} would watch</h1>
        <p className="qv-sub">One real lesson, start to finish. No signup, no email.</p>

        <VideoTile
          src={LESSON.src}
          poster={LESSON.poster}
          title={LESSON.title}
          badge={LESSON.badge}
          blurb={LESSON.blurb}
          location="quiz-result-c"
          ctaHref="#plan"
          ctaLabel="Start my 3 free days"
        />
        <p className="qv-vidnote">
          One of <strong>310</strong>, matched to ages {age} on the {denom} path. Every one ends
          with a quiz so you see what landed.
        </p>

        <div id="plan" />
        <PriceBlock plan={plan} choose={choose} loading={loading} onBuy={() => buy(answers)} />
        <TrustRow />

        <details className="qv-more">
          <summary>What&rsquo;s included</summary>
          <ul>{GETS(age, denom).map(g => <li key={g}><span className="cv-tick">{'✓'}</span>{g}</li>)}</ul>
        </details>

        <p className="qv-signin">Already a member? <a href="https://app.faithfulkids.app/login">Sign in</a></p>
      </div>
      <StickyBuy plan={plan} loading={loading} onBuy={() => buy(answers)} />
    </div>
  )
}

/* Real answer shapes: a parent is never asked hero/adventure, a kid is never
   asked num_kids/denomination. */
export const SAMPLE: Answers = {
  num_kids: '2', age: '6-7', screen_time: '2-4hr', pain: 'too_much',
  denomination: 'evangelical', faith: 'weekly', goal: 'knowledge',
}
export const SAMPLE_KID: Answers = {
  age: '6-7', hero: 'daniel', adventure: 'daniel', fun: 'quiz', watch: '2-4hr', excited: 'yes',
}
