'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

/*
 * The affiliate desk. Same password gate as the rest of /cas-admin
 * (x-admin-password header, kept in sessionStorage). Everything here is a
 * button the owner presses: approving, emailing (always previewed first) and
 * recording a payout. The ledger runs daily by itself; "Run the ledger" is
 * for checking a sale today. Runbook: AFFILIATES-OPERATIONS.md.
 */

type Balance = { pendingCents: number; payableCents: number; paidCents: number; voidCount: number }
type Aff = {
  id: string; created_at: string; status: string; name: string; email: string; website: string | null; audience: string | null
  plan: string | null; country: string | null; code: string | null; token: string | null; payout_email: string | null
  tax_form: string; admin_notes: string | null; approved_at: string | null; terms_version: string | null; terms_accepted_at: string | null
  link: string | null; account: string | null; suggestedCode: string; clicks30: number; signups: number; paying: number; flagged: number; balance: Balance
}
type Com = { id: string; affiliate_id: string; invoice_id: string; kind: string; amount_paid_cents: number; refunded_cents: number; commission_cents: number; charged_at: string; payable_at: string; status: string; void_reason: string | null }
type Pay = { id: string; affiliate_id: string; created_at: string; amount_cents: number; sent_to: string | null; reference: string | null }
type Data = { missingTable?: boolean; terms: { minimumCents: number; payoutDay: number }; affiliates: Aff[]; commissions: Com[]; payouts: Pay[] }

const $ = (c: number) => `${c < 0 ? '-' : ''}$${(Math.abs(c) / 100).toFixed(2)}`
const d = (s: string | null) => s ? new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''

const CSS = `
*{box-sizing:border-box}body{margin:0;background:#0f1720;color:#e6eef6;font-family:system-ui,-apple-system,Segoe UI,sans-serif}
.gate{max-width:320px;margin:18vh auto;display:flex;flex-direction:column;gap:12px;text-align:center}
.gate input,.gate button{padding:11px 14px;border-radius:10px;border:1px solid #2b3a4a;background:#18222e;color:#e6eef6;font-size:14px}
.gate button{background:#16a34a;border-color:#16a34a;font-weight:700;cursor:pointer}
.wrap{max-width:1280px;margin:0 auto;padding:22px 20px 80px}
.head{display:flex;gap:14px;align-items:center;flex-wrap:wrap;margin-bottom:14px}.head h1{font-size:1.2rem;margin:0}.head a{color:#7fd4a0;font-size:13px}
.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-bottom:16px}
.kpi{background:#18222e;border:1px solid #2b3a4a;border-radius:12px;padding:12px 14px}.kpi b{display:block;font-size:20px}.kpi span{font-size:12px;color:#8aa0b6}
.tabs{display:flex;gap:6px;margin-bottom:14px;flex-wrap:wrap}
.tab{padding:8px 13px;border-radius:999px;border:1px solid #2b3a4a;background:#101a24;color:#9fb3c8;cursor:pointer;font-weight:600}
.tab.on{background:#16a34a;border-color:#16a34a;color:#fff}.tab b{margin-left:6px;background:rgba(255,255,255,.14);padding:1px 7px;border-radius:999px;font-size:11px}
.grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.35fr);gap:16px}
.list{display:flex;flex-direction:column;gap:8px}
.item{background:#18222e;border:1px solid #2b3a4a;border-radius:12px;padding:12px 14px;cursor:pointer}
.item.sel{border-color:#16a34a}.item h3{margin:0 0 4px;font-size:15px}.item p{margin:0;color:#8aa0b6;font-size:12px}
.card{background:#18222e;border:1px solid #2b3a4a;border-radius:14px;padding:18px;margin-bottom:14px}.card h2{font-size:15px;margin:0 0 10px}
.f{margin-bottom:10px}.f label{display:block;font-size:12px;color:#9fb3c8;margin-bottom:4px}
.f input,.f textarea,.f select{width:100%;padding:8px 10px;border-radius:9px;border:1px solid #2b3a4a;background:#101a24;color:#e6eef6;font:inherit;font-size:14px}
.f textarea{min-height:70px}
.row{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.btns{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
.btn{padding:9px 14px;border-radius:999px;border:1px solid #2b3a4a;background:#101a24;color:#e6eef6;cursor:pointer;font-weight:600;font-size:13px}
.btn.go{background:#16a34a;border-color:#16a34a}.btn.danger{border-color:#7f1d1d;color:#fca5a5}.btn:disabled{opacity:.45}
.pill{display:inline-block;padding:2px 9px;border-radius:999px;font-size:11px;font-weight:700;margin-right:6px}
.applied{background:#1e3a52;color:#9fd4ff}.active{background:#14532d;color:#86efac}.paused{background:#3b2a16;color:#fcd34d}.declined,.closed{background:#3b1d1d;color:#fca5a5}
.pending{background:#1e3a52;color:#9fd4ff}.payable{background:#3b2a16;color:#fcd34d}.paid{background:#14532d;color:#86efac}.void{background:#3b1d1d;color:#fca5a5}
.meta{font-size:13px;color:#9fb3c8;line-height:1.6;white-space:pre-wrap}.meta a{color:#7fd4a0;word-break:break-all}
.warn{background:#3b2a16;border:1px solid #b45309;border-radius:12px;padding:12px 14px;font-size:13px;line-height:1.55;margin-bottom:16px}
.err{color:#fca5a5;font-size:13px}.ok{color:#86efac;font-size:13px}
table{width:100%;border-collapse:collapse;font-size:12.5px}td,th{padding:6px 8px;border-bottom:1px solid #243241;text-align:left}th{color:#8aa0b6;font-weight:600}
iframe{width:100%;height:520px;border:0;border-radius:10px;background:#fff}
@media(max-width:900px){.grid{grid-template-columns:1fr}.row{grid-template-columns:1fr}}
`

