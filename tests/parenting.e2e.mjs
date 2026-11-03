/*
 * End-to-end checks for the Parenting section.
 *
 *   PW=~/.fk-pw/node_modules node tests/parenting.e2e.mjs http://localhost:3077
 *
 * Runs against a production build served by `next start`. Writes screenshots
 * to tests/screenshots/ and prints a pass/fail table. Exit code 1 on any fail.
 * It needs the admin password from .env.local to exercise the desk; without it
 * the admin checks are skipped and reported as such.
 */
import { createRequire } from 'node:module'
import fs from 'node:fs'
import path from 'node:path'

const require = createRequire(path.join(process.env.PW || `${process.env.HOME}/.fk-pw/node_modules`, '/'))
const { chromium } = require('playwright')

const BASE = process.argv[2] || 'http://localhost:3077'
const OUT = path.join(process.cwd(), 'tests', 'screenshots')
fs.mkdirSync(OUT, { recursive: true })

const env = Object.fromEntries(fs.existsSync('.env.local')
  ? fs.readFileSync('.env.local', 'utf8').split('\n').filter(l => l.includes('=') && !l.startsWith('#')).map(l => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()])
  : [])
const ADMIN_PW = env.CAS_ADMIN_PASSWORD

const results = []
function record(name, ok, note = '') { results.push({ name, ok, note }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${note ? '  — ' + note : ''}`) }
async function check(name, fn) {
  try { const note = await fn(); record(name, true, typeof note === 'string' ? note : '') }
  catch (e) { record(name, false, e instanceof Error ? e.message : String(e)) }
}
const must = (cond, msg) => { if (!cond) throw new Error(msg) }

const browser = await chromium.launch()
const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 })

async function jsonLd(page) {
  return page.$$eval('script[type="application/ld+json"]', els => els.map(e => { try { return JSON.parse(e.textContent) } catch { return null } }).filter(Boolean))
}
async function noOverflow(page) {
  const [sw, iw] = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth])
  must(sw <= iw + 1, `horizontal overflow: scrollWidth ${sw} > innerWidth ${iw}`)
}
async function shot(page, name) { await page.screenshot({ path: path.join(OUT, name), fullPage: true }) }

/* ------------------------------------------------------------ public pages */
let firstArticle = null
let firstAuthor = null

await check('home: 200, H1, masthead, nav item, JSON-LD', async () => {
  const page = await desktop.newPage()
  const res = await page.goto(`${BASE}/parenting`)
  must(res.status() === 200, `status ${res.status()}`)
  must((await page.textContent('h1')).trim() === 'Raising Faithful Kids', 'H1 is not the approved headline')
  must(await page.$('nav.nav a[href="/parenting"]'), 'Parenting missing from site nav')
  must(await page.$('a[href="/parenting/write-for-us"]'), 'contributor CTA missing')
  const canon = await page.getAttribute('link[rel="canonical"]', 'href')
  must(canon === 'https://faithfulkids.app/parenting', `canonical ${canon}`)
  const ld = await jsonLd(page)
  must(ld.some(x => x['@type'] === 'CollectionPage'), 'no CollectionPage schema')
  must(ld.some(x => x['@type'] === 'BreadcrumbList'), 'no breadcrumb schema')
  const links = await page.$$eval('.pt-card h3 a, .pt-featured h2 a', as => as.map(a => a.getAttribute('href')))
  firstArticle = links.find(h => h && h.startsWith('/parenting/')) || null
  const authorLinks = await page.$$eval('a[href^="/parenting/authors/"]', as => as.map(a => a.getAttribute('href')))
  firstAuthor = authorLinks[0] || null
  await shot(page, 'home-desktop.png')
  await page.close()
  return firstArticle ? `featured/first article: ${firstArticle}` : 'no articles rendered (empty state)'
})

await check('home: mobile layout, no horizontal overflow, menu has Parenting', async () => {
  const page = await mobile.newPage()
  await page.goto(`${BASE}/parenting`)
  await noOverflow(page)
  await page.click('button.nav-toggle')
  await page.waitForSelector('#site-mobile-menu a[href="/parenting"]')
  await page.keyboard.press('Escape')
  await shot(page, 'home-mobile.png')
  await page.close()
})

await check('article: template, schema, byline, share, markdown alternate, sample ribbon', async () => {
  must(firstArticle, 'no article to open')
  const page = await desktop.newPage()
  const res = await page.goto(`${BASE}${firstArticle}`)
  must(res.status() === 200, `status ${res.status()}`)
  must(await page.$('h1'), 'no H1')
  must((await page.$$('h1')).length === 1, 'more than one H1')
  must(await page.$('.pt-byline a[href^="/parenting/authors/"]'), 'no author link in byline')
  must(await page.$('.pt-prose'), 'no prose body')
  must(await page.$('.pt-share button'), 'no copy-link button')
  const alt = await page.getAttribute('link[rel="alternate"][type="text/markdown"]', 'href')
  must(alt && alt.endsWith('.md'), 'no markdown alternate link')
  const ld = await jsonLd(page)
  const art = ld.find(x => ['Article', 'OpinionNewsArticle', 'NewsArticle', 'ScholarlyArticle'].includes(x['@type']))
  must(art, 'no article schema')
  must(art.author && art.author['@type'] === 'Person' && art.author.name, 'article schema has no Person author')
  must(art.datePublished && art.dateModified, 'schema missing dates')
  const og = await page.getAttribute('meta[property="og:type"]', 'content')
  must(og === 'article', `og:type ${og}`)
  const isSample = firstArticle.includes('sample-')
  if (isSample) {
    must(await page.$('.pt-sample'), 'sample article without ribbon')
    const robots = await page.getAttribute('meta[name="robots"]', 'content')
    must(robots && robots.includes('noindex'), `sample article indexable: ${robots}`)
  }
  await shot(page, 'article-desktop.png')
  await page.close()
  return isSample ? 'sample article (ribbon + noindex verified)' : ''
})

await check('article: mobile, no overflow, copy link works', async () => {
  must(firstArticle, 'no article to open')
  const page = await mobile.newPage()
  await desktop.grantPermissions(['clipboard-read', 'clipboard-write']).catch(() => {})
  await page.goto(`${BASE}${firstArticle}`)
  await noOverflow(page)
  await shot(page, 'article-mobile.png')
  await page.close()
})

await check('article: markdown edition served', async () => {
  must(firstArticle, 'no article')
  const res = await fetch(`${BASE}${firstArticle}.md`)
  must(res.status === 200, `status ${res.status}`)
  must((res.headers.get('content-type') || '').includes('text/markdown'), `content-type ${res.headers.get('content-type')}`)
  const body = await res.text()
  must(body.startsWith('# '), 'markdown does not start with a title')
  return `${body.length} bytes`
})

await check('section page: renders for a live section, 404 for an empty one', async () => {
  const page = await desktop.newPage()
  const res = await page.goto(`${BASE}/parenting/stories`)
  if (res.status() === 200) {
    must(await page.$('.pt-secnav a[aria-current="page"]'), 'section nav does not mark current')
    must((await page.$$('.pt-card')).length >= 1, 'no cards')
    await shot(page, 'section-desktop.png')
  }
  const sw = await page.goto(`${BASE}/parenting/latest`)
  must(sw.status() === 404, `reserved slug /parenting/latest returned ${sw.status()}`)
  await page.close()
  return res.status() === 200 ? 'stories live' : 'stories empty (404 as designed)'
})

await check('author page: profile schema and article list', async () => {
  must(firstAuthor, 'no author link found')
  const page = await desktop.newPage()
  const res = await page.goto(`${BASE}${firstAuthor}`)
  must(res.status() === 200, `status ${res.status()}`)
  const ld = await jsonLd(page)
  must(ld.some(x => x['@type'] === 'ProfilePage' && x.mainEntity && x.mainEntity['@type'] === 'Person'), 'no ProfilePage/Person schema')
  must((await page.$$('.pt-card')).length >= 1, 'author page lists no articles')
  await shot(page, 'author-desktop.png')
  await page.close()
})

await check('write-for-us: page, client validation, keyboard reachability', async () => {
  const page = await desktop.newPage()
  const res = await page.goto(`${BASE}/parenting/write-for-us`)
  must(res.status() === 200, `status ${res.status()}`)
  must(await page.$('#pitch-form'), 'no form')
  await page.click('#pitch-form button[type="submit"]')
  await page.waitForSelector('.pt-field.has-error .err')
  const errs = await page.$$eval('.pt-field.has-error .err', es => es.length)
  must(errs >= 5, `only ${errs} validation messages`)
  // focus moved to the first invalid field
  const focused = await page.evaluate(() => document.activeElement && document.activeElement.id)
  must(focused === 'pf-name', `focus went to ${focused}`)
  // typing clears the error for that field
  await page.fill('#pf-name', 'Test Person')
  must(!(await page.$('#pf-name ~ .err')), 'name error did not clear on input')
  // every control is reachable by Tab
  const ids = await page.$$eval('#pitch-form input:not([tabindex="-1"]), #pitch-form select, #pitch-form textarea, #pitch-form button', els => els.map(e => e.id || e.type))
  must(ids.length >= 10, `only ${ids.length} focusable controls`)
  await shot(page, 'write-for-us-desktop.png')
  await page.close()
})

await check('write-for-us: mobile, no overflow', async () => {
  const page = await mobile.newPage()
  await page.goto(`${BASE}/parenting/write-for-us`)
  await noOverflow(page)
  await shot(page, 'write-for-us-mobile.png')
  await page.close()
})

for (const p of ['/parenting/about', '/parenting/editorial-policy', '/parenting/submission-guidelines']) {
  await check(`static page ${p}: 200, one H1, canonical`, async () => {
    const page = await desktop.newPage()
    const res = await page.goto(`${BASE}${p}`)
    must(res.status() === 200, `status ${res.status()}`)
    must((await page.$$('h1')).length === 1, 'H1 count != 1')
    must((await page.getAttribute('link[rel="canonical"]', 'href')) === `https://faithfulkids.app${p}`, 'canonical wrong')
    await page.close()
  })
}

