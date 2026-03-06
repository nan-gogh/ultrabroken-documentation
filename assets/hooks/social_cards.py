"""
MkDocs hook: social_cards
=========================
Generates custom Open Graph social-card images for every page using
Pillow, replacing the built-in Material social plugin.

Layout (1200 x 630, on background image):
  Upper 50%  ->  site name (eyebrow) + title  |  logo + label (upper-right)
  Lower 50%  ->  version badges (JetBrains Mono, code-style) + description (Texturina)

Falls back to site_description when a page has no versions/description.
Falls back to page.title when frontmatter has no title.

Upper fonts:  New Rocker / #00f0c2   (matches Material social-plugin config)
Lower fonts:  Texturina  / #bec1c6   (description); JetBrains Mono / #b5b8c2 (version badges)
"""

import hashlib
import html as html_mod
import json
import logging
import os
import shutil
from io import BytesIO
from pathlib import Path
from urllib.parse import quote

from PIL import Image, ImageDraw, ImageFont

log = logging.getLogger("mkdocs.hooks.social_cards")

# ── Card dimensions (standard Open Graph) ─────────────────────
W, H = 1200, 630
COLOR       = "#00f0c2"   # teal accent — New Rocker (upper half)
COLOR_BODY  = "#bec1c6"   # default text color — Texturina (lower half)
COLOR_GAME_TITLE = "#00cbb7"  # accent color for game title in description
COLOR_BADGE_TEXT = "#b5b8c2"  # Material slate default code fg (hsla(225,18%,86%,0.82) over code bg)
COLOR_BADGE_BG   = "#272a34"  # Material slate default code bg (hsla(225,15%,18%,1))

# ── Font sizes ────────────────────────────────────────────────
SITE_NAME_SIZE = 42       # eyebrow above the page title
TITLE_SIZE     = 55
LABEL_SIZE     = 40
VERSION_SIZE   = 26
DESC_SIZE      = 37

# ── Description highlights ────────────────────────────────────
GAME_TITLE = "The Legend of Zelda Tears of the Kingdom"
GAME_TITLE_WORDS = set(GAME_TITLE.lower().split())

# ── Layout constants ──────────────────────────────────────────
MARGIN       = 60
RUNE_RESERVE = 294        # width reserved for baked-in rune in background (upper-right)
USABLE_W     = W - 2 * MARGIN

# ── Paths (relative to project root) ─────────────────────────
_BG_PATH       = Path("docs/assets/images/graphics/ultrabroken_social_card_background.jpg")
_FONT_DIR      = Path(".cache/hooks/social_cards/fonts")
_CARD_CACHE    = Path(".cache/hooks/social_cards/images")
_MANIFEST_PATH = Path(".cache/hooks/social_cards/manifest.json")

# Google Fonts GitHub raw TTFs
_FONT_URLS = {
    "NewRocker-Regular.ttf": (
        "https://raw.githubusercontent.com/google/fonts/main"
        "/ofl/newrocker/NewRocker-Regular.ttf"
    ),
    "Texturina-Regular.ttf": (
        "https://raw.githubusercontent.com/google/fonts/main"
        "/ofl/texturina/Texturina%5Bopsz%2Cwght%5D.ttf"
    ),
    "JetBrainsMono-Regular.ttf": (
        "https://raw.githubusercontent.com/google/fonts/main"
        "/ofl/jetbrainsmono/JetBrainsMono%5Bwght%5D.ttf"
    ),
}

# ── Module state (populated in on_config) ─────────────────────
_root             = None
_bg               = None
_font_file        = None   # New Rocker TTF path
_texturina_file   = None   # Texturina TTF path
_monofile         = None   # JetBrains Mono TTF path
_fonts            = {}     # {(file, size): ImageFont}
_manifest         = {}
_site_description = ""
_site_name        = ""


# ── Font helpers ──────────────────────────────────────────────

def _download_fonts():
    """Download New Rocker, Texturina, and JetBrains Mono TTFs and cache in .cache/."""
    global _font_file, _texturina_file, _monofile
    import requests

    font_dir = _root / _FONT_DIR
    font_dir.mkdir(parents=True, exist_ok=True)

    for filename, url in _FONT_URLS.items():
        dest = font_dir / filename
        if not dest.exists():
            resp = requests.get(url, timeout=30)
            resp.raise_for_status()
            dest.write_bytes(resp.content)
            log.info("Cached font %s -> %s", filename, dest)

    _font_file      = font_dir / "NewRocker-Regular.ttf"
    _texturina_file = font_dir / "Texturina-Regular.ttf"
    _monofile       = font_dir / "JetBrainsMono-Regular.ttf"


