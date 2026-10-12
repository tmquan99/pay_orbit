# Services editorial implementation — 2026-10-12

Selected design: option 1, alternating editorial sections.
Visual source: design/services-editorial-2026-10-12/selected-mockup.png.
Live preview: http://127.0.0.1:3000/services/.

Content source: PAY_ORBIT_Website_Content_v2_Simplified.xlsx, sheet `04_Services.` (trailing dot).
Snapshot, workbook digest and full English copy: content/services.json.
The previous `04_Services` sheet is superseded for this page.

Five sections: Network Consulting, Cybersecurity Consulting, Solution Design,
Deployment & Integration, Security & Network Support. All source paragraphs,
38 key areas and five CTAs are retained. Full paragraphs use native details;
benefit summaries precede technical lists. No SLA or turnaround promise added.
Supply links from the Home/About lifecycle now lead to Products.

Images are conceptual generated illustrations/photographs, not customer projects.
Full prompts and source references are in assets-*.json and content/visual-assets.json.
Production uses locally hosted WebP and 720px variants.
Two added Lucide icons use the same pinned upstream commit as the existing family.

Interaction: native anchors, sticky desktop index, non-sticky mobile index,
keyboard disclosures, subtle existing slide entrances and closing CTA stagger,
reduced-motion and no-JavaScript fallbacks. There is no horizontal carousel.

Validation: static content/routes/provenance checks; browser suites including
320–1440px, menu/focus, disclosures, current section, BFCache, motion preferences,
Home/About links and other routes; GitHub Pages build and /pay_orbit asset check.
Design evidence and comparison history: design-qa.md.
Following local review and typography/layout refinements, the user authorized
a local commit. Push and deployment remain a separate step.
