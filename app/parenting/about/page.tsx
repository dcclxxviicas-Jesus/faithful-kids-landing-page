import type { Metadata } from 'next'
import { SiteFooter } from '@/app/components/SiteChrome'
import { ParentingHeader } from '../ui'
import { Masthead } from '../ui'

const URL = 'https://faithfulkids.app/parenting/about'
const DESC = 'What Parenting at Faithful Kids is, who writes it, how it is edited, and how it relates to the Faithful Kids Bible app.'

export const metadata: Metadata = {
  title: { absolute: 'About Parenting at Faithful Kids' },
  description: DESC,
  alternates: { canonical: URL },
  openGraph: { title: 'About Parenting at Faithful Kids', description: DESC, url: URL, siteName: 'Faithful Kids', type: 'website' },
}

export default function AboutParentingPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About Parenting at Faithful Kids',
    url: URL,
    description: DESC,
    isPartOf: { '@type': 'CollectionPage', name: 'Raising Faithful Kids', url: 'https://faithfulkids.app/parenting' },
    publisher: { '@type': 'Organization', '@id': 'https://faithfulkids.app/#organization' },
  }
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ParentingHeader />
      <main id="main-content">
        <Masthead inner />
        <div className="pt-page">
          <h1>About Parenting</h1>
          <p className="pt-lede">
            A place on Faithful Kids for grown-ups: real stories, thoughtful perspectives, and practical wisdom
            from Christian parents, educators, and ministry leaders.
          </p>

          <h2>Why it exists</h2>
          <p>
            Faithful Kids began as a Bible video app for children. The parents who use it, and the teachers
            and pastors who recommend it, kept asking each other the same questions: how do you keep a
            seven-year-old&rsquo;s attention on Genesis, what do you say when your daughter asks why God let the
            dog die, how does a two-income family find twenty minutes for Scripture on a Tuesday. Those
            questions deserve better than a listicle. They deserve the voices of people who have lived them.
          </p>
          <p>
            So this section publishes those people. Parents write about what actually happened in their
            homes. Pastors and children&rsquo;s ministry directors explain what they have learned from a thousand
            Sunday mornings. We interview educators and authors, report on developments that affect Christian
            families, and publish original research with its method shown.
          </p>

          <h2>What it is not</h2>
          <p>
            It is not a magazine with a separate name, and it is not a marketing blog for the app. The free
            Bible stories, printables and guides live in our <a href="/blog">resource library</a>; the app has its own
            pages. Parenting is the part of Faithful Kids where other people get to speak, and where we try to
            say true things even when they are inconvenient for us.
          </p>

          <h2>How it is edited</h2>
          <p>
            Every piece is read and edited by a person. Facts are checked, Scripture references are verified,
            and authors approve the final text before it is published. Opinion is labelled. Corrections are made
            in the open. The full standards are on the <a href="/parenting/editorial-policy">editorial policy</a> page.
          </p>

          <h2>Who is behind it</h2>
          <p>
            Faithful Kids is made by <a href="/about/christian-alexander">Christian Alexander</a>, a Christian
            father who built the app for his own children, and is published by Catterfly LLC. He is the editor
            of record for this section and reads every pitch himself. Contributors are credited by name on
            their own <a href="/parenting">author pages</a>.
          </p>

          <h2>Where we stand</h2>
          <p>
            Our <a href="/beliefs">statement of faith</a> is deliberately generalizable: the Bible is the
            inspired, true Word of God, and salvation is found in Jesus by grace through faith. Contributors
            write from their own traditions, Catholic, Protestant and Orthodox, and this section does not take
            sides on the questions that divide them.
          </p>

          <h2>Write for us</h2>
          <p>
            If you are a parent, teacher, pastor or educator with a story worth telling, we would like to read
            it. Start on the <a href="/parenting/write-for-us">Write for Faithful Kids</a> page.
          </p>
        </div>
        <div className="pt-footgap" />
      </main>
      <SiteFooter />
    </>
  )
}
