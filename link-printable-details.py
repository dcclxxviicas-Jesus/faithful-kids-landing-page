#!/usr/bin/env python3
"""Give every printable DETAIL page contextual inbound links from the blog.

WHY
---
The hubs are well linked (/printables/bible-coloring-pages has 30 inbound links,
/printables/bible-word-search has 42). The 36 individual scene and puzzle pages
had ZERO, reachable only from their own hub grid. Each of those pages targets its
own keyword -- "david and goliath coloring page" 1,600/mo, "christmas word
search" 14,800/mo at KD 0 -- and a page nothing points at does not rank. This
project has now learned that same lesson on /bible-trivia, on the coloring hub,
and on the word search hub.

HOW IT AVOIDS THE USUAL FAILURES
--------------------------------
- ONE printable link per post, ever. Link stuffing reads as spam and dilutes the
  signal it is meant to send.
- Targets are claimed in specificity order. The dedicated Noah story gets the
  Noah puzzle; the twenty other Advent posts fall through to the Christmas word
  search rather than fighting over the nativity scene.
- Patterns are anchored on slug tokens: (^|-)star(-|$). An unanchored "star"
  matched "how-to-start-family-bible-time" on the first attempt.
- Anchor text is the page's own keyword, varied across several templates and
  chosen by slug hash so no two posts read identically.
- Idempotent. A post already linking to that URL is skipped, so reruns are safe.

Usage:
  python3 link-printable-details.py --dry-run
  python3 link-printable-details.py
"""
import argparse
import hashlib
import re
from pathlib import Path

BLOG = Path(__file__).resolve().parent / "content" / "blog"
CP = "/printables/bible-coloring-pages"
WS = "/printables/bible-word-search"

# (url, slug-pattern, cap, anchor phrase, kind)
# Ordered: narrow story matches claim their posts before the broad seasonal ones.
TARGETS = [
    # --- coloring scenes: one exact story each -------------------------------
    (f"{CP}/creation",              r"(^|-)(creation|in-the-beginning)(-|$)", 3, "Creation coloring page", "cp"),
    (f"{CP}/adam-and-eve-garden",   r"(^|-)the-garden-and-the-fall(-|$)",     2, "Adam and Eve coloring page", "cp"),
    (f"{CP}/noahs-ark",             r"(^|-)(noah|noahs)(-|$)",                2, "Noah's Ark coloring page", "cp"),
    (f"{CP}/moses-red-sea",         r"(^|-)(crossing-the-red-sea|red-sea)(-|$)", 2, "Red Sea coloring page", "cp"),
    (f"{CP}/david-and-goliath",     r"(^|-)david-and-goliath(-|$)",           2, "David and Goliath coloring page", "cp"),
    (f"{CP}/daniel-lions-den",      r"(^|-)daniel-in-the-lions-den(-|$)",     2, "Daniel in the lions' den coloring page", "cp"),
    (f"{CP}/the-fiery-furnace",     r"(^|-)the-fiery-furnace(-|$)",           2, "fiery furnace coloring page", "cp"),
    (f"{CP}/jonah-and-the-big-fish", r"(^|-)jonah(-|s)?",                     3, "Jonah coloring page", "cp"),
    (f"{CP}/jesus-calms-the-storm", r"(^|-)calming-the-storm(-|$)",           2, "Jesus calms the storm coloring page", "cp"),
    (f"{CP}/the-good-shepherd",     r"(^|-)the-good-shepherd(-|$)",           2, "Good Shepherd coloring page", "cp"),
    (f"{CP}/the-lost-sheep",        r"(^|-)the-lost-sheep(-|$)",              2, "lost sheep coloring page", "cp"),
    (f"{CP}/the-good-samaritan",    r"(^|-)the-good-samaritan(-|$)",          2, "Good Samaritan coloring page", "cp"),
    (f"{CP}/road-to-emmaus",        r"(^|-)the-road-to-emmaus(-|$)",          2, "road to Emmaus coloring page", "cp"),
    (f"{CP}/the-last-supper",       r"(^|-)the-last-supper(-|$)",             2, "Last Supper coloring page", "cp"),
    (f"{CP}/palm-sunday",           r"(^|-)(the-triumphal-entry|palm-sunday)(-|$)", 2, "Palm Sunday coloring page", "cp"),
    (f"{CP}/the-cross",             r"(^|-)the-cross(-|$)",                   2, "the cross coloring page", "cp"),
    (f"{CP}/angel-visits-mary",     r"(^|-)an-angel-visits-mary(-|$)",        2, "angel visits Mary coloring page", "cp"),
    (f"{CP}/journey-to-bethlehem",  r"(^|-)the-journey-to-bethlehem(-|$)",    2, "journey to Bethlehem coloring page", "cp"),
    (f"{CP}/wise-men-star",         r"(^|-)the-wise-men(-|$)",                2, "wise men coloring page", "cp"),
    (f"{CP}/armor-of-god",          r"(^|-)the-armor-of-god(-|$)",            1, "Armor of God coloring page", "cp"),
    (f"{CP}/the-empty-tomb",        r"(^|-)the-empty-tomb(-|$)",              2, "empty tomb coloring page", "cp"),
    (f"{CP}/baby-jesus-manger",     r"(^|-)the-christmas-story(-|$)",         2, "baby Jesus in the manger coloring page", "cp"),
    (f"{CP}/jesus-and-the-children", r"(^|-)(jesus-blesses|let-the-children|the-mustard-seed)(-|$)", 2, "Jesus and the children coloring page", "cp"),
    (f"{CP}/shepherds-and-angels",  r"(^|-)(joseph-and-the-angel|christmas-bible-stories)(-|$)", 2, "shepherds and angels coloring page", "cp"),
    (f"{CP}/nativity-scene",        r"(^|-)nativity(-|$)",                    3, "nativity coloring page", "cp"),
    (f"{CP}/resurrection-morning",  r"(^|-)resurrection(-|$)",                3, "resurrection coloring page", "cp"),

    # --- word searches: exact story, then the broad seasonal catch-alls ------
    (f"{WS}/noahs-ark",             r"(^|-)(who-was-noah|noah|book-of-genesis|genesis)(-|s|$)", 2, "Noah's Ark word search", "ws"),
    (f"{WS}/david-and-goliath",     r"(^|-)(who-was-david|david)(-|$)",       3, "David and Goliath word search", "ws"),
    (f"{WS}/daniel",                r"(^|-)daniel(s)?(-|$)",                  3, "Daniel word search", "ws"),
    (f"{WS}/moses",                 r"(^|-)(moses|exodus|book-of-exodus)(-|$)", 3, "Moses word search", "ws"),
    (f"{WS}/fruit-of-the-spirit",   r"(^|-)fruit-of-the-spirit(-|$)",         3, "Fruit of the Spirit word search", "ws"),
    (f"{WS}/books-of-the-bible",    r"(^|-)books-of-the-bible(-|$)",          3, "books of the Bible word search", "ws"),
    (f"{WS}/jesus-miracles",        r"(^|-)(water-into-wine|feeding-the-five-thousand|healing-the-blind-man|the-raising-of-lazarus)(-|$)", 4, "miracles of Jesus word search", "ws"),
    (f"{WS}/armor-of-god",          r"(^|-)(armor-of-god|ephesians)",         2, "Armor of God word search", "ws"),
    (f"{WS}/easter",                r"(^|-)(easter|holy-week|good-friday|lent)",        8, "Easter word search", "ws"),
    # Highest-value target on the site: 14,800/mo at KD 0, and no AI Overview on
    # the SERP. Deliberately given the largest cap.
    (f"{WS}/christmas",             r"(^|-)(christmas|advent)",              14, "Christmas word search", "ws"),
]