def _font(ttf_path, size):
    """Return a cached ImageFont for *ttf_path* at *size* px."""
    key = (ttf_path, size)
    if key not in _fonts:
        _fonts[key] = ImageFont.truetype(str(ttf_path), size)
    return _fonts[key]


def _nf(size):
    """New Rocker at *size* px."""
    return _font(_font_file, size)


def _tf(size):
    """Texturina at *size* px."""
    return _font(_texturina_file, size)


def _mf(size):
    """JetBrains Mono at *size* px."""
    return _font(_monofile, size)


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


def _draw_justified_line(draw, text, font, x, y, max_w, fill):
    """Draw a fully-justified line of text into the available *max_w*.

    The last line of a paragraph or single-word lines should not be justified;
    callers should only use this for lines that should expand to fill *max_w*.
    """
    words = text.split()
    if not words:
        return
    if len(words) == 1:
        draw.text((x, y), text, font=font, fill=fill)
        return

    # measure each word width
    word_widths = [draw.textbbox((0, 0), w, font=font)[2] - draw.textbbox((0, 0), w, font=font)[0] for w in words]
    words_total = sum(word_widths)
    space_slots = len(words) - 1

    # base space width according to the font
    space_w = draw.textbbox((0, 0), " ", font=font)[2] - draw.textbbox((0, 0), " ", font=font)[0]

    total_space_needed = max_w - words_total
    if total_space_needed <= 0:
        # nothing to distribute, fallback to left-aligned
        draw.text((x, y), text, font=font, fill=fill)
        return

    # distribute extra space across slots (may be fractional)
    extra_per_slot = max(0, (total_space_needed - space_w * space_slots) / space_slots)

    cur_x = x
    for i, w in enumerate(words):
        draw.text((cur_x, y), w, font=font, fill=fill)
        w_w = word_widths[i]
        cur_x += w_w
        if i < len(words) - 1:
            cur_x += space_w + extra_per_slot
    return


