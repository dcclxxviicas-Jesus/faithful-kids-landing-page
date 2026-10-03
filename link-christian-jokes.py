#!/usr/bin/env python3
"""Contextual inbound links -> /blog/christian-jokes.

Same pattern as link-trivia-game.py: idempotent, dry-runnable, one varied
sentence per post (slug-hashed so phrasing and anchor text differ post to
post), inserted at a natural seam rather than appended as boilerplate.

Why this page: "christian jokes" is 5,400/mo at KD 0, the post is new today,
and a page nothing points at does not rank. The post is the church-life
humor lane; funny-bible-jokes keeps the Scripture-pun lane.
"""
import argparse, hashlib, os, re, sys

BLOG = os.path.join(os.path.dirname(os.path.abspath(__file__)), "content", "blog")
DEST = "christian-jokes"

# Posts whose readers would genuinely want clean church-life jokes:
# the jokes/humor cluster + games, youth group, and family-night posts.
TARGET = re.compile(
    r"jokes|funny|humor|church-fun|youth-group|icebreaker"
    r"|family-game|bible-games|sunday-school-games|riddles"
    r"|charades|bingo|car-ride|road-trip|trivia-for"
)
EXCLUDE = {DEST}

ALREADY = re.compile(r"\]\((?:https://faithfulkids\.app)?/blog/christian-jokes(?=[)#?])")

SENTENCES = [
    "For humor about church life itself -- pastors, potlucks, and the kids' row -- see our [75 clean Christian jokes](/blog/christian-jokes).",
    "If the table wants jokes about church rather than Bible stories, the [Christian jokes collection](/blog/christian-jokes) covers pastors, potlucks, and church signs -- all clean.",
    "There's a companion list of [clean Christian jokes](/blog/christian-jokes) too: church-life humor, kids-in-church classics, and the best church signs ever posted.",
    "Our [75 Christian jokes](/blog/christian-jokes) are the church-life set -- sermon-length jokes, potluck jokes, and what kids actually say in the pew.",
    "Add a few [funny Christian jokes](/blog/christian-jokes) between rounds -- the church-sign section alone can carry a youth-group night.",
    "For the grown-ups, the [Christian jokes list](/blog/christian-jokes) leans on church culture -- the thermostat ministry, the seventeen-goodbye fellowship dinner, and other documented phenomena.",
    "And when the kids start repeating the same three jokes, restock from our [clean Christian jokes for the whole family](/blog/christian-jokes).",
    "Pair it with our [Christian jokes](/blog/christian-jokes) -- 75 clean ones about church life, from the choir's favorite soda to what kids pray at bedtime.",
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
