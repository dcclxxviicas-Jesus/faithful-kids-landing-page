'use client'

import { useState, useRef, useEffect } from 'react'
import posthog from 'posthog-js'
import { useTimer } from './use-timer'
import { DavidGoliathScene, NoahArkScene, GoodSamaritanScene } from './illustrations'

const DENOMINATIONS = ['Catholic', 'Evangelical', 'Non-denominational', 'Other']

const TESTIMONIALS = [
  {
    name: 'Maria S.',
    role: 'Mom of 3 (ages 4, 7 & 10)',
    quote: "I used to dread handing my kids the iPad. Now my daughter asks for 'the Bible one' instead of YouTube. She told her grandmother the whole story of Noah last Sunday. My heart.",
  },
  {
    name: 'James K.',
    role: 'Dad of 2 (ages 5 & 8)',
    quote: "Best $10/month I spend. Both kids love it. My son watched David & Goliath four times in a row and then acted it out in the backyard. That's the kind of screen time I can get behind.",
  },
  {
    name: 'Sarah R.',
    role: 'Mom of 1 (age 6)',
    quote: "I put this on during dinner prep and the guilt is just gone. She's learning Scripture instead of watching unboxing videos. I've told every mom in my parish about it.",
  },
  {
    name: 'Michael T.',
    role: 'Dad of 3 (ages 4, 8 & 11)',
    quote: "We cancelled YouTube Kids. This replaced it completely. My kids are watching the Good Samaritan instead of whatever the algorithm serves up. No contest.",
  },
  {
    name: 'Amanda L.',
    role: 'Mom (age 7)',
    quote: "The no-ads thing is everything. My son used to come to me asking for random toys he saw in ads. Now he comes asking me about Moses and the burning bush.",
  },
  {
    name: 'Chris W.',
    role: 'Dad of 1 (age 9)',
    quote: "My kid actually retains these stories. His Sunday school teacher noticed he already knew the parables before class. That's when I knew this was worth every penny.",
  },
]

const MARQUEE_QUOTES = [
  '"My kids actually ask for Bible stories now"',
  '"Screen time guilt = gone"',
  '"Better than any app we\'ve tried"',
  '"My 5yo retold the whole story of Noah"',
  '"Worth every single penny"',
  '"The ad-free experience is priceless"',
  '"Both my kids fight over who picks the story"',
  '"I can\'t believe how much Scripture they know"',
]

const FAQS = [
  { q: 'What age is this for?', a: 'Our Bible story videos are designed for kids ages 5 and up. Younger kids (5-7) get shorter, simpler retellings with bright visuals. Older kids (8+) get deeper stories with more context and life lessons.' },
  { q: 'Is it really ad-free?', a: 'Yes. Zero ads, ever. No pre-rolls, no banners, no sponsored content. We make money from subscriptions, not from advertising to your children.' },
  { q: 'How is this different from YouTube Kids?', a: 'YouTube Kids uses an algorithm that serves whatever keeps kids watching. We hand-pick every story and review it for doctrinal accuracy. No rabbit holes, no surprises, no junk content.' },
  { q: 'Can I set screen time limits?', a: 'Yes. Set daily limits per child. When time is up, the app gently pauses. No more "just one more video" battles.' },
  { q: 'Which denomination is the content for?', a: 'Our core Bible stories (David & Goliath, Noah, the Good Samaritan, the Nativity) are told faithfully to Scripture and resonate across Christian traditions. We offer content paths for Catholic, Evangelical, and Non-denominational families.' },
  { q: 'Is the content doctrinally accurate?', a: 'Every story is reviewed by practicing Christians with theological training. We take doctrinal accuracy seriously. If something is not right, we fix it or remove it.' },
  { q: 'What devices does it work on?', a: 'iPhone, iPad, Android phones and tablets. Watch anywhere your family is.' },
  { q: 'What is the refund policy?', a: 'Full 30-day money-back guarantee. If your kids do not love it, we will refund you completely. No questions asked.' },
  { q: 'How often is new content added?', a: 'New stories are added every week. We currently have 200 video lessons across 20 series, from Genesis to Revelation, with more coming constantly.' },
  { q: 'How are the videos made?', a: 'We use advanced AI video technology to create beautiful, consistent storytelling at a pace no traditional studio could match. Every script is written and reviewed by real Christians for doctrinal accuracy. The technology lets us produce high-quality content fast, which means your kids get new stories every week instead of waiting months between releases.' },
  { q: 'Are there quizzes?', a: 'Yes. Every lesson comes with a short quiz so your child can check what they learned. It is not a test. It is a fun way to make sure the story sticks. Parents can see quiz results in the dashboard.' },
]

