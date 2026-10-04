# CAS-NGS Plugin Performance Improvement Plan

## Purpose

Fix plugin console errors first, preserve the homepage's intended header/splash/blocks, then consolidate the separately developed code. Do not run Lighthouse or another reporting workflow during these first two steps. The site owner will decide when to run Lighthouse after the codebase step.

This plan is based on the Lighthouse report in `casngs.com-20261003T191820.html` (requested URL `https://casngs.com/`, captured 2026-10-04) and a source review of this plugin directory. It is a plan, not a claim that the live site has already been fixed. The existing `faster.md` is an earlier investigation with different measurements; keep it intact for now and reconcile or archive its assumptions only after the new baseline is agreed.

## Baseline From The Supplied Report

| Lighthouse metric | Supplied result |
| --- | ---: |
| Performance score | 0.28 |
| First Contentful Paint | 2.7 s |
| Largest Contentful Paint | 5.5 s |
| Speed Index | 13.2 s |
| Total Blocking Time | 3,450 ms |
| Time to Interactive | 9.9 s |
| Main-thread work | 41.8 s |
| Maximum Potential FID | 1,080 ms |
| Total transferred resources | about 2.41 MB |
| Script transfer | about 911 KB |
| Image transfer | about 681 KB |

The report identifies the first corridor-card copy paragraph (`.cor3d-copy`) as the LCP element. The document backend response is reported as fast (50 ms in the server-response audit); the report points toward browser rendering and resource work, rather than PHP response time, as the first area to investigate. This is one Lighthouse sample, and device/network settings must be recorded on the next run before comparing scores.

### Latest Report: 2026-10-04 03:23 UTC

The newer `casngs.com-20261003T202344.json` report still scores Performance **0.27**. It reports FCP **3.5 s**, LCP **5.6 s**, Speed Index **9.8 s**, TBT **2,480 ms**, TTI **9.3 s**, CLS **0**, and about **16.2 s** of main-thread work. The page made 121 requests totaling about **2.41 MB**, including about **917 KB** of scripts and **681 KB** of images. Relative to the earlier supplied run, TBT and Speed Index are lower, while FCP/LCP are not improved; the main-thread totals vary substantially between runs, so treat them as observed samples, not a controlled benchmark.

The LCP is still the first `.cor3d-copy` paragraph. The report identifies a forced-reflow call in `corridor-hero-engine.js` with about **772 ms** of reflow time. Its render-blocking audit estimates **1,250 ms** of savings. It attributes about **1,617 ms** of blocking to the unversioned Three.js request, about **402 ms** to the Tailwind CDN build, and about **720 ms** to GoDaddy's commerce SDK. The unused-JavaScript audit estimates **189 KiB** of savings, including the two Three.js files and Google Tag Manager.

The report records both the unversioned `three.min.js` and the plugin's `three.min.js?ver=r128`, each about **121 KB**. Inspection of the current live homepage source traced the unversioned tag to a literal site-head snippet (`<!-- Three.js -->`), not to current plugin code. Remove that site-head tag and keep the plugin's registered Three.js handle as the single owner. The latest network report also shows two downloads of `assets/models/dna.glb`, each about **245 KB**; the DNA-background and corridor scenes independently create GLTFLoader instances for the same model.

### Priority Queue From The Latest Evidence

