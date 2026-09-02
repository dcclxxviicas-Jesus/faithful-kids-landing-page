#!/usr/bin/env python3
"""Second-pass link blitz for printables detail pages, seasonal hubs, and /homeschool.

WHY (Sep 2, 2026, owner priority)
---------------------------------
Two weeks after link-printable-details.py, GSC shows the detail pages indexed
but not competing: /printables/bible-word-search at position 79.7 for its own
head term, 24 of 26 coloring details still at exactly ONE inbound link, and the
Christmas/Easter coloring hubs at ZERO. The first pass's caps (2-3 per target)
were too conservative. Goal here: ~8 per detail page, ~12 per seasonal hub,
~10 for /homeschool — before the mid-October seasonal deadline.

HOW IT DIFFERS FROM PASS ONE
----------------------------
- Tiered matching: exact story regex first, then a broad thematic pool, then a
  generic audience pool (activities/sunday-school/story posts) to fill.
- A post may now carry at most TWO printable links total (pass one allowed one
  ever) — checked by counting "](/printables" in the body.
- Placement is mid-article (after the 3rd h2) instead of before-FAQ, so this
  pass cannot clump with the sentences pass one and the other linkers already
  placed at the FAQ boundary.
- Five named high-authority posts (top 5 = 42% of blog impressions) are
  force-assigned to high-value targets with hand-written sentences.
- Seasonal targets fill first (mid-October recrawl deadline).

Idempotent; --dry-run first, always.
"""
import argparse, hashlib, json, re
from pathlib import Path

BLOG = Path(__file__).resolve().parent / "content" / "blog"
CP = "/printables/bible-coloring-pages"
WS = "/printables/bible-word-search"

# Hand-assigned links from the five highest-authority posts. Sentence names the
# artifact and fits the host post's context.
PRIORITY = [
    ("bible-verses-for-sick-kids", f"{CP}/the-good-shepherd",
     "For a quiet bedside activity, our free [Good Shepherd coloring page](/printables/bible-coloring-pages/the-good-shepherd) pairs gently with these verses — one sheet, ready to print."),
    ("bible-stories-for-toddlers", f"{CP}/noahs-ark",
     "Toddlers who love this story can color it too — the free [Noah's Ark coloring page](/printables/bible-coloring-pages/noahs-ark) prints on one sheet."),
    ("bible-trivia-for-kids", "/printables/christmas-coloring-pages",
     "Around the holidays, pair a trivia round with our free [Christmas coloring pages](/printables/christmas-coloring-pages) — six nativity scenes to print while you play."),
    ("bible-trivia-for-teens", f"{WS}/books-of-the-bible",
     "For a quieter challenge between rounds, the [books of the Bible word search](/printables/bible-word-search/books-of-the-bible) plays in the browser or prints for the table."),
    ("bible-games-for-kids", "/printables/easter-coloring-pages",
     "In spring, add a quiet station with our free [Easter coloring pages](/printables/easter-coloring-pages) — five printable scenes walking Holy Week."),
]

