import { FINISHES } from '../config.js';
import { IPAD_PT, IPHONE_PT, ScreenSize } from '../screens/kit.jsx';

// iPhone 16 Pro: 393 x 852 pt screen. Everything is sized from `width` (outer frame, px).
export const SCREEN_PT = IPHONE_PT;

// Call-outs are drawn in points at 1.36x the screen's point scale (3.2 x width / 1000
// on the iPhone), overhanging the device by about 4% on each side.
const CALLOUT_RATIO = 1.3612;

// Outer size, screen inset, point-to-pixel scale and call-out sizing for a device
// `width` px wide. kind: 'iphone' or 'ipad'.
export function deviceMetrics(width, kind = 'iphone') {
  const ipad = kind === 'ipad';
  const pt = ipad ? IPAD_PT : IPHONE_PT;
  const rim = width * (ipad ? 0.007 : 0.012); // metal band
  const bezel = width * (ipad ? 0.036 : 0.026); // black glass border (thin on iPad Pro)
  const inset = rim + bezel;
  const scale = (width - 2 * inset) / pt.width;
  const callout = scale * CALLOUT_RATIO;
  const cardPt = Math.round((width * (ipad ? 0.9 : 1.088)) / callout);
  return { kind, pt, width, height: pt.height * scale + 2 * inset, rim, bezel, inset, scale, callout, cardPt };
}

export default function Device({ metrics, ...props }) {
  return (
    <ScreenSize.Provider value={metrics.pt}>
      {metrics.kind === 'ipad' ? <IPad metrics={metrics} {...props} /> : <IPhone metrics={metrics} {...props} />}
    </ScreenSize.Provider>
  );
}

function Glow({ width, color }) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: `-${width * 0.18}px`,
        background: `radial-gradient(closest-side, ${color}88 0%, ${color}33 45%, transparent 75%)`,
        filter: `blur(${width * 0.05}px)`,
      }}
    />
  );
}

function IPhone({ metrics, finish, shadow, glow, glowColor, children }) {
  const f = FINISHES[finish] ?? FINISHES.midnight;
  const { width, height, rim, bezel, scale, pt } = metrics;
  const screenW = pt.width * scale;
  const screenH = pt.height * scale;
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
      {glow && <Glow width={width} color={glowColor} />}
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
            <div style={{ position: 'absolute', left: 0, top: 0, width: pt.width, height: pt.height, transform: `scale(${scale})`, transformOrigin: '0 0' }}>
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

// iPad Pro 12.9" (portrait): thin even bezel, softly rounded corners, front camera
// in the top bezel, top button and volume keys on the edges.
function IPad({ metrics, finish, shadow, glow, glowColor, children }) {
  const f = FINISHES[finish] ?? FINISHES.midnight;
  const { width, height, rim, bezel, scale, pt } = metrics;
  const screenW = pt.width * scale;
  const screenH = pt.height * scale;
  const outerR = width * 0.07;
  const screenR = outerR - rim - bezel * 0.75;
  const key = (style) => ({ position: 'absolute', borderRadius: width * 0.004, background: f.frame, boxShadow: `inset 0 0 0 1px ${f.edge}55`, ...style });

  return (
    <div style={{ position: 'relative', width, height }}>
      {glow && <Glow width={width} color={glowColor} />}
      <div style={key({ top: -width * 0.005, right: width * 0.1, width: width * 0.06, height: width * 0.008 })} />
      <div style={key({ right: -width * 0.005, top: height * 0.07, width: width * 0.008, height: height * 0.045 })} />
      <div style={key({ right: -width * 0.005, top: height * 0.125, width: width * 0.008, height: height * 0.045 })} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: outerR,
          background: f.frame,
          padding: rim,
          boxShadow: shadow
            ? `0 ${width * 0.05}px ${width * 0.1}px rgba(0,0,0,0.55), 0 ${width * 0.012}px ${width * 0.025}px rgba(0,0,0,0.35), inset 0 0 0 ${Math.max(1, width * 0.0012)}px ${f.edge}`
            : `inset 0 0 0 ${Math.max(1, width * 0.0012)}px ${f.edge}`,
        }}
      >
        <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: outerR - rim, background: '#000', padding: bezel }}>
          {/* Front camera, centred in the top bezel */}
          <div style={{ position: 'absolute', top: bezel / 2 - width * 0.004, left: '50%', width: width * 0.008, height: width * 0.008, marginLeft: -width * 0.004, borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%, #2a3350, #07080d 70%)' }} />
          <div style={{ position: 'relative', width: screenW, height: screenH, borderRadius: screenR, overflow: 'hidden', background: '#000' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, width: pt.width, height: pt.height, transform: `scale(${scale})`, transformOrigin: '0 0' }}>
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
