"""
MkDocs hook: reader_compat
===========================
Enhances every page with semantic markup and structured data so that
browser Reader Mode (Firefox Reader View, Safari Reader, Chrome Reading
Mode) can reliably detect and extract article content.

Changes applied to the final HTML of each page:

1. Schema.org microdata on ``<article>``
   -  ``itemscope itemtype="https://schema.org/Article"``
   -  ``itemprop="articleBody"``     (strong Readability.js signal)

2. JSON-LD ``<script>`` block in ``<head>`` with Article schema
   populated from page frontmatter (title, description, author,
   date, keywords) and site-level config.

3. ``og:type`` changed from *website* → *article* on content pages.

4. Extra ``<meta>`` tags: ``article:author``, ``article:published_time``,
   ``article:tag``.

All transformations are idempotent and safe if a field is missing.
"""

import json
import re
from datetime import datetime

from mkdocs.config.defaults import MkDocsConfig
from mkdocs.structure.pages import Page


# ---------------------------------------------------------------------------
# helpers
# ---------------------------------------------------------------------------

def _iso_date(raw: str | None) -> str | None:
    """Try to normalise a frontmatter date string to ISO-8601."""
    if not raw:
        return None
    for fmt in ("%Y-%m-%d", "%d %B %Y", "%B %d, %Y", "%Y/%m/%d"):
        try:
            return datetime.strptime(raw.strip(), fmt).date().isoformat()
        except ValueError:
            continue
    return raw.strip()          # fall-back: return as-is


def _meta_tag(prop: str, content: str) -> str:
    safe = content.replace('"', "&quot;")
    return f'<meta property="{prop}" content="{safe}" />'


# ---------------------------------------------------------------------------
# on_post_page — runs on the complete rendered HTML string
# ---------------------------------------------------------------------------

def on_post_page(output: str, *, page: Page, config: MkDocsConfig) -> str:
    """Inject Reader-Mode helpers into the finished HTML."""

    # Skip 404 / empty pages
    if not output or getattr(page, "is_404", False):
        return output

    meta = page.meta or {}
    site_url = (config.get("site_url") or "").rstrip("/")
    page_url = f"{site_url}/{page.url}" if page.url else site_url
    site_name = config.get("site_name") or ""
    site_author = config.get("site_author") or ""
    title = meta.get("title") or page.title or site_name
    description = meta.get("description") or ""

    # ── 1. Schema.org microdata on <article> ──────────────────────────
    output = output.replace(
        '<article class="md-content__inner md-typeset">',
        '<article class="md-content__inner md-typeset"'
        ' itemscope itemtype="https://schema.org/Article">',
        1,
    )

    # ── 2. JSON-LD structured data in <head> ──────────────────────────
    ld: dict = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": title,
        "url": page_url,
        "mainEntityOfPage": {"@type": "WebPage", "@id": page_url},
        "publisher": {
            "@type": "Organization",
            "name": site_name,
        },
    }
    if description:
        ld["description"] = description

    # Author(s) — prefer per-page credits, fall back to site_author
    credits = meta.get("credits")
    if credits and isinstance(credits, list):
        if len(credits) == 1:
            ld["author"] = {"@type": "Person", "name": credits[0]}
        else:
            ld["author"] = [{"@type": "Person", "name": c} for c in credits]
    elif site_author:
        ld["author"] = {"@type": "Organization", "name": site_author}

    # Date
    iso = _iso_date(meta.get("date"))
    if iso:
        ld["datePublished"] = iso

    # Keywords / tags
    tags = meta.get("tags")
    if tags and isinstance(tags, list):
        ld["keywords"] = ", ".join(tags)

    ld_script = (
        '<script type="application/ld+json">'
        + json.dumps(ld, ensure_ascii=False, separators=(",", ":"))
        + "</script>"
    )
    output = output.replace("</head>", f"{ld_script}\n</head>", 1)

    # ── 3. Fix og:type  website → article ─────────────────────────────
    output = re.sub(
        r'<meta\s+property="og:type"\s+content="website"\s*/?>',
        '<meta property="og:type" content="article" />',
        output,
        count=1,
    )

    # ── 4. Extra article:* OG meta tags ───────────────────────────────
    extra_meta: list[str] = []
    if credits and isinstance(credits, list):
        for c in credits:
            extra_meta.append(_meta_tag("article:author", c))
    elif site_author:
        extra_meta.append(_meta_tag("article:author", site_author))

    if iso:
        extra_meta.append(_meta_tag("article:published_time", iso))

    if tags and isinstance(tags, list):
        for t in tags:
            extra_meta.append(_meta_tag("article:tag", t))

    if extra_meta:
        # Insert right after the og:type tag we just set
        og_type_re = r'(<meta\s+property="og:type"\s+content="article"\s*/>)'
        replacement = r"\1\n" + "\n".join(extra_meta)
        output = re.sub(og_type_re, replacement, output, count=1)

    return output
