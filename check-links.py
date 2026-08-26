#!/usr/bin/env python3
"""Verify every internal link on the built site actually resolves.

Written after three separate cases of a guessed slug shipping: two story links
on the coloring pages (the-first-christmas-for-kids, jesus-calms-the-storm-for-kids)
and a mis-derived CDN path. Assuming a slug exists is how broken links ship.

Checks:
  - every href="/..." in the built HTML resolves to a built route
  - every markdown [text](/blog/slug) in content resolves to a real post
  - optionally (--cdn) HEAD-checks every CloudFront asset referenced

Usage:
  python3 check-links.py
  python3 check-links.py --cdn
"""
import argparse
import glob
import os
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
BUILD = HERE / ".next" / "server" / "app"
BLOG = HERE / "content" / "blog"

# Routes that exist but are not emitted as .html (redirects, api, dynamic)
ALLOW = {
    "/", "/quiz", "/checkout", "/success", "/activate", "/subscribe",
    "/cas-admin", "/embed/bible-trivia",
}
SKIP_PREFIX = ("/api/", "/_next/", "/ingest/")
ASSET_RE = re.compile(r"\.(png|jpe?g|webp|svg|ico|pdf|mp4|vtt|xml|txt|css|js)$", re.I)


def built_routes():
    routes = set()
    for p in glob.glob(str(BUILD / "**" / "*.html"), recursive=True):
        rel = os.path.relpath(p, BUILD)[:-5]
        rel = "/" + rel
        if rel.endswith("/index"):
            rel = rel[:-6] or "/"
        routes.add(rel)
    # public/ files are served at the root
    for p in glob.glob(str(HERE / "public" / "**" / "*"), recursive=True):
        if os.path.isfile(p):
            routes.add("/" + os.path.relpath(p, HERE / "public"))
    return routes


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--cdn", action="store_true", help="also HEAD-check CloudFront assets")
    args = ap.parse_args()

    routes = built_routes()
    print(f"built routes: {len(routes)}")

    # ---- 1. internal hrefs in rendered HTML ----
    broken = {}
    pages = glob.glob(str(BUILD / "**" / "*.html"), recursive=True)
    for p in pages:
        src = "/" + os.path.relpath(p, BUILD)[:-5]
        try:
            html = Path(p).read_text(errors="replace")
        except FileNotFoundError:
            continue   # a concurrent build can remove files mid-scan
        for href in set(re.findall(r'href="(/[^"#?]*)', html)):
            if href.startswith(SKIP_PREFIX) or href in ALLOW or ASSET_RE.search(href):
                continue
            clean = href.rstrip("/") or "/"
            if clean in routes or href in routes:
                continue
            broken.setdefault(href, set()).add(src)

    print(f"\ninternal hrefs that resolve to nothing: {len(broken)}")
    for href, srcs in sorted(broken.items())[:25]:
        print(f"  {href}")
        for s in list(srcs)[:2]:
            print(f"       on {s}")

    # ---- 2. markdown links to blog posts ----
    slugs = {p.stem for p in BLOG.glob("*.md")}
    md_broken = {}
    for p in BLOG.glob("*.md"):
        for m in re.findall(r"\]\((?:https://faithfulkids\.app)?/blog/([a-z0-9-]+)\)", p.read_text()):
            if m not in slugs:
                md_broken.setdefault(m, set()).add(p.stem)

    print(f"\nmarkdown /blog/ links to posts that do not exist: {len(md_broken)}")
    for slug, srcs in sorted(md_broken.items())[:25]:
        print(f"  /blog/{slug}   linked from {', '.join(list(srcs)[:3])}")

    # ---- 3. CDN assets ----
    cdn_broken = []
    if args.cdn:
        import urllib.request
        from concurrent.futures import ThreadPoolExecutor
        urls = set()
        for p in pages:
            try:
                body = Path(p).read_text(errors="replace")
            except FileNotFoundError:
                continue
            # Exclude backslashes: React's flight payload JSON-escapes quotes, so a
            # naive match swallows the trailing \ and every URL 403s.
            urls |= set(re.findall(r'https://d3g07v1w0lehiv\.cloudfront\.net/[^\s"\'<>)\\]+', body))

        def head(u):
            try:
                r = urllib.request.Request(u, method="HEAD")
                with urllib.request.urlopen(r, timeout=25) as x:
                    return u, x.status
            except Exception as e:
                return u, getattr(e, "code", 0)

        with ThreadPoolExecutor(24) as ex:
            for u, st in ex.map(head, sorted(urls)):
                if st != 200:
                    cdn_broken.append((st, u))
        print(f"\nCDN assets referenced: {len(urls)}   not returning 200: {len(cdn_broken)}")
        for st, u in cdn_broken[:20]:
            print(f"  {st}  {u}")

    total = len(broken) + len(md_broken) + len(cdn_broken)
    print(f"\n{'CLEAN — every link resolves' if total == 0 else f'{total} PROBLEMS'}")
    sys.exit(1 if total else 0)


if __name__ == "__main__":
    main()
