# CAS-NGS Core Suite — 3D Corridor Hero + DNA Background fixes (v1.8.0)

## ⚠️ If "nothing changed" after uploading

The most common cause of "nothing changed" is **stale files or cache**, not the
code. The fixes only take effect when the *latest* files are actually live.
Check these in order:

1. **Re-run `bash build-package.sh`** from this folder *after* pulling the
   latest files, then upload the *new* `cas-ngs-header-footer.zip`. If you
   uploaded a zip built from older files, the fixes aren't there.
2. **Confirm the version on disk.** Open
   `wp-content/plugins/cas-ngs-header-footer/includes/cas-ngs-biotech-blocks.php`
   on the server and confirm `CAS_BIO_BLOCKS_VERSION` reads **1.8.0**. If it
   shows an older number, the plugin on the server is stale — re-upload.
3. **Deactivate → reactivate the plugin** in WP Admin after uploading.
4. **Hard-refresh the editor/page** (`Ctrl+Shift+R` / `Cmd+Shift+R`). Scripts
   are versioned with `?ver=1.8.0`, so a hard refresh forces the new JS.
5. **Clear any caches**: browser cache, and any caching plugin / object cache
   / server opcode cache (e.g. `wp cache flush`, restart PHP-FPM).
6. **Verify in the console**: in the block editor console you should see
   `[corridor-editor] script loaded (v1.8.0, pure-ascii)`. If the version
   shown is older, the old script is still being served (cache).

## v1.8.0 changes

- **Corridor "Theme and Model" crash (React error #130) — hardened.** The
  crash was an *undefined component* passed to `el()`. Every control in the
  panel (palette, model URL, trail toggle, DNA tint, bar darkness) is now
  individually guarded: a control missing from a given WP build is skipped
  rather than thrown, so the panel can no longer crash the block.
- **DNA background cycling — made robust.** Section discovery prioritizes the
  theme's section classes, falls back to top-level blocks, and if fewer than 2
  usable sections exist, cycles the helix poses once per viewport-height of
  scroll across the whole document (so it always animates). A
  `ScrollTrigger.refresh()` runs after wiring.
- **Duplicate DNA toggle** — `cas_bio_deduplicate_dna_metaboxes()` removes any
  non-canonical metabox whose title mentions "DNA" (priority 9999), keeping
  only the wired `cas_bio_dna_bg_meta` toggle.



## v1.7.1 refinements

- **DNA background froze after the first enhancer pass** — the combined
  section selector let a broad container (e.g. a group block) swallow the
  theme's `.cas-act-*` sections via the nested-filter, collapsing the list to
  fewer than 2 entries so no ScrollTriggers were built. Section discovery now
  *prioritizes* the theme's section classes and only falls back to top-level
  blocks, and if still too few, cycles the poses once per viewport of scroll
  across the whole document so the helix always animates. A
  `ScrollTrigger.refresh()` runs after wiring (the wrapper was moved to
  `<body>`, which invalidates trigger positions).
- **Corridor "Theme and Model" panel crashed the block editor** — it used
  `wp.components.ColorControl`, which is missing/unstable in some WP builds;
  passing an undefined component to `el()` throws and kills the block. The
  color field now uses `ColorPalette` (widely available) with a plain
  hex-text fallback, so the panel can no longer crash. The bar-darkness
  slider also guards against non-numeric values.



## 3D DNA *Background* block fixes (v1.7.0)

These address the `blocks/dna-background` feature (distinct from the corridor
hero above), via a new additive enhancer `assets/js/dna-background-enhance.js`
plus a small includes-file change. The stock `biotech-blocks-engine.js` and
`blocks/dna-background/render.php` are left untouched.

**1. Duplicate / non-functional toggle removed.** The Page tab showed two
"3D DNA…" options, one of which did nothing. A new
`cas_bio_deduplicate_dna_metaboxes()` (hooked at `add_meta_boxes`, priority
9999 so it runs after everything else) keeps only the canonical metabox
(`cas_bio_dna_bg_meta`, the one wired to
`cas_bio_maybe_render_global_dna_background`) and removes any *other* metabox
whose title mentions "DNA" — regardless of exact wording — so you're left
with exactly one working toggle.

**2. Off-center / squished DNA when added as a block — fixed.** The block
renders its `position:fixed` canvas inline inside the post content, so any
ancestor with a `transform`/`filter`/`will-change` (common in block themes)
re-roots the fixed element and squeezes/offsets it. The sidebar-metabox method
renders via `wp_footer` at body level, which is why it looked perfect. The
enhancer relocates the wrapper to `document.body` before initializing, so
`position:fixed` is viewport-relative and the helix is centered/full-bleed
regardless of where the block is inserted.

**3. DNA freezing after 3–4 sections — fixed.** The stock engine only builds
pose transitions for the handful of sections it detects, so the helix went
still past them. The enhancer broadens section discovery to every top-level
content section/block and cycles the pose list with modulo, so the helix keeps
changing pose for every section on the page, indefinitely (1→2→3→1→2→3…).



## Tweakable WebGL colors + card theme match (v1.7.0)

Two new block attributes (in the block sidebar under **Theme and Model**):

- **DNA backbone tint** (`dna_tint_color`) — a color picker that re-skins the
  Frame-1 helix backbone (the GLB is fully re-skinned, not blended, so the
  chosen color is applied faithfully). Blank = the palette default. The
  bronze default backbone was also lightened from `#3d2c23` to `#503c2d`
  (steel: `#212c45` → `#2b395a`) so the DNA is less dark out of the box.
- **Frame-4 bar darkness** (`bar_darken`) — a 0–0.9 slider that darkens every
  bar in the Frame-4 heatmap by the *same* ratio (default 0.15 = 15% darker),
  so the relative contrast/combination between bars is preserved.

**Card theme now matches act1–act4:** the corridor cards adopt the other
blocks' design language — **Plus Jakarta Sans** display type (via the same
`--cas-bio-font-display` variable the act blocks use, with the font
`@import`-ed as a fallback), dark-brown `#362115` titles, muted `#5a4d41`
body copy, cream card fill `rgba(235,225,210,0.65)` and bronze border
`rgba(134,84,56,0.22)` — instead of the previous Playfair/ivory treatment.

