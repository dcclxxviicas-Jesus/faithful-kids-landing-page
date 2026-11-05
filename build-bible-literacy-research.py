#!/usr/bin/env python3
"""
build-bible-literacy-research.py: regenerate lib/research/bible-literacy.json,
the single source of truth for faithfulkids.app/research/bible-literacy.

The page renders every number from that file, so a quarterly refresh is:
  python3 build-bible-literacy-research.py 2026-09-15 2027-03-31
  (then bump UPDATED in app/research/bible-literacy/page.tsx and redeploy)

Sources (PostHog project 368526, personal key in .env.local):
  trivia_page_answer  (the /bible-trivia hub game; question text logged since
                       Sep 15, 2026)  = PRIMARY. properties.correct.
  trivia_game_answer  (the per-post blog games; multiple choice ONLY since
                       2026-10-06 12:00 UTC, self-graded before that, so the
                       blog window always starts there) = SECONDARY ONLY. The article above each game
                       prints the answers, so accuracy there is inflated; the
                       page uses it for exactly one stat and says so.
Correct answers, verse references and difficulty tier come from
lib/trivia-game-questions.ts. Matching strips punctuation because the bank
lost its em-dashes on Nov 4, 2026 while older events still carry them.
Window end is EXCLUSIVE and given in America/New_York days.
"""
import json, re, sys, urllib.request, datetime, os
from pathlib import Path

ROOT = Path(__file__).resolve().parent
start = sys.argv[1] if len(sys.argv) > 1 else "2026-09-15"
end_excl = sys.argv[2] if len(sys.argv) > 2 else "2026-11-05"   # first day NOT included
key = next(l.split("=", 1)[1].strip() for l in open(ROOT / ".env.local") if l.startswith("POSTHOG_PERSONAL_API_KEY="))

