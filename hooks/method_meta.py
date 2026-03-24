"""
MkDocs hook: method_meta
=========================
Provides per-method machine-readable metadata for glitch pages.

Authors annotate individual methods (typically inside content tabs) with a
frontmatter-style block delimited by ``---``:

    === "Method 1"
        ---
        versions: ["1.0.0", "1.1.0"]
        obsolete: true
        ---
        1. Step one…

    === "Method 2"
        ---
        versions: ["1.0.0", "1.1.2"]
        ---
        1. Step one…

For non-tabbed single-method pages the block goes at the top of the
Instructions section (no indentation).

Supported fields (all optional):

  - ``versions``  (YAML list)  — game versions this method works on.
  - ``obsolete``  (bool)       — marks the method as obsolete; injects a
    warning admonition and sets ``data-obsolete`` on the hidden output div.

Processing:

  1. ``on_page_markdown`` — strips the ``---``-delimited block from the
     source and, for obsolete methods, injects a ``!!! warning`` admonition
     in its place.  Injects version badges as inline code spans.
  2. ``on_page_content`` — inserts a hidden ``<div class="ub-method-meta">``
     with ``data-versions`` and ``data-obsolete`` attributes for client-side
     scripts and build tooling.
"""

import json
import re
from pathlib import Path

# ── Version catalogue (single source of truth) ──────────────────────────────
_VERSIONS_FILE = Path(__file__).resolve().parents[1] / "assets" / "data" / "versions.json"

def _load_versions():
    with open(_VERSIONS_FILE, encoding="utf-8") as f:
        data = json.load(f)
    all_versions = data["versions"]
    platforms = set(data.get("platforms", []))
    software = [v for v in all_versions if v not in platforms]
    return all_versions, platforms, software[-1] if software else ""

_ALL_VERSIONS, _PLATFORMS, _CURRENT_VERSION = _load_versions()

# ── Syntax ───────────────────────────────────────────────────────────────────
# Optionally captures the tab header line (=== "Label") that immediately
# precedes a ---delimited block, so the hook can inject a version range into
# the tab title.  The opening and closing --- must share the same indent.

_BLOCK_RE = re.compile(
    r"^(?P<tab>[ \t]*===[ \t]+\"[^\"\n]*\"[ \t]*\n)?"
    r"(?P<indent>[ \t]*)---[ \t]*\n"
    r"(?P<body>(?:(?P=indent)(?!---).*\n)*)"
    r"(?P=indent)---[ \t]*\n",
    re.MULTILINE,
)

# Known keys inside the method block.
_VERSIONS_RE = re.compile(r'^versions:\s*(.+)$', re.MULTILINE)
_OBSOLETE_RE = re.compile(r'^obsolete:\s*(.+)$', re.MULTILINE)

# Sentinel comment written into markdown so the HTML phase can locate the spot.
_SENTINEL_RE = re.compile(
    r"<!-- @method-meta versions=(?P<versions>\[.*?\]) obsolete=(?P<obsolete>true|false) -->"
)

# Second-pass: heading immediately before a sentinel (blank line optional).
# Captures any ATX heading (##, ###, …) so range badges work for all levels.
_HEADING_SENTINEL_RE = re.compile(
    r"^(?P<heading>#{1,6} [^\n]+)\n"
    r"(?P<blank>\n)?"
    r"(?P<sentinel><!-- @method-meta versions=(?P<versions>\[.*?\]) obsolete=(?:true|false) -->)",
    re.MULTILINE,
)


def _make_range_label(versions: list[str]) -> str:
    """Produce a short range badge string from a versions list.

    Platform tags (e.g. "Switch 2") are excluded from range computation
    but still rendered as individual badges elsewhere.

    Examples:
        []                               -> ""
        ["1.0.0"]                        -> "`1.0.0`"
        ["1.0.0", "1.1.0", "1.1.1"]    -> "`1.0.0-1.1.1`"
        ["1.2.0", ..., "1.4.3"]         -> "`1.2.0+`"  (open-ended)
        ["1.0.0", ..., "1.4.3"]         -> "`All versions`"  (full catalogue)
        ["1.0.0", ..., "Switch 2"]      -> "`All versions`"  (platforms filtered)
    """
    sw = [v for v in versions if v not in _PLATFORMS]
    if not sw:
        return ""
    if len(sw) == 1:
        return f"`{sw[0]}`"
    first = sw[0]
    last = sw[-1]
    if first == _ALL_VERSIONS[0] and last == _CURRENT_VERSION:
        return "`All versions`"
    if last == _CURRENT_VERSION:
        return f"`{first}+`"
    return f"`{first}-{last}`"


def _rewrite_tab_label(tab_line: str, versions: list[str]) -> str:
    """Strip any existing range badge from a tab header and inject the computed one."""
    range_label = _make_range_label(versions)
    m = re.match(r'^([ \t]*===[ \t]+")(.*?)("[ \t]*\n)$', tab_line)
    if not m:
        return tab_line
    prefix = m.group(1)   # e.g. '=== "'
    content = m.group(2)  # e.g. 'Method 1 `1.2.0+`' or 'Method 1'
    suffix = m.group(3)   # e.g. '"\n'
    # Strip any trailing backtick badge injected by a previous build.
    content = re.sub(r'\s*`[^`]+`\s*$', '', content)
    if range_label:
        return f"{prefix}{content} {range_label}{suffix}"
    return f"{prefix}{content}{suffix}"


