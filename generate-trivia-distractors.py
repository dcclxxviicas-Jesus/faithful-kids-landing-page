#!/usr/bin/env python3
"""
Generate 3 multiple-choice distractors for every extractable trivia question.

WHY THIS EXISTS
The per-post trivia game was self-graded: "Reveal the Answer" then "Got it! /
Missed it". That is not a quiz — nothing is checked, the score is whatever the
player says it is, and there is no moment of commitment before the answer
appears. Multiple choice fixes all three.

WHAT IT DOES NOT TOUCH
The markdown. The question-and-answer list in each post body IS the SEO
content ("bible trivia questions and answers" is 1,530/mo at KD 3 and we do
not rank for it). Distractors live in a side file keyed by a hash of the
question text, so the posts stay readable and the game reads the data.

Resumable: rerunning only fills gaps. Validated: anything the model returns
that could be ambiguous, duplicated or a giveaway is rejected and retried,
then skipped — a question with no distractors falls back to reveal mode in
the component rather than shipping a broken option list.

  ~/.fk-venv/bin/python3 generate-trivia-distractors.py [--limit N] [--dry]
"""
import json, os, re, sys, time, hashlib, pathlib, argparse
from concurrent.futures import ThreadPoolExecutor, as_completed
from openai import OpenAI

ROOT = pathlib.Path(__file__).resolve().parent
OUT = ROOT / 'lib' / 'trivia-distractors.json'
SCOPE = pathlib.Path('/tmp/trivia-scope.json')
MODEL = 'gpt-4o-mini'
BATCH = 12          # questions per call — small enough that one bad item is cheap to retry
WORKERS = 8

def key(q: str) -> str:
    """Stable id from the question text, so re-extraction and slug changes
       never orphan the generated data."""
    return hashlib.sha1(re.sub(r'\s+', ' ', q.strip().lower()).encode()).hexdigest()[:16]

SYSTEM = """You write multiple-choice distractors for a Bible trivia game for children aged 5-15.

For each question you get the QUESTION, the correct ANSWER and a scripture REF.
Return exactly 3 wrong answers.

Rules, in order of importance:
1. Every distractor must be DEFINITELY WRONG. Never write anything that is also
   a correct or arguably-correct answer to the question.
2. Match the SHAPE of the correct answer: same kind of thing (a person, a
   place, a number, a phrase), and roughly the SAME LENGTH. A long correct
   answer beside three short wrong ones gives the game away instantly.
3. Distractors must be PLAUSIBLE to someone who half-knows the story — other
   real Bible names, places, numbers or events, not jokes and not nonsense.
4. Never a near-synonym or a rephrasing of the correct answer, and never a
   broader category that contains it.
5. If the question asks what is NOT in a passage, or what was never said, then
   every distractor must be something that IS clearly present or said, so the
   trick stays fair.
6. Keep the reading level of the question. No "all of the above", no "none of
   the above", no lettering, no numbering.

Return STRICT JSON only: {"items":[{"i":<index>,"wrong":["...","...","..."]}]}"""

def build_prompt(batch):
    lines = []
    for i, q in enumerate(batch):
        lines.append(f'{i}. QUESTION: {q["question"]}\n   ANSWER: {q["answer"]}\n   REF: {q.get("citation","")}')
    return "\n".join(lines)

def validate(answer: str, wrong) -> bool:
    if not isinstance(wrong, list) or len(wrong) != 3: return False
    norm = lambda s: re.sub(r'[^a-z0-9]+', ' ', str(s).lower()).strip()
    a = norm(answer)
    seen = set()
    for w in wrong:
        if not isinstance(w, str) or not w.strip(): return False
        n = norm(w)
        if not n or n in seen: return False          # empty or duplicated
        if n == a: return False                      # identical to the answer
        if n in a or a in n: return False            # contains / contained by
        if len(w) > max(90, len(answer) * 4): return False
        seen.add(n)
    # a correct answer far longer than every distractor is a visual giveaway
    if len(answer) > 40 and all(len(w) < len(answer) * 0.45 for w in wrong):
        return False
    return True

def run_batch(client, batch, attempt=0):
    try:
        r = client.chat.completions.create(
            model=MODEL, temperature=0.8 if attempt else 0.6,
            response_format={'type': 'json_object'},
            messages=[{'role': 'system', 'content': SYSTEM},
                      {'role': 'user', 'content': build_prompt(batch)}],
        )
        items = json.loads(r.choices[0].message.content).get('items', [])
    except Exception as e:
        return {}, f'{type(e).__name__}: {str(e)[:80]}'
    out = {}
    for it in items:
        try: i = int(it['i'])
        except Exception: continue
        if 0 <= i < len(batch) and validate(batch[i]['answer'], it.get('wrong')):
            out[key(batch[i]['question'])] = [str(w).strip() for w in it['wrong']]
    return out, None

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--limit', type=int, default=0)
    ap.add_argument('--dry', action='store_true')
    a = ap.parse_args()

    env = (ROOT / '.env.local').read_text()
    os.environ['OPENAI_API_KEY'] = re.search(r'^OPENAI_API_KEY=(.+)$', env, re.M).group(1).strip()
    client = OpenAI()

    posts = json.loads(SCOPE.read_text())
    done = json.loads(OUT.read_text()) if OUT.exists() else {}
    todo, seen = [], set()
    for p in posts:
        for q in p['qs']:
            k = key(q['question'])
            if k in done or k in seen: continue
            seen.add(k); todo.append(q)
    print(f'{len(done)} already generated | {len(todo)} to do '
          f'({sum(p["n"] for p in posts)} question slots, {len(seen)+len(done)} unique)')
    if a.dry or not todo: return
    if a.limit: todo = todo[:a.limit]

    batches = [todo[i:i+BATCH] for i in range(0, len(todo), BATCH)]
    got = fails = 0
    with ThreadPoolExecutor(max_workers=WORKERS) as ex:
        futs = {ex.submit(run_batch, client, b): b for b in batches}
        for n, f in enumerate(as_completed(futs), 1):
            res, err = f.result()
            if err: fails += 1; print(f'  batch error: {err}', file=sys.stderr)
            done.update(res); got += len(res)
            if n % 10 == 0 or n == len(batches):
                OUT.write_text(json.dumps(done, ensure_ascii=False, indent=0, sort_keys=True))
                print(f'  {n}/{len(batches)} batches | {got} new | {len(done)} total')
    OUT.write_text(json.dumps(done, ensure_ascii=False, indent=0, sort_keys=True))
    print(f'\nwrote {OUT.relative_to(ROOT)} — {len(done)} questions with distractors'
          f' ({fails} batch errors)')

if __name__ == '__main__':
    main()
