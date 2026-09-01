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
   Reads back their own answers as a spec. The quiz asked eight questions;
   showing that the answers actually shaped something is what makes the
   personalisation feel real rather than decorative. */
export function VariantB({ answers }: { answers: Answers }) {
  const { plan, choose, loading, buy } = useBuy('quiz-b')
  const kids = answers.num_kids === '1' ? 'your child' : 'your kids'
  const age = answers.age || '6-7'
  const denom = answers.denomination === 'catholic' ? 'Catholic' : answers.denomination === 'evangelical' ? 'Evangelical' : 'Christian'
  const nKids = answers.num_kids === '1' ? '1 profile' : `${answers.num_kids || '2'} profiles`

  const rows = [
    { k: 'Ages', v: age, d: 'Stories and quiz wording matched to this level' },
    { k: 'Path', v: denom, d: 'Chosen at setup, changeable any time' },
    { k: 'Profiles', v: nKids, d: 'Separate progress for each child, up to five' },
    { k: 'Each lesson', v: 'About 2 min', d: 'Then a comprehension quiz and one reflection question' },
    { k: 'The library', v: '300+ lessons', d: '31 series, Genesis to Revelation, in order' },
  ]

  return (
    <div className="qv qv-b">
      <Head kids={kids} />
      <div className="qv-wrap">
        <div className="qv-badge">{'✨'} Built from your answers</div>
        <h1>{kids === 'your child' ? 'Your child’s' : 'Your family’s'} Bible plan</h1>

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

        <PriceBlock plan={plan} choose={choose} loading={loading} onBuy={() => buy(answers)} />
        <TrustRow />
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

export const SAMPLE: Answers = {
  num_kids: '2', age: '6-7', screen_time: '2-4hr', pain: 'too_much',
  denomination: 'evangelical', hero: 'david', adventure: 'daniel',
}
