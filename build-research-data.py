#!/usr/bin/env python3
"""
build-research-data.py <study>: regenerate lib/research/<study>.json, the only
source of numbers for the matching page under app/research/. Studies:
  parents   parent-path quiz answers, one latest answer per person, ad traffic out
  video     story video play/half/complete, persons per story, since Sep 1, 2026
  children  in-app lesson quizzes + reflections, aggregate only, real families only
  ai        the trivia bank put to AI models, same four-option format
  search    DataForSEO clickstream volumes for what people search about teaching the Bible
  easter    Holy Week and Resurrection questions in the trivia games so far
Rules: see CLAUDE.md "Research". Never output a child's name or free text, and
suppress any cell under MIN_CELL people.
"""
import json, re, sys, os, random, time, datetime, urllib.request, urllib.error, concurrent.futures as cf
from pathlib import Path
ROOT = Path(__file__).resolve().parent; OUT = ROOT / "lib/research"; OUT.mkdir(exist_ok=True)
MIN_CELL = 10
def env(path, name):
    for l in open(path):
        if l.startswith(name + "="): return l.split("=", 1)[1].strip()
LOCAL = ROOT / ".env.local"
def hq(q):
    # HogQL silently caps results at 100 rows unless a LIMIT is given. That cap
    # truncated these datasets once; every query carries an explicit limit.
    if " limit " not in q.lower(): q = q.strip() + " limit 100000"
    req = urllib.request.Request("https://us.posthog.com/api/projects/368526/query/", data=json.dumps({"query": {"kind": "HogQLQuery", "query": q}}).encode(),
        headers={"Authorization": "Bearer " + env(LOCAL, "POSTHOG_PERSONAL_API_KEY"), "Content-Type": "application/json"})
    return json.loads(urllib.request.urlopen(req, timeout=240).read())["results"]
def save(name, d):
    d["generated"] = datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds")
    json.dump(d, open(OUT / f"{name}.json", "w"), indent=1, ensure_ascii=False)
    print(json.dumps(d, ensure_ascii=False)[:6000])
END = "2026-11-05 05:00:00"
ADS = "select distinct distinct_id from events where timestamp >= '2026-08-15' and (properties.$current_url like '%gclid=%' or properties.$current_url like '%gad_campaignid=%')"

def parents():
    W = f"event='quiz_answer' and timestamp >= '2026-08-15' and timestamp < toDateTime('{END}') and distinct_id not in ({ADS})"
    latest = lambda qn: hq(f"select a, count() from (select distinct_id, argMax(properties.answer, timestamp) as a from events where {W} and properties.path='parent' and properties.question='{qn}' group by distinct_id) group by a order by 2 desc")
    out = {"window": {"from": "2026-08-15", "to": "2026-11-04"}, "questions": {}}
    for qn in ["num_kids", "age", "screen_time", "denomination", "faith", "pain", "goal"]:
        rows = latest(qn); out["questions"][qn] = {"n": sum(r[1] for r in rows), "answers": {r[0]: r[1] for r in rows}}
    out["parents_any"] = hq(f"select count(distinct distinct_id) from events where {W} and properties.path='parent'")[0][0]
    out["ad_people_excluded"] = hq(f"select count(distinct distinct_id) from events where event='quiz_answer' and timestamp >= '2026-08-15' and properties.path='parent' and distinct_id in ({ADS})")[0][0]
    # content predates path tagging on that question, so identify parents by their path answer
    P = f"select distinct distinct_id from events where event='quiz_answer' and properties.question='path' and properties.answer='parent'"
    c = hq(f"select a from (select distinct_id, argMax(properties.answer, timestamp) as a from events where {W} and properties.question='content' and distinct_id in ({P}) group by distinct_id)")
    tally = {}
    for r in c:
        for v in set(str(r[0]).split(",")): tally[v] = tally.get(v, 0) + 1
    out["questions"]["content"] = {"n": len(c), "answers": dict(sorted(tally.items(), key=lambda x: -x[1])), "multi": True}
    def cross(a, b):
        rows = hq(f"select x, y, count() from (select distinct_id, argMaxIf(properties.answer, timestamp, properties.question='{a}') as x, argMaxIf(properties.answer, timestamp, properties.question='{b}') as y from events where {W} and properties.path='parent' and properties.question in ('{a}','{b}') group by distinct_id) where x is not null and y is not null and x != '' and y != '' and x != 'null' and y != 'null' group by x, y")
        d = {}
        for x, y, n in rows: d.setdefault(x, {})[y] = n
        return d
    out["cross"] = {"age_screen": cross("age", "screen_time"), "screen_pain": cross("screen_time", "pain"), "faith_screen": cross("faith", "screen_time")}
    save("parents", out)

