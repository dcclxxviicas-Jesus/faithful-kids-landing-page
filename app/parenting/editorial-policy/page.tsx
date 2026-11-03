import type { Metadata } from 'next'
import { SiteNav, SiteFooter } from '@/app/components/SiteChrome'
import { Masthead } from '../ui'

const URL = 'https://faithfulkids.app/parenting/editorial-policy'
const DESC = 'Editorial standards for Parenting at Faithful Kids: real names, verified facts, labelled opinion, how we use AI, how we handle children’s privacy, and how corrections work.'

export const metadata: Metadata = {
  title: { absolute: 'Editorial Policy and Corrections | Parenting at Faithful Kids' },
  description: DESC,
  alternates: { canonical: URL },
  openGraph: { title: 'Editorial policy', description: DESC, url: URL, siteName: 'Faithful Kids', type: 'website' },
}

export default function EditorialPolicyPage() {
  return (
    <>
      <SiteNav active="parenting" />
      <main id="main-content">
        <Masthead inner current="Editorial policy" />
        <div className="pt-page">
          <h1>Editorial policy</h1>
          <p className="pt-lede">
            These are the rules we hold ourselves to. They are short because they are meant to be kept.
          </p>

          <h2>1. Nonfiction is nonfiction</h2>
          <p>
            Every parent story, interview and report describes things that happened to the people named. We do
            not invent contributors, scenes, children or quotations. We do not publish composite characters. A
            first-person piece is written by, or with and approved by, the person whose byline it carries.
          </p>

          <h2>2. Real names, real people</h2>
          <p>
            Contributors appear under their real names with a biography they wrote or approved and, where
            they choose, a photo of themselves. We verify who people are and what they do. In the rare case
            where a writer has a legitimate privacy need, we may publish under a disclosed pen name; the page
            will say so, and the editor will know the writer&rsquo;s real identity.
          </p>

          <h2>3. Facts are checked, opinion is labelled</h2>
          <p>
            Factual claims are checked before publication and sources are listed. Scripture is quoted
            accurately with its reference. Opinion pieces carry an opinion label and are the author&rsquo;s view,
            not ours. Reporting and opinion are kept apart.
          </p>

          <h2>4. News is sourced, not rewritten</h2>
          <p>
            A news item says what happened, who it affects, where the information came from and what is not
            yet known. We link to primary sources. We do not rewrite other publishers&rsquo; reporting as our own.
            We cover parenting, families, children and education; we do not cover general political or
            religious controversy.
          </p>

          <h2>5. Research shows its work</h2>
          <p>
            Original research states its question, method, sample, period, and limitations, and separates our
            own data from third-party findings. Where a result is too small to support a claim, we say so.
          </p>

          <h2>6. Children&rsquo;s privacy comes first</h2>
          <p>
            Stories about children are also the children&rsquo;s stories. We do not publish private information
            about an identifiable minor without the written authorization of a parent or guardian and a real
            editorial reason. Writers may use a child&rsquo;s first name or a changed name; the page will say which.
            We do not run photographs of a contributor&rsquo;s children unless the contributor supplies them and
            asks us to.
          </p>

          <h2>7. Images are honest</h2>
          <p>
            Photographs are either supplied by the contributor, taken by us, or licensed stock, and are credited.
            A stock photograph never implies that it shows the author, their family, or a reported event. We do
            not create AI-generated portraits of real people.
          </p>

          <h2>8. How we use AI</h2>
          <p>
            Editors may use AI tools to check grammar, suggest headlines, organize notes and prepare interview
            questions. We do not publish AI-written accounts of human experience as if a person had lived them,
            and we ask contributors not to submit them. Where an AI tool contributed substantively to a piece
            of analysis, the piece says so.
          </p>

          <h2>9. Conflicts and disclosures</h2>
          <p>
            Faithful Kids makes a Bible app for children and publishes this section. When a piece mentions
            the app, a contributor&rsquo;s relationship to it (a free church account, a creator partnership, a
            commission) is disclosed at the end of the article. Contributors declare any financial interest in
            products or organizations they write about. We do not run sponsored content in this section.
          </p>

          <h2>10. Corrections</h2>
          <p>
            When we get something wrong we fix it in the article and add a dated correction note at the end
            saying what changed. Significant updates to a published piece are noted the same way; the Updated
            date is changed only for substantive edits. To report an error, email
            {' '}<a href="mailto:christian@faithfulkids.app">christian@faithfulkids.app</a>. A contributor may ask
            for their piece to be amended or withdrawn; we will discuss it with them and act promptly on
            reasonable requests.
          </p>

          <h2>11. Where we stand</h2>
          <p>
            Our <a href="/beliefs">statement of faith</a> is deliberately generalizable. Contributors write from
            their own Christian traditions; this section does not argue the distinctives that divide them, and we
            edit with that in mind.
          </p>

          <h2>Editor of record</h2>
          <p>
            <a href="/about/christian-alexander">Christian Alexander</a>, founder of Faithful Kids. Questions
            about this policy go to <a href="mailto:christian@faithfulkids.app">christian@faithfulkids.app</a>.
          </p>
        </div>
        <div className="pt-footgap" />
      </main>
      <SiteFooter />
    </>
  )
}
