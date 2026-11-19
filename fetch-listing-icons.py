#!/usr/bin/env python3
"""Logos for APPROVED directory submissions (Nov 19, 2026, owner's ask: a logo
on every listing wherever one exists, it looks much better than a letter).

Curated listings carry `icon` in lib/christian-apps.json. Submissions live in
Supabase with no icon column, so their logos go in lib/submitted-icons.json
({slug: CDN url}), which lib/app-directory-db.ts reads.

For every approved submission without a logo it tries, in order: the App
Store icon (iTunes lookup), the Google Play icon, then the website's
apple-touch-icon / largest icon. Saves a 256px webp to CDN app-icons/<slug>.webp.
Look at what it picked before committing (a site icon can be a favicon blur).

Run after approving, from this folder:  ~/.fk-venv/bin/python3 fetch-listing-icons.py
Then commit lib/submitted-icons.json and deploy.
"""
import io, json, re, sys, time, urllib.request, urllib.parse
from pathlib import Path
import boto3
from PIL import Image

HERE = Path(__file__).resolve().parent
MAP = HERE / 'lib' / 'submitted-icons.json'
CDN = 'https://d3g07v1w0lehiv.cloudfront.net'
UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15'

def env():
    e = {}
    for line in (HERE / '.env.local').read_text().splitlines():
        if '=' in line and not line.startswith('#'):
            k, v = line.split('=', 1); e[k.strip()] = v.strip().strip('"')
    return e

def get(u, raw=False):
    for i in range(3):
        try:
            b = urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': UA}), timeout=30).read()
            return b if raw else b.decode('utf8', 'ignore')
        except Exception as ex:
            err = ex; time.sleep(2)
    raise err

def candidates(r):
    m = re.search(r'id(\d+)', r.get('ios_url') or '')
    if m:
        res = json.loads(get(f'https://itunes.apple.com/lookup?id={m.group(1)}&country=us')).get('results')
        if res and res[0].get('artworkUrl512'): yield 'app store', res[0]['artworkUrl512']
    if r.get('android_url'):
        h = get(r['android_url'] + ('&' if '?' in r['android_url'] else '?') + 'hl=en_US')
        m = re.search(r'<meta property="og:image" content="([^"]+)"', h)
        if m: yield 'google play', m.group(1)
    if r.get('web_url'):
        base = r['web_url']; h = get(base)
        links = re.findall(r'<link[^>]+>', h, re.I)
        def href(tag):
            m = re.search(r'href="([^"]+)"', tag); return urllib.parse.urljoin(base, m.group(1)) if m else None
        for tag in links:
            if 'apple-touch-icon' in tag.lower(): yield 'site apple-touch-icon', href(tag)
        sized = []
        for tag in links:
            if re.search(r'rel="[^"]*icon', tag, re.I):
                s = re.search(r'sizes="(\d+)x', tag); sized.append((int(s.group(1)) if s else 0, href(tag)))
        for _, u in sorted(sized, reverse=True): yield 'site icon', u

def main():
    e = env()
    url, key = e['SUPABASE_URL'], e['SUPABASE_SECRET_KEY']
    req = urllib.request.Request(f'{url}/rest/v1/app_directory_submissions?select=*&status=eq.approved',
                                 headers={'apikey': key, 'Authorization': f'Bearer {key}'})
    rows = json.loads(urllib.request.urlopen(req, timeout=30).read())
    icons = json.loads(MAP.read_text()) if MAP.exists() else {}
    s3 = boto3.client('s3')
    for r in rows:
        slug = r.get('slug')
        if not slug or slug in icons: continue
        done = False
        for src, u in candidates(r):
            if not u or u.lower().endswith('.svg') or '.ico' in u.lower(): continue
            try:
                im = Image.open(io.BytesIO(get(u, raw=True))).convert('RGBA')
            except Exception: continue
            if min(im.size) < 96: continue  # a favicon blur is worse than the letter
            w, h = im.size; side = min(w, h)
            im = im.crop(((w - side) // 2, (h - side) // 2, (w + side) // 2, (h + side) // 2)).resize((256, 256), Image.LANCZOS)
            bg = Image.new('RGB', im.size, (255, 255, 255)); bg.paste(im, mask=im.split()[3])
            b = io.BytesIO(); bg.save(b, 'WEBP', quality=88)
            s3.put_object(Bucket='faithfulkids-videos', Key=f'app-icons/{slug}.webp', Body=b.getvalue(),
                          ContentType='image/webp', CacheControl='public, max-age=31536000')
            icons[slug] = f'{CDN}/app-icons/{slug}.webp'
            print(f'{slug}: {src} {u}'); done = True; break
        if not done: print(f'{slug}: no usable logo found, the letter stays')
    MAP.write_text(json.dumps(dict(sorted(icons.items())), indent=1) + '\n')

if __name__ == '__main__':
    main()