def video():
    W = f"timestamp >= '2026-09-01' and timestamp < toDateTime('{END}') and distinct_id not in ({ADS})"
    rows = hq(f"select properties.slug, count(distinct if(event='story_lesson_video_play',distinct_id,null)), count(distinct if(event='story_lesson_video_half',distinct_id,null)), count(distinct if(event='story_lesson_video_complete',distinct_id,null)), countIf(event='story_lesson_video_play') from events where event like 'story_lesson_video_%' and {W} group by 1 having count(distinct if(event='story_lesson_video_play',distinct_id,null)) > 0")
    dur = json.load(open(ROOT / "lib/story-durations.json"))
    stories = []
    for s, p, h, c, plays in rows:
        k = (s or "").replace("-for-kids", "")
        secs = dur.get(s) or dur.get(k)
        stories.append({"slug": s, "players": p, "half": min(h, p), "complete": min(c, p), "plays": plays, "seconds": secs})
    tot = hq(f"select count(distinct distinct_id), countIf(event='story_lesson_video_play') from events where event='story_lesson_video_play' and {W}")[0]
    # person+story pairs is the honest unit: one person, one story
    pairs = {"players": sum(s["players"] for s in stories), "half": sum(s["half"] for s in stories), "complete": sum(s["complete"] for s in stories)}
    br = hq(f"select properties.$browser, count(distinct distinct_id), countIf(event='story_lesson_video_play'), countIf(event='story_lesson_video_complete') from events where event like 'story_lesson_video_%' and {W} group by 1 order by 2 desc limit 8")
    dv = hq(f"select properties.$device_type, count(distinct if(event='story_lesson_video_play',distinct_id,null)), count(distinct if(event='story_lesson_video_complete',distinct_id,null)) from events where event like 'story_lesson_video_%' and {W} group by 1 order by 2 desc")
    bk = {}
    for s in stories:
        if not s["seconds"]: continue
        b = "under 2:00" if s["seconds"] < 120 else "2:00 to 2:29" if s["seconds"] < 150 else "2:30 and over"
        x = bk.setdefault(b, {"stories": 0, "players": 0, "complete": 0}); x["stories"] += 1; x["players"] += s["players"]; x["complete"] += s["complete"]
    save("video", {"window": {"from": "2026-09-01", "to": "2026-11-04"}, "people": tot[0], "plays": tot[1], "pairs": pairs, "by_length": bk, "browsers": br, "devices": dv, "stories": sorted(stories, key=lambda x: -x["players"])})

