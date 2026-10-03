'use client'

/**
 * Playable crossword, same design language as WordSearchGame.tsx and the
 * app's QuizSection: Duolingo card, the app's praise pool, streaks, a medal
 * on completion. A visitor who searched "bible crossword" gets a real game,
 * not a static grid -- that is what keeps them on the page and makes the app
 * pitch afterwards credible.
 *
 * Words auto-check the moment their last cell fills: right locks green with
 * praise, wrong flashes and stays editable. No "check" button to find --
 * seven-year-olds don't read toolbars.
 *
 * Printing is handled by the page, which renders a separate print-only empty
 * grid (see .cw-print-sheet): CSS cannot blank an <input>'s value, so hiding
 * the game and printing a clean sheet is the only way a mid-game page prints
 * blank and usable.
 */

import { useCallback, useMemo, useRef, useState } from 'react'
import posthog from 'posthog-js'

export type Clue = { num: number; clue: string; answer: string; row: number; col: number; len: number }

const PRAISE = ['Amazing!', 'Nailed it!', "You're on fire!", 'Bible Scholar!', 'Incredible!', 'Way to go!', 'Brilliant!']

function medal(solved: number, total: number) {
  if (solved === total) return { emoji: '🏆', title: 'Every word solved!' }
  if (solved >= total * 0.75) return { emoji: '⭐', title: 'So close!' }
  if (solved >= total / 2) return { emoji: '📖', title: 'Good going!' }
  return { emoji: '💪', title: 'Keep thinking!' }
}

type Word = Clue & { dir: 'across' | 'down' }

