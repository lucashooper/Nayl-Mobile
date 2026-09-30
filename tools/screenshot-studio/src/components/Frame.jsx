import { forwardRef } from 'react';
import { BACKGROUNDS, CANVAS, FONTS } from '../config.js';
import Device, { SCREEN_PT } from './Device.jsx';
import { SCREEN_COMPONENTS } from '../screens/index.jsx';

const GRAIN = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0.55 0'/></filter><rect width='300' height='300' filter='url(#n)'/></svg>",
)}")`;

// Resolved look shared by every frame (colours fall back to the background preset).
export function resolveTheme(s) {
  const preset = BACKGROUNDS[s.background] ?? BACKGROUNDS.midnight;
  const dark = s.customBg ? isDark(s.customFrom) : preset.dark;
  return {
    dark,
    bg: s.customBg ? `linear-gradient(180deg, ${s.customFrom} 0%, ${s.customTo} 100%)` : preset.css,
    accent: s.accentColor || (s.customBg ? '#7fb2ff' : preset.accent),
    glow: s.customBg ? s.accentColor || '#7fb2ff' : preset.glow,
    headline: s.headlineColor || (dark ? '#ffffff' : '#141414'),
    subtitle: s.subtitleColor || (dark ? 'rgba(255,255,255,0.68)' : 'rgba(20,20,20,0.62)'),
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

// "*word*" renders in the accent colour.
function Rich({ text, accent }) {
  return text.split('\n').map((line, i) => (
    <div key={i}>
      {line.split(/(\*[^*]+\*)/g).map((part, j) =>
        part.startsWith('*') && part.endsWith('*') && part.length > 2 ? (
          <span key={j} style={{ color: accent }}>{part.slice(1, -1)}</span>
        ) : (
          <span key={j}>{part}</span>
        ),
      )}
    </div>
  ));
}

const Frame = forwardRef(function Frame({ state, frame, image }, ref) {
  const t = resolveTheme(state);
  const texture = state.texture;
  const strength = state.textureStrength / 100;

  const phoneW = Math.round(1000 * (state.phoneScale / 100));
  const phoneX = (CANVAS.width - phoneW) / 2;
  const phoneY = state.phoneTop;
  const Screen = SCREEN_COMPONENTS[frame.screen];

  return (
    <div
      ref={ref}
      style={{
        position: 'relative',
        width: CANVAS.width,
        height: CANVAS.height,
        overflow: 'hidden',
        background: t.bg,
        fontFamily: t.font,
      }}
    >
      {(texture === 'mesh' || texture === 'both') && (
        <div style={{ position: 'absolute', inset: 0, opacity: strength }}>
          <div style={{ position: 'absolute', left: -300, top: 420, width: 900, height: 900, borderRadius: '50%', background: t.glow, opacity: t.dark ? 0.28 : 0.35, filter: 'blur(160px)' }} />
          <div style={{ position: 'absolute', right: -320, top: 1350, width: 1000, height: 1000, borderRadius: '50%', background: t.accent, opacity: t.dark ? 0.2 : 0.3, filter: 'blur(180px)' }} />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `linear-gradient(${t.dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.045)'} 2px, transparent 2px), linear-gradient(90deg, ${t.dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.045)'} 2px, transparent 2px)`,
              backgroundSize: '86px 86px',
              maskImage: 'radial-gradient(90% 60% at 50% 35%, #000 0%, transparent 80%)',
              WebkitMaskImage: 'radial-gradient(90% 60% at 50% 35%, #000 0%, transparent 80%)',
            }}
          />
        </div>
      )}
      {(texture === 'grain' || texture === 'both') && (
        <div style={{ position: 'absolute', inset: 0, backgroundImage: GRAIN, backgroundSize: '300px 300px', opacity: 0.35 * strength, mixBlendMode: t.dark ? 'screen' : 'multiply' }} />
      )}

      <div style={{ position: 'absolute', left: 90, right: 90, top: 200, textAlign: 'center' }}>
        <div
          style={{
            color: t.headline,
            fontSize: state.headlineSize,
            fontWeight: state.headlineWeight,
            lineHeight: 1.06,
            letterSpacing: state.font === 'serif' ? '-0.01em' : '-0.035em',
          }}
        >
          <Rich text={frame.headline} accent={t.accent} />
        </div>
        {frame.subtitle && (
          <div style={{ marginTop: 44, color: t.subtitle, fontSize: state.subtitleSize, fontWeight: state.subtitleWeight, lineHeight: 1.3, letterSpacing: '-0.01em' }}>
            {frame.subtitle}
          </div>
        )}
      </div>

      <div style={{ position: 'absolute', left: phoneX, top: phoneY }}>
        <Device width={phoneW} finish={state.finish} shadow={state.shadow} glow={state.glow} glowColor={t.glow}>
          {image ? (
            <img src={image} alt="" style={{ width: SCREEN_PT.width, height: SCREEN_PT.height, objectFit: 'cover', display: 'block' }} />
          ) : (
            Screen && <Screen.Screen />
          )}
        </Device>
      </div>

      {state.showCallouts && !image && Screen?.Callout && (
        <Screen.Callout phone={{ x: phoneX, y: phoneY, w: phoneW }} theme={t} shadow={state.shadow} />
      )}
    </div>
  );
});

export default Frame;
