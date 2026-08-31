import type { Metadata } from 'next'

// Internal review only — never indexed, never linked from the live site.
export const metadata: Metadata = {
  title: 'Checkout variants',
  robots: { index: false, follow: false },
}

export default function VariantsLayout({ children }: { children: React.ReactNode }) {
  return children
}
