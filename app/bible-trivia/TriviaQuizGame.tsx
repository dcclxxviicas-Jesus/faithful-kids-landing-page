'use client'

import { useState } from 'react'
import posthog from 'posthog-js'
import { EASY, MEDIUM, HARD, ALL_QUESTIONS, type GameQuestion } from '@/lib/trivia-game-questions'

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

type Difficulty = 'easy' | 'medium' | 'hard' | 'mixed'

const POOLS: Record<Difficulty, GameQuestion[]> = {
  easy: EASY,
  medium: MEDIUM,
  hard: HARD,
  mixed: ALL_QUESTIONS,
}

const DIFFICULTIES: { key: Difficulty; emoji: string; label: string; sub: string }[] = [
  { key: 'easy', emoji: '🌱', label: 'Easy', sub: 'Ages 5–8' },
  { key: 'medium', emoji: '🌟', label: 'Medium', sub: 'Ages 9–12' },
  { key: 'hard', emoji: '🔥', label: 'Hard', sub: 'Teens & adults' },
  { key: 'mixed', emoji: '🎲', label: 'Mixed', sub: 'A bit of everything' },
]

const ROUND_SIZE = 10

// One question as dealt: options pre-shuffled with the correct index recorded
type Dealt = GameQuestion & { options: string[]; correctIndex: number }

function dealRound(pool: GameQuestion[]): Dealt[] {
  return shuffle(pool)
    .slice(0, ROUND_SIZE)
    .map(q => {
      const options = shuffle([q.a, ...q.wrong])
      return { ...q, options, correctIndex: options.indexOf(q.a) }
    })
}

const PRAISE = ['Exactly right!', 'You know your Bible!', 'Wonderful!', 'Nailed it!', 'Beautiful!']
const ENCOURAGE = ['Now you know it!', 'That was a tricky one!', 'Every miss is a story to discover.', 'You’ve got this!']

function rankFor(score: number): { title: string; emoji: string; line: string } {
  if (score >= 10) return { title: 'Bible Master', emoji: '👑', line: 'A perfect round. Incredible!' }
  if (score >= 8) return { title: 'Scripture Scholar', emoji: '🌟', line: 'You really know your Bible!' }
  if (score >= 6) return { title: 'Faithful Learner', emoji: '📖', line: 'Great round — you know a lot!' }
  if (score >= 4) return { title: 'Rising Star', emoji: '🌱', line: 'Nice! Every game makes you sharper.' }
  return { title: 'Brave Beginner', emoji: '💪', line: 'Great start — every question is a story to discover!' }
}

const CONFETTI_COLORS = ['#16a34a', '#4ade80', '#fbbf24', '#f472b6', '#60a5fa', '#a78bfa']

/* The embed runs in a third-party iframe, so its storage is partitioned from
   the main site and PostHog hands a click-through a brand new distinct_id.
   These UTMs are the only way that traffic is attributable at all. */
export const EMBED_UTM = '?utm_source=embed&utm_medium=iframe&utm_campaign=bible-trivia'

