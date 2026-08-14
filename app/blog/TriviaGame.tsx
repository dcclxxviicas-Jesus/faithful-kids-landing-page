'use client'

import { useState } from 'react'
import posthog from 'posthog-js'
import type { TriviaQuestion } from '@/lib/blog'

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

const PRAISE = [
  'Nice one! 🎉',
  'Exactly right! ⭐',
  'You know your Bible! 🙌',
  'Wonderful! 💚',
]
const ENCOURAGE = [
  'Good try — now you know it! 💪',
  'That was a tricky one!',
  'Every miss is a story to discover 📖',
  'Keep going — you’ve got this!',
]

export function TriviaGame({
  questions,
  postSlug,
  videoSrc,
  videoTitle,
}: {
  questions: TriviaQuestion[]
  postSlug: string
  videoSrc: string
  videoTitle: string
}) {
  const [round, setRound] = useState<TriviaQuestion[] | null>(null)
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [feedback, setFeedback] = useState<{ text: string; good: boolean } | null>(null)
  const [finished, setFinished] = useState(false)

  const lengthChoices = [5, 10, 20].filter(n => n <= questions.length)

  const start = (count: number) => {
    // Suppress the exit-intent popup once the reader is playing
    try { sessionStorage.setItem('fk_trivia_started', '1') } catch { /* private mode */ }
    setRound(shuffle(questions).slice(0, count))
    setIndex(0)
    setRevealed(false)
    setScore(0)
    setStreak(0)
    setBestStreak(0)
    setFeedback(null)
    setFinished(false)
    track('trivia_game_start', { post: postSlug, round_size: count, pool_size: questions.length })
  }

  const answer = (gotIt: boolean) => {
    if (!round) return
    track('trivia_game_answer', { post: postSlug, index, got_it: gotIt })
    const newStreak = gotIt ? streak + 1 : 0
    setStreak(newStreak)
    if (newStreak > bestStreak) setBestStreak(newStreak)
    if (gotIt) setScore(s => s + 1)
    const pool = gotIt ? PRAISE : ENCOURAGE
    const base = pool[Math.floor(Math.random() * pool.length)]
    setFeedback({
      text: gotIt && newStreak >= 3 ? `🔥 ${newStreak} in a row! ${base}` : base,
      good: gotIt,
    })
    if (index + 1 >= round.length) {
      setFinished(true)
      track('trivia_game_complete', {
        post: postSlug,
        score: score + (gotIt ? 1 : 0),
        total: round.length,
      })
    } else {
      setIndex(i => i + 1)
      setRevealed(false)
    }
  }

  const emerald = '#059669'
  const card: React.CSSProperties = {
    background: '#ffffff',
    border: '2px solid #d1fae5',
    borderRadius: '20px',
    padding: '28px 24px',
    margin: '0 auto 32px',
    maxWidth: '760px',
    boxShadow: '0 4px 20px rgba(5, 150, 105, 0.08)',
    textAlign: 'center',
  }
  const btn: React.CSSProperties = {
    display: 'inline-block',
    background: emerald,
    color: '#fff',
    fontWeight: 700,
    fontSize: '1rem',
    padding: '13px 30px',
    borderRadius: '999px',
    border: 'none',
    cursor: 'pointer',
  }

  // Start screen — pick a quiz length
  if (!round) {
    return (
      <div style={card}>
        <div style={{ fontSize: '2rem', marginBottom: '6px' }}>🎮</div>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 8px' }}>
          Play This Trivia Quiz
        </h2>
        <p style={{ color: '#555', margin: '0 0 18px', fontSize: '0.95rem' }}>
          Random questions from this page. Answer out loud, reveal, and keep score — perfect for
          the car, the dinner table, or Sunday school.
        </p>
        <p style={{ fontWeight: 700, margin: '0 0 10px', fontSize: '0.95rem' }}>How many questions?</p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {lengthChoices.map(n => (
            <button key={n} style={btn} onClick={() => start(n)}>{n} questions</button>
          ))}
        </div>
      </div>
    )
  }

  // End screen — Jesus video + course invitation
  if (finished) {
    const pct = Math.round((score / round.length) * 100)
    const headline =
      pct >= 80 ? 'Amazing! You really know your Bible! 🎉'
      : pct >= 50 ? 'Nice work! You know a lot! 🌟'
      : 'Great start — every question is a story to discover! 💪'
    return (
      <div style={card}>
        <div style={{ fontSize: '2.4rem', marginBottom: '6px' }}>🏆</div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 6px' }}>
          {score}/{round.length} — {headline}
        </h2>
        <p style={{ color: '#555', margin: '0 0 18px', fontSize: '0.95rem' }}>
          Best streak: {bestStreak} in a row
        </p>
        <video
          src={videoSrc}
          controls
          autoPlay
          muted
          playsInline
          preload="none"
          onPlay={() => track('trivia_game_video_play', { post: postSlug, video: videoTitle })}
          style={{ width: '100%', borderRadius: '14px', background: '#000' }}
        />
        <p style={{ fontSize: '0.85rem', color: '#777', margin: '8px 0 16px' }}>
          &ldquo;{videoTitle}&rdquo; — one of 200 video lessons in the Faithful Kids Bible course
        </p>
        <p style={{ color: '#333', margin: '0 auto 18px', fontSize: '1.05rem', fontWeight: 600, maxWidth: '520px' }}>
          If you enjoyed this quiz, we think you&apos;ll really enjoy our Bible course. Take a look!
        </p>
        <a
          href="/quiz"
          style={{ ...btn, textDecoration: 'none' }}
          onClick={() => track('trivia_game_cta_click', { post: postSlug, score, total: round.length })}
        >
          Take a Look — Free for 7 Days
        </a>
        <div style={{ marginTop: '14px' }}>
          <button
            onClick={() => setRound(null)}
            style={{ background: 'none', border: 'none', color: emerald, fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}
          >
            Play again ↻
          </button>
        </div>
      </div>
    )
  }

  // Question screen
  const q = round[index]
  return (
    <div style={card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#777', marginBottom: '10px' }}>
        <span>Question {index + 1} of {round.length}</span>
        <span>{streak > 1 ? `🔥 ${streak} streak` : `Score: ${score}`}</span>
      </div>
      <div style={{ height: '6px', background: '#e8f7f0', borderRadius: '3px', marginBottom: '14px' }}>
        <div style={{ height: '6px', width: `${((index + (revealed ? 1 : 0.5)) / round.length) * 100}%`, background: emerald, borderRadius: '3px', transition: 'width 0.3s' }} />
      </div>
      {feedback && !revealed && (
        <p style={{
          fontSize: '0.92rem',
          fontWeight: 700,
          color: feedback.good ? emerald : '#b45309',
          background: feedback.good ? '#ecfdf5' : '#fffbeb',
          borderRadius: '10px',
          padding: '8px 12px',
          margin: '0 0 14px',
        }}>
          {feedback.text}
        </p>
      )}
      <p style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 20px', minHeight: '56px' }}>{q.question}</p>
      {!revealed ? (
        <button style={btn} onClick={() => setRevealed(true)}>Reveal Answer</button>
      ) : (
        <>
          <div style={{ background: '#ecfdf5', borderRadius: '14px', padding: '16px', margin: '0 0 18px' }}>
            <p style={{ fontSize: '1.1rem', fontWeight: 800, color: emerald, margin: 0 }}>{q.answer}</p>
            {q.citation && <p style={{ fontSize: '0.85rem', color: '#666', margin: '6px 0 0' }}>{q.citation}</p>}
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button style={btn} onClick={() => answer(true)}>Got it! ✓</button>
            <button
              style={{ ...btn, background: '#fff', color: '#555', border: '2px solid #ddd' }}
              onClick={() => answer(false)}
            >
              Missed it
            </button>
          </div>
        </>
      )}
    </div>
  )
}