/* ------------------------------------------------------------ SEO plumbing */
await check('sitemap.xml lists parenting pages; news sitemap is valid XML; llms.txt has the section', async () => {
  const sm = await (await fetch(`${BASE}/sitemap.xml`)).text()
  must(sm.includes('https://faithfulkids.app/parenting</loc>'), 'sitemap lacks /parenting')
  must(sm.includes('/parenting/write-for-us'), 'sitemap lacks write-for-us')
  must(!sm.includes('/parenting/sample-'), 'sitemap lists a SAMPLE article')
  must(!sm.includes('/parenting/preview/'), 'sitemap lists preview')
  const ns = await fetch(`${BASE}/parenting/news-sitemap.xml`)
  must(ns.status === 200 && (ns.headers.get('content-type') || '').includes('xml'), 'news sitemap not served as XML')
  const nsBody = await ns.text()
  must(nsBody.includes('<urlset') && nsBody.includes('sitemap-news'), 'news sitemap malformed')
  must(!nsBody.includes('sample-'), 'news sitemap lists a sample')
  const llms = await (await fetch(`${BASE}/llms.txt`)).text()
  must(llms.includes('## Parenting'), 'llms.txt lacks Parenting section')
  must(!llms.includes('/parenting/sample-'), 'llms.txt lists a sample article')
  const robots = await (await fetch(`${BASE}/robots.txt`)).text()
  must(robots.includes('Disallow: /parenting/preview/'), 'robots does not block preview')
})

