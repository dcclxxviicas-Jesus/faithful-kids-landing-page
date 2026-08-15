import type { Metadata } from 'next'

// Checkout is disallowed in robots.txt — noindex keeps the signals consistent
// (it previously inherited the homepage canonical and title).
export const metadata: Metadata = {
  title: 'Checkout',
  robots: { index: false, follow: false },
  alternates: {
    canonical: 'https://faithfulkids.app/checkout',
  },
}

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children
}
