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

type V = 'A1' | 'G1' | 'G2' | 'G3' | 'G4'

const NAMES: Record<V, string> = {
  A1: 'A1 · Neutral',
  G1: 'G1 · They\u2019ll watch something',
  G2: 'G2 · 900 Sundays',
  G3: 'G3 · You\u2019ve been meaning to',
  G4: 'G4 · 900 Sundays + shamed exit (LIVE)',
}
const WHY: Record<V, string> = {
  A1: 'The neutral option: the question is the headline and nothing pushes. Kept as the revert target.',
  G1: 'Mildest of the four. States a fact the parent already knows and cannot argue with — their kid WILL watch something today. No accusation, no claim we cannot back. The pressure comes from the parent finishing the sentence themselves.',
  G2: 'The strongest of the four, and the one I would ship. "About 900 Sundays" is real (17-18 years is 887-939 weeks) and it lands because it is true, not because it accuses. Grief about time passing, not shame about parenting.',
  G3: 'Names the procrastination out loud. Sharper and more personal — it works on someone who already feels the gap, and reads as presumptuous to someone who does not. Highest variance of the four.',
  G4: 'G2 with a shamed exit: the decline button admits neglect on their behalf. This is confirm-shaming, a recognised dark pattern, and here it shames a parent about their child\u2019s faith on the way out. It will lift clicks. LIVE as of Sep 27, 2026 — owner\u2019s call with the trade understood.',
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

function Skip({ label }: { label?: string }) {
  return (
    <button
      className="fk-takeover-skip"
      dangerouslySetInnerHTML={{ __html: label || 'No thanks, keep reading' }}
    />
  )
}

export default function ExitVariants() {
  const [v, setV] = useState<V>('A1')

  return (
    <div className="xv-stage">
      <div className="xv-bar">
        <strong>Exit takeover</strong>
        {(['A1', 'G1', 'G2', 'G3', 'G4'] as V[]).map(k => (
          <button key={k} className={v === k ? 'on' : ''} onClick={() => setV(k)}>{NAMES[k]}</button>
        ))}
        <span className="xv-note">{WHY[v]}</span>
      </div>

      <div className="fk-takeover">
        <button className="fk-takeover-close" aria-label="Close">{'✕'}</button>
        <div className="fk-takeover-inner">

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

          {v === 'G1' && (
            <>
              <img src="/logo-sm.png" alt="" className="fk-takeover-logo" width={44} height={44} />
              <h2 className="fk-takeover-h">They&rsquo;ll watch something today.</h2>
              <p className="fk-takeover-lead">
                The only question is what. Take one minute and we&rsquo;ll build them a
                Bible plan instead &mdash; Genesis to Revelation, matched to their ages.
              </p>
              <p className="fk-takeover-q">{QUESTION}</p>
              <Options />
              <Reassure />
              <Skip />
            </>
          )}

          {v === 'G2' && (
            <>
              <img src="/logo-sm.png" alt="" className="fk-takeover-logo" width={44} height={44} />
              <h2 className="fk-takeover-h">You get about 900 Sundays with your little kids.</h2>
              <p className="fk-takeover-lead">
                Then they&rsquo;re grown, and what they know about God is mostly what you
                gave them. One minute, and their Bible plan is ready tonight.
              </p>
              <p className="fk-takeover-q">{QUESTION}</p>
              <Options />
              <Reassure />
              <Skip />
            </>
          )}

          {v === 'G3' && (
            <>
              <img src="/logo-sm.png" alt="" className="fk-takeover-logo" width={44} height={44} />
              <p className="fk-takeover-eyebrow">Honest question</p>
              <h2 className="fk-takeover-h">You&rsquo;ve been meaning to do this, haven&rsquo;t you?</h2>
              <p className="fk-takeover-lead">
                Teaching them the Bible at home. It keeps sliding to next week. This is
                the version that takes a minute and then runs itself.
              </p>
              <p className="fk-takeover-q">{QUESTION}</p>
              <Options />
              <Reassure />
              <Skip />
            </>
          )}

          {v === 'G4' && (
            <>
              <img src="/logo-sm.png" alt="" className="fk-takeover-logo" width={44} height={44} />
              <h2 className="fk-takeover-h">You get about 900 Sundays with your little kids.</h2>
              <p className="fk-takeover-lead">
                Then they&rsquo;re grown, and what they know about God is mostly what you
                gave them. One minute, and their Bible plan is ready tonight.
              </p>
              <p className="fk-takeover-q">{QUESTION}</p>
              <Options />
              <Reassure />
              <Skip label="No thanks &mdash; we&rsquo;ll get to it eventually" />
            </>
          )}

        </div>
      </div>
    </div>
  )
}
