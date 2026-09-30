<?php
/**
 * Render template for cas-ngs/interactive-pipeline-hero (Act 0: 4-Frame 3D Pre-Hero Block)
 *
 * 4-frame 3D interactive sequencing pipeline ('From Sample to Code'):
 * - Single-flick GSAP Observer frame transitions
 * - Dynamic Three.js ribbon chromatogram array (Frame 2)
 * - Genomic sequence stream & laser sweep (Frame 3)
 * - Instanced heatmap & phylogenetic tree (Frame 4)
 * - Nucleotide cursor trail (A, T, C, G)
 * - Silent mounting without secondary loading screens
 * - Seamless scroll-lock hand-off to Act 1 Hero
 *
 * @package CAS_NGS_Biotech_Blocks
 * @version 1.4.0
 */

if ( ! defined( 'ABSPATH' ) ) {
  exit;
}

$uid = wp_unique_id( 'csi-pipeline-' );

// Extract attributes with fallback defaults
$fx_enabled        = isset( $attributes['fx_enabled'] ) ? (bool) $attributes['fx_enabled'] : true;
$canvas_bg         = ! empty( $attributes['canvas_bg'] ) ? $attributes['canvas_bg'] : '#f8f6f0';
$auto_scroll_speed = isset( $attributes['auto_scroll_speed'] ) ? floatval( $attributes['auto_scroll_speed'] ) : 1.0;
$model_url         = ! empty( $attributes['model_url'] ) ? $attributes['model_url'] : '';

// Fig. 01
$fig1_label        = ! empty( $attributes['fig1_label'] ) ? $attributes['fig1_label'] : 'Fig. 01';
$fig1_phase        = ! empty( $attributes['fig1_phase'] ) ? $attributes['fig1_phase'] : 'Wet Lab';
$fig1_title        = ! empty( $attributes['fig1_title'] ) ? $attributes['fig1_title'] : 'Sample Extraction';
$fig1_copy         = ! empty( $attributes['fig1_copy'] ) ? $attributes['fig1_copy'] : 'High-molecular-weight DNA is isolated from the specimen and held in stable suspension — 3.2 billion base pairs awaiting their first reading.';
$fig1_sample_id    = ! empty( $attributes['fig1_sample_id'] ) ? $attributes['fig1_sample_id'] : 'CS-0427 · HMW DNA';
$fig1_yield        = ! empty( $attributes['fig1_yield'] ) ? $attributes['fig1_yield'] : '2.4 ng/µL · QC pass';
$fig1_cta_text     = ! empty( $attributes['fig1_cta_text'] ) ? $attributes['fig1_cta_text'] : 'Request a kit';
$fig1_cta_url      = ! empty( $attributes['fig1_cta_url'] ) ? $attributes['fig1_cta_url'] : '#contact';

// Fig. 02
$fig2_label        = ! empty( $attributes['fig2_label'] ) ? $attributes['fig2_label'] : 'Fig. 02';
$fig2_phase        = ! empty( $attributes['fig2_phase'] ) ? $attributes['fig2_phase'] : 'Flowcell';
$fig2_title        = ! empty( $attributes['fig2_title'] ) ? $attributes['fig2_title'] : 'High-Throughput Sequencing';
$fig2_copy         = ! empty( $attributes['fig2_copy'] ) ? $attributes['fig2_copy'] : 'The camera rides the backbone into the optics bench, where four ribbon traces — one per base — stream horizontally across the flowcell.';
$fig2_flowcell_id  = ! empty( $attributes['fig2_flowcell_id'] ) ? $attributes['fig2_flowcell_id'] : '04 · 2×150 bp';
$fig2_channels     = ! empty( $attributes['fig2_channels'] ) ? $attributes['fig2_channels'] : '4 · signal live';

// Fig. 03
$fig3_label        = ! empty( $attributes['fig3_label'] ) ? $attributes['fig3_label'] : 'Fig. 03';
$fig3_phase        = ! empty( $attributes['fig3_phase'] ) ? $attributes['fig3_phase'] : 'Compute';
$fig3_title        = ! empty( $attributes['fig3_title'] ) ? $attributes['fig3_title'] : 'Basecalling & Assembly';
$fig3_copy         = ! empty( $attributes['fig3_copy'] ) ? $attributes['fig3_copy'] : 'Signal becomes sequence. Neural basecalling resolves the traces into a streaming genomic code — A·T·C·G aligned against the reference in real time.';
$fig3_quality      = ! empty( $attributes['fig3_quality'] ) ? $attributes['fig3_quality'] : 'Q30 93.1% · 2.4B reads';
$fig3_stream       = ! empty( $attributes['fig3_stream'] ) ? $attributes['fig3_stream'] : 'Live · lane 2';

