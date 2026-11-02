#!/usr/bin/env python3
"""Builds lib/bible-maps.json — the single source of truth for the printable
Bible maps + timeline (pages, PDFs and OG images all read this one file).

Geography: bible-maps-geo.json at repo root — real Natural Earth 10m
coastlines clipped, simplified and projected (equirectangular, x scaled by
cos(mid-lat)) by the extraction script recorded in BLOG-OPS-HANDOFF.md.
Every place below is a real lat/lon projected with the same constants, so
relative positions are geographically accurate — the differentiator over the
hand-drawn maps that hold these SERPs.

Honesty rules baked in:
- Sites tradition locates but scholarship disputes (Sinai, Marah, the Red Sea
  crossing, the route of the Exodus) are flagged `traditional: true` and the
  pages say so in copy. Never present a disputed site as settled.
- The 12 tribes map uses soft tinted areas + labels, NOT hard borders —
  Joshua 13-19 describes allotments whose exact lines nobody can draw.

Validation: every place/route point must land inside its region bbox and
every map's place names must be unique — the script throws otherwise.

Targets (DataForSEO Nov 2, 2026, clickstream/ads, US):
  bible timeline 2,956/9,900 KD15 · bible map 1,376/8,100 KD18 ·
  ancient israel map 968/8,100 KD0 · map of israel in jesus time 815/3,600 KD0 ·
  where is mount sinai 855/8,100 KD10 · paul's missionary journeys 654/1,900 KD6 ·
  old testament map 458/1,300 KD2 · map of canaan 407/3,600 KD4 ·
  map of the exodus 407/1,000 KD9 · 12 tribes of israel map 352/2,400 KD10
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
GEO = json.loads((ROOT / "bible-maps-geo.json").read_text())
OUT = ROOT / "lib" / "bible-maps.json"

# region name -> (lonMin, latMin, lonMax, latMax) — must match the extraction
BBOX = {
    "levant": (33.60, 29.20, 36.90, 33.90),
    "exodus": (29.30, 27.40, 36.60, 32.60),
    "eastmed": (11.50, 30.50, 37.50, 42.50),
}

# ---------------------------------------------------------------- rivers ----
# Hand-traced from real geography (the Jordan is not in NE lakes/land data).
JORDAN_UPPER = [(33.25, 35.65), (33.05, 35.61), (32.90, 35.59)]
JORDAN_LOWER = [(32.70, 35.57), (32.55, 35.55), (32.40, 35.50), (32.25, 35.56),
                (32.10, 35.52), (31.95, 35.56), (31.86, 35.53), (31.77, 35.55)]
NILE = {
    "main": [(27.45, 30.85), (28.40, 30.75), (29.30, 31.15), (30.05, 31.23)],
    "rosetta": [(30.05, 31.23), (30.60, 30.90), (31.30, 30.45)],
    "damietta": [(30.05, 31.23), (30.50, 31.50), (31.00, 31.80), (31.42, 31.81)],
}

# place kinds: capital, city, mountain, site
# dx/dy = label offset in SVG px; anchor = start|end|middle (default start)
def P(name, lat, lon, kind="city", note=None, dx=7, dy=4, anchor="start", traditional=False, small=False):
    d = {"name": name, "lat": lat, "lon": lon, "kind": kind, "dx": dx, "dy": dy}
    if note: d["note"] = note
    if anchor != "start": d["anchor"] = anchor
    if traditional: d["traditional"] = True
    if small: d["small"] = True
    return d

def L(name, lat, lon, size=20, color=None, angle=0):
    d = {"name": name, "lat": lat, "lon": lon, "size": size}
    if color: d["color"] = color
    if angle: d["angle"] = angle
    return d

MAPS = [
    # ------------------------------------------------------------------
    {
        "slug": "ancient-israel",
        "cropLatMin": 30.7,
        "region": "levant",
        "title": "Ancient Israel",
        "shortTitle": "Ancient Israel",
        "subtitle": "The Old Testament land, from Dan to Beersheba",
        "keyword": "ancient israel map",
        "scripture": "1 Samuel – 2 Kings",
        "intro": "Israel in the days of the kings and prophets — David's Jerusalem, Elijah's Mount Carmel, and the two kingdoms the land split into.",
        "places": [
            P("Jerusalem", 31.78, 35.23, "capital", "David's capital; Solomon's temple"),
            P("Bethlehem", 31.70, 35.20, note="David's hometown (1 Samuel 16)", dy=14),
            P("Hebron", 31.53, 35.10, note="David's first capital"),
            P("Beersheba", 31.25, 34.79, note="the land's southern edge"),
            P("Jericho", 31.86, 35.45, note="the first city taken in Canaan", dy=12),
            P("Gaza", 31.50, 34.47, note="Philistine city; Samson's story"),
            P("Ashkelon", 31.67, 34.56, note="Philistine city", small=True),
            P("Joppa", 32.05, 34.76, note="the port Jonah sailed from"),
            P("Bethel", 31.93, 35.24, note="Jacob's ladder dream", small=True),
            P("Shiloh", 32.06, 35.29, note="the tabernacle's home; Samuel's call", dy=10),
            P("Shechem", 32.21, 35.28, note="Joshua's covenant renewal"),
            P("Samaria", 32.28, 35.19, "capital", "capital of the northern kingdom", dx=-7, anchor="end"),
            P("Megiddo", 32.58, 35.18, note="fortress city on the great road", dx=-7, anchor="end"),
            P("Mount Carmel", 32.73, 35.05, "mountain", "Elijah vs. the prophets of Baal (1 Kings 18)", dx=-7, anchor="end"),
            P("Hazor", 33.02, 35.57, note="great northern city Joshua defeated", small=True),
            P("Dan", 33.25, 35.65, note="the land's northern edge"),
            P("Tyre", 33.27, 35.19, note="Phoenician port; King Hiram's city", dx=-7, anchor="end"),
            P("Sidon", 33.56, 35.37, note="Phoenician port", dx=-7, anchor="end"),
            P("Damascus", 33.51, 36.29, note="capital of Aram (Syria)"),
            P("Mount Hermon", 33.42, 35.86, "mountain", "the snowy northern mountain", dy=14),
            P("Mount Nebo", 31.77, 35.73, "mountain", "where Moses saw the Promised Land", dy=12),
            P("En Gedi", 31.46, 35.39, note="the oasis where David hid from Saul", small=True),
            P("Lachish", 31.56, 34.85, note="fortress city of Judah", small=True),
        ],
        "labels": [
            L("GALILEE", 32.85, 35.32, 19),
            L("SAMARIA", 32.17, 34.93, 19),
            L("JUDAH", 31.42, 35.02, 21),
            L("PHILISTIA", 31.58, 34.52, 16),
            L("PHOENICIA", 33.42, 35.22, 16),
            L("NEGEV", 30.85, 34.80, 18),
            L("MOAB", 31.35, 35.80, 17),
            L("AMMON", 32.10, 35.95, 16),
            L("ARAM", 33.25, 36.45, 16),
            L("The Great Sea", 32.35, 34.30, 20, "water", -68),
            L("(Mediterranean)", 32.22, 34.36, 13, "water", -68),
            L("Salt Sea", 31.42, 35.47, 13, "water", -72),
            L("Sea of Galilee", 32.80, 35.88, 12, "water"),
        ],
        "routes": [],
        "rivers": [JORDAN_UPPER, JORDAN_LOWER],
        "facts": [
            "“From Dan to Beersheba” is how the Bible itself says “the whole land” (Judges 20:1) — find both on the map and you have its length: about 150 miles, the distance of a long car day.",
            "After Solomon, the land split in two: Israel in the north with its capital at Samaria, and Judah in the south with Jerusalem (1 Kings 12). Most prophet stories happen in one kingdom or the other.",
            "The Jordan River connects the Sea of Galilee to the Salt Sea (the Dead Sea) — the lowest place on the face of the earth, so salty nothing lives in it.",
        ],
    },
    # ------------------------------------------------------------------
    {
        "slug": "israel-in-jesus-time",
        "cropLatMin": 30.95,
        "region": "levant",
        "title": "Israel in Jesus' Time",
        "shortTitle": "Jesus' Time",
        "subtitle": "Galilee, Samaria and Judea in the New Testament",
        "keyword": "map of israel in jesus time",
        "scripture": "Matthew – John",
        "intro": "The same land, about a thousand years later — now under Rome, divided into the regions the Gospels name on nearly every page.",
        "places": [
            P("Jerusalem", 31.78, 35.23, "capital", "the temple; Holy Week"),
            P("Bethlehem", 31.70, 35.20, note="where Jesus was born", dy=14),
            P("Nazareth", 32.70, 35.30, "capital", "where Jesus grew up", dx=-7, anchor="end"),
            P("Capernaum", 32.88, 35.57, note="Jesus' ministry home base", dx=-8, dy=-2, anchor="end"),
            P("Bethsaida", 32.91, 35.63, note="hometown of Peter, Andrew and Philip", dy=-7, dx=8),
            P("Cana", 32.75, 35.34, note="the wedding — water into wine", dy=-6, small=True),
            P("Tiberias", 32.79, 35.53, note="Roman city on the lake", dx=-7, anchor="end", small=True),
            P("Nain", 32.63, 35.35, note="a widow's son raised (Luke 7)", small=True, dy=10),
            P("Mount Tabor", 32.69, 35.39, "mountain", "traditional Mount of Transfiguration", dy=12, traditional=True),
            P("Caesarea Philippi", 33.25, 35.69, note="“Who do you say I am?” (Matthew 16)", dy=-6),
            P("Caesarea", 32.50, 34.89, note="Roman capital of the province; Peter and Cornelius", dx=-7, anchor="end"),
            P("Joppa", 32.05, 34.76, note="Peter's rooftop vision (Acts 10)", dx=-7, anchor="end"),
            P("Sychar", 32.21, 35.28, note="the Samaritan woman at the well (John 4)"),
            P("Jericho", 31.86, 35.45, note="Zacchaeus and blind Bartimaeus", dy=12),
            P("Bethany", 31.77, 35.26, note="Mary, Martha and Lazarus", dy=14, dx=10, small=True),
            P("Emmaus", 31.84, 34.99, note="the road where the risen Jesus walked", dx=-7, anchor="end", traditional=True),
            P("Tyre", 33.27, 35.19, note="Jesus traveled even here (Mark 7)", dx=-7, anchor="end", small=True),
            P("Sidon", 33.56, 35.37, small=True, dx=-7, anchor="end"),
        ],
        "labels": [
            L("GALILEE", 33.00, 35.16, 20),
            L("SAMARIA", 32.20, 34.96, 20),
            L("JUDEA", 31.50, 35.00, 21),
            L("PEREA", 31.95, 35.72, 16),
            L("DECAPOLIS", 32.55, 35.95, 16),
            L("PHOENICIA", 33.42, 35.22, 15),
            L("IDUMEA", 31.05, 34.95, 15),
            L("The Great Sea", 32.35, 34.30, 20, "water", -68),
            L("(Mediterranean)", 32.22, 34.36, 13, "water", -68),
            L("Dead Sea", 31.42, 35.47, 13, "water", -72),
            L("Sea of Galilee", 32.80, 35.88, 12, "water"),
        ],
        "routes": [],
        "rivers": [JORDAN_UPPER, JORDAN_LOWER],
        "facts": [
            "Almost every Gospel story happens in one of three regions: Galilee in the north (most of the ministry), Judea in the south (Bethlehem, Jerusalem, the cross), and Samaria between them — the region most travelers went around and Jesus walked through (John 4).",
            "The Sea of Galilee is really a lake about 13 miles long — small enough that you can see across it, big enough for the storms the fishermen feared. Capernaum, Bethsaida and Tiberias all sit on its shore.",
            "Nazareth to Jerusalem — the trip Mary and Joseph made — is about 90 miles on foot, four or five days of walking. Find both cities and trace the road down the Jordan valley through Jericho, the route most Galileans took.",
        ],
    },
    # ------------------------------------------------------------------
    {
        "slug": "the-exodus",
        "region": "exodus",
        "title": "The Exodus",
        "shortTitle": "The Exodus",
        "subtitle": "Out of Egypt, through the Red Sea, to Mount Sinai",
        "keyword": "map of the exodus",
        "scripture": "Exodus – Deuteronomy",
        "intro": "The route from Pharaoh's Egypt to the edge of the Promised Land — the traditional path, with the places the story names along the way.",
        "disclaimer": "The Bible names the stops; it does not give coordinates. This map follows the traditional southern route that pilgrims have used for over 1,500 years — Mount Sinai at Jebel Musa, the crossing near the Gulf of Suez. Scholars debate several of these sites, and the map marks the traditional ones with an asterisk.",
        "places": [
            P("Rameses", 30.80, 31.83, "capital", "the store-city where Israel was enslaved; the journey starts here"),
            P("Succoth", 30.55, 32.10, note="first camp out of Egypt", traditional=True, dy=12),
            P("Memphis", 29.85, 31.25, note="Pharaoh's great city", dx=-7, anchor="end"),
            P("On (Heliopolis)", 30.13, 31.31, note="Joseph's Egypt", small=True, dx=-7, anchor="end"),
            P("Red Sea crossing", 29.95, 32.60, "site", "the waters parted (Exodus 14)", traditional=True, dy=-8),
            P("Marah", 29.60, 32.80, note="bitter water made sweet (Exodus 15)", traditional=True),
            P("Elim", 29.25, 32.98, note="twelve springs, seventy palms", traditional=True),
            P("Rephidim", 28.70, 33.60, note="water from the rock; battle with Amalek", traditional=True, dx=-7, anchor="end"),
            P("Mount Sinai", 28.54, 33.98, "mountain", "the Ten Commandments (Exodus 19–20)", traditional=True, dy=14),
            P("Kadesh-barnea", 30.65, 34.42, note="the twelve spies; 38 years of waiting", dx=-7, anchor="end"),
            P("Ezion-geber", 29.55, 34.97, note="port at the Red Sea's eastern arm", dy=12),
            P("Mount Hor", 30.32, 35.41, "mountain", "where Aaron died", traditional=True),
            P("Mount Nebo", 31.77, 35.73, "mountain", "Moses sees the land he will not enter", dy=-6),
            P("Jericho", 31.86, 35.45, note="the Jordan crossing — the journey's end", dx=-7, anchor="end", dy=-6),
            P("Beersheba", 31.25, 34.79, small=True, dy=-6),
            P("Gaza", 31.50, 34.47, small=True, dx=-7, anchor="end"),
        ],
        "labels": [
            L("EGYPT", 29.60, 30.40, 24),
            L("GOSHEN", 30.48, 31.55, 15),
            L("SINAI", 29.40, 33.80, 22),
            L("Wilderness of Shur", 30.15, 33.00, 13),
            L("Wilderness of Sin", 29.00, 33.60, 13),
            L("Wilderness of Paran", 29.90, 34.35, 13),
            L("EDOM", 30.60, 35.55, 15),
            L("MOAB", 31.35, 35.80, 15),
            L("CANAAN", 31.70, 34.95, 17),
            L("The Great Sea", 31.55, 32.40, 20, "water", -10),
            L("Gulf of Suez", 28.85, 32.85, 13, "water", -55),
            L("Gulf of Aqaba", 28.60, 34.65, 13, "water", -55),
            L("RED SEA", 27.75, 34.10, 16, "water"),
            L("Nile River", 28.90, 30.95, 13, "water", -75),
        ],
        "routes": [
            {
                "name": "The Exodus route (traditional)",
                "style": "exodus",
                "points": [
                    (30.80, 31.83), (30.55, 32.10), (30.20, 32.35), (29.98, 32.52),
                    (29.92, 32.68), (29.60, 32.80), (29.25, 32.98), (28.95, 33.20),
                    (28.70, 33.60), (28.54, 33.98), (28.90, 34.25), (29.60, 34.35),
                    (30.65, 34.42), (30.20, 34.75), (29.55, 34.97), (30.32, 35.41),
                    (30.90, 35.75), (31.45, 35.80), (31.77, 35.73), (31.86, 35.45),
                ],
            },
            {
                "name": "“Way of the Philistines” — the short road God did not take them on (Exodus 13:17)",
                "style": "avoided",
                "points": [(30.80, 31.83), (30.95, 32.35), (31.10, 33.20), (31.30, 34.20), (31.50, 34.47)],
            },
        ],
        "rivers": [NILE["main"], NILE["rosetta"], NILE["damietta"], JORDAN_LOWER[1:]],  # clipped to the exodus bbox
        "facts": [
            "Egypt to Canaan is about 250 miles by the coast road — two weeks of walking. Israel took forty years, and the map shows why the story is about trust, not distance.",
            "God deliberately routed them away from the short coastal road — “for God said, ‘Lest the people change their minds when they see war’” (Exodus 13:17). The grey dashed line is the road they did not take.",
            "Where is Mount Sinai? The traditional answer since at least the 300s AD is Jebel Musa — “the mountain of Moses” — in the south of the Sinai peninsula, where St. Catherine's Monastery still stands. Some scholars argue for other peaks, which is why this map marks it as traditional.",
        ],
    },
    # ------------------------------------------------------------------
    {
        "slug": "pauls-missionary-journeys",
        "region": "eastmed",
        "title": "Paul's Missionary Journeys",
        "shortTitle": "Paul's Journeys",
        "subtitle": "Three journeys and a voyage to Rome, from the book of Acts",
        "keyword": "paul's missionary journeys",
        "scripture": "Acts 13–28",
        "intro": "Every color is one journey. Paul starts at Antioch, works further west each time, and finishes the book of Acts a prisoner in Rome — preaching the whole way.",
        "places": [
            P("Jerusalem", 31.78, 35.23, "capital", "where the church began", dy=12),
            P("Caesarea", 32.50, 34.89, note="the port for Jerusalem", dx=-7, anchor="end"),
            P("Antioch", 36.20, 36.16, "capital", "home base — every journey starts here", dx=-7, anchor="end", dy=-6),
            P("Tarsus", 36.92, 34.90, note="Paul's hometown", dy=-7),
            P("Salamis", 35.18, 33.90, note="first stop of the first journey", dy=14, small=True),
            P("Paphos", 34.77, 32.42, note="the governor believes (Acts 13)", dy=14),
            P("Perga", 36.96, 30.85, small=True, dy=-7),
            P("Pisidian Antioch", 38.31, 31.19, note="Paul's great synagogue sermon", dy=-7),
            P("Iconium", 37.87, 32.49, small=True, dy=-6, dx=9),
            P("Lystra", 37.58, 32.45, note="stoned and left for dead; Timothy's hometown", dy=13),
            P("Derbe", 37.35, 33.26, small=True, dy=13),
            P("Ephesus", 37.94, 27.34, "capital", "three years here; the riot of the silversmiths", dx=-8, anchor="end"),
            P("Miletus", 37.53, 27.28, note="farewell to the Ephesian elders", dx=-8, anchor="end", small=True, dy=10),
            P("Troas", 39.75, 26.16, note="the vision: “Come over to Macedonia”", dx=-8, anchor="end"),
            P("Philippi", 41.01, 24.29, note="Lydia; the jailer; the midnight songs", dy=-7),
            P("Thessalonica", 40.64, 22.94, dx=-8, anchor="end", dy=-6),
            P("Berea", 40.52, 22.20, note="they searched the Scriptures daily", dx=-8, anchor="end", dy=8),
            P("Athens", 37.98, 23.73, note="the sermon on Mars Hill (Acts 17)", dy=14),
            P("Corinth", 37.91, 22.88, note="a year and a half; two letters later", dx=-8, anchor="end", dy=-4),
            P("Rhodes", 36.44, 28.22, small=True, dy=13),
            P("Tyre", 33.27, 35.19, small=True, dx=-8, anchor="end"),
            P("Myra", 36.26, 29.98, small=True, dy=13),
            P("Fair Havens", 34.92, 24.73, note="the harbor they should have stayed in (Acts 27)", dy=14),
            P("Malta", 35.89, 14.51, note="shipwrecked — and welcomed", dy=-7),
            P("Syracuse", 37.06, 15.29, small=True, dx=-8, anchor="end"),
            P("Puteoli", 40.82, 14.12, small=True, dx=-8, anchor="end"),
            P("Rome", 41.89, 12.49, "capital", "the journey's end — “and so we came to Rome”"),
        ],
        "labels": [
            L("ITALY", 41.90, 13.90, 16),
            L("MACEDONIA", 41.35, 23.40, 15),
            L("GREECE", 38.80, 22.00, 15),
            L("ASIA", 38.85, 28.60, 15),
            L("GALATIA", 38.80, 32.60, 15),
            L("CILICIA", 37.30, 34.80, 13),
            L("SYRIA", 35.50, 36.60, 15),
            L("JUDEA", 31.40, 34.90, 13),
            L("EGYPT", 30.80, 30.50, 15),
            L("Crete", 35.05, 24.95, 13),
            L("Cyprus", 35.02, 33.15, 13),
            L("The Mediterranean Sea", 33.60, 21.00, 22, "water"),
            L("The Aegean", 38.90, 25.20, 13, "water", -70),
        ],
        "routes": [
            {
                "name": "First journey (Acts 13–14) — and back the same way",
                "style": "j1",
                "points": [
                    (36.20, 36.16), (36.00, 35.60), (35.18, 33.90), (34.77, 32.42),
                    (35.80, 31.30), (36.96, 30.85), (38.31, 31.19), (37.87, 32.49),
                    (37.58, 32.45), (37.35, 33.26),
                ],
            },
            {
                "name": "Second journey (Acts 15:36–18:22)",
                "style": "j2",
                "points": [
                    (36.20, 36.16), (36.92, 34.90), (37.35, 33.26), (37.58, 32.45),
                    (37.87, 32.49), (38.31, 31.19), (39.10, 29.50), (39.75, 26.16),
                    (40.60, 25.20), (41.01, 24.29), (40.64, 22.94), (40.52, 22.20),
                    (38.90, 22.60), (37.98, 23.73), (37.91, 22.88), (37.60, 24.80),
                    (37.94, 27.34), (36.00, 30.00), (33.80, 34.30), (32.50, 34.89),
                    (31.78, 35.23),
                ],
            },
            {
                "name": "Third journey (Acts 18:23–21:17)",
                "style": "j3",
                "points": [
                    (36.20, 36.16), (36.92, 34.90), (37.60, 33.40), (38.20, 31.80),
                    (38.60, 29.60), (37.94, 27.34), (39.75, 26.16), (41.01, 24.29),
                    (40.64, 22.94), (37.91, 22.88), (40.50, 23.60), (39.75, 26.16),
                    (37.53, 27.28), (36.44, 28.22), (35.60, 31.50), (33.27, 35.19),
                    (32.50, 34.89), (31.78, 35.23),
                ],
            },
            {
                "name": "The voyage to Rome (Acts 27–28)",
                "style": "rome",
                "points": [
                    (32.50, 34.89), (33.56, 35.37), (35.40, 33.60), (36.00, 31.80),
                    (36.26, 29.98), (36.50, 27.80), (35.30, 26.20), (34.92, 24.73),
                    (34.80, 23.00), (35.00, 20.00), (35.50, 17.00), (35.89, 14.51),
                    (37.06, 15.29), (38.11, 15.65), (39.60, 14.90), (40.82, 14.12),
                    (41.89, 12.49),
                ],
            },
        ],
        "rivers": [],
        "facts": [
            "Add the journeys up and Paul covered roughly 10,000 miles — most of it on foot or in small wooden ships, with no maps anywhere near as good as this one.",
            "Each journey pushes further west: the first reaches Cyprus and Galatia, the second crosses into Europe at Philippi, the third is anchored by three years in Ephesus — and the last voyage lands him in Rome itself.",
            "Half the New Testament letters are addressed to cities on this map — find Ephesus, Philippi, Thessalonica, Corinth and Rome, and you are looking at the address list of Paul's epistles.",
        ],
    },
    # ------------------------------------------------------------------
    {
        "slug": "twelve-tribes-of-israel",
        "cropLatMin": 30.9,
        "region": "levant",
        "title": "The Twelve Tribes of Israel",
        "shortTitle": "12 Tribes",
        "subtitle": "How the Promised Land was divided (Joshua 13–19)",
        "keyword": "12 tribes of israel map",
        "scripture": "Joshua 13–19",
        "intro": "After the conquest, Joshua divided the land among the tribes by lot. The tinted areas are approximate — the Bible describes the borders town by town, and nobody can draw them exactly.",
        "disclaimer": "Tribal areas are shown as soft regions, not hard borders, on purpose: Joshua 13–19 lists boundary towns, many of which can no longer be located, so every tribal map is an approximation. The positions here follow the standard reconstructions.",
        "places": [
            P("Jerusalem", 31.78, 35.23, "capital", "on the line between Judah and Benjamin", dy=12),
            P("Hebron", 31.53, 35.10, note="Caleb's inheritance", small=True),
            P("Beersheba", 31.25, 34.79, small=True),
            P("Shiloh", 32.06, 35.29, note="where the land was divided by lot (Joshua 18)", dy=-6),
            P("Shechem", 32.21, 35.28, small=True, dy=10),
            P("Dan (the city)", 33.25, 35.65, note="the tribe of Dan moved here later (Judges 18)"),
        ],
        "tribes": [
            {"name": "JUDAH",    "lat": 31.42, "lon": 34.98, "rx": 62, "ry": 50, "color": "#f4d8a8"},
            {"name": "SIMEON",   "lat": 31.10, "lon": 34.62, "rx": 48, "ry": 30, "color": "#e8c8e0"},
            {"name": "BENJAMIN", "lat": 31.88, "lon": 35.12, "rx": 42, "ry": 16, "color": "#c8dff0"},
            {"name": "DAN",      "lat": 31.98, "lon": 34.86, "rx": 30, "ry": 20, "color": "#d8e8c0"},
            {"name": "EPHRAIM",  "lat": 32.08, "lon": 35.05, "rx": 52, "ry": 22, "color": "#f0cfc0"},
            {"name": "MANASSEH", "lat": 32.40, "lon": 35.10, "rx": 62, "ry": 28, "color": "#cfe8e0"},
            {"name": "ISSACHAR", "lat": 32.58, "lon": 35.38, "rx": 38, "ry": 18, "color": "#f0e4b8"},
            {"name": "ZEBULUN",  "lat": 32.78, "lon": 35.22, "rx": 36, "ry": 17, "color": "#e0d4f0"},
            {"name": "ASHER",    "lat": 33.00, "lon": 35.12, "rx": 26, "ry": 40, "color": "#c8e8cc"},
            {"name": "NAPHTALI", "lat": 33.02, "lon": 35.48, "rx": 30, "ry": 42, "color": "#f4d0d0"},
            {"name": "MANASSEH (EAST)", "lat": 32.62, "lon": 35.95, "rx": 62, "ry": 34, "color": "#cfe8e0"},
            {"name": "GAD",      "lat": 32.00, "lon": 35.75, "rx": 36, "ry": 40, "color": "#dcd4b8"},
            {"name": "REUBEN",   "lat": 31.40, "lon": 35.75, "rx": 40, "ry": 34, "color": "#d0dcE8"},
        ],
        "labels": [
            L("The Great Sea", 32.35, 34.30, 20, "water", -68),
            L("Salt Sea", 31.42, 35.47, 13, "water", -72),
        ],
        "routes": [],
        "rivers": [JORDAN_UPPER, JORDAN_LOWER],
        "facts": [
            "Count the areas and you get thirteen, not twelve — because Joseph's inheritance was doubled through his sons Ephraim and Manasseh, and Levi received no land at all. The priests' tribe got 48 towns scattered through everyone else's territory instead (Joshua 21).",
            "Manasseh appears twice: half the tribe settled east of the Jordan with Reuben and Gad before the conquest (Numbers 32), and half took land in the west.",
            "The tribe of Dan was first given the small coastal area near the Philistines — and later gave up and marched to the far north to capture the city they renamed Dan (Judges 18). That is why the city at the land's northern tip carries a southern tribe's name.",
        ],
    },
    # ------------------------------------------------------------------
    {
        "slug": "the-promised-land",
        "cropLatMin": 30.9,
        "region": "levant",
        "title": "The Land of Canaan",
        "shortTitle": "Canaan",
        "subtitle": "The Promised Land as Joshua found it",
        "keyword": "map of canaan",
        "scripture": "Genesis 12 – Joshua 12",
        "intro": "The land God promised Abraham, as it looked when Israel finally arrived: walled Canaanite cities, seven nations, and the Jordan to cross first.",
        "places": [
            P("Jericho", 31.86, 35.45, "capital", "the first city — walls and all (Joshua 6)", dy=-9),
            P("Ai", 31.92, 35.27, note="the hard lesson after Jericho (Joshua 7–8)", dx=8, dy=-2),
            P("Gibeon", 31.85, 35.19, note="the clever treaty; the day the sun stood still", dx=-7, anchor="end"),
            P("Jerusalem (Jebus)", 31.78, 35.23, note="still a Jebusite city for 400 more years", dy=14),
            P("Hebron", 31.53, 35.10, note="Abraham's home; the giant-sized grapes", dy=10),
            P("Lachish", 31.56, 34.85, note="southern fortress (Joshua 10)", dx=-7, anchor="end"),
            P("Gezer", 31.86, 34.92, small=True, dx=-7, anchor="end"),
            P("Gaza", 31.50, 34.47, note="Philistine coast city"),
            P("Ashdod", 31.75, 34.65, small=True, dx=-7, anchor="end"),
            P("Shechem", 32.21, 35.28, note="where Joshua renewed the covenant (Joshua 24)"),
            P("Bethel", 31.93, 35.24, note="Abraham's altar; Jacob's ladder", small=True, dx=-7, dy=2, anchor="end"),
            P("Dor", 32.62, 34.92, small=True, dx=-7, anchor="end"),
            P("Megiddo", 32.58, 35.18, note="Canaanite stronghold", dy=-5),
            P("Hazor", 33.02, 35.57, note="“the head of all those kingdoms” (Joshua 11)"),
            P("Beersheba", 31.25, 34.79, note="Abraham's well", small=True),
        ],
        "labels": [
            L("CANAANITES", 32.70, 35.20, 15),
            L("AMORITES", 31.65, 35.60, 15),
            L("PHILISTINES", 31.38, 34.42, 15),
            L("HIVITES", 33.30, 35.80, 14),
            L("HITTITES", 31.40, 35.12, 13),
            L("PERIZZITES", 32.35, 35.35, 13),
            L("The Great Sea", 32.35, 34.30, 20, "water", -68),
            L("Salt Sea", 31.42, 35.47, 13, "water", -72),
            L("Sea of Chinnereth", 32.98, 35.64, 11, "water"),
        ],
        "routes": [
            {
                "name": "Israel crosses the Jordan (Joshua 3)",
                "style": "exodus",
                "points": [(31.81, 35.60), (31.86, 35.47)],
            },
        ],
        "rivers": [JORDAN_UPPER, JORDAN_LOWER],
        "facts": [
            "God lists the seven nations of Canaan in Deuteronomy 7:1 — “Hittites, Girgashites, Amorites, Canaanites, Perizzites, Hivites and Jebusites, seven nations greater and mightier than you.” The map shows where the main ones lived.",
            "The spies carried one cluster of grapes on a pole between two men (Numbers 13:23) — it came from the valley near Hebron. Forty years later, Caleb, one of those two faithful spies, asked for that exact hill country as his inheritance.",
            "Jericho sits by the Jordan crossing, which is why it had to be first: it guarded the doorway into the whole land.",
        ],
    },
]

# ---------------------------------------------------------------- timeline --
# Traditional/conventional datings; uncertainty is stated, never smoothed over.
TIMELINE = [
    {
        "era": "Creation & the Early World",
        "dates": "before recorded history",
        "note": "The Bible gives no dates for Genesis 1–11, and this chart doesn't invent any.",
        "events": ["Creation", "Adam and Eve", "Noah and the flood", "The tower of Babel"],
        "books": "Genesis 1–11",
        "storySlug": "in-the-beginning-creation-for-kids",
    },
    {
        "era": "The Patriarchs",
        "dates": "c. 2000–1700 BC",
        "events": ["God calls Abraham", "Isaac", "Jacob becomes Israel", "Joseph rules Egypt"],
        "books": "Genesis 12–50",
        "storySlug": "god-calls-abraham-for-kids",
    },
    {
        "era": "Slavery in Egypt & the Exodus",
        "dates": "c. 1700–1400 BC",
        "note": "The exodus is traditionally dated c. 1446 BC; many scholars argue for c. 1270 BC.",
        "events": ["Israel enslaved", "Moses and the burning bush", "The ten plagues", "The Red Sea", "The Ten Commandments at Sinai"],
        "books": "Exodus – Deuteronomy",
        "storySlug": "the-burning-bush-for-kids",
    },
    {
        "era": "Conquest of the Land",
        "dates": "c. 1400–1350 BC",
        "events": ["Crossing the Jordan", "The walls of Jericho", "The land divided among the tribes"],
        "books": "Joshua",
        "storySlug": "the-walls-of-jericho-for-kids",
    },
    {
        "era": "The Judges",
        "dates": "c. 1350–1050 BC",
        "events": ["Deborah", "Gideon's 300", "Samson", "Ruth and Boaz", "Samuel hears God's voice"],
        "books": "Judges, Ruth, 1 Samuel 1–7",
        "storySlug": "god-calls-samuel-for-kids",
    },
    {
        "era": "The United Kingdom",
        "dates": "c. 1050–930 BC",
        "events": ["Saul, the first king", "David and Goliath", "David's reign", "Solomon's wisdom", "The first temple"],
        "books": "1 Samuel 8 – 1 Kings 11",
        "storySlug": "david-and-goliath-for-kids",
    },
    {
        "era": "The Divided Kingdom",
        "dates": "930–722 BC",
        "note": "Israel (north) falls to Assyria in 722 BC — one of the Bible's firmest dates.",
        "events": ["The kingdom splits", "Elijah and the prophets of Baal", "Elisha", "Jonah and the great fish", "Assyria destroys the north"],
        "books": "1 Kings 12 – 2 Kings 17",
        "storySlug": "elijah-and-the-ravens-for-kids",
    },
    {
        "era": "Judah Alone",
        "dates": "722–586 BC",
        "note": "Jerusalem falls to Babylon in 586 BC.",
        "events": ["Good king Hezekiah", "Josiah finds the lost book", "Jeremiah warns Jerusalem", "Babylon destroys the temple"],
        "books": "2 Kings 18–25, Isaiah, Jeremiah",
        "storySlug": "judah-falls-to-babylon-for-kids",
    },
    {
        "era": "The Exile in Babylon",
        "dates": "586–538 BC",
        "events": ["Daniel in the lions' den", "The fiery furnace", "Ezekiel's visions by the river"],
        "books": "Daniel, Ezekiel, Lamentations",
        "storySlug": "daniel-in-the-lions-den-for-kids",
    },
    {
        "era": "The Return Home",
        "dates": "538–c. 430 BC",
        "events": ["Cyrus sends the exiles home", "The temple rebuilt", "Esther saves her people", "Nehemiah rebuilds the walls"],
        "books": "Ezra, Nehemiah, Esther, Haggai – Malachi",
        "storySlug": "esther-saves-her-people-for-kids",
    },
    {
        "era": "Between the Testaments",
        "dates": "c. 430–5 BC",
        "note": "Often called the “400 silent years” — no new Scripture, while Greece and then Rome take over the land.",
        "events": ["Greek rule after Alexander", "The Maccabees", "Rome arrives — and Herod builds"],
        "books": "(between Malachi and Matthew)",
    },
    {
        "era": "Jesus",
        "dates": "c. 5 BC – AD 30/33",
        "note": "Jesus was likely born 6–4 BC — our calendar's inventor miscounted a few years.",
        "events": ["Born in Bethlehem", "Baptized in the Jordan", "Three years of ministry in Galilee", "The cross and the empty tomb"],
        "books": "Matthew, Mark, Luke, John",
        "storySlug": "born-in-a-manger-for-kids",
    },
    {
        "era": "The Early Church",
        "dates": "AD 30 – c. 100",
        "events": ["Pentecost", "Stephen, the first martyr", "Paul's three journeys (AD 46–57)", "Letters to the churches", "John's vision on Patmos"],
        "books": "Acts – Revelation",
        "storySlug": "the-day-of-pentecost-for-kids",
    },
]


def validate():
    errs = []
    for m in MAPS:
        bbox = BBOX[m["region"]]
        xmin, ymin, xmax, ymax = bbox
        names = [p["name"] for p in m["places"]]
        if len(names) != len(set(names)):
            errs.append(f"{m['slug']}: duplicate place names")
        for p in m["places"] + m.get("labels", []):
            if not (xmin <= p["lon"] <= xmax and ymin <= p["lat"] <= ymax):
                errs.append(f"{m['slug']}: {p['name']} ({p['lat']},{p['lon']}) outside {m['region']} bbox")
        for t in m.get("tribes", []):
            if not (xmin <= t["lon"] <= xmax and ymin <= t["lat"] <= ymax):
                errs.append(f"{m['slug']}: tribe {t['name']} outside bbox")
        for r in m.get("routes", []):
            for lat, lon in r["points"]:
                if not (xmin <= lon <= xmax and ymin <= lat <= ymax):
                    errs.append(f"{m['slug']}: route '{r['name'][:30]}' point ({lat},{lon}) outside bbox")
        for riv in m.get("rivers", []):
            for lat, lon in riv:
                if not (xmin <= lon <= xmax and ymin <= lat <= ymax):
                    errs.append(f"{m['slug']}: river point ({lat},{lon}) outside bbox")
    if len({m["slug"] for m in MAPS}) != len(MAPS):
        errs.append("duplicate map slugs")
    if errs:
        raise SystemExit("VALIDATION FAILED:\n  " + "\n  ".join(errs))


def main():
    validate()
    out = {
        "regions": GEO,
        "maps": MAPS,
        "timeline": TIMELINE,
    }
    OUT.write_text(json.dumps(out, ensure_ascii=False))
    n_places = sum(len(m["places"]) for m in MAPS)
    print(f"wrote {OUT.name}: {len(MAPS)} maps, {n_places} places, "
          f"{len(TIMELINE)} timeline eras, {OUT.stat().st_size//1024}KB")


if __name__ == "__main__":
    main()
