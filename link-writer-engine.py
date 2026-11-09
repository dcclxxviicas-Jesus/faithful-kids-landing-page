#!/usr/bin/env python3
"""Links-at-birth for the Nov 9, 2026 writer-engine + parent-discovery batch.

Four new posts (christian-writing-jobs, how-to-write-a-devotional,
how-to-write-an-op-ed, best-christian-blogs). Trio-style interlinks live
inside the posts themselves; this script adds the INBOUND contextual links
from existing posts. Explicit source maps, idempotent, --dry-run first.
"""
import argparse
from pathlib import Path

BLOG = Path(__file__).resolve().parent / "content" / "blog"

GROUPS = [
    {
        "url": "/blog/how-to-write-a-devotional",
        "sentence": "If writing these yourself appeals to you, our guide to [how to write a devotional](/blog/how-to-write-a-devotional) covers the four-part format and the markets that pay $30 a piece for them.",
        "sources": ["15-minute-family-devotions", "bible-devotions-for-kids-daily", "30-day-family-bible-challenge"],
    },
    {
        "url": "/blog/christian-writing-jobs",
        "sentence": "Prefer writing to filming? The same niche pays writers too; our [Christian writing jobs](/blog/christian-writing-jobs) guide lists the markets and verified rates.",
        "sources": ["christian-ugc", "christian-brands-that-work-with-influencers"],
    },
    {
        "url": "/blog/best-christian-blogs",
        "sentence": "For ongoing reading beyond this list, our roundup of the [best Christian blogs for parents](/blog/best-christian-blogs) covers mom, dad, homeschool and teen-parenting sites, every one verified active.",
        "sources": [
            "christian-parenting-resources",
            "best-christian-parenting-books",
            "christian-parenting-podcasts",
            "christian-parenting-101-biblical-principles",
            "homeschool-bible-curriculum-comparison",
            "bible-stories-for-homeschool",
            "how-to-teach-kids-the-bible",
            "christian-parenting-boundaries",
        ],
    },
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
    added = 0
    for g in GROUPS:
        for s in g["sources"]:
            p = BLOG / f"{s}.md"
            if not p.exists():
                print(f"  SKIP missing source: {s}")
                continue
            t = p.read_text()
            if f"]({g['url']})" in t:
                continue
            if a.dry_run:
                print(f"  {s} -> {g['url']}")
            else:
                p.write_text(insert_mid(t, g["sentence"]))
            added += 1
    print(f"{'would add' if a.dry_run else 'added'} {added} links")


if __name__ == "__main__":
    main()