export default function AffiliateDesk() {
  const [pw, setPw] = useState('')
  const [authed, setAuthed] = useState(false)
  const [data, setData] = useState<Data | null>(null)
  const [tab, setTab] = useState<'applied' | 'active' | 'payouts' | 'ledger' | 'other'>('applied')
  const [sel, setSel] = useState<string | null>(null)
  const [msg, setMsg] = useState<{ ok?: string; err?: string }>({})
  const [busy, setBusy] = useState(false)
  const [preview, setPreview] = useState<{ kind: string; subject: string; html: string; to: string } | null>(null)
  const [code, setCode] = useState('')
  const [ref, setRef] = useState('')
  const [emailPayout, setEmailPayout] = useState(true)
  const [edit, setEdit] = useState<Record<string, string>>({})
  const [adding, setAdding] = useState(false)

  const call = useCallback(async (method: 'GET' | 'POST', body?: unknown) => {
    const res = await fetch('/api/affiliates/admin', {
      method, headers: { 'Content-Type': 'application/json', 'x-admin-password': pw || sessionStorage.getItem('fk_admin_pw') || '' },
      ...(body ? { body: JSON.stringify(body) } : {}),
    })
    const j = await res.json().catch(() => ({}))
    if (res.status === 401) { setAuthed(false); throw new Error('Wrong password') }
    if (!res.ok) throw new Error(j.error || `Error ${res.status}`)
    return j
  }, [pw])

  const load = useCallback(async () => {
    try { setData(await call('GET')); setAuthed(true) } catch (e) { setMsg({ err: (e as Error).message }) }
  }, [call])

  useEffect(() => {
    const saved = sessionStorage.getItem('fk_admin_pw')
    if (saved) { setPw(saved); setAuthed(true) }
  }, [])
  useEffect(() => { if (authed) load() }, [authed, load])

  const affs = data?.affiliates || []
  const cur = affs.find(a => a.id === sel) || null
  useEffect(() => {
    setPreview(null); setRef(''); setMsg({})
    if (cur) {
      setCode(cur.code || cur.suggestedCode)
      setEdit({ payout_email: cur.payout_email || '', tax_form: cur.tax_form, admin_notes: cur.admin_notes || '', status: cur.status, email: cur.email, name: cur.name })
    }
  }, [sel]) // eslint-disable-line react-hooks/exhaustive-deps

  const groups = useMemo(() => ({
    applied: affs.filter(a => a.status === 'applied'),
    active: affs.filter(a => a.status === 'active' || a.status === 'paused'),
    other: affs.filter(a => a.status === 'declined' || a.status === 'closed'),
    payouts: affs.filter(a => a.balance.payableCents > 0),
  }), [affs])

  const totals = useMemo(() => affs.reduce((t, a) => ({
    clicks: t.clicks + a.clicks30, signups: t.signups + a.signups, paying: t.paying + a.paying,
    pending: t.pending + a.balance.pendingCents, payable: t.payable + a.balance.payableCents, paid: t.paid + a.balance.paidCents,
  }), { clicks: 0, signups: 0, paying: 0, pending: 0, payable: 0, paid: 0 }), [affs])

  const act = async (body: Record<string, unknown>, okMsg: string) => {
    setBusy(true); setMsg({})
    try { const j = await call('POST', body); setMsg({ ok: okMsg }); await load(); return j } catch (e) { setMsg({ err: (e as Error).message }) } finally { setBusy(false) }
  }

  if (!authed) return (
    <><style>{CSS}</style>
      <form className="gate" onSubmit={e => { e.preventDefault(); sessionStorage.setItem('fk_admin_pw', pw); setAuthed(true) }}>
        <h1 style={{ fontSize: 18 }}>Affiliate desk</h1>
        <input type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="Admin password" autoFocus />
        <button type="submit">Open</button>
        {msg.err && <p className="err">{msg.err}</p>}
      </form></>
  )

  const listFor = tab === 'payouts' ? groups.payouts : tab === 'ledger' ? [] : groups[tab]
  const curComs = (data?.commissions || []).filter(c => c.affiliate_id === sel)
  const curPays = (data?.payouts || []).filter(p => p.affiliate_id === sel)

  return (
    <><style>{CSS}</style>
      <div className="wrap">
        <div className="head">
          <h1>Affiliate desk</h1>
          <a href="/affiliates" target="_blank">Public page</a>
          <a href="/affiliates/terms" target="_blank">Terms</a>
          <a href="/cas-admin">Stats dashboard</a>
          <span style={{ flex: 1 }} />
          <button className="btn" disabled={busy} onClick={() => setAdding(v => !v)}>Add someone who emailed</button>
          <button className="btn" disabled={busy} onClick={async () => {
            const j = await act({ action: 'reconcile', days: 60 }, 'Ledger updated from Stripe.')
            if (j?.report) setMsg({ ok: `Ledger: ${j.report.commissionsAdded} new commission(s), ${j.report.refundsApplied} refund change(s), ${j.report.released} released from hold.${j.report.unknownCodes.length ? ` Codes not credited: ${j.report.unknownCodes.join(', ')}.` : ''}${j.report.errors.length ? ` Errors: ${j.report.errors.join('; ')}` : ''}` })
          }}>Run the ledger</button>
        </div>

        {data?.missingTable && <div className="warn">The affiliate tables are not in Supabase yet. Open Supabase, SQL Editor, paste <code>FaithfulKidsLandingPage/supabase-affiliates-migration.sql</code>, run it, and reload. Until then applications arrive only by email at team@.</div>}
        {msg.err && <div className="warn err">{msg.err}</div>}
        {msg.ok && <div className="card ok">{msg.ok}</div>}

        {adding && <AddForm busy={busy} onSave={async f => { const j = await act({ action: 'create', fields: f }, 'Added. Review and approve them under Applications.'); if (j) { setAdding(false); setTab('applied'); setSel(j.affiliate?.id || null) } }} />}

        <div className="kpis">
          <div className="kpi"><b>{groups.active.length}</b><span>active affiliates</span></div>
          <div className="kpi"><b>{totals.clicks}</b><span>link clicks, last 30 days</span></div>
          <div className="kpi"><b>{totals.signups}</b><span>referred sign-ups (all time)</span></div>
          <div className="kpi"><b>{totals.paying}</b><span>referred paying families</span></div>
          <div className="kpi"><b>{$(totals.pending)}</b><span>commission in the hold</span></div>
          <div className="kpi"><b>{$(totals.payable)}</b><span>payable now</span></div>
          <div className="kpi"><b>{$(totals.paid)}</b><span>paid out</span></div>
        </div>

        <div className="tabs">
          {([['applied', 'Applications'], ['active', 'Affiliates'], ['payouts', 'Payouts due'], ['ledger', 'Ledger'], ['other', 'Declined / closed']] as const).map(([k, l]) => (
            <button key={k} className={`tab${tab === k ? ' on' : ''}`} onClick={() => { setTab(k); setSel(null) }}>{l}{k !== 'ledger' && <b>{groups[k].length}</b>}</button>
          ))}
        </div>

        {tab === 'ledger' ? <Ledger data={data} /> : (
          <div className="grid">
            <div className="list">
              {listFor.length === 0 && <p className="meta">Nothing here.</p>}
              {listFor.map(a => (
                <div key={a.id} className={`item${sel === a.id ? ' sel' : ''}`} onClick={() => setSel(a.id)}>
                  <h3><span className={`pill ${a.status}`}>{a.status}</span>{a.name}</h3>
                  <p>{a.email} · applied {d(a.created_at)}{a.code ? ` · /r/${a.code}` : ''}</p>
                  {a.status !== 'applied' && <p>{a.clicks30} clicks (30d) · {a.signups} sign-ups · {a.paying} paying · {$(a.balance.payableCents)} payable</p>}
                </div>
              ))}
            </div>

            {cur && (
              <div>
                <div className="card">
                  <h2><span className={`pill ${cur.status}`}>{cur.status}</span>{cur.name}</h2>
                  <div className="meta">
                    <b>Email:</b> {cur.email}{'\n'}
                    <b>Where they publish:</b> {cur.website}{'\n'}
                    <b>Audience:</b> {cur.audience}{'\n'}
                    <b>Plan:</b> {cur.plan}{'\n'}
                    <b>Country:</b> {cur.country}{'\n'}
                    <b>Terms accepted:</b> {cur.terms_version ? `${cur.terms_version} on ${d(cur.terms_accepted_at)}` : 'not through the form (added by hand)'}{'\n'}
                    {cur.link && <><b>Link:</b> <a href={cur.link} target="_blank" rel="noreferrer">{cur.link}</a>{'\n'}</>}
                    {cur.account && <><b>Their stats page:</b> <a href={cur.account} target="_blank" rel="noreferrer">{cur.account}</a>{'\n'}</>}
                  </div>

                  {(cur.status === 'applied' || cur.status === 'declined') && (
                    <div className="btns" style={{ alignItems: 'flex-end' }}>
                      <div className="f" style={{ margin: 0, flex: '1 1 200px' }}><label>Their link code (faithfulkids.app/r/…)</label><input value={code} onChange={e => setCode(e.target.value.toLowerCase())} /></div>
                      <button className="btn go" disabled={busy} onClick={() => act({ action: 'approve', id: cur.id, code }, 'Approved. Now preview and send the welcome email.')}>Approve</button>
                      {cur.status === 'applied' && <button className="btn danger" disabled={busy} onClick={() => act({ action: 'decline', id: cur.id }, 'Declined. Preview and send the decline email if you want to reply.')}>Decline</button>}
                    </div>
                  )}

                  <div className="btns">
                    {cur.status === 'active' && <button className="btn" disabled={busy} onClick={async () => { const j = await act({ action: 'email', id: cur.id, kind: 'approval' }, ''); if (j?.preview) setPreview({ kind: 'approval', ...j.preview }) }}>Preview welcome email</button>}
                    {cur.status === 'declined' && <button className="btn" disabled={busy} onClick={async () => { const j = await act({ action: 'email', id: cur.id, kind: 'decline' }, ''); if (j?.preview) setPreview({ kind: 'decline', ...j.preview }) }}>Preview decline email</button>}
                  </div>
                  {preview && (
                    <div style={{ marginTop: 12 }}>
                      <p className="meta"><b>To:</b> {preview.to} · <b>From:</b> Faithful Kids &lt;team@faithfulkids.app&gt; · <b>Subject:</b> {preview.subject}</p>
                      <iframe srcDoc={preview.html} title="Email preview" />
                      <div className="btns">
                        <button className="btn go" disabled={busy} onClick={async () => { const j = await act({ action: 'email', id: cur.id, kind: preview.kind, send: true }, 'Sent.'); if (j?.ok) setPreview(null) }}>Send this email</button>
                        <button className="btn" onClick={() => setPreview(null)}>Close</button>
                      </div>
                    </div>
                  )}
                </div>

                {cur.status !== 'applied' && (
                  <div className="card">
                    <h2>Money</h2>
                    <div className="meta">In the 30-day hold: <b>{$(cur.balance.pendingCents)}</b> · Payable: <b>{$(cur.balance.payableCents)}</b> · Paid: <b>{$(cur.balance.paidCents)}</b>{cur.flagged ? ` · ${cur.flagged} sign-up(s) flagged as self-referral, earning nothing` : ''}</div>
                    {cur.balance.payableCents > 0 && (
                      <>
                        <p className="meta" style={{ marginTop: 10 }}>To pay: send <b>{$(cur.balance.payableCents)}</b> by PayPal to <b>{cur.payout_email || '(no PayPal email yet)'}</b> on the {data?.terms.payoutDay}th, then record it here.{cur.balance.payableCents < (data?.terms.minimumCents || 2500) ? ' Under the minimum, so it rolls over.' : ''}{cur.tax_form === 'none' ? ' No tax form on file yet.' : ''}</p>
                        <div className="btns" style={{ alignItems: 'flex-end' }}>
                          <div className="f" style={{ margin: 0, flex: '1 1 220px' }}><label>PayPal transaction id</label><input value={ref} onChange={e => setRef(e.target.value)} /></div>
                          <label className="meta"><input type="checkbox" checked={emailPayout} onChange={e => setEmailPayout(e.target.checked)} /> Email them the receipt</label>
                          <button className="btn go" disabled={busy || !ref} onClick={() => act({ action: 'payout', id: cur.id, reference: ref, send: emailPayout }, 'Payout recorded.')}>Record payout</button>
                        </div>
                      </>
                    )}
                    {curComs.length > 0 && <table style={{ marginTop: 12 }}><thead><tr><th>Charged</th><th>Paid by family</th><th>Commission</th><th>Status</th><th>Clears</th></tr></thead><tbody>
                      {curComs.map(c => <tr key={c.id}><td>{d(c.charged_at)}</td><td>{c.kind === 'sale' ? $(c.amount_paid_cents) : 'refund adjustment'}{c.refunded_cents ? ` (refunded ${$(c.refunded_cents)})` : ''}</td><td>{$(c.commission_cents)}</td><td><span className={`pill ${c.status}`}>{c.status}</span>{c.void_reason || ''}</td><td>{c.status === 'pending' ? d(c.payable_at) : ''}</td></tr>)}
                    </tbody></table>}
                    {curPays.length > 0 && <table style={{ marginTop: 12 }}><thead><tr><th>Payout</th><th>Amount</th><th>To</th><th>PayPal id</th></tr></thead><tbody>
                      {curPays.map(p => <tr key={p.id}><td>{d(p.created_at)}</td><td>{$(p.amount_cents)}</td><td>{p.sent_to}</td><td>{p.reference}</td></tr>)}
                    </tbody></table>}
                  </div>
                )}

                <div className="card">
                  <h2>Details</h2>
                  <div className="row">
                    <div className="f"><label>Name</label><input value={edit.name || ''} onChange={e => setEdit(s => ({ ...s, name: e.target.value }))} /></div>
                    <div className="f"><label>Email</label><input value={edit.email || ''} onChange={e => setEdit(s => ({ ...s, email: e.target.value }))} /></div>
                  </div>
                  <div className="row">
                    <div className="f"><label>PayPal email</label><input value={edit.payout_email || ''} onChange={e => setEdit(s => ({ ...s, payout_email: e.target.value }))} /></div>
                    <div className="f"><label>Tax form on file</label><select value={edit.tax_form} onChange={e => setEdit(s => ({ ...s, tax_form: e.target.value }))}>
                      <option value="none">None yet</option><option value="w9">W-9 (US)</option><option value="w8ben">W-8BEN (individual outside US)</option><option value="w8bene">W-8BEN-E (business outside US)</option>
                    </select></div>
                  </div>
                  {cur.status !== 'applied' && <div className="f"><label>Status</label><select value={edit.status} onChange={e => setEdit(s => ({ ...s, status: e.target.value }))}>
                    <option value="active">active (link credits sales)</option><option value="paused">paused (link stops crediting new clicks)</option><option value="closed">closed</option><option value="declined">declined</option>
                  </select></div>}
                  <div className="f"><label>Notes (private)</label><textarea value={edit.admin_notes || ''} onChange={e => setEdit(s => ({ ...s, admin_notes: e.target.value }))} /></div>
                  <div className="btns"><button className="btn go" disabled={busy} onClick={() => act({ action: 'update', id: cur.id, fields: cur.status === 'applied' ? { ...edit, status: undefined } : edit }, 'Saved.')}>Save details</button></div>
                </div>
              </div>
            )}
          </div>
        )}
      </div></>
  )
}

