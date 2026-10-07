#!/usr/bin/env python3
"""Contextual inbound links -> /bible-stories-for-kids (the stories hub).

Same pattern as link-trivia-game.py: idempotent, dry-runnable, slug-hashed
sentence variation, natural-seam insertion.

Why: the hub for "bible stories for kids" (1,479/mo) had THREE body links
from 560 posts (Oct 7, 2026). Story retellings get their link from the blog
template (one edit = 200 links); this pass covers the by-age and by-theme
GUIDE posts, whose readers are exactly the hub's audience.
"""
import argparse, hashlib, os, re, sys

BLOG = os.path.join(os.path.dirname(os.path.abspath(__file__)), "content", "blog")
DEST = "bible-stories-hub"

# Posts whose readers would genuinely want a Christmas trivia game:
# the seasonal cluster + the trivia/game cluster + party-planning posts.
TARGET = re.compile(
    r"^bible-stories-|^best-bible-stories|^short-bible-stories"
    r"|bedtime-bible|bible-reading|family-devotions|bible-time"
)
EXCLUDE = set()

ALREADY = re.compile(r"\]\((?:https://faithfulkids\.app)?/bible-stories-for-kids(?=[)#?])")

SENTENCES = [
    "Every story mentioned here is retold in full in our [200 Bible stories for kids](/bible-stories-for-kids) -- simple retellings of the whole Bible, free, Genesis to Revelation.",
    "For the stories themselves, our [Bible stories for kids](/bible-stories-for-kids) library retells all 200 of them simply, with the video lesson beside each one.",
    "All of these come from our free [Bible stories for kids](/bible-stories-for-kids) collection -- the whole Bible as simple retellings, each with discussion questions.",
    "Browse the full shelf at [200 Bible stories for kids](/bible-stories-for-kids) -- every retelling is free and runs from Genesis to Revelation in order.",
    "The complete collection lives at our [Bible stories for kids](/bible-stories-for-kids) hub -- 200 simple retellings, free, in Bible order.",
    "When you want the next story, the whole library is at [Bible stories for kids](/bible-stories-for-kids) -- 200 free retellings from Genesis to Revelation.",
]


def pick(slug):
    h = hashlib.sha256(slug.encode()).hexdigest()
    return SENTENCES[int(h[:8], 16) % len(SENTENCES)]


def insert(text, sentence):
    lines = text.split("\n")
    for pat, name in ((r"^## How to Use", "how-to-use"), (r"^## How to Run", "how-to-run")):
        start = next((i for i, l in enumerate(lines) if re.match(pat, l)), None)
        if start is not None:
            end = next((i for i in range(start + 1, len(lines)) if lines[i].startswith("## ")), len(lines))
            while end > start and not lines[end - 1].strip():
                end -= 1
            lines.insert(end, "")
            lines.insert(end + 1, sentence)
            return "\n".join(lines), name
    faq = next((i for i, l in enumerate(lines) if re.match(r"^## (Frequently Asked Questions|FAQ)", l)), None)
    if faq is not None:
        end = faq
        while end > 0 and not lines[end - 1].strip():
            end -= 1
        lines.insert(end, "")
        lines.insert(end + 1, sentence)
        return "\n".join(lines), "before-faq"
    while lines and not lines[-1].strip():
        lines.pop()
    lines += ["", sentence, ""]
    return "\n".join(lines), "end-of-body"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()
    added = skipped = 0
    for fn in sorted(os.listdir(BLOG)):
        if not fn.endswith(".md"):
            continue
        slug = fn[:-3]
        if slug in EXCLUDE or not TARGET.search(slug):
            continue
        path = os.path.join(BLOG, fn)
        text = open(path, encoding="utf-8").read()
        if ALREADY.search(text):
            skipped += 1
            continue
        new, where = insert(text, pick(slug))
        added += 1
        print(f"  + {slug}  ({where})")
        if not args.dry_run:
            open(path, "w", encoding="utf-8").write(new)
    print(f"{'DRY RUN: would add' if args.dry_run else 'added'} {added}, already linked {skipped}")


if __name__ == "__main__":
    main()