def _parse_versions(raw: str) -> list[str]:
    """Parse a YAML-style list like '["1.0.0", "1.1.0"]' into a Python list."""
    raw = raw.strip()
    try:
        result = json.loads(raw)
        if isinstance(result, list):
            return [str(v) for v in result]
    except (json.JSONDecodeError, ValueError):
        pass
    return []


def _is_method_block(body: str) -> bool:
    """Return True if the block body contains at least one known method key."""
    stripped = body.strip()
    if not stripped:
        return False
    for line in stripped.splitlines():
        line = line.strip()
        if line.startswith("versions:") or line.startswith("obsolete:"):
            return True
    return False


def _replace_block(match: re.Match) -> str:
    tab_line = match.group("tab")  # None when block is not inside a tab.
    indent = match.group("indent")
    body = match.group("body")

    # Dedent the body to strip the common indent before parsing keys.
    dedented = re.sub(r"^" + re.escape(indent), "", body, flags=re.MULTILINE)

    if not _is_method_block(dedented):
        return match.group(0)  # Not a method block — leave untouched (tab line included).

    # Parse fields.
    vm = _VERSIONS_RE.search(dedented)
    versions = _parse_versions(vm.group(1)) if vm else []

    om = _OBSOLETE_RE.search(dedented)
    obsolete = om.group(1).strip().lower() in ("true", "yes", "1") if om else False

    # Build sentinel comment for the HTML phase.
    sentinel = (
        f"{indent}<!-- @method-meta "
        f"versions={json.dumps(versions)} "
        f"obsolete={'true' if obsolete else 'false'} -->\n"
    )

    # Build version badges (inline code spans).
    badges = ""
    if versions:
        badge_str = " ".join(f"`{v}`" for v in versions)
        badges = f"{indent}{badge_str}\n\n"

    # Rewrite the tab header with the computed range badge.
    new_tab_line = ""
    if tab_line is not None:
        new_tab_line = _rewrite_tab_label(tab_line, versions)

    # Build deprecation admonition.
    admonition = ""
    if obsolete:
        admonition = (
            f"{indent}!!! warning \"Obsolete Method\"\n"
            f"{indent}    This method is obsolete."
            f" Check out the other methods listed on this page.\n\n"
        )

    return new_tab_line + sentinel + badges + admonition


def _patch_headings(markdown: str) -> str:
    """Second pass: inject range badge into any heading that precedes a sentinel."""
    def _rewrite_heading(m: re.Match) -> str:
        heading = m.group("heading")
        blank = m.group("blank") or ""
        sentinel = m.group("sentinel")
        try:
            versions = json.loads(m.group("versions"))
        except Exception:
            versions = []
        range_label = _make_range_label(versions)
        # Strip any existing badge, then append the computed one.
        clean = re.sub(r"\s*`[^`]+`\s*$", "", heading)
        new_heading = f"{clean} {range_label}" if range_label else clean
        return f"{new_heading}\n{blank}{sentinel}"

    return _HEADING_SENTINEL_RE.sub(_rewrite_heading, markdown)


def on_page_markdown(markdown: str, page, config, **kwargs) -> str:
    if "---" not in markdown:
        return markdown
    # Skip the page-level YAML frontmatter (first --- ... --- at column 0).
    # We locate it and protect it from replacement.
    fm_match = re.match(r"^---\n[\s\S]*?\n---\n?", markdown)
    if fm_match:
        frontmatter = fm_match.group(0)
        rest = markdown[fm_match.end():]
        after_blocks = _BLOCK_RE.sub(_replace_block, rest)
    else:
        after_blocks = _BLOCK_RE.sub(_replace_block, markdown)
        frontmatter = ""
    after_headings = _patch_headings(after_blocks)
    return frontmatter + after_headings


# ── HTML phase ───────────────────────────────────────────────────────────────

def on_page_content(html: str, page, config, **kwargs) -> str:
    if "<!-- @method-meta " not in html:
        return html

    def _sentinel_to_div(m: re.Match) -> str:
        try:
            versions = json.loads(m.group("versions"))
        except Exception:
            versions = []
        obsolete = m.group("obsolete")
        versions_attr = json.dumps(versions).replace("'", "&#39;")
        return (
            f'<div class="ub-method-meta" '
            f"data-versions='{versions_attr}' "
            f'data-obsolete="{obsolete}" '
            f"hidden></div>"
        )

    html = _SENTINEL_RE.sub(_sentinel_to_div, html)

    # Mark tab labels of obsolete methods so CSS can style them.
    html = _mark_obsolete_labels(html)

    return html


def _mark_obsolete_labels(html: str) -> str:
    """Walk each tabbed-set and add 'ub-obsolete' class to labels whose
    corresponding tabbed-block contains a method-meta div with
    data-obsolete="true"."""
    TABBED_SET = re.compile(
        r'<div class="tabbed-set[^"]*"[^>]*>'
        r'(?P<body>.*?)</div>\s*</div>\s*</div>',
        re.DOTALL,
    )
    for ts in TABBED_SET.finditer(html):
        body = ts.group("body")
        # Extract label `for` attributes in order.
        labels = re.findall(r'<label for="([^"]+)">', body)
        # Extract each tabbed-block and check for obsolete.
        blocks = list(re.finditer(
            r'<div class="tabbed-block">(.*?)(?=<div class="tabbed-block">|</div>\s*</div>)',
            body, re.DOTALL,
        ))
        for i, block in enumerate(blocks):
            if i >= len(labels):
                break
            if 'data-obsolete="true"' in block.group(1):
                old_label = f'<label for="{labels[i]}">'
                new_label = f'<label for="{labels[i]}" class="ub-obsolete">'
                html = html.replace(old_label, new_label, 1)
    return html
