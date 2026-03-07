"""
MkDocs hook: youtube_embed
==========================
Converts YouTube anchor tags in rendered HTML to embedded iframes.

Authors can write plain Markdown links in source files:
    - [YouTube](https://youtu.be/VIDEO_ID)
    - [Descriptive label](https://www.youtube.com/watch?v=VIDEO_ID&t=42)

During `mkdocs build` / `mkdocs serve` this hook replaces those <a> tags
with responsive YouTube iframes.  Non-YouTube links are untouched.

Rules:
  - Generic labels (case-insensitive: "youtube", "video", "youtube video"):
      Replaced with a bare <iframe>.
  - Descriptive labels:
      Replaced with <strong>label</strong> followed by the <iframe>.
  - Duplicate video IDs on the same page: all but the first are dropped.
  - Timestamp (&t=Ns or &t=N): preserved as ?start=N on the embed URL.
  - List items (<li>) that contain only the YouTube link are unwrapped from
      the <li> so the iframe is not nested inside a bullet list.
"""

import re

# Labels considered "generic" — no caption is emitted for these.
_GENERIC = {'youtube', 'video', 'youtube video', 'watch', 'watch video'}

# Matches a YouTube watch or short URL.
_YT_URL_RE = re.compile(
    r'https?://(?:www\.)?(?:youtube\.com/watch\?[^"\'>\s]*|youtu\.be/[A-Za-z0-9_-]+[^"\'>\s]*)'
)


def _extract(url: str):
    """Return (video_id, start_seconds | None) from a YouTube URL."""
    url = url.rstrip('.')
    url = re.sub(r'%20.*', '', url)   # strip accidental %20YouTube suffixes
    url = re.sub(r'&t=$', '', url)    # bare &t with no value

    start = None
    ts = re.search(r'[?&](?:amp;)?t=(\d+)s?', url)
    if ts:
        start = int(ts.group(1))

    video_id = None
    if 'youtu.be/' in url:
        m = re.match(r'https?://youtu\.be/([A-Za-z0-9_-]+)', url)
        if m:
            video_id = m.group(1)
    elif 'youtube.com/watch' in url:
        m = re.search(r'[?&]v=([A-Za-z0-9_-]+)', url)
        if m:
            video_id = m.group(1)

    return video_id, start


def _embed_url(video_id: str, start=None) -> str:
    u = f'https://www.youtube.com/embed/{video_id}'
    if start:
        u += f'?start={start}'
    return u


def _iframe(video_id: str, start=None) -> str:
    return (
        f'<iframe width="560" height="315"'
        f' src="{_embed_url(video_id, start)}"'
        f' title="YouTube video player"'
        f' frameborder="0"'
        f' allow="accelerometer; autoplay; clipboard-write; encrypted-media;'
        f' gyroscope; picture-in-picture"'
        f' allowfullscreen></iframe>'
    )


# Match a <li> that contains ONLY a YouTube <a> tag (optional whitespace around it).
_LI_A_RE = re.compile(
    r'<li>\s*<a\s+href="(' + _YT_URL_RE.pattern + r')"[^>]*>(.*?)</a>\s*</li>',
    re.DOTALL | re.IGNORECASE,
)

# Match any remaining standalone YouTube <a> tag.
_A_RE = re.compile(
    r'<a\s+href="(' + _YT_URL_RE.pattern + r')"[^>]*>(.*?)</a>',
    re.DOTALL | re.IGNORECASE,
)


def on_page_content(html: str, page, config, files) -> str:
    seen: set[str] = set()

    def replace_li(m: re.Match) -> str:
        url   = m.group(1)
        label = re.sub(r'<[^>]+>', '', m.group(2)).strip()  # strip any inner tags
        vid, start = _extract(url)
        if not vid:
            return m.group(0)
        if vid in seen:
            return ''       # drop duplicate
        seen.add(vid)
        frame = _iframe(vid, start)
        if label.lower() in _GENERIC:
            return frame
        return f'<p><strong>{label}</strong></p>{frame}'

    def replace_a(m: re.Match) -> str:
        url   = m.group(1)
        label = re.sub(r'<[^>]+>', '', m.group(2)).strip()
        vid, start = _extract(url)
        if not vid:
            return m.group(0)
        if vid in seen:
            return ''
        seen.add(vid)
        frame = _iframe(vid, start)
        if label.lower() in _GENERIC:
            return frame
        return f'<strong>{label}</strong> {frame}'

    html = _LI_A_RE.sub(replace_li, html)
    html = _A_RE.sub(replace_a, html)
    return html
