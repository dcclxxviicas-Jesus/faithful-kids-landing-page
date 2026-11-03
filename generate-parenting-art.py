#!/usr/bin/env python3
"""
Editorial illustrations for the Parenting section (/parenting).

One consistent, non-photoreal style for the whole section, one scene per
essay drawn from its title or central image. Replaces the Pexels stock
photographs (Nov 3, 2026, owner decision): a section built on real
stories should not show fake "real" families, and an illustrated voice
gives the front page one look instead of eight stock moods.

Usage (from the worktree, with the ~/.fk-venv interpreter for PIL):
  ~/.fk-venv/bin/python3 generate-parenting-art.py            # all missing
  ~/.fk-venv/bin/python3 generate-parenting-art.py <slug> ...  # just these
  ~/.fk-venv/bin/python3 generate-parenting-art.py --force <slug>

Output: .parenting-art/<slug>.png (raw), .parenting-art/<slug>.webp (1600x900)
Upload: python3 <root>/s3-put.py .parenting-art/<slug>.webp parenting/art/<slug>.webp image/webp
  -> https://d3g07v1w0lehiv.cloudfront.net/parenting/art/<slug>.webp

New keys under parenting/art/ on purpose: overwriting the old
parenting/<slug>.webp keys would need a CloudFront invalidation (the bucket
sets a one-year max-age) and the old photos stay recoverable.

Model: gpt-image-1.5 (gpt-image-1 was removed from the generations
endpoint Oct 29, 2026). Uses curl, not urllib: this machine's resolver
intermittently fails inside Python while curl resolves fine.
"""
import base64
import json
import os
import subprocess
import sys
import time
from pathlib import Path

from PIL import Image

HERE = Path(__file__).resolve().parent
OUT = HERE / ".parenting-art"
OUT.mkdir(exist_ok=True)


def read_key():
    for p in (HERE / ".env.local", HERE.parent / "FaithfulKidsLandingPage" / ".env.local"):
        if p.exists():
            for line in p.read_text().splitlines():
                if line.startswith("OPENAI_API_KEY="):
                    return line.split("=", 1)[1].strip().strip('"')
    return os.environ.get("OPENAI_API_KEY", "")


OPENAI_API_KEY = read_key()
if not OPENAI_API_KEY:
    sys.exit("OPENAI_API_KEY not found")

# The shared voice. Every scene inherits this so the section reads as one hand.
STYLE = (
    "Editorial illustration for a thoughtful magazine feature about family life and faith. "
    "Painterly gouache and soft pencil, visible brush texture, matte paper feel, gentle grain. "
    "Restrained palette: deep navy, forest green, warm cream, soft ochre, a little dusty rose. "
    "Quiet, warm, hopeful mood. Generous negative space, simple uncluttered composition, "
    "soft natural light. Figures are stylised and gentle with simplified faces, not photorealistic, "
    "not cartoonish, not 3D render, not vector flat. Everyday modern clothing in a contemporary home, "
    "varied skin tones, no religious head coverings. "
    "Absolutely no text, no lettering, no words, no logos, no watermarks, no borders. "
    "Wide horizontal composition that still reads when cropped to 16:9."
)

