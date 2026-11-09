import { Literata, Newsreader } from 'next/font/google'
import './parenting.css'

/* The editorial faces for /parenting. Headlines and long-form body read in
   Newsreader; subtitles (deks), ledes and pull quotes read in Literata, a
   serif built for phone reading with a taller x-height (owner's pick, Nov 9,
   2026: Newsreader italic at those sizes was too faint to read). Everything
   else keeps the brand's Nunito. Loaded once here rather than per page so the
   variables are defined on every route in the section. */
const serif = Newsreader({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
})

const dek = Literata({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-literata',
  display: 'swap',
})

export default function ParentingLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${serif.variable} ${dek.variable} pt`}>{children}</div>
}
