// The Faithful Kids email design system (Nov 2026).
//
// Two looks, one block grammar:
//   home    every email that leads to the site or the app. Built from the
//           website's own parts (logo, Nunito, navy ink, green button, cards)
//           so the page a reader lands on feels like the same place.
//   letter  the parenting newsletter and writer emails, which land on the
//           serif /parenting section.
//
// Dependency-free on purpose: the app repo carries a copy of this folder.
// Copy rules that apply to everything rendered here: no em-dashes, no
// founder surname, and billing terms appear only in the enrollment receipt.

export type Block =
  | ['eyebrow', string]
  | ['h', string]
  | ['h3', string]
  | ['p', string]
  | ['small', string]
  | ['img', string, string, string, boolean, 'sheet' | 'wide']
  | ['btn', string, string]
  | ['link', string, string]
  | ['list', string[]]
  | ['divider']
  | ['recap', string[]]
  | ['stats', [string, string][]]
  | ['qa', [string, string][]]
  | ['terms', string[]]
  | ['sign', 'brand' | 'christian']

export type EmailStyle = 'home' | 'letter'

export interface RenderInput {
  style: EmailStyle
  blocks: Block[]
  pre: string
  /** Why the reader is getting this, shown in the footer. */
  reason: string
  /** Omit for billing email, which carries no unsubscribe link. */
  unsubscribeUrl?: string | null
}

const ASSETS = 'https://d3g07v1w0lehiv.cloudfront.net/email'
// The header is the name in plain text, no logo image (owner decision, Nov 17,
// 2026): every logo tried rendered badly in Gmail's dark mode on phones.

export function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// Video stills have the play badge baked into the file: Gmail strips the
// negative margins an overlaid badge would need.
function imgTag(key: string, alt: string, play: boolean, kind: 'sheet' | 'wide', radius: number, extra = ''): string {
  const w = kind === 'sheet' ? 232 : 520
  const src = `${ASSETS}/${key}${play ? '-play' : ''}.jpg`
  return `<img src="${src}" alt="${escapeHtml(alt)}" width="${w}" style="display:block;width:${w}px;max-width:100%;height:auto;border:0;border-radius:${radius}px;${extra}">`
}

const SANS = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif"
const NUNITO = `'Nunito',${SANS}`
const SERIF = "Georgia,'Times New Roman',serif"
const table = (style: string, inner: string) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" style="${style}">${inner}</table>`

