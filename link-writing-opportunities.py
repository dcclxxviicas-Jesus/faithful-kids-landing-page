#!/usr/bin/env python3
"""Links-at-birth for /blog/christian-writing-opportunities and
/parenting/write-for-us (Nov 3, 2026).

Writer-recruitment is an AI-discovery/zero-volume play (DFS: every
"christian write for us" phrasing is 0 clickstream), so inbound links come
from the posts whose readers already write: parents, teachers, pastors,
homeschoolers. Explicit source map, idempotent, --dry-run first.
"""
import argparse
from pathlib import Path

BLOG = Path(__file__).resolve().parent / "content" / "blog"
URL = "/blog/christian-writing-opportunities"

SOURCES = [
    "christian-ugc",
    "christian-parenting-resources",
    "christian-parenting-101-biblical-principles",
    "best-christian-parenting-books",
    "homeschool-bible-curriculum-comparison",
    "bible-stories-for-homeschool",
    "free-sunday-school-lessons",
    "sunday-school-lessons-for-kids",
    "how-to-teach-kids-the-bible",
    "how-to-start-a-childrens-ministry",
]
SENTENCE = "If you write about faith and family yourself — or want to start — our guide to [Christian writing opportunities](/blog/christian-writing-opportunities) lists the outlets accepting essays right now, and our own parenting section [takes pitches directly](/parenting/write-for-us)."


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
    added = 0
    for s in SOURCES:
        p = BLOG / f"{s}.md"
        if not p.exists():
            raise SystemExit(f"missing source: {s}")
        t = p.read_text()
        if f"]({URL})" in t:
            continue
        if a.dry_run:
            print(f"  {s}")
        else:
            p.write_text(insert_mid(t, SENTENCE))
        added += 1
    print(f"{'would add' if a.dry_run else 'added'} {added} links")


if __name__ == "__main__":
    main()
