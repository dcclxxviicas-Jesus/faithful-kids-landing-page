#!/usr/bin/env python3
"""Books of the Bible printable: wall chart + flashcards + bookmarks, one PDF.

Why: "books of the bible in order" is 49,500/mo Ads / 8,191 clickstream at
KD 13, "books of the bible printable" 1,300/356 KD 0 — and our post at
/blog/books-of-the-bible-printable ranked pos ~18 while telling readers how
to MAKE a printable. Same failure mode as the game posts: the artifact was
missing. This is the artifact.

Playbook rules: every page carries FaithfulKids.app; nothing email-gated.
Run with ~/.fk-venv/bin/python3; output in games-pdf/; upload via s3-put.py
to CDN printables/books-of-the-bible.pdf.
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
PALE = HexColor("#f0fdf4")
PAGE_W, PAGE_H = letter

# (group, testament, [books])
GROUPS = [
    ("The Law", "OT", ["Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy"]),
    ("History", "OT", ["Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel", "1 Kings",
                        "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah", "Esther"]),
    ("Poetry & Wisdom", "OT", ["Job", "Psalms", "Proverbs", "Ecclesiastes", "Song of Solomon"]),
    ("Major Prophets", "OT", ["Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel"]),
    ("Minor Prophets", "OT", ["Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah",
                               "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi"]),
    ("Gospels", "NT", ["Matthew", "Mark", "Luke", "John"]),
    ("Church History", "NT", ["Acts"]),
    ("Paul's Letters", "NT", ["Romans", "1 Corinthians", "2 Corinthians", "Galatians",
                               "Ephesians", "Philippians", "Colossians", "1 Thessalonians",
                               "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus", "Philemon"]),
    ("General Letters", "NT", ["Hebrews", "James", "1 Peter", "2 Peter",
                                "1 John", "2 John", "3 John", "Jude"]),
    ("Prophecy", "NT", ["Revelation"]),
]
ALL = [(g, t, b) for g, t, books in GROUPS for b in books]
assert len(ALL) == 66, len(ALL)


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


def chart_page(c):
    """One-page wall chart: OT left column, NT right column, grouped."""
    title_block(c, "The 66 Books of the Bible", "In order, Genesis to Revelation - 39 Old Testament, 27 New Testament.")
    footer(c, "Free to photocopy for home, class, or church. - faithfulkids.app/blog/books-of-the-bible-printable")

    col_x = {"OT": 54, "NT": PAGE_W / 2 + 14}
    col_w = PAGE_W / 2 - 68
    y = {"OT": PAGE_H - 108, "NT": PAGE_H - 108}

    # testament headers
    for t, label in (("OT", "OLD TESTAMENT - 39 BOOKS"), ("NT", "NEW TESTAMENT - 27 BOOKS")):
        c.setFillColor(DARKGREEN)
        c.setFont("Helvetica-Bold", 11)
        c.drawString(col_x[t], y[t], label)
        y[t] -= 16

    n = 0
    for group, t, books in GROUPS:
        x = col_x[t]
        # group band
        c.setFillColor(PALE)
        c.rect(x - 4, y[t] - 3.5, col_w, 13, fill=1, stroke=0)
        c.setFillColor(DARKGREEN)
        c.setFont("Helvetica-Bold", 8.5)
        c.drawString(x, y[t], f"{group.upper()}  ({len(books)})")
        y[t] -= 14.5
        for b in books:
            n += 1
            c.setFillColor(MUTED)
            c.setFont("Helvetica", 8)
            c.drawRightString(x + 16, y[t], str(n))
            c.setFillColor(INK)
            c.setFont("Helvetica-Bold", 9.5)
            c.drawString(x + 22, y[t], b)
            y[t] -= 12.4
        y[t] -= 4
    c.showPage()


def flashcard_pages(c):
    """66 cards, 3 x 5 per page, cut lines. Front shows number + name + group."""
    cols, rows = 3, 5
    cw = (PAGE_W - 108) / cols
    ch = (PAGE_H - 150) / rows
    for i, (group, t, book) in enumerate(ALL):
        pos = i % (cols * rows)
        if pos == 0:
            title_block(c, "Books of the Bible Flashcards",
                        "Cut them out. Shuffle, race to order them, or play the shelf game by group.")
            footer(c, "Cards %d-%d of 66" % (i + 1, min(i + cols * rows, 66)))
        col, row = pos % cols, pos // cols
        x = 54 + col * cw
        y = PAGE_H - 110 - (row + 1) * ch
        c.setDash(3, 3)
        c.setStrokeColor(LINE)
        c.rect(x + 4, y + 4, cw - 8, ch - 8)
        c.setDash()
        c.setFillColor(MUTED)
        c.setFont("Helvetica", 8)
        c.drawString(x + 12, y + ch - 20, f"#{i + 1}")
        c.drawRightString(x + cw - 12, y + ch - 20, "OT" if t == "OT" else "NT")
        c.setFillColor(INK)
        # fit long names (1 Thessalonians, Song of Solomon)
        size = 13
        while c.stringWidth(book, "Helvetica-Bold", size) > cw - 28 and size > 8:
            size -= 0.5
        c.setFont("Helvetica-Bold", size)
        c.drawCentredString(x + cw / 2, y + ch / 2 - 2, book)
        c.setFillColor(DARKGREEN)
        c.setFont("Helvetica", 7.5)
        c.drawCentredString(x + cw / 2, y + 14, group)
        if pos == cols * rows - 1 or i == 65:
            c.showPage()


def bookmark_page(c):
    """Three tall bookmarks: OT, NT, and the ten shelves."""
    title_block(c, "Bookmarks", "Cut out, fold nothing, tuck in a Bible. Laminate if it has to survive a backpack.")
    footer(c, "Free to photocopy. - FaithfulKids.app")
    bw = 150
    bh = PAGE_H - 200
    xs = [54, 54 + bw + 24, 54 + 2 * (bw + 24)]
    top = PAGE_H - 120

    def strip(x, heading, lines, sizes=(7.6, 9.2)):
        c.setDash(3, 3); c.setStrokeColor(LINE)
        c.rect(x, top - bh, bw, bh)
        c.setDash()
        c.setFillColor(DARKGREEN)
        c.setFont("Helvetica-Bold", 10)
        c.drawCentredString(x + bw / 2, top - 20, heading)
        y = top - 36
        gap = (bh - 60) / max(len(lines), 1)
        for kind, text in lines:
            if kind == "g":
                c.setFillColor(GREEN)
                c.setFont("Helvetica-Bold", sizes[0])
            else:
                c.setFillColor(INK)
                c.setFont("Helvetica", sizes[1])
            c.drawCentredString(x + bw / 2, y, text)
            y -= gap
        c.setFillColor(GREEN)
        c.setFont("Helvetica-Bold", 7)
        c.drawCentredString(x + bw / 2, top - bh + 10, "FaithfulKids.app")

    ot_lines, nt_lines = [], []
    for group, t, books in GROUPS:
        target = ot_lines if t == "OT" else nt_lines
        target.append(("g", group))
        target.extend(("b", b) for b in books)
    shelf_lines = [("g", "The Ten Shelves")]
    for group, t, books in GROUPS:
        shelf_lines.append(("b", f"{group} - {len(books)}"))
    shelf_lines += [("g", "39 + 27 = 66 books"), ("b", "Old: 3 letters, 9 letters = 39"), ("b", "New: 3 x 9 = 27")]

    strip(xs[0], "OLD TESTAMENT", ot_lines, sizes=(6.8, 7.4))
    strip(xs[1], "NEW TESTAMENT", nt_lines, sizes=(7.4, 8.4))
    strip(xs[2], "THE SHELVES", shelf_lines, sizes=(8.4, 8.6))
    c.showPage()


out = OUT / "books-of-the-bible.pdf"
c = Canvas(str(out), pagesize=letter)
c.setTitle("Books of the Bible - Printable Chart, Flashcards & Bookmarks")
chart_page(c)
flashcard_pages(c)
bookmark_page(c)
c.save()
print(f"wrote {out.name}")
