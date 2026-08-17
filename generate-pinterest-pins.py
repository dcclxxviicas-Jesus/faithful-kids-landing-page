#!/usr/bin/env python3
"""Generate 1000x1500 vertical Pinterest pin images for every blog post.

Hero art (top 900px, cropped from the CDN hero) + title block on paper
background + brand footer. Uploads to s3://faithfulkids-videos/pin-images/
[slug].jpg -> served via CloudFront. Resumable: skips slugs already in S3.

Usage: pinenv/bin/python generate-pinterest-pins.py [--limit N] [--slug SLUG]
"""
import io, os, re, sys, urllib.request
import boto3
from PIL import Image, ImageDraw, ImageFont

BLOG_DIR = "/Users/cas/Library/CloudStorage/Dropbox/all HeyGen/Personal Projects/Jesus/FaithfulKidsLandingPage/content/blog"
FONT = "/Users/cas/Library/CloudStorage/Dropbox/all HeyGen/Personal Projects/Jesus/Montserrat-Black.ttf"
CDN = "https://d3g07v1w0lehiv.cloudfront.net"
BUCKET = "faithfulkids-videos"
W, H = 1000, 1500
HERO_H = 880
EMERALD = (5, 150, 105)
PAPER = (250, 250, 248)
INK = (20, 32, 27)

s3 = boto3.client("s3")

def existing_pins():
    keys = set()
    paginator = s3.get_paginator("list_objects_v2")
    for page in paginator.paginate(Bucket=BUCKET, Prefix="pin-images/"):
        for o in page.get("Contents", []):
            keys.add(o["Key"].split("/")[-1].replace(".jpg", ""))
    return keys

def title_of(path):
    for line in open(path, encoding="utf-8"):
        m = re.match(r'title:\s*"(.+)"', line.strip())
        if m:
            return m.group(1)
    return None

def wrap(draw, text, font, max_w):
    words, lines, cur = text.split(), [], ""
    for w_ in words:
        t = (cur + " " + w_).strip()
        if draw.textlength(t, font=font) <= max_w:
            cur = t
        else:
            if cur: lines.append(cur)
            cur = w_
    if cur: lines.append(cur)
    return lines

def make_pin(slug, title):
    try:
        raw = urllib.request.urlopen(f"{CDN}/blog-images/{slug}-hero.webp", timeout=30).read()
    except Exception:
        return None  # no hero image for this post
    hero = Image.open(io.BytesIO(raw)).convert("RGB")

    pin = Image.new("RGB", (W, H), PAPER)
    # crop hero to 1000x880, centered
    scale = max(W / hero.width, HERO_H / hero.height)
    hero = hero.resize((round(hero.width * scale), round(hero.height * scale)))
    x = (hero.width - W) // 2
    y = (hero.height - HERO_H) // 2
    pin.paste(hero.crop((x, y, x + W, y + HERO_H)), (0, 0))

    d = ImageDraw.Draw(pin)
    # emerald divider
    d.rectangle([0, HERO_H, W, HERO_H + 10], fill=EMERALD)

    # title, sized to fit
    size = 64
    while size > 34:
        font = ImageFont.truetype(FONT, size)
        lines = wrap(d, title, font, W - 140)
        line_h = size * 1.22
        if len(lines) * line_h <= 380 and len(lines) <= 5:
            break
        size -= 4
    total_h = len(lines) * line_h
    ty = HERO_H + 10 + (H - HERO_H - 10 - 130 - total_h) / 2
    for ln in lines:
        d.text((W / 2, ty), ln, font=font, fill=INK, anchor="ma")
        ty += line_h

    # footer brand
    fw = ImageFont.truetype(FONT, 34)
    d.rectangle([0, H - 110, W, H], fill=EMERALD)
    d.text((W / 2, H - 55), "FaithfulKids.app", font=fw, fill=(255, 255, 255), anchor="mm")

    buf = io.BytesIO()
    pin.save(buf, "JPEG", quality=88)
    return buf.getvalue()

def main():
    limit = None
    only = None
    if "--limit" in sys.argv:
        limit = int(sys.argv[sys.argv.index("--limit") + 1])
    if "--slug" in sys.argv:
        only = sys.argv[sys.argv.index("--slug") + 1]

    done = existing_pins()
    files = sorted(os.listdir(BLOG_DIR))
    made = skipped = missing = 0
    for f in files:
        if not f.endswith(".md"):
            continue
        slug = f[:-3]
        if only and slug != only:
            continue
        if not only and slug in done:
            skipped += 1
            continue
        title = title_of(os.path.join(BLOG_DIR, f))
        if not title:
            continue
        # strip trailing parentheticals for cleaner pins
        clean = re.sub(r"\s*\([^)]*\)\s*$", "", title)
        img = make_pin(slug, clean)
        if img is None:
            missing += 1
            print(f"no hero: {slug}")
            continue
        s3.put_object(
            Bucket=BUCKET, Key=f"pin-images/{slug}.jpg", Body=img,
            ContentType="image/jpeg", CacheControl="public, max-age=31536000",
        )
        made += 1
        if made % 25 == 0:
            print(f"{made} pins made...")
        if limit and made >= limit:
            break
    print(f"done: {made} made, {skipped} already existed, {missing} missing heroes")

if __name__ == "__main__":
    main()

# Manifest refresh (run after generating; then commit lib/pin-manifest.json):
#   python3 - <<'PY'
#   import boto3, json
#   s3 = boto3.client('s3')
#   slugs = [o['Key'].split('/')[-1][:-4]
#            for page in s3.get_paginator('list_objects_v2').paginate(Bucket='faithfulkids-videos', Prefix='pin-images/')
#            for o in page.get('Contents', [])]
#   json.dump(sorted(slugs), open('lib/pin-manifest.json', 'w'), indent=0)
#   PY
