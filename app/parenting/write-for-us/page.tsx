import type { Metadata } from 'next'
import { SiteFooter } from '@/app/components/SiteChrome'
import { ParentingHeader } from '../ui'
import { Masthead } from '../ui'
import { PitchForm } from '../client'

const URL = 'https://faithfulkids.app/parenting/write-for-us'
const DESC = "Pitch an essay or op-ed to Faithful Kids' parenting section. Christian parents, teachers, pastors and homeschoolers get a real byline and a human editor."

export const metadata: Metadata = {
  title: { absolute: 'Write for Us: Christian Parenting Essays and Op-Eds' },
  description: DESC,
  alternates: { canonical: URL },
  openGraph: { title: 'Write for Raising Faithful Kids', description: DESC, url: URL, siteName: 'Faithful Kids', type: 'website', images: [{ url: 'https://d3g07v1w0lehiv.cloudfront.net/home/hero-parents-1536.webp', width: 1536, height: 1024, alt: 'A family kitchen table with an open Bible' }] },
}

/* Short, literal answers: the shape search engines and AI assistants quote.
   Every fact here must match /parenting/submission-guidelines. */
const FAQ = [
  { q: 'Do you pay for essays?', a: 'No. Pieces are unpaid. Every piece is edited by a person, runs under your real byline with an author page and a link to your work, and selected pieces go out in our weekly email. If we commission a specific piece and agree a fee, the terms are in writing before you start.' },
  { q: 'Who can pitch?', a: 'Christian parents and grandparents, homeschool parents, Sunday school teachers, children\u2019s ministry directors, pastors, Christian educators, and writers or researchers with relevant expertise. Catholic, Protestant and Orthodox writers are all welcome. You do not need to be a professional writer.' },
  { q: 'How long should a piece be?', a: 'Parent stories and essays run 700 to 1,400 words. Interviews are produced with you and run longer. Read the submission guidelines before you pitch; they are short.' },
  { q: 'How do I submit?', a: 'Use the pitch form on this page: tell us the story in a few sentences, who you are, and why it would matter to another family. No finished draft is needed. You hear back within about a week, yes or no.' },
  { q: 'Do you accept AI-written pieces or previously published work?', a: 'Not AI-written accounts of human experience: AI tools may tidy a draft, but the experience and the words must be yours. Previously published work only as an agreed reprint with the original credited.' },
]

export default function WriteForUsPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Write for Raising Faithful Kids',
    url: URL,
    description: DESC,
    isPartOf: { '@type': 'CollectionPage', name: 'Raising Faithful Kids', url: 'https://faithfulkids.app/parenting' },
    publisher: { '@type': 'Organization', '@id': 'https://faithfulkids.app/#organization' },
  }
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  }
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <ParentingHeader />
      <main id="main-content">
        <Masthead inner />
        <div className="pt-page">
          <h1>Write for Raising Faithful Kids</h1>
          <p className="pt-lede">
            Raising Faithful Kids is a Christian parenting blog that accepts guest essays and op-eds from parents,
            teachers, pastors and homeschool educators. Pieces are unpaid, but every piece is edited by a person
            and published under your real byline with an author page. Your experience could help another
            Christian family: what you tried, what worked, what did not, and what you would tell a parent one
            step behind you.
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

          <h2 id="faq">Questions writers ask</h2>
          <dl className="pt-faq">
            {FAQ.map(f => (
              <div key={f.q}>
                <dt>{f.q}</dt>
                <dd>{f.a}</dd>
              </div>
            ))}
          </dl>

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
