# BLOG / SEO CONTENT OPS — COMPLETE RECORD & HANDOFF

**Written 2026-08-27 (Thursday afternoon PDT).** This is the single document a
fresh Claude session needs to run blog/content SEO for faithfulkids.app on its
own: the full history, the machinery, the measured reality, the rules earned
from real mistakes, and the publish runbook. When this file and reality
disagree, reality wins — verify, then fix this file.

Owner: **Cas**. Repo: `FaithfulKidsLandingPage/` (public; git-triggered Vercel
deploys work normally — unlike the private bible-kids repo, where commits must
be authored as dcclxxviicas-Jesus or Vercel silently never deploys).

Sibling documents this file indexes but does not duplicate:
- `../SEO-PLAYBOOK.md` — the Aug 15 full-site audit and fixes
- `../SEO-STEP1-INTERNAL-LINKING.md` — the Aug 25 "SEO reality check" method + findings
- `../BLOG-EXPANSION-BRIEF.md` — Waves 8–13 expansion plan; ITS OWN PROGRESS LOG records per-wave results, collisions, deviations. Read before any further content expansion.
- `../SEO-WORK-LOG.md` — the Aug 26 printables/word-search sprint, item by item
- `backlink-engine/EMAIL-OPS-HANDOFF.md` — the outreach operation (separate session owns it)
- Project `CLAUDE.md` — canonical project instructions; skim CHANGELOG.md newest entries before any work

---

## 1. THE ONE-PARAGRAPH STRATEGIC VERDICT (read this before writing anything)

**Do NOT default to "write more posts."** 528 posts exist; ~130 have zero
recorded impressions, 249 pages get impressions but zero clicks, and the top 5
posts carry ~42% of all blog impressions. The measured ceiling is **authority**
(median position ~10; 62% of impressions parked at position 11+), which the
backlink engine addresses — not this operation. What this operation DOES own:
(a) **artifact pages that rank** (printables, playable games — people search
for the THING, not an article about it), (b) **AEO/answer-engine surfaces**
(llms.txt, /about, answer-first comparison posts), (c) **truthful, consistent
facts sitewide**, (d) internal linking so nothing built is orphaned, and (e)
the conversion layer on existing traffic. New informational posts are the
LAST resort, and only after DataForSEO proves demand and the live SERP shows
no AI Overview squatting on it.

---

## 2. HARD RULES (each one paid for with a real mistake)

1. **ALWAYS use DataForSEO before any keyword/content/title decision** (owner
   mandate, Aug 26). Client: `../niche-research/dfs.py`, creds in
   `../niche-research/.env`. **Google Ads volume is suppressed in this niche —
   always `dataforseo_labs/google/keyword_suggestions/live` with
   `include_clickstream_data: True`, read `clickstream_keyword_info.search_volume`.**
   Reality-check the SERP with `serp/google/organic/live/advanced` before
   committing. GSC is a biased sample (only shows what we already rank for).
   Why the mandate exists: intuition was wrong 3× in one session (homepage
   retargeted at a 3×-smaller term; "bible app for kids" turned out to be
   YouVersion's product name with 8/10 SERP slots; a "strong" pitch term had
   volume 0). **Triangulation rule (Aug 28):** neither vendor column is truth —
   exact-string clickstream is sparse (reads low on mid-tail terms), Ads
   buckets near-variants together (reads high; an analytics plan overstated
   "bible quiz questions" 237× by preferring Ads). Treat clickstream as the
   floor, Ads as the ceiling, and our own GSC impressions at a known live
   position as the arbiter whenever we already rank.
2. **Check for an AI Overview before building for a query.** AIO sits on most
   informational/commercial queries here and eats the clicks (our own
   position-5 exact-match page got 0 clicks from 47 impressions). Artifact
   queries (coloring pages, word searches, printables) are mostly AIO-free —
   that's why they're the priority.
3. **GSC "position" is NOT page position.** GSC said 8.9 for a page the live
   SERP showed at absolute #25 (averaging across variants/devices + SERP
   features above). Never diagnose CTR problems from GSC position alone —
   pull the actual SERP. (This killed a planned title-rewrite sprint that
   would have wasted a week; the "underperforming CTR" was just invisibility.)
4. **A page nothing points at does not rank.** Learned on /bible-trivia (0
   contextual in-links → position 20s), the coloring hub, the word-search hub,
   and 36 printable detail pages. Every new page ships WITH inbound links
   (see the `link-*.py` pattern) or it doesn't ship.
