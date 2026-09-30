<?php
/**
 * CAS-NGS Biotech Blocks -- integrated bootstrap (v1.4.0-port)
 *
 * Ported from cas-ngs-biotech-blocks/cas-ngs-biotech-blocks.php with the
 * behavior changes requested for this suite:
 *
 *   REMOVED  - Global Top Dock auto-injection (wp_body_open / wp_footer).
 *              The dock now renders ONLY where its block, pattern or
 *              shortcode is placed (Appearance > Editor > Patterns >
 *              CAS-NGS, or [cas_top_dock]).
 *   REMOVED  - [cas_ngs_header] shortcode alias (this suite reserves that
 *              shortcode for the fully editable CAS-NGS Header block; the
 *              dock keeps [cas_top_dock]).
 *   KEPT     - Everything else: menu location, block category, editor
 *              script handle + casBioBlocksData localization, block
 *              registration, front-end + editor asset pipeline
 *              (GSAP + Three.js r128 + postprocessing + GLTFLoader),
 *              universal renderer, all other shortcodes, and the opt-in
 *              3D DNA background meta box (fires only when a page
 *              explicitly enables it in the sidebar meta box).
 *
 * The block folders themselves (blocks/*) are untouched originals.
 *
 * v1.5.0-corridor integration (ADDITIVE ONLY — no existing logic altered):
 *   ADDED    - '3d-corridor-hero' in the register_block_type() loop.
 *   ADDED    - cas-ngs-corridor-hero-editor script handle (block editor UI).
 *   ADDED    - cas-ngs-corridor-hero-css / cas-ngs-corridor-hero-engine
 *              front-end handles (scoped cor3d-* module, cor3d- hooks only).
 *   ADDED    - [cas_corridor_hero] / [cas_3d_corridor] shortcodes.
 *
 * @package CAS_NGS_Biotech_Blocks
 */

if ( ! defined( 'ABSPATH' ) ) {
  exit;
}

if ( ! defined( 'CAS_BIO_BLOCKS_VERSION' ) ) {
  define( 'CAS_BIO_BLOCKS_VERSION', '1.8.0' );
}
if ( ! defined( 'CAS_BIO_BLOCKS_PATH' ) ) {
  define( 'CAS_BIO_BLOCKS_PATH', dirname( __DIR__ ) . '/' );
}
if ( ! defined( 'CAS_BIO_BLOCKS_URL' ) ) {
  define( 'CAS_BIO_BLOCKS_URL', plugin_dir_url( dirname( __FILE__ ) ) );
}

/**
 * SECTION 1.1: Register Navigation Menu Location for Dynamic Top Dock Header
 */
function cas_bio_register_nav_menus() {
  register_nav_menus( array(
    'top_dock_menu' => __( 'Top Dock Header Navigation', 'cas-ngs-biotech-blocks' ),
  ) );
}
add_action( 'after_setup_theme', 'cas_bio_register_nav_menus', 20 );
add_action( 'init', 'cas_bio_register_nav_menus', 20 );

/**
 * Register Custom Gutenberg Block Category
 */
function cas_bio_register_block_category( $categories, $editor_context = null ) {
  foreach ( (array) $categories as $cat ) {
    if ( isset( $cat['slug'] ) && 'cas-ngs-biotech' === $cat['slug'] ) {
      return $categories;
    }
  }
  return array_merge(
    array(
      array(
        'slug'  => 'cas-ngs-biotech',
        'title' => __( 'CAS-NGS Biotech Blocks', 'cas-ngs-biotech-blocks' ),
        'icon'  => 'analytics',
      ),
    ),
    $categories
  );
}
add_filter( 'block_categories_all', 'cas_bio_register_block_category', 10, 2 );
/* Legacy filter (pre-WP 5.8) — never fires on modern installs, keeps the
   category available on older ones. Additive; cannot affect the 7 blocks. */
add_filter( 'block_categories', 'cas_bio_register_block_category', 10, 2 );

/**
 * Register the Editor Script handle BEFORE block registration so
 * block.json editorScript: "cas-ngs-biotech-blocks-editor" resolves.
 */
function cas_bio_register_editor_script() {
  wp_register_script(
    'cas-ngs-biotech-blocks-editor',
    CAS_BIO_BLOCKS_URL . 'assets/js/biotech-blocks-editor.js',
    array(
      'wp-blocks',
      'wp-element',
      'wp-block-editor',
      'wp-components',
      'wp-i18n',
      'wp-plugins',
      'wp-edit-post',
      'wp-data',
    ),
    CAS_BIO_BLOCKS_VERSION,
    true
  );

  wp_localize_script(
    'cas-ngs-biotech-blocks-editor',
    'casBioBlocksData',
    array(
      'defaultModelUrl' => CAS_BIO_BLOCKS_URL . 'assets/models/dna.glb',
      'pluginUrl'       => CAS_BIO_BLOCKS_URL,
    )
  );
}
add_action( 'init', 'cas_bio_register_editor_script', 5 );

