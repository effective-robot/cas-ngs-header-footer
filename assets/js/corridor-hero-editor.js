/**
 * Gutenberg editor UI -- cas-ngs/3d-corridor-hero.
 *
 * IMPORTANT: This file is intentionally 100% pure ASCII. Some transfer /
 * install pipelines corrupt non-ASCII bytes (UTF-8 read as Latin-1), which
 * can break the script or block.json on the server. Pure ASCII makes the
 * file immune to that corruption. Do not add non-ASCII characters here.
 *
 * Registration follows the house pattern exactly (see
 * biotech-blocks-editor.js, act1..act4): only the function fields
 * { edit, save } are passed to wp.blocks.registerBlockType. All metadata
 * (title, category, icon, keywords, attributes, supports) lives in the
 * server-side block.json and is merged in by WordPress.
 *
 * Diagnostics: this file logs to the browser console (open DevTools in the
 * block editor). Look for lines starting with "[corridor-editor]".
 *
 * @package CAS_NGS_Biotech_Blocks
 * @version 1.5.7
 */
(function () {
  'use strict';

  var LOG = '[corridor-editor]';
  function info() {
    if (window.console && console.info) {
      console.info.apply(console, [LOG].concat([].slice.call(arguments)));
    }
  }
  function fail() {
    if (window.console && console.error) {
      console.error.apply(console, [LOG].concat([].slice.call(arguments)));
    }
  }

  info('script loaded (v1.8.0, pure-ascii)');

  if (typeof wp === 'undefined' || !wp.blocks || typeof wp.blocks.registerBlockType !== 'function') {
    fail('wp.blocks.registerBlockType is unavailable -- the block cannot be registered in the inserter.');
    return;
  }
  if (window.CasNGSCorridorEditor) {
    info('already ran once -- skipping duplicate load.');
    return;
  }
  window.CasNGSCorridorEditor = { version: '1.8.0' };

  var el                = wp.element.createElement;
  var Fragment          = wp.element.Fragment;
  var blockEditor       = wp.blockEditor || {};
  var components        = wp.components || {};
  var i18n              = wp.i18n || {};

  var InspectorControls = blockEditor.InspectorControls;
  var useBlockProps     = blockEditor.useBlockProps;
  var PanelBody         = components.PanelBody;
  var TextControl       = components.TextControl;
  var TextareaControl   = components.TextareaControl;
  var SelectControl     = components.SelectControl;
  var ToggleControl     = components.ToggleControl;
  var ColorPalette      = components.ColorPalette;
  var RangeControl      = components.RangeControl;
  var __                = (i18n && i18n.__) ? i18n.__ : function (s) { return s; };

  /* Safe color field: passing an undefined component to el() throws (React
     error #130), which is what crashed the "Theme and Model" panel. Prefer
     ColorPalette; fall back to a hex TextControl; if neither exists, render
     nothing rather than crash. */
  function colorField(label, attrKey, attrs, setAttrs) {
    var value = attrs[attrKey] || undefined;
    var onChange = function (v) {
      var patch = {};
      patch[attrKey] = v || '';
      setAttrs(patch);
    };
    if (typeof ColorPalette === 'function') {
      return el('div', { style: { marginBottom: '16px' } },
        el('div', { style: { fontSize: '11px', fontWeight: '500', marginBottom: '8px' } }, label),
        el(ColorPalette, {
          value: value,
          onChange: onChange,
          disableCustomColors: false,
          clearable: true
        })
      );
    }
    if (typeof TextControl === 'function') {
      return el(TextControl, { label: label + ' (hex)', value: attrs[attrKey] || '', onChange: onChange });
    }
    return null;
  }

  /* -- shared editor utilities (mirrors biotech-blocks-editor.js) -- */
  function ctrl(label, attrKey, attrs, setAttrs, type) {
    return el(type || TextControl, {
      label: label,
      value: attrs[attrKey] !== undefined ? attrs[attrKey] : '',
      onChange: function (val) {
        var patch = {};
        patch[attrKey] = val;
        setAttrs(patch);
      }
    });
  }

  function previewField(label, value) {
    return el('div', { style: { marginBottom: '8px' } },
      el('span', {
        style: {
          fontFamily: 'ui-monospace,monospace', fontSize: '0.65rem', letterSpacing: '0.07em',
          color: 'rgba(54,33,21,0.55)', textTransform: 'uppercase', display: 'block', marginBottom: '2px'
        }
      }, label),
      el('span', {
        style: { fontSize: '0.92rem', fontWeight: '600', color: '#362115', display: 'block' }
      }, value || el('em', { style: { opacity: 0.4 } }, '(empty)'))
    );
  }

  function stationPreview(n, attrs) {
    return el('div', {
      style: {
        background: 'rgba(255,255,255,0.7)',
        border: '1px solid rgba(134,84,56,0.18)',
        borderLeft: '3px solid #865438',
        borderRadius: '10px',
        padding: '12px 14px',
        marginBottom: '10px'
      }
    },
      el('div', {
        style: {
          fontFamily: 'ui-monospace,monospace', fontSize: '0.67rem', letterSpacing: '0.08em',
          textTransform: 'uppercase', color: '#865438', marginBottom: '6px'
        }
      }, 'Fig. 0' + n + ' | Station ' + n),
      previewField('Kicker', attrs['station' + n + '_kicker']),
      previewField('Title', attrs['station' + n + '_title']),
      previewField('Description', attrs['station' + n + '_desc']),
      previewField('Badge', attrs['station' + n + '_badge'])
    );
  }

  function editorWrap(children) {
    return el('div', {
      style: {
        background: 'rgba(237,224,212,0.65)',
        border: '1px solid rgba(134,84,56,0.22)',
        borderRadius: '12px',
        padding: '20px 24px'
      }
    },
      el('div', {
        style: {
          display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px',
          paddingBottom: '12px', borderBottom: '1px solid rgba(134,84,56,0.15)', flexWrap: 'wrap'
        }
      },
        el('span', {
          style: {
            fontFamily: 'ui-monospace,monospace', fontSize: '0.72rem', fontWeight: '700',
            letterSpacing: '0.07em', color: '#865438', background: 'rgba(134,84,56,0.08)',
            border: '1px solid rgba(134,84,56,0.22)', borderRadius: '9999px', padding: '3px 10px'
          }
        }, 'cas-ngs/corridor-hero-3d'),
        el('span', {
          style: { fontFamily: 'ui-monospace,monospace', fontSize: '0.67rem', color: 'rgba(54,33,21,0.55)' }
        }, __('Full-bleed, 4 pinned stations, WebGL on the front end', 'cas-ngs-biotech-blocks'))
      ),
      children
    );
  }

  /* Attribute schema lives ONLY in blocks/3d-corridor-hero/block.json.
     WordPress merges it into the client block type; props.attributes in
     the edit component reads those values. Do not re-declare attributes
     here (that is what made registerBlockType return undefined on 6.9). */

  var STATIONS = [
    { n: 1, label: __('Station 1: Sample Extraction', 'cas-ngs-biotech-blocks') },
    { n: 2, label: __('Station 2: Fluorescence Basecalling', 'cas-ngs-biotech-blocks') },
    { n: 3, label: __('Station 3: Digital Reads Processing', 'cas-ngs-biotech-blocks') },
    { n: 4, label: __('Station 4: Variant Matrix Mapping', 'cas-ngs-biotech-blocks') }
  ];

  function corridorEdit(props) {
    var attrs = props.attributes;
    var setAttr = props.setAttributes;
    var blockProps = (typeof useBlockProps === 'function')
      ? useBlockProps({ className: 'cas-bio-editor-block' })
      : { className: 'cas-bio-editor-block' };

    var stationPanels = STATIONS.map(function (s) {
      var k = 'station' + s.n;
      return el(PanelBody, { key: k, title: s.label, initialOpen: s.n === 1 },
        ctrl(__('Kicker (step tag)', 'cas-ngs-biotech-blocks'), k + '_kicker', attrs, setAttr),
        ctrl(__('Title', 'cas-ngs-biotech-blocks'), k + '_title', attrs, setAttr),
        ctrl(__('Description', 'cas-ngs-biotech-blocks'), k + '_desc', attrs, setAttr, TextareaControl),
        ctrl(__('Badge (data readout)', 'cas-ngs-biotech-blocks'), k + '_badge', attrs, setAttr)
      );
    });

    /* Theme & Model panel: every control is guarded so that a component
       missing from a given WP build is skipped instead of throwing
       (React error #130 "got: undefined"). */
    var themeChildren = [];
    if (typeof SelectControl === 'function') {
      themeChildren.push(el(SelectControl, {
        label: __('Brand palette', 'cas-ngs-biotech-blocks'),
        value: attrs.palette || 'bronze',
        options: [
          { label: __('Signature Bronze and Warm Earth', 'cas-ngs-biotech-blocks'), value: 'bronze' },
          { label: __('Steel Blue Academic', 'cas-ngs-biotech-blocks'), value: 'steel' }
        ],
        onChange: function (v) { setAttr({ palette: v }); }
      }));
    }
    if (typeof TextControl === 'function') {
      themeChildren.push(el(TextControl, {
        label: __('DNA model URL (blank = bundled assets/models/dna.glb)', 'cas-ngs-biotech-blocks'),
        value: attrs.model_url || '',
        onChange: function (v) { setAttr({ model_url: v }); }
      }));
    }
    if (typeof ToggleControl === 'function') {
      themeChildren.push(el(ToggleControl, {
        label: __('ATCG cursor trail', 'cas-ngs-biotech-blocks'),
        checked: !!attrs.enable_cursor_trail,
        onChange: function (v) { setAttr({ enable_cursor_trail: v }); }
      }));
    }
    var dnaColor = colorField(
      __('DNA backbone tint (clear = palette default)', 'cas-ngs-biotech-blocks'),
      'dna_tint_color', attrs, setAttr
    );
    if (dnaColor) themeChildren.push(dnaColor);
    if (typeof RangeControl === 'function') {
      themeChildren.push(el(RangeControl, {
        label: __('Frame-4 bar darkness', 'cas-ngs-biotech-blocks'),
        min: 0,
        max: 0.9,
        step: 0.05,
        value: (typeof attrs.bar_darken === 'number' && !isNaN(attrs.bar_darken)) ? attrs.bar_darken : 0.15,
        onChange: function (v) { setAttr({ bar_darken: (typeof v === 'number' ? v : 0.15) }); }
      }));
    }
    themeChildren.push(el('p', { style: { fontSize: '12px', color: '#757575', marginTop: '12px' } },
      __('The hero takes over the full viewport (100vw x 100vh), pins for four scroll stations, and releases seamlessly into the next block.', 'cas-ngs-biotech-blocks')));

    var themePanel = (typeof PanelBody === 'function')
      ? el(PanelBody, { title: __('Theme and Model', 'cas-ngs-biotech-blocks'), initialOpen: false }, themeChildren)
      : el('div', { style: { padding: '16px' } }, themeChildren);

    var panels = stationPanels.concat([themePanel]);

    return el(Fragment, null,
      InspectorControls ? el(InspectorControls, null, panels) : null,
      el('div', blockProps,
        editorWrap([
          stationPreview(1, attrs),
          stationPreview(2, attrs),
          stationPreview(3, attrs),
          stationPreview(4, attrs),
          el('div', {
            style: {
              fontFamily: 'ui-monospace,monospace', fontSize: '0.67rem', color: 'rgba(54,33,21,0.55)',
              marginTop: '12px', letterSpacing: '0.05em'
            }
          }, __('Palette: ', 'cas-ngs-biotech-blocks') + (attrs.palette === 'steel' ? 'Steel Blue Academic' : 'Signature Bronze and Warm Earth') +
            '  |  ' + __('Trail: ', 'cas-ngs-biotech-blocks') + (attrs.enable_cursor_trail ? 'ON' : 'OFF'))
        ])
      )
    );
  }

  /* -- Registration (house pattern: function fields only) -- */
  /* Block names MUST start with a letter (WordPress client-side rule:
     /^[a-z][a-z0-9-]*\/[a-z][a-z0-9-]*$/). A digit-initial slug like the
     original "cas-ngs/3d-corridor-hero" is rejected by registerBlockType
     (returns undefined) even though PHP accepts it server-side -- which is
     exactly why the block never reached the inserter. Hence the
     letter-initial "corridor-hero-3d" slug. */
  var BLOCK_NAME = 'cas-ngs/corridor-hero-3d';

  function isPresent() {
    return !!(wp.blocks && wp.blocks.getBlockType && wp.blocks.getBlockType(BLOCK_NAME));
  }

  function doRegister(stage) {
    if (!wp.blocks || typeof wp.blocks.registerBlockType !== 'function') {
      fail('registerBlockType unavailable at stage "' + stage + '".');
      return false;
    }
    if (isPresent()) {
      info('present in registry at stage "' + stage + '" -- nothing to do.');
      return true;
    }
    try {
      var result = wp.blocks.registerBlockType(BLOCK_NAME, {
        /* function fields only -- metadata comes from block.json */
        edit: corridorEdit,
        save: function () { return null; } /* dynamic block -- render.php renders the front end */
      });
      if (result && result.name === BLOCK_NAME) {
        info('registered OK at stage "' + stage + '". Search "Corridor" in the inserter.');
        return true;
      }
      fail('registerBlockType returned undefined at stage "' + stage + '". ' +
           'Total block types in registry: ' +
           (wp.blocks.getBlockTypes ? wp.blocks.getBlockTypes().length : 'n/a'));
      return false;
    } catch (e) {
      fail('registerBlockType threw at stage "' + stage + '":', e);
      return false;
    }
  }

  doRegister('immediate');
  if (typeof wp.domReady === 'function') {
    wp.domReady(function () { doRegister('domReady'); });
  }
  [600, 1600, 3200].forEach(function (ms) {
    setTimeout(function () { doRegister('retry@' + ms + 'ms'); }, ms);
  });

  /* -- Auto-diagnostic: run after the editor settles, then report state -- */
  function runDiagnostics() {
    try {
      var bt = wp.blocks.getBlockType(BLOCK_NAME);
      if (bt) {
        info('DIAG: block type PRESENT. category="' + bt.category + '" title="' + bt.title + '"');
      } else {
        fail('DIAG: block type NOT in registry after all attempts.');
      }

      /* control: is a known-working block registered in THIS registry? */
      var act1 = wp.blocks.getBlockType('cas-ngs/act1-hero-sequencer');
      info('DIAG: control act1-hero-sequencer registered = ' + !!act1);

      var casBlocks = wp.blocks.getBlockTypes()
        .filter(function (b) { return b.name.indexOf('cas-ngs/') === 0; })
        .map(function (b) { return b.name; });
      info('DIAG: cas-ngs blocks in registry = ' + (casBlocks.length ? casBlocks.join(', ') : '(none)'));

      var store = (wp.data && wp.data.select) ? wp.data.select('core/blocks') : null;
      if (store && store.getCategories) {
        var slugs = store.getCategories().map(function (c) { return c.slug; });
        info('DIAG: editor categories = ' + slugs.join(', '));
        info('DIAG: cas-ngs-biotech category present = ' + (slugs.indexOf('cas-ngs-biotech') !== -1));
      } else {
        fail('DIAG: could not read block categories from the data store.');
      }

      if (!bt && !act1) {
        fail('DIAG: NEITHER the corridor NOR the known-working act1 block is in this ' +
             'registry. The editor is using a different registry than this script, or ' +
             'biotech-blocks-editor.js is not loading. See README.');
      }
    } catch (e) {
      fail('DIAG error:', e);
    }
  }
  setTimeout(runDiagnostics, 4000);
})();
