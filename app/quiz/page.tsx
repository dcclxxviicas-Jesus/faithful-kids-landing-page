'use client'

import { useState, useEffect } from 'react'
import posthog from 'posthog-js'
import { useTimer } from '../use-timer'
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

const BUILD_STEPS = [
  { text: 'Analyzing your answers', icon: '🔍', ms: 900 },
  { text: 'Matching content to age group', icon: '👶', ms: 1000 },
  { text: 'Selecting denomination path', icon: '⛪', ms: 800 },
  { text: 'Building personalized series order', icon: '📚', ms: 1100 },
  { text: 'Adding quizzes and reflections', icon: '📝', ms: 700 },
  { text: 'Calculating starting point', icon: '🧭', ms: 900 },
  { text: 'Finalizing your plan', icon: '✨', ms: 600 },
]

// Questions — all single-tap, no typing
const QUESTIONS: {
  id: string; emoji: string; q: string; sub: string
  type: 'single' | 'multi' | 'slider' | 'scale'
  opts?: { label: string; val: string; emoji: string; sub?: string }[]
  interstitialAfter?: 'screen_time' | 'video'
}[] = [
  {
    id: 'num_kids', emoji: '👨‍👩‍👧‍👦', type: 'single',
    q: 'How many kids are in your family?',
    sub: 'We support up to 5 profiles on one account',
    opts: [
      { label: '1 child', val: '1', emoji: '👧' },
      { label: '2 children', val: '2', emoji: '👧👦' },
      { label: '3 children', val: '3', emoji: '👧👦👶' },
      { label: '4 or more', val: '4+', emoji: '👨‍👩‍👧‍👦' },
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

// ============================================================================
// Component
// ============================================================================

export default function Quiz() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [anim, setAnim] = useState<'enter' | 'exit'>('enter')
  const [proof, setProof] = useState<string | null>(null)
  const [inter, setInter] = useState<'screen_time' | 'video' | null>(null)
  const [phase, setPhase] = useState<'quiz' | 'build' | 'result'>('quiz')
  const [buildIdx, setBuildIdx] = useState(0)
  const [buildPct, setBuildPct] = useState(0)
  const [liveCount] = useState(Math.floor(780 + Math.random() * 200))

  useEffect(() => { posthog.capture('quiz_started') }, [])

  const total = QUESTIONS.length
  const q = QUESTIONS[step]
  const pct = ((step + 1) / total) * 100

  function pick(val: string) {
    const next = { ...answers, [q.id]: val }
    setAnswers(next)
    posthog.capture('quiz_answer', { question: q.id, answer: val, step })

    // Social proof flash
    setProof(PROOF[Math.min(step, PROOF.length - 1)])
    setTimeout(() => setProof(null), 1400)

    // Interstitial?
    if (q.interstitialAfter) {
      setTimeout(() => setInter(q.interstitialAfter!), 800)
      return
    }

    // Next or build
    setTimeout(() => advance(next), 800)
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
    posthog.capture('quiz_completed', a)
    let i = 0, pct = 0
    function tick() {
      if (i >= BUILD_STEPS.length) { setTimeout(() => setPhase('result'), 500); return }
      setBuildIdx(i)
      const target = Math.round(((i + 1) / BUILD_STEPS.length) * 100)
      const interval = setInterval(() => {
        pct++
        setBuildPct(Math.min(pct, 100))
        if (pct >= target) clearInterval(interval)
      }, BUILD_STEPS[i].ms / Math.max(target - pct, 1))
      i++
      setTimeout(tick, BUILD_STEPS[i - 1].ms)
    }
    tick()
  }

  // ===== BUILD =====
  if (phase === 'build') {
    return (
      <div className="qz">
        <div className="qz-build">
          <div className="qz-ring">
            <svg viewBox="0 0 120 120" width="130" height="130">
              <circle cx="60" cy="60" r="52" fill="none" stroke="#f3f4f6" strokeWidth="8" />
              <circle cx="60" cy="60" r="52" fill="none" stroke="#7B61FF" strokeWidth="8" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 52}`}
                strokeDashoffset={`${2 * Math.PI * 52 * (1 - buildPct / 100)}`}
                style={{ transition: 'stroke-dashoffset 0.2s', transform: 'rotate(-90deg)', transformOrigin: 'center' }} />
            </svg>
            <span className="qz-ring-num">{buildPct}%</span>
          </div>
          <h2>Building your family&apos;s plan</h2>
          <p className="qz-build-sub">Hang tight — personalizing for your answers...</p>
          <div className="qz-build-list">
            {BUILD_STEPS.map((s, i) => (
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
    return <Result answers={answers} liveCount={liveCount} />
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
    return (
      <div className="qz">
        <div className="qz-bar"><div className="qz-bar-fill" style={{ width: `${pct}%` }} /></div>
        <div className="qz-body">
          <div className="qz-card enter">
            <p className="qz-eyebrow">A peek at what your kids could be watching</p>
            <div className="qz-vid-wrap">
              <video src="https://d3g07v1w0lehiv.cloudfront.net/bible/birth-of-jesus-series/01-an-angel-visits-mary/lesson-video.mp4" autoPlay playsInline muted loop />
            </div>
            <p className="qz-vid-cap">Real lesson from Faithful Kids. Jesus narrates every story.</p>
            <div className="qz-live-pill">👁️ {liveCount} families watching right now</div>
            <button className="qz-btn" onClick={dismissInter}>Almost done — 2 left</button>
          </div>
        </div>
      </div>
    )
  }

  // ===== QUESTIONS =====
  return (
    <div className="qz">
      <div className="qz-head">
        <img src="/logo.png" alt="" className="qz-logo" />
        <span className="qz-count">{step + 1}/{total}</span>
      </div>
      <div className="qz-bar"><div className="qz-bar-fill" style={{ width: `${pct}%` }} /></div>

      {proof && <div className="qz-proof"><span>✓</span> {proof}</div>}

      <div className="qz-body">
        <div className={`qz-card ${anim}`}>
          <div className="qz-emoji">{q.emoji}</div>
          <h1 className="qz-q">{q.q}</h1>
          <p className="qz-sub">{q.sub}</p>

          {q.type === 'single' && q.opts && (
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
const PLANS = [
  { id: 'annual', name: '12-Month', price: 9.99, total: 119.88, period: '/mo', savings: 75, label: 'Best Value', weekly: 2.31 },
  { id: 'quarterly', name: '4-Month', price: 19.99, total: 79.96, period: '/mo', savings: 50, label: 'Most Popular', weekly: 4.62 },
  { id: 'monthly', name: '1-Month', price: 39.99, total: 39.99, period: '/mo', savings: null, label: null, weekly: 9.24 },
]

function Result({ answers, liveCount }: { answers: Record<string, string>; liveCount: number }) {
  const { minutes: min, seconds: sec, display: timerDisplay } = useTimer()
  const [selectedPlan, setSelectedPlan] = useState('annual')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
  }, [])

  const kids = answers.num_kids === '1' ? 'your child' : 'your kids'
  const age = answers.age || '6-7'
  const denom = answers.denomination === 'catholic' ? 'Catholic' : answers.denomination === 'evangelical' ? 'Evangelical' : 'Christian'

  const painMap: Record<string, { t: string; fix: string }> = {
    no_value: { t: 'They watch junk and learn nothing', fix: 'Every Faithful Kids video teaches real Scripture. No filler. No junk. No wasted minutes.' },
    too_much: { t: 'Way too many hours of screens', fix: 'Built-in daily limits and a parent dashboard. You control the experience. When time\'s up, it pauses gently.' },
    bad_content: { t: 'Inappropriate content everywhere', fix: 'Zero ads. Zero violence. Zero inappropriate content. Every video is reviewed and age-appropriate.' },
    guilt: { t: 'The guilt of handing them a screen', fix: 'This is screen time you\'ll feel GOOD about. Your kids learn God\'s Word while you get a break you deserve.' },
  }
  const pain = painMap[answers.pain] || painMap.guilt

  const screenMap: Record<string, string> = {
    '<1hr': 'Even 15 minutes a day = 5 Bible stories a week. 260 per year.',
    '1-2hr': 'Swap just 20 minutes. 7 stories a week. More than most adults read.',
    '2-4hr': '20 minutes out of 3 hours. Your kids know more Scripture by age 10 than most adults.',
    '4hr+': '20 minutes out of 4+ hours. That tiny swap changes what they carry into adulthood.',
  }

  async function handleCheckout() {
    setLoading(true)
    posthog.capture('quiz_checkout_click', { ...answers, plan: selectedPlan })
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selectedPlan }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setLoading(false)
      }
    } catch {
      setLoading(false)
    }
  }

  return (
    <div className="qz qz-result-bg">
      <div className="qz-head"><img src="/logo.png" alt="" className="qz-logo" /></div>

      <div className="qz-result">
        {/* Hero */}
        <div className="qz-r-hero">
          <div className="qz-r-badge">✨ {kids}&apos;s plan is ready</div>
          <h1>Your family&apos;s personalized<br />Bible journey</h1>
          <p>{Object.keys(answers).length} answers analyzed. Here&apos;s what we built.</p>
        </div>

        {/* Live */}
        <div className="qz-r-live">🔥 {liveCount} families taking this quiz right now</div>

        {/* Before / After */}
        <div className="qz-r-section">
          <div className="qz-r-compare">
            <div className="qz-r-before">
              <div className="qz-r-compare-emoji">😔</div>
              <strong>Without</strong>
              <p>Hours of mindless content. No Scripture. No values. Just noise.</p>
            </div>
            <div className="qz-r-after">
              <div className="qz-r-compare-emoji">🌟</div>
              <strong>With Faithful Kids</strong>
              <p>{screenMap[answers.screen_time] || screenMap['2-4hr']}</p>
            </div>
          </div>
        </div>

        {/* Pain point */}
        <div className="qz-r-section">
          <h2>We heard you</h2>
          <div className="qz-r-pain">
            <div className="qz-r-pain-title">&ldquo;{pain.t}&rdquo;</div>
            <p>{pain.fix}</p>
          </div>
        </div>

        {/* Video preview */}
        <div className="qz-r-section">
          <h2>See it in action</h2>
          <div className="qz-vid-wrap">
            <video src="https://d3g07v1w0lehiv.cloudfront.net/bible/birth-of-jesus-series/01-an-angel-visits-mary/lesson-video.mp4" autoPlay muted loop playsInline />
          </div>
        </div>

        {/* Stats */}
        <div className="qz-r-stats">
          <div className="qz-r-stat"><div className="qz-r-stat-num">400+</div><div>lessons</div></div>
          <div className="qz-r-stat"><div className="qz-r-stat-num">200</div><div>quizzes</div></div>
          <div className="qz-r-stat"><div className="qz-r-stat-num">20+</div><div>series</div></div>
        </div>

        {/* Checklist */}
        <div className="qz-r-section">
          <h2>What {kids} gets</h2>
          <div className="qz-r-checks">
            {[
              'Video lessons narrated by Jesus',
              `Content matched for ages ${age}`,
              `${denom} learning path`,
              'Fun quizzes after every story',
              'Parent dashboard + controls',
              'Zero ads — forever',
              'Up to 5 kid profiles',
              '30-day money-back guarantee',
            ].map(t => <div key={t} className="qz-r-check"><span>✓</span>{t}</div>)}
          </div>
        </div>

        {/* Testimonials */}
        <div className="qz-r-section">
          <h2>Parents love it</h2>
          <div className="qz-r-testimonials">
            {[
              { q: 'My daughter asks for Bible stories instead of YouTube now.', n: 'Maria S.', r: 'Mom of 3' },
              { q: 'My boys retell the stories at dinner. I almost cried the first time.', n: 'James T.', r: 'Dad of 2' },
              { q: 'Finally, screen time I don\'t feel guilty about.', n: 'Sarah K.', r: 'Mom of 1' },
            ].map(t => (
              <div key={t.n} className="qz-r-test">
                <div className="qz-r-test-stars">★★★★★</div>
                <p>&ldquo;{t.q}&rdquo;</p>
                <span>— {t.n}, {t.r}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Guarantee */}
        <div className="qz-r-guarantee">
          <div>🛡️</div>
          <div>
            <strong>30-Day Money-Back Guarantee</strong>
            <p>If {kids} doesn&apos;t love it, full refund. No questions asked.</p>
          </div>
        </div>

        {/* Plan selection */}
        <div className="qz-r-section">
          <h2>Choose your plan</h2>
          <div className="qz-r-timer">Plan reserved for <strong>{String(min).padStart(2, '0')}:{String(sec).padStart(2, '0')}</strong></div>
          <div className="qz-r-plans">
            {PLANS.map(p => (
              <button
                key={p.id}
                className={`qz-r-plan ${selectedPlan === p.id ? 'selected' : ''}`}
                onClick={() => { setSelectedPlan(p.id); posthog.capture('quiz_plan_select', { plan: p.id }) }}
              >
                {p.label && <span className={`qz-r-plan-badge ${p.id === 'annual' ? 'best' : ''}`}>{p.label}</span>}
                <div className="qz-r-plan-row">
                  <div className="qz-r-plan-radio"><div className={selectedPlan === p.id ? 'on' : ''} /></div>
                  <div className="qz-r-plan-info">
                    <strong>{p.name}</strong>
                    <span>${p.total.toFixed(2)} total</span>
                  </div>
                  <div className="qz-r-plan-price">
                    <strong>${p.price.toFixed(2)}{p.period}</strong>
                    <span>${p.weekly.toFixed(2)}/week</span>
                  </div>
                </div>
                {p.savings && <div className="qz-r-plan-save">SAVE {p.savings}%</div>}
              </button>
            ))}
          </div>

          <button className="qz-r-btn" onClick={handleCheckout} disabled={loading}>
            {loading ? 'Redirecting...' : `Start Free 7-Day Trial`}
          </button>

          <div className="qz-r-trust">
            <span>✓ 7-day free trial</span>
            <span>✓ 30-day money-back</span>
            <span>✓ Cancel anytime</span>
          </div>
          <p className="qz-r-signin">Already a member? <a href="https://app.faithfulkids.app/login">Sign in</a></p>
        </div>

        {/* Spacer for sticky bar */}
        <div style={{ height: '80px' }} />
      </div>

      {/* Sticky bottom */}
      <div className="qz-sticky">
        <span className="qz-sticky-timer">{String(min).padStart(2, '0')}:{String(sec).padStart(2, '0')}</span>
        <button onClick={handleCheckout} disabled={loading}>{loading ? '...' : 'Start Free Trial →'}</button>
      </div>
    </div>
  )
}