FEEL = {"Thankful", "Peaceful", "Brave", "Loved", "Amazed", "Strong", "Inspired", "Curious", "Thoughtful", "Hopeful", "Challenged", "Confused"}
RESP = {"Yes, I can relate to this", "I need to think about this more", "This touched my heart", "This inspired me to do something"}
def children():
    env_app = ROOT.parent / "bible-kids/.env.local"; key = env(env_app, "SUPABASE_SECRET_KEY"); U = "https://ygvpkycrebsfheardvwp.supabase.co/rest/v1/"
    def get(path):
        rows = []; off = 0
        while True:
            req = urllib.request.Request(U + path, headers={"apikey": key, "Authorization": "Bearer " + key, "Range": f"{off}-{off+999}"})
            b = json.load(urllib.request.urlopen(req, timeout=60)); rows += b
            if len(b) < 1000: return rows
            off += 1000
    ep = get("episode_progress?select=kid_id,series_slug,episode_id,watched,quiz_completed,quiz_score,reflection_completed,reflection_text,completed")
    kids = {k["id"]: k for k in get("kids?select=id,age_range,family_id")}
    fams = {f["id"]: f for f in get("families?select=*")}
    TEST = {"reviewer@faithfulkids.app", "castest@faithfulkids.app", "applestudenttest482@gmail.com", "appleexpiredtest519@gmail.com"}
    rc = env(LOCAL, "REVENUECAT_V2_KEY")
    def has_rc(fid):
        try:
            req = urllib.request.Request(f"https://api.revenuecat.com/v2/projects/proj93f8232b/customers/{fid}/subscriptions", headers={"Authorization": "Bearer " + rc})
            return bool(json.load(urllib.request.urlopen(req, timeout=30)).get("items"))
        except urllib.error.HTTPError: return False
    fids = {kids[e["kid_id"]]["family_id"] for e in ep if e["kid_id"] in kids}
    real = {}; counts = {"stripe": 0, "app_store": 0, "other_excluded": 0, "test_excluded": 0}
    for fid in fids:
        f = fams.get(fid) or {}
        if (f.get("parent_email") or f.get("email") or "").lower() in TEST or re.search(r"cristo|shaman", (f.get("parent_email") or f.get("email") or "").lower()): real[fid] = False; counts["test_excluded"] += 1; continue
        if f.get("stripe_customer_id"): real[fid] = True; counts["stripe"] += 1; continue
        ok = has_rc(fid); real[fid] = ok; counts["app_store" if ok else "other_excluded"] += 1
    ep = [e for e in ep if e["kid_id"] in kids and real.get(kids[e["kid_id"]]["family_id"])]
    q = [e for e in ep if e["quiz_completed"] and e["quiz_score"] is not None]
    age = lambda e: kids[e["kid_id"]]["age_range"] or "unknown"
    def tally(xs, f):
        d = {}
        for x in xs: d[f(x)] = d.get(f(x), 0) + 1
        return d
    feel, resp = {}, {}
    for e in ep:
        m = re.match(r"Response: (.*?) \| Feelings: (.*)$", e.get("reflection_text") or "")
        if not m: continue
        # Children can add a free-text note after the feelings. Those notes are
        # private and never leave the database: only the fixed tap-card labels
        # below are counted, everything else is dropped.
        if m.group(1) in RESP: resp[m.group(1)] = resp.get(m.group(1), 0) + 1
        for v in re.split(r"\s*\|\s*Note:", m.group(2))[0].split(","):
            if v.strip() in FEEL: feel[v.strip()] = feel.get(v.strip(), 0) + 1
    series = {}
    for e in ep:
        s = series.setdefault(e["series_slug"], {"lessons": 0, "quizzes": 0, "perfect": 0, "reflections": 0, "_kids": set()}); s["_kids"].add(e["kid_id"])
        s["lessons"] += 1; s["reflections"] += bool(e["reflection_completed"])
        if e in q: s["quizzes"] += 1; s["perfect"] += e["quiz_score"] >= 3
    kids_n = len({e["kid_id"] for e in ep}); fam_n = len({kids[e["kid_id"]]["family_id"] for e in ep})
    per = tally(ep, lambda e: e["kid_id"]); depth = {"1": 0, "2-4": 0, "5-9": 0, "10+": 0}
    for v in per.values(): depth["1" if v == 1 else "2-4" if v < 5 else "5-9" if v < 10 else "10+"] += 1
    a = {}
    for e in ep: a.setdefault(age(e), set()).add(e["kid_id"])
    save("children", {"families": counts, "kids": kids_n, "family_n": fam_n, "lessons": len(ep), "watched": sum(bool(e["watched"]) for e in ep), "quizzes": len(q), "reflections": sum(bool(e["reflection_completed"]) for e in ep),
        "score": tally(q, lambda e: str(min(e["quiz_score"], 3))), "by_age": {k: {"kids": len(v), "lessons": sum(1 for e in ep if age(e) == k), "quizzes": sum(1 for e in q if age(e) == k), "perfect": sum(1 for e in q if age(e) == k and e["quiz_score"] >= 3)} for k, v in a.items() if len(v) >= MIN_CELL},
        "depth": depth, "series": {k: {**{a: b for a, b in v.items() if a != "_kids"}, "kids": len(v["_kids"])} for k, v in series.items() if len(v["_kids"]) >= MIN_CELL}, "feelings": dict(sorted(feel.items(), key=lambda x: -x[1])), "responses": dict(sorted(resp.items(), key=lambda x: -x[1]))})

def bank():
    src = open(ROOT / "lib/trivia-game-questions.ts", encoding="utf-8").read(); out = []
    for tier in ["EASY", "MEDIUM", "HARD"]:
        seg = src.split(f"export const {tier}: GameQuestion[]")[1].split("export const")[0]
        for m in re.finditer(r"\{ q: '((?:[^'\\]|\\.)*)', a: '((?:[^'\\]|\\.)*)', wrong: \[(.*?)\], ref: '((?:[^'\\]|\\.)*)' \}", seg):
            wrong = [w.replace("\\'", "'") for w in re.findall(r"'((?:[^'\\]|\\.)*)'", m.group(3))]
            out.append({"q": m.group(1).replace("\\'", "'"), "a": m.group(2).replace("\\'", "'"), "wrong": wrong, "ref": m.group(4), "tier": tier.lower()})
    return out