| Priority | Finding and ownership | Next action |
| --- | --- | --- |
| P0: finish Step 1 | Two Three.js r128 instances remain because a raw site-head script duplicates the plugin handle. | Remove the site's manual `<!-- Three.js -->` script include. Confirm the console warning clears and only the plugin request remains. This snippet is outside the plugin workspace. |
| P1: Step 2 runtime | Corridor pointer interactions read geometry with `getBoundingClientRect()`; Lighthouse attributes about 772 ms forced reflow to the corridor engine. Scene setup/render work also contributes to long tasks and frame violations. | Cache geometry outside pointer handlers; gate expensive setup and animation by visibility/state; avoid per-frame layout reads/writes. Preserve the scene's scroll choreography. |
| P1: Step 2 shared assets | The same 245 KB GLB is downloaded twice by independently initialized DNA and corridor scenes. The homepage also loads large shared engines/assets even though some features are block-specific. | Inventory current consumers, then implement safe shared fetch/parse caching or another dedupe path and conditionally enqueue feature assets without breaking blocks, shortcodes, templates, or editor behavior. |
| P1: external site integrations | Tailwind's CDN build, Google Tag Manager, and GoDaddy commerce code account for substantial script work/render blocking but are not owned by this plugin. | Coordinate production Tailwind compilation and third-party load/consent strategy with their owners; don't dequeue them from this plugin blindly. |
| P2: media and fonts | The WordPress uploads footer PNG is about 523 KB with an estimated 497 KiB savings; one plugin WebP is also oversized. Several Google Font requests and CSS `@import` chains remain. | Resize/convert the uploads image at its source; size plugin images appropriately; consolidate/conditionally load font declarations after runtime work. |
| P3: maintainability | Color values, defaults, animation helpers, and rendering patterns are repeated across PHP, CSS, and JavaScript. | During Step 2, centralize only truly shared tokens/utilities and retain intentional block-specific differences. This is a maintainability goal; its direct Lighthouse benefit is not established. |

The report also shows 767 DOM elements and CLS 0, so excessive DOM size/layout shift is not currently a leading bottleneck. The console's Meshopt SIMD message is a decoder capability warning, not a load exception; the missing-decoder exception is gone. Chrome `[Violation]` entries are timing warnings, not thrown errors.

### Confirmed Plugin Findings (Before Step 2)

- `cas_ngs_suite_front_assets()` enqueues header/footer CSS and JavaScript, plus Google Fonts, on every frontend page. The splash markup, stylesheet, and script are also installed globally, and the splash CSS hides the rest of the body while the animation is active.
- `cas_bio_enqueue_frontend_assets()` enqueues the shared biotech CSS/engine, GSAP plugins, Three.js, GLTFLoader, postprocessing files, the DNA enhancer, and the corridor stylesheet/engine on every frontend page. The client engines may be inert without their markup, but the network and parse costs are not.
- The report contains two Three.js r128 requests (about 121 KB each) and two requests for the same `dna.glb` (about 245 KB each). The code has separate Three.js entry points: the WordPress `three` handle and the dynamic loader in `assets/header-footer.js`. The actual runtime owners and page placements must be mapped before deduplicating model loads.
- The shared biotech engine, DNA enhancer, and corridor engine all include animation work. The DNA background's render loop runs continuously; dock and WebGL loops can keep scheduling frames while idle or offscreen; the pipeline updates a heatmap and HUD during its render loop. The report also attributes a forced-reflow finding to `corridor-hero-engine.js`.
- `includes/cas-ngs-biotech-blocks.php` does not enqueue Three.js `Pass.js`, although `ShaderPass.js` extends `THREE.Pass`. The console's `Class extends value undefined` is consistent with that missing dependency/order. Verify this against the actual deployed r128 files before changing the chain.
- The console's `setMeshoptDecoder must be called before loading compressed files` error is emitted from the DNA enhancer while loading `dna.glb`. Either load a compatible Meshopt decoder before parsing the model or deliver a compatible uncompressed model. A failed model load is a functional issue, not just a warning.
- `assets/css/corridor-hero.css` and `assets/css/stacking-hero.css` use CSS `@import` for Google Fonts. This adds a stylesheet dependency chain. The Lastica font used by the splash has no `font-display` declaration.
- A stacking-hero image is reported without explicit dimensions, though the run's cumulative CLS metric is 0. The layout-shift audit lists 15 very small shifts; do not treat this run as evidence of a significant CLS failure, but reserve image dimensions and re-check after other work.

### Site-Level Findings Outside This Plugin

These are visible in the report but are not fixes to make blindly in this plugin:

