#!/usr/bin/env python3
"""Remove the stale '7 days' trial claim from blog CTAs.

Why (Aug 25, 2026): 210 blog CTAs advertised "free for 7 days". Verified against
code in BOTH repos -- FaithfulKidsLandingPage/app/api/checkout/route.ts:47 and
bible-kids/src/app/api/checkout/route.ts:59 -- the real terms are:

    ...(plan === 'annual' ? { subscription_data: { trial_period_days: 3 } } : {})

Annual = 3-day trial. Monthly = no trial. There has never been a 7-day trial at
the current pricing; these CTAs predate the Aug 18, 2026 pricing change.

Owner chose wording that names no number, so it cannot go stale again the next
time pricing moves.

DELIBERATELY NOT TOUCHED -- two posts say "7-day free trial" about COMPETITORS:
  - yippee-tv-vs-faithful-kids.md  ("A Yippee subscription ... 7-day free trial")
  - best-educational-apps-for-christian-kids.md  ($9.99/mo competitor entry)
Those claims are accurate and belong to other products. Same reason no price is
touched here: $9.99 / $69.99 / $10.99 / $7.99 / $4.08 in the comparison posts are
all competitor prices. Our own $8.88 / $77.77 / $6.48 were audited and are correct.

Usage:
  python3 fix-trial-cta.py --dry-run
  python3 fix-trial-cta.py
"""
import argparse
from pathlib import Path

BLOG = Path(__file__).resolve().parent / "content" / "blog"

# Exact anchor-text swaps. Keyed on the full markdown link text so we can never
# collide with prose about another product's trial.
SWAPS = [
    ("[**Try Faithful Kids free for 7 days**]", "[**Start your free trial**]"),
    ("[Try Faithful Kids free for 7 days]",     "[Start your free trial]"),
    ("[try it free for 7 days]",                "[start your free trial]"),
]

# If any of these survive, something was missed and the run should report it.
LEFTOVER_MARKERS = ["free for 7 days", "7 days free"]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    files_changed = 0
    swap_counts = {old: 0 for old, _ in SWAPS}
    leftovers, competitor_ok = [], []

    for path in sorted(BLOG.glob("*.md")):
        text = original = path.read_text()
        for old, new in SWAPS:
            if old in text:
                swap_counts[old] += text.count(old)
                text = text.replace(old, new)
        if text != original:
            files_changed += 1
            if not args.dry_run:
                path.write_text(text)

        # Audit the POST-swap text, so --dry-run reports the same as a real run
        low = text.lower()
        for marker in LEFTOVER_MARKERS:
            if marker in low:
                leftovers.append(f"{path.name}: {marker}")
        if "7-day free trial" in low or "7 day free trial" in low:
            competitor_ok.append(path.name)

    print(f"{'would change' if args.dry_run else 'changed'}: {files_changed} files")
    for old, _ in SWAPS:
        print(f"  {swap_counts[old]:>4}  {old}")

    print(f"\nunfixed claims about OUR trial: {len(leftovers)}")
    for l in leftovers:
        print(f"  LEFTOVER  {l}")

    print(f"\n'7-day free trial' left in place (competitor products): {len(competitor_ok)}")
    for c in competitor_ok:
        print(f"  ok  {c}")


if __name__ == "__main__":
    main()
