#!/usr/bin/env python3
"""Build the free printable quiz PDFs from their blog posts.

The posts are the source of truth -- a question edited there flows into its
PDF on the next run instead of going stale in two places. The kids PDF
deliberately excludes the post's bonus rounds (its section regex names the
three core rounds), so the file keeps matching its "50 questions" promise.

Layout follows the teacher format that makes a PDF worth downloading over the
webpage: quiz sheets first (questions only, with write-in lines), answer key
on separate pages at the back. Every page footers the URL -- a photocopied
sheet must still say where it came from (project rule).

Run with the persistent venv:  ~/.fk-venv/bin/python3 make-quiz-pdf.py
Outputs land in quiz-pdf/  (upload with ../s3-put.py to CDN printables/).
"""
import re
from pathlib import Path

from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (BaseDocTemplate, Frame, NextPageTemplate,
                                PageBreak, PageTemplate, Paragraph)

HERE = Path(__file__).resolve().parent
OUTDIR = HERE / "quiz-pdf"

EMERALD = HexColor("#059669")
INK = HexColor("#1f2937")
GREY = HexColor("#6b7280")

CONFIGS = [
    {
        "src": "bible-trivia-for-kids.md",
        "out": "bible-quiz-questions-for-kids.pdf",
        "title": "50 Bible Quiz Questions for Kids",
        "subtitle": ("Three rounds — easy (ages 5–8), medium (ages 9–12), and hard "
                     "(teens and adults) — with a full answer key and verse references at the "
                     "back. Free to print and copy for your family, class, or youth group."),
        "doc_title": "50 Bible Quiz Questions and Answers for Kids",
        "header": "Bible Quiz for Kids",
        "url": "FaithfulKids.app/blog/bible-trivia-for-kids",
        "section_re": r"^## (Easy|Medium|Hard)(.*)",
        "round_names": [("Bible Questions for Kids", "Round"), ("Bible Trivia Questions", "Round")],
        "expect": 50,
    },
    {
        "src": "bible-trivia-for-adults.md",
        "out": "bible-trivia-for-adults.pdf",
        "title": "50 Bible Trivia Questions for Adults",
        "subtitle": ("Three rounds — a deceptively easy warm-up, a hard round, and an expert "
                     "round — with the full answer key and verse references at the back. Free "
                     "to print and copy for your small group, class, or church event."),
        "doc_title": "50 Bible Trivia Questions and Answers for Adults",
        "header": "Bible Trivia for Adults",
        "url": "FaithfulKids.app/blog/bible-trivia-for-adults",
        "section_re": r"^## (Warm-Up|Hard|Expert)(.*)",
        "round_names": [],
        "expect": 50,
    },
    {
        "src": "christmas-bible-trivia.md",
        "out": "christmas-bible-trivia.pdf",
        "title": "80 Christmas Bible Trivia Questions",
        "subtitle": ("Four rounds — easy, medium, hard, and expert — covering the real "
                     "Christmas story from Matthew, Luke, and the prophets, with the full "
                     "answer key and verse references at the back. Free to print and copy."),
        "doc_title": "80 Christmas Bible Trivia Questions and Answers",
        "header": "Christmas Bible Trivia",
        "url": "FaithfulKids.app/blog/christmas-bible-trivia",
        "section_re": r"^## (Easy|Medium|Hard|Expert)(.*)",
        "round_names": [],
        "expect": 80,
    },
]


def parse(src_path, section_re):
    sections, current = [], None
    for line in src_path.read_text().splitlines():
        h = re.match(section_re, line)
        if h:
            current = (h.group(1) + (h.group(2) or ""), [])
            sections.append(current)
            continue
        if current is None:
            continue
        q = re.match(r"^(\d+)\.\s+(.*?)\s+\*\*(.*?)\*\*\s+\(([^)]+)\)\s*$", line)
        if q:
            current[1].append((int(q.group(1)), q.group(2), q.group(3), q.group(4)))
        elif re.match(r"^## ", line):
            current = None
    return sections


def build(cfg):
    sections = parse(HERE / "content" / "blog" / cfg["src"], cfg["section_re"])
    total = sum(len(s[1]) for s in sections)
    assert total == cfg["expect"], f"{cfg['src']}: expected {cfg['expect']} questions, parsed {total}"

    out = OUTDIR / cfg["out"]

    def footer(canvas, doc):
        canvas.saveState()
        canvas.setFillColor(EMERALD)
        canvas.rect(0, 0, letter[0], 0.42 * inch, fill=1, stroke=0)
        canvas.setFillColor(white)
        canvas.setFont("Helvetica-Bold", 9)
        canvas.drawString(0.75 * inch, 0.16 * inch,
                          "Faithful Kids  •  free printable Bible quizzes, games, and video lessons")
        canvas.drawRightString(letter[0] - 0.75 * inch, 0.16 * inch, cfg["url"])
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

    doc = BaseDocTemplate(str(out), pagesize=letter,
                          leftMargin=0.75 * inch, rightMargin=0.75 * inch,
                          topMargin=0.9 * inch, bottomMargin=0.7 * inch,
                          title=cfg["doc_title"],
                          author="Faithful Kids (faithfulkids.app)")
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="body")

    def make_template(tid, label):
        def on_page(canvas, d):
            header(canvas, d, label)
            footer(canvas, d)
        return PageTemplate(id=tid, frames=[frame], onPage=on_page)

    doc.addPageTemplates([make_template("quiz", f"{cfg['header']} — Quiz Sheets"),
                          make_template("key", f"{cfg['header']} — Answer Key")])

    s_title = ParagraphStyle("t", fontName="Helvetica-Bold", fontSize=22, leading=27,
                             textColor=INK, spaceAfter=4)
    s_sub = ParagraphStyle("s", fontName="Helvetica", fontSize=11, leading=15,
                           textColor=GREY, spaceAfter=14)
    s_sect = ParagraphStyle("sec", fontName="Helvetica-Bold", fontSize=14, leading=18,
                            textColor=EMERALD, spaceBefore=12, spaceAfter=8)
    s_q = ParagraphStyle("q", fontName="Helvetica", fontSize=11, leading=15,
                         textColor=INK, spaceAfter=13, leftIndent=22, firstLineIndent=-22)
    s_a = ParagraphStyle("a", fontName="Helvetica", fontSize=10.5, leading=14.5,
                         textColor=INK, spaceAfter=6, leftIndent=22, firstLineIndent=-22)

    story = [Paragraph(cfg["title"], s_title), Paragraph(cfg["subtitle"], s_sub)]
    write_line = ' <font color="#9ca3af">' + "_" * 34 + "</font>"
    for title, qs in sections:
        label = title
        for old, new in cfg["round_names"]:
            label = label.replace(old, new)
        story.append(Paragraph(label, s_sect))
        for num, q, _a, _ref in qs:
            story.append(Paragraph(f"<b>{num}.</b> {q}{write_line}", s_q))

    story += [NextPageTemplate("key"), PageBreak(),
              Paragraph("Answer Key", s_title),
              Paragraph("Every answer with its verse reference — look the verse up together "
                        "when an answer surprises someone.", s_sub)]
    for title, qs in sections:
        story.append(Paragraph(title, s_sect))
        for num, _q, a, ref in qs:
            story.append(Paragraph(f"<b>{num}.</b> {a} <font color='#6b7280'>({ref})</font>", s_a))

    OUTDIR.mkdir(exist_ok=True)
    doc.build(story)
    print(f"wrote {out.name}  ({out.stat().st_size:,} bytes, {total} questions)")


if __name__ == "__main__":
    for cfg in CONFIGS:
        build(cfg)
