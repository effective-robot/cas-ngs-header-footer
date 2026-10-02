<?php
/**
 * Plugin Name: CAS-NGS Core Suite
 * Plugin URI:  https://example.com/cas-ngs
 * Description: Header, footer and biotech blocks in one plugin.
 * Version:     2.3.0
 * Requires at least: 6.1
 * Requires PHP: 7.2
 * Author:      CAS-NGS
 * License:     GPL-2.0-or-later
 * Text Domain: cas-ngs
 *
 * NOTE: this file is intentionally pure ASCII with short lines so it
 * survives any download or hosting re-encoding without parse errors.
 *
 * Nothing is applied automatically. Every component renders only where
 * its block, pattern or shortcode is placed.
 *
 * Biotech blocks: copy each block folder into /blocks (done). Copy the
 * large assets per README section 3. Visit any admin page with
 * ?cas-debug=1 to see registration status and any missing assets.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! defined( 'CAS_NGS_SUITE_VERSION' ) ) {
	define( 'CAS_NGS_SUITE_VERSION', '2.3.0' );
}

if ( ! defined( 'CAS_NGS_HF_VERSION' ) ) {
	define( 'CAS_NGS_HF_VERSION', CAS_NGS_SUITE_VERSION );
}

function cas_ngs_suite_url() {
	return trailingslashit( plugin_dir_url( __FILE__ ) );
}

function cas_ngs_stacking_hero_register_assets() {
	$gsap_cdn = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/';

	if ( ! wp_script_is( 'gsap', 'registered' ) ) {
		wp_register_script( 'gsap', $gsap_cdn . 'gsap.min.js', array(), '3.12.5', true );
	}
	if ( ! wp_script_is( 'gsap-scroll-trigger', 'registered' ) ) {
		wp_register_script( 'gsap-scroll-trigger', $gsap_cdn . 'ScrollTrigger.min.js', array( 'gsap' ), '3.12.5', true );
	}

	wp_register_script(
		'cas-ngs-stacking-hero-engine',
		cas_ngs_suite_url() . 'assets/js/stacking-hero.js',
		array( 'gsap', 'gsap-scroll-trigger' ),
		CAS_NGS_SUITE_VERSION,
		true
	);
	wp_register_script(
		'cas-ngs-stacking-hero-editor',
		cas_ngs_suite_url() . 'blocks/stacking-hero/editor.js',
		array( 'wp-blocks', 'wp-element', 'wp-block-editor', 'wp-components' ),
		CAS_NGS_SUITE_VERSION,
		true
	);
	wp_register_style(
		'cas-ngs-stacking-hero-style',
		cas_ngs_suite_url() . 'assets/css/stacking-hero.css',
		array(),
		CAS_NGS_SUITE_VERSION
	);
}
add_action( 'init', 'cas_ngs_stacking_hero_register_assets', 4 );

function cas_ngs_splash_enqueue_assets() {
	if ( is_admin() || wp_doing_ajax() ) {
		return;
	}

	if ( isset( $_GET['cas-splash'] ) && '0' === (string) $_GET['cas-splash'] ) {
		return;
	}

	wp_enqueue_style(
		'cas-ngs-splash',
		cas_ngs_suite_url() . 'assets/css/cas-splash.css',
		array(),
		CAS_NGS_SUITE_VERSION,
		'all'
	);

	if ( ! wp_script_is( 'gsap', 'registered' ) ) {
		wp_register_script(
			'gsap',
			'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js',
			array(),
			'3.12.5',
			true
		);
	}
	wp_enqueue_script( 'gsap' );

	wp_enqueue_script(
		'cas-ngs-splash',
		cas_ngs_suite_url() . 'assets/js/cas-splash.js',
		array( 'gsap' ),
		CAS_NGS_SUITE_VERSION,
		true
	);
}
add_action( 'wp_enqueue_scripts', 'cas_ngs_splash_enqueue_assets' );

function cas_ngs_splash_markup() {
	if ( is_admin() || wp_doing_ajax() ) {
		return;
	}

	if ( isset( $_GET['cas-splash'] ) && '0' === (string) $_GET['cas-splash'] ) {
		return;
	}

	echo '<div id="cas-splash" aria-live="polite" aria-hidden="false">'
		. '<div class="cas-splash-inner">'
		. '<svg viewBox="0 0 1100 500" role="img" aria-label="CAS-NGS splash animation">'
		. '<defs>'
		. '<clipPath id="text-reveal-clip">'
		. '<rect id="clip-rect" x="445" y="0" width="0" height="500" />'
		. '</clipPath>'
		. '</defs>'
		. '<g id="dna-mark">'
		. '<line class="bond" id="b0" x1="100" y1="250" x2="100" y2="250" />'
		. '<circle class="node" id="n0-top" cx="100" cy="250" r="30" />'
		. '<circle class="node" id="n0-bot" cx="100" cy="250" r="18" />'
		. '<line class="bond" id="b1" x1="160" y1="250" x2="160" y2="250" />'
		. '<circle class="node" id="n1-top" cx="160" cy="250" r="28" />'
		. '<circle class="node" id="n1-bot" cx="160" cy="250" r="18" />'
		. '<line class="bond" id="b2" x1="220" y1="250" x2="220" y2="250" />'
		. '<circle class="node" id="n2-top" cx="220" cy="250" r="18" />'
		. '<circle class="node" id="n2-bot" cx="220" cy="250" r="28" />'
		. '<line class="bond" id="b3" x1="280" y1="250" x2="280" y2="250" />'
		. '<circle class="node" id="n3-top" cx="280" cy="250" r="18" />'
		. '<circle class="node" id="n3-bot" cx="280" cy="250" r="30" />'
		. '<line class="bond" id="b4" x1="340" y1="250" x2="340" y2="250" />'
		. '<circle class="node" id="n4-top" cx="340" cy="250" r="18" />'
		. '<circle class="node" id="n4-bot" cx="340" cy="250" r="28" />'
		. '<line class="bond" id="b5" x1="400" y1="250" x2="400" y2="250" />'
		. '<circle class="node" id="n5-top" cx="400" cy="250" r="28" />'
		. '<circle class="node" id="n5-bot" cx="400" cy="250" r="18" />'
		. '<line class="bond" id="b6" x1="460" y1="250" x2="460" y2="250" />'
		. '<circle class="node" id="n6-top" cx="460" cy="250" r="30" />'
		. '<circle class="node" id="n6-bot" cx="460" cy="250" r="18" />'
		. '</g>'
		. '<g clip-path="url(#text-reveal-clip)">'
		. '<text id="brand-text" class="company-text" x="455" y="250">CAS-NGS</text>'
		. '</g>'
		. '</svg>'
		. '</div>'
		. '</div>';
}
add_action( 'wp_body_open', 'cas_ngs_splash_markup', 1 );

// Biotech blocks bootstrap (Acts 0-4 + DNA background + pipeline hero).
// Registers those blocks, their editor script, the GSAP + Three.js asset
// pipeline and their shortcodes. It does NOT auto-inject anything.
require_once plugin_dir_path( __FILE__ )
	. 'includes/cas-ngs-biotech-blocks.php';

/*
 * Packed-blocks auto-loader: blocks/<name>/block.json or
 * blocks/<name>/<name>.php. Skips blocks the biotech bootstrap already
 * registered, and records a log for the ?cas-debug=1 notice.
 */
