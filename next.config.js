/** @type {import('next').NextConfig} */
const nextConfig = {
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
    ]
  },
  async rewrites() {
    return [
      // Markdown parity: /blog/<slug>.md serves the same post as plain Markdown.
      // Handler lives at app/blog-md/[slug]/route.ts. HTML stays canonical.
      {
        source: '/blog/:slug.md',
        destination: '/blog-md/:slug',
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
