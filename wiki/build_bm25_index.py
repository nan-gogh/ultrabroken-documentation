"""
Build a simple BM25-compatible index from the `docs/` markdown tree.

This script walks `docs/`, extracts plain text from markdown (enriched with
frontmatter fields such as abbreviation, description, aliases, tags, credits, and
versions), optionally chunks long pages, and writes `site/wiki_index.json`
(or gzipped) containing an array of objects suitable for BM25 retrieval.

Each index item includes:
  - id, title, path, chunk_index, text
  - abbreviation         – the short abbreviation (e.g. "ETS")
  - description  – one-line summary from frontmatter
  - aliases      – list of alternative names / slugs
  - tags         – list of category tags
  - credits      – list of credited discoverers / developers
  - versions     – list of game version strings
  - date         – ISO 8601 discovery / documentation date

The `text` field for every chunk is prefixed with a compact metadata header
so that abbreviation / tag / alias lookups resolve correctly even when the
body text is chunked. The header format is:

  [Title (ABBR) — description. Aliases: a1, a2. Tags: t1, t2.]

Usage:
  python build_bm25_index.py --output site/wiki_index.json --gzip

This is intended to be lightweight and run in CI or locally. It does NOT
produce embeddings — the Worker uses BM25 lexical retrieval over this index.
"""
from pathlib import Path
import argparse
import re
import json
import gzip


CHUNK_SIZE_WORDS = 400
CHUNK_OVERLAP_WORDS = 50


def find_repo_root(start: Path = None) -> Path:
    p = (start or Path(__file__)).resolve()
    for parent in [p] + list(p.parents):
        if (parent / 'mkdocs.yml').exists():
            return parent
    return Path(__file__).resolve().parents[1]


ROOT = find_repo_root()
DOCS = ROOT / 'docs'


def _parse_yaml_value(val: str):
    """Parse a simple YAML scalar or JSON-array value into a Python object."""
    val = val.strip()
    if val.startswith('['):
        try:
            return json.loads(val)
        except Exception:
            # Fallback: strip brackets and split on commas
            inner = val[1:-1]
            items = [s.strip().strip('"').strip("'") for s in inner.split(',') if s.strip()]
            return items
    # bare or quoted scalar
    return val.strip('"').strip("'")


