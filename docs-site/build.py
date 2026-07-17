#!/usr/bin/env python3
"""Build the Posy documentation site.

Assembles src/pages/*.html into full pages using src/template.html and writes
them to dist/. Upload the contents of dist/ to public_html/posy/ on Hostinger
so the site is live at https://themes.trisouldigital.com/posy.

Usage: python3 build.py
"""
import re
from pathlib import Path

ROOT = Path(__file__).parent
SRC = ROOT / "src"
DIST = ROOT / "dist"
BASE_URL = "https://themes.trisouldigital.com/posy"

# (file, nav label) grouped for the sidebar. Order = reading order.
NAV = [
    ("Start here", [
        ("index.html", "Getting started"),
    ]),
    ("Customize", [
        ("header-footer.html", "Header & footer"),
        ("homepage.html", "Home page sections"),
        ("product.html", "Product pages"),
        ("collections-search.html", "Collections & search"),
        ("cart.html", "Cart"),
        ("pages-sections.html", "Other pages & sections"),
        ("localization.html", "Localization & gift cards"),
    ]),
    ("Help", [
        ("faq.html", "FAQ"),
        ("support.html", "Support policy"),
        ("changelog.html", "Changelog"),
    ]),
]

META_RE = re.compile(r"<!--\s*title:\s*(?P<title>.*?)\s*\|\s*desc:\s*(?P<desc>.*?)\s*-->")


def nav_html(active: str) -> str:
    out = []
    for group, items in NAV:
        out.append(f'<p class="nav-group">{group}</p>')
        out.append('<ul class="nav-list">')
        for href, label in items:
            cls = ' class="active"' if href == active else ""
            out.append(f'<li><a href="{href}"{cls}>{label}</a></li>')
        out.append("</ul>")
    return "\n".join(out)


def flat_pages():
    return [(href, label) for _, items in NAV for href, label in items]


def main() -> None:
    template = (SRC / "template.html").read_text()
    DIST.mkdir(exist_ok=True)
    pages = flat_pages()
    built = 0
    for i, (href, label) in enumerate(pages):
        src_file = SRC / "pages" / href
        content = src_file.read_text()
        m = META_RE.search(content)
        if not m:
            raise SystemExit(f"{src_file}: missing <!-- title: ... | desc: ... --> header")
        title, desc = m.group("title"), m.group("desc")
        content = META_RE.sub("", content, count=1).strip()

        # Prev / next footer links in reading order.
        pager = []
        if i > 0:
            ph, pl = pages[i - 1]
            pager.append(f'<a class="pager-link pager-prev" href="{ph}"><span>&larr; Previous</span><strong>{pl}</strong></a>')
        else:
            pager.append("<span></span>")
        if i < len(pages) - 1:
            nh, nl = pages[i + 1]
            pager.append(f'<a class="pager-link pager-next" href="{nh}"><span>Next &rarr;</span><strong>{nl}</strong></a>')
        pager_html = f'<nav class="pager" aria-label="Documentation pages">{"".join(pager)}</nav>'

        canonical = f"{BASE_URL}/" if href == "index.html" else f"{BASE_URL}/{href}"
        page = (
            template
            .replace("{{TITLE}}", title)
            .replace("{{DESCRIPTION}}", desc)
            .replace("{{CANONICAL}}", canonical)
            .replace("{{NAV}}", nav_html(href))
            .replace("{{CONTENT}}", content)
            .replace("{{PAGER}}", pager_html)
        )
        (DIST / href).write_text(page)
        built += 1
    print(f"built {built} pages -> {DIST}")


if __name__ == "__main__":
    main()
