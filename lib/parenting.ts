import fs from 'fs'
import path from 'path'
import { markdownToHtml } from './blog'

/*
 * Parenting — the editorial section at /parenting.
 *
 * Content model, deliberately the same shape as the blog: Markdown files with
 * frontmatter, read at build time, rendered statically. One operator publishes
 * through git, exactly as the 570 blog posts are published, so every tool that
 * already exists (checkers, llms.txt, sitemap, the Markdown edition) works on
 * this section without a second content system.
 *
 *   content/parenting/<slug>.md            an article
 *   content/parenting/authors/<slug>.md    a contributor profile
 *
 * Visibility is a frontmatter `status`:
 *   published  public once datePublished has passed
 *   scheduled  same rule as published; the name is for the editor's eyes
 *   draft      never public; visible at /parenting/preview/<slug> with the admin cookie
 *   sample     development placeholder; rendered only outside production builds,
 *              clearly labelled, never indexed, never in the sitemap
 *
 * Nothing here fabricates a byline. Every article names an author file, and
 * the loader refuses to build a published article whose author does not exist.
 */

export type ArticleType = 'story' | 'opinion' | 'interview' | 'news' | 'research'
export type ArticleStatus = 'published' | 'scheduled' | 'draft' | 'sample'

export interface Section {
  type: ArticleType
  slug: string          // URL segment under /parenting/
  label: string         // nav label
  title: string         // page H1 / <title>
  description: string   // meta description (< 158 chars)
  intro: string         // one line under the heading
  schemaType: 'Article' | 'OpinionNewsArticle' | 'NewsArticle' | 'ScholarlyArticle'
}

export const SECTIONS: Section[] = [
  {
    type: 'story', slug: 'stories', label: 'Stories',
    title: 'Parent Stories',
    description: 'Real, firsthand stories from Christian parents about teaching the Bible at home, prayer with young children, hard questions, and family faith routines.',
    intro: 'Firsthand accounts from parents raising children in the faith. Every story here happened to the person who wrote it.',
    schemaType: 'Article',
  },
  {
    type: 'opinion', slug: 'opinion', label: 'Opinion',
    title: 'Opinion',
    description: 'Essays and commentary on Christian education, screens, imagination, and how families and churches teach children the Bible.',
    intro: 'Signed essays and commentary. Opinion pieces are the view of the author, labelled as such, and separate from our reporting.',
    schemaType: 'OpinionNewsArticle',
  },
  {
    type: 'interview', slug: 'interviews', label: 'Interviews',
    title: 'Interviews',
    description: 'Conversations with pastors, children’s ministry directors, homeschool educators, authors, and parents about raising faithful kids.',
    intro: 'Conversations with the people who do this work: pastors, ministry directors, educators, authors, and parents.',
    schemaType: 'Article',
  },
  {
    type: 'news', slug: 'news', label: 'News',
    title: 'News',
    description: 'Reporting on developments that matter to Christian parents: homeschool policy, children’s ministry, Christian schools, and education research.',
    intro: 'Reporting on developments that affect Christian families and the education of their children. Sourced, dated, and corrected in the open.',
    schemaType: 'NewsArticle',
  },
  {
    type: 'research', slug: 'research', label: 'Research',
    title: 'Research',
    description: 'Original surveys and studies on how Christian families teach Scripture at home, with methods, sources, and limitations stated.',
    intro: 'Original surveys and analysis. Each piece states its method, its sample, and what it cannot tell you.',
    schemaType: 'ScholarlyArticle',
  },
]

export const TAGS = [
  'Christian Parenting', 'Homeschooling', 'Faith at Home', "Children's Ministry",
  'Sunday School', 'Family Bible Study', 'Faith and Technology', 'Child Development',
  'Christian Education', 'Family Traditions',
] as const

/* Slugs an article may never use: they are routes under /parenting/. */
export const RESERVED_SLUGS = new Set([
  ...SECTIONS.map(s => s.slug),
  'authors', 'write-for-us', 'about', 'editorial-policy', 'submission-guidelines',
  'preview', 'latest', 'news-sitemap.xml', 'md', 'feed', 'rss',
])

export interface LinkItem { label: string; href: string }

