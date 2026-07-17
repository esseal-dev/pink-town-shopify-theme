# Posy — Documentation Site Specification

Spec for the merchant-facing documentation site required by the Shopify Theme Store, to be
hosted at **https://www.themes.trisouldigital.com/posy** (already set as
`theme_documentation_url` in `pink-town/config/settings_schema.json`). Must be live **before**
launch and linked from the Posy listing page.

Source of requirements: https://shopify.dev/docs/storefronts/themes/store/requirements.
Hard rules: **[required]** docs copy must be grammatically correct and typo-free; **[required]**
docs must be *consistent with the exact labels in the theme editor* — when writing, pull setting
labels from the source of truth, do not paraphrase; **[required]** must include an FAQ section;
**[required]** must state the support policy; must be kept up to date as Posy/Shopify evolve.

## Source of truth for every label

All merchant-visible setting labels live in the repo:
- `pink-town/locales/en.default.schema.json` — editor labels (`labels.*`, `sections.*`, `blocks.*`)
- `pink-town/config/settings_schema.json` — theme settings structure (theme_info, favicon,
  typography, layout, colors, cart/free-shipping)
- Section schemas: bottom of each `pink-town/sections/*.liquid` (settings + blocks + presets)
- Templates: `pink-town/templates/*.json` (default section/block arrangement per page)

When building docs, extract labels programmatically from these files so the “consistent with
theme settings” requirement is satisfied mechanically.

## Information architecture (proposed)

### 1. Getting started
- Installing Posy from the Theme Store; duplicating before major edits.
- **Choosing a theme style**: Posy ships 4 presets — **Posy** (blush pink, fashion/jewelry),
  **Amethyst** (violet, beauty/crystals), **Meadow** (sage, herbal/organic), **Sunbeam** (warm
  amber with dark button text, kids/toys/books). Explain: presets set the 5 base colors
  (background, text, borders, accent, accent text); every other tone (soft tints, deep accents,
  shadows, placeholders) derives automatically; switching styles via “Change theme style”
  re-applies all 5; individual pickers in Theme settings → Colors allow fine-tuning afterward.
- Theme settings tour: favicon, typography (heading/body font pickers), layout (page width,
  margins, input corner radius), colors, cart.

### 2. Header & footer (section groups)
- Header: menu (`main-menu` default), customer account menu (hosted customer accounts via
  `<shopify-account>`; optional custom menu), cart drawer behavior, announcement bar.
- Predictive search: how the search overlay works (opens from the header icon, live results
  as you type: suggestions, products, pages/collections; falls back to the search page without JS).
- Footer: tagline, social links (Instagram/TikTok/Pinterest — icons appear only when URLs set),
  link columns (menu blocks), country/region selector, language selector, **Follow on Shop**
  toggle, payment icons, copyright.

### 3. Home page sections
One doc page per section, in default order: hero (layouts, stats/chips — blank by default),
featured collections, best sellers, reviews/testimonials (merchant-authored quotes; per-block
“Verified” checkbox — advise honesty), Instagram grid, newsletter. Also available: custom
section, Custom Liquid, featured product, store locations, FAQ sections, contact/about sections.

### 4. Product page
- **Blocks** (reorderable): Vendor & type, Title, Price (includes unit price + Shop Pay
  installments), Variant picker (pills + swatches; supports Shopify's native `swatch`
  color/image attributes with a built-in finish-color fallback), Buy buttons (quantity,
  add-to-cart, dynamic checkout toggle; contains selling-plan selector when a product has
  subscriptions, and the gift-card recipient form on gift card products), Description,
  Highlight line (perk rows), app blocks, accordion items, “Complete the look” add-on products.
- Media: gallery with video / external video / 3D model support; variant images switch
  automatically.
- Pickup availability: shows per-variant store pickup when locations are configured.
- Stock countdown: uses real inventory only; threshold setting.
- **Product recommendations** section: two instances by default — “Pairs well with”
  (complementary; needs Search & Discovery app configuration) and “You may also like” (related).
- **Product reviews** section: an app-block host — merchant installs a reviews app (Judge.me,
  Loox, etc.) and adds its widget as a block; the theme ships no fake review UI. Document this
  clearly; it will be a common question.

### 5. Collection & search pages
- Collection: header layouts, faceted filters (availability/price/variant options; swatch
  rendering for color-like options), sorting, pagination, quick view, **Promo banner block**
  (position-in-grid setting; blank until the merchant writes copy — advise honest promos only).
- Search: results grouped by products/pages/articles, same filters as collections.

### 6. Cart
- Cart page: quantity editing, order note, line-level + cart-level discount display,
  tax note, accelerated checkout buttons, promo-code field (applies via discount URL).
- **Free shipping progress bar**: Theme settings → Cart → “Free shipping threshold” —
  emphasize it must match the store's actual shipping settings; leave empty to hide (default).
- Cart drawer (header) mirrors these.

### 7. Localization, currencies, gift cards
- Country/currency + language selectors (appear when the store has >1 enabled).
- All prices (including JS-updated ones) follow the store's money format.
- Gift card template styling + recipient form usage.

### 8. FAQ **[required section]**
Seed questions: How do I switch color styles without losing my customizations? Why is the
reviews section empty? (→ install a reviews app) Why don't I see “Pairs well with” products?
(→ Search & Discovery complementary setup) How do I show the free-shipping bar? Why is there
no wishlist? (→ apps) How do I add subscriptions? (→ selling-plan app; theme displays them)
Does Posy support local pickup? How do I change fonts? Where do social icons come from?

### 9. Support policy page **[required]**
Mirror the policy in `SUPPORT-SITE.md` §3 (included: bug fixes, feature questions, ≤2 business
day replies; excluded: custom code, app integration, update-migration help). If any code
tutorials are ever added to the docs: **[required]** state whether the tutorialed customization
is supported, tell merchants to duplicate the theme first, and recommend hiring a pro.

## Build notes / open decisions

- Format/stack undecided (static Markdown site is fine; must be public, no login).
- Screenshots: capture from the dev store (`shopify theme dev` on :9292, Playwright available —
  see memory) or the future demo stores; per-palette screenshots are a nice touch.
- Keep a changelog page — useful for the “release notes” required at each submission.

## Session context (for resuming)

Theme = **Posy** in `pink-town/` (renamed 2026-07-17; presets: Posy, Amethyst #7E68A6,
Meadow #4F7D5F, Sunbeam #E8A33C with dark accent text). All code-side Theme Store blockers are
fixed and live-verified; see memory `project_theme_store_submission.md` + `SUPPORT-SITE.md`.
Working tree changes are uncommitted (user hasn't asked to commit yet). Remaining user-side:
these two sites, real URLs live, demo stores per preset, Lighthouse on published theme
(perf ≥60 / a11y ≥90), Partner-dashboard submission with version + release notes.
