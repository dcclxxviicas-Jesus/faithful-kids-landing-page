import { CURATED, DIRECTORY_TAG, type Listing, type Category, type AgeGroup, type PriceModel } from './christian-apps'

/*
 * Supabase access for the Christian Apps directory. PostgREST over fetch with
 * the service key, same pattern as lib/parenting-db.ts. Server only.
 * Table: app_directory_submissions (supabase-app-directory-migration.sql).
 */

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY
const TABLE = '/app_directory_submissions'

export function dbConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_KEY)
}

export class TableMissing extends Error {}

type FetchInit = RequestInit & { next?: { revalidate?: number; tags?: string[] } }

async function supa(path: string, init: FetchInit = {}): Promise<Response> {
  if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error('Supabase env missing')
  return fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    cache: init.next ? undefined : 'no-store',
    ...init,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  })
}

async function expectOk(res: Response, what: string): Promise<Response> {
  if (res.ok) return res
  const text = await res.text()
  if (res.status === 404 && /PGRST205|Could not find the table/.test(text)) throw new TableMissing(`${what}: table missing. Run supabase-app-directory-migration.sql.`)
  throw new Error(`${what} failed: ${res.status} ${text.slice(0, 300)}`)
}

export type SubmissionStatus = 'received' | 'approved' | 'rejected' | 'spam'
export const STATUSES: SubmissionStatus[] = ['received', 'approved', 'rejected', 'spam']

export interface AppSubmission {
  id: string
  created_at: string
  updated_at: string
  kind: 'app' | 'website'
  name: string
  maker: string | null
  category: Category
  ages: string | null
  age_groups: AgeGroup[]
  price_model: PriceModel
  price: string | null
  ios_url: string | null
  android_url: string | null
  web_url: string | null
  description: string
  contact_name: string
  contact_email: string
  contact_role: string
  notes_from_submitter: string | null
  status: SubmissionStatus
  slug: string | null
  admin_notes: string | null
  links_to_us: boolean | null
  links_checked_at: string | null
  approved_at: string | null
  source: string | null
}

export async function insertAppSubmission(row: Partial<AppSubmission> & { ip_hash?: string; user_agent?: string; referrer?: string | null }): Promise<AppSubmission> {
  const res = await expectOk(await supa(TABLE, {
    method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify([row]),
  }), 'insert app submission')
  return (await res.json())[0]
}

export async function recentByEmail(email: string, hours = 24): Promise<number> {
  const since = new Date(Date.now() - hours * 3600_000).toISOString()
  const res = await expectOk(await supa(
    `${TABLE}?select=id&contact_email=eq.${encodeURIComponent(email)}&created_at=gte.${encodeURIComponent(since)}`,
  ), 'count app submissions')
  return (await res.json()).length
}

export async function listAppSubmissions(limit = 500): Promise<AppSubmission[]> {
  const res = await expectOk(await supa(`${TABLE}?select=*&order=created_at.desc&limit=${limit}`), 'list app submissions')
  return res.json()
}

export async function getAppSubmission(id: string): Promise<AppSubmission | null> {
  const res = await expectOk(await supa(`${TABLE}?select=*&id=eq.${encodeURIComponent(id)}`), 'get app submission')
  return (await res.json())[0] || null
}

export async function patchAppSubmission(id: string, patch: Partial<AppSubmission>): Promise<AppSubmission | null> {
  const res = await expectOk(await supa(`${TABLE}?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH', headers: { Prefer: 'return=representation' }, body: JSON.stringify(patch),
  }), 'update app submission')
  return (await res.json())[0] || null
}

export function slugify(s: string): string {
  return s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'listing'
}

/** A slug that collides with neither a researched listing nor another row. */
export async function uniqueSlug(name: string, id: string): Promise<string> {
  const base = slugify(name)
  const taken = new Set(CURATED.map(c => c.slug))
  const rows = await listAppSubmissions(2000)
  rows.forEach(r => { if (r.slug && r.id !== id) taken.add(r.slug) })
  let s = base, n = 2
  while (taken.has(s)) s = `${base}-${n++}`
  return s
}

function toListing(r: AppSubmission): Listing | null {
  if (!r.slug) return null
  const platforms: Listing['platforms'] = {}
  if (r.ios_url) platforms.ios = r.ios_url
  if (r.android_url) platforms.android = r.android_url
  if (r.web_url) platforms.web = r.web_url
  const day = (r.approved_at || r.updated_at).slice(0, 10)
  return {
    slug: r.slug, name: r.name, maker: r.maker, category: r.category,
    ages: r.ages || 'Not stated', agesSource: 'maker', ageGroups: r.age_groups?.length ? r.age_groups : ['family'],
    priceModel: r.price_model, price: r.price || '', platforms, ads: 'unknown', updated: null,
    denomination: null, description: r.description, goodFor: '', worthKnowing: '',
    website: r.web_url, checkedOn: day, sources: [], kind: r.kind, submitted: true,
    audience: r.age_groups?.length && r.age_groups.every(g => g === 'family') ? 'both' : 'kids',
  }
}

/** Approved submissions for the public pages. Never throws: a missing table or
 *  an outage just means the curated list renders alone. */
export async function approvedListings(): Promise<Listing[]> {
  if (!dbConfigured()) return []
  try {
    const res = await supa(`${TABLE}?select=*&status=eq.approved&order=approved_at.asc&limit=1000`, {
      next: { revalidate: 3600, tags: [DIRECTORY_TAG] },
    })
    if (!res.ok) return []
    const rows: AppSubmission[] = await res.json()
    return rows.map(toListing).filter((x): x is Listing => Boolean(x))
  } catch {
    return []
  }
}

export async function allListings(): Promise<Listing[]> {
  const extra = await approvedListings()
  const seen = new Set(CURATED.map(c => c.slug))
  return [...CURATED, ...extra.filter(e => !seen.has(e.slug))]
}

/** Does any of the submitter's pages mention faithfulkids.app? Reported to the
 *  owner in the desk as information for his decision, nothing more. */
export async function checkLinksToUs(urls: string[]): Promise<boolean> {
  for (const u of urls) {
    if (!/^https?:\/\//.test(u) || /apps\.apple\.com|play\.google\.com/.test(u)) continue
    try {
      const ctl = new AbortController()
      const t = setTimeout(() => ctl.abort(), 8000)
      const res = await fetch(u, { signal: ctl.signal, headers: { 'User-Agent': 'Mozilla/5.0 (compatible; FaithfulKidsDirectory/1.0)' }, cache: 'no-store' })
      clearTimeout(t)
      const html = (await res.text()).slice(0, 2_000_000)
      if (/faithfulkids\.app/i.test(html)) return true
    } catch { /* unreachable page counts as no */ }
  }
  return false
}