# One scene per essay, from its title or central image.
SCENES = {
    "taking-the-screen-away-is-not-a-plan": (
        "A tablet lying face down on a wooden kitchen table beside a half-finished glass of milk, "
        "and through the open back door a child running out into golden late-afternoon light toward a garden. "
        "The screen is over; the day is not. Viewed from inside the kitchen, the doorway is the bright centre."
    ),
    "why-i-built-an-ai-bible-app-for-my-kids": (
        "A father alone at a kitchen table late at night, lit only by a laptop screen and one small lamp, "
        "an open Bible beside the laptop, a mug gone cold, children's crayon drawings stuck to the fridge behind him, "
        "and two tiny pairs of shoes by the door. Honest, tired, determined."
    ),
    "why-our-statement-of-faith-is-short": (
        "A long wooden table in a bright plain room, set for many people with chairs of every different style "
        "around it, mismatched but all pulled up to the same table, and at the centre one open Bible. "
        "No people yet; morning light through a tall window. Welcome for every kind of family."
    ),
    "the-best-bible-question-is-the-one-you-cannot-answer": (
        "A family at dinner, seen slightly from above: a girl of about eight has just asked something, "
        "one finger raised, and both parents have paused with forks lifted and are looking at each other, "
        "pleasantly stumped. On the windowsill behind them a small leafy plant in a pot. Warm evening light."
    ),
    "family-devotions-die-in-february": (
        "A family dinner table mid-meal, plates still out, and between the plates a small open Bible "
        "with a child's hand resting on the page, a parent leaning in. A wall clock and a paper calendar on the wall "
        "behind. Ordinary weeknight, lamp light, nothing tidy about it. Five minutes that happen."
    ),
    "the-bible-lesson-your-kids-remember-is-the-one-where-you-apologized": (
        "A parent crouched down in a hallway to a small child's eye level, hands gently on the child's shoulders, "
        "both faces soft, the moment after an apology. Coats on hooks, a scatter of shoes, afternoon light from "
        "a window at the end of the hall. Tender and quiet."
    ),
    "what-the-sunday-morning-scramble-teaches-your-kids": (
        "Saturday night, ready for Sunday: a child's church clothes laid out neatly on a bed down to the socks, "
        "small shoes side by side on the floor, a packed bag by the bedroom door with a Bible tucked in it, "
        "a bedside lamp glowing. Calm, orderly, expectant. No people."
    ),
    "how-to-raise-children-to-have-god-in-their-hearts-and-minds": (
        "A child standing in tall grass on a hill at night, head tipped back, looking up at an enormous sky "
        "full of stars and the pale band of the Milky Way, a parent's hand on their shoulder just at the edge of frame. "
        "Awe, not fear. The sky takes most of the picture."
    ),
}


def generate(prompt: str, out_png: Path) -> bool:
    payload = json.dumps({
        "model": "gpt-image-1.5",
        "prompt": prompt,
        "n": 1,
        "size": "1536x1024",
        "quality": "high",
    })
    for attempt in range(3):
        proc = subprocess.run(
            ["curl", "-sS", "--max-time", "300",
             "-X", "POST", "https://api.openai.com/v1/images/generations",
             "-H", f"Authorization: Bearer {OPENAI_API_KEY}",
             "-H", "Content-Type: application/json",
             "-d", payload],
            capture_output=True, text=True)
        if proc.returncode != 0:
            print(f"    curl failed ({proc.returncode}): {proc.stderr[:160]}", flush=True)
            time.sleep(5)
            continue
        try:
            result = json.loads(proc.stdout)
        except json.JSONDecodeError:
            print(f"    bad JSON: {proc.stdout[:160]}", flush=True)
            time.sleep(5)
            continue
        if "data" not in result:
            print(f"    API error: {json.dumps(result)[:240]}", flush=True)
            return False
        out_png.write_bytes(base64.b64decode(result["data"][0]["b64_json"]))
        return True
    return False


def to_hero(png: Path, webp: Path) -> None:
    im = Image.open(png).convert("RGB")
    w, h = im.size
    target = 16 / 9
    if w / h > target:
        nw = int(h * target)
        x = (w - nw) // 2
        im = im.crop((x, 0, x + nw, h))
    else:
        nh = int(w / target)
        y = (h - nh) // 2
        im = im.crop((0, y, w, y + nh))
    im = im.resize((1600, 900), Image.LANCZOS)
    im.save(webp, "WEBP", quality=85, method=6)


def main(argv):
    force = "--force" in argv
    wanted = [a for a in argv if not a.startswith("--")] or list(SCENES)
    unknown = [s for s in wanted if s not in SCENES]
    if unknown:
        sys.exit(f"no scene for: {unknown}")
    failed = []
    for slug in wanted:
        png = OUT / f"{slug}.png"
        webp = OUT / f"{slug}.webp"
        if webp.exists() and not force:
            print(f"skip  {slug} (exists)")
            continue
        print(f"gen   {slug}", flush=True)
        if not generate(f"{SCENES[slug]} {STYLE}", png):
            failed.append(slug)
            continue
        to_hero(png, webp)
        print(f"done  {slug}  {webp.stat().st_size // 1024} KB", flush=True)
    if failed:
        print(f"FAILED: {failed}")
        sys.exit(1)


if __name__ == "__main__":
    main(sys.argv[1:])
