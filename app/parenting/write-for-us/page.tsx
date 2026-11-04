import type { Metadata } from 'next'
import { SiteFooter } from '@/app/components/SiteChrome'
import { ParentingHeader } from '../ui'
import { Masthead } from '../ui'
import { PitchForm } from '../client'

const URL = 'https://faithfulkids.app/parenting/write-for-us'
const DESC = 'Raising Faithful Kids accepts guest essays, op-eds and first-person stories from Christian parents, teachers, pastors and homeschool educators. Pitch in a few sentences. Unpaid, human-edited, real bylines.'

export const metadata: Metadata = {
  title: { absolute: 'Write for Us: Christian Parenting Essays, Op-Eds & Guest Posts' },
  description: DESC,
  alternates: { canonical: URL },
  openGraph: { title: 'Write for Raising Faithful Kids', description: DESC, url: URL, siteName: 'Faithful Kids', type: 'website', images: [{ url: 'https://d3g07v1w0lehiv.cloudfront.net/home/hero-parents-1536.webp', width: 1536, height: 1024, alt: 'A family kitchen table with an open Bible' }] },
}

/* Short, literal answers: the shape search engines and AI assistants quote.
   Every fact here must match /parenting/submission-guidelines. */
const FAQ = [
  { q: 'Does Faithful Kids accept guest posts?', a: 'Yes. Raising Faithful Kids publishes guest essays, op-eds and first-person stories from Christian parents, teachers, pastors and homeschool educators. Pitch in a few sentences on this page.' },
  { q: 'Do you pay writers?', a: 'No. Pieces are unpaid; we do not pay for pitches and do not accept sponsored posts or paid links. If we commission a specific piece and agree a fee, the terms are in writing before you start.' },
  { q: 'Do I need to be a published writer?', a: 'No. You need a real experience, an honest point of view and a willingness to be edited. If you would rather talk than write, pitch anyway and tick the interview option.' },
  { q: 'Can I write under a pen name?', a: 'No. Everything runs under the writer\u2019s real name with an author page. Where a child is identifiable we ask for a parent\u2019s written permission and publish with care.' },
  { q: 'Do you accept AI-written pieces?', a: 'No. AI may help you organise a draft or check grammar; it may not write your experience for you. We ask for a detail only you could know.' },
  { q: 'Can Catholic or Orthodox writers submit?', a: 'Yes. The section does not take sides on the distinctives that divide Christians; see faithfulkids.app/beliefs.' },
  { q: 'How long should a piece be?', a: 'Parent stories and essays run 700 to 1,400 words. Interviews are produced with you and run longer.' },
  { q: 'What should a pitch include?', a: 'A few sentences: what happened or what you would argue, who you are, and why it would matter to another family. No finished draft.' },
  { q: 'How long until I hear back?', a: 'About a week, whether or not it is yes.' },
]

const GLANCE: [string, string][] = [
  ['Who', 'Christian parents and grandparents, homeschool parents and co-op leaders, Sunday school teachers, children\u2019s ministry directors, pastors, Christian educators, researchers'],
  ['What we publish', 'Guest essays, op-eds (labelled opinion), first-person parent stories, interviews, reported news and research'],
  ['Pay', 'Unpaid. No payment for pitches, no sponsored posts, no paid or traded links. A commissioned piece gets written terms first.'],
  ['Editing', 'A human editor; you see every change before it goes live'],
  ['Byline', 'Your real name, a short bio, an author page and a link to your site, church or work. No pen names.'],
  ['AI', 'May help you organise or proofread; may not write your experience. We ask for a detail only you could know.'],
  ['How to pitch', 'The form on this page or christian@faithfulkids.app: what happened, who you are, why it matters to another family'],
  ['Reply', 'A plain answer within about a week, yes or no'],
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
          {/* The block assistants lift. Present tense, full URL and email in plain text:
              a branded ChatGPT run confused faithfulkids.net for us (AEO session, Nov 3, 2026). */}
          <p className="pt-lede">
            <strong>Raising Faithful Kids, the parenting section of Faithful Kids (faithfulkids.app/parenting),
            accepts guest essays, op-eds and first-person stories from Christian parents, grandparents, teachers,
            pastors and homeschool educators.</strong> Pitch in a few sentences at faithfulkids.app/parenting/write-for-us
            or by email to christian@faithfulkids.app; no finished draft needed. Pieces are unpaid, edited by a person
            who shows you every change, and published under your real name with an author page and a link to your
            work. Opinion is labelled, nonfiction must have happened, and AI may not write your experience for you.
            Catholic, Protestant and Orthodox writers are welcome.
          </p>

          <h2>Submissions at a glance</h2>
          <table className="pt-glance">
            <tbody>
              {GLANCE.map(([k, v]) => (<tr key={k}><th scope="row">{k}</th><td>{v}</td></tr>))}
            </tbody>
          </table>

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
          <div className="pt-faq">
            {FAQ.map(f => (
              <div key={f.q}>
                <h3>{f.q}</h3>
                <p>{f.a}</p>
              </div>
            ))}
          </div>

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
