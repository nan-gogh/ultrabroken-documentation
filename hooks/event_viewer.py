"""
MkDocs hook: event_viewer
=========================
Converts shorthand event viewer links into embedded restite.org iframes.

Shorthand syntax — ev: prefix on the href, rest is positional parameters:
    [Label](ev:BreakawayFromSage)
    [Label](ev:BreakawayFromSage, BreakawayFromSage3)
    [Label](ev:BreakawayFromSage, BreakawayFromSage3, EventFlow_v1.2.1)

Positions
---------
1  data     (required) — JSON filename; .json auto-appended.
2  entry    (optional) — entry point name.
3  version  (optional) — defaults to EventFlow_v1.2.1.

Generic labels (case-insensitive: "event", "event viewer", "flowchart")
produce a bare iframe. Descriptive labels emit a caption linking to the
full viewer URL.
"""

import re
from urllib.parse import urlencode

_GENERIC = {'event', 'event viewer', 'flowchart', 'event flowchart'}

_BASE = 'https://restite.org/eventviewer-totk/viewer.html'
_DEFAULT_VERSION = 'EventFlow_v1.2.1'

# Matches any <a> tag in rendered HTML.
_LINK_RE = re.compile(
    r'<a\s[^>]*href="([^"]+)"[^>]*>(.*?)</a>',
    re.IGNORECASE | re.DOTALL,
)

# Matches the ev: shorthand: href must start with 'ev:' followed by the data
# token, then optional entry and version tokens separated by commas.
# The ev: prefix is required — this makes matching unambiguous with any real
# link or filename (analogous to search: and media: prefixes in this project).
_SHORTHAND_RE = re.compile(
    r'^ev:([^,]+?)(?:\s*,\s*([^,]+?))?(?:\s*,\s*([^,]+?))?\s*$'
)


def _parse_shorthand(href: str):
    """Return (data, entry, version) or None if href is not a shorthand."""
    m = _SHORTHAND_RE.match(href)
    if not m:
        return None
    data = m.group(1).strip()
    if not data.endswith('.json'):
        data += '.json'
    entry = m.group(2).strip() if m.group(2) else None
    version = m.group(3).strip() if m.group(3) else _DEFAULT_VERSION
    return data, entry, version


def _build_url(data: str, entry, version: str) -> str:
    params = {'data': data, 'params': '1', 'version': version}
    if entry:
        params['entry'] = entry
    return _BASE + '?' + urlencode(params)


def _generate_iframe(url: str, label: str | None) -> str:
    iframe_style = (
        'border:0; border-radius: 4px;'
        ' box-shadow: 0 4px 6px rgba(0,0,0,0.3);'
    )
    caption = ''
    if label:
        caption = (
            f'<div style="margin-bottom: 0.5rem;">'
            f'<strong><a href="{url}" target="_blank" rel="noopener">{label}</a></strong>'
            f'</div>'
        )

    return (
        f'<div class="ub-event-embed">'
        f'{caption}'
        f'<iframe src="{url}" '
        f'width="100%" height="600" style="{iframe_style}" '
        f'loading="lazy" allowfullscreen></iframe>'
        f'</div>'
    )


def on_page_content(html: str, page, config, files) -> str:
    def _replace(match):
        full_tag = match.group(0)
        href = match.group(1)
        label_html = match.group(2)

        parsed = _parse_shorthand(href)
        if not parsed:
            return full_tag
        url = _build_url(*parsed)

        clean_label = re.sub(r'<[^>]+>', '', label_html).strip()
        caption = None if clean_label.lower() in _GENERIC else clean_label
        return _generate_iframe(url, caption)

    return _LINK_RE.sub(_replace, html)
