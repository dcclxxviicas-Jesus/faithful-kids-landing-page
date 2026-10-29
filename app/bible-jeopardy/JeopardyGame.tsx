'use client'

import { useState } from 'react'
import posthog from 'posthog-js'
import { CATEGORIES, FINAL_CLUE, CLUE_COUNT, type JeopardyClue } from '@/lib/jeopardy-board'

function track(event: string, props?: Record<string, unknown>) {
  try {
    posthog.capture(event, props)
  } catch {
    // analytics must never break the game
  }
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const PRAISE = ['Exactly right!', 'You know your Bible!', 'Wonderful!', 'Nailed it!', 'Beautiful!']
const ENCOURAGE = ['Now you know it!', 'That was a tricky one!', 'Every miss is a story to discover.', 'You’ve got this!']

type OpenClue = {
  catIndex: number
  clueIndex: number
  clue: JeopardyClue
  options: string[]
  picked: number | null
}

type FinalState = { options: string[]; picked: number | null }

export function JeopardyGame() {
  const [teamCount, setTeamCount] = useState<number | null>(null)
  const [scores, setScores] = useState<number[]>([])
  const [active, setActive] = useState(0)
  const [done, setDone] = useState<Set<string>>(new Set())
  const [open, setOpen] = useState<OpenClue | null>(null)
  const [finalState, setFinalState] = useState<FinalState | null>(null)

  const boardCleared = done.size >= CLUE_COUNT

  const start = (n: number) => {
    setTeamCount(n)
    setScores(Array(n).fill(0))
    setActive(0)
    setDone(new Set())
    setOpen(null)
    setFinalState(null)
    track('jeopardy_started', { teams: n })
  }

  const openClue = (catIndex: number, clueIndex: number) => {
    const clue = CATEGORIES[catIndex].clues[clueIndex]
    setOpen({
      catIndex,
      clueIndex,
      clue,
      options: shuffle([clue.a, ...clue.wrong]),
      picked: null,
    })
  }

  const answer = (i: number) => {
    if (!open || open.picked !== null) return
    const correct = open.options[i] === open.clue.a
    if (correct) {
      setScores(s => s.map((v, t) => (t === active ? v + open.clue.value : v)))
    }
    setOpen({ ...open, picked: i })
    track('jeopardy_clue_answered', {
      category: CATEGORIES[open.catIndex].name,
      value: open.clue.value,
      correct,
    })
  }

  // The answer stays on screen until the players close it — the child who
  // missed is exactly the one who needs time to read the verse. No timers,
  // no auto-advance (same rule as the per-post trivia games).
  const closeClue = () => {
    if (!open) return
    const key = `${open.catIndex},${open.clueIndex}`
    const nextDone = new Set(done)
    nextDone.add(key)
    setDone(nextDone)
    setOpen(null)
    if (teamCount && teamCount > 1) setActive(a => (a + 1) % teamCount)
    if (nextDone.size >= CLUE_COUNT) {
      track('jeopardy_completed', { teams: teamCount, topScore: Math.max(...scores) })
    }
  }

  const answerFinal = (i: number) => {
    if (!finalState || finalState.picked !== null) return
    setFinalState({ ...finalState, picked: i })
  }

  /* ---------- setup screen ---------- */
  if (teamCount === null) {
    return (
      <div className="jp-setup">
        <h3>How many teams are playing?</h3>
        <p>One team works too — chase your own high score.</p>
        <div className="jp-setup-row">
          {[1, 2, 3, 4].map(n => (
            <button key={n} className="jp-setup-btn" onClick={() => start(n)}>
              {n === 1 ? 'Solo' : `${n} teams`}
            </button>
          ))}
        </div>
      </div>
    )
  }

  const winner = scores.indexOf(Math.max(...scores))
  const tied = scores.filter(s => s === scores[winner]).length > 1

  return (
    <div className="jp-game">
      {/* scoreboard */}
      <div className="jp-scores" role="status">
        {scores.map((s, t) => (
          <div key={t} className={`jp-score${t === active && !boardCleared ? ' is-active' : ''}`}>
            <span className="jp-score-team">{teamCount === 1 ? 'Score' : `Team ${t + 1}`}</span>
            <span className="jp-score-pts">${s}</span>
            {teamCount! > 1 && t === active && !boardCleared && <span className="jp-score-turn">picks next</span>}
          </div>
        ))}
        <button className="jp-reset" onClick={() => setTeamCount(null)}>Restart</button>
      </div>

      {/* the board */}
      {!boardCleared && (
        <div className="jp-board-scroll">
          <div className="jp-board">
            {CATEGORIES.map(cat => (
              <div key={cat.name} className="jp-cat-head">{cat.name}</div>
            ))}
            {[0, 1, 2, 3, 4].map(row =>
              CATEGORIES.map((cat, col) => {
                const used = done.has(`${col},${row}`)
                return (
                  <button
                    key={`${col},${row}`}
                    className={`jp-cell${used ? ' is-done' : ''}`}
                    disabled={used}
                    onClick={() => openClue(col, row)}
                    aria-label={used ? 'Already played' : `${cat.name} for $${cat.clues[row].value}`}
                  >
                    {used ? '' : `$${cat.clues[row].value}`}
                  </button>
                )
              }),
            )}
          </div>
        </div>
      )}

      {/* clue modal */}
      {open && (
        <div className="jp-overlay" role="dialog" aria-modal="true" aria-label="Jeopardy clue">
          <div className="jp-clue-card">
            <p className="jp-clue-meta">
              {CATEGORIES[open.catIndex].name} &middot; ${open.clue.value}
              {teamCount! > 1 && <span> &middot; Team {active + 1} answers</span>}
            </p>
            <h3 className="jp-clue-q">{open.clue.q}</h3>
            <div className="jp-options">
              {open.options.map((opt, i) => {
                let cls = 'jp-option'
                if (open.picked !== null) {
                  if (opt === open.clue.a) cls += ' is-right'
                  else if (i === open.picked) cls += ' is-wrong'
                  else cls += ' is-dim'
                }
                return (
                  <button key={i} className={cls} onClick={() => answer(i)} disabled={open.picked !== null}>
                    {opt}
                  </button>
                )
              })}
            </div>
            {open.picked !== null && (
              <div className="jp-reveal">
                <p className="jp-reveal-line">
                  {open.options[open.picked] === open.clue.a
                    ? `${PRAISE[(open.catIndex + open.clueIndex) % PRAISE.length]} +$${open.clue.value}`
                    : ENCOURAGE[(open.catIndex + open.clueIndex) % ENCOURAGE.length]}
                </p>
                <p className="jp-reveal-ref">Look it up together: {open.clue.ref}</p>
                <button className="jp-next" onClick={closeClue}>
                  {done.size + 1 >= CLUE_COUNT ? 'See the final scores' : 'Back to the board'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* end screen */}
      {boardCleared && (
        <div className="jp-end">
          <div className="jp-end-emoji" aria-hidden="true">🏆</div>
          <h3>
            {teamCount === 1
              ? `Final score: $${scores[0]}`
              : tied
                ? 'It’s a tie!'
                : `Team ${winner + 1} wins with $${scores[winner]}!`}
          </h3>
          {teamCount! > 1 && (
            <p className="jp-end-scores">{scores.map((s, t) => `Team ${t + 1}: $${s}`).join(' · ')}</p>
          )}

          {!finalState ? (
            <button
              className="jp-next"
              onClick={() => setFinalState({ options: shuffle([FINAL_CLUE.a, ...FINAL_CLUE.wrong]), picked: null })}
            >
              One last question for the whole table &rarr;
            </button>
          ) : (
            <div className="jp-final">
              <p className="jp-clue-meta">Just for fun — no points on the line</p>
              <h4 className="jp-clue-q">{FINAL_CLUE.q}</h4>
              <div className="jp-options">
                {finalState.options.map((opt, i) => {
                  let cls = 'jp-option'
                  if (finalState.picked !== null) {
                    if (opt === FINAL_CLUE.a) cls += ' is-right'
                    else if (i === finalState.picked) cls += ' is-wrong'
                    else cls += ' is-dim'
                  }
                  return (
                    <button key={i} className={cls} onClick={() => answerFinal(i)} disabled={finalState.picked !== null}>
                      {opt}
                    </button>
                  )
                })}
              </div>
              {finalState.picked !== null && <p className="jp-reveal-ref">The whole scene: {FINAL_CLUE.ref}</p>}
            </div>
          )}

          <div className="jp-end-actions">
            <button className="jp-again" onClick={() => start(teamCount!)}>Play again</button>
            <a className="jp-cta" href="/quiz?ref=bible-jeopardy">Watch the stories behind the answers</a>
          </div>
        </div>
      )}
    </div>
  )
}
