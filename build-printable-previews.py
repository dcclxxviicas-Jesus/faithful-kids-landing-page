#!/usr/bin/env python3
"""Rebuild the pictures the printable email popup shows (PrintableGate.tsx).

Each preview is page 1 of what ACTUALLY prints or downloads, so the popup
always shows the real sheet:
  page--<route>   every /printables/* page, printed to PDF by headless Chromium
  file--<path>    every PDF the site links on the CDN (printables/*.pdf plus
                  the coloring bundle), rasterised as-is
Output: CDN printable-previews/<key>.webp (360px wide) and
lib/printable-previews.json ({key: name shown as "Get your <name>"}).

Run after adding a printable or changing how one prints:
  npm run build   (the route list is read from .next/server/app/printables)
  ~/.fk-venv/bin/python3 build-printable-previews.py [--base https://faithfulkids.app]
Renders against production by default, so deploy layout changes first.
Needs Playwright in ~/.fk-pw, macOS `sips`, Pillow + boto3 (~/.fk-venv).
Overwrites existing keys: invalidate printable-previews/* on CloudFront
(E20EMHOCVEV5NT) afterwards if any picture changed. Names for new PDFs and
for awkward page titles live in FILE_NAMES / PAGE_NAMES below.
"""
import argparse, json, os, re, subprocess, tempfile, urllib.request
import boto3
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
BUCKET, CDN = 'faithfulkids-videos', 'https://d3g07v1w0lehiv.cloudfront.net'
PAGE_NAMES = {
    '30-day-challenge': '30-Day Family Bible Challenge', 'advent-bible-calendar': 'Advent Bible Reading Calendar',
    'advent-readings': 'Advent Bible Readings', 'bedtime-bible-kit': 'Bedtime Bible Kit',
    'bible-crossword': 'Bible Crossword', 'bible-word-search': 'Bible Word Search', 'bible-maps': 'Bible Maps',
    'bible-timeline': 'Bible Timeline', 'bible-trivia-pack': 'Family Bible Trivia Pack',
    'books-of-the-bible': 'Books of the Bible Chart & Bookmarks', 'christmas-coloring-pages': 'Christmas Coloring Pages',
    'easter-coloring-pages': 'Easter Coloring Pages', 'jesse-tree': 'Jesse Tree Ornaments & Readings',
    'valentine-bible-verse-cards': 'Valentine Bible Verse Cards',
}
FILE_NAMES = {
    'advent-bible-calendar': 'Advent Bible Reading Calendar', 'bible-bingo': 'Bible Bingo', 'bible-charades': 'Bible Charades',
    'bible-jokes': 'Bible Jokes for Kids', 'bible-quiz-questions-for-kids': 'Bible Quiz Questions for Kids',
    'bible-riddles': 'Bible Riddles', 'bible-scavenger-hunt': 'Bible Scavenger Hunt', 'bible-timeline': 'Bible Timeline',
    'bible-trivia-for-adults': 'Bible Trivia for Adults', 'books-of-the-bible-chart': 'Books of the Bible Chart',
    'books-of-the-bible': 'Books of the Bible Chart & Bookmarks', 'childrens-ministry-launch-kit': 'Children’s Ministry Launch Kit',
    'christmas-bible-trivia': 'Christmas Bible Trivia', 'jesse-tree': 'Jesse Tree Ornaments & Readings',
    'nativity-play-script': 'Nativity Play Script', 'coloring-pages--faithful-kids-bible-coloring-pages': 'Bible Coloring Pages Pack',
}
EXTRA_PDFS = ['coloring-pages/faithful-kids-bible-coloring-pages.pdf']

