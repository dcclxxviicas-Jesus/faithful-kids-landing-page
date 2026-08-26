#!/usr/bin/env python3
"""Generate real Bible word search puzzles into lib/word-searches.json.

Target: "bible word search puzzles" 5,400/mo at keyword difficulty 4
(DataForSEO clickstream, Aug 26 2026), with 41 variants in the same range.

Grids are generated here rather than drawn as images on purpose: a rendered
grid is TEXT on the page, so the words are crawlable and the puzzle is
accessible. An image of a word search is invisible to Google.

Deterministic seed so the same puzzle regenerates identically -- a grid that
reshuffles on every build would change the page content for no reason.
"""
import json
import random
import re
from pathlib import Path

OUT = Path(__file__).resolve().parent / "lib" / "word-searches.json"

PUZZLES = [
    ("noahs-ark", "Noah's Ark", "Genesis 6-9", "Ages 6+",
     ["NOAH", "ARK", "FLOOD", "RAINBOW", "DOVE", "OLIVE", "ANIMALS", "RAIN", "MOUNTAIN", "PROMISE", "FORTY", "SHEM"]),
    ("christmas", "The Christmas Story", "Luke 2", "Ages 6+",
     ["MARY", "JOSEPH", "JESUS", "MANGER", "SHEPHERDS", "ANGEL", "STAR", "BETHLEHEM", "WISEMEN", "GIFTS", "STABLE", "GABRIEL"]),
    ("easter", "The Easter Story", "Matthew 26-28", "Ages 7+",
     ["EASTER", "TOMB", "STONE", "RISEN", "CROSS", "PALM", "SUPPER", "GARDEN", "ANGEL", "MARY", "PETER", "ALIVE"]),
    ("david-and-goliath", "David and Goliath", "1 Samuel 17", "Ages 6+",
     ["DAVID", "GOLIATH", "SLING", "STONE", "SHEPHERD", "GIANT", "BRAVE", "ARMOR", "SAUL", "ISRAEL", "BROOK", "FIVE"]),
    ("fruit-of-the-spirit", "Fruit of the Spirit", "Galatians 5:22-23", "Ages 7+",
     ["LOVE", "JOY", "PEACE", "PATIENCE", "KINDNESS", "GOODNESS", "FAITH", "GENTLE", "CONTROL", "SPIRIT", "FRUIT", "GROW"]),
    ("books-of-the-bible", "Books of the Bible", "Old and New Testament", "Ages 8+",
     ["GENESIS", "EXODUS", "PSALMS", "ISAIAH", "MATTHEW", "MARK", "LUKE", "JOHN", "ACTS", "ROMANS", "JAMES", "REVELATION"]),
    ("moses", "Moses and the Exodus", "Exodus 3-14", "Ages 7+",
     ["MOSES", "EGYPT", "PHARAOH", "PLAGUES", "REDSEA", "STAFF", "BUSH", "AARON", "MANNA", "DESERT", "SINAI", "FREEDOM"]),
    ("jesus-miracles", "Miracles of Jesus", "The Gospels", "Ages 7+",
     ["WATER", "WINE", "BLIND", "LAZARUS", "STORM", "LOAVES", "FISHES", "HEALED", "WALKED", "FAITH", "LEPER", "MIRACLE"]),
    ("daniel", "Daniel in the Lions' Den", "Daniel 6", "Ages 6+",
     ["DANIEL", "LIONS", "DEN", "PRAYER", "DARIUS", "ANGEL", "WINDOW", "THREE", "TRUST", "STONE", "KING", "SAFE"]),
    ("armor-of-god", "The Armor of God", "Ephesians 6:10-18", "Ages 7+",
     ["HELMET", "SHIELD", "SWORD", "BELT", "TRUTH", "FAITH", "SPIRIT", "PEACE", "ARMOR", "STAND", "STRONG", "PRAYER"]),
]

DIRS = [(0, 1), (1, 0), (1, 1), (1, -1), (0, -1), (-1, 0), (-1, -1), (-1, 1)]
SIZE = 14
ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"


def place(grid, word, rng):
    for _ in range(400):
        dr, dc = rng.choice(DIRS)
        r = rng.randrange(SIZE)
        c = rng.randrange(SIZE)
        er, ec = r + dr * (len(word) - 1), c + dc * (len(word) - 1)
        if not (0 <= er < SIZE and 0 <= ec < SIZE):
            continue
        ok = True
        for i, ch in enumerate(word):
            cur = grid[r + dr * i][c + dc * i]
            if cur not in ("", ch):
                ok = False
                break
        if not ok:
            continue
        for i, ch in enumerate(word):
            grid[r + dr * i][c + dc * i] = ch
        return (r, c, dr, dc)
    return None


def build(slug, words):
    rng = random.Random(slug)          # deterministic per puzzle
    grid = [["" for _ in range(SIZE)] for _ in range(SIZE)]
    answers = {}
    for w in sorted(words, key=len, reverse=True):
        pos = place(grid, w, rng)
        if pos is None:
            raise SystemExit(f"could not place {w} in {slug}")
        answers[w] = {"row": pos[0], "col": pos[1], "dr": pos[2], "dc": pos[3]}
    for r in range(SIZE):
        for c in range(SIZE):
            if not grid[r][c]:
                grid[r][c] = rng.choice(ALPHABET)
    return grid, answers


data = []
for slug, title, scripture, ages, words in PUZZLES:
    clean = [re.sub(r"[^A-Z]", "", w.upper()) for w in words]
    grid, answers = build(slug, clean)
    data.append({
        "slug": slug, "title": title, "scripture": scripture, "ages": ages,
        "words": clean, "grid": grid, "answers": answers, "size": SIZE,
    })
    print(f"  {slug:<22} {len(clean)} words placed in {SIZE}x{SIZE}")

OUT.write_text(json.dumps(data, indent=0))
print(f"\nwrote {OUT.name}: {len(data)} puzzles")
