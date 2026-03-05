"""Auto-populate Glitchcraft nav section from docs/wiki/glitchcraft/ files."""

import os
import re

_FRONTMATTER_RE = re.compile(r'^---\s*\n(.*?)\n---', re.DOTALL)
_TITLE_RE = re.compile(r'^title:\s*["\']?(.*?)["\']?\s*$', re.MULTILINE)

GLITCHCRAFT_DIR = os.path.join('docs', 'wiki', 'glitchcraft')
GRIMOIRE_PATH = 'wiki/glitchcraft/_glitchcraft-grimoire.md'


def on_config(config):
    entries = []
    for fname in os.listdir(GLITCHCRAFT_DIR):
        if not fname.endswith('.md') or fname == '_glitchcraft-grimoire.md':
            continue
        fpath = os.path.join(GLITCHCRAFT_DIR, fname)
        title = None
        try:
            with open(fpath, 'r', encoding='utf-8') as f:
                head = f.read(2048)
            m = _FRONTMATTER_RE.match(head)
            if m:
                tm = _TITLE_RE.search(m.group(1))
                if tm:
                    title = tm.group(1)
        except OSError:
            pass
        if not title:
            title = fname.replace('-', ' ').replace('.md', '').title()
        rel = 'wiki/glitchcraft/' + fname
        entries.append((title, rel))

    entries.sort(key=lambda x: x[0].lower())

    # Find and update the Glitchcraft section in the nav
    for item in config['nav']:
        if isinstance(item, dict) and 'Glitchcraft' in item:
            gc_children = [{e[0]: e[1]} for e in entries]
            item['Glitchcraft'] = [{'Grimoire': GRIMOIRE_PATH}] + gc_children
            break

    return config
