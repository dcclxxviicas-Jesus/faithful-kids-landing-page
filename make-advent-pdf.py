#!/usr/bin/env python3
"""Printable Advent Bible reading calendar -> quiz-pdf/advent-bible-calendar.pdf.
25 daily readings, prophecy to nativity. Same footer/URL rules as the quiz PDFs.
Run: ~/.fk-venv/bin/python3 make-advent-pdf.py"""
import json
from pathlib import Path
from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import BaseDocTemplate, Frame, PageTemplate, Paragraph, Table, TableStyle

HERE = Path(__file__).resolve().parent
days = json.load(open(HERE / "lib" / "advent-readings.json"))
EMERALD, INK, GREY = HexColor("#059669"), HexColor("#1f2937"), HexColor("#6b7280")
out = HERE / "quiz-pdf" / "advent-bible-calendar.pdf"

def deco(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(EMERALD); canvas.setFont("Helvetica-Bold", 10)
    canvas.drawString(0.7 * inch, letter[1] - 0.55 * inch, "FAITHFUL KIDS")
    canvas.setFillColor(GREY); canvas.setFont("Helvetica", 10)
    canvas.drawRightString(letter[0] - 0.7 * inch, letter[1] - 0.55 * inch, "Advent Bible Reading Calendar")
    canvas.setStrokeColor(EMERALD); canvas.setLineWidth(1.2)
    canvas.line(0.7 * inch, letter[1] - 0.65 * inch, letter[0] - 0.7 * inch, letter[1] - 0.65 * inch)
    canvas.setFillColor(EMERALD); canvas.rect(0, 0, letter[0], 0.42 * inch, fill=1, stroke=0)
    canvas.setFillColor(white); canvas.setFont("Helvetica-Bold", 9)
    canvas.drawString(0.7 * inch, 0.16 * inch, "Faithful Kids  •  free printable Bible resources for families")
    canvas.drawRightString(letter[0] - 0.7 * inch, 0.16 * inch, "FaithfulKids.app/printables/advent-bible-calendar")
    canvas.restoreState()

doc = BaseDocTemplate(str(out), pagesize=letter, leftMargin=0.7 * inch, rightMargin=0.7 * inch,
                      topMargin=0.9 * inch, bottomMargin=0.7 * inch,
                      title="Advent Bible Reading Calendar — 25 Days to Christmas",
                      author="Faithful Kids (faithfulkids.app)")
doc.addPageTemplates([PageTemplate(id="p", frames=[Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height)], onPage=deco)])

s_title = ParagraphStyle("t", fontName="Helvetica-Bold", fontSize=21, leading=25, textColor=INK, spaceAfter=4)
s_sub = ParagraphStyle("s", fontName="Helvetica", fontSize=10.5, leading=14, textColor=GREY, spaceAfter=12)
s_day = ParagraphStyle("d", fontName="Helvetica-Bold", fontSize=10, textColor=EMERALD)
s_t = ParagraphStyle("tt", fontName="Helvetica-Bold", fontSize=10, textColor=INK)
s_r = ParagraphStyle("r", fontName="Helvetica", fontSize=9.5, textColor=INK)
s_m = ParagraphStyle("m", fontName="Helvetica", fontSize=9, leading=11.5, textColor=GREY)

rows = [[Paragraph("Day", s_t), Paragraph("Reading", s_t), Paragraph("", s_t), Paragraph("The story", s_t)]]
for d in days:
    rows.append([Paragraph(f"Dec {d['day']}", s_day), Paragraph(d["title"], s_t),
                 Paragraph(d["scripture"], s_r), Paragraph(d["summary"], s_m)])
tbl = Table(rows, colWidths=[0.7 * inch, 1.7 * inch, 1.35 * inch, 3.35 * inch], repeatRows=1)
tbl.setStyle(TableStyle([
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("LINEBELOW", (0, 0), (-1, -2), 0.4, HexColor("#e5e7eb")),
    ("BACKGROUND", (0, 0), (-1, 0), HexColor("#ecfdf5")),
    ("TOPPADDING", (0, 0), (-1, -1), 4), ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
]))
story = [Paragraph("Advent Bible Reading Calendar", s_title),
         Paragraph("Twenty-five days from the first promise to the manger: one short reading a night, "
                   "December 1 to Christmas Day. Check off each day, read the passage together, and let "
                   "the one-line summary start the conversation. Free to print and copy.", s_sub), tbl]
doc.build(story)
print(f"wrote {out.name} ({out.stat().st_size:,}b, {len(days)} days)")
