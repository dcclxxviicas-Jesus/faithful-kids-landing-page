#!/usr/bin/env python3
"""Build the free printable PDF of the 50-question kids Bible quiz.

The questions are parsed from content/blog/bible-trivia-for-kids.md -- the
post is the source of truth, so a question edited there flows into the PDF on
the next run instead of going stale in two places.

Layout follows the teacher format that makes a PDF worth downloading over the
webpage: quiz sheets first (questions only, with write-in lines), answer key
on separate pages at the back. Every page footers the URL -- a photocopied
sheet must still say where it came from (project rule).

Run with the persistent venv:  ~/.fk-venv/bin/python3 make-quiz-pdf.py
Output: quiz-pdf/bible-quiz-questions-for-kids.pdf  (upload with ../s3-put.py)
"""
import re
from pathlib import Path

from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (BaseDocTemplate, Frame, PageTemplate,
                                Paragraph, Spacer, PageBreak)

HERE = Path(__file__).resolve().parent
SRC = HERE / "content" / "blog" / "bible-trivia-for-kids.md"
OUT = HERE / "quiz-pdf" / "bible-quiz-questions-for-kids.pdf"

EMERALD = HexColor("#059669")
INK = HexColor("#1f2937")
GREY = HexColor("#6b7280")

# ------------------------------------------------------------------- parse
text = SRC.read_text()
sections = []  # (title, [(num, question, answer, ref)])
current = None
for line in text.splitlines():
    h = re.match(r"^## (Easy|Medium|Hard)(.*)", line)
    if h:
        current = (h.group(1) + h.group(2), [])
        sections.append(current)
        continue
    if current is None:
        continue
    q = re.match(r"^(\d+)\.\s+(.*?)\s+\*\*(.*?)\*\*\s+\(([^)]+)\)\s*$", line)
    if q:
        current[1].append((int(q.group(1)), q.group(2), q.group(3), q.group(4)))
    elif re.match(r"^## ", line):
        current = None

total = sum(len(s[1]) for s in sections)
assert total == 50, f"expected 50 questions, parsed {total}"

# ------------------------------------------------------------------ layout
def footer(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(EMERALD)
    canvas.rect(0, 0, letter[0], 0.42 * inch, fill=1, stroke=0)
    canvas.setFillColor(white)
    canvas.setFont("Helvetica-Bold", 9)
    canvas.drawString(0.75 * inch, 0.16 * inch,
                      "Faithful Kids  •  free printable Bible quizzes, games, and video lessons")
    canvas.drawRightString(letter[0] - 0.75 * inch, 0.16 * inch,
                           "FaithfulKids.app/blog/bible-trivia-for-kids")
    canvas.restoreState()


def header(canvas, doc, label):
    canvas.saveState()
    canvas.setFillColor(EMERALD)
    canvas.setFont("Helvetica-Bold", 10)
    canvas.drawString(0.75 * inch, letter[1] - 0.55 * inch, "FAITHFUL KIDS")
    canvas.setFillColor(GREY)
    canvas.setFont("Helvetica", 10)
    canvas.drawRightString(letter[0] - 0.75 * inch, letter[1] - 0.55 * inch, label)
    canvas.setStrokeColor(EMERALD)
    canvas.setLineWidth(1.2)
    canvas.line(0.75 * inch, letter[1] - 0.65 * inch,
                letter[0] - 0.75 * inch, letter[1] - 0.65 * inch)
    canvas.restoreState()


doc = BaseDocTemplate(str(OUT), pagesize=letter,
                      leftMargin=0.75 * inch, rightMargin=0.75 * inch,
                      topMargin=0.9 * inch, bottomMargin=0.7 * inch,
                      title="50 Bible Quiz Questions and Answers for Kids",
                      author="Faithful Kids (faithfulkids.app)")
frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="body")


def make_template(tid, label):
    def on_page(canvas, d):
        header(canvas, d, label)
        footer(canvas, d)
    return PageTemplate(id=tid, frames=[frame], onPage=on_page)


doc.addPageTemplates([make_template("quiz", "Bible Quiz for Kids — Quiz Sheets"),
                      make_template("key", "Bible Quiz for Kids — Answer Key")])

S_TITLE = ParagraphStyle("t", fontName="Helvetica-Bold", fontSize=22, leading=27,
                         textColor=INK, spaceAfter=4)
S_SUB = ParagraphStyle("s", fontName="Helvetica", fontSize=11, leading=15,
                       textColor=GREY, spaceAfter=14)
S_SECT = ParagraphStyle("sec", fontName="Helvetica-Bold", fontSize=14, leading=18,
                        textColor=EMERALD, spaceBefore=12, spaceAfter=8)
S_Q = ParagraphStyle("q", fontName="Helvetica", fontSize=11, leading=15,
                     textColor=INK, spaceAfter=13, leftIndent=22, firstLineIndent=-22)
S_A = ParagraphStyle("a", fontName="Helvetica", fontSize=10.5, leading=14.5,
                     textColor=INK, spaceAfter=6, leftIndent=22, firstLineIndent=-22)

story = [Paragraph("50 Bible Quiz Questions for Kids", S_TITLE),
         Paragraph("Three rounds — easy (ages 5–8), medium (ages 9–12), and hard "
                   "(teens and adults) — with a full answer key and verse references at the "
                   "back. Free to print and copy for your family, class, or youth group.", S_SUB)]

WRITE_LINE = ' <font color="#9ca3af">' + "_" * 34 + "</font>"
for title, qs in sections:
    story.append(Paragraph(title.replace("Bible Questions for Kids", "Round")
                                .replace("Bible Trivia Questions", "Round"), S_SECT))
    for num, q, _a, _ref in qs:
        story.append(Paragraph(f"<b>{num}.</b> {q}{WRITE_LINE}", S_Q))

story.append(PageBreak())
from reportlab.platypus import NextPageTemplate  # noqa: E402
story.insert(len(story) - 1, NextPageTemplate("key"))
story += [Paragraph("Answer Key", S_TITLE),
          Paragraph("Every answer with its verse reference — look the verse up together "
                    "when an answer surprises someone.", S_SUB)]
for title, qs in sections:
    story.append(Paragraph(title, S_SECT))
    for num, _q, a, ref in qs:
        story.append(Paragraph(f"<b>{num}.</b> {a} <font color='#6b7280'>({ref})</font>", S_A))

OUT.parent.mkdir(exist_ok=True)
doc.build(story)
print(f"wrote {OUT}  ({OUT.stat().st_size:,} bytes, {total} questions)")