// Fig. 04
$fig4_label        = ! empty( $attributes['fig4_label'] ) ? $attributes['fig4_label'] : 'Fig. 04';
$fig4_phase        = ! empty( $attributes['fig4_phase'] ) ? $attributes['fig4_phase'] : 'Insight';
$fig4_title        = ! empty( $attributes['fig4_title'] ) ? $attributes['fig4_title'] : 'Variant Analysis';
$fig4_copy         = ! empty( $attributes['fig4_copy'] ) ? $attributes['fig4_copy'] : 'Aligned reads condense into an expression matrix and a phylogenetic tree. Variants are called, annotated and released for review.';
$fig4_ref          = ! empty( $attributes['fig4_ref'] ) ? $attributes['fig4_ref'] : 'GRCh38 · 4,182 variants';
$fig4_report       = ! empty( $attributes['fig4_report'] ) ? $attributes['fig4_report'] : 'Ready for review';
$fig4_cta_text     = ! empty( $attributes['fig4_cta_text'] ) ? $attributes['fig4_cta_text'] : 'View sample report';
$fig4_cta_url      = ! empty( $attributes['fig4_cta_url'] ) ? $attributes['fig4_cta_url'] : '#report';

// HUD & Ticker
$rail_name_1       = ! empty( $attributes['rail_name_1'] ) ? $attributes['rail_name_1'] : '01 · Sample';
$rail_name_2       = ! empty( $attributes['rail_name_2'] ) ? $attributes['rail_name_2'] : '02 · Sequencing';
$rail_name_3       = ! empty( $attributes['rail_name_3'] ) ? $attributes['rail_name_3'] : '03 · Basecalling';
$rail_name_4       = ! empty( $attributes['rail_name_4'] ) ? $attributes['rail_name_4'] : '04 · Variants';
$ticker_string_1   = ! empty( $attributes['ticker_string_1'] ) ? $attributes['ticker_string_1'] : 'SAMPLE CS-0427 · QC PASS · 2.4 ng/µL · LOADING FLOWCELL 04';
$ticker_string_2   = ! empty( $attributes['ticker_string_2'] ) ? $attributes['ticker_string_2'] : 'FOUR-CHANNEL OPTICS · SIGNAL ACQUIRED';
?>
<div class="csi-root wp-block-cas-ngs-interactive-pipeline-hero"
     id="<?php echo esc_attr( $uid ); ?>"
     data-cas-pipeline-hero="true"
     data-fx-enabled="<?php echo $fx_enabled ? 'true' : 'false'; ?>"
     data-canvas-bg="<?php echo esc_attr( $canvas_bg ); ?>"
     data-auto-speed="<?php echo esc_attr( $auto_scroll_speed ); ?>"
     data-model-url="<?php echo esc_url( $model_url ); ?>"
     data-rail-1="<?php echo esc_attr( $rail_name_1 ); ?>"
     data-rail-2="<?php echo esc_attr( $rail_name_2 ); ?>"
     data-rail-3="<?php echo esc_attr( $rail_name_3 ); ?>"
     data-rail-4="<?php echo esc_attr( $rail_name_4 ); ?>"
     data-ticker-1="<?php echo esc_attr( $ticker_string_1 ); ?>"
     data-ticker-2="<?php echo esc_attr( $ticker_string_2 ); ?>"
     aria-label="<?php esc_attr_e( 'From Sample to Code — interactive sequencing pipeline', 'cas-ngs-biotech-blocks' ); ?>">

  <!-- Pinned 3D Stage + Overlay Cards (Silently Mounted — No Secondary Loader Screen) -->
  <div class="csi-stage" id="<?php echo esc_attr( $uid ); ?>-stage">
    <canvas class="csi-glyph-fx" id="<?php echo esc_attr( $uid ); ?>-glyph-fx" aria-hidden="true"></canvas>
    
    <div class="csi-hud">
      <!-- Fig. 01: Sample Extraction -->
      <section class="csi-card" id="<?php echo esc_attr( $uid ); ?>-card-1" style="--pcAcc:var(--accent-2)" aria-labelledby="<?php echo esc_attr( $uid ); ?>-t1">
        <header class="csi-fig">
          <strong><?php echo esc_html( $fig1_label ); ?></strong>
          <span class="csi-fig-rule" aria-hidden="true"></span>
          <span class="csi-fig-phase"><?php echo esc_html( $fig1_phase ); ?></span>
        </header>
        <h2 class="csi-title" id="<?php echo esc_attr( $uid ); ?>-t1"><?php echo esc_html( $fig1_title ); ?></h2>
        <p class="csi-copy"><?php echo esc_html( $fig1_copy ); ?></p>
        <dl class="csi-data">
          <div>
            <dt><?php esc_html_e( 'Sample', 'cas-ngs-biotech-blocks' ); ?></dt>
            <dd><?php echo esc_html( $fig1_sample_id ); ?></dd>
          </div>
          <div>
            <dt><?php esc_html_e( 'Yield', 'cas-ngs-biotech-blocks' ); ?></dt>
            <dd><?php echo esc_html( $fig1_yield ); ?></dd>
          </div>
        </dl>
        <?php if ( ! empty( $fig1_cta_text ) ) : ?>
          <a class="csi-btn csi-btn-ghost" href="<?php echo esc_url( $fig1_cta_url ); ?>"><?php echo esc_html( $fig1_cta_text ); ?></a>
        <?php endif; ?>
      </section>

      <!-- Fig. 02: High-Throughput Sequencing -->
      <section class="csi-card" id="<?php echo esc_attr( $uid ); ?>-card-2" style="--pcAcc:var(--accent)" aria-labelledby="<?php echo esc_attr( $uid ); ?>-t2">
        <header class="csi-fig">
          <strong><?php echo esc_html( $fig2_label ); ?></strong>
          <span class="csi-fig-rule" aria-hidden="true"></span>
          <span class="csi-fig-phase"><?php echo esc_html( $fig2_phase ); ?></span>
        </header>
        <h2 class="csi-title" id="<?php echo esc_attr( $uid ); ?>-t2"><?php echo esc_html( $fig2_title ); ?></h2>
        <p class="csi-copy"><?php echo esc_html( $fig2_copy ); ?></p>
        <dl class="csi-data">
          <div>
            <dt><?php esc_html_e( 'Flowcell', 'cas-ngs-biotech-blocks' ); ?></dt>
            <dd><?php echo esc_html( $fig2_flowcell_id ); ?></dd>
          </div>
          <div>
            <dt><?php esc_html_e( 'Channels', 'cas-ngs-biotech-blocks' ); ?></dt>
            <dd><?php echo esc_html( $fig2_channels ); ?></dd>
          </div>
        </dl>
      </section>

      <!-- Fig. 03: Basecalling & Assembly -->
      <section class="csi-card" id="<?php echo esc_attr( $uid ); ?>-card-3" style="--pcAcc:var(--accent-3)" aria-labelledby="<?php echo esc_attr( $uid ); ?>-t3">
        <header class="csi-fig">
          <strong><?php echo esc_html( $fig3_label ); ?></strong>
          <span class="csi-fig-rule" aria-hidden="true"></span>
          <span class="csi-fig-phase"><?php echo esc_html( $fig3_phase ); ?></span>
        </header>
        <h2 class="csi-title" id="<?php echo esc_attr( $uid ); ?>-t3"><?php echo esc_html( $fig3_title ); ?></h2>
        <p class="csi-copy"><?php echo esc_html( $fig3_copy ); ?></p>
        <dl class="csi-data">
          <div>
            <dt><?php esc_html_e( 'Quality', 'cas-ngs-biotech-blocks' ); ?></dt>
            <dd><?php echo esc_html( $fig3_quality ); ?></dd>
          </div>
          <div>
            <dt><?php esc_html_e( 'Stream', 'cas-ngs-biotech-blocks' ); ?></dt>
            <dd><?php echo esc_html( $fig3_stream ); ?></dd>
          </div>
        </dl>
      </section>

      <!-- Fig. 04: Variant Analysis -->
      <section class="csi-card" id="<?php echo esc_attr( $uid ); ?>-card-4" style="--pcAcc:var(--accent-4)" aria-labelledby="<?php echo esc_attr( $uid ); ?>-t4">
        <header class="csi-fig">
          <strong><?php echo esc_html( $fig4_label ); ?></strong>
          <span class="csi-fig-rule" aria-hidden="true"></span>
          <span class="csi-fig-phase"><?php echo esc_html( $fig4_phase ); ?></span>
        </header>
        <h2 class="csi-title" id="<?php echo esc_attr( $uid ); ?>-t4"><?php echo esc_html( $fig4_title ); ?></h2>
        <p class="csi-copy"><?php echo esc_html( $fig4_copy ); ?></p>
        <dl class="csi-data">
          <div>
            <dt><?php esc_html_e( 'Reference', 'cas-ngs-biotech-blocks' ); ?></dt>
            <dd><?php echo esc_html( $fig4_ref ); ?></dd>
          </div>
          <div>
            <dt><?php esc_html_e( 'Report', 'cas-ngs-biotech-blocks' ); ?></dt>
            <dd><?php echo esc_html( $fig4_report ); ?></dd>
          </div>
        </dl>
        <?php if ( ! empty( $fig4_cta_text ) ) : ?>
          <a class="csi-btn csi-btn-solid" href="<?php echo esc_url( $fig4_cta_url ); ?>">
            <span><?php echo esc_html( $fig4_cta_text ); ?></span>
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </a>
        <?php endif; ?>
      </section>
    </div>

    <!-- WebGL Fallback -->
    <div class="csi-fail" id="<?php echo esc_attr( $uid ); ?>-fail">
      <?php esc_html_e( 'WebGL is unavailable on this device. Please scroll down for the sequencing platform overview.', 'cas-ngs-biotech-blocks' ); ?>
    </div>
  </div>

  <!-- Fixed HUD Navigation & Ticker Elements -->
  <div class="csi-rail" id="<?php echo esc_attr( $uid ); ?>-rail" aria-label="<?php esc_attr_e( 'Section indicators', 'cas-ngs-biotech-blocks' ); ?>">
    <div class="csi-rail-label" id="<?php echo esc_attr( $uid ); ?>-rail-label"><?php echo esc_html( $rail_name_1 ); ?></div>
    <div class="csi-dots">
      <button class="csi-dot active" data-sec="0" aria-label="<?php esc_attr_e( 'Go to Section 1', 'cas-ngs-biotech-blocks' ); ?>">
        <span><?php echo esc_html( $rail_name_1 ); ?></span>
      </button>
      <button class="csi-dot" data-sec="1" aria-label="<?php esc_attr_e( 'Go to Section 2', 'cas-ngs-biotech-blocks' ); ?>">
        <span><?php echo esc_html( $rail_name_2 ); ?></span>
      </button>
      <button class="csi-dot" data-sec="2" aria-label="<?php esc_attr_e( 'Go to Section 3', 'cas-ngs-biotech-blocks' ); ?>">
        <span><?php echo esc_html( $rail_name_3 ); ?></span>
      </button>
      <button class="csi-dot" data-sec="3" aria-label="<?php esc_attr_e( 'Go to Section 4', 'cas-ngs-biotech-blocks' ); ?>">
        <span><?php echo esc_html( $rail_name_4 ); ?></span>
      </button>
    </div>
    <div class="csi-rail-pct" id="<?php echo esc_attr( $uid ); ?>-rail-pct">000%</div>
  </div>

  <div class="csi-ticker" id="<?php echo esc_attr( $uid ); ?>-ticker">
    <span class="csi-tk-prefix"><?php esc_html_e( 'Readout', 'cas-ngs-biotech-blocks' ); ?></span>
    <span id="<?php echo esc_attr( $uid ); ?>-ticker-text"><?php echo esc_html( $ticker_string_1 ); ?></span>
    <span class="csi-tk-caret">&nbsp;</span>
  </div>

  <div class="csi-status" id="<?php echo esc_attr( $uid ); ?>-status">
    <span class="csi-pulse"></span>
    <span><?php esc_html_e( 'Pipeline live', 'cas-ngs-biotech-blocks' ); ?></span>
    <span class="csi-status-phase" id="<?php echo esc_attr( $uid ); ?>-phase-name"><?php esc_html_e( 'Phase 01 — Double helix', 'cas-ngs-biotech-blocks' ); ?></span>
  </div>

  <div class="csi-cue" id="<?php echo esc_attr( $uid ); ?>-cue">
    <span><?php esc_html_e( 'Scroll to begin', 'cas-ngs-biotech-blocks' ); ?></span>
    <span class="csi-cue-line" aria-hidden="true"></span>
  </div>
</div>
