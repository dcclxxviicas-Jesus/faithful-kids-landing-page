export function DavidGoliathScene() {
  return (
    <svg viewBox="0 0 320 180" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      {/* Sky gradient */}
      <defs>
        <linearGradient id="sky-dg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e8d5a3" />
          <stop offset="100%" stopColor="#f5e6c8" />
        </linearGradient>
        <linearGradient id="ground-dg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c9a96e" />
          <stop offset="100%" stopColor="#b8944d" />
        </linearGradient>
      </defs>
      <rect width="320" height="180" fill="url(#sky-dg)" />
      {/* Sun */}
      <circle cx="260" cy="35" r="22" fill="#f0c040" opacity="0.7" />
      {/* Hills */}
      <ellipse cx="80" cy="180" rx="140" ry="60" fill="#d4b87a" />
      <ellipse cx="260" cy="180" rx="120" ry="50" fill="#caa860" />
      {/* Ground */}
      <rect y="145" width="320" height="35" fill="url(#ground-dg)" />
      {/* Goliath - big figure */}
      <g transform="translate(200, 60)">
        {/* Body */}
        <rect x="8" y="30" width="30" height="45" rx="4" fill="#6b4226" />
        {/* Head */}
        <circle cx="23" cy="20" r="16" fill="#d4a574" />
        {/* Helmet */}
        <path d="M7 18 Q23 2 39 18" fill="#888" stroke="#666" strokeWidth="2" />
        {/* Shield */}
        <ellipse cx="2" cy="55" rx="10" ry="16" fill="#888" stroke="#666" strokeWidth="1.5" />
        {/* Spear */}
        <line x1="42" y1="20" x2="42" y2="85" stroke="#8B7355" strokeWidth="3" />
        <polygon points="38,18 42,5 46,18" fill="#999" />
        {/* Legs */}
        <rect x="12" y="75" width="10" height="20" rx="3" fill="#5a3520" />
        <rect x="26" y="75" width="10" height="20" rx="3" fill="#5a3520" />
      </g>
      {/* David - small figure */}
      <g transform="translate(80, 95)">
        {/* Body */}
        <rect x="4" y="15" width="16" height="25" rx="3" fill="#c9a040" />
        {/* Head */}
        <circle cx="12" cy="8" r="9" fill="#d4a574" />
        {/* Hair */}
        <path d="M3 6 Q12 -2 21 6" fill="#8B4513" />
        {/* Sling - arm extended */}
        <line x1="20" y1="22" x2="40" y2="12" stroke="#8B7355" strokeWidth="1.5" />
        <circle cx="42" cy="11" r="3" fill="#888" />
        {/* Legs */}
        <rect x="6" y="40" width="6" height="12" rx="2" fill="#b8862d" />
        <rect x="14" y="40" width="6" height="12" rx="2" fill="#b8862d" />
      </g>
      {/* Rocks on ground */}
      <ellipse cx="130" cy="152" rx="6" ry="4" fill="#a89070" />
      <ellipse cx="170" cy="148" rx="4" ry="3" fill="#b89878" />
    </svg>
  )
}

export function NoahArkScene() {
  return (
    <svg viewBox="0 0 320 180" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="sky-na" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a8c8e8" />
          <stop offset="60%" stopColor="#c8ddf0" />
          <stop offset="100%" stopColor="#d8e8f5" />
        </linearGradient>
        <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6ba3d6" />
          <stop offset="100%" stopColor="#4a86b8" />
        </linearGradient>
      </defs>
      {/* Sky */}
      <rect width="320" height="180" fill="url(#sky-na)" />
      {/* Rainbow */}
      <path d="M40 90 Q160 -20 280 90" stroke="#e85050" strokeWidth="4" fill="none" opacity="0.5" />
      <path d="M44 94 Q160 -14 276 94" stroke="#f0a030" strokeWidth="4" fill="none" opacity="0.5" />
      <path d="M48 98 Q160 -8 272 98" stroke="#f0d040" strokeWidth="4" fill="none" opacity="0.5" />
      <path d="M52 102 Q160 -2 268 102" stroke="#60b060" strokeWidth="4" fill="none" opacity="0.4" />
      <path d="M56 106 Q160 4 264 106" stroke="#5080d0" strokeWidth="4" fill="none" opacity="0.4" />
      {/* Clouds */}
      <g opacity="0.6">
        <ellipse cx="60" cy="30" rx="30" ry="14" fill="white" />
        <ellipse cx="80" cy="25" rx="25" ry="12" fill="white" />
        <ellipse cx="250" cy="40" rx="28" ry="12" fill="white" />
        <ellipse cx="270" cy="36" rx="22" ry="10" fill="white" />
      </g>
      {/* Water */}
      <rect y="110" width="320" height="70" fill="url(#water)" />
      {/* Waves */}
      <path d="M0 120 Q20 115 40 120 Q60 125 80 120 Q100 115 120 120 Q140 125 160 120 Q180 115 200 120 Q220 125 240 120 Q260 115 280 120 Q300 125 320 120" stroke="#7cb8e0" strokeWidth="2" fill="none" opacity="0.5" />
      <path d="M0 135 Q25 130 50 135 Q75 140 100 135 Q125 130 150 135 Q175 140 200 135 Q225 130 250 135 Q275 140 300 135 Q320 130 320 135" stroke="#7cb8e0" strokeWidth="1.5" fill="none" opacity="0.4" />
      {/* Ark */}
      <g transform="translate(90, 70)">
        {/* Hull */}
        <path d="M0 50 Q5 65 70 65 Q135 65 140 50 L130 35 L10 35 Z" fill="#8B6914" stroke="#6B4914" strokeWidth="1.5" />
        {/* Deck */}
        <rect x="15" y="20" width="110" height="18" rx="2" fill="#a07828" stroke="#8B6914" strokeWidth="1" />
        {/* Cabin */}
        <rect x="35" y="2" width="70" height="20" rx="3" fill="#b88c3c" stroke="#8B6914" strokeWidth="1" />
        {/* Roof */}
        <path d="M30 2 L70 -12 L110 2" fill="#8B6914" stroke="#6B4914" strokeWidth="1" />
        {/* Windows */}
        <rect x="45" y="7" width="8" height="8" rx="1" fill="#f0d880" />
        <rect x="60" y="7" width="8" height="8" rx="1" fill="#f0d880" />
        <rect x="75" y="7" width="8" height="8" rx="1" fill="#f0d880" />
        <rect x="90" y="7" width="8" height="8" rx="1" fill="#f0d880" />
      </g>
      {/* Dove */}
      <g transform="translate(220, 50)">
        <ellipse cx="0" cy="0" rx="6" ry="4" fill="white" />
        <path d="M-3 -2 Q-10 -10 -5 -6" stroke="white" strokeWidth="2" fill="none" />
        <path d="M2 -2 Q10 -10 5 -6" stroke="white" strokeWidth="2" fill="none" />
        <circle cx="4" cy="-1" r="1" fill="#333" />
      </g>
    </svg>
  )
}

