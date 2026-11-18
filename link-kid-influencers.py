#!/usr/bin/env python3
"""Links-at-birth for /blog/kid-influencers (Nov 18, 2026). Same mechanics as
link-nov17-engine.py. Idempotent; run --dry-run first."""
import argparse
from pathlib import Path
BLOG = Path(__file__).resolve().parent / "content" / "blog"
LINKS = [
 ("family-friendly-youtubers", "/blog/kid-influencers", "Wondering about the kids who are YouTube stars themselves? Our guide to [kid influencers](/blog/kid-influencers) covers the biggest channels and the new state laws protecting the children in them."),
 ("christian-alternatives-to-youtube-for-kids", "/blog/kid-influencers", "If your child is hooked on channels like Vlad and Niki or Like Nastya, our parents' guide to [kid influencers](/blog/kid-influencers) explains how those channels work and what to watch instead."),
 ("christian-influencers", "/blog/kid-influencers", "For the child stars of YouTube rather than grown-up creators, see our guide to [kid influencers](/blog/kid-influencers) and what parents should know."),
 ("christian-youtube-channels-for-kids", "/blog/kid-influencers", "Curious why kid-run channels get so many views? Our guide to [kid influencers](/blog/kid-influencers) covers the research and the laws."),
]
def insert_mid(text, sentence):
    lines = text.split("\n"); h2s = [i for i, l in enumerate(lines) if l.startswith("## ")]
    if len(h2s) >= 4:
        at = h2s[3]
        while at > 0 and not lines[at - 1].strip(): at -= 1
        lines.insert(at, ""); lines.insert(at + 1, sentence); return "\n".join(lines)
    while lines and not lines[-1].strip(): lines.pop()
    return "\n".join(lines + ["", sentence, ""])
def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--dry-run", action="store_true"); a = ap.parse_args(); added = 0
    for slug, url, sentence in LINKS:
        p = BLOG / f"{slug}.md"
        if not p.exists(): print(f"  SKIP missing source: {slug}"); continue
        t = p.read_text()
        if f"]({url})" in t: continue
        if a.dry_run: print(f"  {slug} -> {url}")
        else: p.write_text(insert_mid(t, sentence))
        added += 1
    print(f"{'would add' if a.dry_run else 'added'} {added} links")
if __name__ == "__main__": main()
