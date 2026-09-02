#!/usr/bin/env python3
"""Verify every stated count in the copy matches what actually exists.

Written after a set grew from 16 to 26 pages and SIX places kept claiming 16 --
including lib/lead-emails.ts, which meant the magnet email promised "All 16
pages in one PDF" while delivering a 26-page file.

check-links.py catches a link that points nowhere. Nothing caught a number that
had quietly become wrong, and a wrong number in copy is a false claim to a
customer, not just a bug.

Ground truth is DERIVED from the data, never hardcoded here -- otherwise this
file becomes the next thing that goes stale.

Usage:
  python3 check-counts.py
"""
import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
BLOG = HERE / "content" / "blog"

# ---------------------------------------------------------------- ground truth
def truth():
    t = {}

    src = (HERE / "lib" / "coloring-pages.ts").read_text()
    t["coloring pages"] = len(re.findall(r"^\s{4}slug: '", src, re.M))
    t["easter coloring pages"] = src.count("season: 'easter'")
    t["christmas coloring pages"] = src.count("season: 'christmas'")

    t["word searches"] = len(json.loads((HERE / "lib" / "word-searches.json").read_text()))

    quizzes = json.loads((HERE / "lib" / "story-quizzes.json").read_text())
    t["story quizzes"] = len(quizzes)
    t["quiz questions"] = sum(len(v) for v in quizzes.values())

    posts = list(BLOG.glob("*.md"))
    t["blog posts"] = len(posts)
    stories = 0
    for p in posts:
        head = p.read_text()[:900]
        if re.search(r"^seriesSlug:", head, re.M) and re.search(r"^episode:", head, re.M):
            stories += 1
    t["story posts"] = stories

    # App lesson/series counts, derived from the app repo's data file. The
    # /churches page said "670 Bible video episodes ... across 67 series" for
    # weeks (670 counted non-Bible content that isn't in the app; real figure
    # is the public episodes below) and nothing here looked at episode claims.
    app_data = HERE.parent / "bible-kids" / "src" / "data" / "all-series.ts"
    if app_data.exists():
        src = app_data.read_text()
        pub = series = 0
        for block in re.split(r"\n  \{\n", src)[1:]:
            m = re.search(r"episodeCount: (\d+)", block)
            if not m:
                continue
            if "private: true" not in block.split("episodes: [")[0]:
                pub += int(m.group(1))
                series += 1
        t["app lessons"] = pub
        t["app series"] = series
    return t


# Counts written as words slipped past the first version of this script: the
# Christmas hub said "Six nativity pages" while rendering five, and no numeral
# appeared anywhere to catch.
WORDS = {"one": 1, "two": 2, "three": 3, "four": 4, "five": 5, "six": 6, "seven": 7,
         "eight": 8, "nine": 9, "ten": 10, "eleven": 11, "twelve": 12,
         "sixteen": 16, "twenty": 20, "twenty-six": 26}


def as_int(tok):
    tok = tok.strip().lower()
    return int(tok) if tok.isdigit() else WORDS.get(tok)


NUM = r"(\d+|[A-Za-z]+(?:-[a-z]+)?)"

# Claim patterns: (regex with one number group, truth key, human label)
CLAIMS = [
    (r"(\d+)\s+(?:free\s+)?(?:printable\s+)?Bible coloring pages", "coloring pages", "Bible coloring pages"),
    (r"All (\d+) (?:Bible coloring )?pages", "coloring pages", "all N pages"),
    (r"(\d+) Printables", "coloring pages", "N Printables"),
    (r"(\d+) pages in one PDF", "coloring pages", "N pages in one PDF"),
    (r"(\d+) Bible scenes", "coloring pages", "N Bible scenes"),
    (r"(\d+) scenes covering", "coloring pages", "N scenes covering"),
    (r"(\d+)\s+(?:free\s+)?printable Bible word search", "word searches", "word search puzzles"),
    (NUM + r"\s+printable puzzles", "word searches", "N printable puzzles"),
    (NUM + r"\s+nativity pages", "christmas coloring pages", "N nativity pages"),
    (NUM + r"\s+pages walking Holy Week", "easter coloring pages", "N Holy Week pages"),
    (NUM + r"\s+pages cover Holy Week", "easter coloring pages", "N Holy Week pages"),
]