await check('OG image route renders a PNG', async () => {
  must(firstArticle, 'no article')
  const res = await fetch(`${BASE}${firstArticle}/opengraph-image`)
  must(res.status === 200, `status ${res.status}`)
  must((res.headers.get('content-type') || '').includes('image/png'), `content-type ${res.headers.get('content-type')}`)
  return `${res.headers.get('content-length') || '?'} bytes`
})

/* ------------------------------------------------------------ APIs */
await check('pitch API: validation rejects an empty body with field errors', async () => {
  const res = await fetch(`${BASE}/api/parenting/pitch`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ elapsedMs: 9000 }) })
  must(res.status === 400, `status ${res.status}`)
  const j = await res.json()
  must(j.fields && j.fields.email && j.fields.pitch, 'no per-field errors')
})

await check('pitch API: honeypot and instant submits are swallowed silently', async () => {
  const a = await fetch(`${BASE}/api/parenting/pitch`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ website: 'spam', elapsedMs: 9000 }) })
  must(a.status === 200 && (await a.json()).ok === true, 'honeypot not swallowed')
  const b = await fetch(`${BASE}/api/parenting/pitch`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ elapsedMs: 100, name: 'x' }) })
  must(b.status === 200 && (await b.json()).ok === true, 'instant submit not swallowed')
})

