'use client'

import { useState, useEffect, useRef } from 'react'
import posthog from 'posthog-js'
import './quiz.css'

const SOCIAL_PROOF = [
  '12,847 parents answered the same way',
  'You\'re in good company. Most parents feel this way.',
  'Great choice. This is the most popular answer.',
  '92% of our families said the same thing.',
  'This matches most families in our community.',
  'You\'re not alone. Most parents worry about this.',
  'Perfect. We have exactly the right content for this.',
]

const BUILD_STEPS = [
  { text: 'Analyzing your answers...', duration: 800 },
  { text: 'Matching content to your child\'s age...', duration: 900 },
  { text: 'Selecting recommended series...', duration: 700 },
  { text: 'Personalizing the learning path...', duration: 800 },
  { text: 'Adding quizzes and activities...', duration: 600 },
  { text: 'Your plan is ready!', duration: 500 },
]

export default function Quiz() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [animating, setAnimating] = useState(false)
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')
  const [showProof, setShowProof] = useState(false)
  const [proofIndex, setProofIndex] = useState(0)
  const [building, setBuilding] = useState(false)
  const [buildStep, setBuildStep] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [screenTimeValue, setScreenTimeValue] = useState(2)
  const [interstitial, setInterstitial] = useState<'screen_time_stat' | 'video_peek' | null>(null)
  const [minutes, setMinutes] = useState(9)
  const [seconds, setSeconds] = useState(59)

  useEffect(() => { posthog.capture('quiz_started') }, [])

  useEffect(() => {
    if (!showResult) return
    const t = setInterval(() => {
      setSeconds(s => { if (s === 0) { setMinutes(m => m === 0 ? 9 : m - 1); return 59 } return s - 1 })
    }, 1000)
    return () => clearInterval(t)
  }, [showResult])

  function advance(questionId: string, value: string) {
    const newAnswers = { ...answers, [questionId]: value }
    setAnswers(newAnswers)
    posthog.capture('quiz_answer', { question: questionId, answer: value, step: step + 1 })

    // Show interstitial after screen time (step 2) or after faith (step 4)
    if (step === 2) {
      setShowProof(false)
      setInterstitial('screen_time_stat')
      return
    }
    if (step === 4) {
      setShowProof(false)
      setInterstitial('video_peek')
      return
    }

    setProofIndex(Math.min(step, SOCIAL_PROOF.length - 1))
    setShowProof(true)

    setTimeout(() => {
      setShowProof(false)
      goToNextStep(newAnswers)
    }, 1200)
  }

  function goToNextStep(currentAnswers: Record<string, string>) {
    if (step < 6) {
      setDirection('forward')
      setAnimating(true)
      setTimeout(() => { setStep(step + 1); setAnimating(false) }, 300)
    } else {
      startBuild(currentAnswers)
    }
  }

  function dismissInterstitial() {
    setInterstitial(null)
    setDirection('forward')
    setAnimating(true)
    setTimeout(() => { setStep(step + 1); setAnimating(false) }, 300)
  }

  function goBack() {
    if (step <= 0) return
    setDirection('back')
    setAnimating(true)
    setTimeout(() => { setStep(step - 1); setAnimating(false) }, 300)
  }

  function startBuild(finalAnswers: Record<string, string>) {
    setBuilding(true)
    posthog.capture('quiz_completed', finalAnswers)
    let i = 0
    function nextBuildStep() {
      if (i < BUILD_STEPS.length) {
        setBuildStep(i)
        i++
        setTimeout(nextBuildStep, BUILD_STEPS[i - 1].duration)
      } else {
        setTimeout(() => { setBuilding(false); setShowResult(true) }, 400)
      }
    }
    nextBuildStep()
  }

  const progress = Math.max(0, ((step + 1) / 7) * 100)

  // ===== BUILDING SCREEN =====
  if (building) {
    return (
      <div className="quiz-page">
        <div className="build-screen">
          <div className="build-icon">✨</div>
          <h2>Building your child's personalized plan</h2>
          <div className="build-steps">
            {BUILD_STEPS.map((s, i) => (
              <div key={i} className={`build-step ${i < buildStep ? 'done' : i === buildStep ? 'active' : ''}`}>
                <div className="build-check">{i < buildStep ? '✓' : i === buildStep ? '...' : ''}</div>
                <span>{s.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ===== SCREEN TIME INTERSTITIAL =====
  if (interstitial === 'screen_time_stat') {
    const hrs = screenTimeValue === 0 ? 1 : screenTimeValue === 1 ? 1.5 : screenTimeValue === 2 ? 3 : 5
    const yearlyHrs = Math.round(hrs * 365)
    const fivePercent = Math.round(yearlyHrs * 0.05)

    return (
      <div className="quiz-page">
        <header className="quiz-header">
          <div className="quiz-logo"><img src="/logo.png" alt="Faithful Kids" className="quiz-logo-img" /> Faithful Kids</div>
        </header>
        <div className="quiz-progress"><div className="quiz-progress-bar" style={{ width: `${progress}%` }} /></div>
        <div className="quiz-body">
          <div className="q-card enter">
            <div className="interstitial-stat">
              <div className="inter-big-num">{yearlyHrs.toLocaleString()}</div>
              <div className="inter-label">hours of screen time per year</div>
            </div>
            <div className="inter-reframe">
              <p>What if just 5% of that was Scripture?</p>
              <div className="inter-highlight">
                <span className="inter-highlight-num">{fivePercent}</span>
                <span>hours of Bible stories per year</span>
              </div>
              <p className="inter-sub">That's enough to walk through the entire Bible, twice.</p>
            </div>
            <button className="btn-quiz-next" onClick={dismissInterstitial}>
              Continue →
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ===== VIDEO PEEK INTERSTITIAL =====
  if (interstitial === 'video_peek') {
    return (
      <div className="quiz-page">
        <header className="quiz-header">
          <div className="quiz-logo"><img src="/logo.png" alt="Faithful Kids" className="quiz-logo-img" /> Faithful Kids</div>
        </header>
        <div className="quiz-progress"><div className="quiz-progress-bar" style={{ width: `${progress}%` }} /></div>
        <div className="quiz-body">
          <div className="q-card enter">
            <p className="inter-eyebrow">A quick peek at what your kids could be watching</p>
            <div className="inter-video-wrap">
              <video src="https://d3g07v1w0lehiv.cloudfront.net/bible/birth-of-jesus-series/01-an-angel-visits-mary/lesson-video.mp4" autoPlay playsInline muted loop className="inter-video" />
            </div>
            <p className="inter-video-caption">This is a real story from Faithful Kids. 60 seconds of Scripture, beautifully told.</p>
            <button className="btn-quiz-next" onClick={dismissInterstitial}>
              Almost done — 2 questions left →
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ===== RESULT SCREEN =====
  if (showResult) {
    return <ResultPage answers={answers} minutes={minutes} seconds={seconds} />
  }

  // ===== QUESTIONS =====
  const questions: {
    id: string
    emoji: string
    question: string
    subtitle: string
    type: 'cards' | 'visual-grid' | 'logo-grid' | 'slider' | 'emotion'
    options?: { label: string; value: string; emoji: string; desc?: string }[]
  }[] = [
    {
      id: 'num_kids', emoji: '👨‍👩‍👧‍👦', type: 'cards',
      question: 'How many kids are in your family?',
      subtitle: 'We support up to 5 child profiles on one account.',
      options: [
        { label: '1 child', value: '1', emoji: '👧', desc: 'Just one' },
        { label: '2 children', value: '2', emoji: '👧👦', desc: 'A pair' },
        { label: '3 children', value: '3', emoji: '👧👦👶', desc: 'A full house' },
        { label: '4 or more', value: '4+', emoji: '👨‍👩‍👧‍👦', desc: 'A big beautiful family' },
      ],
    },
    {
      id: 'age', emoji: '🎂', type: 'cards',
      question: 'How old is your youngest who would watch?',
      subtitle: 'We\'ll match content to their age group.',
      options: [
        { label: '4-5', value: '4-5', emoji: '🌱', desc: 'Little Learner' },
        { label: '6-7', value: '6-7', emoji: '🌿', desc: 'Growing Mind' },
        { label: '8-9', value: '8-9', emoji: '🌳', desc: 'Explorer' },
        { label: '10-12', value: '10-12', emoji: '⭐', desc: 'Young Scholar' },
        { label: '12+', value: '12+', emoji: '🎓', desc: 'Teen' },
      ],
    },
    {
      id: 'screen_time', emoji: '📱', type: 'slider',
      question: 'How much screen time do your kids get each day?',
      subtitle: 'Slide to the closest estimate. No judgment.',
    },
    {
      id: 'current_content', emoji: '📺', type: 'logo-grid',
      question: 'What do your kids usually watch?',
      subtitle: 'Pick all that apply.',
      options: [
        { label: 'YouTube', value: 'youtube', emoji: 'yt' },
        { label: 'TikTok', value: 'tiktok', emoji: 'tt' },
        { label: 'Netflix', value: 'netflix', emoji: 'nf' },
        { label: 'Disney+', value: 'disney', emoji: 'dp' },
        { label: 'Games', value: 'games', emoji: '🎮' },
        { label: 'Other', value: 'other', emoji: '📱' },
      ],
    },
    {
      id: 'faith_importance', emoji: '✝️', type: 'emotion',
      question: 'How important is faith in your family?',
      subtitle: 'There\'s no wrong answer.',
      options: [
        { label: 'Central to everything', value: 'central', emoji: '🔥', desc: 'Faith guides every decision' },
        { label: 'Very important', value: 'very', emoji: '🙏', desc: 'A big part of our life' },
        { label: 'Somewhat important', value: 'somewhat', emoji: '💭', desc: 'We value it but don\'t always prioritize it' },
        { label: 'We\'re exploring', value: 'exploring', emoji: '🌱', desc: 'Just beginning our journey' },
      ],
    },
    {
      id: 'concern', emoji: '😔', type: 'cards',
      question: 'What keeps you up at night about screen time?',
      subtitle: 'Pick the one that hits hardest.',
      options: [
        { label: 'Zero value', value: 'no_value', emoji: '🗑️', desc: 'They watch junk and learn nothing' },
        { label: 'Too many hours', value: 'too_much', emoji: '⏰', desc: 'I can\'t get them to stop' },
        { label: 'Bad content', value: 'ads', emoji: '🚫', desc: 'Ads, violence, inappropriate stuff' },
        { label: 'Parent guilt', value: 'guilt', emoji: '💔', desc: 'I feel terrible every time I hand them the phone' },
      ],
    },
    {
      id: 'goal', emoji: '🎯', type: 'emotion',
      question: 'Last one! What would success look like?',
      subtitle: 'Pick the outcome that matters most to you.',
      options: [
        { label: 'Knows the Bible', value: 'knowledge', emoji: '📖', desc: 'My child can retell Bible stories confidently' },
        { label: 'Less junk screen time', value: 'replace', emoji: '📱', desc: 'Replace YouTube/TikTok with something better' },
        { label: 'Stronger faith', value: 'faith', emoji: '✝️', desc: 'Build a real relationship with God early' },
        { label: 'All of the above', value: 'all', emoji: '🌟', desc: 'I want it all' },
      ],
    },
  ]

  const q = questions[step]

  return (
    <div className="quiz-page">
      <header className="quiz-header">
        <div className="quiz-logo"><img src="/logo.png" alt="Faithful Kids" className="quiz-logo-img" /> Faithful Kids</div>
        <span className="quiz-step">{step + 1} of 7</span>
      </header>
      <div className="quiz-progress"><div className="quiz-progress-bar" style={{ width: `${progress}%` }} /></div>

      {/* Social proof overlay */}
      {showProof && (
        <div className="proof-toast">
          <span className="proof-toast-icon">✓</span>
          {SOCIAL_PROOF[proofIndex]}
        </div>
      )}

      <div className="quiz-body">
        <div className={`q-card ${animating ? (direction === 'forward' ? 'exit-left' : 'exit-right') : 'enter'}`}>
          <div className="q-emoji-big">{q.emoji}</div>
          <h1>{q.question}</h1>
          <p className="q-sub">{q.subtitle}</p>

          {/* CARDS TYPE */}
          {q.type === 'cards' && q.options && (
            <div className="q-cards">
              {q.options.map(opt => (
                <button key={opt.value} className="q-card-option" onClick={() => advance(q.id, opt.value)}>
                  <span className="q-card-emoji">{opt.emoji}</span>
                  <div className="q-card-text">
                    <strong>{opt.label}</strong>
                    {opt.desc && <span>{opt.desc}</span>}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* EMOTION TYPE */}
          {q.type === 'emotion' && q.options && (
            <div className="q-emotions">
              {q.options.map(opt => (
                <button key={opt.value} className="q-emotion-option" onClick={() => advance(q.id, opt.value)}>
                  <div className="q-emotion-emoji">{opt.emoji}</div>
                  <strong>{opt.label}</strong>
                  {opt.desc && <span className="q-emotion-desc">{opt.desc}</span>}
                </button>
              ))}
            </div>
          )}

          {/* VISUAL GRID TYPE */}
          {q.type === 'visual-grid' && q.options && (
            <VisualGrid options={q.options} onDone={(val) => advance(q.id, val)} />
          )}

          {/* LOGO GRID TYPE */}
          {q.type === 'logo-grid' && q.options && (
            <LogoGrid options={q.options} onDone={(val) => advance(q.id, val)} />
          )}

          {/* SLIDER TYPE */}
          {q.type === 'slider' && (
            <div className="q-slider-wrap">
              <div className="q-slider-labels">
                <span>{'< 1 hr'}</span>
                <span>1-2 hrs</span>
                <span>2-4 hrs</span>
                <span>4+ hrs</span>
              </div>
              <input
                type="range"
                min={0}
                max={3}
                step={1}
                value={screenTimeValue}
                onChange={e => setScreenTimeValue(Number(e.target.value))}
                className="q-slider"
              />
              <div className="q-slider-display">
                {['Less than 1 hour', '1-2 hours', '2-4 hours', '4+ hours'][screenTimeValue]}
              </div>
              <button className="btn-quiz-next" onClick={() => advance('screen_time', ['<1hr', '1-2hr', '2-4hr', '4hr+'][screenTimeValue])}>
                Continue →
              </button>
            </div>
          )}

          {step > 0 && <button className="quiz-back" onClick={goBack}>← Back</button>}
        </div>
      </div>
    </div>
  )
}

function PlatformLogo({ id }: { id: string }) {
  switch (id) {
    case 'yt': return (
      <svg viewBox="0 0 48 34" className="platform-logo">
        <path d="M47 10.4s-.5-3.2-1.9-4.6C43.2 3.8 41 3.8 40 3.7 33.4 3.2 24 3.2 24 3.2S14.6 3.2 8 3.7c-1 .1-3.2.1-5.1 2.1C1.5 7.2 1 10.4 1 10.4S.5 14.2.5 17.9v3.5c0 3.8.5 7.5.5 7.5s.5 3.2 1.9 4.6c1.9 2 4.4 1.9 5.5 2.1 4 .4 17 .5 17 .5s9.4 0 16-0.5c1-.1 3.2-.1 5.1-2.1 1.4-1.4 1.9-4.6 1.9-4.6s.5-3.8.5-7.5v-3.5c0-3.8-.5-7.5-.5-7.5z" fill="#FF0000"/>
        <path d="M19.2 23.6V12.2l9.8 5.7-9.8 5.7z" fill="#FFF"/>
      </svg>
    )
    case 'tt': return (
      <svg viewBox="0 0 48 48" className="platform-logo">
        <path d="M38.4 10.2c-2.4-1.5-4-4.2-4.2-7.2h-7.6v26.4c0 3.2-2.6 5.8-5.8 5.8s-5.8-2.6-5.8-5.8 2.6-5.8 5.8-5.8c.6 0 1.2.1 1.8.3V16c-.6-.1-1.2-.1-1.8-.1-7.4 0-13.4 6-13.4 13.4S13.4 42.7 20.8 42.7s13.4-6 13.4-13.4V17.8c2.8 2 6.2 3.2 9.8 3.2v-7.6c-2.2 0-4.2-.8-5.6-3.2z" fill="#000"/>
      </svg>
    )
    case 'nf': return (
      <svg viewBox="0 0 111 30" className="platform-logo">
        <path d="M105.1 14.2l6.5 15.8h-8.6l-4-10.1v10.1h-7V0h7v13.5L103.2 0h8.1l-6.2 14.2zM90 0v23.5c2 0 4-.2 5.5-.5V30c-2.6.5-8.5.5-8.5.5V0H90zm-9.3 0v30h-7.2V0h7.2zm-22.5 0h7.2v30h-5.4l-8.1-18.2V30H44.7V0h5.5L58.2 18V0zm-23.5 0v6.5h-6.5V30h-7V6.5h-6.5V0h20zm-21 0v6.5H9.5v5.3h8.4v6.3H9.5v5.4h4.2V30H2.3V0h11.4z" fill="#E50914"/>
      </svg>
    )
    case 'dp': return (
      <svg viewBox="0 0 48 48" className="platform-logo">
        <path d="M36.8 6H11.2C8.3 6 6 8.3 6 11.2v25.6C6 39.7 8.3 42 11.2 42h25.6c2.9 0 5.2-2.3 5.2-5.2V11.2C42 8.3 39.7 6 36.8 6z" fill="#113CCF"/>
        <path d="M15.6 31.2V16.8h5.6c3.8 0 5.6 2.2 5.6 5s-1.8 5-5.6 5h-2.4v4.4h-3.2zm3.2-7.2h2c1.8 0 2.8-.8 2.8-2.2s-1-2.2-2.8-2.2h-2v4.4z" fill="#FFF"/>
        <path d="M27.2 23.4h2v-2.6h1.6v2.6h2v1.4h-2v3.2c0 .6.2.8.8.8h1.2v1.4h-1.8c-1.4 0-1.8-.8-1.8-2V24.8h-1.6v-1.4h-.4z" fill="#FFF"/>
      </svg>
    )
    default: return <span className="platform-logo-emoji">{id}</span>
  }
}

function LogoGrid({ options, onDone }: { options: { label: string; value: string; emoji: string }[], onDone: (val: string) => void }) {
  const [selected, setSelected] = useState<string[]>([])

  function toggle(val: string) {
    setSelected(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val])
  }

  return (
    <>
      <div className="q-logo-grid">
        {options.map(opt => (
          <button
            key={opt.value}
            className={`q-logo-item ${selected.includes(opt.value) ? 'selected' : ''}`}
            onClick={() => toggle(opt.value)}
          >
            <PlatformLogo id={opt.emoji} />
            <span className="q-logo-label">{opt.label}</span>
            {selected.includes(opt.value) && <span className="q-logo-check">✓</span>}
          </button>
        ))}
      </div>
      <button className="btn-quiz-next" onClick={() => onDone(selected.join(','))} disabled={selected.length === 0}>
        Continue →
      </button>
    </>
  )
}

function VisualGrid({ options, onDone }: { options: { label: string; value: string; emoji: string }[], onDone: (val: string) => void }) {
  const [selected, setSelected] = useState<string[]>([])

  function toggle(val: string) {
    setSelected(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val])
  }

  return (
    <>
      <div className="q-visual-grid">
        {options.map(opt => (
          <button
            key={opt.value}
            className={`q-grid-item ${selected.includes(opt.value) ? 'selected' : ''}`}
            onClick={() => toggle(opt.value)}
          >
            <span className="q-grid-emoji">{opt.emoji}</span>
            <span className="q-grid-label">{opt.label}</span>
            {selected.includes(opt.value) && <span className="q-grid-check">✓</span>}
          </button>
        ))}
      </div>
      <button className="btn-quiz-next" onClick={() => onDone(selected.join(','))} disabled={selected.length === 0}>
        Continue →
      </button>
    </>
  )
}

function ResultPage({ answers, minutes, seconds }: {
  answers: Record<string, string>; minutes: number; seconds: number
}) {
  const ageLabel = answers.age || '6-7'
  const numKids = answers.num_kids || '1'

  function getConcern(c: string) {
    switch (c) {
      case 'no_value': return "Every Faithful Kids video teaches Scripture. No filler, no junk, no wasted minutes."
      case 'too_much': return "Built-in screen time controls let you set daily limits. When time's up, the app pauses gently."
      case 'ads': return "Zero ads, ever. No banners, no pre-rolls, no sponsored content. Just Bible stories."
      case 'guilt': return "This is screen time you'll actually feel good about. Your kids learn Scripture while you get a break."
      default: return "Faithful Kids replaces mindless scrolling with faithful storytelling."
    }
  }

  function getSeries(age: string, faith: string) {
    if (age === '4-5' || age === '6-7') {
      if (faith === 'exploring' || faith === 'somewhat') return { name: 'Genesis', desc: 'Start at the very beginning with Creation, Noah, and Abraham.', icon: '🌍' }
      return { name: 'Birth of Jesus', desc: 'The story of Christmas, told beautifully for young hearts.', icon: '⭐' }
    }
    if (faith === 'exploring' || faith === 'somewhat') return { name: 'Teachings of Jesus', desc: 'The parables and lessons that changed the world.', icon: '📖' }
    return { name: 'Rise of Kings', desc: 'David, Goliath, and the epic stories of Israel\'s kings.', icon: '👑' }
  }

  function getScreenMsg(st: string) {
    switch (st) {
      case '<1hr': return { time: 'under 1 hour', msg: 'Even 15 minutes a day means 5 Bible stories a week.' }
      case '1-2hr': return { time: '1-2 hours', msg: 'What if just 20 minutes of that was Scripture? 7 stories a week.' }
      case '2-4hr': return { time: '2-4 hours', msg: 'What if even 20 minutes of that fed their soul instead?' }
      case '4hr+': return { time: '4+ hours', msg: 'Swapping just 20 minutes for Bible stories changes everything.' }
      default: return { time: 'some time', msg: '' }
    }
  }

  const series = getSeries(answers.age, answers.faith_importance)
  const screen = getScreenMsg(answers.screen_time)
  const denomLabel = 'Christian'

  return (
    <div className="quiz-page">
      <header className="quiz-header">
        <div className="quiz-logo"><img src="/logo.png" alt="Faithful Kids" className="quiz-logo-img" /> Faithful Kids</div>
      </header>

      <div className="result-page">
        <div className="result-hero">
          <div className="result-badge-wrap">
            <span className="result-badge">✨ {numKids === '1' ? 'your child' : 'your kids'}'s plan is ready</span>
          </div>
          <h1>Here's {numKids === '1' ? 'your child' : 'your kids'}'s personalized Bible journey</h1>
          <p className="result-hero-sub">Based on your answers, we built a learning path made just for {numKids === '1' ? 'your child' : 'your kids'}.</p>
        </div>

        {/* Content depth stat */}
        <div className="result-depth">
          <span className="result-depth-num">400+</span>
          <span className="result-depth-label">lessons, quizzes, and activities across 20 series</span>
        </div>

        {/* Personalized insights */}
        <div className="result-section">
          <h2>What we learned about your family</h2>
          <div className="result-insights">
            <div className="r-insight">
              <div className="r-insight-icon">📱</div>
              <div>
                <strong>{numKids === '1' ? 'your child' : 'your kids'} gets {screen.time} of screen time daily</strong>
                <p>{screen.msg}</p>
              </div>
            </div>
            <div className="r-insight highlight">
              <div className="r-insight-icon">💡</div>
              <div>
                <strong>Your #1 concern</strong>
                <p>{getConcern(answers.concern)}</p>
              </div>
            </div>
            <div className="r-insight">
              <div className="r-insight-icon">🎯</div>
              <div>
                <strong>Your goal</strong>
                <p>{answers.goal === 'knowledge' ? 'You want your kids to know and retell Bible stories confidently. Our 200-lesson curriculum does exactly that, with quizzes after every story.'
                  : answers.goal === 'replace' ? 'You want to replace junk screen time with something better. Every minute on Faithful Kids is a minute not on YouTube.'
                  : answers.goal === 'faith' ? 'You want to build a real foundation of faith early. Our stories walk through the entire Bible, planting seeds that last a lifetime.'
                  : 'You want it all: Bible knowledge, less junk screen time, and stronger faith. That\'s exactly what Faithful Kids delivers.'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended series */}
        <div className="result-section">
          <h2>We recommend starting with</h2>
          <div className="rec-card">
            <div className="rec-left">
              <div className="rec-icon">{series.icon}</div>
              <div>
                <h3>{series.name} Series</h3>
                <p>{series.desc}</p>
                <div className="rec-tags">
                  <span>10 lessons</span>
                  <span>10 quizzes</span>
                  <span>Ages {ageLabel}</span>
                </div>
              </div>
            </div>
            <div className="rec-right">
              <video src="https://d3g07v1w0lehiv.cloudfront.net/bible/birth-of-jesus-series/01-an-angel-visits-mary/lesson-video.mp4" autoPlay muted loop playsInline />
            </div>
          </div>
        </div>

        {/* What's included */}
        <div className="result-section">
          <h2>{numKids === '1' ? 'your child' : 'your kids'}'s plan includes</h2>
          <div className="r-checklist">
            {[
              `200 video lessons, Genesis to Revelation`,
              `200 quizzes to make sure ${numKids === '1' ? 'your child' : 'your kids'} retains each story`,
              `Age-matched content for ${ageLabel} year olds`,
              `${denomLabel} content path`,
              `Screen time controls and parent dashboard`,
              `Zero ads, ever`,
              `Up to 5 child profiles`,
              `New stories added every week`,
            ].map(item => (
              <div key={item} className="r-check-row">
                <span className="r-check">✓</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="result-cta-block">
          <div className="result-timer-bar">
            This personalized plan expires in <strong>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</strong>
          </div>
          <button className="btn-result" onClick={() => {
            posthog.capture('quiz_cta_click', answers)
            window.location.href = '/checkout'
          }}>
            Start {numKids === '1' ? 'your child' : 'your kids'}'s Free 7-Day Trial
          </button>
          <div className="result-guarantees">
            <span>30-day money-back guarantee</span>
            <span>Cancel anytime</span>
            <span>No ads ever</span>
          </div>
        </div>

        {/* Testimonial */}
        <div className="result-testimonial">
          <div className="r-test-stars">★★★★★</div>
          <p>"My daughter asks for Bible stories instead of YouTube now. Best parenting decision I've made this year."</p>
          <span>— Maria S., mom of 3</span>
        </div>
      </div>
    </div>
  )
}
