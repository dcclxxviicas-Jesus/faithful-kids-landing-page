import { getPublicArticles, getArticleMarkdown } from '@/lib/parenting'

// Markdown edition of a Parenting article, served at /parenting/<slug>.md via
// the rewrite in next.config.js. Same source file as the HTML page, rendered
// in the same build. HTML stays canonical (Link header + not in the sitemap).
export const dynamic = 'force-static'

export function generateStaticParams() {
  return getPublicArticles().map(a => ({ slug: a.slug }))
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const md = getArticleMarkdown(slug)
  if (!md) return new Response('Not found', { status: 404 })
  return new Response(md, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      Link: `<https://faithfulkids.app/parenting/${slug}>; rel="canonical"`,
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  })
}