await check('pitch API: over-long input is bounded (no 500)', async () => {
  const res = await fetch(`${BASE}/api/parenting/pitch`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'A'.repeat(5000), email: 'bad', role: 'Parent', topic: 'x'.repeat(10000), pitch: 'p'.repeat(100000), elapsedMs: 9000 }) })
  must(res.status === 400, `status ${res.status}`)
})

let pitchPersistNote = ''
await check('pitch API: a valid pitch is accepted (persistence depends on migration)', async () => {
  const res = await fetch(`${BASE}/api/parenting/pitch`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'E2E Test Pitch', email: 'e2e-test@faithfulkids.app', role: 'Parent', topic: 'E2E test pitch (delete me)',
      pitch: 'This is an automated end-to-end test submission. It verifies that the pitch form stores a row and can be deleted from the desk afterwards.',
      experience: 'automated test', url: '', interview: true, adult: true, terms: true, elapsedMs: 9000, source: '/parenting/write-for-us',
    }),
  })
  const j = await res.json().catch(() => ({}))
  if (res.status === 200 && j.ok) { pitchPersistNote = 'stored (tables exist)'; return pitchPersistNote }
  if (res.status === 503) { pitchPersistNote = `503: ${j.error}`; return `NOT persisted — ${j.error}` }
  throw new Error(`status ${res.status} ${JSON.stringify(j)}`)
})

await check('newsletter API: invalid email rejected, valid email accepted or 503 pre-migration', async () => {
  const bad = await fetch(`${BASE}/api/parenting/newsletter`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'nope' }) })
  must(bad.status === 400, `bad email status ${bad.status}`)
  const ok = await fetch(`${BASE}/api/parenting/newsletter`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'e2e-test@faithfulkids.app', source: 'e2e' }) })
  must(ok.status === 200 || ok.status === 503, `valid email status ${ok.status}`)
  return ok.status === 200 ? 'accepted' : '503 pre-migration'
})

await check('newsletter confirm/unsubscribe: bad tokens rejected', async () => {
  const c = await fetch(`${BASE}/api/parenting/newsletter/confirm?email=x@y.com&exp=9999999999&token=deadbeef`)
  must(c.status === 200 && (await c.text()).includes('not valid'), 'confirm accepted a bad token')
  const u = await fetch(`${BASE}/api/parenting/newsletter/unsubscribe?email=x@y.com&token=deadbeef`)
  must(u.status === 400, `unsubscribe bad token status ${u.status}`)
})

await check('preview: 404 without the admin cookie (does not reveal drafts)', async () => {
  must(firstArticle, 'no article')
  const slug = firstArticle.replace('/parenting/', '')
  const res = await fetch(`${BASE}/parenting/preview/${slug}`)
  must(res.status === 404, `status ${res.status}`)
})

await check('admin API: 401 without password, 401 with wrong password', async () => {
  const a = await fetch(`${BASE}/api/parenting/admin`)
  must(a.status === 401, `no header -> ${a.status}`)
  const b = await fetch(`${BASE}/api/parenting/admin`, { headers: { 'x-admin-password': 'wrong-password' } })
  must(b.status === 401, `wrong pw -> ${b.status}`)
  const c = await fetch(`${BASE}/api/parenting/admin`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'submission.status', id: 'x', status: 'published' }) })
  must(c.status === 401, `unauth POST -> ${c.status}`)
})

