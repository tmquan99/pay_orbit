# Services editorial design QA — 2026-10-12

final result: passed

The previous Home A report is preserved in docs/home-a-design-qa.md.

## Comparison target and normalization

- Selected option 1: design/services-editorial-2026-10-12/selected-mockup.png,
  841×1870 raster pixels. This exact displayed result was used, not option 2 or 3.
- Implementation: http://127.0.0.1:3000/services/, English, light theme, all
  descriptions closed, all images loaded and entrances finished, scrollY=0.
- Desktop CSS viewport 1440×1000, DPR 1. Screenshot content is 1425×3232 pixels
  because Chromium reserves 15px for its vertical scrollbar.
- Source and implementation are independently normalized to 720px width in
  comparison-final-full.png: 720×1601 and 720×1633. The roughly 2% difference
  in normalized full-page height is accounted for by native 44px disclosure
  targets, actual source copy wrapping and the shared production footer.
- Combined full and focused source/implementation inputs were opened together,
  left=source, right=implementation. Focused inputs: comparison-final-hero.png,
  comparison-final-network.png, comparison-final-design.png and
  comparison-final-deployment-support.png. compare-final.mjs reproduces these.
- Mobile CSS viewport 390×844, DPR 1; screenshot content width 375px with the
  scrollbar reserved, full height 5606px. implementation-final-mobile.png,
  mobile-hero.png, mobile-network.png and mobile-menu.png were opened.
  There is no approved mobile source screenshot; mobile is a responsive
  adaptation, not a claim of pixel identity to a mobile mock.

All evidence above is in design/services-editorial-2026-10-12/.

## Findings and iteration history

1. Initial comparison blocked, P1: Deployment and Support inherited the wrong
   alternating columns. Corrected explicit service placement: network/rack left,
   security/support right; the design flow remains in its own left column.
2. Initial comparison blocked, P2: generic summary borders made an extra card
   treatment; strong blue even-row backgrounds and excess vertical space drifted
   from the source. Removed the summary box, used the pale brand canvas, aligned
   content beneath headings, and tuned section dimensions. Final combined full
   input restores the editorial rhythm.
3. Second comparison blocked, P2: stretched grid rows caused large blank gaps
   in checklists; the flow asset's transparent margin made Design too tall.
   Split checklists into independent semantic lists and framed the raster flow
   through CSS. Final focused Design input shows all four nodes and labels,
   with no clipped image content.
4. Responsive checks blocked, P2: enlarged hero overflowed at 1280px; the
   Cybersecurity label overflowed the three-column mobile index at 360px.
   Contained hero paint and stacked mobile index icons above labels.
   Regression checks pass at 320,360,390,768,1024,1280,1440px.
5. Functional check blocked, P2: the last index item did not become current
   when the short final section could not reach the reading line. Added a
   document-bottom condition. Support now becomes current at the bottom.
6. Broad browser check blocked, P2: compact disclosure rows were 34px high.
   Restored 44px controls and retuned the Network/Support spacing. Keyboard
   and target-size checks pass.
7. Final visual refinement: enlarged hero/network artwork and reduced photo
   width to better match the source composition. Recaptured and inspected the
   final combined full and focused Network input after the changes. Final
   desktop section heights: hero519, Network455, Cybersecurity482, Design358,
   Deployment481, Support455, closing145px; shared footer182px.
8. Existing header comparison had a timing-dependent hover-color assertion
   across two tabs. Its test now compares settled styles under reduced motion;
   product header styles were unchanged. The header suite passes at six widths.

## Required fidelity surfaces

- Fonts/typography: existing self-hosted Bricolage Grotesque headings,
  Be Vietnam Pro reading/UI, Manrope brand. Three-line desktop hero, blue
  keywords, 32px service headings, 14px checklists and source hierarchy retained.
  Real font loading and unclipped text checked at all seven responsive widths.
- Spacing/layout: section order, icon/title alignment, alternating artwork,
  independent two-column lists, Design flow, native disclosure and outline CTA
  match the source composition. Mobile becomes a single-column reading flow.
  No heading/summary overlap or horizontal page overflow.
