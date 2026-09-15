/** @type {import('next').NextConfig} */
const nextConfig = {
  // PostHog reverse proxy — routes analytics through our domain so ad
  // blockers don't drop events (PostHog "Set up reverse proxy" health check)
  skipTrailingSlashRedirect: true,
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
