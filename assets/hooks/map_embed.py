"""
MkDocs hook: map_embed
======================
Converts map links into embedded interactive iframes.

Supports two formats:
1. Full Object Map URLs:
   [Fire Temple](https://objmap-totk.zeldamods.org/#/map/z10,1321,-2823,Depths)

2. Coordinate Shorthand (x:..., z:...):
   [Fire Temple](x:1321, z:-2823)
   [Fire Temple](x:1321, z:-2823, Depths)

The "x:" syntax is converted to a standard Object Map URL and then embedded.
Default layer is "Surface" if not specified.
"""

import re
from urllib.parse import unquote

# Regex to find any <a> tag in the rendered HTML
# Captures: group(1)=href, group(2)=inner_html
_LINK_RE = re.compile(
    r'<a\s[^>]*href="([^"]+)"[^>]*>(.*?)</a>',
    re.IGNORECASE | re.DOTALL
)

# Regex to match the TotK Object Map URL format
# https://objmap-totk.zeldamods.org/#/map/z10,1321.6875,-2823.71875,Depths
_OBJMAP_URL_RE = re.compile(
    r'https?://objmap-totk\.zeldamods\.org/#/map/([a-z0-9,.-]+)',
    re.IGNORECASE
)

# Regex to match the shorthand syntax "x:..., z:..."
# Allows optional spaces, optional comma, optional layer
# Group 1: X coord
# Group 2: Z coord
# Group 3: Optional Layer (Depths, Sky, Surface)
_SHORTHAND_RE = re.compile(
    r'^x\s*:\s*([0-9.-]+)\s*,\s*z\s*:\s*([0-9.-]+)(?:\s*,\s*([A-Za-z]+))?$',
    re.IGNORECASE
)

def _generate_iframe(location_fragment: str, original_url: str = None) -> str:
    """Generate the HTML for the embedded map."""
    # Ensure we use the correct base URL
    if not original_url:
        original_url = f"https://objmap-totk.zeldamods.org/#/map/{location_fragment}"
    
    return (
        f'<div class="ub-map-embed">'
        f'<iframe src="https://objmap-totk.zeldamods.org/#/map/{location_fragment}" '
        f'width="100%" height="500" '
        f'style="border:0; margin-top: 1rem; border-radius: 4px; box-shadow: 0 4px 6px rgba(0,0,0,0.3);" '
        f'loading="lazy" allowfullscreen></iframe>'
        f'<small style="display: block; text-align: center; margin-top: 0.5rem; opacity: 0.8;">'
        f'<a href="{original_url}" target="_blank" rel="noopener">Open in TotK Object Map</a></small>'
        f'</div>'
    )

def _parse_location(href: str) -> str | None:
    """
    Parse an href string to see if it's a map link.
    Returns the location fragment (e.g. 'z10,1321,-2823,Depths') or None.
    """
    # decode URL encoding (%20 -> space)
    decoded = unquote(href)

    # 1. Check for Full URL
    m_url = _OBJMAP_URL_RE.match(decoded)
    if m_url:
        return m_url.group(1)

    # 2. Check for Shorthand "x:..., z:..."
    # The href might be "x:100, z:200"
    m_short = _SHORTHAND_RE.match(decoded)
    if m_short:
        x = m_short.group(1)
        z = m_short.group(2)
        layer = m_short.group(3)

        # Default to Surface if not specified
        if not layer:
            layer = "Surface"
        else:
            # Normalize layer case/naming if needed
            l = layer.lower()
            if "depth" in l: layer = "Depths"
            elif "sky" in l: layer = "Sky"
            elif "surface" in l: layer = "Surface"
            # else keep as is

        # Default Zoom level 10
        return f"z10,{x},{z},{layer}"

    return None

def on_page_content(html: str, page, config, files) -> str:
    """
    Scans the rendered HTML page for map links and replaces them with embeds.
    """
    
    def replace_callback(match):
        full_tag = match.group(0)
        href = match.group(1)
        # label = match.group(2) # Unused for now, we drop the label text in favor of the map?
        # Actually, standard embed behavior (like YouTube) usually replaces the link entirely.
        # But if the user put a specific label, maybe we should keep it above?
        # For now, let's replace entirely like the youtube hook, 
        # but the youtube hook preserves the label if it's descriptive.
        
        loc_fragment = _parse_location(href)
        if loc_fragment:
            # It's a map link!
            # Generate the embed
            # If the user used correct full URL, use that for 'Open in...' 
            # otherwise construct it.
            original = href if href.startswith('http') else None
            return _generate_iframe(loc_fragment, original)
        
        return full_tag

    return _LINK_RE.sub(replace_callback, html)
