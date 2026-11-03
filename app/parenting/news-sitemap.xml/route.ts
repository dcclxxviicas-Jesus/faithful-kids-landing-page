import { getPublicArticles } from '@/lib/parenting'

/*
 * Google News sitemap for genuinely reported pieces only (type: news), and
 * only those published in the last two days, which is Google's window for
 * news sitemaps. Essays, stories and interviews are deliberately excluded:
 * putting evergreen content in a news sitemap to borrow visibility is the
 * kind of thing that gets a publication removed.
 *
 * Submit https://faithfulkids.app/parenting/news-sitemap.xml in Search
 * Console once real news exists. Inclusion in Google News is not guaranteed.
 */
export const dynamic = 'force-static'

export function GET() {
  const twoDays = Date.now() - 2 * 24 * 3600 * 1000
  const items = getPublicArticles().filter(a =>
    a.type === 'news' && !a.isSample && new Date(a.datePublished + 'T00:00:00Z').getTime() >= twoDays,
  )
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  const body = items.map(a => `  <url>
    <loc>https://faithfulkids.app/parenting/${a.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>Faithful Kids</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${a.datePublished}</news:publication_date>
      <news:title>${esc(a.title)}</news:title>
    </news:news>
  </url>`).join('\n')
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${body}
</urlset>
`
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=900' } })
}
