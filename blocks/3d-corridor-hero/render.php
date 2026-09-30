<?php
/**
 * Dynamic render callback — cas-ngs/3d-corridor-hero.
 *
 * Emits the pinned 4-station corridor stage. Every word below is bound to
 * a Gutenberg attribute, so it is 100% editable in the block sidebar.
 * Palette colors are exposed as CSS custom properties; text/borders bind
 * to WordPress theme presets (var(--wp--preset--color--primary/accent))
 * with brand fallbacks, and the WebGL engine reads the computed values.
 *
 * @package CAS_NGS_Biotech_Blocks
 */

if ( ! defined( 'ABSPATH' ) ) {
  exit;
}

$cor3d_defaults = array(
  'station1_kicker'     => 'STEP 01 // SPECIMEN PREPARATION',
  'station1_title'      => 'Sample Extraction',
  'station1_desc'       => 'High-molecular-weight genomic DNA isolated from biological specimens and stabilized in high-purity suspension for deep sequencing.',
  'station1_badge'      => 'CS-0427 | HMW DNA | QC PASS',
  'station2_kicker'     => 'STEP 02 // SIGNAL FLUIDICS',
  'station2_title'      => 'Fluorescence Basecalling',
  'station2_desc'       => 'Real-time optical channels capture four-color fluorophore emissions across high-density flowcell channels.',
  'station2_badge'      => 'FLOWCELL 04 | 2x150 BP | LIVE',
  'station3_kicker'     => 'STEP 03 // SEQUENCE ALIGNMENT',
  'station3_title'      => 'Digital Reads Processing',
  'station3_desc'       => 'Parallel basecall streams mapped against reference genomes with quality score filtering and error correction.',
  'station3_badge'      => 'Q30 93.1% | 2.4B READS',
  'station4_kicker'     => 'STEP 04 // MUTATIONAL ANALYSIS',
  'station4_title'      => 'Variant Matrix Mapping',
  'station4_desc'       => 'Comprehensive identification of single nucleotide variants, insertions, and structural genomic alterations.',
  'station4_badge'      => 'GRCh38 | 4,182 VARIANTS | READY',
  'palette'             => 'bronze',
  'model_url'           => '',
  'enable_cursor_trail' => true,
  'dna_tint_color'      => '',
  'bar_darken'          => 0.15,
);

$cor3d_atts = wp_parse_args(
  ( isset( $attributes ) && is_array( $attributes ) ) ? $attributes : array(),
  $cor3d_defaults
);

/* ── Brand palettes (strict separation: bronze has no blue, steel has
      no bronze/gold/amber). Palette hex values are the FALLBACKS; live
      theme presets win when a theme defines them. ── */
$cor3d_palettes = array(
  'bronze' => array(
    'bg'       => '#f8f6f0',
    'ink'      => '#362115',
    'muted'    => '#5a4d41',
    'faint'    => '#8a7a69',
    'accent'   => '#865438',
    'accent2'  => '#8c6d58',
    'accent3'  => '#9e7b4f',
    'accent4'  => '#d4996e',
    'backbone' => '#503c2d',
    'card'     => 'rgba(235, 225, 210, 0.65)',
    'border'   => 'rgba(134, 84, 56, 0.22)',
    'grid'     => '#d8cbb9',
    'heat'     => '#cbb9a6,#9e7b4f,#865438',
    'glyphs'   => '#9e7b4f,#865438',
  ),
  'steel'  => array(
    'bg'       => '#cee1f0',
    'ink'      => '#354567',
    'muted'    => '#4f5f82',
    'faint'    => '#71839f',
    'accent'   => '#354567',
    'accent2'  => '#657090',
    'accent3'  => '#212c45',
    'accent4'  => '#9db8d6',
    'backbone' => '#2b395a',
    'card'     => 'rgba(244, 248, 252, 0.85)',
    'border'   => 'rgba(53, 69, 103, 0.25)',
    'grid'     => '#a9bfda',
    'heat'     => '#9db8d6,#657090,#212c45',
    'glyphs'   => '#354567,#a0aecc',
  ),
);

$cor3d_pal_key = isset( $cor3d_atts['palette'] ) ? sanitize_key( $cor3d_atts['palette'] ) : 'bronze';
if ( ! isset( $cor3d_palettes[ $cor3d_pal_key ] ) ) {
  $cor3d_pal_key = 'bronze';
}
$cor3d_pal = $cor3d_palettes[ $cor3d_pal_key ];

/* Model URL: block attribute > shared plugin asset (single source). */
$cor3d_model_url = ! empty( $cor3d_atts['model_url'] )
  ? esc_url_raw( $cor3d_atts['model_url'] )
  : '/wp-content/plugins/cas-ngs-header-footer/assets/models/dna.glb';

