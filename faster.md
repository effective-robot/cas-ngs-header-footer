
## Goal and Guardrails

Make the homepage appear quickly, scroll naturally, and keep its existing brand, layout, colors, text, and finished animation style. Reduce unnecessary downloads and background work first; tune visible animation quality only when measurements show it is needed. We cannot promise a perfect frame rate on every device, but we can measure progress and avoid visual regressions.

We will change one phase at a time. Every phase has a checkpoint; if appearance or behavior regresses, stop and fix that phase before continuing. Do not test code changes directly on the live site without a backup and rollback plan. Staging is preferred.

## What the Repository Shows

- Splash markup, CSS, and JavaScript are added on every frontend page. Its CSS hides other direct body children until the animation finishes. The script uses a one-time `DOMContentLoaded` listener, not a scroll listener. Its `sessionStorage` flag means once per browser-tab session, not once forever. The splash covers the page; it does not make the homepage download faster.
- Act 1's hero heading, paragraph, buttons, and media start invisible in CSS and depend on JavaScript to reveal them.
- The shared biotech loader currently enqueues GSAP, Three.js, postprocessing, GLTFLoader, the DNA enhancer, and corridor assets on every frontend page. HTML-only Acts 1–4 do not need all those libraries.
- Splash GSAP 3.12.2 and biotech GSAP 3.12.5 use different handles, so both can be downloaded.
- The pipeline intercepts global wheel/touch input and forces the page back to scroll position zero while engaged. This is the first scroll behavior to correct.
- The DNA background renders continuously. The pipeline ticker updates every 130 ms, Act 1 waveform bars change height every 90 ms, and some loops keep scheduling frames while their drawing is paused.
- The corridor skips most draw work when far offscreen and pauses drawing when the tab is hidden, but its frame callback still schedules itself continuously. It uses a 2048px shadow map and optional postprocessing.
- The DNA GLB is 3,392,288 bytes on disk and 3,245,569 bytes gzipped in this workspace. Model optimization may help, but cannot by itself fix scroll locking or unnecessary work each frame.

These are code findings, not live-site measurements. Theme, hosting, fonts, images, and third-party scripts may add other costs.

## Phase 0: Safe Baseline (No Code Changes)

### What you do

1. If possible, ask your hosting provider or WordPress administrator for a staging copy. Make a backup before later deployment. Do not deactivate the plugin on the live site if its blocks are needed there.
2. In WordPress, open **Settings > Reading** and note the selected homepage. Open it in the editor and use **List View** to note the CAS-NGS blocks present. Also check **Appearance > Editor > Template Parts** for header/footer. Take screenshots; do not delete or move blocks.
3. Open the homepage in a Chrome Incognito window while logged out. Press `F12`, select **Network**, check **Disable cache**, and reload. Take a screenshot of the page top and Network list after it finishes. Note requests containing `three`, `gsap`, `dna.glb`, or `cas-splash`.
4. In Developer Tools, open **Lighthouse**, select **Mobile**, and run **Analyze page load**. Save or screenshot the report, especially LCP, Speed Index, Total Blocking Time, and opportunities. Run twice; one result can vary.
5. To capture scroll stutter, open **Performance**, click **Record**, reload, scroll down once at a normal pace, then click **Stop**. Save the trace if offered. If that is difficult, send screenshots of the summary and long-task bars instead.
6. Repeat steps 3–5 once in a normal browser tab after the first visit. This distinguishes first-visit splash behavior from a repeat visit.

### What to send back

- Homepage URL if public; phone/desktop type; browser; approximate connection (Wi-Fi/mobile); and whether this was Incognito or a repeat visit.
- Screenshots of block List View, Network requests, and Lighthouse summary. A Performance trace is helpful but optional.
- Whether you viewed the page as a visitor or editor, and whether the two old “Act 0” blocks appear anywhere in the homepage, Site Editor template parts, other pages, or snippets.

Do not send passwords, cookies, WordPress login links, or a raw Network HAR file; HAR files can include private request data.

### Checkpoint

Agree on actual page composition and record initial measurements. The earlier LCP values (10.79 s and 12.73 s) are not comparable by themselves because the reported LCP element changed between runs.

## Phase 1: First Screen and Splash

### Code work

- Scope splash markup and assets to the homepage. Keep the logo artwork and visual identity. Use one small self-contained animation instead of downloading a separate GSAP copy just for the splash.
- Keep the splash to one play per browser-tab session unless you choose another meaning of “first visit.” No global scroll/input listener, no waiting for the 3D model, and no inner-page cover. Set a short maximum display time so a slow connection cannot trap visitors.
- Keep homepage text and controls visible in HTML/CSS if JavaScript is delayed or fails. Entrance motion should enhance visible content, not be required to reveal it.
- Keep corridor station text readable as a static fallback until its 3D scene is ready. The splash must not wait for WebGL or `dna.glb`.
- Respect `prefers-reduced-motion` for the splash and entrance effects.

### Your check

Visit the homepage twice in the same tab, then visit an inner page. Confirm the splash plays only on the intended first homepage visit, never covers the inner page, and never leaves the page covered. Confirm headline and buttons stay visible if animations are delayed. Compare screenshots to baseline.

### Checkpoint

No text, layout, color, or finished animation appearance is lost. Slow model loading or failed JavaScript cannot hide the headline or hold the visitor on the splash.

