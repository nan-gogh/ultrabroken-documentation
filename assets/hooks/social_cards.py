"""
MkDocs hook: social_cards
=========================
Generates custom Open Graph social-card images for every page using
Pillow, replacing the built-in Material social plugin.

Layout (1200 x 630, on background image):
  Upper 50%  ->  title (large) + label (medium) + logo (upper-right)
  Lower 50%  ->  versions + description (readable size)

Falls back to site_description when a page has no versions/description.
Falls back to page.title when frontmatter has no title.

Font:  New Rocker  — matches the Material social-plugin config
Color: #00f0c2    — matches the Material social-plugin config
"""

import hashlib
import html as html_mod
import json
import logging
import os
from io import BytesIO
from pathlib import Path
from urllib.parse import quote

from PIL import Image, ImageDraw, ImageFont

log = logging.getLogger("mkdocs.hooks.social_cards")

# ── Card dimensions (standard Open Graph) ─────────────────────
W, H = 1200, 630
COLOR = "#00f0c2"

# ── Font sizes ────────────────────────────────────────────────
TITLE_SIZE = 82
LABEL_SIZE = 58
VERSION_SIZE = 38
DESC_SIZE = 42

# ── Layout constants ──────────────────────────────────────────
MARGIN = 60
LOGO_H = 140          # rendered logo height in pixels
LOGO_GAP = 24         # gap between title text and logo
USABLE_W = W - 2 * MARGIN

# ── Paths (relative to project root) ─────────────────────────
_BG_PATH = Path("docs/assets/images/graphics/ultrabroken_social_card_background.jpg")
_LOGO_SVG = Path("docs/assets/images/graphics/ultrabroken_rune.svg")
_LOGO_CACHE = Path(".cache/hooks/social_cards/logo.png")
_FONT_DIR = Path(".cache/hooks/social_cards/fonts")
_MANIFEST_PATH = Path(".cache/hooks/social_cards/manifest.json")

# Direct GitHub URL — always returns .ttf, no User-Agent dance
_FONT_URL = (
    "https://raw.githubusercontent.com/google/fonts/main"
    "/ofl/newrocker/NewRocker-Regular.ttf"
)

# ── Module state (populated in on_config) ─────────────────────
_root = None
_bg = None
_logo = None          # PIL Image (RGBA) or None
_font_file = None
_fonts = {}
_manifest = {}
_site_description = ""


# ── Font helpers ──────────────────────────────────────────────

def _download_font():
    """Download New Rocker TTF and cache in .cache/."""
    global _font_file
    cached = _root / _FONT_DIR / "NewRocker-Regular.ttf"
    if cached.exists():
        _font_file = cached
        return
    cached.parent.mkdir(parents=True, exist_ok=True)

    import requests

    resp = requests.get(_FONT_URL, timeout=30)
    resp.raise_for_status()
    cached.write_bytes(resp.content)
    _font_file = cached
    log.info("Cached New Rocker font -> %s", cached)


def _font(size):
    """Return a cached ImageFont at the requested pixel size."""
    if size not in _fonts:
        _fonts[size] = ImageFont.truetype(str(_font_file), size)
    return _fonts[size]


# ── Logo helpers ──────────────────────────────────────────────

def _load_logo():
    """Render the SVG logo to a PIL RGBA image, caching the PNG.

    Uses cairosvg when available (CI / Linux).  On machines without
    the Cairo C library the hook silently skips the logo — the card
    is still generated, just without the watermark.  Once rendered
    the PNG is cached so subsequent local builds pick it up too.
    """
    global _logo
    cache_abs = _root / _LOGO_CACHE

    # 1. Try cached PNG first (fast path, works everywhere)
    if cache_abs.exists():
        _logo = Image.open(cache_abs).convert("RGBA")
        return

    # 2. Try cairosvg (available in CI / Linux)
    svg_abs = _root / _LOGO_SVG
    if not svg_abs.exists():
        return
    try:
        import cairosvg

        png_bytes = cairosvg.svg2png(
            url=str(svg_abs),
            output_height=LOGO_H,
        )
        cache_abs.parent.mkdir(parents=True, exist_ok=True)
        cache_abs.write_bytes(png_bytes)
        _logo = Image.open(BytesIO(png_bytes)).convert("RGBA")
        log.info("Rendered SVG logo -> %s", cache_abs)
    except Exception as exc:
        log.info("Logo skipped (cairosvg unavailable): %s", exc)


# ── Text layout helpers ──────────────────────────────────────

def _wrap(draw, text, font, max_w):
    """Word-wrap *text* to fit within *max_w* pixels."""
    if not text:
        return []
    words = text.split()
    lines = []
    cur = ""
    for w in words:
        trial = f"{cur} {w}".strip()
        if draw.textbbox((0, 0), trial, font=font)[2] <= max_w:
            cur = trial
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def _card_hash(title, label, versions, desc):
    """Hash the four rendered fields (after fallback resolution)."""
    blob = json.dumps(
        {"title": title, "label": label, "versions": versions, "description": desc},
        sort_keys=True,
    )
    return hashlib.md5(blob.encode()).hexdigest()[:12]


