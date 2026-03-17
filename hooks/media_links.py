"""
MkDocs hook: media_links
=========================
Rewrites ``media:path`` references in rendered HTML to the external media
repository URL served via Cloudflare Pages.

Supports ``<img src="media:...">`` and ``<a href="media:...">``.
``media:video/`` references inside ``<img>`` tags are converted to ``<video>``.

Runs on ``on_page_content`` (after markdown→HTML, before template rendering)
so the regex matches against ``src=`` / ``href=`` attributes rather than raw
markdown — avoids edge cases with markdown parsers rewriting link syntax.
"""

import re

_MEDIA_BASE = "https://ultrabroken-media.gl1tchcr4vt.workers.dev"

# Match an <img> whose src starts with media:video/
_VIDEO_IMG_RE = re.compile(
    r'<img\b(?P<pre>[^>]*)src=(?P<q>["\'])media:video/(?P<path>[^"\'\s>]+)(?P=q)(?P<post>[^>]*)/?>'
    , re.IGNORECASE
)
_ALT_ATTR = re.compile(r'alt=["\']([^"\']*)["\']', re.IGNORECASE)

# Match src="media:..." or href="media:..." (single or double quotes)
_ATTR_RE = re.compile(
    r'((?:src|href)=["\'])media:([^"\'\s>]+)(["\'])'
)


def _video_rewrite(m):
    """Convert <img src="media:video/..."> to <video>."""
    path = m.group('path').lstrip('/')
    alt_m = _ALT_ATTR.search(m.group('pre') + m.group('post'))
    alt = alt_m.group(1) if alt_m else ''
    return f'<video controls src="{_MEDIA_BASE}/video/{path}">{alt}</video>'


def _attr_rewrite(m):
    prefix = m.group(1)          # e.g. src="
    path = m.group(2).lstrip("/")
    suffix = m.group(3)          # closing quote
    return f"{prefix}{_MEDIA_BASE}/{path}{suffix}"


def on_page_content(html, page, config, files, **kwargs):
    """Rewrite media: prefixed URLs, converting video <img> to <video>."""
    html = _VIDEO_IMG_RE.sub(_video_rewrite, html)
    html = _ATTR_RE.sub(_attr_rewrite, html)
    return html
