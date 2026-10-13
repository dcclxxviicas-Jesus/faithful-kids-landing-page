import { createHash, randomBytes } from 'crypto'
import { readFileSync, readdirSync } from 'fs'
import path from 'path'

/*
 * Creator contracts: templates, rendering, and the Supabase record.
 *
 * The template lives in the repo as Markdown, so git history is itself a
 * record of what any contract said on any date. At send time the template is
 * rendered against that creator's terms, and the resulting HTML is FROZEN
 * into the database row along with its SHA-256. Editing a template later
 * cannot change anything already sent — the row is the contract, not the file.
 *
 * No SDKs: Supabase over PostgREST and Resend over REST, matching lib/leads.ts.
 */

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY
const RESEND_KEY = process.env.RESEND_API_KEY

export const SITE_URL = 'https://faithfulkids.app'

/* The legal description has to match the Michigan filing exactly. If the
   entity is ever renamed or redomiciled, this line is the only place to
   change it — every contract already sent keeps its own frozen copy. */
export const SIGNING_PARTIES: Record<string, string> = {
  'Pixidon LLC': 'Pixidon LLC, a Michigan limited liability company',
  'Christian Alexander': 'Christian Alexander',
}

export type FieldType = 'text' | 'textarea' | 'money' | 'number' | 'date' | 'bool' | 'select'

export interface Field {
  key: string
  type: FieldType
  options?: string[]
  label: string
  default: string
  required: boolean
}

export interface Template {
  id: string
  title: string
  version: string
  fields: Field[]
  body: string
}

export type Vars = Record<string, string>

/* ---------------------------------------------------------------- templates */

const CONTRACTS_DIR = path.join(process.cwd(), 'contracts')

function parseTemplate(id: string, raw: string): Template {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!m) throw new Error(`contract template ${id} has no frontmatter`)
  const head = m[1]
  const body = m[2].trim()
  const meta: Record<string, string> = {}
  const fields: Field[] = []

  for (const line of head.split('\n')) {
    if (!line.trim() || line.trim().startsWith('#')) continue
    const i = line.indexOf(':')
    if (i < 0) continue
    const key = line.slice(0, i).trim()
    const value = line.slice(i + 1).trim()
    if (key !== 'field') { meta[key] = value; continue }

    // key | type | label | default | required
    const parts = value.split('|').map(s => s.trim())
    const rawType = parts[1] || 'text'
    const isSelect = rawType.startsWith('select:')
    fields.push({
      key: parts[0],
      type: (isSelect ? 'select' : rawType) as FieldType,
      options: isSelect ? rawType.slice(7).split(';').map(s => s.trim()) : undefined,
      label: parts[2] || parts[0],
      default: parts[3] || '',
      required: (parts[4] || '') === 'required',
    })
  }

  return { id, title: meta.title || id, version: meta.version || '1', fields, body }
}

export function listTemplates(): Template[] {
  return readdirSync(CONTRACTS_DIR)
    .filter(f => f.endsWith('.md'))
    .map(f => parseTemplate(f.replace(/\.md$/, ''), readFileSync(path.join(CONTRACTS_DIR, f), 'utf8')))
}

export function getTemplate(id: string): Template {
  // Reject anything that could climb out of contracts/ — id reaches this from
  // a request body.
  if (!/^[a-z0-9-]+$/.test(id)) throw new Error('bad template id')
  return parseTemplate(id, readFileSync(path.join(CONTRACTS_DIR, `${id}.md`), 'utf8'))
}

/* ------------------------------------------------------------- derived vars */

const money = (v: string) => {
  const n = Number(String(v).replace(/[^0-9.]/g, ''))
  if (!isFinite(n) || !n) return ''
  return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 2 })
}

const truthy = (v: string | undefined) =>
  !!v && v !== 'false' && v !== '0' && v.trim() !== ''

