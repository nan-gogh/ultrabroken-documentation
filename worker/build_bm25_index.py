"""
Build a simple BM25-compatible index from the `docs/` markdown tree.

This script walks `docs/`, extracts plain text from markdown (enriched with
frontmatter fields such as tag, description, aliases, tags, credits, and
versions), optionally chunks long pages, and writes `site/wiki_index.json`
(or gzipped) containing an array of objects suitable for BM25 retrieval.

Each index item includes:
  - id, title, path, chunk_index, text
  - label        – the short label/abbreviation (e.g. "ETS")
  - description  – one-line summary from frontmatter
  - aliases      – list of alternative names / slugs
  - tags         – list of category tags
  - credits      – list of credited discoverers / developers
  - versions     – list of game version strings
  - date         – ISO 8601 discovery / documentation date

The `text` field for every chunk is prefixed with a compact metadata header
so that tag / alias lookups resolve correctly even when the
body text is chunked. The header format is:

  [Title (ABBR) — description. Aliases: a1, a2. Tags: t1, t2.]

Usage:
  python docs/worker/build_bm25_index.py --output site/wiki_index.json --gzip

This is intended to be lightweight and run in CI or locally. It does NOT
produce embeddings — the Worker uses BM25 lexical retrieval over this index.
"""
from pathlib import Path
from collections import Counter
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
    return Path(__file__).resolve().parents[2]


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


def _build_metadata_header(fm: dict) -> str:
    """Build a compact, human-readable prefix that encodes the key frontmatter
    fields into plain text so BM25 can match them alongside body text.

    Format (omits empty sections):
      Title (ABBR) — description. Aliases: a1, a2. Tags: t1, t2. Credits: c1, c2. Versions: v1, v2.
    """
    parts: list[str] = []

    title = fm.get('title', '')
    label = fm.get('label', '')
    description = fm.get('description', '')

    # Title + tag
    if title and label:
        parts.append(f"{title} ({label})")
    elif title:
        parts.append(title)
    elif label:
        parts.append(label)

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


def walk_docs(chunk: bool = True, exclude: list[str] | None = None):
    import fnmatch
    _exclude = exclude or []
    items = []
    for p in sorted(DOCS.rglob('*.md')):
        rel = p.relative_to(DOCS)
        # skip hidden or dot folders
        if rel.parts and str(rel.parts[0]).startswith('.'):
            continue
        # skip paths matching any --exclude glob pattern
        rel_posix = rel.as_posix()
        if any(fnmatch.fnmatch(rel_posix, pat) for pat in _exclude):
            continue

        fm = extract_frontmatter(p)

        # skip draft and unlisted pages
        if fm.get('draft') is True or fm.get('unlisted') is True:
            continue

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
            
            # UID-based permalink remapping for glitchcraft pages
            # Mirrors the uid_links.py hook behavior during MkDocs build
            rel_posix = rel.as_posix()
            uid = fm.get('uid', '')
            if uid and rel_posix.startswith('glitchcraft/') and '_glitchcraft-grimoire' not in rel_posix:
                # Replace filename with UID: wiki/glitchcraft/{uid}/
                parts = ['wiki', 'glitchcraft', uid]
            
            path = '/' + '/'.join(parts) + '/'

        # Structured metadata fields extracted from frontmatter
        meta = {
            'label':       fm.get('label', ''),
            'description': fm.get('description', ''),
            'aliases':     fm.get('aliases', []),
            'tags':        fm.get('tags', []),
            'credits':     fm.get('credits', []),
            'versions':    fm.get('versions', []),
            'date':        fm.get('date', ''),
        }

        # Compact header prepended to every chunk so tag/alias queries
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

def build_index(output: str, gzip_output: bool = False, chunk: bool = True, exclude: list[str] | None = None):
    items = walk_docs(chunk=chunk, exclude=exclude)
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