/**
 * ── CORRIDOR HERO (additive) ─────────────────────────────────────────────
 * Editor UI script for cas-ngs/3d-corridor-hero: attribute panels for all
 * four stations + palette/model controls + live preview.
 *
 * Dependencies mirror the house convention exactly (see
 * cas_bio_register_editor_script above): only the core wp.* handles the
 * shared biotech editor bundle uses. No wp-server-side-render — one
 * unresolvable dependency would abort the script and the block would
 * silently disappear from the inserter.
 */
function cas_bio_register_corridor_editor_script() {
  wp_register_script(
    'cas-ngs-corridor-hero-editor',
    CAS_BIO_BLOCKS_URL . 'assets/js/corridor-hero-editor.js',
    array(
      'wp-blocks',
      'wp-element',
      'wp-block-editor',
      'wp-components',
      'wp-i18n',
      'wp-dom-ready',
    ),
    CAS_BIO_BLOCKS_VERSION,
    true
  );
}
add_action( 'init', 'cas_bio_register_corridor_editor_script', 5 );

/**
 * Register Gutenberg Blocks via block.json metadata.
 * (Acts 0-4 + 3D Background + Pipeline Hero + 3D Corridor Hero)
 */
function cas_bio_register_blocks() {
  $blocks = array(
    'header-top-dock',
    'interactive-pipeline-hero',
    'dna-background',
    'act1-hero-sequencer',
    'act2-bento-grid',
    'act3-process-timeline',
    'act4-cta-banner',
    '3d-corridor-hero',
  );

  foreach ( $blocks as $block ) {
    $block_dir = CAS_BIO_BLOCKS_PATH . 'blocks/' . $block;
    if ( file_exists( $block_dir . '/block.json' ) ) {
      register_block_type( $block_dir );
    }
  }
}
add_action( 'init', 'cas_bio_register_blocks', 10 );

/**
 * Self-healing registration for the 3D Corridor Hero.
 *
 * Runs one tick AFTER cas_bio_register_blocks(). If the block.json
 * registration did not land (missing folder on a stale install, JSON
 * parse failure, or a WordPress quirk), the block is registered
 * programmatically with the identical schema + render callback, so it
 * can never silently vanish from the Gutenberg inserter. Uses the same
 * WP_Block_Type_Registry idiom as the suite's own registration audit.
 */
function cas_bio_register_corridor_hero_fallback() {
  $registry = WP_Block_Type_Registry::get_instance();
  if ( $registry->is_registered( 'cas-ngs/corridor-hero-3d' ) ) {
    return;
  }

  $station_defaults = array(
    'station1_kicker' => 'STEP 01 // SPECIMEN PREPARATION',
    'station1_title'  => 'Sample Extraction',
    'station1_desc'   => 'High-molecular-weight genomic DNA isolated from biological specimens and stabilized in high-purity suspension for deep sequencing.',
    'station1_badge'  => 'CS-0427 · HMW DNA · QC PASS',
    'station2_kicker' => 'STEP 02 // SIGNAL FLUIDICS',
    'station2_title'  => 'Fluorescence Basecalling',
    'station2_desc'   => 'Real-time optical channels capture four-color fluorophore emissions across high-density flowcell channels.',
    'station2_badge'  => 'FLOWCELL 04 · 2×150 BP · LIVE',
    'station3_kicker' => 'STEP 03 // SEQUENCE ALIGNMENT',
    'station3_title'  => 'Digital Reads Processing',
    'station3_desc'   => 'Parallel basecall streams mapped against reference genomes with quality score filtering and error correction.',
    'station3_badge'  => 'Q30 93.1% · 2.4B READS',
    'station4_kicker' => 'STEP 04 // MUTATIONAL ANALYSIS',
    'station4_title'  => 'Variant Matrix Mapping',
    'station4_desc'   => 'Comprehensive identification of single nucleotide variants, insertions, and structural genomic alterations.',
    'station4_badge'  => 'GRCh38 · 4,182 VARIANTS · READY',
  );

  $attributes = array(
    'palette'             => array( 'type' => 'string', 'default' => 'bronze' ),
    'model_url'           => array( 'type' => 'string', 'default' => '' ),
    'enable_cursor_trail' => array( 'type' => 'boolean', 'default' => true ),
  );
  foreach ( $station_defaults as $key => $default ) {
    $attributes[ $key ] = array( 'type' => 'string', 'default' => $default );
  }

  register_block_type( 'cas-ngs/corridor-hero-3d', array(
    'api_version'     => 3,
    'title'           => __( '3D Corridor Hero: Sample to Code', 'cas-ngs-biotech-blocks' ),
    'category'        => 'cas-ngs-biotech',
    'icon'            => 'analytics',
    'description'     => __( 'Full-bleed 4-station 3D sequencing corridor with editable station copy.', 'cas-ngs-biotech-blocks' ),
    'keywords'        => array( 'biotech', '3d', 'corridor', 'dna', 'sequencing' ),
    'textdomain'      => 'cas-ngs-biotech-blocks',
    'attributes'      => $attributes,
    'supports'        => array(
      'align' => array( 'wide', 'full' ),
      'html'  => false,
    ),
    'style'           => 'cas-ngs-corridor-hero-css',
    'editor_script'   => 'cas-ngs-corridor-hero-editor',
    'render_callback' => 'cas_bio_render_corridor_hero',
  ) );
}
add_action( 'init', 'cas_bio_register_corridor_hero_fallback', 11 );

