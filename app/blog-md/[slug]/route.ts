import { getAllPosts, getPostMarkdown } from '@/lib/blog'

// Markdown parity for blog posts — served at /blog/<slug>.md via the rewrite
// in next.config.js (App Router cannot route a literal ".md" suffix itself).
//
// Why this exists: retrieval systems and agents pay per token, and our HTML
// pages carry a lot of interactive furniture (trivia game, story quiz, exit
// popup, sticky CTA) a reader never asked for. The Markdown edition is the
// same content from the same source file, with none of that.
//
// The HTML page stays canonical: this response carries a Link: rel=canonical
// header pointing back at it, and the .md URL is NOT in the sitemap. The HTML
// page advertises this edition with <link rel="alternate" type="text/markdown">.
export const dynamic = 'force-static'

export function generateStaticParams() {
  return getAllPosts().map(p => ({ slug: p.slug }))
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const md = getPostMarkdown(slug)
  if (!md) return new Response('Not found', { status: 404 })
  return new Response(md, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      Link: `<https://faithfulkids.app/blog/${slug}>; rel="canonical"`,
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  })
}
