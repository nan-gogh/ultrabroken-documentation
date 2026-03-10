"""
MkDocs hook: diagram_viewer
============================
Wraps mermaid code fences in an interactive pan-zoom viewer.

Usage in Markdown — add the 'viewer' keyword to the mermaid code fence info string:

    ```mermaid viewer
    graph TD
        A --> B
    ```

The hook replaces this pattern with the .diagram-pan container HTML
(toolbar + inner wrapper) around the original mermaid fence.  The
companion script (diagram-pan-zoom.js) auto-initialises any
.diagram-pan elements on the page.
"""

import re

# Matches ```mermaid viewer (or ```mermaid diagram-viewer) followed by content
# then the closing backticks.
_VIEWER_RE = re.compile(
    r'(`{3,})mermaid\s+(?:viewer|diagram-viewer)\s*\n'
    r'([\s\S]*?)\n\1',
    re.MULTILINE,
)

# Matches any fenced code block (``` or ~~~) with 3+ delimiters.
# Used to skip nested fences so the viewer pattern isn't applied
# inside code examples (e.g. ````markdown blocks in documentation).
_FENCE_RE = re.compile(
    r'(`{3,}|~{3,}).*?\n[\s\S]*?\n\1',
    re.MULTILINE,
)

_WRAPPER_BEFORE = (
    '<div class="diagram-pan">\n'
    '  <div class="diagram-zoom">\n'
    '    <input type="range" min="40" max="400" value="100">\n'
    '    <span class="diagram-level">100%</span>\n'
    '    <button>Reset</button>\n'
    '  </div>\n'
    '  <div class="diagram-inner">\n'
)
_WRAPPER_AFTER = (
    '\n  </div>\n'
    '</div>'
)


def _wrap_viewer(m: re.Match) -> str:
    backticks = m.group(1)
    content = m.group(2)
    return _WRAPPER_BEFORE + backticks + 'mermaid\n' + content + '\n' + backticks + _WRAPPER_AFTER


def on_page_markdown(markdown: str, page, config, files, **kwargs) -> str:
    # Process only non-code segments so syntax examples are never touched.
    parts: list[str] = []
    last = 0
    for m in _FENCE_RE.finditer(markdown):
        # Only treat as a protecting fence if its delimiter is LONGER than 3
        # (i.e. ````+ or ~~~~+). Plain ``` fences are candidates, not shields.
        if len(m.group(1)) <= 3:
            continue
        plain = markdown[last:m.start()]
        parts.append(_VIEWER_RE.sub(_wrap_viewer, plain))
        parts.append(m.group(0))  # emit outer fence verbatim
        last = m.end()
    parts.append(_VIEWER_RE.sub(_wrap_viewer, markdown[last:]))
    return ''.join(parts)