## ⚠️ IMPORTANT — block renamed in v1.6.0

The block was renamed from `cas-ngs/3d-corridor-hero` to
**`cas-ngs/corridor-hero-3d`**. If you inserted the block in any page while
testing earlier versions, re-insert it (the old slug no longer exists). The
folder is still `blocks/3d-corridor-hero/` — only the block.json `name`
changed.

## ✅ DEFINITIVE ROOT CAUSE — the block slug started with a digit (fixed in v1.6.0)

After every prior theory was ruled out by console diagnostics (registry was
correct, the known-working `act1` block registered fine, the
`cas-ngs-biotech` category existed, and `allowedBlockTypes` was `true`), the
one remaining difference was the block name itself:

```
cas-ngs/3d-corridor-hero        <- slug starts with "3", a DIGIT  (INVALID)
cas-ngs/act1-hero-sequencer     <- starts with a letter            (valid)
```

WordPress block names must match `/^[a-z][a-z0-9-]*\/[a-z][a-z0-9-]*$/` —
i.e. **the slug must start with a letter**. Gutenberg's own error reads:
*"Block names must … start with a letter."* Because `3d-corridor-hero`
begins with a digit, `wp.blocks.registerBlockType()` rejected it and returned
`undefined` on every attempt, so the block never reached the inserter.

The reason this was so hard to spot: **PHP's server-side validation is more
lenient**, so the `?cas-debug=1` page showed `[registered]` even though the
*editor* (client-side) refused the name. Server-registered ≠ inserter-visible.

**The fix (v1.6.0):** the block is renamed to the letter-initial
`cas-ngs/corridor-hero-3d`. All references were updated consistently:
`block.json` `name`, the editor script's `BLOCK_NAME`, the fallback
registration + `has_block()` check in `includes/cas-ngs-biotech-blocks.php`,
and the auto-generated wrapper-class selectors
(`.wp-block-cas-ngs-corridor-hero-3d`) in `corridor-hero-engine.js` and
`corridor-hero.css`. The registration also keeps the house pattern (only
`edit`/`save` passed client-side) and the file remains pure ASCII.

**Verify:** after re-uploading and hard-refreshing the editor, the console
should show `[corridor-editor] registered OK at stage "immediate"` and
`DIAG: block type PRESENT. category="cas-ngs-biotech"`. The block then
appears in the inserter under **CAS-NGS Biotech Blocks** — search
**"Corridor"**.