/**
 * Render callback used by the fallback registration (identical output to
 * blocks/3d-corridor-hero/render.php, which it delegates to).
 */
function cas_bio_render_corridor_hero( $attributes = array() ) {
  wp_enqueue_style( 'cas-ngs-corridor-hero-css' );
  wp_enqueue_script( 'cas-ngs-corridor-hero-engine' );
  return cas_bio_render_block_template( '3d-corridor-hero', is_array( $attributes ) ? $attributes : array() );
}

/**
 * Register + enqueue unified CSS/JS bundles + external Three.js & GSAP deps.
 */
function cas_bio_enqueue_frontend_assets() {
  // 1. Unified Stylesheet (checks dist/style.css, falls back to assets/css)
  $css_file = file_exists( CAS_BIO_BLOCKS_PATH . 'dist/style.css' )
    ? 'dist/style.css'
    : 'assets/css/biotech-blocks.css';

  wp_register_style(
    'cas-ngs-biotech-blocks-css',
    CAS_BIO_BLOCKS_URL . $css_file,
    array(),
    CAS_BIO_BLOCKS_VERSION
  );
  wp_enqueue_style( 'cas-ngs-biotech-blocks-css' );

  // CDN base URLs split so no line is long enough to corrupt in transfer.
  $gsap_cdn  = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/';
  $three_cdn = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/';
  $three_ex  = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/';

  // 2. GSAP Core 3.12.5
  if ( ! wp_script_is( 'gsap', 'registered' ) ) {
    wp_register_script( 'gsap', $gsap_cdn . 'gsap.min.js', array(), '3.12.5', true );
  }
  wp_enqueue_script( 'gsap' );

  // 3. GSAP ScrollTrigger 3.12.5
  if ( ! wp_script_is( 'gsap-scroll-trigger', 'registered' ) ) {
    wp_register_script( 'gsap-scroll-trigger', $gsap_cdn . 'ScrollTrigger.min.js', array( 'gsap' ), '3.12.5', true );
  }
  wp_enqueue_script( 'gsap-scroll-trigger' );

  // 4. GSAP Observer 3.12.5 (single-flick 4-frame pipeline locking)
  if ( ! wp_script_is( 'gsap-observer', 'registered' ) ) {
    wp_register_script( 'gsap-observer', $gsap_cdn . 'Observer.min.js', array( 'gsap' ), '3.12.5', true );
  }
  wp_enqueue_script( 'gsap-observer' );

  // 5. Three.js r128
  if ( ! wp_script_is( 'three', 'registered' ) ) {
    wp_register_script( 'three', $three_cdn . 'three.min.js', array(), 'r128', true );
  }
  wp_enqueue_script( 'three' );

  // 6. Three.js Postprocessing Shaders & EffectComposer
  if ( ! wp_script_is( 'three-copy-shader', 'registered' ) ) {
    wp_register_script( 'three-copy-shader', $three_ex . 'shaders/CopyShader.js', array( 'three' ), 'r128', true );
  }
  wp_enqueue_script( 'three-copy-shader' );

  if ( ! wp_script_is( 'three-shader-pass', 'registered' ) ) {
    wp_register_script( 'three-shader-pass', $three_ex . 'postprocessing/ShaderPass.js', array( 'three' ), 'r128', true );
  }
  wp_enqueue_script( 'three-shader-pass' );

  if ( ! wp_script_is( 'three-effect-composer', 'registered' ) ) {
    wp_register_script(
      'three-effect-composer',
      $three_ex . 'postprocessing/EffectComposer.js',
      array( 'three', 'three-copy-shader', 'three-shader-pass' ),
      'r128',
      true
    );
  }
  wp_enqueue_script( 'three-effect-composer' );

  if ( ! wp_script_is( 'three-render-pass', 'registered' ) ) {
    wp_register_script(
      'three-render-pass',
      $three_ex . 'postprocessing/RenderPass.js',
      array( 'three-effect-composer' ),
      'r128',
      true
    );
  }
  wp_enqueue_script( 'three-render-pass' );

  // 7. Three.js GLTFLoader
  if ( ! wp_script_is( 'three-gltf-loader', 'registered' ) ) {
    wp_register_script( 'three-gltf-loader', $three_ex . 'loaders/GLTFLoader.js', array( 'three' ), 'r128', true );
  }
  wp_enqueue_script( 'three-gltf-loader' );

  // 8. Unified Production Client Bundle
  $js_file = file_exists( CAS_BIO_BLOCKS_PATH . 'dist/index.js' )
    ? 'dist/index.js'
    : 'assets/js/biotech-blocks-engine.js';

  wp_register_script(
    'cas-ngs-biotech-blocks-engine',
    CAS_BIO_BLOCKS_URL . $js_file,
    array(
      'gsap',
      'gsap-scroll-trigger',
      'gsap-observer',
      'three',
      'three-copy-shader',
      'three-shader-pass',
      'three-effect-composer',
      'three-render-pass',
      'three-gltf-loader',
    ),
    CAS_BIO_BLOCKS_VERSION,
    true
  );

  wp_localize_script(
    'cas-ngs-biotech-blocks-engine',
    'casBioBlocksData',
    array(
      'defaultModelUrl' => CAS_BIO_BLOCKS_URL . 'assets/models/dna.glb',
      'pluginUrl'       => CAS_BIO_BLOCKS_URL,
    )
  );

  wp_enqueue_script( 'cas-ngs-biotech-blocks-engine' );

  // 8b. DNA Background Enhancer — replaces initDnaBackground to (a) fix the
  // off-center/squished DNA when the block is inserted inline (relocates the
  // wrapper to <body>) and (b) keep the helix pose cycling across every
  // section on the page instead of freezing after the first few sections.
  wp_register_script(
    'cas-ngs-dna-bg-enhance',
    CAS_BIO_BLOCKS_URL . 'assets/js/dna-background-enhance.js',
    array( 'cas-ngs-biotech-blocks-engine' ),
    CAS_BIO_BLOCKS_VERSION,
    true
  );
  wp_enqueue_script( 'cas-ngs-dna-bg-enhance' );

  // 9. 3D Corridor Hero (additive module — scoped cor3d-* namespace,
  //    depends on the unified bundle; existing blocks are untouched).
  wp_register_style(
    'cas-ngs-corridor-hero-css',
    CAS_BIO_BLOCKS_URL . 'assets/css/corridor-hero.css',
    array( 'cas-ngs-biotech-blocks-css' ),
    CAS_BIO_BLOCKS_VERSION
  );
  wp_enqueue_style( 'cas-ngs-corridor-hero-css' );

  wp_register_script(
    'cas-ngs-corridor-hero-engine',
    CAS_BIO_BLOCKS_URL . 'assets/js/corridor-hero-engine.js',
    array( 'cas-ngs-biotech-blocks-engine' ),
    CAS_BIO_BLOCKS_VERSION,
    true
  );
  wp_enqueue_script( 'cas-ngs-corridor-hero-engine' );
}
add_action( 'wp_enqueue_scripts', 'cas_bio_enqueue_frontend_assets' );

