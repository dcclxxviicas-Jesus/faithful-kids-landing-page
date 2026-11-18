'use client'

import { useMemo, useState, type ReactNode } from 'react'
import posthog from 'posthog-js'
import { CATEGORIES, AGE_GROUPS, PRICE_LABEL, categoryLabel, type Listing, type Category, type AgeGroup } from '@/lib/christian-apps-meta'

/*
 * The filterable grid. Every card is server-rendered into the HTML (the
 * filters only hide cards), so Google sees all listing links on first load.
 * The Faithful Kids ad is passed in as `ad` and sits after the ninth card of
 * the unfiltered list, never first.
 */

type PriceFilter = 'all' | 'free' | 'paid'
type PlatFilter = 'all' | 'ios' | 'android' | 'web'

const isFree = (l: Listing) => l.priceModel === 'free' || l.priceModel === 'free-with-ads' || l.priceModel === 'freemium'

export function AppDirectory({ listings, ad, cards, showAge = true }: { listings: Listing[]; ad: ReactNode; cards: Record<string, ReactNode>; showAge?: boolean }) {
  const [cat, setCat] = useState<Category | 'all'>('all')
  const [age, setAge] = useState<AgeGroup | 'all'>('all')
  const [price, setPrice] = useState<PriceFilter>('all')
  const [plat, setPlat] = useState<PlatFilter>('all')
  const [q, setQ] = useState('')

  const usedCats = useMemo(() => CATEGORIES.filter(c => listings.some(l => l.category === c.key)), [listings])

  const visible = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return new Set(listings.filter(l =>
      (cat === 'all' || l.category === cat) &&
      (age === 'all' || l.ageGroups.includes(age)) &&
      (price === 'all' || (price === 'free' ? isFree(l) : !isFree(l))) &&
      (plat === 'all' || Boolean(l.platforms[plat])) &&
      (!needle || `${l.name} ${l.maker || ''} ${l.description}`.toLowerCase().includes(needle)),
    ).map(l => l.slug))
  }, [listings, cat, age, price, plat, q])

  const filtered = cat !== 'all' || age !== 'all' || price !== 'all' || plat !== 'all' || q.trim() !== ''
  const track = (filter: string, value: string) => { try { posthog.capture('app_directory_filter', { filter, value }) } catch { /* noop */ } }
  const reset = () => { setCat('all'); setAge('all'); setPrice('all'); setPlat('all'); setQ('') }

  let shown = 0
  return (
    <div className="ad-dir">
      <div className="ad-filters" role="search">
        <input
          className="ad-search" type="search" value={q} placeholder="Search apps, makers or topics"
          aria-label="Search the directory" onChange={e => setQ(e.target.value)}
        />
        <div className="ad-pills" aria-label="Category">
          <button type="button" className={cat === 'all' ? 'on' : ''} onClick={() => setCat('all')}>All</button>
          {usedCats.map(c => (
            <button key={c.key} type="button" className={cat === c.key ? 'on' : ''}
              onClick={() => { setCat(c.key); track('category', c.key) }}>{c.label}</button>
          ))}
        </div>
        <div className="ad-selects">
          {showAge && <label>Age
            <select value={age} onChange={e => { setAge(e.target.value as AgeGroup | 'all'); track('age', e.target.value) }}>
              <option value="all">Any age</option>
              {AGE_GROUPS.map(a => <option key={a.key} value={a.key}>{a.label}</option>)}
            </select>
          </label>}
          <label>Price
            <select value={price} onChange={e => { setPrice(e.target.value as PriceFilter); track('price', e.target.value) }}>
              <option value="all">Free or paid</option>
              <option value="free">Free to start</option>
              <option value="paid">Paid or subscription</option>
            </select>
          </label>
          <label>Device
            <select value={plat} onChange={e => { setPlat(e.target.value as PlatFilter); track('platform', e.target.value) }}>
              <option value="all">Any device</option>
              <option value="ios">iPhone/iPad</option>
              <option value="android">Android</option>
              <option value="web">Web browser</option>
            </select>
          </label>
        </div>
        <p className="ad-count" aria-live="polite">
          {visible.size} of {listings.length} listings
          {filtered && <> · <button type="button" className="ad-reset" onClick={reset}>Clear filters</button></>}
        </p>
      </div>

      <div className="ad-grid">
        {listings.map(l => {
          const on = visible.has(l.slug)
          if (on) shown++
          const showAd = !filtered && on && shown === 9
          return (
            <FragmentWithAd key={l.slug} hidden={!on} ad={showAd ? ad : null}>{cards[l.slug]}</FragmentWithAd>
          )
        })}
      </div>
      {visible.size === 0 && (
        <p className="ad-empty">Nothing matches those filters yet. <button type="button" className="ad-reset" onClick={reset}>Clear filters</button></p>
      )}
      {filtered && <div className="ad-after">{ad}</div>}
    </div>
  )
}

function FragmentWithAd({ hidden, ad, children }: { hidden: boolean; ad: ReactNode; children: ReactNode }) {
  return (
    <>
      <div className="ad-cell" hidden={hidden}>{children}</div>
      {ad && <div className="ad-cell ad-cell-wide">{ad}</div>}
    </>
  )
}

export { PRICE_LABEL, categoryLabel }
