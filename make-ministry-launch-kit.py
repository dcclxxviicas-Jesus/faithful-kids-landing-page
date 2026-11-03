#!/usr/bin/env python3
"""Children's Ministry Launch Kit v2 — companion PDF for
/blog/how-to-start-a-childrens-ministry.

v2 (Nov 3, 2026, after Cas called v1 sparse/MVP): 15 templates + cover,
designed — green header bands, Montserrat display type (same font as the
Pinterest pins), real tables and forms. v2 also closes v1's honesty gap:
the guide promised an incident report form, a check-in/pick-up card, a
sample rota and a supplies checklist that v1 did not contain. Now it does.

CDN key printables/childrens-ministry-launch-kit.pdf is an OVERWRITE —
re-upload REQUIRES a CloudFront invalidation (E20EMHOCVEV5NT) and a
byte-compare afterward, or visitors get v1 for a year.

Run with ~/.fk-venv/bin/python3. Output: .ministry-kit-out/
"""
from pathlib import Path

try:
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.units import inch
    from reportlab.pdfgen import canvas as pdfcanvas
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont
except ImportError:
    raise SystemExit("run with ~/.fk-venv/bin/python3")

ROOT = Path(__file__).resolve().parent
OUT = ROOT / ".ministry-kit-out"
OUT.mkdir(exist_ok=True)

MONT = ROOT.parent / "Montserrat-Black.ttf"
DISPLAY = "Helvetica-Bold"
if MONT.exists():
    pdfmetrics.registerFont(TTFont("Montserrat-Black", str(MONT)))
    DISPLAY = "Montserrat-Black"

W, H = letter
M = 0.7 * inch
GREEN = (0.086, 0.64, 0.29)       # #16a34a
GREEN_DARK = (0.082, 0.502, 0.24) # #15803d
GREEN_PALE = (0.941, 0.992, 0.957)# #f0fdf4
GREEN_LINE = (0.733, 0.969, 0.816)# #bbf7d0
DARK = (0.078, 0.325, 0.176)      # #14532d
INK = (0.07, 0.09, 0.15)
GRAY = (0.42, 0.45, 0.49)
RULE = (0.82, 0.85, 0.87)
AMBER_BG = (1.0, 0.984, 0.922)
AMBER_LINE = (0.992, 0.902, 0.541)
AMBER_INK = (0.443, 0.247, 0.07)

PARTS = ["PLAN", "PROTECT", "PEOPLE", "PROGRAM", "LAUNCH"]


