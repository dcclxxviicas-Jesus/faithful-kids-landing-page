#!/usr/bin/env python3
"""Links-at-birth for the Nov 16-17, 2026 wave (14 posts: podcasts, gifts,
clothing x2, artists, influencers, kids Bibles, translations, colleges,
charities, Christmas movies, kids music, toys; scholarships rewritten).
Same mechanics as link-streamer-engine.py: one unique sentence per host,
inserted before the 4th H2, skipped if the host already links the target.
Idempotent; run --dry-run first."""
import argparse
from pathlib import Path
BLOG = Path(__file__).resolve().parent / "content" / "blog"
LINKS = [
 ("christian-parenting-podcasts", "/blog/best-christian-podcasts", "For your own listening, beyond parenting, our [best Christian podcasts](/blog/best-christian-podcasts) list checks 22 shows that are still publishing, plus the famous ones that ended."),
 ("christian-podcasts-for-kids", "/blog/best-christian-podcasts", "Looking for something for the grown-ups in the car? Our verified list of the [best Christian podcasts](/blog/best-christian-podcasts) covers Bible teaching, prayer and culture shows still publishing in 2026."),
 ("christian-gifts-for-kids", "/blog/christian-gifts", "Shopping for the adults too? Our [best Christian gifts](/blog/christian-gifts) guide covers her, him, pastors, teens and grandparents, with every price checked."),
 ("advent-books-for-kids", "/blog/christian-gifts", "If you're buying for the whole family this season, our [Christian gifts](/blog/christian-gifts) guide has 31 ideas sorted by person and budget."),
 ("christian-gifts-for-kids", "/blog/christian-toys", "For the youngest on your list, our [Christian toys](/blog/christian-toys) guide checks which Noah's arks, nativity playsets and Bible games are actually in stock."),
 ("christian-gifts-for-kids", "/blog/christian-clothing-for-kids", "Clothing makes an easy gift too; our guide to [Christian clothing for kids](/blog/christian-clothing-for-kids) lists the brands still selling, with real sizes and prices."),
 ("christian-brands-that-work-with-influencers", "/blog/christian-clothing-brands", "If you're shopping rather than partnering, our [best Christian clothing brands](/blog/christian-clothing-brands) guide checks which apparel brands are still selling and which closed."),
 ("christian-ugc", "/blog/christian-influencers", "For examples of what's working, our list of [Christian influencers to follow](/blog/christian-influencers) verifies 22 active accounts and their real audience sizes."),
 ("how-christian-bloggers-make-money", "/blog/christian-influencers", "To see who's building the biggest faith audiences right now, our list of [Christian influencers](/blog/christian-influencers) verifies 22 active creators, platform by platform."),
 ("best-christian-blogs", "/blog/christian-influencers", "Many of today's biggest Christian voices live on video and social rather than blogs; our [Christian influencers](/blog/christian-influencers) list covers them."),
 ("worship-songs-for-kids", "/blog/christian-music-for-kids", "For whole albums and artists rather than single songs, see our guide to the [best Christian music for kids](/blog/christian-music-for-kids), with which artists are still releasing new music."),
 ("songs-of-praise-for-kids", "/blog/christian-music-for-kids", "To build a whole playlist, our [Christian music for kids](/blog/christian-music-for-kids) guide covers 15 artists and the Spotify playlists worth saving."),
 ("worship-songs-for-kids", "/blog/christian-artists", "When your kids graduate to the grown-up charts, our [best Christian artists](/blog/christian-artists) list has this week's Billboard positions and the 2026 Dove winners."),
 ("christian-movies-for-kids", "/blog/christian-christmas-movies-for-kids", "For December specifically, our [Christian Christmas movies for kids](/blog/christian-christmas-movies-for-kids) guide says where each one streams this season and what leaves soon."),
 ("christian-cartoons-for-kids", "/blog/christian-christmas-movies-for-kids", "For the holidays, see our [Christian Christmas movies for kids](/blog/christian-christmas-movies-for-kids), with where to stream The Star, VeggieTales and The Best Christmas Pageant Ever."),
 ("the-christmas-story-for-kids", "/blog/christian-christmas-movies-for-kids", "To watch the story together, our guide to [Christian Christmas movies for kids](/blog/christian-christmas-movies-for-kids) sorts the Nativity films by age."),
 ("christian-books-for-kids", "/blog/best-bibles-for-kids", "For the Bible itself, our [best kids Bibles by age](/blog/best-bibles-for-kids) guide goes from toddler board books to teen study Bibles."),
 ("how-to-teach-kids-the-bible", "/blog/best-bibles-for-kids", "The right Bible for their age makes all of this easier; see our [best kids Bibles by age](/blog/best-bibles-for-kids)."),
 ("best-bible-apps-by-age", "/blog/best-bibles-for-kids", "If you want a printed Bible alongside the app, our [kids Bibles by age](/blog/best-bibles-for-kids) guide matches one to each stage."),
 ("how-to-teach-kids-the-bible", "/blog/best-bible-translation-for-kids", "Which translation you hand them matters too; our guide to the [best Bible translation for kids](/blog/best-bible-translation-for-kids) compares the NIrV, ICB, NLT and more by reading level."),
 ("bible-verses-for-kids-to-memorize", "/blog/best-bible-translation-for-kids", "Memorizing is easier in a translation they understand; see our guide to the [best Bible translation for kids](/blog/best-bible-translation-for-kids), with the same verse side by side."),
 ("christian-books-for-kids", "/blog/best-bible-translation-for-kids", "Choosing a first full Bible? Our guide to the [best Bible translation for kids](/blog/best-bible-translation-for-kids) explains NIrV vs ICB vs NLT."),
 ("best-christian-companies-to-work-for", "/blog/best-christian-colleges", "Still deciding where to study first? Our [best Christian colleges](/blog/best-christian-colleges) guide compares real costs and graduation rates."),
 ("christian-writing-jobs", "/blog/best-christian-colleges", "If you're weighing a degree first, our [best Christian colleges](/blog/best-christian-colleges) guide uses College Scorecard data, not reputation."),
 ("bible-verses-about-generosity-for-kids", "/blog/best-christian-charities", "To put these verses into practice as a family, our guide to the [best Christian charities](/blog/best-christian-charities) checks 17 ministries against three watchdogs, including ones kids can help with."),
 ("christian-gifts-for-kids", "/blog/best-christian-charities", "A gift in someone's name can be the best gift of all; our [best Christian charities](/blog/best-christian-charities) guide shows which ministries score well with the watchdogs."),
 ("christian-board-games", "/blog/christian-toys", "For younger kids who aren't ready for board games, our [Christian toys](/blog/christian-toys) guide covers playsets, plush and simple Bible games."),
 ("bible-games-for-kids", "/blog/christian-toys", "For hands-on play away from screens and paper, see our [Christian toys](/blog/christian-toys) guide, checked for Christmas stock."),
 ("christmas-crafts-for-kids-bible", "/blog/christian-toys", "Looking for a nativity set kids can actually play with? Our [Christian toys](/blog/christian-toys) guide compares them by age."),
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
