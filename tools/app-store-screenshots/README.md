# Nayl App Store screenshot generator

A standalone page that builds the App Store marketing screenshots (parchment background, serif headlines, device frames, laurel badges, zoom call-outs) and exports them at exact App Store sizes.

## Use it

Open `index.html` in Chrome or Safari (double-click works, no server needed).

- Pick a size tab to preview: iPhone 6.7" (1290×2796), iPhone 6.5" (1284×2778), iPad Pro 12.9" (2048×2732).
- Click a slide to edit its headline, subheadline, layout, laurel badge, zoom call-outs and floating labels in the right panel. Wrap words in `*stars*` to colour them with the accent colour.
- Drag a screenshot onto any slide to replace it. With the iPad tab selected the drop sets that slide's iPad capture; slides with no iPad capture show the iPhone frame on the iPad canvas.
- **Export All Resolutions** downloads `nayl-app-store-screenshots.zip` with one folder per size. **Download** in the panel saves just the selected slide at the current size.

Edits are saved in the browser (text in localStorage, uploaded images in IndexedDB). "Reset everything to defaults" clears them.

## Default screens

The built-in screens in `default-screens/` are cropped from the current App Store listing, so they are low resolution. For the final export, drop in fresh captures from a 6.7" simulator or device (1290×2796 PNG).

To change the built-in set, edit the images in `default-screens/` and run:

```
node tools/app-store-screenshots/build-defaults.mjs
```

That inlines them into `defaults.js` (inlining keeps the export canvas untainted when the page is opened from `file://`).

## Files

- `render.js`: the canvas renderer (background, device frames, text, badge, call-outs). The preview and the export use the same code.
- `app.js`: editor UI, persistence and export.
- `styles.css`: prebuilt Tailwind output from `styles.src.css`. Rebuild after changing classes with `npx tailwindcss@3 -c tools/app-store-screenshots/tailwind.config.js -i tools/app-store-screenshots/styles.src.css -o tools/app-store-screenshots/styles.css --minify`.
- `vendor/jszip.min.js`: JSZip 3.10.1 (MIT) for the zip export.

Fonts (DM Serif Display, Playfair Display, Fraunces, Libre Caslon Text, Inter) load from Google Fonts, so the page needs a network connection for the right typefaces.