def _draw_justified_line_with_colored_title(draw, text, font, x, y, max_w, fill, title_fill, justify=True):
    """Draw line with game title highlighted in a different color.
    
    Words matching the game title are drawn in title_fill color.
    When justify=True, distributes spacing to fill max_w; otherwise left-aligns.
    """
    import re
    
    words = text.split()
    if not words:
        return
    
    # Pre-compute which word indices correspond to the title
    # by matching normalized words against title words
    word_colors = [fill] * len(words)
    
    # Normalize at the text level, then split, so word positions match correctly
    text_lower = text.lower()
    text_normalized = re.sub(r'[^\w\s]', '', text_lower)
    normalized_words = text_normalized.split()
    
    title_lower = GAME_TITLE.lower()
    title_normalized = re.sub(r'[^\w\s]', '', title_lower)
    title_words = title_normalized.split()
    
    # DEBUG: Log what we're looking for
    if "legend" in text_normalized or "investigation" in text_normalized:
        pass  # Debug logging now removed - matching is confirmed to work
    
    # Find ANY occurrence of the title word sequence in the normalized words list
    # Match any contiguous substring of the title, not just prefixes
    title_word_count = len(title_words)
    
    # First, build the word-to-normalized-idx map
    word_to_norm_map = {}
    norm_idx = 0
    for o_idx, orig_word in enumerate(words):
        orig_normalized = re.sub(r'[^\w\s]', '', orig_word.lower()).split()
        for _ in orig_normalized:
            if o_idx not in word_to_norm_map:
                word_to_norm_map[o_idx] = []
            word_to_norm_map[o_idx].append(norm_idx)
            norm_idx += 1
    
    # Try to match any substring of the title (not just prefixes)
    # Match sequences of 2+ words to avoid single-word false positives
    for title_start in range(len(title_words)):
        for title_end in range(title_start + 2, title_word_count + 1):
            title_substring = title_words[title_start:title_end]
            # Search for this substring in the normalized words
            for start_idx in range(len(normalized_words) - len(title_substring) + 1):
                if normalized_words[start_idx:start_idx + len(title_substring)] == title_substring:
                    # Found a match! Color words that map to this range
                    for o_idx in range(len(words)):
                        if o_idx in word_to_norm_map:
                            norm_indices = word_to_norm_map[o_idx]
                            # Check if any of this word's normalized indices fall in the match range
                            if any(start_idx <= n_idx < start_idx + len(title_substring) for n_idx in norm_indices):
                                word_colors[o_idx] = title_fill
    
    if len(words) == 1:
        draw.text((x, y), text, font=font, fill=word_colors[0])
        return
    
    if not justify:
        # Left-align with colors
        cur_x = x
        for w, color in zip(words, word_colors):
            draw.text((cur_x, y), w, font=font, fill=color)
            w_w = draw.textbbox((0, 0), w, font=font)[2] - draw.textbbox((0, 0), w, font=font)[0]
            cur_x += w_w + (draw.textbbox((0, 0), " ", font=font)[2] - draw.textbbox((0, 0), " ", font=font)[0])
        return
    
    # Measure word widths
    word_widths = [draw.textbbox((0, 0), w, font=font)[2] - draw.textbbox((0, 0), w, font=font)[0] for w in words]
    words_total = sum(word_widths)
    space_slots = len(words) - 1
    
    # Base space width
    space_w = draw.textbbox((0, 0), " ", font=font)[2] - draw.textbbox((0, 0), " ", font=font)[0]
    
    total_space_needed = max_w - words_total
    if total_space_needed <= 0:
        # Fallback to left-aligned with colors
        cur_x = x
        for w, color in zip(words, word_colors):
            draw.text((cur_x, y), w, font=font, fill=color)
            cur_x += draw.textbbox((0, 0), w, font=font)[2] - draw.textbbox((0, 0), w, font=font)[0]
            cur_x += space_w
        return
    
    # Distribute extra space
    extra_per_slot = max(0, (total_space_needed - space_w * space_slots) / space_slots)
    
    cur_x = x
    for i, (w, color) in enumerate(zip(words, word_colors)):
        draw.text((cur_x, y), w, font=font, fill=color)
        w_w = word_widths[i]
        cur_x += w_w
        if i < len(words) - 1:
            cur_x += space_w + extra_per_slot
    return


def _card_hash(title, label, uid, versions, desc):
    """Hash the rendered fields (including global site_name and colors)."""
    blob = json.dumps(
        {
            "site_name": _site_name,
            "title": title,
            "label": label,
            "uid": uid,
            "versions": versions,
            "description": desc,
            "badge_text_color": COLOR_BADGE_TEXT,
            "badge_bg_color": COLOR_BADGE_BG,
        },
        sort_keys=True,
    )
    return hashlib.md5(blob.encode()).hexdigest()[:12]


# ── Card renderer ─────────────────────────────────────────────