- The page loads `cdn.tailwindcss.com`; its production warning and roughly 130 KB transfer originate in site content/theme or another integration.
- Google Tag Manager, GoDaddy commerce scripts, Ultimate Member, WooCommerce, and WordPress core assets contribute to unused JavaScript/CSS or render-blocking work. Coordinate changes with whoever owns those integrations; do not dequeue another plugin's assets from this plugin without confirming site behavior.
- The footer image `png-for-footer.png` is served from WordPress uploads, is about 523 KB, and Lighthouse estimates about 497 KiB of potential savings. This image is not in this plugin's assets. The site owner should convert/resize it and provide responsive image sizes.
- The `cas-ngs-header-account-menu.code-snippets.php` file is a standalone optional snippet, not included by the plugin bootstrap. If it is separately active through a snippets plugin or theme, verify whether its global inline CSS/JavaScript is needed before changing it.
- `JQMIGRATE: Migrate is installed` is an informational compatibility message, not itself a JavaScript error. Trace the dependency before attempting to remove jQuery Migrate.

## Step 1: Fix Plugin Console Errors

**Current task: resolve actionable plugin exceptions and duplicate library loading. No Lighthouse or reporting run in this step.**

The homepage composition is understood: the site-wide header and one-time splash, plus the corridor hero, DNA background, stacking hero, and Act 1-4 sections. Preserve these features and their intended visual sequence.

### Code changes made

- Registered Three.js r128 `Pass.js` before `ShaderPass.js` and added it to the WordPress dependency graph. This addresses the `Class extends value undefined` exception.
- Registered the Meshopt decoder shipped with the same Three.js r128 examples, made it an explicit GLTFLoader dependency, and configured each GLTFLoader instance before loading the compressed `dna.glb`. The local 244,632-byte model requires `EXT_meshopt_compression` and `EXT_texture_webp`; r128's loader supports WebP.
- Removed the header runtime's independent on-demand Three.js CDN injection. It now uses the plugin's shared `window.THREE` instance, avoiding this plugin's second library import.
- Added `font-display: swap` for the splash's Lastica font so slow font delivery does not hold the wordmark invisible.

### Verify after activating the updated plugin

1. Check the homepage console for the `ShaderPass` exception, Meshopt decoder error, and multiple-Three warning. Do not treat `JQMIGRATE` or the Tailwind warning as plugin errors; they have separate owners.
2. Confirm the DNA model appears in the DNA background and corridor, and confirm the header's ambient canvas still uses the shared Three.js instance.
3. Check first visit and repeat visit to ensure the existing splash behavior is preserved. Do not change the splash to a different display rule as part of this fix.
4. If errors remain, capture the exact failing script URL/version and model URL. A deployed model may differ from this workspace file.

### Step 1 completion gate

Step 1 is closed as requested: the plugin-owned uncaught exceptions and compressed-model decoder error were fixed. The unversioned Three.js tag found in the live site head is external to the plugin; removing it is recommended to avoid a duplicate transfer, but it does not block Step 2.

### Console items that are not exceptions

Chrome's `[Violation]` entries identify slow work rather than thrown errors. The 300+ ms DOMContentLoaded handlers, forced reflows, long animation frames, timer work, and scroll lag need runtime profiling and scheduling/refactor work in Step 2. This step does not claim those performance warnings are fixed. JQMIGRATE, Tailwind CDN, GTM, and GoDaddy messages are external to the plugin unless their owning integration is changed separately.

## Step 2: Consolidate And Professionally Refactor

**After Step 1 is confirmed working. Preserve the existing block output and behavior while reducing duplicated code and conflicting ownership.**

### Implemented In This Pass

- Removed the unused interactive pipeline block, renderer, editor registration, CSS, engine, shortcodes, and admin diagnostics.
- Added `assets/js/three-asset-cache.js`; DNA and corridor consumers share one URL-keyed fetch/parse and receive separate scene clones.
- Made the DNA runtime standalone instead of overriding a second initializer. Removed its unused section-anchor scan and associated `offsetHeight` reads.
- Paused the DNA ScrollTrigger and WebGL loop while the corridor covers it. The corridor render loop now stops offscreen and in hidden tabs.
- Cached corridor card bounds outside pointermove handlers; changed the top-dock RAF to run only while its spring moves; changed waveform animation from layout-triggering height changes to transforms and pause it offscreen/reduced-motion.
- Scoped the biotech runtime and Three.js decoder/GLTF/postprocessing assets to blocks, shortcodes, and DNA meta that need them. Kept the Three.js core for the site-wide header canvas.
- Centralized shared palette tokens and the Plus Jakarta Sans font request.

