'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

/*
 * Review desk for Christian Apps directory submissions. Same password gate as
 * the rest of /cas-admin (x-admin-password header, kept in sessionStorage).
 * Approve publishes the listing (the page revalidates) and emails the
 * submitter their link. "Check link" looks for faithfulkids.app on their
 * site, as information for the owner's decision.
 */

type Row = {
  id: string; created_at: string; kind: string; name: string; maker: string | null; category: string; ages: string | null
  age_groups: string[]; price_model: string; price: string | null; ios_url: string | null; android_url: string | null; web_url: string | null
  description: string; contact_name: string; contact_email: string; contact_role: string; notes_from_submitter: string | null
  status: 'received' | 'approved' | 'rejected' | 'spam'; slug: string | null; admin_notes: string | null
  links_to_us: boolean | null; links_checked_at: string | null
}

const CSS = `
*{box-sizing:border-box}body{margin:0;background:#0f1720;color:#e6eef6;font-family:system-ui,-apple-system,Segoe UI,sans-serif}
.gate{max-width:320px;margin:18vh auto;display:flex;flex-direction:column;gap:12px;text-align:center}
.gate input,.gate button{padding:11px 14px;border-radius:10px;border:1px solid #2b3a4a;background:#18222e;color:#e6eef6;font-size:14px}
.gate button{background:#16a34a;border-color:#16a34a;font-weight:700;cursor:pointer}
.wrap{max-width:1240px;margin:0 auto;padding:22px 20px 80px}
.head{display:flex;gap:14px;align-items:center;flex-wrap:wrap;margin-bottom:16px}.head h1{font-size:1.2rem;margin:0}.head a{color:#7fd4a0;font-size:13px}
.tabs{display:flex;gap:6px;margin-bottom:16px;flex-wrap:wrap}
.tab{padding:8px 13px;border-radius:999px;border:1px solid #2b3a4a;background:#101a24;color:#9fb3c8;cursor:pointer;font-weight:600}
.tab.on{background:#16a34a;border-color:#16a34a;color:#fff}.tab b{margin-left:6px;background:rgba(255,255,255,.14);padding:1px 7px;border-radius:999px;font-size:11px}
.grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.3fr);gap:16px}
.list{display:flex;flex-direction:column;gap:8px}
.item{background:#18222e;border:1px solid #2b3a4a;border-radius:12px;padding:12px 14px;cursor:pointer}
.item.sel{border-color:#16a34a}.item h3{margin:0 0 4px;font-size:15px}.item p{margin:0;color:#8aa0b6;font-size:12px}
.card{background:#18222e;border:1px solid #2b3a4a;border-radius:14px;padding:18px}
.f{margin-bottom:10px}.f label{display:block;font-size:12px;color:#9fb3c8;margin-bottom:4px}
.f input,.f textarea,.f select{width:100%;padding:8px 10px;border-radius:9px;border:1px solid #2b3a4a;background:#101a24;color:#e6eef6;font:inherit;font-size:14px}
.f textarea{min-height:110px}
.row{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.btns{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
.btn{padding:9px 14px;border-radius:999px;border:1px solid #2b3a4a;background:#101a24;color:#e6eef6;cursor:pointer;font-weight:600;font-size:13px}
.btn.go{background:#16a34a;border-color:#16a34a}.btn.danger{border-color:#7f1d1d;color:#fca5a5}.btn:disabled{opacity:.45}
.pill{display:inline-block;padding:2px 9px;border-radius:999px;font-size:11px;font-weight:700;margin-right:6px}
.received{background:#1e3a52;color:#9fd4ff}.approved{background:#14532d;color:#86efac}.rejected,.spam{background:#3b1d1d;color:#fca5a5}
.meta{font-size:13px;color:#9fb3c8;line-height:1.6}.meta a{color:#7fd4a0;word-break:break-all}
.warn{background:#3b2a16;border:1px solid #b45309;border-radius:12px;padding:12px 14px;font-size:13px;line-height:1.55;margin-bottom:16px}
.err{color:#fca5a5;font-size:13px}.ok{color:#86efac;font-size:13px}
@media(max-width:860px){.grid{grid-template-columns:1fr}}
`

