<?php
/**
 * Render template for cas-ngs/header-top-dock (Act 0: Animated Top Dock Header)
 *
 * ThreeUI Command Bar Dock featuring:
 * - Dynamic WordPress Menu integration (top_dock_menu location + fallback)
 * - Automatic parent/child dropdown hierarchy generation
 * - Spring-damping magnification physics
 * - Integrated in-tab micro chevron indicators
 * - Warm glassmorphic physics dropdown panels with hover-intent & keyboard dismiss
 * - Three-column layout: Brand Left, Magnification Dock Center, Actions Right
 *
 * @package CAS_NGS_Biotech_Blocks
 * @version 1.4.0
 */

if ( ! defined( 'ABSPATH' ) ) {
  exit;
}

// Mark as rendered to prevent duplicate injection
$GLOBALS['cas_bio_header_rendered'] = true;

$uid = wp_unique_id( 'cas-topdock-' );

$brand_name     = ! empty( $attributes['brand_name'] ) ? $attributes['brand_name'] : 'CAS-NGS';
$brand_url      = ! empty( $attributes['brand_url'] ) ? $attributes['brand_url'] : '/';
$cta_text       = ! empty( $attributes['cta_text'] ) ? $attributes['cta_text'] : 'Request Quote';
$cta_url        = ! empty( $attributes['cta_url'] ) ? $attributes['cta_url'] : '/request-a-quote/';
$signin_text    = ! empty( $attributes['signin_text'] ) ? $attributes['signin_text'] : 'Sign in';
$signin_url     = ! empty( $attributes['signin_url'] ) ? $attributes['signin_url'] : '/login/';
$enable_physics = isset( $attributes['enable_physics'] ) ? (bool) $attributes['enable_physics'] : true;
$enable_aurora  = isset( $attributes['enable_aurora'] ) ? (bool) $attributes['enable_aurora'] : true;

/**
 * Helper: Icon for menu tabs based on title or slug
 */
if ( ! function_exists( 'cas_bio_get_tab_icon_svg' ) ) {
  function cas_bio_get_tab_icon_svg( $title ) {
    $t = strtolower( trim( $title ) );
    if ( strpos( $t, 'product' ) !== false || strpos( $t, 'device' ) !== false || strpos( $t, 'hardware' ) !== false ) {
      return '<svg viewBox="0 0 16 16"><path d="M8 1.9 14.1 5v6L8 14.1 1.9 11V5z" /><path d="M1.9 5 8 8.1 14.1 5M8 8.1v6" /></svg>';
    }
    if ( strpos( $t, 'solution' ) !== false || strpos( $t, 'service' ) !== false || strpos( $t, 'platform' ) !== false ) {
      return '<svg viewBox="0 0 16 16"><path d="M8 1.9 14.4 5.6 8 9.3 1.6 5.6z" /><path d="m2.6 8 5.4 3.1L13.4 8M2.6 10.7 8 13.8l5.4-3.1" /></svg>';
    }
    if ( strpos( $t, 'doc' ) !== false || strpos( $t, 'guide' ) !== false || strpos( $t, 'api' ) !== false || strpos( $t, 'blog' ) !== false ) {
      return '<svg viewBox="0 0 16 16"><path d="M3.4 2.4h5.4l3.8 3.8v7.4H3.4z" /><path d="M8.8 2.4v3.8h3.8M5.9 9h4.2M5.9 11.2h3" /></svg>';
    }
    if ( strpos( $t, 'price' ) !== false || strpos( $t, 'cost' ) !== false || strpos( $t, 'plan' ) !== false ) {
      return '<svg viewBox="0 0 16 16"><path d="M8.6 2.2H13v4.4l-6.6 6.6a1.2 1.2 0 0 1-1.7 0L2.2 10.5a1.2 1.2 0 0 1 0-1.7z" /><circle cx="10.6" cy="4.6" r=".9" /></svg>';
    }
    if ( strpos( $t, 'change' ) !== false || strpos( $t, 'milestone' ) !== false || strpos( $t, 'update' ) !== false || strpos( $t, 'news' ) !== false ) {
      return '<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="5.9" /><path d="M8 4.6V8l2.4 1.5" /></svg>';
    }
    if ( strpos( $t, 'team' ) !== false || strpos( $t, 'about' ) !== false || strpos( $t, 'company' ) !== false ) {
      return '<svg viewBox="0 0 16 16"><circle cx="8" cy="5" r="3"/><path d="M2.5 14c0-3 2.5-5 5.5-5s5.5 2 5.5 5"/></svg>';
    }
    return '<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="4.5"/></svg>';
  }
}