export interface Author {
  slug: string
  name: string
  role: string
  affiliation: string
  photo: string
  website: string
  links: LinkItem[]
  sameAs: string[]
  pseudonym: boolean
  disclosure: string
  /* Override for a person who already has a canonical Person node elsewhere
     (the founder's lives at /about/christian-alexander#person). */
  personId: string
  hidden: boolean
  bioHtml: string
  bioText: string
}

export interface Article {
  slug: string
  title: string
  subtitle: string
  type: ArticleType
  section: Section
  tags: string[]
  authorSlug: string
  author: Author
  editorSlug: string
  interviewee: string
  status: ArticleStatus
  datePublished: string
  dateModified: string
  excerpt: string
  image: string
  imageAlt: string
  imageCaption: string
  imageCredit: string
  imageCreditUrl: string
  featured: boolean
  seoTitle: string
  metaDescription: string
  canonical: string
  sources: LinkItem[]
  resources: LinkItem[]
  disclosure: string
  contentHtml: string
  body: string
  readingMinutes: number
  wordCount: number
  isSample: boolean
}

const ROOT = path.join(process.cwd(), 'content', 'parenting')
const AUTHOR_DIR = path.join(ROOT, 'authors')

/* Samples are placeholders for layout work. They render in `next dev` and on
   Vercel preview deployments (which Vercel serves with X-Robots-Tag: noindex)
   and are excluded from every production build. PARENTING_SAMPLES=0 hides
   them anywhere; =1 forces them (local production-build testing only). */
export const SHOW_SAMPLES =
  process.env.PARENTING_SAMPLES === '1' ||
  (process.env.PARENTING_SAMPLES !== '0' && process.env.VERCEL_ENV !== 'production')

/* ------------------------------------------------------------ frontmatter */

type FM = Record<string, string | boolean | string[]>

/** Small YAML subset: `key: value`, `key: "quoted"`, `key: [a, b]`, and
 *  block lists (`key:` followed by `  - item` lines). Enough for an article;
 *  anything fancier belongs in the body. */
function parseFrontmatter(raw: string): { data: FM; body: string } {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!m) return { data: {}, body: raw }
  const data: FM = {}
  const lines = m[1].split(/\r?\n/)
  let listKey: string | null = null
  for (const line of lines) {
    if (!line.trim() || line.trim().startsWith('#')) continue
    const item = line.match(/^\s+-\s+(.*)$/)
    if (item && listKey) {
      ;(data[listKey] as string[]).push(unquote(item[1]))
      continue
    }
    listKey = null
    const i = line.indexOf(':')
    if (i < 0) continue
    const key = line.slice(0, i).trim()
    const value = line.slice(i + 1).trim()
    if (value === '') { data[key] = []; listKey = key; continue }
    if (value.startsWith('[')) {
      const inner = value.replace(/^\[/, '').replace(/\]$/, '')
      data[key] = splitTopLevel(inner).map(unquote).filter(Boolean)
      continue
    }
    if (value === 'true') { data[key] = true; continue }
    if (value === 'false') { data[key] = false; continue }
    data[key] = unquote(value)
  }
  return { data, body: m[2] }
}

function unquote(s: string): string {
  const t = s.trim()
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) return t.slice(1, -1)
  return t
}

/* Split "a, b, c" on commas that are not inside quotes, so a quoted item may
   itself contain a comma ("Austin, TX"). */
function splitTopLevel(s: string): string[] {
  const out: string[] = []
  let cur = ''
  let q: string | null = null
  for (const ch of s) {
    if (q) { cur += ch; if (ch === q) q = null; continue }
    if (ch === '"' || ch === "'") { q = ch; cur += ch; continue }
    if (ch === ',') { out.push(cur); cur = ''; continue }
    cur += ch
  }
  if (cur.trim()) out.push(cur)
  return out
}

const str = (v: unknown, d = ''): string => (typeof v === 'string' ? v : d)
const bool = (v: unknown, d = false): boolean => (typeof v === 'boolean' ? v : d)
const list = (v: unknown): string[] => (Array.isArray(v) ? v.map(String) : typeof v === 'string' && v ? [v] : [])

