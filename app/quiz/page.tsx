'use client'

import { useState, useEffect, useRef } from 'react'
import posthog from 'posthog-js'
import './quiz.css'

// ============================================================================
// Social proof messages — shown between questions
// ============================================================================
const SOCIAL_PROOF = [
  { text: '12,847 parents answered the same way', icon: '✓' },
  { text: 'You\'re in good company — most parents feel this way', icon: '✓' },
  { text: 'Great choice. This is the #1 answer.', icon: '✓' },
  { text: '92% of parents in our community said the same', icon: '✓' },
  { text: 'This matches most families who joined', icon: '✓' },
  { text: 'You\'re not alone. Most parents share this concern.', icon: '❤️' },
  { text: 'Perfect — we built something for exactly this', icon: '✨' },
  { text: 'Noted! We\'ll match this to your plan', icon: '📝' },
]

// ============================================================================
// Build animation steps — shown before results
// ============================================================================
const BUILD_STEPS = [
  { text: 'Analyzing your answers...', icon: '🔍', duration: 900 },
  { text: 'Matching content to your child\'s age...', icon: '👶', duration: 1000 },
  { text: 'Selecting your denomination path...', icon: '✝️', duration: 800 },
  { text: 'Building your personalized series order...', icon: '📚', duration: 1100 },
  { text: 'Adding quizzes and reflections...', icon: '📝', duration: 700 },
  { text: 'Calculating your family\'s starting point...', icon: '🧭', duration: 900 },
  { text: 'Almost there...', icon: '⏳', duration: 600 },
  { text: 'Your plan is ready!', icon: '🎉', duration: 400 },
]

// ============================================================================
// Live counter — simulates active users
// ============================================================================
function useLiveCount() {
  const [count, setCount] = useState(847)
  useEffect(() => {
    const t = setInterval(() => {
      setCount(c => c + (Math.random() > 0.5 ? 1 : -1))
    }, 3000 + Math.random() * 5000)
    return () => clearInterval(t)
  }, [])
  return count
}

