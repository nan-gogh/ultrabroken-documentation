"""
page_header.py — MkDocs hook (on_page_markdown)

Auto-injects label and version badges after the page H1 from frontmatter,
so source files don't need to duplicate this information manually.

Given frontmatter:
    label: "AU"
    versions: ["1.0.0", "1.1.0", "1.2.0"]

And source markdown:
    # Arrow Unloading

    ## Summary

The hook produces:
    # Arrow Unloading `AU`
    `1.0.0` `1.1.0` `1.2.0`

    ## Summary

Pages without label/versions frontmatter are left untouched.
"""
import re

# Only matches a true top-level H1 (not indented, e.g. inside a tab)
_H1_RE = re.compile(r"^(# .+)", re.MULTILINE)


def on_page_markdown(markdown: str, page, **kwargs) -> str:
    label: str | None = page.meta.get("label")
    versions: list = page.meta.get("versions") or []
    obsolete: bool = page.meta.get("obsolete") is True

    if not label and not versions and not obsolete:
        return markdown

    def inject(m: re.Match) -> str:
        h1 = m.group(1).rstrip()

        # Append label inline to H1
        if label:
            h1 = f"{h1} `{label}`"

        # Build version badge line
        version_line = ""
        if versions:
            version_line = "\n" + " ".join(f"`{v}`" for v in versions)

        # Build obsolete admonition
        obsolete_block = ""
        if obsolete:
            obsolete_block = (
                '\n\n!!! warning "OBSOLETE CONTENT"\n'
                "    This content is obsolete."
            )

        return h1 + version_line + obsolete_block

    # Only replace the first H1 on the page
    return _H1_RE.sub(inject, markdown, count=1)