RENDER_JS = r"""
import { chromium } from 'playwright'
import fs from 'fs'
const [OUT, BASE] = process.argv.slice(2)
const routes = fs.readFileSync(OUT + '/routes.txt', 'utf8').trim().split('\n')
const browser = await chromium.launch(); const ctx = await browser.newContext(); const names = {}
for (const r of routes) {
  const page = await ctx.newPage()
  try {
    await page.goto(BASE + '/printables/' + r, { waitUntil: 'networkidle', timeout: 60000 }); await page.waitForTimeout(800)
    names[r] = (await page.locator('h1').first().innerText().catch(() => '')).replace(/\s+/g, ' ').trim()
    await page.pdf({ path: `${OUT}/page--${r.replace(/\//g, '--')}.pdf`, format: 'Letter', printBackground: true, pageRanges: '1' })
  } catch (e) { console.log('FAIL', r, e.message.slice(0, 120)) }
  await page.close()
}
fs.writeFileSync(OUT + '/names.json', JSON.stringify(names)); await browser.close()
"""


def page_name(route, h1):
    if route in PAGE_NAMES:
        return PAGE_NAMES[route]
    if route.startswith('bible-maps/'):
        h1 = h1.replace('Printable Bible Map', '').strip() + ' Map'
    return re.sub(r'^(The|An|A) ', '', h1).replace("'", '’')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--base', default='https://faithfulkids.app')
    base = ap.parse_args().base
    s3 = boto3.client('s3')
    tmp = tempfile.mkdtemp(prefix='fk-previews-')
    app = os.path.join(HERE, '.next/server/app/printables')
    routes = sorted(os.path.relpath(os.path.join(d, f), app)[:-5] for d, _, fs in os.walk(app) for f in fs
                    if f.endswith('.html') and 'conflicted' not in f and not f.endswith(' 2.html'))
    open(f'{tmp}/routes.txt', 'w').write('\n'.join(routes))
    js = os.path.expanduser('~/.fk-pw/_render-previews.mjs')
    open(js, 'w').write(RENDER_JS)
    subprocess.run(['node', js, tmp, base], cwd=os.path.expanduser('~/.fk-pw'), check=True)
    h1s = json.load(open(f'{tmp}/names.json'))
    manifest = {f'page--{r.replace("/", "--")}': page_name(r, h1s.get(r, '')) for r in routes if r in h1s}

    pdfs = [o['Key'][len('printables/'):-4] for pg in s3.get_paginator('list_objects_v2').paginate(Bucket=BUCKET, Prefix='printables/')
            for o in pg.get('Contents', []) if o['Key'].endswith('.pdf')]
    for p in pdfs + [e[:-4] for e in EXTRA_PDFS]:
        key = p.replace('/', '--')
        url = f'{CDN}/printables/{p}.pdf' if not p.startswith('coloring-pages/') else f'{CDN}/{p}.pdf'
        urllib.request.urlretrieve(url, f'{tmp}/file--{key}.pdf')
        if key in FILE_NAMES:
            name = FILE_NAMES[key]
        elif key.startswith('bible-maps--') and f'page--{key}' in manifest:
            name = manifest[f'page--{key}']
        else:
            print('NOTE: add a FILE_NAMES entry for', key); name = 'free printable'
        manifest[f'file--{key}'] = name

    for k in manifest:
        png = f'{tmp}/{k}.png'
        subprocess.run(['sips', '-s', 'format', 'png', f'{tmp}/{k}.pdf', '--out', png], check=True, capture_output=True)
        im = Image.open(png).convert('RGBA')
        flat = Image.new('RGB', im.size, 'white'); flat.paste(im, mask=im.split()[3])  # PDFs are transparent
        flat = flat.resize((360, round(360 * flat.height / flat.width)), Image.LANCZOS)
        flat.save(f'{tmp}/{k}.webp', 'WEBP', quality=82, method=6)
        s3.upload_file(f'{tmp}/{k}.webp', BUCKET, f'printable-previews/{k}.webp',
                       ExtraArgs={'ContentType': 'image/webp', 'CacheControl': 'public, max-age=31536000'})
    json.dump(dict(sorted(manifest.items())), open(os.path.join(HERE, 'lib/printable-previews.json'), 'w'),
              indent=1, ensure_ascii=False)
    print(f'{len(manifest)} previews uploaded; lib/printable-previews.json written; work dir {tmp}')


if __name__ == '__main__':
    main()
