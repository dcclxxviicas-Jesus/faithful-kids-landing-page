#!/usr/bin/env python3
"""Contextual inbound links -> /blog/christmas-bible-trivia.

Same pattern as link-bible-quiz.py: idempotent, dry-runnable, one varied
sentence per post (slug-hashed so phrasing and anchor text differ post to
post), inserted at a natural seam rather than appended as boilerplate.

Why this page: "bible quiz" is 9,900/mo at KD 2 and the page
sits at a brand-new hub with zero inbound links. December demand is several times
the annual average, and the repeated lesson of this repo is that a page
nothing points at does not rank.
"""
import argparse, hashlib, os, re, sys

BLOG = os.path.join(os.path.dirname(os.path.abspath(__file__)), "content", "blog")
DEST = "bible-quiz"

# Posts whose readers would genuinely want a Christmas trivia game:
# the seasonal cluster + the trivia/game cluster + party-planning posts.
TARGET = re.compile(
    r"bible-quiz|quiz-questions|100-bible-trivia|easy-bible-trivia|hard-bible-trivia"
    r"|trivia-for-(kids|teens|adults|youth|seniors)|bible-games|bible-questions"
    r"|sunday-school-games|family-game"
)
EXCLUDE = {"bible-quiz-questions-and-answers-none"}  # self + the kids sibling (already interlinked)

ALREADY = re.compile(r"\]\((?:https://faithfulkids\.app)?/bible-quiz(?=[)#?])")

SENTENCES = [
    "Prefer to be scored? The [free Bible quiz](/bible-quiz) deals ten questions at your level and shows the verse behind every answer.",
    "You can also play this as a game: our [online Bible quiz](/bible-quiz) grades itself, easy to expert, no sign-up.",
    "For an all-ages night, the [Bible quiz hub](/bible-quiz) collects every graded set in one place, with a printable PDF.",
    "Test yourself first on the [interactive Bible quiz](/bible-quiz), then come back for the full list.",
    "The same bank runs our [play-along Bible quiz](/bible-quiz) -- pick easy, medium, or hard and chase the streak.",
    "If the group skews older, start from the [all-ages Bible quiz](/bible-quiz) rather than the kids' game.",
    "There is a screen version: the [Bible quiz online](/bible-quiz) keeps score so you can just read and referee.",
    "Our [Bible quiz with answers](/bible-quiz) shows fifteen starters right on the page before you ever press play.",
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
