'use client'

import { useRef, useState } from 'react'
import posthog from 'posthog-js'
import type { TriviaQuestion, TriviaLink } from '@/lib/blog'

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

const DEFAULT_ROUND = 10

export function TriviaGame({
  questions,
  postSlug,
  postTitle,
  label,
  related,
  videoSrc,
  videoTitle,
  posterSrc,
}: {
  questions: TriviaQuestion[]
  postSlug: string
  postTitle: string
  /** Short game name, e.g. "Exodus" */
  label: string
  /** Other playable games to send them to when this round ends */
  related: TriviaLink[]
  videoSrc: string
  videoTitle: string
  posterSrc?: string
}) {
  // The opening round is NOT shuffled: it has to render identically on the
  // server and the client, and Math.random() would blow up hydration. Replays
  // shuffle, so repeat players still get variety.
  const [round, setRound] = useState<TriviaQuestion[]>(
    () => questions.slice(0, Math.min(DEFAULT_ROUND, questions.length))
  )
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [feedback, setFeedback] = useState<{ text: string; good: boolean } | null>(null)
  const [finished, setFinished] = useState(false)
  const [shareNote, setShareNote] = useState<string | null>(null)
  const started = useRef(false)

  const lengthChoices = [5, 10, 20].filter(n => n <= questions.length)

  // Fires on the first real interaction, not on mount -- otherwise every
  // pageview would count as a game start and suppress the exit popup.
  const markStarted = () => {
    if (started.current) return
    started.current = true
    try { sessionStorage.setItem('fk_trivia_started', '1') } catch { /* private mode */ }
    track('trivia_game_start', {
      post: postSlug, round_size: round.length, pool_size: questions.length,
    })
  }

  const replay = (count: number) => {
    setRound(shuffle(questions).slice(0, count))
    setIndex(0)
    setRevealed(false)
    setScore(0)
    setStreak(0)
    setBestStreak(0)
    setFeedback(null)
    setFinished(false)
    setShareNote(null)
    track('trivia_game_replay', { post: postSlug, round_size: count })
  }

  const answer = (gotIt: boolean) => {
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
        post: postSlug, score: score + (gotIt ? 1 : 0), total: round.length,
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
    margin: '32px auto',
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
  // The card is edge-to-edge inside, so the banner has to pull back out
  // over the card padding to reach the corners.
  const banner: React.CSSProperties = {
    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
    color: '#fff',
    margin: '-28px -24px 20px',
    padding: '18px 24px 16px',
    borderRadius: '18px 18px 0 0',
  }
  const eyebrow: React.CSSProperties = {
    display: 'inline-block',
    background: 'rgba(255,255,255,0.18)',
    borderRadius: '999px',
    padding: '3px 11px',
    fontSize: '0.68rem',
    fontWeight: 800,
    letterSpacing: '0.09em',
    marginBottom: '7px',
  }
  const heading = /trivia/i.test(label) ? label : `${label} Bible Trivia`
  const minutes = Math.max(1, Math.round(round.length * 0.2))

  const ghost: React.CSSProperties = {
    ...btn,
    background: '#fff',
    color: '#444',
    border: '2px solid #ddd',
    fontSize: '0.9rem',
    padding: '10px 18px',
  }

  // ---- End screen: score, sharing, video, course invitation ----
  if (finished) {
    const pct = Math.round((score / round.length) * 100)
    const headline =
      pct >= 80 ? 'Amazing! You really know your Bible! 🎉'
      : pct >= 50 ? 'Nice work! You know a lot! 🌟'
      : 'Great start — every question is a story to discover! 💪'

    const shareUrl = `https://faithfulkids.app/blog/${postSlug}`
    const shareText = `I scored ${score}/${round.length} on this Bible trivia quiz! 🏆 Can you beat me?`

    // The native sheet is the best answer to "share however you like" -- it
    // surfaces Messages, WhatsApp, Facebook, Mail, whatever the person uses.
    // Desktop browsers largely lack it, so we also expose the paths directly.
    const canNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function'

    const shareScore = async () => {
      try {
        await navigator.share({ title: postTitle, text: shareText, url: shareUrl })
        track('trivia_game_share', { post: postSlug, method: 'native', score, total: round.length })
      } catch {
        // sheet dismissed -- nothing to do, the manual options are right there
      }
    }

    const copyScore = async () => {
      try {
        await navigator.clipboard.writeText(`${shareText} ${shareUrl}`)
        setShareNote('Copied! Paste it anywhere 📋')
        track('trivia_game_share', { post: postSlug, method: 'copy', score, total: round.length })
      } catch {
        setShareNote(`${shareText} ${shareUrl}`)
      }
    }

    const link = (method: string, href: string, label: string) => (
      <a
        key={method}
        href={href}
        target={method === 'sms' ? undefined : '_blank'}
        rel="noopener noreferrer"
        onClick={() => track('trivia_game_share', { post: postSlug, method, score, total: round.length })}
        style={{ ...ghost, textDecoration: 'none' }}
      >
        {label}
      </a>
    )

    const body = encodeURIComponent(`${shareText} ${shareUrl}`)

    return (
      <div style={card}>
        <div style={{ fontSize: '2.4rem', marginBottom: '6px' }}>🏆</div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 6px' }}>
          {score}/{round.length} — {headline}
        </h2>
        <p style={{ color: '#555', margin: '0 0 16px', fontSize: '0.95rem' }}>
          Best streak: {bestStreak} in a row
        </p>

        {/* Share -- native sheet first, explicit channels underneath */}
        {canNativeShare && (
          <div style={{ marginBottom: '10px' }}>
            <button style={btn} onClick={shareScore}>Share my score</button>
          </div>
        )}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {link('sms', `sms:?&body=${body}`, '💬 Text')}
          {link('facebook', `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, 'Facebook')}
          {link('whatsapp', `https://wa.me/?text=${body}`, 'WhatsApp')}
          {link('x', `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, 'X')}
          {link('email', `mailto:?subject=${encodeURIComponent('I just took a Bible trivia quiz!')}&body=${body}`, 'Email')}
          <button style={ghost} onClick={copyScore}>Copy</button>
        </div>
        {shareNote && (
          <p style={{ fontSize: '0.85rem', color: emerald, fontWeight: 700, margin: '4px 0 0' }}>{shareNote}</p>
        )}

        <video
          src={videoSrc}
          poster={posterSrc}
          controls
          autoPlay
          muted
          playsInline
          preload="none"
          onPlay={() => track('trivia_game_video_play', { post: postSlug, video: videoTitle })}
          style={{ width: '100%', borderRadius: '14px', background: '#000', marginTop: '18px' }}
        />
        <p style={{ fontSize: '0.85rem', color: '#777', margin: '8px 0 16px' }}>
          &ldquo;{videoTitle}&rdquo; — one of 300+ video lessons in the Faithful Kids Bible course
        </p>
        <p style={{ color: '#333', margin: '0 auto 18px', fontSize: '1.05rem', fontWeight: 600, maxWidth: '520px' }}>
          If you enjoyed this quiz, we think you&apos;ll really enjoy our Bible course. Take a look!
        </p>
        <a
          href="/quiz"
          style={{ ...btn, textDecoration: 'none' }}
          onClick={() => track('trivia_game_cta_click', { post: postSlug, score, total: round.length })}
        >
          Take a Look — Free for 3 Days
        </a>

        {related.length > 0 && (
          <div style={{ marginTop: '26px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
            <p style={{ fontWeight: 800, fontSize: '1.05rem', margin: '0 0 3px' }}>
              🎯 Play another Bible trivia game
            </p>
            <p style={{ fontSize: '0.85rem', color: '#777', margin: '0 0 14px' }}>
              {related.length} more waiting &mdash; all free, no sign-up.
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(128px, 1fr))',
              gap: '10px',
            }}>
              {related.map(r => (
                <a
                  key={r.slug}
                  href={`/blog/${r.slug}`}
                  onClick={() => track('trivia_game_next_click', { from: postSlug, to: r.slug })}
                  style={{
                    display: 'block',
                    background: '#f0fdf4',
                    border: '2px solid #d1fae5',
                    borderRadius: '14px',
                    padding: '13px 12px',
                    textDecoration: 'none',
                    color: '#065f46',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    textAlign: 'center',
                  }}
                >
                  {r.label}
                  <span style={{ display: 'block', fontWeight: 500, fontSize: '0.78rem', color: '#6b7280', marginTop: '2px' }}>
                    {r.count} questions
                  </span>
                </a>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginTop: '22px' }}>
          <p style={{ fontSize: '0.85rem', color: '#777', margin: '0 0 8px' }}>Or replay this one with</p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {lengthChoices.map(n => (
              <button key={n} style={ghost} onClick={() => replay(n)}>{n} questions</button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ---- Question screen (this is what a reader lands on -- no start gate) ----
  const q = round[index]
  const fresh = index === 0 && !revealed && !feedback
  return (
    <div style={card}>
      {/* Banner: the reader has to know at a glance this is a live game they
          can play right now, for free, in about two minutes. */}
      <div style={banner}>
        <span style={eyebrow}>{fresh ? '\u25B6 PLAY NOW \u00B7 FREE' : '\u25B6 IN PLAY'}</span>
        <h2 style={{ fontSize: '1.32rem', fontWeight: 800, margin: '0 0 3px', lineHeight: 1.2 }}>{heading}</h2>
        <p style={{ fontSize: '0.85rem', opacity: 0.93, margin: 0 }}>
          {round.length} questions &middot; about {minutes} min &middot; no sign-up
        </p>
      </div>
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
      <p style={{ fontSize: fresh ? '1.3rem' : '1.15rem', fontWeight: 700, margin: '0 0 20px', minHeight: '56px', lineHeight: 1.35 }}>{q.question}</p>
      {!revealed ? (
        <>
          <button
            style={{ ...btn, fontSize: fresh ? '1.05rem' : '1rem', padding: fresh ? '15px 34px' : '13px 30px', boxShadow: '0 6px 18px rgba(5,150,105,0.28)' }}
            onClick={() => { markStarted(); setRevealed(true) }}
          >
            {fresh ? 'Reveal the Answer' : 'Reveal Answer'}
          </button>
          {fresh && (
            <p style={{ fontSize: '0.82rem', color: '#888', margin: '12px 0 0' }}>
              Guess out loud first &mdash; then see if you got it.
            </p>
          )}
        </>
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
