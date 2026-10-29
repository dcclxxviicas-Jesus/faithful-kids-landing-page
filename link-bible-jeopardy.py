#!/usr/bin/env python3
"""Links-at-birth for /bible-jeopardy (Oct 29, 2026).

Target: "bible jeopardy" — 3,600/mo ads, 2,548/mo clickstream, KD 0, flat
year-round. SERP is jeopardylabs user templates + YouTube; the page ships with
contextual in-links from the trivia/games cluster on day one because a page
nothing points at does not rank (the most repeated lesson in this repo).

Usage: --dry-run first. Idempotent: skips posts already linking the target.
"""
import argparse, hashlib, re
from pathlib import Path

BLOG = Path(__file__).resolve().parent / "content" / "blog"
SKIP = re.compile(r"-vs-|bible-app|apps-for|apps-by|educational-apps|adventures-in-odyssey|-review$|where-to-watch")

URL = "/bible-jeopardy"
MATCH = re.compile(r"trivia|youth|sunday-school-games|games-for|game(s)?-|icebreaker|family-bible|quiz-questions")
SENTENCES = [
    "If your group loves a game-show format, our free [Bible Jeopardy board](/bible-jeopardy) runs 6 categories and 30 questions with team scoring — put it on a TV and host it like the real thing.",
    "For a ready-made game night, play our free [Bible Jeopardy](/bible-jeopardy): a real 6-category board, up to four teams, every answer backed by its verse.",
    "Want the game-show version? The free [Bible Jeopardy game](/bible-jeopardy) deals 30 questions from $100 to $500 across 6 categories — no sign-up, no prep.",
    "There is also a playable [Bible Jeopardy board](/bible-jeopardy) — 6 categories, team scoring, and a verse with every answer — built for Sunday school and youth group screens.",
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
