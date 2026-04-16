import type { Metadata } from 'next'
import './globals.css'
import { PostHogProvider } from './providers'

export const metadata: Metadata = {
  metadataBase: new URL('https://faithfulkids.app'),
  title: {
    default: 'Faithful Kids — Bible Story Videos for Kids Ages 5+ | No Ads',
    template: '%s | Faithful Kids',
  },
  description: 'Bible story videos for kids ages 5-15. 400+ lessons narrated by Jesus, quizzes, and reflections. Genesis to Revelation. Zero ads, ever. Try free for 7 days.',
  keywords: ['bible stories for kids', 'bible app for kids', 'christian app for kids', 'bible videos for children', 'sunday school lessons', 'kids bible lessons'],
  openGraph: {
    siteName: 'Faithful Kids',
    type: 'website',
    images: [{ url: 'https://d3g07v1w0lehiv.cloudfront.net/blog-images/david-and-goliath-for-kids-hero.webp', width: 1792, height: 1024, alt: 'Faithful Kids - Bible Story Videos for Kids' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Faithful Kids — Bible Story Videos for Kids',
    description: '400+ Bible story videos for kids ages 5-15. Quizzes, reflections, parent dashboard. Zero ads.',
    images: ['https://d3g07v1w0lehiv.cloudfront.net/blog-images/david-and-goliath-for-kids-hero.webp'],
  },
  icons: {
    icon: '/logo-sm.png',
    apple: '/logo-sm.png',
  },
  other: {
    'theme-color': '#059669',
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
  alternates: {
    canonical: 'https://faithfulkids.app',
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Faithful Kids',
            url: 'https://faithfulkids.app',
            logo: 'https://faithfulkids.app/logo-sm.png',
            description: 'Bible story videos for kids ages 5-15. 400+ lessons narrated by Jesus with quizzes and reflections.',
            foundingDate: '2026',
            contactPoint: { '@type': 'ContactPoint', email: 'team@faithfulkids.app', contactType: 'customer service' },
          }) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'Faithful Kids',
            url: 'https://faithfulkids.app',
            potentialAction: { '@type': 'SearchAction', target: 'https://faithfulkids.app/blog?q={search_term_string}', 'query-input': 'required name=search_term_string' },
          }) }}
        />
        <PostHogProvider>{children}</PostHogProvider>
      </body>
    </html>
  )
}
