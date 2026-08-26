'use client'

/**
 * Playable word search, built to feel like the app's quiz rather than a static
 * grid with click handlers bolted on.
 *
 * Same design language as bible-kids/src/components/QuizSection.tsx: Duolingo
 * card, the app's own praise pool, streaks, a score title on completion. A
 * visitor who stumbles onto this page should get a real game — that is what
 * keeps them on the page, and what makes the app pitch afterwards credible.
 *
 * Tap the first letter, then the last. Deliberately not drag-select: dragging
 * is fiddly on touch and breaks the moment a child's finger leaves the grid.
 *
 * Printing is unaffected — every game-state class is dropped by the print
 * stylesheet, so a page printed mid-game comes out blank and usable.
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import posthog from 'posthog-js'

type Placement = { row: number; col: number; dr: number; dc: number }

// The app's own pools, so the free sample sounds like the product.
const PRAISE = ['Amazing!', 'Nailed it!', "You're on fire!", 'Bible Scholar!', 'Incredible!', 'Way to go!', 'Brilliant!']

function medal(found: number, total: number) {
  if (found === total) return { emoji: '🏆', title: 'Every word found!' }
  if (found >= total * 0.75) return { emoji: '⭐', title: 'So close!' }
  if (found >= total / 2) return { emoji: '📖', title: 'Good going!' }
  return { emoji: '💪', title: 'Keep looking!' }
}

export function WordSearchGame({
  grid, words, answers, slug, title,
}: {
  grid: string[][]
  words: string[]
  answers: Record<string, Placement>
  slug: string
  title: string
}) {
  const [found, setFound] = useState<Record<string, boolean>>({})
  const [start, setStart] = useState<[number, number] | null>(null)
  const [streak, setStreak] = useState(0)
  const [best, setBest] = useState(0)
  const [toast, setToast] = useState<{ text: string; good: boolean } | null>(null)
  const [shake, setShake] = useState(false)
  const [began, setBegan] = useState<number | null>(null)
  const [elapsed, setElapsed] = useState(0)

  const total = words.length
  const foundCount = Object.keys(found).length
  const done = foundCount === total

  useEffect(() => {
    if (began === null || done) return
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - began) / 1000)), 1000)
    return () => clearInterval(id)
  }, [began, done])

  const lit = useMemo(() => {
    const s = new Set<string>()
    for (const w of Object.keys(found)) {
      const a = answers[w]
      if (!a) continue
      for (let i = 0; i < w.length; i++) s.add(`${a.row + a.dr * i},${a.col + a.dc * i}`)
    }
    return s
  }, [found, answers])

  const click = useCallback((r: number, c: number) => {
    if (done) return
    if (began === null) {
      setBegan(Date.now())
      try { posthog.capture('word_search_start', { slug }) } catch {}
    }
    if (!start) { setStart([r, c]); return }
    const [sr, sc] = start
    if (sr === r && sc === c) { setStart(null); return }

    const straight = sr === r || sc === c || Math.abs(r - sr) === Math.abs(c - sc)
    if (straight) {
      const dr = Math.sign(r - sr), dc = Math.sign(c - sc)
      const len = Math.max(Math.abs(r - sr), Math.abs(c - sc)) + 1
      let picked = ''
      for (let i = 0; i < len; i++) picked += grid[sr + dr * i]?.[sc + dc * i] ?? ''
      const rev = [...picked].reverse().join('')
      const hit = words.find(w => !found[w] && (w === picked || w === rev))
      if (hit) {
        const n = streak + 1
        setFound(f => ({ ...f, [hit]: true }))
        setStreak(n)
        setBest(b => Math.max(b, n))
        setToast({
          text: n >= 3 ? `🔥 ${n} in a row! ${PRAISE[n % PRAISE.length]}` : PRAISE[n % PRAISE.length],
          good: true,
        })
        setTimeout(() => setToast(null), 1400)
        setStart(null)
        if (foundCount + 1 === total) {
          try {
            posthog.capture('word_search_complete', {
              slug, seconds: began ? Math.floor((Date.now() - began) / 1000) : null, best_streak: Math.max(best, n),
            })
          } catch {}
        }
        return
      }
    }
    setStreak(0)
    setShake(true)
    setTimeout(() => setShake(false), 320)
    setStart(null)
  }, [done, began, start, grid, words, found, foundCount, total, streak, best, slug])

  function reset() {
    setFound({}); setStart(null); setStreak(0); setBest(0)
    setBegan(null); setElapsed(0); setToast(null)
  }

  const pct = (foundCount / total) * 100
  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0')
  const ss = String(elapsed % 60).padStart(2, '0')
  const result = medal(foundCount, total)

  return (
    <div className="wsg">
      <div className="wsg-card no-print">
        <div className="wsg-top">
          <span className="wsg-pill">▶ PLAY NOW · FREE</span>
          <span className="wsg-timer">{began === null ? '00:00' : `${mm}:${ss}`}</span>
        </div>
        <div className="wsg-bar-track"><i style={{ width: `${pct}%` }} /></div>
        <div className="wsg-stats">
          <span><strong>{foundCount}</strong> / {total} found</span>
          <span>{streak > 1 ? `🔥 ${streak} streak` : `Best streak: ${best}`}</span>
        </div>

        {toast && <p className="wsg-toast">{toast.text}</p>}
        {!toast && !done && (
          <p className="wsg-hint">
            {start ? 'Now tap the last letter.' : 'Tap the first letter of a word, then the last.'}
          </p>
        )}

        {done && (
          <div className="wsg-done">
            <div className="wsg-emoji">{result.emoji}</div>
            <h3>{result.title}</h3>
            <p className="wsg-done-sub">
              {total} words in {mm}:{ss}{best > 2 ? ` · best streak ${best}` : ''}
            </p>
            <a className="pc-btn wsg-cta" href="/quiz?ref=word-search-game">
              Now watch the {title} story
            </a>
            <button className="wsg-reset" onClick={reset}>Play again</button>
          </div>
        )}
      </div>

      <table className={`ws-table wsg-table${shake ? ' wsg-shake' : ''}`}>
        <tbody>
          {grid.map((row, r) => (
            <tr key={r}>
              {row.map((ch, c) => {
                const isStart = start && start[0] === r && start[1] === c
                return (
                  <td
                    key={c}
                    className={`wsg-cell${lit.has(`${r},${c}`) ? ' wsg-lit' : ''}${isStart ? ' wsg-start' : ''}`}
                    onClick={() => click(r, c)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') click(r, c) }}
                  >
                    {ch}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="ws-list wsg-list">
        {words.map(w => (
          <li key={w} className={found[w] ? 'wsg-struck' : undefined}>{w}</li>
        ))}
      </ul>
    </div>
  )
}
