#!/usr/bin/env python3
"""Link the puzzle, activity and Sunday-school posts to the word search hub.

Shipped with almost no internal links, which is exactly how /bible-trivia sat at
position 20 for months. A page nothing points at does not rank, however good it
is. Same approach as link-coloring-pages.py: varied sentences chosen by slug
hash so 30 posts never read as boilerplate, and idempotent.

Usage:
  python3 link-word-search.py --dry-run
  python3 link-word-search.py
"""
import argparse, hashlib, re
from pathlib import Path

BLOG = Path(__file__).resolve().parent / "content" / "blog"
TARGET = re.compile(r"puzzle|maze|activit|game|sunday-school|printable|worksheet|riddle|bingo|crossword")
SKIP = re.compile(r"bible-app|apps-by-age|apps-for-tweens|educational-apps|vs-faithful-kids")
ALREADY = re.compile(r"\]\((?:https://faithfulkids\.app)?/printables/bible-word-search[)#?/]")

SENTENCES = [
    "We also drew a set of [free Bible word searches](/printables/bible-word-search) — eleven puzzles you can play in the browser or print for a class.",
    "For a quieter activity, our [Bible word search puzzles](/printables/bible-word-search) hide twelve words from one story in each grid.",
    "There are eleven [printable Bible word searches](/printables/bible-word-search) on our site, each with its answer key on the page.",
    "If you need something with no prep at all, the [Bible word search](/printables/bible-word-search) plays on a phone and prints on one sheet.",
    "Pair this with a [Bible word search puzzle](/printables/bible-word-search) — Noah, Christmas, Easter, David and Goliath and more.",
    "Our [free Bible word search](/printables/bible-word-search) works the same way: play it on screen, or print it for the table.",
    "Sunday school leaders: the [Bible word searches](/printables/bible-word-search) print one to a sheet with the answer key included.",
    "Twelve words from a single story: try our [Bible word search puzzles](/printables/bible-word-search), free and with no sign-up.",
    "For older children who find coloring dull, a [Bible word search](/printables/bible-word-search) holds attention longer.",
    "We have eleven [Bible word search puzzles for kids](/printables/bible-word-search), playable online and free to print.",
]

def pick(slug):
    return SENTENCES[int(hashlib.sha256(slug.encode()).hexdigest()[:8], 16) % len(SENTENCES)]

def insert(text, s):
    lines = text.split("\n")
    faq = next((i for i, l in enumerate(lines) if re.match(r"^## (Frequently Asked Questions|FAQ)", l)), None)
    if faq is not None:
        end = faq
        while end > 0 and not lines[end - 1].strip():
            end -= 1
        lines.insert(end, ""); lines.insert(end + 1, s)
        return "\n".join(lines), "before-faq"
    while lines and not lines[-1].strip():
        lines.pop()
    return "\n".join(lines + ["", s, ""]), "end-of-body"

def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()
    done = skipped = 0; where = {}
    for p in sorted(BLOG.glob("*.md")):
        if not TARGET.search(p.stem) or SKIP.search(p.stem):
            continue
        t = p.read_text()
        if ALREADY.search(t):
            skipped += 1; continue
        new, w = insert(t, pick(p.stem))
        where[w] = where.get(w, 0) + 1; done += 1
        if a.dry_run:
            print(f"  {p.stem}  [{w}]")
        else:
            p.write_text(new)
    print(f"\n{'would link' if a.dry_run else 'linked'}: {done}   already had it: {skipped}")
    print(f"placement: {where}")

if __name__ == "__main__":
    main()
