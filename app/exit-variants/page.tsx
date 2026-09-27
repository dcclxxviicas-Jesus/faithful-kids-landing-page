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

type V = 'A' | 'A1' | 'A2' | 'A3'

const NAMES: Record<V, string> = {
  A: 'A · Plain (original)',
  A1: 'A1 · Question is the headline',
  A2: 'A2 · Promise, then ask',
  A3: 'A3 · Name the reward',
}
const WHY: Record<V, string> = {
  A: 'The original. The headline is the biggest thing and the question is the smallest — so the one thing we want acted on is the least visible thing on screen.',
  A1: 'LIVE. The question IS the headline. Shortest path from seeing the screen to understanding what to do. Reassurances sit under the options where they answer "what does this cost me" without competing for attention.',
  A2: 'Makes the promise first, then asks. Slightly slower to the ask than A1, but nobody taps without knowing what they get. Best if the worry is that a bare question feels like a form.',
  A3: 'Names the reward as the headline and treats the question as the price of it. The most curiosity-driven — "see the plan" is the pull, the question is just the toll.',
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

function Reassure() {
  return (
    <div className="fk-takeover-reassure">
      <span>{'\u2713'} About a minute</span>
      <span>{'\u2713'} No sign-up</span>
      <span>{'\u2713'} Free to see</span>
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
        {(['A', 'A1', 'A2', 'A3'] as V[]).map(k => (
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

          {v === 'A1' && (
            <>
              <img src="/logo-sm.png" alt="" className="fk-takeover-logo" width={44} height={44} />
              <p className="fk-takeover-eyebrow">One quick question</p>
              <h2 className="fk-takeover-q-hero">{QUESTION}</h2>
              <p className="fk-takeover-lead">
                We&rsquo;ll build a Bible plan around them &mdash; Genesis to Revelation,
                matched to their ages.
              </p>
              <Options />
              <Reassure />
              <Skip />
            </>
          )}

          {v === 'A2' && (
            <>
              <img src="/logo-sm.png" alt="" className="fk-takeover-logo" width={44} height={44} />
              <h2 className="fk-takeover-h">A Bible plan built around your kids</h2>
              <p className="fk-takeover-lead">
                Genesis to Revelation, in order, two minutes an episode &mdash; matched to
                their ages. Free to see.
              </p>
              <p className="fk-takeover-q">{QUESTION}</p>
              <Options />
              <Reassure />
              <Skip />
            </>
          )}

          {v === 'A3' && (
            <>
              <img src="/logo-sm.png" alt="" className="fk-takeover-logo" width={44} height={44} />
              <p className="fk-takeover-eyebrow">Takes one minute</p>
              <h2 className="fk-takeover-h">See your kids&rsquo; Bible plan</h2>
              <p className="fk-takeover-q-hero" style={{ marginTop: 22 }}>{QUESTION}</p>
              <Options />
              <Reassure />
              <Skip />
            </>
          )}

        </div>
      </div>
    </div>
  )
}
