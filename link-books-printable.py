#!/usr/bin/env python3
"""Links-at-birth for /printables/books-of-the-bible (Oct 29, 2026).

Target: "books of the bible printable" 1,000/mo ads / 402 clickstream, KD 0;
"books of the bible bookmark" 390/mo. Natural hosts: the 66 book trivia
posts (each is about one of the books on the chart), memory-verse posts,
Sunday school / homeschool guides.

Usage: --dry-run first. Idempotent.
"""
import argparse, hashlib, re
from pathlib import Path

BLOG = Path(__file__).resolve().parent / "content" / "blog"
SKIP = re.compile(r"-vs-|bible-app|apps-for|apps-by|educational-apps|adventures-in-odyssey|-review$|where-to-watch")

URL = "/printables/books-of-the-bible"
MATCH = re.compile(r"-bible-trivia$|memory-verse|books-of-the-bible|sunday-school|homeschool|bible-study-for-kids|how-to-read")
SENTENCES = [
    "Keep the order straight while you quiz: our free [printable books of the Bible chart](/printables/books-of-the-bible) shows all 66 in their groups, with chapter counts and cut-out bookmarks.",
    "If the books' order is still fuzzy, print our free [books of the Bible chart and bookmarks](/printables/books-of-the-bible) — grouped the way the Bible groups them, which is the actual memory trick.",
    "Pair this with our free [printable books of the Bible chart](/printables/books-of-the-bible): one page for the wall, two cut-out bookmarks for their Bibles, no sign-up.",
    "A free [books of the Bible printable](/printables/books-of-the-bible) — chart plus bookmarks, with every book's chapter count — makes a good companion sheet.",
]


def insert_mid(text, sentence):
    lines = text.split("\n")
    h2s = [i for i, l in enumerate(lines) if l.startswith("## ")]
    if len(h2s) >= 4:
        at = h2s[3]
        while at > 0 and not lines[at - 1].strip():
            at -= 1
        lines.insert(at, ""); lines.insert(at + 1, sentence)
        return "\n".join(lines)
    while lines and not lines[-1].strip():
        lines.pop()
    return "\n".join(lines + ["", sentence, ""])


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()
    posts = {p.stem: p for p in sorted(BLOG.glob("*.md"))}
    plan = []
    for slug, p in posts.items():
        t = p.read_text()
        if SKIP.search(slug) or not MATCH.search(slug):
            continue
        if f"]({URL})" in t or f"]({URL} " in t:
            continue
        s = SENTENCES[int(hashlib.sha256((slug + URL).encode()).hexdigest()[:8], 16) % len(SENTENCES)]
        plan.append((slug, p, t, s))
    for slug, p, t, s in plan:
        if a.dry_run:
            print(f"  {slug}")
        else:
            p.write_text(insert_mid(t, s))
    print(f"{'would add' if a.dry_run else 'added'} {len(plan)} links")


if __name__ == "__main__":
    main()