# (url, goal_total, exact_re, thematic_re, generic_pool_key, anchor)
T = [
    # --- seasonal hubs first: mid-October deadline ---------------------------
    ("/printables/christmas-coloring-pages", 12, r"(^|-)(christmas|advent|nativity)", r"(^|-)(december|wise-men|joseph-and-the-angel|journey-to-bethlehem)", "kids", "Christmas coloring pages"),
    ("/printables/easter-coloring-pages", 12, r"(^|-)(easter|holy-week|good-friday|lent|resurrection)", r"(^|-)(palm-sunday|last-supper|emmaus|empty-tomb)", "kids", "Easter coloring pages"),
    ("/homeschool", 10, r"(^|-)(homeschool|curriculum)", r"(^|-)(bible-study|family-bible|bible-time|lesson-plan|teach)", "family", "free homeschool Bible curriculum page"),
    # --- coloring details ----------------------------------------------------
    (f"{CP}/creation", 8, r"(^|-)(creation|in-the-beginning)(-|$)", r"(^|-)(genesis|adam)", "young", "Creation coloring page"),
    (f"{CP}/adam-and-eve-garden", 8, r"(^|-)the-garden-and-the-fall(-|$)", r"(^|-)(genesis|adam|eve|sin)", "young", "Adam and Eve coloring page"),
    (f"{CP}/noahs-ark", 8, r"(^|-)noah", r"(^|-)(genesis|flood|rainbow|animals)", "young", "Noah's Ark coloring page"),
    (f"{CP}/moses-red-sea", 8, r"(^|-)(red-sea|crossing-the)", r"(^|-)(moses|exodus|passover|plague)", "kids", "Red Sea coloring page"),
    (f"{CP}/david-and-goliath", 8, r"(^|-)david-and-goliath(-|$)", r"(^|-)(david|goliath|1-samuel|courage|brave)", "kids", "David and Goliath coloring page"),
    (f"{CP}/daniel-lions-den", 8, r"(^|-)daniel-in-the-lions-den(-|$)", r"(^|-)(daniel|lions|exile|babylon)", "kids", "Daniel in the lions' den coloring page"),
    (f"{CP}/the-fiery-furnace", 8, r"(^|-)the-fiery-furnace(-|$)", r"(^|-)(shadrach|daniel|fire|faith)", "kids", "fiery furnace coloring page"),
    (f"{CP}/jonah-and-the-big-fish", 8, r"(^|-)jonah", r"(^|-)(fish|whale|nineveh|obey)", "young", "Jonah coloring page"),
    (f"{CP}/jesus-calms-the-storm", 8, r"(^|-)(calming-the-storm|calms-the-storm)", r"(^|-)(storm|fear|boat|peace|worry|anxious)", "kids", "Jesus calms the storm coloring page"),
    (f"{CP}/the-good-shepherd", 8, r"(^|-)the-good-shepherd(-|$)", r"(^|-)(shepherd|psalm-23|sheep|comfort)", "young", "Good Shepherd coloring page"),
    (f"{CP}/the-lost-sheep", 8, r"(^|-)the-lost-sheep(-|$)", r"(^|-)(parable|lost|sheep|luke)", "young", "lost sheep coloring page"),
    (f"{CP}/the-good-samaritan", 8, r"(^|-)the-good-samaritan(-|$)", r"(^|-)(parable|kindness|neighbor|luke)", "kids", "Good Samaritan coloring page"),
    (f"{CP}/road-to-emmaus", 8, r"(^|-)the-road-to-emmaus(-|$)", r"(^|-)(resurrection|easter|luke|appear)", "kids", "road to Emmaus coloring page"),
    (f"{CP}/the-last-supper", 8, r"(^|-)the-last-supper(-|$)", r"(^|-)(communion|passover|holy-week|maundy)", "kids", "Last Supper coloring page"),
    (f"{CP}/palm-sunday", 8, r"(^|-)(triumphal-entry|palm-sunday)", r"(^|-)(holy-week|easter|jerusalem|donkey)", "kids", "Palm Sunday coloring page"),
    (f"{CP}/the-cross", 8, r"(^|-)the-cross(-|$)", r"(^|-)(good-friday|crucif|salvation|forgive)", "kids", "the cross coloring page"),
    (f"{CP}/angel-visits-mary", 8, r"(^|-)an-angel-visits-mary(-|$)", r"(^|-)(mary|angel|annunciation|luke-1)", "kids", "angel visits Mary coloring page"),
    (f"{CP}/journey-to-bethlehem", 8, r"(^|-)the-journey-to-bethlehem(-|$)", r"(^|-)(bethlehem|mary|joseph)", "kids", "journey to Bethlehem coloring page"),
    (f"{CP}/wise-men-star", 8, r"(^|-)the-wise-men(-|$)", r"(^|-)(wise-men|magi|star|epiphany)", "kids", "wise men coloring page"),
    (f"{CP}/armor-of-god", 8, r"(^|-)the-armor-of-god(-|$)", r"(^|-)(ephesians|armor|spiritual|strength)", "kids", "Armor of God coloring page"),
    (f"{CP}/the-empty-tomb", 8, r"(^|-)the-empty-tomb(-|$)", r"(^|-)(resurrection|easter|tomb|risen)", "kids", "empty tomb coloring page"),
    (f"{CP}/baby-jesus-manger", 8, r"(^|-)the-christmas-story(-|$)", r"(^|-)(manger|birth-of-jesus|christmas|luke-2)", "young", "baby Jesus in the manger coloring page"),
    (f"{CP}/jesus-and-the-children", 8, r"(^|-)(jesus-blesses|let-the-children)", r"(^|-)(children|bless|mark-10)", "young", "Jesus and the children coloring page"),
    (f"{CP}/shepherds-and-angels", 8, r"(^|-)(shepherds|joseph-and-the-angel)", r"(^|-)(christmas|angel|luke-2)", "young", "shepherds and angels coloring page"),
    (f"{CP}/nativity-scene", 8, r"(^|-)nativity(-|$)", r"(^|-)(christmas|advent|manger)", "kids", "nativity coloring page"),
    (f"{CP}/resurrection-morning", 8, r"(^|-)resurrection(-|$)", r"(^|-)(easter|risen|tomb|mary-magdalene)", "kids", "resurrection coloring page"),
    # --- word search details -------------------------------------------------
    (f"{WS}/noahs-ark", 8, r"(^|-)noah", r"(^|-)(genesis|flood|animals)", "games", "Noah's Ark word search"),
    (f"{WS}/david-and-goliath", 8, r"(^|-)david", r"(^|-)(1-samuel|goliath|courage)", "games", "David and Goliath word search"),
    (f"{WS}/daniel", 8, r"(^|-)daniel", r"(^|-)(lions|exile|babylon|faith)", "games", "Daniel word search"),
    (f"{WS}/moses", 8, r"(^|-)(moses|exodus)", r"(^|-)(passover|commandments|wilderness)", "games", "Moses word search"),
    (f"{WS}/fruit-of-the-spirit", 8, r"(^|-)fruit-of-the-spirit(-|$)", r"(^|-)(galatians|kindness|patience|character)", "games", "Fruit of the Spirit word search"),
    (f"{WS}/books-of-the-bible", 8, r"(^|-)books-of-the-bible(-|$)", r"(^|-)(bible-reading|memory|study|66)", "games", "books of the Bible word search"),
    (f"{WS}/jesus-miracles", 8, r"(^|-)(miracle|water-into-wine|feeding-the|healing-the|lazarus)", r"(^|-)(jesus|gospel)", "games", "miracles of Jesus word search"),
    (f"{WS}/armor-of-god", 8, r"(^|-)(armor-of-god|ephesians)", r"(^|-)(spiritual|strength|paul)", "games", "Armor of God word search"),
]

