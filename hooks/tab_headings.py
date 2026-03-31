"""
MkDocs hook: tab_headings
=========================
Allows tab labels to act as TOC-visible headings.

Author syntax (opt-in per tab):

    === "Method 1: Pause-Cancel" { h4 }

        Content...

The ``{ hN }`` suffix (h2–h6) is stripped from the tab line and a hidden
companion heading is injected inside the tab.  Python Markdown's ``toc``
extension picks up the heading → TOC entry at the chosen level.

The heading is styled sr-only (``.tab-toc-heading``) — invisible but present
for TOC, scroll spy, and deep linking.  ``heading-permalink.js`` skips these
headings and places the share icon on the tab label instead.
"""

import re

# === "Label" { hN }  —  captures indent, full prefix, label text, level.
_TAB_HEADING_RE = re.compile(
    r'^(?P<pre>(?P<indent>[ \t]*)===[ \t]+"(?P<label>[^"\n]+)")'
    r'[ \t]+\{[ \t]*h(?P<level>[2-6])[ \t]*\}'
    r'[ \t]*$',
    re.MULTILINE,
)


def _inject_heading(m: re.Match) -> str:
    """Replace ``=== "Label" { hN }`` with a clean tab line + hidden heading."""
    indent = m.group('indent')
    label = m.group('label')
    level = int(m.group('level'))
    content_indent = indent + '    '

    # Strip trailing backtick badges and HTML badge spans from heading text.
    heading_text = re.sub(r'(\s*`[^`]+`)+\s*$', '', label).strip()
    heading_text = re.sub(r"\s*<span class='ub-vr'>.*?</span>\s*$", '', heading_text).strip()

    hashes = '#' * level
    heading = f'{content_indent}{hashes} {heading_text} {{ .tab-toc-heading }}'

    # Clean tab line (no { hN } suffix) + blank line + heading.
    return f'{m.group("pre")}\n\n{heading}'


def on_page_markdown(markdown: str, page, config, **kwargs) -> str:
    if '{ h' not in markdown:
        return markdown
    return _TAB_HEADING_RE.sub(_inject_heading, markdown)
