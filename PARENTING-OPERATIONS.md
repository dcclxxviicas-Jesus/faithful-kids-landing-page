# Parenting — operating guide

The editorial section at **faithfulkids.app/parenting** ("Raising Faithful Kids").
Built 2–3 Nov 2026 on the `parenting` branch. This file is the operator's manual:
how it is put together, how to run it day to day, how it was tested, and what
remains before launch. Content authoring rules live in `content/parenting/README.md`;
commissioning ideas in `PARENTING-EDITORIAL-BACKLOG.md`.

---

## 1. Architecture

**Reused, not rebuilt.** The section is the existing site with one more lane:

| Concern | How it works | Reused from |
|---|---|---|
| Articles, authors | Markdown + frontmatter in `content/parenting/` and `content/parenting/authors/`, read at build time by `lib/parenting.ts` | The blog's content model; the blog's Markdown renderer (`markdownToHtml`, now exported from `lib/blog.ts`) |
| Public pages | `app/parenting/` — home, `[slug]` (serves both category pages and articles), `authors/[slug]`, `write-for-us`, `about`, `editorial-policy`, `submission-guidelines`, `preview/[slug]`, `news-sitemap.xml`; `app/parenting-md/[slug]` serves the Markdown edition at `/parenting/<slug>.md` | `SiteNav`/`SiteFooter`, Nunito, the green, the static-generation setup, the `.md` parity pattern |
| Styling | `app/parenting/parenting.css`, every rule scoped under `.pt`; Newsreader (serif) loaded once in `app/parenting/layout.tsx` for headlines and long-form body | Design tokens and button language; nothing added to `globals.css` |
| Pitches, outreach, newsletter | Three Supabase tables (`supabase-parenting-migration.sql`), accessed only from server routes via `lib/parenting-db.ts` (PostgREST, service key, RLS on with no policies) | The `leads`/`contracts` pattern |
| Email | `lib/parenting-emails.ts` over Resend REST; contributor mail from Christian's monitored inbox, newsletter confirmation from the brand | The existing sender split and `List-Unsubscribe` convention |
| Admin | `/cas-admin/parenting` + `/api/parenting/admin`; password header checked server-side; also sets a 12-hour httpOnly cookie that unlocks draft previews | The `/cas-admin` gate and the contracts desk's UI |
| SEO | Article/OpinionNewsArticle/NewsArticle/ScholarlyArticle JSON-LD with a Person author, BreadcrumbList, CollectionPage hubs, ProfilePage authors, canonicals, OG/Twitter, sitemap entries, llms.txt section, Google News sitemap, generated OG card for pages without a photo | `app/sitemap.ts`, `app/llms.txt`, `robots.txt` |
| Analytics | PostHog events `parenting_newsletter_shown/_submitted`, `parenting_pitch_submitted`, `parenting_share`; pageviews via the existing provider | `providers.tsx` |

**Why articles are files and not database rows.** The whole site publishes through git; the checkers (`check-links.py`, `check-counts.py`), llms.txt, the sitemap and the Markdown edition all read files at build time. A database-backed editor would be a second content system for one operator who already publishes this way. The admin desk shows article status and previews; it does not replace the repo.

**Article URL.** `/parenting/<slug>` (the brief allowed simplifying `/parenting/articles/<slug>`). Category names and other routes are reserved; the loader refuses an article whose slug collides.

**New dependencies: none.** `next/og` and `next/font` ship with Next.

### Visibility rules (the important part)

| `status` | Public? | Notes |
|---|---|---|
| `published` | yes, once `datePublished` ≤ today | In sitemap, llms.txt, section pages, author page |
| `scheduled` | same rule | The site must be redeployed on/after the date (static build) |
| `draft` | never | Preview only, with the admin cookie |
| `sample` | dev and Vercel **preview** deployments only | Visible ribbon, `noindex`, excluded from sitemap/llms.txt; **never in production** (`VERCEL_ENV=production` hides them; `PARENTING_SAMPLES=0` hides them anywhere) |

Unpublished content is access-controlled, not merely unlinked: drafts are not emitted by the static build at all, and the preview route 404s without the cookie.

