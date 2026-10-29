#!/usr/bin/env python3
"""Links-at-birth for /printables/valentine-bible-verse-cards (Oct 29, 2026).

Feb cluster: "valentines bible verses" 4,400/mo ads KD 0 annualized, Feb peak
higher; winning SERP shape is printable verse cards. Hosts: the love/kindness
verse posts, memory-verse posts, Sunday-school and seasonal craft/game posts.

Usage: --dry-run first. Idempotent.
"""
import argparse, hashlib, re
from pathlib import Path

BLOG = Path(__file__).resolve().parent / "content" / "blog"
SKIP = re.compile(r"-vs-|bible-app|apps-for|apps-by|educational-apps|adventures-in-odyssey|-review$|where-to-watch")

URL = "/printables/valentine-bible-verse-cards"
MATCH = re.compile(r"love|kind|friend|valentine|memory-verse|sunday-school-crafts|sunday-school-games|bible-verses-for|bible-verses-about")
SENTENCES = [
    "For Valentine's Day, our free [printable Valentine Bible verse cards](/printables/valentine-bible-verse-cards) put twelve of these verses on color-your-own cards with To/From lines — ready for a class exchange.",
    "Come February, the free [Valentine Bible verse cards](/printables/valentine-bible-verse-cards) turn short love verses into cards kids color and hand out — four to a sheet, no sign-up.",
    "There is also a set of free [Valentine Bible verse cards for kids](/printables/valentine-bible-verse-cards): twelve short love verses as line-art cards children color before giving away.",
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