export function TriviaQuizGame({ embed = false }: { embed?: boolean }) {
  const [round, setRound] = useState<Dealt[] | null>(null)
  const [difficulty, setDifficulty] = useState<Difficulty>('mixed')
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [points, setPoints] = useState(0)
  const [lastGain, setLastGain] = useState(0)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [finished, setFinished] = useState(false)
  const [shared, setShared] = useState(false)

  const linkTarget = embed ? '_blank' : undefined
  // On-page links stay clean; only the embed surface is tagged.
  const utm = embed ? EMBED_UTM : ''
  const base = (e: string) => track(e, { surface: embed ? 'embed' : 'page' })

  const start = (d: Difficulty) => {
    setDifficulty(d)
    setRound(dealRound(POOLS[d]))
    setIndex(0)
    setPicked(null)
    setScore(0)
    setPoints(0)
    setLastGain(0)
    setStreak(0)
    setBestStreak(0)
    setFeedback('')
    setFinished(false)
    setShared(false)
    track('trivia_page_game_start', { surface: embed ? 'embed' : 'page', difficulty: d })
  }

  const pick = (i: number) => {
    if (!round || picked !== null) return
    const q = round[index]
    const correct = i === q.correctIndex
    setPicked(i)
    const newStreak = correct ? streak + 1 : 0
    setStreak(newStreak)
    if (newStreak > bestStreak) setBestStreak(newStreak)
    let gain = 0
    if (correct) {
      gain = 100 + (newStreak - 1) * 25
      setScore(s => s + 1)
      setPoints(p => p + gain)
    }
    setLastGain(gain)
    const pool = correct ? PRAISE : ENCOURAGE
    const line = pool[Math.floor(Math.random() * pool.length)]
    setFeedback(correct && newStreak >= 3 ? `🔥 ${newStreak} in a row! ${line}` : line)
    track('trivia_page_answer', {
      surface: embed ? 'embed' : 'page',
      difficulty,
      index,
      correct,
    })
    if (index + 1 >= round.length) {
      // Delay the end screen slightly so the answer feedback lands first
      const finalScore = score + (correct ? 1 : 0)
      window.setTimeout(() => {
        setFinished(true)
        track('trivia_page_complete', {
          surface: embed ? 'embed' : 'page',
          difficulty,
          score: finalScore,
          total: round.length,
        })
      }, 1400)
    }
  }

  const next = () => {
    setIndex(i => i + 1)
    setPicked(null)
    setFeedback('')
    setLastGain(0)
  }

  const share = async () => {
    const text = `I scored ${score}/${ROUND_SIZE} (${points} points) on Bible Trivia! Can you beat me? 🏆`
    const url = 'https://faithfulkids.app/bible-trivia'
    base('trivia_page_share')
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Bible Trivia', text, url })
      } else {
        await navigator.clipboard.writeText(`${text} ${url}`)
        setShared(true)
        window.setTimeout(() => setShared(false), 2200)
      }
    } catch {
      // user closed the share sheet — that's fine
    }
  }

  // ——— start screen ———
  if (!round) {
    return (
      <div className="tg-card">
        <div style={{ fontSize: '2.6rem', lineHeight: 1, marginBottom: 8 }}>🏆</div>
        <h2 className="tg-title">Bible Trivia Challenge</h2>
        <p className="tg-sub">
          10 questions. Pick your level — how well do you know the greatest story ever told?
        </p>
        <div className="tg-diff-grid">
          {DIFFICULTIES.map(d => (
            <button key={d.key} className="tg-diff" onClick={() => start(d.key)}>
              <span className="tg-diff-emoji">{d.emoji}</span>
              <span className="tg-diff-name">{d.label}</span>
              <span className="tg-diff-sub">{d.sub}</span>
            </button>
          ))}
        </div>
        <p className="tg-note">100 questions in the pool — every round is different. Free forever.</p>
      </div>
    )
  }

  // ——— end screen ———
  if (finished) {
    const rank = rankFor(score)
    const celebrate = score >= 8
    return (
      <div className="tg-card">
        {celebrate && (
          <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            {Array.from({ length: 26 }, (_, i) => (
              <span
                key={i}
                style={{
                  position: 'absolute',
                  top: -12,
                  left: `${(i * 137) % 100}%`,
                  width: 9,
                  height: i % 3 === 0 ? 9 : 14,
                  borderRadius: i % 3 === 0 ? '50%' : 2,
                  background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
                  animation: `tgConfetti ${1.9 + (i % 5) * 0.35}s ease-in ${(i % 7) * 0.18}s both`,
                }}
              />
            ))}
          </div>
        )}
        <div style={{ fontSize: '3.2rem', lineHeight: 1, marginBottom: 6, animation: 'tgTrophy 0.7s ease' }}>
          {rank.emoji}
        </div>
        <p className="tg-rank-label">Your rank</p>
        <h2 className="tg-rank">{rank.title}</h2>
        <p className="tg-sub" style={{ marginBottom: 18 }}>{rank.line}</p>
        <div className="tg-stats">
          {[
            { label: 'Correct', value: `${score}/${ROUND_SIZE}` },
            { label: 'Points', value: points.toLocaleString() },
            { label: 'Best streak', value: `${bestStreak} 🔥` },
          ].map(s => (
            <div key={s.label} className="tg-stat">
              <div className="tg-stat-value">{s.value}</div>
              <div className="tg-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
        {/* Primary action. This used to sit under a divider below "Play again",
            styled identically to it — the whole results screen produced one
            click in its lifetime. Play again is now the secondary action. */}
        <div className="tg-cta-primary">
          <p style={{ fontSize: '0.92rem', margin: '0 0 12px' }} className="tg-sub">
            Love Bible trivia? Your kids will love <strong style={{ color: 'var(--text)' }}>Faithful Kids</strong> —
            short Bible story videos with quizzes just like this one.
          </p>
          <a
            href={`https://faithfulkids.app/quiz${utm}`}
            target={linkTarget}
            rel={embed ? 'noopener' : undefined}
            className="tg-btn tg-btn-cta"
            style={{ textDecoration: 'none', display: 'inline-block' }}
            onClick={() => base('trivia_page_cta_click')}
          >
            Get started &rarr;
          </a>
          <p style={{ margin: '12px 0 0' }}>
            <a
              href={`https://faithfulkids.app/printables/bible-trivia-pack${utm}`}
              target={linkTarget}
              rel={embed ? 'noopener' : undefined}
              style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}
              onClick={() => base('trivia_page_printable_click')}
            >
              📄 Get all 100 questions as a free printable
            </a>
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginTop: 16 }}>
          <button className="tg-btn-ghost" onClick={() => start(difficulty)}>Play again ↻</button>
          <button className="tg-btn-ghost" onClick={share}>
            {shared ? 'Copied! ✓' : 'Challenge a friend 📣'}
          </button>
        </div>
        {difficulty !== 'hard' && score >= 8 && (
          <button className="tg-btn-text" onClick={() => start(difficulty === 'easy' ? 'medium' : 'hard')}>
            That looked easy — try {difficulty === 'easy' ? 'Medium' : 'Hard'} →
          </button>
        )}
      </div>
    )
  }

  // ——— question screen ———
  const q = round[index]
  const answered = picked !== null
  const gotIt = answered && picked === q.correctIndex
  return (
    <div className="tg-card" style={{ animation: 'tgRise 0.3s ease' }} key={index}>
      <div className="tg-meta">
        <span>Question {index + 1} of {round.length}</span>
        <span style={{ display: 'flex', gap: 12 }}>
          {streak > 1 && <span style={{ color: 'var(--gold)' }}>🔥 {streak}</span>}
          <span style={{ color: 'var(--primary-dark)' }}>{points.toLocaleString()} pts</span>
        </span>
      </div>
      <div className="tg-progress">
        <div
          className="tg-progress-fill"
          style={{ width: `${((index + (answered ? 1 : 0.4)) / round.length) * 100}%` }}
        />
      </div>

      <p className="tg-question">{q.q}</p>

      <div className="tg-opts">
        {q.options.map((opt, i) => {
          const isCorrect = i === q.correctIndex
          const isPicked = i === picked
          let cls = 'tg-opt'
          if (answered) {
            if (isCorrect) cls += ' is-correct'
            else if (isPicked) cls += ' is-wrong'
            else cls += ' is-dim'
          }
          return (
            <button key={i} className={cls} disabled={answered} onClick={() => pick(i)}>
              <span aria-hidden className="tg-letter">
                {answered && isCorrect ? '✓' : answered && isPicked ? '✕' : String.fromCharCode(65 + i)}
              </span>
              {opt}
            </button>
          )
        })}
      </div>

      <div aria-live="polite" className="tg-feedback">
        {answered && (
          <div style={{ animation: 'tgRise 0.3s ease' }}>
            <p className="tg-feedback-line" style={{ color: gotIt ? 'var(--primary)' : 'var(--gold)' }}>
              {feedback}
              {gotIt && lastGain > 0 && <span className="tg-gain">+{lastGain}</span>}
            </p>
            <p className="tg-feedback-ref">📖 {q.ref}</p>
          </div>
        )}
      </div>

      {answered && index + 1 < round.length && (
        <button className="tg-btn" style={{ marginTop: 6 }} onClick={next} autoFocus>
          Next question →
        </button>
      )}
      {answered && index + 1 >= round.length && (
        <p style={{ margin: '6px 0 0', fontWeight: 700, color: 'var(--primary)', fontSize: '0.9rem' }}>
          Adding up your score…
        </p>
      )}
    </div>
  )
}