---

## 2. Day to day

### Create an article
1. Copy the frontmatter block from `content/parenting/README.md` into `content/parenting/<slug>.md`. `slug` must equal the filename.
2. `type` is one of `story | opinion | interview | news | research`; `author` is a slug from `authors/`; `status: "draft"` while you work.
3. Body in Markdown, no `#` H1, `![alt](src "Caption")` for captioned figures, `> quote` for a pull quote, `**Faithful Kids:** / **Name:**` paragraphs for interview Q&A.
4. Hero image: licensed or supplied, uploaded to the CDN (`parenting/<slug>.webp` via `s3-put.py`), `imageAlt` and `imageCredit` set. The hero is also the social card.
5. Preview: log in at `/cas-admin/parenting` once, then open `/parenting/preview/<slug>`.

### Edit an article
Edit the file. Bump `dateModified` only for substantive changes; add a dated correction note at the end for corrections (editorial policy §10).

### Publish an article
Set `status: "published"` and `datePublished`, run the checks below, commit, push, verify the Vercel deploy went READY (never assume), spot-check the live URL, then `python3 ../ping-indexnow.py`. For a real news item also make sure `/parenting/news-sitemap.xml` has been submitted in Search Console once.

### Unpublish
Set `status: "draft"` (or delete the file), redeploy. There is no 301 infrastructure; never change a slug after publication.

### Feature an article
`featured: true`. The newest featured article leads the homepage; with none flagged, the newest article does.

### Review a contributor pitch
`/cas-admin/parenting` → Pitches. Click a row to read it. Change status through the workflow (Received → Under review → Accepted → Drafting → Editing → Awaiting approval → Scheduled → Published; Declined / Withdrawn / Archived close it). Notes are private and append-only with a timestamp. Reply to the contributor from your own mail client (the row has a mailto link); the desk never emails anyone.

### Accept or decline
Set the status. When the contributor confirms in writing that a specific piece may be published, press **Record consent** and note how it was given. Link the pitch to the article file and author file once they exist so the record is complete.

### Manage an author profile
`content/parenting/authors/<slug>.md`. A public author page exists only when the author has at least one public article. `status: "hidden"` keeps the file but removes the page. `pseudonym: true` shows a disclosed pen-name note. Only list `sameAs`/links the person has verified.

### Use the outreach tracker
`/cas-admin/parenting` → Outreach. Add contacts by hand (name, organization, email, role, relationship source, suggested topic). Status: Not contacted → Contacted → Interested → Pitched → Accepted → Published, plus Declined and Do not contact. "Mark contacted today" stamps `last_contact_at`; set a next follow-up date and filter by "Follow-up due". Nothing is imported, nothing is emailed, and contacts never become newsletter subscribers.

### Newsletter signup
Forms on the Parenting home and under every article post to `/api/parenting/newsletter`. A row is `pending` until the person clicks the confirmation email; `/cas-admin/parenting` → Newsletter shows counts and recent rows. **No sending tool exists yet.** When one is built it must read `newsletter_subscribers` where `status = 'confirmed'` only, and every issue must carry the unsubscribe link from `newsletterUnsubscribeUrl()`.

### Update categories or tags
`SECTIONS` and `TAGS` in `lib/parenting.ts`. Category pages, nav, sitemap and schema all derive from `SECTIONS`; a category page only exists once it has an article.

### Before every deploy
```
cd FaithfulKidsLandingPage
npm run build                      # delete Dropbox "conflicted copy" files under .next first if it fails
python3 check-counts.py
python3 check-links.py --cdn
PW=~/.fk-pw/node_modules node tests/parenting.e2e.mjs http://localhost:3077   # against `next start -p 3077`
```

---

## 3. Testing report (3 Nov 2026, worktree `/Users/cas/fk-parenting`, production build served locally)

`tests/parenting.e2e.mjs` (Playwright 1.62, Chromium) ran against `next start` with sample content enabled and email sending disabled (`PARENTING_EMAIL_LIVE=0`). Screenshots in `tests/screenshots/` (gitignored).

