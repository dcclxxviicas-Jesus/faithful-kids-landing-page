import type { Metadata } from 'next'
import { SiteNav, SiteFooter } from '../components/SiteChrome'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Faithful Kids collects, uses, and protects your family’s information.',
  alternates: {
    canonical: 'https://faithfulkids.app/privacy',
  },
}

export default function Privacy() {
  return (
    <>
      <SiteNav />
      <section className="doc-hero">
        <span className="section-label">Legal</span>
        <h1>Privacy Policy</h1>
        <p>Last updated: April 2026</p>
      </section>

      <div className="doc-body">
        <h2>About Faithful Kids</h2>
        <p>
          Faithful Kids is an educational video platform that helps children learn the stories of
          the Bible. This Privacy Policy explains how we collect, use, and protect information when
          you and your children use our website and app.
        </p>

        <h2>What Data We Collect</h2>
        <p>We collect the following information:</p>
        <ul>
          <li>Child&apos;s first name</li>
          <li>Age range (e.g., 4–6, 7–9)</li>
          <li>Avatar choice</li>
          <li>Parent email address</li>
          <li>Quiz scores</li>
          <li>Reflection responses</li>
          <li>Usage events (e.g., episodes viewed, streaks)</li>
        </ul>

        <h2>How We Use Your Data</h2>
        <ul>
          <li><strong>Personalization:</strong> We use your child&apos;s name, age, and avatar to personalize their learning experience.</li>
          <li><strong>Email notifications:</strong> We send progress updates, quiz results, and weekly reports to the parent email address.</li>
          <li><strong>Improving the service:</strong> We use aggregated usage data to understand how children interact with our content and improve the learning experience.</li>
        </ul>

        <div className="doc-callout">
          <h2>COPPA Compliance</h2>
          <p>
            We take children&apos;s privacy seriously. In compliance with the Children&apos;s Online
            Privacy Protection Act (COPPA), we require verifiable parental consent before collecting
            any personal information from children under 13.
          </p>
          <p style={{ marginBottom: 0 }}>
            Parents can review their child&apos;s data, request deletion of their child&apos;s data,
            or refuse further collection at any time from the Parent Dashboard. If you believe we
            have collected information from a child without parental consent, please contact us
            immediately.
          </p>
        </div>

        <h2>Data Storage</h2>
        <p>
          Learning progress is stored locally on your device using browser storage. Family
          registration data and usage events are stored in Supabase, a secure cloud database. Data
          is encrypted in transit and at rest.
        </p>

        <h2>Email Communications</h2>
        <p>
          We use Resend to deliver notification emails to parents, including welcome emails,
          progress reports, and streak milestones. Parents can opt out of email notifications at any
          time from the Parent Dashboard. Marketing emails always include an unsubscribe link.
        </p>

        <h2>Analytics (PostHog)</h2>
        <p>
          We use PostHog for anonymous product analytics. This includes pageviews, button clicks,
          and feature usage data. No names, email addresses, or child data are sent to PostHog. This
          data helps us understand how families use the platform so we can improve the learning
          experience.
        </p>

        <h2>Payment Processing (Stripe)</h2>
        <p>
          We use Stripe to process payments securely. When you subscribe, your payment method
          information (such as credit card number) is sent directly to Stripe and is never stored on
          our servers. We only store your Stripe customer ID and subscription status to manage your
          account. Stripe&apos;s handling of your payment data is governed by{' '}
          <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer">Stripe&apos;s Privacy Policy</a>.
        </p>

        <h2>Sign-In with Google / Apple</h2>
        <p>
          If you sign in using Google or Apple, we receive your email address and display name from
          the OAuth provider. We use this information solely to create and identify your account. We
          do not access your contacts, calendar, or any other data from your Google or Apple
          account.
        </p>

        <h2>Cookies</h2>
        <p>
          We use cookies strictly for authentication and session management. These cookies keep you
          signed in between visits and are essential for the service to function. We do not use
          advertising cookies or third-party tracking cookies. PostHog analytics uses a first-party
          cookie to distinguish unique visitors without identifying them personally.
        </p>

        <h2>Third Parties</h2>
        <p>
          We do not sell or share personal data with third parties. Our service providers process
          data on our behalf and are bound by their own privacy policies:
        </p>
        <ul>
          <li><strong>Supabase</strong> — database and authentication</li>
          <li><strong>Resend</strong> — email delivery</li>
          <li><strong>Stripe</strong> — payment processing</li>
          <li><strong>PostHog</strong> — anonymous product analytics</li>
          <li><strong>Google / Apple</strong> — OAuth sign-in (if used)</li>
        </ul>

        <h2>Data Deletion</h2>
        <p>
          Parents can delete all family data at any time from the Parent Dashboard. This includes
          all child profiles, quiz scores, reflection responses, and usage data. Deletion is
          permanent and cannot be undone.
        </p>

        <h2>Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy or our data practices, please contact
          us at <a href="mailto:privacy@faithfulkids.app">privacy@faithfulkids.app</a>.
        </p>
      </div>
      <SiteFooter />
    </>
  )
}
