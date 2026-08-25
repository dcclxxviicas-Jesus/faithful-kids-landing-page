#!/usr/bin/env python3
"""Add a contextual in-body link to the playable /bible-trivia game.

Why this exists (Aug 25, 2026): /bible-trivia is our flagship embeddable
linkable asset -- the one the backlink engine pitches to churches and bloggers --
and ZERO of 528 blog posts linked to it. GSC had it at position 20.3 on 12
impressions. Meanwhile 44 posts already linked to /printables/bible-trivia-pack,
the PAPER version of the same asset. So the site pointed readers at the
printable and never at the playable.

What it does:
  - targets trivia / quiz / games / sunday-school / activity posts
  - inserts ONE sentence at the end of the post's "How to Use These Questions"
    section (or before the FAQ, or at the end of the body)
  - picks the sentence deterministically from a varied pool keyed on the slug,
    so anchor text and phrasing differ post to post (no boilerplate footprint)
  - is idempotent: a post that already links to /bible-trivia is skipped

The three highest-impression posts (bible-trivia-for-kids, bible-games-for-kids,
bible-trivia-for-teens) are EXCLUDED here and linked by hand instead -- they
carry ~85% of the cluster's impressions and deserve a better placement than a
tail-end sentence.

Usage:
  python3 link-trivia-game.py --dry-run
  python3 link-trivia-game.py
"""
import argparse
import hashlib
import re
from pathlib import Path

BLOG = Path(__file__).resolve().parent / "content" / "blog"

# Posts linked by hand, with prominent placement -- see LINKING-NOTES.md
HAND_LINKED = {
    "bible-trivia-for-kids",
    "bible-games-for-kids",
    "bible-trivia-for-teens",
}

TARGET = re.compile(r"trivia|quiz|games|sunday-school|activities|icebreaker")

# Already links to the game page? Match ](/bible-trivia) exactly -- must NOT
# match /blog/bible-trivia-for-kids, so require a non-slug char after.
ALREADY = re.compile(r"\]\((?:https://faithfulkids\.app)?/bible-trivia(?=[)#?])")

# Varied closers. Each has distinct phrasing AND distinct anchor text.
SENTENCES = [
    "Want to skip the printing? Our [free Bible trivia game](/bible-trivia) deals ten questions at a time, right in the browser.",
    "If you would rather let a screen keep score, play our [online Bible trivia game](/bible-trivia) -- 100 questions, three levels, no sign-up.",
    "For a version that scores itself, try the [Bible trivia game](/bible-trivia) on our site and let the kids chase the streak counter.",
    "No printer and no prep: our [play-along Bible trivia game](/bible-trivia) runs on any phone, which makes it a good one for the car.",
    "Prefer to play on a screen? Our [free online Bible quiz](/bible-trivia) shuffles a fresh round every time you play.",
    "Our [Bible trivia game for kids](/bible-trivia) does the same thing digitally -- pick a level, get ten questions, see the verse behind every answer.",
    "You can also hand over a phone and let kids run our [interactive Bible trivia game](/bible-trivia) themselves.",
    "Teachers and youth leaders: the [embeddable Bible trivia game](/bible-trivia) drops straight onto a church website, free and with no ads.",
    "For a screen-based round, our [Bible trivia game](/bible-trivia) keeps score for you so everyone can just play.",
    "When you want zero setup, our [online Bible trivia for kids](/bible-trivia) is one tap and always ready to go.",
    "Want these same questions without reading them all aloud? Play the [Bible trivia game](/bible-trivia) instead.",
    "Our free [Bible quiz game](/bible-trivia) covers the same ground with a streak counter kids genuinely chase.",
    "Short on time? The [Bible trivia game](/bible-trivia) on our site runs a full round in about five minutes.",
    "If the group is restless, switch to our [Bible trivia game online](/bible-trivia) and let the timer do the work.",
    "There is a screen version too: our [free Bible trivia for kids](/bible-trivia) deals a random ten-question round on any device.",
    "Rather not print anything? The [Bible trivia quiz](/bible-trivia) on our site is free and works on a phone.",
    "Kids who like a scoreboard tend to prefer our [Bible trivia game online](/bible-trivia), which tracks the streak for them.",
    "We built a [playable Bible trivia game](/bible-trivia) for exactly this -- three levels, a verse with every answer, no ads.",
    "For nights when nobody wants to read questions aloud, our [free Bible quiz for kids](/bible-trivia) takes over.",
    "The same questions live in our [Bible trivia game](/bible-trivia) if you would rather tap than print.",
    "Running this with a big group? Put our [online Bible trivia](/bible-trivia) on the screen and play as teams.",
    "Our [Bible trivia app for kids](/bible-trivia) is free in the browser -- no download, no account, no ads.",
    "If you want something the kids can play alone, point them at our [Bible trivia quiz for kids](/bible-trivia).",
    "There is also a [free Bible trivia game](/bible-trivia) on our site that reshuffles every round, so it never plays the same twice.",
    "Churches are welcome to embed our [Bible trivia game](/bible-trivia) on their own site at no cost.",
    "Want it to run itself? Our [interactive Bible quiz](/bible-trivia) handles the questions, the scoring, and the verses.",
]


def pick(slug):
    h = hashlib.sha256(slug.encode()).hexdigest()
    return SENTENCES[int(h[:8], 16) % len(SENTENCES)]


def insert(text, sentence):
    """Return (new_text, where) or (None, reason)."""
    lines = text.split("\n")

    # 1. End of the "How to Use These Questions" section
    start = next((i for i, l in enumerate(lines)
                  if re.match(r"^## How to Use These Questions", l)), None)
    if start is not None:
        end = next((i for i in range(start + 1, len(lines))
                    if lines[i].startswith("## ")), len(lines))
        while end > start and not lines[end - 1].strip():
            end -= 1
        lines.insert(end, "")
        lines.insert(end + 1, sentence)
        return "\n".join(lines), "how-to-use"

    # 2. Just before the FAQ
    faq = next((i for i, l in enumerate(lines)
                if re.match(r"^## (Frequently Asked Questions|FAQ)", l)), None)
    if faq is not None:
        end = faq
        while end > 0 and not lines[end - 1].strip():
            end -= 1
        lines.insert(end, "")
        lines.insert(end + 1, sentence)
        return "\n".join(lines), "before-faq"

    # 3. End of body
    while lines and not lines[-1].strip():
        lines.pop()
    lines += ["", sentence, ""]
    return "\n".join(lines), "end-of-body"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    done = skipped = 0
    where_counts = {}
    for path in sorted(BLOG.glob("*.md")):
        slug = path.stem
        if slug in HAND_LINKED or not TARGET.search(slug):
            continue
        text = path.read_text()
        if ALREADY.search(text):
            skipped += 1
            continue
        sentence = pick(slug)
        new, where = insert(text, sentence)
        where_counts[where] = where_counts.get(where, 0) + 1
        done += 1
        if args.dry_run:
            print(f"  {slug:<44} [{where}]")
            print(f"      {sentence[:118]}")
        else:
            path.write_text(new)

    print(f"\n{'would link' if args.dry_run else 'linked'}: {done}"
          f"   already had it: {skipped}")
    print(f"placement: {where_counts}")


if __name__ == "__main__":
    main()
