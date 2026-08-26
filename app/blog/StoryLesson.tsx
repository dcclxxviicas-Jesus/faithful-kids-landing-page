'use client'

/**
 * The free lesson on every story post: watch the full episode, then take the
 * same 3-question quiz the app gives, then get offered the app.
 *
 * Why it exists: all 200 story posts emitted VideoObject schema while rendering
 * no player at all, and the mid-article CTA asked people to pay before they had
 * seen anything. Showing the video makes the schema honest and puts the demo
 * before the ask.
 *
 * The quiz deliberately mirrors bible-kids/src/components/QuizSection.tsx —
 * same 3 questions, same praise/encouragement pools, same score titles, same
 * Duolingo card and button treatment — so the free sample feels like the
 * product rather than a lookalike.
 *
 * Bandwidth: preload="none" + poster, so a page view costs nothing until play
 * is pressed. These files are ~30MB.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import posthog from 'posthog-js'

function track(event: string, props?: Record<string, unknown>) {
  try {
    posthog.capture(event, props)
  } catch {
    // analytics must never break the lesson
  }
}

export interface StoryQuestion {
  q: string
  options: string[]
  correct: number
  why: string
}

// Same pools as the app's QuizSection.
const CORRECT_MESSAGES = ['Amazing!', 'Nailed it!', "You're on fire!", 'Bible Scholar!', 'Incredible!', 'Way to go!', 'Brilliant!']
const WRONG_MESSAGES = ['Almost!', 'Good try!', 'Keep going!', 'So close!', "Don't give up!"]

function scoreTitle(score: number, total: number) {
  if (score === total) return { emoji: '🏆', title: 'Bible Master!' }
  if (score >= total - 1) return { emoji: '⭐', title: 'Wisdom Seeker!' }
  if (score >= 1) return { emoji: '📖', title: 'Keep Learning!' }
  return { emoji: '💪', title: 'Try Again Next Time!' }
}

export function StoryLesson({
  videoUrl, posterUrl, captionsUrl, storyName, questions, slug, duration,
}: {
  videoUrl: string
  posterUrl: string
  captionsUrl?: string
  storyName: string
  questions: StoryQuestion[]
  slug: string
  /** Real runtime, e.g. "2:07" — read from the file with ffprobe, never guessed. */
  duration?: string
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const quizRef = useRef<HTMLDivElement>(null)
  const [playing, setPlaying] = useState(false)
  const [watched, setWatched] = useState(false)
  const [halfway, setHalfway] = useState(false)
  const [quizOpen, setQuizOpen] = useState(false)
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)
  const [msg, setMsg] = useState('')
  const advanceRef = useRef<number | null>(null)

  const total = questions.length
  const q = questions[index]

  // Real click = a user gesture, so this plays with sound. Never muted.
  function start() {
    const v = videoRef.current
    if (!v) return
    setPlaying(true)
    v.muted = false
    v.volume = 1
    v.play().catch(() => {/* user can still use native controls */})
    track('story_lesson_video_play', { slug })
  }

  const openQuiz = useCallback(() => {
    setQuizOpen(true)
    track('story_lesson_quiz_start', { slug, questions: total })
    setTimeout(() => quizRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 80)
  }, [slug, total])

  useEffect(() => {
    if (watched && !quizOpen && !done) openQuiz()
  }, [watched, quizOpen, done, openQuiz])

  const advance = useCallback((finalScore: number) => {
    if (advanceRef.current) { window.clearTimeout(advanceRef.current); advanceRef.current = null }
    setIndex(i => {
      if (i + 1 >= total) {
        setDone(true)
        track('story_lesson_complete', { slug, score: finalScore, total })
        return i
      }
      setPicked(null)
      return i + 1
    })
  }, [slug, total])

  function choose(i: number) {
    if (picked !== null) return
    const right = i === q.correct
    const newScore = right ? score + 1 : score
    setPicked(i)
    if (right) setScore(newScore)
    setMsg(right
      ? CORRECT_MESSAGES[Math.floor(Math.random() * CORRECT_MESSAGES.length)]
      : WRONG_MESSAGES[Math.floor(Math.random() * WRONG_MESSAGES.length)])
    track('story_lesson_answer', { slug, index, correct: right })

    // Auto-advance. A wrong answer gets longer, because the explanation is the
    // teaching moment and rushing past it defeats the point.
    const hold = right ? (q.why ? 3200 : 2000) : (q.why ? 4600 : 2600)
    advanceRef.current = window.setTimeout(() => advance(newScore), hold)
  }

  // Clear any pending timer on unmount so it can't fire into a dead component.
  useEffect(() => () => { if (advanceRef.current) window.clearTimeout(advanceRef.current) }, [])

  function replay() {
    setIndex(0); setPicked(null); setScore(0); setDone(false)
    track('story_lesson_replay', { slug })
  }

  const result = scoreTitle(score, total)

  return (
    <div className="sl-wrap">
      {/* ---------------- video ---------------- */}
      <div className={`sl-player${playing ? ' sl-playing' : ''}`}>
        <video
          ref={videoRef}
          className="sl-video"
          src={videoUrl}
          poster={posterUrl}
          preload="none"
          playsInline
          controls={playing}
          onTimeUpdate={e => {
            const v = e.currentTarget
            if (!halfway && v.duration && v.currentTime / v.duration >= 0.5) {
              setHalfway(true)
              track('story_lesson_video_half', { slug })
            }
          }}
          onEnded={() => { setWatched(true); track('story_lesson_video_complete', { slug }) }}
        >
          {captionsUrl && <track kind="captions" src={captionsUrl} srcLang="en" label="English" default />}
        </video>

        {!playing && (
          <button className="sl-poster" onClick={start} aria-label={`Play ${storyName}`}>
            <span className="sl-shade" />
            <span className="sl-play">
              <span className="sl-ring" />
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.14v13.72L19 12z" /></svg>
            </span>
            <span className="sl-play-label">Watch {storyName}</span>
            {duration && <span className="sl-duration">{duration}</span>}
          </button>
        )}
      </div>

      {/* Framing line, not another button. The page already carries five /quiz
          links; what it lacked was a reason to press play in the first place. */}
      {!playing && (
        <p className="sl-together">
          <strong>Watch it with your kids.</strong> Press play, then see what they remember.
        </p>
      )}

      {/* The quiz button only appears once they are half way in. Before that it
          competed with the play button for the same attention. */}
      {total > 0 && !quizOpen && halfway && (
        <div className="sl-open-row">
          <button className="sl-btn sl-btn-green sl-open-quiz" onClick={openQuiz}>
            Take the {total}-question quiz
          </button>
          <p className="sl-open-note">Same quiz your child gets in the app.</p>
        </div>
      )}

      {/* ---------------- quiz ---------------- */}
      {quizOpen && (
        <div className="sl-quiz" ref={quizRef}>
          {!done ? (
            <div className="sl-card">
              <div className="sl-bar">
                {questions.map((_, i) => (
                  <i key={i} className={i < index ? 'sl-seg sl-seg-on' : i === index ? 'sl-seg sl-seg-now' : 'sl-seg'} />
                ))}
              </div>
              <p className="sl-count">Question {index + 1} of {total}</p>
              <h3 className="sl-q">{q.q}</h3>

              <div className="sl-options">
                {q.options.map((opt, i) => {
                  let cls = 'sl-option'
                  if (picked !== null) {
                    if (i === q.correct) cls += ' sl-right'
                    else if (i === picked) cls += ' sl-wrong'
                    else cls += ' sl-dim'
                  }
                  return (
                    <button key={i} className={cls} onClick={() => choose(i)} disabled={picked !== null}>
                      <span className="sl-letter">{'ABCD'[i]}</span>
                      <span>{opt}</span>
                    </button>
                  )
                })}
              </div>

              {picked !== null && (
                <div
                  className={`sl-fb${picked === q.correct ? ' sl-fb-right' : ' sl-fb-wrong'}`}
                  onClick={() => advance(score)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') advance(score) }}
                  title="Tap to continue"
                >
                  <strong>{msg}</strong>
                  {q.why && <p>{q.why}</p>}
                  {/* Timer bar: shows the round is moving on by itself, so the
                      jump never feels like a glitch. Tapping skips it. */}
                  <span
                    className="sl-timer"
                    style={{ animationDuration: `${picked === q.correct ? (q.why ? 3.2 : 2) : (q.why ? 4.6 : 2.6)}s` }}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="sl-card sl-done">
              <div className="sl-emoji">{result.emoji}</div>
              <h3 className="sl-title">{result.title}</h3>
              <p className="sl-score">{score} of {total} correct</p>
              <p className="sl-pitch">
                200 more stories work exactly like this — a quiz after every one, and progress you
                can actually see.
              </p>
              <a
                className="sl-btn sl-btn-green sl-cta"
                href="/quiz?ref=story-lesson"
                onClick={() => track('story_lesson_cta_click', { slug, score, total })}
              >
                Build my child&rsquo;s plan
              </a>
              <p className="sl-cta-note">A few quick questions. No ads, cancel anytime.</p>
              <button className="sl-again" onClick={replay}>Try the quiz again</button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
