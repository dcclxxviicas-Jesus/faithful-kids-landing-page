#!/usr/bin/env python3
"""October 2026 pre-season push: two link targets found soft in GSC/SERP.

1. /printables/bible-word-search/christmas — targets "christmas word search"
   (14,800/mo, KD 0, pure-artifact SERP, no AIO). Four weeks before the demand
   wave we were NOT in the top 30 (live SERP, Oct 13) with only 14 in-links.
   Every page-1 incumbent is a dedicated puzzle site; links are our only lever.
2. /blog/fun-youth-group-games — Google already prefers it for the head term
   "youth group games" (488 impressions at pos 11.7 vs the by-size post's 90
   at 9.4) but it had 7 in-links against the other post's 34. Feed the horse
   that's running.

Usage: --dry-run first. Idempotent: skips posts already linking the target.
"""
import argparse, hashlib, re
from pathlib import Path

BLOG = Path(__file__).resolve().parent / "content" / "blog"
SKIP = re.compile(r"-vs-|bible-app|apps-for|apps-by|educational-apps|adventures-in-odyssey|-review$")

TARGETS = [
    ("/printables/bible-word-search/christmas",
     re.compile(r"christmas|advent|nativity|jesse-tree|wise-men|sunday-school-games"), [
        "For a quieter moment, our free printable [Christmas word search](/printables/bible-word-search/christmas) hides 12 nativity words from Luke 2 — playable online or printed, answer key included.",
        "Pair it with our free [Christmas word search](/printables/bible-word-search/christmas): 12 words from the nativity story in Luke 2, printable or playable in the browser, no sign-up.",
        "If you need a handout too, the free printable [Christmas word search](/printables/bible-word-search/christmas) covers the Luke 2 story — Mary, the shepherds, Bethlehem and the manger — with an answer key.",
        "There is also a free [Christmas word search printable](/printables/bible-word-search/christmas) built on the Luke 2 vocabulary, ready to print for a class or play online.",
    ]),
    ("/blog/fun-youth-group-games",
     re.compile(r"youth|games-for|game(s)?-|icebreaker|board-games"), [
        "If the room needs to laugh first, start with our [30 fun and funny youth group games](/blog/fun-youth-group-games) — each with exact rules and a supervision flag.",
        "For pure energy-burners, see these [30 fun youth group games](/blog/fun-youth-group-games), sorted by how much laughter they produce.",
        "When you just need the group laughing, these [fun and funny youth group games](/blog/fun-youth-group-games) come with exact rules and the materials you already own.",
    ]),
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
    text = {s: p.read_text() for s, p in posts.items()}
    plan = []

    for url, rx, sentences in TARGETS:
        n = 0
        for slug in posts:
            t = text[slug]
            if SKIP.search(slug) or not rx.search(slug):
                continue
            if slug == url.rsplit("/", 1)[-1]:  # never self-link
                continue
            if f"]({url})" in t or f"]({url} " in t:
                continue
            s = sentences[int(hashlib.sha256((slug + url).encode()).hexdigest()[:8], 16) % len(sentences)]
            plan.append((slug, url, s)); n += 1
        print(f"{url}: +{n}")

    for slug, url, s in plan:
        text[slug] = insert_mid(text[slug], s)
        if a.dry_run:
            print(f"  {slug} -> {url}")
        else:
            posts[slug].write_text(text[slug])
    print(f"{'would add' if a.dry_run else 'added'} {len(plan)} links")


if __name__ == "__main__":
    main()
