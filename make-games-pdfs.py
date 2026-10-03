#!/usr/bin/env python3
"""Printable game PDFs: charades cards, bingo boards, riddle sheets, joke cards.

The printables lesson, third application: people search for the ARTIFACT.
The four game posts rank (jokes at pos 5-7 already) but shipped with no
printable, while every PDF we have added (quiz, christmas, jesse tree) became
its own ranking surface. This closes that gap.

Rules carried from the playbook:
  - Every page carries FaithfulKids.app (a photocopied sheet must say where
    it came from).
  - Answer keys land on their OWN page so a projected/copied sheet never
    shows answers.
  - Never gated behind email.

Run with the persistent venv:  ~/.fk-venv/bin/python3 make-games-pdfs.py
Outputs land in games-pdf/  (upload with s3-put.py to CDN printables/).
"""
import random
import re
from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen.canvas import Canvas

HERE = Path(__file__).parent
OUT = HERE / "games-pdf"
GREEN = HexColor("#16a34a")
INK = HexColor("#1f2937")
MUTED = HexColor("#6b7280")
LINE = HexColor("#d1d5db")
PAGE_W, PAGE_H = letter


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


# ---------------------------------------------------------------- charades
CHARADES = {
    "Easy — act it out (ages 5+)": [
        "Noah building the ark", "David throwing his sling", "Jonah inside the big fish",
        "Moses parting the sea", "Angels singing to shepherds", "Jesus calming the storm",
        "Zacchaeus climbing the tree", "Daniel sleeping by lions", "Eve picking the fruit",
        "The walls of Jericho falling", "Baby Moses in the basket", "A shepherd finding a lost sheep",
        "Goliath stomping and shouting", "Mary rocking baby Jesus", "Fishermen pulling heavy nets",
        "Peter walking on water", "The wise men following the star", "Adam naming the animals",
        "Joseph wearing his colorful coat", "Samson pushing the pillars",
    ],
    "Medium — whole scenes (ages 8+)": [
        "The prodigal son coming home", "Jesus washing the disciples' feet",
        "The good Samaritan helping the traveler", "Elijah racing Ahab's chariot",
        "Moses and the burning bush", "Joshua marching around Jericho",
        "The ten lepers (only one says thanks)", "Jesus feeding the five thousand",
        "Paul shipwrecked and swimming ashore", "Ruth gathering grain in the field",
        "John baptizing in the Jordan", "Esther pointing at Haman",
        "Gideon shrinking his army", "Nehemiah rebuilding the wall",
        "The friends lowering a man through the roof", "Jesus turning water to wine",
        "Pharaoh's dreams: fat cows, thin cows", "Elisha and the floating axe head",
        "Doubting Thomas touching the scars", "The sower scattering seed",
    ],
    "Hard — for the Bible buffs": [
        "Balaam's donkey refusing to move", "Jael and the tent peg",
        "Ezekiel and the valley of dry bones", "Jacob wrestling the angel",
        "Belshazzar seeing the writing on the wall", "Ehud the left-handed judge",
        "The bronze serpent on the pole", "Elijah fed by ravens",
        "David pretending to be insane", "Peter freed by the angel (chains fall off)",
        "Shadrach, Meshach, Abednego in the furnace", "Absalom caught by his hair",
        "The Philistines returning the ark on a cart", "Isaiah's coal touching his lips",
        "Eutychus falling asleep in the window", "Lot's wife looking back",
        "Samuel hearing his name at night", "The Emmaus road — eyes opened at dinner",
        "Rhoda leaving Peter at the door", "Paul bitten by the viper",
    ],
}


def build_charades():
    out = OUT / "bible-charades.pdf"
    c = Canvas(str(out), pagesize=letter)
    title_block(c, "Bible Charades — 60 Cards", "Cut along the dotted lines. No talking, no props; sound effects are between you and your conscience.")
    footer(c, "Free to photocopy for home, class, or church.")
    c.showPage()
    cols, rows = 2, 4
    cw, ch = (PAGE_W - 108) / cols, (PAGE_H - 150) / rows
    for section, words in CHARADES.items():
        for i, w in enumerate(words):
            pos = i % (cols * rows)
            if pos == 0:
                title_block(c, "Bible Charades", section)
                footer(c, "FaithfulKids.app/blog/bible-charades-for-kids")
            col, row = pos % cols, pos // cols
            x, y = 54 + col * cw, PAGE_H - 110 - (row + 1) * ch
            c.setDash(3, 3)
            c.setStrokeColor(LINE)
            c.rect(x + 6, y + 6, cw - 12, ch - 12)
            c.setDash()
            c.setFillColor(MUTED)
            c.setFont("Helvetica", 8)
            c.drawString(x + 16, y + ch - 26, section.split(" — ")[0].upper())
            c.setFillColor(INK)
            c.setFont("Helvetica-Bold", 13)
            # wrap by hand: cards are small
            line, lines = "", []
            for word in w.split():
                if c.stringWidth(line + " " + word, "Helvetica-Bold", 13) > cw - 44:
                    lines.append(line.strip()); line = word
                else:
                    line += " " + word
            lines.append(line.strip())
            for li, text in enumerate(lines[:4]):
                c.drawString(x + 16, y + ch / 2 + 14 - li * 16, text)
            c.setFillColor(GREEN)
            c.setFont("Helvetica", 7.5)
            c.drawString(x + 16, y + 16, "FaithfulKids.app")
            if pos == cols * rows - 1:
                c.showPage()
        if len(words) % (cols * rows) != 0:
            c.showPage()
    c.save()
    print(f"wrote {out.name}")


