'use client'

import { useCallback, useEffect, useState } from 'react'

/*
 * Creator contract desk. Lives under /cas-admin so it inherits the existing
 * password gate and the noindex layout.
 *
 * The form is generated from each template's own `field:` lines, so adding a
 * term to a contract is a Markdown edit — this file never needs touching for
 * a new field, and never hardcodes a rate. Rates here run from $25 to $5,000.
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
.wrap{max-width:1180px;margin:0 auto;padding:22px 20px}
.head{display:flex;align-items:baseline;gap:14px;margin-bottom:20px;flex-wrap:wrap}
.head h1{font-size:1.2rem;margin:0}
.head a{color:#7fd4a0;font-size:13px}
.cols{display:grid;grid-template-columns:minmax(0,420px) minmax(0,1fr);gap:22px;align-items:start}
@media(max-width:980px){.cols{grid-template-columns:1fr}}
.card{background:#18222e;border:1px solid #2b3a4a;border-radius:14px;padding:18px}
.card h2{font-size:.95rem;margin:0 0 14px;text-transform:uppercase;letter-spacing:.06em;color:#9fb3c8}
.f{margin-bottom:12px}
.f label{display:block;font-size:12px;color:#9fb3c8;margin-bottom:4px}
.f input[type=text],.f select,.f textarea{width:100%;padding:9px 11px;border-radius:9px;border:1px solid #2b3a4a;background:#101a24;color:#e6eef6}
.f textarea{min-height:60px;resize:vertical}
.f.chk{display:flex;align-items:center;gap:9px}
.f.chk input{width:17px;height:17px;accent-color:#16a34a}
.f.chk label{margin:0;font-size:13px;color:#e6eef6}
.row{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.btns{display:flex;gap:9px;margin-top:14px;flex-wrap:wrap}
.btn{padding:10px 16px;border-radius:999px;border:1px solid #2b3a4a;background:#101a24;color:#e6eef6;cursor:pointer;font-weight:600}
.btn.go{background:#16a34a;border-color:#16a34a;color:#fff}
.btn:disabled{opacity:.45;cursor:not-allowed}
.hint{font-size:12px;color:#8aa0b6;line-height:1.55;margin:10px 0 0}
.err{color:#fca5a5;font-size:13px;margin:10px 0 0}
.ok{background:#0f2e1d;border:1px solid #16a34a;border-radius:12px;padding:14px;margin-top:14px}
.ok p{margin:0 0 8px;font-size:13px;line-height:1.6}
.linkbox{display:flex;gap:8px;margin-top:8px}
.linkbox input{flex:1;padding:9px 11px;border-radius:9px;border:1px solid #2b3a4a;background:#101a24;color:#7fd4a0;font-size:12px}
table{width:100%;border-collapse:collapse;font-size:13px}
th{text-align:left;color:#9fb3c8;font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:.05em;padding:0 8px 8px;border-bottom:1px solid #2b3a4a}
td{padding:10px 8px;border-bottom:1px solid #22303e;vertical-align:top}
.pill{display:inline-block;padding:2px 9px;border-radius:999px;font-size:11px;font-weight:700}
.pill.sent{background:#1e3a52;color:#9fd4ff}
.pill.viewed{background:#3b3416;color:#fbd15b}
.pill.signed{background:#0f2e1d;color:#6ee7a0}
.pill.voided{background:#3a1f22;color:#fca5a5}
.tiny{color:#8aa0b6;font-size:11px}
.linkbtn{background:none;border:0;color:#7fd4a0;cursor:pointer;padding:0;font-size:12px;text-decoration:underline}
.preview{background:#fff;color:#16314f;border-radius:12px;padding:26px 30px;margin-top:14px;line-height:1.65;max-height:62vh;overflow:auto}
.preview h2{font-size:1.25rem;margin:0 0 14px}
.preview h3{font-size:1rem;margin:20px 0 6px}
.preview ul{padding-left:20px}
`

interface Field {
  key: string; type: string; options?: string[]; label: string; default: string; required: boolean
}
interface Template { id: string; title: string; version: string; fields: Field[] }
interface Row {
  id: string; token: string; template: string; talent_name: string; talent_handle: string | null
  signer_name: string; signer_email: string; signer_capacity: string | null
  vars: Record<string, string>; status: string; sent_at: string; signed_at: string | null
  first_viewed_at: string | null; external: boolean; body_sha256: string
}

const money = (v?: string) => {
  const n = Number(String(v || '').replace(/[^0-9.]/g, ''))
  return n ? '$' + n.toLocaleString('en-US') : '—'
}
const short = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'

export default function ContractsAdmin() {
  const [pw, setPw] = useState('')
  const [authed, setAuthed] = useState(false)
  const [templates, setTemplates] = useState<Template[]>([])
  const [rows, setRows] = useState<Row[]>([])
  const [tplId, setTplId] = useState('')
  const [vals, setVals] = useState<Record<string, string>>({})
  const [preview, setPreview] = useState('')
  const [created, setCreated] = useState<{ link: string; sha: string } | null>(null)
  const [alsoEmail, setAlsoEmail] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const api = useCallback(async (method: 'GET' | 'POST', body?: unknown) => {
    const password = pw || localStorage.getItem('casAdminPw') || ''
    const res = await fetch('/api/contracts/admin', {
      method,
      headers: { 'x-admin-password': password, 'Content-Type': 'application/json' },
      ...(body ? { body: JSON.stringify(body) } : {}),
    })
    if (res.status === 401) { setAuthed(false); localStorage.removeItem('casAdminPw'); throw new Error('Wrong password') }
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`)
    return data
  }, [pw])

  const load = useCallback(async (password?: string) => {
    setBusy(true); setError('')
    try {
      if (password) { setPw(password); localStorage.setItem('casAdminPw', password) }
      const data = await api('GET')
      setTemplates(data.templates); setRows(data.contracts); setAuthed(true)
      if (!tplId && data.templates[0]) selectTemplate(data.templates[0])
    } catch (e) { setError((e as Error).message) } finally { setBusy(false) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api, tplId])

  function selectTemplate(t: Template) {
    setTplId(t.id)
    const next: Record<string, string> = {}
    for (const f of t.fields) next[f.key] = f.default
    setVals(next); setPreview(''); setCreated(null)
  }

  useEffect(() => {
    const saved = localStorage.getItem('casAdminPw')
    if (saved) load(saved)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const tpl = templates.find(t => t.id === tplId)
  const set = (k: string, v: string) => setVals(p => ({ ...p, [k]: v }))

  async function doPreview() {
    setBusy(true); setError('')
    try { setPreview((await api('POST', { action: 'preview', template: tplId, vars: vals })).html) }
    catch (e) { setError((e as Error).message) } finally { setBusy(false) }
  }

  async function doCreate() {
    setBusy(true); setError('')
    try {
      const d = await api('POST', { action: 'create', template: tplId, vars: vals, sendEmail: alsoEmail })
      setCreated({ link: d.link, sha: d.sha }); setPreview('')
      setRows((await api('GET')).contracts)
    } catch (e) { setError((e as Error).message) } finally { setBusy(false) }
  }

  async function doVoid(id: string, who: string) {
    const reason = prompt(`Void the contract for ${who}? Optional reason:`)
    if (reason === null) return
    setBusy(true); setError('')
    try { await api('POST', { action: 'void', id, reason }); setRows((await api('GET')).contracts) }
    catch (e) { setError((e as Error).message) } finally { setBusy(false) }
  }

  const copy = (text: string) => navigator.clipboard?.writeText(text)

  if (!authed) {
    return (
      <div className="root">
        <style>{CSS}</style>
        <form className="gate" onSubmit={e => { e.preventDefault(); load(pw) }}>
          <h1>Contracts</h1>
          <input type="password" placeholder="Password" value={pw} autoFocus onChange={e => setPw(e.target.value)} />
          <button type="submit" disabled={busy}>{busy ? 'Checking…' : 'Enter'}</button>
          {error && <p className="err">{error}</p>}
        </form>
      </div>
    )
  }

  return (
    <div className="root">
      <style>{CSS}</style>
      <div className="wrap">
        <header className="head">
          <h1>Creator contracts</h1>
          <a href="/cas-admin">← Stats dashboard</a>
        </header>

        <div className="cols">
          <section className="card">
            <h2>New contract</h2>

            <div className="f">
              <label>Template</label>
              <select value={tplId} onChange={e => {
                const t = templates.find(x => x.id === e.target.value); if (t) selectTemplate(t)
              }}>
                {templates.map(t => <option key={t.id} value={t.id}>{t.title} (v{t.version})</option>)}
              </select>
            </div>

            {tpl?.fields.map(f => {
              if (f.type === 'bool') {
                return (
                  <div className="f chk" key={f.key}>
                    <input type="checkbox" id={f.key}
                      checked={vals[f.key] === 'true'}
                      onChange={e => set(f.key, e.target.checked ? 'true' : '')} />
                    <label htmlFor={f.key}>{f.label}</label>
                  </div>
                )
              }
              return (
                <div className="f" key={f.key}>
                  <label htmlFor={f.key}>{f.label}{f.required ? ' *' : ''}</label>
                  {f.type === 'select' ? (
                    <select id={f.key} value={vals[f.key] || ''} onChange={e => set(f.key, e.target.value)}>
                      {f.options?.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : f.type === 'textarea' ? (
                    <textarea id={f.key} value={vals[f.key] || ''} onChange={e => set(f.key, e.target.value)} />
                  ) : (
                    <input id={f.key} type="text" inputMode={f.type === 'money' || f.type === 'number' ? 'decimal' : undefined}
                      value={vals[f.key] || ''} onChange={e => set(f.key, e.target.value)} />
                  )}
                </div>
              )
            })}

            <div className="f chk">
              <input type="checkbox" id="alsoEmail" checked={alsoEmail} onChange={e => setAlsoEmail(e.target.checked)} />
              <label htmlFor="alsoEmail">Also email the link from christian@</label>
            </div>
            <p className="hint">
              Usually leave that off and paste the link into the Gmail thread you&apos;re already in
              with them. A fresh envelope from an address they don&apos;t recognise is what gets
              treated as a scam.
            </p>

            <div className="btns">
              <button className="btn" onClick={doPreview} disabled={busy}>Preview</button>
              <button className="btn go" onClick={doCreate} disabled={busy || !preview}>
                Create &amp; get link
              </button>
            </div>
            {!preview && <p className="hint">Preview first — the rendered contract is what gets frozen.</p>}
            {error && <p className="err">{error}</p>}

            {created && (
              <div className="ok">
                <p><strong>Created.</strong> {alsoEmail ? 'Emailed, and here is the link too.' : 'Paste this into your thread with them:'}</p>
                <div className="linkbox">
                  <input readOnly value={created.link} onFocus={e => e.currentTarget.select()} />
                  <button className="btn" onClick={() => copy(created.link)}>Copy</button>
                </div>
                <p className="tiny" style={{ marginTop: 8 }}>SHA-256 {created.sha}</p>
              </div>
            )}
          </section>

          <section className="card">
            <h2>All contracts ({rows.length})</h2>
            <table>
              <thead>
                <tr>
                  <th>Creator</th><th>Status</th><th>Deal</th><th>Sent</th><th>Signed</th><th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.id}>
                    <td>
                      {r.talent_name}
                      {r.talent_handle && <><br /><span className="tiny">{r.talent_handle}</span></>}
                      {r.signer_capacity && <><br /><span className="tiny">via {r.signer_name}</span></>}
                    </td>
                    <td>
                      <span className={`pill ${r.status}`}>{r.external ? 'their paper' : r.status}</span>
                      {r.status === 'viewed' && <><br /><span className="tiny">opened {short(r.first_viewed_at)}</span></>}
                    </td>
                    <td>
                      {money(r.vars?.fee_base)}
                      {r.vars?.fee_per_1k ? <span className="tiny"> + {money(r.vars.fee_per_1k)}/1k</span> : null}
                      {r.vars?.fee_cap ? <><br /><span className="tiny">cap {money(r.vars.fee_cap)}</span></> : null}
                      {r.vars?.usage_b === 'true' ? <><br /><span className="tiny">+ ads {money(r.vars.usage_b_fee)}</span></> : null}
                    </td>
                    <td className="tiny">{short(r.sent_at)}</td>
                    <td className="tiny">{short(r.signed_at)}</td>
                    <td>
                      {r.status !== 'signed' && r.status !== 'voided' && (
                        <>
                          <button className="linkbtn" onClick={() => copy(`${location.origin}/sign/${r.token}`)}>copy link</button>
                          {' · '}
                          <button className="linkbtn" onClick={() => doVoid(r.id, r.talent_name)}>void</button>
                        </>
                      )}
                      {r.status === 'signed' && !r.external && (
                        <a className="linkbtn" href={`/sign/${r.token}`} target="_blank" rel="noreferrer">view</a>
                      )}
                    </td>
                  </tr>
                ))}
                {!rows.length && <tr><td colSpan={6} className="tiny">Nothing yet.</td></tr>}
              </tbody>
            </table>
          </section>
        </div>

        {preview && (
          <section className="card" style={{ marginTop: 22 }}>
            <h2>Preview — this exact text is what gets frozen</h2>
            <div className="preview" dangerouslySetInnerHTML={{ __html: preview }} />
          </section>
        )}
      </div>
    </div>
  )
}
