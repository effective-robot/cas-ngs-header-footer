<?php
/**
 * Render template for cas-ngs/act1-hero-sequencer
 *
 * @package CAS_NGS_Biotech_Blocks
 */

if ( ! defined( 'ABSPATH' ) ) {
  exit;
}

$uid = wp_unique_id( 'cas-hero-' );

// Default attribute fallback handler
$badge_text         = isset( $attributes['badge_text'] ) && '' !== $attributes['badge_text'] ? $attributes['badge_text'] : __( 'Powered by Oxford Nanopore Technology', 'cas-ngs-biotech-blocks' );
$headline           = isset( $attributes['headline'] ) && '' !== $attributes['headline'] ? $attributes['headline'] : __( 'Unlocking Genomic Insights at the Speed of Life.', 'cas-ngs-biotech-blocks' );
$subtitle           = isset( $attributes['subtitle'] ) && '' !== $attributes['subtitle'] ? $attributes['subtitle'] : __( 'Practical long-read DNA sequencing, research-grade bioinformatics, and capacity-building solutions powered by Oxford Nanopore Technology.', 'cas-ngs-biotech-blocks' );
$primary_cta_text   = isset( $attributes['primary_cta_text'] ) && '' !== $attributes['primary_cta_text'] ? $attributes['primary_cta_text'] : __( 'Request Run Quote', 'cas-ngs-biotech-blocks' );
$primary_cta_url    = isset( $attributes['primary_cta_url'] ) && '' !== $attributes['primary_cta_url'] ? $attributes['primary_cta_url'] : '/request-a-quote/';
$secondary_cta_text = isset( $attributes['secondary_cta_text'] ) && '' !== $attributes['secondary_cta_text'] ? $attributes['secondary_cta_text'] : __( 'Explore Services', 'cas-ngs-biotech-blocks' );
$secondary_cta_url  = isset( $attributes['secondary_cta_url'] ) && '' !== $attributes['secondary_cta_url'] ? $attributes['secondary_cta_url'] : '/services/';

$live_status_text   = isset( $attributes['live_status_text'] ) ? $attributes['live_status_text'] : 'LIVE RUNNING • PROMETHION 24';
$flowcell_qc_text   = isset( $attributes['flowcell_qc_text'] ) ? $attributes['flowcell_qc_text'] : 'Q20+ ACTIVE';
$voltage_text       = isset( $attributes['voltage_text'] ) ? $attributes['voltage_text'] : 'MEMBRANE VOLTAGE: -180 mV';
$translocation_text = isset( $attributes['translocation_text'] ) ? $attributes['translocation_text'] : '400 BPS TRANSLOCATION';

// Metrics
$raw_metrics = array(
  array(
    'val'   => isset( $attributes['metric_1_val'] ) ? $attributes['metric_1_val'] : '120 Gb+',
    'label' => isset( $attributes['metric_1_label'] ) ? $attributes['metric_1_label'] : __( 'Throughput / Flowcell', 'cas-ngs-biotech-blocks' ),
  ),
  array(
    'val'   => isset( $attributes['metric_2_val'] ) ? $attributes['metric_2_val'] : '99.9%',
    'label' => isset( $attributes['metric_2_label'] ) ? $attributes['metric_2_label'] : __( 'Consensus Accuracy (Q20+)', 'cas-ngs-biotech-blocks' ),
  ),
  array(
    'val'   => isset( $attributes['metric_3_val'] ) ? $attributes['metric_3_val'] : '4.2 Mb',
    'label' => isset( $attributes['metric_3_label'] ) ? $attributes['metric_3_label'] : __( 'Record Read Length', 'cas-ngs-biotech-blocks' ),
  ),
  array(
    'val'   => isset( $attributes['metric_4_val'] ) ? $attributes['metric_4_val'] : '48 hrs',
    'label' => isset( $attributes['metric_4_label'] ) ? $attributes['metric_4_label'] : __( 'Basecall Turnaround', 'cas-ngs-biotech-blocks' ),
  ),
);