# ------------------------------------------------------------------ bingo
BINGO_WORDS = [
    "Ark", "Manger", "Star", "Shepherd", "Rainbow", "Dove", "Lion", "Sling",
    "Giant", "Whale", "Cross", "Crown", "Angel", "Scroll", "Lamb", "Fish",
    "Bread", "Cup", "Donkey", "Camel", "Tent", "Well", "Altar", "Harp",
    "Trumpet", "Basket", "Coat", "Staff", "Stone", "Vine",
]


def build_bingo(n_boards=8, seed="faithfulkids-bingo"):
    out = OUT / "bible-bingo.pdf"
    c = Canvas(str(out), pagesize=letter)
    title_block(c, "Bible Bingo — 8 Boards + Caller Cards",
                "Every board is different. Caller draws a word, tells the story in one sentence, players mark the square.")
    c.setFont("Helvetica", 11)
    c.setFillColor(INK)
    y = PAGE_H - 130
    for ln in [
        "HOW TO PLAY",
        "1. Give every player a board (they are all different — print one page per player).",
        "2. Cut the caller cards on the last page and pull them from a bowl.",
        "3. For each word, ask: where does this show up in the Bible? One sentence, then play on.",
        "4. Five in a row wins. Center square is free, like grace.",
    ]:
        c.setFont("Helvetica-Bold" if ln == "HOW TO PLAY" else "Helvetica", 11)
        c.drawString(54, y, ln)
        y -= 20
    footer(c, "Free to photocopy for home, class, or church.")
    c.showPage()
    rng = random.Random(seed)
    grid_size, cell = 5, 92
    gx = (PAGE_W - grid_size * cell) / 2
    for b in range(n_boards):
        words = rng.sample(BINGO_WORDS, 24)
        title_block(c, f"Bible Bingo — Board {b + 1}", "Five in a row wins. Center is free.")
        gy = PAGE_H - 160 - grid_size * cell
        for r in range(grid_size):
            for col in range(grid_size):
                x, y = gx + col * cell, gy + (grid_size - 1 - r) * cell
                c.setStrokeColor(INK)
                c.rect(x, y, cell, cell)
                idx = r * grid_size + col
                if idx == 12:
                    c.setFillColor(GREEN)
                    c.setFont("Helvetica-Bold", 11)
                    c.drawCentredString(x + cell / 2, y + cell / 2 - 4, "FREE")
                    continue
                word = words[idx if idx < 12 else idx - 1]
                c.setFillColor(INK)
                c.setFont("Helvetica-Bold", 11)
                c.drawCentredString(x + cell / 2, y + cell / 2 - 4, word)
        footer(c, f"Board {b + 1} of {n_boards}")
        c.showPage()
    # caller cards
    title_block(c, "Caller Cards", "Cut these out and draw from a bowl.")
    cols, rows = 3, 10
    cw, ch = (PAGE_W - 108) / cols, (PAGE_H - 170) / rows
    for i, w in enumerate(BINGO_WORDS):
        col, row = i % cols, i // cols
        x, y = 54 + col * cw, PAGE_H - 120 - (row + 1) * ch
        c.setDash(3, 3); c.setStrokeColor(LINE)
        c.rect(x + 4, y + 4, cw - 8, ch - 8)
        c.setDash()
        c.setFillColor(INK); c.setFont("Helvetica-Bold", 12)
        c.drawCentredString(x + cw / 2, y + ch / 2 - 4, w)
    footer(c)
    c.showPage()
    c.save()
    print(f"wrote {out.name}")


# ---------------------------------------------------------------- riddles
def parse_riddles():
    src = (HERE / "content/blog/bible-riddles-for-kids.md").read_text()
    out = []
    for block in src.split("### Riddle #")[1:]:
        q = re.search(r"\*\*(.+?)\*\*", block, re.S)
        a = re.search(r"Answer: \*\*(.+?)\*\*", block)
        if q and a:
            out.append((re.sub(r"\s+", " ", q.group(1)).strip().replace(" -- ", " — "),
                        a.group(1).strip().replace(" -- ", " — ")))
    return out