function feeBlock(v: Vars): string {
  const base = money(v.fee_base)
  const split = Number(v.payment_split_pct || 0)
  const method = v.payment_method || 'PayPal'
  const lines: string[] = []

  if (split > 0 && split < 100) {
    lines.push(
      `A guaranteed fee of **${base}**, paid by ${method}: ${split}% once you sign this, ` +
      `and the rest once the content is posted.`
    )
  } else {
    lines.push(`A guaranteed fee of **${base}**, paid by ${method} once the content is posted.`)
  }

  if (v.bonus_basis === 'verified views' && truthy(v.fee_per_1k)) {
    lines.push(
      `On top of that, **${money(v.fee_per_1k)} for every 1,000 views**, counted 30 days after ` +
      `you post. You send us a screenshot of your own platform analytics at day 7 and day 30, ` +
      `and the day-30 number is what we pay on` +
      (truthy(v.fee_cap)
        ? `. The guarantee and the bonus together are capped at **${money(v.fee_cap)}**.`
        : `.`) +
      ` We pay the bonus within 7 days of receiving your day-30 screenshot.`
    )
  } else if (v.bonus_basis === 'attributed signups' && truthy(v.fee_per_1k)) {
    lines.push(
      `On top of that, **${money(v.fee_per_1k)} for every subscription** started with your code ` +
      `or link within 30 days of you posting` +
      (truthy(v.fee_cap)
        ? `, with the guarantee and the bonus together capped at **${money(v.fee_cap)}**.`
        : `.`) +
      ` We'll send you the count and pay within 7 days of the 30-day mark.`
    )
  }

  if (truthy(v.usage_b) && truthy(v.usage_b_fee)) {
    lines.push(
      `And **${money(v.usage_b_fee)}** for the paid-advertising permission described in ` +
      `section 4, paid with the first instalment above.`
    )
  }

  return lines.join('\n\n')
}

function usageBBlock(v: Vars): string {
  if (!truthy(v.usage_b)) {
    return (
      `**Paid advertising is not part of this deal.** We won't run your content as a paid ad ` +
      `anywhere, and we won't run ads from your handle. If we'd like to later, we'll come back ` +
      `to you and agree a separate fee for it — it's a separate thing you're selling, and this ` +
      `agreement doesn't include it.`
    )
  }
  const months = v.usage_b_months || '12'
  return (
    `**Paid advertising (included in this deal, priced separately).** ` +
    `For an additional **${money(v.usage_b_fee)}**, you're also allowing us to run this content ` +
    `as a paid advertisement on any social or advertising platform, including running it from ` +
    `your own handle where the platform supports that, for **${months} months from the first ` +
    `time we run it**. If a campaign is live when that period ends we have 30 days to wind it ` +
    `down rather than pulling it the same day. We may renew by agreeing a further fee with you. ` +
    `This permission covers advertising only — it doesn't widen anything else above.`
  )
}

export function derive(v: Vars, sentAt: Date): Vars {
  const posts = Number(v.posts || 1)
  const names = ['', 'one video', 'two videos', 'three videos', 'four videos', 'five videos']
  return {
    ...v,
    // Vercel's lambdas run UTC; a contract sent at 8pm ET would otherwise be
    // dated tomorrow. Eastern matches ADMIN_TZ and the rest of the business.
    sent_date: sentAt.toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/New_York',
    }),
    signing_party_full: SIGNING_PARTIES[v.signing_party] || v.signing_party || '',
    posts_phrase: names[posts] || `${posts} videos`,
    fee_block: feeBlock(v),
    usage_b_block: usageBBlock(v),
  }
}

/* The composites above are template-authored Markdown and must render as
   such. Everything else is operator input and gets neutralised first. */
const RAW_KEYS = new Set(['fee_block', 'usage_b_block'])