export default function Home() {
  const [email, setEmail] = useState('')
  const [denomination, setDenomination] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [surveyDone, setSurveyDone] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !denomination) return
    setSubmitting(true)
    posthog.identify(email)
    posthog.capture('signup', { email, denomination })
    setSubmitted(true)
    setSubmitting(false)
  }

  function scrollToForm() {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  function handleCTA() {
    posthog.capture('cta_click', { location: 'various' })
    window.location.href = '/checkout'
  }

  function handlePricingClick(tier: string, price: string) {
    posthog.capture('pricing_click', { tier, price })
  }

  function handleSurvey(wouldPay: boolean) {
    posthog.capture('survey_response', { would_pay: wouldPay })
    setSurveyDone(true)
  }

  return (
    <>
      {/* NAV */}
      <nav className="nav">
        <div className="nav-inner">
          <div className="nav-logo">
            <img src="/logo.png" alt="Faithful Kids" className="nav-logo-img" /> Faithful Kids
          </div>
          <div className="nav-links">
            <a href="#how-it-works">How It Works</a>
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
          </div>
          <button className="btn-nav" onClick={handleCTA}>Get Started</button>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-content">
          <h1>Screen time that <span className="highlight">feeds their soul</span></h1>
          <p className="subtitle">
            Short Bible story videos for kids ages 5+. No ads, no algorithm, no guilt. Just Scripture, beautifully told.
          </p>

          <button className="btn-primary btn-hero" onClick={handleCTA}>
            Try Free for 7 Days
          </button>
          <p className="hero-subtext">No commitment. Cancel anytime. 30-day money-back guarantee.</p>

          <div className="hero-bullets">
            <span><strong>DOCTRINALLY REVIEWED</strong> by real Christians</span>
            <span><strong>ZERO ADS</strong> — subscription only</span>
            <span><strong>30-DAY</strong> money-back guarantee</span>
          </div>

          <div className="hero-rating">
            <span className="stars">★★★★★</span>
            <span className="rating-text">4.9/5 from Christian families everywhere</span>
          </div>
          <LiveCounter />
        </div>

        <div className="hero-visual">
          <PhoneMockup />
        </div>
      </section>

      {/* SCROLLING BANNER */}
      <div className="marquee-banner">
        <div className="marquee-track">
          {[...MARQUEE_QUOTES, ...MARQUEE_QUOTES].map((q, i) => (
            <span key={i} className="marquee-item">{q} <span className="marquee-star">★</span></span>
          ))}
        </div>
      </div>

      {/* THE PROBLEM */}
      <section className="problem-section">
        <span className="section-label">THE PROBLEM</span>
        <h2>Kids are glued to screens. Almost none of it feeds their soul.</h2>
        <p className="section-sub">Kids love short videos. That is not going away. The problem is what they are watching.</p>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-num">4.4 hrs/day</div>
            <p>Average screen time for kids 8-12. Almost none of it has any spiritual or educational value.</p>
          </div>
          <div className="stat-card">
            <div className="stat-num">0 Bible</div>
            <p>The vast majority of kids content on YouTube and TikTok has zero faith-based content whatsoever.</p>
          </div>
          <div className="stat-card">
            <div className="stat-num">78% guilt</div>
            <p>Of Christian parents feel guilty about their children's screen time and want better alternatives.</p>
          </div>
        </div>
        <button className="btn-primary" onClick={handleCTA}>Make Screen Time Count</button>
      </section>

      {/* THE SOLUTION */}
      <section className="solution-section">
        <span className="section-label">THE SOLUTION</span>
        <h2>Bible stories they actually want to watch</h2>
        <p className="section-sub">Short videos designed by people of faith, loved by kids, and trusted by parents.</p>
        <div className="solution-grid">
          <div className="solution-card">
            <div className="solution-icon">📖</div>
            <h3>Doctrinally Reviewed</h3>
            <p>Every story is reviewed by practicing Christians for accuracy. Real Scripture, told faithfully.</p>
          </div>
          <div className="solution-card">
            <div className="solution-icon">🛡️</div>
            <h3>Safe & Ad-Free</h3>
            <p>No ads, no comments, no algorithm rabbit holes. Just a safe space of faith-based content.</p>
          </div>
          <div className="solution-card">
            <div className="solution-icon">🎯</div>
            <h3>Age-Appropriate</h3>
            <p>Content matched to your child's age. Simple stories for little ones, deeper lessons for older kids.</p>
          </div>
        </div>
      </section>

      {/* WATCH A FULL STORY */}
      <section className="fullstory-section">
        <span className="section-label">SEE FOR YOURSELF</span>
        <h2>Watch a full story right now</h2>
        <p className="section-sub">This is exactly what your child will see. No signup needed. Just press play.</p>
        <FullStoryPlayer />
      </section>

      {/* VIDEO PREVIEW GRID */}
      <section className="preview-section">
        <h2>Preview more stories</h2>
        <p className="section-sub">Hover to preview. Every video is 60-90 seconds of faithful, age-appropriate Bible storytelling.</p>
        <div className="preview-grid">
          {[
            { src: 'https://d3g07v1w0lehiv.cloudfront.net/bible/birth-of-jesus-series/01-an-angel-visits-mary/lesson-video.mp4', title: 'An Angel Visits Mary', series: 'Birth of Jesus', age: 'Ages 5+' },
            { src: 'https://d3g07v1w0lehiv.cloudfront.net/bible/genesis-series/01-in-the-beginning-creation/lesson-video.mp4', title: 'In the Beginning: Creation', series: 'Genesis', age: 'Ages 5+' },
            { src: 'https://d3g07v1w0lehiv.cloudfront.net/bible/genesis-series/04-noah-and-the-great-flood/lesson-video.mp4', title: 'Noah & the Great Flood', series: 'Genesis', age: 'Ages 5+' },
          ].map((v) => (
            <PreviewCard key={v.src} {...v} />
          ))}
        </div>
        <div className="preview-more">
          <p>+ 200 lessons across 20 series, from Genesis to Revelation</p>
          <button className="btn-primary" onClick={handleCTA}>Start Your Free Trial</button>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="testimonials-section">
        <h2>"My kids ask for Bible stories instead of YouTube now"</h2>
        <p className="section-sub">Join thousands of Christian families who made screen time faith time.</p>
        <div className="testimonial-grid">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="testimonial-card">
              <p className="testimonial-quote">"{t.quote}"</p>
              <div className="testimonial-footer">
                <div className="testimonial-avatar">{t.name[0]}</div>
                <div>
                  <p className="testimonial-name">{t.name}</p>
                  <p className="testimonial-role">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button className="btn-primary" onClick={handleCTA}>Join These Families</button>
      </section>

      {/* QUOTE MARQUEE */}
      <div className="marquee-banner gold">
        <div className="marquee-track">
          {[...MARQUEE_QUOTES, ...MARQUEE_QUOTES].map((q, i) => (
            <span key={i} className="marquee-item">{q} <span className="marquee-star">★</span></span>
          ))}
        </div>
      </div>

      {/* CURRICULUM */}
      <CurriculumSection />

      {/* AGE GROUPS */}
      <section className="age-section">
        <h2>Content made for every age</h2>
        <p className="section-sub">Age-appropriate Bible stories that grow with your child.</p>
        <div className="age-grid">
          <div className="age-card">
            <span className="age-badge">Ages 4-8</span>
            <h3>Little Disciples</h3>
            <p>Simple, joyful retellings that bring Bible stories to life with bright visuals and gentle lessons.</p>
            <div className="age-tags">
              <span>Noah's Ark</span><span>Creation</span><span>Baby Moses</span><span>Good Samaritan</span><span>David & Goliath</span><span>Jonah</span>
            </div>
          </div>
          <div className="age-card">
            <span className="age-badge">Ages 9-12</span>
            <h3>Young Believers</h3>
            <p>Deeper dives into Scripture with context, life application, and the bigger picture of God's story.</p>
            <div className="age-tags">
              <span>Parables</span><span>Psalms</span><span>Prophets</span><span>Acts</span><span>Proverbs</span><span>Saints</span>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-section" id="how-it-works">
        <h2>How it works</h2>
        <p className="section-sub">Get started in minutes. Your kids will be watching Bible stories before bedtime.</p>
        <div className="steps-grid">
          <div className="step-card"><div className="step-num">1</div><h3>Sign Up</h3><p>Create a parent account and pick your denomination.</p></div>
          <div className="step-card"><div className="step-num">2</div><h3>Set Up Profiles</h3><p>Add your children's ages. Content is matched automatically.</p></div>
          <div className="step-card"><div className="step-num">3</div><h3>Watch & Learn</h3><p>Kids swipe through short Bible stories. Every video teaches Scripture.</p></div>
          <div className="step-card"><div className="step-num">4</div><h3>Stay in Control</h3><p>Set screen time limits, check what they watched, and lock it all with a password.</p></div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section className="features-section" id="features">
        <h2>Everything parents need. Everything kids love.</h2>
        <p className="section-sub">Built from the ground up for Christian families.</p>
        <div className="features-grid">
          <div className="feature-item"><div className="feature-icon">📖</div><h3>Faithful to Scripture</h3><p>Every story stays true to the Bible. Reviewed for doctrinal accuracy.</p></div>
          <div className="feature-item"><div className="feature-icon">🔒</div><h3>COPPA Compliant</h3><p>Fully compliant with children's privacy laws. Your family's data is safe.</p></div>
          <div className="feature-item"><div className="feature-icon">🚫</div><h3>Zero Ads</h3><p>No banners, no pre-rolls, no sponsored content. Ever.</p></div>
          <div className="feature-item"><div className="feature-icon">👁️</div><h3>Human Reviewed</h3><p>Every video reviewed by real people before it goes live. No surprises.</p></div>
          <div className="feature-item"><div className="feature-icon">⏱️</div><h3>Screen Time Limits</h3><p>Set daily limits per child. When time is up, the app gently pauses.</p></div>
          <div className="feature-item"><div className="feature-icon">🎂</div><h3>Age-Matched</h3><p>Set your child's age and get stories tailored to their level.</p></div>
          <div className="feature-item"><div className="feature-icon">📱</div><h3>iOS & Android</h3><p>Available on iPhone and Android phones and tablets.</p></div>
          <div className="feature-item"><div className="feature-icon">📊</div><h3>Parent Dashboard</h3><p>See what your child watches, which stories they love, and how much time they spend.</p></div>
        </div>
      </section>

      {/* COMPARISON TABLE */}
      <section className="compare-section" id="pricing">
        <h2>How we compare</h2>
        <p className="section-sub">There's a reason thousands of Christian parents switched.</p>
        <div className="compare-table-wrap">
          <table className="compare-table">
            <thead>
              <tr>
                <th>Feature</th>
                <th className="compare-ours"><strong>Faithful Kids</strong><br/><span>$19.99/mo</span></th>
                <th>YouTube Kids<br/><span>Free (with ads)</span></th>
                <th>Others<br/><span>$5-15/mo</span></th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Bible-based content', true, false, false],
                ['Doctrinally reviewed', true, false, false],
                ['Zero ads', true, false, true],
                ['Screen time controls', true, false, true],
                ['Age-appropriate content', true, true, true],
                ['No algorithm rabbit holes', true, false, false],
                ['COPPA compliant', true, true, true],
                ['Denomination-specific paths', true, false, false],
              ].map(([feature, ours, yt, others], i) => (
                <tr key={i}>
                  <td>{feature as string}</td>
                  <td className="compare-ours">{ours ? '✓' : '✗'}</td>
                  <td>{yt ? '✓' : '✗'}</td>
                  <td>{others ? '✓' : '✗'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* MONEY BACK GUARANTEE */}
      <section className="guarantee-section">
        <h3>30-Day Money-Back Guarantee</h3>
        <p>Try it risk-free. If your kids don't love it, or if you're not satisfied for any reason, we'll give you a full refund within 30 days. No questions asked.</p>
        <button className="btn-primary" onClick={handleCTA}>Start Risk-Free</button>
      </section>

      {/* SURVEY (post-signup) */}
      {submitted && (
        <section className="survey-section">
          <div className="survey-card">
            {!surveyDone ? (
              <>
                <h3>Quick question</h3>
                <p>Would you pay $19.99/month for daily Bible story videos for your kids?</p>
                <div className="survey-buttons">
                  <button className="survey-btn yes" onClick={() => handleSurvey(true)}>Yes, I would</button>
                  <button className="survey-btn" onClick={() => handleSurvey(false)}>Probably not</button>
                </div>
              </>
            ) : (
              <p className="survey-thanks">Thank you for your feedback!</p>
            )}
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="faq-section" id="faq">
        <h2>Frequently asked questions</h2>
        <p className="section-sub">Everything you need to know.</p>
        <div className="faq-list">
          {FAQS.map((faq, i) => (
            <div key={i} className={`faq-item ${openFaq === i ? 'open' : ''}`}>
              <button className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                {faq.q}
                <span className="faq-arrow">{openFaq === i ? '−' : '+'}</span>
              </button>
              {openFaq === i && <p className="faq-a">{faq.a}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="final-cta-section">
        <h2>Turn screen time into the most faithful part of your child's day</h2>
        <p>Join thousands of Christian parents who stopped fighting screen time and started using it for Scripture.</p>
        <button className="btn-primary btn-lg" onClick={handleCTA}>Start Watching Free</button>
        <div className="final-badges">
          <span>30-day money-back guarantee</span>
          <span>Cancel anytime</span>
          <span>No ads ever</span>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-logo"><img src="/logo.png" alt="Faithful Kids" className="nav-logo-img" /> Faithful Kids</div>
          <div className="footer-links">
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
            <a href="mailto:team@faithfulkids.app">Contact</a>
          </div>
          <p className="footer-copy">&copy; 2026 Faithful Kids. All rights reserved.</p>
        </div>
      </footer>

      {/* EXIT INTENT POPUP */}
      <ExitIntent />

      {/* STICKY BOTTOM BAR */}
      <StickyBar onCTA={handleCTA} />
    </>
  )
}

function PreviewCard({ src, title, series, age }: { src: string; title: string; series: string; age: string }) {
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(true)
  const vidRef = useRef<HTMLVideoElement>(null)

  function handlePlay() {
    if (vidRef.current) {
      vidRef.current.play()
      setPlaying(true)
    }
  }

  function handleStop() {
    if (vidRef.current) {
      vidRef.current.pause()
      vidRef.current.currentTime = 0
      setPlaying(false)
      setMuted(true)
      vidRef.current.muted = true
    }
  }

  function toggleMute(e: React.MouseEvent) {
    e.stopPropagation()
    if (vidRef.current) {
      vidRef.current.muted = !muted
      setMuted(!muted)
      if (muted) {
        vidRef.current.play()
        setPlaying(true)
        posthog.capture('preview_unmuted', { title })
      }
    }
  }

  return (
    <div className="preview-card" onMouseEnter={handlePlay} onMouseLeave={handleStop}>
      <div className="preview-video-wrap">
        <video ref={vidRef} src={src} muted loop playsInline />
        {!playing && <div className="preview-play-hint">▶ Hover to preview</div>}
        {playing && (
          <button className="preview-mute-btn" onClick={toggleMute}>
            {muted ? '🔇' : '🔊'}
          </button>
        )}
      </div>
      <div className="preview-info">
        <span className="preview-series">{series}</span>
        <h4>{title}</h4>
        <span className="preview-age">{age}</span>
      </div>
    </div>
  )
}

const PHONE_VIDEOS = [
  { src: 'https://d3g07v1w0lehiv.cloudfront.net/bible/birth-of-jesus-series/01-an-angel-visits-mary/lesson-video.mp4', title: 'An Angel Visits Mary', badge: 'Birth of Jesus' },
  { src: 'https://d3g07v1w0lehiv.cloudfront.net/bible/genesis-series/01-in-the-beginning-creation/lesson-video.mp4', title: 'In the Beginning: Creation', badge: 'Genesis' },
  { src: 'https://d3g07v1w0lehiv.cloudfront.net/bible/genesis-series/04-noah-and-the-great-flood/lesson-video.mp4', title: 'Noah & the Great Flood', badge: 'Genesis' },
]

function PhoneMockup() {
  const [current, setCurrent] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [muted, setMuted] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)

  function goTo(index: number) {
    setCurrent(index)
    setMuted(true)
    posthog.capture('phone_video_swipe', { index, title: PHONE_VIDEOS[index].title })
  }

  function toggleMute() {
    if (videoRef.current) {
      videoRef.current.muted = !muted
      setMuted(!muted)
      if (muted) {
        videoRef.current.play()
        posthog.capture('hero_video_unmuted', { title: PHONE_VIDEOS[current].title })
      }
    }
  }

  function next() { if (current < PHONE_VIDEOS.length - 1) goTo(current + 1) }
  function prev() { if (current > 0) goTo(current - 1) }

  const v = PHONE_VIDEOS[current]

  return (
    <div className="phone-mockup">
      <div
        className="phone-screen"
        onTouchStart={(e) => setTouchStart(e.touches[0].clientY)}
        onTouchEnd={(e) => {
          if (touchStart === null) return
          const delta = touchStart - e.changedTouches[0].clientY
          if (delta > 50) next()
          else if (delta < -50) prev()
          setTouchStart(null)
        }}
      >
        <video
          ref={videoRef}
          key={v.src}
          src={v.src}
          autoPlay
          muted={muted}
          loop
          playsInline
          className="phone-video"
        />
        <div className="phone-overlay">
          <span className="phone-title">{v.title}</span>
          <span className="phone-badge">{v.badge}</span>
        </div>

        {/* Unmute button */}
        <button className="phone-mute-btn" onClick={toggleMute}>
          {muted ? '🔇 Tap to listen' : '🔊 Playing'}
        </button>

        {/* Scroll dots */}
        <div className="phone-dots">
          {PHONE_VIDEOS.map((_, i) => (
            <button
              key={i}
              className={`phone-dot ${i === current ? 'active' : ''}`}
              onClick={() => goTo(i)}
            />
          ))}
        </div>

        {/* Arrow buttons */}
        {current > 0 && (
          <button className="phone-arrow up" onClick={prev}>&#8249;</button>
        )}
        {current < PHONE_VIDEOS.length - 1 && (
          <button className="phone-arrow down" onClick={next}>&#8250;</button>
        )}
      </div>
    </div>
  )
}

function StickyBar({ onCTA }: { onCTA: () => void }) {
  const [dismissed, setDismissed] = useState(false)
  const [visible, setVisible] = useState(false)
  const { minutes, seconds } = useTimer()

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 600)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (dismissed || !visible) return null

  return (
    <div className="sticky-bar">
      <div className="sticky-inner">
        <span className="sticky-text">
          <strong>7-day free trial</strong> — then up to 75% off.
          Ends in <span className="sticky-timer">{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
        </span>
        <button className="sticky-cta" onClick={onCTA}>Claim your free trial</button>
        <button className="sticky-dismiss" onClick={() => setDismissed(true)}>✕</button>
      </div>
    </div>
  )
}

function FullStoryPlayer() {
  const [muted, setMuted] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)

  function toggleMute() {
    if (videoRef.current) {
      videoRef.current.muted = !muted
      setMuted(!muted)
      if (muted) {
        videoRef.current.play()
        posthog.capture('fullstory_unmuted')
      }
    }
  }

  return (
    <div className="fullstory-player">
      <div className="fullstory-video-wrap">
        <video
          ref={videoRef}
          src="https://d3g07v1w0lehiv.cloudfront.net/bible/birth-of-jesus-series/01-an-angel-visits-mary/lesson-video.mp4"
          autoPlay
          muted={muted}
          playsInline
          controls
          className="fullstory-video"
        />
        <button className="mute-btn" onClick={toggleMute}>
          {muted ? '🔇 Tap to hear the story' : '🔊 Playing with sound'}
        </button>
      </div>
      <div className="fullstory-meta">
        <span className="fullstory-series">Birth of Jesus Series</span>
        <h3>An Angel Visits Mary</h3>
        <p>The angel Gabriel appears to a young woman named Mary with an extraordinary message. Watch how she responds with faith.</p>
        <span className="fullstory-badge">📝 Quiz included after this lesson</span>
      </div>
    </div>
  )
}

const CURRICULUM = [
  { name: 'Genesis', lessons: ['Creation', 'The Garden & the Fall', 'Cain & Abel', 'Noah & the Great Flood', 'The Tower of Babel', "God Calls Abraham", 'Abraham & Isaac', 'Jacob & Esau', 'Joseph the Dreamer', 'Joseph: From Prison to Palace'], icon: '🌍' },
  { name: 'Exodus', lessons: ['A Baby in a Basket', 'The Burning Bush', 'Let My People Go', 'The Ten Plagues', 'The Passover', 'Crossing the Red Sea', 'Manna from Heaven', 'The Ten Commandments', 'The Golden Calf', "God's Presence"], icon: '🔥' },
  { name: 'Promised Land', lessons: ['The Twelve Spies', 'Wandering in the Wilderness', 'The Bronze Serpent', "Balaam's Donkey", 'Moses Says Goodbye', 'Joshua Takes Command', 'Rahab & the Spies', 'The Walls of Jericho', 'The Sun Stands Still', 'Choosing to Serve'], icon: '⚔️' },
  { name: 'Judges & Ruth', lessons: ['The Cycle Begins', 'Deborah: A Brave Leader', 'Gideon the Unlikely Hero', "Gideon's 300", 'Samson: Strongest Man Alive', "Samson's Final Stand", 'Ruth: A Story of Loyalty', 'Ruth & Boaz', "Hannah's Prayer", 'God Calls Samuel'], icon: '⚖️' },
  { name: 'Rise of Kings', lessons: ['Israel Wants a King', 'Saul the First King', "Saul's Disobedience", 'God Chooses David', 'David & Goliath', 'David & Jonathan', 'David on the Run', 'David Spares His Enemy', 'The Fall of King Saul', 'David Becomes King'], icon: '👑' },
  { name: "King David's Reign", lessons: ['Dancing Before the Lord', "God's Promise to David", 'David & Mephibosheth', "David's Big Mistake", "The Shepherd's Song", 'Songs of Praise', "Absalom's Rebellion", "David's Repentance", 'Solomon Is Chosen', "David's Final Words"], icon: '🎵' },
  { name: 'Solomon & the Kingdom', lessons: ['Solomon Asks for Wisdom', "Solomon's Wise Judgment", 'Building the Temple', 'The Temple Is Dedicated', 'The Queen of Sheba', "Solomon's Proverbs", 'Solomon Turns Away', 'The Kingdom Splits', 'Good Kings & Bad Kings', 'The Northern Kingdom Falls'], icon: '🏛️' },
  { name: 'Elijah & Elisha', lessons: ['Elijah & the Ravens', "The Widow's Oil", 'Fire from Heaven', 'The Still Small Voice', "Naboth's Vineyard", 'Elijah Taken to Heaven', "Elisha's Double Portion", 'The Room on the Roof', 'Naaman the Leper', 'Chariots of Fire'], icon: '🕊️' },
  { name: 'Exile & Faith', lessons: ['Judah Falls to Babylon', "Daniel's Resolve", "Nebuchadnezzar's Dream", 'The Fiery Furnace', 'The Writing on the Wall', "Daniel in the Lions' Den", 'Valley of Dry Bones', 'Jonah: Running from God', 'Jonah: The Lesson', "Isaiah's Promise"], icon: '🦁' },
  { name: 'The Return Home', lessons: ['Cyrus Sets Them Free', 'Rebuilding the Temple', 'Ezra Reads the Law', "Nehemiah's Prayer", 'Rebuilding the Walls', 'The Wall Is Finished', 'Esther Becomes Queen', "Haman's Evil Plot", 'Esther Saves Her People', 'Looking Forward'], icon: '🏠' },
  { name: 'Birth of Jesus', lessons: ['An Angel Visits Mary', 'Joseph & the Angel', 'The Journey to Bethlehem', 'Born in a Manger', 'The Shepherds', 'The Wise Men', 'Escape to Egypt', 'Young Jesus in the Temple', 'John the Baptist', 'The Baptism of Jesus'], icon: '⭐' },
  { name: 'Jesus Begins Ministry', lessons: ['Temptation in the Desert', 'The First Disciples', 'Water into Wine', 'The Woman at the Well', 'Rejected in Nazareth', 'The Four Fishermen', 'Healing the Sick', 'The Paralyzed Man', 'Matthew the Tax Collector', 'The Twelve Apostles'], icon: '🐟' },
  { name: 'Teachings of Jesus', lessons: ['The Sermon on the Mount', 'The Beatitudes', "The Lord's Prayer", 'The Good Samaritan', 'The Prodigal Son', 'The Sower & the Seeds', 'The Mustard Seed', 'The Lost Sheep', 'The Wise & Foolish Builders', 'The Unforgiving Servant'], icon: '📖' },
  { name: 'Miracles of Jesus', lessons: ['Calming the Storm', 'Feeding the Five Thousand', 'Walking on Water', 'Healing the Blind Man', 'The Raising of Lazarus', 'Ten Lepers Healed', 'The Demon-Possessed Man', "Jairus' Daughter", 'The Withered Hand', 'The Great Catch of Fish'], icon: '✨' },
  { name: 'Road to the Cross', lessons: ['The Triumphal Entry', 'Cleansing the Temple', 'The Last Supper', 'The Garden of Gethsemane', 'The Betrayal', 'The Trial', 'Peter Denies Jesus', 'The Cross', 'It Is Finished', 'The Burial'], icon: '✝️' },
  { name: 'He Is Risen', lessons: ['The Empty Tomb', 'Mary Sees Jesus', 'The Road to Emmaus', 'Doubting Thomas', 'Breakfast on the Beach', 'Peter Is Restored', 'The Great Commission', 'The Ascension', 'Waiting in Jerusalem', 'The Day of Pentecost'], icon: '🌅' },
  { name: 'Early Church', lessons: ['The Church Is Born', 'Peter Heals the Lame Man', 'Ananias & Sapphira', 'Stephen the First Martyr', 'Philip & the Ethiopian', 'Saul Meets Jesus', 'Peter & Cornelius', 'Peter Escapes Prison', 'Barnabas the Encourager', 'The Church at Antioch'], icon: '⛪' },
  { name: "Paul's Adventures", lessons: ["Paul's First Journey", 'Paul & Barnabas Split', 'Paul & Silas in Prison', 'Paul in Athens', 'Paul in Corinth', 'The Riot in Ephesus', "Paul's Farewell", 'Shipwrecked', 'Paul in Rome', "Paul's Legacy"], icon: '⛵' },
  { name: 'Letters to Churches', lessons: ['The Gospel Explained', 'More Than Conquerors', 'The Armor of God', 'Love Is', 'Faith, Hope & Love', 'The Fruit of the Spirit', 'Running the Race', 'Joy in All Things', 'Do Not Worry', 'A New Creation'], icon: '✉️' },
  { name: 'Ending & Beginning', lessons: ['Faith Hall of Fame', 'Faith Without Works', 'Taming the Tongue', 'Love One Another', 'The Good Shepherd', 'The Vine & the Branches', 'I Am the Way', 'A New Heaven & New Earth', 'The Throne Room', 'Behold I Am Coming Soon'], icon: '🌟' },
]

function CurriculumSection() {
  const FEATURED = [
    { ...CURRICULUM[0], color: '#2d6a4f' },   // Genesis - forest green
    { ...CURRICULUM[10], color: '#7c3aed' },   // Birth of Jesus - purple
    { ...CURRICULUM[12], color: '#0369a1' },   // Teachings - blue
  ]

  return (
    <section className="curriculum-section">
      <div className="curr-header-content">
        <span className="section-label">THE FULL CURRICULUM</span>
        <h2>The entire Bible, one story at a time</h2>
        <div className="curr-hero-stat">
          <span className="curr-hero-num">400+</span>
          <span className="curr-hero-label">lessons, quizzes, and activities across 20 series</span>
        </div>
      </div>

      {/* Featured series - 3 big cards */}
      <div className="curr-featured">
        {FEATURED.map((series) => (
          <div key={series.name} className="curr-feat-card" style={{ background: `linear-gradient(135deg, ${series.color}, ${series.color}dd)` }}>
            <div className="curr-feat-top">
              <span className="curr-feat-icon">{series.icon}</span>
              <span className="curr-feat-count">{series.lessons.length} episodes</span>
            </div>
            <h3>{series.name}</h3>
            <div className="curr-feat-lessons">
              {series.lessons.slice(0, 5).map((l, i) => (
                <span key={l} className="curr-feat-lesson">{i + 1}. {l}</span>
              ))}
              <span className="curr-feat-more">+ {series.lessons.length - 5} more</span>
            </div>
          </div>
        ))}
      </div>

      {/* All series ticker */}
      <div className="curr-all-series">
        <p className="curr-all-label">All 20 series included:</p>
        <div className="curr-ticker">
          <div className="curr-ticker-track">
            {[...CURRICULUM, ...CURRICULUM].map((s, i) => (
              <span key={i} className="curr-ticker-item">
                {s.icon} {s.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function ExitIntent() {
  const [show, setShow] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const triggered = useRef(false)
  const lastScrollY = useRef(0)

  function trigger(source: string) {
    if (triggered.current || dismissed) return
    triggered.current = true
    setShow(true)
    posthog.capture('exit_intent_shown', { source })
  }

  // Desktop: mouse leaves viewport
  useEffect(() => {
    function handleMouseLeave(e: MouseEvent) {
      if (e.clientY < 10) trigger('mouse_leave')
    }
    document.addEventListener('mouseleave', handleMouseLeave)
    return () => document.removeEventListener('mouseleave', handleMouseLeave)
  }, [dismissed])

  // Mobile: fast scroll-up from below the fold
  useEffect(() => {
    let scrollUpDistance = 0

    function handleScroll() {
      const currentY = window.scrollY
      const viewportHeight = window.innerHeight

      if (currentY < lastScrollY.current && currentY > viewportHeight) {
        scrollUpDistance += lastScrollY.current - currentY
        if (scrollUpDistance > 300) {
          trigger('scroll_up')
        }
      } else {
        scrollUpDistance = 0
      }
      lastScrollY.current = currentY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [dismissed])

  // Mobile: timed delay (45 seconds, reset +60s on any video play)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function resetTimer() {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => trigger('timed_delay'), 60000)
  }

  useEffect(() => {
    timerRef.current = setTimeout(() => trigger('timed_delay'), 45000)

    function handlePlay() { resetTimer() }
    document.addEventListener('play', handlePlay, true)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      document.removeEventListener('play', handlePlay, true)
    }
  }, [dismissed])

  if (!show || dismissed) return null

  return (
    <div className="exit-overlay" onClick={() => setDismissed(true)}>
      <div className="exit-modal" onClick={(e) => e.stopPropagation()}>
        <button className="exit-close" onClick={() => setDismissed(true)}>✕</button>
        <h2>Before you go, watch this.</h2>
        <p>60 seconds. One Bible story. See if it is good enough for your kids.</p>
        <div className="exit-video-wrap">
          <video src="https://d3g07v1w0lehiv.cloudfront.net/bible/birth-of-jesus-series/01-an-angel-visits-mary/lesson-video.mp4" controls autoPlay muted playsInline className="exit-video" />
        </div>
        <button className="btn-primary btn-lg" onClick={() => { posthog.capture('exit_intent_cta'); window.location.href = '/checkout' }}>
          Try Free for 7 Days
        </button>
        <p className="exit-sub">30-day money-back guarantee. Cancel anytime.</p>
      </div>
    </div>
  )
}

function LiveCounter() {
  const [count, setCount] = useState(0)
  const target = 127

  useEffect(() => {
    // Animate count up on mount
    let current = 0
    const step = Math.ceil(target / 40)
    const timer = setInterval(() => {
      current += step
      if (current >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(current)
      }
    }, 50)

    return () => clearInterval(timer)
  }, [])

  // Slow trickle: add 1 every 30-90 seconds
  useEffect(() => {
    function tick() {
      const delay = 30000 + Math.random() * 60000
      setTimeout(() => {
        setCount((c) => c + 1)
        tick()
      }, delay)
    }
    const initial = setTimeout(tick, 15000)
    return () => clearTimeout(initial)
  }, [])

  return (
    <div className="live-counter">
      <span className="live-dot" />
      <span className="live-text">
        <strong>{count}</strong> families joined this week
      </span>
    </div>
  )
}