/**
 * Enqueue styles and Three.js inside the block editor.
 */
function cas_bio_enqueue_editor_assets() {
  $css_file = file_exists( CAS_BIO_BLOCKS_PATH . 'dist/style.css' )
    ? 'dist/style.css'
    : 'assets/css/biotech-blocks.css';

  wp_enqueue_style( 'cas-ngs-biotech-blocks-css', CAS_BIO_BLOCKS_URL . $css_file, array(), CAS_BIO_BLOCKS_VERSION );
  wp_enqueue_style( 'cas-ngs-corridor-hero-css', CAS_BIO_BLOCKS_URL . 'assets/css/corridor-hero.css', array( 'cas-ngs-biotech-blocks-css' ), CAS_BIO_BLOCKS_VERSION );

  // Corridor Hero editor UI — enqueued DIRECTLY here (not only via the
  // block.json editorScript auto-enqueue) so the inserter registration
  // cannot silently miss it. This mirrors how the seven working blocks
  // guarantee their editor JavaScript is loaded.
  wp_enqueue_script( 'cas-ngs-corridor-hero-editor' );

  $three_cdn = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/';
  $three_ex  = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/';

  if ( ! wp_script_is( 'three', 'registered' ) ) {
    wp_register_script( 'three', $three_cdn . 'three.min.js', array(), 'r128', true );
  }
  wp_enqueue_script( 'three' );

  if ( ! wp_script_is( 'three-gltf-loader', 'registered' ) ) {
    wp_register_script( 'three-gltf-loader', $three_ex . 'loaders/GLTFLoader.js', array( 'three' ), 'r128', true );
  }
  wp_enqueue_script( 'three-gltf-loader' );
}
add_action( 'enqueue_block_editor_assets', 'cas_bio_enqueue_editor_assets' );

/**
 * Universal Block Template Renderer -- shared by Gutenberg and shortcodes.
 */
