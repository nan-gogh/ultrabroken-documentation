"""
MkDocs hook: media_links
=========================
Rewrites ``media:path`` references in rendered HTML to the external media
repository URL served via Cloudflare Pages.

Supports both ``<img src="media:...">`` and ``<a href="media:...">``.

Runs on ``on_page_content`` (after markdown→HTML, before template rendering)
so the regex matches against ``src=`` / ``href=`` attributes rather than raw
markdown — avoids edge cases with markdown parsers rewriting link syntax.
"""

import re

_MEDIA_BASE = "https://ultrabroken-media.gl1tchcr4vt.workers.dev"

# Match src="media:..." or href="media:..." (single or double quotes)
_ATTR_RE = re.compile(
    r'((?:src|href)=["\'])media:([^"\'\s>]+)(["\'])'
)


def _rewrite(m):
    prefix = m.group(1)          # e.g. src="
    path = m.group(2).lstrip("/")
    suffix = m.group(3)          # closing quote
    return f"{prefix}{_MEDIA_BASE}/{path}{suffix}"


def on_page_content(html, page, config, files, **kwargs):
    """Rewrite media: prefixed URLs in rendered HTML to full media repo URLs."""
    return _ATTR_RE.sub(_rewrite, html)