function cas_ngs_suite_register_packed_blocks() {
	$dir = plugin_dir_path( __FILE__ ) . 'blocks';
	$GLOBALS['cas_ngs_block_log'] = array();

	if ( ! is_dir( $dir ) ) {
		$GLOBALS['cas_ngs_block_log'][] = array(
			'folder' => '(blocks directory missing)',
			'name'   => '-',
			'ok'     => false,
		);
		return;
	}

	$registry = null;
	if ( class_exists( 'WP_Block_Type_Registry' ) ) {
		$registry = WP_Block_Type_Registry::get_instance();
	}

	$manifests = glob( $dir . '/*/block.json' );
	if ( ! is_array( $manifests ) ) {
		$manifests = array();
	}

	foreach ( $manifests as $manifest ) {
		$folder = dirname( $manifest );
		$raw    = (string) file_get_contents( $manifest );
		$meta   = json_decode( $raw, true );
		$name   = basename( $folder );
		if ( is_array( $meta ) && ! empty( $meta['name'] ) ) {
			$name = $meta['name'];
		}

		// Already registered by the biotech bootstrap? Skip it.
		if ( $registry && $registry->is_registered( $name ) ) {
			$GLOBALS['cas_ngs_block_log'][] = array(
				'folder' => basename( $folder ),
				'name'   => $name,
				'ok'     => true,
			);
			continue;
		}

		$result = null;
		try {
			$result = register_block_type( $folder );
		} catch ( Throwable $e ) {
			$result = null;
		}

		$label = $name;
		if ( ! $result ) {
			$label .= '  (registration FAILED - check block.json)';
		}

		$GLOBALS['cas_ngs_block_log'][] = array(
			'folder' => basename( $folder ),
			'name'   => $label,
			'ok'     => (bool) $result,
		);
	}

	// Classic fallback: blocks/<slug>/<slug>.php registers itself.
	$php_blocks = glob( $dir . '/*/*.php' );
	if ( ! is_array( $php_blocks ) ) {
		$php_blocks = array();
	}
	foreach ( $php_blocks as $file ) {
		$slug = basename( dirname( $file ) );
		if ( basename( $file, '.php' ) === $slug ) {
			require_once $file;
			$GLOBALS['cas_ngs_block_log'][] = array(
				'folder' => $slug,
				'name'   => '(classic self-registering php)',
				'ok'     => true,
			);
		}
	}

	if ( empty( $GLOBALS['cas_ngs_block_log'] ) ) {
		$GLOBALS['cas_ngs_block_log'][] = array(
			'folder' => '(blocks directory is empty)',
			'name'   => '-',
			'ok'     => false,
		);
	}
}
add_action( 'init', 'cas_ngs_suite_register_packed_blocks', 20 );

