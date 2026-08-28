#!/usr/bin/env python3
"""Link trivia/quiz/teaching posts to the new Bible trivia for adults page.

Every new page ships with contextual in-links or it doesn't ship (rule 4).
Sources are the trivia ecosystem itself — the 66 book-trivia pages, the quiz
and games guides, and the teacher/small-group posts whose readers are exactly
the adults this page serves. Same mechanics as the other link-*.py injectors:
varied sentences by slug hash, one link per post, idempotent, --dry-run first.

Usage:
  python3 link-adult-trivia.py --dry-run
  python3 link-adult-trivia.py
"""
import argparse, hashlib, re
from pathlib import Path

BLOG = Path(__file__).resolve().parent / "content" / "blog"
TARGET = re.compile(r"trivia|quiz|bible-study|small-group|sunday-school-teacher|sunday-school-lessons-for-teens|family-bible|youth-group|bible-games")
SKIP = re.compile(r"^bible-trivia-for-adults$|bible-app|apps-for|apps-by|educational-apps|vs-faithful-kids"
                  # kid-facing preschool/toddler audiences -- an adult quiz link doesn't belong
                  r"|preschool|toddler")
ALREADY = re.compile(r"\]\((?:https://faithfulkids\.app)?/blog/bible-trivia-for-adults[)#?]")

SENTENCES = [
    "Playing with grown-ups at the table? Our [Bible trivia for adults](/blog/bible-trivia-for-adults) gives them 50 hard questions of their own, with a warm-up round built to humble the confident.",
    "For the adults in the room, our [Bible trivia questions for adults](/blog/bible-trivia-for-adults) run from deceptively easy to expert level, with a free printable PDF.",
    "When the kids' round ends, hand the grown-ups our [Bible trivia for adults](/blog/bible-trivia-for-adults) -- the warm-up round catches almost everyone on the stories they think they know.",
    "Leaders who want a round for themselves should try our [hard Bible trivia for adults](/blog/bible-trivia-for-adults), 50 questions with answers and verse references.",
    "There is an adult version too: [Bible trivia for adults](/blog/bible-trivia-for-adults), with hard and expert rounds and a printable quiz-sheet PDF for small groups.",
    "Small groups and Bible studies get their own set in our [Bible trivia for adults](/blog/bible-trivia-for-adults) -- three rounds, every answer with its verse reference.",
    "If the adults keep stealing the kids' questions, point them at [Bible trivia for adults](/blog/bible-trivia-for-adults) instead -- the expert round settles who actually knows their Bible.",
    "Our [Bible trivia for adults](/blog/bible-trivia-for-adults) page does the same thing for grown-up groups, opening with questions where the popular version of the story and the text disagree.",
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