def build_grimoire_data(output: str) -> tuple[list, Counter]:
    """Generate grimoire-data.json for the grimoire sort/filter UI.

    Scans docs/wiki/glitchcraft/ for glitch entry files, extracts frontmatter
    fields, and writes a compact JSON array identical in schema to the previously
    hand-maintained grimoire-data.json it replaces.

    Non-glitch files (those without a frontmatter `title` field, or known
    index/meta pages) are skipped.

    Schema per entry:
      name      – frontmatter title
      abbr      – frontmatter tag
      date      – frontmatter date (ISO 8601 string)
      tags      – frontmatter tags list
      versions  – frontmatter versions list
      credits   – frontmatter credits list
      href      – relative link to the .md file, e.g. "./l-sprinting.md"

    Returns:
      (entries, all_credits) where all_credits is a Counter of {name: count}
      tallied across all glitch files. Passed directly to build_leaderboard()
      to avoid scanning the same files a second time.
    """
    _SKIP = {'_glitchcraft-grimoire'}  # non-entry pages to exclude

    glitchcraft_dir = ROOT / 'docs' / 'wiki' / 'glitchcraft'
    entries = []
    all_credits: Counter = Counter()
    tags_set: set[str] = set()
    
    parsed_files = []
    existing_uids = set()

    for p in sorted(glitchcraft_dir.glob('*.md')):
        if p.stem in _SKIP:
            continue
        fm = extract_frontmatter(p)
        title = fm.get('title', '')
        if not title:
            continue  # skip pages without a title (index/meta pages)
            
        uid = fm.get('uid')
        if uid:
            existing_uids.add(uid)
            
        parsed_files.append((p, fm, title))

    import time
    import hashlib
    import string
    
    for p, fm, title in parsed_files:
        uid = fm.get('uid')
        if not uid:
            # Use nanoseconds for unique seeds
            seed_str = str(time.time_ns())
            hash_hex = hashlib.md5(seed_str.encode()).hexdigest()
            charset = string.ascii_uppercase + string.digits
            
            # Convert pairs of hex chars (0-255) and mod into charset (0-35)
            # This ensures good distribution across letters AND digits
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
                        
                        # Also update the H1 title to include label and uid
                        label = fm.get('label', '')
                        if label:
                            body_after_fm = new_content[fm_match.end():]
                            h1_match = re.search(r'^#\s+(.+?)\s*\n', body_after_fm, re.MULTILINE)
                            if h1_match:
                                old_h1 = h1_match.group(0)
                                title_text = h1_match.group(1)
                                # Remove any existing backticks if present
                                title_clean = re.sub(r'\s+`.*`', '', title_text)
                                new_h1 = f"# {title_clean} `{label}` `{uid}`\n"
                                new_content = new_content.replace(old_h1, new_h1, 1)
                        
                        p.write_text(new_content, encoding='utf-8-sig')
                        print(f"Generated new UID {uid} for {p.name}")
            except Exception as e:
                print(f"Warning: failed to write UID {uid} to {p.name}: {e}")

        credits_list = [c.strip() for c in fm.get('credits', []) if c.strip()]
        for name in credits_list:
            all_credits[name] += 1
        for t in fm.get('tags', []):
            if t := (t or '').strip():
                tags_set.add(t)
        entries.append({
            'name':     title,
            'uid':      uid,
            'label':    fm.get('label', ''),
            'date':     fm.get('date', ''),
            'tags':     fm.get('tags', []),
            'versions': fm.get('versions', []),
            'credits':  credits_list,
            'aliases':  fm.get('aliases', []),
            'href':     f'./{uid}/',
            'filename': p.name,
        })
    out = Path(output)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(entries, ensure_ascii=False), encoding='utf-8')
    print('WROTE', out)
    return entries, all_credits, tags_set



_CONTRIBUTORS_JSON = ROOT / 'docs' / 'assets' / 'data' / 'credits.json'

_GLOSSARY_JSON = ROOT / 'docs' / 'assets' / 'data' / 'glossary.json'


_TAGS_JSON = ROOT / 'docs' / 'assets' / 'data' / 'tags.json'


