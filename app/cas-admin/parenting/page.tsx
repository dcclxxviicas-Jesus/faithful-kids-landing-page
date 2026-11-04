'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

/*
 * The Parenting desk. Lives under /cas-admin so it inherits the password gate
 * convention and the noindex layout. One person runs it.
 *
 * Four tabs: Pitches (contributor submissions with an editorial workflow),
 * Outreach (a lightweight contributor-recruitment tracker), Articles (every
 * Markdown article on disk with status and a preview link) and Newsletter
 * (subscriber counts). Articles themselves are edited as files in the repo;
 * the desk shows their state, it does not replace git.
 */

const CSS = `
*{box-sizing:border-box}
body{margin:0;background:#0f1720;color:#e6eef6;font-family:system-ui,-apple-system,Segoe UI,sans-serif}
.root{min-height:100vh;padding:0 0 80px}
.gate{max-width:320px;margin:18vh auto;display:flex;flex-direction:column;gap:12px;text-align:center}
.gate h1{font-size:1.3rem;margin:0 0 6px}
input,select,textarea,button{font-family:inherit;font-size:14px}
.gate input,.gate button{padding:11px 14px;border-radius:10px;border:1px solid #2b3a4a;background:#18222e;color:#e6eef6}
.gate button{background:#16a34a;border-color:#16a34a;font-weight:700;cursor:pointer}
.wrap{max-width:1240px;margin:0 auto;padding:22px 20px}
.head{display:flex;align-items:center;gap:14px;margin-bottom:18px;flex-wrap:wrap}
.head h1{font-size:1.2rem;margin:0}
.head a{color:#7fd4a0;font-size:13px}
.head .sp{flex:1}
.tabs{display:flex;gap:6px;margin-bottom:18px;flex-wrap:wrap}
.tab{padding:9px 14px;border-radius:999px;border:1px solid #2b3a4a;background:#101a24;color:#9fb3c8;cursor:pointer;font-weight:600}
.tab.on{background:#16a34a;border-color:#16a34a;color:#fff}
.tab b{margin-left:6px;background:rgba(255,255,255,.14);padding:1px 7px;border-radius:999px;font-size:11px}
.card{background:#18222e;border:1px solid #2b3a4a;border-radius:14px;padding:18px;margin-bottom:16px}
.card h2{font-size:.95rem;margin:0 0 14px;text-transform:uppercase;letter-spacing:.06em;color:#9fb3c8}
.row{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.row3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px}
.f{margin-bottom:10px}
.f label{display:block;font-size:12px;color:#9fb3c8;margin-bottom:4px}
.f input,.f select,.f textarea{width:100%;padding:9px 11px;border-radius:9px;border:1px solid #2b3a4a;background:#101a24;color:#e6eef6}
.f textarea{min-height:70px;resize:vertical}
.btns{display:flex;gap:9px;margin-top:10px;flex-wrap:wrap}
.btn{padding:9px 14px;border-radius:999px;border:1px solid #2b3a4a;background:#101a24;color:#e6eef6;cursor:pointer;font-weight:600}
.btn.go{background:#16a34a;border-color:#16a34a;color:#fff}
.btn.danger{border-color:#7f1d1d;color:#fca5a5}
.btn:disabled{opacity:.45;cursor:not-allowed}
.hint{font-size:12px;color:#8aa0b6;line-height:1.55;margin:8px 0 0}
.err{color:#fca5a5;font-size:13px;margin:10px 0 0}
.warn{background:#3b2a16;border:1px solid #b45309;border-radius:12px;padding:12px 14px;font-size:13px;line-height:1.55;margin-bottom:16px}
.warn code{background:#1f1a12;padding:1px 6px;border-radius:5px}
table{width:100%;border-collapse:collapse;font-size:13px}
th{text-align:left;color:#9fb3c8;font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:.05em;padding:0 8px 8px;border-bottom:1px solid #2b3a4a}
td{padding:10px 8px;border-bottom:1px solid #22303e;vertical-align:top}
tr.sel td{background:#101a24}
tr.click{cursor:pointer}
tr.click:hover td{background:#141e29}
.pill{display:inline-block;padding:2px 9px;border-radius:999px;font-size:11px;font-weight:700;white-space:nowrap}
.pill.received,.pill.not_contacted{background:#1e3a52;color:#9fd4ff}
.pill.under_review,.pill.contacted,.pill.interested{background:#3b3416;color:#fbd15b}
.pill.accepted,.pill.drafting,.pill.editing,.pill.awaiting_approval,.pill.pitched{background:#2a2550;color:#c4b5fd}
.pill.scheduled{background:#1b3a3a;color:#67e8f9}
.pill.published,.pill.confirmed{background:#0f2e1d;color:#6ee7a0}
.pill.declined,.pill.withdrawn,.pill.archived,.pill.do_not_contact,.pill.unsubscribed{background:#3a1f22;color:#fca5a5}
.pill.draft,.pill.pending{background:#2b3a4a;color:#cbd5e1}
.pill.sample{background:#3b3416;color:#fbd15b}
.tiny{color:#8aa0b6;font-size:11px}
.filters{display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;align-items:center}
.filters input,.filters select{padding:8px 11px;border-radius:9px;border:1px solid #2b3a4a;background:#101a24;color:#e6eef6}
.cols{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,460px);gap:18px;align-items:start}
@media(max-width:1000px){.cols{grid-template-columns:1fr}.row,.row3{grid-template-columns:1fr}}
.pre{white-space:pre-wrap;line-height:1.55;font-size:13px;background:#101a24;border-radius:10px;padding:12px;border:1px solid #22303e;max-height:280px;overflow:auto}
.kv{display:grid;grid-template-columns:120px 1fr;gap:6px 10px;font-size:13px;margin-bottom:12px}
.kv span:first-child{color:#8aa0b6}
.stat{display:flex;gap:18px;flex-wrap:wrap}
.stat div{background:#101a24;border:1px solid #22303e;border-radius:12px;padding:14px 18px;min-width:140px}
.stat b{display:block;font-size:1.6rem}
.stat span{color:#8aa0b6;font-size:12px}
a.lnk{color:#7fd4a0}
`