---

## Full-viewport pinning & fly-in handoff (fixed in v1.6.1)

If the corridor scrolled away as one lump (leaving blank space) instead of
pinning each frame fullscreen, the cause was `position: sticky` on the stage.
Many themes set `overflow` (or a transform) on a content ancestor, which
silently breaks `position: sticky` — so the stage scrolled with the page
instead of pinning, even though the frame-snapping itself was working.

**The fix (v1.6.1):**
- The stage is now `position: fixed` (full `100vw × 100vh`), which pins
  regardless of ancestor `overflow`/containment. It starts parked below the
  viewport so a below-the-fold corridor never covers the page.
- The engine drives its vertical offset for a smooth takeover: it **flies up
  from below** as the corridor scrolls into view, **pins** while the four
  frames advance (one scroll per frame via the GSAP Observer snap), then
  **flies out upward** over the last viewport-height so the next section
  rises in from the bottom — the PowerPoint-style "fly-in" handoff.
- Scrolling down on Frame 4 now glides a full viewport past the spacer
  (no dead scroll) and hands off to native page scroll.
- Also fixed: the engine's root selector matched both the corridor container
  and its WP block wrapper (nested), which could double-initialize the
  engine. It now targets only `#corridor-canvas-container.cor3d-wrap`.

**Verify:** re-upload + hard-refresh; each scroll should advance one
fullscreen frame, and scrolling past Frame 4 should fly the next section in
from the bottom with no blank gap.

# Full integration guide


Integration package for the **"From Sample to Code"** 4-station 3D corridor
block (`cas-ngs/3d-corridor-hero`) into the `cas-ngs-header-footer` plugin.

---

## 1 · Root cause: why the block was missing from the Gutenberg inserter

### The symptom
`[cas_corridor_hero]` rendered perfectly on the front end, but
**3D Corridor Hero** never appeared in the block inserter (`+` menu).

### How the seven working blocks actually reach the inserter
A comparative audit of the repository (main loader `cas-ngs-header-footer.php`,
`includes/cas-ngs-biotech-blocks.php`, `assets/js/biotech-blocks-editor.js`,
and every `blocks/*/block.json`) shows the inserter requires **two
independent registrations**, exactly as the suite's own `?cas-debug=1`
audit page states — *"a block only appears in the inserter if it is
(a) registered server-side AND (b) has its editor JavaScript loaded"*:

1. **Server:** `cas_bio_register_blocks()` loops its `$blocks` array and
   calls `register_block_type( blocks/<folder> )` from each `block.json`.
2. **Client:** the shared bundle `biotech-blocks-editor.js` (handle
   `cas-ngs-biotech-blocks-editor`, referenced by every working block.json
   via `"editorScript"`) executes `wp.blocks.registerBlockType(...)` **at
   module top level** for each block. The inserter is fed by this
   client-side registry — server registration alone never lists a block.

The shared bundle depends only on `wp-blocks`, `wp-element`,
`wp-block-editor`, `wp-components`, `wp-i18n`, and previews attribute
values with styled in-editor panels (no `ServerSideRender`).

### Why the corridor block failed
The shortcode works without *any* registration — the universal renderer
includes `render.php` directly — which is why the front end looked fine
while the inserter stayed empty. The block's original wiring had three
single-points-of-failure the seven working blocks do not have:

| # | Deviation from house architecture | Failure mode |
|---|---|---|
| 1 | **Private editorScript chain** — `block.json` pointed only at `cas-ngs-corridor-hero-editor`. That handle is enqueued *only if* the block.json registration succeeded on the live install; if the updated `includes` file (or the folder) was missing or stale, no script → no client registration → invisible block, zero errors. | Silent |
| 2 | **Out-of-convention dependency** — the editor script required `wp-server-side-render`, which no other block in the suite uses. One unresolvable dependency aborts the whole script before `registerBlockType` runs. | Silent |
| 3 | **No fallback** — the working blocks ride one always-loaded shared bundle; the corridor block had no second path to either registration. | Silent |
| 4 | **`editorScript` was a JSON array** — all seven working blocks use a plain string. The main loader registers the block straight from `block.json`, and a non-string `editorScript` is the one shape the discovery path can silently drop, so the editor handle never resolves. | Silent |
| 5 | **No diagnostics / stale cache** — any load or registration failure happened with zero console output, and the editor's aggressive JS cache could keep serving an old script. | Silent |

