"""Shared utilities for docs/worker/ scripts."""

import json
import re
from pathlib import Path


def _find_repo_root() -> Path:
    p = Path(__file__).resolve()
    for parent in [p] + list(p.parents):
        if (parent / 'mkdocs.yml').exists():
            return parent
    return p.parents[2]


ROOT = _find_repo_root()


def _parse_yaml_value(val: str):
    """Parse a simple YAML scalar or JSON-array value into a Python object."""
    val = val.strip()
    if val.lower() == 'true':
        return True
    if val.lower() == 'false':
        return False
    if val.startswith('['):
        try:
            return json.loads(val)
        except Exception:
            inner = val[1:-1]
            return [s.strip().strip('"').strip("'") for s in inner.split(',') if s.strip()]
    return val.strip('"').strip("'")


def extract_frontmatter(md_path: Path) -> dict:
    """Return a dict of all YAML frontmatter fields found in *md_path*.

    Supports the glitchcraft frontmatter schema:
      title, label, description, versions, credits, date, aliases, tags
    """
    try:
        raw = md_path.read_text(encoding='utf-8-sig')
    except Exception:
        return {}
    m = re.match(r'^---\s*\n([\s\S]*?)\n---', raw)
    if not m:
        return {}
    fields: dict = {}
    for line in m.group(1).splitlines():
        km = re.match(r'^([a-zA-Z_]\w*):\s*(.*)', line)
        if not km:
            continue
        key, raw_val = km.group(1), km.group(2)
        fields[key] = _parse_yaml_value(raw_val)
    return fields
