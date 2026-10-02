# Stacked Cards Settings

The block keeps the standalone card and image dimensions by default. The frontend stylesheet is `assets/css/stacking-hero.css`; the header-aware stage sizing and scroll trigger are in `assets/js/stacking-hero.js`.

## Main Dimensions

| Part | Current setting | What it controls |
| --- | --- | --- |
| Card width | `width: 1100px; max-width: 92vw` | Maximum card width and its mobile/tablet width |
| Card height | `height: 440px` on `.cards-wrapper` and `.bio-card` | Fixed outer card height |
| Section scroll length | `height: 100vh` on `.stack-container` | The unpinned section's layout height; the cards are pinned for the animation range in the JS |
| Pin duration | `window.innerHeight * 3` in `assets/js/stacking-hero.js` | Scroll distance used to reveal all four cards |
| Card corner radius | `border-radius: 28px` on `.bio-card` | Outer card corners |
| Card horizontal inset | `padding: 0 60px` on `.bio-card` | Distance of the text panel from the card edges |

To change the desktop card size, edit both `.cards-wrapper` and `.bio-card` consistently. Keep their heights equal so the image anchors and card stack continue to line up. The `max-width: 92vw` rule makes the card track narrower on small screens without reducing its height.

## Image Size And Position

Each image wrapper is anchored to the card and sized independently:

| Card | Wrapper height | Position |
| --- | --- | --- |
| Plants | `165%` of the card | `right: 0; bottom: 0` |
| Humans | `135%` of the card | `left: 10px; bottom: 0` |
| Animals | `125%` of the card | `right: -60px; bottom: 0` |
| Microbes | `150%` of the card | `left: 0; bottom: -50px` |

These values are the original standalone proportions. Increase or decrease a wrapper's `height` percentage to scale that image. Adjust its `left`/`right` and `bottom` values to reposition it. The nested `img` uses `height: 100%`, `width: auto`, and `object-fit: contain`, preserving the source image ratio.

## Text Panel And Spacing

The glass text panel is controlled by `.bio-text-box`: `max-width: 500px`, `padding: 30px 35px`, `border-radius: 20px`, and its translucent background and blur. The card's horizontal padding is separate from the panel padding. Use the Gutenberg sidebar for each card's text, image, alt text, background color, and typography; use these CSS rules for layout and image placement.

## Header Clearance And Vertical Placement

The script measures the visible site header from `.cas-header`, `.cas-header-dock-wrap`, or `.animated-top-dock-component.atd-modern`, then adds a 16px clearance. `--csh-header-offset` controls the sticky stage's top and usable height. `margin-top: clamp(96px, 12vh, 128px)` on `.csh-root` provides the initial gap from the preceding section.

`--csh-card-shift` positions the original 440px card and its tallest image below the header without shrinking either. Its calculation in `updateStageSize()` uses the remaining viewport height. To manually change the initial gap, adjust the `margin-top` clamp. To change the header breathing room, adjust the `+ 16` in `updateStageSize()`; the value is in pixels.

The fixed 440px card and original image proportions are retained even on short viewports. If the available space is less than the combined header clearance and image overhang, some image overflow may extend beyond the visible screen; reducing image dimensions would be needed to make that fit on unusually short screens.