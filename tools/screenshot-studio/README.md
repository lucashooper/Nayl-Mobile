# Nayl Screenshot Studio

A local React (Vite) editor for the App Store screenshots. It renders five frames
and exports them as 1290 × 2796 PNGs (6.7"/6.9" iPhone size), RGB with no alpha,
with 300 DPI written into the PNG's pHYs chunk.

## Run it

```
cd tools/screenshot-studio
npm install
npm run dev
```

The editor opens at http://localhost:5178. Everything (fonts, app artwork) is bundled,
so it works offline after `npm install`.

## What's in the editor

- **Typography**: Modern Sans (Manrope), Inter, SF Pro (the system font on a Mac), Clean Serif
  (Playfair Display), Rounded (SF Pro Rounded on a Mac, Nunito elsewhere); weights, sizes and
  headline/subtitle/accent colours. Wrap words in `*stars*` to colour them with the accent.
- **Background**: dark and light gradient presets, a custom two-hex gradient, and mesh/grain textures.
- **Device frame**: iPhone 16 Pro in Natural Titanium, Midnight or Starlight, with shadow and glow
  toggles, size and position sliders, and optional floating call-out cards.
- **Headlines & subtitles** for all five frames.
- **Export All** renders all five frames and downloads one ZIP (or five separate PNGs, set in the
  Export section). Each frame also has its own **PNG** button.

Settings are saved in the browser (localStorage).

## Device screens

The five device screens are HTML rebuilds of the app's screens, using the app's own colours,
Inter font and artwork straight from `assets/` (orb, flame, panic-button icons, mountain,
sound icons, achievement badges). They are mocks with sample data (a 14-day streak, "James"),
not simulator captures.

To use a real capture instead, click **Use real capture** under a frame (or drop an image on it).
For sharp results use a 1179 × 2556 or 1290 × 2796 screenshot from an iPhone 16 Pro / Pro Max
simulator. The floating call-out is hidden on frames that use a real capture.

## Files

- `src/screens/` – the device-screen mocks and the floating call-outs for each frame.
- `src/components/Frame.jsx` – one 1290 × 2796 frame (background, text, device, call-out).
- `src/components/Device.jsx` – the iPhone 16 Pro frame.
- `src/export.js`, `src/png.js` – rendering (html-to-image) and the RGB + 300 DPI PNG encoder.
- `src/config.js` – fonts, background presets, finishes and the default text for each frame.

The older single-page generator (`tools/app-store-screenshots/`) is still there; this studio replaces it
for the redesigned 5-frame set.
