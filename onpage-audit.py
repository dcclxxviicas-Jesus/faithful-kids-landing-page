#!/usr/bin/env python3
"""Full on-page SEO audit of a rendered HTML file. Reports PASS/FAIL per check."""
import re, sys, json
from pathlib import Path

p = Path(sys.argv[1])
h = p.read_text()
body = re.sub(r'<script.*?</script>', '', h, flags=re.S)
body = re.sub(r'<style.*?</style>', '', body, flags=re.S)
text = re.sub(r'<[^>]+>', ' ', body)
text = re.sub(r'\s+', ' ', text)

R = []
def chk(ok, name, detail=""):
    R.append((ok, name, detail))

# --- Title ---
m = re.search(r'<title>([^<]*)</title>', h)
t = m.group(1) if m else ''
chk(bool(t), "title present", t)
chk(0 < len(t) <= 60, f"title length {len(t)} (<=60)", t)

# --- Meta description ---
m = re.search(r'<meta name="description" content="([^"]*)"', h)
d = m.group(1) if m else ''
chk(bool(d), "meta description present")
chk(50 <= len(d) <= 158, f"meta desc length {len(d)} (50-158)", d[:80])

# --- Canonical ---
m = re.search(r'<link rel="canonical" href="([^"]*)"', h)
chk(bool(m), "canonical present", m.group(1) if m else "MISSING")

# --- Headings ---
h1s = re.findall(r'<h1[^>]*>(.*?)</h1>', h, re.S)
chk(len(h1s) == 1, f"exactly one H1 (found {len(h1s)})",
    re.sub(r'<[^>]+>', '', h1s[0]) if h1s else "")
levels = [int(x) for x in re.findall(r'<h([1-6])[^>]*>', h)]
skips = [f"h{a}->h{b}" for a, b in zip(levels, levels[1:]) if b - a > 1]
chk(not skips, "no skipped heading levels", ", ".join(skips[:4]))
chk(len(re.findall(r'<h2', h)) >= 3, f"has H2 structure ({len(re.findall(r'<h2', h))} H2s)")

# --- Images ---
imgs = re.findall(r'<img [^>]*>', h)
noalt = [i for i in imgs if 'alt=' not in i]
emptyalt = [i for i in imgs if re.search(r'alt=["\']\s*["\']', i)]
chk(not noalt, f"all {len(imgs)} images have alt", f"{len(noalt)} missing")
chk(True, f"images with empty alt (decorative ok)", str(len(emptyalt)))
lazy = [i for i in imgs if 'loading=' in i]
chk(True, f"images with loading attr", f"{len(lazy)}/{len(imgs)}")

# --- Social ---
for tag in ['og:title', 'og:description', 'og:image', 'og:type', 'og:url',
            'twitter:card', 'twitter:title', 'twitter:image']:
    found = re.search(rf'(property|name)="{re.escape(tag)}" content="([^"]*)"', h)
    chk(bool(found), f"{tag}", (found.group(2)[:52] if found else "MISSING"))

# --- Technical ---
chk(bool(re.search(r'<html[^>]*lang="', h)), "html lang attribute")
chk(bool(re.search(r'name="viewport"', h)), "viewport meta")
robots = re.search(r'<meta name="robots" content="([^"]*)"', h)
chk(not robots or 'noindex' not in robots.group(1),
    "not noindexed", robots.group(1) if robots else "no robots tag (indexable)")

# --- Schema ---
blocks = re.findall(r'type="application/ld\+json"[^>]*>(.*?)</script>', h, re.S)
types, bad = [], 0
for b in blocks:
    # NOTE: do NOT unescape quotes here -- next/react already emits valid JSON.
    # An earlier version did b.replace('\\"','"') and corrupted the FAQPage
    # block, reporting a malformed-schema failure that did not exist.
    try:
        j = json.loads(re.sub(r'^[^{\[]*', '', b))
        types.append(j.get('@type'))
    except Exception:
        bad += 1
chk(bad == 0, f"all {len(blocks)} JSON-LD blocks parse", f"{bad} malformed")
chk(True, "schema types", ", ".join(str(x) for x in types))

# --- Content ---
wc = len(text.split())
chk(wc >= 600, f"word count {wc} (>=600)")

# --- Keyword coverage ---
low = text.lower()
for kw in ['bible app for kids', 'christian app for kids', 'bible app']:
    n = low.count(kw)
    chk(n >= 1, f'keyword "{kw}" x{n}')

# --- Links ---
internal = set(re.findall(r'href="(/[^"#][^"]*)"', h))
internal = {i for i in internal if not re.search(r'\.(css|js|png|webp|jpg|ico|svg)$', i)}
chk(len(internal) >= 5, f"internal links: {len(internal)}", ", ".join(sorted(internal)[:8]))

fails = [r for r in R if not r[0]]
print(f"{'='*72}\nON-PAGE AUDIT: {p.name}\n{'='*72}")
for ok, name, detail in R:
    print(f"  {'PASS' if ok else 'FAIL'}  {name:<42} {detail[:58]}")
print(f"\n  {len(R)-len(fails)}/{len(R)} passed" + (f"  |  {len(fails)} FAILING" if fails else "  |  clean"))