type Submission = {
  id: string; created_at: string; updated_at: string; name: string; email: string; role: string; topic: string; pitch: string
  experience: string | null; url: string | null; wants_interview: boolean; source: string | null; status: string
  assigned_to: string | null; notes: string | null; consent_terms_at: string | null; consent_adult: boolean
  consent_publish_at: string | null; consent_publish_note: string | null; article_slug: string | null; author_slug: string | null
}
type Outreach = {
  id: string; created_at: string; updated_at: string; name: string; organization: string | null; email: string | null; role: string | null
  relationship_source: string | null; expertise: string | null; suggested_topic: string | null; status: string; last_contact_at: string | null
  next_follow_up_at: string | null; notes: string | null; contact_preference: string | null; do_not_contact: boolean; submission_id: string | null; article_slug: string | null
}
type ArticleRow = { slug: string; title: string; type: string; status: string; author: string; authorSlug: string; datePublished: string; dateModified: string; words: number; featured: boolean; hasImage: boolean; isPublic: boolean }
type AuthorRow = { slug: string; name: string; role: string; hidden: boolean; hasPhoto: boolean }
type Subscriber = { id: string; created_at: string; email: string; status: string; source: string | null; confirmed_at: string | null }
type Payload = {
  articles: ArticleRow[]; authors: AuthorRow[]; dbConfigured: boolean; tableMissing?: string
  submissions?: Submission[]; outreach?: Outreach[]; subscribers?: Subscriber[]; subscriberCounts?: Record<string, number>
}

const SUB_STATUSES = ['received', 'under_review', 'accepted', 'drafting', 'editing', 'awaiting_approval', 'scheduled', 'published', 'declined', 'withdrawn', 'archived']
const OUT_STATUSES = ['not_contacted', 'contacted', 'interested', 'pitched', 'accepted', 'published', 'declined', 'do_not_contact']
const SOURCES = ['creator', 'church', 'publisher', 'homeschool', 'ministry', 'podcast', 'author', 'referral', 'inbound', 'other']
const label = (s: string) => s.replace(/_/g, ' ')
const short = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '')