/** "Label | https://url" -> {label, href}. A bare URL is its own label. */
function toLinks(items: string[]): LinkItem[] {
  return items.map(raw => {
    const [a, b] = raw.split('|').map(s => s.trim())
    if (b) return { label: a, href: b }
    return { label: a.replace(/^https?:\/\//, ''), href: a }
  }).filter(l => l.href)
}

/* ---------------------------------------------------------------- markdown */

/** Standard image lines become <figure>s with an optional caption taken from
 *  the Markdown title: ![alt](src "Caption"). Everything else goes through the
 *  blog's renderer so the two sections cannot drift apart in how they read
 *  the same Markdown. */
export function renderArticleMarkdown(md: string): string {
  const figures: string[] = []
  const prepared = md
    .replace(/^\s*# [^\n]*\n+/, '') // template owns the H1
    .replace(/^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)\s*$/gm, (_m, alt, src, cap) => {
      const i = figures.length
      figures.push(
        `<figure class="pt-figure"><img src="${esc(src)}" alt="${esc(alt)}" loading="lazy" />` +
        (cap ? `<figcaption>${inline(cap)}</figcaption>` : '') +
        `</figure>`,
      )
      return `@@FIG${i}@@`
    })
  let html = markdownToHtml(prepared)
  html = html.replace(/<p>\s*@@FIG(\d+)@@\s*<\/p>/g, (_m, i) => figures[Number(i)])
  html = html.replace(/@@FIG(\d+)@@/g, (_m, i) => figures[Number(i)])
  return html
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
function inline(s: string): string {
  return esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>')
}

function plainText(md: string): string {
  return md
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`|]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/* ---------------------------------------------------------------- authors */

let authorCache: Author[] | null = null

export function getAuthors(): Author[] {
  if (authorCache) return authorCache
  if (!fs.existsSync(AUTHOR_DIR)) { authorCache = []; return authorCache }
  const out: Author[] = []
  for (const f of fs.readdirSync(AUTHOR_DIR).filter(f => f.endsWith('.md')).sort()) {
    const raw = fs.readFileSync(path.join(AUTHOR_DIR, f), 'utf-8')
    const { data, body } = parseFrontmatter(raw)
    const slug = str(data.slug) || f.replace(/\.md$/, '')
    if (!/^[a-z0-9-]+$/.test(slug)) throw new Error(`parenting author "${f}": slug must be lowercase-hyphenated`)
    const name = str(data.name)
    if (!name) throw new Error(`parenting author "${f}": name is required`)
    out.push({
      slug,
      name,
      role: str(data.role),
      affiliation: str(data.affiliation),
      photo: str(data.photo),
      website: str(data.website),
      links: toLinks(list(data.links)),
      sameAs: list(data.sameAs),
      pseudonym: bool(data.pseudonym),
      disclosure: str(data.disclosure),
      personId: str(data.personId) || `https://faithfulkids.app/parenting/authors/${slug}#person`,
      hidden: str(data.status) === 'hidden',
      bioHtml: markdownToHtml(body.trim()),
      bioText: plainText(body),
    })
  }
  authorCache = out
  return out
}

export function getAuthor(slug: string): Author | undefined {
  return getAuthors().find(a => a.slug === slug)
}

/* --------------------------------------------------------------- articles */