def ai():
    MODELS = ["gpt-4o-mini", "gpt-5-mini", "gpt-5.5"]; TRIALS = 3; key = env(LOCAL, "OPENAI_API_KEY"); qs = bank(); human = {x["q"]: x for x in json.load(open(OUT / "bible-literacy.json"))["questions"]}
    def ask(model, q, seed):
        rnd = random.Random(f"{q['q']}{seed}"); opts = [q["a"]] + q["wrong"]; rnd.shuffle(opts); right = "ABCD"[opts.index(q["a"])]
        prompt = q["q"] + "\n" + "\n".join(f"{'ABCD'[i]}. {o}" for i, o in enumerate(opts)) + "\nAnswer with the letter only."
        body = {"model": model, "messages": [{"role": "user", "content": prompt}]}
        for attempt in range(5):
            try:
                req = urllib.request.Request("https://api.openai.com/v1/chat/completions", data=json.dumps(body).encode(), headers={"Authorization": "Bearer " + key, "Content-Type": "application/json"})
                t = json.load(urllib.request.urlopen(req, timeout=120))["choices"][0]["message"]["content"].strip()
                m = re.search(r"\b([ABCD])\b", t); return (model, q["q"], seed, m.group(1) == right if m else None, opts["ABCD".index(m.group(1))] if m else t[:60])
            except Exception as e: time.sleep(2 + attempt * 3); err = str(e)
        return (model, q["q"], seed, None, "ERROR " + err)
    jobs = [(m, q, s) for m in MODELS for q in qs for s in range(TRIALS)]
    with cf.ThreadPoolExecutor(8) as ex: res = list(ex.map(lambda j: ask(*j), jobs))
    per = {}
    for model, qt, seed, ok, said in res:
        p = per.setdefault(qt, {}).setdefault(model, {"right": 0, "n": 0, "errors": 0, "wrong_answers": []})
        if ok is None: p["errors"] += 1; continue
        p["n"] += 1; p["right"] += bool(ok)
        if not ok: p["wrong_answers"].append(said)
    rows = [{"q": q["q"], "a": q["a"], "ref": q["ref"], "tier": q["tier"], "human_pct": human.get(q["q"], {}).get("pct"), "human_n": human.get(q["q"], {}).get("n"), "models": per.get(q["q"], {})} for q in qs]
    summary = {m: {"right": sum(r["models"][m]["right"] for r in rows), "n": sum(r["models"][m]["n"] for r in rows), "errors": sum(r["models"][m]["errors"] for r in rows)} for m in MODELS}
    save("ai", {"run_date": str(datetime.date.today()), "models": MODELS, "trials": TRIALS, "summary": summary, "questions": rows})