class Page:
    """Cursor-based page painter with the kit's design system."""

    def __init__(self, c, title, sub, part, page_num, total):
        self.c = c
        self.y = H - 0.56 * inch
        # header band
        c.setFillColorRGB(*GREEN)
        c.rect(0, H - 1.18 * inch, W, 1.18 * inch, stroke=0, fill=1)
        c.setFillColorRGB(*GREEN_DARK)
        c.rect(0, H - 1.18 * inch, W, 0.06 * inch, stroke=0, fill=1)
        c.setFillColorRGB(1, 1, 1)
        c.setFont(DISPLAY, 19)
        c.drawString(M, H - 0.72 * inch, title)
        c.setFont("Helvetica", 10.5)
        c.setFillColorRGB(0.88, 1.0, 0.92)
        c.drawString(M, H - 0.95 * inch, sub)
        # part tab
        c.setFont("Helvetica-Bold", 8.5)
        tab = f"PART {PARTS.index(part) + 1} · {part}" if part in PARTS else part
        tw = c.stringWidth(tab, "Helvetica-Bold", 8.5)
        c.setFillColorRGB(*GREEN_DARK)
        c.roundRect(W - M - tw - 16, H - 0.78 * inch, tw + 16, 0.26 * inch, 4, stroke=0, fill=1)
        c.setFillColorRGB(1, 1, 1)
        c.drawString(W - M - tw - 8, H - 0.705 * inch, tab)
        self.y = H - 1.18 * inch - 26
        # footer
        c.setStrokeColorRGB(*GREEN_LINE); c.setLineWidth(1.5)
        c.line(M, 0.62 * inch, W - M, 0.62 * inch)
        c.setFont("Helvetica", 8); c.setFillColorRGB(*GRAY)
        c.drawString(M, 0.44 * inch, f"Children's Ministry Launch Kit · {page_num} of {total}")
        c.setFont("Helvetica-Bold", 8); c.setFillColorRGB(*GREEN)
        c.drawRightString(W - M, 0.44 * inch, "FaithfulKids.app/churches — free Bible video curriculum for churches")

    # ---- primitives -------------------------------------------------
    def wrap(self, text, font, size, width):
        c = self.c
        words, line, out = text.split(), "", []
        for w_ in words:
            t = (line + " " + w_).strip()
            if c.stringWidth(t, font, size) <= width:
                line = t
            else:
                out.append(line); line = w_
        out.append(line)
        return out

    def head(self, text, color=GREEN_DARK):
        self.c.setFillColorRGB(*color)
        self.c.setFont(DISPLAY, 11.5)
        self.c.drawString(M, self.y, text)
        self.y -= 17

    def text(self, t, size=9.8, color=INK, width=None, leading=12.6, font="Helvetica", x=M):
        self.c.setFillColorRGB(*color)
        for ln in self.wrap(t, font, size, width or (W - 2 * M)):
            self.c.setFont(font, size)
            self.c.drawString(x, self.y, ln)
            self.y -= leading
        self.y -= 3

    def check(self, items, size=9.8, gap=5.5, x=M, width=None):
        c = self.c
        for item in items:
            lines = self.wrap(item, "Helvetica", size, (width or (W - 2 * M)) - 20)
            c.setStrokeColorRGB(*GREEN_DARK); c.setLineWidth(1.1)
            c.roundRect(x, self.y - 1.5, 9.5, 9.5, 2, stroke=1, fill=0)
            c.setFillColorRGB(*INK)
            for j, ln in enumerate(lines):
                c.setFont("Helvetica", size)
                c.drawString(x + 17, self.y - j * 12.2, ln)
            self.y -= 12.2 * len(lines) + gap

    def note_box(self, text, title=None):
        lines = self.wrap(text, "Helvetica", 9.2, W - 2 * M - 24)
        h = len(lines) * 11.8 + 20 + (14 if title else 0)
        c = self.c
        c.setFillColorRGB(*AMBER_BG); c.setStrokeColorRGB(*AMBER_LINE); c.setLineWidth(1)
        c.roundRect(M, self.y - h + 10, W - 2 * M, h, 6, stroke=1, fill=1)
        yy = self.y - 6
        if title:
            c.setFillColorRGB(*AMBER_INK); c.setFont("Helvetica-Bold", 9.2)
            c.drawString(M + 12, yy, title); yy -= 13
        c.setFillColorRGB(*AMBER_INK); c.setFont("Helvetica", 9.2)
        for ln in lines:
            c.drawString(M + 12, yy, ln); yy -= 11.8
        self.y -= h + 6

    def write_lines(self, n, label=None, width=None):
        c = self.c
        if label:
            c.setFillColorRGB(*INK); c.setFont("Helvetica", 9.8)
            c.drawString(M, self.y, label); self.y -= 15
        c.setStrokeColorRGB(*RULE); c.setLineWidth(0.9)
        for _ in range(n):
            c.line(M, self.y, M + (width or (W - 2 * M)), self.y)
            self.y -= 17
        self.y -= 3

    def table(self, headers, rows, widths, row_h=19, header_fill=GREEN, blank_rows=0, size=8.8):
        c = self.c
        x0 = M
        total_w = sum(widths)
        # header
        c.setFillColorRGB(*header_fill)
        c.rect(x0, self.y - row_h + 5, total_w, row_h, stroke=0, fill=1)
        c.setFillColorRGB(1, 1, 1); c.setFont("Helvetica-Bold", size)
        xx = x0
        for htxt, w_ in zip(headers, widths):
            c.drawString(xx + 5, self.y - 8, htxt)
            xx += w_
        self.y -= row_h
        all_rows = rows + [[""] * len(headers)] * blank_rows
        for i, row in enumerate(all_rows):
            if i % 2 == 0:
                c.setFillColorRGB(*GREEN_PALE)
                c.rect(x0, self.y - row_h + 5, total_w, row_h, stroke=0, fill=1)
            c.setFillColorRGB(*INK); c.setFont("Helvetica", size)
            xx = x0
            for cell, w_ in zip(row, widths):
                c.drawString(xx + 5, self.y - 8, str(cell))
                xx += w_
            c.setStrokeColorRGB(*RULE); c.setLineWidth(0.6)
            c.line(x0, self.y - row_h + 5, x0 + total_w, self.y - row_h + 5)
            self.y -= row_h
        # column rules + border
        c.setStrokeColorRGB(*RULE); c.setLineWidth(0.8)
        top = self.y + row_h * (len(all_rows) + 1)
        xx = x0
        for w_ in widths[:-1]:
            xx += w_
            c.line(xx, self.y + 5, xx, top + 5 - row_h)
        c.rect(x0, self.y + 5, total_w, top - self.y - row_h, stroke=1, fill=0)
        self.y -= 8

    def sig_block(self, labels):
        c = self.c
        n = len(labels)
        wcol = (W - 2 * M - (n - 1) * 18) / n
        c.setStrokeColorRGB(*INK); c.setLineWidth(0.9)
        for i, lab in enumerate(labels):
            x = M + i * (wcol + 18)
            c.line(x, self.y, x + wcol, self.y)
            c.setFont("Helvetica", 8); c.setFillColorRGB(*GRAY)
            c.drawString(x, self.y - 11, lab)
        self.y -= 30

    def gap(self, n=8):
        self.y -= n