function homeBlock(b: Block): string {
  const G = '#16a34a', GH = '#15803d', NAVY = '#1e293b', SEC = '#4b5563', MUT = '#6b7280', BORDER = '#e5e7eb'
  const F = NUNITO
  switch (b[0]) {
    case 'eyebrow': return `<p style="margin:0 0 8px;font:800 12px/1.4 ${F};letter-spacing:.08em;text-transform:uppercase;color:${G};">${b[1]}</p>`
    case 'h': return `<h1 style="margin:0 0 16px;font:800 30px/1.12 ${F};letter-spacing:-.03em;color:${NAVY};">${b[1]}</h1>`
    case 'h3': return `<p style="margin:26px 0 8px;font:800 19px/1.25 ${F};letter-spacing:-.01em;color:${NAVY};">${b[1]}</p>`
    case 'p': return `<p style="margin:0 0 16px;">${b[1]}</p>`
    case 'small': return `<p style="margin:0 0 16px;font-size:14px;color:${MUT};">${b[1]}</p>`
    case 'img': {
      const [, key, alt, href, play, kind] = b
      if (kind === 'sheet') return `<div style="margin:6px 0 22px;padding:22px 0;background:#faf8f5;border-radius:16px;text-align:center;"><a href="${href}" style="display:inline-block;">${imgTag(key, alt, play, kind, 6, 'margin:0 auto;border:1px solid #e5e7eb;')}</a></div>`
      return `<div style="margin:6px 0 20px;"><a href="${href}" style="display:block;">${imgTag(key, alt, play, kind, 16)}</a></div>`
    }
    case 'btn': return table('margin:8px 0 24px;', `<tr><td style="background:${G};border-radius:12px;"><a href="${b[2]}" style="display:inline-block;padding:14px 28px;font:700 16px ${F};color:#ffffff;text-decoration:none;">${b[1]}</a></td></tr>`)
    case 'link': return `<p style="margin:4px 0 20px;"><a href="${b[2]}" style="color:${GH};font-weight:700;">${b[1]} &rarr;</a></p>`
    case 'list': return table('margin:0 0 18px;', b[1].map((x) => `<tr><td style="vertical-align:top;padding:1px 10px 8px 0;color:${G};font-weight:800;">&#10003;</td><td style="padding:0 0 8px;">${x}</td></tr>`).join(''))
    case 'divider': return `<div style="height:1px;background:${BORDER};margin:26px 0;"></div>`
    case 'recap': return `<div style="margin:0 0 18px;">${b[1].map((x) => `<span style="display:inline-block;margin:0 6px 8px 0;padding:8px 14px;border-radius:999px;background:#f0fdf4;color:#166534;font-weight:700;font-size:14px;">${x}</span>`).join('')}</div>`
    case 'stats': return table(`width:100%;margin:4px 0 20px;border:1px solid ${BORDER};border-radius:12px;`, `<tr>${b[1].map(([n, l]) => `<td style="padding:16px 8px;text-align:center;"><div style="font:800 32px/1 ${F};letter-spacing:-.02em;color:${G};">${n}</div><div style="font-size:12.5px;color:${MUT};margin-top:6px;">${l}</div></td>`).join('')}</tr>`)
    case 'qa': return b[1].map(([q, a]) => `<div style="margin:0 0 10px;padding:16px 18px;border:1px solid ${BORDER};border-radius:12px;"><p style="margin:0 0 4px;font-weight:800;color:${NAVY};">${q}</p><p style="margin:0;color:${SEC};">${a}</p></div>`).join('')
    case 'terms': return `<div style="margin:4px 0 20px;padding:16px 18px;background:#faf8f5;border-radius:12px;"><p style="margin:0 0 8px;font-weight:800;color:${NAVY};">Your plan, in plain terms</p><ul style="margin:0;padding-left:18px;font-size:14px;color:${SEC};">${b[1].map((x) => `<li style="margin:0 0 5px;">${x}</li>`).join('')}</ul></div>`
    case 'sign': return `<p style="margin:26px 0 0;">${b[1] === 'christian' ? `<strong style="color:${NAVY};">Christian</strong><br><span style="font-size:13px;color:${MUT};">Faithful Kids</span>` : `<strong style="color:${NAVY};">The Faithful Kids team</strong>`}</p>`
  }
}

