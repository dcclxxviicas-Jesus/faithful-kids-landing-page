#!/usr/bin/env python3
"""Children's Ministry Launch Kit — the companion PDF for the flagship guide
(drafts/how-to-start-a-childrens-ministry.md). Ten template/checklist pages.

HELD WITH THE DRAFT: generate for review, upload to CDN key
printables/childrens-ministry-launch-kit.pdf only when Cas approves the
guide (the guide's download button points there).

Run with ~/.fk-venv/bin/python3. Output: .ministry-kit-out/
"""
from pathlib import Path

try:
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.units import inch
    from reportlab.pdfgen import canvas as pdfcanvas
except ImportError:
    raise SystemExit("run with ~/.fk-venv/bin/python3")

OUT = Path(__file__).resolve().parent / ".ministry-kit-out"
OUT.mkdir(exist_ok=True)
W, H = letter
M = 0.75 * inch
GREEN = (0.086, 0.64, 0.29)
DARK = (0.085, 0.325, 0.204)
GRAY = (0.42, 0.45, 0.49)
INK = (0.12, 0.14, 0.18)

# Each page: (title, subtitle, blocks). Block types:
#   ("check", [items])          checklist with boxes
#   ("lines", label, n)         label + n ruled write-in lines
#   ("text", paragraph)         plain note text
#   ("head", text)              small section heading
PAGES = [
    ("Ministry Launch Timeline", "Twelve weeks from decision to first public Sunday", [
        ("check", [
            "Weeks 1-2 — Write the one-sentence mission; list the actual children and ages",
            "Weeks 2-3 — Meet leadership: get permission, protection (policy adoption), provision (budget + rooms)",
            "Weeks 2-6 — Draft the child safety policy; send to insurer / denomination for review",
            "Weeks 4-6 — Write volunteer role descriptions; make the ten-names list; start personal asks",
            "Weeks 5-8 — Evaluate and choose curriculum; plan the standard session shape",
            "Weeks 6-8 — Screen and onboard volunteers (application, references, background check, policy signature)",
            "Weeks 6-10 — Prepare rooms, supplies bins, check-in table, signage, budget",
            "Week 10 — Whole-team training walkthrough; rehearse check-in and emergency basics",
            "Weeks 10-11 — Two or three soft-launch Sundays with core families",
            "Week 12 — First public Sunday (keep one leader floating, no room assignment)",
            "Week 12+ — Same-week debrief; fix the top three problems only",
        ]),
    ]),
    ("Age-Group Planning Worksheet", "Fewer, fuller groups beat more, emptier ones", [
        ("lines", "Children already connected to our church (name / age):", 10),
        ("head", "Proposed groups (combine until each room has 2 adults + critical mass):"),
        ("lines", "Group 1 — ages ____ to ____  · room: ____________  · adults needed: ____", 1),
        ("lines", "Group 2 — ages ____ to ____  · room: ____________  · adults needed: ____", 1),
        ("lines", "Group 3 — ages ____ to ____  · room: ____________  · adults needed: ____", 1),
        ("text", "Split a group only when it outgrows its space or its teacher — not because a chart says so."),
    ]),
    ("Child Safety Policy Outline", "Draft, then have your insurer / denomination review it — requirements vary by jurisdiction", [
        ("check", [
            "Two unrelated adults per room, always — no adult ever alone with a child",
            "Screening: application + references + interview + background check for every adult",
            "Waiting period before serving with children (commonly ~6 months regular attendance)",
            "Check-in / matching pick-up procedure (tags or sign-out; no exceptions)",
            "Open, observable rooms (windows or open doors)",
            "Bathroom policy (escort to door; pairs for older kids; two adults for any assistance)",
            "Written incident/injury reports, shared with the parent the same day",
            "Mandatory-reporting procedure naming WHO reports to WHICH civil authority",
            "Adult-to-child ratios per age band — USE YOUR INSURER'S / DENOMINATION'S NUMBERS",
            "Background check type + renewal schedule per local law",
            "Allergy and medication procedure; allergy list posted for adults",
            "Annual re-training (45 minutes) + signature on file for every volunteer",
        ]),
        ("text", "This outline lists widely used practices, not legal advice. Local law and your insurer govern."),
    ]),
    ("Volunteer Roles & Application Outline", "People say yes to clear jobs", [
        ("head", "Roles"),
        ("check", [
            "TEACHER — prepares and leads the session; the storyteller",
            "HELPER — second adult; welcome, crowd, bathroom runs; zero prep",
            "CHECK-IN COORDINATOR — the desk, tags, roster, allergy list",
            "FLOATER / SUB — on call for gaps",
            "COORDINATOR (season 2+) — owns the rota; the succession plan",
        ]),
        ("head", "Application collects"),
        ("check", [
            "Contact details and church involvement history",
            "Two references (not family) — actually called",
            "Consent for background check",
            "Interview notes and start-date decision",
            "Safety policy read-and-sign, dated",
        ]),
    ]),
    ("Volunteer Training Checklist", "One walkthrough before anyone serves", [
        ("check", [
            "Mission sentence — can they say it back?",
            "Tour: rooms, bathrooms, exits, first-aid kit, supply bins",
            "Safety policy walkthrough + questions + signature",
            "Two-adult rule and bathroom policy rehearsed out loud",
            "Check-in / pick-up procedure practiced at the desk",
            "Incident form: where it lives, when to use it, who calls the parent",
            "Emergency basics: exits, meeting point, who calls whom",
            "The session shape (arrive & settle / story / respond / send)",
            "Shadow Sunday scheduled with an experienced volunteer",
            "Rota, swap procedure, and group chat joined",
        ]),
    ]),
    ("Curriculum Evaluation Worksheet", "Score each option 1-5 on every line", [
        ("lines", "Curriculum being evaluated: _______________________  Cost/year: ________", 1),
        ("check", [
            "Scripture-first: kids meet the Bible's own stories, chapter and verse",
            "Rookie-proof: teachable on a bad week with minimal prep",
            "Whole-story scope: Genesis to Revelation, not ten stories on a loop",
            "True cost: licenses + student books + supplies within our budget",
            "Goes home: take-home pages / family questions / anything for parents",
            "Age fit for OUR actual groups",
            "Review built in: quizzes or questions that show what stuck",
        ]),
        ("text", "Free options to compare: Faithful Kids church access (free, 300+ video lessons with quizzes — faithfulkids.app/churches) and the free libraries reviewed at faithfulkids.app/blog/free-bible-curriculum-for-kids-ministry."),
    ]),
    ("Sample Session Plan", "45 minutes, ages 5-11, four beats", [
        ("head", "0:00-0:10  ARRIVE & SETTLE"),
        ("text", "Activity sheets on tables as kids trickle in (word search / coloring page matching today's story). Check-in runs in parallel."),
        ("head", "0:10-0:25  THE STORY"),
        ("text", "Tell it or play it (a 2-minute video episode works well as the anchor — then re-tell the key moment yourself). Open a real Bible and show where it lives."),
        ("head", "0:25-0:40  RESPOND"),
        ("text", "Pick one: discussion questions, review game or quiz, craft tied to the story. Oldest kids get jobs (read the verse, run the game)."),
        ("head", "0:40-0:45  SEND"),
        ("text", "One takeaway sentence, said twice. Pray. Hand out the take-home question for the dinner table."),
    ]),
    ("Startup Budget Worksheet", "Put background checks IN the budget — if money makes screening slip, the budget is wrong", [
        ("lines", "ONE-TIME — Supply bins + starter supplies: $________", 1),
        ("lines", "ONE-TIME — Check-in materials (tags, clipboards, signage): $________", 1),
        ("lines", "ONE-TIME — Room setup (first-aid kits, rugs, shelving): $________", 1),
        ("lines", "PER-VOLUNTEER — Background checks: ____ volunteers x $______ = $________", 1),
        ("lines", "MONTHLY — Snacks: $________   Craft/printing: $________", 1),
        ("lines", "ANNUAL — Curriculum: $________  (free options exist — see evaluation sheet)", 1),
        ("lines", "ANNUAL — Volunteer appreciation (twice a year, for real): $________", 1),
        ("lines", "TOTAL first year: $________", 1),
    ]),
    ("Parent Welcome Letter — Template", "Adapt freely; keep it one page", [
        ("text", "Dear families,"),
        ("text", "Starting [DATE], [CHURCH NAME] is opening a children's ministry for kids ages [AGES] during [SERVICE/TIME]. Here's what Sunday will look like for your child: check-in at [PLACE] (you'll sign them in and receive a matching pick-up tag), a Bible story told at their level, an activity or game that makes it stick, and a short prayer before you pick them up at [TIME/PLACE]."),
        ("text", "Every adult serving has completed an application, references, a background check, and our child safety training, and no fewer than two screened adults are with the children at all times. Our full safety policy is available anytime — just ask."),
        ("text", "Each week we'll send one line about what we taught and one question to ask at dinner. That question is the most important thing we do — it puts the conversation in your house, where faith actually grows."),
        ("text", "Questions about allergies, special needs, or anything else: [NAME], [CONTACT]. We can't wait to meet your kids."),
        ("text", "— The [CHURCH NAME] Children's Ministry Team"),
    ]),
    ("First-Sunday Readiness Checklist", "Run it the week before, then again Sunday 7 a.m.", [
        ("check", [
            "Rota confirmed — two unrelated screened adults per room, subs named",
            "Check-in table set: roster, tags, pens, allergy list, incident forms",
            "Rooms: supplies bins stocked, signage up, first-aid kit present",
            "Lesson prepped — teacher has it; backup printed activity in every bin",
            "Video/audio tested in the room it will play in (not a different room)",
            "Parent letter sent; welcome copies at the check-in desk",
            "Floater assigned — one leader with NO room assignment",
            "Exits walked; meeting point agreed; phone numbers exchanged",
            "Bathroom policy rehearsed with every adult serving today",
            "Debrief scheduled for this week (not 'sometime')",
        ]),
    ]),
]