Static PHP/JavaScript checks pass, and a focused cache harness confirms one model request produces independent scene clones. A WordPress staging check is still needed for visual/scroll behavior; no Lighthouse run has been made.

### Work

1. Inventory repeated palettes, typography tokens, render helpers, Three.js/GSAP setup, animation lifecycle code, and PHP asset registration. Move genuinely shared values/helpers into clear shared modules; keep block-specific presentation and behavior local.
2. Define a single source for plugin design tokens (palette, fonts, spacing where shared) and consume it from block styles/renderers. Do not force every block to look identical or replace its intentional palette variations.
3. Establish one Three.js/GLTFLoader/decoder and GSAP registration path, one canonical block asset-enqueue path, and one documented ownership path for shared runtime functions. Remove duplicate code only after all block, shortcode, template-part, and editor references are accounted for.
4. Reduce main-thread work: defer expensive scene setup until needed, stop animation frames/timers while hidden or offscreen, reduce per-frame DOM/layout reads, and clean up listeners and WebGL resources. Specifically address the reported forced reflow in the corridor engine and expensive DOMContentLoaded/render callbacks.
5. Reconcile duplicated or competing render paths and version declarations without dropping saved content compatibility. Keep WordPress Gutenberg registration, dynamic rendering, shortcodes, and the Twenty Twenty-Five theme integration working.
6. Add focused syntax/manifest/smoke checks for the edited slices. Do not make Lighthouse the gate for each refactor change.

### Step 2 completion gate

The homepage's header, splash, corridor, DNA background, stacking hero, and Act 1-4 blocks still render and behave as before; duplicate shared declarations and asset paths have clear ownership; Chrome console has no plugin exceptions; and idle/offscreen scenes no longer perform unnecessary continuous work.

## Step 3: Lighthouse, Only When The Site Owner Is Ready

After Step 2 is accepted, the site owner may run Lighthouse once and share the new report. Compare it with the latest report above (Performance 0.27, FCP 3.5 s, LCP 5.6 s, Speed Index 9.8 s, TBT 2,480 ms, CLS 0). Use the result to choose the next site-performance task; do not prescribe repeated runs or make Lighthouse a prerequisite for the work in Steps 1 and 2.

The supplied report also identifies work outside this plugin: Tailwind's production CDN, analytics/commerce scripts, WordPress/WooCommerce/Ultimate Member assets, and the approximately 523 KB footer image from WordPress uploads. Coordinate those with their owners rather than silently dequeuing them from this plugin.

## Console Message Triage

| Console output | Classification | Planned response |
| --- | --- | --- |
| `JQMIGRATE: Migrate is installed` | Informational | Identify any legacy dependency before removing compatibility support. |
| Tailwind CDN production warning | Site integration | Replace the runtime CDN compiler with compiled CSS outside this plugin unless plugin ownership is confirmed. |
| Slow-network Lastica font fallback | Plugin-owned loading/typography | Add font-display policy; decide whether the splash/font should be requested on that page. |
| `Multiple instances of Three.js` | Plugin/integration conflict | Consolidate to one compatible library handle and verify theme/plugin ownership. |
| `ShaderPass ... extends value undefined` | Plugin dependency error | Verify/load `Pass.js` before `ShaderPass.js`, or remove unsupported postprocessing dependency. |
| 300+ ms DOMContentLoaded handlers and long animation callbacks | Runtime performance | Split initialization and make visual work viewport/state-driven; profile after each step. |
| Forced reflow and non-composited animations | Runtime/CSS performance | Use the Performance trace to fix measured hot paths and compositor-ineligible animation properties. |
| `setMeshoptDecoder must be called...` | Model loading error | Supply the matching decoder before parse or a tested uncompressed model. |

## Scope Boundary

This plan focuses on the plugin and its direct integrations. Lighthouse also identifies substantial third-party/site assets, including Tailwind, analytics/commerce scripts, WordPress/WooCommerce/Ultimate Member styles, and the uploads footer image. Those need coordinated owner approval and separate before/after checks; the plugin should not silently override them.

## Next Step

Activate this Step 2 build on staging and verify the homepage scenes, corridor-to-DNA pause/resume, block/shortcode/template rendering, and pages without 3D. Run Lighthouse only after the site owner accepts Step 2.