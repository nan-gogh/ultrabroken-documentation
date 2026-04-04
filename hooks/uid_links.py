"""
uid_links — MkDocs hook

on_files:
  Rewrites the output URL for every wiki page that has a uid: frontmatter
  field to a flat UID-based path:

    wiki/anything/my-page.md  (uid: "XYZ")  →  /wiki/XYZ/

  Also builds a site-wide uid → output URL map and stores it on
  config['uid_map'] for use by on_page_markdown below.

on_page_markdown:
  Resolves uid: link syntax in markdown before MkDocs renders it:

    [text](uid:XYZ)  →  [text](../XYZ/)   (relative to current page)

  If a uid: reference cannot be found in the map, a warning is printed
  and the link is passed through unchanged (safe fallback).

  Also handles unresolved filename-based references that slipped through
  resolve_uid_links.py (e.g. during local mkdocs serve):

    [text](uid:my-filename)  →  resolved the same way via filename map
"""

import os
import re
import posixpath
from pathlib import Path


# Matches uid: references in markdown link targets
_UID_LINK_RE = re.compile(r'\(uid:([^)\s]+)\)')

# A 3-char UID is exactly 3 uppercase letters or digits
_UID_RE = re.compile(r'^[A-Z0-9]{3}$')

# Files to skip (by stem)
_SKIP_STEMS = {'blank'}


def _read_uid(abs_src_path: str) -> str | None:
    """Read the uid: field from a file's YAML frontmatter (first 1 KB only)."""
    try:
        with open(abs_src_path, 'r', encoding='utf-8-sig') as f:
            content = f.read(1024)
    except Exception:
        return None
    m = re.search(r'^---\r?\n.*?\buid:\s*["\']([^"\']+)["\']', content, re.DOTALL | re.IGNORECASE)
    return m.group(1).strip() if m else None


def on_files(files, config, **kwargs):
    site_dir = config['site_dir']
    use_dir_urls = config.get('use_directory_urls', True)

    uid_map: dict[str, str] = {}       # uid  → output URL  (e.g. "wiki/XYZ/")
    filename_map: dict[str, str] = {}  # stem → uid  (fallback for unresolved filename refs)

    for file in files:
        if not file.is_documentation_page:
            continue

        src_norm = file.src_path.replace('\\', '/')
        if not src_norm.startswith('wiki/'):
            continue

        stem = Path(file.src_path).stem
        if stem in _SKIP_STEMS:
            continue

        uid = _read_uid(file.abs_src_path)
        if not uid:
            continue

        # Rewrite output path to flat wiki/{uid}/ for ALL wiki pages
        if use_dir_urls:
            dest_uri = f"wiki/{uid}/index.html"
            url      = f"wiki/{uid}/"
        else:
            dest_uri = f"wiki/{uid}.html"
            url      = f"wiki/{uid}.html"

        file.name         = uid
        file.dest_uri     = dest_uri
        file.url          = url
        file.abs_dest_path = os.path.normpath(os.path.join(site_dir, dest_uri))
        file.dest_path    = dest_uri

        uid_map[uid]      = url
        filename_map[stem] = uid

    # Store maps on config so on_page_markdown can access them
    config['uid_map']      = uid_map
    config['uid_filename_map'] = filename_map

    return files


def on_page_context(context, page, config, **kwargs):
    """Inject the original filename stem as page.meta['page_slug'].

    This is picked up by overrides/partials/content.html to emit a
    data-slug attribute that cosmetic-urls.js reads on each navigation.
    For index.md files, uses the parent directory name instead.
    """
    src = Path(page.file.src_path)
    stem = src.stem
    if stem == 'index':
        stem = src.parent.name or stem
    page.meta['page_slug'] = stem


def on_page_markdown(markdown, page, config, **kwargs):
    uid_map      = config.get('uid_map', {})
    filename_map = config.get('uid_filename_map', {})

    if not uid_map and not filename_map:
        return markdown

    current_url = page.file.url  # e.g. "wiki/XYZ/" or "wiki/culling/index/"

    def resolve(m: re.Match) -> str:
        raw = m.group(1)

        # Split off any #fragment
        if '#' in raw:
            ref, fragment = raw.split('#', 1)
            fragment = '#' + fragment
        else:
            ref = raw
            fragment = ''

        # Resolve filename stems that weren't back-committed (e.g. local serve)
        if not _UID_RE.match(ref):
            uid = filename_map.get(ref)
            if not uid:
                print(f"[uid_links] Warning: uid:{ref} in {page.file.src_path} — unknown, leaving as-is")
                return m.group(0)
            ref = uid

        target_url = uid_map.get(ref)
        if not target_url:
            print(f"[uid_links] Warning: uid:{ref} in {page.file.src_path} — UID not found, leaving as-is")
            return m.group(0)

        # Compute a relative path from the current page's URL to the target.
        # Both are directory-style site-relative paths like "wiki/ABC/".
        # The browser resolves relative URLs from the current directory URL,
        # so we use the full current_url (minus trailing slash) as the base.
        # e.g. relpath("wiki/XYZ", "wiki/ABC") → "../XYZ"
        rel = posixpath.relpath(target_url.rstrip('/'), current_url.rstrip('/'))
        if not rel.endswith('/'):
            rel += '/'

        return f'({rel}{fragment})'

    return _UID_LINK_RE.sub(resolve, markdown)