def extract_frontmatter(md_path: Path) -> dict:
    """Return a dict of all YAML frontmatter fields found in *md_path*.

    Supports the glitchcraft frontmatter schema:
      title, abbreviation, description, versions, credits, date, aliases, tags
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


def _build_metadata_header(fm: dict) -> str:
    """Build a compact, human-readable prefix that encodes the key frontmatter
    fields into plain text so BM25 can match them alongside body text.

    Format (omits empty sections):
      Title (ABBR) — description. Aliases: a1, a2. Tags: t1, t2. Credits: c1, c2. Versions: v1, v2.
    """
    parts: list[str] = []

    title = fm.get('title', '')
    abbreviation = fm.get('abbreviation', '')
    description = fm.get('description', '')

    # Title + abbreviation
    if title and abbreviation:
        parts.append(f"{title} ({abbreviation})")
    elif title:
        parts.append(title)
    elif abbreviation:
        parts.append(abbreviation)

    if description:
        parts.append(description)

    aliases = fm.get('aliases', [])
    if aliases:
        parts.append("Aliases: " + ", ".join(aliases))

    tags = fm.get('tags', [])
    if tags:
        parts.append("Tags: " + ", ".join(tags))

    credits_ = fm.get('credits', [])
    if credits_:
        parts.append("Credits: " + ", ".join(credits_))

    versions = fm.get('versions', [])
    if versions:
        parts.append("Versions: " + ", ".join(versions))

    return ". ".join(parts).rstrip('.') + '.' if parts else ''


def extract_text(md_path: Path) -> str:
    # read with utf-8-sig to remove any BOM present
    text = md_path.read_text(encoding='utf-8-sig')
    # strip YAML frontmatter
    text = re.sub(r'^---[\s\S]*?---\s*', '', text)
    # remove leading ATX headings (e.g. "# Title" or "## Subtitle") to keep excerpts clean
    text = re.sub(r'^[ \t]*#{1,6}\s+.*?\n', '', text)
    # remove images and links
    text = re.sub(r'!\[[^\]]*\]\([^\)]*\)', '', text)
    text = re.sub(r'\[[^\]]*\]\([^\)]*\)', '', text)
    # remove code fences
    text = re.sub(r'```[\s\S]*?```', '', text)
    # collapse multiple whitespace
    text = re.sub(r'\s+', ' ', text)
    return text.strip()


def chunk_text_words(text: str, size: int = CHUNK_SIZE_WORDS, overlap: int = CHUNK_OVERLAP_WORDS):
    words = text.split()
    if not words:
        return []
    chunks = []
    start = 0
    while start < len(words):
        end = min(start + size, len(words))
        chunk = " ".join(words[start:end])
        chunks.append(chunk)
        if end == len(words):
            break
        start = end - overlap
    return chunks


def extract_title(md_path: Path) -> str:
    """Extract a human-friendly title for the page.

    Strategy (in order):
    1. YAML frontmatter `title` key (if present)
    2. First ATX H1 (`# Title`) or H2 (`## Title`)
    3. Setext-style H1/H2 (underlines with === or ---)
    4. Fallback to filename stem (caller can handle that)
    """
    try:
        # read with utf-8-sig to strip a BOM if present (matches extract_text behavior)
        raw = md_path.read_text(encoding='utf-8-sig')
    except Exception:
        return None

    # 1) YAML frontmatter title
    m = re.match(r'^---[\s\S]*?---', raw)
    if m:
        fm = m.group(0)
        mm = re.search(r'^title:\s*(?:"([^"]+)"|\'([^\']+)\'|(.+))', fm, flags=re.IGNORECASE | re.MULTILINE)
        if mm:
            for g in mm.groups():
                if g:
                    return g.strip().strip('"').strip("'")

    # strip frontmatter for further searches
    body = re.sub(r'^---[\s\S]*?---\s*', '', raw)

    # 2) ATX headings: look for H1 then H2
    m = re.search(r'^[ \t]*#\s+(.+)$', body, flags=re.MULTILINE)
    if m:
        return m.group(1).strip()
    m = re.search(r'^[ \t]*##\s+(.+)$', body, flags=re.MULTILINE)
    if m:
        return m.group(1).strip()

    # 3) Setext-style headings (underlines)
    # find a line followed by a line of === or ---
    m = re.search(r'^(?P<title>.+?)\r?\n(?P<underline>[-=]{3,})\r?\n', body, flags=re.MULTILINE)
    if m:
        return m.group('title').strip()

    return None


def walk_docs(chunk: bool = True):
    items = []
    for p in sorted(DOCS.rglob('*.md')):
        rel = p.relative_to(DOCS)
        # skip hidden or dot folders
        if rel.parts and str(rel.parts[0]).startswith('.'):
            continue

        fm = extract_frontmatter(p)

        # prefer an extracted title (YAML frontmatter, H1/H2, Setext), fall back to filename stem
        title = fm.get('title') or extract_title(p) or rel.stem
        full_text = extract_text(p)
        if not full_text:
            continue

        # Normalize site-relative paths. When indexing the `wiki` subtree
        # produce paths under `/wiki/...`. Otherwise keep the site root
        # index at `/`.
        is_wiki_subtree = (str(DOCS).rstrip('/').endswith('/wiki') or DOCS.name == 'wiki')
        if rel == Path('index.md') and not is_wiki_subtree:
            path = '/'
        else:
            parts = list(rel.with_suffix('').parts)
            if is_wiki_subtree and (not parts or parts[0] != 'wiki'):
                parts = ['wiki'] + parts
            path = '/' + '/'.join(parts) + '/'

        # Structured metadata fields extracted from frontmatter
        meta = {
            'abbreviation':        fm.get('abbreviation', ''),
            'description': fm.get('description', ''),
            'aliases':     fm.get('aliases', []),
            'tags':        fm.get('tags', []),
            'credits':     fm.get('credits', []),
            'versions':    fm.get('versions', []),
            'date':        fm.get('date', ''),
        }

        # Compact header prepended to every chunk so abbreviation/tag/alias queries
        # resolve regardless of which chunk is retrieved.
        header = _build_metadata_header(fm)

        def make_item(text_chunk: str, chunk_index: int) -> dict:
            enriched_text = (header + ' ' + text_chunk).strip() if header else text_chunk
            return {
                'id': str(rel),
                'title': title,
                'path': path,
                'chunk_index': chunk_index,
                'text': enriched_text,
                **meta,
            }

        if chunk:
            chunks = chunk_text_words(full_text)
            for i, c in enumerate(chunks):
                items.append(make_item(c, i))
        else:
            items.append(make_item(full_text, 0))

    return items

def build_index(output: str, gzip_output: bool = False, chunk: bool = True):
    items = walk_docs(chunk=chunk)
    out = Path(output)
    out.parent.mkdir(parents=True, exist_ok=True)
    payload = json.dumps(items, ensure_ascii=False)
    if gzip_output:
        if not str(out).endswith('.gz'):
            out = Path(str(out) + '.gz')
        with gzip.open(out, 'wt', encoding='utf-8') as fh:
            fh.write(payload)
    else:
        out.write_text(payload, encoding='utf-8')
    print('WROTE', out)


def build_grimoire_data(output: str):
    """Generate grimoire-data.json for the grimoire sort/filter UI.

    Scans docs/wiki/glitchcraft/ for glitch entry files, extracts frontmatter
    fields, and writes a compact JSON array identical in schema to the previously
    hand-maintained grimoire-data.json it replaces.

    Non-glitch files (those without a frontmatter `title` field, or known
    index/meta pages) are skipped.

    Schema per entry:
      name      – frontmatter title
      abbr      – frontmatter abbreviation
      date      – frontmatter date (ISO 8601 string)
      tags      – frontmatter tags list
      versions  – frontmatter versions list
      credits   – frontmatter credits list
      href      – relative link to the .md file, e.g. "./l-sprinting.md"
    """
    _SKIP = {'_glitchcraft-grimoire'}  # non-entry pages to exclude

    glitchcraft_dir = ROOT / 'docs' / 'wiki' / 'glitchcraft'
    entries = []
    for p in sorted(glitchcraft_dir.glob('*.md')):
        if p.stem in _SKIP:
            continue
        fm = extract_frontmatter(p)
        title = fm.get('title', '')
        if not title:
            continue  # skip pages without a title (index/meta pages)
        entries.append({
            'name':     title,
            'abbr':     fm.get('abbreviation', ''),
            'date':     fm.get('date', ''),
            'tags':     fm.get('tags', []),
            'versions': fm.get('versions', []),
            'credits':  fm.get('credits', []),
            'href':     f'./{p.name}',
        })
    out = Path(output)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(entries, ensure_ascii=False), encoding='utf-8')
    print('WROTE', out)



_CONTRIBUTORS_JSON = ROOT / 'docs' / 'assets' / 'data' / 'hunter-socials.json'


def build_leaderboard(json_path: str):
    """Write _leaderboard-data.json with pre-computed ranked contributor counts.

    Scans docs/wiki/glitchcraft/ for all credit entries, tallies per name,
    and writes a JSON file consumed by leaderboard.js to render the table
    client-side in memorial.md.

    Contributor profile URLs are read from contributors.json (manually maintained).
    """
    from collections import Counter
    from datetime import date
    from itertools import groupby

    # Load manually-maintained contributor links
    contributor_links: dict[str, str] = {}
    if _CONTRIBUTORS_JSON.exists():
        try:
            contributor_links = json.loads(_CONTRIBUTORS_JSON.read_text(encoding='utf-8'))
        except Exception:
            pass

    _SKIP = {'_glitchcraft-grimoire'}
    glitchcraft_dir = ROOT / 'docs' / 'wiki' / 'glitchcraft'

    counts: Counter = Counter()
    for p in glitchcraft_dir.glob('*.md'):
        if p.stem in _SKIP:
            continue
        fm = extract_frontmatter(p)
        if not fm.get('title'):
            continue
        for name in fm.get('credits', []):
            if name := name.strip():
                counts[name] += 1

    ranked = sorted(counts.items(), key=lambda x: (-x[1], x[0].lower()))
    total = len(ranked)
    updated = date.today().isoformat()

    entries = []
    for rank, (count, group) in enumerate(groupby(ranked, key=lambda x: x[1]), start=1):
        for name, _ in group:
            entries.append({
                'rank': rank,
                'name': name,
                'url': contributor_links.get(name),
                'count': count,
            })

    payload = {'total': total, 'updated': updated, 'entries': entries}
    out = Path(json_path)
    out.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f'WROTE leaderboard ({total} contributors) -> {json_path}')


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--output', '-o', default='site/wiki_index.json')
    p.add_argument('--gzip', action='store_true')
    p.add_argument('--no-chunk', dest='chunk', action='store_false', help='Do not chunk pages; emit one item per page')
    p.add_argument('--docs-dir', default='docs', help='Path under the repo root to read markdown from (e.g. docs/wiki)')
    p.add_argument(
        '--grimoire-output', '-g',
        default=str(ROOT / 'docs' / 'assets' / 'data' / 'grimoire-data.json'),
        help='Path to write grimoire-data.json (default: docs/assets/data/grimoire-data.json)',
    )
    p.add_argument('--no-grimoire', dest='grimoire', action='store_false',
                   help='Skip generating grimoire-data.json')
    p.add_argument(
        '--leaderboard-output', '-l',
        default=str(ROOT / 'docs' / 'assets' / 'data' / 'leaderboard-data.json'),
        help='Path to write leaderboard-data.json (default: docs/assets/data/leaderboard-data.json)',
    )
    p.add_argument('--no-leaderboard', dest='leaderboard', action='store_false',
                   help='Skip updating the Hall of Fame leaderboard')
    args = p.parse_args()
    # allow overriding which docs subtree to index (default 'docs')
    global DOCS
    DOCS = ROOT / args.docs_dir
    build_index(args.output, gzip_output=args.gzip, chunk=args.chunk)
    if args.grimoire:
        build_grimoire_data(args.grimoire_output)
    if args.leaderboard:
        build_leaderboard(args.leaderboard_output)


if __name__ == '__main__':
    main()
