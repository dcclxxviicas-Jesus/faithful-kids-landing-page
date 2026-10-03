#!/usr/bin/env python3
"""Generate real Bible crossword puzzles into lib/crosswords.json.

Target: "bible crossword puzzles" 2,400/mo at keyword difficulty 10
(DataForSEO clickstream, Oct 2026), part of the games-night printables
cluster (charades/bingo/riddles/jokes shipped alongside).

Same architecture as build-word-searches.py, and for the same reasons:
- Grids render as HTML tables, so the clues and answers are real text on the
  page. A crossword shipped as an image is invisible to Google and unusable
  with a screen reader.
- Deterministic seed per slug so the same puzzle regenerates identically --
  a grid that reshuffles on every build would change page content for no
  reason.
- The general "bible" puzzle plays ON the hub and has NO detail route
  (excluded from generateStaticParams, the sitemap, and related lists) --
  a /bible-crossword/bible page would be near-identical to the hub and
  compete for the same head term. If you add puzzles, keep that exclusion.

These are freeform (criss-cross) crosswords, not dense American grids:
every word interlocks with at least one other, unused cells stay blank.
That is the format kids' Bible crosswords actually use, and it lets the
word lists stay story-specific instead of being padded with filler words.
"""
import json
import random
import re
from pathlib import Path

OUT = Path(__file__).resolve().parent / "lib" / "crosswords.json"