### The fix (v1.5.3) — registered exactly like the working blocks, at every layer
1. **`blocks/3d-corridor-hero/block.json`** — `editorScript` is now a
   **plain string** `"cas-ngs-corridor-hero-editor"`, matching the exact
   shape all seven working blocks use, so the main loader's block.json
   discovery resolves the editor handle reliably.
2. **`includes/cas-ngs-biotech-blocks.php`**
   - The corridor editor script is now **enqueued directly** inside the
     existing `enqueue_block_editor_assets` hook — it loads in the editor
     even if the block.json metadata sync is broken on a given install.
   - Dependency list trimmed to the house convention (the
     `wp-server-side-render` dependency is removed).
   - **Self-healing fallback registration** at `init:11`: if
     `WP_Block_Type_Registry::get_instance()->is_registered(
     'cas-ngs/3d-corridor-hero' )` is false (missing folder, JSON error,
     stale install), the block is registered programmatically with the
     identical attribute schema, `render_callback`, style and editor
     scripts — the same registry idiom the suite's own audit page uses.
3. **`assets/js/corridor-hero-editor.js`** — rewritten in house style:
   top-level `wp.blocks.registerBlockType`, `useBlockProps`, `ctrl()`
   helpers, styled live-value station previews (ServerSideRender removed
   entirely), and a `console.error` so any future registration failure is
   loud instead of silent.

### Verify after updating — do these steps in order
1. **Rebuild & re-upload the ZIP** (`bash build-package.sh`), then in WP
   Admin deactivate → replace → activate the plugin.
