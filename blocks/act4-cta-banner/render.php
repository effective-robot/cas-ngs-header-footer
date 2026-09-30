<?php
/**
 * Render template for cas-ngs/act4-cta-banner
 *
 * @package CAS_NGS_Biotech_Blocks
 */

if ( ! defined( 'ABSPATH' ) ) {
  exit;
}

$uid = wp_unique_id( 'cas-cta-' );

$badge_text         = isset( $attributes['badge_text'] ) && '' !== $attributes['badge_text'] ? $attributes['badge_text'] : __( 'Accelerate Your Scientific Discovery', 'cas-ngs-biotech-blocks' );
$banner_heading     = isset( $attributes['banner_heading'] ) && '' !== $attributes['banner_heading'] ? $attributes['banner_heading'] : __( 'Ready to Start Your Sequencing Run?', 'cas-ngs-biotech-blocks' );
$banner_subtext     = isset( $attributes['banner_subtext'] ) && '' !== $attributes['banner_subtext'] ? $attributes['banner_subtext'] : __( 'From pilot project library preparation to full PromethION 24 flowcell cohorts and institutional pipeline deployments, our team is ready to scale your genomics workflow.', 'cas-ngs-biotech-blocks' );
$primary_cta_text   = isset( $attributes['primary_cta_text'] ) && '' !== $attributes['primary_cta_text'] ? $attributes['primary_cta_text'] : __( 'Request a Quote', 'cas-ngs-biotech-blocks' );
$primary_cta_url    = isset( $attributes['primary_cta_url'] ) && '' !== $attributes['primary_cta_url'] ? $attributes['primary_cta_url'] : '/request-a-quote/';
$secondary_cta_text = isset( $attributes['secondary_cta_text'] ) && '' !== $attributes['secondary_cta_text'] ? $attributes['secondary_cta_text'] : __( 'Client Portal Access', 'cas-ngs-biotech-blocks' );
$secondary_cta_url  = isset( $attributes['secondary_cta_url'] ) && '' !== $attributes['secondary_cta_url'] ? $attributes['secondary_cta_url'] : '/portal/';
?>

<section class="cas-bio-block cas-act-4" id="<?php echo esc_attr( $uid ); ?>" aria-labelledby="<?php echo esc_attr( $uid ); ?>-title">
  <div class="cas-container">
    <div class="conversion-card gsap-scale-in">

      <span class="badge-pill">
        <span class="status-dot"></span>
        <?php echo esc_html( $badge_text ); ?>
      </span>

      <h2 id="<?php echo esc_attr( $uid ); ?>-title" class="conversion-title">
        <?php echo esc_html( $banner_heading ); ?>
      </h2>

      <p class="conversion-desc">
        <?php echo esc_html( $banner_subtext ); ?>
      </p>

      <div class="conversion-cta-row">
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
  </div>
</section>