def aggregate_contributors(discovered_credits: set[str]) -> None:
    """Merge newly-discovered credit names into credits.json.

    New names are added with an empty URL ("") as a pending placeholder
    indicating that a social link is pending manual entry. Existing entries
    are never overwritten.

    Empty-URL entries are intentionally skipped by contributor_links.py so
    they render as plain text (not broken links) until a URL is provided.

    Also detects orphans (entries in JSON no longer referenced in frontmatter)
    and prints a warning. Keys are sorted alphabetically for cleaner diffs.
    """
    existing: dict[str, str] = {}
    if _CONTRIBUTORS_JSON.exists():
        try:
            existing = json.loads(_CONTRIBUTORS_JSON.read_text(encoding='utf-8'))
        except Exception:
            pass

    # Detect orphans: names in JSON that no longer appear in any frontmatter
    orphans = sorted(name for name in existing if name not in discovered_credits)
    if orphans:
        print(f'WARNING: credits.json contains {len(orphans)} orphan(s) not in frontmatter: {', '.join(orphans)}')

    new_names = sorted(name for name in discovered_credits if name and name not in existing)
    for name in new_names:
        existing[name] = ''

    # Sort keys alphabetically for cleaner diffs
    sorted_existing = dict(sorted(existing.items(), key=lambda x: x[0].lower()))

    if list(existing.keys()) != list(sorted_existing.keys()) or new_names:
        _CONTRIBUTORS_JSON.write_text(
            json.dumps(sorted_existing, ensure_ascii=False, indent=2),
            encoding='utf-8'
        )
        if new_names:
            print(f'UPDATED credits.json (+{len(new_names)} pending: {', '.join(new_names)})')
        else:
            print('NORMALIZED credits.json (re-sorted keys)')


def aggregate_tags(discovered_tags: set[str]) -> None:
    """Merge newly-discovered tag names into tags.json.

    The file is a JSON object mapping tag names to metadata (empty string
    for now). New tags are added with an empty value as a placeholder.
    Existing entries are kept unless they are orphaned (no longer referenced
    in any frontmatter), in which case they are removed.
    
    Orphan detection: tags in JSON that are no longer referenced anywhere
    are removed to keep the file clean and prevent stale tag entries.

    Keys are sorted alphabetically for cleaner diffs.
    """
    existing: dict[str, str] = {}
    if _TAGS_JSON.exists():
        try:
            existing = json.loads(_TAGS_JSON.read_text(encoding='utf-8'))
        except Exception:
            pass

    # Detect orphans: tags in JSON that no longer appear in any frontmatter
    orphans = sorted(tag for tag in existing if tag not in discovered_tags)
    removed_count = 0
    if orphans:
        for orphan in orphans:
            del existing[orphan]
        removed_count = len(orphans)
        print(f'  REMOVED: {len(orphans)} orphan tag(s) no longer in use: {", ".join(orphans)}')

    new_tags = sorted(tag for tag in discovered_tags if tag and tag not in existing)
    for tag in new_tags:
        existing[tag] = ''

    # Sort keys alphabetically for cleaner diffs
    sorted_existing = dict(sorted(existing.items(), key=lambda x: x[0].lower()))

    if list(existing.keys()) != list(sorted_existing.keys()) or new_tags or removed_count:
        _TAGS_JSON.write_text(
            json.dumps(sorted_existing, ensure_ascii=False, indent=2),
            encoding='utf-8'
        )
        if new_tags and removed_count:
            print(f'UPDATED tags.json (+{len(new_tags)} new, {removed_count} removed)')
        elif new_tags:
            print(f'UPDATED tags.json (+{len(new_tags)} new tags: {", ".join(new_tags)})')
        elif removed_count:
            print(f'UPDATED tags.json ({removed_count} orphan tags removed)')
        else:
            print('NORMALIZED tags.json (re-sorted keys)')


