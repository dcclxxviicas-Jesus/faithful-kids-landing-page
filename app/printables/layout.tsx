/**
 * Wraps every /printables route so the printed output always carries our name.
 *
 * The coloring pages had the mark baked into the PNG, and the word searches had
 * a credit line, but the text-based printables — trivia pack, 30-day challenge,
 * bedtime kit — printed several sheets with nothing on them. A page photocopied
 * for a Sunday school class is only worth anything to us if it says where it
 * came from.
 *
 * position: fixed inside a print stylesheet repeats the element on EVERY printed
 * sheet, which is what a multi-page printable needs. It is hidden entirely on
 * screen — this is a print artefact, not page furniture.
 */
import { BlogStickyCta } from '../blog/BlogStickyCta'

export default function PrintablesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      {/* Non-interrupting CTA. Deliberately NOT moving the main block above the
          artifact: someone who searched "bible word search" came for the puzzle,
          and a sales panel above it raises bounce. The sticky bar keeps a path
          to /quiz visible the whole way down without taking the page hostage. */}
      <BlogStickyCta postSlug="printables" />
      <div className="print-mark" aria-hidden="true">
        <strong>FaithfulKids.app</strong>
        <span>Free Bible printables · 300+ story videos with quizzes</span>
      </div>
    </>
  )
}