5. **Ship the artifact, not an article about the artifact.** "bible games for
   kids": 4,867-word article failed; playable game works. "bible coloring
   pages": five posts, zero impressions in 90 days; real printable pages rank.
6. **Truth in every count, one number everywhere.** The app has 310 public
   lesson videos → say **"300+" everywhere** (five different counts — 200,
   300+, 400+, 500+, and 670 in outreach — were live simultaneously on Aug 27
   and all got unified). `check-counts.py` derives ground truth from data;
   run it before every deploy; never hardcode a count it can't verify.
7. **Never add `aggregateRating` schema from the hero's "4.9/5"** — that's
   marketing copy, not collected ratings; fake review markup draws manual
   actions. Also: no App Store / Android / native-app claims (browser-only
   today), no trial-length numbers in CTAs ("Start your free trial" — the
   7-day claim went stale once across 212 CTAs).
8. **Never bulk-replace prices in blog content.** $9.99/$69.99/$10.99/$7.99
   etc. are COMPETITORS' prices in comparison posts. **Ours are $12.99/mo and
   $97/yr (~$8.08/mo) since the Aug 31, 2026 reprice, annual has a 3-day
   trial — but read them from `app/api/checkout/route.ts` (`1299` / `9700`),
   never from this line, which is exactly the kind of text that goes stale.**
   Key on context, never bare numbers. `$8.88 / $77.77 / $6.48` are our OLD
   prices and are now forbidden strings enforced by `check-counts.py`.
9. **HTML-entity-decode before measuring title/meta length** (`html.unescape`)
   — `&#x27;` is 6 chars and produced 21 false "too long" failures across
   three separate scripts before the lesson stuck. Metas < 158 chars.
10. **No `#` H1s in post bodies** — the page template's `<h1>` is
    authoritative; `lib/blog.ts` strips a leading body H1 and demotes others
    to h2, but don't rely on it.
11. **Internal links: match relative AND absolute forms** when auditing
    (legacy posts use `https://faithfulkids.app/blog/...`). Never guess a
    slug — three guessed slugs shipped broken before `check-links.py`
    existed. Anchor slug-matching regexes on token boundaries: an unanchored
    `star` matched `how-to-start-family-bible-time`.
12. **Taxonomy:** `lib/guide-categories.ts` `getGuideCategory` is slug-pattern
    matched, FIRST MATCH WINS — order matters. Check every new slug lands in
    the right hub, not the generic "Guides" catch-all.
13. **JSX escape trap:** `title="\u{1F58D}️ ..."` in a double-quoted JSX
    attribute renders the literal backslash text. Real characters in
    attributes; escapes only inside `{'...'}`. (Shipped live once.)
14. **Dropbox build trap:** `"* conflicted copy *"` files inside
    `.next/types/` break the build with `Duplicate identifier 'LayoutProps'`.
    Fix: `find .next -name "*conflicted copy*" -delete` and rebuild.
15. **Image runs:** venv is `~/.fk-venv` (NEVER a scratchpad venv — temp dirs
    get wiped mid-run). **Never pipe image generation to `2>/dev/null`** (hid
    a total failure once). Transient DNS failures can kill 90%+ of a pass —
    multi-pass retry loop + final S3-vs-posts diff is the only trustworthy
    completion check. Never trust the run log.
16. **Coloring/printable images are watermark-managed manually** — the
    generator does NOT watermark; watermark new images separately and never
    re-stamp existing files. Word-search grids are HTML tables, never images
    (crawlability + accessibility). Never gate a printable behind email.
    Printed sheets must carry the URL.
17. **The checkers outrank your memory.** `check-links.py` and
    `check-counts.py` have each caught the author's own same-day regressions.
    Run both + `onpage-audit.py` before every deploy, always.
    (`onpage-audit`'s word-count and homepage-keyword checks are heuristics —
    documented false-positives on printables/non-homepage pages.)
18. **After every content deploy:** `python3 ../ping-indexnow.py`. Sitemap
    submission via API is broken (read-only GSC token, 403) and unnecessary —
    robots.txt advertises the sitemap. The API's `indexed` count is
    deprecated (returns 0 for every site) — never read it as signal.

---

## 3. THE MACHINERY