$cor3d_fx = ! empty( $cor3d_atts['enable_cursor_trail'] ) ? 'true' : 'false';

/* Editor-tweakable WebGL colors. dna_tint_color overrides the palette
   backbone (blank = palette default). bar_darken uniformly darkens the
   Frame-4 bars by a ratio, preserving their relative contrast. */
$cor3d_dna_tint = isset( $cor3d_atts['dna_tint_color'] ) ? sanitize_hex_color( $cor3d_atts['dna_tint_color'] ) : '';
$cor3d_bar_darken = isset( $cor3d_atts['bar_darken'] ) ? floatval( $cor3d_atts['bar_darken'] ) : 0.15;

/* Card chrome uses the palette's card/border values (matched to the site's
   act1-act4 block theme). Text ink/muted bind to the --primary theme preset
   with the palette fallback. The WebGL engine reads the plain-hex vars. */
$cor3d_style = implode(
  ';',
  array(
    '--cor3d-bg: var(--wp--preset--color--base, ' . $cor3d_pal['bg'] . ')',
    '--cor3d-ink: var(--wp--preset--color--primary, ' . $cor3d_pal['ink'] . ')',
    '--cor3d-muted: ' . $cor3d_pal['muted'],
    '--cor3d-faint: ' . $cor3d_pal['faint'],
    '--cor3d-accent: var(--wp--preset--color--accent, ' . $cor3d_pal['accent'] . ')',
    '--cor3d-accent-2: ' . $cor3d_pal['accent2'],
    '--cor3d-accent-3: ' . $cor3d_pal['accent3'],
    '--cor3d-accent-4: ' . $cor3d_pal['accent4'],
    '--cor3d-backbone: ' . $cor3d_pal['backbone'],
    '--cor3d-card: ' . $cor3d_pal['card'],
    '--cor3d-border: ' . $cor3d_pal['border'],
    '--cor3d-grid: ' . $cor3d_pal['grid'],
    '--cor3d-heat: ' . $cor3d_pal['heat'],
    '--cor3d-glyphs: ' . $cor3d_pal['glyphs'],
  )
);

$cor3d_stations = array(
  array(
    'pos'   => 'left',
    'kicker' => $cor3d_atts['station1_kicker'],
    'title'  => $cor3d_atts['station1_title'],
    'desc'   => $cor3d_atts['station1_desc'],
    'badge'  => $cor3d_atts['station1_badge'],
  ),
  array(
    'pos'   => 'right',
    'kicker' => $cor3d_atts['station2_kicker'],
    'title'  => $cor3d_atts['station2_title'],
    'desc'   => $cor3d_atts['station2_desc'],
    'badge'  => $cor3d_atts['station2_badge'],
  ),
  array(
    'pos'   => 'center',
    'kicker' => $cor3d_atts['station3_kicker'],
    'title'  => $cor3d_atts['station3_title'],
    'desc'   => $cor3d_atts['station3_desc'],
    'badge'  => $cor3d_atts['station3_badge'],
  ),
  array(
    'pos'   => 'right',
    'kicker' => $cor3d_atts['station4_kicker'],
    'title'  => $cor3d_atts['station4_title'],
    'desc'   => $cor3d_atts['station4_desc'],
    'badge'  => $cor3d_atts['station4_badge'],
  ),
);

$cor3d_station_labels = array( 'Sample', 'Sequencing', 'Basecalling', 'Variants' );
$cor3d_tickers        = array(
  'SAMPLE CS-0427 | QC PASS | 2.4 ng/uL | LOADING FLOWCELL 04',
  'FOUR-CHANNEL OPTICS | SIGNAL ACQUIRED | CYCLE 001/150',
  'BASECALL STREAM | Q30 93.1% | 2.4B READS | LANE 2',
  'VARIANT MATRIX | GRCh38 | 4,182 CALLS | READY FOR REVIEW',
);
?>
<div
  id="corridor-canvas-container"
  class="cor3d-wrap cor3d-pal-<?php echo esc_attr( $cor3d_pal_key ); ?>"
  data-palette="<?php echo esc_attr( $cor3d_pal_key ); ?>"
  data-model-url="<?php echo esc_attr( $cor3d_model_url ); ?>"
  data-fx-enabled="<?php echo esc_attr( $cor3d_fx ); ?>"
  data-dna-tint="<?php echo esc_attr( $cor3d_dna_tint ); ?>"
  data-bar-darken="<?php echo esc_attr( $cor3d_bar_darken ); ?>"
  data-ticker-1="<?php echo esc_attr( $cor3d_tickers[0] ); ?>"
  data-ticker-2="<?php echo esc_attr( $cor3d_tickers[1] ); ?>"
  data-ticker-3="<?php echo esc_attr( $cor3d_tickers[2] ); ?>"
  data-ticker-4="<?php echo esc_attr( $cor3d_tickers[3] ); ?>"
  style="<?php echo esc_attr( $cor3d_style ); ?>"