/**
 * Helper: Emoji icon for dropdown card
 */
if ( ! function_exists( 'cas_bio_get_card_icon_emoji' ) ) {
  function cas_bio_get_card_icon_emoji( $title ) {
    $t = strtolower( trim( $title ) );
    if ( strpos( $t, 'promethion' ) !== false || strpos( $t, 'micro' ) !== false ) return '🔬';
    if ( strpos( $t, 'minion' ) !== false || strpos( $t, 'port' ) !== false || strpos( $t, 'fast' ) !== false ) return '⚡';
    if ( strpos( $t, 'flow' ) !== false || strpos( $t, 'cell' ) !== false || strpos( $t, 'chem' ) !== false ) return '🧬';
    if ( strpos( $t, 'rna' ) !== false || strpos( $t, 'transcript' ) !== false ) return '〰️';
    if ( strpos( $t, 'genome' ) !== false || strpos( $t, 'wgs' ) !== false || strpos( $t, 'dna' ) !== false ) return '🧬';
    if ( strpos( $t, 'pathogen' ) !== false || strpos( $t, 'microb' ) !== false || strpos( $t, 'meta' ) !== false ) return '🦠';
    if ( strpos( $t, 'gpu' ) !== false || strpos( $t, 'dorado' ) !== false || strpos( $t, 'compute' ) !== false ) return '💻';
    if ( strpos( $t, 'wet lab' ) !== false || strpos( $t, 'train' ) !== false || strpos( $t, 'cert' ) !== false ) return '🧪';
    return '⚡';
  }
}

// 1. Retrieve Dynamic Menu Items
$nav_menu_items = array();
$locations      = get_nav_menu_locations();

if ( ! empty( $locations['top_dock_menu'] ) ) {
  $menu_obj = wp_get_nav_menu_object( $locations['top_dock_menu'] );
  if ( $menu_obj ) {
    $nav_menu_items = wp_get_nav_menu_items( $menu_obj->term_id );
  }
}

// Fallback search: Check if a menu named 'Top Dock' or 'Primary' exists
if ( empty( $nav_menu_items ) ) {
  $all_menus = wp_get_nav_menus();
  if ( ! empty( $all_menus ) ) {
    foreach ( $all_menus as $m ) {
      if ( in_array( strtolower( $m->name ), array( 'top dock header navigation', 'top dock', 'primary navigation', 'primary', 'main menu', 'header' ), true ) ) {
        $nav_menu_items = wp_get_nav_menu_items( $m->term_id );
        if ( ! empty( $nav_menu_items ) ) {
          break;
        }
      }
    }
  }
}