| Area | Result |
|---|---|
| Parenting home: 200, approved H1, nav item, CollectionPage + Breadcrumb schema, canonical | pass |
| Mobile home: no horizontal overflow, Parenting in the mobile menu | pass |
| Article: one H1, Person author in schema, dates, og:type article, share row, Markdown alternate, sample ribbon + noindex on samples | pass |
| Article mobile: no overflow | pass |
| Markdown edition served as `text/markdown` with canonical Link header | pass |
| Section page renders when populated; reserved slug 404s | pass |
| Author page: ProfilePage/Person schema, article list | pass |
| Write for us: client validation messages, focus moves to the first invalid field, controls keyboard-reachable, mobile no overflow | pass (after a fix: focus must target the field id, not the error class, because state has not re-rendered yet) |
| About / Editorial policy / Submission guidelines: one H1, self-canonical | pass |
| sitemap.xml lists Parenting pages and no samples or previews; news sitemap valid XML; llms.txt section present; robots blocks `/parenting/preview/` | pass |
| OG image route returns PNG | pass |
| Pitch API: field-level 400s, honeypot and sub-4s submits swallowed, over-long input bounded, valid pitch accepted | pass; **persistence returned 503 "not configured"** because the Supabase tables do not exist yet (see §4) |
| Newsletter API: invalid email 400; valid email 503 pre-migration; bad confirm/unsubscribe tokens rejected | pass |
| Preview without cookie → 404 | pass |
| Admin API: 401 with no / wrong password on GET and POST | pass |
| Admin desk: login, tabs, articles listed, preview cookie unlocks preview | pass |
| Admin pitch workflow and outreach CRUD | **skipped** until the tables exist (the test runs them automatically once they do) |
| Regression: `/`, `/blog`, a blog post, `/printables`, `/bible-stories-for-kids`, `/quiz`, `/pricing` all 200 with chrome intact | pass |
| `check-counts.py` | CLEAN |
| `check-links.py` | CLEAN (806 built routes, 0 broken) |
| `tsc --noEmit` | clean |

Not tested: real email delivery (deliberately disabled locally), the Pinterest/newsletter distribution of a real article, Google News acceptance (not controllable).

---

## 4. Launch checklist

**Must do before production**
- [ ] Run `supabase-parenting-migration.sql` once in the Supabase SQL editor (creates `parenting_submissions`, `parenting_outreach`, `newsletter_subscribers`). Then rerun the e2e suite; the pitch persistence and desk CRUD checks will go green.
- [ ] Decide on sample content: it is already invisible in production, but delete `content/parenting/sample-*.md` and `authors/sample-contributor.md` once the first real article exists so the preview deployments stop showing placeholders.
- [ ] At least one real, approved article with a real author file, or launch the section with the empty state and the Write-for-us page live (it works without articles).
- [ ] Send a test pitch on the preview deployment and confirm the editor notification and the receipt arrive (production sends; local runs do not).
- [ ] Legal review of `/parenting/submission-guidelines` terms (marked "prepared for legal review" on the page) and the privacy policy line about contributor data.
- [ ] Merge `parenting` → `main`, trigger the Vercel deploy explicitly and compare the deployed SHA (CLAUDE.md: deploys do not always happen), then `python3 ping-indexnow.py`.

**Should do soon after**
- [ ] Submit `https://faithfulkids.app/parenting/news-sitemap.xml` in Search Console when the first real news piece exists.
- [ ] Add `parenting_*` events to the `/cas-admin` stats page or a PostHog dashboard (visitors, newsletter submits, pitches, returning readers).
- [ ] Decide the newsletter sending tool (Resend broadcast vs a cron route). Until then subscribers accumulate with consent recorded and nothing is sent.
- [ ] Author photos: upload to the CDN under `parenting/authors/` and set `photo` in the author file; initials render until then.
- [ ] Add the contributor "write for us" line to creator follow-up emails and `/creators` (CONTRIBUTOR-BLOG-PLAN.md).

