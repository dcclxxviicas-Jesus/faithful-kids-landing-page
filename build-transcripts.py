#!/usr/bin/env python3
"""
Copy the lesson scripts into the landing repo as clean transcripts.

Why a copy: the scripts live in ../bible/, which is not part of this repo and
does not exist on Vercel at build time. Same pattern as story-durations.json.

Why clean: script.txt opens with a production header
    Episode 3: Cain and Abel
    (Genesis 4)
    Narrated by Jesus
    ---
that is not spoken and must not be published as if it were.

Output: content/transcripts/<slug>.txt, one per story post, prose only.
Rerun after any script changes. Reports posts with no script so a missing
transcript is a known gap, never a silent one.
"""
import re, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
BIBLE = HERE.parent / "bible"
BLOG = HERE / "content" / "blog"
OUT = HERE / "content" / "transcripts"
OUT.mkdir(parents=True, exist_ok=True)

def frontmatter(text):
    m = re.match(r"^---\n(.*?)\n---", text, re.S)
    d = {}
    if m:
        for line in m.group(1).splitlines():
            k, _, v = line.partition(":")
            d[k.strip()] = v.strip().strip('"')
    return d

def clean(script: str) -> str:
    # Drop everything up to and including the first '---' separator line.
    if "\n---" in script:
        script = script.split("\n---", 1)[1]
    else:
        # No separator: drop leading header-looking lines.
        lines = script.splitlines()
        while lines and re.match(r"^(Episode \d+|\(.*\)|Narrated by)", lines[0].strip()):
            lines.pop(0)
        script = "\n".join(lines)
    # Collapse 3+ newlines, strip stage directions in [brackets] if any.
    script = re.sub(r"\[[^\]]{0,80}\]", "", script)
    script = re.sub(r"\n{3,}", "\n\n", script).strip()
    return script

found = missing = 0
for md in sorted(BLOG.glob("*.md")):
    fm = frontmatter(md.read_text())
    ss, ep, slug = fm.get("seriesSlug"), fm.get("episode"), fm.get("slug")
    if not (ss and ep and slug):
        continue
    folder = f"{int(ep):02d}-{re.sub(r'-for-kids$', '', slug)}"
    src = BIBLE / f"{ss}-series" / folder / "script.txt"
    if not src.exists():
        missing += 1
        print(f"MISSING  {slug}  ->  {src.relative_to(HERE.parent)}", file=sys.stderr)
        continue
    text = clean(src.read_text())
    if len(text.split()) < 120:
        print(f"SHORT    {slug}  ({len(text.split())} words)", file=sys.stderr)
    (OUT / f"{slug}.txt").write_text(text + "\n")
    found += 1

print(f"transcripts written: {found}   missing: {missing}")
