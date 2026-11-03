import type { Metadata } from 'next'
import { SiteNav, SiteFooter } from '@/app/components/SiteChrome'
import { Masthead } from '../ui'
import { PitchForm } from '../client'

const URL = 'https://faithfulkids.app/parenting/write-for-us'
const DESC = 'Write for Faithful Kids. We publish real stories, essays and interviews from Christian parents, teachers, pastors and homeschool educators. Pitch in a few sentences.'

export const metadata: Metadata = {
  title: { absolute: 'Write for Faithful Kids: Share Your Story With Christian Parents' },
  description: DESC,
  alternates: { canonical: URL },
  openGraph: { title: 'Write for Faithful Kids', description: DESC, url: URL, siteName: 'Faithful Kids', type: 'website' },
}

export default function WriteForUsPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Write for Faithful Kids',
    url: URL,
    description: DESC,
    isPartOf: { '@type': 'CollectionPage', name: 'Raising Faithful Kids', url: 'https://faithfulkids.app/parenting' },
    publisher: { '@type': 'Organization', '@id': 'https://faithfulkids.app/#organization' },
  }
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteNav active="parenting" />
      <main id="main-content">
        <Masthead inner current="Write for us" />
        <div className="pt-page">
          <h1>Your experience could help another Christian family.</h1>
          <p className="pt-lede">
            Parenting at Faithful Kids publishes genuine insight from people who care about raising children in
            the faith: what you tried, what worked, what did not, and what you would tell a parent one step
            behind you.
          </p>

          <h2>Who we are looking for</h2>
          <div className="pt-cols">
            <ul>
              <li>Christian parents and grandparents</li>
              <li>Homeschool parents and co-op leaders</li>
              <li>Sunday school teachers</li>
              <li>Children&rsquo;s ministry directors</li>
            </ul>
            <ul>
              <li>Pastors and youth pastors</li>
              <li>Christian educators and school leaders</li>
              <li>Writers, creators and podcasters</li>
              <li>Researchers with relevant expertise</li>
            </ul>
          </div>
          <p>
            You do not need to be a professional writer. You need a real experience, an honest point of view,
            and a willingness to be edited. We publish under real names, with a short biography and a photo
            you approve.
          </p>

          <h2>What we publish</h2>
          <ul>
            <li><strong>Parent stories.</strong> First-person accounts of faith at home: bedtime Bibles, hard questions, routines that changed, the week it all fell apart.</li>
            <li><strong>Opinion.</strong> Signed essays that argue something about Christian education, screens, imagination, church and family. Clearly labelled as the writer&rsquo;s view.</li>
            <li><strong>Interviews.</strong> Conversations with people who do this work. If you would rather talk than write, see below.</li>
            <li><strong>News and research.</strong> Sourced reporting and original surveys on homeschooling, children&rsquo;s ministry, Christian schools and how families teach Scripture.</li>
          </ul>

          <h2>What you get</h2>
          <ul>
            <li>Your piece read closely and edited with care. You see every change before it goes live.</li>
            <li>A byline, an author page with your biography, and a link to your website, church, or work.</li>
            <li>Readers: faithfulkids.app reaches thousands of Christian parents and teachers every week through search.</li>
            <li>Selected pieces go out in our weekly email and on our Pinterest boards.</li>
            <li>A plain answer within about a week, whether or not it is yes.</li>
          </ul>
          <p>
            We cannot promise publication, traffic, or payment. We do not pay for pitches, and we do not sell
            or trade links. If we commission a specific piece and agree a fee, we put the terms in writing before
            you start.
          </p>

          <div className="pt-callout" id="interview">
            <h3>Not much of a writer? That&rsquo;s okay.</h3>
            <p>
              Some of the best pieces start as a conversation. If you have an experience worth sharing but
              dread a blank page, pitch it anyway and tick the interview option. An editor will talk with you
              for twenty or thirty minutes, write it up in your voice, and send it back for your approval. Nothing
              is published until you have read it and said yes.
            </p>
          </div>

          <h2 id="pitch">Pitch in a few sentences</h2>
          <p>
            No finished draft needed. Tell us the story, who you are, and why it would matter to another family.
            Read the <a href="/parenting/submission-guidelines">submission guidelines</a> first; they are short.
          </p>
          <PitchForm />

          <h2>A few things we hold to</h2>
          <ul>
            <li>Everything we publish as nonfiction happened. No invented scenes, no composite children, no quotes that were not said.</li>
            <li>Stories involving children are the child&rsquo;s story too. We publish with care, and a parent&rsquo;s written permission where a child is identifiable.</li>
            <li>We welcome Catholic, Protestant and Orthodox writers. A piece may be fully yours in voice and tradition, but this section does not take sides on the distinctives that divide Christians. Read <a href="/beliefs">what we believe</a>.</li>
            <li>AI tools may help you organize a draft or check grammar; they may not write your experience for you. We will ask for a detail only you could know.</li>
          </ul>
        </div>
        <div className="pt-footgap" />
      </main>
      <SiteFooter />
    </>
  )
}
