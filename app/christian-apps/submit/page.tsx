import type { Metadata } from 'next'
import { SiteNav, SiteFooter } from '../../components/SiteChrome'
import { SubmitForm } from './SubmitForm'
import '../apps.css'

const URL = 'https://faithfulkids.app/christian-apps/submit'

export const metadata: Metadata = {
  title: { absolute: 'Submit a Christian App or Website for Kids | Faithful Kids' },
  description: 'Submit your Christian app or website for kids and families to the Faithful Kids directory. Every submission is reviewed by our team.',
  alternates: { canonical: URL },
  openGraph: { title: 'Submit a Christian App or Website', description: 'Get your Christian app or website for kids listed in the Faithful Kids directory.', url: URL, siteName: 'Faithful Kids', type: 'website', images: [{ url: 'https://d3g07v1w0lehiv.cloudfront.net/app-icons/og-christian-apps.png', width: 1200, height: 630 }] },
}

export default function SubmitPage() {
  return (
    <>
      <SiteNav />
      <header className="ad-hero">
        <span className="ad-kicker">The Christian Apps Directory</span>
        <h1>Submit a Christian App or Website</h1>
        <p className="ad-lede">
          Make an app or website for Christian kids and families? Tell us about it. Approved listings get
          their own page in the <a href="/christian-apps">Christian Apps for Kids</a> directory, which parents use to compare
          price, ages, ads and devices.
        </p>
      </header>
      <main className="ad-wrap">
        <div className="ad-form">
          <section className="ad-section" style={{ marginTop: 0, marginBottom: '1.6rem' }}>
            <h2>How it works</h2>
            <ol style={{ lineHeight: 1.8, paddingLeft: '1.2rem', color: '#374151' }}>
              <li>Fill in the form below. It takes about three minutes.</li>
              <li>Every submission is reviewed by our team, and listings are approved at our discretion.</li>
              <li>If it is approved, we email you the link to its page, plus an optional badge for your site.</li>
            </ol>
            <p>
              We list apps and websites made for Christian kids and families: Bible stories, shows, games,
              music, devotionals, Scripture memory, Catholic resources and parent tools. Looking for more places
              to list your app? See our guide to <a href="/blog/where-to-list-a-christian-app">where to list a Christian app</a>.
            </p>
          </section>
          <h2 className="ad-grid-h">Submit your app or website</h2>
          <SubmitForm />
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