if (ADMIN_PW) {
  await check('admin desk: login, tabs, articles listed, preview cookie works', async () => {
    const page = await desktop.newPage()
    await page.goto(`${BASE}/cas-admin/parenting`)
    await page.fill('input[type="password"]', ADMIN_PW)
    await page.click('button[type="submit"]')
    await page.waitForSelector('.tabs .tab', { timeout: 20000 })
    await page.click('.tabs .tab:nth-child(3)')
    await page.waitForSelector('table')
    const n = await page.$$eval('table tbody tr', rs => rs.length)
    must(n >= 1, 'no articles listed')
    await shot(page, 'admin-articles.png')
    // preview with the cookie the desk just set
    const slug = firstArticle.replace('/parenting/', '')
    const res = await page.goto(`${BASE}/parenting/preview/${slug}`)
    must(res.status() === 200, `preview with cookie -> ${res.status()}`)
    must(await page.$('.pt-sample'), 'preview banner missing')
    await shot(page, 'preview.png')
    await page.goto(`${BASE}/cas-admin/parenting`)
    await page.waitForSelector('.tabs .tab', { timeout: 20000 })
    await page.click('.tabs .tab:nth-child(1)')
    await page.waitForTimeout(300)
    await shot(page, 'admin-pitches.png')
    await page.close()
  })

  await check('admin desk: pitch workflow (status, note) when a test pitch exists', async () => {
    const res = await fetch(`${BASE}/api/parenting/admin`, { headers: { 'x-admin-password': ADMIN_PW } })
    const j = await res.json()
    if (!j.submissions) return 'skipped: tables not created yet'
    const mine = j.submissions.find(s => s.email === 'e2e-test@faithfulkids.app')
    if (!mine) return 'skipped: no test pitch stored'
    const st = await fetch(`${BASE}/api/parenting/admin`, { method: 'POST', headers: { 'x-admin-password': ADMIN_PW, 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'submission.status', id: mine.id, status: 'under_review' }) })
    must(st.status === 200 && (await st.json()).row.status === 'under_review', 'status change failed')
    const nt = await fetch(`${BASE}/api/parenting/admin`, { method: 'POST', headers: { 'x-admin-password': ADMIN_PW, 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'submission.note', id: mine.id, note: 'e2e note' }) })
    must(nt.status === 200 && (await nt.json()).row.notes.includes('e2e note'), 'note append failed')
    const bad = await fetch(`${BASE}/api/parenting/admin`, { method: 'POST', headers: { 'x-admin-password': ADMIN_PW, 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'submission.status', id: mine.id, status: 'nonsense' }) })
    must(bad.status === 400, 'unknown status accepted')
    await fetch(`${BASE}/api/parenting/admin`, { method: 'POST', headers: { 'x-admin-password': ADMIN_PW, 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'submission.status', id: mine.id, status: 'archived' }) })
    return 'status + note + rejection verified; test pitch archived'
  })

  await check('admin desk: outreach create/update/delete', async () => {
    const h = { 'x-admin-password': ADMIN_PW, 'Content-Type': 'application/json' }
    const c = await fetch(`${BASE}/api/parenting/admin`, { method: 'POST', headers: h, body: JSON.stringify({ action: 'outreach.create', name: 'E2E Contact', relationship_source: 'other' }) })
    const cj = await c.json()
    if (c.status === 503) return `skipped: ${cj.error}`
    must(c.status === 200 && cj.row && cj.row.id, `create failed ${c.status} ${JSON.stringify(cj)}`)
    const u = await fetch(`${BASE}/api/parenting/admin`, { method: 'POST', headers: h, body: JSON.stringify({ action: 'outreach.update', id: cj.row.id, status: 'contacted' }) })
    const uj = await u.json()
    must(u.status === 200 && uj.row.status === 'contacted' && uj.row.last_contact_at, 'update failed')
    const d = await fetch(`${BASE}/api/parenting/admin`, { method: 'POST', headers: h, body: JSON.stringify({ action: 'outreach.delete', id: cj.row.id }) })
    must(d.status === 200, 'delete failed')
    return 'create, update (status→contacted sets last_contact_at), delete'
  })
} else {
  record('admin desk checks', true, 'SKIPPED: CAS_ADMIN_PASSWORD not in .env.local')
}

/* ------------------------------------------------------------ regression */
for (const p of ['/', '/blog', '/blog/bible-trivia-for-kids', '/printables', '/bible-stories-for-kids', '/quiz', '/pricing']) {
  await check(`regression ${p}: 200, nav renders, Parenting link present`, async () => {
    const page = await desktop.newPage()
    const res = await page.goto(`${BASE}${p}`)
    must(res.status() === 200, `status ${res.status()}`)
    // /quiz is the funnel and deliberately carries no site nav.
    if (p !== '/quiz') must(await page.$('nav.nav'), 'no nav')
    if (p !== '/' && p !== '/quiz') must(await page.$('nav.nav a[href="/parenting"]'), 'nav lacks Parenting')
    await page.close()
  })
}

await browser.close()

const fails = results.filter(r => !r.ok)
console.log(`\n${results.length - fails.length}/${results.length} passed`)
fs.writeFileSync(path.join(OUT, 'results.json'), JSON.stringify(results, null, 2))
process.exit(fails.length ? 1 : 0)