### Content
- **528 posts** in `content/blog/*.md`: **200 story posts** (type absent;
  have `seriesSlug` + `episode` + `testament/book/age/themes/scripture`) and
  **328 listicles/guides** (`type: "listicle"`). Frontmatter fields (see
  `lib/blog.ts` `BlogPost`): title, slug, type, series, seriesSlug, episode,
  scripture, testament, book, age, themes, metaDescription, keywords[],
  videoUrl, quizAvailable, datePublished, dateModified.
- **Hubs/landing pages:** `/blog` (+ `/blog/topics/[category]` — 16 topic
  hubs), `/bible-stories-for-kids` (primary organic target, "bible stories
  for kids" 1,479/mo), `/bible-trivia` (playable 100-question game + embed
  w/ credit backlink), `/printables` + coloring/word-search/Easter/Christmas
  hubs + 36 detail pages, `/about` (AEO facts page), `/llms.txt` (curated for
  AI crawlers — counts derived at build), `/churches`.
- **Interactive components** (all mirror the app's Duolingo design tokens —
  `--duo-green #16a34a`, 16px radius, `0 4px 0` shadow): `StoryLesson.tsx`
  (200 story posts: video → video-end offer; quiz removed Aug 29), `TriviaGame.tsx`
  (auto-appears on posts with 10+ extractable Q&As, renders directly under
  the intro), `WordSearchGame.tsx` (tap-ends or drag selection),
  `PrintableCta.tsx` (scene-matched episode video via
  `lib/printable-videos.json`), `BlogExitIntent.tsx`, `EmailCaptureCard`
  (leads magnets), `BlogStickyCta` (best-converting mobile CTA; printables
  keep main CTA BELOW the artifact — owner-ratified decision).

### Scripts (repo root unless noted)
| Script | Purpose / usage |
|---|---|
| `check-links.py` | Every internal + markdown + CDN link across built routes. `--cdn` flag. |
| `check-counts.py` | Verifies every stated count in copy against data-derived ground truth (resolves number words too). Scans `app/**/*.tsx`, `app/**/*.ts`, `lib/*.ts`. |
| `onpage-audit.py` | 29 on-page checks vs a built HTML file: `python3 onpage-audit.py .next/server/app/<page>.html`. |
| `link-trivia-game.py`, `link-coloring-pages.py`, `link-word-search.py`, `link-printable-details.py` | Idempotent contextual-inbound-link injectors: varied sentence templates chosen by slug hash, placed before FAQ else end-of-body, one link per post, targets claimed in specificity order. `--dry-run` first, always. This is THE pattern for de-orphaning anything new. |
| `build-word-searches.py` | Generates `lib/word-searches.json` (14×14, 12 words, seeded per slug → deterministic rebuilds). General "bible" puzzle plays ON the hub — NO detail route (cannibalization guard: excluded from generateStaticParams, sitemap, related lists — keep it that way). |
| `build-story-quizzes.py`, `build-trivia-videos.py` | Feed StoryLesson quizzes / trivia data. |
| `fix-trial-cta.py` | The 212-CTA trial-claim fix (historical; pattern reusable). |
| `generate-pinterest-pins.py` | 1000×1500 pins → S3 `pin-images/`; resumable; then regenerate `lib/pin-manifest.json` from S3 (snippet at bottom of script) and commit. |
| `../generate-images-new-posts.py` (project root) | Heroes/inline images, gpt-image-1 (1536×1024), uploads to S3 `blog-images/`. Per-slug SCENES map — ADD topic-specific scenes for new posts. Resumable. `~/.fk-venv/bin/python3`. |
| `../generate-coloring-pages.py`, `../generate-wordsearch-images.py` | Printables art (line art vs watercolor heroes — deliberately different styles). |
| `../ping-indexnow.py` | Bing/ChatGPT instant indexing after deploys. |
| `../gsc-query.py [days] [queries|pages|sites]` | GSC from CLI. |
| `../niche-research/dfs.py` | DataForSEO client (`dfs.post(path, body)`). |

### Distribution & measurement
- **Pinterest auto-publish** (LIVE): 4 RSS feeds `app/pin-feeds/[feed]/route.ts`
  drip pins by calendar; new posts join automatically ONCE they have a hero +
  pin + manifest entry — that 3-step is the ONLY moving part after publishing.
- **Cloud routines**: `growth-engine` (Mon 13:00 UTC, ships content
  autonomously off STRATEGY.md) and `daily-pulse` (daily metrics email) —
  coordinate, don't collide.
