# Stacked Cards Settings

The block's layout is based on `stacked-cards/index.html`, with responsive rules in `assets/css/stacking-hero.css` and its scroll animation in `assets/js/stacking-hero.js`. The plugin uses a `100vh` stack container rather than the standalone example's `450vh`. The plugin also has additional mobile-specific layout and pinning rules.

## Original Section Dimensions

| Part | Original value | CSS location |
| --- | --- | --- |
| Intro spacer | `35vh` | `.hero-spacer` height |
| Standalone stack section | `450vh`; plugin uses `100vh` | `.stack-container` height |
| Desktop sticky stage | `calc(100vh - 120px)`, `top: 120px` | `.card-sticky-wrapper` |
| Sticky-stage overflow and top padding | `visible`; `40px` | `.card-sticky-wrapper` |
| Desktop card track | `1100px`, maximum `92vw` | `.cards-wrapper` |
| Desktop outer cards | `440px` high | `.cards-wrapper` and `.bio-card` |
| Desktop card radius | `28px` | `.bio-card` |
| Desktop card horizontal padding | `0 60px` | `.bio-card` |
| Desktop glass panel | `500px` max width; `30px 35px` padding; `20px` radius | `.bio-text-box` |
| Outro spacer | `40vh` | `.outro-spacer` |
| Scroll animation range | `+=3600` pixels | ScrollTrigger `end` in `assets/js/stacking-hero.js` |

For desktop, change both `.cards-wrapper` and `.bio-card` heights to the same value. Mobile intentionally uses different heights; see the step-by-step mobile instructions below. To change the track width, adjust its `width` and `max-width`. The outer card's horizontal padding and the glass panel's padding are independent controls.

## Original Image Geometry

Desktop image wrapper heights and anchors are independent by card:

| Card | Wrapper height | Anchor |
| --- | --- | --- |
| Plants | `165%` of card height | `right: 0; bottom: 0` |
| Humans | `135%` | `left: 10px; bottom: 0` |
| Animals | `125%` | `right: -60px; bottom: 0` |
| Microbes | `150%` | `left: 0; bottom: -50px` |

On desktop, adjust a wrapper's `height` percentage to scale its image. Adjust `left` or `right` to move it horizontally, and `bottom` to move it vertically. The image itself is `height: 100%`, `width: auto`, and `object-fit: contain`, so its aspect ratio is preserved. The corresponding selectors are `.card-plants .bio-image-wrapper`, `.card-humans .bio-image-wrapper`, `.card-animals .bio-image-wrapper`, and `.card-microbes .bio-image-wrapper`.

## Typography And Colors

Use the block sidebar for the intro heading, each card's tag/title/description, image URL or media selection, alt text, background hex color, font family, and font sizes. The CSS defaults mirror the source HTML: intro heading `2.8rem`; tags `0.8rem`; card titles `2.4rem`; descriptions `0.98rem`. Glass panel opacity, blur, text colors, and card shadows are also in `assets/css/stacking-hero.css`.

## Header Fit And Trailing Space

On desktop, `.card-sticky-wrapper` uses `top: 120px`, `height: calc(100vh - 120px)`, `overflow: visible`, and `padding-top: 40px`. On mobile, sticky positioning is disabled and the stage is translated down `120px`; these mobile overrides keep the cards clear of the fixed header. If the fixed header height changes, review the desktop `120px` values and the mobile stage rules together.

The standalone source uses `.stack-container { height: 450vh; }`; the plugin uses `100vh`. The animation uses `start: 'top top'`, `end: '+=3600'`, and the card tween timings in `assets/js/stacking-hero.js`.

## Mobile Card Position, Height, And Image — Step By Step

These settings are in the `@media (max-width: 768px)` section near the bottom of `assets/css/stacking-hero.css`. They affect the mobile layout only. You do not need to edit PHP, JavaScript, WordPress block settings, or `stacked-cards/index.html` to try these visual adjustments.

### Before changing anything

