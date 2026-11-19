#!/usr/bin/env python3
"""Links-at-birth for the Christian Apps for Kids directory (/christian-apps)
and the where-to-list guide, Nov 17, 2026. Same mechanics as
link-nov17-engine.py: one sentence per host, before the 4th H2, skipped if the
host already links the target. Idempotent; run --dry-run first."""
import argparse
from pathlib import Path
BLOG = Path(__file__).resolve().parent / "content" / "blog"
LINKS = [
 ("best-bible-app-for-kids", "/christian-apps", "Want to see everything else out there? Our [Christian apps for kids directory](/christian-apps) lists more than 50 apps with the price, ages, ads and last update checked on each store."),
 ("free-bible-apps-for-kids", "/christian-apps", "For more free options beyond Bible apps, filter our [directory of Christian apps for kids](/christian-apps) by \"Free to start\": games, music, devotionals and more, each checked for ads."),
 ("best-bible-apps-by-age", "/christian-apps", "To narrow by age across every kind of faith app, not just Bible apps, use the filters in our [Christian apps for kids directory](/christian-apps)."),
 ("best-educational-apps-for-christian-kids", "/christian-apps", "Our full [Christian apps for kids directory](/christian-apps) covers the faith side: Bible stories, games, music and Scripture memory, compared on price and ads."),
 ("christian-alternatives-to-youtube-for-kids", "/christian-apps", "If you'd rather choose an app than a channel, our [directory of Christian apps for kids](/christian-apps) compares more than 50 of them, including the Christian streaming apps."),
 ("bible-apps-for-kids-no-ads", "/christian-apps", "Every listing in our [Christian apps for kids directory](/christian-apps) says whether the store shows a \"Contains ads\" label, so you can check before you download."),
 ("christian-apps-that-grow-with-your-child", "/christian-apps", "For a side-by-side look at the rest of the field, see our [Christian apps for kids directory](/christian-apps), sorted by age and price."),
 ("bible-apps-for-teens", "/christian-apps", "For teen-friendly devotional and Bible apps alongside the kids' ones, filter our [Christian apps directory](/christian-apps) by \"Teens\"."),
 ("bible-app-for-kids-review", "/christian-apps/bible-app-for-kids", "For the plain facts at a glance (price, ages, devices, last update), see the [Bible App for Kids listing](/christian-apps/bible-app-for-kids) in our directory."),
 ("where-to-watch-superbook", "/christian-apps/superbook-kids-bible", "The app's price, ages and last update are on its [Superbook listing](/christian-apps/superbook-kids-bible) in our Christian apps directory."),
 ("minno-vs-faithful-kids", "/christian-apps/minno", "For Minno's current store prices and ratings at a glance, see its [listing in our Christian apps directory](/christian-apps/minno)."),
 ("yippee-tv-vs-faithful-kids", "/christian-apps/yippee-tv", "Yippee's current store prices are on its [listing in our Christian apps directory](/christian-apps/yippee-tv)."),
 ("best-christian-podcasts", "/best-catholic-apps", "If the Catholic shows here are your kind of listening, our [guide to the best Catholic apps](/best-catholic-apps) compares the apps for daily readings, the Rosary and the Liturgy of the Hours, each checked on its store."),
 ("lent-for-kids-explained", "/best-catholic-apps", "For daily readings, prayer and Mass prep through Lent, including apps made for Catholic kids, see our [guide to the best Catholic apps](/best-catholic-apps)."),
 ("best-bible-app-for-kids", "/best-catholic-apps", "Raising your kids Catholic? Our [best Catholic apps guide](/best-catholic-apps) has a section of Catholic apps for kids, from saints stories to Sunday Mass prep."),
 ("where-to-list-a-christian-app", "/best-catholic-apps", "Catholic apps are also compared in their own hub, [the best Catholic apps](/best-catholic-apps), which takes submissions through the same form."),
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
