import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { passwordOk } from '@/lib/parenting-admin-auth'
import {
  listAppSubmissions, getAppSubmission, patchAppSubmission, uniqueSlug, checkLinksToUs, dbConfigured, TableMissing, STATUSES,
  type AppSubmission, type SubmissionStatus,
} from '@/lib/app-directory-db'
import { sendApprovedEmail } from '@/lib/app-directory-emails'
import { DIRECTORY_TAG } from '@/lib/christian-apps'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/*
 * Review desk API for /cas-admin/apps. Password in x-admin-password on every
 * call (the existing admin convention). Approving gives the row a slug,
 * revalidates the directory, and emails the submitter their page link.
 * Listings are approved at the owner's discretion; the link check is only
 * information shown to him.
 */

const unauthorized = () => NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

function fail(err: unknown): NextResponse {
  if (err instanceof TableMissing) return NextResponse.json({ error: err.message, tableMissing: true }, { status: 503 })
  console.error('app directory admin error', err)
  return NextResponse.json({ error: err instanceof Error ? err.message : 'error' }, { status: 500 })
}

export async function GET(req: NextRequest) {
  if (!await passwordOk(req.headers.get('x-admin-password'))) return unauthorized()
  if (!dbConfigured()) return NextResponse.json({ error: 'Supabase env missing' }, { status: 503 })
  try {
    return NextResponse.json({ submissions: await listAppSubmissions() })
  } catch (err) { return fail(err) }
}

const EDITABLE: (keyof AppSubmission)[] = ['name', 'maker', 'category', 'ages', 'price_model', 'price', 'ios_url', 'android_url', 'web_url', 'description', 'admin_notes', 'age_groups']

export async function POST(req: NextRequest) {
  if (!await passwordOk(req.headers.get('x-admin-password'))) return unauthorized()
  let body: Record<string, unknown>
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Bad request' }, { status: 400 }) }
  const id = String(body.id || '')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  try {
    const row = await getAppSubmission(id)
    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    switch (String(body.action || '')) {
      case 'edit': {
        const patch: Partial<AppSubmission> = {}
        const edits = (body.patch || {}) as Record<string, unknown>
        for (const k of EDITABLE) if (k in edits) (patch as Record<string, unknown>)[k] = edits[k] === '' ? null : edits[k]
        const out = await patchAppSubmission(id, patch)
        if (out?.status === 'approved') { revalidateTag(DIRECTORY_TAG); revalidatePath('/christian-apps'); if (out.slug) revalidatePath(`/christian-apps/${out.slug}`) }
        return NextResponse.json({ row: out })
      }
      case 'status': {
        const status = String(body.status) as SubmissionStatus
        if (!STATUSES.includes(status)) return NextResponse.json({ error: 'Bad status' }, { status: 400 })
        const patch: Partial<AppSubmission> = { status }
        if (status === 'approved') {
          patch.slug = row.slug || await uniqueSlug(row.name, row.id)
          patch.approved_at = row.approved_at || new Date().toISOString()
        }
        const out = await patchAppSubmission(id, patch)
        revalidateTag(DIRECTORY_TAG)
        revalidatePath('/christian-apps')
        if (out?.slug) revalidatePath(`/christian-apps/${out.slug}`)
        let emailed = false
        if (status === 'approved' && row.status !== 'approved' && body.notify !== false && out?.slug) {
          emailed = await sendApprovedEmail(row.contact_email, row.contact_name, row.name, `https://faithfulkids.app/christian-apps/${out.slug}`).catch(() => false)
        }
        return NextResponse.json({ row: out, emailed })
      }
      case 'check-link': {
        const urls = [row.web_url, row.ios_url, row.android_url].filter(Boolean) as string[]
        const linked = await checkLinksToUs(urls)
        const out = await patchAppSubmission(id, { links_to_us: linked, links_checked_at: new Date().toISOString() })
        return NextResponse.json({ row: out })
      }
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }
  } catch (err) { return fail(err) }
}