def _render(title, label, uid, versions, desc, is_fallback_desc=False):
    """Return PNG bytes for a 1200x630 social card.
    
    Args:
        is_fallback_desc: If True, desc is the site-wide fallback and should have
                         the game title extracted to a colored line.
    """
    img = _bg.copy()
    draw = ImageDraw.Draw(img)

    # ── Upper half: site name eyebrow + title ────────────────
    y = 36

    if _site_name:
        f = _nf(SITE_NAME_SIZE)
        draw.text((MARGIN, y), _site_name, font=f, fill=COLOR)
        y = draw.textbbox((MARGIN, y), _site_name, font=f)[3] + 10

    if title:
        f = _nf(TITLE_SIZE)
        title_max_w = USABLE_W - RUNE_RESERVE
        for ln in _wrap(draw, title, f, title_max_w)[:3]:
            draw.text((MARGIN, y), ln, font=f, fill=COLOR)
            y = draw.textbbox((MARGIN, y), ln, font=f)[3] - 3

    # ── Label + UID badges under title, bottom-aligned to V-center ──
    badge_pad_x, badge_gap = 12, 8
    f_lbl = _mf(LABEL_SIZE)
    # Measure badge height once using cap-height reference "A" (no descenders)
    # so ALL label/uid badges are identical height regardless of their text.
    lbl_ref_bb = draw.textbbox((0, 0), "A", font=f_lbl)
    lbl_cap_h = lbl_ref_bb[3] - lbl_ref_bb[1]
    lbl_pad_v = max(5, lbl_cap_h // 4)
    lbl_badge_h = lbl_cap_h + lbl_pad_v * 2
    # txt_y offset: place cap-top at (by + lbl_pad_v)
    # draw.text at (x, txt_y) renders with top at txt_y + lbl_ref_bb[1]
    # so txt_y = by + lbl_pad_v - lbl_ref_bb[1]
    lbl_txt_y_offset = lbl_pad_v - lbl_ref_bb[1]

    badge_items = []   # list of (text, badge_w)
    for txt in (label, uid):
        if not txt:
            continue
        bb = draw.textbbox((0, 0), txt, font=f_lbl)
        tw = bb[2] - bb[0]
        bw = tw + badge_pad_x * 2
        badge_items.append((txt, bw))

    if badge_items:
        # bottom edge of badges sits at the card's vertical centre - 30px margin
        badges_y = H // 2 - 30 - lbl_badge_h
        bx = MARGIN
        for txt, bw in badge_items:
            by = badges_y
            draw.rounded_rectangle(
                [bx, by, bx + bw, by + lbl_badge_h],
                radius=3,
                fill=COLOR_BADGE_BG,
            )
            bb = draw.textbbox((0, 0), txt, font=f_lbl)
            tw = bb[2] - bb[0]
            txt_x = bx + (bw - tw) // 2
            txt_y = by + lbl_txt_y_offset
            draw.text((txt_x, txt_y), txt, font=f_lbl, fill=COLOR_BADGE_TEXT)
            bx += bw + badge_gap
    # ── Lower half: description + version badges ──────────────
    y = H // 2 + 13

    if desc:
        f = _tf(DESC_SIZE)
        desc_spacing = 7
        
        # If using fallback description, extract and separate the game title
        if is_fallback_desc:
            # Split off the game title to a separate line
            # "Community-driven encyclopedia documenting glitches, techniques and investigations for the videogame The Legend of Zelda Tears of the Kingdom"
            # becomes:
            # "Community-driven encyclopedia documenting glitches, techniques and investigations for the videogame"
            # "The Legend of Zelda Tears of the Kingdom"
            prefix = "Community-driven encyclopedia documenting glitches, techniques and investigations for the videogame"
            if desc.startswith(prefix):
                # Draw prefix as regular text
                prefix_lines = _wrap(draw, prefix, f, USABLE_W)[:4]
                for ln in prefix_lines:
                    tb = draw.textbbox((0, 0), ln, font=f)
                    line_h = tb[3] - tb[1]
                    draw.text((MARGIN, y), ln, font=f, fill=COLOR_BODY)
                    y += line_h + desc_spacing
                
                # Extract and draw game title on its own line with coloring
                title_line = desc[len(prefix):].strip()
                if title_line:
                    tb = draw.textbbox((0, 0), title_line, font=f)
                    line_h = tb[3] - tb[1]
                    _draw_justified_line_with_colored_title(draw, title_line, f, MARGIN, y, USABLE_W, fill=COLOR_BODY, title_fill=COLOR_GAME_TITLE, justify=False)
                    y += line_h + desc_spacing
                desc_end_y = y
            else:
                # Fallback case if description is different than expected
                lines = _wrap(draw, desc, f, USABLE_W)[:4]
                for ln in lines:
                    tb = draw.textbbox((0, 0), ln, font=f)
                    line_h = tb[3] - tb[1]
                    draw.text((MARGIN, y), ln, font=f, fill=COLOR_BODY)
                    y += line_h + desc_spacing
                desc_end_y = y
        else:
            # For custom descriptions, use regular left-aligned text without coloring
            lines = _wrap(draw, desc, f, USABLE_W)[:4]
            for ln in lines:
                tb = draw.textbbox((0, 0), ln, font=f)
                line_h = tb[3] - tb[1]
                draw.text((MARGIN, y), ln, font=f, fill=COLOR_BODY)
                y += line_h + desc_spacing
            desc_end_y = y
        
        # small gap after the description block
        y += 6

    if versions:
        f = _mf(VERSION_SIZE)
        pad_x, gap = 12, 8
        # Measure badge height from cap-height reference "A" (no descenders)
        # so all version badges are identical height regardless of text content.
        ver_ref_bb = draw.textbbox((0, 0), "A", font=f)
        ver_cap_h = ver_ref_bb[3] - ver_ref_bb[1]
        ver_pad_v = max(4, ver_cap_h // 4)
        badge_h = ver_cap_h + ver_pad_v * 2
        # txt_y offset: cap-top at (ry + ver_pad_v)
        ver_txt_y_offset = ver_pad_v - ver_ref_bb[1]

        # Precompute badge widths
        badge_ws = []
        for v in versions:
            tb = draw.textbbox((0, 0), str(v), font=f)
            tw = tb[2] - tb[0]
            badge_ws.append(tw + pad_x * 2)

        # Pack badges into rows within USABLE_W
        rows = []
        cur_row = []
        cur_w = 0
        for w in badge_ws:
            if cur_w + w + (len(cur_row) * gap) > USABLE_W:
                rows.append(cur_row)
                cur_row = [w]
                cur_w = w
            else:
                cur_row.append(w)
                cur_w += w
        if cur_row:
            rows.append(cur_row)

        # Compute starting y so rows are bottom-aligned above the bottom margin
        rows_count = len(rows)
        if rows_count > 0:
            first_row_y = H - MARGIN - badge_h - (rows_count - 1) * (badge_h + gap)
            # ensure there's a minimum gap between description and version badges
            min_gap_after_desc = 18
            if 'desc_end_y' in locals():
                first_row_y = max(first_row_y, desc_end_y + min_gap_after_desc)
            ry = first_row_y
            # Draw each row
            v_iter = iter(versions)
            for row_idx, row in enumerate(rows):
                bx = MARGIN
                row_sum = sum(row)
                slots = max(0, len(row) - 1)
                is_last_row = row_idx == len(rows) - 1
                # justify all rows except the last (mirrors description behaviour)
                if slots > 0 and not is_last_row:
                    gap_for_row = (USABLE_W - row_sum) / slots
                    if gap_for_row < 0:
                        gap_for_row = gap
                else:
                    gap_for_row = gap

                for bw in row:
                    txt = str(next(v_iter))
                    draw.rounded_rectangle(
                        [bx, ry, bx + bw, ry + badge_h],
                        radius=3,
                        fill=COLOR_BADGE_BG,
                    )
                    tb = draw.textbbox((0, 0), txt, font=f)
                    tw = tb[2] - tb[0]
                    txt_x = bx + (bw - tw) // 2
                    txt_y = ry + ver_txt_y_offset
                    draw.text((txt_x, txt_y), txt, font=f, fill=COLOR_BADGE_TEXT)
                    bx += bw + gap_for_row
                ry += badge_h + gap

    buf = BytesIO()
    img.save(buf, format="PNG", optimize=True)
    return buf.getvalue()


# ── MkDocs hook entry points ─────────────────────────────────

def on_config(config, **kwargs):
    """Load background image, download fonts, render logo, read manifest."""
    global _root, _bg, _manifest, _site_description, _site_name
    _root = Path(config["config_file_path"]).parent
    _site_description = config.get("site_description", "")
    _site_name        = config.get("site_name", "")

    _download_fonts()

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
    uid = str(meta.get("uid", ""))
    versions = meta.get("versions", [])
    desc = str(meta.get("description", ""))

    # Fallback: use site description when page has no versions AND no description
    is_fallback_desc = False
    if not versions and not desc:
        desc = _site_description
        is_fallback_desc = True

    # Derive card path from source file (normalise to forward slashes for URLs)
    src = page.file.src_path.replace("\\", "/")
    card_name = os.path.splitext(src)[0] + ".png"
    card_rel = f"assets/images/social/{card_name}"
    card_path = Path(config["site_dir"]) / card_rel
    cache_path = _root / _CARD_CACHE / card_name

    # Skip regeneration when content hasn't changed (check .cache/ copy)
    h = _card_hash(title, label, uid, versions, desc)
    if not (_manifest.get(src) == h and cache_path.exists()):
        try:
            cache_path.parent.mkdir(parents=True, exist_ok=True)
            cache_path.write_bytes(_render(title, label, uid, versions, desc, is_fallback_desc=is_fallback_desc))
            _manifest[src] = h
        except Exception as exc:
            log.warning("Social card failed for %s: %s", src, exc)
            return output

    # Copy cached card into the site output directory
    card_path.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(cache_path, card_path)

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
