import type { Metadata } from 'next'

/* Demo surface for picking an exit-takeover treatment. Noindexed and absent
   from the sitemap, exactly like /checkout-variants. */
export const metadata: Metadata = {
  title: 'Exit takeover variants',
  robots: { index: false, follow: false },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