// Admin diagnostic: open any wp-admin page with ?cas-debug=1 appended.
function cas_ngs_suite_admin_debug_notice() {
	if ( ! isset( $_GET['cas-debug'] ) ) {
		return;
	}
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}

	echo '<div class="notice notice-info">';
	echo '<p><strong>CAS-NGS Core Suite</strong> ';
	echo '- packed blocks discovery:</p>';
	echo '<ul style="list-style:disc;padding-left:22px;">';

	$log = array();
	if ( isset( $GLOBALS['cas_ngs_block_log'] ) ) {
		$log = $GLOBALS['cas_ngs_block_log'];
	}
	foreach ( $log as $row ) {
		$badge = $row['ok']
			? '<span style="color:#00a32a;">[registered]</span>'
			: '<span style="color:#d63638;">[NOT registered]</span>';
		echo '<li><code>' . esc_html( $row['folder'] ) . '</code> -&gt; '
			. esc_html( $row['name'] ) . ' ' . $badge . '</li>';
	}
	echo '</ul>';

	// Biotech asset completeness check (files that ship from the repo).
	$base     = plugin_dir_path( __FILE__ );
	$required = array(
		'blocks/act1-hero-sequencer/render.php'       => 'Act 1 render',
		'blocks/act2-bento-grid/render.php'           => 'Act 2 render',
		'blocks/act3-process-timeline/render.php'     => 'Act 3 render',
		'blocks/act4-cta-banner/render.php'           => 'Act 4 render',
		'blocks/dna-background/render.php'            => 'DNA background',
		'blocks/header-top-dock/render.php'           => 'Top dock render',
		'blocks/interactive-pipeline-hero/render.php' => 'Pipeline hero',
		'assets/css/biotech-blocks.css'               => 'Biotech CSS',
		'assets/js/biotech-blocks-editor.js'          => 'Editor scripts',
		'assets/js/biotech-blocks-engine.js'          => 'Front engine',
		'assets/models/dna.glb'                       => '3D DNA model',
	);

	$missing = array();
	foreach ( $required as $rel => $label ) {
		if ( ! file_exists( $base . $rel ) ) {
			$missing[] = '<code>' . esc_html( $rel ) . '</code> ('
				. esc_html( $label ) . ')';
		}
	}

	if ( $missing ) {
		echo '<p><strong style="color:#d63638;">Missing biotech assets</strong>';
		echo ' - copy these from your cas-ngs-biotech-blocks repo into the';
		echo ' plugin folder (see README, section 3):</p>';
		echo '<ul style="list-style:disc;padding-left:22px;">';
		foreach ( $missing as $m ) {
			echo '<li>' . $m . '</li>';
		}
		echo '</ul>';
	} else {
		echo '<p><strong style="color:#00a32a;">';
		echo 'All biotech assets present.</strong></p>';
	}

	echo '<p>Each block folder sits directly inside <code>blocks/</code> ';
	echo 'with a valid <code>block.json</code> at its root. Names look like ';
	echo '<code>namespace/block-slug</code>. The <code>render</code> key ';
	echo 'needs WordPress 6.1+.</p>';

	// ── Biotech block registration audit (evidence, not guesswork) ──
	echo '<hr style="margin:14px 0;"/>';
	echo '<p><strong>Biotech block registration audit</strong> — a block ';
	echo 'only appears in the inserter if it is (a) registered server-side ';
	echo 'AND (b) has its editor JavaScript loaded. This table shows both.</p>';

	$registry        = WP_Block_Type_Registry::get_instance();
	$expected_blocks = array(
		'cas-ngs/header-top-dock',
		'cas-ngs/interactive-pipeline-hero',
		'cas-ngs/dna-background',
		'cas-ngs/act1-hero-sequencer',
		'cas-ngs/act2-bento-grid',
		'cas-ngs/act3-process-timeline',
		'cas-ngs/act4-cta-banner',
	);

	echo '<table class="widefat striped" style="max-width:720px;">';
	echo '<thead><tr><th>Block</th><th>Registered (server)</th></tr></thead><tbody>';
	foreach ( $expected_blocks as $name ) {
		$reg  = $registry->is_registered( $name );
		$cell = $reg
			? '<span style="color:#00a32a;">YES</span>'
			: '<span style="color:#d63638;">NO — block.json missing or invalid</span>';
		echo '<tr><td><code>' . esc_html( $name ) . '</code></td><td>'
			. $cell . '</td></tr>';
	}
	echo '</tbody></table>';

	// The editor script is what makes the blocks show in the inserter.
	$editor_js     = $base . 'assets/js/biotech-blocks-editor.js';
	$editor_css    = $base . 'assets/css/biotech-blocks.css';
	$js_present    = file_exists( $editor_js );
	$css_present   = file_exists( $editor_css );
	$js_registered = wp_script_is( 'cas-ngs-biotech-blocks-editor', 'registered' );

	echo '<p style="margin-top:12px;"><strong>Editor assets (required for ';
	echo 'the blocks to appear in the inserter):</strong></p>';
	echo '<ul style="list-style:disc;padding-left:22px;">';
	echo '<li><code>assets/js/biotech-blocks-editor.js</code>: '
		. ( $js_present
			? '<span style="color:#00a32a;">PRESENT on disk</span>'
			: '<span style="color:#d63638;">MISSING — copy it from your repo</span>' )
		. ' &middot; handle '
		. ( $js_registered ? 'registered' : 'not registered' )
		. '</li>';
	echo '<li><code>assets/css/biotech-blocks.css</code>: '
		. ( $css_present
			? '<span style="color:#00a32a;">PRESENT on disk</span>'
			: '<span style="color:#d63638;">MISSING — copy it from your repo</span>' )
		. '</li>';
	echo '</ul>';

	echo '<p><strong>How to read this:</strong> if every block shows ';
	echo '<em>YES</em> but <code>biotech-blocks-editor.js</code> is ';
	echo '<em>MISSING</em>, the blocks ARE wired correctly — they simply ';
	echo 'cannot show in the inserter until that file is copied from your ';
	echo '<code>cas-ngs-biotech-blocks</code> repo into ';
	echo '<code>assets/js/</code> (see README section 3).</p>';
	echo '</div>';
}
add_action( 'admin_notices', 'cas_ngs_suite_admin_debug_notice' );