export function CrosswordGame({
  grid, nums, across, down, slug, title,
}: {
  grid: (string | null)[][]
  nums: Record<string, number>
  across: Clue[]
  down: Clue[]
  slug: string
  title: string
}) {
  const words = useMemo<Word[]>(() => [
    ...across.map(c => ({ ...c, dir: 'across' as const })),
    ...down.map(c => ({ ...c, dir: 'down' as const })),
  ], [across, down])

  const [letters, setLetters] = useState<Record<string, string>>({})
  const [solved, setSolved] = useState<Record<string, boolean>>({})
  const [active, setActive] = useState<Word | null>(null)
  const [wrong, setWrong] = useState<string | null>(null)
  const [streak, setStreak] = useState(0)
  const [best, setBest] = useState(0)
  const [toast, setToast] = useState<string | null>(null)
  const [began, setBegan] = useState<number | null>(null)
  const inputs = useRef<Record<string, HTMLInputElement | null>>({})

  const total = words.length
  const solvedCount = Object.keys(solved).length
  const done = solvedCount === total

  const keyOf = (w: Word) => `${w.dir}-${w.num}`
  const cellsOf = useCallback((w: Word) => {
    const out: string[] = []
    for (let i = 0; i < w.len; i++) {
      out.push(w.dir === 'across' ? `${w.row},${w.col + i}` : `${w.row + i},${w.col}`)
    }
    return out
  }, [])

  const lockedCells = useMemo(() => {
    const s = new Set<string>()
    for (const w of words) if (solved[keyOf(w)]) cellsOf(w).forEach(k => s.add(k))
    return s
  }, [words, solved, cellsOf])

  const activeCells = useMemo(
    () => new Set(active ? cellsOf(active) : []),
    [active, cellsOf],
  )

  const begin = useCallback(() => {
    if (began === null) {
      setBegan(Date.now())
      try { posthog.capture('crossword_start', { slug }) } catch {}
    }
  }, [began, slug])

  /** Words crossing this cell, preferring the given direction. */
  const wordsAt = useCallback((key: string) =>
    words.filter(w => cellsOf(w).includes(key)), [words, cellsOf])

  function focusCell(key: string) {
    inputs.current[key]?.focus()
    inputs.current[key]?.select()
  }

  function selectWord(w: Word) {
    begin()
    setActive(w)
    const firstOpen = cellsOf(w).find(k => !lockedCells.has(k)) ?? cellsOf(w)[0]
    focusCell(firstOpen)
  }

  /** After any letter lands, auto-check every unsolved word that is full. */
  const checkWords = useCallback((next: Record<string, string>, typedIn: Word | null) => {
    const newlySolved: string[] = []
    let flashWrong = false
    for (const w of words) {
      const k = keyOf(w)
      if (solved[k]) continue
      const cells = cellsOf(w)
      const filled = cells.every(c => (next[c] ?? '').length === 1)
      if (!filled) continue
      const guess = cells.map(c => next[c]).join('')
      if (guess === w.answer) newlySolved.push(k)
      else if (typedIn && k === keyOf(typedIn)) flashWrong = true
    }
    if (newlySolved.length) {
      const n = streak + 1
      setSolved(s => {
        const out = { ...s }
        newlySolved.forEach(k => { out[k] = true })
        return out
      })
      setStreak(n)
      setBest(b => Math.max(b, n))
      setToast(n >= 3 ? `🔥 ${n} in a row! ${PRAISE[n % PRAISE.length]}` : PRAISE[n % PRAISE.length])
      setTimeout(() => setToast(null), 1400)
      if (solvedCount + newlySolved.length === total) {
        try {
          posthog.capture('crossword_complete', {
            slug,
            seconds: began ? Math.floor((Date.now() - began) / 1000) : null,
          })
        } catch {}
      }
    } else if (flashWrong && typedIn) {
      setStreak(0)
      setWrong(keyOf(typedIn))
      setTimeout(() => setWrong(null), 600)
    }
  }, [words, solved, solvedCount, total, streak, began, slug, cellsOf])

  function onInput(key: string, raw: string) {
    const ch = raw.replace(/[^a-zA-Z]/g, '').slice(-1).toUpperCase()
    if (!ch) return
    begin()
    const next = { ...letters, [key]: ch }
    setLetters(next)
    // advance within the active word, skipping locked cells
    const w = active ?? wordsAt(key)[0] ?? null
    if (w) {
      const cells = cellsOf(w)
      const i = cells.indexOf(key)
      const after = cells.slice(i + 1).find(k => !lockedCells.has(k))
      if (after) focusCell(after)
    }
    checkWords(next, w)
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>, key: string) {
    if (e.key !== 'Backspace' || lockedCells.has(key)) return
    e.preventDefault()
    const next = { ...letters }
    const w = active ?? wordsAt(key)[0] ?? null
    if (letters[key]) {
      delete next[key]
      setLetters(next)
      return
    }
    if (w) {
      const cells = cellsOf(w)
      const i = cells.indexOf(key)
      const before = [...cells.slice(0, i)].reverse().find(k => !lockedCells.has(k))
      if (before) {
        delete next[before]
        setLetters(next)
        focusCell(before)
      }
    }
  }

  function onCellFocus(key: string) {
    const here = wordsAt(key)
    if (here.length === 0) return
    // tapping a cell already in the active word toggles direction at crossings
    if (active && cellsOf(active).includes(key) && here.length > 1) return
    setActive(here.find(w => !solved[keyOf(w)]) ?? here[0])
  }

  function onCellTap(key: string) {
    const here = wordsAt(key)
    if (active && here.length > 1 && cellsOf(active).includes(key)) {
      const other = here.find(w => keyOf(w) !== keyOf(active))
      if (other) setActive(other)
    }
  }

  function reset() {
    setLetters({}); setSolved({}); setActive(null); setStreak(0); setBest(0)
    setBegan(null); setToast(null); setWrong(null)
  }

  const wrongCells = useMemo(() => {
    if (!wrong) return new Set<string>()
    const w = words.find(x => keyOf(x) === wrong)
    return new Set(w ? cellsOf(w) : [])
  }, [wrong, words, cellsOf])

  const pct = (solvedCount / total) * 100
  const result = medal(solvedCount, total)

  const clueList = (dir: 'across' | 'down', list: Clue[]) => (
    <div className="cwg-clues-col">
      <h3>{dir === 'across' ? 'Across' : 'Down'}</h3>
      <ol>
        {list.map(c => {
          const w = { ...c, dir }
          const k = keyOf(w)
          const isActive = active && keyOf(active) === k
          return (
            <li
              key={k}
              value={c.num}
              className={[solved[k] ? 'cwg-solved' : '', isActive ? 'cwg-active-clue' : ''].filter(Boolean).join(' ') || undefined}
            >
              <button type="button" onClick={() => selectWord(w)}>
                <strong>{c.num}.</strong> {c.clue} <span className="cwg-len">({c.len})</span>
              </button>
            </li>
          )
        })}
      </ol>
    </div>
  )

  return (
    <div className="cwg no-print">
      <div className="wsg-card">
        <div className="wsg-top">
          <span className="wsg-pill">▶ PLAY NOW · FREE</span>
          <span className="wsg-timer">{solvedCount} / {total}</span>
        </div>
        <div className="wsg-bar-track"><i style={{ width: `${pct}%` }} /></div>
        <div className="wsg-stats">
          <span><strong>{solvedCount}</strong> / {total} solved</span>
          <span>{streak > 1 ? `🔥 ${streak} streak` : `Best streak: ${best}`}</span>
        </div>

        {toast && <p className="wsg-toast">{toast}</p>}
        {!toast && !done && (
          <div className="wsg-how">
            <p className="wsg-how-main">
              <span className="wsg-how-icon" aria-hidden="true">👆</span>
              Tap a clue, then type the answer
            </p>
            <p className="wsg-how-alt">
              Right answers lock in green on their own. Tap a crossing square to
              switch between across and down.
            </p>
          </div>
        )}

        {done && (
          <div className="wsg-done">
            <div className="wsg-emoji">{result.emoji}</div>
            <h3>{result.title}</h3>
            <p className="wsg-done-sub">{total} words{best > 2 ? ` · best streak ${best}` : ''}</p>
            <a className="pc-btn wsg-cta" href="/quiz?ref=crossword-game">
              Now watch the {title} story
            </a>
            <button className="wsg-reset" onClick={reset}>Play again</button>
          </div>
        )}
      </div>

      <div className="cwg-board">
        <table className="cw-table cwg-table">
          <tbody>
            {grid.map((row, r) => (
              <tr key={r}>
                {row.map((ch, c) => {
                  const key = `${r},${c}`
                  if (ch === null) return <td key={c} className="cw-void" />
                  const locked = lockedCells.has(key)
                  const cls = [
                    'cwg-cell',
                    locked ? 'cwg-lit' : '',
                    activeCells.has(key) ? 'cwg-sel' : '',
                    wrongCells.has(key) ? 'cwg-wrong' : '',
                  ].filter(Boolean).join(' ')
                  return (
                    <td key={c} className={cls} onPointerDown={() => onCellTap(key)}>
                      {nums[key] && <span className="cw-num">{nums[key]}</span>}
                      <input
                        ref={el => { inputs.current[key] = el }}
                        value={letters[key] ?? ''}
                        onChange={e => onInput(key, e.target.value)}
                        onKeyDown={e => onKeyDown(e, key)}
                        onFocus={() => onCellFocus(key)}
                        readOnly={locked}
                        maxLength={2}
                        inputMode="text"
                        autoCapitalize="characters"
                        autoComplete="off"
                        aria-label={`Row ${r + 1}, column ${c + 1}`}
                      />
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="cwg-clues">
        {clueList('across', across)}
        {clueList('down', down)}
      </div>
    </div>
  )
}
