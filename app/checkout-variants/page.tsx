import './variants.css'

const VARIANTS: { n: number | string; name: string; ref: string; what: string }[] = [
  { n: 1, name: 'Focused Confirm', ref: 'Headspace', what: 'One decision, then pay. No feature list, no reviews, no urgency device. Shortest possible path.' },
  { n: 2, name: 'Side by Side', ref: 'Minno', what: 'Both plans priced per month so the comparison needs no arithmetic. Features below the button.' },
  { n: 3, name: 'See It First', ref: 'Netflix / Yippee', what: 'A real lesson playable beside the plans. Checkout is the only page on the site that shows no product.' },
  { n: 4, name: 'Nothing Hidden', ref: 'Duolingo / Calm', what: 'Real dates replace the fake countdown. Answers "when am I charged" before it is asked.' },
]

// The three below all run monthly at $10.99 and favour yearly WITHOUT greying
// the monthly option out.
const TREATMENTS = [
  { slug: 'toggle', name: 'Segmented toggle', what: 'One card, a switch on top. Neither option is uglier than the other — the card simply says more when yearly is picked.' },
  { slug: 'hero', name: 'Single hero card', what: 'Only yearly is a card. Monthly is offered as a quiet line of text that swaps it. Nothing to grey out.' },
  { slug: 'twin', name: 'Twin cards', what: 'Both white and crisp. Yearly wins on a gradient crown and rows of value monthly has nothing to put in.' },
]

export default function Index() {
  return (
    <div className="cv-page">
      <div className="cv-wrap" style={{ paddingBottom: 60 }}>
        <h1 className="cv-h1">Checkout variants</h1>
        <p className="cv-sub">
          Four rebuilds of <code>/checkout</code>. All four are live and will really take you to
          Stripe, so stop at the payment screen.
        </p>
        <div className="cv-plans">
          {VARIANTS.map((v) => (
            <a key={v.n} href={`/checkout-variants/v${v.n}`} className="cv-plan" style={{ textDecoration: 'none', color: 'inherit' }}>
              <span className="cv-plan-mid">
                <span className="cv-plan-top">
                  <span className="cv-plan-name">{v.n}. {v.name}</span>
                  <span className="cv-flag cv-flag-save">{v.ref}</span>
                </span>
                <span className="cv-plan-note">{v.what}</span>
              </span>
              <span className="cv-plan-right"><span className="cv-plan-big">&rarr;</span></span>
            </a>
          ))}
        </div>
        <h2 className="cv-inc-title">Better than greying it out</h2>
        <div className="cv-plans">
          {TREATMENTS.map((t) => (
            <a key={t.slug} href={`/checkout-variants/${t.slug}`} className="cv-plan" style={{ textDecoration: 'none', color: 'inherit' }}>
              <span className="cv-plan-mid">
                <span className="cv-plan-top"><span className="cv-plan-name">{t.name}</span></span>
                <span className="cv-plan-note">{t.what}</span>
              </span>
              <span className="cv-plan-right"><span className="cv-plan-big">&rarr;</span></span>
            </a>
          ))}
        </div>

        <p className="cv-cta-note" style={{ marginTop: 24 }}>
          <a href="/checkout">Compare against the current live page</a>
        </p>
      </div>
    </div>
  )
}