def footer(c, page_num):
    c.setFont("Helvetica-Bold", 8)
    c.setFillColorRGB(*GREEN)
    c.drawRightString(W - M, 0.45 * inch, "FaithfulKids.app/churches — free Bible video curriculum for churches")
    c.setFont("Helvetica", 8)
    c.setFillColorRGB(*GRAY)
    c.drawString(M, 0.45 * inch, f"Children's Ministry Launch Kit · page {page_num}")


def main():
    path = OUT / "childrens-ministry-launch-kit.pdf"
    c = pdfcanvas.Canvas(str(path), pagesize=letter)

    # cover
    c.setFillColorRGB(*DARK)
    c.setFont("Helvetica-Bold", 28)
    c.drawCentredString(W / 2, H - 3.1 * inch, "Children's Ministry")
    c.drawCentredString(W / 2, H - 3.55 * inch, "Launch Kit")
    c.setFont("Helvetica", 13)
    c.setFillColorRGB(*GRAY)
    c.drawCentredString(W / 2, H - 4.1 * inch, "Ten checklists and templates for starting a children's ministry —")
    c.drawCentredString(W / 2, H - 4.32 * inch, "the companion to the step-by-step guide at")
    c.setFillColorRGB(*GREEN)
    c.setFont("Helvetica-Bold", 13)
    c.drawCentredString(W / 2, H - 4.6 * inch, "faithfulkids.app/blog/how-to-start-a-childrens-ministry")
    c.setFont("Helvetica", 10)
    c.setFillColorRGB(*GRAY)
    c.drawCentredString(W / 2, H - 5.3 * inch, "Free to print, photocopy, and adapt for your church. Not legal advice —")
    c.drawCentredString(W / 2, H - 5.48 * inch, "have your safety policy reviewed by your insurer and local counsel.")
    c.setFillColorRGB(*GREEN)
    c.setFont("Helvetica-Bold", 11)
    c.drawCentredString(W / 2, 1.1 * inch, "FaithfulKids.app")
    c.showPage()

    for n, (title, sub, blocks) in enumerate(PAGES, start=2):
        y = H - M
        c.setFillColorRGB(*DARK)
        c.setFont("Helvetica-Bold", 17)
        c.drawString(M, y, title)
        y -= 16
        c.setFillColorRGB(*GRAY)
        c.setFont("Helvetica-Oblique", 10)
        c.drawString(M, y, sub)
        y -= 10
        c.setStrokeColorRGB(*GREEN); c.setLineWidth(2)
        c.line(M, y, W - M, y)
        y -= 22

        def wrap(text, font, size, width):
            c.setFont(font, size)
            words, line, out = text.split(), "", []
            for w_ in words:
                t = (line + " " + w_).strip()
                if c.stringWidth(t, font, size) <= width:
                    line = t
                else:
                    out.append(line); line = w_
            out.append(line)
            return out

        for block in blocks:
            kind = block[0]
            if kind == "check":
                for item in block[1]:
                    lines = wrap(item, "Helvetica", 10.5, W - 2 * M - 24)
                    c.setStrokeColorRGB(*INK); c.setLineWidth(1)
                    c.rect(M, y - 9, 10, 10)
                    c.setFillColorRGB(*INK)
                    for j, ln in enumerate(lines):
                        c.setFont("Helvetica", 10.5)
                        c.drawString(M + 18, y - j * 13, ln)
                    y -= 13 * len(lines) + 7
            elif kind == "lines":
                label, n_lines = block[1], block[2]
                c.setFillColorRGB(*INK); c.setFont("Helvetica", 10.5)
                c.drawString(M, y, label)
                y -= 18
                c.setStrokeColorRGB(0.75, 0.78, 0.8); c.setLineWidth(0.8)
                for _ in range(n_lines):
                    c.line(M, y, W - M, y)
                    y -= 20
                y -= 4
            elif kind == "head":
                c.setFillColorRGB(*GREEN); c.setFont("Helvetica-Bold", 11.5)
                c.drawString(M, y, block[1])
                y -= 16
            elif kind == "text":
                c.setFillColorRGB(*INK)
                for ln in wrap(block[1], "Helvetica", 10.5, W - 2 * M):
                    c.setFont("Helvetica", 10.5)
                    c.drawString(M, y, ln)
                    y -= 13.5
                y -= 6
        footer(c, n)
        c.showPage()

    c.save()
    print("wrote", path)


if __name__ == "__main__":
    main()
