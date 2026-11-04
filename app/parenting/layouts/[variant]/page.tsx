import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SiteFooter } from '@/app/components/SiteChrome'
import { getPublicArticles, getFeatured, liveSections } from '@/lib/parenting'
import { ParentingHeader, Masthead, SectionNav, QuietStrip } from '../../ui'
import { LAYOUTS, type LayoutKey } from '../../layouts'

/* Owner-facing layout comparison. Noindex, not in the sitemap, meant to be
   deleted once a front page is chosen. See layouts.tsx. */

type Props = { params: Promise<{ variant: string }> }

export function generateStaticParams() {
  return Object.keys(LAYOUTS).map(variant => ({ variant }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { variant } = await params
  const def = LAYOUTS[variant as LayoutKey]
  if (!def) return {}
  return {
    title: { absolute: `Layout ${variant.toUpperCase()}: ${def.name} | Parenting preview` },
    robots: { index: false, follow: false },
  }
}

export default async function LayoutPreview({ params }: Props) {
  const { variant } = await params
  const def = LAYOUTS[variant as LayoutKey]
  if (!def) notFound()
  const articles = getPublicArticles()
  const featured = getFeatured(articles)
  const sections = liveSections(articles)
  if (!featured) notFound()
  const rest = articles.filter(a => a.slug !== featured.slug)
  const Front = def.Front

  return (
    <>
      <ParentingHeader />
      <main id="main-content">
        <nav className="pt-lab" aria-label="Layout previews">
          <span className="pt-lab-title">Layout preview</span>
          {(Object.keys(LAYOUTS) as LayoutKey[]).map(k => (
            <a key={k} href={`/parenting/layouts/${k}`} aria-current={k === variant ? 'page' : undefined}>
              <b>{k.toUpperCase()}</b> {LAYOUTS[k].name}
            </a>
          ))}
          <span className="pt-lab-after">after {def.after}</span>
        </nav>
        <Masthead />
        <SectionNav sections={sections} current="latest" />
        <Front featured={featured} rest={rest} />
        <QuietStrip source="parenting-layout-preview" />
        <div className="pt-footgap" />
      </main>
      <SiteFooter />
    </>
  )
}