# Claims that are false on their face and must never reappear, whatever the
# number nearby says. "670 episodes"/"67 series" survived on /churches after
# the Aug 27 count unification; three "Free Week" CTAs and ten blog "free
# 7-day trial" CTAs survived the Aug 25 trial-claim sweep (real terms: annual
# 3-day trial, monthly none); ~220 story posts claimed 60-second lessons
# (real: 2-3.5 min). Blog markdown legitimately describes COMPETITORS' trials
# and game timers say "60 seconds" everywhere, so patterns here are either
# unambiguous anywhere (imperative CTAs, our boilerplate) or anchored to our
# brand within the same sentence.
FORBIDDEN_EVERYWHERE = [
    (r"\b670\s+(?:\w+\s+){0,3}?(?:episodes|lessons|series|videos)", "stale 670 count"),
    (r"\b67 series\b", "stale 67-series count"),
    (r"\bfree week\b", "trial is 3 days, not a week"),
    (r"Start [Yy]our [Ff]ree (?:7[- ][Dd]ay|[Ww]eek)", "trial is 3 days"),
    (r"trial is active for 7 days", "trial is 3 days, not 7"),
    (r"Faithful Kids[^\n.]{0,80}\b7[- ]day(?:s)?\s+(?:free\s+)?trial", "trial is 3 days, not 7"),
    (r"Faithful Kids[^\n.]{0,100}\b60[- ]second", "lessons are 2-3.5 min, not 60s"),
    (r"\b60[- ]seconds?[^\n.]{0,60}Faithful Kids", "lessons are 2-3.5 min, not 60s"),
    (r"Every story is 60 seconds", "lessons are 2-3.5 min, not 60s"),
    (r"the video is 60 seconds long", "lessons are 2-3.5 min, not 60s"),
    # Dead prices. Repriced Aug 18, 2026 to $8.88/$77.77, then again Aug 31 to
    # $12.99/$97. These three figures were only ever OURS -- no competitor in any
    # comparison post uses them -- so a bare match is unambiguous and safe.
    # They are listed because the Aug 31 reprice left the old numbers asserted as
    # "correct" in CLAUDE.md, BLOG-OPS-HANDOFF.md and four checkout-variant
    # comments, any one of which would have taught the next session to restore
    # them. Ground truth is unit_amount in app/api/checkout/route.ts.
    (r"\$8\.88\b", "dead price -- monthly is $12.99 since Aug 31, 2026"),
    (r"\$77\.77\b", "dead price -- annual is $97 since Aug 31, 2026"),
    (r"\$6\.48\b", "dead price -- annual works out at $8.08/mo since Aug 31, 2026"),
]
# Site code (.ts/.tsx) is always our own voice, so bare trial-length claims
# there are ours and wrong regardless of brand proximity.
FORBIDDEN_SITE_ONLY = [
    (r"\b7[- ]day(?:s)?\s+(?:free\s+)?trial\b", "trial is 3 days, not 7"),
]

# Our RETIRED prices (pre-Sep 2026: $8.88/mo, $77.77/yr, ~$6.48/mo). Current
# is $12.99/$97. These exact strings were only ever ours -- no competitor
# uses them -- so any reappearance anywhere is a stale claim. The \$-anchored
# patterns cannot match the legitimate "save $58.88" savings line. Files
# under checkout-variants/ are exempt: their comments describe the old live
# page as history, which is not a claim.
STALE_PRICES = [
    (r"\$8\.88\b", "retired price (now $12.99/mo)"),
    (r"\$77\.77\b", "retired price (now $97/yr)"),
    (r"\$6\.48\b", "retired price (annual is now ~$8.08/mo)"),
]

