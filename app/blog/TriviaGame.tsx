'use client'

import { useMemo, useRef, useState } from 'react'
import posthog from 'posthog-js'
import type { TriviaLink } from '@/lib/blog'
import type { TriviaChoiceQuestion } from '@/lib/trivia-choices'
import { VideoTile } from '@/app/components/VideoTile'

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

/** A question with its options already laid out and the right one recorded. */
type Dealt = TriviaChoiceQuestion & { options: string[]; correct: number }

/* `seed` keeps the first render deterministic across server and client.
   Passing undefined (replays) shuffles for real. */
function deal(q: TriviaChoiceQuestion, seed?: number): Dealt {
  const opts = [q.answer, ...(q.wrong || [])]
  const order = seed === undefined
    ? shuffle(opts)
    : opts.map((_, i) => opts[(i + seed) % opts.length])
  return { ...q, options: order, correct: order.indexOf(q.answer) }
}

export function TriviaGame({
  questions,
  postSlug,
  postTitle,
  label,
  related,
  videoSrc,
  videoTitle,
  posterSrc,
  embed = false,
}: {
  questions: TriviaChoiceQuestion[]
  postSlug: string
  postTitle: string
  /** Short game name, e.g. "Exodus" */
  label: string
  /** Other playable games to send them to when this round ends */
  related: TriviaLink[]
  videoSrc: string
  videoTitle: string
  posterSrc?: string
  /**
   * Rendered inside a third-party iframe at /embed/trivia/<slug>.
   *
   * Two things change and both are load-bearing. Every link becomes ABSOLUTE:
   * a relative href inside someone else's frame resolves against THEIR origin,
   * so `/quiz` would send their reader to a 404 on their own site. And the
   * end-screen video is swapped for a link back to the post, because the
   * player portals a fixed-position modal into the document body — which here
   * is a frame that may be 500px tall on a stranger's page.
   */
  embed?: boolean
}) {
  // Embed traffic lands with a fresh distinct_id (partitioned iframe storage),
  // so the UTM is the only thing that makes it attributable at all. Campaign
  // carries the slug: this is a per-post embed, and we want to know which
  // game someone's site is actually running.
  const site = embed ? 'https://faithfulkids.app' : ''
  const utm = embed ? `?utm_source=embed&utm_medium=iframe&utm_campaign=trivia-${postSlug}` : ''
  const out = embed ? { target: '_blank', rel: 'noopener' } : {}
  const surface = embed ? 'embed' : 'post'

  // The opening round is NOT shuffled: it has to render identically on the
  // server and the client, and Math.random() would blow up hydration. Replays
  // shuffle, so repeat players still get variety.
  /* Only questions that carry three distractors are playable. A question
     without them would render an option list of one, so it is dropped rather
     than shown — every post clears ten even so. */
  const pool = useMemo(() => questions.filter(q => q.wrong?.length === 3), [questions])

  /* The opening round is NOT shuffled and its options are dealt from a fixed
     rotation: this renders on the server and again on the client, and
     Math.random() in either place blows up hydration. Replays shuffle, so
     repeat players still get variety. */
  const [round, setRound] = useState<Dealt[]>(
    () => pool.slice(0, Math.min(DEFAULT_ROUND, pool.length)).map((q, i) => deal(q, i))
  )
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [chosen, setChosen] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [feedback, setFeedback] = useState<{ text: string; good: boolean } | null>(null)
  const [finished, setFinished] = useState(false)
  const [shareNote, setShareNote] = useState<string | null>(null)
  const started = useRef(false)

  const lengthChoices = [5, 10, 20].filter(n => n <= pool.length)

  // Fires on the first real interaction, not on mount -- otherwise every
  // pageview would count as a game start and suppress the exit popup.
  const markStarted = () => {
    if (started.current) return
    started.current = true
    try { sessionStorage.setItem('fk_trivia_started', '1') } catch { /* private mode */ }
    track('trivia_game_start', {
      post: postSlug, surface, round_size: round.length, pool_size: pool.length,
    })
  }

  const replay = (count: number) => {
    setRound(shuffle(pool).slice(0, count).map(q => deal(q)))
    setIndex(0)
    setRevealed(false)
    setChosen(null)
    setScore(0)
    setStreak(0)
    setBestStreak(0)
    setFeedback(null)
    setFinished(false)
    setShareNote(null)
    track('trivia_game_replay', { post: postSlug, surface, round_size: count })
  }

  const answer = (gotIt: boolean) => {
    // `question` added 15 Sep 2026 — see TriviaQuizGame for why index alone
    // cannot identify a question (replay rounds are shuffled).
    track('trivia_game_answer', { post: postSlug, index, got_it: gotIt, question: round[index]?.question.slice(0, 160) })
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
    /* Does NOT advance. Under the old self-graded flow the reader pressed
       "Got it" AFTER seeing the answer, so moving straight on was fine. Now
       the answer appears the moment they choose, and auto-advancing would
       flash the correct option and its verse past a child who got it wrong —
       exactly the person who needs to read it. `next` is theirs to press. */
  }

  const next = () => {
    if (index + 1 >= round.length) {
      setFinished(true)
      track('trivia_game_complete', { post: postSlug, surface, score, total: round.length })
      return
    }
    setIndex(i => i + 1)
    setRevealed(false)
    setChosen(null)
    setFeedback(null)
  }

  const emerald = '#16a34a'
  const card: React.CSSProperties = {
    background: '#ffffff',
    border: '2px solid #dcfce7',
    borderRadius: '20px',
    padding: '28px 24px',
    margin: '32px auto',
    maxWidth: '760px',
    boxShadow: '0 4px 20px rgba(22, 163, 74, 0.08)',
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
    background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
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

        {embed ? (
          /* No player in the frame. The modal is position:fixed against the
             iframe's viewport, which is whatever height the host chose — on a
             short frame the video would open clipped. Send them to the post
             instead, where the same lesson plays full size. That link is also
             the point of the embed: a credit backlink to this exact page. */
          <a
            href={`${site}/blog/${postSlug}${utm}`}
            {...out}
            onClick={() => track('trivia_embed_video_click', { post: postSlug, surface })}
            style={{
              display: 'block',
              background: '#f0fdf4',
              border: '2px solid #dcfce7',
              borderRadius: '16px',
              padding: '16px',
              margin: '18px 0 16px',
              textDecoration: 'none',
              color: '#166534',
            }}
          >
            <span style={{ display: 'block', fontWeight: 800, fontSize: '1rem' }}>
              {'\u25B6'} Watch &ldquo;{videoTitle}&rdquo;
            </span>
            <span style={{ display: 'block', fontSize: '0.85rem', color: '#4b5563', marginTop: '3px' }}>
              One of 300+ video Bible lessons for kids &mdash; free to watch
            </span>
          </a>
        ) : (
          <>
            <div style={{ marginTop: '18px' }}>
              <VideoTile
                src={videoSrc}
                poster={posterSrc}
                title={videoTitle}
                location="trivia_end"
              />
            </div>
            <p style={{ fontSize: '0.85rem', color: '#777', margin: '8px 0 16px' }}>
              &ldquo;{videoTitle}&rdquo; — one of 300+ video lessons in the Faithful Kids Bible course
            </p>
          </>
        )}
        <p style={{ color: '#333', margin: '0 auto 18px', fontSize: '1.05rem', fontWeight: 600, maxWidth: '520px' }}>
          If you enjoyed this quiz, we think you&apos;ll really enjoy our Bible course. Take a look!
        </p>
        <a
          href={`${site}/quiz${utm}`}
          {...out}
          style={{ ...btn, textDecoration: 'none' }}
          onClick={() => track('trivia_game_cta_click', { post: postSlug, surface, score, total: round.length })}
        >
          Take a look
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
                  href={`${site}/blog/${r.slug}${utm}`}
                  {...out}
                  onClick={() => track('trivia_game_next_click', { from: postSlug, to: r.slug, surface })}
                  style={{
                    display: 'block',
                    background: '#f0fdf4',
                    border: '2px solid #dcfce7',
                    borderRadius: '14px',
                    padding: '13px 12px',
                    textDecoration: 'none',
                    color: '#166534',
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
  // Nothing playable: render nothing rather than crash the page. The two
  // callers both gate on playableCount, so this should be unreachable.
  if (!round.length) return null
  const q = round[index]
  const fresh = index === 0 && !revealed && !feedback
  const picked = revealed ? chosen : null

  function choose(i: number) {
    if (revealed) return
    markStarted()
    setChosen(i)
    setRevealed(true)
    answer(i === q.correct)
  }

  /* Option colours after the reveal: the chosen wrong one is marked, the
     right one is always shown. Someone who got it wrong should leave the
     question knowing the answer, not just that they missed. */
  function optStyle(i: number): React.CSSProperties {
    const base: React.CSSProperties = {
      display: 'flex', alignItems: 'center', gap: '12px', width: '100%',
      padding: '15px 16px', marginBottom: '10px', borderRadius: '14px',
      border: '2px solid #e5e7eb', background: '#fff', cursor: revealed ? 'default' : 'pointer',
      font: 'inherit', fontSize: '1rem', fontWeight: 600, color: '#1f2937',
      textAlign: 'left', lineHeight: 1.35, transition: 'border-color .12s, background .12s',
    }
    if (!revealed) return base
    if (i === q.correct) return { ...base, borderColor: emerald, background: '#f0fdf4', color: '#14532d' }
    if (i === picked) return { ...base, borderColor: '#fca5a5', background: '#fef2f2', color: '#7f1d1d' }
    return { ...base, opacity: 0.55 }
  }

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
        <span>{streak > 1 ? `\u{1F525} ${streak} streak` : `Score: ${score}`}</span>
      </div>
      <div style={{ height: '6px', background: '#e8f7f0', borderRadius: '3px', marginBottom: '14px' }}>
        <div style={{ height: '6px', width: `${((index + (revealed ? 1 : 0.5)) / round.length) * 100}%`, background: emerald, borderRadius: '3px', transition: 'width 0.3s' }} />
      </div>

      <p style={{ fontSize: fresh ? '1.22rem' : '1.12rem', fontWeight: 700, margin: '0 0 18px', lineHeight: 1.35 }}>{q.question}</p>

      <div>
        {q.options.map((opt, i) => (
          <button key={i} style={optStyle(i)} onClick={() => choose(i)} disabled={revealed}>
            <span style={{
              flexShrink: 0, width: '26px', height: '26px', borderRadius: '50%',
              background: revealed && i === q.correct ? emerald
                : revealed && i === picked ? '#ef4444' : '#f1f5f9',
              color: revealed && (i === q.correct || i === picked) ? '#fff' : '#64748b',
              fontSize: '0.8rem', fontWeight: 800,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {revealed && i === q.correct ? '\u2713' : revealed && i === picked ? '\u2715' : 'ABCD'[i]}
            </span>
            <span>{opt}</span>
          </button>
        ))}
      </div>

      {revealed && (
        <div style={{
          background: feedback?.good ? '#f0fdf4' : '#fffbeb',
          borderRadius: '12px', padding: '13px 15px', margin: '14px 0 0', textAlign: 'left',
        }}>
          <p style={{
            fontSize: '0.95rem', fontWeight: 800, margin: 0,
            color: feedback?.good ? emerald : '#b45309',
          }}>
            {feedback?.text}
          </p>
          {q.citation && (
            <p style={{ fontSize: '0.85rem', color: '#666', margin: '5px 0 0' }}>{q.citation}</p>
          )}
        </div>
      )}

      {revealed && (
        <button
          style={{ ...btn, marginTop: '14px', width: '100%', maxWidth: '320px' }}
          onClick={next}
        >
          {index + 1 >= round.length ? 'See my score \u2192' : 'Next question \u2192'}
        </button>
      )}

      {fresh && !revealed && (
        <p style={{ fontSize: '0.82rem', color: '#888', margin: '12px 0 0' }}>
          Tap your answer &mdash; no sign-up, nothing to lose.
        </p>
      )}
    </div>
  )
}
