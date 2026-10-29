#!/usr/bin/env python3
"""Build the Books of the Bible PDF for /printables/books-of-the-bible.

Two Letter pages: the grouped chart, then two cut-out bookmarks.
Data mirrors lib/books-of-the-bible.ts; the same canon sanity checks
(39+27 books, 929+260 chapters) throw here if the two ever drift.

Run with ~/.fk-venv/bin/python3 (reportlab). Upload:
  python3 ../s3-put.py books-of-the-bible-chart.pdf printables/books-of-the-bible-chart.pdf application/pdf
"""
from reportlab.lib.pagesizes import letter
from reportlab.lib.colors import HexColor
from reportlab.pdfgen import canvas

GREEN = HexColor("#16a34a")
GREEN_DARK = HexColor("#15803d")
GREY = HexColor("#6b7280")
DARK = HexColor("#111827")
LIGHT = HexColor("#f0fdf4")

OT = [
    ("The Law", [("Genesis", 50), ("Exodus", 40), ("Leviticus", 27), ("Numbers", 36), ("Deuteronomy", 34)]),
    ("History", [("Joshua", 24), ("Judges", 21), ("Ruth", 4), ("1 Samuel", 31), ("2 Samuel", 24),
                 ("1 Kings", 22), ("2 Kings", 25), ("1 Chronicles", 29), ("2 Chronicles", 36),
                 ("Ezra", 10), ("Nehemiah", 13), ("Esther", 10)]),
    ("Poetry & Wisdom", [("Job", 42), ("Psalms", 150), ("Proverbs", 31), ("Ecclesiastes", 12), ("Song of Solomon", 8)]),
    ("Major Prophets", [("Isaiah", 66), ("Jeremiah", 52), ("Lamentations", 5), ("Ezekiel", 48), ("Daniel", 12)]),
    ("Minor Prophets", [("Hosea", 14), ("Joel", 3), ("Amos", 9), ("Obadiah", 1), ("Jonah", 4), ("Micah", 7),
                        ("Nahum", 3), ("Habakkuk", 3), ("Zephaniah", 3), ("Haggai", 2), ("Zechariah", 14), ("Malachi", 4)]),
]
NT = [
    ("The Gospels", [("Matthew", 28), ("Mark", 16), ("Luke", 24), ("John", 21)]),
    ("History", [("Acts", 28)]),
    ("Paul's Letters", [("Romans", 16), ("1 Corinthians", 16), ("2 Corinthians", 13), ("Galatians", 6),
                        ("Ephesians", 6), ("Philippians", 4), ("Colossians", 4), ("1 Thessalonians", 5),
                        ("2 Thessalonians", 3), ("1 Timothy", 6), ("2 Timothy", 4), ("Titus", 3), ("Philemon", 1)]),
    ("General Letters", [("Hebrews", 13), ("James", 5), ("1 Peter", 5), ("2 Peter", 3),
                         ("1 John", 5), ("2 John", 1), ("3 John", 1), ("Jude", 1)]),
    ("Prophecy", [("Revelation", 22)]),
]

ot_books = [b for _, bs in OT for b in bs]
nt_books = [b for _, bs in NT for b in bs]
assert len(ot_books) == 39 and len(nt_books) == 27, "book counts drifted"
assert sum(c for _, c in ot_books) == 929 and sum(c for _, c in nt_books) == 260, "chapter totals drifted"

W, H = letter
M = 46  # margin
OUT = "books-of-the-bible-chart.pdf"

c = canvas.Canvas(OUT, pagesize=letter)
c.setTitle("Books of the Bible — Printable Chart & Bookmarks")
c.setAuthor("Faithful Kids — faithfulkids.app")


def footer():
    c.setFont("Helvetica-Bold", 9)
    c.setFillColor(GREEN)
    c.drawString(M, 26, "FaithfulKids.app")
    c.setFont("Helvetica", 8)
    c.setFillColor(GREY)
    c.drawString(M + 86, 26, "Free Bible printables  ·  300+ story videos with quizzes  ·  faithfulkids.app/printables")


