<?php

/**
 * CAS-NGS – Header Account Menu
 */
/**
 * CAS-NGS – Dynamic Header Account Menu
 */

function casngs_header_account_menu() {

    $login_url     = home_url('/login/');
    $register_url  = home_url('/register/');
    $account_url   = home_url('/account/');
    $dashboard_url = home_url('/author-dashboard/');
    $logout_url    = home_url('/logout/');

    ob_start();
    ?>

    <div class="casngs-account-menu">

        <button
            type="button"
            class="casngs-account-button"
            aria-expanded="false"
            aria-haspopup="true"
        >
            <span>Account</span>
            <span class="casngs-account-arrow">▾</span>
        </button>

        <div class="casngs-account-dropdown">

            <?php if ( is_user_logged_in() ) : ?>

                <?php
                $current_user = wp_get_current_user();

                // Ultimate Member profile URL.
                $profile_url = home_url(
                    '/user/' . rawurlencode( $current_user->user_login ) . '/'
                );
                ?>

                <a href="<?php echo esc_url( $profile_url ); ?>">
                    My Profile
                </a>

                <a href="<?php echo esc_url( $account_url ); ?>">
                    Account
                </a>

                <a href="<?php echo esc_url( $dashboard_url ); ?>">
                    Author Dashboard
                </a>

                <a href="<?php echo esc_url( $logout_url ); ?>">
                    Logout
                </a>

            <?php else : ?>

                <a href="<?php echo esc_url( $login_url ); ?>">
                    Login
                </a>

                <a href="<?php echo esc_url( $register_url ); ?>">
                    Register
                </a>

            <?php endif; ?>

        </div>

    </div>

    <?php
    return ob_get_clean();
}

add_shortcode( 'casngs_account_menu', 'casngs_header_account_menu' );


/**
 * CAS-NGS – Account Menu Styling
 */

function casngs_account_menu_styles() {
    ?>
    <style>

        .casngs-account-menu {
            position: relative;
            display: inline-block;
            width: max-content;
            margin-left: 0;
            flex: 0 0 auto;
        }

        .casngs-account-button {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            border: 0;
            cursor: pointer;
            padding: 10px 10px;
            border-radius: 4px;
            font-size: 14px;
            font-weight: 500;
            line-height: 1;
            background: transparent;
            color: inherit;
        }

        .casngs-account-button:hover {
            opacity: 0.8;
        }

        .casngs-account-arrow {
            font-size: 12px;
            transition: transform 0.2s ease;
        }

        .casngs-account-menu.is-open .casngs-account-arrow {
            transform: rotate(180deg);
        }

        .casngs-account-dropdown {
            position: absolute;
            top: calc(100% + 8px);
            right: 0;
            min-width: 190px;
            padding: 8px 0;
            background: #ffffff;
            border: 1px solid #e5e5e5;
            border-radius: 6px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.12);
            z-index: 99999;

            opacity: 0;
            visibility: hidden;
            transform: translateY(-5px);
            transition: all 0.18s ease;
        }

        .casngs-account-menu.is-open .casngs-account-dropdown {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
        }

        .casngs-account-dropdown a {
            display: block;
            padding: 10px 16px;
            text-decoration: none;
            white-space: nowrap;
            color: #333333;
            font-size: 14px;
        }

        .casngs-account-dropdown a:hover {
            background: #f5f5f5;
        }

        @media (max-width: 767px) {

            .casngs-account-menu {
                margin-left: 0;
            }

            .casngs-account-button {
                padding: 10px 14px;
            }

            .casngs-account-dropdown {
                right: 0;
            }
        }

    </style>
    <?php
}

add_action( 'wp_head', 'casngs_account_menu_styles' );


/**
 * CAS-NGS – Account Menu Javascript
 */

function casngs_account_menu_script() {
    ?>
    <script>
    document.addEventListener('DOMContentLoaded', function () {

        const menus = document.querySelectorAll('.casngs-account-menu');

        menus.forEach(function (menu) {

            const button = menu.querySelector('.casngs-account-button');

            if (!button) {
                return;
            }

            button.addEventListener('click', function (event) {

                event.stopPropagation();

                const isOpen = menu.classList.contains('is-open');

                // Close other account menus.
                menus.forEach(function (otherMenu) {
                    otherMenu.classList.remove('is-open');

                    const otherButton =
                        otherMenu.querySelector('.casngs-account-button');

                    if (otherButton) {
                        otherButton.setAttribute('aria-expanded', 'false');
                    }
                });

                if (!isOpen) {
                    menu.classList.add('is-open');
                    button.setAttribute('aria-expanded', 'true');
                }

            });

        });

        // Close when clicking elsewhere.
        document.addEventListener('click', function () {

            menus.forEach(function (menu) {

                menu.classList.remove('is-open');

                const button =
                    menu.querySelector('.casngs-account-button');

                if (button) {
                    button.setAttribute('aria-expanded', 'false');
                }

            });

        });

    });
    </script>
    <?php
}

add_action( 'wp_footer', 'casngs_account_menu_script' );