/* ---------------------------------------------------------------- rendering */

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// Also neutralise Markdown so a creator called "**Jo**" cannot bold a clause.
const escapeValue = (s: string) => escapeHtml(s).replace(/([*_`[\]])/g, '\\$1')

function resolveConditionals(src: string, v: Vars): string {
  let out = src
  for (let i = 0; i < 12; i++) {
    const next = out.replace(
      /\{\{#if (\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g,
      (_m, key: string, inner: string) => (truthy(v[key]) ? inner : '')
    )
    if (next === out) break
    out = next
  }
  return out
}

function renderMarkdown(src: string): string {
  const out: string[] = []
  let list: string[] = []
  const flush = () => {
    if (list.length) { out.push(`<ul>${list.map(li => `<li>${li}</li>`).join('')}</ul>`); list = [] }
  }
  const inline = (s: string) =>
    s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
     .replace(/\\([*_`[\]])/g, '$1')

  for (const block of src.split(/\n{2,}/)) {
    const b = block.trim()
    if (!b) continue
    if (b.startsWith('### ')) { flush(); out.push(`<h3>${inline(b.slice(4))}</h3>`); continue }
    if (b.startsWith('## ')) { flush(); out.push(`<h2>${inline(b.slice(3))}</h2>`); continue }
    if (/^[-*] /.test(b)) {
      flush()
      for (const line of b.split('\n')) list.push(inline(line.replace(/^[-*] /, '').trim()))
      flush()
      continue
    }
    flush()
    out.push(`<p>${inline(b).replace(/\n/g, '<br />')}</p>`)
  }
  flush()
  return out.join('\n')
}

export function render(tpl: Template, vars: Vars, sentAt: Date): string {
  const v = derive(vars, sentAt)
  let src = resolveConditionals(tpl.body, v)
  src = src.replace(/\{\{(\w+)\}\}/g, (_m, key: string) => {
    const value = v[key] ?? ''
    return RAW_KEYS.has(key) ? value : escapeValue(value)
  })
  return renderMarkdown(src)
}

export const sha256 = (s: string) => createHash('sha256').update(s, 'utf8').digest('hex')
export const newToken = () => randomBytes(32).toString('base64url')

/* ------------------------------------------------------------------ storage */

export interface ContractRow {
  id: string
  token: string
  template: string
  template_version: string
  talent_name: string
  talent_handle: string | null
  signer_name: string
  signer_email: string
  signer_capacity: string | null
  payee_name: string | null
  vars: Vars
  body_html: string
  body_sha256: string
  status: 'sent' | 'viewed' | 'signed' | 'voided'
  sent_at: string
  expires_at: string
  first_viewed_at: string | null
  signed_at: string | null
  voided_at: string | null
  void_reason: string | null
  signer_typed_name: string | null
  signer_ip: string | null
  signer_user_agent: string | null
  consent_electronic: boolean
  external: boolean
  external_note: string | null
}

async function supa(path: string, init: RequestInit = {}): Promise<Response> {
  if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error('Supabase env missing')
  return fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    ...init,
    cache: 'no-store',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  })
}

export async function insertContract(row: Partial<ContractRow>): Promise<ContractRow> {
  const res = await supa('/contracts', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify([row]),
  })
  if (!res.ok) throw new Error(`contract insert failed: ${res.status} ${await res.text()}`)
  return (await res.json())[0]
}

export async function getByToken(token: string): Promise<ContractRow | null> {
  const res = await supa(`/contracts?token=eq.${encodeURIComponent(token)}&limit=1`)
  if (!res.ok) return null
  const rows = await res.json()
  return rows[0] || null
}

export async function patchContract(id: string, patch: Partial<ContractRow>): Promise<ContractRow | null> {
  const res = await supa(`/contracts?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(patch),
  })
  if (!res.ok) return null
  const rows = await res.json()
  return rows[0] || null
}

export async function listContracts(): Promise<ContractRow[]> {
  const res = await supa('/contracts?select=*&order=sent_at.desc&limit=300')
  if (!res.ok) return []
  return res.json()
}

/* -------------------------------------------------------------------- email */

export async function sendMail(to: string, subject: string, html: string): Promise<boolean> {
  if (!RESEND_KEY) return false
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
    // Contracts send as Christian from the address creators already
    // correspond with. Never a new domain or subdomain: the pool is cautious
    // enough that people email to check an invitation is genuine.
    body: JSON.stringify({
      from: 'Christian Alexander <christian@faithfulkids.app>',
      to: [to],
      subject,
      html,
    }),
  })
  return res.ok
}