function cas_bio_render_block_template( $block_slug, $attributes = array() ) {
  $file = CAS_BIO_BLOCKS_PATH . 'blocks/' . sanitize_file_name( $block_slug ) . '/render.php';
  if ( ! file_exists( $file ) ) {
    return '';
  }

  // Ensure assets are queued when invoked via shortcode/template injection.
  wp_enqueue_style( 'cas-ngs-biotech-blocks-css' );
  wp_enqueue_script( 'gsap' );
  wp_enqueue_script( 'gsap-scroll-trigger' );
  wp_enqueue_script( 'gsap-observer' );
  wp_enqueue_script( 'three' );
  wp_enqueue_script( 'three-copy-shader' );
  wp_enqueue_script( 'three-shader-pass' );
  wp_enqueue_script( 'three-effect-composer' );
  wp_enqueue_script( 'three-render-pass' );
  wp_enqueue_script( 'three-gltf-loader' );
  wp_enqueue_script( 'cas-ngs-biotech-blocks-engine' );
  wp_enqueue_script( 'cas-ngs-dna-bg-enhance' );

  ob_start();
  include $file;
  return ob_get_clean();
}

/**
 * Shortcode Registrations (Acts 0-4 + Pre-Hero + Master Full Page).
 * NOTE: [cas_ngs_header] is intentionally NOT registered here -- this suite
 * reserves it for the fully editable CAS-NGS Header block. The dock is
 * available as [cas_top_dock].
 */

// Act 0: Animated Top Dock Header
function cas_bio_shortcode_header_top_dock( $atts = array() ) {
  return cas_bio_render_block_template( 'header-top-dock', is_array( $atts ) ? $atts : array() );
}
add_shortcode( 'cas_top_dock', 'cas_bio_shortcode_header_top_dock' );

// Act 0: 4-Frame 3D Interactive Sequencing Pipeline (Pre-Hero Block)
function cas_bio_shortcode_pipeline_hero( $atts = array() ) {
  return cas_bio_render_block_template( 'interactive-pipeline-hero', is_array( $atts ) ? $atts : array() );
}
add_shortcode( 'cas_pipeline_hero', 'cas_bio_shortcode_pipeline_hero' );
add_shortcode( 'cas_interactive_pipeline', 'cas_bio_shortcode_pipeline_hero' );
add_shortcode( 'cas_act0_pipeline', 'cas_bio_shortcode_pipeline_hero' );

// Act 1: Hero Sequencer Terminal
function cas_bio_shortcode_hero_sequencer( $atts = array() ) {
  return cas_bio_render_block_template( 'act1-hero-sequencer', is_array( $atts ) ? $atts : array() );
}
add_shortcode( 'cas_hero_sequencer', 'cas_bio_shortcode_hero_sequencer' );
add_shortcode( 'cas_ngs_act1', 'cas_bio_shortcode_hero_sequencer' );

// Act 2: Bento Grid
function cas_bio_shortcode_bento_grid( $atts = array() ) {
  return cas_bio_render_block_template( 'act2-bento-grid', is_array( $atts ) ? $atts : array() );
}
add_shortcode( 'cas_bento_grid', 'cas_bio_shortcode_bento_grid' );
add_shortcode( 'cas_ngs_act2', 'cas_bio_shortcode_bento_grid' );

// Act 3: Process Timeline
function cas_bio_shortcode_process_timeline( $atts = array() ) {
  return cas_bio_render_block_template( 'act3-process-timeline', is_array( $atts ) ? $atts : array() );
}
add_shortcode( 'cas_process_timeline', 'cas_bio_shortcode_process_timeline' );
add_shortcode( 'cas_ngs_act3', 'cas_bio_shortcode_process_timeline' );

// Act 4: Conversion CTA Banner
function cas_bio_shortcode_cta_banner( $atts = array() ) {
  return cas_bio_render_block_template( 'act4-cta-banner', is_array( $atts ) ? $atts : array() );
}
add_shortcode( 'cas_cta_banner', 'cas_bio_shortcode_cta_banner' );
add_shortcode( 'cas_ngs_act4', 'cas_bio_shortcode_cta_banner' );

// 3D DNA Helix Background
function cas_bio_shortcode_dna_background( $atts = array() ) {
  return cas_bio_render_block_template( 'dna-background', is_array( $atts ) ? $atts : array() );
}
add_shortcode( 'cas_dna_background', 'cas_bio_shortcode_dna_background' );
add_shortcode( 'cas_3d_dna', 'cas_bio_shortcode_dna_background' );

// 3D Corridor Hero: 4-station Sample → Code GLB corridor (additive)
function cas_bio_shortcode_corridor_hero( $atts = array() ) {
  wp_enqueue_style( 'cas-ngs-corridor-hero-css' );
  wp_enqueue_script( 'cas-ngs-corridor-hero-engine' );
  return cas_bio_render_block_template( '3d-corridor-hero', is_array( $atts ) ? $atts : array() );
}
add_shortcode( 'cas_corridor_hero', 'cas_bio_shortcode_corridor_hero' );
add_shortcode( 'cas_3d_corridor', 'cas_bio_shortcode_corridor_hero' );