function letterBlock(b: Block): string {
  const GREEN = '#16a34a', DARK = '#15803d', MUTED = '#6b7570', INK = '#16211b'
  switch (b[0]) {
    case 'eyebrow': return `<p style="margin:0 0 6px;font:600 12px/1.4 ${SANS};letter-spacing:.12em;text-transform:uppercase;color:${DARK};">${b[1]}</p>`
    case 'h': return `<h1 style="margin:0 0 18px;font:normal 30px/1.2 ${SERIF};color:${INK};">${b[1]}</h1>`
    case 'h3': return `<p style="margin:26px 0 8px;font:italic 19px/1.3 ${SERIF};color:${INK};">${b[1]}</p>`
    case 'p': return `<p style="margin:0 0 16px;">${b[1]}</p>`
    case 'small': return `<p style="margin:0 0 16px;font-size:14px;color:${MUTED};">${b[1]}</p>`
    case 'img': {
      const [, key, alt, href, play, kind] = b
      const pad = kind === 'sheet' ? 'padding:14px;background:#f4f7f3;border-radius:6px;text-align:center;' : ''
      return `<div style="margin:6px 0 22px;${pad}"><a href="${href}" style="display:inline-block;">${imgTag(key, alt, play, kind, 4, kind === 'sheet' ? 'margin:0 auto;' : '')}</a></div>`
    }
    case 'btn': return table('margin:6px 0 24px;', `<tr><td style="background:${DARK};border-radius:6px;"><a href="${b[2]}" style="display:inline-block;padding:13px 26px;font:600 15px ${SANS};color:#ffffff;text-decoration:none;">${b[1]}</a></td></tr>`)
    case 'link': return `<p style="margin:4px 0 20px;"><a href="${b[2]}" style="color:${DARK};font-weight:600;">${b[1]} &rarr;</a></p>`
    case 'list': return `<ul style="margin:0 0 18px;padding-left:20px;">${b[1].map((x) => `<li style="margin:0 0 6px;">${x}</li>`).join('')}</ul>`
    case 'divider': return `<div style="margin:28px 0 22px;text-align:center;color:${GREEN};letter-spacing:.6em;">&middot;&middot;&middot;</div>`
    case 'recap': return table('width:100%;margin:0 0 20px;border-top:1px solid #e3e8e4;', b[1].map((x) => `<tr><td style="padding:10px 0;border-bottom:1px solid #e3e8e4;font:italic 17px ${SERIF};color:${INK};">${x}</td></tr>`).join(''))
    case 'stats': return table('width:100%;margin:4px 0 20px;', `<tr>${b[1].map(([n, l]) => `<td style="padding:0 6px 0 0;vertical-align:top;"><div style="font:normal 38px/1 ${SERIF};color:${DARK};">${n}</div><div style="font-size:13px;color:${MUTED};margin-top:6px;">${l}</div></td>`).join('')}</tr>`)
    case 'qa': return b[1].map(([q, a]) => `<p style="margin:0 0 4px;font:italic 18px/1.35 ${SERIF};color:${INK};">${q}</p><p style="margin:0 0 18px;">${a}</p>`).join('')
    case 'terms': return `<div style="margin:4px 0 20px;padding:16px 18px;border:1px solid #dfe6e1;border-radius:6px;"><p style="margin:0 0 8px;font:italic 16px ${SERIF};color:${INK};">Your plan, in plain terms</p><ul style="margin:0;padding-left:18px;font-size:14px;">${b[1].map((x) => `<li style="margin:0 0 5px;">${x}</li>`).join('')}</ul></div>`
    case 'sign': return `<p style="margin:26px 0 0;font:italic 17px/1.5 ${SERIF};color:${INK};">${b[1] === 'christian' ? 'With you,' : 'With joy,'}<br>${b[1] === 'christian' ? `Christian<br><span style="font-size:13px;color:${MUTED};">Faithful Kids</span>` : 'The Faithful Kids team'}</p>`
  }
}

export function renderEmail(input: RenderInput): string {
  const { style, blocks, reason } = input
  const body = blocks.map(style === 'home' ? homeBlock : letterBlock).join('\n')
  const unsub = input.unsubscribeUrl ? ` <a href="${input.unsubscribeUrl}" style="color:inherit;">Unsubscribe</a>` : ''
  // Hidden preview text, padded so the inbox does not pull body copy after it.
  const pre = `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(input.pre)}${'&#8199;&#65279;&#847;'.repeat(20)}</div>`
  if (style === 'home') {
    return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800&display=swap" rel="stylesheet"><style>a{color:#15803d}</style></head><body style="margin:0;background:#ffffff;">${pre}
<div style="max-width:560px;margin:0 auto;padding:0 22px 40px;font:16px/1.6 ${NUNITO};color:#1e293b;">
${table('width:100%;margin:0 0 30px;border-bottom:1px solid #e5e7eb;', `<tr><td style="padding:16px 0;font:800 19px ${NUNITO};color:#1e293b;">Faithful Kids</td></tr>`)}
${body}
<div style="margin:36px 0 0;padding-top:16px;border-top:1px solid #e5e7eb;font-size:12px;line-height:1.55;color:#9ca3af;">${reason}${unsub}<br>Faithful Kids · faithfulkids.app</div>
</div></body></html>`
  }
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><style>a{color:#15803d}</style></head><body style="margin:0;background:#ffffff;">${pre}
<div style="max-width:560px;margin:0 auto;padding:36px 24px 40px;font:16px/1.65 ${SANS};color:#25302a;">
<p style="margin:0 0 30px;font:normal 15px ${SERIF};letter-spacing:.14em;color:#15803d;">FAITHFUL&nbsp;KIDS</p>
${body}
<div style="margin:36px 0 0;padding-top:16px;border-top:1px solid #e3e8e4;font-size:12px;line-height:1.55;color:#9aa39d;">${reason}${unsub}<br>Faithful Kids · faithfulkids.app</div>
</div></body></html>`
}
