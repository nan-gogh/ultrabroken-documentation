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

# Single combined pattern — processed in one re.sub pass.
#   Branch 1 (groups 1-2): 4+ backtick/tilde outer fence  →  emit verbatim
#                          (shields syntax-example blocks from Branch 2)
#   Branch 2 (groups 3-5): mermaid viewer fence            →  wrap in pan-zoom container
#
# Branch 1 is listed first so its {4,} quantifier takes priority over Branch 2's
# {3,}, preventing false matches inside ````markdown syntax examples.
# Both branches capture leading indentation so the closing delimiter must carry
# the same indent as the opening line — essential for pymdownx.tabbed tab blocks
# whose contents are indented 4 spaces.
_RE = re.compile(
    r'^([ \t]*)(`{4,}|~{4,})[^\n]*\n[\s\S]*?\n\1\2[ \t]*$'
    r'|'
    r'^([ \t]*)(`{3,})mermaid[ \t]+(?:viewer|diagram-viewer)[ \t]*\n'
    r'([\s\S]*?)'
    r'\n\3\4[ \t]*$',
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


def _replace(m: re.Match) -> str:
    if m.group(3) is None:
        return m.group(0)  # outer fence — pass through verbatim
    indent, backticks, content = m.group(3), m.group(4), m.group(5)
    result = _WRAPPER_BEFORE + backticks + 'mermaid\n' + content + '\n' + backticks + _WRAPPER_AFTER
    if indent:
        # Re-indent every non-empty line so the whole wrapper stays inside
        # indented contexts (e.g. pymdownx.tabbed tab blocks).
        result = '\n'.join(indent + line if line else line for line in result.split('\n'))
    return result


def on_page_markdown(markdown: str, page, config, files, **kwargs) -> str:
    return _RE.sub(_replace, markdown)