MYTHS = [
 ("How many wise men visited baby Jesus?", "The Bible gives no number", r"(does ?n.t|does not|doesn.t|never|not).{0,50}(say|specif|give|mention|tell|state|number)|no (specific )?number"),
 ("What kind of fruit did Adam and Eve eat?", "The Bible only says fruit", r"(does ?n.t|does not|doesn.t|never|not).{0,50}(say|specif|name|mention|tell|state)"),
 ("How many of each animal did Noah take on the ark?", "Seven pairs of clean animals, two of the others", r"\\b(seven|7)\\b"),
 ("Where in the Bible does it say God helps those who help themselves?", "Nowhere", r"(not|isn.t|does ?n.t|doesn.t|never).{0,40}(in|appear|say|found|from).{0,20}(the )?bible|not.{0,20}(a )?(bible|biblical)|isn.t.{0,20}bible|does not appear|doesn.t appear"),
 ("Did a whale swallow Jonah?", "The text says a great fish", r"(great|big|huge|large) fish|\\bfish\\b"),
 ("Was Jesus born on December 25?", "The Bible gives no date", r"(does ?n.t|does not|doesn.t|never|not).{0,50}(say|specif|give|mention|tell|state|date)"),
 ("What were the names of the three kings who visited Jesus?", "The Bible gives no names and does not call them kings", r"(does ?n.t|does not|doesn.t|never|not).{0,60}(name|say|give|mention|tell|call)"),
 ("Was Mary Magdalene a bad woman before she met Jesus?", "The Bible says only that demons left her", r"demon|seven|(does ?n.t|does not|doesn.t|never|not).{0,50}(say|mention|tell)"),
]
def myths():
    MODELS = ["gpt-4o-mini", "gpt-5-mini", "gpt-5.5"]; TRIALS = 3; key = env(LOCAL, "OPENAI_API_KEY")
    def syl(w): return max(1, len(re.findall(r"[aeiouy]+", w.lower())) - (1 if w.lower().endswith("e") and len(w) > 3 else 0))
    def fk(t):
        ws = re.findall(r"[A-Za-z']+", t); ss = max(1, len(re.findall(r"[.!?]+", t)))
        return round(0.39 * len(ws) / ss + 11.8 * sum(syl(w) for w in ws) / max(1, len(ws)) - 15.59, 1), len(ws)
    def ask(m, q, i):
        body = {"model": m, "messages": [{"role": "user", "content": "I'm 8 years old. " + q}]}
        for a in range(5):
            try:
                req = urllib.request.Request("https://api.openai.com/v1/chat/completions", data=json.dumps(body).encode(), headers={"Authorization": "Bearer " + key, "Content-Type": "application/json"})
                return m, q, json.load(urllib.request.urlopen(req, timeout=180))["choices"][0]["message"]["content"]
            except Exception: time.sleep(3 + 3 * a)
        return m, q, ""
    jobs = [(m, x[0], i) for m in MODELS for x in MYTHS for i in range(TRIALS)]
    with cf.ThreadPoolExecutor(6) as ex: res = list(ex.map(lambda j: ask(*j), jobs))
    json.dump(res, open("/tmp/fk-myths-raw.json", "w"), indent=1)
    rows = []
    for q, truth, rx in MYTHS:
        r = {"q": q, "truth": truth, "models": {}}
        for m in MODELS:
            ans = [t for mm, qq, t in res if mm == m and qq == q]; r["models"][m] = {"right": sum(bool(re.search(rx, t, re.I | re.S)) for t in ans), "n": len(ans)}
        rows.append(r)
    grade = {m: [fk(t) for mm, qq, t in res if mm == m and t] for m in MODELS}
    # The keyword grade above is only a first pass and proved unreliable. Before
    # publishing, read every answer and hand-grade it correct / partial / repeats
    # into ai.json; raw answers belong in lib/research/ai-myth-answers.json.
    a = json.load(open(OUT / "ai.json")); a["myths"] = rows; a["myth_trials"] = TRIALS
    a["reading"] = {m: {"grade": round(sum(g[0] for g in v) / len(v), 1), "words": round(sum(g[1] for g in v) / len(v))} for m, v in grade.items()}
    json.dump(a, open(OUT / "ai.json", "w"), indent=1, ensure_ascii=False); print(json.dumps({"myths": rows, "reading": a["reading"]}, ensure_ascii=False))