if ( ! function_exists( 'cas_bio_parse_metric' ) ) {
  function cas_bio_parse_metric( $str ) {
    $str = trim( (string) $str );
    if ( preg_match( '/^([0-9]+(?:\.[0-9]+)?)\s*(.*)$/', $str, $matches ) ) {
      $num = $matches[1];
      $suffix = $matches[2];
      $decimals = ( strpos( $num, '.' ) !== false ) ? strlen( substr( strrchr( $num, '.' ), 1 ) ) : 0;
      return array(
        'target'   => $num,
        'decimals' => $decimals,
        'suffix'   => '' !== $suffix && ! in_array( substr( $suffix, 0, 1 ), array( '%', '+' ), true ) ? ' ' . $suffix : $suffix,
      );
    }
    return array(
      'target'   => '0',
      'decimals' => 0,
      'suffix'   => $str,
    );
  }
}
?>

<section class="cas-bio-block cas-act-1" id="<?php echo esc_attr( $uid ); ?>" aria-labelledby="<?php echo esc_attr( $uid ); ?>-title">
  <div class="cas-container">
    <div class="hero-inner">

      <div class="gsap-fade-up">
        <span class="badge-pill">
          <span class="status-dot"></span>
          <?php echo esc_html( $badge_text ); ?>
        </span>
      </div>

      <h1 id="<?php echo esc_attr( $uid ); ?>-title" class="hero-title gsap-fade-up">
        <?php echo esc_html( $headline ); ?>
      </h1>

      <p class="hero-sub gsap-fade-up">
        <?php echo esc_html( $subtitle ); ?>
      </p>

      <div class="hero-cta-row gsap-fade-up">
        <a href="<?php echo esc_url( $primary_cta_url ); ?>" class="btn btn-primary">
          <span><?php echo esc_html( $primary_cta_text ); ?></span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" class="btn-icon" aria-hidden="true">
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>
        </a>
        <a href="<?php echo esc_url( $secondary_cta_url ); ?>" class="btn btn-secondary">
          <span><?php echo esc_html( $secondary_cta_text ); ?></span>
        </a>
      </div>

    </div>

    <!-- Hero Media Frame — Oxford Nanopore PromethION Schematic -->
    <div class="hero-media-frame gsap-scale-in">
      <div class="hero-media-inner">

        <svg class="flowcell-schematic" viewBox="0 0 880 260" preserveAspectRatio="xMidYMid slice" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <defs>
            <pattern id="<?php echo esc_attr( $uid ); ?>-grid-p" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" stroke="#865438" stroke-width="0.15" opacity="0.25"/>
            </pattern>
          </defs>
          <rect width="880" height="260" fill="url(#<?php echo esc_attr( $uid ); ?>-grid-p)"/>

          <rect x="200" y="60" width="480" height="140" rx="12" fill="#1e0f07" stroke="#865438" stroke-width="1.2" opacity="0.9"/>
          <rect x="220" y="75" width="440" height="110" rx="8" fill="#0f0703" stroke="#865438" stroke-width="0.8" opacity="0.7"/>

          <g opacity="0.9">
            <circle cx="300" cy="115" r="5" fill="none" stroke="#e6ccb2" stroke-width="1"/><circle cx="300" cy="115" r="2" fill="#865438"/>
            <circle cx="330" cy="115" r="5" fill="none" stroke="#e6ccb2" stroke-width="1"/><circle cx="330" cy="115" r="2" fill="#865438"/>
            <circle cx="360" cy="115" r="5" fill="none" stroke="#e6ccb2" stroke-width="1"/><circle cx="360" cy="115" r="2" fill="#4ade80"/>
            <circle cx="390" cy="115" r="5" fill="none" stroke="#e6ccb2" stroke-width="1"/><circle cx="390" cy="115" r="2" fill="#865438"/>
            <circle cx="420" cy="115" r="5" fill="none" stroke="#e6ccb2" stroke-width="1"/><circle cx="420" cy="115" r="2" fill="#4ade80"/>
            <circle cx="450" cy="115" r="5" fill="none" stroke="#e6ccb2" stroke-width="1"/><circle cx="450" cy="115" r="2" fill="#865438"/>
            <circle cx="480" cy="115" r="5" fill="none" stroke="#e6ccb2" stroke-width="1"/><circle cx="480" cy="115" r="2" fill="#4ade80"/>
            <circle cx="510" cy="115" r="5" fill="none" stroke="#e6ccb2" stroke-width="1"/><circle cx="510" cy="115" r="2" fill="#865438"/>
            <circle cx="540" cy="115" r="5" fill="none" stroke="#e6ccb2" stroke-width="1"/><circle cx="540" cy="115" r="2" fill="#865438"/>
            <circle cx="570" cy="115" r="5" fill="none" stroke="#e6ccb2" stroke-width="1"/><circle cx="570" cy="115" r="2" fill="#4ade80"/>
            <circle cx="300" cy="145" r="5" fill="none" stroke="#e6ccb2" stroke-width="1"/><circle cx="300" cy="145" r="2" fill="#4ade80"/>
            <circle cx="330" cy="145" r="5" fill="none" stroke="#e6ccb2" stroke-width="1"/><circle cx="330" cy="145" r="2" fill="#865438"/>
            <circle cx="360" cy="145" r="5" fill="none" stroke="#e6ccb2" stroke-width="1"/><circle cx="360" cy="145" r="2" fill="#865438"/>
            <circle cx="390" cy="145" r="5" fill="none" stroke="#e6ccb2" stroke-width="1"/><circle cx="390" cy="145" r="2" fill="#4ade80"/>
            <circle cx="420" cy="145" r="5" fill="none" stroke="#e6ccb2" stroke-width="1"/><circle cx="420" cy="145" r="2" fill="#865438"/>
            <circle cx="450" cy="145" r="5" fill="none" stroke="#e6ccb2" stroke-width="1"/><circle cx="450" cy="145" r="2" fill="#4ade80"/>
            <circle cx="480" cy="145" r="5" fill="none" stroke="#e6ccb2" stroke-width="1"/><circle cx="480" cy="145" r="2" fill="#865438"/>
            <circle cx="510" cy="145" r="5" fill="none" stroke="#e6ccb2" stroke-width="1"/><circle cx="510" cy="145" r="2" fill="#865438"/>
            <circle cx="540" cy="145" r="5" fill="none" stroke="#e6ccb2" stroke-width="1"/><circle cx="540" cy="145" r="2" fill="#4ade80"/>
            <circle cx="570" cy="145" r="5" fill="none" stroke="#e6ccb2" stroke-width="1"/><circle cx="570" cy="145" r="2" fill="#865438"/>
          </g>
        </svg>

        <div class="hero-media-overlay"></div>
        <div class="hero-waveform" id="<?php echo esc_attr( $uid ); ?>-waveform" data-cas-waveform="true"></div>

      </div>

      <!-- Frame Meta Bar -->
      <div class="hero-media-bar">
        <div class="hero-live-badge">
          <span class="hero-live-dot"></span>
          <span><?php echo esc_html( $live_status_text ); ?></span>
        </div>
        <div class="hero-live-badge">
          <span>FLOW CELL QC:</span>
          <span style="color: #4ade80; margin-left: 4px;"><?php echo esc_html( $flowcell_qc_text ); ?></span>
        </div>
      </div>

      <!-- Frame Bottom Telemetry Bar -->
      <div class="hero-media-bottom-bar">
        <span><?php echo esc_html( $voltage_text ); ?></span>
        <span class="hero-run-timer" id="<?php echo esc_attr( $uid ); ?>-timer" data-cas-timer="true">02:14:33</span>
        <span><?php echo esc_html( $translocation_text ); ?></span>
      </div>
    </div>

    <!-- Metric Stat Cards -->
    <div class="metrics-row">
      <?php foreach ( $raw_metrics as $m ) :
        $parsed = cas_bio_parse_metric( $m['val'] );
      ?>
        <article class="metric-card gsap-fade-up">
          <div class="metric-num"
               data-counter
               data-target="<?php echo esc_attr( $parsed['target'] ); ?>"
               data-decimals="<?php echo esc_attr( $parsed['decimals'] ); ?>"
               data-suffix="<?php echo esc_attr( $parsed['suffix'] ); ?>">0</div>
          <div class="metric-lbl"><?php echo esc_html( $m['label'] ); ?></div>
        </article>
      <?php endforeach; ?>
    </div>

  </div>
</section>