/*
 * Header: dynamic block rendered from its sidebar attributes, so patterns
 * and template parts never fail block validation. Editor UI + live preview
 * live in block.js.
 */
function cas_ngs_header_default_attributes() {
	return array(
		'logoUrl'      => '',
		'wordmark'     => 'CAS-NGS',
		'showWordmark' => true,
		'showCta'      => true,
		'ctaText'      => 'Request a Run',
		'ctaUrl'       => '/contact',
		'tabs'         => array(
			array(
				'label'    => 'Home',
				'url'      => '/',
				'active'   => true,
				'children' => array(),
			),
			array(
				'label'    => 'Sequencing',
				'url'      => '',
				'active'   => false,
				'children' => array(
					array(
						'label'   => 'HMW DNA Extraction',
						'url'     => '/sequencing/hmw-dna',
						'caption' => 'Ultra-long reads',
					),
					array(
						'label'   => 'Direct RNA-Seq',
						'url'     => '/sequencing/direct-rna',
						'caption' => 'No conversion bias',
					),
					array(
						'label'   => '5mC and 6mA Methylation',
						'url'     => '/sequencing/methylation',
						'caption' => 'Native detection',
					),
					array(
						'label'   => 'Adaptive Sampling',
						'url'     => '/sequencing/adaptive',
						'caption' => 'Real-time enrichment',
					),
				),
			),
			array(
				'label'    => 'Research',
				'url'      => '',
				'active'   => false,
				'children' => array(
					array(
						'label'   => 'Nanopore Methods',
						'url'     => '/research/methods',
						'caption' => 'Wet-lab protocols',
					),
					array(
						'label'   => 'Open Data',
						'url'     => '/research/data',
						'caption' => 'Public runs',
					),
				),
			),
			array(
				'label'    => 'Training',
				'url'      => '/training',
				'active'   => false,
				'children' => array(),
			),
			array(
				'label'    => 'About',
				'url'      => '/about',
				'active'   => false,
				'children' => array(),
			),
		),
	);
}