def build_glossary(grimoire_entries: list | None = None) -> None:
    """Build glossary.json from glitchcraft frontmatter.

    Each entry maps a glitch to its name, abbreviation, aliases, and path
    so the glitch_autolink MkDocs hook can link mentions by any of those
    strings to the corresponding glitch page.

    Schema per entry:
      name    – frontmatter title (e.g. "Extended Throw Sprinting")
      abbr      – frontmatter tag (e.g. "ETS")
      aliases – list of alternative names (e.g. ["extended-throw-sprinting"])
      path    – site-relative path (e.g. "wiki/glitchcraft/extended-throw-sprinting/")

    If *grimoire_entries* is provided (from build_grimoire_data) it is reused
    to avoid scanning the filesystem a second time.
    
    Handles cache invalidation for deleted and renamed files:
      - Detects when files are deleted (UID in old glossary but not in new entries)
      - Detects when files are renamed (UID found but filename changed) and updates the filename field
      - Removes stale entries from the glossary
    """
    if grimoire_entries is None:
        glitchcraft_dir = ROOT / 'docs' / 'wiki' / 'glitchcraft'
        grimoire_entries = []
        for p in sorted(glitchcraft_dir.glob('*.md')):
            if p.stem.startswith('_'):
                continue
            fm = extract_frontmatter(p)
            title = fm.get('title', '')
            uid = fm.get('uid', '')
            if not title:
                continue
            grimoire_entries.append({
                'name': title,
                'uid': uid,
                'label': fm.get('label', ''),
                'aliases': fm.get('aliases', []),
                'href': f'./{uid}/',
                'filename': p.name,
            })

    # Build mapping of UID -> grimoire entry for fast lookup
    new_entries_by_uid = {entry.get('uid'): entry for entry in grimoire_entries if entry.get('uid')}

    # Load old glossary to detect deleted/renamed files
    old_glossary_by_uid = {}
    deleted_uids = []
    renamed_uids = []
    
    if _GLOSSARY_JSON.exists():
        try:
            old_glossary = json.loads(_GLOSSARY_JSON.read_text(encoding='utf-8'))
            old_glossary_by_uid = {entry.get('uid'): entry for entry in old_glossary if entry.get('uid')}
        except (json.JSONDecodeError, IOError) as e:
            print(f'WARNING: Could not load old glossary.json for cache validation: {e}')
            old_glossary_by_uid = {}

    # Detect deleted files (UIDs in old glossary but not in new entries)
    for old_uid in old_glossary_by_uid:
        if old_uid not in new_entries_by_uid:
            deleted_uids.append(old_uid)

    # Build new glossary with validation
    glossary = []
    for entry in grimoire_entries:
        name = entry.get('name', '')
        if not name:
            continue
        
        uid = entry.get('uid', '')
        filename = entry.get('filename')
        
        if uid:
            path = f'wiki/glitchcraft/{uid}/'
        elif filename:
            path = f'wiki/glitchcraft/{filename.replace(".md", "")}/'
        else:
            path = f'wiki/glitchcraft/{entry.get("href", "").replace("./", "").replace(".md", "")}/'

        aliases = entry.get('aliases', [])
        if isinstance(aliases, str):
            aliases = [aliases]

        # Check if this UID was renamed (existed in old glossary with different filename)
        old_entry = old_glossary_by_uid.get(uid)
        old_filename = old_entry.get('filename') if old_entry else None
        
        if old_entry and old_filename and old_filename != filename:
            renamed_uids.append((uid, old_filename, filename))
            print(f'  RENAMED: {uid}: {old_filename} → {filename}')
        
        glossary.append({
            'name': name,
            'uid': uid,
            'label': entry.get('label', ''),
            'aliases': aliases,
            'path': path,
            'filename': filename
        })

    # Report cache invalidation results
    if deleted_uids:
        print(f'  DELETED: {len(deleted_uids)} file(s) removed from glossary: {", ".join(deleted_uids)}')
    if renamed_uids:
        print(f'  RENAMED: {len(renamed_uids)} file(s) detected')

    _GLOSSARY_JSON.parent.mkdir(parents=True, exist_ok=True)
    _GLOSSARY_JSON.write_text(
        json.dumps(glossary, ensure_ascii=False, indent=2),
        encoding='utf-8'
    )
    print(f'WROTE glossary.json ({len(glossary)} entries, {len(deleted_uids)} deleted) -> {_GLOSSARY_JSON}')


_GRAPH_JSON = ROOT / 'docs' / 'assets' / 'data' / 'graph.json'


