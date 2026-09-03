import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  getPostBySlug,
  getPlayableTrivia,
  extractTriviaQuestions,
  triviaLabel,
  getRelatedTrivia,
} from '@/lib/blog'
import { getTriviaVideo } from '@/lib/trivia-video'
import { TriviaGame } from '@/app/blog/TriviaGame'
import { AutoResize, CONTENT_ID } from '../../bible-trivia/AutoResize'
import { EmbedFooter } from '../EmbedFooter'
import '../../bible-trivia/embed.css'

/**
 * One embeddable game per trivia post.
 *
 * /embed/bible-trivia is the single mixed game; this is Exodus trivia, Psalms
 * trivia, Christmas trivia — whichever one a site actually wants. That is the
 * whole reason it exists: a children's ministry blog writing about Exodus will
 * embed an Exodus game and will not embed a general one, and every placement
 * carries a credit link to that post rather than all of them pointing at one
 * page.
 *
 * No X-Frame-Options and no CSP frame-ancestors for this route, by design —
 * it has to stay frameable by any origin.
 */

type Props = { params: Promise<{ slug: string }> }

// Only posts with a real game. A 3-question post rendered as an embed would
// be a worse advert for us than no embed at all.
export function generateStaticParams() {
  return getPlayableTrivia().map(t => ({ slug: t.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  return {
    // Noindex: a utility duplicate of /blog/<slug>, which is the page we want
    // ranking — and the page every credit link points at.
    title: post ? `${triviaLabel(slug, post.title)} Bible Trivia — Faithful Kids` : 'Bible Trivia',
    robots: { index: false, follow: true },
  }
}

export default async function TriviaEmbed({ params }: Props) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()

  const questions = extractTriviaQuestions(post.content)
  if (questions.length < 10) notFound()

  return (
    /* Fills whatever height the host gives it and centres the card, rather
       than sitting at the top of a taller frame with a void beneath. Most
       hosts size their own frame and will never adopt our resize listener, so
       this — not the postMessage — is the fix that has to work everywhere.
       Background stays transparent: hosts have their own themes. */
    <main className="fk-embed">
      <AutoResize />
      <div id={CONTENT_ID} className="fk-embed-content">
        <TriviaGame
          embed
          questions={questions}
          postSlug={post.slug}
          postTitle={post.title}
          label={triviaLabel(post.slug, post.title)}
          related={getRelatedTrivia(post.slug)}
          posterSrc={`https://d3g07v1w0lehiv.cloudfront.net/blog-images/${post.slug}-hero.webp`}
          {...getTriviaVideo(post.slug)}
        />
        <EmbedFooter slug={post.slug} />
      </div>
    </main>
  )
}