export default function AppsDesk() {
  const [pw, setPw] = useState('')
  const [authed, setAuthed] = useState(false)
  const [rows, setRows] = useState<Row[]>([])
  const [tab, setTab] = useState<Row['status']>('received')
  const [sel, setSel] = useState<string | null>(null)
  const [draft, setDraft] = useState<Partial<Row>>({})
  const [msg, setMsg] = useState(''); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false)
  const [missing, setMissing] = useState('')

  const load = useCallback(async (p: string) => {
    setErr('')
    const res = await fetch('/api/christian-apps/admin', { headers: { 'x-admin-password': p } })
    if (res.status === 401) { setAuthed(false); setErr('Wrong password'); return }
    const j = await res.json()
    if (j.tableMissing) { setMissing(j.error); setAuthed(true); return }
    if (!res.ok) { setErr(j.error || 'Error'); return }
    setRows(j.submissions || []); setAuthed(true)
    try { sessionStorage.setItem('fk_admin_pw', p) } catch { /* noop */ }
  }, [])

  useEffect(() => { try { const p = sessionStorage.getItem('fk_admin_pw'); if (p) { setPw(p); load(p) } } catch { /* noop */ } }, [load])

  const counts = useMemo(() => rows.reduce<Record<string, number>>((a, r) => { a[r.status] = (a[r.status] || 0) + 1; return a }, {}), [rows])
  const shown = rows.filter(r => r.status === tab)
  const cur = rows.find(r => r.id === sel) || null
  useEffect(() => { setDraft(cur ? { ...cur } : {}); setMsg('') }, [sel]) // eslint-disable-line react-hooks/exhaustive-deps

  const act = async (body: Record<string, unknown>, done: string) => {
    setBusy(true); setErr(''); setMsg('')
    const res = await fetch('/api/christian-apps/admin', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-password': pw }, body: JSON.stringify(body) })
    const j = await res.json().catch(() => ({}))
    setBusy(false)
    if (!res.ok) { setErr(j.error || 'Error'); return }
    if (j.row) setRows(rs => rs.map(r => r.id === j.row.id ? j.row : r))
    setMsg(done + (j.emailed ? ' Submitter emailed.' : ''))
  }

  if (!authed) return (
    <><style>{CSS}</style>
      <form className="gate" onSubmit={e => { e.preventDefault(); load(pw) }}>
        <h1>App directory desk</h1>
        <input type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="Admin password" autoFocus />
        <button>Open</button>{err && <p className="err">{err}</p>}
      </form></>
  )

  const set = (k: keyof Row) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setDraft(d => ({ ...d, [k]: e.target.value }))

  return (
    <><style>{CSS}</style>
      <div className="wrap">
        <div className="head"><h1>Christian Apps directory: submissions</h1><a href="/christian-apps" target="_blank">open directory</a><a href="/cas-admin">admin home</a></div>
        {missing && <div className="warn">The submissions table is not set up yet. Paste <code>supabase-app-directory-migration.sql</code> (landing repo root) into Supabase SQL Editor and run it. Until then submissions still arrive by email at team@.</div>}
        <div className="tabs">
          {(['received', 'approved', 'rejected', 'spam'] as const).map(s => (
            <button key={s} className={`tab ${tab === s ? 'on' : ''}`} onClick={() => { setTab(s); setSel(null) }}>{s}<b>{counts[s] || 0}</b></button>
          ))}
        </div>
        <div className="grid">
          <div className="list">
            {shown.length === 0 && <p className="meta">Nothing here.</p>}
            {shown.map(r => (
              <div key={r.id} className={`item ${sel === r.id ? 'sel' : ''}`} onClick={() => setSel(r.id)}>
                <h3>{r.name} <span className="pill received" style={{ background: '#22303e', color: '#9fb3c8' }}>{r.kind}</span></h3>
                <p>{r.category} · {r.contact_name} ({r.contact_role}) · {new Date(r.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
          {cur && (
            <div className="card">
              <p><span className={`pill ${cur.status}`}>{cur.status}</span>{cur.slug && cur.status === 'approved' && <a className="meta" href={`/christian-apps/${cur.slug}`} target="_blank">/christian-apps/{cur.slug}</a>}</p>
              <div className="meta">
                From <b>{cur.contact_name}</b> &lt;<a href={`mailto:${cur.contact_email}`}>{cur.contact_email}</a>&gt;, {cur.contact_role}<br />
                {cur.ios_url && <>App Store: <a href={cur.ios_url} target="_blank" rel="noreferrer">{cur.ios_url}</a><br /></>}
                {cur.android_url && <>Google Play: <a href={cur.android_url} target="_blank" rel="noreferrer">{cur.android_url}</a><br /></>}
                {cur.web_url && <>Website: <a href={cur.web_url} target="_blank" rel="noreferrer">{cur.web_url}</a><br /></>}
                Links to faithfulkids.app: <b>{cur.links_to_us == null ? 'not checked' : cur.links_to_us ? 'yes' : 'no'}</b>
                {cur.links_checked_at && <> (checked {new Date(cur.links_checked_at).toLocaleString()})</>}
                {cur.notes_from_submitter && <><br />Their notes: {cur.notes_from_submitter}</>}
              </div>
              <hr style={{ borderColor: '#2b3a4a', margin: '14px 0' }} />
              <div className="row">
                <div className="f"><label>Name</label><input value={draft.name || ''} onChange={set('name')} /></div>
                <div className="f"><label>Maker</label><input value={draft.maker || ''} onChange={set('maker')} /></div>
              </div>
              <div className="row">
                <div className="f"><label>Category</label><input value={draft.category || ''} onChange={set('category')} /></div>
                <div className="f"><label>Ages (shown)</label><input value={draft.ages || ''} onChange={set('ages')} /></div>
              </div>
              <div className="row">
                <div className="f"><label>Price model</label>
                  <select value={draft.price_model || ''} onChange={set('price_model')}>
                    {['free', 'free-with-ads', 'freemium', 'subscription', 'paid'].map(p => <option key={p}>{p}</option>)}
                  </select></div>
                <div className="f"><label>Prices</label><input value={draft.price || ''} onChange={set('price')} /></div>
              </div>
              <div className="f"><label>Description (public)</label><textarea value={draft.description || ''} onChange={set('description')} /></div>
              <div className="f"><label>Private notes</label><input value={draft.admin_notes || ''} onChange={set('admin_notes')} /></div>
              <div className="btns">
                <button className="btn" disabled={busy} onClick={() => act({ action: 'edit', id: cur.id, patch: draft }, 'Saved.')}>Save edits</button>
                <button className="btn" disabled={busy} onClick={() => act({ action: 'check-link', id: cur.id }, 'Link checked.')}>Check link to us</button>
              </div>
              <div className="btns">
                {cur.status !== 'approved' && <button className="btn go" disabled={busy} onClick={() => act({ action: 'status', id: cur.id, status: 'approved' }, 'Approved and live within a minute.')}>Approve and publish</button>}
                {cur.status === 'approved' && <button className="btn" disabled={busy} onClick={() => act({ action: 'status', id: cur.id, status: 'received' }, 'Unpublished.')}>Unpublish</button>}
                {cur.status !== 'rejected' && <button className="btn danger" disabled={busy} onClick={() => act({ action: 'status', id: cur.id, status: 'rejected' }, 'Rejected (no email sent).')}>Reject</button>}
                {cur.status !== 'spam' && <button className="btn danger" disabled={busy} onClick={() => act({ action: 'status', id: cur.id, status: 'spam' }, 'Marked spam.')}>Spam</button>}
              </div>
              {msg && <p className="ok">{msg}</p>}{err && <p className="err">{err}</p>}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
