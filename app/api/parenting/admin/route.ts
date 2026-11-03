import { NextRequest, NextResponse } from 'next/server'
import { passwordOk, adminCookieValue, cookieHeader, clearCookieHeader } from '@/lib/parenting-admin-auth'
import {
  listSubmissions, patchSubmission, SUBMISSION_STATUSES, type SubmissionStatus,
  listOutreach, insertOutreach, patchOutreach, deleteOutreach, OUTREACH_STATUSES, type OutreachStatus,
  listSubscribers, dbConfigured, TableMissing,
} from '@/lib/parenting-db'
import { getAllArticles, getAuthors, isPublic } from '@/lib/parenting'

export const dynamic = 'force-dynamic'

/*
 * The Parenting desk API. Password in the x-admin-password header on every
 * call (the existing admin convention), checked server-side with a constant-
 * time compare. A successful GET also sets the httpOnly preview cookie so the
 * editor can open /parenting/preview/<slug> as a normal page.
 */

const unauthorized = () => NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

function fail(err: unknown): NextResponse {
  if (err instanceof TableMissing) return NextResponse.json({ error: err.message, tableMissing: true }, { status: 503 })
  console.error('parenting admin error', err)
  return NextResponse.json({ error: err instanceof Error ? err.message : 'error' }, { status: 500 })
}

export async function GET(req: NextRequest) {
  const pw = req.headers.get('x-admin-password')
  if (!await passwordOk(pw)) return unauthorized()

  const articles = getAllArticles().map(a => ({
    slug: a.slug, title: a.title, type: a.type, status: a.status, author: a.author.name, authorSlug: a.authorSlug,
    datePublished: a.datePublished, dateModified: a.dateModified, words: a.wordCount, featured: a.featured,
    hasImage: Boolean(a.image), isPublic: isPublic(a),
  }))
  const authors = getAuthors().map(a => ({ slug: a.slug, name: a.name, role: a.role, hidden: a.hidden, hasPhoto: Boolean(a.photo) }))

  const payload: Record<string, unknown> = { articles, authors, dbConfigured: dbConfigured() }
  if (dbConfigured()) {
    try {
      const [submissions, outreach, subscribers] = await Promise.all([listSubmissions(), listOutreach(), listSubscribers()])
      Object.assign(payload, { submissions, outreach, subscribers: subscribers.rows, subscriberCounts: subscribers.counts })
    } catch (err) {
      if (err instanceof TableMissing) payload.tableMissing = err.message
      else return fail(err)
    }
  }
  const res = NextResponse.json(payload)
  res.headers.set('Set-Cookie', cookieHeader(await adminCookieValue()))
  return res
}

export async function POST(req: NextRequest) {
  const pw = req.headers.get('x-admin-password')
  if (!await passwordOk(pw)) return unauthorized()

  let body: Record<string, unknown>
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Bad request' }, { status: 400 }) }
  const action = String(body.action || '')
  const str = (k: string, max = 2000) => (body[k] == null ? undefined : String(body[k]).slice(0, max))

  try {
    switch (action) {
      case 'logout': {
        const res = NextResponse.json({ ok: true })
        res.headers.set('Set-Cookie', clearCookieHeader())
        return res
      }

      /* ---- pitches ---- */
      case 'submission.status': {
        const status = str('status') as SubmissionStatus
        if (!SUBMISSION_STATUSES.includes(status)) return NextResponse.json({ error: 'Unknown status' }, { status: 400 })
        return NextResponse.json({ row: await patchSubmission(String(body.id), { status }) })
      }
      case 'submission.update': {
        const patch: Record<string, unknown> = {}
        for (const k of ['assigned_to', 'article_slug', 'author_slug', 'consent_publish_note'] as const) {
          if (k in body) patch[k] = str(k, 300) || null
        }
        if ('consent_publish' in body) patch.consent_publish_at = body.consent_publish ? new Date().toISOString() : null
        return NextResponse.json({ row: await patchSubmission(String(body.id), patch) })
      }
      case 'submission.note': {
        // Append-only notes with a timestamp, so the record reads as a log.
        const note = str('note', 4000)?.trim()
        if (!note) return NextResponse.json({ error: 'Empty note' }, { status: 400 })
        const rows = await listSubmissions()
        const cur = rows.find(r => r.id === body.id)
        if (!cur) return NextResponse.json({ error: 'Not found' }, { status: 404 })
        const stamp = new Date().toISOString().slice(0, 16).replace('T', ' ')
        const notes = `${cur.notes ? cur.notes + '\n\n' : ''}[${stamp}] ${note}`
        return NextResponse.json({ row: await patchSubmission(cur.id, { notes }) })
      }

      /* ---- outreach ---- */
      case 'outreach.create': {
        const name = str('name', 160)?.trim()
        if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })
        const row = await insertOutreach({
          name,
          organization: str('organization', 200) || null,
          email: str('email', 254)?.toLowerCase() || null,
          role: str('role', 120) || null,
          relationship_source: str('relationship_source', 80) || null,
          expertise: str('expertise', 500) || null,
          suggested_topic: str('suggested_topic', 300) || null,
          contact_preference: str('contact_preference', 80) || null,
          notes: str('notes', 4000) || null,
          status: 'not_contacted',
        })
        return NextResponse.json({ row })
      }
      case 'outreach.update': {
        const patch: Record<string, unknown> = {}
        for (const k of ['name', 'organization', 'email', 'role', 'relationship_source', 'expertise', 'suggested_topic', 'contact_preference', 'notes', 'article_slug', 'next_follow_up_at', 'submission_id'] as const) {
          if (k in body) patch[k] = str(k, k === 'notes' ? 4000 : 500) || null
        }
        if ('status' in body) {
          const status = str('status') as OutreachStatus
          if (!OUTREACH_STATUSES.includes(status)) return NextResponse.json({ error: 'Unknown status' }, { status: 400 })
          patch.status = status
          patch.do_not_contact = status === 'do_not_contact'
          if (status === 'contacted' || status === 'pitched') patch.last_contact_at = new Date().toISOString()
        }
        if (body.touch === true) patch.last_contact_at = new Date().toISOString()
        return NextResponse.json({ row: await patchOutreach(String(body.id), patch) })
      }
      case 'outreach.delete': {
        await deleteOutreach(String(body.id))
        return NextResponse.json({ ok: true })
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }
  } catch (err) {
    return fail(err)
  }
}
