<?php
/**
 * Render template for cas-ngs/act3-process-timeline
 *
 * @package CAS_NGS_Biotech_Blocks
 */

if ( ! defined( 'ABSPATH' ) ) {
  exit;
}

$uid = wp_unique_id( 'cas-timeline-' );

$badge_text    = isset( $attributes['badge_text'] ) && '' !== $attributes['badge_text'] ? $attributes['badge_text'] : __( 'Rigorous Pipeline', 'cas-ngs-biotech-blocks' );
$section_title = isset( $attributes['section_title'] ) && '' !== $attributes['section_title'] ? $attributes['section_title'] : __( 'From Biological Sample to Scientific Insight', 'cas-ngs-biotech-blocks' );
$section_desc  = isset( $attributes['section_desc'] ) && '' !== $attributes['section_desc'] ? $attributes['section_desc'] : __( 'A seamless four-stage trajectory engineered to deliver maximum data integrity, zero amplification artifact, and actionable results.', 'cas-ngs-biotech-blocks' );

$phase1_label = isset( $attributes['phase1_label'] ) ? $attributes['phase1_label'] : 'PHASE 01';
$phase1_title = isset( $attributes['phase1_title'] ) ? $attributes['phase1_title'] : __( 'Sample Prep', 'cas-ngs-biotech-blocks' );
$phase1_desc  = isset( $attributes['phase1_desc'] ) ? $attributes['phase1_desc'] : __( 'HMW DNA/RNA extraction with strict fragment length selection (>50 kb). Fluorometric Qubit QC and agarose gel integrity verification.', 'cas-ngs-biotech-blocks' );
$phase1_qc    = isset( $attributes['phase1_qc'] ) ? $attributes['phase1_qc'] : 'DIN/RIN QC Verified';

$phase2_label = isset( $attributes['phase2_label'] ) ? $attributes['phase2_label'] : 'PHASE 02';
$phase2_title = isset( $attributes['phase2_title'] ) ? $attributes['phase2_title'] : __( 'Nanopore Basecalling', 'cas-ngs-biotech-blocks' );
$phase2_desc  = isset( $attributes['phase2_desc'] ) ? $attributes['phase2_desc'] : __( 'Single-molecule translocation through synthetic protein pores at 400 bp/s. Direct electronic voltage sampling at 4,000 measurements/sec per channel.', 'cas-ngs-biotech-blocks' );
$phase2_qc    = isset( $attributes['phase2_qc'] ) ? $attributes['phase2_qc'] : 'Real-Time Ionic Readout';

$phase3_label = isset( $attributes['phase3_label'] ) ? $attributes['phase3_label'] : 'PHASE 03';
$phase3_title = isset( $attributes['phase3_title'] ) ? $attributes['phase3_title'] : __( 'Computational Analysis', 'cas-ngs-biotech-blocks' );
$phase3_desc  = isset( $attributes['phase3_desc'] ) ? $attributes['phase3_desc'] : __( 'Raw ionic current squiggles translated via Dorado SUP neural models. Structural variant calling (Sniffles2), chromosomal phasing, and methylation profiling.', 'cas-ngs-biotech-blocks' );
$phase3_qc    = isset( $attributes['phase3_qc'] ) ? $attributes['phase3_qc'] : 'Q20+ Consensus Output';

$phase4_label = isset( $attributes['phase4_label'] ) ? $attributes['phase4_label'] : 'PHASE 04';
$phase4_title = isset( $attributes['phase4_title'] ) ? $attributes['phase4_title'] : __( 'Research Insight', 'cas-ngs-biotech-blocks' );
$phase4_desc  = isset( $attributes['phase4_desc'] ) ? $attributes['phase4_desc'] : __( 'Publication-ready methylation heatmaps, de novo assembly graphs, chromosomal phasing, and full raw POD5 / FASTQ + BAM + VCF delivery packages.', 'cas-ngs-biotech-blocks' );
$phase4_qc    = isset( $attributes['phase4_qc'] ) ? $attributes['phase4_qc'] : 'VCF, BAM & FASTQ';
?>

<section class="cas-bio-block cas-act-3" id="<?php echo esc_attr( $uid ); ?>" aria-labelledby="<?php echo esc_attr( $uid ); ?>-title">
  <div class="cas-container">

    <div class="section-eyebrow gsap-fade-up">
      <span class="badge-pill"><?php echo esc_html( $badge_text ); ?></span>
      <h2 id="<?php echo esc_attr( $uid ); ?>-title" class="section-title"><?php echo esc_html( $section_title ); ?></h2>
      <p class="section-desc">
        <?php echo esc_html( $section_desc ); ?>
      </p>
    </div>

    <div class="timeline-row">

      <!-- Phase 01: Sample Prep -->
      <article class="timeline-card gsap-fade-up">
        <div>
          <div class="timeline-phase"><?php echo esc_html( $phase1_label ); ?></div>
          <div class="timeline-icon-wrap">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v11m0 0H5m4 0h10m0-11v11m0 0H5"/></svg>
          </div>
          <h3 class="timeline-card-title"><?php echo esc_html( $phase1_title ); ?></h3>
          <p class="timeline-card-desc"><?php echo esc_html( $phase1_desc ); ?></p>
        </div>
        <div class="timeline-footer">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          <span><?php echo esc_html( $phase1_qc ); ?></span>
        </div>
      </article>

      <!-- Phase 02: Nanopore Basecalling -->
      <article class="timeline-card gsap-fade-up">
        <div>
          <div class="timeline-phase"><?php echo esc_html( $phase2_label ); ?></div>
          <div class="timeline-icon-wrap">
            <svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          </div>
          <h3 class="timeline-card-title"><?php echo esc_html( $phase2_title ); ?></h3>
          <p class="timeline-card-desc"><?php echo esc_html( $phase2_desc ); ?></p>
        </div>
        <div class="timeline-footer">
          <svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          <span><?php echo esc_html( $phase2_qc ); ?></span>
        </div>
      </article>

      <!-- Phase 03: Computational Analysis -->
      <article class="timeline-card gsap-fade-up">
        <div>
          <div class="timeline-phase"><?php echo esc_html( $phase3_label ); ?></div>
          <div class="timeline-icon-wrap">
            <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>
          </div>
          <h3 class="timeline-card-title"><?php echo esc_html( $phase3_title ); ?></h3>
          <p class="timeline-card-desc"><?php echo esc_html( $phase3_desc ); ?></p>
        </div>
        <div class="timeline-footer">
          <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/></svg>
          <span><?php echo esc_html( $phase3_qc ); ?></span>
        </div>
      </article>

      <!-- Phase 04: Research Insight -->
      <article class="timeline-card gsap-fade-up">
        <div>
          <div class="timeline-phase"><?php echo esc_html( $phase4_label ); ?></div>
          <div class="timeline-icon-wrap">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          </div>
          <h3 class="timeline-card-title"><?php echo esc_html( $phase4_title ); ?></h3>
          <p class="timeline-card-desc"><?php echo esc_html( $phase4_desc ); ?></p>
        </div>
        <div class="timeline-footer">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          <span><?php echo esc_html( $phase4_qc ); ?></span>
        </div>
      </article>

    </div>
  </div>
</section>