export function GoodSamaritanScene() {
  return (
    <svg viewBox="0 0 320 180" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="sky-gs" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f0d8a0" />
          <stop offset="100%" stopColor="#f5e6c8" />
        </linearGradient>
      </defs>
      {/* Sky */}
      <rect width="320" height="180" fill="url(#sky-gs)" />
      {/* Sun setting */}
      <circle cx="280" cy="50" r="28" fill="#f0c040" opacity="0.6" />
      {/* Distant hills */}
      <ellipse cx="160" cy="180" rx="200" ry="55" fill="#d4b87a" />
      <ellipse cx="50" cy="185" rx="100" ry="45" fill="#c9a96e" />
      {/* Road */}
      <path d="M0 160 Q80 140 160 150 Q240 160 320 145" stroke="#b89858" strokeWidth="30" fill="none" opacity="0.5" />
      {/* Ground */}
      <rect y="155" width="320" height="25" fill="#c9a96e" />
      {/* Path texture */}
      <ellipse cx="100" cy="152" rx="5" ry="3" fill="#a88848" opacity="0.4" />
      <ellipse cx="180" cy="148" rx="4" ry="2" fill="#a88848" opacity="0.4" />
      {/* Injured person on ground */}
      <g transform="translate(120, 125)">
        {/* Body lying down */}
        <rect x="0" y="12" width="35" height="12" rx="4" fill="#8B7355" />
        {/* Head */}
        <circle cx="-4" cy="16" r="8" fill="#d4a574" />
        {/* Legs */}
        <rect x="35" y="14" width="18" height="7" rx="3" fill="#7a6345" />
      </g>
      {/* Good Samaritan - kneeling */}
      <g transform="translate(155, 100)">
        {/* Body */}
        <rect x="5" y="18" width="18" height="28" rx="3" fill="#c04040" />
        {/* Head */}
        <circle cx="14" cy="10" r="10" fill="#c4956a" />
        {/* Head covering */}
        <path d="M4 8 Q14 0 24 8 L26 14 L2 14 Z" fill="#e8e0d0" />
        {/* Arms reaching forward (helping) */}
        <line x1="5" y1="28" x2="-10" y2="35" stroke="#c4956a" strokeWidth="4" strokeLinecap="round" />
        <line x1="23" y1="28" x2="35" y2="22" stroke="#c4956a" strokeWidth="4" strokeLinecap="round" />
        {/* Water jug */}
        <ellipse cx="38" cy="20" rx="5" ry="7" fill="#a08060" />
        {/* Kneeling leg */}
        <rect x="8" y="46" width="7" height="10" rx="2" fill="#a03030" />
        <rect x="16" y="42" width="7" height="14" rx="2" fill="#a03030" />
      </g>
      {/* Donkey in background */}
      <g transform="translate(230, 105)" opacity="0.7">
        <rect x="5" y="10" width="25" height="16" rx="4" fill="#8B7355" />
        <rect x="-2" y="5" width="10" height="14" rx="3" fill="#8B7355" />
        <circle cx="2" cy="3" r="5" fill="#7a6345" />
        {/* Ears */}
        <line x1="0" y1="0" x2="-3" y2="-5" stroke="#7a6345" strokeWidth="2" />
        <line x1="4" y1="0" x2="7" y2="-5" stroke="#7a6345" strokeWidth="2" />
        {/* Legs */}
        <rect x="8" y="26" width="4" height="14" rx="1" fill="#7a6345" />
        <rect x="24" y="26" width="4" height="14" rx="1" fill="#7a6345" />
      </g>
      {/* Heart glow between figures */}
      <circle cx="150" cy="135" r="8" fill="#f0c040" opacity="0.25" />
    </svg>
  )
}

export function CrossIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 20, height: 20 }}>
      <rect x="10" y="2" width="4" height="20" rx="1" fill="#b8860b" />
      <rect x="4" y="7" width="16" height="4" rx="1" fill="#b8860b" />
    </svg>
  )
}