- Colors/tokens: dark existing header/footer, near-white surface, pale blue
  alternate rows, restrained blue accent and outlined service CTAs. Source's
  slight raster background texture is represented by clean production surfaces.
- Image quality/assets: all six source subjects are supplied as separate generated
  raster assets, with local WebP exports and provenance. Globe topology,
  coordinated shield/cloud/firewall, four design nodes, rack aisle and support
  desk are present. No CSS/handcrafted SVG replaces illustration subjects.
  Existing approved logo background and pinned Lucide icon family are retained.
- Copy/content: full new workbook descriptions and all 38 key areas are available;
  quick benefit summaries and five source CTAs are visible. Correct workbook
  sheet is recorded. No SLA, support time or fabricated customer claim added.

## States and validation

Passed static syntax, routes, internal anchors, workbook copy and asset integrity.
Passed Services browser suite for sticky clearance, bottom current state,
keyboard expansion, complete scopes, responsive sizes, reduced motion,
BFCache and no-JavaScript content. Existing browser/Home/About/Solutions/
Products/motion/back-to-top/closing-CTA suites passed. GitHub Pages build and
all published route/asset/import checks under /pay_orbit passed.
In-app browser verified mobile menu, disclosure opening/closing and console:
no errors.

## Residual P3 differences / limits

Standalone generated assets reproduce the subjects and art direction, but minor
lighting, equipment detail, icon stroke/shape and perspective differ from the
generated mockup. Native browser text rendering, actual content wrapping, 44px
targets and shared production footer also differ slightly. These are explicit
minor fidelity limits; this report does not claim 99.99% pixel identity.
The entire new page remains local and uncommitted for user review.

## Implementation checklist

- [x] Approved first visual resolved and preserved.
- [x] Revised workbook content and Dev/UI notes applied.
- [x] Generated raster assets, responsive exports and provenance.
- [x] Desktop and mobile functional and visual verification.
- [x] Combined full and focused comparisons, fixes and recapture.
- [x] Build and GitHub Pages base-path validation.
- [x] User review and explicit authorization to commit.
- [ ] Push/deployment (not requested).

## Typography follow-up — 2026-10-12

User requested consistency with the rest of the website after reviewing the
implementation. This supersedes the mockup's smaller typography: Services now
inherits shared heading/body weight, tracking and line-height, with the Solutions
heading scale (desktop H1 60px and section H2 40px; responsive H2 28px on mobile).
Checklist text is 16px and shared hero/closing CTA button typography is restored.
Heading spacing and hero column proportions accommodate the larger text. Mobile
service navigation uses two columns and a full-width Support item for readable
14px labels. Section order, illustrations, content and animation are preserved.

Evidence: `design/services-editorial-2026-10-12/typography-desktop.jpg` and
`design/services-editorial-2026-10-12/typography-mobile.jpg`.
Services browser checks passed at 320–1440px, including sticky clearance,
keyboard disclosure, reduced motion, BFCache and no-JavaScript content.
Closing CTA animation checks passed on desktop/mobile. In-app browser console
reported no errors. Changes remain local and uncommitted.

Subsequent user refinements: scope checklist weight is 500; title badges are
52px with 28px icons on desktop and 40px with 22px icons on mobile. Services
containers now inherit the shared site width rather than overriding it at
1232px. Content/footer alignment was measured at 1510px (both 1200px wide),
900px (both left edges 32px), and 390px (both left edges 20px), with no horizontal
overflow. Detail illustrations are capped at 460px, and hero oversizing removed.
Services browser suite passed after the width and image changes. Visual evidence:
`design/services-editorial-2026-10-12/aligned-width-desktop.jpg`.

Shared contact invitation follow-up: Home and About/Solutions/Services/Products
now use `scripts/contact-invitation-markup.mjs` and shared styles in `src/site.css`.
The approved blue Home section, title, description, white button and three
checklist items replace the old detail-page invitation. Detail-page staggered
entrance still animates the heading, description and nested button once.
The CTA suite compares computed styles with Home at 390px and 1440px, verifies
copy/form destination and overflow, and checks entrance/reduced-motion/no-JS
behavior. CTA, Home layout, page routes and static checks passed.
Evidence: `design/services-editorial-2026-10-12/shared-contact-cta-desktop.jpg`
and `shared-contact-cta-mobile.jpg`. No commit or push performed.