def cover(c, total, contents):
    c.setFillColorRGB(*GREEN)
    c.rect(0, H - 2.9 * inch, W, 2.9 * inch, stroke=0, fill=1)
    c.setFillColorRGB(*GREEN_DARK)
    c.rect(0, H - 2.9 * inch, W, 0.08 * inch, stroke=0, fill=1)
    c.setFillColorRGB(1, 1, 1)
    c.setFont(DISPLAY, 30)
    c.drawString(M, H - 1.45 * inch, "Children's Ministry")
    c.drawString(M, H - 1.95 * inch, "Launch Kit")
    c.setFont("Helvetica", 12.5)
    c.setFillColorRGB(0.88, 1.0, 0.92)
    c.drawString(M, H - 2.38 * inch, f"{total - 1} checklists, worksheets and forms — from first conversation to first Sunday")
    y = H - 3.5 * inch
    c.setFillColorRGB(*DARK); c.setFont(DISPLAY, 12)
    c.drawString(M, y, "WHAT'S INSIDE")
    y -= 20
    col_x = [M, W / 2 + 8]
    half = (len(contents) + 1) // 2
    for col, chunk in enumerate([contents[:half], contents[half:]]):
        yy = y
        for num, name in chunk:
            c.setFillColorRGB(*GREEN); c.setFont(DISPLAY, 9.5)
            c.drawString(col_x[col], yy, f"{num:02d}")
            c.setFillColorRGB(*INK); c.setFont("Helvetica", 10.5)
            c.drawString(col_x[col] + 24, yy, name)
            yy -= 19.5
    y -= half * 19.5 + 18
    c.setFillColorRGB(*GREEN_PALE); c.setStrokeColorRGB(*GREEN_LINE); c.setLineWidth(1)
    c.roundRect(M, y - 58, W - 2 * M, 66, 8, stroke=1, fill=1)
    c.setFillColorRGB(*DARK); c.setFont("Helvetica-Bold", 10)
    c.drawString(M + 14, y - 10, "The companion guide walks every page of this kit, step by step:")
    c.setFillColorRGB(*GREEN_DARK); c.setFont(DISPLAY, 11)
    c.drawString(M + 14, y - 28, "faithfulkids.app/blog/how-to-start-a-childrens-ministry")
    c.setFillColorRGB(*GRAY); c.setFont("Helvetica", 8.6)
    c.drawString(M + 14, y - 46, "Free to print, photocopy and adapt for ministry use. Not legal advice — have your safety policy reviewed")
    c.drawString(M + 14, y - 57, "by your insurer, your denomination's safeguarding office, and local counsel. Requirements vary by jurisdiction.")
    c.setFillColorRGB(*GREEN); c.setFont(DISPLAY, 12)
    c.drawCentredString(W / 2, 0.85 * inch, "FaithfulKids.app")
    c.setFillColorRGB(*GRAY); c.setFont("Helvetica", 9)
    c.drawCentredString(W / 2, 0.65 * inch, "Free Bible video curriculum for churches — 300+ lessons with quizzes, Genesis to Revelation")
    c.showPage()


