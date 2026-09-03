'use client'

import { useState, useEffect, useRef } from 'react'
import posthog from 'posthog-js'
import { QuizExitCatch } from './QuizExitCatch'
import { STORIES } from '../components/stories'
import { VariantB } from '../quiz-variants/treatments'
import './quiz.css'

// ============================================================================
// Data
// ============================================================================

const PROOF = [
  '12,847 parents answered the same way',
  'You\'re in good company — this is the #1 answer',
  '92% of our families chose this too',
  'Great choice. We\'ll match this to your plan.',
  'You\'re not alone. Most parents feel this way.',
  'Noted — building your personalized path...',
  'Perfect. We have exactly what you need.',
  'Got it — almost done!',
]

const KID_PROOF = [
  'Awesome pick! 🎉',
  'Great choice — this is going to be fun!',
  'You have excellent taste! ⭐',
  'Adding that to your adventure...',
  'You\'re going to love this!',
  'Almost there, hero!',
  'Your adventure is looking amazing!',
  'Last one — you\'ve got this!',
]

const BUILD_STEPS = [
  { text: 'Analyzing your answers', icon: '🔍', ms: 900 },
  { text: 'Matching content to age group', icon: '👶', ms: 1000 },
  { text: 'Selecting denomination path', icon: '⛪', ms: 800 },
  { text: 'Building personalized series order', icon: '📚', ms: 1100 },
  { text: 'Adding quizzes and reflections', icon: '📝', ms: 700 },
  { text: 'Calculating starting point', icon: '🧭', ms: 900 },
  { text: 'Finalizing your plan', icon: '✨', ms: 600 },
]

const KID_BUILD_STEPS = [
  { text: 'Loading your hero adventures', icon: '🗡️', ms: 900 },
  { text: 'Picking stories for your age', icon: '🎂', ms: 1000 },
  { text: 'Adding quizzes to beat', icon: '🏆', ms: 800 },
  { text: 'Setting up your levels', icon: '⭐', ms: 1000 },
  { text: 'Unlocking your first series', icon: '🔓', ms: 900 },
  { text: 'Drawing your adventure map', icon: '🗺️', ms: 800 },
]

// Questions — all single-tap, no typing
type Question = {
  id: string; emoji: string; q: string; sub: string
  type: 'single' | 'multi' | 'slider' | 'scale' | 'trivia'
  opts?: { label: string; val: string; emoji: string; sub?: string }[]
  correct?: string
  correctMsg?: string
  revealMsg?: string
  interstitialAfter?: 'screen_time' | 'video'
}

