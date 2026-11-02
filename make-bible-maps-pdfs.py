#!/usr/bin/env python3
"""Builds the Bible maps PDFs + OG images from the BUILT pages, so the PDF a
teacher downloads is pixel-identical to the map on the page.

Pipeline per map: extract the inline SVG from .next/server/app (run
`npm run build` first), inject the label CSS, rasterize via macOS QuickLook
(qlmanage — no cairo on this machine), then:
  - PDF: Letter sheet via reportlab, landscape for the two wide maps,
    with title, scripture line, traditional-sites note and credit.
  - OG:  1200x630 center-weighted crop.
The timeline PDF is drawn natively from lib/bible-maps.json (it is text).

Run with ~/.fk-venv/bin/python3 (reportlab + PIL live there).
Outputs land in .bible-maps-out/ — upload with s3-put.py, then invalidate
nothing (new keys only; overwrites would need a CloudFront invalidation).
"""
import json, re, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
OUT = ROOT / ".bible-maps-out"
OUT.mkdir(exist_ok=True)
DATA = json.loads((ROOT / "lib" / "bible-maps.json").read_text())

try:
    from reportlab.lib.pagesizes import letter, landscape
    from reportlab.lib.units import inch
    from reportlab.pdfgen import canvas as pdfcanvas
    from reportlab.lib.utils import ImageReader
    from PIL import Image
except ImportError:
    sys.exit("run with ~/.fk-venv/bin/python3 (needs reportlab + pillow)")

STYLE = """<style>text { font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif; paint-order: stroke; stroke: #fff; stroke-width: 3px; stroke-linejoin: round; }
.bm-place { font-weight: 700; fill: #1f2937; } .bm-cap { font-weight: 800; fill: #14532d; }
.bm-region { font-weight: 800; fill: #a18352; letter-spacing: 0.14em; opacity: 0.9; }
.bm-water { font-style: italic; font-weight: 600; fill: #4a7fa8; letter-spacing: 0.06em; stroke-width: 2px; }
.bm-tribe { font-weight: 800; fill: #44403c; letter-spacing: 0.08em; }
.bm-credit-svg { fill: #9ca3af; stroke-width: 0; font-weight: 600; }</style>"""

WIDE = {"the-exodus", "pauls-missionary-journeys"}


def rasterize(slug: str) -> Path:
    html = (ROOT / f".next/server/app/printables/bible-maps/{slug}.html").read_text()
    m = re.search(r'<svg class="bm-svg".*?</svg>', html, re.S)
    if not m:
        sys.exit(f"{slug}: no bm-svg in built page — run npm run build first")
    svg = re.sub(r'(<svg[^>]*>)', r'\1' + STYLE, m.group(0), count=1)
    svg_path = OUT / f"{slug}.svg"
    svg_path.write_text(svg)
    subprocess.run(
        ["qlmanage", "-t", "-s", "2200", "-o", str(OUT), str(svg_path)],
        check=True, capture_output=True,
    )
    png = OUT / f"{slug}.svg.png"
    if not png.exists():
        sys.exit(f"{slug}: qlmanage produced no PNG")
    return png


def make_pdf(m: dict, png: Path):
    wide = m["slug"] in WIDE
    page = landscape(letter) if wide else letter
    W, H = page
    c = pdfcanvas.Canvas(str(OUT / f"{m['slug']}.pdf"), pagesize=page)
    margin = 0.55 * inch

    c.setFillColorRGB(0.085, 0.325, 0.204)  # #15803d-ish dark green
    c.setFont("Helvetica-Bold", 19)
    c.drawString(margin, H - margin - 6, f"{m['title']} — Bible Map")
    c.setFillColorRGB(0.35, 0.38, 0.42)
    c.setFont("Helvetica", 10.5)
    c.drawString(margin, H - margin - 22, f"{m['subtitle']}  ·  {m['scripture']}")

    img = Image.open(png)
    iw, ih = img.size
    top = H - margin - 36
    foot = margin + 20
    avail_w, avail_h = W - 2 * margin, top - foot
    scale = min(avail_w / iw, avail_h / ih)
    dw, dh = iw * scale, ih * scale
    c.drawImage(ImageReader(img), (W - dw) / 2, top - dh, dw, dh)

    c.setFont("Helvetica", 7.6)
    c.setFillColorRGB(0.45, 0.48, 0.52)
    note = m.get("disclaimer")
    trad = any(p.get("traditional") for p in m["places"])
    y = margin + 8
    if trad:
        c.drawString(margin, y, "* traditional site — the Bible names the place, tradition supplies the pin; scholars debate the exact spot.")
        y -= 10
    c.setFont("Helvetica-Bold", 8)
    c.setFillColorRGB(0.33, 0.66, 0.41)
    c.drawRightString(W - margin, margin - 4, "FaithfulKids.app — free Bible maps, stories and printables")
    c.save()
    _ = note  # full disclaimer lives on the page; the footnote covers print


