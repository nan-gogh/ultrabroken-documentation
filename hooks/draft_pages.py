"""
MkDocs hook: draft_pages
=========================
Hides work-in-progress pages from all discovery systems while still
building them into the live site so editors can preview rendered output.

A page is considered a draft when EITHER condition is true:
  1. It lives under the ``_wip/`` directory (path-based).
  2. Its frontmatter contains ``draft: true`` (flag-based).

Draft pages are:
  - Excluded from Material search (``search.exclude`` meta).
  - Marked ``noindex`` for web crawlers.
  - Tagged with a visible "DRAFT" banner via a ``ub-draft`` body class.

Draft pages are NOT hidden from the navigation or direct URL access —
editors share the link via Discord to gather feedback.

A separate ``unlisted: true`` frontmatter flag marks pages as permanently
published but hidden from AI evidence and the grimoire.  Unlike drafts,
unlisted pages are still findable in site search, get no banner, no
noindex, and still receive social card / OG tag generation.
"""

import re

_WIP_PREFIX = re.compile(r"(^|[\\/])_wip[\\/]")


def _is_draft(page) -> bool:
    """Return True when the page should be treated as a draft."""
    meta = page.meta or {}
    if meta.get("draft") is True:
        return True
    src = page.file.src_path.replace("\\", "/")
    return "/_wip/" in src or src.startswith("_wip/")


def _is_unlisted(page) -> bool:
    """Return True for permanently published pages excluded from discovery."""
    return (page.meta or {}).get("unlisted") is True


def on_page_markdown(markdown, page, config, **kwargs):
    """Inject search.exclude into draft page metadata so
    Material's search plugin skips them entirely.  Unlisted pages
    remain searchable — they are only excluded from AI evidence
    and the grimoire.  This event fires after frontmatter is parsed
    but before the search plugin indexes."""
    if _is_draft(page):
        page.meta.setdefault("search", {})["exclude"] = True
    return markdown


def on_post_page(output, page, config, **kwargs):
    """Inject noindex meta tag and a draft body class for styling."""
    if not _is_draft(page):
        return output

    # 1. Add <meta name="robots" content="noindex"> before </head>
    if 'name="robots"' not in output:
        output = output.replace(
            "</head>",
            '    <meta name="robots" content="noindex">\n  </head>',
            1,
        )

    # 2. Add ub-draft class to <body> for optional CSS banner styling
    output = re.sub(
        r"<body([^>]*)>",
        lambda m: f'<body{m.group(1)} data-ub-draft="true">',
        output,
        count=1,
    )

    return output