TEMPLATES = {
    "cp": [
        "There is a free [{a}](/{u}) on our site too, if they would rather draw the story than only hear it.",
        "We drew a printable [{a}](/{u}) to go with this one. It is free, with no sign-up.",
        "For quiet time afterwards, print the [{a}](/{u}) and let them color while you talk it through.",
        "Pair the story with our free [{a}](/{u}) — one sheet, ready to print.",
        "If your class needs something to do with their hands, there is a [{a}](/{u}) here.",
    ],
    "ws": [
        "Older children who find coloring dull usually take to the [{a}](/{u}) instead. It plays in the browser or prints on one sheet.",
        "There is a free [{a}](/{u}) to go with this, playable on a phone and printable for a class.",
        "For a quieter follow-up, try the [{a}](/{u}) — twelve words hidden in the grid, answer key included.",
        "We built a [{a}](/{u}) around this story. Free, no sign-up, and it works on screen or on paper.",
        "Print the [{a}](/{u}) for the table, or let them play it on screen. Either way it is free.",
    ],
}


def pick(slug, kind):
    pool = TEMPLATES[kind]
    return pool[int(hashlib.sha256(slug.encode()).hexdigest()[:8], 16) % len(pool)]


def insert(text, sentence):
    """Place the sentence before the FAQ if there is one, else at the end.

    Same placement rule as link-trivia-game.py and link-word-search.py, so the
    three linkers cannot fight over the same spot in a post.
    """
    lines = text.split("\n")
    faq = next((i for i, l in enumerate(lines)
                if re.match(r"^## (Frequently Asked Questions|FAQ|Questions)", l)), None)
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

    posts = {p.stem: p for p in sorted(BLOG.glob("*.md"))}
    text = {s: p.read_text() for s, p in posts.items()}
    claimed = set()          # one printable link per post, ever
    plan = []

    for url, pattern, cap, anchor, kind in TARGETS:
        already = re.compile(r"\]\((?:https://faithfulkids\.app)?" + re.escape(url) + r"[)#?]")
        rx = re.compile(pattern)
        taken = 0
        for slug in posts:
            if taken >= cap:
                break
            if slug in claimed or not rx.search(slug):
                continue
            if already.search(text[slug]):
                claimed.add(slug)      # counts as covered, do not double-link
                continue
            # Never link a page to itself, and never link a printable-ish post
            # into a competing printable (e.g. noahs-ark-coloring-pages).
            if slug.replace("-", "") in url.replace("-", "").replace("/", ""):
                continue
            sentence = pick(slug, kind).format(a=anchor, u=url.lstrip("/"))
            plan.append((slug, url, sentence))
            claimed.add(slug)
            taken += 1

    placements = {}
    per_target = {}
    for slug, url, sentence in plan:
        per_target[url] = per_target.get(url, 0) + 1
        new, where = insert(text[slug], sentence)
        placements[where] = placements.get(where, 0) + 1
        if not args.dry_run:
            posts[slug].write_text(new)

    print(f"{'would add' if args.dry_run else 'added'} {len(plan)} links across "
          f"{len(per_target)} printable pages")
    print(f"placement: {placements}\n")
    for url, _, _, _, _ in TARGETS:
        n = per_target.get(url, 0)
        flag = "   <-- STILL ORPHAN" if n == 0 else ""
        print(f"  {n:>2}  {url}{flag}")

    if args.dry_run:
        print("\nsample sentences:")
        for slug, url, s in plan[:6]:
            print(f"\n  [{slug}]\n    {s}")


if __name__ == "__main__":
    main()
