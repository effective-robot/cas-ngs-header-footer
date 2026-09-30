# CAS Earth Theme: Live-Site Integration Guide

Use this guide when deploying the standalone `cas-earth-theme` theme to a live WordPress site. The expected result is the original Twenty Twenty-Five layout and styling with the CAS earth palette. Theme files, browser/server caches, Site Editor customizations, and saved page content are separate things; follow the steps in order so the cause stays identifiable.

## 1. Make a Recovery Point

1. Prefer testing on a staging clone of the live site first. If staging is not available, choose a low-traffic maintenance window.
2. Create a full backup of both the WordPress files and database using your host's backup tool. Confirm you know how to restore it.
3. Keep the currently active theme folder and current theme ZIP as a rollback copy. Do not delete the old theme or database records during diagnosis.
4. Record the current active theme and take screenshots of one affected page and the Site Editor styles.

Do not import or replace the live database with the LocalWP database just to deploy the theme. Upload the theme files only.

## 2. Prepare the Theme ZIP

1. Create the ZIP from the `cas-earth-theme` folder in the workspace, not from the repository root and not from the plugin folder.
2. Open the ZIP and confirm its first-level folder is exactly `cas-earth-theme/`. It should contain `style.css`, `theme.json`, `functions.php`, `templates/`, `parts/`, `patterns/`, and `styles/` directly beneath that folder.
3. Confirm `style.css` identifies **CAS Earth Theme**, version **1.0**, and text domain `cas-earth-theme`.
4. Keep the plugin ZIP separate. For the initial theme-only verification, do not install or activate the plugin unless the live page depends on its blocks.

## 3. Install or Replace the Theme

1. In WordPress Admin, open **Appearance > Themes** and confirm the site is using the expected WordPress installation.
2. For a first installation, choose **Add New Theme > Upload Theme**, select the `cas-earth-theme.zip`, install, and activate **CAS Earth Theme**.
3. If `cas-earth-theme` is already installed, use WordPress's **Replace current with uploaded** prompt if it is offered. If it is not offered, use your host's File Manager or SFTP to replace `wp-content/themes/cas-earth-theme/` with the new folder. Keep the backup copy outside `wp-content/themes` so WordPress does not list it as another theme.
4. Do not upload it into a nested path such as `themes/cas-earth-theme/cas-earth-theme/`, and do not leave it under a suffix such as `cas-earth-theme-1` while expecting WordPress to use the original slug.
5. In **Appearance > Themes**, verify that **CAS Earth Theme** is marked Active.

If WP-CLI is available, open the host's WordPress shell or SSH session, change to the live site's `public_html`/document-root directory, and run:

```sh
wp option get stylesheet
wp option get template
wp theme get cas-earth-theme
```

Both option commands should return `cas-earth-theme`. If they do not, stop here and activate the correct theme before clearing or resetting anything.

## 4. Purge Caches in Order

Clear each cache layer that the site actually uses. Host dashboards and cache-plugin labels vary; purge the equivalent page, object, or CDN cache.

1. Purge the WordPress caching plugin's page cache, if one is active.
2. Purge the hosting provider's server/page cache. If the host has a PHP/opcode cache control, purge it or ask the host to do so.
3. Purge the CDN or reverse-proxy cache, if the domain uses one. A CDN purge may take time to propagate.
4. From the WordPress site root, run the following WP-CLI commands if available:

```sh
wp cache flush
wp transient delete --all
```

5. Open the site in a private/incognito window and force-reload: **Ctrl+Shift+R** on Windows/Linux or **Cmd+Shift+R** on macOS. In Chromium browsers, Developer Tools > **Network** > **Disable cache** can help while the tools remain open.

These commands clear cache/transient data; they do not reset templates, global styles, page assignments, or page content. Do not run `wp db reset`, delete database tables, or bulk-delete `wp_template`/`wp_global_styles` records.

## 5. Verify a Clean Theme Page

1. Leave the plugin inactive for this check if no current page requires it. If the plugin is already needed by live pages, do this comparison on staging instead of deactivating it on production.
2. Create a **draft** page with only a heading, paragraph, and button. Use the default page template and preview it.
3. In **Appearance > Editor > Styles**, confirm the page background and palette show the CAS earth colors. Check the global **Elements > Button**, **Link**, and **Heading** colors too.
4. Compare the draft with a normal Twenty Twenty-Five page layout. It should have the original spacing and structure, with palette-colored text, links, and buttons.

If this draft looks correct, the theme package and global palette are working. Move to the existing pages in section 7; do not reset the whole database.

## 6. Reset Saved Site Editor Customizations Only If Needed

Make another backup or use staging before resetting styles or templates.

1. Open **Appearance > Editor > Styles**.
2. Open the **More** menu (three dots) and select **Reset styles** or **Reset to defaults**. Wording varies by WordPress version. Review the confirmation before applying it.
3. Open **Appearance > Editor > Templates**. For a template explicitly marked customized, use its **More > Clear customizations** action. Repeat for customized template parts only if they are also marked customized.
4. Refresh the draft test page and check it again.

This resets saved presentation customizations for the active theme. It is not a cache operation. Do not clear every theme's records or run SQL deletion commands to achieve the same result.

To inspect saved Site Editor records without modifying them, run from the WordPress root:

```sh
wp post list --post_type=wp_template,wp_template_part,wp_global_styles --fields=ID,post_type,post_name,post_status --format=table
```

Review records before taking action. Records and page content are database data, not disposable cache.

## 7. Diagnose Existing Pages That Still Look Squeezed

1. Edit one affected page and inspect the **Template** setting in the page sidebar. If it has an unintended custom template assigned, switch it to **Default** and update the page. Record the old setting first.
2. Inspect the page's block list and block settings for constrained widths, narrow column widths, explicit alignments, padding, or margins. These values are saved with page content and do not get replaced when the theme changes.
3. If the page was created from a full-page pattern, remember that the inserted pattern became the page's own block content. Installing a theme does not replace it with that theme's pattern. Compare with the draft page or restore an appropriate page revision if the old content is not wanted.
4. If the draft is correct but an existing page is wrong, focus on that page's content/template settings, not the theme palette.
5. If the draft is also wrong after cache clearing and style reset, verify the uploaded ZIP and active theme again. In browser Developer Tools > **Network**, inspect the loaded CSS URLs and confirm they come from `/wp-content/themes/cas-earth-theme/`. If the plugin is active, check whether its stylesheets are also loaded.

The CAS-NGS plugin enqueues front-end CSS when active. On staging, compare the test page with the plugin disabled and enabled to identify plugin styling. On production, do not deactivate it if current pages require plugin-rendered blocks; deactivation can hide those blocks even though it does not delete their saved content.

## 8. Completion Checklist

- The active theme directory is `cas-earth-theme`.
- The new ZIP is installed at the correct path, without a nested or suffixed directory.
- WordPress, host, CDN, and browser caches used by the site have been purged.
- A new draft page has been checked independently of existing page content.
- Existing pages have been checked for saved templates, block widths, alignment, and page-specific styling.
- Any Site Editor reset was performed only after a backup and only for reviewed customizations.
- The plugin was tested separately where possible, without interrupting pages that depend on its blocks.