function cas_ngs_svg_leaf() {
	return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" '
		. 'stroke="currentColor" stroke-width="1.9" stroke-linecap="round" '
		. 'stroke-linejoin="round" aria-hidden="true">'
		. '<path d="M5 19C5 10 10 5 19 5c0 9-5 14-14 14Z"/>'
		. '<path d="M5 19c3-5 6-8 10-10"/></svg>';
}

function cas_ngs_svg_chevron() {
	return '<svg class="cas-chev" width="13" height="13" '
		. 'viewBox="0 0 24 24" fill="none" stroke="currentColor" '
		. 'stroke-width="2" stroke-linecap="round" '
		. 'stroke-linejoin="round" aria-hidden="true">'
		. '<path d="m6 9 6 6 6-6"/></svg>';
}

function cas_ngs_svg_arrow() {
	return '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" '
		. 'stroke="currentColor" stroke-width="2" stroke-linecap="round" '
		. 'stroke-linejoin="round" aria-hidden="true">'
		. '<path d="M7 17 17 7"/><path d="M9 7h8v8"/></svg>';
}

// Build the header markup from block attributes.
function cas_ngs_header_account_menu_data() {
	$login_url    = home_url( '/login/' );
	$register_url = home_url( '/register/' );
	$account_url  = home_url( '/account/' );

	if ( is_user_logged_in() ) {
		$current_user = wp_get_current_user();
		$profile_url  = home_url( '/user/' . rawurlencode( $current_user->user_login ) . '/' );

		return array(
			'label'    => __( 'Account', 'cas-ngs' ),
			'url'      => $account_url,
			'active'   => false,
			'children' => array(
				array( 'label' => __( 'My Profile', 'cas-ngs' ), 'url' => $profile_url, 'caption' => '' ),
				array( 'label' => __( 'Account', 'cas-ngs' ), 'url' => $account_url, 'caption' => '' ),
				array( 'label' => __( 'Author Dashboard', 'cas-ngs' ), 'url' => home_url( '/author-dashboard/' ), 'caption' => '' ),
				array( 'label' => __( 'Logout', 'cas-ngs' ), 'url' => home_url( '/logout/' ), 'caption' => '' ),
			),
		);
	}

	return array(
		'label'    => __( 'Account', 'cas-ngs' ),
		'url'      => $login_url,
		'active'   => false,
		'children' => array(
			array( 'label' => __( 'Login', 'cas-ngs' ), 'url' => $login_url, 'caption' => '' ),
			array( 'label' => __( 'Register', 'cas-ngs' ), 'url' => $register_url, 'caption' => '' ),
		),
	);
}

