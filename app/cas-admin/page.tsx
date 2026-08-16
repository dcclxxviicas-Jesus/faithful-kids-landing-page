'use client'

import { useCallback, useEffect, useState } from 'react'

// ---- types mirroring lib/admin-stats.ts RangeStats ----
interface Traffic {
  visitors: number; new_visitors: number; returning_visitors: number
  pageviews: number; sessions: number; bounce_rate: number
  avg_session_seconds: number; pages_per_session: number
  funnel: { quiz_visitors: number; quiz_started: number; quiz_answered: number; quiz_completed: number; plan_selected: number; checkout_clicked: number }
  conversion_events: { sign_up: number; trial_started: number; purchase_completed: number; subscription_canceled: number; payment_failed: number }
  top_pages: { path: string; visitors: number; views: number }[]
  referrers: { ref: string; visitors: number }[]
  devices: { device: string; visitors: number }[]
  countries: { country: string; visitors: number }[]
}
interface Gsc {
  clicks: number; impressions: number; ctr: number; position: number
  top_queries: { query: string; clicks: number; impressions: number; position: number }[]
  top_pages: { page: string; clicks: number; impressions: number; position: number }[]
}
interface StripeStats {
  range: {
    all: { trials_started: number; subs_created: number; canceled: number }
    organic: { trials_started: number; subs_created: number; canceled: number; revenue: number; purchases: number }
    revenue: number; checkout_sessions_expired: number
  }
  now: {
    active: number; trialing: number; organic_active: number; organic_trialing: number
    organic_paying: number; mrr: number; organic_mrr: number
    revenue_alltime: number; organic_revenue_alltime: number; open_payment_failures: number
  }
}
interface AppStats { total_families: number; new_families: number; total_kids: number; new_kids: number; total_leads: number; new_leads: number }
interface RangeStats {
  start_day: string; end_day: string; collected_at: string
  traffic: Traffic; gsc: Gsc | null; stripe: StripeStats | null; app: AppStats | null
}
interface ApiPayload { range: string; live: RangeStats; history: { day: string; data: RangeStats }[] }

const RANGES = [
  { key: 'today', label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: '7d', label: '7 days' },
  { key: '30d', label: '30 days' },
  { key: 'all', label: 'All time' },
] as const

