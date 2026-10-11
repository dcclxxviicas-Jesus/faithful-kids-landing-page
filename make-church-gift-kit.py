#!/usr/bin/env python3
"""Church parent-kit: a bulletin insert per church, QR -> /gift.

Special Projects step 1 (Oct 11 2026, Cas-approved). Each CH prospect in
backlink-engine/prospects.json gets a one-page, parent-facing insert:
"A gift for the families of <Church>" + QR to
  faithfulkids.app/gift?church=<slug>&n=<Name>&utm_source=church&utm_medium=print&utm_campaign=gift-<slug>
so every church's distribution is measurable in PostHog (gift_page_view).

Rules from the routing decision:
  - NO quiz/trial/checkout CTA, NO church login on the sheet. The gift is
    the free library (200 stories + printables), which needs no account.
  - Counts are ground truth (200 story retellings — check-counts verified).
  - Two sizes per church on one PDF: a full-page letter sheet and a page of
    two half-sheet bulletin inserts (churches photocopy half-sheets).
  - Plus one GENERIC kit (no church name) for ad-hoc use.

Output: church-kit/<slug>.pdf (+ church-kit/_generic.pdf). Only the
generator and the generic sample are committed; per-church PDFs are
regenerable and travel by email, not git.

Run with ~/.fk-venv/bin/python3 (reportlab + qrcode).
"""
import json
import re
import unicodedata
from pathlib import Path

import qrcode
from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import letter
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen.canvas import Canvas

HERE = Path(__file__).parent
OUT = HERE / "church-kit"
OUT.mkdir(exist_ok=True)
GREEN = HexColor("#16a34a")
DARKGREEN = HexColor("#15803d")
INK = HexColor("#1f2937")
MUTED = HexColor("#6b7280")
PAGE_W, PAGE_H = letter
SITE = "https://faithfulkids.app"


def slugify(name: str) -> str:
    s = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode()
    s = re.sub(r"\(.*?\)", "", s)  # drop "(Town, ST)"
    s = re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")
    return s[:60]


def gift_url(slug: str, name: str) -> str:
    from urllib.parse import quote
    base = f"{SITE}/gift?church={slug}&utm_source=church&utm_medium=print&utm_campaign=gift-{slug}"
    if name:
        base += f"&n={quote(name)}"
    return base


def qr_image(url: str):
    qr = qrcode.QRCode(border=1, box_size=10)
    qr.add_data(url)
    qr.make(fit=True)
    return ImageReader(qr.make_image(fill_color="#1f2937", back_color="white").get_image())


def wrap(c, text, font, size, width):
    words, lines, line = text.split(), [], ""
    for w in words:
        if c.stringWidth((line + " " + w).strip(), font, size) > width:
            lines.append(line.strip()); line = w
        else:
            line += " " + w
    lines.append(line.strip())
    return lines


def draw_insert(c, x, y, w, h, church: str, url: str, img):
    """One insert within the given box (used full-page and half-page)."""
    cx = x + w / 2
    pad = min(w, h) * 0.06
    top = y + h - pad

    c.setFillColor(DARKGREEN)
    c.setFont("Helvetica-Bold", 11 if h < 400 else 13)
    label = f"A gift for the families of {church}" if church else "A gift for your family"
    for li, l in enumerate(wrap(c, label, "Helvetica-Bold", 11 if h < 400 else 13, w - 2 * pad)):
        c.drawCentredString(cx, top - li * 15, l)
        top_used = li
    top -= (top_used + 1) * 15 + 4

    c.setFillColor(INK)
    size = 17 if h < 400 else 22
    c.setFont("Helvetica-Bold", size)
    head_lines = wrap(c, "Free Bible stories your kids will actually ask for",
                      "Helvetica-Bold", size, w - 2 * pad)
    for li, l in enumerate(head_lines):
        c.drawCentredString(cx, top - li * (size + 3), l)
    top -= len(head_lines) * (size + 3) + 6

    c.setFillColor(MUTED)
    bsize = 9.5 if h < 400 else 11
    c.setFont("Helvetica", bsize)
    body = ("200 Bible stories retold for kids with short video lessons, plus printable "
            "coloring pages, word searches, and family games. All free. No signup, no email, no catch.")
    body_lines = wrap(c, body, "Helvetica", bsize, w - 2 * pad)
    for li, l in enumerate(body_lines):
        c.drawCentredString(cx, top - li * (bsize + 3.5), l)
    top -= len(body_lines) * (bsize + 3.5) + 10

    qsize = min(w * 0.38, top - (y + pad + 34))
    c.drawImage(img, cx - qsize / 2, top - qsize, qsize, qsize)
    top -= qsize + 14

    c.setFillColor(DARKGREEN)
    c.setFont("Helvetica-Bold", 10 if h < 400 else 11.5)
    c.drawCentredString(cx, top, "Scan with your phone camera")
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 8 if h < 400 else 9)
    c.drawCentredString(cx, top - 13, "or visit  faithfulkids.app/gift")

    c.setFillColor(GREEN)
    c.setFont("Helvetica-Bold", 8.5)
    c.drawCentredString(cx, y + pad * 0.6, "FaithfulKids.app")


def build(church_name: str, slug: str, out_path: Path):
    url = gift_url(slug, church_name)
    img = qr_image(url)
    c = Canvas(str(out_path), pagesize=letter)
    c.setTitle(f"Faithful Kids — a gift for {church_name or 'your family'}")
    # Page 1: full-page letter sheet. Drawn into a centered virtual box so
    # the content doesn't pool at the top with a dead lower half, and kept
    # narrower than the sheet so the headline wraps at a sane place.
    box_w, box_h = 430, 520
    draw_insert(c, (PAGE_W - box_w) / 2, (PAGE_H - box_h) / 2, box_w, box_h, church_name, url, img)
    c.showPage()
    # Page 2: two half-sheet bulletin inserts with a cut line
    c.setDash(3, 3); c.setStrokeColor(HexColor("#d1d5db"))
    c.line(36, PAGE_H / 2, PAGE_W - 36, PAGE_H / 2)
    c.setDash()
    for y0 in (PAGE_H / 2 + 8, 28):
        draw_insert(c, 54, y0, PAGE_W - 108, PAGE_H / 2 - 44, church_name, url, img)
    c.save()
    return url


def main():
    data = json.load(open(HERE.parent / "backlink-engine" / "prospects.json"))
    items = data if isinstance(data, list) else data.get("prospects", list(data.values()))
    churches = [p for p in items if isinstance(p, dict) and p.get("tier") == "CH"
                and p.get("status") in ("pitched", "replied") and p.get("name")]
    rows = []
    for p in churches:
        name = re.sub(r"\s*\(.*?\)\s*$", "", p["name"]).strip()
        slug = slugify(p["name"])
        build(name, slug, OUT / f"{slug}.pdf")
        rows.append((slug, name))
    build("", "generic", OUT / "_generic.pdf")
    (OUT / "manifest.json").write_text(json.dumps(
        [{"slug": s, "church": n, "url": gift_url(s, n)} for s, n in rows], indent=1))
    print(f"built {len(rows)} church kits + _generic.pdf -> {OUT}/")


if __name__ == "__main__":
    main()
