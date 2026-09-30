/**
 * CAS-NGS Biotech Blocks — Gutenberg Block Editor Integration
 *
 * Registers edit() functions for all 4 blocks using wp.blocks.registerBlockType.
 * Uses wp.* globals (no build step required) for full compatibility with any WP install.
 *
 *  Block registrations:
 *   • cas-ngs/act1-hero-sequencer
 *   • cas-ngs/act2-bento-grid
 *   • cas-ngs/act3-process-timeline
 *   • cas-ngs/act4-cta-banner
 *
 * @package CAS_NGS_Biotech_Blocks
 * @version 1.3.1
 */

(function () {
  'use strict';

  /* ─── WordPress API globals ──────────────────────────────────────────────── */
  var registerBlockType   = wp.blocks.registerBlockType;
  var el                  = wp.element.createElement;
  var Fragment            = wp.element.Fragment;
  var InspectorControls   = wp.blockEditor.InspectorControls;
  var useBlockProps       = wp.blockEditor.useBlockProps;
  var PanelBody           = wp.components.PanelBody;
  var TextControl         = wp.components.TextControl;
  var TextareaControl     = wp.components.TextareaControl;
  var RangeControl        = wp.components.RangeControl;
  var ToggleControl       = wp.components.ToggleControl;
  var __                  = wp.i18n.__;

  /* ─── Shared editor utilities ────────────────────────────────────────────── */

  /* Thin wrapper: creates a single TextControl bound to one attribute */
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

  /* Styled preview wrapper so the editor block has a visible container */
  function editorWrap(blockName, iconChar, children) {
    return el('div', {
      style: {
        background: 'rgba(237,224,212,0.65)',
        border: '1px solid rgba(134,84,56,0.22)',
        borderRadius: '12px',
        padding: '20px 24px',
        fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
      }
    },
      el('div', {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '12px',
          paddingBottom: '12px',
          borderBottom: '1px solid rgba(134,84,56,0.15)'
        }
      },
        el('span', {
          style: {
            fontSize: '18px',
            lineHeight: 1
          }
        }, iconChar),
        el('span', {
          style: {
            fontFamily: 'ui-monospace,monospace',
            fontSize: '0.72rem',
            fontWeight: '700',
            letterSpacing: '0.07em',
            color: '#865438',
            background: 'rgba(134,84,56,0.08)',
            border: '1px solid rgba(134,84,56,0.22)',
            borderRadius: '9999px',
            padding: '3px 10px'
          }
        }, blockName)
      ),
      children
    );
  }

  /* Preview field: label + live value row */
  function previewField(label, value, mono) {
    return el('div', {
      style: { marginBottom: '8px' }
    },
      el('span', {
        style: {
          fontFamily: 'ui-monospace,monospace',
          fontSize: '0.65rem',
          letterSpacing: '0.07em',
          color: 'rgba(54,33,21,0.55)',
          textTransform: 'uppercase',
          display: 'block',
          marginBottom: '2px'
        }
      }, label),
      el('span', {
        style: {
          fontFamily: mono ? 'ui-monospace,monospace' : 'inherit',
          fontSize: mono ? '0.78rem' : '0.92rem',
          fontWeight: '600',
          color: '#362115',
          display: 'block'
        }
      }, value || el('em', { style: { opacity: 0.4 } }, '(empty)'))
    );
  }

  /* Metric chip preview */
  function metricChip(val, label) {
    return el('div', {
      style: {
        background: 'rgba(255,255,255,0.7)',
        border: '1px solid rgba(134,84,56,0.18)',
        borderRadius: '10px',
        padding: '10px 14px',
        display: 'inline-block',
        marginRight: '8px',
        marginBottom: '8px',
        minWidth: '110px',
        verticalAlign: 'top'
      }
    },
      el('div', {
        style: {
          fontFamily: '"Plus Jakarta Sans",sans-serif',
          fontSize: '1.25rem',
          fontWeight: '800',
          color: '#362115',
          lineHeight: 1,
          marginBottom: '4px'
        }
      }, val || '—'),
      el('div', {
        style: {
          fontFamily: 'ui-monospace,monospace',
          fontSize: '0.67rem',
          textTransform: 'uppercase',
          letterSpacing: '0.07em',
          color: 'rgba(54,33,21,0.55)'
        }
      }, label || '—')
    );
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     BLOCK 1 — cas-ngs/act1-hero-sequencer
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  registerBlockType('cas-ngs/act1-hero-sequencer', {
    edit: function (props) {
      var attrs   = props.attributes;
      var setAttr = props.setAttributes;
      var blockProps = useBlockProps({ className: 'cas-bio-editor-block' });

      return el(Fragment, null,

        /* ── Inspector Sidebar ── */
        el(InspectorControls, null,

          el(PanelBody, { title: __('Hero Content', 'cas-ngs-biotech-blocks'), initialOpen: true },
            ctrl(__('Badge Text', 'cas-ngs-biotech-blocks'),               'badge_text',   attrs, setAttr),
            ctrl(__('Headline',   'cas-ngs-biotech-blocks'),               'headline',     attrs, setAttr),
            ctrl(__('Subtitle',   'cas-ngs-biotech-blocks'),               'subtitle',     attrs, setAttr, TextareaControl)
          ),

          el(PanelBody, { title: __('CTA Buttons', 'cas-ngs-biotech-blocks'), initialOpen: true },
            ctrl(__('Primary Button Text', 'cas-ngs-biotech-blocks'),      'primary_cta_text',   attrs, setAttr),
            ctrl(__('Primary Button URL',  'cas-ngs-biotech-blocks'),      'primary_cta_url',    attrs, setAttr),
            ctrl(__('Secondary Button Text', 'cas-ngs-biotech-blocks'),    'secondary_cta_text', attrs, setAttr),
            ctrl(__('Secondary Button URL',  'cas-ngs-biotech-blocks'),    'secondary_cta_url',  attrs, setAttr)
          ),

          el(PanelBody, { title: __('Metric Card 1 — Throughput', 'cas-ngs-biotech-blocks'), initialOpen: false },
            ctrl(__('Value (e.g. 120 Gb+)',  'cas-ngs-biotech-blocks'),    'metric_1_val',   attrs, setAttr),
            ctrl(__('Label',                 'cas-ngs-biotech-blocks'),    'metric_1_label', attrs, setAttr)
          ),

          el(PanelBody, { title: __('Metric Card 2 — Accuracy', 'cas-ngs-biotech-blocks'), initialOpen: false },
            ctrl(__('Value (e.g. 99.9%)',    'cas-ngs-biotech-blocks'),    'metric_2_val',   attrs, setAttr),
            ctrl(__('Label',                 'cas-ngs-biotech-blocks'),    'metric_2_label', attrs, setAttr)
          ),

          el(PanelBody, { title: __('Metric Card 3 — Read Length', 'cas-ngs-biotech-blocks'), initialOpen: false },
            ctrl(__('Value (e.g. 4.2 Mb)',   'cas-ngs-biotech-blocks'),    'metric_3_val',   attrs, setAttr),
            ctrl(__('Label',                 'cas-ngs-biotech-blocks'),    'metric_3_label', attrs, setAttr)
          ),

          el(PanelBody, { title: __('Metric Card 4 — Turnaround', 'cas-ngs-biotech-blocks'), initialOpen: false },
            ctrl(__('Value (e.g. 48 hrs)',   'cas-ngs-biotech-blocks'),    'metric_4_val',   attrs, setAttr),
            ctrl(__('Label',                 'cas-ngs-biotech-blocks'),    'metric_4_label', attrs, setAttr)
          ),

          el(PanelBody, { title: __('Telemetry Labels', 'cas-ngs-biotech-blocks'), initialOpen: false },
            ctrl(__('Live Status Text',      'cas-ngs-biotech-blocks'),    'live_status_text',   attrs, setAttr),
            ctrl(__('Flow Cell QC Text',     'cas-ngs-biotech-blocks'),    'flowcell_qc_text',   attrs, setAttr),
            ctrl(__('Membrane Voltage',      'cas-ngs-biotech-blocks'),    'voltage_text',       attrs, setAttr),
            ctrl(__('Translocation Speed',   'cas-ngs-biotech-blocks'),    'translocation_text', attrs, setAttr)
          )
        ),

        /* ── Editor Canvas Preview ── */
        el('div', blockProps,
          editorWrap('Act 1: Hero Sequencer Terminal', '🔬',
            el(Fragment, null,
              previewField(__('Headline', 'cas-ngs-biotech-blocks'), attrs.headline),
              previewField(__('Subtitle', 'cas-ngs-biotech-blocks'), attrs.subtitle),
              el('div', { style: { display: 'flex', gap: '8px', marginBottom: '14px' } },
                el('span', {
                  style: {
                    background: '#865438', color: '#ede0d4',
                    borderRadius: '9999px', padding: '6px 16px',
                    fontSize: '0.82rem', fontWeight: '700'
                  }
                }, attrs.primary_cta_text || 'Request Run Quote'),
                el('span', {
                  style: {
                    background: 'rgba(255,255,255,0.85)', color: '#362115',
                    border: '1px solid rgba(134,84,56,0.32)',
                    borderRadius: '9999px', padding: '6px 16px',
                    fontSize: '0.82rem', fontWeight: '700'
                  }
                }, attrs.secondary_cta_text || 'Explore Services')
              ),
              el('div', { style: {
                background: '#1a0e08', borderRadius: '10px',
                padding: '12px 16px', marginBottom: '14px',
                fontFamily: 'ui-monospace,monospace', fontSize: '0.7rem', color: '#e6ccb2'
              } },
                el('div', { style: { color: '#4ade80', marginBottom: '4px' } }, '● ' + (attrs.live_status_text || 'LIVE RUNNING • PROMETHION 24')),
                el('div', { style: { color: '#c4a882' } }, attrs.voltage_text || 'MEMBRANE VOLTAGE: -180 mV'),
                el('div', { style: { color: '#a5f3c0' } }, '⚡ Ionic waveform & run timer rendered on frontend')
              ),
              el('div', null,
                metricChip(attrs.metric_1_val, attrs.metric_1_label),
                metricChip(attrs.metric_2_val, attrs.metric_2_label),
                metricChip(attrs.metric_3_val, attrs.metric_3_label),
                metricChip(attrs.metric_4_val, attrs.metric_4_label)
              )
            )
          )
        )
      );
    },

    save: function () { return null; } /* Dynamic block — render.php handles output */
  });

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     BLOCK 2 — cas-ngs/act2-bento-grid
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  registerBlockType('cas-ngs/act2-bento-grid', {
    edit: function (props) {
      var attrs   = props.attributes;
      var setAttr = props.setAttributes;
      var blockProps = useBlockProps({ className: 'cas-bio-editor-block' });

      return el(Fragment, null,

        el(InspectorControls, null,

          el(PanelBody, { title: __('Section Header', 'cas-ngs-biotech-blocks'), initialOpen: true },
            ctrl(__('Badge Text',    'cas-ngs-biotech-blocks'), 'badge_text',    attrs, setAttr),
            ctrl(__('Section Title', 'cas-ngs-biotech-blocks'), 'section_title', attrs, setAttr),
            ctrl(__('Section Description', 'cas-ngs-biotech-blocks'), 'section_desc', attrs, setAttr, TextareaControl)
          ),

          el(PanelBody, { title: __('Card 1 — Sequencing', 'cas-ngs-biotech-blocks'), initialOpen: false },
            ctrl(__('Tag Label',      'cas-ngs-biotech-blocks'), 'card1_tag',        attrs, setAttr),
            ctrl(__('Card Title',     'cas-ngs-biotech-blocks'), 'card1_title',      attrs, setAttr),
            ctrl(__('Description',    'cas-ngs-biotech-blocks'), 'card1_desc',       attrs, setAttr, TextareaControl),
            ctrl(__('Spec Label',     'cas-ngs-biotech-blocks'), 'card1_spec_label', attrs, setAttr),
            ctrl(__('CTA Text',       'cas-ngs-biotech-blocks'), 'card1_cta_text',   attrs, setAttr),
            ctrl(__('CTA URL',        'cas-ngs-biotech-blocks'), 'card1_cta_url',    attrs, setAttr)
          ),

          el(PanelBody, { title: __('Card 2 — Bioinformatics', 'cas-ngs-biotech-blocks'), initialOpen: false },
            ctrl(__('Tag Label',         'cas-ngs-biotech-blocks'), 'card2_tag',             attrs, setAttr),
            ctrl(__('Card Title',        'cas-ngs-biotech-blocks'), 'card2_title',           attrs, setAttr),
            ctrl(__('Description',       'cas-ngs-biotech-blocks'), 'card2_desc',            attrs, setAttr, TextareaControl),
            ctrl(__('Terminal File Name','cas-ngs-biotech-blocks'), 'card2_terminal_title',  attrs, setAttr),
            ctrl(__('Histogram Label',   'cas-ngs-biotech-blocks'), 'card2_histogram_label', attrs, setAttr),
            ctrl(__('Spec Label',        'cas-ngs-biotech-blocks'), 'card2_spec_label',      attrs, setAttr),
            ctrl(__('CTA Text',          'cas-ngs-biotech-blocks'), 'card2_cta_text',        attrs, setAttr),
            ctrl(__('CTA URL',           'cas-ngs-biotech-blocks'), 'card2_cta_url',         attrs, setAttr)
          ),

          el(PanelBody, { title: __('Card 3 — Capacity Building', 'cas-ngs-biotech-blocks'), initialOpen: false },
            ctrl(__('Tag Label',     'cas-ngs-biotech-blocks'), 'card3_tag',        attrs, setAttr),
            ctrl(__('Card Title',    'cas-ngs-biotech-blocks'), 'card3_title',      attrs, setAttr),
            ctrl(__('Description',   'cas-ngs-biotech-blocks'), 'card3_desc',       attrs, setAttr, TextareaControl),
            ctrl(__('Spec Label',    'cas-ngs-biotech-blocks'), 'card3_spec_label', attrs, setAttr),
            ctrl(__('CTA Text',      'cas-ngs-biotech-blocks'), 'card3_cta_text',   attrs, setAttr),
            ctrl(__('CTA URL',       'cas-ngs-biotech-blocks'), 'card3_cta_url',    attrs, setAttr)
          ),

          el(PanelBody, { title: __('Training Modules', 'cas-ngs-biotech-blocks'), initialOpen: false },
            ctrl(__('Module 1 — Title',       'cas-ngs-biotech-blocks'), 'training_1_title', attrs, setAttr),
            ctrl(__('Module 1 — Description', 'cas-ngs-biotech-blocks'), 'training_1_desc',  attrs, setAttr, TextareaControl),
            ctrl(__('Module 2 — Title',       'cas-ngs-biotech-blocks'), 'training_2_title', attrs, setAttr),
            ctrl(__('Module 2 — Description', 'cas-ngs-biotech-blocks'), 'training_2_desc',  attrs, setAttr, TextareaControl),
            ctrl(__('Module 3 — Title',       'cas-ngs-biotech-blocks'), 'training_3_title', attrs, setAttr),
            ctrl(__('Module 3 — Description', 'cas-ngs-biotech-blocks'), 'training_3_desc',  attrs, setAttr, TextareaControl)
          )
        ),

        el('div', blockProps,
          editorWrap('Act 2: Bento Services Grid', '⬡',
            el(Fragment, null,
              previewField(__('Section Title', 'cas-ngs-biotech-blocks'), attrs.section_title),

              /* Mini Bento Grid Preview */
              el('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '12px' } },

                /* Card 1 */
                el('div', { style: {
                  background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(134,84,56,0.18)',
                  borderRadius: '10px', padding: '12px'
                } },
                  el('div', { style: { fontFamily: 'ui-monospace,monospace', fontSize: '0.65rem', color: '#865438', marginBottom: '4px' } }, attrs.card1_tag),
                  el('div', { style: { fontWeight: '700', fontSize: '0.92rem', color: '#362115', marginBottom: '4px' } }, attrs.card1_title),
                  el('div', { style: { fontSize: '0.75rem', color: 'rgba(54,33,21,0.65)' } }, attrs.card1_spec_label)
                ),

                /* Card 2 — Terminal */
                el('div', { style: {
                  background: '#0f0703', border: '1px solid rgba(134,84,56,0.25)',
                  borderRadius: '10px', padding: '12px'
                } },
                  el('div', { style: { fontFamily: 'ui-monospace,monospace', fontSize: '0.65rem', color: '#8a6a50', marginBottom: '4px' } }, attrs.card2_terminal_title),
                  el('div', { style: { fontFamily: 'ui-monospace,monospace', fontSize: '0.7rem', color: '#4ade80' } }, '$ dorado basecaller sup,5mCG…'),
                  el('div', { style: { fontFamily: 'ui-monospace,monospace', fontSize: '0.65rem', color: '#c4956e', marginTop: '4px' } }, attrs.card2_tag)
                ),

                /* Card 3 — Full-width */
                el('div', { style: {
                  gridColumn: '1 / -1',
                  background: 'linear-gradient(135deg,#2e1a0e,#865438)',
                  borderRadius: '10px', padding: '12px'
                } },
                  el('div', { style: { fontFamily: 'ui-monospace,monospace', fontSize: '0.65rem', color: '#e6ccb2', marginBottom: '4px' } }, attrs.card3_tag),
                  el('div', { style: { fontWeight: '700', fontSize: '0.92rem', color: '#ede0d4' } }, attrs.card3_title),
                  el('div', { style: { fontSize: '0.72rem', color: 'rgba(237,224,212,0.7)', marginTop: '6px' } },
                    (attrs.training_1_title || '') + '  ·  ' + (attrs.training_2_title || '') + '  ·  ' + (attrs.training_3_title || '')
                  )
                )
              )
            )
          )
        )
      );
    },

    save: function () { return null; }
  });

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     BLOCK 3 — cas-ngs/act3-process-timeline
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  registerBlockType('cas-ngs/act3-process-timeline', {
    edit: function (props) {
      var attrs   = props.attributes;
      var setAttr = props.setAttributes;
      var blockProps = useBlockProps({ className: 'cas-bio-editor-block' });

      /* Phase icons for preview */
      var icons = ['🧪', '〰️', '💻', '📄'];
      var phases = [
        { key: 'phase1', title: attrs.phase1_title, label: attrs.phase1_label, desc: attrs.phase1_desc, qc: attrs.phase1_qc },
        { key: 'phase2', title: attrs.phase2_title, label: attrs.phase2_label, desc: attrs.phase2_desc, qc: attrs.phase2_qc },
        { key: 'phase3', title: attrs.phase3_title, label: attrs.phase3_label, desc: attrs.phase3_desc, qc: attrs.phase3_qc },
        { key: 'phase4', title: attrs.phase4_title, label: attrs.phase4_label, desc: attrs.phase4_desc, qc: attrs.phase4_qc }
      ];

      return el(Fragment, null,

        el(InspectorControls, null,

          el(PanelBody, { title: __('Section Header', 'cas-ngs-biotech-blocks'), initialOpen: true },
            ctrl(__('Badge Text',          'cas-ngs-biotech-blocks'), 'badge_text',    attrs, setAttr),
            ctrl(__('Section Title',       'cas-ngs-biotech-blocks'), 'section_title', attrs, setAttr),
            ctrl(__('Section Description', 'cas-ngs-biotech-blocks'), 'section_desc',  attrs, setAttr, TextareaControl)
          ),

          el(PanelBody, { title: __('Phase 01 — Sample Prep', 'cas-ngs-biotech-blocks'), initialOpen: false },
            ctrl(__('Phase Label',   'cas-ngs-biotech-blocks'), 'phase1_label', attrs, setAttr),
            ctrl(__('Title',         'cas-ngs-biotech-blocks'), 'phase1_title', attrs, setAttr),
            ctrl(__('Description',   'cas-ngs-biotech-blocks'), 'phase1_desc',  attrs, setAttr, TextareaControl),
            ctrl(__('QC Badge Text', 'cas-ngs-biotech-blocks'), 'phase1_qc',    attrs, setAttr)
          ),

          el(PanelBody, { title: __('Phase 02 — Nanopore Basecalling', 'cas-ngs-biotech-blocks'), initialOpen: false },
            ctrl(__('Phase Label',   'cas-ngs-biotech-blocks'), 'phase2_label', attrs, setAttr),
            ctrl(__('Title',         'cas-ngs-biotech-blocks'), 'phase2_title', attrs, setAttr),
            ctrl(__('Description',   'cas-ngs-biotech-blocks'), 'phase2_desc',  attrs, setAttr, TextareaControl),
            ctrl(__('QC Badge Text', 'cas-ngs-biotech-blocks'), 'phase2_qc',    attrs, setAttr)
          ),

          el(PanelBody, { title: __('Phase 03 — Computational Analysis', 'cas-ngs-biotech-blocks'), initialOpen: false },
            ctrl(__('Phase Label',   'cas-ngs-biotech-blocks'), 'phase3_label', attrs, setAttr),
            ctrl(__('Title',         'cas-ngs-biotech-blocks'), 'phase3_title', attrs, setAttr),
            ctrl(__('Description',   'cas-ngs-biotech-blocks'), 'phase3_desc',  attrs, setAttr, TextareaControl),
            ctrl(__('QC Badge Text', 'cas-ngs-biotech-blocks'), 'phase3_qc',    attrs, setAttr)
          ),

          el(PanelBody, { title: __('Phase 04 — Research Insight', 'cas-ngs-biotech-blocks'), initialOpen: false },
            ctrl(__('Phase Label',   'cas-ngs-biotech-blocks'), 'phase4_label', attrs, setAttr),
            ctrl(__('Title',         'cas-ngs-biotech-blocks'), 'phase4_title', attrs, setAttr),
            ctrl(__('Description',   'cas-ngs-biotech-blocks'), 'phase4_desc',  attrs, setAttr, TextareaControl),
            ctrl(__('QC Badge Text', 'cas-ngs-biotech-blocks'), 'phase4_qc',    attrs, setAttr)
          )
        ),

        el('div', blockProps,
          editorWrap('Act 3: Process Timeline', '🔁',
            el(Fragment, null,
              previewField(__('Section Title', 'cas-ngs-biotech-blocks'), attrs.section_title),

              /* 4-Phase mini grid */
              el('div', {
                style: {
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4,1fr)',
                  gap: '8px',
                  marginTop: '12px'
                }
              },
                phases.map(function (ph, i) {
                  return el('div', {
                    key: ph.key,
                    style: {
                      background: 'rgba(255,255,255,0.7)',
                      border: '1px solid rgba(134,84,56,0.18)',
                      borderRadius: '10px',
                      padding: '10px'
                    }
                  },
                    el('div', { style: { fontFamily: 'ui-monospace,monospace', fontSize: '0.6rem', color: '#865438', marginBottom: '4px' } }, ph.label),
                    el('div', { style: { fontSize: '18px', marginBottom: '6px' } }, icons[i]),
                    el('div', { style: { fontWeight: '700', fontSize: '0.82rem', color: '#362115', marginBottom: '4px' } }, ph.title),
                    el('div', { style: { fontFamily: 'ui-monospace,monospace', fontSize: '0.62rem', color: '#865438', background: 'rgba(134,84,56,0.07)', border: '1px solid rgba(134,84,56,0.18)', borderRadius: '4px', padding: '2px 6px', display: 'inline-block' } }, ph.qc)
                  );
                })
              )
            )
          )
        )
      );
    },

    save: function () { return null; }
  });

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     BLOCK 4 — cas-ngs/act4-cta-banner
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  registerBlockType('cas-ngs/act4-cta-banner', {
    edit: function (props) {
      var attrs   = props.attributes;
      var setAttr = props.setAttributes;
      var blockProps = useBlockProps({ className: 'cas-bio-editor-block' });

      return el(Fragment, null,

        el(InspectorControls, null,

          el(PanelBody, { title: __('Banner Content', 'cas-ngs-biotech-blocks'), initialOpen: true },
            ctrl(__('Badge Text',        'cas-ngs-biotech-blocks'), 'badge_text',     attrs, setAttr),
            ctrl(__('Banner Heading',    'cas-ngs-biotech-blocks'), 'banner_heading', attrs, setAttr),
            ctrl(__('Banner Subtext',    'cas-ngs-biotech-blocks'), 'banner_subtext', attrs, setAttr, TextareaControl)
          ),

          el(PanelBody, { title: __('CTA Buttons', 'cas-ngs-biotech-blocks'), initialOpen: true },
            ctrl(__('Primary Button Text', 'cas-ngs-biotech-blocks'),   'primary_cta_text',   attrs, setAttr),
            ctrl(__('Primary Button URL',  'cas-ngs-biotech-blocks'),   'primary_cta_url',    attrs, setAttr),
            ctrl(__('Secondary Button Text', 'cas-ngs-biotech-blocks'), 'secondary_cta_text', attrs, setAttr),
            ctrl(__('Secondary Button URL',  'cas-ngs-biotech-blocks'), 'secondary_cta_url',  attrs, setAttr)
          )
        ),

        el('div', blockProps,
          editorWrap('Act 4: Conversion CTA Banner', '📣',
            el(Fragment, null,
              el('div', { style: { textAlign: 'center', padding: '16px 0' } },

                el('span', {
                  style: {
                    fontFamily: 'ui-monospace,monospace',
                    fontSize: '0.73rem', fontWeight: '600', letterSpacing: '0.07em',
                    color: '#865438', background: 'rgba(134,84,56,0.08)',
                    border: '1px solid rgba(134,84,56,0.22)', borderRadius: '9999px',
                    padding: '4px 12px', display: 'inline-block', marginBottom: '14px'
                  }
                }, attrs.badge_text),

                el('h2', {
                  style: {
                    fontFamily: '"Plus Jakarta Sans",sans-serif',
                    fontSize: '1.75rem', fontWeight: '800', color: '#362115',
                    letterSpacing: '-0.025em', margin: '0 0 10px'
                  }
                }, attrs.banner_heading),

                el('p', {
                  style: { fontSize: '0.9rem', color: 'rgba(54,33,21,0.7)', maxWidth: '560px', margin: '0 auto 20px', lineHeight: '1.6' }
                }, attrs.banner_subtext),

                el('div', { style: { display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' } },
                  el('span', {
                    style: {
                      background: '#865438', color: '#ede0d4',
                      borderRadius: '9999px', padding: '10px 22px',
                      fontSize: '0.88rem', fontWeight: '700'
                    }
                  }, attrs.primary_cta_text + ' →'),
                  el('span', {
                    style: {
                      background: 'rgba(255,255,255,0.85)', color: '#362115',
                      border: '1px solid rgba(134,84,56,0.32)',
                      borderRadius: '9999px', padding: '10px 22px',
                      fontSize: '0.88rem', fontWeight: '700'
                    }
                  }, attrs.secondary_cta_text)
                )
              )
            )
          )
        )
      );
    },

    save: function () { return null; }
  });

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     BLOCK: cas-ngs/header-top-dock (Act 0: Animated Top Dock Header)
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  registerBlockType('cas-ngs/header-top-dock', {
    edit: function (props) {
      var attrs   = props.attributes;
      var setAttr = props.setAttributes;
      var blockProps = useBlockProps({ className: 'cas-bio-editor-block' });

      return el(Fragment, null,

        /* ── Inspector Controls ── */
        el(InspectorControls, null,
          el(PanelBody, { title: __('Brand & Header Settings', 'cas-ngs-biotech-blocks'), initialOpen: true },
            ctrl(__('Brand Name', 'cas-ngs-biotech-blocks'), 'brand_name', attrs, setAttr),
            ctrl(__('Brand URL', 'cas-ngs-biotech-blocks'), 'brand_url', attrs, setAttr),
            el(ToggleControl, {
              label: __('Enable Physics Magnification', 'cas-ngs-biotech-blocks'),
              checked: attrs.enable_physics !== false,
              onChange: function (val) { setAttr({ enable_physics: val }); }
            }),
            el(ToggleControl, {
              label: __('Enable Aurora Glow', 'cas-ngs-biotech-blocks'),
              checked: attrs.enable_aurora !== false,
              onChange: function (val) { setAttr({ enable_aurora: val }); }
            })
          ),
          el(PanelBody, { title: __('Action Buttons', 'cas-ngs-biotech-blocks'), initialOpen: true },
            ctrl(__('Primary CTA Text', 'cas-ngs-biotech-blocks'), 'cta_text', attrs, setAttr),
            ctrl(__('Primary CTA URL', 'cas-ngs-biotech-blocks'), 'cta_url', attrs, setAttr),
            ctrl(__('Sign In Button Text', 'cas-ngs-biotech-blocks'), 'signin_text', attrs, setAttr),
            ctrl(__('Sign In Button URL', 'cas-ngs-biotech-blocks'), 'signin_url', attrs, setAttr)
          )
        ),

        /* ── Editor Canvas Block Preview ── */
        el('div', blockProps,
          editorWrap('Act 0: Animated Top Dock Header', '⚡',
            el(Fragment, null,
              el('div', {
                style: {
                  background: 'rgba(235, 225, 210, 0.85)',
                  border: '1px solid rgba(120, 95, 70, 0.2)',
                  borderRadius: '999px',
                  padding: '6px 12px 6px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 8px 24px rgba(60, 45, 30, 0.08)',
                  margin: '8px 0'
                }
              },
                el('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', color: '#1a1612', fontWeight: '700', fontSize: '14px' } },
                  el('span', { style: { display: 'inline-block', width: '20px', height: '20px', borderRadius: '50%', background: '#6e543e' } }),
                  attrs.brand_name || 'CAS-NGS'
                ),
                el('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', color: '#5a4d41', fontSize: '12px' } },
                  el('span', { style: { padding: '4px 8px', borderRadius: '999px', background: 'rgba(120, 95, 70, 0.1)', color: '#1a1612', fontWeight: '600' } }, 'Product ▾'),
                  el('span', { style: { padding: '4px 8px', borderRadius: '999px', background: 'rgba(120, 95, 70, 0.1)', color: '#1a1612', fontWeight: '600' } }, 'Solutions ▾'),
                  el('span', { style: { padding: '4px 8px' } }, 'Docs'),
                  el('span', { style: { padding: '4px 8px' } }, 'Pricing'),
                  el('span', { style: { padding: '4px 8px' } }, 'Changelog')
                ),
                el('div', { style: { display: 'flex', alignItems: 'center', gap: '6px' } },
                  el('span', { style: { color: '#5a4d41', fontSize: '12px', padding: '0 8px' } }, attrs.signin_text || 'Sign in'),
                  el('span', {
                    style: {
                      background: '#6e543e',
                      color: '#ffffff',
                      borderRadius: '999px',
                      padding: '6px 14px',
                      fontWeight: '600',
                      fontSize: '12px'
                    }
                  }, (attrs.cta_text || 'Request Quote') + ' →')
                )
              ),
              el('p', { style: { fontSize: '0.75rem', color: 'rgba(54,33,21,0.6)', marginTop: '8px', marginBottom: 0, textAlign: 'center' } },
                __('Frontend will render live ThreeUI spring magnification physics, in-tab micro chevron rotation, and glassmorphic dropdown panels.', 'cas-ngs-biotech-blocks')
              )
            )
          )
        )
      );
    },

    save: function () { return null; }
  });

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     BLOCK: cas-ngs/interactive-pipeline-hero (Act 0: 4-Frame 3D Pipeline Hero)
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  registerBlockType('cas-ngs/interactive-pipeline-hero', {
    edit: function (props) {
      var attrs   = props.attributes;
      var setAttr = props.setAttributes;
      var blockProps = useBlockProps({ className: 'cas-bio-editor-block' });

      return el(Fragment, null,

        /* ── Inspector Controls ── */
        el(InspectorControls, null,
          el(PanelBody, { title: __('Global & 3D Stage Settings', 'cas-ngs-biotech-blocks'), initialOpen: true },
            el(ToggleControl, {
              label: __('Enable Nucleotide Cursor Trail', 'cas-ngs-biotech-blocks'),
              checked: attrs.fx_enabled !== false,
              onChange: function (val) { setAttr({ fx_enabled: val }); }
            }),
            ctrl(__('Canvas Background Color', 'cas-ngs-biotech-blocks'), 'canvas_bg', attrs, setAttr),
            ctrl(__('Custom DNA Model URL (Leave blank for unified assets/models/dna.glb)', 'cas-ngs-biotech-blocks'), 'model_url', attrs, setAttr)
          ),

          el(PanelBody, { title: __('Fig. 01 — Sample Extraction', 'cas-ngs-biotech-blocks'), initialOpen: false },
            ctrl(__('Figure Label', 'cas-ngs-biotech-blocks'), 'fig1_label', attrs, setAttr),
            ctrl(__('Phase Badge', 'cas-ngs-biotech-blocks'), 'fig1_phase', attrs, setAttr),
            ctrl(__('Title', 'cas-ngs-biotech-blocks'), 'fig1_title', attrs, setAttr),
            ctrl(__('Description', 'cas-ngs-biotech-blocks'), 'fig1_copy', attrs, setAttr, TextareaControl),
            ctrl(__('Sample ID', 'cas-ngs-biotech-blocks'), 'fig1_sample_id', attrs, setAttr),
            ctrl(__('Yield Metric', 'cas-ngs-biotech-blocks'), 'fig1_yield', attrs, setAttr),
            ctrl(__('CTA Button Text', 'cas-ngs-biotech-blocks'), 'fig1_cta_text', attrs, setAttr),
            ctrl(__('CTA Button URL', 'cas-ngs-biotech-blocks'), 'fig1_cta_url', attrs, setAttr)
          ),

          el(PanelBody, { title: __('Fig. 02 — High-Throughput Sequencing', 'cas-ngs-biotech-blocks'), initialOpen: false },
            ctrl(__('Figure Label', 'cas-ngs-biotech-blocks'), 'fig2_label', attrs, setAttr),
            ctrl(__('Phase Badge', 'cas-ngs-biotech-blocks'), 'fig2_phase', attrs, setAttr),
            ctrl(__('Title', 'cas-ngs-biotech-blocks'), 'fig2_title', attrs, setAttr),
            ctrl(__('Description', 'cas-ngs-biotech-blocks'), 'fig2_copy', attrs, setAttr, TextareaControl),
            ctrl(__('Flowcell ID', 'cas-ngs-biotech-blocks'), 'fig2_flowcell_id', attrs, setAttr),
            ctrl(__('Channels Metric', 'cas-ngs-biotech-blocks'), 'fig2_channels', attrs, setAttr)
          ),

          el(PanelBody, { title: __('Fig. 03 — Basecalling & Assembly', 'cas-ngs-biotech-blocks'), initialOpen: false },
            ctrl(__('Figure Label', 'cas-ngs-biotech-blocks'), 'fig3_label', attrs, setAttr),
            ctrl(__('Phase Badge', 'cas-ngs-biotech-blocks'), 'fig3_phase', attrs, setAttr),
            ctrl(__('Title', 'cas-ngs-biotech-blocks'), 'fig3_title', attrs, setAttr),
            ctrl(__('Description', 'cas-ngs-biotech-blocks'), 'fig3_copy', attrs, setAttr, TextareaControl),
            ctrl(__('Quality Metric', 'cas-ngs-biotech-blocks'), 'fig3_quality', attrs, setAttr),
            ctrl(__('Stream Status', 'cas-ngs-biotech-blocks'), 'fig3_stream', attrs, setAttr)
          ),

          el(PanelBody, { title: __('Fig. 04 — Variant Analysis', 'cas-ngs-biotech-blocks'), initialOpen: false },
            ctrl(__('Figure Label', 'cas-ngs-biotech-blocks'), 'fig4_label', attrs, setAttr),
            ctrl(__('Phase Badge', 'cas-ngs-biotech-blocks'), 'fig4_phase', attrs, setAttr),
            ctrl(__('Title', 'cas-ngs-biotech-blocks'), 'fig4_title', attrs, setAttr),
            ctrl(__('Description', 'cas-ngs-biotech-blocks'), 'fig4_copy', attrs, setAttr, TextareaControl),
            ctrl(__('Reference ID', 'cas-ngs-biotech-blocks'), 'fig4_ref', attrs, setAttr),
            ctrl(__('Report Status', 'cas-ngs-biotech-blocks'), 'fig4_report', attrs, setAttr),
            ctrl(__('CTA Button Text', 'cas-ngs-biotech-blocks'), 'fig4_cta_text', attrs, setAttr),
            ctrl(__('CTA Button URL', 'cas-ngs-biotech-blocks'), 'fig4_cta_url', attrs, setAttr)
          ),

          el(PanelBody, { title: __('HUD & Ticker Settings', 'cas-ngs-biotech-blocks'), initialOpen: false },
            ctrl(__('Rail 1 Label', 'cas-ngs-biotech-blocks'), 'rail_name_1', attrs, setAttr),
            ctrl(__('Rail 2 Label', 'cas-ngs-biotech-blocks'), 'rail_name_2', attrs, setAttr),
            ctrl(__('Rail 3 Label', 'cas-ngs-biotech-blocks'), 'rail_name_3', attrs, setAttr),
            ctrl(__('Rail 4 Label', 'cas-ngs-biotech-blocks'), 'rail_name_4', attrs, setAttr),
            ctrl(__('Ticker String 1', 'cas-ngs-biotech-blocks'), 'ticker_string_1', attrs, setAttr),
            ctrl(__('Ticker String 2', 'cas-ngs-biotech-blocks'), 'ticker_string_2', attrs, setAttr)
          )
        ),

        /* ── Editor Canvas Block Preview ── */
        el('div', blockProps,
          editorWrap('Act 0: Interactive 3D Pipeline Hero', '🧬',
            el(Fragment, null,
              el('div', {
                style: {
                  background: 'rgba(255, 250, 245, 0.92)',
                  border: '1px solid rgba(134, 84, 56, 0.22)',
                  borderRadius: '10px',
                  padding: '20px 24px',
                  boxShadow: '0 8px 24px rgba(60, 45, 30, 0.08)',
                  margin: '8px 0'
                }
              },
                el('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' } },
                  el('span', { style: { fontFamily: 'monospace', fontSize: '11px', color: '#865438', textTransform: 'uppercase', letterSpacing: '0.15em' } },
                    (attrs.fig1_label || 'Fig. 01') + ' · ' + (attrs.fig1_phase || 'Wet Lab')
                  ),
                  el('span', { style: { background: 'rgba(134, 84, 56, 0.12)', color: '#865438', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '600' } },
                    '4-Frame 3D Pipeline'
                  )
                ),
                el('h3', { style: { fontFamily: 'serif', fontSize: '24px', color: '#2b2522', margin: '0 0 10px' } },
                  attrs.fig1_title || 'Sample Extraction'
                ),
                el('p', { style: { fontSize: '13px', color: '#6b5d51', lineHeight: '1.6', margin: '0 0 14px' } },
                  attrs.fig1_copy || 'High-molecular-weight DNA is isolated from the specimen and held in stable suspension — 3.2 billion base pairs awaiting their first reading.'
                ),
                el('div', { style: { display: 'flex', gap: '16px', borderTop: '1px solid rgba(134,84,56,0.15)', paddingTop: '10px', fontSize: '11px', fontFamily: 'monospace', color: '#8f8172' } },
                  el('span', null, 'Sample: ' + (attrs.fig1_sample_id || 'CS-0427')),
                  el('span', null, 'Yield: ' + (attrs.fig1_yield || '2.4 ng/µL'))
                )
              ),
              el('p', { style: { fontSize: '0.75rem', color: 'rgba(54,33,21,0.6)', marginTop: '8px', marginBottom: 0, textAlign: 'center' } },
                __('Frontend will render full 4-frame 3D interactive sequence with single-flick GSAP Observer locking and seamless release to Act 1 Hero.', 'cas-ngs-biotech-blocks')
              )
            )
          )
        )
      );
    },

    save: function () { return null; }
  });

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     BLOCK 0 — cas-ngs/dna-background (Act 0: 3D DNA Helix Simulation)
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  registerBlockType('cas-ngs/dna-background', {
    edit: function (props) {
      var attrs   = props.attributes;
      var setAttr = props.setAttributes;
      var blockProps = useBlockProps({ className: 'cas-bio-editor-block' });
      var defaultModel = (window.casBioBlocksData && window.casBioBlocksData.defaultModelUrl) || '';

      // Two-way synchronization: update block attributes & page post meta simultaneously
      function syncSetting(patch) {
        setAttr(patch);
        if (wp.data && wp.data.dispatch) {
          try {
            var metaPatch = { _cas_enable_dna_background: true };
            if (patch.model_url !== undefined) metaPatch._cas_dna_model_url = patch.model_url;
            if (patch.scale !== undefined) metaPatch._cas_dna_scale = patch.scale;
            if (patch.offset_x !== undefined) metaPatch._cas_dna_offset_x = patch.offset_x;
            if (patch.offset_y !== undefined) metaPatch._cas_dna_offset_y = patch.offset_y;
            if (patch.strand_color !== undefined) metaPatch._cas_dna_strand_color = patch.strand_color;
            if (patch.accent_color !== undefined) metaPatch._cas_dna_accent_color = patch.accent_color;
            if (patch.ambient_intensity !== undefined) metaPatch._cas_dna_ambient_intensity = patch.ambient_intensity;
            wp.data.dispatch('core/editor').editPost({ meta: metaPatch });
          } catch (e) {}
        }
      }

      return el(Fragment, null,

        /* ── Fixed Full-Viewport Background Canvas (Live in Gutenberg) ── */
        el('div', {
          className: 'cas-dna-bg-wrapper cas-dna-editor-fixed-bg',
          style: {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 0,
            pointerEvents: 'none',
            overflow: 'hidden'
          },
          'data-cas-dna-bg': 'true',
          'data-model-url': attrs.model_url || defaultModel,
          'data-scale': attrs.scale !== undefined ? attrs.scale : 1.0,
          'data-offset-x': attrs.offset_x !== undefined ? attrs.offset_x : 0.0,
          'data-offset-y': attrs.offset_y !== undefined ? attrs.offset_y : 0.0,
          'data-strand-color': attrs.strand_color || '#8c6d58',
          'data-accent-color': attrs.accent_color || '#4ade80',
          'data-ambient-intensity': attrs.ambient_intensity !== undefined ? attrs.ambient_intensity : 1.8,
          'data-cycling': attrs.enable_cycling !== false ? 'true' : 'false'
        },
          el('canvas', { className: 'cas-dna-webgl-canvas', style: { width: '100%', height: '100%', display: 'block' } })
        ),

        /* ── Block Inspector Sidebar ── */
        el(InspectorControls, null,

          el(PanelBody, { title: __('3D Model Configuration', 'cas-ngs-biotech-blocks'), initialOpen: true },
            el(TextControl, {
              label: __('Model Path / URL (.glb / .gltf)', 'cas-ngs-biotech-blocks'),
              value: attrs.model_url || '',
              onChange: function (val) { syncSetting({ model_url: val }); }
            }),
            el('p', { style: { fontSize: '0.75rem', color: '#666', marginTop: '-6px', marginBottom: '14px' } },
              __('Leave empty to use built-in DNA helix model.', 'cas-ngs-biotech-blocks')
            ),
            el(RangeControl, {
              label: __('Model Scale Multiplier', 'cas-ngs-biotech-blocks'),
              value: attrs.scale !== undefined ? attrs.scale : 1.0,
              min: 0.2,
              max: 3.5,
              step: 0.1,
              onChange: function (val) { syncSetting({ scale: val }); }
            }),
            el(RangeControl, {
              label: __('X Offset (Horizontal)', 'cas-ngs-biotech-blocks'),
              value: attrs.offset_x !== undefined ? attrs.offset_x : 0.0,
              min: -2.5,
              max: 2.5,
              step: 0.1,
              onChange: function (val) { syncSetting({ offset_x: val }); }
            }),
            el(RangeControl, {
              label: __('Y Offset (Vertical)', 'cas-ngs-biotech-blocks'),
              value: attrs.offset_y !== undefined ? attrs.offset_y : 0.0,
              min: -2.5,
              max: 2.5,
              step: 0.1,
              onChange: function (val) { syncSetting({ offset_y: val }); }
            })
          ),

          el(PanelBody, { title: __('Shading & Material Colors', 'cas-ngs-biotech-blocks'), initialOpen: true },
            el(TextControl, {
              label: __('Strand Backbone Color (Hex)', 'cas-ngs-biotech-blocks'),
              value: attrs.strand_color || '#8c6d58',
              onChange: function (val) { syncSetting({ strand_color: val }); }
            }),
            el(TextControl, {
              label: __('Base-Pair Accent Color (Hex)', 'cas-ngs-biotech-blocks'),
              value: attrs.accent_color || '#4ade80',
              onChange: function (val) { syncSetting({ accent_color: val }); }
            }),
            el(RangeControl, {
              label: __('Ambient Lighting Intensity', 'cas-ngs-biotech-blocks'),
              value: attrs.ambient_intensity !== undefined ? attrs.ambient_intensity : 1.8,
              min: 0.2,
              max: 4.0,
              step: 0.1,
              onChange: function (val) { syncSetting({ ambient_intensity: val }); }
            }),
            el(ToggleControl, {
              label: __('Enable 1-Pose-Per-Section Scroll Trigger', 'cas-ngs-biotech-blocks'),
              checked: attrs.enable_cycling !== undefined ? attrs.enable_cycling : true,
              onChange: function (val) { syncSetting({ enable_cycling: val }); }
            })
          )
        ),

        /* ── Editor Canvas Block Preview ── */
        el('div', blockProps,
          editorWrap('Act 0: 3D DNA Helix Background Simulation', '🧬',
            el(Fragment, null,
              el('div', {
                style: {
                  background: 'linear-gradient(135deg, #1e0f07 0%, #2e1a0e 50%, #4a2e1e 100%)',
                  borderRadius: '12px',
                  padding: '24px 20px',
                  textAlign: 'center',
                  color: '#ede0d4',
                  boxShadow: '0 8px 24px rgba(54,33,21,0.2)'
                }
              },
                el('div', {
                  style: {
                    fontSize: '1.8rem',
                    marginBottom: '8px'
                  }
                }, '🧬 3D DNA BACKGROUND ACTIVE'),
                el('div', {
                  style: {
                    fontFamily: 'ui-monospace,monospace',
                    fontSize: '0.78rem',
                    color: '#4ade80',
                    letterSpacing: '0.08em',
                    marginBottom: '14px'
                  }
                }, '● FULL-VIEWPORT BACKGROUND LAYER • 1 POSE PER SECTION (GSAP SCRUB: 1.8)'),
                el('div', {
                  style: {
                    display: 'flex',
                    gap: '12px',
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                    fontSize: '0.75rem',
                    fontFamily: 'ui-monospace,monospace'
                  }
                },
                  el('span', {
                    style: {
                      background: 'rgba(0,0,0,0.4)',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      border: '1px solid rgba(134,84,56,0.4)'
                    }
                  }, 'Scale: ' + (attrs.scale || 1.0) + 'x'),
                  el('span', {
                    style: {
                      background: 'rgba(0,0,0,0.4)',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      border: '1px solid rgba(134,84,56,0.4)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }
                  },
                    'Strand: ',
                    el('span', {
                      style: {
                        display: 'inline-block',
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: attrs.strand_color || '#8c6d58'
                      }
                    }),
                    attrs.strand_color || '#8c6d58'
                  ),
                  el('span', {
                    style: {
                      background: 'rgba(0,0,0,0.4)',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      border: '1px solid rgba(134,84,56,0.4)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }
                  },
                    'Accent: ',
                    el('span', {
                      style: {
                        display: 'inline-block',
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: attrs.accent_color || '#4ade80'
                      }
                    }),
                    attrs.accent_color || '#4ade80'
                  )
                ),
                el('p', {
                  style: {
                    fontSize: '0.78rem',
                    color: '#c4a882',
                    maxWidth: '560px',
                    margin: '16px auto 0',
                    lineHeight: '1.5'
                  }
                },
                  __('Dual-Sidebar Sync Active: Parameters adjust in real-time across both Block Inspector and Document Page Settings. Poses transition smoothly (1 pose per section) with fluid 1.8 scrub physics.', 'cas-ngs-biotech-blocks')
                )
              )
            )
          )
        )
      );
    },

    save: function () { return null; }
  });

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     DOCUMENT SETTINGS SIDEBAR PANEL (Gutenberg Page Settings Sync)
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  if (wp.plugins && wp.plugins.registerPlugin && wp.editPost && wp.editPost.PluginDocumentSettingPanel) {
    var PluginDocumentSettingPanel = wp.editPost.PluginDocumentSettingPanel;

    function CasDnaPageSettingsPanel() {
      var meta = wp.data.useSelect(function (select) {
        return select('core/editor').getEditedPostAttribute('meta') || {};
      }, []);
      var editPost = wp.data.useDispatch('core/editor').editPost;

      var enabled    = meta._cas_enable_dna_background || false;
      var scale      = meta._cas_dna_scale !== undefined ? meta._cas_dna_scale : 1.0;
      var offsetX    = meta._cas_dna_offset_x !== undefined ? meta._cas_dna_offset_x : 0.0;
      var offsetY    = meta._cas_dna_offset_y !== undefined ? meta._cas_dna_offset_y : 0.0;
      var strandColor= meta._cas_dna_strand_color || '#8c6d58';
      var accentColor= meta._cas_dna_accent_color || '#4ade80';
      var ambientInt = meta._cas_dna_ambient_intensity !== undefined ? meta._cas_dna_ambient_intensity : 1.8;

      return el(PluginDocumentSettingPanel, {
        name: 'cas-dna-page-settings-panel',
        title: __('3D DNA Simulation Settings', 'cas-ngs-biotech-blocks'),
        icon: 'visibility',
        initialOpen: false
      },
        el(ToggleControl, {
          label: __('Activate 3D DNA Background', 'cas-ngs-biotech-blocks'),
          checked: enabled,
          onChange: function (val) {
            editPost({ meta: { _cas_enable_dna_background: val } });
          }
        }),
        enabled && el(Fragment, null,
          el(RangeControl, {
            label: __('Model Scale Multiplier', 'cas-ngs-biotech-blocks'),
            value: scale,
            min: 0.2,
            max: 3.5,
            step: 0.1,
            onChange: function (val) {
              editPost({ meta: { _cas_dna_scale: val } });
            }
          }),
          el(RangeControl, {
            label: __('X Offset (Horizontal)', 'cas-ngs-biotech-blocks'),
            value: offsetX,
            min: -2.5,
            max: 2.5,
            step: 0.1,
            onChange: function (val) {
              editPost({ meta: { _cas_dna_offset_x: val } });
            }
          }),
          el(RangeControl, {
            label: __('Y Offset (Vertical)', 'cas-ngs-biotech-blocks'),
            value: offsetY,
            min: -2.5,
            max: 2.5,
            step: 0.1,
            onChange: function (val) {
              editPost({ meta: { _cas_dna_offset_y: val } });
            }
          }),
          el(TextControl, {
            label: __('Strand Backbone Color (Hex)', 'cas-ngs-biotech-blocks'),
            value: strandColor,
            onChange: function (val) {
              editPost({ meta: { _cas_dna_strand_color: val } });
            }
          }),
          el(TextControl, {
            label: __('Base-Pair Accent Color (Hex)', 'cas-ngs-biotech-blocks'),
            value: accentColor,
            onChange: function (val) {
              editPost({ meta: { _cas_dna_accent_color: val } });
            }
          }),
          el(RangeControl, {
            label: __('Ambient Lighting Intensity', 'cas-ngs-biotech-blocks'),
            value: ambientInt,
            min: 0.2,
            max: 4.0,
            step: 0.1,
            onChange: function (val) {
              editPost({ meta: { _cas_dna_ambient_intensity: val } });
            }
          })
        )
      );
    }

    wp.plugins.registerPlugin('cas-ngs-dna-page-settings', {
      render: CasDnaPageSettingsPanel,
      icon: 'visibility'
    });
  }

})();
