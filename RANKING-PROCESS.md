# THE RANKING PROCESS — how a page goes from idea to ranked

**This is the core operating document for content ops.** BLOG-OPS-HANDOFF.md
holds the history, machinery, and rules; THIS file is the pipeline you run
every time you want something to rank. It is written against this site's real
tools and real scars — every threshold and gate below exists because of
something that actually happened here.

The pipeline is eight phases with hard gates between them. A page that skips a
gate is a page that joins the ~130 zero-impression posts already in the
library. The library is full; the bar is high.

```
0 Find candidates → 1 Validate demand → 2 Validate the SERP → 3 Map query→page
→ 4 Write for search → 5 Images → 6 Technical on-page → 7 Ship, index, links
→ 8 Monitor, iterate, refresh
```

---

## PHASE 0 — FINDING CANDIDATES (where target ideas come from)

Run these hunts periodically (the growth-engine routine does some weekly);
each produces a candidate list, and NOTHING on those lists is a target until
it passes Phases 1–2.

**A. GSC striking distance** — queries we already rank 8–25 for with real
impressions. These are the cheapest wins: Google already believes us a little.
```bash
python3 ../gsc-query.py 90 queries        # eyeball
# or the API for query+page pairs: dimensions ["query","page"], rowLimit 25000
```
Look for: impressions ≥ 30/90d, position 8–25. Then Phase 2 will tell you
whether the position is real (see the position-illusion warning there).

**B. GSC unserved queries** — queries hitting a page NOT built for them
(e.g. "bible verses for kindergarten graduation" landing on the general
graduation post). Each is a candidate for a dedicated page IF volume clears
Phase 1 — or an argument to extend the existing page with a section.

**C. DataForSEO expansion sweeps** — seed a working term, harvest the cluster:
```python
dfs.post("dataforseo_labs/google/keyword_suggestions/live", [{
  "keyword": seed, "language_code": "en", "location_code": 2840,
  "include_clickstream_data": True, "limit": 200}])
# read clickstream_keyword_info.search_volume — Google Ads volume is
# SUPPRESSED for child-directed terms in this niche and reads 0.
```
This is how "christmas word search" (14,800/mo, KD 0) was found hiding beside
a 5,400/mo term we were already building for. Always sweep the neighborhood
of anything that works.

**D. Competitor gap** — `dataforseo_labs/google/ranked_keywords/live` on
competitors (ministry-to-children.com, sermons4kids.com, dltk-bible.com,
deeperkidmin.com…). Terms they rank 1–10 for that we don't touch = candidates.

**E. The seasonal calendar** — seasonal terms need an **8–10 week lead**
(pages must rank BEFORE the search wave):
| Build by | For | Examples |
|---|---|---|
| early Sep | Advent/Christmas (Nov–Dec peak) | christmas word search, nativity coloring, advent activities |
| early Jan | Lent/Easter (Feb–Apr peak) | easter coloring, holy week for kids |
| early Jun | Back-to-school/Sunday-school launch (Aug peak) | sunday school openers, teacher kits |
| early Aug | Fall kickoff, Thanksgiving-adjacent (faith-specific only) | — |

**F. Product/owner priorities** — pages that serve the funnel (comparisons,
/about-class facts pages, the churches offer) get built even at modest volume
because their traffic converts. Intent multiplies volume.

---

## PHASE 1 — DEMAND GATE (DataForSEO, never intuition)

For every candidate:
1. **Clickstream volume** (as above). Rough bar: ≥ 200/mo for a dedicated
   page; below that only if it's a detail page in an existing set (the
   every-scene-gets-a-page principle: sixteen KD-0 pages beat one page
   carrying all sixteen) or a funnel page where intent justifies it.
2. **Difficulty**: `dataforseo_labs/google/bulk_keyword_difficulty/live`.
   With our authority (~100 ranking pages, 2 referring-domain wins so far),
   realistic ceiling is **KD ≤ ~15** for a new page to reach page 1 unaided;
   KD 15–30 only with the internal-link blitz + a backlink-engine asset pitch
   behind it; KD 30+ is a someday-page, park it.