## Phase 2: Normal Scroll Control

### Code work

- Enable pipeline wheel/touch capture only when the scene is ready and the visitor is inside its active pinned area. Do not force the whole window back to the top.
- Keep native scrolling, scrollbar dragging, keyboard scrolling, links, and touch working outside the active scene. Releasing the last station must always hand control back to the page.
- Make corridor and pipeline mutually exclusive scroll owners if both appear on a page. Preserve the corridor's intended pinned transition while active.
- Check fixed/sticky stage behavior with the actual WordPress theme before changing section layout.

### Your check

On staging, try mouse wheel, trackpad, touch swipe, arrow/Page Down keys, scrollbar dragging, header links, and moving from the pinned scene into the next section. Record a short screen video if anything jumps or feels trapped.

### Checkpoint

Native scrolling works before and after the scene, without unexpected jumps or skipped sections.

## Phase 3: Load Only Needed Assets

### Code work

- Separate asset registration from downloading. Keep a lightweight path for HTML/CSS blocks; load Three.js, GLTFLoader, and postprocessing only for a 3D feature actually rendered.
- Consolidate GSAP to one compatible version and WordPress handle.
- Load the corridor engine only for the corridor; the DNA enhancer/model only for a DNA background; Observer only for an active pinned interaction.
- Cover Gutenberg blocks, shortcodes, Full Site Editing template parts, patterns, and the optional DNA metabox. Do not rely only on the saved page body; that can miss template content.
- Keep editor previews/scripts out of visitor pages. Do not remove a block renderer just because its inserter entry is hidden.
- Load shared header/footer assets and fonts only where needed, while preserving template-part support.

### Your check

On a simple test page without a 3D block, check Network and confirm there are no Three.js, postprocessing, Observer, or `dna.glb` requests. Then test the homepage combinations you actually use and confirm all needed blocks render on desktop and mobile.

### Checkpoint

Pages without 3D no longer download 3D assets. Used blocks, shortcodes, and template parts still render correctly.

## Phase 4: Demand-Driven Animation

### Code work

- Defer WebGL setup until the scene approaches the viewport. Pause rendering when offscreen or the tab is hidden; resume on re-entry.
- Store/cancel animation-frame IDs when paused or destroyed. Do not keep an idle frame callback alive forever.
- Pause offscreen intervals and DOM updates. Replace frequent waveform height writes with transforms where visually equivalent; update text only when its displayed value changes.
- Keep header dock and footer canvas work paused when offscreen. Share scene/model data only if that can be done without visual or lifecycle bugs.
- Apply reduced-motion behavior consistently; static scenes should remain branded and legible.

### Your check

Record a scroll from top to bottom, pause, switch browser tabs, and return. Confirm offscreen effects do not keep consuming CPU/GPU, visible animation resumes cleanly, and scrolling stays smooth.

### Checkpoint

No persistent frame/timer work for inactive effects, no console errors, and no visible stalls on the agreed test device.

## Phase 5: Tune 3D Quality, Not the Design

### Code work

- Create a repeatable optimized GLB and keep the original for rollback. Compare geometry/texture compression and model decode time, not just download size.
- Measure corridor shadows, antialiasing, postprocessing, and pixel ratio on phone and desktop. Choose the highest quality that sustains smooth frames on agreed devices; add a lower-cost mobile mode only if needed.
- Reduce hidden-geometry and per-frame DOM work. Do not reduce visible detail or alter palette without your approval of a screenshot comparison.

### Your check

Compare screenshots at the same scroll positions and record video on the same devices as baseline. Note blur, jagged edges, changed color, or stutter.

### Checkpoint

Visual quality is acceptable on agreed devices; optimized assets are reproducible and reversible.

## Phase 6: Remove Confirmed-Unused Features

The unused `cas-ngs/interactive-pipeline-hero` block has been removed from this plugin after the site owner confirmed it is not used. Its renderer, editor registration, frontend engine, CSS, registration, and shortcode aliases are no longer shipped. Do not restore this feature unless a site placement is intentionally reintroduced and reviewed.

The editor bundles remain editor-only and are not visitor frontend runtimes. Before removing any other block or shortcode, verify its usage in pages, Site Editor templates/template parts/patterns, and code snippets.

### Checkpoint

Only explicitly confirmed-unused feature code is removed; active homepage sections and saved content remain supported.

## Final Acceptance Checks

- Existing sections retain their layout, colors, copy, and finished animation states.
- Homepage headline and main action remain visible if JavaScript is disabled or delayed.
- Splash behavior matches the agreed homepage-only/once-per-session rule and never traps a visitor.
- Pages without 3D features make no 3D library/model requests.
- Scroll/touch work outside pinned scenes and always return to native control afterward.
- Desktop and phone checks show no recurring visible stutter, major scroll jump, or uncaught console error.
- Repeat Lighthouse runs on the same device/network consistently improve LCP and Total Blocking Time. Compare several runs; do not promise a universal 2.5-second score before seeing the hosting/device baseline.

## Immediate Next Step

Please complete **Phase 0** and send the screenshots and notes listed there. We will confirm which blocks are actually on the live homepage, establish the baseline, and implement Phase 1 on staging. After you verify its appearance and behavior, we move to Phase 2; we will not change all animation systems in one batch.
