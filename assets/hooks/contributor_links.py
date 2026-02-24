"""
contributor_links.py — MkDocs build hook
Automatically turns plain contributor names into markdown links using
docs/wiki/glitchcraft/_contributors.json as the source of truth.

Editors can write:  "discovered by Mozz and Lightos_"
And it renders as:  "discovered by [Mozz](https://...) and [Lightos_](https://...)"

Rules:
  - Names already inside a link label [Name](...) are left untouched.
  - Names inside fenced code blocks or inline code spans are left untouched.
  - Frontmatter (--- block) is left untouched.
  - A trailing underscore on a name (display convention) is preserved.
"""

import json
import re
from pathlib import Path

_CONTRIBUTORS_JSON = (
    Path(__file__).parent.parent.parent  # docs/
    / 'wiki' / 'contributors.json'
)

# Loaded once per build on first page processed
_contributors: dict[str, str] | None = None


def _load_contributors() -> dict[str, str]:
    global _contributors
    if _contributors is None:
        try:
            _contributors = json.loads(
                _CONTRIBUTORS_JSON.read_text(encoding='utf-8')
            )
        except Exception:
            _contributors = {}
    return _contributors


def _autolink_in_segment(text: str, patterns: list[tuple[re.Pattern, str]]) -> str:
    """Apply all contributor auto-link patterns to a plain text segment."""
    for pattern, replacement in patterns:
        text = pattern.sub(replacement, text)
    return text


def on_page_markdown(markdown: str, page, config, files, **kwargs) -> str:
    contributors = _load_contributors()
    if not contributors:
        return markdown

    # Build patterns once: match name (with optional trailing underscore),
    # but NOT when already inside a markdown link label (preceded by `[`).
    patterns: list[tuple[re.Pattern, str]] = []
    for name, url in contributors.items():
        # Escape the stored name (no trailing _), then allow optional trailing _
        pat = (
            r'(?<!\[)'           # not already a link label start
            r'(?<!\w)'           # not mid-word
            + re.escape(name) +
            r'_?'                # optional trailing underscore (display convention)
            r'(?!\w)'            # not followed by more word characters
            r'(?!\])'            # not followed by ] (already inside [...])
        )
        # Preserve whatever trailing _ the author wrote
        repl = lambda m, _name=name, _url=url: f'[{m.group(0)}]({_url})'
        patterns.append((re.compile(pat), repl))

    # --- 1. Strip and preserve frontmatter ---
    frontmatter = ''
    body = markdown
    fm_match = re.match(r'^(---\n[\s\S]*?\n---\n?)', markdown)
    if fm_match:
        frontmatter = fm_match.group(1)
        body = markdown[len(frontmatter):]

    # --- 2. Split body into segments: code fences vs plain text ---
    # We process only the non-code segments.
    result_parts: list[str] = []
    # Matches fenced code blocks (``` or ~~~) and inline code spans (`...`)
    fence_re = re.compile(
        r'(`{3,}|~{3,}).*?\n[\s\S]*?\n\1'   # fenced block
        r'|`[^`\n]+`',                        # inline code span
        re.MULTILINE,
    )

    last = 0
    for m in fence_re.finditer(body):
        # Process plain segment before this code block
        plain = body[last:m.start()]
        result_parts.append(_autolink_in_segment(plain, patterns))
        # Emit code block verbatim
        result_parts.append(m.group(0))
        last = m.end()

    # Process remaining plain text after last code block
    result_parts.append(_autolink_in_segment(body[last:], patterns))

    return frontmatter + ''.join(result_parts)
