#!/usr/bin/env python3
"""Contextual inbound links -> /printables/bible-crossword.

Same pattern as link-trivia-game.py: idempotent, dry-runnable, one varied
sentence per post (slug-hashed so phrasing and anchor text differ post to
post), inserted at a natural seam rather than appended as boilerplate.

Why this page: "bible crossword puzzles" is 2,400/mo at KD 10 and the hub
ships today with zero inbound links. The single most repeated lesson of this
repo: a page nothing points at does not rank, however good it is.
"""
import argparse, hashlib, os, re, sys

BLOG = os.path.join(os.path.dirname(os.path.abspath(__file__)), "content", "blog")
DEST = "bible-crossword"

# Posts whose readers would genuinely want a printable Bible crossword:
# the games/activities cluster + printables + quiet/screen-free posts.
TARGET = re.compile(
    r"bible-games|sunday-school-games|family-game|bible-activities"
    r"|printable|word-search|puzzle|rainy|screen-free|quiet"
    r"|riddles|charades|bingo|crafts|car-ride|road-trip|worksheets"
)
EXCLUDE = set()

ALREADY = re.compile(r"\]\((?:https://faithfulkids\.app)?/printables/bible-crossword(?=[)/#?])")

SENTENCES = [
    "For pencil-and-paper review, our [Bible crossword puzzles](/printables/bible-crossword) interlock clues from the stories themselves -- seven free printables with answer keys.",
    "There are also seven free [printable Bible crosswords](/printables/bible-crossword) -- each built from one story's own details, playable online or on paper.",
    "If your kids like puzzles, the [Bible crossword puzzles](/printables/bible-crossword) ask what happened in the story, not just how the names are spelled -- free, with answer keys.",
    "A quieter option for the same shelf: free [Bible crossword puzzles](/printables/bible-crossword), from Noah's Ark to the miracles of Jesus, printable on one sheet each.",
    "Pair it with a [printable Bible crossword](/printables/bible-crossword) -- the clues come from the story itself, so finishing one is a comprehension check in disguise.",
    "Our [free Bible crosswords](/printables/bible-crossword) cover Christmas, Easter, Noah, Moses, and David and Goliath -- each plays in the browser and prints with its clues.",
    "For the puzzle-lover at the table, there's a whole set of [Bible crossword puzzles](/printables/bible-crossword) -- free to print, answer keys included.",
    "And when the room needs to get quiet, hand out a [Bible crossword](/printables/bible-crossword) -- seven free story-based puzzles, no sign-up.",
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