export default function ParentingDesk() {
  const [pw, setPw] = useState('')
  const [authed, setAuthed] = useState(false)
  const [data, setData] = useState<Payload | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [tab, setTab] = useState<'pitches' | 'outreach' | 'articles' | 'newsletter'>('pitches')

  const api = useCallback(async (password: string, body?: Record<string, unknown>) => {
    const res = await fetch('/api/parenting/admin', {
      method: body ? 'POST' : 'GET',
      headers: { 'x-admin-password': password, ...(body ? { 'Content-Type': 'application/json' } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    })
    if (res.status === 401) { setAuthed(false); localStorage.removeItem('casAdminPw'); throw new Error('Wrong password') }
    const json = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(json.error || `Error ${res.status}`)
    return json
  }, [])

  const load = useCallback(async (password: string) => {
    setBusy(true); setError('')
    try {
      const d = await api(password) as Payload
      setData(d); setAuthed(true); localStorage.setItem('casAdminPw', password)
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed') } finally { setBusy(false) }
  }, [api])

  useEffect(() => {
    const saved = localStorage.getItem('casAdminPw')
    if (saved) { setPw(saved); load(saved) }
  }, [load])

  const act = useCallback(async (body: Record<string, unknown>) => {
    setBusy(true); setError('')
    try { await api(pw, body); await load(pw) } catch (e) { setError(e instanceof Error ? e.message : 'Failed') } finally { setBusy(false) }
  }, [api, pw, load])

  if (!authed) {
    return (
      <div className="root"><style>{CSS}</style>
        <form className="gate" onSubmit={e => { e.preventDefault(); load(pw) }}>
          <h1>Parenting desk</h1>
          <input type="password" placeholder="Admin password" value={pw} onChange={e => setPw(e.target.value)} autoFocus />
          <button type="submit" disabled={busy}>{busy ? 'Checking…' : 'Enter'}</button>
          {error && <p className="err">{error}</p>}
        </form>
      </div>
    )
  }

  const counts = {
    pitches: data?.submissions?.filter(s => s.status === 'received' || s.status === 'under_review').length ?? 0,
    outreach: data?.outreach?.length ?? 0,
    articles: data?.articles.length ?? 0,
    newsletter: data?.subscriberCounts?.confirmed ?? 0,
  }

  return (
    <div className="root"><style>{CSS}</style>
      <div className="wrap">
        <header className="head">
          <h1>Parenting desk</h1>
          <a href="/cas-admin">stats</a><a href="/cas-admin/contracts">contracts</a><a href="/parenting" target="_blank">public section ↗</a>
          <span className="sp" />
          <button className="btn" onClick={() => load(pw)} disabled={busy}>{busy ? 'Loading…' : 'Refresh'}</button>
          <button className="btn" onClick={async () => { await act({ action: 'logout' }); localStorage.removeItem('casAdminPw'); setAuthed(false) }}>Log out</button>
        </header>

        {data && !data.dbConfigured && <div className="warn">Supabase env vars are missing, so pitches, outreach and newsletter are unavailable. Articles still list.</div>}
        {data?.tableMissing && <div className="warn">Database tables not created yet. Run <code>supabase-parenting-migration.sql</code> in the Supabase SQL editor once, then refresh. ({data.tableMissing})</div>}
        {error && <p className="err">{error}</p>}

        <nav className="tabs">
          {(['pitches', 'outreach', 'articles', 'newsletter'] as const).map(t => (
            <button key={t} className={`tab${tab === t ? ' on' : ''}`} onClick={() => setTab(t)}>{t[0].toUpperCase() + t.slice(1)}<b>{counts[t]}</b></button>
          ))}
        </nav>

        {tab === 'pitches' && data && <Pitches rows={data.submissions || []} authors={data.authors} articles={data.articles} act={act} busy={busy} />}
        {tab === 'outreach' && data && <OutreachTab rows={data.outreach || []} act={act} busy={busy} />}
        {tab === 'articles' && data && <Articles rows={data.articles} authors={data.authors} />}
        {tab === 'newsletter' && data && <Newsletter rows={data.subscribers || []} counts={data.subscriberCounts || {}} />}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------- pitches */

function Pitches({ rows, authors, articles, act, busy }: { rows: Submission[]; authors: AuthorRow[]; articles: ArticleRow[]; act: (b: Record<string, unknown>) => Promise<void>; busy: boolean }) {
  const [q, setQ] = useState('')
  const [st, setSt] = useState('open')
  const [sel, setSel] = useState<string | null>(null)
  const [note, setNote] = useState('')
  const [assigned, setAssigned] = useState('')
  const [consentNote, setConsentNote] = useState('')

  const filtered = useMemo(() => rows.filter(r => {
    if (st === 'open' && ['declined', 'withdrawn', 'archived', 'published'].includes(r.status)) return false
    if (st !== 'open' && st !== 'all' && r.status !== st) return false
    if (q) {
      const h = `${r.name} ${r.email} ${r.topic} ${r.pitch} ${r.role}`.toLowerCase()
      if (!h.includes(q.toLowerCase())) return false
    }
    return true
  }), [rows, q, st])
  const cur = rows.find(r => r.id === sel) || null
  useEffect(() => { setAssigned(cur?.assigned_to || ''); setConsentNote(cur?.consent_publish_note || ''); setNote('') }, [cur?.id, cur?.assigned_to, cur?.consent_publish_note])
  const history = cur ? rows.filter(r => r.email === cur.email && r.id !== cur.id) : []

  return (
    <div className="cols">
      <section className="card">
        <h2>Contributor pitches</h2>
        <div className="filters">
          <input placeholder="Search name, email, topic…" value={q} onChange={e => setQ(e.target.value)} />
          <select value={st} onChange={e => setSt(e.target.value)}>
            <option value="open">Open</option><option value="all">All</option>
            {SUB_STATUSES.map(s => <option key={s} value={s}>{label(s)}</option>)}
          </select>
          <span className="tiny">{filtered.length} of {rows.length}</span>
        </div>
        {filtered.length === 0 ? <p className="hint">No pitches match. New pitches arrive here from /parenting/write-for-us and by email.</p> : (
          <table>
            <thead><tr><th>When</th><th>Who</th><th>Topic</th><th>Status</th></tr></thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} className={`click${sel === r.id ? ' sel' : ''}`} onClick={() => setSel(r.id)}>
                  <td className="tiny">{short(r.created_at)}</td>
                  <td>{r.name}<br /><span className="tiny">{r.role}{r.wants_interview ? ' · interview' : ''}</span></td>
                  <td>{r.topic}</td>
                  <td><span className={`pill ${r.status}`}>{label(r.status)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="card">
        <h2>{cur ? 'Pitch' : 'Select a pitch'}</h2>
        {!cur ? <p className="hint">Click a row to read the full pitch, change its status, add notes, record publishing consent, or link it to an article and author file.</p> : (
          <>
            <div className="kv">
              <span>From</span><span>{cur.name} · <a className="lnk" href={`mailto:${cur.email}?subject=${encodeURIComponent('Re: ' + cur.topic)}`}>{cur.email}</a></span>
              <span>Role</span><span>{cur.role}{cur.wants_interview ? ' · would rather be interviewed' : ''}</span>
              <span>Received</span><span>{new Date(cur.created_at).toLocaleString()}</span>
              <span>Consent</span><span>Terms {cur.consent_terms_at ? 'accepted' : 'not recorded'} · adult {cur.consent_adult ? 'yes' : 'no'} · publish {cur.consent_publish_at ? `recorded ${short(cur.consent_publish_at)}` : 'not yet'}</span>
              {cur.url && <><span>Link</span><span><a className="lnk" href={cur.url} target="_blank" rel="noopener">{cur.url}</a></span></>}
              {cur.source && <><span>Page</span><span>{cur.source}</span></>}
              {history.length > 0 && <><span>History</span><span>{history.length} other pitch{history.length > 1 ? 'es' : ''} from this address: {history.map(h => `${h.topic} (${label(h.status)})`).join('; ')}</span></>}
            </div>
            <div className="f"><label>Topic</label><div style={{ fontWeight: 700 }}>{cur.topic}</div></div>
            <div className="f"><label>Pitch</label><div className="pre">{cur.pitch}</div></div>
            {cur.experience && <div className="f"><label>Experience</label><div className="pre">{cur.experience}</div></div>}

            <div className="f"><label>Status</label>
              <select value={cur.status} onChange={e => act({ action: 'submission.status', id: cur.id, status: e.target.value })} disabled={busy}>
                {SUB_STATUSES.map(s => <option key={s} value={s}>{label(s)}</option>)}
              </select>
              <p className="hint">Received → Under review → Accepted → Drafting → Editing → Awaiting approval → Scheduled → Published. Declined / Withdrawn / Archived close it.</p>
            </div>
            <div className="row">
              <div className="f"><label>Assigned editor</label><input value={assigned} onChange={e => setAssigned(e.target.value)} onBlur={() => assigned !== (cur.assigned_to || '') && act({ action: 'submission.update', id: cur.id, assigned_to: assigned })} placeholder="Christian" /></div>
              <div className="f"><label>Article file (slug)</label>
                <select value={cur.article_slug || ''} onChange={e => act({ action: 'submission.update', id: cur.id, article_slug: e.target.value })} disabled={busy}>
                  <option value="">none yet,</option>
                  {articles.map(a => <option key={a.slug} value={a.slug}>{a.slug} ({a.status})</option>)}
                </select>
              </div>
            </div>
            <div className="row">
              <div className="f"><label>Author file (slug)</label>
                <select value={cur.author_slug || ''} onChange={e => act({ action: 'submission.update', id: cur.id, author_slug: e.target.value })} disabled={busy}>
                  <option value="">none yet,</option>
                  {authors.map(a => <option key={a.slug} value={a.slug}>{a.name} ({a.slug})</option>)}
                </select>
              </div>
              <div className="f"><label>Publishing consent</label>
                <div className="btns" style={{ marginTop: 0 }}>
                  <button className={`btn${cur.consent_publish_at ? '' : ' go'}`} disabled={busy} onClick={() => act({ action: 'submission.update', id: cur.id, consent_publish: !cur.consent_publish_at, consent_publish_note: consentNote })}>
                    {cur.consent_publish_at ? 'Clear consent' : 'Record consent'}
                  </button>
                </div>
                <input style={{ marginTop: 8 }} value={consentNote} onChange={e => setConsentNote(e.target.value)} placeholder="how it was given, e.g. email 12 Nov" onBlur={() => consentNote !== (cur.consent_publish_note || '') && act({ action: 'submission.update', id: cur.id, consent_publish_note: consentNote })} />
              </div>
            </div>
            <div className="f"><label>Notes (private, append-only)</label>
              {cur.notes && <div className="pre" style={{ marginBottom: 8 }}>{cur.notes}</div>}
              <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Add a note…" />
              <div className="btns"><button className="btn" disabled={busy || !note.trim()} onClick={async () => { await act({ action: 'submission.note', id: cur.id, note }); setNote('') }}>Add note</button></div>
            </div>
            <p className="hint">Nothing here is public. To publish: create <code>content/parenting/&lt;slug&gt;.md</code> and the author file, set status to published, commit and deploy, then link them above.</p>
          </>
        )}
      </section>
    </div>
  )
}

/* ------------------------------------------------------------ outreach */

const EMPTY_OUT = { name: '', organization: '', email: '', role: '', relationship_source: 'creator', expertise: '', suggested_topic: '', contact_preference: 'email', notes: '' }

function OutreachTab({ rows, act, busy }: { rows: Outreach[]; act: (b: Record<string, unknown>) => Promise<void>; busy: boolean }) {
  const [q, setQ] = useState('')
  const [st, setSt] = useState('active')
  const [sel, setSel] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_OUT)
  const [edit, setEdit] = useState<Partial<Outreach>>({})

  const filtered = useMemo(() => rows.filter(r => {
    if (st === 'active' && ['declined', 'do_not_contact', 'published'].includes(r.status)) return false
    if (st === 'due' && !(r.next_follow_up_at && r.next_follow_up_at <= new Date().toISOString().slice(0, 10))) return false
    if (!['active', 'all', 'due'].includes(st) && r.status !== st) return false
    if (q) {
      const h = `${r.name} ${r.organization} ${r.email} ${r.role} ${r.expertise} ${r.suggested_topic}`.toLowerCase()
      if (!h.includes(q.toLowerCase())) return false
    }
    return true
  }), [rows, q, st])
  const cur = rows.find(r => r.id === sel) || null
  useEffect(() => { setEdit(cur ? { ...cur } : {}) }, [cur?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  function save(k: keyof Outreach) {
    if (!cur) return
    if ((edit[k] ?? '') !== (cur[k] ?? '')) act({ action: 'outreach.update', id: cur.id, [k]: edit[k] ?? '' })
  }

  return (
    <div className="cols">
      <section className="card">
        <h2>Contributor outreach</h2>
        <div className="filters">
          <input placeholder="Search…" value={q} onChange={e => setQ(e.target.value)} />
          <select value={st} onChange={e => setSt(e.target.value)}>
            <option value="active">Active</option><option value="due">Follow-up due</option><option value="all">All</option>
            {OUT_STATUSES.map(s => <option key={s} value={s}>{label(s)}</option>)}
          </select>
          <span className="tiny">{filtered.length} of {rows.length}</span>
        </div>
        {filtered.length === 0 ? <p className="hint">No contacts yet. Add people by hand on the right: existing creators, churches, publishers, homeschool leaders. Nothing is imported automatically and nothing here sends email.</p> : (
          <table>
            <thead><tr><th>Who</th><th>Source</th><th>Status</th><th>Last / next</th></tr></thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} className={`click${sel === r.id ? ' sel' : ''}`} onClick={() => setSel(r.id)}>
                  <td>{r.name}{r.organization && <><br /><span className="tiny">{r.organization}</span></>}{r.role && <><br /><span className="tiny">{r.role}</span></>}</td>
                  <td className="tiny">{r.relationship_source || ''}</td>
                  <td><span className={`pill ${r.status}`}>{label(r.status)}</span></td>
                  <td className="tiny">{short(r.last_contact_at) || '–'}{r.next_follow_up_at ? <><br />next {r.next_follow_up_at}</> : null}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <div>
        <section className="card">
          <h2>{cur ? 'Contact' : 'Add a contact'}</h2>
          {!cur ? (
            <>
              <div className="row">
                <div className="f"><label>Name *</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                <div className="f"><label>Organization</label><input value={form.organization} onChange={e => setForm({ ...form, organization: e.target.value })} /></div>
              </div>
              <div className="row">
                <div className="f"><label>Email</label><input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
                <div className="f"><label>Role</label><input value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} placeholder="children's pastor, homeschool mom…" /></div>
              </div>
              <div className="row">
                <div className="f"><label>Relationship source</label><select value={form.relationship_source} onChange={e => setForm({ ...form, relationship_source: e.target.value })}>{SOURCES.map(s => <option key={s}>{s}</option>)}</select></div>
                <div className="f"><label>Contact preference</label><select value={form.contact_preference} onChange={e => setForm({ ...form, contact_preference: e.target.value })}><option>email</option><option>phone</option><option>dm</option><option>via manager</option></select></div>
              </div>
              <div className="f"><label>Expertise</label><input value={form.expertise} onChange={e => setForm({ ...form, expertise: e.target.value })} /></div>
              <div className="f"><label>Suggested topic</label><input value={form.suggested_topic} onChange={e => setForm({ ...form, suggested_topic: e.target.value })} /></div>
              <div className="f"><label>Notes</label><textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
              <div className="btns"><button className="btn go" disabled={busy || !form.name.trim()} onClick={async () => { await act({ action: 'outreach.create', ...form }); setForm(EMPTY_OUT) }}>Add contact</button></div>
              <p className="hint">Only add people you have a real relationship with or a legitimate reason to contact. This tracker never emails anyone and never feeds the newsletter.</p>
            </>
          ) : (
            <>
              <div className="btns" style={{ marginTop: 0, marginBottom: 12 }}><button className="btn" onClick={() => setSel(null)}>← New contact</button>{cur.email && <a className="btn" href={`mailto:${cur.email}`}>Email</a>}</div>
              <div className="row">
                <div className="f"><label>Name</label><input value={edit.name || ''} onChange={e => setEdit({ ...edit, name: e.target.value })} onBlur={() => save('name')} /></div>
                <div className="f"><label>Organization</label><input value={edit.organization || ''} onChange={e => setEdit({ ...edit, organization: e.target.value })} onBlur={() => save('organization')} /></div>
              </div>
              <div className="row">
                <div className="f"><label>Email</label><input value={edit.email || ''} onChange={e => setEdit({ ...edit, email: e.target.value })} onBlur={() => save('email')} /></div>
                <div className="f"><label>Role</label><input value={edit.role || ''} onChange={e => setEdit({ ...edit, role: e.target.value })} onBlur={() => save('role')} /></div>
              </div>
              <div className="row3">
                <div className="f"><label>Status</label>
                  <select value={cur.status} disabled={busy} onChange={e => act({ action: 'outreach.update', id: cur.id, status: e.target.value })}>{OUT_STATUSES.map(s => <option key={s} value={s}>{label(s)}</option>)}</select>
                </div>
                <div className="f"><label>Source</label><select value={edit.relationship_source || ''} onChange={e => { setEdit({ ...edit, relationship_source: e.target.value }); act({ action: 'outreach.update', id: cur.id, relationship_source: e.target.value }) }}>{SOURCES.map(s => <option key={s}>{s}</option>)}</select></div>
                <div className="f"><label>Next follow-up</label><input type="date" value={edit.next_follow_up_at || ''} onChange={e => setEdit({ ...edit, next_follow_up_at: e.target.value })} onBlur={() => save('next_follow_up_at')} /></div>
              </div>
              <div className="f"><label>Expertise</label><input value={edit.expertise || ''} onChange={e => setEdit({ ...edit, expertise: e.target.value })} onBlur={() => save('expertise')} /></div>
              <div className="f"><label>Suggested topic</label><input value={edit.suggested_topic || ''} onChange={e => setEdit({ ...edit, suggested_topic: e.target.value })} onBlur={() => save('suggested_topic')} /></div>
              <div className="row">
                <div className="f"><label>Contact preference</label><input value={edit.contact_preference || ''} onChange={e => setEdit({ ...edit, contact_preference: e.target.value })} onBlur={() => save('contact_preference')} /></div>
                <div className="f"><label>Published article slug</label><input value={edit.article_slug || ''} onChange={e => setEdit({ ...edit, article_slug: e.target.value })} onBlur={() => save('article_slug')} /></div>
              </div>
              <div className="f"><label>Notes</label><textarea value={edit.notes || ''} onChange={e => setEdit({ ...edit, notes: e.target.value })} onBlur={() => save('notes')} /></div>
              <p className="tiny">Last contact {cur.last_contact_at ? new Date(cur.last_contact_at).toLocaleString() : 'never'} · added {short(cur.created_at)}</p>
              <div className="btns">
                <button className="btn" disabled={busy} onClick={() => act({ action: 'outreach.update', id: cur.id, touch: true })}>Mark contacted today</button>
                <button className="btn danger" disabled={busy} onClick={() => { if (confirm('Delete this contact?')) { act({ action: 'outreach.delete', id: cur.id }); setSel(null) } }}>Delete</button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------ articles */

function Articles({ rows, authors }: { rows: ArticleRow[]; authors: AuthorRow[] }) {
  return (
    <>
      <section className="card">
        <h2>Articles on disk (content/parenting/*.md)</h2>
        {rows.length === 0 ? <p className="hint">No articles yet. Create <code>content/parenting/&lt;slug&gt;.md</code> following <code>content/parenting/README.md</code>.</p> : (
          <table>
            <thead><tr><th>Slug</th><th>Type</th><th>Author</th><th>Status</th><th>Dates</th><th>Words</th><th></th></tr></thead>
            <tbody>
              {rows.map(a => (
                <tr key={a.slug}>
                  <td>{a.title}<br /><span className="tiny">{a.slug}{a.featured ? ' · featured' : ''}{!a.hasImage ? ' · NO IMAGE' : ''}</span></td>
                  <td className="tiny">{a.type}</td>
                  <td className="tiny">{a.author}</td>
                  <td><span className={`pill ${a.status}`}>{a.status}</span>{a.status === 'scheduled' && !a.isPublic && <><br /><span className="tiny">waits for redeploy on/after date</span></>}</td>
                  <td className="tiny">{a.datePublished}{a.dateModified !== a.datePublished ? <><br />upd {a.dateModified}</> : null}</td>
                  <td className="tiny">{a.words}</td>
                  <td className="tiny">
                    <a className="lnk" href={`/parenting/preview/${a.slug}`} target="_blank" rel="noopener">preview</a>
                    {a.isPublic && <> · <a className="lnk" href={`/parenting/${a.slug}`} target="_blank" rel="noopener">live</a></>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <p className="hint">
          Publishing is a file change: set <code>status: "published"</code> and a <code>datePublished</code>, commit, deploy. Feature a piece with <code>featured: true</code> (the newest featured article leads the homepage). Unpublish by setting <code>status: "draft"</code> and redeploying. The preview link works because this desk set a 12-hour cookie when you logged in.
        </p>
      </section>
      <section className="card">
        <h2>Author files (content/parenting/authors/*.md)</h2>
        <table>
          <thead><tr><th>Name</th><th>Slug</th><th>Role</th><th>Photo</th><th>Public page</th></tr></thead>
          <tbody>
            {authors.map(a => (
              <tr key={a.slug}>
                <td>{a.name}</td><td className="tiny">{a.slug}</td><td className="tiny">{a.role}</td><td className="tiny">{a.hasPhoto ? 'yes' : 'no'}</td>
                <td className="tiny">{a.hidden ? 'hidden' : rows.some(r => r.authorSlug === a.slug && r.isPublic) ? <a className="lnk" href={`/parenting/authors/${a.slug}`} target="_blank" rel="noopener">live</a> : 'no public articles yet'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  )
}

/* ---------------------------------------------------------- newsletter */

function Newsletter({ rows, counts }: { rows: Subscriber[]; counts: Record<string, number> }) {
  return (
    <section className="card">
      <h2>Faithful Kids Weekly</h2>
      <div className="stat">
        <div><b>{counts.confirmed ?? 0}</b><span>confirmed</span></div>
        <div><b>{counts.pending ?? 0}</b><span>pending confirmation</span></div>
        <div><b>{counts.unsubscribed ?? 0}</b><span>unsubscribed</span></div>
      </div>
      <p className="hint">Double opt-in: only confirmed addresses may ever receive an issue. No sending tool exists yet; when one is built it must read this table and skip pending and unsubscribed rows. Export is intentionally absent from this page.</p>
      {rows.length > 0 && (
        <table style={{ marginTop: 14 }}>
          <thead><tr><th>When</th><th>Email</th><th>Status</th><th>Source</th></tr></thead>
          <tbody>
            {rows.slice(0, 100).map(r => (
              <tr key={r.id}><td className="tiny">{short(r.created_at)}</td><td>{r.email}</td><td><span className={`pill ${r.status}`}>{r.status}</span></td><td className="tiny">{r.source}</td></tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}