POOLS = {
    "young": r"(^|-)(toddler|preschool|bedtime|5-year|kindergarten|little|young)",
    "kids": r"(^|-)(sunday-school|activities|crafts|games|lessons|for-kids)",
    "family": r"(^|-)(family|homeschool|devotion|parent|bible-time|children)",
    "games": r"(^|-)(games|trivia|activities|youth|icebreaker|quiz)",
}

TEMPLATES = {
    "cp": [
        "There is a free [{a}](/{u}) on our site too, printable on one sheet with no sign-up.",
        "We drew a printable [{a}](/{u}) to go with this story — free, and the printed sheet includes the answer to where it came from.",
        "For quiet time afterwards, print the free [{a}](/{u}) and let them color while you talk it through.",
        "Pair this with our free [{a}](/{u}) — one sheet, ready for the kitchen table or the classroom.",
        "If small hands need something to do while you read, the free [{a}](/{u}) is made for exactly that.",
        "A related freebie: our [{a}](/{u}), drawn as clean line art for crayons and markers.",
    ],
    "ws": [
        "Older kids who find coloring dull usually take to the free [{a}](/{u}) instead — it plays in the browser or prints on one sheet.",
        "There is a free [{a}](/{u}) to go with this, playable on a phone and printable for a class.",
        "For a quieter follow-up, try the free [{a}](/{u}) — twelve hidden words, answer key included.",
        "We built a [{a}](/{u}) around this story — free, no sign-up, on screen or on paper.",
        "Add five quiet minutes with the free [{a}](/{u}); it prints one to a sheet with the key on the page.",
    ],
    "hub": [
        "Our free [{a}](/{u}) are ready to print for the season — no email wall, no sign-up.",
        "For the season, we keep a set of free [{a}](/{u}) — print as many as your class needs.",
        "There is also a free set of [{a}](/{u}) on our site, drawn for crayons and ready to print.",
    ],
    "hs": [
        "Homeschooling? Our [{a}](/homeschool) shows how families use the video lessons as an open-and-go Bible block.",
        "If you homeschool, the [{a}](/homeschool) lays out how the lessons work as a daily Bible block, in order.",
        "For homeschool families, our [{a}](/homeschool) covers what a day looks like and what it costs.",
    ],
}

