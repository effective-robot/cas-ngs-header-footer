<?php
/**
 * Render template for cas-ngs/dna-background
 *
 * Fixed full-viewport 3D DNA simulation canvas behind all page content.
 * Synchronizes with page template metadata and block inspector attributes.
 *
 * @package CAS_NGS_Biotech_Blocks
 * @version 1.2.1
 */

if ( ! defined( 'ABSPATH' ) ) {
  exit;
}

$uid = wp_unique_id( 'cas-dna-bg-' );

$post_id = get_the_ID();

$default_model = defined( 'CAS_BIO_BLOCKS_URL' ) ? CAS_BIO_BLOCKS_URL . 'assets/models/dna.glb' : '';

// Retrieve block attributes with fallback to post meta if configured in page settings sidebar
$model_url    = ! empty( $attributes['model_url'] ) ? $attributes['model_url'] : ( $post_id ? get_post_meta( $post_id, '_cas_dna_model_url', true ) : '' );
if ( empty( $model_url ) ) {
  $model_url = $default_model;
}

$scale        = isset( $attributes['scale'] ) ? floatval( $attributes['scale'] ) : ( $post_id && '' !== get_post_meta( $post_id, '_cas_dna_scale', true ) ? floatval( get_post_meta( $post_id, '_cas_dna_scale', true ) ) : 1.0 );
$offset_x     = isset( $attributes['offset_x'] ) ? floatval( $attributes['offset_x'] ) : ( $post_id && '' !== get_post_meta( $post_id, '_cas_dna_offset_x', true ) ? floatval( get_post_meta( $post_id, '_cas_dna_offset_x', true ) ) : 0.0 );
$offset_y     = isset( $attributes['offset_y'] ) ? floatval( $attributes['offset_y'] ) : ( $post_id && '' !== get_post_meta( $post_id, '_cas_dna_offset_y', true ) ? floatval( get_post_meta( $post_id, '_cas_dna_offset_y', true ) ) : 0.0 );
$strand_color = ! empty( $attributes['strand_color'] ) ? $attributes['strand_color'] : ( $post_id && '' !== get_post_meta( $post_id, '_cas_dna_strand_color', true ) ? get_post_meta( $post_id, '_cas_dna_strand_color', true ) : '#8c6d58' );
$accent_color = ! empty( $attributes['accent_color'] ) ? $attributes['accent_color'] : ( $post_id && '' !== get_post_meta( $post_id, '_cas_dna_accent_color', true ) ? get_post_meta( $post_id, '_cas_dna_accent_color', true ) : '#4ade80' );
$ambient_int  = isset( $attributes['ambient_intensity'] ) ? floatval( $attributes['ambient_intensity'] ) : ( $post_id && '' !== get_post_meta( $post_id, '_cas_dna_ambient_intensity', true ) ? floatval( get_post_meta( $post_id, '_cas_dna_ambient_intensity', true ) ) : 1.8 );
$enable_cycle = isset( $attributes['enable_cycling'] ) ? (bool) $attributes['enable_cycling'] : true;
?>
<div class="cas-dna-bg-wrapper" id="<?php echo esc_attr( $uid ); ?>"
     style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: -1; pointer-events: none; overflow: hidden;"
     data-cas-dna-bg="true"
     data-model-url="<?php echo esc_url( $model_url ); ?>"
     data-scale="<?php echo esc_attr( $scale ); ?>"
     data-offset-x="<?php echo esc_attr( $offset_x ); ?>"
     data-offset-y="<?php echo esc_attr( $offset_y ); ?>"
     data-strand-color="<?php echo esc_attr( $strand_color ); ?>"
     data-accent-color="<?php echo esc_attr( $accent_color ); ?>"
     data-ambient-intensity="<?php echo esc_attr( $ambient_int ); ?>"
     data-cycling="<?php echo $enable_cycle ? 'true' : 'false'; ?>">
  <canvas class="cas-dna-webgl-canvas" style="width: 100%; height: 100%; display: block;"></canvas>
</div>
