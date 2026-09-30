/*!
 * CAS-NGS CORE SUITE — block editor registrations (v2.0 · no build step)
 *
 * · cas-ngs/header — STATIC, fully editable in the visual editor:
 *     – site icon (media library) + company wordmark
 *     – unlimited tabs: label, link, active state
 *     – unlimited dropdown children per tab: label, link, caption
 *     – CTA button: text + link + show/hide
 *   The saved markup uses the exact classes assets/header-footer.js
 *   animates, so the dock looks and behaves identically to before.
 * · cas-ngs/footer — click-to-edit RichText footer (unchanged).
 */
(function () {
  "use strict";

  var el = wp.element.createElement;
  var Fragment = wp.element.Fragment;
  var registerBlockType = wp.blocks.registerBlockType;
  var __ = wp.i18n.__;

  var RichText = wp.blockEditor.RichText;
  var MediaUpload = wp.blockEditor.MediaUpload;
  var InspectorControls = wp.blockEditor.InspectorControls;
  var useBlockProps = wp.blockEditor.useBlockProps;

  var PanelBody = wp.components.PanelBody;
  var TextControl = wp.components.TextControl;
  var ToggleControl = wp.components.ToggleControl;
  var Button = wp.components.Button;

  /* ── shared SVGs ─────────────────────────────────────────────────────── */

  // Every SVG carries explicit width/height so icons stay correctly sized
  // even before/without the block stylesheet applying in the editor.
  var CHEV = el("svg", { className: "cas-chev", width: "13", height: "13", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" },
    el("path", { d: "m6 9 6 6 6-6" }));

  var ARROW = el("svg", { width: "15", height: "15", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" },
    el("path", { d: "M7 17 17 7" }), el("path", { d: "M9 7h8v8" }));

  var UP = el("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" },
    el("path", { d: "M12 19V5" }), el("path", { d: "m5 12 7-7 7 7" }));

  var MAIL = el("svg", { width: "15", height: "15", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" },
    el("rect", { x: "3.5", y: "5.5", width: "17", height: "13", rx: "3" }),
    el("path", { d: "m4.5 7.5 7.5 5.5 7.5-5.5" }));

  var LEAF = el("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.9", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" },
    el("path", { d: "M5 19C5 10 10 5 19 5c0 9-5 14-14 14Z" }),
    el("path", { d: "M5 19c3-5 6-8 10-10" }));

  /* ════════════════════════════════════════════════════════════════════════
     HEADER
     ════════════════════════════════════════════════════════════════════════ */

  var DEFAULT_TABS = [
    { label: "Home", url: "/", active: true, children: [] },
    {
      label: "Sequencing", url: "", active: false,
      children: [
        { label: "HMW DNA Extraction", url: "/sequencing/hmw-dna", caption: "Ultra-long reads" },
        { label: "Direct RNA-Seq", url: "/sequencing/direct-rna", caption: "No conversion bias" },
        { label: "5mC & 6mA Methylation", url: "/sequencing/methylation", caption: "Native detection" },
        { label: "Adaptive Sampling", url: "/sequencing/adaptive", caption: "Real-time enrichment" }
      ]
    },
    {
      label: "Research", url: "", active: false,
      children: [
        { label: "Nanopore Methods", url: "/research/methods", caption: "Wet-lab protocols" },
        { label: "Open Data", url: "/research/data", caption: "Public runs" }
      ]
    },
    { label: "Training", url: "/training", active: false, children: [] },
    { label: "About", url: "/about", active: false, children: [] }
  ];

  /* ── tab state helpers (immutable updates) ───────────────────────────── */

  function patchTab(att, set, i, patch) {
    set({ tabs: att.tabs.map(function (t, j) { return j === i ? Object.assign({}, t, patch) : t; }) });
  }
  function patchChild(att, set, i, k, patch) {
    patchTab(att, set, i, {
      children: att.tabs[i].children.map(function (c, m) { return m === k ? Object.assign({}, c, patch) : c; })
    });
  }
  function addChild(att, set, i) {
    patchTab(att, set, i, {
      children: att.tabs[i].children.concat([{ label: __("New link", "cas-ngs"), url: "/", caption: "" }])
    });
  }
  function removeChild(att, set, i, k) {
    patchTab(att, set, i, { children: att.tabs[i].children.filter(function (_, m) { return m !== k; }) });
  }
  function addTab(att, set) {
    set({ tabs: att.tabs.concat([{ label: __("New tab", "cas-ngs"), url: "/", active: false, children: [] }]) });
  }
  function removeTab(att, set, i) {
    set({ tabs: att.tabs.filter(function (_, j) { return j !== i; }) });
  }

  /* ── the exact dock markup the engine animates ───────────────────────── */

  function headerMarkup(att) {
    var tabs = (att.tabs || []).filter(function (tab) {
      return !tab || String(tab.label || "").trim().toLowerCase() !== "account";
    });
    if (window.casNgHeaderAccountMenu) {
      tabs = tabs.concat([window.casNgHeaderAccountMenu]);
    }

    var dockItems = tabs.map(function (tab, i) {
      var kids = tab.children || [];
      if (kids.length) {
        var parentClass = "cas-dock-item cas-dock-item--parent" + (tab.active ? " is-active" : "");
        return el("div", { className: "cas-dock-group", key: "g" + i },
          el("div", { className: parentClass },
            el("a", {
              className: "cas-dock-parent__link",
              href: tab.url || "#",
              "aria-current": tab.active ? "page" : undefined
            }, el("span", null, tab.label)),
            el("button", {
              type: "button",
              className: "cas-dock-toggle",
              "data-cas-toggle": "1",
              "aria-label": __("Toggle submenu for", "cas-ngs") + " " + tab.label,
              "aria-haspopup": "true",
              "aria-expanded": "false"
            }, CHEV)
          ),
          el("div", { className: "cas-dropdown", "data-cas-dropdown": "1" },
            kids.map(function (kid, k) {
              return el("a", { className: "cas-dropdown__link", href: kid.url || "#", key: "l" + k },
                el("span", null, kid.label),
                el("small", null, kid.caption || ""));
            })
          )
        );
      }
      return el("a", {
        className: "cas-dock-item" + (tab.active ? " is-active" : ""),
        href: tab.url || "#",
        key: "i" + i,
        "aria-current": tab.active ? "page" : undefined
      }, el("span", null, tab.label));
    });

    var mobileItems = tabs.map(function (tab, i) {
      var kids = tab.children || [];
      if (kids.length) {
        return el("div", { className: "cas-m-group", key: "mg" + i },
          el("div", { className: "cas-m-parent" },
            el("a", {
              className: "cas-m-item cas-m-item--parent",
              href: tab.url || "#",
              "aria-current": tab.active ? "page" : undefined
            }, el("span", null, tab.label)),
            el("button", {
              type: "button",
              className: "cas-m-toggle",
              "data-cas-m-toggle": "1",
              "aria-label": __("Toggle submenu for", "cas-ngs") + " " + tab.label,
              "aria-expanded": "false"
            }, CHEV)
          ),
          el("div", { className: "cas-m-sub" },
            kids.map(function (kid, k) {
              return el("a", { className: "cas-m-sublink", href: kid.url || "#", key: "ml" + k }, kid.label);
            })
          )
        );
      }
      return el("a", { className: "cas-m-item", href: tab.url || "#", key: "mi" + i }, el("span", null, tab.label));
    });

    return [
      el("div", { className: "cas-dock-bar", key: "bar" },
        el("canvas", { className: "cas-dock-canvas", "aria-hidden": "true" }),
        el("a", { className: "cas-dock-brand", href: "/", "aria-label": att.wordmark || "Home" },
          el("span", { className: "cas-dock-logo" },
            att.logoUrl ? el("img", { src: att.logoUrl, alt: "" }) : LEAF),
          att.showWordmark ? el("span", { className: "cas-dock-word" }, att.wordmark) : null
        ),
        el("nav", { className: "cas-dock", "data-cas-dock": "1", "aria-label": "Primary navigation" }, dockItems),
        el("div", { className: "cas-dock-actions" },
          att.showCta && att.ctaText
            ? el("a", { className: "cas-dock-cta", href: att.ctaUrl || "#" }, el("span", null, att.ctaText), ARROW)
            : null,
          el("button", { type: "button", className: "cas-burger", "data-cas-burger": "1", "aria-expanded": "false", "aria-label": "Open menu" },
            el("span", null), el("span", null), el("span", null))
        )
      ),
      el("div", { className: "cas-mobile", "data-cas-mobile": "1", "aria-hidden": "true", key: "mobile" },
        el("nav", { className: "cas-mobile__nav", "aria-label": "Mobile navigation" }, mobileItems),
        att.showCta && att.ctaText
          ? el("a", { className: "cas-dock-cta cas-mobile__cta", href: att.ctaUrl || "#" }, el("span", null, att.ctaText), ARROW)
          : null
      )
    ];
  }

  /* ── sidebar inspector ───────────────────────────────────────────────── */

  var cardStyle = {
    border: "1px solid #d5c7b8",
    background: "#faf5ee",
    borderRadius: "10px",
    padding: "12px",
    marginBottom: "12px"
  };
  var childStyle = {
    border: "1px dashed #d5c7b8",
    borderRadius: "8px",
    padding: "8px 10px",
    marginBottom: "8px"
  };
  var miniBtn = { marginTop: "4px" };

  function headerInspector(att, set) {
    return el(
      InspectorControls,
      null,

      /* Brand */
      el(
        PanelBody,
        { title: __("Brand", "cas-ngs"), initialOpen: true },
        el("div", { style: { marginBottom: "12px" } },
          el("p", { style: { marginBottom: "6px", fontWeight: "600" } }, __("Site icon", "cas-ngs")),
          el("div", { style: { display: "flex", alignItems: "center", gap: "10px" } },
            att.logoUrl
              ? el("img", { src: att.logoUrl, alt: "", style: { display: "block", boxSizing: "border-box", width: "36px", height: "36px", objectFit: "contain", padding: "3px", borderRadius: "10px", background: "#6e543e" } })
              : el("span", { style: { width: "36px", height: "36px", display: "grid", placeItems: "center", borderRadius: "10px", background: "#865438", color: "#ede0d4" } }, LEAF),
            el(MediaUpload, {
              onSelect: function (media) { set({ logoUrl: (media && media.url) || "" }); },
              allowedTypes: ["image"],
              value: att.logoUrl,
              render: function (obj) {
                return el(Button, { onClick: obj.open, variant: "secondary", isSmall: true },
                  att.logoUrl ? __("Replace image", "cas-ngs") : __("Choose image", "cas-ngs"));
              }
            }),
            att.logoUrl
              ? el(Button, {
                  onClick: function () { set({ logoUrl: "" }); },
                  variant: "link",
                  isDestructive: true,
                  isSmall: true
                }, __("Remove", "cas-ngs"))
              : null
          ),
          el("p", { style: { fontSize: "12px", color: "#75604b", marginTop: "6px" } },
            __("Empty = the leaf monogram is used.", "cas-ngs"))
        ),
        el(TextControl, {
          label: __("Company name (wordmark)", "cas-ngs"),
          value: att.wordmark,
          onChange: function (v) { set({ wordmark: v }); }
        }),
        el(ToggleControl, {
          label: __("Show wordmark text", "cas-ngs"),
          checked: !!att.showWordmark,
          onChange: function (v) { set({ showWordmark: v }); }
        })
      ),

      /* Call to action */
      el(
        PanelBody,
        { title: __("CTA button", "cas-ngs"), initialOpen: false },
        el(ToggleControl, {
          label: __("Show button", "cas-ngs"),
          checked: !!att.showCta,
          onChange: function (v) { set({ showCta: v }); }
        }),
        el(TextControl, {
          label: __("Button text", "cas-ngs"),
          value: att.ctaText,
          onChange: function (v) { set({ ctaText: v }); }
        }),
        el(TextControl, {
          label: __("Button link", "cas-ngs"),
          value: att.ctaUrl,
          onChange: function (v) { set({ ctaUrl: v }); }
        })
      ),

      /* Tabs + dropdowns */
      el(
        PanelBody,
        { title: __("Tabs & dropdowns", "cas-ngs"), initialOpen: true },
        att.tabs.map(function (tab, i) {
          return el("div", { style: cardStyle, key: "tab" + i },
            el("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" } },
              el("strong", { style: { fontSize: "13px" } }, __("Tab", "cas-ngs") + " " + (i + 1) + (tab.label ? " — " + tab.label : "")),
              el(Button, { onClick: function () { removeTab(att, set, i); }, isDestructive: true, variant: "link", isSmall: true },
                __("Remove tab", "cas-ngs"))
            ),
            el(TextControl, {
              label: __("Label", "cas-ngs"),
              value: tab.label,
              onChange: function (v) { patchTab(att, set, i, { label: v }); }
            }),
            el(TextControl, {
              label: __("Link", "cas-ngs"),
              value: tab.url,
              onChange: function (v) { patchTab(att, set, i, { url: v }); }
            }),
            el(ToggleControl, {
              label: __("Highlighted as current page", "cas-ngs"),
              checked: !!tab.active,
              onChange: function (v) { patchTab(att, set, i, { active: v }); }
            }),

            /* children */
            el("p", { style: { fontWeight: "600", fontSize: "12px", margin: "8px 0 6px" } },
              __("Dropdown links", "cas-ngs") + " (" + tab.children.length + ")"),
            tab.children.map(function (kid, k) {
              return el("div", { style: childStyle, key: "kid" + k },
                el(TextControl, {
                  label: __("Label", "cas-ngs"),
                  value: kid.label,
                  onChange: function (v) { patchChild(att, set, i, k, { label: v }); }
                }),
                el(TextControl, {
                  label: __("Link", "cas-ngs"),
                  value: kid.url,
                  onChange: function (v) { patchChild(att, set, i, k, { url: v }); }
                }),
                el(TextControl, {
                  label: __("Caption (small line)", "cas-ngs"),
                  value: kid.caption || "",
                  onChange: function (v) { patchChild(att, set, i, k, { caption: v }); }
                }),
                el(Button, { onClick: function () { removeChild(att, set, i, k); }, isDestructive: true, variant: "link", isSmall: true, style: miniBtn },
                  __("Remove link", "cas-ngs"))
              );
            }),
            el(Button, { onClick: function () { addChild(att, set, i); }, variant: "secondary", isSmall: true, style: miniBtn },
              __("Add dropdown link", "cas-ngs"))
          );
        }),
        el(Button, { onClick: function () { addTab(att, set); }, variant: "primary" },
          __("Add tab", "cas-ngs"))
      )
    );
  }

  registerBlockType("cas-ngs/header", {
    apiVersion: 2,
    title: __("CAS-NGS Top Dock Header", "cas-ngs"),
    description: __(
      "Floating glass command-bar navigation: spring-proximity dock, dropdown submenus, mobile drawer. Every part is editable in the sidebar.",
      "cas-ngs"
    ),
    category: "cas-ngs-suite",
    keywords: ["header", "navigation", "menu", "dock"],
    icon: el("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.7", strokeLinecap: "round" },
      el("rect", { x: "3", y: "8", width: "18", height: "8", rx: "4" }),
      el("path", { d: "M7 12h.01" }), el("path", { d: "M11 12h.01" }), el("path", { d: "M15 12h2" })),
    supports: { align: ["wide", "full"], multiple: false },
    attributes: {
      logoUrl: { type: "string", default: "" },
      wordmark: { type: "string", default: "CAS-NGS" },
      showWordmark: { type: "boolean", default: true },
      showCta: { type: "boolean", default: true },
      ctaText: { type: "string", default: "Request a Run" },
      ctaUrl: { type: "string", default: "/contact" },
      tabs: { type: "array", default: DEFAULT_TABS }
    },

    edit: function (props) {
      var att = props.attributes;
      var set = props.setAttributes;
      var blockProps = useBlockProps();

      return el(
        Fragment,
        null,
        headerInspector(att, set),
        el(
          "header",
          Object.assign({}, blockProps, {
            className: (blockProps.className ? blockProps.className + " " : "") + "cas-header",
            "data-cas-header": "1"
          }),
          headerMarkup(att)
        )
      );
    },

    /* Dynamic block: PHP renders it from the attributes on every request
       (cas_ngs_header_render_callback). A void pattern comment is always
       valid, so template parts and patterns in block themes — Twenty
       Twenty-Five included — never hit block-validation errors. The
       editor preview above stays live and instant. */
    save: function () {
      return null;
    }
  });

  /* ════════════════════════════════════════════════════════════════════════
     FOOTER (unchanged click-to-edit block)
     ════════════════════════════════════════════════════════════════════════ */

  var FOOTER_DEFAULTS = {
    title: "Sylva Labs",
    description: "Field genomics for wild places — portable nanopore sequencing, moss-barcode surveys and the software that turns raw squiggles into living maps.",
    email: "hello@sylvalabs.earth",
    ctaText: "Book a sequencing run",
    ctaUrl: "/contact",
    col1Title: "Pages",
    col1Links: '<li><a href="/">Home</a></li><li><a href="/about">About</a></li><li><a href="/journal">Journal</a></li><li><a href="/contact">Contact</a></li>',
    col2Title: "Research",
    col2Links: '<li><a href="/research/methods">Nanopore methods</a></li><li><a href="/research/protocols">Field protocols</a></li><li><a href="/research/data">Open data</a></li>',
    col3Title: "Connect",
    col3Links: '<li><a href="/careers">Careers</a></li><li><a href="/press">Press kit</a></li><li><a href="/privacy">Privacy</a></li><li><a href="/terms">Terms</a></li>',
    chipText: "Sequencing the wild since 2019",
    copyright: "© 2026 Sylva Labs — grown from raw signal.",
    backToTopText: "Back to top",
    strandOn: true,
    lettersOn: true
  };

  function footerAttrs() {
    var out = {};
    Object.keys(FOOTER_DEFAULTS).forEach(function (k) {
      var v = FOOTER_DEFAULTS[k];
      out[k] = { type: typeof v === "boolean" ? "boolean" : "string", default: v };
    });
    return out;
  }

  function linkColumn(n, att, editing, set) {
    function part(key, tag, cls, ph) {
      if (editing) {
        return el(RichText, {
          tagName: tag,
          multiline: tag === "ul" ? "li" : undefined,
          allowedFormats: tag === "ul" ? ["core/link"] : [],
          className: cls,
          value: att[key],
          placeholder: ph,
          onChange: function (v) { var o = {}; o[key] = v; set(o); }
        });
      }
      return el(tag, { className: cls }, el(RichText.Content, { tagName: tag === "ul" ? "ul" : "span", value: att[key] }));
    }
    return el("div", { className: "cas-fcol", key: "col" + n },
      part("col" + n + "Title", "h3", "cas-fcol__title", __("Column", "cas-ngs")),
      part("col" + n + "Links", "ul", "cas-fcol__list", __("One link per line", "cas-ngs"))
    );
  }

  registerBlockType("cas-ngs/footer", {
    apiVersion: 2,
    title: __("CAS-NGS Sylva Footer", "cas-ngs"),
    description: __(
      "Light-mode footer: waving DNA strands behind a beige card, nanopore sequencing lane, link cards and a live bases-called counter.",
      "cas-ngs"
    ),
    category: "cas-ngs-suite",
    keywords: ["footer", "dna", "nanopore"],
    icon: el("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.7", strokeLinecap: "round" },
      el("path", { d: "M7 3c0 5 10 5 10 10s-10 5-10 8" }),
      el("path", { d: "M17 3c0 5-10 5-10 10s10 5 10 8" }),
      el("path", { d: "M9 7h6" }), el("path", { d: "M9 17h6" })),
    supports: { align: ["wide", "full"] },
    attributes: footerAttrs(),

    edit: function (props) {
      var att = props.attributes;
      var set = props.setAttributes;
      var blockProps = useBlockProps();

      return el(
        Fragment,
        null,
        el(
          InspectorControls,
          null,
          el(
            PanelBody,
            { title: __("Contact", "cas-ngs"), initialOpen: true },
            el(TextControl, { label: __("Email", "cas-ngs"), value: att.email, onChange: function (v) { set({ email: v }); } }),
            el(TextControl, { label: __("Button URL", "cas-ngs"), value: att.ctaUrl, onChange: function (v) { set({ ctaUrl: v }); } })
          ),
          el(
            PanelBody,
            { title: __("Animation", "cas-ngs"), initialOpen: false },
            el(ToggleControl, { label: __("Waving DNA strands", "cas-ngs"), checked: !!att.strandOn, onChange: function (v) { set({ strandOn: v }); } }),
            el(ToggleControl, { label: __("Base-call letters in the lane", "cas-ngs"), checked: !!att.lettersOn, onChange: function (v) { set({ lettersOn: v }); } })
          )
        ),
        el(
          "footer",
          Object.assign({}, blockProps, {
            className: (blockProps.className ? blockProps.className + " " : "") + "cas-footer",
            "data-cas-wave": att.strandOn ? "on" : "off",
            "data-cas-letters": att.lettersOn ? "on" : "off"
          }),
          el("div", { className: "cas-footer__card" },
            el("div", { className: "cas-footer__grid" },
              el("div", null,
                el("div", { className: "cas-footer__brand-row" },
                  el("span", { className: "cas-footer__logo" }, LEAF),
                  el(RichText, { tagName: "h2", className: "cas-footer__title", value: att.title, allowedFormats: [], placeholder: __("Site title", "cas-ngs"), onChange: function (v) { set({ title: v }); } })
                ),
                el(RichText, { tagName: "p", className: "cas-footer__desc", value: att.description, placeholder: __("Short description", "cas-ngs"), onChange: function (v) { set({ description: v }); } }),
                el("a", { className: "cas-footer__mail", href: "mailto:" + att.email }, MAIL, el("span", null, att.email)),
                el("div", { className: "cas-footer__actions" },
                  el("span", { className: "cas-btn", style: { cursor: "text" } },
                    el(RichText, { tagName: "span", value: att.ctaText, allowedFormats: [], placeholder: __("Button", "cas-ngs"), onChange: function (v) { set({ ctaText: v }); } }),
                    ARROW)
                )
              ),
              el("div", { className: "cas-footer__cols" },
                linkColumn(1, att, true, set),
                linkColumn(2, att, true, set),
                linkColumn(3, att, true, set)
              )
            ),
            el("div", { className: "cas-footer__lane cas-footer__lane--placeholder" },
              __("Nanopore lane animates on the published page", "cas-ngs")),
            el("div", { className: "cas-footer__base" },
              el(RichText, { tagName: "p", className: "cas-footer__copy", value: att.copyright, placeholder: __("Copyright", "cas-ngs"), onChange: function (v) { set({ copyright: v }); } }),
              el("span", { className: "cas-footer__chip" },
                el("span", { className: "dot", "aria-hidden": "true" }),
                el(RichText, { tagName: "span", value: att.chipText, allowedFormats: [], placeholder: __("Chip text", "cas-ngs"), onChange: function (v) { set({ chipText: v }); } }),
                " · ", el("span", null, "1,427"), " ", __("bases", "cas-ngs")
              ),
              el("span", { className: "cas-btn cas-footer__top" }, att.backToTopText, UP)
            )
          )
        )
      );
    },

    save: function (props) {
      var att = props.attributes;
      var blockProps = useBlockProps.save();

      return el(
        "footer",
        Object.assign({}, blockProps, {
          className: (blockProps.className ? blockProps.className + " " : "") + "cas-footer",
          "data-cas-wave": att.strandOn ? "on" : "off",
          "data-cas-letters": att.lettersOn ? "on" : "off"
        }),
        el("div", { className: "cas-footer__wave", "aria-hidden": "true" }, el("canvas", null)),
        el("div", { className: "cas-footer__card" },
          el("div", { className: "cas-footer__grid" },
            el("div", null,
              el("div", { className: "cas-footer__brand-row" },
                el("span", { className: "cas-footer__logo" }, LEAF),
                el("h2", { className: "cas-footer__title" }, el(RichText.Content, { tagName: "span", value: att.title }))
              ),
              att.description && el("p", { className: "cas-footer__desc" }, el(RichText.Content, { tagName: "span", value: att.description })),
              att.email && el("a", { className: "cas-footer__mail", href: "mailto:" + att.email }, MAIL, el("span", null, att.email)),
              att.ctaText && el("div", { className: "cas-footer__actions" },
                el("a", { className: "cas-btn", href: att.ctaUrl || "#" },
                  el(RichText.Content, { tagName: "span", value: att.ctaText }), ARROW))
            ),
            el("div", { className: "cas-footer__cols" },
              linkColumn(1, att, false, null),
              linkColumn(2, att, false, null),
              linkColumn(3, att, false, null)
            )
          ),
          el("div", { className: "cas-footer__lane" },
            el("span", { className: "cas-footer__lane-tag" }, __("Nanopore · raw signal", "cas-ngs")),
            el("span", { className: "cas-footer__lane-rate" }, __("450 b/s", "cas-ngs")),
            el("canvas", null)
          ),
          el("div", { className: "cas-footer__base" },
            el("p", { className: "cas-footer__copy" }, el(RichText.Content, { tagName: "span", value: att.copyright })),
            el("span", { className: "cas-footer__chip" },
              el("span", { className: "dot", "aria-hidden": "true" }),
              el(RichText.Content, { tagName: "span", value: att.chipText }),
              " · ", el("span", { "data-cas-bases": "1" }, "1,427"), " ", __("bases", "cas-ngs")
            ),
            el("button", { type: "button", className: "cas-btn cas-footer__top", "data-cas-top": "1" },
              att.backToTopText, UP)
          )
        )
      );
    }
  });
})();