def build_graph(glossary_entries: list | None = None) -> None:
    """Build graph.json — a node/edge graph of how glitchcraft pages reference each other.

    For each glitchcraft page, reads its markdown body and checks which other
    glossary entries (by name, label, or alias) are mentioned. Produces
    a graph suitable for a force-directed visualisation.

    Schema:
      {
        "nodes": [{"id": "wiki/glitchcraft/slug/", "name": "Glitch Name", "tag": "GN"}],
        "edges": [{"source": "wiki/glitchcraft/a/", "target": "wiki/glitchcraft/b/"}]
      }

    Edges are directional: source mentions target. Duplicate edges are removed.
    Self-references are excluded.
    """
    # Load glossary entries if not provided
    if glossary_entries is None:
        if _GLOSSARY_JSON.exists():
            glossary_entries = json.loads(_GLOSSARY_JSON.read_text(encoding='utf-8'))
        else:
            print('SKIP graph.json — glossary.json not found')
            return

    # Build lookup: list of (compiled_regex, path) sorted longest-first
    patterns: list[tuple[re.Pattern, str]] = []
    for entry in glossary_entries:
        name = entry.get('name', '')
        label = entry.get('label', '')
        aliases = entry.get('aliases', [])
        path = entry.get('path', '')
        if not name or not path:
            continue
        # Name — case-insensitive
        patterns.append((re.compile(r'(?<!\w)' + re.escape(name) + r'(?!\w)', re.IGNORECASE), path))
        # Tag — case-sensitive
        if label and len(label) >= 2:
            patterns.append((re.compile(r'(?<!\w)' + re.escape(label) + r'(?!\w)'), path))
        # Aliases — case-insensitive
        for alias in (aliases or []):
            if alias and alias.lower() != name.lower():
                patterns.append((re.compile(r'(?<!\w)' + re.escape(alias) + r'(?!\w)', re.IGNORECASE), path))

    # Build path→stem lookup for reading markdown files
    path_to_filename: dict[str, str] = {}
    for e in glossary_entries:
        p = e.get('path', '')
        filename = e.get('filename')
        if filename:
            path_to_filename[p] = filename
        else:
            # Fallback
            stem = p.rstrip('/').rsplit('/', 1)[-1] if '/' in p else p
            path_to_filename[p] = f"{stem}.md"

    glitchcraft_dir = ROOT / 'docs' / 'wiki' / 'glitchcraft'
    nodes = []
    edges_set: set[tuple[str, str]] = set()

    for entry in glossary_entries:
        path = entry.get('path', '')
        name = entry.get('name', '')
        uid = entry.get('uid', '')
        label = entry.get('label', '')
        if not path or not name:
            continue

        nodes.append({'id': path, 'uid': uid, 'name': name, 'label': label})

        # Read the markdown body for this page
        filename = path_to_filename.get(path, '')
        if not filename:
            continue
            
        md_file = glitchcraft_dir / filename
        if not md_file.exists():
            continue

        try:
            body = md_file.read_text(encoding='utf-8-sig')
        except Exception:
            continue

        # Strip frontmatter
        body = re.sub(r'^---[\s\S]*?---\s*', '', body)
        # Strip code blocks
        body = re.sub(r'```[\s\S]*?```', '', body)

        # Check which other entries this page mentions
        targets_found: set[str] = set()
        for pat, target_path in patterns:
            if target_path == path:
                continue  # skip self
            if target_path in targets_found:
                continue  # already found this target
            if pat.search(body):
                targets_found.add(target_path)
                edges_set.add((path, target_path))

    edges = [{'source': s, 'target': t} for s, t in sorted(edges_set)]

    graph = {'nodes': nodes, 'edges': edges}
    _GRAPH_JSON.parent.mkdir(parents=True, exist_ok=True)
    _GRAPH_JSON.write_text(
        json.dumps(graph, ensure_ascii=False, indent=2),
        encoding='utf-8'
    )
    print(f'WROTE graph.json ({len(nodes)} nodes, {len(edges)} edges) -> {_GRAPH_JSON}')


