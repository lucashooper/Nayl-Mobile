# Nayl Screenshot Studio

A local React (Vite) editor for the App Store screenshots, in a Cal AI style: one bold
solid-colour title, the phone below, and a floating card that overhangs the phone. It
exports five 1290 × 2796 PNGs (6.7"/6.9" iPhone size): lossless, RGB with no alpha,
with 300 DPI written into the PNG's pHYs chunk.

## Run it

```
cd tools/screenshot-studio
npm install
npm run dev
```

The editor opens at http://localhos## What's in the editor

- **Typography**: Modern Sans (Manrope), Inter, SF Pro (the system font on a Mac), Clean Serif
  (Playfair Display), Rounded (SF Pro Rounded on a Mac, Nunito elsewhere); weight, size,
  letter spacing (-0.05em to 0.1em) and a solid title colour (default #FFFFFF).
- **Background**: Deep Violet (#0B0714 to #180D2B with a soft purple glow) by default, other
  presets, custom top/bottom/glow hex colours, and a soft mesh glow or grain texture.
- **Device frame**: iPhone 16 Pro in Natural Titanium, Midnight or Starlight, with shadow and glow
  toggles, frame scale, and optional floating call-out cards.
- **Canvas padding**: top (canvas edge to title) and bottom (phone to canvas edge; negative lets
  the phone run off the bottom).
- **Headlines** for all five frames.
- **Export folder** (default `./assets/app-store-screenshots/`, relative to the repo root) and
  **Export All**:
  - *Save PNGs into the export folder*: writes the five files straight into that folder. This uses
    a small endpoint in the Vite dev server (`studio-server.js`), so it works while the studio runs
    through `npm run dev`; the folder must be inside the repo.
  - *Download one ZIP*: the ZIP contains the export folder path with the five PNGs inside.
  - *Download 5 separate PNGs*.
  Each frame also has its own **PNG** download button.

Settings are saved in the browser (localStorage).

ch frame also has its own **PNG** button.

Settings are saved in the browser (localStorage).

## Device screens

The five device screens are HTML rebuilds of the app's screens, using the app's own colours,
Inter font and full-resolution artwork straight from `assets/` (flame, panic-button icons,
mountain, sound icons, achievement badges). They use sample data (a 14-day streak, "James"),
not simulator captures.

The home-screen orb (`src/screens/NaylOrb.jsx`) is a direct port of the production orb:
`src/components/SwirlingOrb.tsx` (cool-orb.webp plus its eight gradient layers, same colours
and opacities) with the `ProgressRing` that `HomeScreen.tsx` renders inside it (Ocean Blue
gradient on the lime track) and the `SHADOWS.orbGlow` glow. In the app the layers rotate; the
studio shows the frame where every rotation is 0deg.

Frame 5 shows two big Nail Progress photos (Day 1 and Day 14) from `nail-photos/`. To replace them, use the "Nail Progress photos"
section in the sidebar, or save `day-1` and `day-14` (.jpg, .png or .webp) in
`nail-photos/` and note their source and licence in `nail-photos/CREDITS.md`.

Frame 3's Analytics ring is the native 360pt ring, scaled up about its centre (1.18× by
default, adjustable in the sidebar) so it pops out over the phone.

To use a real capture instead, click **Use real capture** under a frame (or drop an image on it).
Raw @3x simulator PNGs (1179 × 2556 from an iPhone 16 Pro, 1320 × 2868 from a Pro Max) are used
as-is: the export renders at the native 1290 × 2796 with no upscaling and no lossy compression.
At the default frame scale the screen area is about 924 px wide, so a 1179 px capture is scaled
down, never up. The floating call-out is hidden on frames that use a real capture.

## Files

- `src/screens/` – the device-screen mocks, the ported orb, the floating call-outs and `Squircle.jsx` (iOS continuous-corner cards).
- `studio-server.js` – the dev-server endpoint that writes exports into the repo.
- `src/components/Frame.jsx` – one 1290 × 2796 frame (background, text, device, call-out).
- `src/components/Device.jsx` – the iPhone 16 Pro frame.
- `src/export.js`, `src/png.js` – rendering (html-to-image) and the RGB + 300 DPI PNG encoder.
- `src/config.js` – fonts, background presets, finishes and the default text for each frame.

The older single-page generator (`tools/app-store-screenshots/`) is still there; this studio replaces it
for the redesigned 5-frame set.
