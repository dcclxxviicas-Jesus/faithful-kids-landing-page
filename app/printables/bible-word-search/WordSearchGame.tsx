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
 * Two ways to select, because neither alone suits everyone: drag across a word
 * (mouse or finger), or tap the first letter and then the last. The tap route
 * matters on touch — a child whose finger slips off the grid mid-drag loses the
 * selection, and tapping two ends never fails that way.
 *
 * Dragging uses elementFromPoint rather than pointerenter, because pointerenter
 * does not fire for a finger moving over elements on touch devices.
 *
 * Printing is unaffected — every game-state class is dropped by the print
 * stylesheet, so a page printed mid-game comes out blank and usable.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
  const [anchor, setAnchor] = useState<[number, number] | null>(null)
  const [cursor, setCursor] = useState<[number, number] | null>(null)
  const draggingRef = useRef(false)
  const movedRef = useRef(false)
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

  const begin = useCallback(() => {
    if (began === null) {
      setBegan(Date.now())
      try { posthog.capture('word_search_start', { slug }) } catch {}
    }
  }, [began, slug])

  /** Validate a selection running from one cell to another. */
  const submit = useCallback((a: [number, number], b: [number, number]) => {
    const [sr, sc] = a, [r, c] = b
    if (sr === r && sc === c) return false
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
        setBest(bs => Math.max(bs, n))
        setToast({
          text: n >= 3 ? `🔥 ${n} in a row! ${PRAISE[n % PRAISE.length]}` : PRAISE[n % PRAISE.length],
          good: true,
        })
        setTimeout(() => setToast(null), 1400)
        if (foundCount + 1 === total) {
          try {
            posthog.capture('word_search_complete', {
              slug,
              seconds: began ? Math.floor((Date.now() - began) / 1000) : null,
              best_streak: Math.max(best, n),
            })
          } catch {}
        }
        return true
      }
    }
    setStreak(0)
    setShake(true)
    setTimeout(() => setShake(false), 320)
    return false
  }, [grid, words, found, foundCount, total, streak, best, began, slug])

  /** Which cell is under this point? Works for mouse and finger alike --
   *  pointerenter does not fire for a finger sliding across elements. */
  function cellAt(x: number, y: number): [number, number] | null {
    const el = document.elementFromPoint(x, y) as HTMLElement | null
    const cell = el?.closest?.('[data-rc]') as HTMLElement | null
    if (!cell?.dataset.rc) return null
    const [r, c] = cell.dataset.rc.split(',').map(Number)
    return [r, c]
  }

  function onPointerDown(e: React.PointerEvent, r: number, c: number) {
    if (done) return
    e.preventDefault()
    begin()
    draggingRef.current = true
    movedRef.current = false
    setAnchor([r, c])
    setCursor([r, c])
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!draggingRef.current || done) return
    const at = cellAt(e.clientX, e.clientY)
    if (!at) return
    if (!cursor || at[0] !== cursor[0] || at[1] !== cursor[1]) {
      movedRef.current = true
      setCursor(at)
    }
  }

  function onPointerUp() {
    if (done) return
    const a = anchor
    draggingRef.current = false

    if (movedRef.current && a && cursor) {
      submit(a, cursor)
      setAnchor(null); setCursor(null); setStart(null)
      return
    }
    // No drag: treat it as a tap. First tap arms, second tap submits.
    if (a) {
      if (start) {
        submit(start, a)
        setStart(null)
      } else {
        setStart(a)
      }
    }
    setAnchor(null); setCursor(null)
  }

  /** Cells under the in-progress drag, for live highlighting. */
  const previewing = useMemo(() => {
    const s = new Set<string>()
    if (!anchor || !cursor) return s
    const [sr, sc] = anchor, [r, c] = cursor
    const straight = sr === r || sc === c || Math.abs(r - sr) === Math.abs(c - sc)
    if (!straight) return s
    const dr = Math.sign(r - sr), dc = Math.sign(c - sc)
    const len = Math.max(Math.abs(r - sr), Math.abs(c - sc)) + 1
    for (let i = 0; i < len; i++) s.add(`${sr + dr * i},${sc + dc * i}`)
    return s
  }, [anchor, cursor])

  function reset() {
    setFound({}); setStart(null); setAnchor(null); setCursor(null); setStreak(0); setBest(0)
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
          <div className="wsg-how">
            {start ? (
              <p className="wsg-how-main">Now tap the <strong>last</strong> letter of the word.</p>
            ) : (
              <>
                <p className="wsg-how-main">
                  <span className="wsg-how-icon" aria-hidden="true">👆</span>
                  Drag across a word to circle it
                </p>
                <p className="wsg-how-alt">
                  Or tap the first letter, then the last. Words run in every direction,
                  including backwards.
                </p>
              </>
            )}
          </div>
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

      <table
        className={`ws-table wsg-table${shake ? ' wsg-shake' : ''}`}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <tbody>
          {grid.map((row, r) => (
            <tr key={r}>
              {row.map((ch, c) => {
                const key = `${r},${c}`
                const isStart = start && start[0] === r && start[1] === c
                const cls = [
                  'wsg-cell',
                  lit.has(key) ? 'wsg-lit' : '',
                  previewing.has(key) ? 'wsg-sel' : '',
                  isStart ? 'wsg-start' : '',
                ].filter(Boolean).join(' ')
                return (
                  <td
                    key={c}
                    data-rc={key}
                    className={cls}
                    onPointerDown={e => onPointerDown(e, r, c)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => {
                      if (e.key !== 'Enter' && e.key !== ' ') return
                      begin()
                      if (start) { submit(start, [r, c]); setStart(null) } else { setStart([r, c]) }
                    }}
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
