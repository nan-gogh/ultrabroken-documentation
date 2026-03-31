"""
MkDocs hook: tab_headings
=========================
Allows tab labels to act as TOC-visible headings.

Author syntax (opt-in per tab):

    === "Method 1: Pause-Cancel" ###

        Content...

Trailing ``#`` marks (2–6) set the heading level, similar to how
collapsible sections use ``?`` and ``!`` shorthands.  The marks are
stripped from the tab line and a hidden companion heading is injected
inside the tab.  Python Markdown's ``toc`` extension picks up the
heading → TOC entry at the chosen level.

The heading is styled sr-only (``.tab-toc-heading``) — invisible but present
for TOC, scroll spy, and deep linking.  ``heading-permalink.js`` skips these
headings and places the share icon on the tab label instead.
"""

import re

# === "Label" ## … ######  —  captures indent, full prefix, label text, level.
_TAB_HEADING_RE = re.compile(
    r'^(?P<pre>(?P<indent>[ \t]*)===[ \t]+"(?P<label>[^"\n]+)")'
    r'[ \t]+(?P<hashes>#{2,6})'
    r'[ \t]*$',
    re.MULTILINE,
)


def _inject_heading(m: re.Match) -> str:
    """Replace ``=== "Label" ###`` with a clean tab line + hidden heading."""
    indent = m.group('indent')
    label = m.group('label')
    hashes = m.group('hashes')
    content_indent = indent + '    '

    # Strip trailing backtick badges and HTML badge spans from heading text.
    heading_text = re.sub(r'(\s*`[^`]+`)+\s*$', '', label).strip()
    heading_text = re.sub(r"\s*<span class='ub-vr'>.*?</span>\s*$", '', heading_text).strip()

    heading = f'{content_indent}{hashes} {heading_text} {{ .tab-toc-heading }}'

    # Clean tab line (no { hN } suffix) + blank line + heading.
    return f'{m.group("pre")}\n\n{heading}'


# Matches fenced code blocks (``` or ~~~) so we can skip them.
_FENCE_RE = re.compile(
    r'^(?P<fence>`{3,}|~{3,}).*\n[\s\S]*?\n(?P=fence)[ \t]*$',
    re.MULTILINE,
)


def on_page_markdown(markdown: str, page, config, **kwargs) -> str:
    if '===' not in markdown:
        return markdown

    # Process only outside fenced code blocks.
    parts = []
    last = 0
    for m in _FENCE_RE.finditer(markdown):
        # Transform the plain-text segment before this fence.
        parts.append(_TAB_HEADING_RE.sub(_inject_heading, markdown[last:m.start()]))
        # Emit the fenced block verbatim.
        parts.append(m.group(0))
        last = m.end()
    # Transform the remaining text after the last fence.
    parts.append(_TAB_HEADING_RE.sub(_inject_heading, markdown[last:]))
    return ''.join(parts)
