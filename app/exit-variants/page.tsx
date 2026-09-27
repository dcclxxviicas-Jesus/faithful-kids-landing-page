'use client'

import { useState } from 'react'
import './exit-variants.css'

/**
 * Four treatments for the blog exit takeover, side by side to choose from.
 * A is what is live. Nothing here touches the live component — picking one
 * means porting its body into app/blog/BlogExitIntent.tsx.
 */

const CDN = 'https://d3g07v1w0lehiv.cloudfront.net'
const POSTERS = [
  { src: `${CDN}/video-posters/sm/in-the-beginning-creation.webp`, alt: 'Creation' },
  { src: `${CDN}/video-posters/sm/a-baby-in-a-basket.webp`, alt: 'A Baby in a Basket' },
  { src: `${CDN}/video-posters/sm/noah-and-the-great-flood.webp`, alt: 'Noah and the Great Flood' },
  { src: `${CDN}/video-posters/sm/an-angel-visits-mary.webp`, alt: 'An Angel Visits Mary' },
]

const QUESTION = 'How many kids are in your family?'
const OPTIONS = [
  { label: '1 child', val: '1', emoji: '1️⃣' },
  { label: '2 children', val: '2', emoji: '2️⃣' },
  { label: '3 children', val: '3', emoji: '3️⃣' },
  { label: '4 or more', val: '4+', emoji: '4️⃣' },
]

type V = 'A' | 'B' | 'C' | 'D'

const NAMES: Record<V, string> = {
  A: 'A · Plain (live)',
  B: 'B · The shelf',
  C: 'C · Already started',
  D: 'D · One scene',
}
const WHY: Record<V, string> = {
  A: 'Calm and fast. Nothing competes with the question. Lightest to load, and the least like an ad — but it shows nothing of the product.',
  B: 'Opens with four real lessons, the same shelf the quiz welcome uses. They see what they would be getting before they answer. Costs ~88KB of posters.',
  C: 'Frames the question as step 1 of 8 with the bar already moving. The endowed-progress effect: a task you have already started is far harder to abandon than one you have not.',
  D: 'Leads with the outcome and one big scene, then asks. The most like a landing page — strongest promise, but the slowest to reach the tap.',
}

function Options() {
  return (
    <div className="fk-takeover-opts">
      {OPTIONS.map(o => (
        <button key={o.val} className="fk-takeover-opt" onClick={e => e.preventDefault()}>
          <span className="fk-takeover-opt-emoji">{o.emoji}</span>
          <span>{o.label}</span>
        </button>
      ))}
    </div>
  )
}

function Skip() {
  return <button className="fk-takeover-skip">No thanks, keep reading</button>
}

export default function ExitVariants() {
  const [v, setV] = useState<V>('A')

  return (
    <div className="xv-stage">
      <div className="xv-bar">
        <strong>Exit takeover</strong>
        {(['A', 'B', 'C', 'D'] as V[]).map(k => (
          <button key={k} className={v === k ? 'on' : ''} onClick={() => setV(k)}>{NAMES[k]}</button>
        ))}
        <span className="xv-note">{WHY[v]}</span>
      </div>

      <div className="fk-takeover" style={{ position: 'fixed' }}>
        <button className="fk-takeover-close" aria-label="Close">{'✕'}</button>
        <div className="fk-takeover-inner">

          {v === 'A' && (
            <>
              <img src="/logo-sm.png" alt="" className="fk-takeover-logo" width={44} height={44} />
              <p className="fk-takeover-eyebrow">Before you go</p>
              <h2 className="fk-takeover-h">Build your kids&rsquo; Bible plan</h2>
              <p className="fk-takeover-sub">About a minute. No sign-up.</p>
              <p className="fk-takeover-q">{QUESTION}</p>
              <Options />
              <Skip />
            </>
          )}

          {v === 'B' && (
            <>
              <div className="xv-shelf">
                {POSTERS.map(p => <img key={p.alt} src={p.src} alt={p.alt} width={640} height={360} />)}
              </div>
              <h2 className="fk-takeover-h">Build your kids&rsquo; Bible plan</h2>
              <p className="fk-takeover-sub">The whole Bible, in two minute episodes.</p>
              <p className="fk-takeover-q">{QUESTION}</p>
              <Options />
              <Skip />
            </>
          )}

          {v === 'C' && (
            <>
              <img src="/logo-sm.png" alt="" className="fk-takeover-logo" width={44} height={44} />
              <h2 className="fk-takeover-h">You&rsquo;re a minute from your plan</h2>
              <p className="fk-takeover-sub">Eight quick questions. No sign-up.</p>
              <div className="xv-prog-wrap">
                <div className="xv-prog-label"><span>Question 1 of 8</span><span>1 min left</span></div>
                <div className="xv-prog"><div className="xv-prog-fill" /></div>
              </div>
              <p className="fk-takeover-q">{QUESTION}</p>
              <Options />
              <Skip />
            </>
          )}

          {v === 'D' && (
            <>
              <img src={POSTERS[1].src} alt="" className="xv-hero" width={640} height={360} />
              <h2 className="fk-takeover-h">A Bible plan built around your kids</h2>
              <div className="xv-benefit">
                <span>{'✓'} <b>Matched to their ages</b>, so nobody is bored or lost</span>
                <span>{'✓'} <b>Genesis to Revelation</b>, in order, two minutes each</span>
                <span>{'✓'} <b>No ads, no algorithm</b>, ever</span>
              </div>
              <p className="fk-takeover-q">{QUESTION}</p>
              <Options />
              <Skip />
            </>
          )}

        </div>
      </div>
    </div>
  )
}