3. **Volume 0 or unverifiable → dead.** ("women of the bible for kids" was
   pitched confidently; real volume: 0. The mandate exists because intuition
   lost 3-for-3 in one session.)

Record the verdict (volume, KD, date checked) in the work log — numbers rot.

---

## PHASE 2 — SERP GATE (who actually owns page 1, and is there any oxygen)

`serp/google/organic/live/advanced`, depth 20–30, desktop. Read FOUR things:

1. **AI Overview present?** If yes on an informational query → the clicks are
   mostly gone; either kill it or transform it into an artifact the AIO can't
   satisfy (playable game, printable, tool). Artifact queries in this niche
   (coloring pages, word searches, printables) are largely AIO-free — that
   asymmetry IS the strategy.
2. **Who holds the top 10?** Navigational/brand SERPs are unwinnable ("bible
   app for kids" = 8/10 YouVersion properties — their product's literal
   name). Small dated resource sites (dltk-bible, kidscorner) = winnable
   ("bible stories for kids" got its hub for exactly this reason). YouTube/
   Pinterest/marketplace results = Google wants media/artifacts, match that.
3. **SERP features to target**: `people_also_ask` items are your H2/FAQ list
   verbatim (free subtopic research). `images` block near the top on
   printable/coloring queries = image SEO matters double there (Phase 5).
   `related_searches` feed the Phase 0 sweep.
4. **Our own presence** — are we already ranking with a DIFFERENT page?
   → **Cannibalization protocol:** never launch a second page against the
   same primary query. Either extend/retarget the incumbent, or clearly
   differentiate intent (age modifier / "free" / review vs comparison — the
   Aug 25 fix for 4 posts competing at position 44–53). The word-search
   structure is the canonical pattern: the head term plays ON the hub; no
   detail page duplicates it; detail pages take the long-tails.

**Gate: you must be able to say in one sentence why we can be a top-5 result
here within 90 days.** If you can't, it's not a target.

---

## PHASE 3 — QUERY→PAGE MAPPING

