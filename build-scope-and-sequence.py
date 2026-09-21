#!/usr/bin/env python3
"""Regenerate content/blog/faithful-kids-scope-and-sequence.md from
../bible-kids/src/data/all-series.ts. The page's whole claim is that it is
exact; never hand-edit the tables — edit this script or the app data.
See the 21 Sep 2026 version of the page for the prose; this script only
rewrites the table sections between the markers."""
import re, json, glob, os, sys
from pathlib import Path
HERE = Path(__file__).resolve().parent
src = (HERE.parent / "bible-kids/src/data/all-series.ts").read_text()
page = HERE / "content/blog/faithful-kids-scope-and-sequence.md"
blog = {os.path.basename(f)[:-3] for f in glob.glob(str(HERE / "content/blog/*.md"))}
parts = re.split(r'\n  \{\s*\n\s*id: ', src)[1:]
S = []
for p in parts:
    head = p.split('episodes: [')[0]
    if 'private: true' in head: continue
    title = re.search(r"title: '([^']+)'", head).group(1).replace("\\'", "'")
    sub = re.search(r"subtitle: '([^']*)'", head); sub = (sub.group(1) if sub else '').replace("\\'", "'")
    eps = []
    for m in re.finditer(r"id: (\d+),\s*\n\s*slug: '([^']+)',\s*\n\s*title: '([^']+)',\s*\n\s*bibleRef: '([^']*)'", p):
        n, eslug, et, ref = m.groups(); base = re.sub(r'^\d\d-', '', eslug)
        eps.append(dict(n=int(n), title=et.replace("\\'", "'"), ref=ref, post=(f"{base}-for-kids" if f"{base}-for-kids" in blog else None)))
    q = []
    for m in re.finditer(r'\bquiz:\s*\[', p):
        i = p.index('[', m.start()); d = 0; j = i
        while True:
            if p[j] == '[': d += 1
            elif p[j] == ']':
                d -= 1
                if d == 0: break
            j += 1
        q.append(len(re.findall(r'\bquestion:', p[i:j])))
    for e, c in zip(eps, q): e['q'] = c
    S.append(dict(title=title, subtitle=sub, episodes=eps))
tot = sum(len(x['episodes']) for x in S); totq = sum(e['q'] for x in S for e in x['episodes'])
print(f"{len(S)} series, {tot} lessons, {totq} questions")
if page.exists():
    txt = page.read_text()
    if f"{tot} lessons" not in txt or f"{totq:,} questions" not in txt:
        print("WARNING: page counts differ from data — regenerate the page prose (see 21 Sep 2026 generation in git) and rerun.", file=sys.stderr); sys.exit(1)
    print("page counts match data")