- **/cas-admin** dashboard (pw in env `CAS_ADMIN_PASSWORD`): GSC + PostHog +
  Stripe + Supabase; now includes **"Sent by an AI answer"** segment
  (chatgpt/perplexity/copilot/gemini/claude) — the AEO scoreboard.
- **PostHog**: both apps share project 368526, `/ingest` proxy (never remove);
  personal API key in `.env.local` for HogQL. Judge revenue by
  `purchase_completed`, never pageviews.

---

## 4. PUBLISH RUNBOOK

**The full pipeline lives in `RANKING-PROCESS.md` — that file is the core
operating document; read it before building anything.** It covers candidate
sourcing (GSC striking distance / DFS sweeps / competitor gap / seasonal
calendar), the demand and SERP gates, query→page mapping, writing for search,
image SEO, the technical checklist, ship-and-distribute, and the
monitor/iterate decision tree with timelines. The short version below is a
reminder, not a substitute.

### Short version (any new page or post, end to end)

1. **Demand check** (DataForSEO clickstream volume) → **SERP check** (who
   holds page 1? Is there an AI Overview? Are they beatable?) → decide
   artifact vs post vs nothing.
2. Write the content. Frontmatter complete; meta < 158 chars (entity-decoded);
   no body H1; answer-first opening paragraph (LLMs and featured snippets
   quote it); internal links to 2–3 related pages with real anchor text;
   verify every linked slug exists.
3. Taxonomy: confirm `getGuideCategory` routes the slug to the right hub.
4. Images: add a SCENES entry, run `../generate-images-new-posts.py` from
   `~/.fk-venv`, stderr visible, verify against S3 afterward.
5. Inbound links: extend the relevant `link-*.py` (or its pattern) so the new
   page has contextual in-links from day one. `--dry-run`, read the output,
   then apply.
6. `npm run build` (delete Dropbox conflicted copies first if it fails) →
   `check-links.py` → `check-counts.py` → `onpage-audit.py` on the built HTML.
   All three green or you don't ship.
7. Commit (this repo deploys from git normally), verify the deploy went READY,
   spot-check the live URL.
8. `python3 ../ping-indexnow.py`.
9. Pinterest step: hero → `generate-pinterest-pins.py` → regenerate + commit
   `lib/pin-manifest.json`.
10. Log what you did (SEO-WORK-LOG.md or CHANGELOG note) and, if it changed
    strategy, update THIS file.

---

## 5. COMPLETE CHRONOLOGY

**April 2026 — foundation.** 200 story posts (one per app episode, real
`datePublished`), blog templates, series pages, JSON-LD, hero images
(dall-e-3, later gpt-image-1 after retirement). Early guides.

**~Aug 14** — All metas brought under 158 chars (433 posts then).

**Aug 15 — the critical-fix day** (full detail: `SEO-PLAYBOOK.md`):
self-canonicals + own titles for /quiz, /privacy, /terms (all had inherited
the homepage canonical — client pages can't export metadata → route
layout.tsx files); /checkout + /success noindexed; VideoObject schema on 200
story posts switched to real CDN URLs (all HEAD-verified), real dates, no
fabricated duration; duplicate-H1 fix in lib/blog.ts; getRelatedGuides()
replaced a broken empty-seriesSlug match on all guides; sitemap contradictions
fixed. Also: GSC CLI access (`gsc-query.py`) and the PostHog dark-traffic
repair (module-scope init; server-side Stripe events) — pre-Aug-15 analytics
undercount.

**Aug 16** — /bible-trivia game + /embed (credit backlink) + /churches built
and restyled on-brand same day. Pinterest auto-publish set up (4 boards, RSS,
432-pin backlog drip). /cas-admin dashboard built.

**Aug 18** — Historical image backfill DONE: all 473 then-posts CDN
HEAD-verified with hero + inline images.

**Aug 19–20 — Waves 8–13 expansion COMPLETE** (see BLOG-EXPANSION-BRIEF.md
progress log): 52 new posts + 9 extensions (DataForSEO/GSC-driven). Quality
state achieved: zero orphan posts, zero sub-500-word stubs, zero answerless
quiz questions, zero broken internal links, all metas < 158. 16 topic hubs
live. TriviaGame component shipped (~100 pages) and moved directly under
post intros. Two-path quiz funnel. Exit-intent popup. Email lead machine.

