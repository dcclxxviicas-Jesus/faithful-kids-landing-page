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

const EMERALD = '#059669'
const CONFETTI_COLORS = ['#059669', '#34d399', '#fbbf24', '#f472b6', '#60a5fa', '#a78bfa']

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

  // ——— shared styles ———
  const card: React.CSSProperties = {
    background: '#ffffff',
    border: '2px solid #d1fae5',
    borderRadius: 24,
    padding: embed ? '22px 18px' : '30px 26px',
    margin: '0 auto',
    maxWidth: 640,
    boxShadow: '0 8px 32px rgba(5, 150, 105, 0.10)',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    color: '#1f2937',
  }
  const pill: React.CSSProperties = {
    display: 'inline-block',
    background: EMERALD,
    color: '#fff',
    fontWeight: 800,
    fontSize: '1rem',
    padding: '13px 30px',
    borderRadius: 999,
    border: 'none',
    cursor: 'pointer',
  }

  const css = (
    <style>{`
      @keyframes fkPop { 0% { transform: scale(0.96); } 45% { transform: scale(1.03); } 100% { transform: scale(1); } }
      @keyframes fkShake { 0%,100% { transform: translateX(0); } 20% { transform: translateX(-7px); } 40% { transform: translateX(7px); } 60% { transform: translateX(-5px); } 80% { transform: translateX(5px); } }
      @keyframes fkRise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes fkFloat { 0% { opacity: 1; transform: translateY(0); } 100% { opacity: 0; transform: translateY(-38px); } }
      @keyframes fkConfetti { 0% { opacity: 1; transform: translateY(-10px) rotate(0deg); } 100% { opacity: 0; transform: translateY(340px) rotate(540deg); } }
      @keyframes fkTrophy { 0% { transform: scale(0) rotate(-20deg); } 60% { transform: scale(1.25) rotate(6deg); } 100% { transform: scale(1) rotate(0deg); } }
      .fk-opt { transition: transform 0.12s ease, box-shadow 0.12s ease, background 0.15s ease, border-color 0.15s ease; }
      .fk-opt:not(:disabled):hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(5,150,105,0.14); }
      .fk-opt:not(:disabled):active { transform: translateY(0); }
      .fk-diff:hover { transform: translateY(-3px); box-shadow: 0 10px 22px rgba(5,150,105,0.16); }
      .fk-diff { transition: transform 0.14s ease, box-shadow 0.14s ease; }
    `}</style>
  )

  // ——— start screen ———
  if (!round) {
    return (
      <div style={card}>
        {css}
        <div style={{ fontSize: '2.6rem', lineHeight: 1, marginBottom: 8 }}>🏆</div>
        <h2 style={{ fontSize: embed ? '1.3rem' : '1.5rem', fontWeight: 900, margin: '0 0 6px' }}>
          Bible Trivia Challenge
        </h2>
        <p style={{ color: '#6b7280', margin: '0 0 20px', fontSize: '0.95rem' }}>
          10 questions. Pick your level — how well do you know the greatest story ever told?
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
          {DIFFICULTIES.map(d => (
            <button
              key={d.key}
              className="fk-diff"
              onClick={() => start(d.key)}
              style={{
                background: '#f0fdf9',
                border: '2px solid #d1fae5',
                borderRadius: 16,
                padding: '16px 10px',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              <span style={{ display: 'block', fontSize: '1.7rem', marginBottom: 4 }}>{d.emoji}</span>
              <span style={{ display: 'block', fontWeight: 800, fontSize: '1rem', color: '#065f46' }}>{d.label}</span>
              <span style={{ display: 'block', fontSize: '0.78rem', color: '#6b7280', marginTop: 2 }}>{d.sub}</span>
            </button>
          ))}
        </div>
        <p style={{ fontSize: '0.8rem', color: '#9ca3af', margin: '16px 0 0' }}>
          100 questions in the pool — every round is different. Free forever.
        </p>
      </div>
    )
  }

  // ——— end screen ———
  if (finished) {
    const rank = rankFor(score)
    const celebrate = score >= 8
    return (
      <div style={card}>
        {css}
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
                  animation: `fkConfetti ${1.9 + (i % 5) * 0.35}s ease-in ${(i % 7) * 0.18}s both`,
                }}
              />
            ))}
          </div>
        )}
        <div style={{ fontSize: '3.2rem', lineHeight: 1, marginBottom: 6, animation: 'fkTrophy 0.7s ease' }}>
          {rank.emoji}
        </div>
        <p style={{ fontSize: '0.85rem', fontWeight: 800, letterSpacing: 1.5, color: EMERALD, textTransform: 'uppercase', margin: '0 0 2px' }}>
          Your rank
        </p>
        <h2 style={{ fontSize: '1.7rem', fontWeight: 900, margin: '0 0 4px' }}>{rank.title}</h2>
        <p style={{ color: '#6b7280', margin: '0 0 18px', fontSize: '0.95rem' }}>{rank.line}</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
          {[
            { label: 'Correct', value: `${score}/${ROUND_SIZE}` },
            { label: 'Points', value: points.toLocaleString() },
            { label: 'Best streak', value: `${bestStreak} 🔥` },
          ].map(s => (
            <div key={s.label} style={{ background: '#f0fdf9', border: '2px solid #d1fae5', borderRadius: 14, padding: '10px 18px', minWidth: 92 }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#065f46' }}>{s.value}</div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 18 }}>
          <button style={pill} onClick={() => start(difficulty)}>Play again ↻</button>
          <button
            style={{ ...pill, background: '#fff', color: EMERALD, border: `2px solid ${EMERALD}` }}
            onClick={share}
          >
            {shared ? 'Copied! ✓' : 'Challenge a friend 📣'}
          </button>
        </div>
        {difficulty !== 'hard' && score >= 8 && (
          <button
            onClick={() => start(difficulty === 'easy' ? 'medium' : 'hard')}
            style={{ background: 'none', border: 'none', color: EMERALD, fontWeight: 800, cursor: 'pointer', fontSize: '0.9rem', fontFamily: 'inherit' }}
          >
            That looked easy — try {difficulty === 'easy' ? 'Medium' : 'Hard'} →
          </button>
        )}
        <div style={{ borderTop: '1px solid #e5e7eb', marginTop: 18, paddingTop: 16 }}>
          <p style={{ fontSize: '0.92rem', color: '#374151', margin: '0 0 10px' }}>
            Love Bible trivia? Your kids will love <strong>Faithful Kids</strong> — short Bible story
            videos with quizzes just like this one.
          </p>
          <a
            href="https://faithfulkids.app/quiz"
            target={linkTarget}
            rel={embed ? 'noopener' : undefined}
            style={{ ...pill, textDecoration: 'none', fontSize: '0.92rem', padding: '11px 24px' }}
            onClick={() => base('trivia_page_cta_click')}
          >
            Try it free for 7 days
          </a>
          <p style={{ margin: '10px 0 0' }}>
            <a
              href="https://faithfulkids.app/printables/bible-trivia-pack"
              target={linkTarget}
              rel={embed ? 'noopener' : undefined}
              style={{ color: EMERALD, fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}
              onClick={() => base('trivia_page_printable_click')}
            >
              📄 Get all 100 questions as a free printable
            </a>
          </p>
        </div>
      </div>
    )
  }

  // ——— question screen ———
  const q = round[index]
  const answered = picked !== null
  const gotIt = answered && picked === q.correctIndex
  return (
    <div style={{ ...card, animation: 'fkRise 0.3s ease' }} key={index}>
      {css}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', color: '#6b7280', fontWeight: 700, marginBottom: 8 }}>
        <span>Question {index + 1} of {round.length}</span>
        <span style={{ display: 'flex', gap: 12 }}>
          {streak > 1 && <span style={{ color: '#d97706' }}>🔥 {streak}</span>}
          <span style={{ color: '#065f46' }}>{points.toLocaleString()} pts</span>
        </span>
      </div>
      <div style={{ height: 8, background: '#e8f7f0', borderRadius: 4, marginBottom: 18 }}>
        <div style={{ height: 8, width: `${((index + (answered ? 1 : 0.4)) / round.length) * 100}%`, background: `linear-gradient(90deg, ${EMERALD}, #34d399)`, borderRadius: 4, transition: 'width 0.4s ease' }} />
      </div>

      <p style={{ fontSize: embed ? '1.05rem' : '1.18rem', fontWeight: 800, margin: '0 0 18px', minHeight: 52, lineHeight: 1.4 }}>
        {q.q}
      </p>

      <div style={{ display: 'grid', gap: 10, textAlign: 'left' }}>
        {q.options.map((opt, i) => {
          const isCorrect = i === q.correctIndex
          const isPicked = i === picked
          let bg = '#ffffff'
          let border = '#d1fae5'
          let color = '#1f2937'
          let anim: string | undefined
          if (answered) {
            if (isCorrect) {
              bg = EMERALD
              border = EMERALD
              color = '#ffffff'
              anim = 'fkPop 0.4s ease'
            } else if (isPicked) {
              bg = '#fef2f2'
              border = '#fca5a5'
              color = '#b91c1c'
              anim = 'fkShake 0.45s ease'
            } else {
              color = '#9ca3af'
            }
          }
          return (
            <button
              key={i}
              className="fk-opt"
              disabled={answered}
              onClick={() => pick(i)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                width: '100%',
                background: bg,
                border: `2px solid ${border}`,
                borderRadius: 14,
                padding: '13px 14px',
                fontSize: '0.95rem',
                fontWeight: 700,
                color,
                cursor: answered ? 'default' : 'pointer',
                textAlign: 'left',
                fontFamily: 'inherit',
                animation: anim,
              }}
            >
              <span
                aria-hidden
                style={{
                  flexShrink: 0,
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: answered && isCorrect ? 'rgba(255,255,255,0.25)' : '#f0fdf9',
                  color: answered && isCorrect ? '#fff' : '#065f46',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.82rem',
                  fontWeight: 900,
                }}
              >
                {answered && isCorrect ? '✓' : answered && isPicked ? '✕' : String.fromCharCode(65 + i)}
              </span>
              {opt}
            </button>
          )
        })}
      </div>

      <div aria-live="polite" style={{ minHeight: 64, marginTop: 14 }}>
        {answered && (
          <div style={{ animation: 'fkRise 0.3s ease' }}>
            <p style={{ margin: '0 0 4px', fontWeight: 800, fontSize: '0.95rem', color: gotIt ? EMERALD : '#b45309' }}>
              {gotIt ? feedback : `${feedback}`}
              {gotIt && lastGain > 0 && (
                <span style={{ display: 'inline-block', marginLeft: 8, color: '#d97706', animation: 'fkFloat 1.6s ease forwards' }}>
                  +{lastGain}
                </span>
              )}
            </p>
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#6b7280' }}>📖 {q.ref}</p>
          </div>
        )}
      </div>

      {answered && index + 1 < round.length && (
        <button style={{ ...pill, marginTop: 6 }} onClick={next} autoFocus>
          Next question →
        </button>
      )}
      {answered && index + 1 >= round.length && (
        <p style={{ margin: '6px 0 0', fontWeight: 800, color: EMERALD, fontSize: '0.9rem' }}>
          Adding up your score…
        </p>
      )}
    </div>
  )
}
