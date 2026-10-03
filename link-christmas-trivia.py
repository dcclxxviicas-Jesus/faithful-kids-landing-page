#!/usr/bin/env python3
"""Contextual inbound links -> /blog/christmas-bible-trivia.

Same pattern as link-trivia-game.py: idempotent, dry-runnable, one varied
sentence per post (slug-hashed so phrasing and anchor text differ post to
post), inserted at a natural seam rather than appended as boilerplate.

Why this page: "christmas trivia questions" is 14,800/mo at KD 0 and the page
sits at position ~22 with 15 inbound links. December demand is several times
the annual average, and the repeated lesson of this repo is that a page
nothing points at does not rank. Run before mid-October or miss the season.
"""
import argparse, hashlib, os, re, sys

BLOG = os.path.join(os.path.dirname(os.path.abspath(__file__)), "content", "blog")
DEST = "christmas-bible-trivia"

# Posts whose readers would genuinely want a Christmas trivia game:
# the seasonal cluster + the trivia/game cluster + party-planning posts.
TARGET = re.compile(
    r"christmas|advent|jesse|nativity|winter|new-year"
    r"|bible-trivia|bible-quiz|trivia-for|bible-games|family-game"
    r"|sunday-school-christmas|christmas-program"
)
EXCLUDE = {DEST, "christmas-bible-trivia-for-kids"}  # self + the kids sibling (already interlinked)

ALREADY = re.compile(r"\]\((?:https://faithfulkids\.app)?/blog/christmas-bible-trivia(?=[)#?])")

SENTENCES = [
    "If the party needs a game, our [Christmas Bible trivia](/blog/christmas-bible-trivia) runs 80 questions in four rounds, easy to expert, with a free printable PDF.",
    "For the gathering itself, these [Christmas trivia questions and answers](/blog/christmas-bible-trivia) cover every age at the table, verse references included.",
    "We also keep a set of [80 Christmas trivia questions](/blog/christmas-bible-trivia) sorted into rounds, so the six-year-old and the Sunday-school veteran both get a fair turn.",
    "Pair it with our [Christmas Bible trivia questions](/blog/christmas-bible-trivia) -- four graded rounds plus a carol round, free to print for church or home.",
    "When dinner winds down, the [Christmas trivia game with answers](/blog/christmas-bible-trivia) settles who actually knows the real story.",
    "Our [printable Christmas Bible trivia](/blog/christmas-bible-trivia) makes an easy party plan: 80 verse-referenced questions and a PDF you can photocopy.",
    "There is a Christmas edition too: [Christmas Bible trivia](/blog/christmas-bible-trivia) in four rounds, with an expert tier built to stump the grandparents.",
    "For December, swap in our [Christmas trivia questions](/blog/christmas-bible-trivia) -- the whole nativity story, easy round to expert round.",
    "Hosting at Christmas? These [Christmas Bible trivia questions and answers](/blog/christmas-bible-trivia) were written for exactly that evening.",
    "The [Christmas Bible trivia set](/blog/christmas-bible-trivia) adds a seasonal round to any of these games, with the verse printed beside every answer.",
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
