"""
MkDocs hook: glitch_autolink
=============================
Automatically replaces mentions of glitch names, abbreviations, or aliases
in rendered HTML with links to the corresponding glitch page.

Data source: docs/assets/data/glossary.json (built by build_bm25_index.py).

Each glossary entry has:
  name    – full glitch name    (e.g. "Extended Throw Sprinting")
  label   – abbreviation        (e.g. "ETS")
  aliases – alternative names   (e.g. ["extended-throw-sprinting"])
  path    – site-relative path  (e.g. "wiki/ETS/")
  uid     – unique page ID      (e.g. "D2J")

Throttling:
  - The page is split into *sections* at <h2>–<h6> headings and
    <div class="tabbed-block"> tab panels.  Each glitch is autolinked
    AT MOST ONCE per section so readers always have a nearby link
    without carpet-bombing.
  - Custom collapsible headings (``{ .collapse }``) are regular <h2>–<h6>
    tags and therefore already act as section boundaries.
  - Admonition-style collapsibles (<details> / ``???``) are NOT section
    boundaries — they are inline supplementary content within a section.
  - If a section already contains an <a> whose href points to a glitch's
    UID (e.g. a uid: link or manual href), all autolink patterns for that
    glitch are suppressed in that section.

Escape prefix:
  - A single ``!`` before a glitch name in the Markdown source (e.g.
    ``!ETS``) prevents that occurrence from being autolinked.  The ``!``
    is stripped in the rendered output, leaving plain text.

General rules:
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
    Path(__file__).parent.parent  # docs/
    / 'assets' / 'data' / 'glossary.json'
)

# Loaded once per build on first page processed.
_glossary: list[dict] | None = None
_lookup: list[tuple[re.Pattern, str, str, str]] | None = None
_valid_uids: set[str] | None = None


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
# We use a backreference (?P<tag>...) ... (?P=tag) to ensure we match the
# closing tag corresponding to the opening tag (e.g. <label>...</label>),
# preventing nested tags (like <a> inside <label>) from breaking the match.
_PROTECTED_RE = re.compile(
    r'<(?P<tag>a|code|pre|h[1-6]|script|style|label|video|strong)\b[^>]*>[\s\S]*?</(?P=tag)>'
    r'|<(?:img|input|br|hr|meta|source)\b[^>]*/?>',
    re.IGNORECASE,
)

# Section boundaries: headings and Material tab panels.
# Admonition collapsibles (<details>) are NOT boundaries — they are
# inline supplementary content.  Custom { .collapse } headings are
# regular <h2>–<h6> and are already covered.
_SECTION_RE = re.compile(
    r'<(?:h[2-6][\s>]|div\s+class="tabbed-block")',
    re.IGNORECASE,
)

# Extract href attribute from <a> tags.
_HREF_RE = re.compile(r'<a\s[^>]*href="([^"]*)"', re.IGNORECASE)
# Match a 3-char UID at the end of a URL path segment.
_PATH_UID_RE = re.compile(r'/([A-Z0-9]{3})/?(?:[#?].*)?$')


def _build_lookup(glossary: list[dict]) -> list[tuple[re.Pattern, str, str, str]]:
    """Build a sorted list of (compiled_regex, path, display_name, uid) tuples.

    Each regex includes an optional ``!`` capture group so escape-prefixed
    mentions can be detected and stripped in the same pass.

    Longer match strings come first so that "Extended Throw Sprinting" is
    matched before "ETS" when both could overlap in surrounding text.
    """
    raw: list[tuple[str, str, str, bool, str]] = []

    for entry in glossary:
        name = entry.get('name', '')
        label = entry.get('label', '')
        aliases = entry.get('aliases', [])
        path = entry.get('path', '')
        uid = entry.get('uid', '')
        if not name or not path:
            continue

        # Full name — case-insensitive
        raw.append((name, path, name, False, uid))

        # Label — case-sensitive (avoid false positives)
        if label:
            raw.append((label, path, label, True, uid))

        # Aliases — case-insensitive
        for alias in aliases:
            if alias and alias.lower() != name.lower():
                raw.append((alias, path, name, False, uid))

    # Sort longest first → greedy matching
    raw.sort(key=lambda t: -len(t[0]))

    result: list[tuple[re.Pattern, str, str, str]] = []
    for text, path, display, case_sensitive, uid in raw:
        flags = 0 if case_sensitive else re.IGNORECASE
        # Word-boundary anchored pattern with optional ! escape prefix.
        # For multi-word phrases, use \s+ between words for flexible
        # whitespace matching (handles &nbsp;, newlines, multiple spaces).
        words = text.split()
        if len(words) > 1:
            # Multi-word: escape each word, join with flexible whitespace
            pattern_text = r'\s+'.join(re.escape(w) for w in words)
        else:
            # Single word: simple escape
            pattern_text = re.escape(text)
        pattern = r'(?<!\w)(!?)' + pattern_text + r'(?!\w)'
        result.append((re.compile(pattern, flags), path, display, uid))

    return result


def _split_sections(html: str) -> list[str]:
    """Split *html* at section boundaries (headings, tabs, collapsibles).

    Content before the first boundary forms the first fragment (preamble).
    """
    boundaries = [m.start() for m in _SECTION_RE.finditer(html)]
    if not boundaries:
        return [html]
    parts: list[str] = []
    prev = 0
    for pos in boundaries:
        if pos > prev:
            parts.append(html[prev:pos])
        prev = pos
    parts.append(html[prev:])
    return parts


def _extract_linked_uids(html: str, valid_uids: set[str]) -> set[str]:
    """Return glossary UIDs already linked via ``<a>`` tags in *html*."""
    uids: set[str] = set()
    for m in _HREF_RE.finditer(html):
        uid_m = _PATH_UID_RE.search(m.group(1))
        if uid_m and uid_m.group(1) in valid_uids:
            uids.add(uid_m.group(1))
    return uids


def _in_protected(start: int, end: int,
                  protected: list[tuple[int, int]]) -> bool:
    for ps, pe in protected:
        if start >= ps and end <= pe:
            return True
    return False


def _current_page_path(page) -> str:
    """Return the site-relative path for the current page (e.g.
    'wiki/glitchcraft/zuggle/')."""
    url = getattr(page, 'url', '') or ''
    url = url.strip('/')
    if url and not url.endswith('/'):
        url += '/'
    return url


def on_page_content(html: str, page, config, files) -> str:
    """Post-render hook: autolink glitch mentions with section throttling."""
    glossary = _load_glossary()
    if not glossary:
        return html

    global _lookup, _valid_uids
    if _lookup is None:
        _lookup = _build_lookup(glossary)
        _valid_uids = {e.get('uid') for e in glossary if e.get('uid')}
    lookup = _lookup
    valid_uids = _valid_uids
    if not lookup or not valid_uids:
        return html

    current_path = _current_page_path(page)

    site_url = config.get('site_url', '') or ''
    base = site_url.rstrip('/')

    # Split the page into sections at heading / tab / collapsible boundaries.
    sections = _split_sections(html)

    for idx, section in enumerate(sections):
        # UIDs already linked in this section (uid: links, manual hrefs, etc.)
        already_linked: set[str] = _extract_linked_uids(section, valid_uids)

        for pattern, path, display, uid in lookup:
            # Skip self-links
            if path == current_path:
                continue

            # Rebuild protected regions after each pattern pass — newly
            # inserted <a> tags become protected for subsequent patterns.
            protected = [(m.start(), m.end())
                         for m in _PROTECTED_RE.finditer(section)]

            href = f'{base}/{path}'.rstrip('/') + '/'
            uid_linked = uid in already_linked

            replacements: list[tuple[int, int, str]] = []
            for m in pattern.finditer(section):
                if _in_protected(m.start(), m.end(), protected):
                    continue

                if m.group(1) == '!':
                    # Escaped — strip the ! prefix, emit plain text.
                    replacements.append((m.start(), m.end(), m.group(0)[1:]))
                elif not uid_linked:
                    # First linkable match in this section → autolink.
                    matched = m.group(0)
                    link = (f'<a href="{href}" class="glitch-autolink" '
                            f'title="{display}" target="_blank" '
                            f'rel="noopener noreferrer">{matched}</a>')
                    replacements.append((m.start(), m.end(), link))
                    uid_linked = True
                    already_linked.add(uid)

            # Apply right-to-left to preserve earlier offsets.
            for start, end, repl in reversed(replacements):
                section = section[:start] + repl + section[end:]

        sections[idx] = section

    return ''.join(sections)
