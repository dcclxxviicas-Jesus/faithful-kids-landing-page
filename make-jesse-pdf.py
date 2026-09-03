#!/usr/bin/env python3
"""Jesse Tree kit PDF: readings plan + all 25 ornaments (4 per page).
Requires the ornament PNGs on S3 (downloads them to a temp dir first).
Run: ~/.fk-venv/bin/python3 make-jesse-pdf.py"""
import json, urllib.request
from pathlib import Path
from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (BaseDocTemplate, Frame, Image, PageBreak,
                                PageTemplate, Paragraph, Table, TableStyle)

HERE = Path(__file__).resolve().parent
days = json.load(open(HERE / "lib" / "jesse-tree.json"))
EMERALD, INK, GREY = HexColor("#059669"), HexColor("#1f2937"), HexColor("#6b7280")
CDN = "https://d3g07v1w0lehiv.cloudfront.net/jesse-tree"
CACHE = HERE / ".jesse-cache"; CACHE.mkdir(exist_ok=True)
out = HERE / "quiz-pdf" / "jesse-tree-kit.pdf"

def local(slug):
    """Download and downscale: raw 1024px PNGs made an 18MB PDF. 700px line
    art prints crisply at 3.1in (≈225dpi) and cuts the file ~6x."""
    p = CACHE / f"{slug}-sm.jpg"
    if not p.exists():
        raw = CACHE / f"{slug}.png"
        if not raw.exists():
            urllib.request.urlretrieve(f"{CDN}/{slug}.png", raw)
        from PIL import Image as PILImage
        im = PILImage.open(raw).convert("RGB")
        im.thumbnail((700, 700))
        im.save(p, "JPEG", quality=88)
    return str(p)

def deco(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(EMERALD); canvas.setFont("Helvetica-Bold", 10)
    canvas.drawString(0.7 * inch, letter[1] - 0.55 * inch, "FAITHFUL KIDS")
    canvas.setFillColor(GREY); canvas.setFont("Helvetica", 10)
    canvas.drawRightString(letter[0] - 0.7 * inch, letter[1] - 0.55 * inch, "Jesse Tree — Ornaments & Readings")
    canvas.setStrokeColor(EMERALD); canvas.setLineWidth(1.2)
    canvas.line(0.7 * inch, letter[1] - 0.65 * inch, letter[0] - 0.7 * inch, letter[1] - 0.65 * inch)
    canvas.setFillColor(EMERALD); canvas.rect(0, 0, letter[0], 0.42 * inch, fill=1, stroke=0)
    canvas.setFillColor(white); canvas.setFont("Helvetica-Bold", 9)
    canvas.drawString(0.7 * inch, 0.16 * inch, "Faithful Kids  •  free printable Bible resources for families")
    canvas.drawRightString(letter[0] - 0.7 * inch, 0.16 * inch, "FaithfulKids.app/printables/jesse-tree")
    canvas.restoreState()

doc = BaseDocTemplate(str(out), pagesize=letter, leftMargin=0.7 * inch, rightMargin=0.7 * inch,
                      topMargin=0.9 * inch, bottomMargin=0.7 * inch,
                      title="Printable Jesse Tree — 25 Ornaments and Readings",
                      author="Faithful Kids (faithfulkids.app)")
doc.addPageTemplates([PageTemplate(id="p", frames=[Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height)], onPage=deco)])

s_title = ParagraphStyle("t", fontName="Helvetica-Bold", fontSize=21, leading=25, textColor=INK, spaceAfter=4)
s_sub = ParagraphStyle("s", fontName="Helvetica", fontSize=10.5, leading=14, textColor=GREY, spaceAfter=12)
s_day = ParagraphStyle("d", fontName="Helvetica-Bold", fontSize=10, textColor=EMERALD)
s_t = ParagraphStyle("tt", fontName="Helvetica-Bold", fontSize=10, textColor=INK)
s_r = ParagraphStyle("r", fontName="Helvetica", fontSize=9.5, textColor=INK)
s_m = ParagraphStyle("m", fontName="Helvetica", fontSize=9, leading=11.5, textColor=GREY)
s_cap = ParagraphStyle("c", fontName="Helvetica-Bold", fontSize=9.5, textColor=INK, alignment=1)

rows = [[Paragraph("Day", s_t), Paragraph("Ornament", s_t), Paragraph("Reading", s_t), Paragraph("The story", s_t)]]
for d in days:
    rows.append([Paragraph(f"Dec {d['day']}", s_day), Paragraph(d["title"], s_t),
                 Paragraph(d["scripture"], s_r), Paragraph(d["summary"], s_m)])
tbl = Table(rows, colWidths=[0.65 * inch, 1.55 * inch, 1.45 * inch, 3.45 * inch], repeatRows=1)
tbl.setStyle(TableStyle([
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("LINEBELOW", (0, 0), (-1, -2), 0.4, HexColor("#e5e7eb")),
    ("BACKGROUND", (0, 0), (-1, 0), HexColor("#ecfdf5")),
    ("TOPPADDING", (0, 0), (-1, -1), 4), ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
]))
story = [Paragraph("The Jesse Tree: 25 Ornaments & Readings", s_title),
         Paragraph("Hang one ornament a day from December 1 to 25 and read the passage it stands for — "
                   "the whole story of the Bible, from Creation to the manger, an evening at a time. "
                   "Color the ornaments, cut them out, and hang them on a small tree or a branch in a "
                   "jar. Free to print and copy for your family, class, or church.", s_sub),
         tbl, PageBreak()]

SZ = 3.1 * inch
for i in range(0, len(days), 4):
    batch = days[i:i + 4]
    cells, caps = [], []
    for d in batch:
        cells.append(Image(local(d["slug"]), width=SZ, height=SZ))
        caps.append(Paragraph(f"Dec {d['day']} — {d['title']}<br/><font color='#6b7280' size='8'>{d['scripture']}</font>", s_cap))
    while len(cells) < 2: cells.append(""); caps.append("")
    grid = [[cells[0], cells[1] if len(cells) > 1 else ""], [caps[0], caps[1] if len(caps) > 1 else ""]]
    if len(batch) > 2:
        grid += [[cells[2], cells[3] if len(cells) > 3 else ""], [caps[2], caps[3] if len(caps) > 3 else ""]]
    g = Table(grid, colWidths=[3.4 * inch, 3.4 * inch])
    g.setStyle(TableStyle([("ALIGN", (0, 0), (-1, -1), "CENTER"), ("BOTTOMPADDING", (0, 1), (-1, 1), 14)]))
    story.append(g)
    if i + 4 < len(days):
        story.append(PageBreak())

doc.build(story)
print(f"wrote {out.name} ({out.stat().st_size:,}b)")
