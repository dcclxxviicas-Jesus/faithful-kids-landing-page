import type { Metadata } from 'next'
import '../../home.css'
import '../../v2-pages.css'
import '../affiliates.css'
import { SiteNav, SiteFooter } from '@/app/components/SiteChrome'
import { V2Shell } from '@/app/v2-shell'
import { TERMS, money, fmtDate } from '@/lib/affiliates'

/*
 * The affiliate program agreement. Applicants accept it by ticking the box on
 * the /affiliates form, which records TERMS.version and the time.
 *
 * Every number on this page comes from TERMS in lib/affiliates.ts. If a term
 * changes: edit TERMS, bump TERMS.version, and tell existing affiliates at
 * least 30 days ahead (section 12 promises that). Program terms are the
 * owner's decisions of Nov 19, 2026; a lawyer has not reviewed this text.
 */

const TITLE = 'Affiliate Program Terms'
const DESCRIPTION = `The Faithful Kids affiliate program terms: ${TERMS.ratePct}% of web subscription payments for ${TERMS.months} months, a ${TERMS.cookieDays}-day link window, and monthly PayPal payouts.`

export const metadata: Metadata = {
  title: `${TITLE} | Faithful Kids`,
  description: DESCRIPTION,
  alternates: { canonical: 'https://faithfulkids.app/affiliates/terms' },
  openGraph: { title: `Faithful Kids ${TITLE}`, description: DESCRIPTION, url: 'https://faithfulkids.app/affiliates/terms', siteName: 'Faithful Kids', type: 'website' },
}

