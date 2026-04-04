"""
Resolve filename-based uid: links to permanent UID-based uid: links.

Scans docs/wiki/**/*.md for markdown link targets of the form:

  [text](uid:my-filename)

where ``my-filename`` is a markdown filename stem (without the .md extension)
rather than a 3-char UID.  Resolves each filename to its assigned UID using
the wiki's frontmatter, then rewrites the source file in-place:

  [text](uid:my-filename)  →  [text](uid:XYZ)

This back-commit permanently stabilises the link so it survives future
file renames.  3-char UID references (all uppercase letters/digits) are
already permanent and are left untouched.

Designed to run in CI *after* generate_uids.py (so every page already has
a uid:) and *before* mkdocs build.  Idempotent — pages with no filename-
based uid: links are skipped without modification.

If a filename cannot be resolved (file doesn't exist or has no uid:), a
warning is printed and the link is left as-is so the build doesn't break.

Usage:
  python docs/worker/resolve_uid_links.py
"""

import re
import sys
from pathlib import Path

from common import ROOT, extract_frontmatter


# A 3-char UID is exactly 3 uppercase letters or digits.
# Anything else is treated as a filename stem.
_UID_RE = re.compile(r'^[A-Z0-9]{3}$')

# Matches (uid:something) in markdown link targets, e.g. [text](uid:my-page)
# Also matches image syntax ![alt](uid:my-page) — same rewrite applies.
_LINK_RE = re.compile(r'\(uid:([^)\s]+)\)')


def build_filename_map() -> dict[str, str]:
    """Return a mapping of filename stem → uid for all wiki pages."""
    wiki_dir = ROOT / 'docs' / 'wiki'
    mapping: dict[str, str] = {}
    for p in sorted(wiki_dir.rglob('*.md')):
        fm = extract_frontmatter(p)
        uid = fm.get('uid', '').strip()
        if uid:
            mapping[p.stem] = uid
    return mapping


def resolve_file(path: Path, filename_map: dict[str, str]) -> int:
    """Rewrite filename-based uid: links in *path* to UID-based ones.

    Returns the number of replacements made.
    """
    try:
        content = path.read_text(encoding='utf-8-sig')
    except Exception as e:
        print(f"Warning: could not read {path}: {e}", file=sys.stderr)
        return 0

    changes = 0
    warnings = []

    def replace_match(m: re.Match) -> str:
        nonlocal changes
        ref = m.group(1)
        # Already a 3-char UID — leave untouched
        if _UID_RE.match(ref):
            return m.group(0)
        # Resolve filename stem to UID
        uid = filename_map.get(ref)
        if uid:
            changes += 1
            return f'(uid:{uid})'
        else:
            warnings.append(ref)
            return m.group(0)

    new_content = _LINK_RE.sub(replace_match, content)

    for w in warnings:
        rel = path.relative_to(ROOT / 'docs')
        print(f"Warning: uid:{w} in {rel} — no matching file found, leaving as-is")

    if changes:
        path.write_text(new_content, encoding='utf-8-sig')
        rel = path.relative_to(ROOT / 'docs')
        print(f"Resolved {changes} uid: link(s) in {rel}")

    return changes


def resolve_uid_links() -> int:
    """Resolve all filename-based uid: links across the entire wiki.

    Returns total number of replacements made.
    """
    wiki_dir = ROOT / 'docs' / 'wiki'
    filename_map = build_filename_map()

    if not filename_map:
        print("Warning: no uid: fields found in any wiki page — run generate_uids.py first")
        return 0

    total = 0
    for p in sorted(wiki_dir.rglob('*.md')):
        total += resolve_file(p, filename_map)

    if total:
        print(f"Total: resolved {total} uid: link(s) site-wide")
    else:
        print("No filename-based uid: links found — nothing to do")

    return total


if __name__ == '__main__':
    resolve_uid_links()