# (slug, title, scripture, ages, [(ANSWER, clue), ...])
PUZZLES = [
    # The general puzzle. Targets the head term "bible crossword" with
    # vocabulary spanning the whole Bible, so a visitor who searched the
    # broad term gets the broad puzzle. Hub-only -- see module docstring.
    ("bible", "Bible Crossword", "Genesis to Revelation", "Ages 8+", [
        ("DISCIPLE", "A follower of Jesus -- he chose twelve of them"),
        ("KINGDOM", "Jesus said God's ______ is like a tiny mustard seed"),
        ("GOSPEL", "The 'good news' -- also what Matthew, Mark, Luke, and John are called"),
        ("PRAYER", "Talking to God -- you can do it anywhere, eyes open or closed"),
        ("MOSES", "The baby in the basket who grew up to lead Israel out of Egypt"),
        ("DAVID", "The shepherd boy who became Israel's greatest king"),
        ("ANGEL", "God's messenger -- usually starts by saying 'Do not be afraid'"),
        ("PSALM", "A song-prayer from the longest book in the Bible"),
        ("FAITH", "Trusting God even when you cannot see what comes next"),
        ("JESUS", "Born in Bethlehem, the center of the whole Bible"),
        ("BIBLE", "God's book -- 66 books bound as one"),
        ("NOAH", "He built a boat before the rain started"),
    ]),
    ("christmas", "The Christmas Story", "Luke 2", "Ages 7+", [
        ("BETHLEHEM", "The little town where Jesus was born"),
        ("SHEPHERDS", "They heard the angels first, out in the fields at night"),
        ("GABRIEL", "The angel who told Mary the news"),
        ("WISEMEN", "They followed the star bringing gold, frankincense, and myrrh"),
        ("MANGER", "The animals' feeding box where baby Jesus slept"),
        ("JOSEPH", "The carpenter who took Mary to Bethlehem"),
        ("STABLE", "Where Jesus was born, because there was no room at the inn"),
        ("MARY", "The mother of Jesus"),
        ("STAR", "The bright light the wise men followed"),
        ("GOLD", "The first of the three gifts"),
    ]),
    ("noahs-ark", "Noah's Ark", "Genesis 6-9", "Ages 6+", [
        ("RAINBOW", "God's colorful promise in the sky"),
        ("ANIMALS", "They came aboard two by two"),
        ("PROMISE", "God's word that a flood would never cover the earth again"),
        ("FLOOD", "Water that covered even the mountains"),
        ("OLIVE", "The kind of leaf the dove brought back"),
        ("FORTY", "How many days and nights it rained"),
        ("DOVE", "The bird that found dry land"),
        ("NOAH", "The man who did everything just as God commanded"),
        ("RAIN", "It started when the ark door closed"),
        ("ARK", "The giant boat built from gopher wood"),
    ]),
    ("moses", "Moses and the Exodus", "Exodus 1-20", "Ages 7+", [
        ("PHARAOH", "The stubborn king who said no -- ten times"),
        ("PLAGUES", "Frogs, flies, hail... ten of them in all"),
        ("BASKET", "Baby Moses floated down the Nile in one"),
        ("MANNA", "Bread from heaven, fresh every morning"),
        ("SINAI", "The mountain where God gave the Ten Commandments"),
        ("STAFF", "Moses' walking stick that turned into a snake"),
        ("AARON", "Moses' brother, who spoke for him"),
        ("EGYPT", "The land Israel marched out of"),
        ("MOSES", "He told Pharaoh, 'Let my people go'"),
        ("BUSH", "It burned with fire but was not burned up"),
    ]),
    ("david-and-goliath", "David and Goliath", "1 Samuel 17", "Ages 6+", [
        ("SHEPHERD", "David's job before the battle"),
        ("GOLIATH", "The giant Philistine champion"),
        ("ARMOR", "King Saul lent David his -- it was far too big"),
        ("SLING", "David's only weapon"),
        ("STONE", "He picked five, and one was enough"),
        ("BROOK", "Where David picked up the smooth stones"),
        ("GIANT", "Goliath stood over nine feet tall -- he was one"),
        ("DAVID", "The shepherd boy who won"),
        ("FIVE", "How many smooth stones David chose"),
        ("SAUL", "The king who watched from the camp"),
    ]),
    ("easter", "The Easter Story", "Matthew 26-28", "Ages 7+", [
        ("GARDEN", "Gethsemane -- where Jesus prayed on the night he was arrested"),
        ("SUPPER", "Jesus' last meal with his disciples"),
        ("RISEN", "'He is not here; he has ______!'"),
        ("STONE", "It was rolled away from the tomb"),
        ("ANGEL", "The messenger sitting where Jesus had lain"),
        ("CROSS", "Where Jesus died on Good Friday"),
        ("ALIVE", "What Jesus is -- the whole point of Easter morning"),
        ("TOMB", "It was empty on Sunday morning"),
        ("PALM", "Branches waved when Jesus rode into Jerusalem"),
        ("MARY", "Magdalene -- the first to see the risen Jesus"),
    ]),
    ("jesus-miracles", "Miracles of Jesus", "The Gospels", "Ages 7+", [
        ("LAZARUS", "He walked out of the tomb when Jesus called his name"),
        ("WALKED", "What Jesus did on top of the sea"),
        ("LOAVES", "Five of these fed five thousand people"),
        ("FISHES", "Two of these helped feed the crowd"),
        ("STORM", "Jesus told it, 'Peace, be still'"),
        ("BLIND", "Bartimaeus was -- until Jesus healed him"),
        ("LEPER", "Ten were healed; only one came back to say thank you"),
        ("FAITH", "Jesus often said, 'Your ______ has healed you'"),
        ("WATER", "At Cana, Jesus turned it into wine"),
        ("WINE", "What the jars at the wedding held after the miracle"),
    ]),
]

WORK = 25  # working grid; trimmed to the bounding box afterwards


def neighbors_clear(grid, r, c, dr, dc):
    """For a newly-written (non-intersection) cell, the cells perpendicular
    to the word's direction must be empty, or two parallel words would touch
    and spell garbage."""
    for pr, pc in ((dc, dr), (-dc, -dr)):  # perpendicular offsets
        rr, cc = r + pr, c + pc
        if 0 <= rr < WORK and 0 <= cc < WORK and grid[rr][cc]:
            return False
    return True


def try_place(grid, word, r, c, dr, dc):
    er, ec = r + dr * (len(word) - 1), c + dc * (len(word) - 1)
    if not (0 <= r < WORK and 0 <= c < WORK and 0 <= er < WORK and 0 <= ec < WORK):
        return None
    # cell before the start and after the end must be empty
    br, bc = r - dr, c - dc
    ar, ac = er + dr, ec + dc
    if 0 <= br < WORK and 0 <= bc < WORK and grid[br][bc]:
        return None
    if 0 <= ar < WORK and 0 <= ac < WORK and grid[ar][ac]:
        return None
    crossings = 0
    for i, ch in enumerate(word):
        rr, cc = r + dr * i, c + dc * i
        cur = grid[rr][cc]
        if cur:
            if cur != ch:
                return None
            crossings += 1
        elif not neighbors_clear(grid, rr, cc, dr, dc):
            return None
    return crossings


