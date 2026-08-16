import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Faithful Kids Admin',
  robots: { index: false, follow: false },
}

export default function CasAdminLayout({ children }: { children: React.ReactNode }) {
  return children
}