function cas_ngs_header_render_callback( $attributes ) {
	$defaults = cas_ngs_header_default_attributes();
	$atts     = wp_parse_args( (array) $attributes, $defaults );
	$tabs     = is_array( $atts['tabs'] ) ? $atts['tabs'] : array();
	$tabs     = array_values(
		array_filter(
			$tabs,
			function ( $tab ) {
				if ( ! is_array( $tab ) || ! isset( $tab['label'] ) ) {
					return true;
				}
				return 'account' !== strtolower( trim( wp_strip_all_tags( (string) $tab['label'] ) ) );
			}
		)
	);
	$tabs[]   = cas_ngs_header_account_menu_data();

	$desktop = '';
	$mobile  = '';

	foreach ( $tabs as $tab ) {
		$tab = wp_parse_args(
			(array) $tab,
			array(
				'label'    => '',
				'url'      => '',
				'active'   => false,
				'children' => array(),
			)
		);

		$label    = esc_html( $tab['label'] );
		$url      = esc_url( $tab['url'] ? $tab['url'] : '#' );
		$active   = false;
		$children = is_array( $tab['children'] ) ? $tab['children'] : array();

		$current_url = home_url( add_query_arg( array() ) );
		$current_path = wp_parse_url( $current_url, PHP_URL_PATH );
		$tab_path      = wp_parse_url( $url, PHP_URL_PATH );
		if ( ! $tab_path || '#' === $tab_path ) {
			$tab_path = null;
		}
		if ( $current_path && $tab_path ) {
			$current_path = rtrim( $current_path, '/' );
			$tab_path     = rtrim( $tab_path, '/' );
			if ( '/' === $current_path ) {
				$current_path = '';
			}
			if ( '/' === $tab_path ) {
				$tab_path = '';
			}
			if ( $current_path === $tab_path ) {
				$active = true;
			}
		}

		if ( $children ) {
			$links = '';
			$sub   = '';
			$toggle_label = esc_attr( sprintf( __( 'Toggle %s submenu', 'cas-ngs' ), wp_strip_all_tags( $tab['label'] ) ) );
			foreach ( $children as $child ) {
				$child = wp_parse_args(
					(array) $child,
					array( 'label' => '', 'url' => '', 'caption' => '' )
				);
				$curl = esc_url( $child['url'] ? $child['url'] : '#' );
				$links .= '<a class="cas-dropdown__link" href="'
					. $curl . '"><span>'
					. esc_html( $child['label'] ) . '</span><small>'
					. esc_html( $child['caption'] )
					. '</small></a>';
				$sub .= '<a class="cas-m-sublink" href="' . $curl . '">'
					. esc_html( $child['label'] ) . '</a>';
			}

			$btn_class = 'cas-dock-item cas-dock-item--parent';
			if ( $active ) {
				$btn_class .= ' is-active';
			}
			$desktop .= '<div class="cas-dock-group">'
				. '<div class="' . $btn_class . '">'
				. '<a class="cas-dock-parent__link" href="' . $url . '"' . ( $active ? ' aria-current="page"' : '' ) . '>'
				. '<span>' . $label . '</span></a>'
				. '<button type="button" class="cas-dock-toggle" '
				. 'data-cas-toggle aria-label="' . $toggle_label . '" '
				. 'aria-haspopup="true" aria-expanded="false">'
				. cas_ngs_svg_chevron() . '</button></div>'
				. '<div class="cas-dropdown" data-cas-dropdown>'
				. $links . '</div></div>';

			$mobile .= '<div class="cas-m-group">'
				. '<div class="cas-m-parent">'
				. '<a class="cas-m-item cas-m-item--parent" href="' . $url . '"' . ( $active ? ' aria-current="page"' : '' ) . '>'
				. '<span>' . $label . '</span></a>'
				. '<button type="button" class="cas-m-toggle" '
				. 'data-cas-m-toggle aria-label="' . $toggle_label . '" '
				. 'aria-haspopup="true" aria-expanded="false">'
				. cas_ngs_svg_chevron() . '</button></div>'
				. '<div class="cas-m-sub">' . $sub . '</div></div>';
		} else {
			$a_class = 'cas-dock-item';
			$current = '';
			if ( $active ) {
				$a_class .= ' is-active';
				$current  = ' aria-current="page"';
			}
			$desktop .= '<a class="' . $a_class . '" href="' . $url . '"'
				. $current . '><span>' . $label . '</span></a>';
			$mobile  .= '<a class="cas-m-item" href="' . $url . '">'
				. '<span>' . $label . '</span></a>';
		}
	}

	$logo = $atts['logoUrl']
		? '<img src="' . esc_url( $atts['logoUrl'] ) . '" alt="">'
		: cas_ngs_svg_leaf();

	$wordmark = '';
	if ( ! empty( $atts['showWordmark'] ) ) {
		$wordmark = '<span class="cas-dock-word">'
			. esc_html( $atts['wordmark'] ) . '</span>';
	}

	$cta = '';
	if ( ! empty( $atts['showCta'] ) && $atts['ctaText'] ) {
		$cta_url = esc_url( $atts['ctaUrl'] ? $atts['ctaUrl'] : '#' );
		$cta     = '<a class="cas-dock-cta" href="' . $cta_url . '">'
			. '<span>' . esc_html( $atts['ctaText'] ) . '</span>'
			. cas_ngs_svg_arrow() . '</a>';
	}

	$mobile_cta = '';
	if ( $cta ) {
		$mobile_cta = str_replace(
			'cas-dock-cta',
			'cas-dock-cta cas-mobile__cta',
			$cta
		);
	}

	$home = esc_url( home_url( '/' ) );
	$wm   = $atts['wordmark'] ? $atts['wordmark'] : 'Home';

	$out  = '<header class="cas-header" data-cas-header>';
	$out .= '<div class="cas-dock-bar">';
	$out .= '<canvas class="cas-dock-canvas" aria-hidden="true"></canvas>';
	$out .= '<a class="cas-dock-brand" href="' . $home . '" '
		. 'aria-label="' . esc_attr( $wm ) . '">'
		. '<span class="cas-dock-logo">' . $logo . '</span>'
		. $wordmark . '</a>';
	$out .= '<nav class="cas-dock" data-cas-dock aria-label="'
		. esc_attr__( 'Primary navigation', 'cas-ngs' ) . '">'
		. $desktop . '</nav>';
	$out .= '<div class="cas-dock-actions">' . $cta
		. '<button type="button" class="cas-burger" data-cas-burger '
		. 'aria-expanded="false" aria-label="'
		. esc_attr__( 'Open menu', 'cas-ngs' ) . '">'
		. '<span></span><span></span><span></span></button></div>';
	$out .= '</div>';
	$out .= '<div class="cas-mobile" data-cas-mobile aria-hidden="true">';
	$out .= '<nav class="cas-mobile__nav" aria-label="'
		. esc_attr__( 'Mobile navigation', 'cas-ngs' ) . '">'
		. $mobile . '</nav>';
	$out .= $mobile_cta;
	$out .= '</div></header>';

	return $out;
}

