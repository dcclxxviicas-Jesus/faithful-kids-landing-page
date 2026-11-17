#!/usr/bin/env python3
"""Links-at-birth for the Nov 16, 2026 streamers/gaming cluster.

Six new posts (twitch-sponsorships-for-small-streamers, christian-twitch-streamers,
family-friendly-youtubers, christian-youtubers, christian-video-games,
is-gaming-a-sin). The posts interlink each other internally; this script adds
the INBOUND contextual links from existing posts, one unique sentence per host
post (varied per the Nov 9 rule). Idempotent, --dry-run first.
"""
import argparse
from pathlib import Path

BLOG = Path(__file__).resolve().parent / "content" / "blog"

# Each entry: (host slug, target url, sentence). One sentence per host per
# target; a host already linking the target is skipped.
LINKS = [
    # -> twitch-sponsorships-for-small-streamers
    ("christian-ugc", "/blog/twitch-sponsorships-for-small-streamers",
     "If your content is live rather than posted, sponsorships work differently there; our verified guide to [Twitch sponsorships for small streamers](/blog/twitch-sponsorships-for-small-streamers) covers the programs that are real and the scams that aren't."),
    ("how-christian-bloggers-make-money", "/blog/twitch-sponsorships-for-small-streamers",
     "Bloggers who also stream have a separate monetization path; see our guide to [Twitch sponsorships for small streamers](/blog/twitch-sponsorships-for-small-streamers), verified the same way this page is."),
    ("christian-writing-jobs", "/blog/twitch-sponsorships-for-small-streamers",
     "If your medium is streaming rather than writing, the paying programs are different ones; we verified those separately in [Twitch sponsorships for small streamers](/blog/twitch-sponsorships-for-small-streamers)."),
    # -> christian-twitch-streamers
    ("christian-alternatives-to-youtube-for-kids", "/blog/christian-twitch-streamers",
     "For teens drawn to live platforms rather than video apps, there is a real faith-based streaming scene worth knowing; our [Christian streamers guide](/blog/christian-twitch-streamers) covers the gamer churches and believers streaming today."),
    ("healthy-screen-time-for-christian-kids", "/blog/christian-twitch-streamers",
     "If your teen is into streaming culture, it helps to know the good corners of it; we verified the active [Christian streamers on Twitch](/blog/christian-twitch-streamers), gamer churches included."),
    # -> family-friendly-youtubers
    ("christian-youtube-channels-for-kids", "/blog/family-friendly-youtubers",
     "For the mainstream gaming and entertainment channels kids ask about by name, our verified guide to [family-friendly YouTubers](/blog/family-friendly-youtubers) covers who still uploads, who retired, and who changed."),
    ("screen-time-rules-christian-families", "/blog/family-friendly-youtubers",
     "Rules work better with a pre-approved list to point at; our verified roster of [family-friendly YouTubers](/blog/family-friendly-youtubers) names which famous channels still earn the label."),
    ("is-screen-time-bad-for-kids", "/blog/family-friendly-youtubers",
     "Quality matters as much as quantity, and channel choice is where quality starts; see our verified list of [family-friendly YouTubers](/blog/family-friendly-youtubers)."),
    ("how-to-reduce-screen-time-for-kids", "/blog/family-friendly-youtubers",
     "When you trim the hours, make the remaining ones count: our verified roster of [family-friendly YouTubers](/blog/family-friendly-youtubers) helps you keep the best and drop the rest."),
    # -> christian-youtubers
    ("christian-youtube-channels-for-kids", "/blog/christian-youtubers",
     "Parents and teens outgrow this list eventually; our companion roundup of [Christian YouTubers](/blog/christian-youtubers) covers apologetics, Bible teaching, and Christian gaming channels for older viewers."),
    ("best-christian-blogs", "/blog/christian-youtubers",
     "If video is more your family's medium than blogs, we verified the active [Christian YouTubers](/blog/christian-youtubers) the same way: every channel checked on its own page."),
    ("christian-parenting-podcasts", "/blog/christian-youtubers",
     "Prefer watching to listening? Our verified roundup of [Christian YouTubers](/blog/christian-youtubers) covers the teaching and apologetics channels worth a subscription."),
    # -> christian-video-games
    ("bible-games-for-kids", "/blog/christian-video-games",
     "For the screen-based side of this question, our verified guide to [Christian video games](/blog/christian-video-games) covers what families can actually install, including the honest answer about Grace on Roblox."),
    ("christian-gifts-for-kids", "/blog/christian-video-games",
     "Shopping for a gamer kid? Our guide to [Christian video games](/blog/christian-video-games) verified what's actually available this year, with prices from the stores themselves."),
    ("best-educational-apps-for-christian-kids", "/blog/christian-video-games",
     "If your kids ask for games more than apps, see our verified roundup of [Christian video games](/blog/christian-video-games), including the free ones that are genuinely still alive."),
    # -> is-gaming-a-sin
    ("screen-time-rules-christian-families", "/blog/is-gaming-a-sin",
     "If gaming is the screen fight in your house, the underlying question deserves a real answer; we wrote one in [is gaming a sin?](/blog/is-gaming-a-sin)"),
    ("healthy-screen-time-for-christian-kids", "/blog/is-gaming-a-sin",
     "For families wrestling specifically with video games, [is gaming a sin?](/blog/is-gaming-a-sin) walks through what Scripture actually says."),
    ("is-screen-time-bad-for-kids", "/blog/is-gaming-a-sin",
     "The gaming version of this question gets its own biblical treatment in [is gaming a sin?](/blog/is-gaming-a-sin)"),
]


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
    for slug, url, sentence in LINKS:
        p = BLOG / f"{slug}.md"
        if not p.exists():
            print(f"  SKIP missing source: {slug}")
            continue
        t = p.read_text()
        if f"]({url})" in t:
            continue
        if a.dry_run:
            print(f"  {slug} -> {url}")
        else:
            p.write_text(insert_mid(t, sentence))
            t = None
        added += 1
    print(f"{'would add' if a.dry_run else 'added'} {added} links")


if __name__ == "__main__":
    main()