def build_leaderboard(json_path: str, discovered_credits: Counter | None = None):
    """Write leaderboard-data.json with pre-computed ranked contributor counts.

    If discovered_credits (a Counter of {name: count}) is provided — passed
    from build_grimoire_data() — it is used directly to avoid scanning glitch
    files a second time. Otherwise falls back to scanning docs/wiki/glitchcraft/
    directly.

    Note: Aggregation of new names into credits.json is handled by the
    caller (main()) right after build_grimoire_data(), so it happens exactly
    once and before this function is called.
    """
    from datetime import date
    from itertools import groupby

    # Load contributor social links (already updated with pending entries by main).
    contributor_links: dict[str, str] = {}
    if _CONTRIBUTORS_JSON.exists():
        try:
            contributor_links = json.loads(_CONTRIBUTORS_JSON.read_text(encoding='utf-8'))
        except Exception:
            pass

    # Use pre-computed credit counts if available, else scan glitch files directly.
    if discovered_credits is not None:
        counts: Counter = discovered_credits
    else:
        _SKIP = {'_glitchcraft-grimoire'}
        glitchcraft_dir = ROOT / 'docs' / 'wiki' / 'glitchcraft'
        counts = Counter()
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
            url = contributor_links.get(name, '')
            entries.append({
                'rank': rank,
                'name': name,
                'url': url if url else None,  # normalize "" to None for clean JSON
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
    p.add_argument('--docs-dir', default='docs/wiki', help='Path under the repo root to read markdown from (e.g. docs/wiki)')
    p.add_argument(
        '--exclude', '-x',
        action='append',
        default=[],
        metavar='GLOB',
        help='Glob pattern (relative to docs dir) to exclude from indexing. May be repeated.',
    )
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
    p.add_argument(
        '--socials-output',
        default=None,
        help='If given, also copy the updated credits.json to this path (e.g. site/assets/data/credits.json)',
    )
    p.add_argument(
        '--tags-output',
        default=None,
        help='If given, also copy the updated tags.json to this path (e.g. site/assets/data/tags.json)',
    )
    p.add_argument(
        '--glossary-output',
        default=None,
        help='If given, also copy the updated glossary.json to this path (e.g. site/assets/data/glossary.json)',
    )
    p.add_argument('--no-glossary', dest='glossary', action='store_false',
                   help='Skip generating glossary.json')
    p.add_argument('--no-graph', dest='graph', action='store_false',
                   help='Skip generating graph.json')
    p.add_argument(
        '--graph-output',
        default=None,
        help='If given, also copy the updated graph.json to this path (e.g. site/assets/data/graph.json)',
    )
    args = p.parse_args()
    # allow overriding which docs subtree to index (default 'docs')
    global DOCS
    DOCS = ROOT / args.docs_dir
    build_index(args.output, gzip_output=args.gzip, chunk=args.chunk, exclude=args.exclude)
    credit_counts: Counter | None = None
    discovered_tags: set[str] | None = None
    grimoire_entries: list | None = None
    if args.grimoire:
        grimoire_entries, credit_counts, discovered_tags = build_grimoire_data(args.grimoire_output)
    # Aggregate newly-discovered credits exactly once, before leaderboard generation
    if credit_counts:
        aggregate_contributors(set(credit_counts.keys()))
    # Aggregate newly-discovered tags exactly once as well
    if discovered_tags:
        aggregate_tags(set(discovered_tags))
    # Optionally copy the (now-updated) credits.json into the site directory
    if args.socials_output:
        import shutil
        dest = Path(args.socials_output)
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(_CONTRIBUTORS_JSON, dest)
        print(f'COPIED credits.json -> {dest}')
    # Optionally copy the (now-updated) tags.json into the site directory
    if args.tags_output:
        import shutil
        dest = Path(args.tags_output)
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(_TAGS_JSON, dest)
        print(f'COPIED tags.json -> {dest}')
    if args.leaderboard:
        build_leaderboard(args.leaderboard_output, discovered_credits=credit_counts)
    # Build glossary.json for glitch autolink hook
    if args.glossary:
        build_glossary(grimoire_entries)
    # Optionally copy glossary.json into the site directory
    if args.glossary_output:
        import shutil
        dest = Path(args.glossary_output)
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(_GLOSSARY_JSON, dest)
        print(f'COPIED glossary.json -> {dest}')
    # Build graph.json for the interactive graph view
    if args.graph:
        # Reuse glossary entries already in memory if glossary was built
        glossary_for_graph = None
        if _GLOSSARY_JSON.exists():
            glossary_for_graph = json.loads(_GLOSSARY_JSON.read_text(encoding='utf-8'))
        build_graph(glossary_for_graph)
    # Optionally copy graph.json into the site directory
    if args.graph_output:
        import shutil
        dest = Path(args.graph_output)
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(_GRAPH_JSON, dest)
        print(f'COPIED graph.json -> {dest}')


if __name__ == '__main__':
    main()
