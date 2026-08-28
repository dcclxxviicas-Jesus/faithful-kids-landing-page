#!/usr/bin/env python3
"""Link youth/teen/church-adjacent posts to the youth group games hub.

/blog/youth-group-games is the head-term page (55 games, by group size) but a
week after publish Google was surfacing /blog/fun-youth-group-games for
"youth group games" instead — the fun post had ranked first and the hub had
only 12 in-links. Anchor text sitewide already differentiates the two
correctly (head-term anchors → hub, fun/funny anchors → fun post); this adds
volume behind the hub the same way the /bible-trivia blitz did.

Usage:
  python3 link-youth-games.py --dry-run
  python3 link-youth-games.py
"""
import argparse, hashlib, re
from pathlib import Path

BLOG = Path(__file__).resolve().parent / "content" / "blog"
TARGET = re.compile(r"youth|teen|tween|sunday-school|middle-school|icebreak|game|church|vbs|confirmation")
SKIP = re.compile(r"^youth-group-games$|bible-app|apps-for|apps-by|educational-apps|vs-faithful-kids|screen-time"
                  # kid-facing story/explainer posts and preschool audiences -- teen games don't belong there
                  r"|the-church-at-antioch|the-church-is-born|why-do-we-go-to-church|preschool")
ALREADY = re.compile(r"\]\((?:https://faithfulkids\.app)?/blog/youth-group-games[)#?]")

SENTENCES = [
    "If you're planning a whole night, our list of [youth group games](/blog/youth-group-games) sorts 55 of them by group size, with rules, materials, and prep time for each.",
    "For the game portion of the night, these [youth group games sorted by group size](/blog/youth-group-games) cover everything from four students to forty.",
    "Pair this with a game or two — our [55 youth group games](/blog/youth-group-games) each list the space, materials, and supervision they need.",
    "Youth leaders: the master list of [youth group games](/blog/youth-group-games) is sorted by how many students you actually have, not by how many the game wants.",
    "When the lesson lands early and twenty minutes remain, a page of [youth group games by group size](/blog/youth-group-games) is the fastest save.",
    "Our full list of [youth group games](/blog/youth-group-games) includes the Scripture connection for every game, so the fun still points somewhere.",
    "For more structured chaos, browse [youth group games that actually work](/blog/youth-group-games) — 55 of them, sized for small, medium, and large groups.",
    "We keep one master list of [youth group games](/blog/youth-group-games) with exact rules and prep time, so nothing on this page has to stretch past its natural length.",
    "If your group skews older, the [youth group games list](/blog/youth-group-games) marks which games hold up with high schoolers.",
    "Before the meeting, skim our [youth group games](/blog/youth-group-games) — every entry says what it needs and how long it takes to set up.",
]

def pick(slug):
    return SENTENCES[int(hashlib.sha256(slug.encode()).hexdigest()[:8], 16) % len(SENTENCES)]

def insert(text, s):
    lines = text.split("\n")
    faq = next((i for i, l in enumerate(lines) if re.match(r"^## (Frequently Asked Questions|FAQ)", l)), None)
    if faq is not None:
        end = faq
        while end > 0 and not lines[end - 1].strip():
            end -= 1
        lines.insert(end, ""); lines.insert(end + 1, s)
        return "\n".join(lines), "before-faq"
    while lines and not lines[-1].strip():
        lines.pop()
    return "\n".join(lines + ["", s, ""]), "end-of-body"

def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()
    done = skipped = 0; where = {}
    for p in sorted(BLOG.glob("*.md")):
        if not TARGET.search(p.stem) or SKIP.search(p.stem):
            continue
        t = p.read_text()
        if ALREADY.search(t):
            skipped += 1; continue
        new, w = insert(t, pick(p.stem))
        where[w] = where.get(w, 0) + 1; done += 1
        if a.dry_run:
            print(f"  {p.stem}  [{w}]")
        else:
            p.write_text(new)
    print(f"\n{'would link' if a.dry_run else 'linked'}: {done}   already had it: {skipped}")
    print(f"placement: {where}")

if __name__ == "__main__":
    main()
