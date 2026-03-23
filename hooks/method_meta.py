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

# ── Syntax ───────────────────────────────────────────────────────────────────
# Matches a ---delimited block (resembling YAML frontmatter) that can appear
# at any indentation level.  The opening and closing --- must share the same
# indent.  The body between them is parsed line-by-line for known keys.

_BLOCK_RE = re.compile(
    r"^(?P<indent>[ \t]*)---[ \t]*\n"
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
    indent = match.group("indent")
    body = match.group("body")

    # Dedent the body to strip the common indent before parsing keys.
    dedented = re.sub(r"^" + re.escape(indent), "", body, flags=re.MULTILINE)

    if not _is_method_block(dedented):
        return match.group(0)  # Not a method block — leave untouched.

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

    # Build deprecation admonition.
    admonition = ""
    if obsolete:
        admonition = (
            f"{indent}!!! warning \"Obsolete Method\"\n"
            f"{indent}    This method is obsolete."
            f" Check out the other methods listed on this page.\n\n"
        )

    return sentinel + badges + admonition


def on_page_markdown(markdown: str, page, config, **kwargs) -> str:
    if "---" not in markdown:
        return markdown
    # Skip the page-level YAML frontmatter (first --- ... --- at column 0).
    # We locate it and protect it from replacement.
    fm_match = re.match(r"^---\n[\s\S]*?\n---\n?", markdown)
    if fm_match:
        frontmatter = fm_match.group(0)
        rest = markdown[fm_match.end():]
        return frontmatter + _BLOCK_RE.sub(_replace_block, rest)
    return _BLOCK_RE.sub(_replace_block, markdown)


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

    return _SENTINEL_RE.sub(_sentinel_to_div, html)