def make_og(m: dict, png: Path, out_name: str):
    img = Image.open(png).convert("RGB")
    iw, ih = img.size
    target = (1200, 630)
    scale = max(target[0] / iw, target[1] / ih)
    img = img.resize((round(iw * scale), round(ih * scale)), Image.LANCZOS)
    iw, ih = img.size
    left = (iw - target[0]) // 2
    # top-weighted crop for the tall maps: the Galilee-Jerusalem band is the
    # recognizable part, the Negev is not
    top = min((ih - target[1]) // 3, ih - target[1])
    img.crop((left, top, left + target[0], top + target[1])).save(OUT / out_name, "PNG", optimize=True)


def make_timeline_pdf():
    eras = DATA["timeline"]
    W, H = letter
    c = pdfcanvas.Canvas(str(OUT / "bible-timeline.pdf"), pagesize=letter)
    margin = 0.6 * inch
    c.setFillColorRGB(0.085, 0.325, 0.204)
    c.setFont("Helvetica-Bold", 20)
    c.drawString(margin, H - margin - 4, "The Bible Timeline")
    c.setFillColorRGB(0.35, 0.38, 0.42)
    c.setFont("Helvetica", 10)
    c.drawString(margin, H - margin - 20, "The whole story in order — firm dates where history is firm, “c.” (around) where it isn’t.")

    top = H - margin - 44
    row_h = (top - margin - 26) / len(eras)
    rail_x = margin + 6
    c.setStrokeColorRGB(0.73, 0.97, 0.82)
    c.setLineWidth(3.5)
    c.line(rail_x, top - 4, rail_x, top - row_h * len(eras) + 10)

    for i, e in enumerate(eras):
        y = top - i * row_h - 10
        c.setFillColorRGB(0.086, 0.64, 0.29)
        c.circle(rail_x, y + 3, 4.4, stroke=0, fill=1)
        c.setFillColorRGB(0.07, 0.09, 0.15)
        c.setFont("Helvetica-Bold", 11.5)
        c.drawString(rail_x + 14, y, e["era"])
        c.setFillColorRGB(0.085, 0.5, 0.24)
        c.setFont("Helvetica-Bold", 9)
        dates_x = rail_x + 14 + c.stringWidth(e["era"], "Helvetica-Bold", 11.5) + 10
        c.drawString(dates_x, y, e["dates"])
        c.setFillColorRGB(0.42, 0.45, 0.49)
        c.setFont("Helvetica", 8.4)
        c.drawString(rail_x + 14, y - 11, " · ".join(e["events"]))
        c.setFont("Helvetica-Oblique", 7.6)
        c.drawString(rail_x + 14, y - 21, e["books"])

    c.setFont("Helvetica-Bold", 8)
    c.setFillColorRGB(0.33, 0.66, 0.41)
    c.drawRightString(W - margin, margin - 6, "FaithfulKids.app — the whole Bible in 300+ short video stories, in order")
    c.save()


def main():
    for m in DATA["maps"]:
        png = rasterize(m["slug"])
        make_pdf(m, png)
        make_og(m, png, f"{m['slug']}-og.png")
        print(f"{m['slug']}: pdf + og done")
    make_timeline_pdf()
    # timeline OG: reuse the richest map crop is wrong — rasterize the PDF? No:
    # a simple branded card would be hand-made; use the ancient-israel art? The
    # timeline page deserves its own OG. Draw it from the PDF via PIL is not
    # possible; instead render a simple SVG card here.
    svg = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630">',
           '<rect width="1200" height="630" fill="#f0fdf4"/>',
           '<rect x="70" y="300" width="1060" height="8" rx="4" fill="#bbf7d0"/>']
    # Seven short labels, not all thirteen eras — thirteen full names at this
    # size collide into soup (seen in render QA; do not restore).
    marks = ["Creation", "Patriarchs", "Exodus", "Kings", "Exile", "Jesus", "Early Church"]
    xs = [90 + i * (1020 / (len(marks) - 1)) for i in range(len(marks))]
    for i, (x, label) in enumerate(zip(xs, marks)):
        svg.append(f'<circle cx="{x:.0f}" cy="304" r="14" fill="#16a34a"/>')
        anchor = 'start' if i == 0 else ('end' if i == len(marks) - 1 else 'middle')
        y = 262 if i % 2 == 0 else 356
        svg.append(f'<text x="{x:.0f}" y="{y}" text-anchor="{anchor}" font-family="Helvetica" font-size="24" font-weight="700" fill="#1f2937">{label}</text>')
    svg.append('<text x="600" y="120" text-anchor="middle" font-family="Helvetica" font-size="56" font-weight="800" fill="#14532d">The Bible Timeline</text>')
    svg.append('<text x="600" y="170" text-anchor="middle" font-family="Helvetica" font-size="26" fill="#4b5563">Creation to the early church — free printable chart</text>')
    svg.append('<text x="600" y="560" text-anchor="middle" font-family="Helvetica" font-size="24" font-weight="700" fill="#16a34a">FaithfulKids.app</text>')
    svg.append('</svg>')
    p = OUT / "bible-timeline-og.svg"
    p.write_text("".join(svg))
    subprocess.run(["qlmanage", "-t", "-s", "1200", "-o", str(OUT), str(p)], check=True, capture_output=True)
    png = Image.open(OUT / "bible-timeline-og.svg.png").convert("RGB")
    png = png.resize((1200, round(png.height * 1200 / png.width)), Image.LANCZOS)
    top = max(0, (png.height - 630) // 2)
    png.crop((0, top, 1200, top + 630)).save(OUT / "bible-timeline-og.png", "PNG", optimize=True)
    print("timeline: pdf + og done")


if __name__ == "__main__":
    main()
