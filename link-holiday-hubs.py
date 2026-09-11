#!/usr/bin/env python3
"""Contextual links from seasonal posts up to their /holidays hub.

The five hubs shipped (8118b01) with exactly one inbound link each — the
footer — which is the discounted kind. Same orphan failure as the printables,
three weeks before the season. Calendar priority: Thanksgiving (Nov peak,
nearest), then Christmas; the spring/fall hubs can be run later with the same
script by extending TARGETS. Match regexes mirror lib/holidays.ts.

Usage: --dry-run first.
"""
import argparse, hashlib, re
from pathlib import Path

BLOG = Path(__file__).resolve().parent / "content" / "blog"
SKIP = re.compile(r"-vs-|bible-app|apps-for|apps-by|educational-apps|adventures-in-odyssey")

TARGETS = [
    ("/holidays/thanksgiving", re.compile(r"thanksgiving|thankful|gratitude|grateful"), [
        "All of our Thanksgiving resources — verses, devotions, and activities — live together on the [Thanksgiving Bible hub](/holidays/thanksgiving).",
        "For the whole season's worth, our [Thanksgiving hub](/holidays/thanksgiving) gathers every gratitude verse list, devotion, and activity in one place.",
        "More for the season: the [Thanksgiving Bible activities hub](/holidays/thanksgiving) collects everything we have on gratitude and giving thanks.",
    ]),
    ("/holidays/christmas", re.compile(r"christmas|advent|nativity|bethlehem|wise-men|manger"), [
        "Everything we have for the season — Advent devotions, the nativity story, trivia, printables — is gathered on the [Christmas Bible hub](/holidays/christmas).",
        "For the rest of the season, our [Christmas hub](/holidays/christmas) collects every Advent and nativity resource in one place.",
        "More for December: the [Christmas Bible activities hub](/holidays/christmas) gathers the whole season's stories, trivia, and printables.",
        "Planning the whole month? The [Christmas hub](/holidays/christmas) lists every Advent devotion, story, and printable we publish.",
    ]),
]

# Hand-written links from the three highest-authority posts (top 5 = 42% of
# blog impressions) — one seasonal sentence each, linking both hubs.
PRIORITY = [
    ("bible-trivia-for-kids",
     "In the holiday season, our [Thanksgiving](/holidays/thanksgiving) and [Christmas](/holidays/christmas) hubs gather every seasonal verse list, devotion, trivia round, and printable in one place."),
    ("bible-trivia-for-teens",
     "Running a holiday youth night? The [Thanksgiving](/holidays/thanksgiving) and [Christmas](/holidays/christmas) hubs collect all our seasonal trivia, verses, and activities."),
    ("bible-verses-for-sick-kids",
     "For seasonal encouragement, our [Thanksgiving](/holidays/thanksgiving) and [Christmas](/holidays/christmas) hubs gather every comfort-filled verse list and gentle activity for the holidays."),
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
    used = set(); plan = []

    for slug, sentence in PRIORITY:
        if slug in text and "](/holidays/" not in text[slug]:
            plan.append((slug, "priority", sentence)); used.add(slug)

    for url, rx, sentences in TARGETS:
        n = 0
        for slug in posts:
            t = text[slug]
            if slug in used or SKIP.search(slug) or not rx.search(slug):
                continue
            if f"]({url}" in t:
                continue
            s = sentences[int(hashlib.sha256((slug + url).encode()).hexdigest()[:8], 16) % len(sentences)]
            plan.append((slug, url, s)); used.add(slug); n += 1
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