/**
 * MASTER FULL PAGE SHORTCODE: [cas_ngs_full_page]
 * Renders the complete integrated layout: Header (Act 0) + 3D DNA Canvas
 * + Acts 1-4.
 */
function cas_bio_shortcode_full_page( $atts = array() ) {
  $output  = '';
  $output .= cas_bio_render_block_template( 'header-top-dock' );
  $output .= cas_bio_render_block_template( 'dna-background' );
  $output .= cas_bio_render_block_template( 'act1-hero-sequencer' );
  $output .= cas_bio_render_block_template( 'act2-bento-grid' );
  $output .= cas_bio_render_block_template( 'act3-process-timeline' );
  $output .= cas_bio_render_block_template( 'act4-cta-banner' );
  return $output;
}
add_shortcode( 'cas_ngs_full_page', 'cas_bio_shortcode_full_page' );

/**
 * Register Page Template Metadata / Custom Post Meta (opt-in DNA settings).
 */
function cas_bio_register_post_meta() {
  $meta_fields = array(
    '_cas_enable_dna_background' => 'boolean',
    '_cas_dna_model_url'         => 'string',
    '_cas_dna_scale'             => 'number',
    '_cas_dna_offset_x'          => 'number',
    '_cas_dna_offset_y'          => 'number',
    '_cas_dna_strand_color'      => 'string',
    '_cas_dna_accent_color'      => 'string',
    '_cas_dna_ambient_intensity' => 'number',
  );

  foreach ( $meta_fields as $key => $type ) {
    register_post_meta( '', $key, array(
      'show_in_rest'  => true,
      'single'        => true,
      'type'          => $type,
      'auth_callback' => function() { return current_user_can( 'edit_posts' ); },
    ) );
  }
}
add_action( 'init', 'cas_bio_register_post_meta' );

/**
 * Sidebar Meta Box for easy page-level toggle (OPT-IN only: the background
 * renders only on pages whose editor explicitly checked the box).
 */
function cas_bio_add_meta_box() {
  add_meta_box(
    'cas_bio_dna_bg_meta',
    __( '3D DNA Simulation Settings', 'cas-ngs-biotech-blocks' ),
    'cas_bio_render_meta_box',
    array( 'page', 'post' ),
    'side',
    'default'
  );
}
add_action( 'add_meta_boxes', 'cas_bio_add_meta_box' );

/**
 * De-duplicate the DNA background metabox.
 *
 * The main CAS-NGS Core Suite loader can register its own "3D DNA simulation
 * settings" panel, which predates this integration and does not drive the
 * background. That leaves two confusing options in the Page tab, one of which
 * does nothing. Keep only the canonical metabox registered above
 * (cas_bio_dna_bg_meta — the one wired to cas_bio_maybe_render_global_dna_background)
 * and remove any other metabox whose title contains "3D DNA", so the editor
 * shows exactly one working toggle.
 */
function cas_bio_deduplicate_dna_metaboxes() {
  global $wp_meta_boxes;
  /* Keep only the metabox that is actually wired to render the background
     (cas_bio_dna_bg_meta → cas_bio_maybe_render_global_dna_background).
     Remove any OTHER metabox whose title mentions DNA, regardless of the
     exact wording, so the Page tab shows a single working toggle. */
  $keep_id = 'cas_bio_dna_bg_meta';
  foreach ( array( 'page', 'post' ) as $screen ) {
    if ( empty( $wp_meta_boxes[ $screen ] ) ) {
      continue;
    }
    foreach ( $wp_meta_boxes[ $screen ] as $context => $priorities ) {
      foreach ( $priorities as $priority => $boxes ) {
        foreach ( $boxes as $id => $box ) {
          $title = isset( $box['title'] ) ? strtolower( trim( (string) $box['title'] ) ) : '';
          if ( $id !== $keep_id && false !== strpos( $title, 'dna' ) ) {
            unset( $wp_meta_boxes[ $screen ][ $context ][ $priority ][ $id ] );
          }
        }
      }
    }
  }
}
add_action( 'add_meta_boxes', 'cas_bio_deduplicate_dna_metaboxes', 9999 );

