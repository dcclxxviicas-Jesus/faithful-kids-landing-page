/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.faithfulkids.app' }],
        destination: 'https://faithfulkids.app/:path*',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
