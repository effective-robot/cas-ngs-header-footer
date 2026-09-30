# CAS Earth Theme: LocalWP and WordPress Checks

Use this checklist when CAS Earth Theme does not look like stock Twenty Twenty-Five apart from its colors. Cache clearing can remove stale CSS, but it does not erase page content or Site Editor customizations saved in the database.

## 1. Confirm the Active Theme

In LocalWP, select the site and click **WP Admin**. In WordPress, open **Appearance > Themes** and confirm **CAS Earth Theme** is marked Active.

To verify the active theme directory from LocalWP:

1. Select the site in LocalWP and click **Open Site Shell**.
2. Run:

```sh
wp option get stylesheet
wp option get template
```

Both commands should print `cas-earth-theme`. If either prints another value, activate CAS Earth Theme under **Appearance > Themes**, then check again.

## 2. Clear Local and Browser Caches

1. In LocalWP, click **Stop site**, then **Start site**. This restarts the local web server and PHP process.
2. Open the site in a private/incognito browser window. Or force-reload the page: **Ctrl+Shift+R** on Windows/Linux or **Cmd+Shift+R** on macOS.
3. If using Chrome or Edge, open Developer Tools, select **Network**, enable **Disable cache**, and reload while Developer Tools stays open.
4. If your LocalWP version or an installed caching add-on provides a **Clear cache** control for the site, use it too. LocalWP menus vary by version; stopping and starting the site is the fallback.
5. In the LocalWP Site Shell, flush WordPress's object cache and transients:

```sh
wp cache flush
wp transient delete --all
```

The transient command removes cached temporary values that WordPress and plugins can regenerate. These commands do not reset templates, page settings, or page content. With no caching plugin or persistent object-cache service installed, there may be little or nothing for WordPress to flush.

## 3. Check Saved Site Editor Customizations

WordPress stores Site Editor templates, template parts, and global styles in the database. Theme-specific editor customizations are generally associated with a theme slug, but per-page template selections and page content remain when themes change.

Before resetting anything, make a LocalWP site backup or duplicate the site.

1. Open **Appearance > Editor > Styles**.
2. Open the **More** menu (three dots) and choose **Reset styles** or **Reset to defaults**. The exact label can vary by WordPress version. Confirm only after reviewing the prompt.
3. Open **Appearance > Editor > Templates**. For any template marked customized, open its **More** menu and choose **Clear customizations**. Repeat for customized template parts if necessary.
4. Edit an affected page. In the settings sidebar, inspect **Template**. If the page has an unintended custom template selected, choose **Default** and update the page.

Do not delete database tables, all `wp_template` records, or all `wp_global_styles` records as a cache-clearing step. Those are content/customization data, not cache.

To inspect saved Site Editor records from the Site Shell without changing them:

```sh
wp post list --post_type=wp_template,wp_template_part,wp_global_styles --fields=ID,post_type,post_name,post_status --format=table
```

Names containing `cas-earth-theme` belong to the new theme's saved editor records. Review records before clearing anything.

## 4. Distinguish Theme, Page, and Database Issues

1. Create a **draft** test page with only a heading, paragraph, and button. Preview it with CAS Earth Theme active and the CAS-NGS plugin still inactive.
2. If the draft looks right but an existing page does not, inspect that page's selected template, saved block content, and revisions. Patterns inserted into a page become page content; changing themes does not replace that content with the new theme's pattern.
3. If the draft and existing pages both look stale, repeat the active-theme check and cache steps. Confirm the uploaded theme folder is named `cas-earth-theme` and that its `style.css` reports **Version: 1.0**.
4. If the draft still looks wrong after those checks, compare the page's loaded stylesheets in browser Developer Tools. With the plugin inactive, plugin styles should not be loaded; this helps separate the theme package from database or browser state.

The CAS-NGS plugin is not involved in this LocalWP test if it has not been installed or activated. Cache clearing alone will not make an old page's saved content or custom template adopt a different structure.

## 5. Live-Site Caution

On the live site, make a full files-and-database backup or use staging first. Repeat the theme and cache checks there. Reset only the specific customized styles, templates, or per-page template selections you have reviewed; do not run destructive database cleanup commands to fix a visual mismatch.