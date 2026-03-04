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
   [Fire Temple](x:1321, z:-2823, Depths, 15)

The "x:" syntax is converted to a standard Object Map URL and then embedded.
Default layer is "Surface" if not specified.
Default zoom is 10 if not specified in the link.
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
# Allows optional spaces, optional comma, optional layer, optional zoom
# Group 1: X coord
# Group 2: Z coord
# Group 3: Optional Layer (Depths, Sky, Surface)
# Group 4: Optional Zoom level
_SHORTHAND_RE = re.compile(
    r'^x\s*:\s*([0-9.-]+)\s*,\s*z\s*:\s*([0-9.-]+)(?:\s*,\s*([A-Za-z]+))?(?:\s*,\s*(\d+))?$',
    re.IGNORECASE
)

def _generate_iframe(x: str, z: str, layer: str, zoom: int, original_url: str = None, label: str = None) -> str:
    """Generate the HTML for dual embedded maps (desktop and mobile with -2 zoom)."""
    desktop_fragment = f"z{zoom},{x},{z},{layer}"
    mobile_zoom = max(1, zoom - 2)  # Ensure zoom doesn't go below 1
    mobile_fragment = f"z{mobile_zoom},{x},{z},{layer}"
    
    base_url = "https://objmap-totk.zeldamods.org/#/map"
    if not original_url:
        original_url = f"{base_url}/{desktop_fragment}"
    
    display_title = label if label else "Open in TotK Object Map"
    iframe_style = 'border:0; border-radius: 4px; box-shadow: 0 4px 6px rgba(0,0,0,0.3);'
    
    return (
        f'<div class="ub-map-embed">'
        f'<div style="margin-bottom: 0.5rem;">'
        f'<strong><a href="{original_url}" target="_blank" rel="noopener">{display_title}</a></strong>'
        f'</div>'
        f'<iframe class="ub-map-desktop" src="{base_url}/{desktop_fragment}" '
        f'width="100%" height="500" style="{iframe_style}" loading="lazy" allowfullscreen></iframe>'
        f'<iframe class="ub-map-mobile" src="{base_url}/{mobile_fragment}" '
        f'width="100%" height="500" style="{iframe_style}" loading="lazy" allowfullscreen></iframe>'
        f'</div>'
    )

def _parse_location(href: str) -> tuple | None:
    """
    Parse an href string to see if it's a map link.
    Returns a tuple (x, z, layer, zoom) or None.
    
    Args:
        href: The href to parse
    """
    # decode URL encoding (%20 -> space)
    decoded = unquote(href)

    # 1. Check for Full URL
    # Format: z10,1321,-2823,Depths
    m_url = _OBJMAP_URL_RE.match(decoded)
    if m_url:
        fragment = m_url.group(1)
        # Parse the fragment: z{zoom},{x},{z},{layer}
        parts = fragment.split(',')
        if len(parts) >= 3:
            zoom = int(parts[0][1:]) if parts[0].startswith('z') else 10
            x = parts[1]
            z = parts[2]
            layer = parts[3] if len(parts) > 3 else "Surface"
            return (x, z, layer, zoom)
        return None

    # 2. Check for Shorthand "x:..., z:..."
    # The href might be "x:100, z:200" or "x:100, z:200, Depths" or "x:100, z:200, Depths, 15"
    m_short = _SHORTHAND_RE.match(decoded)
    if m_short:
        x = m_short.group(1)
        z = m_short.group(2)
        layer = m_short.group(3)
        zoom = m_short.group(4)

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

        # Use specified zoom or default to 10
        zoom_level = int(zoom) if zoom else 10

        return (x, z, layer, zoom_level)

    return None

def on_page_content(html: str, page, config, files) -> str:
    """
    Scans the rendered HTML page for map links and replaces them with embeds.
    """
    
    def replace_callback(match):
        full_tag = match.group(0)
        href = match.group(1)
        label = match.group(2)
        
        # strip any inner html tags from the label
        clean_label = re.sub(r'<[^>]+>', '', label).strip()
        
        location = _parse_location(href)
        if location:
            x, z, layer, zoom = location
            # If the user used correct full URL, use that for 'Open in...' 
            # otherwise construct it.
            original = href if href.startswith('http') else None
            return _generate_iframe(x, z, layer, zoom, original, clean_label)
        
        return full_tag

    return _LINK_RE.sub(replace_callback, html)
