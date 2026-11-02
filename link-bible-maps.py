#!/usr/bin/env python3
"""Links-at-birth for /printables/bible-maps/* and /printables/bible-timeline
(Nov 2, 2026). A page nothing points at does not rank.

Deep-link policy: each post gets at most ONE new link, to the most specific
map for its story (first matching target wins, ordered specific → general).
Posts that already link any of these URLs are skipped — idempotent.

Usage: --dry-run first.
"""
import argparse, hashlib, re
from pathlib import Path

BLOG = Path(__file__).resolve().parent / "content" / "blog"
SKIP = re.compile(r"-vs-|bible-app|apps-for|apps-by|educational-apps|adventures-in-odyssey|-review$|where-to-watch|gift-guide")

# (url, match, sentence variants) — first matching target claims the post
TARGETS = [
    (
        "/printables/bible-maps/the-exodus",
        re.compile(r"moses|red-sea|burning-bush|ten-commandments|plagues|passover|manna|exodus|golden-calf|mount-sinai"),
        [
            "To see where this happened, our free [printable Exodus route map](/printables/bible-maps/the-exodus) traces the whole journey from Egypt to the Promised Land — real geography, with the traditional stops labeled.",
            "A map makes this story concrete: the free [map of the Exodus](/printables/bible-maps/the-exodus) shows Egypt, the Red Sea, Mount Sinai and the wilderness road on one printable sheet.",
        ],
    ),
    (
        "/printables/bible-maps/pauls-missionary-journeys",
        re.compile(r"paul|silas|barnabas|timothy-|lydia|damascus|athens|corinth|-rome|shipwreck|missionary|pentecost"),
        [
            "To follow the route, our free [map of Paul's missionary journeys](/printables/bible-maps/pauls-missionary-journeys) shows all three journeys and the voyage to Rome, color-coded on one printable sheet.",
            "There is also a free [printable map of Paul's journeys](/printables/bible-maps/pauls-missionary-journeys) — every city in this story at its real location, from Jerusalem to Rome.",
        ],
    ),
    (
        "/printables/bible-maps/the-promised-land",
        re.compile(r"jericho|twelve-spies|rahab|canaan|promised-land|caleb"),
        [
            "To picture the land itself, the free [printable map of Canaan](/printables/bible-maps/the-promised-land) shows the Promised Land as Joshua found it — walled cities, seven nations and the Jordan to cross.",
        ],
    ),
    (
        "/printables/bible-maps/twelve-tribes-of-israel",
        re.compile(r"joshua|tribes-of-israel|deborah|gideon|samson|judges"),
        [
            "For the land these stories happened in, our free [12 tribes of Israel map](/printables/bible-maps/twelve-tribes-of-israel) shows how Joshua divided the Promised Land — printable, with the story behind the division.",
        ],
    ),
    (
        "/printables/bible-maps/israel-in-jesus-time",
        re.compile(r"nazareth|capernaum|galilee|samaritan|woman-at-the-well|zacchaeus|bethlehem|manger|calming-the-storm|feeds-the|walks-on-water|fishers-of-men|transfiguration|triumphal|jesus-heals|jesus-and|boy-jesus|jesus-in-the-temple|young-jesus"),
        [
            "To see where this took place, the free [printable map of Israel in Jesus' time](/printables/bible-maps/israel-in-jesus-time) shows Galilee, Samaria and Judea with every Gospel town at its real location.",
            "A map helps here: our free [map of Israel in Jesus' time](/printables/bible-maps/israel-in-jesus-time) puts Nazareth, Capernaum and Jerusalem at their true distances — kids can trace the journeys with a finger.",
        ],
    ),
    (
        "/printables/bible-maps/ancient-israel",
        re.compile(r"david|solomon|elijah|elisha|king-saul|samuel|jonah|jerusalem|temple|hezekiah|josiah|jeremiah|isaiah|nehemiah"),
        [
            "To place this story on the map, our free [printable map of ancient Israel](/printables/bible-maps/ancient-israel) shows the whole Old Testament land — Jerusalem, the two kingdoms, and the cities the prophets walked.",
            "There is also a free [ancient Israel map to print](/printables/bible-maps/ancient-israel): Dan to Beersheba with 23 labeled places, so kids can find where this happened.",
        ],
    ),
    (
        "/printables/bible-timeline",
        re.compile(r"books-of-the-bible|how-to-read|bible-study|old-testament|new-testament|bible-basics|what-is-the-bible|bible-stories-in-order|sunday-school-lesson|sunday-school-curriculum|homeschool|family-devotions|bible-reading"),
        [
            "To keep the order straight, our free [printable Bible timeline](/printables/bible-timeline) puts all thirteen eras on one chart — honest about dates, from Creation to the early church.",
            "The free [Bible timeline for kids](/printables/bible-timeline) helps here: one printable chart showing where every story sits, Creation to the early church.",
        ],
    ),
]

ANY_URL = re.compile(r"\]\(/printables/bible-(maps(/[a-z-]+)?|timeline)\)")


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
    counts = {}
    for p in sorted(BLOG.glob("*.md")):
        slug = p.stem
        if SKIP.search(slug):
            continue
        t = p.read_text()
        if ANY_URL.search(t):
            continue
        for url, match, sentences in TARGETS:
            if not match.search(slug):
                continue
            s = sentences[int(hashlib.sha256((slug + url).encode()).hexdigest()[:8], 16) % len(sentences)]
            counts[url] = counts.get(url, 0) + 1
            if a.dry_run:
                print(f"  {slug} -> {url.rsplit('/', 1)[-1]}")
            else:
                p.write_text(insert_mid(t, s))
            break
    total = sum(counts.values())
    for url, n in sorted(counts.items()):
        print(f"{n:>4}  {url}")
    print(f"{'would add' if a.dry_run else 'added'} {total} links")


if __name__ == "__main__":
    main()
