import type { Metadata } from 'next'
import './globals.css'
import { PostHogProvider } from './providers'

export const metadata: Metadata = {
  title: 'Faithful Kids - Screen Time That Feeds Their Soul',
  description: 'Short, beautiful Bible story videos for kids ages 5+. A safe alternative to doom scrolling, made for families of faith.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PostHogProvider>{children}</PostHogProvider>
      </body>
    </html>
  )
}
