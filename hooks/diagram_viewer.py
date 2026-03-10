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
# then the closing backticks. The info string can have optional aliases.
_PATTERN = re.compile(
    r'(`{3,})mermaid\s+(?:viewer|diagram-viewer)\s*\n'
    r'([\s\S]*?)\n\1',
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


def on_page_markdown(markdown: str, page, config, files, **kwargs) -> str:
    def _replace(m: re.Match) -> str:
        backticks = m.group(1)
        content = m.group(2)
        return _WRAPPER_BEFORE + backticks + 'mermaid\n' + content + '\n' + backticks + _WRAPPER_AFTER

    return _PATTERN.sub(_replace, markdown)
