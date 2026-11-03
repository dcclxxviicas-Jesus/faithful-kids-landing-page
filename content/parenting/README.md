# Parenting: how to publish

Articles are Markdown files in this folder; contributor profiles live in `authors/`.
The site reads them at build time. Publishing = commit + deploy, same as the blog.

## Article frontmatter

```yaml
---
title: "What I Learned Reading the Bible With My Children Every Night"
subtitle: "Three years, one chapter a night, and a lot of interruptions."   # the dek, optional
slug: "reading-the-bible-every-night"      # must equal the filename
type: "story"                              # story | opinion | interview | news | research
tags: ["Faith at Home", "Family Bible Study"]   # from TAGS in lib/parenting.ts
author: "jane-doe"                         # authors/jane-doe.md must exist
editor: "christian-alexander"              # optional
interviewee: "Pastor Sam Lee, Grace Church"  # interviews only, optional
status: "draft"                            # published | scheduled | draft | sample
datePublished: "2026-11-15"
dateModified: "2026-11-15"                 # bump only on substantive edits
excerpt: "One or two sentences for cards and the section pages."
metaDescription: "Under 158 characters. Defaults to the excerpt."
seoTitle: "Optional shorter SERP title"
image: "https://d3g07v1w0lehiv.cloudfront.net/parenting/reading-the-bible-every-night.webp"
imageAlt: "A father and two children on a couch with an open Bible"
imageCaption: "Optional caption shown under the hero."
imageCredit: "Photo: Jane Doe"             # required for any third-party or licensed image
imageCreditUrl: "https://..."
featured: false                            # newest featured article leads the homepage
canonical: ""                              # only for a reprint first published elsewhere
sources:
  - "Barna, Children's Ministry Report 2026 | https://www.barna.com/..."
resources:
  - "Noah's Ark video lesson | /blog/noahs-ark-for-kids"
disclosure: "The author's church uses Faithful Kids through the free church program."
---
```

Body rules: no `#` H1 (the template renders the title), headings start at `##`,
`![alt](src "Caption")` renders a captioned figure, `> quote` renders a pull quote.

## Status

| status | public? | where to see it |
|---|---|---|
| `published` | yes, once `datePublished` has passed | `/parenting/<slug>` |
| `scheduled` | same rule; the site must be redeployed on or after the date | `/parenting/preview/<slug>` until then |
| `draft` | never | `/parenting/preview/<slug>` (admin cookie, set from /cas-admin/parenting) |
| `sample` | dev + Vercel preview only, never production | labelled with a ribbon |

## Authors (`authors/<slug>.md`)

```yaml
---
name: "Jane Doe"
slug: "jane-doe"
role: "Homeschool mother of four"
affiliation: "Grace Fellowship, Austin, Texas"
photo: "https://d3g07v1w0lehiv.cloudfront.net/parenting/authors/jane-doe.webp"   # approved by the author
website: "https://janedoe.com"
links: ["Instagram | https://instagram.com/...", "Newsletter | https://..."]
sameAs: ["https://instagram.com/..."]      # verified profiles only
pseudonym: false                           # true = disclosed pen name, real identity held by the editor
disclosure: ""
status: "active"                           # hidden = keep the file, drop the public page
---
Two to four sentences of biography, in the third person, every claim checkable.
```

## Before you publish

1. Written permission from the author is recorded in the submission (admin desk).
2. Every Scripture reference and factual claim checked; sources listed.
3. Images licensed, credited, and never implying they show the author or their family unless they do.
4. No identifiable child's private information without the parent's written authorization.
5. `npm run build`, `python3 check-links.py`, `python3 check-counts.py`, then deploy, then `python3 ../ping-indexnow.py`.