const PARENT_QUESTIONS: Question[] = [
  {
    id: 'num_kids', emoji: '👨‍👩‍👧‍👦', type: 'single',
    q: 'How many kids are in your family?',
    sub: 'We support up to 5 profiles on one account',
    opts: [
      { label: '1 child', val: '1', emoji: '1️⃣' },
      { label: '2 children', val: '2', emoji: '2️⃣' },
      { label: '3 children', val: '3', emoji: '3️⃣' },
      { label: '4 or more', val: '4+', emoji: '4️⃣' },
    ],
  },
  {
    id: 'age', emoji: '🎂', type: 'single',
    q: 'How old is your youngest?',
    sub: 'We\'ll match lessons to their level',
    opts: [
      { label: '4-5', val: '4-5', emoji: '🌱', sub: 'Little Learner' },
      { label: '6-7', val: '6-7', emoji: '🌿', sub: 'Growing Mind' },
      { label: '8-9', val: '8-9', emoji: '🌳', sub: 'Explorer' },
      { label: '10-12', val: '10-12', emoji: '⭐', sub: 'Young Scholar' },
      { label: '13+', val: '13+', emoji: '🎓', sub: 'Teen' },
    ],
  },
  {
    id: 'screen_time', emoji: '📱', type: 'single',
    q: 'Daily screen time?',
    sub: 'No judgment — just an estimate',
    opts: [
      { label: 'Under 1 hour', val: '<1hr', emoji: '😇' },
      { label: '1-2 hours', val: '1-2hr', emoji: '📱' },
      { label: '2-4 hours', val: '2-4hr', emoji: '📺' },
      { label: '4+ hours', val: '4hr+', emoji: '😬' },
    ],
    interstitialAfter: 'screen_time',
  },
  {
    id: 'content', emoji: '📺', type: 'multi',
    q: 'What do they usually watch?',
    sub: 'Tap all that apply',
    opts: [
      { label: 'YouTube', val: 'youtube', emoji: '▶️' },
      { label: 'TikTok', val: 'tiktok', emoji: '🎵' },
      { label: 'Netflix', val: 'netflix', emoji: '🎬' },
      { label: 'Disney+', val: 'disney', emoji: '🏰' },
      { label: 'Games', val: 'games', emoji: '🎮' },
      { label: 'Other', val: 'other', emoji: '📱' },
    ],
  },
  {
    id: 'denomination', emoji: '⛪', type: 'single',
    q: 'Your faith tradition?',
    sub: 'We\'ll tailor content to your beliefs',
    opts: [
      { label: 'Catholic', val: 'catholic', emoji: '🕊️' },
      { label: 'Evangelical', val: 'evangelical', emoji: '📖' },
      { label: 'Non-denominational', val: 'nondenominational', emoji: '✝️' },
      { label: 'Exploring', val: 'exploring', emoji: '🌱' },
    ],
  },
  {
    id: 'faith', emoji: '🙏', type: 'single',
    q: 'How central is faith in your home?',
    sub: 'No wrong answer',
    opts: [
      { label: 'Everything revolves around it', val: 'central', emoji: '🔥' },
      { label: 'Very important to us', val: 'very', emoji: '🙏' },
      { label: 'We\'re working on it', val: 'somewhat', emoji: '💭' },
      { label: 'Just starting out', val: 'exploring', emoji: '🌱' },
    ],
    interstitialAfter: 'video',
  },
  {
    id: 'pain', emoji: '💔', type: 'single',
    q: 'Biggest screen time frustration?',
    sub: 'Pick the one that hits hardest',
    opts: [
      { label: 'They learn nothing', val: 'no_value', emoji: '🗑️' },
      { label: 'Way too many hours', val: 'too_much', emoji: '⏰' },
      { label: 'Inappropriate content', val: 'bad_content', emoji: '🚫' },
      { label: 'I feel guilty about it', val: 'guilt', emoji: '💔' },
    ],
  },
  {
    id: 'goal', emoji: '🎯', type: 'single',
    q: 'What does success look like?',
    sub: 'Last one!',
    opts: [
      { label: 'My kid knows the Bible', val: 'knowledge', emoji: '📖' },
      { label: 'Replace junk screen time', val: 'replace', emoji: '🔄' },
      { label: 'Build real faith early', val: 'faith', emoji: '✝️' },
      { label: 'All of the above', val: 'all', emoji: '🌟' },
    ],
  },
]

