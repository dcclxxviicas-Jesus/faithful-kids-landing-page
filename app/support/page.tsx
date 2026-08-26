import type { Metadata } from 'next'
import { SiteNav, SiteFooter } from '../components/SiteChrome'

export const metadata: Metadata = {
  title: 'Support',
  description: 'Get help with Faithful Kids — FAQ, contact info, and troubleshooting for the Bible story app for kids.',
  alternates: { canonical: 'https://faithfulkids.app/support' },
}

export default function Support() {
  return (
    <>
      <SiteNav />
      <section className="doc-hero">
        <span className="section-label">Help Center</span>
        <h1>Support</h1>
        <p>Need help with Faithful Kids? We&apos;re here for you.</p>
      </section>

      <div className="doc-body">
        <div className="doc-callout">
          <h2>Contact us directly</h2>
          <p>The fastest way to get help: email our team. We respond within 24 hours, usually much faster.</p>
          <p style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 0 }}>
            <a href="mailto:team@faithfulkids.app">📧 team@faithfulkids.app</a>
          </p>
        </div>

        <h2>Frequently Asked Questions</h2>

        <h3>How do I cancel my subscription?</h3>
        <p>
          On iOS: open the iPhone or iPad <strong>Settings</strong> app → tap your name at the top →{' '}
          <strong>Subscriptions</strong> → tap Faithful Kids → <strong>Cancel Subscription</strong>.
        </p>
        <p>
          On the web: sign in at <a href="https://app.faithfulkids.app">app.faithfulkids.app</a> →
          Parent Dashboard → Manage Subscription.
        </p>

        <h3>I was charged but my account doesn&apos;t have access</h3>
        <p>
          If you purchased through the iOS app, open the app and tap <strong>Restore Purchases</strong> on
          the subscription screen. If that doesn&apos;t work, email us with your Apple ID email or
          Stripe receipt and we&apos;ll resolve it within a few hours.
        </p>

        <h3>I forgot my password</h3>
        <p>
          On the sign-in screen, tap <strong>Forgot password?</strong>. You&apos;ll get a reset link
          by email. If you don&apos;t see it, check spam or contact us.
        </p>

        <h3>How do I add another kid&apos;s profile?</h3>
        <p>
          On any device: open the app → tap your profile icon at the top → <strong>Switch Profile</strong> →{' '}
          <strong>Add Kid</strong>. You can have up to 6 kid profiles per family.
        </p>

        <h3>How do I reset my Parent PIN?</h3>
        <p>
          On the PIN entry screen, tap <strong>Forgot PIN?</strong>. We&apos;ll email you a one-time
          reset code. Enter it in the app and you&apos;ll be able to set a new PIN.
        </p>

        <h3>Videos won&apos;t play</h3>
        <p>Try these steps in order:</p>
        <ol>
          <li>Check your internet connection — videos stream from our CDN and need 2+ Mbps to play smoothly.</li>
          <li>Close and reopen the app.</li>
          <li>Sign out and sign back in.</li>
          <li>If the problem persists, email us with your device model and we&apos;ll investigate.</li>
        </ol>

        <h3>How do I delete my account?</h3>
        <p>
          Sign in at <a href="https://app.faithfulkids.app">app.faithfulkids.app</a> → Parent
          Dashboard → <strong>Delete Account</strong>. All your data will be permanently removed
          within 24 hours.
        </p>

        <h3>Is there a free trial?</h3>
        <p>
          Yes — every new account gets a 3-day free trial. Cancel anytime before day 7 and you
          won&apos;t be charged.
        </p>

        <h3>What ages is Faithful Kids for?</h3>
        <p>
          Designed for kids ages 5–15. The youngest kids enjoy the videos and simple stories; older
          kids dig into the quizzes and reflections.
        </p>

        <h3>Where can I leave feedback?</h3>
        <p>
          We love hearing from parents. Email us at{' '}
          <a href="mailto:team@faithfulkids.app">team@faithfulkids.app</a> — every message gets read
          by a real person.
        </p>

        <h2>More resources</h2>
        <ul>
          <li><a href="/bible-trivia">Free Bible trivia game</a></li>
          <li><a href="/printables">Free printable Bible activities</a></li>
          <li><a href="/privacy">Privacy Policy</a></li>
          <li><a href="/terms">Terms of Service</a></li>
          <li><a href="/blog">Blog</a></li>
        </ul>
      </div>
      <SiteFooter />
    </>
  )
}
