import type { Metadata } from 'next'

// Post-purchase page — should never be indexed
// (it previously inherited the homepage canonical and title).
export const metadata: Metadata = {
  title: 'Welcome to Faithful Kids',
  robots: { index: false, follow: false },
  alternates: {
    canonical: 'https://faithfulkids.app/success',
  },
}

export default function SuccessLayout({ children }: { children: React.ReactNode }) {
  return children
}