// Register a dedicated block category so the suite's blocks are grouped
// and easy to find in the inserter.
function cas_ngs_suite_block_category( $categories ) {
	foreach ( (array) $categories as $cat ) {
		if ( isset( $cat['slug'] ) && 'cas-ngs-suite' === $cat['slug'] ) {
			return $categories;
		}
	}
	return array_merge(
		array(
			array(
				'slug'  => 'cas-ngs-suite',
				'title' => __( 'CAS-NGS Suite', 'cas-ngs' ),
				'icon'  => 'leaf',
			),
		),
		$categories
	);
}
add_filter( 'block_categories_all', 'cas_ngs_suite_block_category', 10, 1 );

// Register the style handle early (on init) so it is reliably available
// to the editor when it collects block editor styles.
function cas_ngs_suite_register_styles_early() {
	wp_register_style(
		'cas-ngs-hf-front',
		cas_ngs_suite_url() . 'assets/header-footer.css',
		array(),
		CAS_NGS_SUITE_VERSION
	);
}
add_action( 'init', 'cas_ngs_suite_register_styles_early', 5 );

function cas_ngs_suite_register_blocks() {
	if ( ! function_exists( 'register_block_type' ) ) {
		return;
	}

	register_block_type(
		'cas-ngs/header',
		array(
			'editor_script'   => 'cas-ngs-block',
			'editor_style'    => 'cas-ngs-hf-front',
			'style'           => 'cas-ngs-hf-front',
			'render_callback' => 'cas_ngs_header_render_callback',
		)
	);

	// Footer: static save (click-to-edit RichText), registered in block.js.
	register_block_type(
		'cas-ngs/footer',
		array(
			'editor_script' => 'cas-ngs-block',
			'editor_style'  => 'cas-ngs-hf-front',
			'style'         => 'cas-ngs-hf-front',
		)
	);
}
add_action( 'init', 'cas_ngs_suite_register_blocks' );

