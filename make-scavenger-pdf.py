#!/usr/bin/env python3
"""Bible scavenger hunt printable: three complete hunts + answer key.

"bible scavenger hunt" is 590 Ads / 610 clickstream at KD 0 and page 1 is
blogspot-tier. Artifact rule: ship the hunt, not an article about hunts.

Separate script from make-games-pdfs.py ON PURPOSE: reportlab output is not
byte-stable (embedded timestamps), so rebuilding the whole game set would
force a CloudFront invalidation of four already-cached PDFs for nothing.

Run with ~/.fk-venv/bin/python3; output games-pdf/bible-scavenger-hunt.pdf;
upload via s3-put.py to CDN printables/.
"""
from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen.canvas import Canvas

HERE = Path(__file__).parent
OUT = HERE / "games-pdf"
OUT.mkdir(exist_ok=True)
GREEN = HexColor("#16a34a")
DARKGREEN = HexColor("#15803d")
INK = HexColor("#1f2937")
MUTED = HexColor("#6b7280")
LINE = HexColor("#d1d5db")
PAGE_W, PAGE_H = letter

# Hunt 1: sword-drill verse hunt. (clue, reference, answer)
VERSE_HUNT = [
    ("What did God put in the sky as a promise?", "Genesis 9:13", "A rainbow"),
    ("How many smooth stones did David pick up?", "1 Samuel 17:40", "Five"),
    ("What was Jonah inside for three days and nights?", "Jonah 1:17", "A great fish"),
    ("What did the dove bring back to Noah?", "Genesis 8:11", "An olive leaf"),
    ("Where was Jesus born?", "Luke 2:4-7", "Bethlehem"),
    ("What fell from heaven for Israel to eat each morning?", "Exodus 16:14-15", "Manna"),
    ("What did Jesus use to feed five thousand people?", "John 6:9", "Five loaves and two fish"),
    ("Who climbed a tree to see Jesus?", "Luke 19:2-4", "Zacchaeus"),
    ("What shut the lions' mouths in the den?", "Daniel 6:22", "God's angel"),
    ("What did the shepherds find lying in a manger?", "Luke 2:16", "The baby Jesus"),
    ("How many days did it rain on Noah's ark?", "Genesis 7:12", "Forty"),
    ("What did Moses see burning that was not burned up?", "Exodus 3:2", "A bush"),
]

# Hunt 2: around-the-house object hunt for younger kids.
OBJECT_HUNT = [
    ("Something that floats", "like Noah's ark"),
    ("Something that gives light", "like the star over Bethlehem"),
    ("A small smooth stone", "like David's"),
    ("Something made of wood", "like the manger"),
    ("A piece of bread or a cracker", "like the loaves Jesus shared"),
    ("Something with all the rainbow's colors", "like God's promise"),
    ("A toy animal that was on the ark", "any animal, two is better"),
    ("Something a shepherd could use", "a stick, a blanket, a bell"),
    ("A coin", "like the lost coin in Jesus' story"),
    ("Something that holds water", "like the jars at the wedding in Cana"),
    ("A seed or something a seed becomes", "like the mustard seed"),
    ("Your Bible", "bring it back and pick a story to read tonight"),
]

# Hunt 3: church / group photo hunt for older kids and youth groups.
PHOTO_HUNT = [
    "The whole team by the church sign (or front door)",
    "Someone holding a Bible open to PSALMS - the exact middle",
    "A cross anywhere in the building - the less obvious, the better",
    "The team acting out David and Goliath, frozen mid-scene",
    "Something that holds water (bonus if it's the baptistery)",
    "A team member shaking hands with someone over 60",
    "The verse John 3:16 - printed, on a wall, or handwritten",
    "The team recreating the fiery furnace: three standing, one 'angel'",
    "Something with a dove, lamb, or fish on it",
    "A hymnal or songbook opened to a song about grace",
    "The whole team pointing at a picture or window of Jesus",
    "Everyone jumping at once in front of the church - Jericho walls coming down",
]


def footer(c, note=""):
    c.setFont("Helvetica", 8.5)
    c.setFillColor(MUTED)
    c.drawString(54, 30, note)
    c.setFillColor(GREEN)
    c.drawRightString(PAGE_W - 54, 30, "FaithfulKids.app")


def title_block(c, title, sub):
    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 20)
    c.drawString(54, PAGE_H - 64, title)
    c.setFont("Helvetica", 10.5)
    c.setFillColor(MUTED)
    c.drawString(54, PAGE_H - 82, sub)


def checklist_page(c, title, sub, items, foot):
    title_block(c, title, sub)
    footer(c, foot)
    y = PAGE_H - 125
    c.setFillColor(INK)
    for i, item in enumerate(items, 1):
        main, hint = item if isinstance(item, tuple) else (item, None)
        c.setStrokeColor(LINE)
        c.rect(54, y - 3, 13, 13)
        c.setFont("Helvetica-Bold", 11.5)
        c.setFillColor(INK)
        c.drawString(78, y, main)
        if hint:
            c.setFont("Helvetica-Oblique", 9.5)
            c.setFillColor(MUTED)
            c.drawString(78, y - 14, hint)
            y -= 14
        y -= 36
    c.showPage()


out = OUT / "bible-scavenger-hunt.pdf"
c = Canvas(str(out), pagesize=letter)
c.setTitle("Bible Scavenger Hunt - Three Printable Hunts")

# Hunt 1: verse hunt (two columns: clue + reference, blank line to write answer)
title_block(c, "Bible Verse Scavenger Hunt",
            "Look up each verse to find the answer. First one done with all twelve wins. Bibles open!")
footer(c, "Answer key on the last page - keep it with the grown-up.")
y = PAGE_H - 125
for i, (clue, ref, _a) in enumerate(VERSE_HUNT, 1):
    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 11)
    c.drawString(54, y, f"{i}. {clue}")
    c.setFillColor(DARKGREEN)
    c.setFont("Helvetica-Bold", 10)
    c.drawString(78, y - 15, ref)
    c.setStrokeColor(LINE)
    c.line(220, y - 17, PAGE_W - 54, y - 17)
    y -= 47
c.showPage()

checklist_page(c, "Around-the-House Bible Hunt",
               "For younger kids. Find each thing and bring it back - every one connects to a story.",
               OBJECT_HUNT, "When you're done: pick one object and tell its Bible story together.")

checklist_page(c, "Church Photo Scavenger Hunt",
               "For youth groups. One phone per team, 20 minutes, every photo needs the whole team in it.",
               PHOTO_HUNT, "Tiebreaker: most creative Goliath face. Judges' decision is final.")

# Answer key
title_block(c, "Answer Key - Verse Hunt", "Keep this page with the grown-up.")
footer(c, "Free to photocopy for home, class, or church.")
y = PAGE_H - 125
c.setFillColor(INK)
for i, (_clue, ref, ans) in enumerate(VERSE_HUNT, 1):
    c.setFont("Helvetica", 11)
    c.drawString(54, y, f"{i}. {ans}")
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 9.5)
    c.drawString(300, y, f"({ref})")
    c.setFillColor(INK)
    y -= 22
c.showPage()
c.save()
print(f"wrote {out.name}")