1. In WordPress, open **Plugins → Plugin File Editor** (the name or location can vary by WordPress version or hosting provider).
2. Select this plugin, then open `assets/css/stacking-hero.css`.
3. If WordPress does not show the file editor, or saving is disabled, do not try to work around the restriction. Ask the site administrator or host to edit the plugin file, or use the site's normal deployment method instead.
4. Copy the original mobile `@media (max-width: 768px)` section somewhere safe before editing, or save a copy of the original file. This gives you a straightforward way to undo a test.
5. Make one small adjustment at a time, save, and reload the page at the same mobile width to compare. If the change does not appear, clear any WordPress, CDN, or browser cache before changing more values.

### 1. Move the inner glass/text panel lower

Find this rule inside the mobile media query:

```css
.csh-root .bio-text-box {
    position: relative;
    transform: translateY(16px);
```

`translateY(16px)` moves only the inner panel **16 pixels down**. Increase `16px` to move it farther down; decrease it to move it less. For example, try `translateY(24px)`, check the result, and then adjust in small steps such as 4px. A positive number moves the panel down; a negative number moves it up.

This moves the panel without changing its width, padding, type sizes, or the outer card's position. Check that the panel and all its text remain inside the card after moving it.

### 2. Shorten the colored outer card without moving its top edge

Find the separate mobile rule:

```css
.csh-root .bio-card {
    height: 440px;
}
```

Lower `440px` to shorten the card. For example, try `400px` first. The card is positioned at the top of its `.cards-wrapper`, so leave the mobile `.cards-wrapper { height: 480px; }` unchanged while testing: this keeps the card track and its top position stable as the colored card's bottom edge moves upward. The card's width (`92vw`), its top edge, the stage position, and the image's horizontal placement are not controlled by this height value.

Reducing the card height makes its lower border higher, leaving more space below that border. The image is anchored to the card's bottom edge, so it moves upward with that edge. The image wrapper's height is currently a percentage of the card; without the next adjustment, lowering card height also makes the image smaller.

### 3. Keep the image the same size as the outer card gets shorter

Find this mobile rule:

```css
.csh-root .bio-card .bio-image-wrapper {
    ...
    height: 140%;
    ...
}
```

The image wrapper is `140%` of the outer card height. To preserve approximately the **same image height** when you shorten the card, increase this percentage in proportion to the height reduction. Use:

```text
new image-wrapper percentage = old percentage × old card height ÷ new card height
```

With the current values, the image wrapper is `140%` of a `440px` card, or about `616px` tall. Examples:

| New card height | Set image wrapper `height` to approximately | Why |
| --- | --- | --- |
| `420px` | `147%` | Keeps the wrapper near its current `616px` height |
| `400px` | `154%` | Keeps the wrapper near its current `616px` height |
| `380px` | `162%` | Keeps the wrapper near its current `616px` height |

Change only the `height` value in the mobile image-wrapper rule. Leave `bottom: 0`, `left: 50%`, `width: 100%`, and the image rule's `height: 100%`, `width: auto`, `max-width: 100%`, and `object-fit: contain` unchanged. This keeps the image centered and preserves its proportions while its bottom remains anchored to the shortened card. The image may peek farther above the card because the card's top stays fixed while its bottom moves up.

The formula preserves the wrapper's height, not necessarily every image's exact visible pixel size: `max-width: 100%` can constrain wide images on narrow phones. Check all four cards after changing it. If an image is clipped at the screen edge, restore `140%` or try a smaller percentage. Do not change `width`, `max-width`, or `object-fit` if you want to retain the current image width behavior.

### Safe testing order and example

Test these as a matched pair so the card gets shorter while the image stays close to its current size:

1. Change `.bio-card` from `440px` to `400px`.
2. Change the mobile image-wrapper height from `140%` to about `154%`.
3. Change the text panel from `translateY(16px)` to `translateY(24px)`.
4. Save, refresh, and inspect each card at phone width. Also check a narrow phone and a wider mobile/tablet width.
5. If the text panel touches or crosses the card's bottom edge, move it up a little or make the card slightly taller. If the image becomes too prominent, reduce the wrapper percentage a little.

These are starting values, not required final settings. To undo, restore the original mobile values: card `440px`, image wrapper `140%`, and child panel `translateY(16px)`. Do not change the mobile `.cards-wrapper` height (`480px`), the mobile stage's `transform: translateY(120px)`, or the widths while tuning these three controls; those affect the card track's placement or sizing rather than just the bottom space.
