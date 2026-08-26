#!/usr/bin/env python3
"""Verify every stated count in the copy matches what actually exists.

Written after a set grew from 16 to 26 pages and SIX places kept claiming 16 --
including lib/lead-emails.ts, which meant the magnet email promised "All 16
pages in one PDF" while delivering a 26-page file.

check-links.py catches a link that points nowhere. Nothing caught a number that
had quietly become wrong, and a wrong number in copy is a false claim to a
customer, not just a bug.

Ground truth is DERIVED from the data, never hardcoded here -- otherwise this
file becomes the next thing that goes stale.

Usage:
  python3 check-counts.py
"""
import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
BLOG = HERE / "content" / "blog"

# ---------------------------------------------------------------- ground truth
def truth():
    t = {}

    src = (HERE / "lib" / "coloring-pages.ts").read_text()
    t["coloring pages"] = len(re.findall(r"^\s{4}slug: '", src, re.M))
    t["easter coloring pages"] = src.count("season: 'easter'")
    t["christmas coloring pages"] = src.count("season: 'christmas'")

    t["word searches"] = len(json.loads((HERE / "lib" / "word-searches.json").read_text()))

    quizzes = json.loads((HERE / "lib" / "story-quizzes.json").read_text())
    t["story quizzes"] = len(quizzes)
    t["quiz questions"] = sum(len(v) for v in quizzes.values())

    posts = list(BLOG.glob("*.md"))
    t["blog posts"] = len(posts)
    stories = 0
    for p in posts:
        head = p.read_text()[:900]
        if re.search(r"^seriesSlug:", head, re.M) and re.search(r"^episode:", head, re.M):
            stories += 1
    t["story posts"] = stories
    return t


# Counts written as words slipped past the first version of this script: the
# Christmas hub said "Six nativity pages" while rendering five, and no numeral
# appeared anywhere to catch.
WORDS = {"one": 1, "two": 2, "three": 3, "four": 4, "five": 5, "six": 6, "seven": 7,
         "eight": 8, "nine": 9, "ten": 10, "eleven": 11, "twelve": 12,
         "sixteen": 16, "twenty": 20, "twenty-six": 26}


def as_int(tok):
    tok = tok.strip().lower()
    return int(tok) if tok.isdigit() else WORDS.get(tok)


NUM = r"(\d+|[A-Za-z]+(?:-[a-z]+)?)"

# Claim patterns: (regex with one number group, truth key, human label)
CLAIMS = [
    (r"(\d+)\s+(?:free\s+)?(?:printable\s+)?Bible coloring pages", "coloring pages", "Bible coloring pages"),
    (r"All (\d+) (?:Bible coloring )?pages", "coloring pages", "all N pages"),
    (r"(\d+) Printables", "coloring pages", "N Printables"),
    (r"(\d+) pages in one PDF", "coloring pages", "N pages in one PDF"),
    (r"(\d+) Bible scenes", "coloring pages", "N Bible scenes"),
    (r"(\d+) scenes covering", "coloring pages", "N scenes covering"),
    (r"(\d+)\s+(?:free\s+)?printable Bible word search", "word searches", "word search puzzles"),
    (NUM + r"\s+printable puzzles", "word searches", "N printable puzzles"),
    (NUM + r"\s+nativity pages", "christmas coloring pages", "N nativity pages"),
    (NUM + r"\s+pages walking Holy Week", "easter coloring pages", "N Holy Week pages"),
    (NUM + r"\s+pages cover Holy Week", "easter coloring pages", "N Holy Week pages"),
]

SCAN = list((HERE / "app").rglob("*.tsx")) + list((HERE / "lib").glob("*.ts"))


def main():
    T = truth()
    print("GROUND TRUTH (derived, not hardcoded)")
    for k, v in T.items():
        print(f"  {k:<26} {v}")

    problems = []
    for f in SCAN:
        if "node_modules" in str(f):
            continue
        text = f.read_text()
        for pat, key, label in CLAIMS:
            if key is None:
                continue
            for m in re.finditer(pat, text, re.I):
                claimed = as_int(m.group(1))
                if claimed is None:
                    continue          # not a number word at all
                if claimed != T[key]:
                    problems.append((f.relative_to(HERE), label, claimed, T[key],
                                     " ".join(m.group(0).split())))

    print(f"\nstated counts that do not match: {len(problems)}")
    for f, label, claimed, real, snippet in problems:
        print(f"  {f}")
        print(f"      claims {claimed}, actual {real}   [{label}]  \"{snippet[:60]}\"")

    print("\n" + ("CLEAN — every stated count matches the data"
                  if not problems else f"{len(problems)} STALE COUNTS"))
    sys.exit(1 if problems else 0)


if __name__ == "__main__":
    main()