def chip_rows(books, x, y, maxw):
    """Lay book chips in rows; returns the y below the last row."""
    cx = x
    for name, ch in books:
        label = f"{name} {ch}"
        w = c.stringWidth(name, "Helvetica-Bold", 9) + c.stringWidth(f" {ch}", "Helvetica", 8) + 14
        if cx + w > x + maxw:
            cx = x
            y -= 17
        c.setFillColor(LIGHT)
        c.setStrokeColor(HexColor("#bbf7d0"))
        c.roundRect(cx, y - 4, w, 14, 4, fill=1, stroke=1)
        c.setFillColor(DARK)
        c.setFont("Helvetica-Bold", 9)
        c.drawString(cx + 6, y, name)
        c.setFillColor(GREY)
        c.setFont("Helvetica", 8)
        c.drawString(cx + 6 + c.stringWidth(name, "Helvetica-Bold", 9) + 2, y, str(ch))
        cx += w + 5
    return y - 24


# ---------- page 1: the chart ----------
y = H - 54
c.setFillColor(DARK)
c.setFont("Helvetica-Bold", 21)
c.drawString(M, y, "The Books of the Bible")
c.setFont("Helvetica", 10)
c.setFillColor(GREY)
c.drawString(M, y - 16, "All 66 books in order, grouped the way the Bible groups them — the small number is each book's chapter count.")
y -= 44

for heading, groups, books in (("OLD TESTAMENT", OT, ot_books), ("NEW TESTAMENT", NT, nt_books)):
    c.setFillColor(GREEN_DARK)
    c.setFont("Helvetica-Bold", 12)
    c.drawString(M, y, heading)
    c.setFont("Helvetica", 9)
    c.setFillColor(GREY)
    c.drawString(M + c.stringWidth(heading, "Helvetica-Bold", 12) + 8, y,
                 f"{len(books)} books · {sum(ch for _, ch in books)} chapters")
    c.setStrokeColor(GREEN)
    c.setLineWidth(1.4)
    c.line(M, y - 5, W - M, y - 5)
    y -= 22
    for gname, gbooks in groups:
        c.setFillColor(GREEN)
        c.setFont("Helvetica-Bold", 10)
        c.drawString(M, y, gname)
        y -= 15
        y = chip_rows(gbooks, M, y, W - 2 * M)
    y -= 6

footer()
c.showPage()

# ---------- page 2: bookmarks ----------
y0 = H - 54
c.setFillColor(DARK)
c.setFont("Helvetica-Bold", 16)
c.drawString(M, y0, "Cut-Out Bookmarks")
c.setFont("Helvetica", 10)
c.setFillColor(GREY)
c.drawString(M, y0 - 15, "Cut along the dashed lines. One Testament per bookmark — the order lives in their Bible.")

BW, BH = 170, 560
for i, (title, groups, books) in enumerate((("OLD TESTAMENT", OT, ot_books), ("NEW TESTAMENT", NT, nt_books))):
    x = M + i * (BW + 40)
    top = y0 - 44
    c.setStrokeColor(GREY)
    c.setLineWidth(1)
    c.setDash(4, 3)
    c.rect(x, top - BH, BW, BH)
    c.setDash()
    yy = top - 22
    c.setFillColor(GREEN_DARK)
    c.setFont("Helvetica-Bold", 11)
    c.drawCentredString(x + BW / 2, yy, title)
    c.setFont("Helvetica", 8)
    c.setFillColor(GREY)
    c.drawCentredString(x + BW / 2, yy - 11, f"{len(books)} books")
    yy -= 30
    for gname, gbooks in groups:
        c.setFillColor(GREEN)
        c.setFont("Helvetica-Bold", 7.5)
        c.drawString(x + 12, yy, gname.upper())
        yy -= 10
        c.setFillColor(DARK)
        c.setFont("Helvetica", 8)
        line = ""
        for name, _ in gbooks:
            trial = f"{line} · {name}" if line else name
            if c.stringWidth(trial, "Helvetica", 8) > BW - 24:
                c.drawString(x + 12, yy, line)
                yy -= 10
                line = name
            else:
                line = trial
        if line:
            c.drawString(x + 12, yy, line)
            yy -= 14
    c.setFillColor(GREY)
    c.setFont("Helvetica", 6.5)
    c.drawCentredString(x + BW / 2, top - BH + 10, "FaithfulKids.app")

footer()
c.showPage()
c.save()
print(f"wrote {OUT}")