const KID_QUESTIONS: Question[] = [
  {
    id: 'age', emoji: '🎂', type: 'single',
    q: 'How old are you?',
    sub: 'So we pick the perfect stories for you',
    opts: [
      { label: '4-5', val: '4-5', emoji: '🌱', sub: 'Little Learner' },
      { label: '6-7', val: '6-7', emoji: '🌿', sub: 'Growing Mind' },
      { label: '8-9', val: '8-9', emoji: '🌳', sub: 'Explorer' },
      { label: '10-12', val: '10-12', emoji: '⭐', sub: 'Young Scholar' },
      { label: '13+', val: '13+', emoji: '🎓', sub: 'Almost grown up!' },
    ],
  },
  {
    id: 'hero', emoji: '🦸', type: 'single',
    q: 'Pick your favorite Bible hero!',
    sub: 'Your adventure starts with them',
    opts: [
      { label: 'David', val: 'david', emoji: '🪨', sub: 'Beat a giant with one stone' },
      { label: 'Noah', val: 'noah', emoji: '🚢', sub: 'Built the biggest boat ever' },
      { label: 'Esther', val: 'esther', emoji: '👑', sub: 'The bravest queen' },
      { label: 'Daniel', val: 'daniel', emoji: '🦁', sub: 'Slept next to lions' },
      { label: 'Peter', val: 'peter', emoji: '🌊', sub: 'Walked on water' },
      { label: 'All of them!', val: 'all', emoji: '🌟', sub: 'Why pick just one?' },
    ],
  },
  {
    id: 'trivia_boat', emoji: '🧠', type: 'trivia',
    q: 'Quick quiz! Who built the giant boat for all the animals?',
    sub: 'Bet you know this one...',
    correct: 'noah',
    correctMsg: '🎉 CORRECT! You\'re good at this!',
    revealMsg: 'It was Noah! 🚢 Now you know — that\'s how learning works!',
    opts: [
      { label: 'David', val: 'david', emoji: '🪨' },
      { label: 'Noah', val: 'noah', emoji: '🚢' },
      { label: 'Goliath', val: 'goliath', emoji: '💪' },
      { label: 'Jonah', val: 'jonah', emoji: '🐋' },
    ],
  },
  {
    id: 'fun', emoji: '🎮', type: 'single',
    q: 'What sounds the MOST fun?',
    sub: 'You get all of these, by the way',
    opts: [
      { label: 'Watching Bible movies', val: 'videos', emoji: '📺' },
      { label: 'Beating quizzes', val: 'quizzes', emoji: '🏆' },
      { label: 'Leveling up like a game', val: 'levels', emoji: '⭐' },
      { label: 'ALL of it!', val: 'all', emoji: '🌟' },
    ],
    interstitialAfter: 'video',
  },
  {
    id: 'trivia_giant', emoji: '🧠', type: 'trivia',
    q: 'One more! Who beat the giant Goliath?',
    sub: 'You\'ve got this...',
    correct: 'david',
    correctMsg: '🎉 YES! Two in a row — you\'re a natural!',
    revealMsg: 'It was David! 🪨 One smooth stone. Wait till you see the video!',
    opts: [
      { label: 'Moses', val: 'moses', emoji: '🌊' },
      { label: 'Noah', val: 'noah', emoji: '🚢' },
      { label: 'David', val: 'david', emoji: '🪨' },
      { label: 'Peter', val: 'peter', emoji: '🎣' },
    ],
  },
  {
    id: 'watch', emoji: '📺', type: 'single',
    q: 'How much do you watch videos or play games?',
    sub: 'Be honest — we won\'t tell 😉',
    opts: [
      { label: 'A little', val: '<1hr', emoji: '😇' },
      { label: 'Some days a lot', val: '1-2hr', emoji: '📱' },
      { label: 'A LOT', val: '2-4hr', emoji: '😅' },
      { label: 'My parents say too much', val: '4hr+', emoji: '🙈' },
    ],
  },
  {
    id: 'adventure', emoji: '🗺️', type: 'single',
    q: 'Pick your FIRST adventure!',
    sub: 'Where should your journey start?',
    opts: [
      { label: 'The lions\' den with Daniel', val: 'daniel', emoji: '🦁' },
      { label: 'The great flood with Noah', val: 'noah', emoji: '🌊' },
      { label: 'Walking on water', val: 'water', emoji: '👣' },
      { label: 'The very first day of the world', val: 'creation', emoji: '✨' },
    ],
  },
  {
    id: 'excited', emoji: '🚀', type: 'single',
    q: 'How excited are you to start?',
    sub: 'Last one!',
    opts: [
      { label: 'Pretty excited', val: 'excited', emoji: '😀' },
      { label: 'Super excited', val: 'super', emoji: '🤩' },
      { label: 'THE MOST excited EVER!!', val: 'most', emoji: '🚀' },
    ],
  },
]

// ============================================================================
// Component
// ============================================================================

/* The welcome screen — the gate in front of the path fork.
 *
 * Posters are resolved by TITLE, never by array index: CLAUDE.md records an
 * incident where inserting A Baby in a Basket shifted indices and silently
 * repointed a whole section. Served from video-posters/sm/ at 640x360 — the
 * full-size files are 224KB for four, which is a lot to put above the fold on
 * the entry screen of the paid funnel. The small set is 88KB.
 *
 * Counts are ground truth from check-counts.py: 310 lessons, 31 series,
 * median runtime 2:07. Never "400+".
 */
const WELCOME_TITLES = [
  'In the Beginning: Creation',
  'A Baby in a Basket',
  'Noah & the Great Flood',
  'An Angel Visits Mary',
]
const WELCOME_POSTERS = WELCOME_TITLES.map(t => {
  const story = STORIES.find(s => s.title === t)
  return {
    title: t,
    // same filename, smaller rendition
    src: (story?.poster || '').replace('/video-posters/', '/video-posters/sm/'),
  }
})

