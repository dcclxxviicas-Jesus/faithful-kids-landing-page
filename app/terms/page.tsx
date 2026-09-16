import type { Metadata } from 'next'
import { SiteNav, SiteFooter } from '../components/SiteChrome'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'The terms and conditions for using the Faithful Kids app and website.',
  alternates: {
    canonical: 'https://faithfulkids.app/terms',
  },
}

export default function Terms() {
  return (
    <>
      <SiteNav />
      <section className="doc-hero">
        <span className="section-label">Legal</span>
        <h1>Terms of Service</h1>
        <p>Last updated: April 2026</p>
      </section>

      <div className="doc-body">
        <p>
          By using Faithful Kids (&ldquo;the Service&rdquo;), you agree to these terms. The Service
          is operated by Faithful Kids.
        </p>

        <h2>Subscriptions</h2>
        <p>
          Faithful Kids is a paid subscription service. By subscribing, you agree to pay the fees
          associated with your chosen plan. All payments are processed through Stripe. You may
          cancel at any time through the Parent Dashboard or by contacting us.
        </p>

        <h2>Free Trial</h2>
        <p>
          New subscribers may receive a 7-day free trial. You will not be charged during the trial
          period. If you do not cancel before the trial ends, your subscription will begin and you
          will be charged according to your selected plan.
        </p>

        <h2>Refunds</h2>
        <p>
          We offer a 30-day money-back guarantee. If you are not satisfied with the Service, contact
          us within 30 days of your first payment for a full refund.
        </p>

        <h2>Content</h2>
        <p>
          All video content, quizzes, and materials are the property of Faithful Kids. You may not
          copy, distribute, or reproduce any content without written permission. Content is intended
          for personal, non-commercial use within your family. Our free printables may be printed
          and shared for home, classroom, and church use.
        </p>

        <h2>Child Safety</h2>
        <p>
          Faithful Kids is designed for children ages 4–15 under parental supervision. We comply
          with COPPA (Children&apos;s Online Privacy Protection Act). Parents are responsible for
          supervising their children&apos;s use of the Service.
        </p>

        <h2>Account Termination</h2>
        <p>
          We reserve the right to terminate accounts that violate these terms. You may delete your
          account and all associated data at any time through the Parent Dashboard.
        </p>

        <h2>Changes</h2>
        <p>
          We may update these terms from time to time. Continued use of the Service constitutes
          acceptance of the updated terms.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about these terms? Email us at{' '}
          <a href="mailto:team@faithfulkids.app">team@faithfulkids.app</a>.
        </p>
      </div>
      <SiteFooter />
    </>
  )
}
