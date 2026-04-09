export default function Privacy() {
  return (
    <section style={{ maxWidth: 640, margin: '0 auto', padding: '72px 24px' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: 24 }}>Privacy Policy</h1>

      <p style={{ marginBottom: 16, lineHeight: 1.7, color: '#555' }}>
        <strong>What we collect:</strong> Your email address and denomination
        preference when you sign up for early access. We also collect anonymous
        usage data (page views, button clicks) to improve the product.
      </p>

      <p style={{ marginBottom: 16, lineHeight: 1.7, color: '#555' }}>
        <strong>What we don't collect:</strong> We do not collect any data from
        children. This site is intended for parents and guardians only. Children
        do not interact with this site directly.
      </p>

      <p style={{ marginBottom: 16, lineHeight: 1.7, color: '#555' }}>
        <strong>How we use it:</strong> Your email is used only to notify you
        when the app launches. We will never sell or share your email with third
        parties.
      </p>

      <p style={{ marginBottom: 16, lineHeight: 1.7, color: '#555' }}>
        <strong>Analytics:</strong> We use PostHog for anonymous usage analytics.
        No personally identifiable information is shared with any third party
        beyond PostHog.
      </p>

      <p style={{ marginBottom: 16, lineHeight: 1.7, color: '#555' }}>
        <strong>Data retention:</strong> If this product does not proceed to
        launch, all collected email addresses will be deleted within 90 days.
      </p>

      <p style={{ marginBottom: 16, lineHeight: 1.7, color: '#555' }}>
        <strong>Unsubscribe:</strong> You can request deletion of your data at
        any time by emailing us.
      </p>

      <p style={{ marginTop: 32 }}>
        <a href="/" style={{ color: '#059669', fontWeight: 600 }}>&larr; Back to home</a>
      </p>
    </section>
  )
}