// ============================================================================
// Quiz component
// ============================================================================
export default function Quiz() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [animating, setAnimating] = useState(false)
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')
  const [showProof, setShowProof] = useState(false)
  const [proofIndex, setProofIndex] = useState(0)
  const [building, setBuilding] = useState(false)
  const [buildStep, setBuildStep] = useState(0)
  const [buildPercent, setBuildPercent] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [screenTimeValue, setScreenTimeValue] = useState(2)
  const [interstitial, setInterstitial] = useState<'screen_time_stat' | 'video_peek' | null>(null)
  const [showEmailCapture, setShowEmailCapture] = useState(false)
  const [email, setEmail] = useState('')
  const liveCount = useLiveCount()

  useEffect(() => { posthog.capture('quiz_started') }, [])

  // ===== QUESTION FLOW =====
  function advance(questionId: string, value: string) {
    const newAnswers = { ...answers, [questionId]: value }
    setAnswers(newAnswers)
    posthog.capture('quiz_answer', { question: questionId, answer: value, step: step + 1 })

    // Interstitial after screen time question (step 2)
    if (step === 2) {
      setShowProof(false)
      setInterstitial('screen_time_stat')
      return
    }
    // Interstitial video peek after faith question (step 5)
    if (step === 5) {
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
    const totalQuestions = questions.length
    if (step < totalQuestions - 1) {
      setDirection('forward')
      setAnimating(true)
      setTimeout(() => { setStep(step + 1); setAnimating(false) }, 300)
    } else {
      // Show email capture before results
      setShowEmailCapture(true)
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

  function handleEmailSubmit() {
    if (email) {
      posthog.capture('quiz_email_captured', { email })
      posthog.identify(email, { email, quiz_answers: answers })
    }
    startBuild()
  }

  function skipEmail() {
    posthog.capture('quiz_email_skipped')
    startBuild()
  }

  function startBuild() {
    setShowEmailCapture(false)
    setBuilding(true)
    posthog.capture('quiz_completed', answers)
    let i = 0
    let percent = 0
    function nextBuildStep() {
      if (i < BUILD_STEPS.length) {
        setBuildStep(i)
        const targetPercent = Math.round(((i + 1) / BUILD_STEPS.length) * 100)
        // Animate percent
        const interval = setInterval(() => {
          percent += 1
          if (percent >= targetPercent) { clearInterval(interval) }
          setBuildPercent(Math.min(percent, 100))
        }, BUILD_STEPS[i].duration / (targetPercent - percent || 1))
        i++
        setTimeout(nextBuildStep, BUILD_STEPS[i - 1].duration)
      } else {
        setTimeout(() => { setBuilding(false); setShowResult(true) }, 600)
      }
    }
    nextBuildStep()
  }

  // ===== QUESTIONS =====
  const questions: {
    id: string; emoji: string; question: string; subtitle: string
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
      id: 'denomination', emoji: '⛪', type: 'cards',
      question: 'What\'s your faith tradition?',
      subtitle: 'We\'ll tailor the experience to your family\'s beliefs.',
      options: [
        { label: 'Catholic', value: 'catholic', emoji: '🕊️', desc: 'Roman Catholic tradition' },
        { label: 'Evangelical', value: 'evangelical', emoji: '📖', desc: 'Bible-centered faith' },
        { label: 'Non-denominational', value: 'nondenominational', emoji: '✝️', desc: 'Just Christian' },
        { label: 'Other / Exploring', value: 'other', emoji: '🌱', desc: 'Still finding our path' },
      ],
    },
    {
      id: 'faith_importance', emoji: '🙏', type: 'emotion',
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

  const totalQuestions = questions.length
  const progress = Math.max(0, ((step + 1) / totalQuestions) * 100)

  // ===== EMAIL CAPTURE =====
  if (showEmailCapture) {
    return (
      <div className="quiz-page">
        <header className="quiz-header">
          <div className="quiz-logo"><img src="/logo.png" alt="Faithful Kids" className="quiz-logo-img" /> Faithful Kids</div>
        </header>
        <div className="quiz-progress"><div className="quiz-progress-bar" style={{ width: '100%' }} /></div>
        <div className="quiz-body">
          <div className="q-card enter">
            <div className="q-emoji-big">📬</div>
            <h1>Where should we send your personalized plan?</h1>
            <p className="q-sub">We&apos;ll email your results so you can review them anytime.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && email.includes('@') && handleEmailSubmit()}
                placeholder="your@email.com"
                autoFocus
                style={{
                  width: '100%', padding: '16px', border: '2px solid #e5e7eb', borderRadius: '12px',
                  fontSize: '1rem', outline: 'none', textAlign: 'center', fontWeight: 600,
                }}
              />
              <button
                className="btn-quiz-next"
                onClick={handleEmailSubmit}
                disabled={!email.includes('@')}
              >
                Show My Results →
              </button>
              <button className="quiz-back" onClick={skipEmail}>
                Skip for now
              </button>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '16px' }}>
              🔒 No spam, ever. We respect your privacy.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ===== BUILDING SCREEN =====
  if (building) {
    return (
      <div className="quiz-page">
        <div className="build-screen">
          <div className="build-progress-ring">
            <svg viewBox="0 0 120 120" style={{ width: '120px', height: '120px' }}>
              <circle cx="60" cy="60" r="54" fill="none" stroke="#e5e7eb" strokeWidth="8" />
              <circle cx="60" cy="60" r="54" fill="none" stroke="#e07a5f" strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 54}`}
                strokeDashoffset={`${2 * Math.PI * 54 * (1 - buildPercent / 100)}`}
                style={{ transition: 'stroke-dashoffset 0.3s ease', transform: 'rotate(-90deg)', transformOrigin: 'center' }}
              />
            </svg>
            <div className="build-percent">{buildPercent}%</div>
          </div>
          <h2>Building your family&apos;s personalized plan</h2>
          <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '28px' }}>This usually takes a few seconds...</p>
          <div className="build-steps">
            {BUILD_STEPS.map((s, i) => (
              <div key={i} className={`build-step ${i < buildStep ? 'done' : i === buildStep ? 'active' : ''}`}>
                <div className="build-check">{i < buildStep ? '✓' : i === buildStep ? s.icon : ''}</div>
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
              <p>What if just <strong>5%</strong> of that was Scripture?</p>
              <div className="inter-highlight">
                <span className="inter-highlight-num">{fivePercent}</span>
                <span>hours of Bible stories per year</span>
              </div>
              <p className="inter-sub">That&apos;s enough to walk through the entire Bible, twice.</p>
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
            <p className="inter-eyebrow">A quick peek at what your kids could be watching right now</p>
            <div className="inter-video-wrap">
              <video src="https://d3g07v1w0lehiv.cloudfront.net/bible/birth-of-jesus-series/01-an-angel-visits-mary/lesson-video.mp4" autoPlay playsInline muted loop className="inter-video" />
            </div>
            <p className="inter-video-caption">This is a real story from Faithful Kids. Jesus narrates every lesson.</p>
            <div style={{ background: '#f0fdf4', borderRadius: '12px', padding: '12px 16px', marginBottom: '16px', fontSize: '0.85rem', color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>👁️</span> {liveCount} families are watching right now
            </div>
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
    return <ResultPage answers={answers} email={email} liveCount={liveCount} />
  }

  // ===== QUESTIONS =====
  const q = questions[step]

  return (
    <div className="quiz-page">
      <header className="quiz-header">
        <div className="quiz-logo"><img src="/logo.png" alt="Faithful Kids" className="quiz-logo-img" /> Faithful Kids</div>
        <span className="quiz-step">{step + 1} of {totalQuestions}</span>
      </header>
      <div className="quiz-progress"><div className="quiz-progress-bar" style={{ width: `${progress}%` }} /></div>

      {showProof && (
        <div className="proof-toast">
          <span className="proof-toast-icon">{SOCIAL_PROOF[proofIndex].icon}</span>
          {SOCIAL_PROOF[proofIndex].text}
        </div>
      )}

      <div className="quiz-body">
        <div className={`q-card ${animating ? (direction === 'forward' ? 'exit-left' : 'exit-right') : 'enter'}`}>
          <div className="q-emoji-big">{q.emoji}</div>
          <h1>{q.question}</h1>
          <p className="q-sub">{q.subtitle}</p>

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

          {q.type === 'logo-grid' && q.options && (
            <LogoGrid options={q.options} onDone={(val) => advance(q.id, val)} />
          )}

          {q.type === 'slider' && (
            <div className="q-slider-wrap">
              <div className="q-slider-labels">
                <span>{'< 1 hr'}</span>
                <span>1-2 hrs</span>
                <span>2-4 hrs</span>
                <span>4+ hrs</span>
              </div>
              <input type="range" min={0} max={3} step={1} value={screenTimeValue}
                onChange={e => setScreenTimeValue(Number(e.target.value))} className="q-slider" />
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

// ============================================================================
// Sub-components
// ============================================================================

function PlatformLogo({ id }: { id: string }) {
  switch (id) {
    case 'yt': return <svg viewBox="0 0 48 34" className="platform-logo"><path d="M47 10.4s-.5-3.2-1.9-4.6C43.2 3.8 41 3.8 40 3.7 33.4 3.2 24 3.2 24 3.2S14.6 3.2 8 3.7c-1 .1-3.2.1-5.1 2.1C1.5 7.2 1 10.4 1 10.4S.5 14.2.5 17.9v3.5c0 3.8.5 7.5.5 7.5s.5 3.2 1.9 4.6c1.9 2 4.4 1.9 5.5 2.1 4 .4 17 .5 17 .5s9.4 0 16-0.5c1-.1 3.2-.1 5.1-2.1 1.4-1.4 1.9-4.6 1.9-4.6s.5-3.8.5-7.5v-3.5c0-3.8-.5-7.5-.5-7.5z" fill="#FF0000"/><path d="M19.2 23.6V12.2l9.8 5.7-9.8 5.7z" fill="#FFF"/></svg>
    case 'tt': return <svg viewBox="0 0 48 48" className="platform-logo"><path d="M38.4 10.2c-2.4-1.5-4-4.2-4.2-7.2h-7.6v26.4c0 3.2-2.6 5.8-5.8 5.8s-5.8-2.6-5.8-5.8 2.6-5.8 5.8-5.8c.6 0 1.2.1 1.8.3V16c-.6-.1-1.2-.1-1.8-.1-7.4 0-13.4 6-13.4 13.4S13.4 42.7 20.8 42.7s13.4-6 13.4-13.4V17.8c2.8 2 6.2 3.2 9.8 3.2v-7.6c-2.2 0-4.2-.8-5.6-3.2z" fill="#000"/></svg>
    case 'nf': return <svg viewBox="0 0 111 30" className="platform-logo"><path d="M105.1 14.2l6.5 15.8h-8.6l-4-10.1v10.1h-7V0h7v13.5L103.2 0h8.1l-6.2 14.2zM90 0v23.5c2 0 4-.2 5.5-.5V30c-2.6.5-8.5.5-8.5.5V0H90zm-9.3 0v30h-7.2V0h7.2zm-22.5 0h7.2v30h-5.4l-8.1-18.2V30H44.7V0h5.5L58.2 18V0zm-23.5 0v6.5h-6.5V30h-7V6.5h-6.5V0h20zm-21 0v6.5H9.5v5.3h8.4v6.3H9.5v5.4h4.2V30H2.3V0h11.4z" fill="#E50914"/></svg>
    case 'dp': return <svg viewBox="0 0 48 48" className="platform-logo"><path d="M36.8 6H11.2C8.3 6 6 8.3 6 11.2v25.6C6 39.7 8.3 42 11.2 42h25.6c2.9 0 5.2-2.3 5.2-5.2V11.2C42 8.3 39.7 6 36.8 6z" fill="#113CCF"/><path d="M15.6 31.2V16.8h5.6c3.8 0 5.6 2.2 5.6 5s-1.8 5-5.6 5h-2.4v4.4h-3.2zm3.2-7.2h2c1.8 0 2.8-.8 2.8-2.2s-1-2.2-2.8-2.2h-2v4.4z" fill="#FFF"/></svg>
    default: return <span className="platform-logo-emoji">{id}</span>
  }
}

function LogoGrid({ options, onDone }: { options: { label: string; value: string; emoji: string }[], onDone: (val: string) => void }) {
  const [selected, setSelected] = useState<string[]>([])
  return (
    <>
      <div className="q-logo-grid">
        {options.map(opt => (
          <button key={opt.value} className={`q-logo-item ${selected.includes(opt.value) ? 'selected' : ''}`}
            onClick={() => setSelected(prev => prev.includes(opt.value) ? prev.filter(v => v !== opt.value) : [...prev, opt.value])}>
            <PlatformLogo id={opt.emoji} />
            <span className="q-logo-label">{opt.label}</span>
            {selected.includes(opt.value) && <span className="q-logo-check">✓</span>}
          </button>
        ))}
      </div>
      <button className="btn-quiz-next" onClick={() => onDone(selected.join(','))} disabled={selected.length === 0}>Continue →</button>
    </>
  )
}

// ============================================================================
// Result page — the money page
// ============================================================================
function ResultPage({ answers, email, liveCount }: {
  answers: Record<string, string>; email: string; liveCount: number
}) {
  const [minutes, setMinutes] = useState(9)
  const [seconds, setSeconds] = useState(59)
  const stickyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const t = setInterval(() => {
      setSeconds(s => { if (s === 0) { setMinutes(m => m === 0 ? 9 : m - 1); return 59 } return s - 1 })
    }, 1000)
    return () => clearInterval(t)
  }, [])

  const numKids = answers.num_kids || '1'
  const kidsWord = numKids === '1' ? 'your child' : 'your kids'
  const ageLabel = answers.age || '6-7'

  function getConcern(c: string) {
    switch (c) {
      case 'no_value': return { title: 'Screen time with zero value', fix: 'Every Faithful Kids video teaches Scripture. No filler, no junk, no wasted minutes. Your kids learn something real every single session.' }
      case 'too_much': return { title: 'Too many hours of mindless watching', fix: 'Built-in daily limits and a parent dashboard let you control exactly how much they watch. When time\'s up, the app pauses gently.' }
      case 'ads': return { title: 'Bad content, ads, and inappropriate material', fix: 'Zero ads, ever. No banners, no pre-rolls, no sponsored content. Every video is doctrinally reviewed and age-appropriate.' }
      case 'guilt': return { title: 'Parent guilt every time you hand them the phone', fix: 'This is screen time you\'ll actually feel good about. Your kids learn Scripture while you get a well-deserved break.' }
      default: return { title: 'Meaningless screen time', fix: 'Faithful Kids replaces mindless scrolling with faithful storytelling.' }
    }
  }

  function getSeries() {
    if (ageLabel === '4-5' || ageLabel === '6-7') return { name: 'Genesis', desc: 'Start at the very beginning with Creation, Noah, and Abraham.', icon: '🌍' }
    if (answers.faith_importance === 'exploring' || answers.faith_importance === 'somewhat') return { name: 'Teachings of Jesus', desc: 'The parables and lessons that changed the world.', icon: '📖' }
    return { name: 'Birth of Jesus', desc: 'The story of Christmas — told beautifully for young hearts.', icon: '⭐' }
  }

  function getScreenMsg() {
    switch (answers.screen_time) {
      case '<1hr': return { time: 'under 1 hour', msg: 'Even 15 minutes a day means 5 Bible stories a week — 260 per year.' }
      case '1-2hr': return { time: '1-2 hours', msg: 'What if just 20 minutes was Scripture? That\'s 7 stories a week — more than most adults read.' }
      case '2-4hr': return { time: '2-4 hours', msg: 'Swapping just 20 minutes for Bible stories means your kids know more Scripture than most adults by age 10.' }
      case '4hr+': return { time: '4+ hours', msg: 'Just 20 minutes out of 4+ hours. That tiny swap changes everything about what they carry into adulthood.' }
      default: return { time: 'some time', msg: '' }
    }
  }

  const concern = getConcern(answers.concern)
  const series = getSeries()
  const screen = getScreenMsg()

  const TESTIMONIALS = [
    { name: 'Maria S.', role: 'Mom of 3', quote: 'My daughter asks for Bible stories instead of YouTube now. Best parenting decision I\'ve made this year.', rating: 5 },
    { name: 'James T.', role: 'Dad of 2', quote: 'My boys are actually LEARNING the Bible. They retell the stories at dinner. I almost cried the first time.', rating: 5 },
    { name: 'Sarah K.', role: 'Mom of 1', quote: 'Finally, screen time I don\'t feel guilty about. My son loves the quizzes — he gets so competitive!', rating: 5 },
    { name: 'David R.', role: 'Dad of 4', quote: 'We tried 3 other Bible apps. This is the only one my kids actually want to open every day.', rating: 5 },
  ]

  function handleCTA() {
    posthog.capture('quiz_cta_click', { ...answers, email })
    window.location.href = '/checkout'
  }

  return (
    <div className="quiz-page" style={{ background: '#fff' }}>
      <header className="quiz-header">
        <div className="quiz-logo"><img src="/logo.png" alt="Faithful Kids" className="quiz-logo-img" /> Faithful Kids</div>
      </header>

      <div className="result-page">
        {/* Hero */}
        <div className="result-hero">
          <div style={{ background: '#f0fdf4', borderRadius: '24px', padding: '6px 16px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 700, color: '#16a34a', marginBottom: '14px' }}>
            <span>✨</span> {kidsWord}&apos;s personalized plan is ready
          </div>
          <h1>Here&apos;s what we built for your family</h1>
          <p className="result-hero-sub">Based on your {Object.keys(answers).length} answers, here&apos;s your custom Bible learning path.</p>
        </div>

        {/* Live counter */}
        <div style={{ textAlign: 'center', padding: '12px', background: '#fef3c7', borderRadius: '12px', marginBottom: '24px', fontSize: '0.85rem', fontWeight: 600, color: '#92400e' }}>
          🔥 {liveCount} families are taking this quiz right now
        </div>

        {/* Before / After */}
        <div className="result-section">
          <h2>Your family: before vs. after</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ background: '#fef2f2', borderRadius: '14px', padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>😔</div>
              <div style={{ fontWeight: 800, color: '#991b1b', fontSize: '0.9rem', marginBottom: '4px' }}>Without Faithful Kids</div>
              <p style={{ fontSize: '0.8rem', color: '#7f1d1d', lineHeight: 1.5, margin: 0 }}>{screen.time} of mindless content daily. No Scripture. No values. Just noise.</p>
            </div>
            <div style={{ background: '#f0fdf4', borderRadius: '14px', padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🌟</div>
              <div style={{ fontWeight: 800, color: '#166534', fontSize: '0.9rem', marginBottom: '4px' }}>With Faithful Kids</div>
              <p style={{ fontSize: '0.8rem', color: '#14532d', lineHeight: 1.5, margin: 0 }}>{screen.msg}</p>
            </div>
          </div>
        </div>

        {/* Your #1 concern — addressed */}
        <div className="result-section">
          <h2>We heard you: &ldquo;{concern.title}&rdquo;</h2>
          <div style={{ background: '#fdf0ea', border: '2px solid #e07a5f', borderRadius: '14px', padding: '20px' }}>
            <p style={{ margin: 0, fontSize: '0.92rem', color: '#7c2d12', lineHeight: 1.6 }}>{concern.fix}</p>
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

        {/* Content depth */}
        <div className="result-depth">
          <span className="result-depth-num">400+</span>
          <span className="result-depth-label">lessons, quizzes, and reflections across 20+ series</span>
        </div>

        {/* What's included */}
        <div className="result-section">
          <h2>{kidsWord}&apos;s plan includes</h2>
          <div className="r-checklist">
            {[
              '200 video lessons narrated by Jesus, Genesis to Revelation',
              `200 fun quizzes to lock in every story`,
              `Age-matched content for ${ageLabel} year olds`,
              `${answers.denomination === 'catholic' ? 'Catholic' : answers.denomination === 'evangelical' ? 'Evangelical' : 'Christian'} content path`,
              'Parent dashboard with screen time controls',
              'Zero ads — not now, not ever',
              'Up to 5 child profiles on one account',
              'New stories added regularly',
            ].map(item => (
              <div key={item} className="r-check-row">
                <span className="r-check">✓</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Comparison table */}
        <div className="result-section">
          <h2>How we compare</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ textAlign: 'left', padding: '10px 8px', color: '#9ca3af', fontWeight: 600 }}></th>
                  <th style={{ padding: '10px 8px', color: '#e07a5f', fontWeight: 800 }}>Faithful Kids</th>
                  <th style={{ padding: '10px 8px', color: '#9ca3af', fontWeight: 600 }}>YouTube Kids</th>
                  <th style={{ padding: '10px 8px', color: '#9ca3af', fontWeight: 600 }}>Other Apps</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Bible curriculum', '✅ 200 lessons', '❌', '⚠️ Limited'],
                  ['Video + Quiz + Reflect', '✅', '❌', '❌'],
                  ['Narrated by Jesus', '✅', '❌', '❌'],
                  ['Zero ads', '✅', '❌', '⚠️'],
                  ['Parent controls', '✅', '⚠️', '⚠️'],
                  ['Progress tracking', '✅', '❌', '⚠️'],
                  ['Multi-kid profiles', '✅ Up to 5', '✅', '❌'],
                ].map(([feature, fk, yt, other]) => (
                  <tr key={feature as string} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '10px 8px', fontWeight: 600, color: '#4b5563' }}>{feature}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 700 }}>{fk}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'center' }}>{yt}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'center' }}>{other}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Testimonials */}
        <div className="result-section">
          <h2>What parents are saying</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="result-testimonial">
                <div className="r-test-stars">{'★'.repeat(t.rating)}</div>
                <p>&ldquo;{t.quote}&rdquo;</p>
                <span>— {t.name}, {t.role}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Money-back guarantee */}
        <div style={{ textAlign: 'center', background: '#f0fdf4', borderRadius: '14px', padding: '24px', marginBottom: '32px' }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🛡️</div>
          <div style={{ fontWeight: 800, color: '#166534', fontSize: '1rem', marginBottom: '6px' }}>30-Day Money-Back Guarantee</div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#14532d', lineHeight: 1.5 }}>If your kids don&apos;t love it, we&apos;ll refund every penny. No questions asked. You have nothing to lose.</p>
        </div>

        {/* Main CTA */}
        <div className="result-cta-block">
          <div className="result-timer-bar">
            Your personalized plan is reserved for <strong>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</strong>
          </div>
          <button className="btn-result" onClick={handleCTA}>
            Start {kidsWord}&apos;s Free 7-Day Trial →
          </button>
          <div className="result-guarantees">
            <span>7-day free trial</span>
            <span>30-day money-back guarantee</span>
            <span>Cancel anytime</span>
            <span>No ads ever</span>
          </div>
          <p style={{ textAlign: 'center', margin: '12px 0 0', fontSize: '0.82rem', color: '#9ca3af' }}>
            Already have an account? <a href="https://app.faithfulkids.app/login" style={{ color: '#e07a5f', fontWeight: 700, textDecoration: 'none' }}>Sign in</a>
          </p>
        </div>
      </div>

      {/* Sticky bottom CTA */}
      <div ref={stickyRef} style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(10px)', borderTop: '1px solid #e5e7eb', padding: '12px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', zIndex: 100
      }}>
        <div style={{ fontSize: '0.78rem', color: '#4b5563', fontWeight: 600 }}>
          <span style={{ color: '#e07a5f', fontWeight: 800 }}>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span> left
        </div>
        <button onClick={handleCTA} style={{
          background: '#e07a5f', color: 'white', border: 'none', borderRadius: '10px',
          padding: '12px 24px', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(224,122,95,0.3)',
        }}>
          Start Free Trial →
        </button>
      </div>
    </div>
  )
}
