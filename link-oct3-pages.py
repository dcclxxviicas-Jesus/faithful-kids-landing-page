#!/usr/bin/env python3
"""Contextual inbound links for the Oct 3 page batch (names cluster, books of
the Bible printable, scavenger hunt, fall festival, nativity script).

Same machinery as link-trivia-game.py -- idempotent, dry-runnable, slug-hashed
sentence variation, insertion at a natural seam -- but multi-destination, so
one run wires the whole batch. A page nothing points at does not rank.
"""
import argparse, hashlib, os, re, sys

BLOG = os.path.join(os.path.dirname(os.path.abspath(__file__)), "content", "blog")

# dest-slug -> (TARGET regex, EXCLUDE set, ALREADY regex path, [sentences])
DESTS = [
    ("biblical-names-pair",
     re.compile(r"^who-was-|christian-parenting|raising-godly|christian-gifts|family-devotions|bible-stories-for-toddlers|bible-for-preschool|pray-with"),
     {"biblical-names", "biblical-boy-names", "biblical-girl-names", "unique-biblical-names"},
     re.compile(r"\]\((?:https://faithfulkids\.app)?/blog/biblical-(boy|girl)-names(?=[)#?])"),
     [
        "Expecting or know someone who is? Our [biblical boy names](/blog/biblical-boy-names) and [biblical girl names](/blog/biblical-girl-names) lists pair every name's meaning with the story behind it.",
        "If you're choosing a name, we keep full lists of [biblical boy names](/blog/biblical-boy-names) and [biblical girl names](/blog/biblical-girl-names) -- each with its meaning, verse, and the story it comes from.",
        "Naming a baby after a Bible hero? Start with our [biblical boy names](/blog/biblical-boy-names) or [biblical girl names](/blog/biblical-girl-names) -- meanings, verses, and the stories included.",
        "There's a whole guide to [biblical names](/blog/biblical-names) too -- what they mean, how they work, and lists for [boys](/blog/biblical-boy-names) and [girls](/blog/biblical-girl-names).",
     ]),
    ("books-of-the-bible-printable",
     re.compile(r"-bible-trivia$|sword-drill|sunday-school-lessons|memory-verse|bible-reading|teaching-the-bible|homeschool-bible|bible-curriculum"),
     {"books-of-the-bible-printable", "books-of-the-bible-for-kids", "books-of-the-bible-coloring-pages"},
     re.compile(r"\]\((?:https://faithfulkids\.app)?/blog/books-of-the-bible-printable(?=[)#?])"),
     [
        "To see where this book sits in the whole library, grab our free [books of the Bible chart and flashcards](/blog/books-of-the-bible-printable) -- all 66 in order, printable.",
        "Kids learning to find books fast? The [books of the Bible printable](/blog/books-of-the-bible-printable) has a wall chart, 66 flashcards, and bookmarks, free to copy.",
        "Our [books of the Bible in order](/blog/books-of-the-bible-printable) printable pack (chart, flashcards, bookmarks) turns book-finding into a game worth drilling.",
        "Pair it with the free [books of the Bible chart](/blog/books-of-the-bible-printable) so kids can see exactly where this book lives on the shelf.",
     ]),
    ("bible-scavenger-hunt",
     re.compile(r"bible-games|sunday-school-games|youth-group|family-game|icebreaker|church-fun|bible-activities|rainy"),
     {"bible-scavenger-hunt"},
     re.compile(r"\]\((?:https://faithfulkids\.app)?/blog/bible-scavenger-hunt(?=[)#?])"),
     [
        "For a game that gets everyone moving, our [Bible scavenger hunt](/blog/bible-scavenger-hunt) has three ready-to-play hunts -- verse hunt, object hunt, and a church photo hunt -- with a free printable.",
        "Add our [Bible scavenger hunt](/blog/bible-scavenger-hunt) to the rotation: a verse hunt for readers, an object hunt for littles, and a photo hunt built for youth groups.",
        "If the group needs to burn energy first, the [Bible scavenger hunt](/blog/bible-scavenger-hunt) (free printable, answer key included) does it in twenty minutes flat.",
        "There's also a printable [Bible scavenger hunt](/blog/bible-scavenger-hunt) -- three complete hunts, from around-the-house for preschoolers to a photo hunt for teens.",
     ]),
    ("church-fall-festival-games",
     re.compile(r"sunday-school-games|youth-group|bible-games|church-fun|harvest|thanksgiving-games|family-game"),
     {"church-fall-festival-games"},
     re.compile(r"\]\((?:https://faithfulkids\.app)?/blog/church-fall-festival-games(?=[)#?])"),
     [
        "Planning an October event? Our [church fall festival games](/blog/church-fall-festival-games) list has 25 booth, trunk-or-treat, and big-group games with supply notes.",
        "For harvest season, see the [25 fall festival games for church](/blog/church-fall-festival-games) -- volunteer-proof booths, trunk or treat games, and printable quiet stations.",
        "In the fall, these pair with our [church fall festival games](/blog/church-fall-festival-games) -- 25 ideas that survive forty kids arriving at once.",
     ]),
    ("nativity-play-script-for-kids",
     re.compile(r"christmas|advent|nativity|jesse"),
     {"nativity-play-script-for-kids", "christmas-bible-trivia", "christmas-bible-trivia-for-kids"},
     re.compile(r"\]\((?:https://faithfulkids\.app)?/blog/nativity-play-script-for-kids(?=[)#?])"),
     [
        "If the kids are putting on the story this year, our [free nativity play script](/blog/nativity-play-script-for-kids) runs ten minutes with a cast of 8 to 40 -- nobody memorizes more than two lines.",
        "For the program itself, there's a complete [nativity play script for kids](/blog/nativity-play-script-for-kids) -- free to perform and photocopy, with director's notes.",
        "Our [free printable nativity script](/blog/nativity-play-script-for-kids) covers the performance side: ten minutes, bathrobe shepherds, carols built in.",
        "Add the [kids' nativity play script](/blog/nativity-play-script-for-kids) -- free, ten minutes, scales from 8 kids to 40 -- and the evening plans itself.",
     ]),
]


def pick(slug, dest_key, sentences):
    h = hashlib.sha256(f"{dest_key}:{slug}".encode()).hexdigest()
    return sentences[int(h[:8], 16) % len(sentences)]


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
    for dest_key, target, exclude, already, sentences in DESTS:
        added = skipped = 0
        print(f"\n== {dest_key} ==")
        for fn in sorted(os.listdir(BLOG)):
            if not fn.endswith(".md"):
                continue
            slug = fn[:-3]
            if slug in exclude or not target.search(slug):
                continue
            path = os.path.join(BLOG, fn)
            text = open(path, encoding="utf-8").read()
            if already.search(text):
                skipped += 1
                continue
            new, where = insert(text, pick(slug, dest_key, sentences))
            added += 1
            print(f"  + {slug}  ({where})")
            if not args.dry_run:
                open(path, "w", encoding="utf-8").write(new)
        print(f"  {'DRY: would add' if args.dry_run else 'added'} {added}, already linked {skipped}")


if __name__ == "__main__":
    main()