def main():
    path = OUT / "childrens-ministry-launch-kit.pdf"
    c = pdfcanvas.Canvas(str(path), pagesize=letter)
    TOTAL = 16
    contents = [
        (1, "Launch Timeline — 12 weeks"), (2, "Age-Group Planning Worksheet"),
        (3, "Child Safety Policy Outline"), (4, "Volunteer Role Cards"),
        (5, "Volunteer Screening Tracker"), (6, "Training Checklist & Sign-Off"),
        (7, "Monthly Rota Template"), (8, "Curriculum Comparison Grid"),
        (9, "Session Plan — 45 Minutes"), (10, "Startup Budget Worksheet"),
        (11, "Supplies Checklist"), (12, "Parent Welcome Letter"),
        (13, "Check-In & Pick-Up Cards"), (14, "Incident Report Form"),
        (15, "First-Sunday Readiness"),
    ]
    cover(c, TOTAL, contents)
    n = 2

    # 1 — timeline
    p = Page(c, "Launch Timeline", "Twelve weeks from decision to first public Sunday", "PLAN", n, TOTAL); n += 1
    phases = [
        ("WEEKS 1-4 · PLAN", [
            "Write the one-sentence mission (a volunteer can repeat it)",
            "List the actual children and ages — structure follows this list",
            "Leadership meeting: permission, protection (policy adoption), provision (budget + rooms)",
            "Choose ONE opening format you can staff twice over",
        ]),
        ("WEEKS 2-6 · PROTECT", [
            "Draft the child safety policy (page 03)",
            "Send the draft to your insurer / denomination safeguarding office for review",
            "Leadership formally adopts the final policy",
        ]),
        ("WEEKS 4-8 · PEOPLE", [
            "Write role descriptions (page 04); make the ten-names list; personal asks",
            "Screen every volunteer: application, references, background check (page 05)",
            "Policy read-and-sign + shadow Sunday for each volunteer (page 06)",
        ]),
        ("WEEKS 5-10 · PROGRAM", [
            "Compare curricula on the grid (page 08); decide the session shape (page 09)",
            "Budget (page 10), supplies (page 11), rooms, check-in table",
        ]),
        ("WEEKS 10-12 · LAUNCH", [
            "Whole-team training walkthrough; rehearse check-in and emergencies",
            "Two or three soft-launch Sundays with core families",
            "First public Sunday — one leader floats with no room assignment",
            "Debrief the same week; fix the top three problems only",
        ]),
    ]
    for label, items in phases:
        p.head(label)
        p.check(items, gap=4)
        p.gap(4)
    p.gap(6)
    p.head("NOTES / DATES COMMITTED")
    p.write_lines(4)
    c.showPage()

    # 2 — age groups
    p = Page(c, "Age-Group Planning Worksheet", "Fewer, fuller groups beat more, emptier ones", "PLAN", n, TOTAL); n += 1
    p.head("THE CHILDREN WE ACTUALLY HAVE")
    p.table(["Name", "Age", "Family / contact", "Notes (allergies, needs)"],
            [], [150, 40, 170, 112], blank_rows=10, row_h=18)
    p.gap(6)
    p.head("PROPOSED GROUPS")
    p.table(["Group", "Ages", "Room", "Adults needed", "Teacher(s)"],
            [], [90, 60, 120, 90, 112], blank_rows=3, row_h=20)
    p.note_box("Split a group only when it outgrows its space or its teacher — not because a chart says so. "
               "Every room needs two unrelated screened adults regardless of size; use the ratio your insurer "
               "and denomination specify for each age band.", "THE RULE OF THUMB")
    c.showPage()

    # 3 — safety
    p = Page(c, "Child Safety Policy Outline", "Draft here — then your insurer and denomination review it", "PROTECT", n, TOTAL); n += 1
    p.head("THE NON-NEGOTIABLES (standard across major safeguarding programs)")
    p.check([
        "Two unrelated adults per room, always — no adult ever alone with a child",
        "Screening before serving: application + references + interview + background check",
        "Waiting period before serving with children (commonly ~6 months regular attendance)",
        "Check-in with matching pick-up (numbered tag or signature) — no exceptions",
        "Open, observable rooms: windows or open doors, never closed unobservable spaces",
        "Bathroom policy: escort to the door, pairs for older kids, two adults for any assistance",
        "Written incident reports (page 14), shared with the parent the same day",
        "Mandatory reporting: the policy names WHO reports suspected abuse to WHICH civil authority",
        "Annual 45-minute re-training with signature on file",
    ], gap=4.5)
    p.gap(2)
    p.note_box("Adult-to-child ratios per age band · background-check type and renewal schedule · "
               "medication and allergy procedures. Recommendations differ and some are regulated — "
               "adopt YOUR insurer's and denomination's numbers, and write them in below.",
               "VERIFY LOCALLY BEFORE ADOPTING — DO NOT COPY NUMBERS FROM THE INTERNET")
    p.write_lines(2, "Our ratios (per insurer/denomination):  Nursery ____:____   Preschool ____:____   Elementary ____:____")
    p.head("ADOPTION")
    p.sig_block(["Adopted by (board/pastor)", "Date", "Annual review due"])
    c.showPage()

    # 4 — role cards
    p = Page(c, "Volunteer Role Cards", "People say yes to clear jobs — hand the card to the person you're asking", "PEOPLE", n, TOTAL); n += 1
    roles = [
        ("TEACHER", "Prepares and leads the session. The storyteller.",
         ["Owns the lesson for their Sunday (prep ~30-45 min)", "Leads story + response time", "Serves 2-3 Sundays/month, one season at a time"]),
        ("HELPER", "The second adult. Zero preparation required.",
         ["Welcome, seating, crowd care, bathroom escorts", "Runs the arrive-and-settle activity", "The easiest first yes for a new volunteer"]),
        ("CHECK-IN COORDINATOR", "The desk. The tags. The roster.",
         ["Signs every child in and out, matches pick-up tags", "Keeps the allergy list current and posted", "First face a visiting family sees"]),
        ("FLOATER / SUB", "On call for gaps.",
         ["Fills any role on short notice", "Carries the swap list", "Perfect for experienced members with variable schedules"]),
        ("COORDINATOR (season 2+)", "Owns the rota. The succession plan.",
         ["Builds the monthly schedule (page 07)", "Monthly 15-minute check-ins with each volunteer", "The ministry survives its founder because this role exists"]),
    ]
    for title, tag, bullets in roles:
        box_h = 14 + 13 + len(bullets) * 12 + 10
        c.setFillColorRGB(*GREEN_PALE); c.setStrokeColorRGB(*GREEN_LINE); c.setLineWidth(1.1)
        c.roundRect(M, p.y - box_h + 10, W - 2 * M, box_h, 7, stroke=1, fill=1)
        c.setFillColorRGB(*GREEN_DARK); c.setFont(DISPLAY, 10.5)
        c.drawString(M + 12, p.y - 4, title)
        c.setFillColorRGB(*GRAY); c.setFont("Helvetica-Oblique", 8.8)
        c.drawString(M + 12 + c.stringWidth(title, DISPLAY, 10.5) + 10, p.y - 4, tag)
        yy = p.y - 19
        c.setFillColorRGB(*INK); c.setFont("Helvetica", 9)
        for b in bullets:
            c.setFillColorRGB(*GREEN); c.circle(M + 17, yy + 2.6, 1.6, stroke=0, fill=1)
            c.setFillColorRGB(*INK); c.drawString(M + 25, yy, b)
            yy -= 12
        p.y -= box_h + 8
    c.showPage()

    # 5 — screening tracker
    p = Page(c, "Volunteer Screening Tracker", "Every adult, every step — including the pastor's spouse", "PEOPLE", n, TOTAL); n += 1
    p.text("One row per applicant. A volunteer serves only when every column is dated. The friction is the point — it is the message that this church takes its children seriously.", size=9.4)
    p.gap(2)
    p.table(["Name", "App.", "Refs ✓", "Bkgd check", "Policy signed", "Shadow Sun.", "Cleared by"],
            [], [122, 52, 52, 68, 72, 66, 70], blank_rows=14, row_h=21)
    p.note_box("Background-check type and renewal schedule follow your local law and insurer. Diary the renewals — a lapsed check is an unscreened volunteer.")
    c.showPage()

    # 6 — training
    p = Page(c, "Training Checklist & Sign-Off", "One walkthrough before anyone serves — about 90 minutes", "PEOPLE", n, TOTAL); n += 1
    p.head("THE WALKTHROUGH")
    p.check([
        "Mission sentence — can they say it back?",
        "Tour: rooms, bathrooms, exits, first-aid kit, supply bins",
        "Safety policy read-through + questions answered",
        "Two-adult rule and bathroom policy rehearsed OUT LOUD",
        "Check-in / pick-up procedure practiced at the actual desk (page 13)",
        "Incident form (page 14): where it lives, when to use it, who calls the parent",
        "Emergency basics: exits, meeting point, who calls whom",
        "The session shape (page 09): arrive & settle → story → respond → send",
        "Rota, swap procedure, group chat joined",
        "Shadow Sunday scheduled with an experienced volunteer",
    ], gap=4.5)
    p.gap(6)
    p.head("SIGN-OFF")
    p.sig_block(["Volunteer signature", "Trainer signature", "Date"])
    p.sig_block(["Shadow Sunday completed (date)", "Cleared to serve from (date)", "First rota date"])
    c.showPage()

    # 7 — rota
    p = Page(c, "Monthly Rota Template", "Nobody serves more than 2-3 Sundays a month; publish a month ahead", "PEOPLE", n, TOTAL); n += 1
    for month_half in ["MONTH: ____________________", "MONTH: ____________________"]:
        p.head(month_half)
        p.table(["Role", "Sun 1", "Sun 2", "Sun 3", "Sun 4", "Sun 5"],
                [["Teacher", "", "", "", "", ""],
                 ["Helper", "", "", "", "", ""],
                 ["Check-in", "", "", "", "", ""],
                 ["Floater", "", "", "", "", ""]],
                [92, 76, 76, 76, 76, 76], row_h=24)
        p.gap(4)
    p.note_box("Swaps: volunteers arrange their own swap in the group chat and tell the coordinator — the rota stays true. "
               "Thank-yous: twice a year, publicly and specifically. Burned-out volunteers don't resign loudly; they just fade.")
    c.showPage()

    # 8 — curriculum grid
    p = Page(c, "Curriculum Comparison Grid", "Score 1-5 per line — compare up to three options side by side", "PROGRAM", n, TOTAL); n += 1
    p.table(["Criterion (score 1-5)", "Option A: ________", "Option B: ________", "Option C: ________"],
            [["Scripture-first (real stories, chapter & verse)", "", "", ""],
             ["Rookie-proof on a bad week (prep < 45 min)", "", "", ""],
             ["Whole-story scope, Genesis → Revelation", "", "", ""],
             ["True cost: license + books + supplies", "", "", ""],
             ["Something goes home to parents", "", "", ""],
             ["Fits OUR actual age groups", "", "", ""],
             ["Review built in (quizzes — shows what stuck)", "", "", ""],
             ["TOTAL", "", "", ""]],
            [202, 90, 90, 90], row_h=24)
    p.gap(4)
    p.head("THE FREE OPTIONS TO PUT IN A COLUMN")
    p.text("Faithful Kids church access — free for churches and Sunday schools (not a trial): 300+ short Bible video episodes, each ~2 minutes, each ending with a quiz and reflection, Genesis to Revelation. faithfulkids.app/churches", size=9.4)
    p.text("Other free libraries reviewed honestly (competitors we respect included): faithfulkids.app/blog/free-bible-curriculum-for-kids-ministry", size=9.4)
    p.gap(4)
    p.note_box("Score with real material in hand: teach ONE sample lesson from each finalist to real kids before deciding. "
               "An hour of sampling beats a month of reading reviews — and the kids' faces are data.", "HOW TO SCORE HONESTLY")
    p.head("NOTES FROM SAMPLING")
    p.write_lines(6)
    c.showPage()

    # 9 — session plan
    p = Page(c, "Session Plan — 45 Minutes", "Four beats, ages 5-11 · left column is the pattern, right column is YOUR Sunday", "PROGRAM", n, TOTAL); n += 1
    beats = [
        ("0:00-0:10", "ARRIVE & SETTLE", "Activity sheets on tables as kids trickle in (word search / coloring page matching today's story). Check-in runs in parallel."),
        ("0:10-0:25", "THE STORY", "Tell it or play it — a 2-minute video episode anchors it well; then re-tell the key moment yourself. Open a real Bible and show where it lives."),
        ("0:25-0:40", "RESPOND", "Pick ONE: discussion, review game or quiz, or craft tied to the story. Oldest kids get jobs — read the verse, run the game."),
        ("0:40-0:45", "SEND", "One takeaway sentence, said twice. Pray. Hand out the dinner-table question."),
    ]
    col_w = (W - 2 * M - 16) / 2
    for time, name, desc in beats:
        lines = p.wrap(desc, "Helvetica", 8.8, col_w - 20)
        box_h = max(30 + len(lines) * 11, 72)
        c.setFillColorRGB(*GREEN_PALE); c.setStrokeColorRGB(*GREEN_LINE); c.setLineWidth(1)
        c.roundRect(M, p.y - box_h + 8, col_w, box_h, 6, stroke=1, fill=1)
        c.setFillColorRGB(*GREEN); c.setFont(DISPLAY, 8.5)
        c.drawString(M + 10, p.y - 5, time)
        c.setFillColorRGB(*DARK); c.setFont(DISPLAY, 10.5)
        c.drawString(M + 58, p.y - 5, name)
        c.setFillColorRGB(*INK); c.setFont("Helvetica", 8.8)
        yy = p.y - 20
        for ln in lines:
            c.drawString(M + 10, yy, ln); yy -= 11
        # right write-in box
        c.setStrokeColorRGB(*RULE); c.setLineWidth(1)
        c.roundRect(M + col_w + 16, p.y - box_h + 8, col_w, box_h, 6, stroke=1, fill=0)
        c.setFillColorRGB(*GRAY); c.setFont("Helvetica-Bold", 7.6)
        c.drawString(M + col_w + 26, p.y - 5, "THIS WEEK:")
        c.setStrokeColorRGB(*RULE); c.setLineWidth(0.8)
        yy = p.y - 24
        while yy > p.y - box_h + 14:
            c.line(M + col_w + 26, yy, M + 2 * col_w + 4, yy)
            yy -= 15
        p.y -= box_h + 10
    p.write_lines(1, "Materials needed this week:")
    p.write_lines(1, "Dinner-table question to send home:")
    c.showPage()

    # 10 — budget
    p = Page(c, "Startup Budget Worksheet", "If money makes screening slip, the budget is wrong — checks go IN the budget", "PROGRAM", n, TOTAL); n += 1
    p.head("ONE-TIME SETUP")
    p.table(["Item", "Notes", "Estimate", "Actual"],
            [["Supply bins + starter supplies", "one rolling bin per room", "$", "$"],
             ["Check-in materials", "tags, clipboards, signage", "$", "$"],
             ["Room setup", "first-aid kits, rugs, shelving", "$", "$"],
             ["Safety printing", "policy copies, forms, cards", "$", "$"]],
            [160, 162, 75, 75], row_h=20)
    p.gap(4)
    p.head("RECURRING")
    p.table(["Item", "Notes", "Estimate", "Actual"],
            [["Background checks", "____ volunteers × $____ (+ renewals)", "$", "$"],
             ["Snacks", "monthly", "$", "$"],
             ["Craft + printing", "monthly", "$", "$"],
             ["Curriculum", "annual — free options exist (page 08)", "$", "$"],
             ["Volunteer appreciation", "twice a year, for real", "$", "$"]],
            [160, 162, 75, 75], row_h=20)
    p.gap(4)
    p.table(["", "", "FIRST-YEAR TOTAL", "$"], [], [160, 162, 75, 75], row_h=22, header_fill=GREEN_DARK)
    p.note_box("Ask leadership for a named budget line, even a small one. A ministry funded by whoever-remembers runs out the first busy month.")
    c.showPage()

    # 11 — supplies
    p = Page(c, "Supplies Checklist", "One rolling bin per room beats a locked cupboard someone has the key to", "PROGRAM", n, TOTAL); n += 1
    cols = [
        ("EVERY ROOM'S BIN", [
            "Bibles kids can handle (not the heirloom)", "Crayons, markers, pencils", "Paper + construction paper",
            "Child-safe scissors, glue sticks", "Name tag stickers + marker", "Wet wipes + paper towels",
            "A printed stack of backup activities", "Masking tape (fixes everything)",
        ]),
        ("CHECK-IN DESK", [
            "Roster + sign-in sheets", "Matching pick-up tags or stickers", "Allergy list (posted for adults)",
            "Pens that work", "Incident report forms (page 14)", "Parent welcome letters (page 12)",
            "First-aid kit location sign", "Coordinator's phone — charged",
        ]),
    ]
    col_w = (W - 2 * M - 20) / 2
    x_positions = [M, M + col_w + 20]
    top_y = p.y
    for (title, items), x in zip(cols, x_positions):
        p.y = top_y
        c.setFillColorRGB(*GREEN_DARK); c.setFont(DISPLAY, 10.5)
        c.drawString(x, p.y, title); p.y -= 16
        p.check(items, size=9.2, gap=5, x=x, width=col_w)
    p.y = top_y - 16 - 8 * 17.5 - 20
    p.head("THE BAD-WEEK DRAWER (print these now, need them later)")
    p.text("Free, photocopy-friendly, no license: word searches (faithfulkids.app/printables/bible-word-search) · coloring pages (/printables/bible-coloring-pages) · Bible maps (/printables/bible-maps) · trivia pack (/printables/bible-trivia-pack). The Sunday the plan falls apart, this drawer is the plan.", size=9.4)
    c.showPage()

    # 12 — parent letter
    p = Page(c, "Parent Welcome Letter", "Adapt freely; keep it one page; send before launch AND stock the desk", "LAUNCH", n, TOTAL); n += 1
    letter_lines = [
        ("Dear families,", False),
        ("", False),
        ("Starting [DATE], [CHURCH NAME] is opening a children's ministry for kids ages [AGES] during [SERVICE/TIME]. Here's what Sunday looks like for your child:", False),
        ("", False),
        ("CHECK-IN at [PLACE] — you sign them in and keep the matching pick-up tag.", True),
        ("THE STORY — a Bible story told at their level, straight from Scripture.", True),
        ("RESPOND — a game, craft or quiz that makes it stick.", True),
        ("PICK-UP at [TIME/PLACE] — only to the person holding the matching tag.", True),
        ("", False),
        ("Every adult serving has completed an application, references, a background check, and our child safety training — and no fewer than two screened adults are with the children at all times. Our full safety policy is available anytime; just ask.", False),
        ("", False),
        ("Each week we'll send one line about what we taught and one question to ask at dinner. That question is the most important thing we do — it puts the conversation in your house, where faith actually grows.", False),
        ("", False),
        ("Allergies, special needs, questions: [NAME], [CONTACT]. We can't wait to meet your kids.", False),
        ("", False),
        ("— The [CHURCH NAME] Children's Ministry Team", False),
    ]
    c.setFillColorRGB(1, 1, 1); c.setStrokeColorRGB(*GREEN_LINE); c.setLineWidth(1.4)
    box_top = p.y + 6
    c.roundRect(M, 1.0 * inch, W - 2 * M, box_top - 1.0 * inch, 8, stroke=1, fill=0)
    p.y -= 14
    for text, bullet in letter_lines:
        if not text:
            p.y -= 7; continue
        x = M + 36 if bullet else M + 20
        if bullet:
            c.setFillColorRGB(*GREEN); c.circle(M + 28, p.y + 3, 1.8, stroke=0, fill=1)
        c.setFillColorRGB(*INK)
        for ln in p.wrap(text, "Helvetica", 9.6, W - 2 * M - (56 if bullet else 40)):
            c.setFont("Helvetica", 9.6)
            c.drawString(x, p.y, ln)
            p.y -= 12.4
        p.y -= 2
    c.showPage()

    # 13 — check-in cards
    p = Page(c, "Check-In & Pick-Up Cards", "Print, cut, tape to the desk — the procedure survives volunteer swaps", "LAUNCH", n, TOTAL); n += 1
    cards = [
        ("CHECK-IN — EVERY CHILD, EVERY WEEK", [
            "Parent/guardian signs the child in (name + time)",
            "Child gets a name tag; parent gets the MATCHING pick-up tag",
            "First visit? Collect: contact number, allergies, authorized adults",
            "Allergy? Flag the name tag and tell today's teacher directly",
            "Count heads after check-in closes; give the number to the teacher",
        ]),
        ("PICK-UP — THE TAG RULES, NOT THE FACE", [
            "Release ONLY to the adult holding the matching tag",
            "No tag? Check the authorized list + ID, call the signing parent",
            "“I'm her uncle” is not a tag — kindly hold the child, call the parent",
            "Sign out with time; tags back in the box",
            "Two adults stay until the last child is picked up — always",
        ]),
        ("BATHROOM — TAPE THIS ONE BY THE DOOR", [
            "Young children: escorted TO the door, never inside",
            "Older kids go in pairs",
            "Any assisted situation: two adults, door open",
            "Teacher is told every time a child leaves the room",
        ]),
    ]
    for title, items in cards:
        box_h = 22 + len(items) * 15 + 8
        c.setStrokeColorRGB(*GREEN_DARK); c.setLineWidth(1.2)
        c.setDash(4, 3)
        c.roundRect(M, p.y - box_h + 8, W - 2 * M, box_h, 6, stroke=1, fill=0)
        c.setDash()
        c.setFillColorRGB(*GREEN_DARK); c.setFont(DISPLAY, 10)
        c.drawString(M + 12, p.y - 6, title)
        yy = p.y - 24
        for it in items:
            c.setStrokeColorRGB(*GREEN_DARK); c.setLineWidth(1)
            c.roundRect(M + 12, yy - 2, 8.5, 8.5, 2, stroke=1, fill=0)
            c.setFillColorRGB(*INK); c.setFont("Helvetica", 9.3)
            c.drawString(M + 27, yy, it)
            yy -= 15
        p.y -= box_h + 12
    c.showPage()

    # 14 — incident form
    p = Page(c, "Incident Report Form", "Anything beyond a band-aid gets written down and told to the parent TODAY", "LAUNCH", n, TOTAL); n += 1
    p.write_lines(1, "Date: ____________   Time: ____________   Location (room/area): ______________________________")
    p.write_lines(1, "Child's name: ____________________________________   Age/group: ____________________")
    p.write_lines(1, "Adults present (names): ")
    p.head("WHAT HAPPENED (facts only — what was seen and heard)")
    p.write_lines(5)
    p.head("ACTION TAKEN (first aid, comfort, separation, etc.)")
    p.write_lines(3)
    p.head("PARENT / GUARDIAN NOTIFIED")
    p.write_lines(1, "Notified by: ____________________  Method: ____________  Date/time: ____________________")
    p.note_box("If this incident involves suspected abuse or neglect, follow the mandatory-reporting procedure in the safety "
               "policy — the report goes to the civil authority it names, not only up the church ladder. This form does not "
               "replace that report.", "IF THIS IS A SAFEGUARDING CONCERN")
    p.sig_block(["Completed by (signature)", "Reviewed by (coordinator/pastor)", "Date"])
    c.showPage()

    # 15 — first sunday
    p = Page(c, "First-Sunday Readiness", "Run it the week before — then again Sunday at 7 a.m.", "LAUNCH", n, TOTAL); n += 1
    p.head("THE WEEK BEFORE")
    p.check([
        "Rota confirmed — two unrelated screened adults per room, subs named",
        "Lesson prepped; backup printed activity in every bin (page 11)",
        "Video/audio tested in the room it will play in (not a different room)",
        "Parent letters sent; welcome copies at the desk",
        "Exits walked; meeting point agreed; phone numbers exchanged",
        "Debrief scheduled for THIS week (not “sometime”)",
    ], gap=4.5)
    p.gap(4)
    p.head("SUNDAY MORNING")
    p.table(["Time", "What", "Who"],
            [["T-60 min", "Rooms unlocked, bins out, signage up, temperature sane", ""],
             ["T-45 min", "Check-in desk set: roster, tags, pens, allergy list, forms", ""],
             ["T-30 min", "All volunteers present — walk the bathroom policy once", ""],
             ["T-15 min", "Doors open; floater takes position (no room assignment)", ""],
             ["During", "Head count to teacher after check-in closes", ""],
             ["After", "Every child out by matching tag; two adults until the last", ""],
             ["Same week", "Debrief: fix the top three problems, ignore the rest", ""]],
            [70, 310, 92], row_h=21)
    p.note_box("It will not go perfectly. That is fine. The children will remember that someone built them a room in the church — everything else is iteration.")
    c.showPage()

    c.save()
    print("wrote", path, f"({TOTAL} pages)")


if __name__ == "__main__":
    main()
