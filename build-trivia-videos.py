#!/usr/bin/env python3
"""Match every trivia post to a video from the book it is actually about.

Before this, getTriviaVideo() served exactly TWO videos across 84 trivia pages:
Old Testament trivia got "In the Beginning: Creation" and New Testament trivia
got "An Angel Visits Mary". So Ruth trivia showed a Creation video.

Writes lib/trivia-videos.json: slug -> { videoSrc, videoTitle }.

Matching order:
  1. seasonal / thematic slugs -> the series that actually covers them
  2. book name in the slug -> a story post whose `book` field contains it
  3. testament fallback (only where we genuinely have no episode for that book)

Usage: python3 build-trivia-videos.py
"""
import json
import re
from pathlib import Path

HERE = Path(__file__).resolve().parent
BLOG = HERE / "content" / "blog"
OUT = HERE / "lib" / "trivia-videos.json"
CDN = "https://d3g07v1w0lehiv.cloudfront.net"

# Slugs whose subject is a theme or season rather than a book.
THEMATIC = {
    "christmas": "birth-of-jesus",
    "easter": "he-is-risen",
    "resurrection": "he-is-risen",
    "parables": "teachings-of-jesus",
    "miracles": "miracles-of-jesus",
    "creation": "genesis",
    "new-testament": "birth-of-jesus",
    "old-testament": "genesis",
    "jesus": "miracles-of-jesus",
    "disciples": "jesus-begins-ministry",
    "apostle": "pauls-adventures",
    "paul": "pauls-adventures",
    "david": "king-davids-reign",
    "moses": "exodus",
    "women": "judges-and-ruth",
}

OT_SERIES = {"genesis", "exodus", "promised-land", "judges-and-ruth", "rise-of-kings",
             "king-davids-reign", "solomon-and-the-kingdom", "elijah-and-elisha",
             "exile-and-faith", "the-return-home"}


def frontmatter(p):
    t = p.read_text(encoding="utf-8", errors="replace")
    m = re.match(r"^---\n(.*?)\n---", t, re.S)
    d = {}
    if m:
        for line in m.group(1).split("\n"):
            if ":" in line:
                k, v = line.split(":", 1)
                d[k.strip()] = v.strip().strip('"')
    return d


posts = [frontmatter(p) for p in sorted(BLOG.glob("*.md"))]
stories = [p for p in posts if p.get("seriesSlug") and p.get("episode")]


def media(story):
    ep = f"{int(story['episode']):02d}"
    stem = re.sub(r"-for-kids$", "", story["slug"])
    return {
        "videoSrc": f"{CDN}/bible/{story['seriesSlug']}-series/{ep}-{stem}/lesson-video.mp4",
        "videoTitle": story["title"].split(":")[0].replace(" for Kids", "").strip(),
    }


def first_of_series(slug):
    got = [s for s in stories if s["seriesSlug"] == slug]
    got.sort(key=lambda s: int(s["episode"]))
    return got[0] if got else None


def by_book(token):
    """Find a story for this book.

    Slug and title come FIRST. The `book` frontmatter is often a group like
    "Judges/Ruth" or "Matthew/Mark/Luke/John", so matching it alone gave Ruth
    trivia a Samson video -- right series, wrong story. A slug match finds the
    actual Ruth episodes.
    """
    tok = token.lower().strip()
    if not tok:
        return None
    named = [s for s in stories
             if tok in s["slug"].replace("-", " ") or tok in s.get("title", "").lower()]
    if named:
        named.sort(key=lambda s: int(s["episode"]))
        return named[len(named) // 2]
    hits = [s for s in stories if tok in (s.get("book", "")).lower()]
    if not hits:
        return None
    hits.sort(key=lambda s: int(s["episode"]))
    return hits[len(hits) // 2]


out, unmatched, fallback = {}, [], []
for p in posts:
    slug = p.get("slug", "")
    if "trivia" not in slug:
        continue
    story = None

    for key, series in THEMATIC.items():
        if key in slug:
            story = first_of_series(series)
            break

    if story is None:
        token = re.sub(r"-?bible-?trivia.*$", "", slug).strip("-")
        token = re.sub(r"^\d+-", "", token)          # "1-kings" -> "kings"
        token = token.replace("-for-kids", "").replace("-", " ").strip()
        if token:
            story = by_book(token)

    # Books we have no episode for (minor prophets, most epistles) and the
    # generic trivia pages. Send them somewhere plausible for their part of
    # Scripture rather than to one hardcoded video, and vary it by slug so 44
    # pages do not all show the same clip.
    if story is None:
        NT_EPISTLE = ("corinthians", "thessalonians", "timothy", "titus", "philemon",
                      "colossians", "philippians", "galatians", "ephesians", "peter",
                      "jude", "james", "hebrews", "john-bible")
        OT_PROPHET = ("isaiah", "jeremiah", "ezekiel", "hosea", "joel", "amos", "obadiah",
                      "micah", "nahum", "habakkuk", "zephaniah", "haggai", "zechariah",
                      "malachi", "lamentations")
        OT_OTHER = ("deuteronomy", "leviticus", "chronicles", "ecclesiastes", "job",
                    "song-of", "proverbs")
        if any(k in slug for k in NT_EPISTLE):
            pool = "letters-to-churches"
        elif any(k in slug for k in OT_PROPHET):
            pool = "exile-and-faith"
        elif any(k in slug for k in OT_OTHER):
            pool = "promised-land"
        else:
            pool = None   # generic trivia pages

        if pool:
            got = sorted([s for s in stories if s["seriesSlug"] == pool],
                         key=lambda s: int(s["episode"]))
        elif any(k in slug for k in ("teen", "youth", "adult", "hard")):
            # Older audiences get stories with weight. Noah and the ark reads
            # young on a page written for 15-year-olds at a youth group.
            older = ["the-empty-tomb-for-kids", "daniel-in-the-lions-den-for-kids",
                     "esther-saves-her-people-for-kids", "the-fiery-furnace-for-kids",
                     "stephen-the-first-martyr-for-kids", "the-writing-on-the-wall-for-kids",
                     "absaloms-rebellion-for-kids", "judah-falls-to-babylon-for-kids"]
            got = [s for s in stories if s["slug"] in older]
        else:
            # Generic pages get one of the best-known stories, spread by slug.
            best = ["noah-and-the-great-flood-for-kids", "david-and-goliath-for-kids",
                    "daniel-in-the-lions-den-for-kids", "the-empty-tomb-for-kids",
                    "moses-and-the-burning-bush-for-kids", "jonah-and-the-big-fish-for-kids"]
            got = [s for s in stories if s["slug"] in best] or stories
        if got:
            story = got[sum(map(ord, slug)) % len(got)]
            fallback.append(slug)

    if story is None:
        unmatched.append(slug)
        continue
    out[slug] = media(story)

OUT.write_text(json.dumps(out, indent=0, ensure_ascii=False))
print(f"trivia posts matched to a real video: {len(out)}")
print(f"matched by book category (no episode): {len(fallback)}")
print(f"still unmatched                     : {len(unmatched)}")
for u in unmatched[:20]:
    print(f"   - {u}")
print(f"\ndistinct videos now used: {len({v['videoTitle'] for v in out.values()})}")
