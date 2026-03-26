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
    # First body line MUST start with a known key so standalone --- (thematic
    # breaks used as section dividers) are never mistaken for block openers.
    r"(?P<body>(?P=indent)(?:versions:|obsolete:)[^\n]*\n(?:(?P=indent)(?!---).*\n)*)"
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
# Leading whitespace is allowed so headings inside tabs (indented) are matched.
_HEADING_SENTINEL_RE = re.compile(
    r"^(?P<heading>[ \t]*#{1,6} [^\n]+)\n"
    r"(?P<blank>\n)?"
    r"(?P<sentinel>[ \t]*<!-- @method-meta versions=(?P<versions>\[.*?\]) obsolete=(?:true|false) -->)",
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


def _replace_block(match: re.Match) -> str:
    tab_line = match.group("tab")  # None when block is not inside a tab.
    indent = match.group("indent")
    body = match.group("body")

    # Dedent the body to strip the common indent before parsing keys.
    dedented = re.sub(r"^" + re.escape(indent), "", body, flags=re.MULTILINE)

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
            f"{indent}!!! warning \"OBSOLETE SECTION\"\n"
            f"{indent}    This section is obsolete."
            f" Check out the other sections on this page.\n\n"
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

        # Separate trailing attr_list suffix { ... } so badge goes before it.
        attr_match = re.search(r'\s*(\{[^}]+\})\s*$', heading)
        if attr_match:
            core = heading[:attr_match.start()]
            attr_suffix = ' ' + attr_match.group(1)
        else:
            core = heading
            attr_suffix = ''

        # Strip any existing badge, then append the computed one.
        core = re.sub(r"\s*`[^`]+`\s*$", "", core)
        if range_label:
            new_heading = f"{core} {range_label}{attr_suffix}"
        else:
            new_heading = f"{core}{attr_suffix}"
        return f"{new_heading}\n{blank}{sentinel}"

    return _HEADING_SENTINEL_RE.sub(_rewrite_heading, markdown)


# Collapse shorthand: heading ending with ` ?` → { .collapse },
# ` !` → { .collapse .open }.  Must be preceded by a space to avoid
# matching ordinary punctuation (e.g. "Pause-Cancel???").
_COLLAPSE_SHORT_RE = re.compile(
    r"^(?P<heading>[ \t]*#{1,6} .+) (?P<marker>[?!])[ \t]*$",
    re.MULTILINE,
)

def _expand_collapse_shorthand(markdown: str) -> str:
    def _repl(m: re.Match) -> str:
        marker = m.group("marker")
        attr = "{ .collapse .open }" if marker == "!" else "{ .collapse }"
        return f"{m.group('heading')} {attr}"
    return _COLLAPSE_SHORT_RE.sub(_repl, markdown)


def on_page_markdown(markdown: str, page, config, **kwargs) -> str:
    markdown = _expand_collapse_shorthand(markdown)
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

_TABBED_SET_OPEN_RE = re.compile(r'<div class="tabbed-set\b')
_HEADING_OPEN_RE = re.compile(r'<h([1-6])\b')

def _inject_tab_levels(html: str) -> str:
    """Add data-ub-level to each tabbed-set based on the nearest preceding heading.

    Level = parent heading level + 1, so tabs under an <h2> get level 3.
    CSS uses this to scale tab label font-size proportionally."""
    edits = []  # (insert_pos, attr_string)
    for m in _TABBED_SET_OPEN_RE.finditer(html):
        headings = list(_HEADING_OPEN_RE.finditer(html, 0, m.start()))
        if not headings:
            continue
        level = int(headings[-1].group(1))
        tab_level = min(level + 1, 6)
        # Insert right after '<div '
        insert_pos = m.start() + len('<div ')
        edits.append((insert_pos, f'data-ub-level="{tab_level}" '))

    for pos, attr in reversed(edits):
        html = html[:pos] + attr + html[pos:]
    return html


def on_page_content(html: str, page, config, **kwargs) -> str:
    # Inject heading-level hints into tabbed-sets (independent of method-meta).
    if 'class="tabbed-set' in html:
        html = _inject_tab_levels(html)

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

    # Mark headings (e.g. collapsible sections) of obsolete methods.
    html = _mark_obsolete_headings(html)

    return html


def _mark_obsolete_labels(html: str) -> str:
    """Add 'ub-obsolete' class to tab labels whose corresponding tabbed-block
    contains a *tab-level* obsolete method-meta div (not one belonging to a
    sub-heading).

    Strategy: find each ``tabbed-block`` that has ``data-obsolete="true"``
    not preceded by a heading, then walk backwards to its parent
    ``tabbed-set`` to locate the matching ``<label>`` by block index.
    This avoids fragile regex parsing of deeply-nested div structures."""

    # Locate every tabbed-set boundary so we can map blocks → labels.
    SET_OPEN = re.compile(r'<div class="tabbed-set[^"]*"[^>]*>')
    LABEL_RE = re.compile(r'<label for="([^"]+)">')
    BLOCK_RE = re.compile(r'<div class="tabbed-block">')

    # Pre-compute label lists per tabbed-set (by start position).
    sets = []  # [(start, end_of_labels_area, [label_id, …])]
    for m in SET_OPEN.finditer(html):
        set_start = m.start()
        # Labels appear between the set opening and the first tabbed-block.
        first_block = BLOCK_RE.search(html, m.end())
        if not first_block:
            continue
        label_area = html[m.end():first_block.start()]
        labels = LABEL_RE.findall(label_area)
        sets.append((set_start, first_block.start(), labels))

    if not sets:
        return html

    # For each tabbed-block with a tab-level obsolete meta div, find its
    # index within its parent set and mark the corresponding label.
    META_OBS = re.compile(
        r'<div class="ub-method-meta"[^>]*data-obsolete="true"'
    )
    labels_to_mark = set()  # label for="" ids to mark

    for block_m in BLOCK_RE.finditer(html):
        block_start = block_m.end()
        # Find the next tabbed-block or a run of closing </div>s.
        next_block = BLOCK_RE.search(html, block_start)
        block_end = next_block.start() if next_block else len(html)
        block_html = html[block_start:block_end]

        # Does this block have a tab-level obsolete meta div?
        has_tab_obsolete = False
        for obs_m in META_OBS.finditer(block_html):
            before = block_html[:obs_m.start()]
            # If a heading immediately precedes (possibly with <p>), it
            # belongs to that heading, not the tab.
            if not re.search(r'</h[1-6]>[\s<p>/]*$', before):
                has_tab_obsolete = True
                break

        if not has_tab_obsolete:
            continue

        # Determine which tabbed-set this block belongs to and its index.
        parent_set = None
        for s in reversed(sets):
            if s[0] < block_m.start():
                parent_set = s
                break
        if not parent_set:
            continue

        # Count how many tabbed-blocks appear before this one within the
        # same set (between set start and this block).
        block_index = 0
        for earlier in BLOCK_RE.finditer(html, parent_set[0], block_m.start()):
            block_index += 1
        # block_index is now 1-based count of earlier blocks; the current one
        # is at that index (0-based).  But we counted *earlier* blocks, so
        # index = block_index (the first block has 0 earlier blocks = index 0).

        labels = parent_set[2]
        if block_index < len(labels):
            labels_to_mark.add(labels[block_index])

    # Apply the class to all identified labels.
    for label_id in labels_to_mark:
        old = f'<label for="{label_id}">'
        new = f'<label for="{label_id}" class="ub-obsolete">'
        html = html.replace(old, new, 1)

    return html


def _mark_obsolete_headings(html: str) -> str:
    """Add 'ub-obsolete' class to headings directly before a ub-method-meta div
    with data-obsolete="true".  Works backwards from the meta div to find the
    nearest heading, avoiding greedy cross-heading matches."""
    META_RE = re.compile(
        r'<div class="ub-method-meta"[^>]*data-obsolete="true"[^>]*>',
    )
    # Match the closest </hN> before the meta div (with optional <p> gap)
    CLOSE_BEFORE = re.compile(r'</h([1-6])>[\s]*(?:<p>[\s]*)?$')

    # Collect all edits first, then apply in reverse order so positions stay valid.
    edits = []  # list of (start, end, new_attrs)
    for meta_m in META_RE.finditer(html):
        before = html[:meta_m.start()]
        close_m = CLOSE_BEFORE.search(before)
        if not close_m:
            continue
        level = close_m.group(1)
        open_pat = re.compile(rf'<h{level}(\s[^>]*)>')
        last_open = None
        for om in open_pat.finditer(before[:close_m.start() + 1]):
            last_open = om
        if not last_open:
            continue
        attrs = last_open.group(1)
        if 'ub-obsolete' in attrs:
            continue
        if 'class="' in attrs:
            new_attrs = re.sub(r'class="', 'class="ub-obsolete ', attrs, count=1)
        else:
            new_attrs = f' class="ub-obsolete"{attrs}'
        edits.append((last_open.start(1), last_open.end(1), new_attrs))

    for start, end, new_attrs in reversed(edits):
        html = html[:start] + new_attrs + html[end:]
    return html