function fmt(n: number | undefined | null): string {
  return (n ?? 0).toLocaleString('en-US')
}
function money(n: number | undefined | null): string {
  return '$' + (n ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
function dur(sec: number): string {
  const m = Math.floor(sec / 60), s = Math.round(sec % 60)
  return `${m}m ${String(s).padStart(2, '0')}s`
}

function Tile({ label, value, sub, alert }: { label: string; value: string; sub?: string; alert?: boolean }) {
  return (
    <div className={`tile${alert ? ' alert' : ''}`}>
      <div className="t-label">{label}</div>
      <div className="t-value">{value}</div>
      {sub ? <div className="t-sub">{sub}</div> : null}
    </div>
  )
}

function Panel({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="panel">
      <h3>{title}</h3>
      {sub ? <p className="p-sub">{sub}</p> : null}
      {children}
    </div>
  )
}

function BarRow({ label, value, max, extra }: { label: string; value: number; max: number; extra?: string }) {
  const w = max > 0 ? Math.max((value / max) * 100, value > 0 ? 1.5 : 0) : 0
  return (
    <div className="barrow" title={`${label}: ${fmt(value)}`}>
      <span className="br-label">{label}</span>
      <span className="br-track"><span className="br-fill" style={{ width: `${w}%` }} /></span>
      <span className="br-val">{fmt(value)}{extra ? <em> {extra}</em> : null}</span>
    </div>
  )
}

// Daily trend chart from snapshot history (oldest → newest)
function TrendChart({ points, label }: { points: { day: string; v: number }[]; label: string }) {
  if (points.length < 2) return <p className="p-sub">Not enough history yet — snapshots build up nightly.</p>
  const W = 900, H = 160, pad = 4
  const max = Math.max(...points.map((p) => p.v), 1)
  const bw = (W - pad * 2) / points.length
  return (
    <div className="chartwrap">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={label}>
        {points.map((p, i) => {
          const h = Math.max((p.v / max) * (H - 24), p.v > 0 ? 2 : 0)
          return (
            <g key={p.day}>
              <rect x={pad + i * bw + 1} y={H - 18 - h} width={Math.max(bw - 2, 1)} height={h} rx={2} className="trend-bar">
                <title>{p.day}: {fmt(p.v)}</title>
              </rect>
            </g>
          )
        })}
        <text x={pad} y={H - 4} className="trend-tick">{points[0].day.slice(5)}</text>
        <text x={W - pad} y={H - 4} textAnchor="end" className="trend-tick">{points[points.length - 1].day.slice(5)}</text>
        <text x={pad} y={12} className="trend-tick">peak {fmt(max)}</text>
      </svg>
    </div>
  )
}

export default function CasAdmin() {
  const [pw, setPw] = useState('')
  const [authed, setAuthed] = useState(false)
  const [range, setRange] = useState<string>('today')
  const [data, setData] = useState<ApiPayload | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async (password: string, r: string) => {
    setLoading(true); setError('')
    try {
      const res = await fetch(`/api/cas-admin/stats?range=${r}`, { headers: { 'x-admin-password': password } })
      if (res.status === 401) { setAuthed(false); localStorage.removeItem('casAdminPw'); setError('Wrong password'); return }
      if (!res.ok) throw new Error(`${res.status}: ${(await res.json()).error || 'failed'}`)
      setData(await res.json())
      setAuthed(true)
      localStorage.setItem('casAdminPw', password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem('casAdminPw')
    if (saved) { setPw(saved); load(saved, 'today') }
  }, [load])

  const pick = (r: string) => { setRange(r); load(pw, r) }

  const live = data?.live
  const t = live?.traffic
  const s = live?.stripe
  const g = live?.gsc
  const a = live?.app
  const history = (data?.history || []).slice().sort((x, y) => x.day.localeCompare(y.day))

  return (
    <div className="admin-root">
      <style>{CSS}</style>

      {!authed ? (
        <form
          className="gate"
          onSubmit={(e) => { e.preventDefault(); load(pw, range) }}
        >
          <h1>Faithful Kids Admin</h1>
          <input
            type="password" placeholder="Password" value={pw} autoFocus
            onChange={(e) => setPw(e.target.value)}
          />
          <button type="submit" disabled={loading}>{loading ? 'Checking…' : 'Enter'}</button>
          {error ? <p className="err">{error}</p> : null}
        </form>
      ) : (
        <main>
          <header className="head">
            <div>
              <h1>Faithful Kids Admin</h1>
              <p className="sub">
                {live ? `${live.start_day}${live.end_day !== live.start_day ? ` → ${live.end_day}` : ''} · refreshed ${new Date(live.collected_at).toLocaleTimeString()}` : ''}
              </p>
            </div>
            <div className="tabs">
              {RANGES.map((r) => (
                <button key={r.key} className={range === r.key ? 'on' : ''} onClick={() => pick(r.key)}>{r.label}</button>
              ))}
              <button onClick={() => load(pw, range)} title="Refresh">↻</button>
            </div>
          </header>

          {loading ? <p className="loading">Loading…</p> : null}
          {error ? <p className="err">{error}</p> : null}

          {t ? (
            <>
              <section className="tiles">
                <Tile label="Visitors" value={fmt(t.visitors)} sub={`${fmt(t.new_visitors)} new · ${fmt(t.returning_visitors)} returning`} />
                <Tile label="Pageviews" value={fmt(t.pageviews)} sub={`${t.pages_per_session} per session`} />
                <Tile label="Sessions" value={fmt(t.sessions)} sub={`${t.bounce_rate}% bounce · ${dur(t.avg_session_seconds)} avg`} />
                <Tile label="Google clicks" value={g ? fmt(g.clicks) : '—'} sub={g ? `${fmt(g.impressions)} impressions · ${g.ctr}% CTR · pos ${g.position}` : 'GSC data lags 2–3 days'} />
                <Tile label="Quiz completions" value={fmt(t.funnel.quiz_completed)} sub={`${fmt(t.funnel.quiz_visitors)} quiz visitors`} />
                <Tile
                  label="Revenue (range)"
                  value={s ? money(s.range.organic.revenue) : '—'}
                  sub={s ? `${s.range.organic.purchases} payments · ${s.range.organic.trials_started} trials started` : ''}
                  alert={!!s && s.range.organic.revenue === 0 && s.range.checkout_sessions_expired > 0}
                />
              </section>

              {s ? (
                <section className="tiles">
                  <Tile label="MRR (real customers)" value={money(s.now.organic_mrr)} sub={`${money(s.now.mrr)} incl. test/family`} />
                  <Tile label="Paying now" value={fmt(s.now.organic_paying)} sub={`${s.now.organic_active} active · ${s.now.organic_trialing} trialing (real)`} />
                  <Tile label="Revenue all-time" value={money(s.now.organic_revenue_alltime)} sub={`${money(s.now.revenue_alltime)} incl. test/family`} />
                  <Tile label="Abandoned checkouts" value={fmt(s.range.checkout_sessions_expired)} sub="Stripe sessions expired in range" alert={s.range.checkout_sessions_expired > 0} />
                  <Tile label="Canceled in range" value={fmt(s.range.organic.canceled)} sub="real customers" alert={s.range.organic.canceled > 0} />
                  <Tile label="Open payment failures" value={fmt(s.now.open_payment_failures)} alert={s.now.open_payment_failures > 0} />
                </section>
              ) : null}

              {a ? (
                <section className="tiles">
                  <Tile label="Families" value={fmt(a.total_families)} sub={`+${a.new_families} in range`} />
                  <Tile label="Kid profiles" value={fmt(a.total_kids)} sub={`+${a.new_kids} in range`} />
                  <Tile label="Email leads" value={fmt(a.total_leads)} sub={`+${a.new_leads} in range`} />
                  <Tile label="App sign-ups (range)" value={fmt(t.conversion_events.sign_up)} />
                  <Tile label="Purchases tracked" value={fmt(t.conversion_events.purchase_completed)} sub="purchase_completed events" />
                  <Tile label="Cancellations tracked" value={fmt(t.conversion_events.subscription_canceled)} sub="subscription_canceled events" />
                </section>
              ) : null}

              <Panel title="Funnel" sub="Unique people at each step in this range">
                {(() => {
                  const f = t.funnel
                  const max = Math.max(f.quiz_visitors, 1)
                  return (
                    <div>
                      <BarRow label="Visited /quiz" value={f.quiz_visitors} max={max} extra={t.visitors ? `${Math.round((f.quiz_visitors / t.visitors) * 1000) / 10}% of visitors` : ''} />
                      <BarRow label="Started quiz" value={f.quiz_started} max={max} />
                      <BarRow label="Answered a question" value={f.quiz_answered} max={max} />
                      <BarRow label="Completed quiz" value={f.quiz_completed} max={max} />
                      <BarRow label="Selected a plan" value={f.plan_selected} max={max} />
                      <BarRow label="Clicked checkout" value={f.checkout_clicked} max={max} />
                      {s ? <BarRow label="Started trial (Stripe)" value={s.range.organic.trials_started} max={max} /> : null}
                      {s ? <BarRow label="Paid (Stripe)" value={s.range.organic.purchases} max={max} /> : null}
                    </div>
                  )
                })()}
              </Panel>

              <Panel title="Visitors per day" sub="From nightly snapshots · today appears after tonight's run">
                <TrendChart
                  points={history.map((h) => ({ day: h.day, v: h.data.traffic?.visitors ?? 0 }))}
                  label="Visitors per day"
                />
              </Panel>

              <div className="grid2">
                <Panel title="Top pages" sub="Unique visitors in range">
                  <table><tbody>
                    {t.top_pages.slice(0, 20).map((p) => (
                      <tr key={p.path}><td className="path">{p.path}</td><td className="num">{fmt(p.visitors)}</td><td className="num dim">{fmt(p.views)} views</td></tr>
                    ))}
                  </tbody></table>
                </Panel>
                <Panel title="Traffic sources">
                  <table><tbody>
                    {t.referrers.map((r) => (
                      <tr key={r.ref}><td>{r.ref === '$direct' ? 'Direct / none' : r.ref}</td><td className="num">{fmt(r.visitors)}</td></tr>
                    ))}
                  </tbody></table>
                </Panel>
              </div>

              <div className="grid2">
                <Panel title="Google queries" sub={g ? 'Clicks / impressions / avg position' : 'GSC data lags 2–3 days — pick a wider range'}>
                  {g ? (
                    <table><tbody>
                      {g.top_queries.map((q) => (
                        <tr key={q.query}><td>{q.query}</td><td className="num">{fmt(q.clicks)}</td><td className="num dim">{fmt(q.impressions)}</td><td className="num dim">{q.position}</td></tr>
                      ))}
                    </tbody></table>
                  ) : null}
                </Panel>
                <Panel title="Google pages" sub={g ? 'Clicks / impressions / avg position' : ''}>
                  {g ? (
                    <table><tbody>
                      {g.top_pages.map((p) => (
                        <tr key={p.page}><td className="path">{p.page}</td><td className="num">{fmt(p.clicks)}</td><td className="num dim">{fmt(p.impressions)}</td><td className="num dim">{p.position}</td></tr>
                      ))}
                    </tbody></table>
                  ) : null}
                </Panel>
              </div>

              <div className="grid2">
                <Panel title="Countries">
                  <table><tbody>
                    {t.countries.map((c) => (
                      <tr key={c.country}><td>{c.country}</td><td className="num">{fmt(c.visitors)}</td></tr>
                    ))}
                  </tbody></table>
                </Panel>
                <Panel title="Devices">
                  <table><tbody>
                    {t.devices.map((d) => (
                      <tr key={d.device}><td>{d.device}</td><td className="num">{fmt(d.visitors)}</td></tr>
                    ))}
                  </tbody></table>
                </Panel>
              </div>

              <Panel title="Daily history" sub="One row per day, saved by the nightly cron (America/New_York days)">
                <div className="scroll">
                  <table className="history">
                    <thead>
                      <tr>
                        <th>Day</th><th>Visitors</th><th>Views</th><th>Bounce</th>
                        <th>G clicks</th><th>G imps</th><th>Quiz done</th><th>Checkout</th>
                        <th>Trials</th><th>Revenue</th><th>Leads</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.slice().reverse().map((h) => {
                        const ht = h.data.traffic, hg = h.data.gsc, hs = h.data.stripe, ha = h.data.app
                        return (
                          <tr key={h.day}>
                            <td>{h.day}</td>
                            <td className="num">{fmt(ht?.visitors)}</td>
                            <td className="num">{fmt(ht?.pageviews)}</td>
                            <td className="num dim">{ht ? `${ht.bounce_rate}%` : '—'}</td>
                            <td className="num">{hg ? fmt(hg.clicks) : '—'}</td>
                            <td className="num dim">{hg ? fmt(hg.impressions) : '—'}</td>
                            <td className="num">{fmt(ht?.funnel?.quiz_completed)}</td>
                            <td className="num">{fmt(ht?.funnel?.checkout_clicked)}</td>
                            <td className="num">{fmt(hs?.range?.organic?.trials_started)}</td>
                            <td className={`num${(hs?.range?.organic?.revenue ?? 0) > 0 ? ' good' : ''}`}>{hs ? money(hs.range.organic.revenue) : '—'}</td>
                            <td className="num">{fmt(ha?.new_leads)}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </Panel>
            </>
          ) : null}
        </main>
      )}
    </div>
  )
}

const CSS = `
.admin-root { min-height: 100vh; background: #f6f8f7; color: #14201b; font: 14px/1.5 system-ui, -apple-system, "Segoe UI", sans-serif; }
.admin-root main { max-width: 1100px; margin: 0 auto; padding: 24px 20px 80px; }
.gate { max-width: 320px; margin: 18vh auto 0; display: grid; gap: 10px; padding: 0 20px; }
.gate h1 { font-size: 22px; margin: 0 0 6px; }
.gate input { padding: 10px 12px; border: 1px solid #cfd8d3; border-radius: 8px; font-size: 15px; }
.gate button { padding: 10px 12px; border: 0; border-radius: 8px; background: #059669; color: #fff; font-size: 15px; font-weight: 600; cursor: pointer; }
.err { color: #c02626; }
.loading { color: #6b7a73; }
.head { display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; flex-wrap: wrap; margin-bottom: 18px; }
.head h1 { font-size: 24px; margin: 0; }
.head .sub { margin: 2px 0 0; color: #6b7a73; font-size: 13px; }
.tabs { display: flex; gap: 6px; flex-wrap: wrap; }
.tabs button { padding: 7px 14px; border: 1px solid #cfd8d3; border-radius: 999px; background: #fff; font-size: 13.5px; cursor: pointer; color: #14201b; }
.tabs button.on { background: #059669; border-color: #059669; color: #fff; font-weight: 600; }
.tiles { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 10px; margin-bottom: 12px; }
.tile { background: #fff; border: 1px solid #e2e8e5; border-radius: 10px; padding: 12px 14px; }
.tile.alert { border-color: #e0a1a1; background: #fdf6f6; }
.t-label { font-size: 12px; color: #6b7a73; }
.t-value { font-size: 24px; font-weight: 700; margin-top: 2px; }
.tile.alert .t-value { color: #c02626; }
.t-sub { font-size: 12px; color: #8a958f; margin-top: 2px; }
.panel { background: #fff; border: 1px solid #e2e8e5; border-radius: 10px; padding: 16px 18px; margin: 12px 0; }
.panel h3 { margin: 0 0 2px; font-size: 15px; }
.p-sub { margin: 0 0 12px; font-size: 12.5px; color: #8a958f; }
.grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
@media (max-width: 760px) { .grid2 { grid-template-columns: 1fr; } }
.panel table { width: 100%; border-collapse: collapse; font-size: 13px; }
.panel td, .panel th { padding: 5px 8px 5px 0; border-bottom: 1px solid #eef2f0; text-align: left; }
.panel tr:last-child td { border-bottom: 0; }
.num { text-align: right !important; font-variant-numeric: tabular-nums; white-space: nowrap; }
.num.good { color: #047857; font-weight: 700; }
.dim { color: #8a958f; }
.path { max-width: 340px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.history th { font-size: 11.5px; text-transform: uppercase; letter-spacing: 0.04em; color: #8a958f; text-align: right; }
.history th:first-child { text-align: left; }
.scroll { overflow-x: auto; }
.barrow { display: grid; grid-template-columns: 170px 1fr 150px; align-items: center; gap: 10px; padding: 4px 0; }
.br-label { font-size: 13px; color: #4d5b54; }
.br-track { background: #eef2f0; border-radius: 4px; height: 16px; overflow: hidden; }
.br-fill { display: block; height: 100%; background: #059669; border-radius: 4px; }
.br-val { font-size: 13px; font-weight: 600; font-variant-numeric: tabular-nums; }
.br-val em { font-style: normal; font-weight: 400; color: #8a958f; font-size: 12px; }
.chartwrap { overflow-x: auto; }
.trend-bar { fill: #059669; }
.trend-tick { font-size: 11px; fill: #8a958f; }
@media (max-width: 600px) { .barrow { grid-template-columns: 120px 1fr 90px; } .br-val em { display: none; } }
`