def build_riddles():
    riddles = parse_riddles()
    out = OUT / "bible-riddles.pdf"
    c = Canvas(str(out), pagesize=letter)
    title_block(c, f"{len(riddles)} Bible Riddles", "Read one aloud at dinner. Answers are on the last pages — no peeking over shoulders.")
    footer(c, "Free to photocopy for home, class, or church.")
    y = PAGE_H - 120
    c.setFillColor(INK)
    n = 0
    for i, (q, _a) in enumerate(riddles, 1):
        lines, line = [], ""
        for word in q.split():
            if c.stringWidth(line + " " + word, "Helvetica", 11) > PAGE_W - 140:
                lines.append(line.strip()); line = word
            else:
                line += " " + word
        lines.append(line.strip())
        need = 16 * len(lines) + 10
        if y - need < 60:
            c.showPage(); title_block(c, "Bible Riddles (continued)", ""); footer(c); y = PAGE_H - 110
            c.setFillColor(INK)
        c.setFont("Helvetica-Bold", 11)
        c.drawString(54, y, f"{i}.")
        c.setFont("Helvetica", 11)
        for li, t in enumerate(lines):
            c.drawString(76, y - li * 16, t)
        y -= need
        n += 1
    c.showPage()
    title_block(c, "Answer Key", "Keep this page with the grown-up.")
    footer(c)
    y = PAGE_H - 120
    c.setFillColor(INK)
    for i, (_q, a) in enumerate(riddles, 1):
        if y < 60:
            c.showPage(); title_block(c, "Answer Key (continued)", ""); footer(c); y = PAGE_H - 110
            c.setFillColor(INK)
        c.setFont("Helvetica", 10.5)
        c.drawString(54, y, f"{i}. {a}")
        y -= 15
    c.save()
    print(f"wrote {out.name}  ({n} riddles)")


# ------------------------------------------------------------------ jokes
def parse_jokes():
    # The two posts use different formats: funny-bible-jokes numbers its list
    # ("1. Question **Punchline**"), bible-jokes-for-kids uses Q/A blocks
    # ("**Q: ...**" / "A: ..."). Dedupe on the question so a joke that appears
    # in both posts prints once.
    jokes, seen = [], set()

    def add(q, a):
        # The posts write "--" (their web house style); print gets a real em dash.
        q = re.sub(r"\s+", " ", q).strip().replace(" -- ", " — ")
        a = re.sub(r"\s+", " ", a).strip().replace(" -- ", " — ")
        key = re.sub(r"[^a-z0-9]", "", q.lower())
        if key not in seen:
            seen.add(key)
            jokes.append((q, a))

    src = (HERE / "content/blog/funny-bible-jokes.md").read_text()
    for m in re.finditer(r"^\d+\. (.+?) \*\*(.+?)\*\*", src, re.M):
        add(m.group(1), m.group(2))
    src = (HERE / "content/blog/bible-jokes-for-kids.md").read_text()
    for m in re.finditer(r"\*\*Q: (.+?)\*\*\s*\nA: (.+)", src):
        add(m.group(1), m.group(2))
    return jokes


def build_jokes():
    jokes = parse_jokes()
    out = OUT / "bible-jokes.pdf"
    c = Canvas(str(out), pagesize=letter)
    title_block(c, f"{len(jokes)} Bible Joke Cards", "Cut them out. One in a lunchbox per day is the classic move.")
    footer(c, "Free to photocopy. Groans guaranteed.")
    c.showPage()
    cols, rows = 2, 5
    cw, ch = (PAGE_W - 108) / cols, (PAGE_H - 150) / rows
    for i, (q, a) in enumerate(jokes):
        pos = i % (cols * rows)
        if pos == 0:
            title_block(c, "Bible Joke Cards", "Joke up top, punchline below the fold line.")
            footer(c, "FaithfulKids.app/blog/funny-bible-jokes")
        col, row = pos % cols, pos // cols
        x, y = 54 + col * cw, PAGE_H - 110 - (row + 1) * ch
        c.setDash(3, 3); c.setStrokeColor(LINE)
        c.rect(x + 5, y + 5, cw - 10, ch - 10)
        c.line(x + 5, y + ch * 0.42, x + cw - 5, y + ch * 0.42)
        c.setDash()
        for text, font, size, ty in ((q, "Helvetica-Bold", 10, y + ch - 24), (a, "Helvetica", 10, y + ch * 0.42 - 16)):
            lines, line = [], ""
            for word in text.split():
                if c.stringWidth(line + " " + word, font, size) > cw - 36:
                    lines.append(line.strip()); line = word
                else:
                    line += " " + word
            lines.append(line.strip())
            c.setFillColor(INK)
            c.setFont(font, size)
            for li, t in enumerate(lines[:4]):
                c.drawString(x + 14, ty - li * 13, t)
        c.setFillColor(GREEN); c.setFont("Helvetica", 7)
        c.drawString(x + 14, y + 12, "FaithfulKids.app")
        if pos == cols * rows - 1:
            c.showPage()
    if len(jokes) % (cols * rows) != 0:
        c.showPage()
    c.save()
    print(f"wrote {out.name}  ({len(jokes)} jokes)")


if __name__ == "__main__":
    OUT.mkdir(exist_ok=True)
    build_charades()
    build_bingo()
    build_riddles()
    build_jokes()
