#!/usr/bin/env python3
"""Links-at-birth for /blog/how-to-start-a-childrens-ministry (Nov 3, 2026).

The ministry cluster is a link/authority play (near-zero search volume at
KD 48 — see CHURCH-RESOURCES-EXPANSION-REPORT-2026-11.md), so inbound links
come from the exact posts a ministry leader already lands on. Explicit
source map, idempotent, --dry-run first.
"""
import argparse
from pathlib import Path

BLOG = Path(__file__).resolve().parent / "content" / "blog"
URL = "/blog/how-to-start-a-childrens-ministry"

SOURCES = [
    "sunday-school-lessons-for-kids",
    "sunday-school-lessons-for-preschoolers",
    "sunday-school-lessons-for-teens",
    "free-sunday-school-lessons",
    "free-bible-curriculum-for-kids-ministry",
    "how-to-teach-kids-the-bible",
    "sunday-school-games-for-kids",
    "bible-review-games-for-sunday-school",
    "sunday-school-opening-activities",
    "how-to-start-kids-bible-study-group",
    "christmas-sunday-school-lessons",
    "easter-sunday-school-lessons",
]
SENTENCE = "If you're building the ministry itself, not just this week's lesson, our complete guide to [how to start a children's ministry](/blog/how-to-start-a-childrens-ministry) walks the whole road — planning, child safety, volunteers, curriculum and launch — with a free printable launch kit."


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