SKIP = re.compile(r"coloring|word-search|printable|-vs-|bible-app|apps-for|apps-by|educational-apps|screen-time")


def kind_for(url):
    if url == "/homeschool":
        return "hs"
    if url.startswith(f"{CP}/"):
        return "cp"
    if url.startswith(f"{WS}/"):
        return "ws"
    return "hub"


def insert_mid(text, sentence):
    """After the 3rd h2 section (before the 4th '## '); fallback before-FAQ, else end."""
    lines = text.split("\n")
    h2s = [i for i, l in enumerate(lines) if l.startswith("## ")]
    if len(h2s) >= 4:
        at = h2s[3]
        while at > 0 and not lines[at - 1].strip():
            at -= 1
        lines.insert(at, "")
        lines.insert(at + 1, sentence)
        return "\n".join(lines), "mid"
    faq = next((i for i, l in enumerate(lines) if re.match(r"^## (Frequently Asked Questions|FAQ)", l)), None)
    if faq is not None:
        end = faq
        while end > 0 and not lines[end - 1].strip():
            end -= 1
        lines.insert(end, "")
        lines.insert(end + 1, sentence)
        return "\n".join(lines), "before-faq"
    while lines and not lines[-1].strip():
        lines.pop()
    return "\n".join(lines + ["", sentence, ""]), "end"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    posts = {p.stem: p for p in sorted(BLOG.glob("*.md"))}
    text = {s: p.read_text() for s, p in posts.items()}
    before = json.load(open("/tmp/printables-before.json"))
    used_this_run = set()
    plan = []

    def eligible(slug, url):
        if slug in used_this_run or SKIP.search(slug):
            return False
        t = text[slug]
        if re.search(r"\]\((?:https://faithfulkids\.app)?" + re.escape(url) + r"[)#?]", t):
            return False
        # at most 2 printable links per post total (incl. pass one)
        if url != "/homeschool" and t.count("](/printables") >= 2:
            return False
        if url == "/homeschool" and "](/homeschool" in t:
            return False
        return True

    # 1) priority hand-assignments from the five high-authority posts
    for slug, url, sentence in PRIORITY:
        if slug in text and eligible(slug, url):
            plan.append((slug, url, sentence))
            used_this_run.add(slug)

    # 2) tiered fill per target
    counts = {}
    for slug, url, _ in plan:
        counts[url] = counts.get(url, 0) + 1
    for url, goal, exact, thematic, pool_key, anchor in T:
        have = before.get(url, 0) + counts.get(url, 0)
        need = goal - have
        if need <= 0:
            continue
        kind = kind_for(url)
        # Final fallback: any story post ("-for-kids") — only reached when the
        # matched pools run dry, which happened to 7 targets on the first pass.
        tiers = [re.compile(exact), re.compile(thematic), re.compile(POOLS[pool_key]),
                 re.compile(r"-for-kids$")]
        for rx in tiers:
            if need <= 0:
                break
            for slug in posts:
                if need <= 0:
                    break
                if not rx.search(slug) or not eligible(slug, url):
                    continue
                if slug.replace("-", "") in url.replace("-", "").replace("/", ""):
                    continue
                tpl = TEMPLATES[kind]
                sentence = tpl[int(hashlib.sha256((slug + url).encode()).hexdigest()[:8], 16) % len(tpl)].format(a=anchor, u=url.lstrip("/"))
                plan.append((slug, url, sentence))
                used_this_run.add(slug)
                counts[url] = counts.get(url, 0) + 1
                need -= 1

    placements = {}
    for slug, url, sentence in plan:
        new, where = insert_mid(text[slug], sentence)
        text[slug] = new  # keep in-memory state so a post never gets two this run
        placements[where] = placements.get(where, 0) + 1
        if not args.dry_run:
            posts[slug].write_text(new)

    print(f"{'would add' if args.dry_run else 'added'} {len(plan)} links | placement {placements}")
    print(f"{'TARGET':<58} before  +new  total  goal")
    for url, goal, *_ in T:
        b = before.get(url, 0)
        n = counts.get(url, 0)
        flag = "  <-- SHORT" if b + n < goal else ""
        print(f"{url:<58} {b:>5}  {n:>4}  {b+n:>5}  {goal:>4}{flag}")


if __name__ == "__main__":
    main()
