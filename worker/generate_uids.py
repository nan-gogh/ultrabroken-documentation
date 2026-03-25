"""
Generate unique 3-character alphanumeric UIDs for new glitchcraft pages.

Scans docs/wiki/glitchcraft/ for markdown files missing a ``uid:`` frontmatter
field, generates a random UID (A-Z0-9, 46 656 possible values), and writes it
into the source file immediately after the ``title:`` field.

Designed to run in CI before ``mkdocs build`` so that uid_links.py can rewrite
URLs on the first deploy.  Idempotent — files that already have a UID are
skipped.

Usage:
  python docs/worker/generate_uids.py
"""

import hashlib
import re
import string
import time
from pathlib import Path

from common import ROOT, extract_frontmatter


def generate_uids() -> set[str]:
    """Scan glitchcraft pages and generate UIDs for any files missing one.

    Returns the set of all UIDs (existing + newly generated).
    """
    _SKIP = {'_glitchcraft-grimoire'}
    glitchcraft_dir = ROOT / 'docs' / 'wiki' / 'glitchcraft'

    parsed_files = []
    existing_uids: set[str] = set()

    for p in sorted(glitchcraft_dir.glob('*.md')):
        if p.stem in _SKIP:
            continue
        fm = extract_frontmatter(p)
        title = fm.get('title', '')
        if not title:
            continue
        uid = fm.get('uid')
        if uid:
            existing_uids.add(uid)
        parsed_files.append((p, fm, title))

    charset = string.ascii_uppercase + string.digits

    for p, fm, title in parsed_files:
        uid = fm.get('uid')
        if uid:
            continue

        # Generate a random 3-char alphanumeric UID
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
                    print(f"Generated new UID {uid} for {p.name}")
        except Exception as e:
            print(f"Warning: failed to write UID {uid} to {p.name}: {e}")

    return existing_uids


if __name__ == '__main__':
    generate_uids()