let articleCache: Article[] | null = null

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function readArticle(file: string): Article {
  const raw = fs.readFileSync(path.join(ROOT, file), 'utf-8')
  const { data, body } = parseFrontmatter(raw)
  const slug = str(data.slug) || file.replace(/\.md$/, '')
  const where = `parenting article "${file}"`

  if (slug !== file.replace(/\.md$/, '')) throw new Error(`${where}: slug "${slug}" must match the filename`)
  if (!/^[a-z0-9-]+$/.test(slug)) throw new Error(`${where}: slug must be lowercase-hyphenated`)
  if (RESERVED_SLUGS.has(slug)) throw new Error(`${where}: "${slug}" is a reserved route under /parenting/`)

  const status = (str(data.status, 'draft') as ArticleStatus)
  if (!['published', 'scheduled', 'draft', 'sample'].includes(status)) throw new Error(`${where}: unknown status "${status}"`)
  const strict = status === 'published' || status === 'scheduled'
  const fail = (msg: string) => {
    if (strict) throw new Error(`${where}: ${msg}`)
    console.warn(`[parenting] ${where}: ${msg}`)
  }

  const type = str(data.type) as ArticleType
  const section = SECTIONS.find(s => s.type === type)
  if (!section) throw new Error(`${where}: type must be one of ${SECTIONS.map(s => s.type).join(', ')}`)

  const title = str(data.title)
  if (!title) throw new Error(`${where}: title is required`)

  const authorSlug = str(data.author)
  const author = getAuthor(authorSlug)
  if (!author) throw new Error(`${where}: author "${authorSlug}" has no file in content/parenting/authors/`)

  const datePublished = str(data.datePublished)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePublished)) fail('datePublished must be YYYY-MM-DD')
  const dateModified = str(data.dateModified) || datePublished

  const metaDescription = str(data.metaDescription) || str(data.excerpt)
  if (!metaDescription) fail('metaDescription (or excerpt) is required')
  if (metaDescription.length > 158) fail(`metaDescription is ${metaDescription.length} chars (limit 158)`)
  const seoTitle = str(data.seoTitle) || title
  if (seoTitle.length > 70) fail(`seoTitle/title is ${seoTitle.length} chars; keep the SERP title under 60`)

  const tags = list(data.tags)
  for (const t of tags) {
    if (!(TAGS as readonly string[]).includes(t)) fail(`unknown tag "${t}" (see TAGS in lib/parenting.ts)`)
  }

  const image = str(data.image)
  if (image && !str(data.imageAlt)) fail('imageAlt is required when image is set')
  if (!image) fail('image is required for a public article (it is also the social card)')

  const contentHtml = renderArticleMarkdown(body)
  const text = plainText(body)
  const wordCount = text ? text.split(' ').length : 0

  return {
    slug,
    title,
    subtitle: str(data.subtitle),
    type,
    section,
    tags,
    authorSlug,
    author,
    editorSlug: str(data.editor),
    interviewee: str(data.interviewee),
    status,
    datePublished,
    dateModified,
    excerpt: str(data.excerpt) || metaDescription,
    image,
    imageAlt: str(data.imageAlt),
    imageCaption: str(data.imageCaption),
    imageCredit: str(data.imageCredit),
    imageCreditUrl: str(data.imageCreditUrl),
    featured: bool(data.featured),
    seoTitle,
    metaDescription,
    canonical: str(data.canonical),
    sources: toLinks(list(data.sources)),
    resources: toLinks(list(data.resources)),
    disclosure: str(data.disclosure),
    contentHtml,
    body,
    readingMinutes: Math.max(1, Math.round(wordCount / 220)),
    wordCount,
    isSample: status === 'sample',
  }
}

/** Every article on disk, newest first, regardless of status. Admin and
 *  preview use this; public pages use getPublicArticles(). */
export function getAllArticles(): Article[] {
  if (articleCache) return articleCache
  if (!fs.existsSync(ROOT)) { articleCache = []; return articleCache }
  // README.md and anything starting with `_` are notes, not articles.
  const files = fs.readdirSync(ROOT).filter(f => f.endsWith('.md') && !/^(_|readme)/i.test(f))
  const out = files.map(readArticle)
  out.sort((a, b) => (b.datePublished.localeCompare(a.datePublished)) || a.title.localeCompare(b.title))
  articleCache = out
  return out
}

export function isPublic(a: Article): boolean {
  if (a.status === 'sample') return SHOW_SAMPLES
  if (a.status === 'draft') return false
  return a.datePublished <= today()
}

export function getPublicArticles(): Article[] {
  return getAllArticles().filter(isPublic)
}

export function getArticle(slug: string): Article | undefined {
  return getAllArticles().find(a => a.slug === slug)
}

export function getPublicArticle(slug: string): Article | undefined {
  const a = getArticle(slug)
  return a && isPublic(a) ? a : undefined
}

export function getSection(slug: string): Section | undefined {
  return SECTIONS.find(s => s.slug === slug)
}

export function articlesInSection(section: Section, articles = getPublicArticles()): Article[] {
  return articles.filter(a => a.type === section.type)
}

/** Sections that actually have content — the only ones that get a page, a nav
 *  entry, or a sitemap line. An empty category page is thin content. */
export function liveSections(articles = getPublicArticles()): Section[] {
  return SECTIONS.filter(s => articlesInSection(s, articles).length > 0)
}

