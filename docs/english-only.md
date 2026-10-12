# English-only website

As requested on 12 October 2026, PAY ORBIT publishes six English pages: `/`, `/about/`, `/solutions/`, `/services/`, `/products/` and `/contact/`.

Vietnamese pages, language controls, alternate-language metadata and runtime language switching have been removed. Old `/vi/` URLs return 404. Templates contain English interface copy and read original English descriptions from column B of the supplied workbook. Service scopes and solution benefits preserve the previously approved English copy. The original workbook remains reference material and is not included in the published build.

Edit the shared templates under `scripts/`; `scripts/html.mjs` provides HTML escaping. `npm run build` regenerates the six pages and creates a fresh `dist/`, so stale translated output cannot survive a rebuild. Fonts and approved brand assets remain consistent with the existing design.

`tests/english-only.mjs` checks document language, visible and accessible English copy, metadata, removed language controls and missing Vietnamese routes. `tests/english-content.mjs` checks original English workbook content, approved About summaries, service scopes and internal links. The browser suites cover the six English routes, forms, keyboard navigation, mobile, reduced motion and no-JavaScript behavior.

This language decision supersedes bilingual instructions and verification counts in earlier design and implementation records.

Visual evidence is saved under `design/home-a-mockup-2026-10-12/verification/`: `english-only-desktop.png` shows Home without language controls; `english-only-mobile-menu.png` shows the English mobile navigation and contact content. The existing English detail-page content and layouts are preserved.

Verification passed: complete `npm test` (55 browser checks plus the content, interaction and motion suites), build, static checks, source/build English-only checks, deployment links/assets under `/pay_orbit`, and whitespace checks.
