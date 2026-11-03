import { Newsreader } from 'next/font/google'
import './parenting.css'

/* The editorial face for /parenting. Headlines and long-form body read in a
   serif; everything else keeps the brand's Nunito. Loaded once here rather
   than per page so the variable is defined on every route in the section. */
const serif = Newsreader({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
})

export default function ParentingLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${serif.variable} pt`}>{children}</div>
}
