"""
Generate unique 3-character alphanumeric UIDs for all wiki pages.

Scans docs/wiki/**/*.md for markdown files missing a ``uid:`` frontmatter
field, generates a random UID (A-Z0-9, 46 656 possible values), and writes it
into the source file immediately after the ``title:`` field.

Designed to run in CI before ``mkdocs build`` so that uid_links.py can rewrite
URLs on the first deploy.  Idempotent — files that already have a UID are
skipped.

Skipped files:
  - _glitchcraft-grimoire (meta/index page, not a content page)
  - blank.md  (editor template, not a real page)
  - Any file without a title: field

Usage:
  python docs/worker/generate_uids.py
"""

import hashlib
import re
import string
import time
from pathlib import Path

from common import ROOT, extract_frontmatter


# Files to skip (by stem) when generating UIDs site-wide
_SKIP_STEMS = {'_glitchcraft-grimoire', 'blank'}


def generate_uids() -> set[str]:
    """Scan all wiki pages and generate UIDs for any files missing one.

    Returns the set of all UIDs (existing + newly generated).
    """
    wiki_dir = ROOT / 'docs' / 'wiki'

    parsed_files = []
    existing_uids: set[str] = set()

    # First pass: collect all existing UIDs across the entire wiki
    for p in sorted(wiki_dir.rglob('*.md')):
        if p.stem in _SKIP_STEMS:
            continue
        fm = extract_frontmatter(p)
        uid = fm.get('uid')
        if uid:
            existing_uids.add(uid)

    # Second pass: collect files that need UIDs
    for p in sorted(wiki_dir.rglob('*.md')):
        if p.stem in _SKIP_STEMS:
            continue
        fm = extract_frontmatter(p)
        title = fm.get('title', '')
        if not title:
            continue
        parsed_files.append((p, fm, title))

    charset = string.ascii_uppercase + string.digits

    for p, fm, title in parsed_files:
        uid = fm.get('uid')
        if uid:
            continue

        # Generate a random 3-char alphanumeric UID, unique site-wide
        seed_str = str(time.time_ns())
        hash_hex = hashlib.md5(seed_str.encode()).hexdigest()
        uid = ''.join(charset[int(hash_hex[i:i+2], 16) % 36] for i in range(0, 6, 2))

        attempts = 0
        while uid in existing_uids and attempts < 1000:
            seed_str = f"{time.time_ns()}{attempts}"
            hash_hex = hashlib.md5(seed_str.encode()).hexdigest()
            uid = ''.join(charset[int(hash_hex[i:i+2], 16) % 36] for i in range(0, 6, 2))
            attempts += 1

        existing_uids.add(uid)

        try:
            content = p.read_text(encoding='utf-8-sig')
            fm_match = re.search(r'^---\n(.*?)\n---\n', content, re.DOTALL)
            if fm_match:
                frontmatter = fm_match.group(1)
                new_frontmatter = re.sub(
                    r'(title:.*?\n)',
                    f'\\1uid: "{uid}"\n',
                    frontmatter,
                    count=1
                )
                if new_frontmatter != frontmatter and 'uid:' not in frontmatter:
                    new_content = content.replace(
                        f'---\n{frontmatter}\n---',
                        f'---\n{new_frontmatter}\n---'
                    )
                    p.write_text(new_content, encoding='utf-8-sig')
                    print(f"Generated new UID {uid} for {p.relative_to(ROOT / 'docs')}")
        except Exception as e:
            print(f"Warning: failed to write UID {uid} to {p.name}: {e}")

    return existing_uids


if __name__ == '__main__':
    generate_uids()