**Aug 25 — the SEO reality check** (method + numbers:
`SEO-STEP1-INTERNAL-LINKING.md`): library mostly dead weight (~130 posts zero
impressions; top 5 = 42%); ceiling is authority not content; AI Overviews
eating informational clicks; "bible app for kids" is YouVersion-navigational
— winnable niches are "best/-s" modifiers, "christian app for kids", and the
outgrow/tween angle. Fixed that day: /bible-trivia got 114 contextual
in-links; 212 CTAs' false "7-day trial" claim corrected; 4-post
cannibalization cluster differentiated; homepage retargeted at app-intent
(title/H1) + SoftwareApplication schema added.

**Aug 26 — the printables engine + DataForSEO mandate day** (item detail:
`SEO-WORK-LOG.md`): 26 coloring pages (+Easter/Christmas sets), 11 word
searches (HTML tables, playable via WordSearchGame), per-scene detail pages
(each its own KD-0 keyword), PrintableCta + capture + sticky stack, print CSS,
watermarks/URL-on-page rules, hub inbound-link blitz (12 → 51),
`/bible-stories-for-kids` hub built ("bible stories for kids" 1,479/mo,
winnable SERP), check-links/check-counts/onpage-audit written, biggest find:
**"christmas word search" 14,800/mo KD 0, no AIO** → `/printables/bible-word-search/christmas`.

**Aug 26 (late) — detail-page de-orphaning:** all 36 printable detail pages
had ZERO inbound links; `link-printable-details.py` added 75 one-per-post
contextual links (Christmas word search got 30), `lib/printable-pairs.ts`
cross-linked coloring ↔ word-search ↔ story pages. Verified in BUILT HTML: 0
orphans, median 5 in-links.

**Aug 26–27 — the CTR sprint that was correctly killed:** planned title
rewrites for 249 zero-click pages; live SERP pulls showed GSC positions were
illusory (real positions 15–31, AIOs above) — only ONE query sitewide had
top-5 + ≥15 impressions, and it got 0 clicks under an AIO. Conclusion
recorded: CTR work is gated on authority; don't resurrect this without new
evidence.

**Aug 27 — AEO day:** llms.txt rewritten (had stale "60-second lessons",
"20 series/200 episodes"; now data-derived counts + product/free-resources/
comparisons sections); `/about` facts page built (FAQPage+AboutPage schema,
questions matched to real query shapes like "is there a christian version of
youtube" — 31 imp); homepage FAQ false facts fixed (no native apps; counts;
cadence); lesson-count unified to **300+** everywhere; 6 of 9 comparison-post
openings rewritten answer-first (verdicts their own bodies support,
competitors named honestly); AI-referrer segment added to /cas-admin
(chatgpt.com sent 37 visitors/60d before we could even see it);
check-counts extended to route files. Commits `a34bddf`, `e812950`.

