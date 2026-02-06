#!/usr/bin/env python3
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
OTHER = ROOT / 'docs' / 'other'
INDEX = OTHER / 'index.md'

files = sorted([p for p in OTHER.glob('*.md') if p.name != 'index.md'])

lines = [
    '---',
    'title: "Glitch Index"',
    '---',
    '',
    '# Glitch Index',
    '',
    'This page lists generated glitch stubs created from the community CSV.',
    ''
]

for p in files:
    # attempt to read title from frontmatter or first header
    title = None
    try:
        with p.open('r', encoding='utf-8') as f:
            for _ in range(8):
                line = f.readline()
                if not line:
                    break
                m = re.match(r'^title:\s*"?(.*?)"?\s*$', line.strip(), re.I)
                if m:
                    title = m.group(1)
                    break
                if line.startswith('#'):
                    title = line.lstrip('#').strip()
                    break
    except Exception:
        title = None
    if not title:
        title = p.stem

    rel = p.name
    lines.append(f'- [{title}](./{rel})')

lines.append('')

INDEX.write_text('\n'.join(lines), encoding='utf-8')
print(f'Wrote index to {INDEX} ({len(files)} entries)')
