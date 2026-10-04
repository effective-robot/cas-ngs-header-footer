<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

wp_enqueue_style( 'cas-ngs-stacking-hero-style' );
wp_enqueue_script( 'cas-ngs-stacking-hero-engine' );

$defaults = array(
	array( 'tag' => '[ 01 • PLANT GENOMICS ]', 'title' => 'We Study Plants', 'description' => 'Decoding complex plant genomes, promoter motifs, and transcriptional signatures to engineer climate-resilient crops and secure future agricultural yields.', 'imageAlt' => 'Sunflower', 'backgroundColor' => '#d89972' ),
	array( 'tag' => '[ 02 • HUMAN HEALTH ]', 'title' => 'We Study Humans', 'description' => 'Unlocking genetic blueprints and deep biomarker pathways to accelerate precision medicine, diagnostics, and breakthrough therapeutic discoveries.', 'imageAlt' => 'Human DNA Study', 'backgroundColor' => '#b3805d' ),
	array( 'tag' => '[ 03 • ANIMAL BIOTECH ]', 'title' => 'We Study Animals', 'description' => 'Advancing comparative genomics and molecular selection to optimize livestock health, breeding efficiency, and sustainable agricultural productivity.', 'imageAlt' => 'Animal Study', 'backgroundColor' => '#e6c8b3' ),
	array( 'tag' => '[ 04 • METAGENOMICS ]', 'title' => 'We Study Microbes', 'description' => 'Exploring complex microbial ecosystems and plant-microbe interactions to pioneer next-generation industrial and environmental biotech solutions.', 'imageAlt' => 'Fungi and Bacteria Study', 'backgroundColor' => '#c29b7a' ),
);
$cards = isset( $attributes['cards'] ) && is_array( $attributes['cards'] ) ? $attributes['cards'] : array();
$font_options = array( 'Plus Jakarta Sans', 'Arial, sans-serif', 'Georgia, serif', 'inherit' );
$font_family = isset( $attributes['fontFamily'] ) && in_array( $attributes['fontFamily'], $font_options, true ) ? $attributes['fontFamily'] : 'Plus Jakarta Sans';
$title_size = isset( $attributes['titleFontSize'] ) ? max( 1, min( 5, floatval( $attributes['titleFontSize'] ) ) ) : 2.4;
$description_size = isset( $attributes['descriptionFontSize'] ) ? max( 0.6, min( 2, floatval( $attributes['descriptionFontSize'] ) ) ) : 0.98;
$tag_size = isset( $attributes['tagFontSize'] ) ? max( 0.5, min( 1.5, floatval( $attributes['tagFontSize'] ) ) ) : 0.8;
$intro_title = isset( $attributes['introTitle'] ) ? $attributes['introTitle'] : 'Scroll Down to Explore Our Core Disciplines';
$plugin_url = cas_ngs_suite_url();
$image_defaults = array( 'sunflower.webp', 'human.webp', 'khota.webp', 'fungi-bacteria.webp' );
$card_classes = array( 'card-plants', 'card-humans', 'card-animals', 'card-microbes' );
?>
<div class="csh-root wp-block-cas-ngs-stacking-hero" style="--csh-font-family: <?php echo esc_attr( $font_family ); ?>; --csh-title-size: <?php echo esc_attr( $title_size ); ?>rem; --csh-description-size: <?php echo esc_attr( $description_size ); ?>rem; --csh-tag-size: <?php echo esc_attr( $tag_size ); ?>rem;">
	<div class="hero-spacer">
		<h1><?php echo esc_html( $intro_title ); ?></h1>
	</div>
	<section class="stack-container">
		<div class="card-sticky-wrapper">
			<div class="cards-wrapper">
				<?php for ( $index = 0; $index < 4; $index++ ) :
					$card = isset( $cards[ $index ] ) && is_array( $cards[ $index ] ) ? array_merge( $defaults[ $index ], $cards[ $index ] ) : $defaults[ $index ];
					$image_url = ! empty( $card['imageUrl'] ) ? $card['imageUrl'] : $plugin_url . 'assets/images/stacking-hero/' . $image_defaults[ $index ];
					$background = sanitize_hex_color( isset( $card['backgroundColor'] ) ? $card['backgroundColor'] : '' );
					if ( ! $background ) {
						$background = $defaults[ $index ]['backgroundColor'];
					}
				?>
					<div class="bio-card <?php echo esc_attr( $card_classes[ $index ] ); ?>" style="--card-background: <?php echo esc_attr( $background ); ?>;">
						<?php if ( 1 === $index || 3 === $index ) : ?>
							<div class="bio-image-wrapper"><img src="<?php echo esc_url( $image_url ); ?>" alt="<?php echo esc_attr( $card['imageAlt'] ); ?>"></div>
						<?php endif; ?>
						<div class="bio-text-box">
							<span class="bio-tag"><?php echo esc_html( $card['tag'] ); ?></span>
							<h2 class="bio-title"><?php echo esc_html( $card['title'] ); ?></h2>
							<p class="bio-desc"><?php echo esc_html( $card['description'] ); ?></p>
						</div>
						<?php if ( 0 === $index || 2 === $index ) : ?>
							<div class="bio-image-wrapper"><img src="<?php echo esc_url( $image_url ); ?>" alt="<?php echo esc_attr( $card['imageAlt'] ); ?>"></div>
						<?php endif; ?>
					</div>
				<?php endfor; ?>
			</div>
		</div>
	</section>
	<div class="outro-spacer"></div>
</div>