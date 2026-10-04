# Stacked Cards Settings

The block's structure, dimensions, spacing, colors, image placement, and GSAP timeline follow `stacked-cards/index.html`. The only layout exception is that the block's `.stack-container` is `100vh` instead of `450vh` to remove the excess section tail. Styles are in `assets/css/stacking-hero.css`; animation is in `assets/js/stacking-hero.js`.

## Original Section Dimensions

| Part | Original value | CSS location |
| --- | --- | --- |
| Intro spacer | `35vh` | `.hero-spacer` height |
| Source stack section | `450vh`; plugin uses `100vh` to remove the excess section tail | `.stack-container` height |
| Sticky stage | `calc(100vh - 120px)`, `top: 120px` | `.card-sticky-wrapper` |
| Sticky-stage overflow and top padding | `visible`; `40px` | `.card-sticky-wrapper` |
| Card track | `1100px`, maximum `92vw` | `.cards-wrapper` |
| Outer cards | `440px` high | `.cards-wrapper` and `.bio-card` |
| Card radius | `28px` | `.bio-card` |
| Card horizontal padding | `0 60px` | `.bio-card` |
| Glass panel | `500px` max width; `30px 35px` padding; `20px` radius | `.bio-text-box` |
| Outro spacer | `40vh` | `.outro-spacer` |
| Scroll animation range | `+=3600` pixels | ScrollTrigger `end` in `assets/js/stacking-hero.js` |

To change outer card height, change both `.cards-wrapper` and `.bio-card` heights to the same value. To change the track width, adjust its `width` and `max-width`. The outer card's horizontal padding and glass panel's padding are independent controls.

## Original Image Geometry

Image wrapper heights and anchors are independent by card:

| Card | Wrapper height | Anchor |
| --- | --- | --- |
| Plants | `165%` of card height | `right: 0; bottom: 0` |
| Humans | `135%` | `left: 10px; bottom: 0` |
| Animals | `125%` | `right: -60px; bottom: 0` |
| Microbes | `150%` | `left: 0; bottom: -50px` |

Adjust a wrapper's `height` percentage to scale its image. Adjust `left` or `right` to move it horizontally, and `bottom` to move it vertically. The image itself is `height: 100%`, `width: auto`, and `object-fit: contain`, so its aspect ratio is preserved. The corresponding CSS selectors are `.card-plants .bio-image-wrapper`, `.card-humans .bio-image-wrapper`, `.card-animals .bio-image-wrapper`, and `.card-microbes .bio-image-wrapper`.

## Typography And Colors

Use the block sidebar for the intro heading, each card's tag/title/description, image URL or media selection, alt text, background hex color, font family, and font sizes. The CSS defaults mirror the source HTML: intro heading `2.8rem`; tags `0.8rem`; card titles `2.4rem`; descriptions `0.98rem`. Glass panel opacity, blur, text colors, and card shadows are also in `assets/css/stacking-hero.css`.

## Header Fit And Trailing Space

The source HTML sets `.card-sticky-wrapper` to `top: 120px`, `height: calc(100vh - 120px)`, `overflow: visible`, and `padding-top: 40px`; these values are copied directly into the block CSS. If the fixed header height changes, update both `120px` values in `top` and `height` together. The 40px padding independently controls internal stage breathing room.

The standalone source uses `.stack-container { height: 450vh; }`. The plugin uses `100vh` as the requested tail-space adjustment. The animation itself still uses `start: 'top top'`, `end: '+=3600'`, and the source's card tween timings. On leaving the pinned section, the source's overflow fix is applied to that block's own stack container. To restore the full standalone section height, change only `.stack-container` back to `450vh`.