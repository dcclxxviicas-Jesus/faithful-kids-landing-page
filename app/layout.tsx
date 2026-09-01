import type { Metadata } from 'next'
import { Nunito } from 'next/font/google'
import './globals.css'
import { PostHogProvider } from './providers'
import { MetaPixel } from './MetaPixel'
import { SupportChat } from './SupportChat'

// The rounded, heavy face the design was drawn in. Without it the page falls
// back to the system stack and reads noticeably colder.
const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800', '900'],
  variable: '--font-nunito',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://faithfulkids.app'),
  verification: {
    other: { 'p:domain_verify': '5f5b1b32e961a0e961786606d549be7e' },
  },
  title: {
    default: 'Bible App for Kids — 300+ Bible Stories, Ages 5-15, No Ads',
    template: '%s | Faithful Kids',
  },
  description: 'A Bible app for kids ages 5-15. 300+ short Bible story videos, each with a quiz and reflection, Genesis to Revelation. No ads, no algorithm, no guilt.',
  keywords: ['bible stories for kids', 'bible app for kids', 'christian app for kids', 'bible videos for children', 'sunday school lessons', 'kids bible lessons'],
  openGraph: {
    siteName: 'Faithful Kids',
    type: 'website',
    url: 'https://faithfulkids.app',
    title: 'Bible App for Kids — 300+ Bible Stories, Ages 5-15, No Ads',
    description: 'A Bible app for kids ages 5-15. 300+ short Bible story videos, each with a quiz and reflection, Genesis to Revelation. No ads, no algorithm, no guilt.',
    images: [{ url: 'https://d3g07v1w0lehiv.cloudfront.net/blog-images/david-and-goliath-for-kids-hero.webp', width: 1792, height: 1024, alt: 'Faithful Kids - Bible Story Videos for Kids' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bible App for Kids Ages 5-15 — Faithful Kids',
    description: '300+ short Bible story videos for kids, each with a quiz and reflection. Genesis to Revelation. No ads, no algorithm, no guilt.',
    images: ['https://d3g07v1w0lehiv.cloudfront.net/blog-images/david-and-goliath-for-kids-hero.webp'],
  },
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
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
    <html lang="en" className={nunito.variable}>
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
            description: 'Bible story videos for kids ages 5-15. 300+ lessons narrated by Jesus with quizzes and reflections.',
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
        <MetaPixel />
        <SupportChat />
      </body>
    </html>
  )
}