function Ledger({ data }: { data: Data | null }) {
  const names = new Map((data?.affiliates || []).map(a => [a.id, a.name]))
  const coms = data?.commissions || []
  if (!coms.length) return <p className="meta">No commissions yet. The ledger fills itself daily from Stripe once a referred family pays.</p>
  return (
    <div className="card"><table><thead><tr><th>Charged</th><th>Affiliate</th><th>Invoice</th><th>Paid by family</th><th>Commission</th><th>Status</th><th>Clears</th></tr></thead><tbody>
      {coms.map(c => <tr key={c.id}><td>{d(c.charged_at)}</td><td>{names.get(c.affiliate_id)}</td><td>{c.invoice_id}</td><td>{c.kind === 'sale' ? $(c.amount_paid_cents) : 'adjustment'}</td><td>{$(c.commission_cents)}</td><td><span className={`pill ${c.status}`}>{c.status}</span>{c.void_reason || ''}</td><td>{c.status === 'pending' ? d(c.payable_at) : ''}</td></tr>)}
    </tbody></table></div>
  )
}

function AddForm({ busy, onSave }: { busy: boolean; onSave: (f: Record<string, string>) => void }) {
  const [f, setF] = useState<Record<string, string>>({})
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF(s => ({ ...s, [k]: e.target.value }))
  return (
    <div className="card">
      <h2>Add an applicant who emailed team@</h2>
      <p className="meta">They have not accepted the terms through the form, so the welcome email links the terms and asks them to read them.</p>
      <div className="row"><div className="f"><label>Name</label><input onChange={set('name')} /></div><div className="f"><label>Email</label><input onChange={set('email')} /></div></div>
      <div className="row"><div className="f"><label>Where they publish</label><input onChange={set('website')} /></div><div className="f"><label>Country</label><input onChange={set('country')} /></div></div>
      <div className="f"><label>Audience and plan (from their email)</label><textarea onChange={set('audience')} /></div>
      <div className="btns"><button className="btn go" disabled={busy} onClick={() => onSave(f)}>Add</button></div>
    </div>
  )
}
