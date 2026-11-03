#!/usr/bin/env python3
"""Links-at-birth for the Nov 2, 2026 character-profile batch (19 who-was
posts + the women-of-the-bible roundup). A page nothing points at does not
rank.

Unlike the broad injectors, this one is an explicit map: each new profile
names the EXACT existing posts that should link to it (their story posts,
close neighbors, era trivia). Precision over volume — a Gideon link belongs
in a Gideon story, nowhere else.

Usage: --dry-run first. Idempotent per (source, target).
"""
import argparse, re
from pathlib import Path

BLOG = Path(__file__).resolve().parent / "content" / "blog"

# target slug -> (sources, sentence)
PLAN: dict[str, tuple[list[str], str]] = {
    "who-was-deborah-for-kids": (
        ["deborah-a-brave-leader-for-kids", "judges-bible-trivia"],
        "For the full picture of her life — the palm tree courtroom, the battle, and the victory song — see [Who Was Deborah in the Bible?](/blog/who-was-deborah-for-kids)",
    ),
    "who-was-gideon-for-kids": (
        ["gideon-the-unlikely-hero-for-kids", "gideons-300-for-kids"],
        "For Gideon's whole arc — the winepress, the fleece, the 300 and the honest ending — see [Who Was Gideon in the Bible?](/blog/who-was-gideon-for-kids)",
    ),
    "who-was-rahab-for-kids": (
        ["rahab-and-the-spies-for-kids", "the-walls-of-jericho-for-kids"],
        "For her full story — and how a Canaanite woman ended up in the family line of Jesus — see [Who Was Rahab in the Bible?](/blog/who-was-rahab-for-kids)",
    ),
    "who-was-jacob-for-kids": (
        ["jacob-and-esau-for-kids", "genesis-bible-trivia"],
        "For the whole life — the stolen blessing, the stairway dream, and the night he wrestled God — see [Who Was Jacob in the Bible?](/blog/who-was-jacob-for-kids)",
    ),
    "who-was-isaac-for-kids": (
        ["abraham-and-isaac-for-kids", "who-was-abraham-for-kids"],
        "For the quiet patriarch's full story — the laughter, the mountain, the wells — see [Who Was Isaac in the Bible?](/blog/who-was-isaac-for-kids)",
    ),
    "who-was-samson-for-kids": (
        ["samson-strongest-man-alive-for-kids", "samsons-fall-and-final-stand-for-kids"],
        "For the whole story in one place — the vow, Delilah, and the final prayer — see [Who Was Samson?](/blog/who-was-samson-for-kids)",
    ),
    "who-was-samuel-for-kids": (
        ["god-calls-samuel-for-kids", "hannahs-prayer-for-kids", "1-samuel-bible-trivia"],
        "For his whole life — the boy who heard God's voice, the last judge, the king-maker — see [Who Was Samuel in the Bible?](/blog/who-was-samuel-for-kids)",
    ),
    "who-was-mary-magdalene-for-kids": (
        ["the-empty-tomb-for-kids"],
        "The woman who saw it first has her own story: [Who Was Mary Magdalene in the Bible?](/blog/who-was-mary-magdalene-for-kids)",
    ),
    "who-was-elijah-for-kids": (
        ["elijah-and-the-ravens-for-kids", "elijah-taken-to-heaven-for-kids", "1-kings-bible-trivia"],
        "For Elijah's whole life — the ravens, Mount Carmel, the whisper, the chariot — see [Who Was Elijah in the Bible?](/blog/who-was-elijah-for-kids)",
    ),
    "who-was-elisha-for-kids": (
        ["elisha-double-portion-for-kids", "naaman-the-leper-for-kids", "the-widows-oil-for-kids", "2-kings-bible-trivia"],
        "For the apprentice who carried the ministry further — the oil, Naaman, the horses of fire — see [Who Was Elisha in the Bible?](/blog/who-was-elisha-for-kids)",
    ),
    "who-was-solomon-for-kids": (
        ["solomon-asks-for-wisdom-for-kids", "solomons-wise-judgment-for-kids", "building-the-temple-for-kids", "solomon-turns-away-for-kids"],
        "For the wisest king's whole arc — the dream, the judgment, the temple, and the fall — see [Who Was Solomon in the Bible?](/blog/who-was-solomon-for-kids)",
    ),
    "who-was-king-saul-for-kids": (
        ["saul-the-first-king-for-kids", "sauls-disobedience-for-kids", "the-fall-of-king-saul-for-kids"],
        "For Israel's first king from start to finish — the donkeys, the cracks, the jealousy — see [Who Was King Saul in the Bible?](/blog/who-was-king-saul-for-kids)",
    ),
    "who-was-joshua-for-kids": (
        ["joshua-takes-command-for-kids", "the-twelve-spies-for-kids", "joshua-bible-trivia"],
        "For Joshua's whole life — apprentice, spy, general, and the choice at Shechem — see [Who Was Joshua in the Bible?](/blog/who-was-joshua-for-kids)",
    ),
    "who-was-barnabas-for-kids": (
        ["paul-and-barnabas-split-for-kids", "saul-meets-jesus-for-kids"],
        "The man who vouched for Saul when no one else would has his own story: [Who Was Barnabas in the Bible?](/blog/who-was-barnabas-for-kids)",
    ),
    "who-was-timothy-for-kids": (
        ["who-was-paul-for-kids", "paul-and-silas-in-prison-for-kids"],
        "Paul's young apprentice — raised on Scripture by his mom and grandma — has his own profile: [Who Was Timothy in the Bible?](/blog/who-was-timothy-for-kids)",
    ),
    "who-was-lydia-for-kids": (
        ["paul-in-corinth-for-kids"],
        "Europe's first believer — the purple-cloth merchant whose home became the first church on the continent — has her own story: [Who Was Lydia in the Bible?](/blog/who-was-lydia-for-kids)",
    ),
    "who-was-stephen-for-kids": (
        ["stephen-the-first-martyr-for-kids", "acts-bible-trivia"],
        "For the full story of the church's first martyr — and the surprise link to Paul — see [Who Was Stephen in the Bible?](/blog/who-was-stephen-for-kids)",
    ),
    "who-was-thomas-for-kids": (
        ["doubting-thomas-for-kids", "john-bible-trivia"],
        "There was more to him than one famous week: [Who Was Thomas in the Bible?](/blog/who-was-thomas-for-kids) tells his brave side too.",
    ),
    "who-was-nehemiah-for-kids": (
        ["nehemiahs-prayer-for-kids", "nehemiah-bible-trivia", "rebuilding-the-temple-for-kids"],
        "For the whole 52-day project — the prayers, the mockers, the wall — see [Who Was Nehemiah in the Bible?](/blog/who-was-nehemiah-for-kids)",
    ),
    "women-of-the-bible-for-kids": (
        ["who-was-ruth-for-kids", "who-was-esther-for-kids", "who-was-mary-mother-of-jesus-for-kids",
         "hannahs-prayer-for-kids", "the-woman-at-the-well-for-kids", "deborah-a-brave-leader-for-kids",
         "biblical-girl-names"],
        "She's one of our [15 women of the Bible every kid should know](/blog/women-of-the-bible-for-kids) — the whole list, with a story and a verse for each.",
    ),
}


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
    added = missing = 0
    for target, (sources, sentence) in PLAN.items():
        url = f"/blog/{target}"
        for src in sources:
            p = BLOG / f"{src}.md"
            if not p.exists():
                print(f"  MISSING SOURCE: {src}")
                missing += 1
                continue
            t = p.read_text()
            if f"]({url})" in t:
                continue
            if a.dry_run:
                print(f"  {src} -> {target}")
            else:
                p.write_text(insert_mid(t, sentence))
            added += 1
    print(f"{'would add' if a.dry_run else 'added'} {added} links, {missing} missing sources")
    if missing:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
