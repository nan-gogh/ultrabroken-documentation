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
_SOFTWARE_VERSIONS = [v for v in _ALL_VERSIONS if v not in _PLATFORMS]
_SW_INDEX = {v: i for i, v in enumerate(_SOFTWARE_VERSIONS)}

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

    When the version list has gaps relative to the catalogue, multiple
    range badges are produced — one per contiguous run.

    Examples:
        []                                       -> ""
        ["1.0.0"]                                -> "`1.0.0`"
        ["1.0.0", "1.1.0", "1.1.1"]            -> "`1.0.0-1.1.1`"
        ["1.2.0", ..., "1.4.3"]                 -> "`1.2.0+`"  (open-ended)
        ["1.0.0", ..., "1.4.3"]                 -> "`All versions`"  (full catalogue)
        ["1.0.0", ..., "Switch 2"]              -> "`All versions`"  (platforms filtered)
        ["1.0.0", "1.1.0", "1.2.0", "1.2.1"]  -> "`1.0.0-1.1.0` `1.2.0-1.2.1`"  (gap)
    """
    sw = [v for v in versions if v not in _PLATFORMS]
    if not sw:
        return ""
    # Full coverage — every software version present.
    if set(sw) >= set(_SOFTWARE_VERSIONS):
        return "`All versions`"
    if len(sw) == 1:
        return f"`{sw[0]}`"

    # Split into contiguous runs using catalogue order.
    runs: list[list[str]] = []
    current_run: list[str] = [sw[0]]
    for i in range(1, len(sw)):
        prev_idx = _SW_INDEX.get(sw[i - 1])
        curr_idx = _SW_INDEX.get(sw[i])
        if prev_idx is not None and curr_idx is not None and curr_idx == prev_idx + 1:
            current_run.append(sw[i])
        else:
            runs.append(current_run)
            current_run = [sw[i]]
    runs.append(current_run)

    # Format each run.
    labels: list[str] = []
    for run in runs:
        if len(run) == 1:
            labels.append(f"`{run[0]}`")
        else:
            first, last = run[0], run[-1]
            if last == _CURRENT_VERSION:
                labels.append(f"`{first}+`")
            else:
                labels.append(f"`{first}-{last}`")

    return " ".join(labels)


def _range_badge_html(versions: list[str]) -> str:
    """Return an HTML badge group for injection into headings and tab labels.

    Wraps all range badges in ``<span class='ub-vr'>`` (rendered as
    ``display: inline-block`` via CSS) so that ``text-decoration`` from
    parent elements (underline, strikethrough from version-match / obsolete
    states) does not bleed onto the badge group or the surrounding spaces:

    - No space is prepended before the span — CSS ``margin-left`` provides it.
    - No space between consecutive ``<code>`` badges — CSS ``code+code``
      ``margin-left`` provides those gaps.

    This means there are no text nodes adjacent to the badge span that could
    carry the parent's decoration line.
    """
    md_label = _make_range_label(versions)
    if not md_label:
        return ""
    # Convert backtick inline codes to <code> elements.
    html = re.sub(r"`([^`]+)`", r"<code>\1</code>", md_label)
    # Remove spaces between adjacent </code><code> pairs so there are no
    # decorated text nodes between badges (CSS margin provides the gap).
    html = re.sub(r"</code>\s+<code>", "</code><code>", html)
    return f"<span class='ub-vr'>{html}</span>"


def _rewrite_tab_label(tab_line: str, versions: list[str]) -> str:
    """Strip any existing range badge from a tab header and inject the computed one."""
    badge_html = _range_badge_html(versions)
    m = re.match(r'^([ \t]*===[ \t]+")(.*?)("[ \t]*\n)$', tab_line)
    if not m:
        return tab_line
    prefix = m.group(1)   # e.g. '=== "'
    content = m.group(2)  # e.g. 'Method 1 `1.2.0+`' or 'Method 1'
    suffix = m.group(3)   # e.g. '"\n'
    # Strip any trailing backtick badges (author markup) or prior HTML span.
    content = re.sub(r"(\s*`[^`]+`)+\s*$|\s*<span class='ub-vr'>.*?</span>\s*$", "", content)
    if badge_html:
        # No explicit space — CSS margin-left on .ub-vr provides the gap.
        return f"{prefix}{content}{badge_html}{suffix}"
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
            f"{indent}!!! warning \"OBSOLETE CONTENT\"\n"
            f"{indent}    This content is obsolete. Check out alternatives.\n\n"
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
        badge_html = _range_badge_html(versions)

        # Separate trailing attr_list suffix { ... } so badge goes before it.
        attr_match = re.search(r'\s*(\{[^}]+\})\s*$', heading)
        if attr_match:
            core = heading[:attr_match.start()]
            attr_suffix = ' ' + attr_match.group(1)
        else:
            core = heading
            attr_suffix = ''

        # Strip any existing badges (backtick or prior HTML span format).
        core = re.sub(r"(\s*`[^`]+`)+\s*$|\s*<span class='ub-vr'>.*?</span>\s*$", "", core)
        if badge_html:
            # No explicit space — CSS margin-left on .ub-vr provides the gap.
            new_heading = f"{core}{badge_html}{attr_suffix}"
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


# Matches a tab header line that was NOT immediately followed by a metadata
# block (i.e. no sentinel was injected directly after it by _replace_block).
# After _replace_block runs, tabs WITH explicit metadata look like:
#   === "Label"
#   <!-- @method-meta ... -->
# Tabs WITHOUT explicit metadata look like:
#   === "Label"
#   <anything other than <!-- @method-meta>
_TAB_LINE_RE = re.compile(
    r'^(?P<tab>[ \t]*===[ \t]+"[^"\n]*"[ \t]*)\n'
    r'(?![ \t]*<!-- @method-meta )',   # NOT followed by a sentinel on the next line
    re.MULTILINE,
)

# Sentinel produced by _replace_block, used to scan child methods.
_CHILD_SENTINEL_RE = re.compile(
    r'<!-- @method-meta versions=(?P<versions>\[.*?\]) obsolete=(?P<obsolete>true|false) -->'
)


def _aggregate_tab(markdown: str, tab_match: re.Match) -> tuple[list[str], bool] | None:
    """Scan the indented scope of a tab for child method sentinels.

    Returns (union_versions, all_obsolete) or None if no sentinels found.
    The tab's indented scope runs from after the tab line until the next
    line at the same (or lesser) indent level that starts a new tab or
    other non-indented content.
    """
    tab_line = tab_match.group(0)          # full matched string incl. newline
    tab_start = tab_match.group('tab')     # === "Label" part (no newline)
    # Determine indent of the tab itself.
    tab_indent = len(tab_start) - len(tab_start.lstrip())
    # Content indent is tab_indent + 4 (MkDocs tabbed content).
    content_indent = tab_indent + 4

    scope_start = tab_match.end()          # character position after the tab line
    lines = markdown[scope_start:].splitlines(keepends=True)
    scope_chars = 0
    for line in lines:
        stripped = line.lstrip()
        # Blank lines are always part of the scope.
        if not stripped:
            scope_chars += len(line)
            continue
        this_indent = len(line) - len(stripped)
        # Stop when we hit a line that is NOT indented enough to be content of
        # this tab, unless it is another === line at the same level or higher.
        if this_indent < content_indent:
            break
        scope_chars += len(line)

    scope_text = markdown[scope_start:scope_start + scope_chars]

    # Collect all method-level sentinels in this scope.
    sentinels = list(_CHILD_SENTINEL_RE.finditer(scope_text))
    if not sentinels:
        return None

    # Pre-parse sentinel version lists once (avoids re-parsing inside the
    # O(V×S) loop below).
    parsed_versions = []
    for s in sentinels:
        try:
            parsed_versions.append(json.loads(s.group('versions')))
        except Exception:
            parsed_versions.append([])

    # Union of versions in catalogue order.
    seen: set[str] = set()
    union_versions: list[str] = []
    for v in _ALL_VERSIONS:
        for vlist in parsed_versions:
            if v in vlist and v not in seen:
                seen.add(v)
                union_versions.append(v)
                break

    # Tab is considered obsolete only when every child method is obsolete.
    all_obsolete = all(
        s.group('obsolete') == 'true' for s in sentinels
    )

    return union_versions, all_obsolete


def _auto_aggregate_tabs(markdown: str) -> str:
    """For every tab line that has no explicit metadata block, aggregate
    version/obsolete info from child method sentinels and:
      - rewrite the tab label with a range badge
      - inject a tab-level sentinel so _mark_obsolete_labels works correctly
    """
    def _replace_tab(m: re.Match) -> str:
        result = _aggregate_tab(markdown, m)
        if result is None:
            return m.group(0)   # no child methods — leave tab line unchanged

        union_versions, all_obsolete = result
        tab_line = m.group('tab') + '\n'  # restore the newline

        # Rewrite label with range badge.
        new_tab_line = _rewrite_tab_label(tab_line, union_versions)

        # Determine the indent of tab content (tab indent + 4).
        tab_indent = len(m.group('tab')) - len(m.group('tab').lstrip())
        sentinel_indent = ' ' * (tab_indent + 4)

        # Tab-level sentinel (no version badges or admonition — those belong
        # to individual methods, not the tab as a whole).
        sentinel = (
            f"{sentinel_indent}<!-- @method-meta "
            f"versions={json.dumps(union_versions)} "
            f"obsolete={'true' if all_obsolete else 'false'} -->\n"
        )

        return new_tab_line + sentinel

    return _TAB_LINE_RE.sub(_replace_tab, markdown)


# Matches a collapsible heading (any level) that has NO sentinel immediately
# after it. _expand_collapse_shorthand has already run, so we look for the
# { .collapse } attr_list in the heading. The negative lookahead ensures we
# skip headings that already got a sentinel from an explicit metadata block.
_COLLAPSE_HEADING_RE = re.compile(
    r'^(?P<heading>(?P<indent>[ \t]*)(?P<hashes>#{1,6}) [^\n]+\{[^}]*\.collapse[^}]*\})[ \t]*\n'
    r'(?P<blank>\n)?'
    r'(?![ \t]*<!-- @method-meta )',
    re.MULTILINE,
)


def _aggregate_collapsible_heading(markdown: str, m: re.Match) -> tuple[list[str], bool] | None:
    """Collect all child sentinels within the scope of a collapsible heading.

    Scope: from after the heading line to (but not including) the next heading
    whose level is <= this heading's level.
    Returns (union_versions, all_obsolete) or None if no sentinels found.
    """
    level = len(m.group('hashes'))
    scope_start = m.end()

    # A heading boundary is any heading at the same or higher level.
    # #{1,level}(?!#) matches exactly 1..level hashes not followed by another #.
    boundary_re = re.compile(
        r'^[ \t]*#{1,' + str(level) + r'}(?!#) ',
        re.MULTILINE,
    )
    boundary = boundary_re.search(markdown, scope_start)
    scope_end = boundary.start() if boundary else len(markdown)
    scope_text = markdown[scope_start:scope_end]

    sentinels = list(_CHILD_SENTINEL_RE.finditer(scope_text))
    if not sentinels:
        return None

    # Pre-parse sentinel version lists once.
    parsed_versions = []
    for s in sentinels:
        try:
            parsed_versions.append(json.loads(s.group('versions')))
        except Exception:
            parsed_versions.append([])

    # Union of versions in catalogue order (de-duplicated).
    seen: set[str] = set()
    union_versions: list[str] = []
    for v in _ALL_VERSIONS:
        for vlist in parsed_versions:
            if v in vlist and v not in seen:
                seen.add(v)
                union_versions.append(v)
                break

    all_obsolete = all(s.group('obsolete') == 'true' for s in sentinels)
    return union_versions, all_obsolete


def _auto_aggregate_collapsible_headings(markdown: str) -> str:
    """For every collapsible heading with no explicit metadata sentinel,
    aggregate version/obsolete info from all sentinels in its scope and:
      - inject a heading-level sentinel so _patch_headings adds a range badge
      - inject a heading-level sentinel so _mark_obsolete_headings works
    """
    def _replace(m: re.Match) -> str:
        result = _aggregate_collapsible_heading(markdown, m)
        if result is None:
            return m.group(0)  # no child methods — leave heading unchanged

        union_versions, all_obsolete = result
        heading = m.group('heading')
        blank = m.group('blank') or ''
        indent = m.group('indent')

        sentinel = (
            f"{indent}<!-- @method-meta "
            f"versions={json.dumps(union_versions)} "
            f"obsolete={'true' if all_obsolete else 'false'} -->\n"
        )

        return f"{heading}\n{blank}{sentinel}"

    return _COLLAPSE_HEADING_RE.sub(_replace, markdown)


def on_page_markdown(markdown: str, page, config, **kwargs) -> str:
    markdown = _expand_collapse_shorthand(markdown)
    if "---" not in markdown and '===' not in markdown and '{ .collapse' not in markdown:
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
    # Auto-aggregate tab metadata from child method sentinels.
    after_agg = _auto_aggregate_tabs(after_blocks)
    # Auto-aggregate collapsible heading metadata from child sentinels
    # (runs after tabs so tab-level sentinels are already available).
    after_agg = _auto_aggregate_collapsible_headings(after_agg)
    after_headings = _patch_headings(after_agg)
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
    sub-heading or nested tabbed-set).

    Uses ``<div>``/``</div>`` depth tracking to identify direct-child blocks
    of each tabbed-set, so nested tabbed-sets don't inflate the block index."""

    SET_OPEN  = re.compile(r'<div\b[^>]*class="tabbed-set[^"]*"[^>]*>')
    LABEL_RE  = re.compile(r'<label for="([^"]+)">')
    BLOCK_TAG = re.compile(r'<div class="tabbed-block">')
    DIV_RE    = re.compile(r'<div\b[^>]*>|</div>')
    META_OBS  = re.compile(
        r'<div class="ub-method-meta"[^>]*data-obsolete="true"'
    )
    NESTED_SET = re.compile(r'<div\b[^>]*class="tabbed-set')

    labels_to_mark: set[str] = set()

    for set_m in SET_OPEN.finditer(html):
        # Labels live between the set opening and its first tabbed-block.
        first_block = BLOCK_TAG.search(html, set_m.end())
        if not first_block:
            continue
        labels = LABEL_RE.findall(html[set_m.end():first_block.start()])
        if not labels:
            continue

        # Walk <div>…</div> tags from the set opening, tracking depth.
        # depth 0 = just inside the set's own div.
        # Direct-child tabbed-blocks open at depth 1 (inside tabbed-content).
        depth = 0
        block_count = 0
        block_start = -1          # content start of current direct block

        for tag_m in DIV_RE.finditer(html, set_m.end()):
            tag = tag_m.group()
            if tag.startswith('</'):
                depth -= 1
                if depth < 0:
                    break         # exited the set
                if depth == 1 and block_start >= 0:
                    # Closing a direct-child block — check for obsolete.
                    block_html = html[block_start:tag_m.start()]
                    # Restrict to content before any nested tabbed-set to
                    # avoid false positives from inner tab-level sentinels.
                    nested = NESTED_SET.search(block_html)
                    search_end = nested.start() if nested else len(block_html)
                    has_tab_obsolete = False
                    for obs_m in META_OBS.finditer(block_html, 0, search_end):
                        before = block_html[:obs_m.start()]
                        if not re.search(r'</h[1-6]>[\s<p>/]*$', before):
                            has_tab_obsolete = True
                            break
                    if has_tab_obsolete and block_count < len(labels):
                        labels_to_mark.add(labels[block_count])
                    block_count += 1
                    block_start = -1
            else:
                if depth == 1 and BLOCK_TAG.match(tag):
                    block_start = tag_m.end()
                depth += 1

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