export default function Page() {
  const min = money(TERMS.minimumCents)
  return (
    <V2Shell>
      <SiteNav />
      <main id="main-content">
        <section className="v2-section">
          <div className="v2-wrap is-narrow v2-body af-terms">
            <p className="hv-eyebrow">Affiliate program</p>
            <h1 style={{ margin: '0 0 12px' }}>Faithful Kids Affiliate Program Terms</h1>
            <p>Version {TERMS.version} (effective {fmtDate(`${TERMS.version}T12:00:00Z`)}). These terms are an agreement between you and Faithful Kids (&ldquo;we&rdquo;, &ldquo;us&rdquo;). You accept them when you apply to the program. Written to be read, not skimmed past: if anything here is unclear, email <a href="mailto:team@faithfulkids.app">team@faithfulkids.app</a> and we will explain it.</p>

            <h2>1. Joining</h2>
            <ol>
              <li>You must be at least 18 and able to enter a contract. Applying does not make you an affiliate; we review every application and approve or decline it at our discretion.</li>
              <li>Once approved you get a personal link (faithfulkids.app/r/your-code) and a private stats page. Keep the stats page link to yourself.</li>
              <li>There is no follower or traffic minimum.</li>
            </ol>

            <h2>2. What you earn</h2>
            <ol>
              <li>You earn <strong>{TERMS.ratePct}% of every payment</strong> a family you refer makes for a Faithful Kids subscription bought on faithfulkids.app or app.faithfulkids.app, for <strong>the first {TERMS.months} months</strong> from that family&rsquo;s first payment. On a monthly plan that is up to twelve monthly payments; on an annual plan it is the first annual payment.</li>
              <li>Commission is calculated on what the family actually paid, after any discount and before taxes, and in US dollars.</li>
              <li>A free trial earns nothing by itself. Commission starts when the trial turns into a paid subscription.</li>
              <li>Purchases made in the Apple App Store or Google Play are processed by Apple and Google, outside our checkout, and cannot be tracked to a link. They do not earn commission.</li>
            </ol>

            <h2>3. How a sale is credited to you</h2>
            <ol>
              <li>When someone visits through your link, we remember it on their browser for <strong>{TERMS.cookieDays} days</strong>. If they subscribe on our website within that time, the subscription is credited to you.</li>
              <li>If they later visit through another affiliate&rsquo;s link, the most recent link gets the credit.</li>
              <li>Tracking needs the visitor&rsquo;s browser to keep our cookie. If they block it, clear it, or subscribe on a different device, we cannot see the referral, and we cannot credit sales we cannot see. Our records decide which sales are credited.</li>
            </ol>

            <h2>4. When and how you are paid</h2>
            <ol>
              <li>Each commission is held for <strong>{TERMS.holdDays} days</strong> after the payment, so refunds and card disputes can settle first.</li>
              <li>We pay by PayPal on the <strong>{TERMS.payoutDay}th of each month</strong>, covering every commission that has cleared the hold by then, to the PayPal email on your stats page.</li>
              <li>If your cleared balance is under <strong>{min}</strong>, it rolls over to the next month until it reaches {min}.</li>
              <li>You are responsible for any PayPal fees on your side and for your own taxes.</li>
            </ol>

            <h2>5. Refunds, disputes and reversals</h2>
            <ol>
              <li>If a payment is refunded or disputed, its commission is reduced or cancelled. If that commission was already paid to you, the amount is deducted from your next payouts.</li>
              <li>Commission on fraudulent, self-referred or prohibited sales (section 7) is cancelled, and we may recover any amount already paid for them.</li>
            </ol>

            <h2>6. Taxes</h2>
            <ol>
              <li>You are responsible for reporting and paying tax on what you earn.</li>
              <li>If your payouts in a calendar year reach {money(TERMS.taxFormAtCents)}, we will ask for a W-9 (United States) or W-8BEN (elsewhere) before paying more, and where the law requires it we will report your earnings and send you a 1099.</li>
            </ol>

            <h2>7. How you may promote Faithful Kids</h2>
            <ol>
              <li><strong>Disclose it, every time.</strong> Wherever you share your link, say clearly and near the link that you earn a commission (for example, &ldquo;I earn a commission if you subscribe through my link&rdquo;). The US Federal Trade Commission requires it, and so do the platforms. On a website, add <code>rel=&quot;sponsored&quot;</code> to the link.</li>
              <li><strong>Speak to parents.</strong> Faithful Kids is for kids, but promotion must be aimed at parents and other adults. Do not direct your link at children or ask children to sign up.</li>
              <li><strong>Be honest.</strong> Only describe what Faithful Kids actually is. Do not invent discounts, prices, features, endorsements or results, and do not say you work for us.</li>
              <li><strong>No self-referrals.</strong> Purchases by you, your household, or accounts you control earn nothing.</li>
              <li><strong>No search ads on our name.</strong> Do not bid on &ldquo;Faithful Kids&rdquo;, &ldquo;faithfulkids.app&rdquo;, or misspellings of them, and do not use them in domain names, app names or social handles.</li>
              <li><strong>No spam or tricks.</strong> No unsolicited bulk email or messages, cookie stuffing, pop-unders, forced clicks, incentives paid to people for clicking, or coupon and deal sites that list codes we did not give you.</li>
              <li>Use our name and logo only to promote Faithful Kids, and do not change them.</li>
            </ol>

            <h2>8. What we provide</h2>
            <ol>
              <li>Your link, your stats page with clicks, sign-ups, earnings and payouts, and honest answers to questions about the product. We may provide images and sample lessons; we never provide a script.</li>
            </ol>

            <h2>9. Our relationship</h2>
            <ol>
              <li>You are an independent publisher, not our employee, agent or partner. You cannot make promises on our behalf.</li>
              <li>The program is not exclusive. You may promote other products, and we may work with other affiliates.</li>
            </ol>

            <h2>10. Ending the agreement</h2>
            <ol>
              <li>Either side can end this agreement at any time by email. When it ends your link stops crediting new sales.</li>
              <li>If you leave or we end it for any reason other than a breach of section 7, we still pay commission you earned before the end date on the normal schedule.</li>
              <li>We may pause or end your participation immediately for a breach of section 7, and cancel commission connected to the breach.</li>
            </ol>

            <h2>11. Limits</h2>
            <ol>
              <li>The program is provided as is. We do not promise any level of sales or earnings, and we are not liable for indirect or lost-profit damages. Our total liability to you is limited to the commission you earned in the previous 12 months.</li>
              <li>You are responsible for your own content and for following the laws and platform rules that apply to it.</li>
            </ol>

            <h2>12. Changes</h2>
            <ol>
              <li>We may change these terms. We will email active affiliates at least 30 days before a change takes effect, and commission already earned is always paid under the terms in place when it was earned. Continuing in the program after a change takes effect means you accept it.</li>
            </ol>

            <p className="cr-updated">Questions about these terms: <a href="mailto:team@faithfulkids.app">team@faithfulkids.app</a>. Back to the <a href="/affiliates">affiliate program</a>.</p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </V2Shell>
  )
}