Solution Design image follow-up: removed the fixed 150px clipping frame and
negative 66px image offset. The flow now uses its natural aspect ratio at every
breakpoint. The Services suite first reproduced the clipping failure, then
passed the new image containment assertion at 320–1440px after the CSS fix.
Evidence: `design/services-editorial-2026-10-12/design-flow-fixed-tablet.jpg`
and `design-flow-fixed-mobile.jpg`.

The user subsequently requested a local commit of the completed changes.

## Home desktop security illustration — 2026-10-13

Scope: implement the selected revised desktop hero; the user's latest instruction
explicitly hides the new illustration on mobile. Existing Home copy, smaller
heading scale, shared header, CTA, and complete panorama remain the baseline.

Source visual truth: `design/home-hero-security-2026-10-13/approved-desktop.png`
(1586×992). The mobile reference is `approved-mobile-before-hide-request.png`
(853×1844), superseded specifically for illustration visibility by the latest
user instruction. Current implementation captures are
`verification/desktop.jpg` (1425×891, CSS viewport 1440×900) and
`verification/mobile.jpg` (375×812, CSS viewport 390×844), relative to the same
design folder. Browser screenshots are slightly scaled by the in-app surface;
references were normalized to the corresponding captured pixel dimensions.
State: Home at scrollY 0 after its one-time entrance settles, menu closed.

Full-view evidence: `verification/desktop-comparison.png` and
`verification/mobile-comparison.png` (reference left, implementation right).
Focused typography/CTA/asset evidence: `verification/hero-detail-comparison.png`.

Findings and comparison history:
- Initial desktop art was visually smaller than the selected direction. The
  wide-screen frame was enlarged within the existing page margin without
  moving text or introducing horizontal overflow. Initial comparison is retained
  as `verification/desktop-comparison-initial.png`; final captures show the fix.
- No actionable P0/P1/P2 findings remain. Preserving the established page width,
  font scale, header and original uncropped panorama is intentional. The mockup's
  more compact panorama composition is not recreated by clipping the source.
- Mobile omits the shield and its space by explicit user request. The original
  panorama and primary action remain visible; no desktop WebP is requested in a
  fresh 390px browser context.

Required fidelity surfaces:
- Fonts/typography: existing Bricolage Grotesque and Be Vietnam Pro load; black
  and blue slogan lines preserve their approved reduced scale and wrap without
  clipping at all six tested widths.
- Spacing/layout: desktop grid separates copy and art, including at 768px;
  mobile collapses to the original single column. CTA remains clear of art and
  panorama, with no horizontal overflow.
- Colors/tokens: existing surface, dark header, blue accent and text colors are
  retained. Transparent artwork blends with the surface without a white box.
- Image quality: generated glass shield/check and orbital data tracks match the
  selected subject; no repeated buildings, servers or cloud nodes. PNG alpha and
  both WebP dimensions/digests verified; full panorama is uncropped.
- Copy/content: slogan, description, CTA and panorama captions are unchanged;
  raster illustration contains no UI text. Decorative art is hidden from AT.

Interaction/verification: fresh build and static/provenance checks passed;
Home layout checks passed at 1440/1024/768/390/360/320px, including mobile asset
visibility and no download. Home motion/reduced-motion/no-JS checks passed.
The 55-check browser suite passed all six English routes at all six widths,
including menu, anchors, primary journey, fonts and console/page-error checks.
After enlarging only the wide-screen frame, build, whitespace and Home layout
checks were rerun and passed. Manual mobile hero CTA reaches
`/contact/#consultation_form` and Back returns to Home.

Follow-up polish: the generated shield's glass facets are a close conceptual
recreation, not an exact pixel extraction. No functional or accessibility gap
was introduced by this decorative variation.

Implementation checklist: asset and provenance registered; desktop composition
implemented; mobile visibility/download exclusion verified; screenshots reviewed;
responsive and motion checks passed.

final result: passed