def build(slug, entries, attempt=0):
    rng = random.Random(f"{slug}:{attempt}")
    words = sorted([w for w, _ in entries], key=len, reverse=True)
    # Keep the longest word as the spine, but explore different orders for
    # the rest across attempts -- a fixed greedy order dead-ends on some sets.
    rest = words[1:]
    rng.shuffle(rest)
    words = words[:1] + rest
    grid = [["" for _ in range(WORK)] for _ in range(WORK)]
    placed = {}  # word -> (r, c, dr, dc)

    # first word horizontal through the center
    w0 = words[0]
    r0, c0 = WORK // 2, (WORK - len(w0)) // 2
    for i, ch in enumerate(w0):
        grid[r0][c0 + i] = ch
    placed[w0] = (r0, c0, 0, 1)

    for w in words[1:]:
        candidates = []
        for i, ch in enumerate(w):
            for r in range(WORK):
                for c in range(WORK):
                    if grid[r][c] != ch:
                        continue
                    for dr, dc in ((0, 1), (1, 0)):
                        sr, sc = r - dr * i, c - dc * i
                        crossings = try_place(grid, w, sr, sc, dr, dc)
                        if crossings:
                            dist = abs(sr + dr * len(w) / 2 - WORK / 2) + abs(sc + dc * len(w) / 2 - WORK / 2)
                            candidates.append((-crossings, dist, rng.random(), sr, sc, dr, dc))
        if not candidates:
            return None
        candidates.sort()
        _, _, _, sr, sc, dr, dc = rng.choice(candidates[:4])
        for i, ch in enumerate(w):
            grid[sr + dr * i][sc + dc * i] = ch
        placed[w] = (sr, sc, dr, dc)
    return grid, placed


def trim(grid, placed):
    rows = [r for r in range(WORK) if any(grid[r])]
    cols = [c for c in range(WORK) if any(grid[r][c] for r in range(WORK))]
    r0, r1, c0, c1 = min(rows), max(rows), min(cols), max(cols)
    out = [[grid[r][c] or None for c in range(c0, c1 + 1)] for r in range(r0, r1 + 1)]
    shifted = {w: (r - r0, c - c0, dr, dc) for w, (r, c, dr, dc) in placed.items()}
    return out, shifted


def number(grid, placed, clue_of):
    """Standard crossword numbering: scan row-major, number any cell that
    starts an across or a down answer."""
    rows, cols = len(grid), len(grid[0])
    starts = {}
    for w, (r, c, dr, dc) in placed.items():
        starts.setdefault((r, c), []).append((w, dr, dc))
    nums = {}
    across, down = [], []
    n = 0
    for r in range(rows):
        for c in range(cols):
            here = starts.get((r, c))
            if not here:
                continue
            n += 1
            nums[f"{r},{c}"] = n
            for w, dr, dc in here:
                item = {"num": n, "clue": clue_of[w], "answer": w,
                        "row": r, "col": c, "len": len(w)}
                (across if dc == 1 else down).append(item)
    return nums, across, down


data = []
for slug, title, scripture, ages, entries in PUZZLES:
    entries = [(re.sub(r"[^A-Z]", "", w.upper()), clue) for w, clue in entries]
    clue_of = dict(entries)
    result = None
    for attempt in range(60):
        result = build(slug, entries, attempt)
        if result:
            break
    if not result:
        raise SystemExit(f"could not interlock {slug} after 60 attempts")
    grid, placed = trim(*result)
    nums, across, down = number(grid, placed, clue_of)
    data.append({
        "slug": slug, "title": title, "scripture": scripture, "ages": ages,
        "rows": len(grid), "cols": len(grid[0]),
        "grid": grid, "nums": nums, "across": across, "down": down,
    })
    print(f"  {slug:<22} {len(entries)} words, {len(grid)}x{len(grid[0])}, "
          f"{len(across)} across / {len(down)} down (attempt {attempt})")

OUT.write_text(json.dumps(data, indent=0))
print(f"\nwrote {OUT.name}: {len(data)} puzzles")
