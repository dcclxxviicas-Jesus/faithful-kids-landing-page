import type { Metadata } from 'next'
import './globals.css'
import { PostHogProvider } from './providers'

export const metadata: Metadata = {
  metadataBase: new URL('https://faithfulkids.app'),
  title: {
    default: 'Faithful Kids — Screen Time That Feeds Their Soul',
    template: '%s | Faithful Kids',
  },
  description: 'Short, beautiful Bible story videos for kids ages 5+. 400+ lessons, Genesis to Revelation. No ads, ever.',
  openGraph: {
    siteName: 'Faithful Kids',
    type: 'website',
    images: [{ url: '/logo.png' }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Preload the nav logo for faster FCP */}
        <link rel="preload" href="/logo-sm.png" as="image" />
        {/* Preconnect to video CDN to reduce latency */}
        <link rel="preconnect" href="https://d3g07v1w0lehiv.cloudfront.net" />
        <link rel="dns-prefetch" href="https://d3g07v1w0lehiv.cloudfront.net" />
      </head>
      <body>
        <PostHogProvider>{children}</PostHogProvider>
      </body>
    </html>
  )
}
