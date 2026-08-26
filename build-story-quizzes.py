#!/usr/bin/env python3
"""Extract each story episode's quiz into lib/story-quizzes.json for the blog.

The quiz.txt files live outside this Next project (../bible/), so they cannot be
read at build time. This bakes them into a JSON file the story template imports.

CLAUDE.md warns these files exist in five format variants. The parser below is
adapted from make-trivia-video.py (already proven across all 310 files) with one
addition: many files carry the explanation inline as

    Answer: B — "quoted verse" (Reference)

rather than a labelled `Explanation:` line, so both shapes are captured.

Usage:  python3 build-story-quizzes.py
"""
import json
import re
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
BLOG = HERE / "content" / "blog"
OUT = HERE / "lib" / "story-quizzes.json"

QUESTIONS_PER_POST = 3   # match the app exactly: 3 questions, Bible Master at 3/3


def frontmatter(path):
    t = path.read_text(encoding="utf-8", errors="replace")
    m = re.match(r"^---\n(.*?)\n---", t, re.S)
    d = {}
    if m:
        for line in m.group(1).split("\n"):
            if ":" in line:
                k, v = line.split(":", 1)
                d[k.strip()] = v.strip().strip('"')
    return d


def parse_quiz(path):
    text = path.read_text(encoding="utf-8", errors="replace")
    starts = list(re.finditer(r"(?m)^(?:\*{0,2}Question\s*\d+\s*[:.]\*{0,2}|\d+\.)\s*", text))
    out = []
    for i, m in enumerate(starts):
        seg = text[m.end(): starts[i + 1].start() if i + 1 < len(starts) else len(text)]
        am = re.search(r"(?m)^A\)", seg)
        if not am:
            continue
        qtext = " ".join(seg[:am.start()].split()).strip()
        opts = dict(re.findall(r"(?m)^([A-D])\)\s*(.+)$", seg))
        cm = re.search(r"(?:Correct Answer|ANSWER|Answer)\s*:\s*([A-D])", seg)
        if len(opts) != 4 or not cm or not qtext:
            continue
        # explanation: labelled form first, then the inline "Answer: B — ..." form
        why = ""
        em = re.search(r"Explanation\s*:\s*(.+?)(?:\n\n|$)", seg, re.S)
        if em:
            why = " ".join(em.group(1).split())
        else:
            im = re.search(r"(?:Correct Answer|ANSWER|Answer)\s*:\s*[A-D]\s*[—–-]\s*(.+?)(?:\n\n|$)",
                           seg, re.S)
            if im:
                why = " ".join(im.group(1).split())
        out.append({
            "q": qtext,
            "options": [opts[k].strip() for k in "ABCD"],
            "correct": "ABCD".index(cm.group(1)),
            "why": why,
        })
    return out


def main():
    data, missing, empty = {}, [], []
    for md in sorted(BLOG.glob("*.md")):
        fm = frontmatter(md)
        series, ep, slug = fm.get("seriesSlug"), fm.get("episode"), fm.get("slug")
        if not (series and ep and slug):
            continue
        stem = re.sub(r"-for-kids$", "", slug)
        qpath = ROOT / "bible" / f"{series}-series" / f"{int(ep):02d}-{stem}" / "quiz.txt"
        if not qpath.exists():
            missing.append(slug)
            continue
        qs = parse_quiz(qpath)
        if not qs:
            empty.append(slug)
            continue
        data[slug] = qs[:QUESTIONS_PER_POST]

    OUT.write_text(json.dumps(data, indent=0, ensure_ascii=False))
    total = sum(len(v) for v in data.values())
    print(f"posts with a quiz : {len(data)}")
    print(f"questions written : {total}")
    print(f"quiz.txt missing  : {len(missing)}")
    print(f"parsed but empty  : {len(empty)}")
    for s in (missing + empty)[:10]:
        print(f"   - {s}")
    print(f"\nwrote {OUT.relative_to(HERE)}")


if __name__ == "__main__":
    main()
