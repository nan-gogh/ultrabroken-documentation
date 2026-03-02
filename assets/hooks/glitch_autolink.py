"""
MkDocs hook: glitch_autolink
=============================
Automatically replaces mentions of glitch names, abbreviations, or aliases
in rendered HTML with links to the corresponding glitch page.

Data source: docs/assets/data/glossary.json (built by build_bm25_index.py).

Each glossary entry has:
  name    – full glitch name    (e.g. "Extended Throw Sprinting")
  abbr    – abbreviation        (e.g. "ETS")
  aliases – alternative names   (e.g. ["extended-throw-sprinting"])
  path    – site-relative path  (e.g. "wiki/glitchcraft/extended-throw-sprinting/")

Rules:
  - Only the FIRST occurrence of each glitch on a page is linked.
  - A glitch page does not auto-link to itself.
  - Text already inside <a>, <code>, <pre>, <h1>–<h6>, or <script> tags
    is never touched.
  - Matches are case-insensitive for names/aliases but CASE-SENSITIVE
    for abbreviations (to avoid false positives with common words).
  - Matches require word boundaries so partial-word hits are skipped.
  - Longer match strings are tested first to prevent shorter abbreviations
    from stealing matches that belong to full names.
"""

import json
import re
from pathlib import Path

_GLOSSARY_JSON = (
    Path(__file__).parent.parent  # docs/assets/
    / 'data' / 'glossary.json'
)

# Loaded once per build on first page processed.
_glossary: list[dict] | None = None


def _load_glossary() -> list[dict]:
    global _glossary
    if _glossary is None:
        try:
            _glossary = json.loads(
                _GLOSSARY_JSON.read_text(encoding='utf-8')
            )
        except Exception:
            _glossary = []
    return _glossary


# Tags whose content should never be auto-linked.
_PROTECTED_RE = re.compile(
    r'<(?:a|code|pre|h[1-6]|script|style)\b[^>]*>[\s\S]*?</(?:a|code|pre|h[1-6]|script|style)>',
    re.IGNORECASE,
)


def _build_lookup(glossary: list[dict]) -> list[tuple[re.Pattern, str, str]]:
    """Build a sorted list of (compiled_regex, path, display_name) tuples.

    Longer match strings come first so that "Extended Throw Sprinting" is
    matched before "ETS" when both could overlap in surrounding text.
    """
    # Collect all (match_text, path, display_name, case_sensitive) tuples.
    raw: list[tuple[str, str, str, bool]] = []

    for entry in glossary:
        name = entry.get('name', '')
        tag = entry.get('tag', '')
        aliases = entry.get('aliases', [])
        path = entry.get('path', '')
        if not name or not path:
            continue

        # Full name — case-insensitive
        raw.append((name, path, name, False))

        # Tag — case-sensitive (avoid false positives)
        if tag:
            raw.append((tag, path, tag, True))

        # Aliases — case-insensitive
        for alias in aliases:
            if alias and alias.lower() != name.lower():
                raw.append((alias, path, name, False))

    # Sort longest first → greedy matching
    raw.sort(key=lambda t: -len(t[0]))

    result: list[tuple[re.Pattern, str, str]] = []
    for text, path, display, case_sensitive in raw:
        flags = 0 if case_sensitive else re.IGNORECASE
        # Word-boundary anchored pattern
        pattern = r'(?<!\w)' + re.escape(text) + r'(?!\w)'
        result.append((re.compile(pattern, flags), path, display))

    return result


def _current_page_path(page) -> str:
    """Return the site-relative path for the current page (e.g.
    'wiki/glitchcraft/zuggle/')."""
    # MkDocs page objects expose .url (site-relative, no leading /)
    # or .file.src_path (source-relative with .md extension).
    url = getattr(page, 'url', '') or ''
    # Normalize: strip leading/trailing slashes, ensure trailing /
    url = url.strip('/')
    if url and not url.endswith('/'):
        url += '/'
    return url


def on_page_content(html: str, page, config, files) -> str:
    """Post-render hook: replace ALL unprotected occurrences of each glitch mention."""
    glossary = _load_glossary()
    if not glossary:
        return html

    lookup = _build_lookup(glossary)
    if not lookup:
        return html

    current_path = _current_page_path(page)

    site_url = config.get('site_url', '') or ''
    base = site_url.rstrip('/')

    # Process each pattern, replacing ALL unprotected occurrences.
    # Patterns are sorted longest-first so full names are matched before
    # their abbreviations — once a span of text is wrapped in an <a> tag
    # it becomes protected and won't be double-linked.
    for pattern, path, display in lookup:
        # Skip self-links
        if path == current_path:
            continue

        href = f'{base}/{path}'.rstrip('/') + '/'

        # Scan for all matches, replacing from right to left so earlier
        # offsets stay valid after each insertion.
        # Build fresh protected regions for each pattern pass.
        protected: list[tuple[int, int]] = []
        for pm in _PROTECTED_RE.finditer(html):
            protected.append((pm.start(), pm.end()))

        def _in_protected(start: int, end: int) -> bool:
            for ps, pe in protected:
                if start >= ps and end <= pe:
                    return True
            return False

        # Collect all unprotected match positions.
        replacements: list[tuple[int, int, str]] = []
        for m in pattern.finditer(html):
            if _in_protected(m.start(), m.end()):
                continue
            matched_text = m.group(0)
            link = f'<a href="{href}" class="glitch-autolink" title="{display}" target="_blank" rel="noopener noreferrer">{matched_text}</a>'
            replacements.append((m.start(), m.end(), link))

        # Apply replacements right-to-left to preserve offsets.
        for start, end, link in reversed(replacements):
            html = html[:start] + link + html[end:]

    return html