# Floor claims like "300+ video lessons" must not overpromise the app's real
# public-episode count (understating a floor is a marketing choice, not a
# bug). In markdown a floor claim counts only when Faithful Kids is named
# nearby -- comparison posts quote competitors' catalog sizes ("500+
# episodes" is Yippee TV's real count, not ours).
# Terminal nouns deliberately broad: "400+ short Bible story videos" lived
# unflagged in the homepage SoftwareApplication JSON-LD because the first
# version only matched lessons/episodes/"Bible stories" — and schema is the
# worst place for a stale count, since answer engines read it while no human
# ever sees it on the page (caught by the AEO session, Sep 2).
FLOOR_CLAIM = re.compile(
    r"(\d+)\+\s+(?:\w+\s+){0,3}?(?:lessons?|episodes?|videos?|stories|Bible stories)\b", re.I)


COMPETITORS = ("Yippee", "Minno", "Superbook", "YouVersion", "Bible App for Kids")


def is_ours(text, m, is_md):
    if not is_md:
        return True
    # A competitor named just before the number owns it ("Yippee TV has more
    # total content (500+ episodes...") even if we're named later in the
    # sentence -- comparison posts do that constantly.
    before = text[max(0, m.start() - 80):m.start()]
    if any(c in before for c in COMPETITORS):
        return False
    lo, hi = max(0, m.start() - 150), m.end() + 150
    return "Faithful Kids" in text[lo:hi] or "We have" in text[lo:hi]

# Route handlers (*.ts under app/) included since llms.txt shipped a stale
# "20 series and 200 episodes" claim for months — it is the file written
# specifically FOR AI crawlers, so a wrong count there gets quoted verbatim
# by answer engines.
SCAN = (
    list((HERE / "app").rglob("*.tsx"))
    + list((HERE / "app").rglob("*.ts"))
    + list((HERE / "lib").glob("*.ts"))
    # Blog markdown included since Aug 28: 215 posts carried a "400+ Bible
    # story videos ... 60 seconds" boilerplate and 10 posts a "free 7-day
    # trial" CTA that every earlier sweep missed.
    + list(BLOG.glob("*.md"))
)


def main():
    T = truth()
    print("GROUND TRUTH (derived, not hardcoded)")
    for k, v in T.items():
        print(f"  {k:<26} {v}")

    problems = []
    for f in SCAN:
        if "node_modules" in str(f):
            continue
        text = f.read_text()
        for pat, key, label in CLAIMS:
            if key is None:
                continue
            for m in re.finditer(pat, text, re.I):
                claimed = as_int(m.group(1))
                if claimed is None:
                    continue          # not a number word at all
                if claimed != T[key]:
                    problems.append((f.relative_to(HERE), label, claimed, T[key],
                                     " ".join(m.group(0).split())))
        is_md = f.suffix == ".md"
        forbidden = FORBIDDEN_EVERYWHERE + ([] if is_md else FORBIDDEN_SITE_ONLY)
        if "checkout-variants" not in str(f):
            forbidden = forbidden + STALE_PRICES
        for pat, reason in forbidden:
            for m in re.finditer(pat, text, re.I):
                problems.append((f.relative_to(HERE), reason, m.group(0), "",
                                 " ".join(m.group(0).split())))
        if "app lessons" in T:
            for m in FLOOR_CLAIM.finditer(text):
                if int(m.group(1)) > T["app lessons"] and is_ours(text, m, is_md):
                    problems.append((f.relative_to(HERE), "floor claim overpromises",
                                     int(m.group(1)), T["app lessons"],
                                     " ".join(m.group(0).split())))

    print(f"\nstated counts that do not match: {len(problems)}")
    for f, label, claimed, real, snippet in problems:
        print(f"  {f}")
        print(f"      claims {claimed}, actual {real}   [{label}]  \"{snippet[:60]}\"")

    print("\n" + ("CLEAN — every stated count matches the data"
                  if not problems else f"{len(problems)} STALE COUNTS"))
    sys.exit(1 if problems else 0)


if __name__ == "__main__":
    main()
