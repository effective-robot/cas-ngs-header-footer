(function (wp) {
	'use strict';

	var el = wp.element.createElement;
	var registerBlockType = wp.blocks.registerBlockType;
	var blockEditor = wp.blockEditor;
	var components = wp.components;
	var InspectorControls = blockEditor.InspectorControls;
	var MediaUpload = blockEditor.MediaUpload;
	var MediaUploadCheck = blockEditor.MediaUploadCheck;
	var PanelBody = components.PanelBody;
	var TextControl = components.TextControl;
	var TextareaControl = components.TextareaControl;
	var SelectControl = components.SelectControl;
	var RangeControl = components.RangeControl;
	var Button = components.Button;

	var defaults = [
		{ tag: '[ 01 • PLANT GENOMICS ]', title: 'We Study Plants', description: 'Decoding complex plant genomes, promoter motifs, and transcriptional signatures to engineer climate-resilient crops and secure future agricultural yields.', imageUrl: '', imageAlt: 'Sunflower', backgroundColor: '#d89972' },
		{ tag: '[ 02 • HUMAN HEALTH ]', title: 'We Study Humans', description: 'Unlocking genetic blueprints and deep biomarker pathways to accelerate precision medicine, diagnostics, and breakthrough therapeutic discoveries.', imageUrl: '', imageAlt: 'Human DNA Study', backgroundColor: '#b3805d' },
		{ tag: '[ 03 • ANIMAL BIOTECH ]', title: 'We Study Animals', description: 'Advancing comparative genomics and molecular selection to optimize livestock health, breeding efficiency, and sustainable agricultural productivity.', imageUrl: '', imageAlt: 'Animal Study', backgroundColor: '#e6c8b3' },
		{ tag: '[ 04 • METAGENOMICS ]', title: 'We Study Microbes', description: 'Exploring complex microbial ecosystems and plant-microbe interactions to pioneer next-generation industrial and environmental biotech solutions.', imageUrl: '', imageAlt: 'Fungi and Bacteria Study', backgroundColor: '#c29b7a' }
	];

	var fields = [ [ 'tag', 'Tag' ], [ 'title', 'Title' ], [ 'description', 'Description' ], [ 'imageAlt', 'Image alt text' ], [ 'imageUrl', 'Image URL' ], [ 'backgroundColor', 'Card background hex color' ] ];

	registerBlockType('cas-ngs/stacking-hero', {
		apiVersion: 3,
		title: 'Stacking Hero',
		category: 'cas-ngs-biotech',
		icon: 'images-alt2',
		attributes: {
			introTitle: { type: 'string', default: 'Scroll Down to Explore Our Core Disciplines' },
			cards: { type: 'array', default: defaults },
			fontFamily: { type: 'string', default: 'Plus Jakarta Sans' },
			titleFontSize: { type: 'number', default: 2.4 },
			descriptionFontSize: { type: 'number', default: 0.98 },
			tagFontSize: { type: 'number', default: 0.8 }
		},
		edit: function (props) {
			var cards = props.attributes.cards || defaults;

			function updateCardValues(index, values) {
				var next = cards.map(function (item) { return Object.assign({}, item); });
				Object.keys(values).forEach(function (key) { next[index][key] = values[key]; });
				props.setAttributes({ cards: next });
			}

			function updateCard(index, key, value) {
				var values = {};
				values[key] = value;
				updateCardValues(index, values);
			}

			var panels = cards.map(function (card, index) {
				var controls = fields.map(function (field) {
					if (field[0] === 'imageUrl') {
						return el('div', { key: field[0] },
							el(TextControl, { label: field[1], value: card.imageUrl || '', onChange: function (value) { updateCard(index, 'imageUrl', value); } }),
							el(MediaUploadCheck, null, el(MediaUpload, {
								allowedTypes: [ 'image' ], value: card.imageId,
								onSelect: function (media) {
										var imageValues = { imageUrl: media.url, imageId: media.id };
										if (media.alt) imageValues.imageAlt = media.alt;
										updateCardValues(index, imageValues);
								},
								render: function (upload) { return el(Button, { variant: 'secondary', onClick: upload.open }, 'Choose image'); }
							}))
						);
					}
					var Control = field[0] === 'description' ? TextareaControl : TextControl;
					return el(Control, { key: field[0], label: field[1], value: card[field[0]] || '', onChange: function (value) { updateCard(index, field[0], value); } });
				});
				return el(PanelBody, { key: index, title: 'Card ' + (index + 1), initialOpen: index === 0 }, controls);
			});

			return el('div', blockEditor.useBlockProps({ className: 'csh-editor-preview' }),
				el(InspectorControls, null,
					el(PanelBody, { title: 'Section and typography', initialOpen: true },
						el(TextControl, { label: 'Intro heading', value: props.attributes.introTitle, onChange: function (value) { props.setAttributes({ introTitle: value }); } }),
						el(SelectControl, { label: 'Font family', value: props.attributes.fontFamily, options: [
							{ label: 'Plus Jakarta Sans', value: 'Plus Jakarta Sans' }, { label: 'Arial', value: 'Arial, sans-serif' },
							{ label: 'Georgia', value: 'Georgia, serif' }, { label: 'Theme default', value: 'inherit' }
						], onChange: function (value) { props.setAttributes({ fontFamily: value }); } }),
						el(RangeControl, { label: 'Title size (rem)', value: props.attributes.titleFontSize, min: 1, max: 5, step: 0.1, onChange: function (value) { props.setAttributes({ titleFontSize: value }); } }),
						el(RangeControl, { label: 'Description size (rem)', value: props.attributes.descriptionFontSize, min: 0.6, max: 2, step: 0.02, onChange: function (value) { props.setAttributes({ descriptionFontSize: value }); } }),
						el(RangeControl, { label: 'Tag size (rem)', value: props.attributes.tagFontSize, min: 0.5, max: 1.5, step: 0.05, onChange: function (value) { props.setAttributes({ tagFontSize: value }); } })
					), panels),
					el('strong', null, props.attributes.introTitle || 'Stacking Hero'),
					el('p', null, 'Four stacked cards. Edit section typography and each card in the block settings.')
				);
		},
		save: function () { return null; }
	});
})(window.wp);