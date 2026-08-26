#!/usr/bin/env python3
"""Link the coloring, craft and printable posts to /printables/bible-coloring-pages.

The hub shipped with exactly TWO internal links -- the printables index and
itself -- which is how /bible-trivia sat at position 20 for months. A page
nothing points at does not rank, however good it is.

Targets slugs about coloring, crafts, printables and activities. Deliberately
does NOT touch app-comparison or story posts, where coloring is mentioned only
in passing and a link would be filler.

Idempotent: skips anything already linking to the hub.

Usage:
  python3 link-coloring-pages.py --dry-run
  python3 link-coloring-pages.py
"""
import argparse
import hashlib
import re
from pathlib import Path

BLOG = Path(__file__).resolve().parent / "content" / "blog"
TARGET = re.compile(r"color|craft|printable|activit|maze|bingo|journal|worksheet")
SKIP = re.compile(r"best-bible-app|bible-app-for-kids|apps-by-age|apps-for-tweens|educational-apps")
ALREADY = re.compile(r"\]\((?:https://faithfulkids\.app)?/printables/bible-coloring-pages[)#?]")

SENTENCES = [
    "We drew a set of [free Bible coloring pages](/printables/bible-coloring-pages) to go with these — 16 scenes from Creation to the empty tomb, no email needed.",
    "If you want the pages ready-made, our [Bible coloring pages](/printables/bible-coloring-pages) cover 16 stories and print straight from the browser.",
    "For something to hand over right now, there are 16 [printable Bible coloring pages](/printables/bible-coloring-pages) on our site — free, no sign-up.",
    "Pair this with our [free printable Bible coloring pages](/printables/bible-coloring-pages): bold outlines, one scene per page, made for thick crayons.",
    "We have 16 [Bible coloring pages to print](/printables/bible-coloring-pages) covering the stories most children meet first.",
    "Short on prep time? Our [Bible coloring pages](/printables/bible-coloring-pages) are one click from the page to the printer.",
    "There is a matching set of [Bible story coloring pages](/printables/bible-coloring-pages) on our site, free to print for class or home.",
    "Our [printable Bible coloring sheets](/printables/bible-coloring-pages) work well alongside this — each page names the scripture it comes from.",
    "If a coloring page would help, we drew [16 free ones](/printables/bible-coloring-pages) spanning Genesis to Revelation.",
    "Sunday school leaders: the [Bible coloring pages](/printables/bible-coloring-pages) print as a whole set or one sheet at a time.",
    "You can print any of our [free Bible coloring pages](/printables/bible-coloring-pages) without giving an email address.",
    "For quieter moments, our [Bible coloring pages for kids](/printables/bible-coloring-pages) give the same stories something to do with their hands.",
]


def pick(slug):
    return SENTENCES[int(hashlib.sha256(slug.encode()).hexdigest()[:8], 16) % len(SENTENCES)]


def insert(text, sentence):
    lines = text.split("\n")
    faq = next((i for i, l in enumerate(lines)
                if re.match(r"^## (Frequently Asked Questions|FAQ)", l)), None)
    if faq is not None:
        end = faq
        while end > 0 and not lines[end - 1].strip():
            end -= 1
        lines.insert(end, "")
        lines.insert(end + 1, sentence)
        return "\n".join(lines), "before-faq"
    while lines and not lines[-1].strip():
        lines.pop()
    return "\n".join(lines + ["", sentence, ""]), "end-of-body"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    done = skipped = 0
    where = {}
    for path in sorted(BLOG.glob("*.md")):
        slug = path.stem
        if not TARGET.search(slug) or SKIP.search(slug):
            continue
        text = path.read_text()
        if ALREADY.search(text):
            skipped += 1
            continue
        s = pick(slug)
        new, w = insert(text, s)
        where[w] = where.get(w, 0) + 1
        done += 1
        if args.dry_run:
            print(f"  {slug:<44} [{w}]")
        else:
            path.write_text(new)

    print(f"\n{'would link' if args.dry_run else 'linked'}: {done}   already had it: {skipped}")
    print(f"placement: {where}")


if __name__ == "__main__":
    main()
