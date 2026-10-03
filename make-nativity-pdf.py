#!/usr/bin/env python3
"""The Night of Nights — a printable kids' nativity play script.

Target cluster (DataForSEO, Oct 2026): "nativity play script" 320/50 KD 0,
"christmas skits for church" 390/305 KD 0, "christmas program ideas for
church" 320 KD 0 — and kids-christmas-program-ideas already ranks pos ~7.
The artifact rule: people searching these want a SCRIPT, not advice about
scripts. This is the script.

Design constraints that make it actually performable:
  - Narrators carry the story, so no child has to memorize more than
    two lines; cast scales 8 to 40 (angel chorus and animals are any size).
  - Carol breaks are public-domain verses the congregation sings, which
    covers every costume change.
  - Runs ~10-12 minutes.

Run with ~/.fk-venv/bin/python3; output games-pdf/nativity-play-script.pdf;
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
PAGE_W, PAGE_H = letter

CAST = [
    ("Narrator 1 & 2", "The storytellers. Older kids or teens; they may read from scripts."),
    ("Mary", "2 lines. Carries a doll or wrapped bundle from Scene 3."),
    ("Joseph", "2 lines. Walking stick optional, beard negotiable."),
    ("Angel Gabriel", "2 lines. The biggest entrance in the show."),
    ("Innkeeper", "2 lines. The only comic role; cast accordingly."),
    ("Shepherds (2-4)", "1 line each. Bathrobes are traditional and correct."),
    ("Angel Chorus (any size)", "1 line, spoken together. Tinsel halos."),
    ("Wise Men (3)", "1 line each. Crowns and gift boxes."),
    ("Star Carrier", "Non-speaking. Walks ahead of the wise men with a star on a pole."),
    ("Animals (any size)", "Non-speaking. Sheep, donkeys, a cow; every 3-year-old in the church."),
]

# (kind, who, text) — kind: "scene", "direction", "line", "carol"
SCRIPT = [
    ("scene", "", "SCENE 1 — THE ANNOUNCEMENT  (Nazareth. Mary at center, sweeping or carrying a water jar.)"),
    ("line", "NARRATOR 1", "A long time ago, in a little town called Nazareth, there lived a young woman named Mary. God was about to ask her the biggest question anyone has ever been asked."),
    ("direction", "", "GABRIEL enters — boldly. Mary startles."),
    ("line", "GABRIEL", "Do not be afraid, Mary! God is with you. You will have a baby boy, and you will name him JESUS. He will be the Savior of the whole world."),
    ("line", "MARY", "I am God's servant. Let it happen just as you have said."),
    ("line", "NARRATOR 2", "And Gabriel had one more stop to make — a dream, for a carpenter named Joseph."),
    ("direction", "", "JOSEPH enters and kneels, sleeping. GABRIEL stands over him."),
    ("line", "GABRIEL", "Joseph! Do not be afraid to take Mary as your wife. Name the baby Jesus — he will save his people."),
    ("line", "JOSEPH", "(waking, standing tall) Then I will do everything God says."),
    ("carol", "", "CAROL BREAK: \"O Little Town of Bethlehem,\" verse 1 — congregation sings while the stage becomes a road."),

    ("scene", "", "SCENE 2 — NO ROOM  (A road, then a door. Innkeeper behind it.)"),
    ("line", "NARRATOR 1", "The emperor ordered everyone counted, each family in its own hometown. So Mary and Joseph walked and walked — nearly a hundred miles — to Bethlehem, the city of King David."),
    ("direction", "", "MARY and JOSEPH travel slowly across the stage. Optional DONKEY walks with them. They knock at the door."),
    ("line", "JOSEPH", "Please, sir — my wife is going to have a baby. Is there any room?"),
    ("line", "INNKEEPER", "Room? ROOM? Half the world is in Bethlehem tonight! I haven't got a single bed... (pauses, softens) ...but there's the stable. It's warm, and the animals don't snore. Much."),
    ("line", "MARY", "Thank you. It will be just right."),
    ("line", "NARRATOR 2", "And that night, in that stable, it happened. The baby was born — God's own Son — and Mary wrapped him up warm and laid him in the manger, where the animals' food goes. The King of Kings, in a feeding trough."),
    ("direction", "", "Lights low. MARY places the baby in the manger. ANIMALS gather around. Hold the picture for a slow count of five."),
    ("carol", "", "CAROL BREAK: \"Away in a Manger,\" verse 1 — shepherds and angels take their places during the song."),

    ("scene", "", "SCENE 3 — THE SKY FALLS OPEN  (A hillside. Shepherds seated around a pretend fire.)"),
    ("line", "NARRATOR 1", "Out on the hills, shepherds were watching their sheep through the night. Nobody important ever told shepherds anything. Until —"),
    ("direction", "", "ANGEL CHORUS bursts in with GABRIEL. Shepherds fall over backwards. Encourage them to really commit to this."),
    ("line", "GABRIEL", "Do not be afraid! I bring you good news of great joy for ALL people! Today in Bethlehem a Savior has been born — he is Christ the Lord!"),
    ("line", "ANGEL CHORUS", "(together, loud) Glory to God in the highest, and peace on earth!"),
    ("line", "SHEPHERD 1", "Did... did that just happen?"),
    ("line", "SHEPHERD 2", "To US?"),
    ("line", "SHEPHERD 3", "Well, what are we waiting for? Let's go to Bethlehem!"),
    ("direction", "", "Shepherds run — actually run — to the stable and kneel. SHEPHERD 4 (if cast) carries a lamb to leave at the manger."),
    ("line", "NARRATOR 2", "They found everything exactly as the angel said. And they went home praising God and telling absolutely everyone — because some news is too good to keep."),

    ("scene", "", "SCENE 4 — THE STAR  (The wise men enter from the back of the room, following the Star Carrier down the aisle.)"),
    ("line", "NARRATOR 1", "Far away in the east, wise men saw a brand-new star rise — the sign of a brand-new King. They followed it for months, over deserts and mountains, all the way to the child."),
    ("line", "WISE MAN 1", "I bring him GOLD — because he is the King."),
    ("line", "WISE MAN 2", "I bring him FRANKINCENSE — because he is holy."),
    ("line", "WISE MAN 3", "I bring him MYRRH — because he came to save us."),
    ("direction", "", "The wise men lay the gifts at the manger and kneel. The whole cast now gathers around: shepherds, angels, animals, everyone."),

    ("scene", "", "FINALE — THE NIGHT OF NIGHTS  (Full cast around the manger.)"),
    ("line", "NARRATOR 2", "Shepherds and kings. Angels and animals. That stable held the whole world's hope — and the invitation still stands. That's why we're here tonight."),
    ("line", "NARRATOR 1", "For to us a child is born. To us a Son is given. And his name shall be called Wonderful Counselor, Mighty God, Everlasting Father, Prince of Peace."),
    ("carol", "", "FINALE CAROL: \"Hark! The Herald Angels Sing,\" verse 1 — full cast and congregation. Bows during the final line. House lights up."),
]

DIRECTOR_NOTES = [
    "CASTING: The show runs with 8 kids (double the shepherd lines) or 40 (grow the angel chorus and the barnyard). Nobody except the narrators carries more than two lines, and narrators may read openly from folders.",
    "REHEARSAL PLAN: Three rehearsals is enough. (1) Read-through sitting in a circle, assign spots. (2) Walk it with props, practice the shepherd panic until it's funny. (3) Dress rehearsal straight through, no stopping, whatever happens.",
    "COSTUMES: Bathrobes (shepherds), white sheets + tinsel (angels), fancy fabric + cardboard crowns (wise men), ears on headbands (animals). Do not sew anything.",
    "PROPS: A manger (a box on two chairs, draped), a doll, three gift boxes, a star on a broomstick, a pretend fire (red paper + flashlight).",
    "THE SECRET RULE: Whatever goes wrong IS the show. A sheep wandering offstage to its mother has never once made a nativity worse.",
    "This script is free to copy, perform, and adapt for any church, school, or home. No permission needed - it's a gift. From FaithfulKids.app, where kids watch the whole Bible in two-minute episodes.",
]


def footer(c, note=""):
    c.setFont("Helvetica", 8.5)
    c.setFillColor(MUTED)
    c.drawString(54, 30, note)
    c.setFillColor(GREEN)
    c.drawRightString(PAGE_W - 54, 30, "FaithfulKids.app")


def wrap(c, text, font, size, width):
    words, lines, line = text.split(), [], ""
    for w in words:
        if c.stringWidth((line + " " + w).strip(), font, size) > width:
            lines.append(line.strip()); line = w
        else:
            line += " " + w
    lines.append(line.strip())
    return lines


out = OUT / "nativity-play-script.pdf"
c = Canvas(str(out), pagesize=letter)
c.setTitle("The Night of Nights - A Nativity Play Script for Kids")

# Title + cast page
c.setFillColor(INK); c.setFont("Helvetica-Bold", 26)
c.drawCentredString(PAGE_W / 2, PAGE_H - 90, "The Night of Nights")
c.setFillColor(MUTED); c.setFont("Helvetica", 12)
c.drawCentredString(PAGE_W / 2, PAGE_H - 112, "A nativity play for kids - about 10 minutes - cast of 8 to 40")
c.drawCentredString(PAGE_W / 2, PAGE_H - 128, "Luke 1-2 & Matthew 2, retold for small voices and bathrobe shepherds")
footer(c, "Free to perform and photocopy - no permission needed. faithfulkids.app/blog/nativity-play-script-for-kids")
y = PAGE_H - 170
c.setFillColor(DARKGREEN); c.setFont("Helvetica-Bold", 13)
c.drawString(54, y, "CAST"); y -= 22
for role, note in CAST:
    c.setFillColor(INK); c.setFont("Helvetica-Bold", 10.5)
    c.drawString(54, y, role)
    c.setFillColor(MUTED); c.setFont("Helvetica", 9.5)
    for li, l in enumerate(wrap(c, note, "Helvetica", 9.5, PAGE_W - 108 - 190)):
        c.drawString(244, y - li * 12, l)
        if li: y -= 12
    y -= 20
y -= 6
c.setFillColor(DARKGREEN); c.setFont("Helvetica-Bold", 13)
c.drawString(54, y, "DIRECTOR'S NOTES"); y -= 18
for note in DIRECTOR_NOTES:
    c.setFillColor(INK); c.setFont("Helvetica", 9)
    for l in wrap(c, note, "Helvetica", 9, PAGE_W - 108):
        if y < 50:
            c.showPage(); footer(c); y = PAGE_H - 70
            c.setFillColor(INK); c.setFont("Helvetica", 9)
        c.drawString(54, y, l); y -= 12
    y -= 6
c.showPage()

# Script pages
footer(c, "The Night of Nights - page 2")
y = PAGE_H - 70
page = 2
for kind, who, text in SCRIPT:
    needed = 14 * (len(text) // 80 + 2) + (16 if kind == "scene" else 0)
    if y - needed < 50:
        c.showPage(); page += 1; footer(c, f"The Night of Nights - page {page}")
        y = PAGE_H - 70
    if kind == "scene":
        y -= 8
        c.setFillColor(DARKGREEN); c.setFont("Helvetica-Bold", 11.5)
        for l in wrap(c, text, "Helvetica-Bold", 11.5, PAGE_W - 108):
            c.drawString(54, y, l); y -= 15
        y -= 6
    elif kind == "direction":
        c.setFillColor(MUTED); c.setFont("Helvetica-Oblique", 9.5)
        for l in wrap(c, "(" + text + ")", "Helvetica-Oblique", 9.5, PAGE_W - 148):
            c.drawString(74, y, l); y -= 13
        y -= 6
    elif kind == "carol":
        c.setFillColor(GREEN); c.setFont("Helvetica-Bold", 9.5)
        for l in wrap(c, "~ " + text + " ~", "Helvetica-Bold", 9.5, PAGE_W - 148):
            c.drawString(74, y, l); y -= 13
        y -= 8
    else:
        c.setFillColor(INK); c.setFont("Helvetica-Bold", 10)
        c.drawString(54, y, who + ":")
        c.setFont("Helvetica", 10)
        for li, l in enumerate(wrap(c, text, "Helvetica", 10, PAGE_W - 108 - 96)):
            c.drawString(150, y, l); y -= 13.5
        y -= 7
c.save()
print(f"wrote {out.name}")
