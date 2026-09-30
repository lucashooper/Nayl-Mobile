import { FINISHES } from '../config.js';

// iPhone 16 Pro: 393 x 852 pt screen. Everything is sized from `width` (outer frame, px).
export const SCREEN_PT = { width: 393, height: 852 };

export default function Device({ width, finish, shadow, glow, glowColor, children }) {
  const f = FINISHES[finish] ?? FINISHES.midnight;
  const rim = width * 0.012; // metal band
  const bezel = width * 0.026; // black glass border
  const screenW = width - 2 * (rim + bezel);
  const scale = screenW / SCREEN_PT.width;
  const screenH = SCREEN_PT.height * scale;
  const height = screenH + 2 * (rim + bezel);
  const outerR = width * 0.155;
  const screenR = outerR - rim - bezel;

  const button = (side, top, h) => ({
    position: 'absolute',
    [side]: -width * 0.0085,
    top: height * top,
    width: width * 0.011,
    height: height * h,
    borderRadius: width * 0.006,
    background: f.frame,
    boxShadow: `inset 0 0 0 1px ${f.edge}55`,
  });

  return (
    <div style={{ position: 'relative', width, height }}>
      {glow && (
        <div
          style={{
            position: 'absolute',
            inset: `-${width * 0.18}px`,
            background: `radial-gradient(closest-side, ${glowColor}88 0%, ${glowColor}33 45%, transparent 75%)`,
            filter: `blur(${width * 0.05}px)`,
          }}
        />
      )}
      <div style={button('left', 0.165, 0.035)} />
      <div style={button('left', 0.225, 0.062)} />
      <div style={button('left', 0.3, 0.062)} />
      <div style={button('right', 0.25, 0.1)} />
      <div style={button('right', 0.46, 0.055)} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: outerR,
          background: f.frame,
          padding: rim,
          boxShadow: shadow
            ? `0 ${width * 0.06}px ${width * 0.12}px rgba(0,0,0,0.55), 0 ${width * 0.015}px ${width * 0.03}px rgba(0,0,0,0.35), inset 0 0 0 ${Math.max(1, width * 0.0015)}px ${f.edge}`
            : `inset 0 0 0 ${Math.max(1, width * 0.0015)}px ${f.edge}`,
        }}
      >
        <div style={{ width: '100%', height: '100%', borderRadius: outerR - rim, background: '#000', padding: bezel }}>
          <div style={{ position: 'relative', width: screenW, height: screenH, borderRadius: screenR, overflow: 'hidden', background: '#000' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, width: SCREEN_PT.width, height: SCREEN_PT.height, transform: `scale(${scale})`, transformOrigin: '0 0' }}>
              {children}
            </div>
            {/* Dynamic Island */}
            <div
              style={{
                position: 'absolute',
                top: 11 * scale,
                left: '50%',
                width: 124 * scale,
                height: 36 * scale,
                marginLeft: -62 * scale,
                borderRadius: 18 * scale,
                background: '#000',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