- **One primary keyword per page.** `keywords[0]` in frontmatter = the primary
  (this is the operating convention; the array's remainder = secondaries).
- 3–8 secondaries from the Phase 0 sweep (variants, plurals, question forms)
  woven into H2s and body — never a stuffed list.
- **Choose the page TYPE by what the searcher wants to receive**, not what's
  easy to write: artifact (printable/game/tool) > hub (collection with the
  head term) > comparison/commercial post > guide > story. "People search for
  the ARTIFACT, not an article about it" — two clusters died learning this.
- Head term → hub; each long-tail → its own detail page; hub and details
  interlink (see `lib/printable-pairs.ts` for the cross-set pattern).
- Slug: short, hyphenated, contains the primary, no year. **Never change a
  slug after publish** (no 301 infrastructure is set up — a renamed slug is a
  dead page plus broken links).

---

## PHASE 4 — WRITING FOR SEARCH (the on-page content layer)

**Frontmatter (all posts):** title, slug, type ("listicle" for guides; absent
for story posts), metaDescription, keywords[], datePublished (real),
dateModified (update ONLY on substantive edits — honest dates are an E-E-A-T
signal and VideoObject uses them). Story posts add series/seriesSlug/episode/
testament/book/age/themes.

**Title (≤ 60 chars, entity-decoded when measured):**
- Primary keyword in the front half, phrased the way people search (verify
  phrasing against autocomplete/suggestions — "Noah's Ark" beats "Noah and
  the Great Flood"; this is the YouTube-title lesson applied to pages).
- Honest number/spec where real ("26 Free…", "300+…"). No years in evergreen
  titles unless we'll maintain them (the "(2026)" titles must be re-checked
  each January).
- The title is also the citation surface for LLMs — it should read as an
  answer, not a teaser.

**Meta description (< 158 chars, entity-decoded):** primary keyword + the
concrete reason to click (what they GET: "free, no sign-up", "answer key
included", "with discussion questions"). It's ad copy, not a ranking factor —
write it for the click.

**Structure:**
- NO `#` H1 in the body (template owns the H1).
- **Answer-first opening: the first paragraph directly answers the query in
  2–4 quotable sentences** — verdict, names, numbers. This wins featured
  snippets, gets lifted by AI Overviews/LLMs with attribution, and stops the
  pogo-stick. (Six of nine comparison posts had to be rewritten for burying
  the answer under throat-clearing; don't create new ones that do.)
- H2s mirror the People-Also-Ask questions and secondary keywords, in
  question form where natural. Each H2 section opens with its own direct
  answer sentence (snippet bait), then elaborates.
- Tables for anything comparative (engines and LLMs both extract tables
  disproportionately well). Real HTML lists for steps.
- FAQ section at the end with 4–8 REAL questions (PAA-sourced) — this also
  feeds FAQPage schema and, on trivia-type posts, the TriviaGame extractor
  (10+ extractable Q&As auto-mounts the game).
- Length: whatever completeness requires. Artifact/transactional pages may be
  300 words and outrank 3,000-word posts; guides should exhaust the subtopics
  the current top-5 cover, plus something they don't (our angle: ages,
  scripture refs, honest competitor treatment, printable/playable extras).

**Truth & E-E-A-T:**
- Every count consistent sitewide ("300+ video lessons"; run check-counts).
- Competitors named honestly with their real strengths — the honest
  comparison is what earns citations and trust (and rankings followed it).
- First-hand signals where true ("we built", "our own kids", "we drew").
- Our prices exact; competitor prices only inside their comparison context.
- No fabricated ratings/reviews/schema. No native-app or trial-length claims.

**Internal links (both directions, at write time — not later):**
- OUT: 2–3 contextual links to related pages, descriptive anchors, every
  slug verified to exist (check-links catches, but write them right).
- IN: minimum 3–5 contextual inbound links from topically-related existing
  posts, added via the `link-*.py` injector pattern (idempotent, one link per
  source post, varied templates by slug hash, placed before-FAQ). A page
  without inbound links does not rank — the single most-repeated lesson in
  this project's history. Hub membership + related-component slots count but
  do NOT substitute for in-body contextual links (nav/footer links are
  discounted).

**Schema by page type** (JSON-LD, in the template or page):
| Page | Schema |
|---|---|
| Story post | Article + VideoObject (REAL CDN URL, HEAD-verified, real dates, no invented duration) + FAQPage if real Q&A |
| Guide/listicle | Article + FAQPage (real on-page Q&A only) |
| Comparison | Article + FAQPage; consider ItemList of the compared apps |
| Hub | CollectionPage + ItemList (first ~100 items) |
| Printable detail | CreativeWork/ImageObject via template + FAQPage |
| Trivia | Quiz schema (exists on /bible-trivia) |
| Homepage only | Organization + WebSite + SoftwareApplication |
Never: aggregateRating (standing prohibition).

---

## PHASE 5 — IMAGES (every page, and the SEO that rides on them)

**Every page gets a unique hero + inline images.** The template handles most
image SEO automatically IF you follow the conventions — know what it does:

- **Filenames are keyword-bearing by convention**: `blog-images/[slug]-hero.webp`,
  `[slug]-1.webp`, `[slug]-2.webp` on CloudFront. The slug IS the keyword, so
  filenames are handled — keep the convention for any new image class
  (`wordsearch-images/[slug].png`, `coloring-pages/[slug].png`, `pin-images/[slug].jpg`).
- **Alt text is template-generated from the title** (`"{title} - Bible Story
  Illustration for Kids"` etc.) — keyword-bearing because titles are. For
  hand-placed images in body markdown (`![alt](src)`), write alts that
  describe the image AND carry the keyword naturally; never stuff.
- **Hero doubles as og:image, twitter:image, and ImageObject schema** — so a
  page without a hero has no social card and no image-search presence. The
  word-search pages shipped hero-less and borrowed coloring images until they
  got their own (each page needs its OWN og:image — don't share).
- **WebP for blog images; 1536×1024 via gpt-image-1** (dall-e-3 is retired).
  Inline images `loading="lazy"` (template does it); heroes are not lazy
  (LCP).
- **Style must match purpose**: line art for coloring pages (meant to be
  filled in), watercolor/storybook for heroes (meant to be looked at) —
  deliberately different generators; don't cross them.
- **Image-pack queries** (coloring, printable, word search): the images block
  sits high in those SERPs, so image SEO is a real traffic channel there —
  distinct per-page images, correct filenames/alts, and the printed-URL
  watermark so a shared/photocopied sheet still markets us.
- **Generation discipline**: `~/.fk-venv/bin/python3`, per-slug SCENES entry
  (generic scenes were flagged by the owner — every image topic-specific),
  stderr VISIBLE (never `2>/dev/null` — it hid a total failure), expect DNS
  flakiness → multi-pass retry, and **the only completion check is an
  S3-vs-posts diff**, never the run log.
- CloudFront cache: `public, max-age=31536000`; re-uploading same key needs
  a new filename or invalidation — prefer new filenames.

---

## PHASE 6 — TECHNICAL ON-PAGE (the invisible checklist)

Per page before ship:
- [ ] Self-canonical present and correct (client components can't export
      metadata — use a route `layout.tsx`; the /quiz//privacy//terms bug).
- [ ] Indexable (no stray noindex; conversely /checkout-class pages stay
      noindexed AND out of the sitemap — signals must agree).
- [ ] In the sitemap (auto for posts; static routes are hand-listed in
      `app/sitemap.ts` — new hubs/pages must be added).
- [ ] Unique title/meta vs existing pages (grep before you collide).
- [ ] Crawlable text: puzzles/tables as HTML, never images of text.
- [ ] Heavy media `preload="none"` + poster (a pageview must not cost 30MB).
- [ ] Print stylesheet behavior for printable pages (game-state hidden, URL
      mark present, answer keys closed/hidden in print).
- [ ] Mobile: no horizontal scroll; interactive components touch-tested
      (tap-ends selection exists because drag-select breaks on touch).
- [ ] Taxonomy: slug routes to the right hub (`getGuideCategory` first-match).

---

## PHASE 7 — SHIP, INDEX, AND LIGHT IT UP

1. `find .next -name "*conflicted copy*" -delete` (Dropbox), `npm run build`.
2. **The three checkers, all green or no ship:** `check-links.py`,
   `check-counts.py`, `onpage-audit.py .next/server/app/<page>.html`
   (know its documented false-positives: homepage-keyword + word-count
   heuristics on non-homepage/transactional pages).
3. Commit, push, **verify the Vercel deploy went READY** (this repo is fine
   via git; never assume), spot-check the live URL and view-source the
   canonical + schema.
4. `python3 ../ping-indexnow.py` (Bing/ChatGPT-search fast lane). GSC
   sitemap-API submission is broken (read-only token) and unneeded; for
   high-value pages, manual URL Inspection → Request Indexing in the GSC UI
   is an owner-assisted option.
5. **Distribution burst (same day):**
   - Inbound links live (Phase 4) — re-verify in the BUILT HTML, not source
     (the only proof the template rendered them).
   - Pinterest: hero → `generate-pinterest-pins.py` → regenerate + commit
     `lib/pin-manifest.json` (the post then auto-joins its feed's drip).
   - llms.txt: listicles/comparisons appear automatically; confirm new page
     classes are represented (new sections were added Aug 27 — keep parity).
   - If the page is a pitchable asset (printable set, tool, hub), hand it to
     the backlink-engine session as pitch material — links from outreach are
     what break the KD ceiling.

---

## PHASE 8 — MONITOR, ITERATE, REFRESH (where rankings are actually won)

**Timeline expectations (calibrated on this site's own curve):**
- Indexing: days (IndexNow/Bing) to ~2 weeks (Google) for a linked page.
- Impressions before clicks: normal. Positions start 30–60 and walk up.
- Meaningful read: **28 days**; trend read: compare 28d windows (ours:
  118 → 318 → 759 clicks across three windows).
- A page with zero impressions at 6 weeks is broken: check indexing (site:
  query / GSC URL inspection), inbound links, cannibalization, or demand was
  misread.

**The iteration decision tree (per target, monthly):**
| Observation | Diagnosis | Action |
|---|---|---|
| Pos 4–10, impressions, low CTR | **PULL THE LIVE SERP FIRST** — GSC position averages variants and ignores SERP furniture; "pos 8.9" was really #25 once | Only if genuinely top-5 on the real SERP: title/meta rework. Otherwise it's an authority problem — feed links |
| Pos 11–20 with impressions | Striking distance — the 43%-of-impressions zone | +3–5 more internal links; extend content to cover missed PAA subtopics; pitch for an external link |
| Pos 21–40 | Content adequate, authority short | Links (internal + engine); patience |
| Pos 40+ / wrong queries | Query-page mismatch | Retarget: retitle + reframe around what GSC says it's actually surfacing for (the graduation-post pattern), or split a dedicated page (Phase 1 gates apply) |
| Ranking but zero conversions | Wrong offer for the intent | Fix the CTA match (teacher-intent → /churches, not the family trial), not the SEO |
| Two of our pages alternating on one query | Cannibalization | Differentiate intents or consolidate; never leave them fighting |
| Was ranking, now sliding | Freshness/competitor | Substantive refresh (real edits, then dateModified), re-verify facts, add the missing subtopic |

**Refresh policy:** dateModified only with substantive edits. Annual pass on
"(2026)" titles each January. Seasonal pages: refresh + internal-link boost
on the calendar's build-by dates, not when the wave arrives.

**Kill/consolidate policy:** don't delete lightly (no 301 setup). A dead page
that overlaps a live target gets retargeted or folded into it. A dead page
with no target just sits — pruning is not currently a lever worth the risk.

**The standing measurement loop:**
- Weekly: `gsc-query.py 7 pages` glance; /cas-admin (organic + "Sent by an
  AI answer" segment).
- Monthly: full striking-distance sweep, iteration tree above, update
  BLOG-OPS-HANDOFF §6 numbers.
- Always: judge by clicks and `purchase_completed`, never impressions —
  and never trust a GSC position you haven't seen on a live SERP.

---

## THE WHOLE PROCESS ON ONE SCREEN

```
CANDIDATE (GSC gap / DFS sweep / competitor gap / season / funnel need)
  ├─ Phase 1: clickstream volume ≥ bar? KD ≤ ceiling? ── no → park/kill
  ├─ Phase 2: live SERP — no AIO chokehold? beatable incumbents? not
  │           cannibalizing ourselves? one-sentence path to top-5? ── no → kill
  ├─ Phase 3: one primary keyword → one page, right TYPE (artifact > hub >
  │           comparison > guide), head term on hub, long-tails on details
  ├─ Phase 4: answer-first content, PAA-driven H2s, honest facts, schema,
  │           2–3 links out, 3–5 contextual links IN at birth
  ├─ Phase 5: unique hero (= og:image), keyword filenames, template alts,
  │           style matched to purpose, S3-diff verification
  ├─ Phase 6: canonical/sitemap/indexable/crawlable/mobile/print checklist
  ├─ Phase 7: build → 3 checkers green → deploy READY → live spot-check →
  │           IndexNow → Pinterest → llms.txt parity → hand to backlink engine
  └─ Phase 8: 28d windows; live-SERP before any CTR diagnosis; iterate by
              the decision tree; refresh seasonally; feed links to 11–20s
```