function cas_ngs_suite_register_patterns() {
	if ( ! function_exists( 'register_block_pattern' ) ) {
		return;
	}

	if ( function_exists( 'register_block_pattern_category' ) ) {
		$registry = WP_Block_Pattern_Categories_Registry::get_instance();
		if ( ! $registry->is_registered( 'cas-ngs' ) ) {
			register_block_pattern_category(
				'cas-ngs',
				array( 'label' => __( 'CAS-NGS', 'cas-ngs' ) )
			);
		}
	}

	register_block_pattern(
		'cas-ngs/top-dock-header',
		array(
			'title'       => __( 'CAS-NGS Top Dock Header', 'cas-ngs' ),
			'description' => __( 'Floating glass command-bar.', 'cas-ngs' ),
			'categories'  => array( 'cas-ngs', 'header' ),
			'blockTypes'  => array( 'core/template-part' ),
			'content'     => '<!-- wp:cas-ngs/header /-->',
		)
	);

	register_block_pattern(
		'cas-ngs/sylva-footer',
		array(
			'title'       => __( 'CAS-NGS Sylva Footer', 'cas-ngs' ),
			'description' => __( 'Light-mode footer with DNA strands.', 'cas-ngs' ),
			'categories'  => array( 'cas-ngs', 'footer' ),
			'blockTypes'  => array( 'core/template-part' ),
			'content'     => '<!-- wp:cas-ngs/footer /-->',
		)
	);
}
add_action( 'init', 'cas_ngs_suite_register_patterns' );

// Shortcodes + template tags (classic themes / ad-hoc use).
add_shortcode(
	'cas_ngs_header',
	function () {
		return do_blocks( '<!-- wp:cas-ngs/header /-->' );
	}
);

add_shortcode(
	'cas_ngs_footer',
	function () {
		return do_blocks( '<!-- wp:cas-ngs/footer /-->' );
	}
);

function cas_ngs_header() {
	echo do_shortcode( '[cas_ngs_header]' );
}

function cas_ngs_footer() {
	echo do_shortcode( '[cas_ngs_footer]' );
}

// Assets: enqueued site-wide; engines stay inert without the markup, which
// keeps blocks inside template parts working reliably.
function cas_ngs_suite_front_assets() {
	$base = cas_ngs_suite_url();

	wp_enqueue_style(
		'cas-ngs-hf-front',
		$base . 'assets/header-footer.css',
		array(),
		CAS_NGS_SUITE_VERSION
	);
	wp_enqueue_script(
		'cas-ngs-hf-engine',
		$base . 'assets/header-footer.js',
		array(),
		CAS_NGS_SUITE_VERSION,
		true
	);

	// Design faces; dequeue 'cas-ngs-hf-fonts' if your theme loads them.
	$fonts_url = 'https://fonts.googleapis.com/css2'
		. '?family=Lexend:wght@200;300;400;500;600;700'
		. '&family=IBM+Plex+Mono:wght@400;500;600'
		. '&display=swap';
	wp_enqueue_style( 'cas-ngs-hf-fonts', $fonts_url, array(), null );
}
add_action( 'wp_enqueue_scripts', 'cas_ngs_suite_front_assets' );

function cas_ngs_suite_editor_assets() {
	$base = cas_ngs_suite_url();

	wp_enqueue_script(
		'cas-ngs-block',
		$base . 'block.js',
		array(
			'wp-blocks',
			'wp-element',
			'wp-block-editor',
			'wp-components',
			'wp-i18n',
		),
		CAS_NGS_SUITE_VERSION,
		true
	);
	wp_localize_script( 'cas-ngs-block', 'casNgHeaderAccountMenu', cas_ngs_header_account_menu_data() );
	wp_enqueue_style(
		'cas-ngs-hf-front',
		$base . 'assets/header-footer.css',
		array(),
		CAS_NGS_SUITE_VERSION
	);
}
add_action( 'enqueue_block_editor_assets', 'cas_ngs_suite_editor_assets' );