def hq(q):
    # HogQL silently caps results at 100 rows unless a LIMIT is given. That cap
    # truncated these datasets once; every query carries an explicit limit.
    if " limit " not in q.lower(): q = q.strip() + " limit 100000"
    req = urllib.request.Request("https://us.posthog.com/api/projects/368526/query/",
        data=json.dumps({"query": {"kind": "HogQLQuery", "query": q}}).encode(),
        headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"})
    return json.loads(urllib.request.urlopen(req, timeout=180).read())["results"]

# ET midnight = 05:00 UTC (EST) / 04:00 (EDT). Nov is EST.
W = f"timestamp >= toDateTime('{start} 04:00:00') and timestamp < toDateTime('{end_excl} 05:00:00')"
# The blog games were self-graded ("Got it / Missed it") until this moment; only
# multiple-choice answers count as graded. Never move this earlier.
BLOG_START = "2026-10-06 12:00:00"
BW = f"timestamp >= toDateTime('{BLOG_START}') and timestamp < toDateTime('{end_excl} 05:00:00')"
hub = hq(f"select properties.question as q, count() as n, countIf(toString(properties.correct) in ('true','1')) as r "
         f"from events where event='trivia_page_answer' and {W} group by q order by n desc")
hub_tot = hq(f"select count(), count(distinct distinct_id), countIf(toString(properties.correct) in ('true','1')) from events where event='trivia_page_answer' and {W}")[0]
blog_tot = hq(f"select count(), count(distinct distinct_id), countIf(toString(properties.got_it) in ('true','1')) from events where event='trivia_game_answer' and {BW}")[0]
union_players = hq(f"select count(distinct distinct_id) from events where (event='trivia_page_answer' and {W}) or (event='trivia_game_answer' and {BW})")[0][0]
godhelps = hq(f"select properties.question as q, count() as n, countIf(toString(properties.got_it) in ('true','1')) as r "
              f"from events where event='trivia_game_answer' and {BW} and properties.question ilike '%help themselves%' group by q order by n desc")

norm = lambda s: re.sub(r"[^a-z0-9]+", "", (s or "").lower())
src = open(ROOT / "lib/trivia-game-questions.ts", encoding="utf-8").read()
bank = {}
for tier in ["EASY", "MEDIUM", "HARD"]:
    seg = src.split(f"export const {tier}: GameQuestion[]")[1].split("export const")[0]
    for m in re.finditer(r"\{ q: '((?:[^'\\]|\\.)*)', a: '((?:[^'\\]|\\.)*)', wrong: \[(.*?)\], ref: '((?:[^'\\]|\\.)*)' \}", seg):
        q = m.group(1).replace("\\'", "'")
        bank[norm(q)] = {"q": q, "tier": tier.lower(), "answer": m.group(2).replace("\\'", "'"), "ref": m.group(4)}

rows, unmatched, unlabelled = [], [], 0
for q, n, r in hub:
    if not q:
        unlabelled += n; continue
    b = bank.get(norm(q))
    if not b:
        unmatched.append({"q": q, "n": n}); continue
    # The same question can log under two spellings (punctuation edits to the
    # bank), so merge on the bank question rather than append a second row.
    hit = next((x for x in rows if x["q"] == b["q"]), None)
    if hit:
        hit["n"] += n; hit["right"] += r; hit["pct"] = round(100 * hit["right"] / hit["n"], 1)
    else:
        rows.append({"q": b["q"], "tier": b["tier"], "answer": b["answer"], "ref": b["ref"], "n": n, "right": r, "pct": round(100 * r / n, 1)})
rows.sort(key=lambda x: (x["pct"], -x["n"]))
if unmatched:
    print("UNMATCHED (fix the bank join before publishing):", unmatched, file=sys.stderr)

tiers = {}
for t in ["easy", "medium", "hard"]:
    xs = [x for x in rows if x["tier"] == t]
    n = sum(x["n"] for x in xs); r = sum(x["right"] for x in xs)
    tiers[t] = {"questions": len(xs), "answers": n, "right": r, "pct": round(100 * r / n, 1) if n else None}
big = [x for x in rows if x["n"] >= 30]
d0 = datetime.date.fromisoformat(start); d1 = datetime.date.fromisoformat(end_excl)
days = (d1 - d0).days
total = hub_tot[0] + blog_tot[0]
out = {
    "generated": datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds"),
    "window": {"from": start, "to_exclusive": end_excl, "tz": "America/New_York"},
    "min_n": 30,
    "corpus": {"answers": total, "players": union_players, "days": days,
               "minutes_per_answer": round(days * 1440 / total, 1), "blog_start_utc": BLOG_START},
    "hub": {"answers": hub_tot[0], "players": hub_tot[1], "right": hub_tot[2], "pct": round(100 * hub_tot[2] / hub_tot[0], 1),
            "answers_unlabelled": unlabelled, "questions_measured": len(big)},
    "blog": {"answers": blog_tot[0], "players": blog_tot[1], "right": blog_tot[2], "pct": round(100 * blog_tot[2] / blog_tot[0], 1), "from_utc": BLOG_START},
    "tiers": tiers,
    "bands": {"below_25": sum(1 for x in big if x["pct"] < 25), "below_50": sum(1 for x in big if x["pct"] < 50),
              "at_least_75": sum(1 for x in big if x["pct"] >= 75)},
    "god_helps": ({"q": godhelps[0][0], "n": godhelps[0][1], "right": godhelps[0][2], "pct": round(100 * godhelps[0][2] / godhelps[0][1], 1)} if godhelps else None),
    "questions": rows,
}
(ROOT / "lib/research").mkdir(exist_ok=True)
json.dump(out, open(ROOT / "lib/research/bible-literacy.json", "w"), indent=1, ensure_ascii=False)
print(json.dumps({k: v for k, v in out.items() if k != "questions"}, indent=1, ensure_ascii=False))
print("questions:", len(rows), "with n>=30:", len(big))
