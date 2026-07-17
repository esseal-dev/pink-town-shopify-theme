# Posy documentation site

Static documentation site for the Posy Shopify theme, served at
**https://themes.trisouldigital.com/posy** (the `theme_documentation_url` in
`pink-town/config/settings_schema.json`).

## Structure

- `src/template.html` — shared page shell (header, sidebar nav, footer, all CSS inline).
- `src/pages/*.html` — one content fragment per page. First line must be
  `<!-- title: ... | desc: ... -->`.
- `build.py` — assembles `src` into `dist/`. Nav structure and page order live at the top
  of this file; add new pages there.
- `dist/` — the built site. This is what gets uploaded.

## Build

```sh
python3 build.py
```

## Deploy (Hostinger)

Upload the contents of `dist/` to `public_html/posy/` on the
`themes.trisouldigital.com` subdomain (hPanel → File Manager, or FTP).
`index.html` makes `/posy` and `/posy/` resolve automatically.

## Keeping it accurate (Theme Store requirement)

Docs must match the theme editor's labels exactly. The extraction script used to source
every label lives in the session scratchpad (`extract_labels.py`); it parses
`pink-town/locales/en.default.schema.json`, `config/settings_schema.json`, and each
section's `{% schema %}` and prints every merchant-visible label. Re-run it after schema
changes and update any affected page, then add an entry to `src/pages/changelog.html`
with the release notes for the new theme version.