# ── Card renderer ─────────────────────────────────────────────

def _render(title, label, versions, desc):
    """Return PNG bytes for a 1200x630 social card."""
    img = _bg.copy()
    draw = ImageDraw.Draw(img)

    # Reserve space for the logo (upper-right)
    logo_w = 0
    if _logo:
        logo_w = _logo.width + LOGO_GAP
    title_max_w = USABLE_W - logo_w

    # ── Upper half: title + label ─────────────────────────────
    y = 40

    if title:
        f = _font(TITLE_SIZE)
        for ln in _wrap(draw, title, f, title_max_w)[:3]:
            draw.text((MARGIN, y), ln, font=f, fill=COLOR)
            y = draw.textbbox((MARGIN, y), ln, font=f)[3] + 8

    if label:
        y += 8
        f = _font(LABEL_SIZE)
        draw.text((MARGIN, y), label, font=f, fill=COLOR)

    # ── Logo in upper-right ───────────────────────────────────
    if _logo:
        lx = W - MARGIN - _logo.width
        ly = 40
        img.paste(_logo, (lx, ly), _logo)

    # ── Lower half: versions + description ────────────────────
    y = H // 2 + 20

    if versions:
        f = _font(VERSION_SIZE)
        txt = "  ".join(str(v) for v in versions)
        for ln in _wrap(draw, txt, f, USABLE_W)[:2]:
            draw.text((MARGIN, y), ln, font=f, fill=COLOR)
            y = draw.textbbox((MARGIN, y), ln, font=f)[3] + 6
        y += 12

    if desc:
        f = _font(DESC_SIZE)
        for ln in _wrap(draw, desc, f, USABLE_W)[:4]:
            draw.text((MARGIN, y), ln, font=f, fill=COLOR)
            y = draw.textbbox((MARGIN, y), ln, font=f)[3] + 6

    buf = BytesIO()
    img.save(buf, format="PNG", optimize=True)
    return buf.getvalue()


# ── MkDocs hook entry points ─────────────────────────────────

def on_config(config, **kwargs):
    """Load background image, download font, render logo, read manifest."""
    global _root, _bg, _manifest, _site_description
    _root = Path(config["config_file_path"]).parent
    _site_description = config.get("site_description", "")

    _download_font()
    _load_logo()

    bg = _root / _BG_PATH
    _bg = Image.open(bg).convert("RGB")
    if _bg.size != (W, H):
        _bg = _bg.resize((W, H), Image.LANCZOS)

    manifest_abs = _root / _MANIFEST_PATH
    if manifest_abs.exists():
        try:
            _manifest = json.loads(manifest_abs.read_text())
        except Exception:
            _manifest = {}

    return config


def on_post_page(output, page, config, **kwargs):
    """Generate the social card image and inject OG meta tags."""
    meta = page.meta or {}

    # ── Resolve fields with fallbacks ─────────────────────────
    title = str(meta.get("title", "")) or getattr(page, "title", "") or ""
    label = str(meta.get("label", ""))
    versions = meta.get("versions", [])
    desc = str(meta.get("description", ""))

    # Fallback: use site description when page has no versions AND no description
    if not versions and not desc:
        desc = _site_description

    # Derive card path from source file (normalise to forward slashes for URLs)
    src = page.file.src_path.replace("\\", "/")
    card_name = os.path.splitext(src)[0] + ".png"
    card_rel = f"assets/images/social/{card_name}"
    card_path = Path(config["site_dir"]) / card_rel

    # Skip regeneration when content hasn't changed
    h = _card_hash(title, label, versions, desc)
    if not (_manifest.get(src) == h and card_path.exists()):
        try:
            card_path.parent.mkdir(parents=True, exist_ok=True)
            card_path.write_bytes(_render(title, label, versions, desc))
            _manifest[src] = h
        except Exception as exc:
            log.warning("Social card failed for %s: %s", src, exc)
            return output

    # Build absolute URL for the card
    site_url = config.get("site_url", "").rstrip("/")
    card_url = f"{site_url}/{quote(card_rel, safe='/')}"
    safe_url = html_mod.escape(card_url, quote=True)

    og = (
        f'<meta property="og:image" content="{safe_url}">\n'
        f'    <meta property="og:image:type" content="image/png">\n'
        f'    <meta property="og:image:width" content="{W}">\n'
        f'    <meta property="og:image:height" content="{H}">\n'
        f'    <meta name="twitter:card" content="summary_large_image">\n'
        f'    <meta name="twitter:image" content="{safe_url}">'
    )
    return output.replace("</head>", f"    {og}\n  </head>", 1)


def on_post_build(config, **kwargs):
    """Persist the manifest so incremental local rebuilds can skip
    cards whose frontmatter hasn't changed."""
    try:
        manifest_abs = _root / _MANIFEST_PATH
        manifest_abs.parent.mkdir(parents=True, exist_ok=True)
        manifest_abs.write_text(json.dumps(_manifest, indent=2))
    except Exception:
        pass