def search():
    sys.path.insert(0, str(ROOT.parent / "niche-research")); os.chdir(ROOT.parent / "niche-research"); import dfs
    seeds = ["teach kids the bible", "how to teach the bible", "bible lessons for kids", "sunday school lessons", "bible stories for kids", "family devotions", "bible study for kids", "homeschool bible curriculum", "bible verses for kids", "bible games for kids", "bible trivia for kids", "how to explain god to a child", "bible activities for kids", "kids bible", "bible for kids", "bible trivia", "bible coloring pages", "bible word search", "bible study", "sunday school", "christmas story for kids", "easter story for kids", "how to explain easter to a child", "how to teach kids about god", "how to read the bible", "bible quiz", "how to teach children", "bible crafts for kids", "children's bible", "bible app for kids", "christian shows for kids"]
    seen = {}
    for s in seeds:
        r = dfs.post("dataforseo_labs/google/keyword_suggestions/live", [{"keyword": s, "location_code": 2840, "language_code": "en", "include_clickstream_data": True, "limit": 400, "include_seed_keyword": True}])
        for it in (r["tasks"][0]["result"][0].get("items") or []):
            ck = it.get("clickstream_keyword_info") or {}
            if ck.get("search_volume"): seen[it["keyword"]] = {"v": ck["search_volume"], "m": ck.get("monthly_searches") or []}
    def cat(k):
        for name, rx in [("Games and trivia", r"game|trivia|quiz|jeopardy|puzzle|word search|crossword"), ("Printables and crafts", r"printable|coloring|craft|worksheet|pdf|activity|activities"), ("Lessons and curriculum", r"lesson|curriculum|sunday school|study|homeschool|teach|devotion"), ("Verses and prayers", r"verse|scripture|memory|prayer"), ("Stories and videos", r"stor(y|ies)|video|movie|cartoon|show"), ("Bibles and apps", r"\bbible for|kids bible|children'?s bible|bible app|\bapp\b|bibles")]:
            if re.search(rx, k): return name
        return "Other"
    cats = {}; months = {}; q = []
    for k, x in seen.items():
        c = cats.setdefault(cat(k), {"keywords": 0, "volume": 0, "top": []}); c["keywords"] += 1; c["volume"] += x["v"]; c["top"].append((k, x["v"]))
        for m in x["m"]:
            kk = f"{m['year']}-{m['month']:02d}"; months[kk] = months.get(kk, 0) + (m.get("search_volume") or 0)
        if re.match(r"(how|what|why|when|where|who|can|should|is|do|does)\b", k): q.append((k, x["v"]))
    KID = r"\b(kid|kids|child|children|children's|childrens|toddler|toddlers|preschool|preschoolers|youth|teen|teens|sunday school|family|families|vbs|homeschool)\b"
    BRAND = r"fellowship|esv|niv|kjv|csb|nkjv|kugel|for all its worth|logos|tools|jehovah|minno|she reads|dwell|gateway"
    clean = {k: x for k, x in seen.items() if not re.search(BRAND, k)}
    aud = {"kids": {"keywords": 0, "volume": 0}, "general": {"keywords": 0, "volume": 0}}
    for k, x in clean.items():
        a = aud["kids" if re.search(KID, k) else "general"]; a["keywords"] += 1; a["volume"] += x["v"]
    kidq = sorted([(k, x["v"]) for k, x in clean.items() if re.search(KID, k) and re.search(r"bible|god|jesus|faith|christian|pray|scripture", k) and re.match(r"(how|what|why|when|where|who|can|should|is|do|does)\b|.*\b(teach|teaching|explain)\b", k)], key=lambda t: -t[1])[:20]
    genq = sorted([(k, x["v"]) for k, x in clean.items() if not re.search(KID, k) and re.match(r"(how|what|why|when|where|who|can|should|is|do|does)\b", k)], key=lambda t: -t[1])[:12]
    kidtop = sorted([(k, x["v"]) for k, x in clean.items() if re.search(KID, k)], key=lambda t: -t[1])[:15]
    cats = {}
    for k, x in clean.items():
        c = cats.setdefault(cat(k), {"keywords": 0, "volume": 0, "top": []}); c["keywords"] += 1; c["volume"] += x["v"]; c["top"].append((k, x["v"]))
    for c in cats.values(): c["top"] = sorted(c["top"], key=lambda t: -t[1])[:8]
    save("search", {"run_date": str(datetime.date.today()), "seeds": seeds, "keywords": len(clean), "volume": sum(x["v"] for x in clean.values()), "brand_removed": len(seen) - len(clean), "audience": aud, "kid_teaching_terms": kidq, "general_questions": genq, "kid_top": kidtop, "categories": dict(sorted(cats.items(), key=lambda kv: -kv[1]["volume"])), })

def easter():
    rx = r"cross|rose from|tomb|pilate|last supper|judas|palm|gethsemane|doubting|thomas|barabbas|golgotha|calvary|forsaken|rooster|mary magdalene|malchus|resurrect|easter|crucif|third day|emmaus|peter den|denied"
    lit = json.load(open(OUT / "bible-literacy.json")); hub = [x for x in lit["questions"] if re.search(rx, x["q"], re.I)]
    blog = hq(f"select properties.question, count(), countIf(toString(properties.got_it) in ('true','1')), any(properties.post) from events where event='trivia_game_answer' and timestamp >= toDateTime('2026-10-06 12:00:00') and timestamp < toDateTime('{END}') and (properties.post ilike '%easter%' or properties.post ilike '%holy-week%' or properties.post ilike '%resurrection%') group by 1 having count() >= 10 order by 2 desc")
    save("easter", {"window": lit["window"], "hub_average": lit["hub"]["pct"], "hub": hub, "blog": [{"q": r[0], "n": r[1], "right": r[2], "pct": round(100 * r[2] / r[1], 1), "post": r[3]} for r in blog]})

{"myths": myths, "parents": parents, "video": video, "children": children, "ai": ai, "search": search, "easter": easter}[sys.argv[1]]()
