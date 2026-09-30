===============================================================================
 CAS-NGS CORE SUITE - /blocks drop-in directory
===============================================================================

Copy each of your block folders INTO THIS DIRECTORY exactly as they are
(extracted from cas-ngs-biotech-blocks-backup.zip). Do not rename the
folders and do not edit any file inside them - they register themselves
untouched.

Expected result:

    cas-ngs-header-footer/
    +-- cas-ngs-header-footer.php   <- suite bootstrap
    +-- block.js                    <- header + footer editor UI
    +-- assets/                     <- header/footer CSS + engine
    +-- blocks/                     <- THIS DIRECTORY
    |   +-- README.txt
    |   +-- act1-hero-sequencer/    <- example: your folders, as-is
    |   |   +-- block.json
    |   |   +-- render.php
    |   +-- act2-bento-grid/
    |   +-- act3-process-timeline/
    |   +-- act4-cta-banner/
    |   +-- dna-background/
    +-- ...

HOW THE LOADER WORKS (cas-ngs-header-footer.php, init priority 20)

  1. Every sub-folder containing a block.json is registered with
     register_block_type( folder ). WordPress reads the manifest and wires
     the block's own render file, scripts, styles and attributes - exactly
     as editable in the visual editor as before.

  2. Classic fallback: a folder named {slug} containing {slug}.php is
     included once (that file registers itself).

Both run on every page load, so the moment a folder lands here the block
appears in the inserter - no other configuration, nothing modified.

VERIFYING

  - WordPress admin > Plugins: "CAS-NGS Core Suite" active, version 2.1.1.
  - Edit any page > block inserter: search your block names (e.g. "Act 1").
  - If a block does not appear, open ANY wp-admin page with ?cas-debug=1
    appended (e.g. .../wp-admin/index.php?cas-debug=1). The blue notice
    lists every folder discovered under /blocks and whether it registered.

COMMON CAUSES WHEN A BLOCK IS MISSING

  - The plugin active on the site is an OLD copy (the loader arrived in
    v2.0; the parse-error fix in v2.1.1). Re-upload the freshly zipped
    folder and confirm the version shows 2.1.1.
  - The folder is nested one level too deep - block.json must sit at
    blocks/<folder>/block.json:
        blocks/act1-hero-sequencer/block.json        OK
        blocks/act1-hero-sequencer/src/block.json    WRONG
  - block.json has a JSON syntax error, or a "name" that is not
    "namespace/block-slug" (lowercase letters, digits, dashes).
  - "render": "file:./render.php" needs WordPress 6.1 or newer.

ZIP THE WHOLE THING

  Zip the cas-ngs-header-footer folder itself (all of it, /blocks
  included) and upload via Plugins > Add New > Upload Plugin. One plugin
  carries the header, the Sylva footer, the four biotech blocks and the
  background animation together.