/** The featured story: the newest article flagged `featured: true`, else the
 *  newest article. Editorial, not hardcoded — flip the flag in frontmatter. */
export function getFeatured(articles = getPublicArticles()): Article | undefined {
  return articles.find(a => a.featured) || articles[0]
}

export function articlesByAuthor(slug: string, articles = getPublicArticles()): Article[] {
  return articles.filter(a => a.authorSlug === slug)
}

/** Public authors: not hidden, and with at least one public article. A profile
 *  with nothing under it is a promise, not a page. */
export function getPublicAuthors(): Author[] {
  const pub = getPublicArticles()
  return getAuthors().filter(a => !a.hidden && pub.some(p => p.authorSlug === a.slug))
}

/** Related: same section first, then shared tags, never the article itself. */
export function getRelated(article: Article, limit = 3, articles = getPublicArticles()): Article[] {
  const others = articles.filter(a => a.slug !== article.slug)
  const score = (a: Article) =>
    (a.type === article.type ? 2 : 0) + a.tags.filter(t => article.tags.includes(t)).length
  return others
    .map(a => ({ a, s: score(a) }))
    .sort((x, y) => y.s - x.s || y.a.datePublished.localeCompare(x.a.datePublished))
    .slice(0, limit)
    .map(x => x.a)
}

/** Faithful Kids resources shown under an article. Frontmatter `resources`
 *  wins; otherwise a small, honest default keyed on the article's tags.
 *  Never more than three, never unrelated to the piece. */
export function resourcesFor(article: Article): LinkItem[] {
  if (article.resources.length) return article.resources.slice(0, 3)
  const t = new Set(article.tags)
  const picks: LinkItem[] = []
  if (t.has('Homeschooling') || t.has('Christian Education')) picks.push({ label: 'Bible curriculum for homeschool families', href: '/homeschool' })
  if (t.has("Children's Ministry") || t.has('Sunday School')) picks.push({ label: 'Faithful Kids is free for churches', href: '/churches' })
  if (t.has('Family Bible Study') || t.has('Faith at Home') || t.has('Family Traditions')) picks.push({ label: '200 free Bible stories for kids', href: '/bible-stories-for-kids' })
  if (t.has('Faith and Technology')) picks.push({ label: 'Christian alternatives to YouTube for kids', href: '/blog/christian-alternatives-to-youtube-for-kids' })
  if (picks.length < 2) picks.push({ label: 'Free printables: coloring pages, word searches, maps', href: '/printables' })
  if (picks.length < 3) picks.push({ label: 'The Faithful Kids app: 300+ Bible video lessons with quizzes', href: '/quiz' })
  return picks.slice(0, 3)
}

/* ------------------------------------------------------------ markdown edition */

export function getArticleMarkdown(slug: string): string | null {
  const a = getPublicArticle(slug)
  if (!a) return null
  const meta = [
    `**Section:** ${a.section.label}`,
    `**By:** ${a.author.name}${a.author.role ? `, ${a.author.role}` : ''}`,
    `**Published:** ${a.datePublished}`,
    `**Updated:** ${a.dateModified}`,
    `**Canonical:** https://faithfulkids.app/parenting/${a.slug}`,
  ]
  const body = a.body
    .replace(/^\s*# [^\n]*\n+/, '')
    .replace(/\]\((\/[^)\s]*)\)/g, '](https://faithfulkids.app$1)')
    .trim()
  const sources = a.sources.length ? ['', '## Sources', '', ...a.sources.map(s => `- [${s.label}](${s.href})`)] : []
  return [
    `# ${a.title}`,
    '',
    a.subtitle ? `*${a.subtitle}*` : `> ${a.metaDescription}`,
    '',
    meta.join('  \n'),
    '',
    '---',
    '',
    body,
    ...sources,
    '',
    '---',
    '',
    `*Parenting at Faithful Kids (https://faithfulkids.app/parenting): real stories, thoughtful perspectives, and practical wisdom from Christian parents, educators, and ministry leaders. The HTML page is canonical.*`,
    '',
  ].join('\n')
}

/* ---------------------------------------------------------------- helpers */

export function fmtDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export function articleUrl(a: Pick<Article, 'slug'>): string {
  return `https://faithfulkids.app/parenting/${a.slug}`
}