function Welcome({ onBegin }: { onBegin: () => void }) {
  return (
    <div className="qz qz-welcome">
      <div className="qz-head">
        <img src="/logo-sm.png" alt="" className="qz-logo" />
      </div>
      {/* No progress bar here. The old one rendered at 4% before the visitor
          had agreed to anything, which is part of what this screen fixes. */}
      <div className="qz-w-body">
        <div className="qz-w-shelf">
          {WELCOME_POSTERS.map(p => (
            <img
              key={p.title}
              src={p.src}
              alt={p.title}
              width={640}
              height={360}
              loading="eager"
              className="qz-w-poster"
            />
          ))}
        </div>

        {/* Head and button are separate children so desktop can slot the
            shelf between them (headline -> posters -> Begin) while mobile
            keeps posters first. Both orders read as one block; the posters
            are evidence for the line above them rather than decoration. */}
        <div className="qz-w-head">
          <h1 className="qz-w-h1">The whole Bible in two minute episodes</h1>
          {/* Twemoji, self-hosted, rather than the emoji character: the
              platform glyph looks wildly different on Apple,
              Google and Windows. Apple's own artwork ships with their OS
              fonts and is not licensed for a website, so this is the CC-BY
              Twemoji set that Twitter and Discord use. */}
          <p className="qz-w-sub">
            Screen time you can feel good about
            <img src="/emoji-heart.svg" alt="" className="qz-w-emoji" width={22} height={22} />
          </p>
        </div>
        <button className="qz-w-btn" onClick={onBegin}>Begin</button>
      </div>
    </div>
  )
}

