/**
 * The print sheet: an EMPTY numbered grid plus the clues, hidden on screen and
 * shown only in print. It exists because the interactive game uses <input>
 * elements and CSS cannot blank an input's value -- so a page printed mid-game
 * would come out half-solved. Hiding the game in print and printing this sheet
 * instead means every printout is clean and usable.
 *
 * Printed sheets must carry the URL (.ws-credit pattern): a crossword
 * photocopied for a Sunday school class is only a marketing asset if it says
 * where it came from.
 */

import type { Clue } from './CrosswordGame'

export function CrosswordSheet({
  grid, nums, across, down, title, scripture,
}: {
  grid: (string | null)[][]
  nums: Record<string, number>
  across: Clue[]
  down: Clue[]
  title: string
  scripture: string
}) {
  return (
    <div className="cw-print-sheet">
      <h2 className="ws-sheet-title">{title} Crossword</h2>
      <p className="cw-print-meta">{scripture}</p>
      <table className="cw-table">
        <tbody>
          {grid.map((row, r) => (
            <tr key={r}>
              {row.map((ch, c) => {
                const key = `${r},${c}`
                if (ch === null) return <td key={c} className="cw-void" />
                return (
                  <td key={c} className="cw-open">
                    {nums[key] && <span className="cw-num">{nums[key]}</span>}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="cw-print-clues">
        <div>
          <h3>Across</h3>
          <ol>
            {across.map(c => (
              <li key={`a${c.num}`} value={c.num}>{c.clue} ({c.len})</li>
            ))}
          </ol>
        </div>
        <div>
          <h3>Down</h3>
          <ol>
            {down.map(c => (
              <li key={`d${c.num}`} value={c.num}>{c.clue} ({c.len})</li>
            ))}
          </ol>
        </div>
      </div>
      <p className="ws-credit">
        <strong>FaithfulKids.app</strong>
        <span>Watch the stories free &middot; faithfulkids.app/printables/bible-crossword</span>
      </p>
    </div>
  )
}