// Build hierarchical structure if menu items were found
$menu_hierarchy = array();
if ( ! empty( $nav_menu_items ) ) {
  $indexed = array();
  foreach ( $nav_menu_items as $item ) {
    $indexed[ $item->ID ] = array(
      'id'          => $item->ID,
      'title'       => $item->title,
      'url'         => $item->url,
      'description' => $item->description,
      'parent'      => (int) $item->menu_item_parent,
      'children'    => array(),
    );
  }
  foreach ( $indexed as $id => $entry ) {
    if ( $entry['parent'] > 0 && isset( $indexed[ $entry['parent'] ] ) ) {
      $indexed[ $entry['parent'] ]['children'][] = $entry;
    } elseif ( $entry['parent'] === 0 ) {
      $menu_hierarchy[] = &$indexed[ $id ];
    }
  }
}
?>
<script>(function(){if(typeof document!=='undefined'&&document.body){document.body.classList.add('cas-has-top-dock');}})();</script>
<header class="animated-top-dock-component atd-modern cas-header-dock-wrap" id="<?php echo esc_attr( $uid ); ?>" data-cas-dock-wrapper="true">
  <?php if ( $enable_aurora ) : ?>
    <div class="atd-modern__aurora" aria-hidden="true"></div>
  <?php endif; ?>

  <div class="atd-modern__bar" data-cas-dock-bar="true">
    <!-- LEFT: Brand Logo & Wordmark -->
    <a class="atd-modern__brand" href="<?php echo esc_url( $brand_url ); ?>" aria-label="<?php echo esc_attr( $brand_name ); ?> Home">
      <span class="atd-modern__mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
          <rect width="24" height="24" rx="4.5" fill="#6e543e" />
          <path d="M6 6h8.6L18 9.35v8.15H9.15L6 14.35V6Z" fill="#ede0d4" />
          <path d="M9 9h5.15L15 9.85V15H9.85L9 14.15V9Z" fill="#6e543e" />
          <path d="M12 9v6M9 12h6" stroke="#ede0d4" stroke-width=".7" />
        </svg>
      </span>
      <span class="atd-modern__word"><?php echo esc_html( $brand_name ); ?></span>
    </a>

    <!-- CENTER: Magnification Dock Navigation -->
    <nav class="atd-modern__dock" data-cas-dock-nav="true" data-dock-state="idle" data-dock-max="0.00" aria-label="<?php esc_attr_e( 'Primary Navigation', 'cas-ngs-biotech-blocks' ); ?>">

      <?php if ( ! empty( $menu_hierarchy ) ) : ?>
        <!-- DYNAMIC WORDPRESS MENU (top_dock_menu) -->
        <?php foreach ( $menu_hierarchy as $tab_idx => $tab ) :
          $has_children = ! empty( $tab['children'] );
          $tab_uid = $uid . '-btn-' . $tab_idx;
        ?>
          <div class="atd-tab-wrapper" <?php echo $has_children ? 'data-has-dropdown="true"' : ''; ?>>
            <?php if ( $has_children ) : ?>
              <button class="atd-modern__item" data-dock-item type="button" aria-haspopup="true" aria-expanded="false" id="<?php echo esc_attr( $tab_uid ); ?>">
                <span class="atd-modern__icon" aria-hidden="true">
                  <?php echo cas_bio_get_tab_icon_svg( $tab['title'] ); ?>
                </span>
                <span><?php echo esc_html( $tab['title'] ); ?></span>
                <svg class="atd-dropdown-chevron" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
                  <path d="M2.5 3.5L5 6L7.5 3.5" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>

              <div class="atd-dropdown-panel" role="region" aria-label="<?php echo esc_attr( $tab['title'] . ' Submenu' ); ?>" aria-labelledby="<?php echo esc_attr( $tab_uid ); ?>">
                <div class="atd-dropdown-grid">
                  <?php foreach ( $tab['children'] as $child ) :
                    $clean_title = $child['title'];
                    $badge = '';
                    if ( preg_match( '/\[(.*?)\]/', $child['title'], $matches ) ) {
                      $badge = $matches[1];
                      $clean_title = trim( str_replace( $matches[0], '', $child['title'] ) );
                    }
                  ?>
                    <a href="<?php echo esc_url( $child['url'] ); ?>" class="atd-dropdown-card">
                      <span class="atd-card-icon" aria-hidden="true"><?php echo cas_bio_get_card_icon_emoji( $clean_title ); ?></span>
                      <div class="atd-card-content">
                        <div class="atd-card-title">
                          <?php echo esc_html( $clean_title ); ?>
                          <?php if ( ! empty( $badge ) ) : ?>
                            <span class="atd-tag-badge"><?php echo esc_html( $badge ); ?></span>
                          <?php endif; ?>
                        </div>
                        <?php if ( ! empty( $child['description'] ) ) : ?>
                          <div class="atd-card-desc"><?php echo esc_html( $child['description'] ); ?></div>
                        <?php endif; ?>
                      </div>
                    </a>
                  <?php endforeach; ?>
                </div>
              </div>
            <?php else : ?>
              <a class="atd-modern__item" data-dock-item href="<?php echo esc_url( $tab['url'] ); ?>">
                <span class="atd-modern__icon" aria-hidden="true">
                  <?php echo cas_bio_get_tab_icon_svg( $tab['title'] ); ?>
                </span>
                <span><?php echo esc_html( $tab['title'] ); ?></span>
              </a>
            <?php endif; ?>
          </div>
        <?php endforeach; ?>

      <?php else : ?>
        <!-- FALLBACK DEFAULT RICH NAVIGATION (Zero-breakage out-of-the-box) -->
        <!-- Tab 1: Product -->
        <div class="atd-tab-wrapper" data-has-dropdown="true">
          <button class="atd-modern__item" data-dock-item type="button" aria-haspopup="true" aria-expanded="false" id="<?php echo esc_attr( $uid ); ?>-btn-product">
            <span class="atd-modern__icon" aria-hidden="true">
              <svg viewBox="0 0 16 16"><path d="M8 1.9 14.1 5v6L8 14.1 1.9 11V5z" /><path d="M1.9 5 8 8.1 14.1 5M8 8.1v6" /></svg>
            </span>
            <span><?php esc_html_e( 'Product', 'cas-ngs-biotech-blocks' ); ?></span>
            <svg class="atd-dropdown-chevron" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
              <path d="M2.5 3.5L5 6L7.5 3.5" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>

          <div class="atd-dropdown-panel" role="region" aria-label="<?php esc_attr_e( 'Product Submenu', 'cas-ngs-biotech-blocks' ); ?>" aria-labelledby="<?php echo esc_attr( $uid ); ?>-btn-product">
            <div class="atd-dropdown-grid">
              <a href="/promethion/" class="atd-dropdown-card">
                <span class="atd-card-icon" aria-hidden="true">🔬</span>
                <div class="atd-card-content">
                  <div class="atd-card-title">PromethION 24 <span class="atd-tag-badge">Q20+</span></div>
                  <div class="atd-card-desc"><?php esc_html_e( 'High-throughput benchtop runs with up to 48 Tb raw yield.', 'cas-ngs-biotech-blocks' ); ?></div>
                </div>
              </a>
              <a href="/minion/" class="atd-dropdown-card">
                <span class="atd-card-icon" aria-hidden="true">⚡</span>
                <div class="atd-card-content">
                  <div class="atd-card-title">MinION Mk1D Portable</div>
                  <div class="atd-card-desc"><?php esc_html_e( 'Pocket real-time sequencer for rapid field genomics.', 'cas-ngs-biotech-blocks' ); ?></div>
                </div>
              </a>
              <a href="/chemistry/" class="atd-dropdown-card">
                <span class="atd-card-icon" aria-hidden="true">🧬</span>
                <div class="atd-card-content">
                  <div class="atd-card-title">R10.4.1 Flow Cells <span class="atd-tag-badge">99.9%</span></div>
                  <div class="atd-card-desc"><?php esc_html_e( 'Dual-reader pore chemistry for high-accuracy consensus.', 'cas-ngs-biotech-blocks' ); ?></div>
                </div>
              </a>
              <a href="/direct-rna/" class="atd-dropdown-card">
                <span class="atd-card-icon" aria-hidden="true">〰️</span>
                <div class="atd-card-content">
                  <div class="atd-card-title">Direct RNA Sequencing</div>
                  <div class="atd-card-desc"><?php esc_html_e( 'Native base modification detection without PCR bias.', 'cas-ngs-biotech-blocks' ); ?></div>
                </div>
              </a>
            </div>
          </div>
        </div>

        <!-- Tab 2: Solutions -->
        <div class="atd-tab-wrapper" data-has-dropdown="true">
          <button class="atd-modern__item" data-dock-item type="button" aria-haspopup="true" aria-expanded="false" id="<?php echo esc_attr( $uid ); ?>-btn-solutions">
            <span class="atd-modern__icon" aria-hidden="true">
              <svg viewBox="0 0 16 16"><path d="M8 1.9 14.4 5.6 8 9.3 1.6 5.6z" /><path d="m2.6 8 5.4 3.1L13.4 8M2.6 10.7 8 13.8l5.4-3.1" /></svg>
            </span>
            <span><?php esc_html_e( 'Solutions', 'cas-ngs-biotech-blocks' ); ?></span>
            <svg class="atd-dropdown-chevron" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
              <path d="M2.5 3.5L5 6L7.5 3.5" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>

          <div class="atd-dropdown-panel" role="region" aria-label="<?php esc_attr_e( 'Solutions Submenu', 'cas-ngs-biotech-blocks' ); ?>" aria-labelledby="<?php echo esc_attr( $uid ); ?>-btn-solutions">
            <div class="atd-dropdown-grid">
              <a href="/human-wgs/" class="atd-dropdown-card">
                <span class="atd-card-icon" aria-hidden="true">🧬</span>
                <div class="atd-card-content">
                  <div class="atd-card-title">Human Whole Genome <span class="atd-tag-badge">SV + Phasing</span></div>
                  <div class="atd-card-desc"><?php esc_html_e( 'Structural variants, repeat expansions & 5mC/5hmC methylation.', 'cas-ngs-biotech-blocks' ); ?></div>
                </div>
              </a>
              <a href="/metagenomics/" class="atd-dropdown-card">
                <span class="atd-card-icon" aria-hidden="true">🦠</span>
                <div class="atd-card-content">
                  <div class="atd-card-title">Microbial Metagenomics</div>
                  <div class="atd-card-desc"><?php esc_html_e( 'Real-time pathogen identification and AMR gene tracking.', 'cas-ngs-biotech-blocks' ); ?></div>
                </div>
              </a>
              <a href="/dorado-compute/" class="atd-dropdown-card">
                <span class="atd-card-icon" aria-hidden="true">💻</span>
                <div class="atd-card-content">
                  <div class="atd-card-title">Dorado GPU Basecalling <span class="atd-tag-badge">SUP Model</span></div>
                  <div class="atd-card-desc"><?php esc_html_e( 'Simultaneous basecalling and modification detection.', 'cas-ngs-biotech-blocks' ); ?></div>
                </div>
              </a>
              <a href="/wet-lab-training/" class="atd-dropdown-card">
                <span class="atd-card-icon" aria-hidden="true">🧪</span>
                <div class="atd-card-content">
                  <div class="atd-card-title">Wet Lab Capacity Building</div>
                  <div class="atd-card-desc"><?php esc_html_e( 'Hands-on library prep protocols and sequencing certification.', 'cas-ngs-biotech-blocks' ); ?></div>
                </div>
              </a>
            </div>
          </div>
        </div>

        <!-- Tab 3: Docs -->
        <div class="atd-tab-wrapper">
          <a class="atd-modern__item" data-dock-item href="/docs/">
            <span class="atd-modern__icon" aria-hidden="true">
              <svg viewBox="0 0 16 16"><path d="M3.4 2.4h5.4l3.8 3.8v7.4H3.4z" /><path d="M8.8 2.4v3.8h3.8M5.9 9h4.2M5.9 11.2h3" /></svg>
            </span>
            <span><?php esc_html_e( 'Docs', 'cas-ngs-biotech-blocks' ); ?></span>
          </a>
        </div>

        <!-- Tab 4: Pricing -->
        <div class="atd-tab-wrapper">
          <a class="atd-modern__item" data-dock-item href="/services/">
            <span class="atd-modern__icon" aria-hidden="true">
              <svg viewBox="0 0 16 16"><path d="M8.6 2.2H13v4.4l-6.6 6.6a1.2 1.2 0 0 1-1.7 0L2.2 10.5a1.2 1.2 0 0 1 0-1.7z" /><circle cx="10.6" cy="4.6" r=".9" /></svg>
            </span>
            <span><?php esc_html_e( 'Pricing', 'cas-ngs-biotech-blocks' ); ?></span>
          </a>
        </div>

        <!-- Tab 5: Changelog -->
        <div class="atd-tab-wrapper">
          <a class="atd-modern__item" data-dock-item href="/milestone-achieved/">
            <span class="atd-modern__icon" aria-hidden="true">
              <svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="5.9" /><path d="M8 4.6V8l2.4 1.5" /></svg>
            </span>
            <span><?php esc_html_e( 'Changelog', 'cas-ngs-biotech-blocks' ); ?></span>
          </a>
        </div>
      <?php endif; ?>

    </nav>

    <!-- RIGHT: Actions -->
    <div class="atd-modern__actions">
      <a class="atd-modern__ghost" href="<?php echo esc_url( $signin_url ); ?>"><?php echo esc_html( $signin_text ); ?></a>
      <a class="atd-modern__cta" href="<?php echo esc_url( $cta_url ); ?>">
        <span><?php echo esc_html( $cta_text ); ?></span>
        <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.2 8h9.1M8.6 4.3 12.4 8l-3.8 3.7" /></svg>
      </a>
    </div>

  </div>
</header>
