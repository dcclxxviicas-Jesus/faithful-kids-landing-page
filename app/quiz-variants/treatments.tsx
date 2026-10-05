'use client'

import { useEffect } from 'react'
import posthog from 'posthog-js'
import { STORIES } from '../components/stories'
import {
  useBuy, PriceBlock, TrustRow, StickyBuy, useStickyAfter, GETS, LESSON, VideoTile,
  Stats, Testimonials, PainPoint,
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
  const { ref: ctaRef, past } = useStickyAfter<HTMLButtonElement>()
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

        <PriceBlock plan={plan} choose={choose} loading={loading} onBuy={() => buy(answers)} ctaRef={ctaRef} />
        <TrustRow />

        <details className="qv-more">
          <summary>What&rsquo;s included</summary>
          <ul>{GETS(age, denom).map(g => <li key={g}><span className="cv-tick">{'✓'}</span>{g}</li>)}</ul>
        </details>

        <p className="qv-signin">Already a member? <a href="https://app.faithfulkids.app/login">Sign in</a></p>
      </div>
      <StickyBuy plan={plan} loading={loading} onBuy={() => buy(answers)} show={past} />
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

/* Week one: the first five episodes of the Genesis series, which IS where
   every new account starts (DEFAULT_UNLOCKED_SERIES). Titles and slugs come
   from bible-kids/src/data/all-series.ts; every poster was HEAD-verified on
   the CDN before this shipped (eps 2, 3 and 5 had none — they were extracted
   from the lesson videos, frame-scored on brightness + detail, never t=0).
   Day 1 is PLAYABLE — the one thing no quiz-funnel benchmark can copy: the
   product is a two-minute video, so the plan can prove itself on the spot. */
const CDN = 'https://d3g07v1w0lehiv.cloudfront.net'
const WEEK_ONE = [
  { day: 1, title: 'In the Beginning: Creation', slug: 'in-the-beginning-creation' },
  { day: 2, title: 'The Garden and the Fall', slug: 'the-garden-and-the-fall' },
  { day: 3, title: 'Cain and Abel', slug: 'cain-and-abel' },
  { day: 4, title: 'Noah and the Great Flood', slug: 'noah-and-the-great-flood' },
  { day: 5, title: 'The Tower of Babel', slug: 'the-tower-of-babel' },
]

/* The Creation lesson, playable. Resolved by TITLE from stories.ts — never
   by index (CLAUDE.md records the incident). */
const DAY_ONE = { ...WEEK_ONE[0], videoTitle: 'In the Beginning: Creation' }

const GOAL_ECHO: Record<string, string> = {
  christmas: 'ready to be a habit by Christmas',
  'school-year': 'ready to be a habit this school year',
  '30-days': 'ready to be a habit in 30 days',
  whenever: 'paced to stick, no pressure',
}

/* Swap math from their own screen-time answer — same hour mapping the
   mid-quiz interstitial uses, so the two screens never disagree. */
const HOURS: Record<string, number> = { '<1hr': 1, '1-2hr': 1.5, '2-4hr': 3, '4hr+': 5 }

type Row = { k: string; v: string; d: string }

/* VariantB, rebuilt Oct 5 2026 as the PLAN REVEAL.

   The old shape was price-first: a one-line summary, then the plan selector.
   That decision was made against a spec TABLE — and under it, 140 quiz
   completions in 14 days produced 6 checkout clicks (4%) and 2 sales.
   Noom/Cal AI convert 10-25% of completers by making the screen the DELIVERY
   of the thing the quiz built. So: the week-one plan first (with Day 1
   actually playable), the price after it, framed as starting that plan. */
export function VariantB({ answers, isKid = false }: { answers: Answers; isKid?: boolean }) {
  const { plan, choose, loading, buy } = useBuy(isKid ? 'quiz-b-kid' : 'quiz-b', { path: isKid ? 'kid' : 'parent' })
  const { ref: ctaRef, past } = useStickyAfter<HTMLButtonElement>()

  const name = answers.child_name || ''
  const age = answers.age
  const nKids = answers.num_kids
  const hero = HEROES[answers.hero]
  const adventure = ADVENTURES[answers.adventure]
  const goalEcho = GOAL_ECHO[answers.goal_date]
  const hrs = HOURS[answers.screen_time || answers.watch]

  useEffect(() => {
    try {
      posthog.capture('plan_revealed', {
        path: isKid ? 'kid' : 'parent',
        child_name: name ? 'provided' : 'skipped',
        goal_date: answers.goal_date || null,
        variant: 'reveal',
      })
    } catch { /* never block */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* Only rows we actually have an answer for. Nothing is defaulted.
     The old "Path: Catholic — you pick this at setup" row is GONE: there is
     no denomination setting in the app, so that was a false feature claim
     (same one scrubbed from /beliefs and the checkout page). The honest
     denominations fact is the Families row. */
  const rows: Row[] = []
  if (age) rows.push({ k: 'Ages', v: age, d: 'You set each child’s age at setup and the stories match it' })
  if (isKid) rows.push({ k: 'Starts at', v: START_SERIES, d: 'Everyone begins at the beginning, then unlocks the next series' })
  if (adventure) rows.push({
    k: 'Picked', v: adventure,
    d: IS_UNLOCKED_AT_START(answers.adventure)
      ? 'Unlocked from day one — it is in the first series'
      : 'Waiting in the library — unlocked as they work through the story',
  })
  if (hero) rows.push({ k: 'Favourite', v: hero, d: `${hero}’s stories are in the library` })
  if (nKids) rows.push({ k: 'Profiles', v: nKids === '1' ? '1 profile' : `${nKids} profiles`, d: 'Separate progress for each child, up to five' })
  rows.push({ k: 'Families', v: 'All traditions', d: 'Used by Catholic, Evangelical and Non-denominational families' })
  rows.push({ k: 'Each lesson', v: 'About 2 min', d: 'Then a comprehension quiz and one reflection question' })
  rows.push({ k: 'The library', v: '300+ lessons', d: '31 series, Genesis to Revelation, in order' })

  const possessive = name ? `${name}’s` : (nKids && nKids !== '1' ? 'Your family’s' : 'Your child’s')

  return (
    <div className="qv qv-b">
      <Head kids="" />
      <div className="qv-wrap">
        <div className="qv-badge">{isKid ? '\u{1F389} You built it!' : `✨ ${possessive} plan is ready`}</div>
        <h1>{isKid ? `${name ? `${name}’s` : 'Your'} Bible adventure` : `${possessive} Bible plan`}</h1>
        {goalEcho && <p className="qv-goal">{goalEcho.charAt(0).toUpperCase() + goalEcho.slice(1)}</p>}

        {/* The kid path hands over to a parent BEFORE anything priced. */}
        {isKid && (
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
        )}

        <WeekOne name={name} isKid={isKid} />
        <SwapMath hrs={hrs} name={name} />
        <Milestones name={name} />

        <h2 className="qv-spec-title" id="plan">{name ? `Start ${name}’s plan` : 'Start the plan'}</h2>
        <PriceBlock plan={plan} choose={choose} loading={loading} onBuy={() => buy(answers)} ctaRef={ctaRef} />
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

        <Stats />
        {!isKid && <PainPoint pain={answers.pain} />}
        <Testimonials />

        <p className="qv-signin">Already a member? <a href="https://app.faithfulkids.app/login">Sign in</a></p>
      </div>
      <StickyBuy plan={plan} loading={loading} onBuy={() => buy(answers)} show={past} />
    </div>
  )
}

/* ── The week-one strip: five real episodes, Day 1 playable ─────────────── */
function WeekOne({ name, isKid }: { name: string; isKid: boolean }) {
  const creation = STORIES.find(s => s.title === DAY_ONE.videoTitle)
  return (
    <div className="qv-week">
      <h2 className="qv-spec-title">{name ? `${name}’s first week` : 'The first week'}</h2>
      <p className="qv-week-sub">
        Five episodes, about two minutes each, every one ending in a quiz.
        {isKid ? ' Day one is ready right now:' : ' Day one is ready to watch right now:'}
      </p>

      {creation && (
        <VideoTile
          src={creation.src}
          poster={creation.poster}
          title={creation.title}
          badge={'Day 1 · Watch free now'}
          blurb={'The very first episode of the plan — start to finish, no email, no signup.'}
          location="quiz-plan-day1"
          ctaHref="#plan"
          ctaLabel={'See the full plan ↓'}
        />
      )}

      <div className="qv-week-grid">
        {WEEK_ONE.slice(1).map(e => (
          <div className="qv-week-card" key={e.slug}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${CDN}/video-posters/sm/${e.slug}.webp`} alt={e.title} loading="lazy" width={640} height={360} />
            <span className="qv-week-day">Day {e.day}</span>
            <strong>{e.title}</strong>
            <small>2 min + quiz</small>
          </div>
        ))}
      </div>
    </div>
  )
}

function SwapMath({ hrs, name }: { hrs?: number; name: string }) {
  if (!hrs) return null
  return (
    <p className="qv-swap">
      You said about <strong>{hrs === 1 ? 'an hour' : `${hrs} hours`}</strong> of screens a day.
      This plan doesn&rsquo;t add more &mdash; it swaps the <strong>first few minutes</strong> for
      a story{name ? ` ${name} will retell at dinner` : ' they’ll retell at dinner'}.
    </p>
  )
}

/* Milestones — every figure checks out: Genesis is 10 episodes, finishing a
   series unlocks the next (the app’s series-locking), and five episodes a
   week is 20+ stories by day 30. */
function Milestones({ name }: { name: string }) {
  return (
    <div className="qv-miles">
      <div className="qv-mile"><span className="qv-mile-day">Day 7</span><span>A week of stories done &mdash; 5 episodes, 5 quizzes passed</span></div>
      <div className="qv-mile"><span className="qv-mile-day">Day 14</span><span>Genesis complete (10 episodes) &mdash; the next series unlocks</span></div>
      <div className="qv-mile"><span className="qv-mile-day">Day 30</span><span>20+ stories in{name ? ` — ${name} is` : ' — they’re'} asking for the next one</span></div>
    </div>
  )
}

/* ─────────────────────────── C. See It First ────────────────────────────
   They have answered eight questions about their child and still never seen
   a lesson. Uses the site's one video pattern, so nothing downloads until
   the button is pressed. */
export function VariantC({ answers }: { answers: Answers }) {
  const { plan, choose, loading, buy } = useBuy('quiz-c')
  const { ref: ctaRef, past } = useStickyAfter<HTMLButtonElement>()
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
          ctaLabel="Start my 7 free days"
        />
        <p className="qv-vidnote">
          One of <strong>310</strong>, matched to ages {age} on the {denom} path. Every one ends
          with a quiz so you see what landed.
        </p>

        <div id="plan" />
        <PriceBlock plan={plan} choose={choose} loading={loading} onBuy={() => buy(answers)} ctaRef={ctaRef} />
        <TrustRow />

        <details className="qv-more">
          <summary>What&rsquo;s included</summary>
          <ul>{GETS(age, denom).map(g => <li key={g}><span className="cv-tick">{'✓'}</span>{g}</li>)}</ul>
        </details>

        <p className="qv-signin">Already a member? <a href="https://app.faithfulkids.app/login">Sign in</a></p>
      </div>
      <StickyBuy plan={plan} loading={loading} onBuy={() => buy(answers)} show={past} />
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