**Security notes**
- Admin password is compared with a constant-time check; the preview cookie is an HMAC keyed by `DRIP_SECRET` and expires in 12 hours. Rotating either secret logs every editor out.
- No contributor or subscriber data is readable without the admin password; the public API routes only write. IPs are stored as a daily salted hash, never raw.
- `PARENTING_EMAIL_LIVE=0` is the hard off switch for mail in any environment; in `next dev` nothing sends by default.

---

## 5. State and gotchas (3 Nov 2026, after launch)

**Live:** main `96b8905`, production deploy SHA-verified. Three founder essays public (featured: taking-the-screen-away-is-not-a-plan). Desk working on production; Supabase tables created by Cas on 2 Nov; pitch + receipt + newsletter-confirm emails verified arriving in christian@. One test pitch is archived in the desk; one pending newsletter row is Cas's own address awaiting his confirm click.

**Drafts, deliberately unpublished:** four pieces under bylines Cas supplied (Mark Antonio, Zach Thomas, Teresa Marie ×2), backdated 24–30 Oct, with placeholder author bios. Publishing them requires Cas to confirm the authors are real people who approve the text (then: fill the author file, `status: "published"`, build, deploy), or to recast them as disclosed pen names or his own byline. The editorial policy page promises real bylines; do not publish around it.

**House style from Cas:** no em-dashes anywhere in articles; intriguing titles; well written. `grep -c "—" content/parenting/*.md` before committing.

**Gotchas hit while building:**
- `next build` sometimes fails inside `next/font` (`TypeError: Cannot read properties of null (reading '1')`) on Baloo_2 or Newsreader. It is a transient Google Fonts fetch; rebuilding fixes it. Do not "fix" the fonts.
- `check-links.py --cdn` printing `CDN assets referenced: 0` means the build it scanned was incomplete; rerun after a good build.
- `next start` runs with NODE_ENV=production and therefore SENDS mail. Always `PARENTING_EMAIL_LIVE=0 next start -p 3077` for local testing.
- Routes that read `content/parenting` at request time (`/api/parenting/admin`, `/parenting/preview/[slug]`) need `outputFileTracingIncludes` in next.config.js (added) or they return empty/404 on Vercel.
- Pexels image URLs occasionally reset the connection on upload via `s3-put.py`; retry.
- The Dropbox checkout of the landing repo is shared by many sessions; Parenting work happens in the worktree `/Users/cas/fk-parenting` (branch `parenting`, node_modules symlinked). Merge to main with `git push origin parenting:main` after `git merge origin/main`, never from the Dropbox tree.

**Pending:** authors' confirmation for the four drafts; legal read of the submission terms; a newsletter sender (confirmed rows only); `parenting_*` events on a dashboard; worker2's nav change (For Parents leaves the top nav, /blog to the footer) which touches `app/parenting/about/page.tsx`.

---

## 6. Operating rules (Cas, 3 Nov 2026)

Two workstreams share the site. **Agent 1 (blogs+seo)** owns `/blog`, keyword research and evergreen resources. **Agent 2 (parenting)** owns `/parenting`, the editorial articles, contributor submissions, author profiles, editorial workflow and the Parenting newsletter. Rules that bind this lane:

- Never modify `/blog` content or routes; when an evergreen guide is the right answer, hand the idea to blogs+seo. When a Parenting piece needs to point at a resource, link the original URL, never copy it.
- Agent 1 may recommend SEO changes to Parenting content; this lane implements them.
- Shared components (nav, footer, `lib/blog.ts`, `sitemap.ts`, `llms.txt`, analytics, checkers) are changed only after inspecting the current implementation and coordinating ownership; sitewide navigation and production deploys need coordinated review.
- Keep working in the worktree `/Users/cas/fk-parenting` on branch `parenting`; merge to main only with Cas's approval.
- No new CMS, auth, renderer or email system; no unapproved publishing; new dependencies and database changes stay minimal and documented here.
- One taxonomy, canonical policy, analytics framework and brand standard across both lanes.
- End every session with a handoff: completed work, affected files and routes, tests, outstanding issues, next priorities.
- The shared objective is qualified traffic, engagement, trust and customers, not content volume.
