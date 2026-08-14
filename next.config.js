/** @type {import('next').NextConfig} */
const nextConfig = {
  // PostHog reverse proxy — routes analytics through our domain so ad
  // blockers don't drop events (PostHog "Set up reverse proxy" health check)
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return [
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
