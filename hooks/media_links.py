"""
MkDocs hook: media_links
=========================
Rewrites ``media:path`` references in rendered HTML to the external media
repository URL served via Cloudflare Pages.

Supports ``<img src="media:...">`` and ``<a href="media:...">``.
``media:video/`` references inside ``<img>`` tags are converted to ``<video>``.
When alt text is present, embeds are wrapped in ``<figure>/<figcaption>``.

Runs on ``on_page_content`` (after markdown→HTML, before template rendering)
so the regex matches against ``src=`` / ``href=`` attributes rather than raw
markdown — avoids edge cases with markdown parsers rewriting link syntax.
"""

import re
from markupsafe import escape as _esc

_MEDIA_BASE = "https://ultrabroken-media.gl1tchcr4vt.workers.dev"

# Match <img> tags whose src starts with media:video/ or media:image/
_MEDIA_IMG_RE = re.compile(
    r'<img\b(?P<pre>[^>]*)src=(?P<q>["\'])media:(?P<kind>video|image)/(?P<path>[^"\'\s>]+)(?P=q)(?P<post>[^>]*)/?>'
    , re.IGNORECASE
)
_ALT_ATTR = re.compile(r'alt=["\']([^"\']*)["\']', re.IGNORECASE)

# Match remaining src="media:..." or href="media:..." (e.g. <a> links)
_ATTR_RE = re.compile(
    r'((?:src|href)=["\'])media:([^"\'\s>]+)(["\'])'
)


def _figwrap(inner, caption):
    """Wrap element in <figure>/<figcaption> if caption is non-empty."""
    if not caption:
        return inner
    return f'<figure class="media-embed">{inner}<figcaption>{_esc(caption)}</figcaption></figure>'


def _media_img_rewrite(m):
    """Convert <img src="media:video/..."> to <video>, or rewrite image src.
    Wraps in <figure> when alt text is present."""
    kind = m.group('kind').lower()
    path = m.group('path').lstrip('/')
    alt_m = _ALT_ATTR.search(m.group('pre') + m.group('post'))
    alt = alt_m.group(1) if alt_m else ''
    url = f"{_MEDIA_BASE}/{kind}/{path}"

    if kind == 'video':
        embed = f'<video controls src="{url}"></video>'
    else:
        embed = f'<img alt="{_esc(alt)}" src="{url}" />'

    return _figwrap(embed, alt)


def _attr_rewrite(m):
    prefix = m.group(1)          # e.g. src="
    path = m.group(2).lstrip("/")
    suffix = m.group(3)          # closing quote
    return f"{prefix}{_MEDIA_BASE}/{path}{suffix}"


def on_page_content(html, page, config, files, **kwargs):
    """Rewrite media: prefixed URLs, converting video <img> to <video>."""
    html = _MEDIA_IMG_RE.sub(_media_img_rewrite, html)
    html = _ATTR_RE.sub(_attr_rewrite, html)
    return html
