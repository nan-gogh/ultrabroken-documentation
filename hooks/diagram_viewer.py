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
# then the closing backticks.  Captures leading indentation (group 1) so
# fences inside tab blocks (4-space indent) are matched correctly — the
# closing delimiter must carry the same indent as the opening line.
_VIEWER_RE = re.compile(
    r'^([ \t]*)(`{3,})mermaid[ \t]+(?:viewer|diagram-viewer)[ \t]*\n'
    r'([\s\S]*?)'
    r'\n\1\2[ \t]*$',
    re.MULTILINE,
)

# Matches 4+ backtick (or tilde) outer fences, with optional leading indentation.
# These act as shields — the viewer pattern is never applied inside them.
# The closing delimiter must match the same indentation + same delimiter.
_FENCE_RE = re.compile(
    r'^([ \t]*)(`{4,}|~{4,})[^\n]*\n[\s\S]*?\n\1\2[ \t]*$',
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
    indent = m.group(1)
    backticks = m.group(2)
    content = m.group(3)
    result = _WRAPPER_BEFORE + backticks + 'mermaid\n' + content + '\n' + backticks + _WRAPPER_AFTER
    if indent:
        # Re-indent every non-empty line so the whole wrapper stays inside
        # indented contexts (e.g. pymdownx.tabbed tab blocks).
        result = '\n'.join(indent + line if line else line for line in result.split('\n'))
    return result


def on_page_markdown(markdown: str, page, config, files, **kwargs) -> str:
    # Split on 4+ backtick fences (shields). Apply viewer replacement only
    # to the segments between them, never inside them.
    parts: list[str] = []
    last = 0
    for m in _FENCE_RE.finditer(markdown):
        plain = markdown[last:m.start()]
        parts.append(_VIEWER_RE.sub(_wrap_viewer, plain))
        parts.append(m.group(0))  # emit outer fence verbatim
        last = m.end()
    parts.append(_VIEWER_RE.sub(_wrap_viewer, markdown[last:]))
    return ''.join(parts)
