import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Support | Faithful Kids',
  description: 'Get help with Faithful Kids — FAQ, contact info, and troubleshooting for the Bible story app for kids.',
  alternates: { canonical: 'https://faithfulkids.app/support' },
}

export default function Support() {
  return (
    <section style={{ maxWidth: 720, margin: '0 auto', padding: '40px 20px', fontFamily: 'system-ui, sans-serif', color: '#333', lineHeight: 1.7, fontSize: '0.95rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 8 }}>Support</h1>
      <p style={{ color: '#666', marginBottom: 32, fontSize: '1.05rem' }}>
        Need help with Faithful Kids? We&apos;re here for you.
      </p>

      <div style={{ background: '#ecfdf5', border: '2px solid #34d399', borderRadius: 16, padding: 24, marginBottom: 36 }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 12, color: '#065f46' }}>Contact us directly</h2>
        <p style={{ marginBottom: 8 }}>
          The fastest way to get help: email our team. We respond within 24 hours, usually much faster.
        </p>
        <p style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: 16 }}>
          <a href="mailto:team@faithfulkids.app" style={{ color: '#059669', textDecoration: 'none' }}>
            📧 team@faithfulkids.app
          </a>
        </p>
      </div>

      <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: 36, marginBottom: 16 }}>Frequently Asked Questions</h2>

      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: 24 }}>How do I cancel my subscription?</h3>
      <p>
        On iOS: open the iPhone or iPad <strong>Settings</strong> app → tap your name at the top → <strong>Subscriptions</strong> → tap Faithful Kids → <strong>Cancel Subscription</strong>.
      </p>
      <p>
        On the web: sign in at <a href="https://app.faithfulkids.app" style={{ color: '#059669', fontWeight: 600 }}>app.faithfulkids.app</a> → Parent Dashboard → Manage Subscription.
      </p>

      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: 24 }}>I was charged but my account doesn&apos;t have access</h3>
      <p>
        If you purchased through the iOS app, open the app and tap <strong>Restore Purchases</strong> on the subscription screen. If that doesn&apos;t work, email us with your Apple ID email or Stripe receipt and we&apos;ll resolve it within a few hours.
      </p>

      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: 24 }}>I forgot my password</h3>
      <p>
        On the sign-in screen, tap <strong>Forgot password?</strong>. You&apos;ll get a reset link by email. If you don&apos;t see it, check spam or contact us.
      </p>

      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: 24 }}>How do I add another kid&apos;s profile?</h3>
      <p>
        On any device: open the app → tap your profile icon at the top → <strong>Switch Profile</strong> → <strong>Add Kid</strong>. You can have up to 6 kid profiles per family.
      </p>

      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: 24 }}>How do I reset my Parent PIN?</h3>
      <p>
        On the PIN entry screen, tap <strong>Forgot PIN?</strong>. We&apos;ll email you a one-time reset code. Enter it in the app and you&apos;ll be able to set a new PIN.
      </p>

      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: 24 }}>Videos won&apos;t play</h3>
      <p>
        Try these steps in order:
      </p>
      <ol>
        <li>Check your internet connection — videos stream from our CDN and need 2+ Mbps to play smoothly.</li>
        <li>Close and reopen the app.</li>
        <li>Sign out and sign back in.</li>
        <li>If the problem persists, email us with your device model and we&apos;ll investigate.</li>
      </ol>

      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: 24 }}>How do I delete my account?</h3>
      <p>
        Sign in at <a href="https://app.faithfulkids.app" style={{ color: '#059669', fontWeight: 600 }}>app.faithfulkids.app</a> → Parent Dashboard → <strong>Delete Account</strong>. All your data will be permanently removed within 24 hours.
      </p>

      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: 24 }}>Is there a free trial?</h3>
      <p>
        Yes — every new account gets a 7-day free trial. Cancel anytime before day 7 and you won&apos;t be charged.
      </p>

      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: 24 }}>What ages is Faithful Kids for?</h3>
      <p>
        Designed for kids ages 5-15. The youngest kids enjoy the videos and simple stories; older kids dig into the quizzes and reflections.
      </p>

      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: 24 }}>Where can I leave feedback?</h3>
      <p>
        We love hearing from parents. Email us at <a href="mailto:team@faithfulkids.app" style={{ color: '#059669', fontWeight: 600 }}>team@faithfulkids.app</a> — every message gets read by a real person.
      </p>

      <hr style={{ margin: '40px 0', border: 'none', borderTop: '1px solid #e5e5e5' }} />

      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 12 }}>More resources</h2>
      <ul>
        <li><a href="/privacy" style={{ color: '#059669', fontWeight: 600 }}>Privacy Policy</a></li>
        <li><a href="/terms" style={{ color: '#059669', fontWeight: 600 }}>Terms of Service</a></li>
        <li><a href="/blog" style={{ color: '#059669', fontWeight: 600 }}>Blog</a></li>
      </ul>

      <p style={{ marginTop: 40 }}>
        <a href="/" style={{ color: '#059669', fontWeight: 600 }}>&larr; Back to home</a>
      </p>
    </section>
  )
}