export default function Quiz() {
  const [path, setPath] = useState<'kid' | 'parent' | null>(null)
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [anim, setAnim] = useState<'enter' | 'exit'>('enter')
  const [proof, setProof] = useState<string | null>(null)
  const [inter, setInter] = useState<'screen_time' | 'video' | null>(null)
  const [phase, setPhase] = useState<'quiz' | 'build' | 'result'>('quiz')
  const [buildIdx, setBuildIdx] = useState(0)
  const [buildPct, setBuildPct] = useState(0)
  const [liveCount] = useState(Math.floor(780 + Math.random() * 200))

  // Gate + restore state. `restoreChecked` exists so the welcome screen never
  // flashes in front of someone returning from Stripe: the restore below runs
  // in an effect, so on the very first paint phase is still 'quiz'.
  const [begun, setBegun] = useState(false)
  const [restoreChecked, setRestoreChecked] = useState(false)

  /* quiz_started used to fire here, on mount. That made it identical to a
     /quiz pageview every single day (28/28, 13/13, 15/15) — a bounce and a
     real abandon were indistinguishable, and it produced a reported
     completion collapse that had not happened. It now fires on Begin. */

  // Restore a completed quiz after returning from Stripe (browser back/swipe)
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('fk_quiz_state')
      if (raw) {
        const s = JSON.parse(raw)
        if (s.phase === 'result' && s.answers && s.path) {
          setPath(s.path)
          setAnswers(s.answers)
          setPhase('result')
          setBegun(true)          // returning from Stripe — never re-gate them
        }
      }
    } catch { /* private mode */ }
    setRestoreChecked(true)
  }, [])

  function begin() {
    setBegun(true)
    posthog.capture('quiz_started', { surface: 'welcome' })
    arm()
  }

  /* Browser back used to leave /quiz entirely from any question — nine
     answers thrown away by one swipe. The quiz is a single route with
     internal state, so it has to keep a history entry to spend.
     `arm()` pushes one; popstate spends it, steps back, and re-arms. At the
     welcome screen there is nothing left to spend and back leaves normally,
     which is what someone at the front door expects. */
  function arm() {
    try { history.pushState({ fk: 'quiz' }, '') } catch { /* older Safari */ }
  }

  useEffect(() => {
    function onPop() {
      if (phase === 'result' || inter) { setInter(null); setPhase('quiz'); arm(); return }
      if (step > 0) { setStep(s => s - 1); setAnim('enter'); arm(); return }
      if (path) { setPath(null); arm(); return }
      if (begun) { setBegun(false); arm(); return }
      // welcome screen: let the browser leave
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [step, path, begun, phase, inter])

  const QUESTIONS = path === 'kid' ? KID_QUESTIONS : PARENT_QUESTIONS
  const total = QUESTIONS.length
  const q = QUESTIONS[step]
  const pct = ((step + 1) / total) * 100

  function choosePath(p: 'kid' | 'parent') {
    arm()
    try { sessionStorage.removeItem('fk_quiz_state') } catch { /* private mode */ }
    setPath(p)
    posthog.capture('quiz_answer', { question: 'path', answer: p, step: -1 })
    posthog.capture('quiz_path_selected', { path: p })
  }

  function pick(val: string) {
    const next = { ...answers, [q.id]: val }
    setAnswers(next)
    posthog.capture('quiz_answer', { question: q.id, answer: val, step, path })

    // Feedback flash — trivia gets right/wrong, others get social proof
    let wait = 800
    if (q.type === 'trivia') {
      const gotIt = val === q.correct
      setProof(gotIt ? (q.correctMsg || '🎉 Correct!') : (q.revealMsg || 'Good try!'))
      wait = gotIt ? 1100 : 1800
      setTimeout(() => setProof(null), wait + 600)
    } else {
      const proofList = path === 'kid' ? KID_PROOF : PROOF
      setProof(proofList[Math.min(step, proofList.length - 1)])
      setTimeout(() => setProof(null), 1400)
    }

    // Interstitial?
    if (q.interstitialAfter) {
      setTimeout(() => setInter(q.interstitialAfter!), wait)
      return
    }

    // Next or build
    setTimeout(() => advance(next), wait)
  }

  function pickMulti(val: string) {
    const next = { ...answers, [q.id]: val }
    setAnswers(next)
    posthog.capture('quiz_answer', { question: q.id, answer: val, step })
    setTimeout(() => advance(next), 300)
  }

  function advance(a: Record<string, string>) {
    if (step < total - 1) {
      setAnim('exit')
      arm()
      setTimeout(() => { setStep(s => s + 1); setAnim('enter') }, 280)
    } else {
      startBuild(a)
    }
  }

  function dismissInter() {
    setInter(null)
    advance(answers)
  }

  function startBuild(a: Record<string, string>) {
    setPhase('build')
    posthog.capture('quiz_completed', { ...a, path })
    try { sessionStorage.setItem('fk_quiz_state', JSON.stringify({ phase: 'result', answers: a, path })) } catch { /* private mode */ }
    const steps = path === 'kid' ? KID_BUILD_STEPS : BUILD_STEPS
    let i = 0, pct = 0
    function tick() {
      if (i >= steps.length) { setTimeout(() => setPhase('result'), 500); return }
      setBuildIdx(i)
      const target = Math.round(((i + 1) / steps.length) * 100)
      const interval = setInterval(() => {
        pct++
        setBuildPct(Math.min(pct, 100))
        if (pct >= target) clearInterval(interval)
      }, steps[i].ms / Math.max(target - pct, 1))
      i++
      setTimeout(tick, steps[i - 1].ms)
    }
    tick()
  }


  /* Welcome gate.
     Hold the first paint until the Stripe-restore effect has run: it sets
     phase='result' asynchronously, so rendering before that check would flash
     the welcome screen at someone coming back from checkout. One blank frame
     beats the wrong screen. */
  if (!restoreChecked) return <div className="qz" />
  if (!begun && phase !== 'result') return <Welcome onBegin={begin} />

  // ===== PATH FORK =====
  if (!path) {
    return (
      <div className="qz">
        <div className="qz-head">
          <img src="/logo-sm.png" alt="" className="qz-logo" />
        </div>
        <div className="qz-bar"><div className="qz-bar-fill" style={{ width: '4%' }} /></div>
        <div className="qz-body">
          <div className="qz-card enter">
            {/* Lead with the outcome, not the admin question. The fork still
                has to be asked, but it is the subtitle now. */}
            <div className="qz-emoji">📖</div>
            <h1 className="qz-q">Build your kids&apos; Bible plan</h1>
            <p className="qz-sub">Who&apos;s taking the quiz today?</p>
            <div className="qz-opts">
              <button className="qz-opt" onClick={() => choosePath('parent')}>
                <span className="qz-opt-emoji">👨‍👩‍👧</span>
                <span className="qz-opt-text">
                  <strong>I&apos;m a parent</strong>
                  <small>Build a plan for your family</small>
                </span>
              </button>
              <button className="qz-opt" onClick={() => choosePath('kid')}>
                <span className="qz-opt-emoji">🧒</span>
                <span className="qz-opt-text">
                  <strong>I&apos;m a kid!</strong>
                  <small>Build your own Bible adventure</small>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ===== BUILD =====
  if (phase === 'build') {
    const steps = path === 'kid' ? KID_BUILD_STEPS : BUILD_STEPS
    return (
      <div className="qz">
        <div className="qz-build">
          <div className="qz-ring">
            <svg viewBox="0 0 120 120" width="130" height="130">
              <circle cx="60" cy="60" r="52" fill="none" stroke="#f3f4f6" strokeWidth="8" />
              <circle cx="60" cy="60" r="52" fill="none" stroke="#059669" strokeWidth="8" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 52}`}
                strokeDashoffset={`${2 * Math.PI * 52 * (1 - buildPct / 100)}`}
                style={{ transition: 'stroke-dashoffset 0.2s', transform: 'rotate(-90deg)', transformOrigin: 'center' }} />
            </svg>
            <span className="qz-ring-num">{buildPct}%</span>
          </div>
          <h2>{path === 'kid' ? 'Building your adventure map' : 'Building your family’s plan'}</h2>
          <p className="qz-build-sub">{path === 'kid' ? 'Hang tight, hero — almost ready...' : 'Hang tight — personalizing for your answers...'}</p>
          <div className="qz-build-list">
            {steps.map((s, i) => (
              <div key={i} className={`qz-build-row ${i < buildIdx ? 'done' : i === buildIdx ? 'active' : ''}`}>
                <span className="qz-build-icon">{i < buildIdx ? '✓' : s.icon}</span>
                <span>{s.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ===== RESULT =====
  if (phase === 'result') {
    return <Result answers={answers} path={path} />
  }

  // ===== SCREEN TIME INTERSTITIAL =====
  if (inter === 'screen_time') {
    const hrs = answers.screen_time === '<1hr' ? 1 : answers.screen_time === '1-2hr' ? 1.5 : answers.screen_time === '2-4hr' ? 3 : 5
    const yearly = Math.round(hrs * 365)
    const fivePct = Math.round(yearly * 0.05)
    return (
      <div className="qz">
        <div className="qz-bar"><div className="qz-bar-fill" style={{ width: `${pct}%` }} /></div>
        <div className="qz-body">
          <div className="qz-card enter">
            <div className="qz-stat-big">{yearly.toLocaleString()}</div>
            <div className="qz-stat-label">hours of screen time per year</div>
            <div className="qz-reframe">
              <p className="qz-reframe-q">What if just <strong>5%</strong> of that was Scripture?</p>
              <div className="qz-reframe-highlight">
                <span className="qz-reframe-num">{fivePct}</span>
                <span>hours of Bible stories per year</span>
              </div>
              <p className="qz-reframe-sub">Enough to walk through the entire Bible — twice.</p>
            </div>
            <button className="qz-btn" onClick={dismissInter}>Continue</button>
          </div>
        </div>
      </div>
    )
  }

  // ===== VIDEO INTERSTITIAL =====
  if (inter === 'video') {
    return <VideoInterstitial pct={pct} liveCount={liveCount} onDismiss={dismissInter} path={path} />
  }

  // ===== QUESTIONS =====
  return (
    <div className="qz">
      <div className="qz-head">
        <img src="/logo-sm.png" alt="" className="qz-logo" />
        <span className="qz-count">{step + 1}/{total}</span>
      </div>
      <div className="qz-bar"><div className="qz-bar-fill" style={{ width: `${pct}%` }} /></div>

      {proof && <div className="qz-proof"><span>✓</span> {proof}</div>}

      <div className="qz-body">
        <div className={`qz-card ${anim}`}>
          <div className="qz-emoji">{q.emoji}</div>
          <h1 className="qz-q">{q.q}</h1>
          <p className="qz-sub">{q.sub}</p>

          {(q.type === 'single' || q.type === 'trivia') && q.opts && (
            <div className="qz-opts">
              {q.opts.map(o => (
                <button key={o.val} className="qz-opt" onClick={() => pick(o.val)}>
                  <span className="qz-opt-emoji">{o.emoji}</span>
                  <span className="qz-opt-text">
                    <strong>{o.label}</strong>
                    {o.sub && <small>{o.sub}</small>}
                  </span>
                </button>
              ))}
            </div>
          )}

          {q.type === 'multi' && q.opts && (
            <MultiSelect opts={q.opts} onDone={pickMulti} />
          )}

          {step > 0 && <button className="qz-back" onClick={() => { setAnim('exit'); setTimeout(() => { setStep(s => s - 1); setAnim('enter') }, 280) }}>← Back</button>}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Multi-select
// ============================================================================
function VideoInterstitial({ pct, liveCount, onDismiss, path }: { pct: number; liveCount: number; onDismiss: () => void; path: 'kid' | 'parent' | null }) {
  const vidRef = useRef<HTMLVideoElement>(null)
  const [muted, setMuted] = useState(true)
  const isKid = path === 'kid'

  function toggleMute() {
    if (vidRef.current) {
      vidRef.current.muted = !muted
      setMuted(!muted)
      if (muted) posthog.capture('quiz_video_unmuted')
    }
  }

  return (
    <div className="qz">
      <div className="qz-bar"><div className="qz-bar-fill" style={{ width: `${pct}%` }} /></div>
      <div className="qz-body">
        <div className="qz-card enter">
          <p className="qz-eyebrow">{isKid ? 'Look — Jesus tells YOU the story! 🤩' : 'A peek at what your kids could be watching'}</p>
          <div className="qz-vid-wrap" style={{ position: 'relative', cursor: 'pointer' }} onClick={toggleMute}>
            <video
              ref={vidRef}
              src="https://d3g07v1w0lehiv.cloudfront.net/bible/birth-of-jesus-series/01-an-angel-visits-mary/lesson-video.mp4"
              poster="https://d3g07v1w0lehiv.cloudfront.net/blog-images/an-angel-visits-mary-for-kids-hero.webp"
              autoPlay playsInline muted loop
            />
            <div style={{
              position: 'absolute', bottom: '12px', left: '12px',
              background: 'rgba(0,0,0,0.6)', color: '#fff',
              borderRadius: '8px', padding: '8px 14px', fontSize: '0.82rem',
              fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px',
              pointerEvents: 'none',
            }}>
              {muted ? '\u{1F507} Tap to listen' : '\u{1F50A} Playing'}
            </div>
          </div>
          <p className="qz-vid-cap">{isKid ? 'Every story is a movie like this — with a quiz to beat after!' : 'Real lesson from Faithful Kids. Jesus narrates every story.'}</p>
          <div className="qz-live-pill">{'\u{1F441}\uFE0F'} {liveCount} families watching right now</div>
          <button className="qz-btn" onClick={onDismiss}>{isKid ? 'Cool! Keep going →' : 'Almost done — 2 left'}</button>
        </div>
      </div>
    </div>
  )
}

function MultiSelect({ opts, onDone }: { opts: { label: string; val: string; emoji: string }[], onDone: (v: string) => void }) {
  const [sel, setSel] = useState<string[]>([])
  return (
    <>
      <div className="qz-multi">
        {opts.map(o => (
          <button key={o.val} className={`qz-multi-item ${sel.includes(o.val) ? 'on' : ''}`}
            onClick={() => setSel(p => p.includes(o.val) ? p.filter(v => v !== o.val) : [...p, o.val])}>
            <span>{o.emoji}</span>
            <span>{o.label}</span>
            {sel.includes(o.val) && <span className="qz-multi-check">✓</span>}
          </button>
        ))}
      </div>
      <button className="qz-btn" disabled={!sel.length} onClick={() => onDone(sel.join(','))}>Continue</button>
    </>
  )
}

// ============================================================================
// Result page
// ============================================================================
/* The result screen.
 *
 * Replaced Aug 31 2026. What the old one claimed and what is true had come
 * apart badly: a live counter reading ~900 families "taking this quiz right
 * now" when 144 people started it in ninety days; a countdown to a plan
 * "reservation" that does not exist, running in two places at once; built-in
 * daily limits that pause when time is up, for a screen-time feature the app
 * has never had — shown precisely to parents who said screen time was their
 * problem; an inflated lesson count against a real 310; and three named testimonials.
 *
 * It also told every child their first stop was whichever adventure they
 * picked. DEFAULT_UNLOCKED_SERIES is ['genesis', 'birth-of-jesus'] for every
 * account, and the quiz answers cannot reach the app anyway — different
 * origin. None of that survives here.
 *
 * The shape is data-led: 131 people reached this screen in ninety days and 37
 * went on to payment, but only four ever touched a plan selector. The quiz
 * does the persuading; this confirms, prices, and gets out of the way.
 */
function Result({ answers, path }: { answers: Record<string, string>; path: 'kid' | 'parent' | null }) {
  return (
    <>
      <QuizExitCatch answers={answers} path={path} />
      <VariantB answers={answers} isKid={path === 'kid'} />
    </>
  )
}