function cas_bio_render_meta_box( $post ) {
  wp_nonce_field( 'cas_bio_save_dna_meta', 'cas_bio_dna_nonce' );
  $enabled       = get_post_meta( $post->ID, '_cas_enable_dna_background', true );
  $scale         = get_post_meta( $post->ID, '_cas_dna_scale', true );
  $offset_x      = get_post_meta( $post->ID, '_cas_dna_offset_x', true );
  $offset_y      = get_post_meta( $post->ID, '_cas_dna_offset_y', true );
  $strand_color  = get_post_meta( $post->ID, '_cas_dna_strand_color', true );
  $accent_color  = get_post_meta( $post->ID, '_cas_dna_accent_color', true );
  $ambient_int   = get_post_meta( $post->ID, '_cas_dna_ambient_intensity', true );

  if ( '' === $scale ) $scale = '1.0';
  if ( '' === $offset_x ) $offset_x = '0.0';
  if ( '' === $offset_y ) $offset_y = '0.0';
  if ( empty( $strand_color ) ) $strand_color = '#8c6d58';
  if ( empty( $accent_color ) ) $accent_color = '#4ade80';
  if ( '' === $ambient_int ) $ambient_int = '1.8';
  ?>
  <p>
    <label>
      <input type="checkbox" name="cas_enable_dna_background" value="1" <?php checked( $enabled, 1 ); ?> />
      <strong><?php esc_html_e( 'Activate 3D DNA Background', 'cas-ngs-biotech-blocks' ); ?></strong>
    </label>
  </p>
  <p class="description" style="font-size:12px;color:#666;margin-bottom:12px;">
    <?php esc_html_e( 'Fixed Three.js full-viewport canvas with 1-pose-per-section GSAP scroll cycling behind all content.', 'cas-ngs-biotech-blocks' ); ?>
  </p>

  <p>
    <label style="font-size:12px;display:block;margin-bottom:3px;"><?php esc_html_e( 'Scale Multiplier:', 'cas-ngs-biotech-blocks' ); ?></label>
    <input type="number" step="0.1" name="cas_dna_scale" value="<?php echo esc_attr( $scale ); ?>" style="width:100%;" />
  </p>
  <p>
    <label style="font-size:12px;display:block;margin-bottom:3px;"><?php esc_html_e( 'X Offset:', 'cas-ngs-biotech-blocks' ); ?></label>
    <input type="number" step="0.1" name="cas_dna_offset_x" value="<?php echo esc_attr( $offset_x ); ?>" style="width:100%;" />
  </p>
  <p>
    <label style="font-size:12px;display:block;margin-bottom:3px;"><?php esc_html_e( 'Y Offset:', 'cas-ngs-biotech-blocks' ); ?></label>
    <input type="number" step="0.1" name="cas_dna_offset_y" value="<?php echo esc_attr( $offset_y ); ?>" style="width:100%;" />
  </p>
  <p>
    <label style="font-size:12px;display:block;margin-bottom:3px;"><?php esc_html_e( 'Strand Color (Hex):', 'cas-ngs-biotech-blocks' ); ?></label>
    <input type="text" name="cas_dna_strand_color" value="<?php echo esc_attr( $strand_color ); ?>" style="width:100%;" />
  </p>
  <p>
    <label style="font-size:12px;display:block;margin-bottom:3px;"><?php esc_html_e( 'Accent Color (Hex):', 'cas-ngs-biotech-blocks' ); ?></label>
    <input type="text" name="cas_dna_accent_color" value="<?php echo esc_attr( $accent_color ); ?>" style="width:100%;" />
  </p>
  <p>
    <label style="font-size:12px;display:block;margin-bottom:3px;"><?php esc_html_e( 'Ambient Intensity:', 'cas-ngs-biotech-blocks' ); ?></label>
    <input type="number" step="0.1" name="cas_dna_ambient_intensity" value="<?php echo esc_attr( $ambient_int ); ?>" style="width:100%;" />
  </p>
  <?php
}

function cas_bio_save_meta_box( $post_id ) {
  if ( ! isset( $_POST['cas_bio_dna_nonce'] ) || ! wp_verify_nonce( $_POST['cas_bio_dna_nonce'], 'cas_bio_save_dna_meta' ) ) {
    return;
  }
  if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
    return;
  }
  if ( ! current_user_can( 'edit_post', $post_id ) ) {
    return;
  }

  $val = ! empty( $_POST['cas_enable_dna_background'] ) ? 1 : 0;
  update_post_meta( $post_id, '_cas_enable_dna_background', $val );

  if ( isset( $_POST['cas_dna_scale'] ) ) {
    update_post_meta( $post_id, '_cas_dna_scale', floatval( $_POST['cas_dna_scale'] ) );
  }
  if ( isset( $_POST['cas_dna_offset_x'] ) ) {
    update_post_meta( $post_id, '_cas_dna_offset_x', floatval( $_POST['cas_dna_offset_x'] ) );
  }
  if ( isset( $_POST['cas_dna_offset_y'] ) ) {
    update_post_meta( $post_id, '_cas_dna_offset_y', floatval( $_POST['cas_dna_offset_y'] ) );
  }
  if ( isset( $_POST['cas_dna_strand_color'] ) ) {
    update_post_meta( $post_id, '_cas_dna_strand_color', sanitize_hex_color( $_POST['cas_dna_strand_color'] ) );
  }
  if ( isset( $_POST['cas_dna_accent_color'] ) ) {
    update_post_meta( $post_id, '_cas_dna_accent_color', sanitize_hex_color( $_POST['cas_dna_accent_color'] ) );
  }
  if ( isset( $_POST['cas_dna_ambient_intensity'] ) ) {
    update_post_meta( $post_id, '_cas_dna_ambient_intensity', floatval( $_POST['cas_dna_ambient_intensity'] ) );
  }
}
add_action( 'save_post', 'cas_bio_save_meta_box' );

