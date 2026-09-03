#!/usr/bin/env python3
"""Inbound links for the two new Advent pages (Sep 3 seasonal sprint).

Every new page ships with contextual in-links or it doesn't ship. Targets:
/printables/jesse-tree (10) and /printables/advent-bible-calendar (8), from
Christmas/Advent/nativity posts. A post already carrying 3+ printable links is
left alone. Mid-article placement, one new link per post, idempotent.
Usage: --dry-run first.
"""
import argparse, hashlib, re
from pathlib import Path

BLOG = Path(__file__).resolve().parent / "content" / "blog"
SKIP = re.compile(r"coloring|word-search|printable|-vs-|bible-app|apps-for|apps-by|educational-apps|adventures-in-odyssey")

TARGETS = [
    ("/printables/jesse-tree", 10,
     re.compile(r"(^|-)(advent|jesse)"),
     re.compile(r"(^|-)(christmas|nativity|december)"),
     [
      "New this year: our free [printable Jesse Tree](/printables/jesse-tree) — 25 ornaments to color, one for each day of Advent, each with its daily Scripture reading.",
      "For a daily Advent tradition, our free [Jesse Tree printable set](/printables/jesse-tree) pairs 25 color-in ornaments with the Bible reading each symbol stands for.",
      "Families building an Advent rhythm love the [printable Jesse Tree ornaments](/printables/jesse-tree) — hang one a day and walk the whole Bible story to the manger.",
      "There is a free [Jesse Tree set](/printables/jesse-tree) on our site too: 25 printable ornaments plus the daily readings, no sign-up.",
     ]),
    ("/printables/advent-bible-calendar", 8,
     re.compile(r"(^|-)(advent|christmas-bible|christmas-eve)"),
     re.compile(r"(^|-)(christmas|nativity|december)"),
     [
      "Pair it with our free [Advent Bible reading calendar](/printables/advent-bible-calendar) — 25 short readings from the first promise to the manger, one a night.",
      "For the season's readings, print the free [Advent Bible calendar](/printables/advent-bible-calendar): 25 days of Scripture, prophecy to nativity, on one sheet.",
      "Our [printable Advent reading plan](/printables/advent-bible-calendar) gives you one short passage a night from December 1 to Christmas Day — free, no sign-up.",
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
    used = set(); plan = []
    for url, goal, rx1, rx2, sentences in TARGETS:
        have = 0
        for rx in (rx1, rx2):
            for slug in posts:
                if have >= goal:
                    break
                t = text[slug]
                if slug in used or SKIP.search(slug) or not rx.search(slug):
                    continue
                if f"]({url}" in t or t.count("](/printables") >= 3:
                    continue
                s = sentences[int(hashlib.sha256((slug + url).encode()).hexdigest()[:8], 16) % len(sentences)]
                plan.append((slug, url, s)); used.add(slug); have += 1
        print(f"{url}: +{have}")
    for slug, url, s in plan:
        text[slug] = insert_mid(text[slug], s)
        if a.dry_run:
            print(f"  {slug} -> {url}")
        else:
            posts[slug].write_text(text[slug])
    print(f"{'would add' if a.dry_run else 'added'} {len(plan)} links")


if __name__ == "__main__":
    main()