>
  <div class="cor3d-stage" aria-label="<?php esc_attr_e( 'From Sample to Code: interactive 3D sequencing pipeline', 'cas-ngs-biotech-blocks' ); ?>">
    <canvas class="cor3d-glyph-fx" aria-hidden="true"></canvas>

    <div class="cor3d-hud">
      <?php foreach ( $cor3d_stations as $cor3d_i => $cor3d_st ) : ?>
        <section class="cor3d-anchor cor3d-pos-<?php echo esc_attr( $cor3d_st['pos'] ); ?>" data-pos="<?php echo esc_attr( $cor3d_st['pos'] ); ?>" aria-labelledby="cor3d-title-<?php echo (int) ( $cor3d_i + 1 ); ?>">
          <div class="cor3d-card">
            <div class="cor3d-card-inner">
              <header class="cor3d-fig">
                <strong><?php echo esc_html( $cor3d_st['kicker'] ); ?></strong>
                <span class="cor3d-fig-rule" aria-hidden="true"></span>
                <span class="cor3d-fig-phase"><?php echo esc_html( $cor3d_station_labels[ $cor3d_i ] ); ?></span>
              </header>
              <h2 class="cor3d-title" id="cor3d-title-<?php echo (int) ( $cor3d_i + 1 ); ?>"><?php echo esc_html( $cor3d_st['title'] ); ?></h2>
              <p class="cor3d-copy"><?php echo esc_html( $cor3d_st['desc'] ); ?></p>
              <p class="cor3d-badge"><?php echo esc_html( $cor3d_st['badge'] ); ?></p>
            </div>
          </div>
        </section>
      <?php endforeach; ?>
    </div>

    <div class="cor3d-rail" aria-label="<?php esc_attr_e( 'Pipeline stations', 'cas-ngs-biotech-blocks' ); ?>">
      <div class="cor3d-rail-label" data-cor3d-rail-label><?php echo esc_html( '01 | ' . $cor3d_station_labels[0] ); ?></div>
      <div class="cor3d-dots">
        <?php foreach ( $cor3d_station_labels as $cor3d_i => $cor3d_label ) : ?>
          <button
            type="button"
            class="cor3d-dot<?php echo 0 === $cor3d_i ? ' active' : ''; ?>"
            data-sec="<?php echo (int) $cor3d_i; ?>"
            aria-label="<?php echo esc_attr( sprintf( __( 'Go to Section %1$d: %2$s', 'cas-ngs-biotech-blocks' ), $cor3d_i + 1, $cor3d_label ) ); ?>"
          ><span><?php echo esc_html( sprintf( '%02d | %s', $cor3d_i + 1, $cor3d_label ) ); ?></span></button>
        <?php endforeach; ?>
      </div>
      <div class="cor3d-rail-pct" data-cor3d-pct>000%</div>
    </div>

    <div class="cor3d-status">
      <span class="cor3d-pulse" aria-hidden="true"></span>
      <span><?php esc_html_e( 'Pipeline live', 'cas-ngs-biotech-blocks' ); ?></span>
      <span class="cor3d-status-phase" data-cor3d-phase><?php esc_html_e( 'Phase 01 | Double helix', 'cas-ngs-biotech-blocks' ); ?></span>
    </div>

    <div class="cor3d-cue" data-cor3d-cue>
      <span><?php esc_html_e( 'Scroll to begin', 'cas-ngs-biotech-blocks' ); ?></span>
      <span class="cor3d-cue-line" aria-hidden="true"></span>
    </div>

    <div class="cor3d-ticker" data-cor3d-ticker>
      <span class="cor3d-tk-prefix"><?php esc_html_e( 'Readout', 'cas-ngs-biotech-blocks' ); ?></span>
      <span data-cor3d-ticker-text><?php echo esc_html( $cor3d_tickers[0] ); ?></span>
      <span class="cor3d-tk-caret" aria-hidden="true">&nbsp;</span>
    </div>

    <div class="cor3d-fail">
      <?php esc_html_e( 'WebGL is unavailable, so the 3D pipeline cannot render in this browser. The content below remains fully accessible.', 'cas-ngs-biotech-blocks' ); ?>
    </div>
  </div>
</div>