/**
 * Inject 3D DNA Background ONLY when a page explicitly enabled it via the
 * sidebar meta box (opt-in; never automatic site-wide).
 */
function cas_bio_maybe_render_global_dna_background() {
  if ( ! is_singular() ) {
    return;
  }
  $post_id = get_the_ID();
  if ( ! $post_id ) {
    return;
  }

  $enabled = get_post_meta( $post_id, '_cas_enable_dna_background', true );
  if ( ! $enabled ) {
    return;
  }

  $post = get_post( $post_id );
  if ( $post && ( has_block( 'cas-ngs/dna-background', $post ) || has_shortcode( $post->post_content, 'cas_dna_background' ) || has_shortcode( $post->post_content, 'cas_3d_dna' ) || has_shortcode( $post->post_content, 'cas_ngs_full_page' ) ) ) {
    return;
  }

  $meta_attrs = array(
    'model_url'         => get_post_meta( $post_id, '_cas_dna_model_url', true ),
    'scale'             => get_post_meta( $post_id, '_cas_dna_scale', true ),
    'offset_x'          => get_post_meta( $post_id, '_cas_dna_offset_x', true ),
    'offset_y'          => get_post_meta( $post_id, '_cas_dna_offset_y', true ),
    'strand_color'      => get_post_meta( $post_id, '_cas_dna_strand_color', true ),
    'accent_color'      => get_post_meta( $post_id, '_cas_dna_accent_color', true ),
    'ambient_intensity' => get_post_meta( $post_id, '_cas_dna_ambient_intensity', true ),
  );

  echo cas_bio_render_block_template( 'dna-background', $meta_attrs );
}
add_action( 'wp_footer', 'cas_bio_maybe_render_global_dna_background', 1 );

/**
 * Body classes -- added ONLY when the corresponding block/shortcode is
 * actually present on the page (no site-wide assumptions).
 */
function cas_bio_add_top_dock_body_class( $classes ) {
  global $post;
  $has_dock = false;

  if ( is_singular() && is_a( $post, 'WP_Post' ) ) {
    if (
      has_block( 'cas-ngs/header-top-dock', $post ) ||
      has_shortcode( $post->post_content, 'cas_top_dock' ) ||
      has_shortcode( $post->post_content, 'cas_ngs_full_page' )
    ) {
      $has_dock = true;
    }

    if (
      has_block( 'cas-ngs/interactive-pipeline-hero', $post ) ||
      has_shortcode( $post->post_content, 'cas_pipeline_hero' ) ||
      has_shortcode( $post->post_content, 'cas_interactive_pipeline' ) ||
      has_shortcode( $post->post_content, 'cas_act0_pipeline' )
    ) {
      $classes[] = 'cas-has-pipeline-hero';
    }
  }

  if ( ! $has_dock && ( is_front_page() || is_home() ) ) {
    $front_id = get_option( 'page_on_front' );
    if ( $front_id ) {
      $front_post = get_post( $front_id );
      if ( $front_post && (
        has_block( 'cas-ngs/header-top-dock', $front_post ) ||
        has_shortcode( $front_post->post_content, 'cas_top_dock' ) ||
        has_shortcode( $front_post->post_content, 'cas_ngs_full_page' )
      ) ) {
        $has_dock = true;
      }
    }
  }

  if ( $has_dock ) {
    $classes[] = 'cas-has-top-dock';
  }

  return $classes;
}
add_filter( 'body_class', 'cas_bio_add_top_dock_body_class' );

/**
 * Body class marker for the 3D Corridor Hero (additive; mirrors the
 * existing cas-has-pipeline-hero pattern so themes can react to the
 * full-bleed hero without guessing).
 */
function cas_bio_add_corridor_body_class( $classes ) {
  global $post;

  if ( is_singular() && is_a( $post, 'WP_Post' ) ) {
    if (
      has_block( 'cas-ngs/corridor-hero-3d', $post ) ||
      has_shortcode( $post->post_content, 'cas_corridor_hero' ) ||
      has_shortcode( $post->post_content, 'cas_3d_corridor' )
    ) {
      $classes[] = 'cas-has-corridor-hero';
    }
  }

  return $classes;
}
add_filter( 'body_class', 'cas_bio_add_corridor_body_class' );
