# Posy — Support Site Specification

Spec for the public support site required by the Shopify Theme Store, to be hosted at
**https://www.support.trisouldigital.com** (this URL is already set as `theme_support_url` in
`pink-town/config/settings_schema.json` — if the final URL differs, update it there too).
It must be live **before** the theme launches and will be linked from the Posy listing page.

Source of requirements: https://shopify.dev/docs/storefronts/themes/store/requirements
(“Documentation and support” section). Everything marked **[required]** below is a Theme Store
requirement; the rest is recommended structure.

---

## 1. Pages

A single-page support site is fine. Recommended structure:

1. **Support / Contact page** — the contact form (spec below) plus the support promise
   (“We reply within 2 business days”) and a link to the documentation site for self-serve help.
2. Optionally link to the documentation FAQ instead of duplicating one here.

Design notes: mobile-friendly **[required]**, directly linkable from the Theme Store
**[required]** (i.e., a stable public URL, no login), fast and minimal. Reuse Posy's visual
language (soft pastels, serif display) for brand consistency, but any clean design passes.

## 2. Contact form — field spec

**[required] fields:**

| Field | Type | Notes |
|---|---|---|
| Name | text | first + last in one field is fine |
| Email address | email | |
| Store URL | text/url | placeholder must show example format: `http://www.storename.myshopify.com` |
| Description of problem | **textarea** | explicitly must be a text-area field |
| Attachments | **file upload** | for screenshots/screen recordings of the issue |

**Conditionally required:** a “Theme name” selector — only once TriSoul Digital has more than
one theme in the store. With only Posy, omit it (fewer fields is explicitly preferred).

**Optional but recommended:** Subject line field (auto-populates the email subject).

**[required] behavior:**
- **Auto-responder** email fires on submission (confirmation that the request was received,
  sets the “within 2 business days” expectation, links to the docs/FAQ for immediate self-help).
- Submissions should reach a monitored inbox (e.g., support@trisouldigital.com).

**Explicitly do NOT include** (Shopify calls these out): budget fields, phone number,
project-type dropdowns, or any other lead-qualification fields. This is a support form,
not a sales funnel.

## 3. Support policy (display on the site, mirrored in docs)

Draft copy to adapt:

> **What's included with Posy**
> - Bug fixes: if something in Posy is broken (layout, dead link, logical error), we fix it — free, always.
> - Product questions: anything about Posy's built-in settings, sections, and features.
> - Response time: we reply to every request within 2 business days.
>
> **What's not included** (available as paid services or via a Shopify Expert)
> - Custom code changes and design customizations beyond theme settings
> - Third-party app integration and configuration
> - Help migrating customizations when updating to a new Posy version
> - General store setup, SEO, or marketing advice

Shopify's own obligations to be aware of internally (not necessarily displayed):
reply ≤ 2 business days **[required]**; fix technical issues in a timely manner **[required]**;
fix **critical** bugs immediately or the theme may be temporarily delisted **[required]**.

## 4. Auto-responder draft

> Subject: We've received your Posy support request
>
> Hi {{name}}, thanks for reaching out. Your request is in our queue and a real human will get
> back to you within 2 business days (usually much sooner).
> In the meantime, the answer might already be in the Posy docs: https://www.themes.trisouldigital.com/posy
> — TriSoul Digital Support

## 5. Implementation notes / open decisions

- Hosting/stack not yet chosen (static site + a form backend with file-upload + autoresponder
  support, e.g. Formspree/Basin/custom endpoint — needs to handle file attachments).
- The copy above is draft; all final copy must be grammatically correct and typo-free **[required]**.
- When built, verify: form submits on mobile, file upload accepts common image/video types,
  auto-responder actually sends, and the URL matches `theme_support_url` in the theme.

## 6. Session context (for resuming)

Theme = **Posy** (renamed from “TriSoul Pink” on 2026-07-17), located in `pink-town/` in this repo.
All code-side Theme Store blockers are fixed (see memory file `project_theme_store_submission.md`
and git history). Companion spec: `DOCUMENTATION-SITE.md` in this repo root. Remaining user-side
items: build these two sites, demo stores (one per preset: Posy, Amethyst, Meadow, Sunbeam),
Lighthouse on a published theme, Partner-dashboard submission.