2. **Hard-refresh the block editor** — this is essential. The editor
   caches block JS aggressively. Open a page in the editor and press
   `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac). The version bump
   to `1.5.3` changes the `?ver=` param so the new script is fetched.
3. **Find it in the inserter** — click the `+`, then either type
   **Corridor** in the search box, or scroll to the category
   **CAS-NGS Biotech Blocks**. The block is titled
   *3D Corridor Hero: Sample to Code*.
4. **Confirm in DevTools** — with the block editor open, open the browser
   console (F12). You should see:
   ```
   [corridor-editor] script loaded
   [corridor-editor] registered OK — search "Corridor" in the block inserter …
   ```
   - If you see **both lines** but the block still isn't listed, you are
     looking at a cached editor — repeat step 2, or open an incognito
     window.
   - If you see **nothing**, the editor script isn't loading → go to
     Troubleshooting below.
   - If you see a **`console.error`** line, it states exactly what failed.

### Troubleshooting (block still missing from the inserter)
Work top-down; each item maps to a concrete check.

- **A. Stale editor cache (most common).** Hard-refresh (`Ctrl/Cmd+Shift+R`)
  or use an incognito window. Confirm the script tag is present: in the
  editor, View Source / DevTools → Network → filter `corridor-hero-editor`
  → it should return **200** with `?ver=1.5.3`.
- **B. Editor script not enqueued.** The handle is registered on `init:5`
  and enqueued in `enqueue_block_editor_assets`. Verify your installed
  `includes/cas-ngs-biotech-blocks.php` is the v1.5.3 version (search it
  for `cas-ngs-corridor-hero-editor` — it must appear in
  `cas_bio_register_corridor_editor_script`,
  `cas_bio_enqueue_editor_assets`, and the fallback registration).
- **C. `block.json` not discovered.** `?cas-debug=1` must list
  `3d-corridor-hero -> cas-ngs/3d-corridor-hero [registered]`. If it says
  `[NOT registered]`, the `blocks/3d-corridor-hero/` folder (with a valid
  `block.json` at its root) is missing or nested too deep in the install.
- **D. Wrong WP version.** `render: "file:./render.php"` and
  `apiVersion: 3` need **WordPress 6.1+**. On older installs the block.json
  registration is skipped (the fallback still registers the block, but
  upgrade WP for full fidelity).
- **E. Object/opcode cache.** If you use an object cache or OPcache, flush
  it after activating (`wp cache flush` / restart PHP-FPM) so the new PHP
  and JSON are read.

### ✅ ROOT CAUSE FOUND — client registration duplicated block.json metadata (v1.5.6)

**Symptom:** the console showed
`registerBlockType returned undefined at stage "immediate"` — on the *first*
call, in a fresh registry, while the seven working blocks register fine.

**Root cause (found by diffing against `biotech-blocks-editor.js`):** the seven
working blocks register with **only the function fields** —
`registerBlockType(name, { edit })` — and put **all metadata** (title,
category, icon, keywords, attributes, supports) in the server-side
`block.json`, which WordPress merges in. The corridor editor script instead
re-passed that metadata *again* from the client:
`registerBlockType(name, { title, category, icon, attributes, supports, edit, save })`.
On WordPress 6.9, re-declaring `attributes`/metadata that already comes from a
server-registered `block.json` makes `registerBlockType` reject the settings
and return `undefined` — so the block never reached the inserter, at every
retry stage.

**Fix (v1.5.6):** the client script now registers with **only `edit` and
`save`**, exactly matching the working blocks. The attribute schema lives
solely in `blocks/3d-corridor-hero/block.json` (already complete), and
`props.attributes` in the edit component reads those merged values. The
`wp.domReady` + timed-retry guards remain as a safety net.

**Confirm:** in the block editor console you should now see
`[corridor-editor] registered OK at stage "immediate"` followed by
`DIAG: block type present. category = "cas-ngs-biotech"`. Hard-refresh
(`Ctrl/Cmd+Shift+R`), then search **Corridor** or browse **CAS-NGS Biotech
Blocks** in the inserter.

### Block "registers OK" but then disappears from the registry (v1.5.5 — superseded)

If your console shows all three of these:
```
[corridor-editor] script loaded
[corridor-editor] registered OK
[corridor-editor] DIAG: block type NOT retrievable from the client registry.
```
then registration is *working* but the **block editor initializes its block
registry after the editor script runs and discards the early registration.**
The block is added at script-load, then wiped when the editor boots — so it
never reaches the inserter. (The old "registered OK" log also fired even when
`registerBlockType` returned `undefined`, which masked this.)

**Fixes applied in v1.5.5:**
1. **Boot-survivable registration** — the editor script now registers the
   block at four points: immediately, on `wp.domReady`, and on timed retries
   (600ms / 1600ms / 3200ms). Each attempt checks whether the block is already
   present and verifies the return value, so whichever registry the editor
   settles on ends up with the block.
2. **Honest verification** — registration now logs `registered OK at stage …`
   only when `registerBlockType` actually returns the block type, and logs a
   `console.error` when it returns `undefined`.
3. **`wp-dom-ready` dependency** added to the script handle so
   `wp.domReady` is guaranteed available.

**Confirm it worked** — in the block editor console (F12) you should see:
```
[corridor-editor] registered OK at stage "immediate" (or domReady / retry@…)
[corridor-editor] DIAG: block type present. category = "cas-ngs-biotech" …
```
Then hard-refresh (`Ctrl/Cmd+Shift+R`), open the inserter, and search
**Corridor** or browse **CAS-NGS Biotech Blocks**.

If the final `DIAG` line *still* says the block is not retrievable after all
four attempts, the editor is swapping registries in a way the retries can't
catch — run this in the console to see what is actually registered:
```js
wp.blocks.getBlockTypes().filter(b => b.name.startsWith('cas-ngs/')).map(b => b.name)
```
and share the output: if *none* of the seven working `cas-ngs/*` blocks appear
either, the issue is site-wide (a plugin/theme wiping the registry), not
specific to this block.

### Block appears "registered" but is hidden from the inserter (v1.5.4)

If `?cas-debug=1` says `[registered]` **and** the console says
`[corridor-editor] registered OK`, yet the block and the
**CAS-NGS Biotech Blocks** category are still absent, the cause is the
**block category**, not the registration. The inserter hides any block
whose `category` is not present in the editor's category list — from both
the browse view *and* search.

**Root cause (found in this install):** the client-side
`registerBlockType` originally omitted `category` / `title` / `icon` /
`keywords`, relying on WordPress to merge them from the server
`block.json`. On WP 6.9 that merge did not occur, so the block had no
category and was hidden.

**Fixes applied in v1.5.4:**
1. The editor script now registers the block **self-sufficiently** with
   `category: 'cas-ngs-biotech'`, `title`, `icon`, `keywords` and
   `supports` supplied client-side (no reliance on server metadata merge).
2. The `block_categories_all` filter now accepts the editor context
   (`10, 2`) and the legacy `block_categories` filter is also hooked for
   pre-5.8 installs, so the category always reaches the editor.

**Confirm it worked** — in the block editor console (F12) you should now see:
```
[corridor-editor] script loaded
[corridor-editor] registered OK — search "Corridor" …
[corridor-editor] DIAG: block type present. category = "cas-ngs-biotech" …
[corridor-editor] DIAG: editor categories = …, cas-ngs-biotech, …
```
If the last `DIAG` line still reports the category **MISSING**, run these
in the console to identify what is filtering it:
```js
// categories the editor actually has
wp.data.select('core/blocks').getCategories().map(c => c.slug)

// is a theme/plugin restricting allowed blocks?
wp.data.select('core/editor') && wp.data.select('core/editor').getEditorSettings().allowedBlockTypes
```
- If `allowedBlockTypes` returns an **array** (not `true`), your theme or
  another plugin allow-lists blocks — add `cas-ngs/3d-corridor-hero` (and
  the other `cas-ngs/*` names) to that list.
- If categories are filtered, a plugin is hooking `block_categories_all`
  at a later priority and removing entries — check other active plugins.

**Then:** hard-refresh the editor (`Ctrl/Cmd+Shift+R`), open the inserter,
and search **Corridor** or browse **CAS-NGS Biotech Blocks**.

---

## 2 · Full-viewport pinning & zero-gap Section 5 exit (Phase 1, preserved)

- **100vw × 100vh takeover** — the block wrapper forces
  `margin/padding: 0; max-width: none`, and the wrap breaks out of any
  theme container via `width: 100vw; margin-inline: calc(50% - 50vw)`.
  The engine adds `cor3d-active` to `<html>`; CSS applies
  `overflow-x: clip` so the scrollbar gutter never creates overflow.
- **Pinned 4-frame sequencing** — 4 × 100vh of scroll travel with a
  `sticky` 100svh stage. GSAP Observer (enabled only inside the pin
  window) turns each wheel tick / swipe / arrow key into one
  `power2.inOut` glide of 0.8–1.2 s to the next station, input-locked
  mid-flight — the scene never halts between frames. Dots and keys
  `1–4` / `Home` / `End` jump directly.
- **Zero-gap elevated release** — theme margins are stripped from the
  wrapper and its next sibling; when Frame 4 completes and the pin
  releases, the engine lifts the stage (`translateY −8%`, `scale 0.97`,
  slight fade over 0.6 vh) so Section 5 rises in with a perceptible,
  seamless handoff — no white space, no hard cut. Scrolling back up
  re-engages the corridor at Frame 4.

## 3 · Visual fidelity (preserved)

- **No raw GLTF textures.** The bundled `dna.glb` ships red/blue/orange PBR
  maps that are never rendered: every mesh is re-skinned on load with
  brand materials (the same override pattern as the suite's own
  `initDnaBackground`) — Obsidian Bronze `#3d2c23` backbone
  (metalness 0.3 / roughness 0.35, emissive 0.15) and Signature Bronze
  `#865438` basepairs (emissive 0.2), with the crisp white rim light
  (1.5) from behind/top-right and a 1.15 key.
- **Frame 1 pose** matches the prototype: `rotation.z = -0.75`,
  `rotation.x = 0.45`, `position.x = 1.2`, `position.y = -0.2`, 1.25×
  scale — the diagonal top-right → bottom-left sweep.
- Whole-card float keyframes (`±8px / ±1°`, 4 s), hover elevation, zero-g
  tilt, and the pooled A·T·C·G cursor trail are intact.
- **Gutenberg editability** — all 16 station strings (kicker / title /
  description / badge × 4) are plain attributes edited in the sidebar
  with live preview; card glass, borders and text bind to
  `var(--wp--preset--color--base/primary/accent)` via `color-mix`, so any
  `theme.json` palette re-skins the block natively. Steel Blue Academic
  re-derives every material from its own palette (zero bronze/gold/amber).

---

## 4 · File manifest (this package)

| File | Status | Purpose |
|---|---|---|
| `blocks/3d-corridor-hero/block.json` | UPDATED 1.5.2 | editorScript now `[shared house bundle, corridor editor]`; 16 station attrs + palette/model/trail. |
| `blocks/3d-corridor-hero/render.php` | v1.5.1 | Attribute-bound `#corridor-canvas-container` + 4 cards; preset-derived card/border colors. |
| `assets/js/corridor-hero-engine.js` | UPDATED 1.5.2 | Corridor WebGL/Observer module: full-bleed pin, station snaps, material overrides, **elevated pin-release handoff**, offscreen idling. |
| `assets/js/corridor-hero-editor.js` | REWRITTEN 1.5.2 | House-style top-level `registerBlockType`, live station previews, no nonstandard deps, loud error reporting. |
| `assets/css/corridor-hero.css` | UPDATED 1.5.2 | Scoped `cor3d-*`: breakout, overflow clip, zero-gap guards, stage `will-change`, card physics, editor overrides. |
| `includes/cas-ngs-biotech-blocks.php` | UPDATED 1.5.2 (additive) | `3d-corridor-hero` in the loop; **direct editor enqueue; self-healing fallback registration; render callback**; shortcodes; body class. No existing logic altered. |
| `assets/models/dna.glb` | UNCHANGED | Shared model; materials overridden at runtime. |

The existing `biotech-blocks-engine.js`, `biotech-blocks.css`,
`biotech-blocks-editor.js`, the main loader, and all seven block folders
remain **byte-for-byte untouched**.

---

## 5 · Directory tree — unified plugin package

```
cas-ngs-header-footer/
├── cas-ngs-header-footer.php              (repo — unchanged)
├── README.md                              (repo original; replaced by this doc in the ZIP)
├── build-package.sh                       (clone + overlay + zip helper)
├── block.js · assets/header-footer.*      (repo — unchanged)
├── includes/
│   └── cas-ngs-biotech-blocks.php         (UPDATED, additive only → v1.5.2)
├── assets/
│   ├── css/
│   │   ├── biotech-blocks.css             (repo — untouched)
│   │   └── corridor-hero.css              (NEW — full-bleed + cor3d-* styles)
│   ├── js/
│   │   ├── biotech-blocks-engine.js       (repo — untouched)
│   │   ├── biotech-blocks-editor.js       (repo — untouched)
│   │   ├── corridor-hero-engine.js        (NEW — corridor module)
│   │   ├── corridor-hero-editor.js        (NEW — inserter registration + UI)
│   │   └── dna-background-enhance.js      (NEW — DNA bg off-center + infinite-loop fix)
│   └── models/
│       └── dna.glb                        (repo — shared model)
└── blocks/
    ├── README.txt                         (repo — unchanged)
    ├── act1-hero-sequencer/               (repo — untouched)
    ├── act2-bento-grid/                   (repo — untouched)
    ├── act3-process-timeline/             (repo — untouched)
    ├── act4-cta-banner/                   (repo — untouched)
    ├── dna-background/                    (repo — untouched)
    ├── header-top-dock/                   (repo — untouched)
    ├── interactive-pipeline-hero/         (repo — untouched)
    └── 3d-corridor-hero/                  (NEW)
        ├── block.json
        └── render.php
```

---

## 6 · Install / update

### Build the ZIP
```bash
bash build-package.sh        # clones the repo, overlays this package,
                             # writes cas-ngs-header-footer.zip
```
Windows (PowerShell) after cloning + overlaying:
```powershell
Compress-Archive -Path .\cas-ngs-header-footer -DestinationPath .\cas-ngs-header-footer.zip
```

### Install
WP Admin → **Plugins → Add New → Upload Plugin** → upload the ZIP →
Install → Activate. For an existing install, deactivate → replace →
reactivate, then clear caches.

### Update an existing site manually (paths are identical)
```
includes/cas-ngs-biotech-blocks.php
blocks/3d-corridor-hero/
assets/js/corridor-hero-engine.js
assets/js/corridor-hero-editor.js
assets/js/dna-background-enhance.js
assets/css/corridor-hero.css
```

### Notes
- Requires WordPress 6.1+ (`render: file:./render.php`).
- The block now registers even if `blocks/3d-corridor-hero/` is missing
  on disk (fallback path), but keep the folder — it carries `render.php`.
- `dna.glb` loads from the shared plugin path; its textures are never
  displayed. Custom model: paste a URL into *Theme & Model → DNA model
  URL* — it is re-skinned with the brand materials automatically.
- Sticky pinning needs an unclipped ancestor; if a theme wraps content in
  `overflow: hidden`, set that ancestor to `overflow: visible` (or use
  `--cor3d-sticky-top` to clear a fixed header).