**Aug 28 — the count purge the Aug 27 unification missed** (triggered by the
emails session: /churches was telling outreach clickthroughs "670 episodes"
while the emails said 300+): 670/"67 series" killed on /churches, /printables,
/bible-trivia; "400+ Bible story videos ... Every story is 60 seconds"
boilerplate corrected in ~215 story posts (real: 300+, 2–3.5 min); "500+
narrated video lessons" in two blog templates and "400+ lessons" in layout.tsx
→ 300+; ten blog "free 7-day trial" CTAs + three "Start Your Free Week"
buttons + success-page "7 days" line → 3-day reality. check-counts.py now
derives the app lesson/series count from bible-kids all-series.ts (310 public
lessons / 31 public series), scans content/blog/*.md, forbids the stale
patterns outright, and checks that "N+" floor claims never overpromise —
competitor-attributed numbers ("500+ episodes" = Yippee's) are exempted.
Commit `8653bf9`, deployed READY, live-verified, IndexNow pinged.

**Aug 28 — quiz PDF + youth-games blitz (first plays from the analytics
session's plan, volumes re-verified per rule 1's triangulation):** shipped the
free 50-question quiz PDF (`make-quiz-pdf.py` parses bible-trivia-for-kids.md
→ quiz sheets + answer key, URL on every page, ungated; CloudFront
`printables/bible-quiz-questions-for-kids.pdf`), wired into the ranking post
(retitled "…(PDF)", targets "kids bible quiz questions and answers pdf" —
**the only quiz SERP with NO AI Overview**, we're #12 organic with thin
incumbents: scribd, Pinterest, printables aggregators), teens post,
trivia-pack page, llms.txt. Baseline recorded by analytics: #12, 26 imp/0
clicks/28d. Youth-group cluster: anchors were already correctly
differentiated; real gap was volume — `link-youth-games.py` added 22
contextual in-links to the /blog/youth-group-games hub (12 → 30 linking
posts). Live head-term truth: fun-youth-group-games at organic #20 (GSC 12.2
is variant-averaged). Also fixed: check-links --cdn false positive from RSC
flight-chunk URL fragments; stale "60 seconds/200 more" line in the lead
drip email. Commits `0c9bc20`, `a1612f0`.

**Aug 28 — the false-video-promise fix (owner-flagged):** the mid-article CTA
had interpolated each guide's title into "See {title} in a short narrated video
lesson" on 244 pages where no such video existed (the claim that mis-sold a
real customer). Replaced in two waves: `lib/guide-videos.json` maps **140
guides to a real, topically-matching episode** (validated against story-post
frontmatter, every CDN URL HEAD-verified; builder hard-fails on unknown
slugs — it caught two stale candidates), rendered as a playable PrintableCta.
The other **104 get a rotating flagship sampler** ("Watch a Real Lesson From
the App", slug-hash-picked from `lib/sampler-videos.json`, copy never claims
topical relevance). On review pages (best-of/vs-), `splitContentForCTA` now
seams the demo immediately after the early "Faithful Kids" h2 instead of the
arithmetic middle — it had been playing our demo between competitor entries.
Guard: only an EARLY FK heading triggers this; ~200 guides end with a "Watch
on Faithful Kids" outro h2 that must not attract the split. The PrintableCta
bullet was also unified to "300+ lessons" (said "200 stories" under a "300+"
body). Watch `guide-mid-cta` vs `guide-mid-cta-sampler` in PostHog: if matched
beats sampler, that justifies hand-matching the 104 or making custom videos.

**Aug 28 (later) — plan items 2–4 shipped (commit `96aabcd`):** (a) kids quiz
post: two bonus rounds (25 questions, animals + numbers → 75 on page; PDF
stays at its promised 50 — the generator's section regex excludes Bonus
rounds by design). (b) **/blog/bible-trivia-for-adults** — 50 hard questions
in warm-up/hard/expert rounds, own free PDF (`printables/bible-trivia-for-adults.pdf`),
93 in-links via `link-adult-trivia.py`, teacher-intent CTA → /churches
(priority #4's first live instance). Gates: "bible trivia for adults" cs 204 /
KD 17, "hard bible trivia questions and answers for adults" cs 102 / KD 0;
SERP has AIO but weak mid-page incumbents; printable variants carry real
clickstream. Hero images pre-existed on S3 (an earlier session generated
them). (c) Two commercial posts: **/blog/minno-vs-superbook-vs-yippee**
(captures GSC's pageless "yippee vs minno"/"minno vs angel" queries) and
**/blog/minno-review** (KD 0) — all facts web-verified Aug 28: Minno
$10.99/mo (raised from $9.99) / $69.99/yr / 7-day trial; Superbook app fully
free, ministry-funded, ~68 episodes; Yippee $7.99/$49, founded 2019 (NOT
Phil Vischer), exclusive home of The VeggieTales Show, does NOT carry
What's in the Bible?/Owlegories. **That correction mattered: two live posts
(yippee-tv-vs, best-educational-apps) had Yippee misattributed to Vischer
with Minno's catalog and a wrong $9.99/$99.99 price — all fixed.**
(d) Infrastructure: `getGuideCategory` + llms.txt now route `*-review` slugs
to App Reviews/comparisons; pin manifest regenerated (530). All three
checkers green, deploy READY, live-verified, IndexNow pinged.

**Aug 29 — /bible-trivia directory (owner request, commit `000fcd3`):** the
hub now lists every trivia page below the game — by age (incl. the new adults
page), by format (incl. both PDFs' host pages), by season, and all 66 books
in canonical order (`app/bible-trivia/trivia-directory.ts`; book slugs
derived from names, check-links-verified). Hero now states it is the
whole-Bible general quiz and anchors to the directory. ItemList schema
added. Hub went ~25 → 91 internal links out. Game stays on top (artifact
first, browse after — the printables CTA-placement doctrine).

**Aug 29 — Verse CTA experiment LIVE (commit `d8f39f5`; do not touch the
variables):** scripture pull-quote CTA on every blog post targeting the
funnel's 95% blog→/quiz leak (2,511 of 2,633 visitors lost at that step).
Three NIV verse arms (mark_10_14 / psalm_78_4 / deut_6_6) assigned randomly
per reader and persisted (`fk_verse_cta_variant`); supporting copy, button
("Start your kids' Bible journey →" → /quiz), and placement are CONSTANT for
the life of the test — one variable only. Placement: after the first H2
section on guides (`splitAfterFirstSection`), directly under the game on
trivia posts, first-section-of-body on story posts. Events
`verse_cta_shown` (IntersectionObserver, 50% viewport, once) and
`verse_cta_click`, properties `{variant, post}` — the /cas-admin "Verse CTA
experiment" panel (analytics session, commit `56b110a`) reads them.
Baseline to beat: 5% of blog readers reach /quiz. Per-variant verdict needs
~1,000 impressions/arm (~3 weeks); analytics session watches and reports.
Component: `app/blog/VerseCta.tsx` (client-mounted, no SSR — bot pageviews
never count as impressions).

**Aug 29 (later) — verse CTA v2 + StoryLesson restructure (owner-approved,
shipped before any verse_cta events fired, so the experiment baseline is one
configuration; commit `5185b20`):** verse CTA button → "Start their Bible
journey", supporting copy halved to one sentence; sticky bar now SUPPRESSES
while the verse CTA is on screen (CustomEvent `fk-verse-cta-visibility` from
the verse CTA's observer; suppressed not removed — `blog_sticky_click`
prices the handoff). StoryLesson: the 3-question quiz is GONE from all ~200
story posts — and the "27 opened → 5 answered" cliff that prompted it was a
measurement artifact: the quiz AUTO-OPENED on every video completion, so
`story_lesson_quiz_start` counted completions, not intent (real engagement
~5/55; historical quiz_start data = video-completion proxy). Video end now
renders the offer at peak intent ("Watch more stories like this →" →
/quiz?ref=story-video-end; events `story_lesson_offer_shown/click`
{slug, placement}). Copy says "300+ videos" (not the spec's "200") per the
count-unification rule.

**Sep 3 — homepage hero: owner's pick.** After live-SERP checks killed every
head-term candidate ("bible for kids" = retail+YouVersion at KD 54; "christian
alternative to youtube" = GodTube/Yippee under an AIO, our POST at #6-9 and
the homepage absent; "christian app for kids" = Minno at #1/#2/#4), the
conclusion was recorded: no head keyword is winnable by the homepage at
current authority — hubs carry keywords, the homepage carries brand and
conversion. Cas chose the brand-led hero: H1 "Where kids fall in love with
the Bible" (his own YouTube tagline) + proof-point subtitle. Title tag left
unchanged (keyword-bearing, no churn). Watch signup rate as with any hero
change.

**Sep 3 — the September seasonal sprint (owner: "go"):** three Advent/Christmas
artifacts, all gated (demand + live SERP) before building. (1) **Christmas
Bible trivia PDF** — christmas-bible-trivia.md retitled "(PDF)", 80 questions
(three got their missing refs), new make-quiz-pdf config, file live at CDN
`printables/christmas-bible-trivia.pdf`; SERP has NO AIO and weak incumbents.
(2) **/printables/jesse-tree** — "jesse tree" 3,060/mo cs (KD 19 head with
AIO/knowledge-graph, but the ARTIFACT SERP "jesse tree ornaments printable"
KD 7 has no AIO and small-blog incumbents = the door). 25-day data in
`lib/jesse-tree.json` (single source for page, PDF, and check-counts truth),
25 line-art ornaments + 2 watercolor heroes generated to CDN `jesse-tree/`
(`generate-jesse-tree-ornaments.py`, S3-diff-verified), readings as an HTML
table, FAQPage schema, kit PDF via `make-jesse-pdf.py`. (3)
**/printables/advent-bible-calendar** — 25 readings prophecy→nativity in
`lib/advent-readings.json`, one-sheet PDF, targets the KD-0 "bible advent
calendar"/"advent reading plan" free-printable intent. Both pages: sitemap
entries WITH image lists, llms.txt lines, printables-hub grid cards, and 18
inbound links at birth (`link-advent-pages.py`; watch: "adventures-in-odyssey"
matched an unanchored "advent" prefix — excluded). check-counts gained
derived truths for both sets; first pass of its new claim patterns produced
9 false positives on OTHER products' correct counts (bedtime kit's seven
readings, 30-day challenge's thirty) — patterns are now anchored to our
artifacts' exact phrasing. Seasonal deadline: linked and recrawled well
before mid-October.

**Measured trend across this period (28-day windows):** clicks 118 → 318 →
**759**; impressions 3,047 → 9,780 → **22,556**; avg position 21.9 → 13.3.
Compounding ~2.4×/month with zero ad spend.

---

## 6. CURRENT MEASURED STATE (Aug 27; re-verify monthly with gsc-query.py)

- 528 posts (200 story + 328 guides); 630 built routes; 617 sitemap URLs.
- 28d: 759 clicks / 22,556 impressions / avg pos 13.3.
- Position distribution (90d, pages): 4 pages top-3 · 168 at 4–10 · 148 at
  11–20 (43% of impressions — THE prize, unlocked by authority) · 106 at 21+.
- 249 pages with impressions and zero clicks (mostly AIO/position illusion —
  see Aug 26–27 chronology; not a title problem).
- Conversion reality (28d): 2,657 blog visitors → 23 CTA clicks → ~5 signups
  → 1 purchase. Top queries are Sunday-school-teacher intent; the church
  offer (/churches, free) is the matched offer, underexposed.
- AI referrals (60d): chatgpt.com 72 pv / copilot 29 / claude.ai 1 — now
  tracked in /cas-admin.
- Top pages: bible-trivia-for-teens, bible-trivia-for-kids,
  bible-verses-for-sick-kids, bible-games-for-kids,
  christian-alternatives-to-youtube-for-kids.

---

## 7. PRIORITIES & CALENDAR

1. **Get the printables ranking — hard deadline: "christmas word search"
   (14.8k/mo, KD 0) must rank by early November.** Monitor via
   `gsc-query.py`; if the detail pages aren't indexed/moving within ~2 weeks
   of Aug 26, investigate (they're day-old pages with fresh in-links).
2. **AEO consistency holds**: any new copy states 300+ lessons, browser-only,
   real prices; check-counts guards it. Watch the /cas-admin AI segment;
   expect movement 4–6 weeks after the Aug 27 ships.
3. **Open owner items**: Bing Webmaster Tools registration (10 min, feeds
   ChatGPT search — repeatedly recommended, not yet done); two homepage FAQ
   claims left deliberately for Cas ("Catholic/Evangelical/Non-denominational
   content path during setup" and "reviewed by practicing Christians with
   theological training" — verify or reword; both sit in quotable schema).
4. **Conversion layer** (approved direction, not yet built): route
   teacher-intent traffic (trivia/youth-group/sunday-school pages) toward the
   free-for-churches offer instead of only the family trial.
5. **Pinterest**: keep the 3-step new-post pin flow; fold into growth-engine.
6. **Don't**: resurrect the CTR/title sprint; write informational posts
   without the §2.1–2.3 gates; touch competitor prices; add ratings schema.

---

## 8. COORDINATION & HANDOFF

- **Sessions in flight:** "emails" session owns outreach
  (backlink-engine/EMAIL-OPS-HANDOFF.md). The session that wrote this file
  handled SEO/AEO/app work and the Aditi customer thread. `prospects.json`
  and everything in backlink-engine/ belongs to "emails" — don't write there.
- **Shared-file hazard:** two sessions editing the same JSON/tsv is
  last-writer-wins; coordinate via SendMessage before touching shared state.
- **What you may do without asking Cas:** research, drafts, internal links,
  images for existing posts, verification passes, dashboards, this file's
  upkeep, deploys of content changes that pass all three checkers (this has
  been the working norm — content ships autonomously; growth-engine does the
  same weekly).
- **Ask Cas first:** homepage/conversion copy changes (his positioning; he
  has knowingly kept some social-proof claims), pricing/product claims,
  anything spending money (ads, tools), new outbound channels, deleting
  content, and the two FAQ truth questions in §7.3.
- **Voice:** site copy is warm, plain, never salesy-corporate; emerald-600
  (#059669) design system; emoji sparingly; no em-dash bans here (that's
  email voice), but match existing post style.
- **After every session:** run the checkers if you touched content; update §5
  chronology + §6 numbers here; append significant work to project
  CHANGELOG.md if git won't capture it; `ping-indexnow.py` after deploys.
