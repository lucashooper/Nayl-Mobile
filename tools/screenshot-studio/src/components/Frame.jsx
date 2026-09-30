import { forwardRef } from 'react';
import { BACKGROUNDS, CANVAS, FONTS } from '../config.js';
import Device, { deviceMetrics, SCREEN_PT } from './Device.jsx';
import { SCREEN_COMPONENTS } from '../screens/index.jsx';

const GRAIN = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0.55 0'/></filter><rect width='300' height='300' filter='url(#n)'/></svg>",
)}")`;

// Resolved look shared by every frame.
export function resolveTheme(s) {
  const preset = BACKGROUNDS[s.background] ?? BACKGROUNDS.violet;
  const from = s.customBg ? s.customFrom : preset.from;
  const to = s.customBg ? s.customTo : preset.to;
  const glow = s.customBg ? s.customGlow : preset.glow;
  const dark = s.customBg ? isDark(from) : preset.dark;
  return {
    dark,
    from,
    to,
    glow,
    headline: s.headlineColor || (dark ? '#FFFFFF' : '#141414'),
    font: (FONTS[s.font] ?? FONTS.modern).stack,
  };
}

function isDark(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
  if (!m) return true;
  const n = parseInt(m[1], 16);
  const lum = 0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255);
  return lum < 140;
}

const Frame = forwardRef(function Frame({ state, frame, image, photos }, ref) {
  const t = resolveTheme(state);
  const texture = state.texture;
  const strength = state.textureStrength / 100;

  const phone = deviceMetrics(Math.round(1000 * (state.phoneScale / 100)));
  phone.x = (CANVAS.width - phone.width) / 2;
  phone.y = CANVAS.height - state.bottomPadding - phone.height;
  const Screen = SCREEN_COMPONENTS[frame.screen];

  return (
    <div
      ref={ref}
      style={{
        position: 'relative',
        width: CANVAS.width,
        height: CANVAS.height,
        overflow: 'hidden',
        background: `linear-gradient(180deg, ${t.from} 0%, ${t.to} 100%)`,
        fontFamily: t.font,
      }}
    >
      {/* Soft radial glow at the centre of the canvas, behind the phone. */}
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(60% 38% at 50% 52%, ${t.glow}${t.dark ? '40' : '30'} 0%, ${t.glow}14 55%, transparent 100%)` }} />
      {(texture === 'mesh' || texture === 'both') && (
        <div style={{ position: 'absolute', inset: 0, opacity: strength }}>
          <div style={{ position: 'absolute', left: -380, top: 260, width: 1000, height: 1000, borderRadius: '50%', background: t.glow, opacity: t.dark ? 0.22 : 0.25, filter: 'blur(200px)' }} />
          <div style={{ position: 'absolute', right: -420, top: 1500, width: 1100, height: 1100, borderRadius: '50%', background: t.glow, opacity: t.dark ? 0.18 : 0.2, filter: 'blur(220px)' }} />
        </div>
      )}
      {(texture === 'grain' || texture === 'both') && (
        <div style={{ position: 'absolute', inset: 0, backgroundImage: GRAIN, backgroundSize: '300px 300px', opacity: 0.3 * strength, mixBlendMode: t.dark ? 'screen' : 'multiply' }} />
      )}

      <div
        style={{
          position: 'absolute',
          left: 70,
          right: 70,
          top: state.topPadding,
          textAlign: 'center',
          color: t.headline,
          fontSize: state.headlineSize,
          fontWeight: state.headlineWeight,
          lineHeight: 1.08,
          letterSpacing: `${state.letterSpacing}em`,
          whiteSpace: 'pre-line',
        }}
      >
        {frame.headline}
      </div>

      <div style={{ position: 'absolute', left: phone.x, top: phone.y }}>
        <Device metrics={phone} finish={state.finish} shadow={state.shadow} glow={state.glow} glowColor={t.glow}>
          {image ? (
            <img src={image} alt="" style={{ width: SCREEN_PT.width, height: SCREEN_PT.height, objectFit: 'cover', display: 'block' }} />
          ) : (
            Screen && <Screen.Screen popped={state.showCallouts && !!Screen.Callout} photos={photos} />
          )}
        </Device>
      </div>

      {state.showCallouts && !image && Screen?.Callout && <Screen.Callout phone={phone} shadow={state.shadow} photos={photos} popScale={state.ringPopScale} />}
    </div>
  );
});

export default Frame;
