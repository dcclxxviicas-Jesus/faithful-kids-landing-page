/** @type {import('next').NextConfig} */
const nextConfig = {
  /* The contract templates are read at REQUEST time by the admin route, not
     at build time like the blog's Markdown, so Next's tracer never sees the
     read and would ship a lambda with no contracts/ directory in it. Without
     this the admin page 500s in production and works perfectly in dev. */
  outputFileTracingIncludes: {
    '/api/contracts/admin': ['./contracts/**/*'],
    // Parenting: the desk API and the draft preview read content/parenting
    // at REQUEST time (drafts are never part of the static build), so the
    // tracer has to be told the folder exists, exactly like the contracts.
    '/api/parenting/admin': ['./content/parenting/**/*'],
    '/parenting/preview/[slug]': ['./content/parenting/**/*'],
  },
  // PostHog reverse proxy — routes analytics through our domain so ad
  // blockers don't drop events (PostHog "Set up reverse proxy" health check)
  skipTrailingSlashRedirect: true,
  /* People search "statement of faith", "what we believe" and "beliefs"
     in roughly equal measure, and group leaders paste whichever they typed.
     One canonical page at /beliefs; the other two are permanent redirects so
     the ranking signal consolidates instead of splitting three ways. */
  async redirects() {
    return [
      { source: '/what-we-believe', destination: '/beliefs', permanent: true },
      { source: '/statement-of-faith', destination: '/beliefs', permanent: true },
      // Creator partnerships: one canonical page at /creators.
      { source: '/partnerships', destination: '/creators', permanent: true },
      // Parenting essay retitled minutes after publish (Nov 2, 2026); old slug was already shared.
      { source: '/parenting/stop-teaching-kids-to-fear-god-teach-them-awe', destination: '/parenting/how-to-raise-children-to-have-god-in-their-hearts-and-minds', permanent: true },
      { source: '/parenting/why-i-built-an-ai-bible-app-for-my-kids', destination: '/parenting/why-i-built-a-bible-app-for-my-kids', permanent: true },
      // Parenting is one stream since Nov 16, 2026 (owner's call): the format
      // section pages are retired and their URLs fold into the front page.
      { source: '/parenting/:section(stories|opinion|interviews|news|research)', destination: '/parenting', permanent: true },
    ]
  },
  /* PDFs are served at faithfulkids.app addresses (rewrites below) but must
     not be indexed: a PDF in search results skips the page it belongs to,
     with its email gate and its videos. Links people make to a PDF still
     count for the domain. */
  async headers() {
    return [
      { source: '/printables/:path(.+\\.pdf)', headers: [{ key: 'X-Robots-Tag', value: 'noindex' }] },
      { source: '/email/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex' }, { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
    ]
  },
  async rewrites() {
    return [
      /* Printable PDFs live on CloudFront but open at faithfulkids.app
         (owner request, Nov 2026): /printables/<anything>.pdf is passed
         through to the same path on the CDN. A printable page's own PDF is
         its address plus .pdf. The coloring pack predates the scheme and
         sits under another prefix, so it gets its own line, first. */
      {
        source: '/printables/bible-coloring-pages.pdf',
        destination: 'https://d3g07v1w0lehiv.cloudfront.net/coloring-pages/faithful-kids-bible-coloring-pages.pdf',
      },
      // The single coloring page a visitor downloads is an image, same idea.
      {
        source: '/printables/bible-coloring-pages/:slug.png',
        destination: 'https://d3g07v1w0lehiv.cloudfront.net/coloring-pages/:slug.png',
      },
      {
        source: '/printables/:path(.+\\.pdf)',
        destination: 'https://d3g07v1w0lehiv.cloudfront.net/printables/:path',
      },
      /* Email images open at faithfulkids.app too: receivers (Gmail above
         all) trust images hosted on the sending domain more than a
         third-party CDN host. Same files, same CDN behind it. */
      {
        source: '/email/:path*',
        destination: 'https://d3g07v1w0lehiv.cloudfront.net/email/:path*',
      },
      // Markdown parity: /blog/<slug>.md serves the same post as plain Markdown.
      // Handler lives at app/blog-md/[slug]/route.ts. HTML stays canonical.
      {
        source: '/blog/:slug.md',
        destination: '/blog-md/:slug',
      },
      // Same parity for Parenting articles: /parenting/<slug>.md
      {
        source: '/parenting/:slug.md',
        destination: '/parenting-md/:slug',
      },
      {
        source: '/ingest/static/:path*',
        destination: 'https://us-assets.i.posthog.com/static/:path*',
      },
      {
        source: '/ingest/:path*',
        destination: 'https://us.i.posthog.com/:path*',
      },
    ]
  },
}

module.exports = nextConfig
