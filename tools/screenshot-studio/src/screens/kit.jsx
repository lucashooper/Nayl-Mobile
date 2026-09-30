import { createContext, useContext } from 'react';

// Shared building blocks for the device-screen mocks. Sizes are points and colours
// come from the app's midnight theme (src/context/ThemeContext.tsx, src/screens/HomeScreen.tsx).

// Screen size in points. iPhone 16 Pro is 393 x 852. The iPad screen keeps the same
// height in points but is 640 wide (the 2048 x 2732 aspect), so the same layouts
// get wider cards and more breathing room instead of shrinking into a phone column.
export const IPHONE_PT = { width: 393, height: 852, tablet: false };
export const IPAD_PT = { width: 640, height: (640 * 2732) / 2048, tablet: true };
export const ScreenSize = createContext(IPHONE_PT);
export const useScreen = () => useContext(ScreenSize);

export const C = {
  bg: '#020408',
  lime: '#C1FF72',
  text: '#FFFFFF',
  secondary: '#E2E8F0',
  muted: '#94A3B8',
  card: '#0A0A0F',
  cardBorder: '#0A4F6B',
  blue: 'linear-gradient(90deg, #00D4FF 0%, #0099FF 50%, #0066FF 100%)',
  navy: 'linear-gradient(180deg, rgb(22,27,56) 0%, rgb(14,19,41) 100%)',
  hairline: 'rgba(255,255,255,0.14)',
};

export const APP_FONT = "'Inter Variable', system-ui, sans-serif";

// Deterministic starfield so previews and exports match.
const STARS = (() => {
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  // Kept faint (10-20% opacity) to match the subtle starfield in the live app.
  return Array.from({ length: 70 }, () => ({ x: rnd() * 393, y: rnd() * 852, r: 0.5 + rnd() * 1.4, o: 0.1 + rnd() * 0.1 }));
})();

export function Page({ children, background, stars = true, starColor = '255,255,255' }) {
  const pt = useScreen();
  const sx = pt.width / 393;
  const sy = pt.height / 852;
  return (
    <div
      style={{
        position: 'relative',
        width: pt.width,
        height: pt.height,
        overflow: 'hidden',
        fontFamily: APP_FONT,
        color: C.text,
        background: background ?? 'linear-gradient(135deg, rgba(2,4,12,0.98) 0%, rgba(1,2,8,0.99) 55%, #000104 100%)',
      }}
    >
      {stars &&
        STARS.map((s, i) => (
          <div key={i} style={{ position: 'absolute', left: s.x * sx, top: s.y * sy, width: s.r * 2, height: s.r * 2, borderRadius: '50%', background: `rgba(${starColor},${s.o})` }} />
        ))}
      {children}
      <StatusBar />
      <div style={{ position: 'absolute', bottom: 8, left: '50%', width: 134, height: 5, marginLeft: -67, borderRadius: 3, background: 'rgba(255,255,255,0.85)', zIndex: 20 }} />
    </div>
  );
}

export function StatusBar({ time = '9:41' }) {
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 54, zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 34px 0 50px', fontSize: 17, fontWeight: 600, color: '#fff' }}>
      <span>{time}</span>
      <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <svg width="18" height="12" viewBox="0 0 18 12" fill="#fff"><rect x="0" y="8" width="3" height="4" rx="1" /><rect x="5" y="5.5" width="3" height="6.5" rx="1" /><rect x="10" y="3" width="3" height="9" rx="1" /><rect x="15" y="0" width="3" height="12" rx="1" /></svg>
        <svg width="16" height="12" viewBox="0 0 16 12" fill="#fff"><path d="M8 2.2c2.4 0 4.6.9 6.2 2.5l1.3-1.3C13.5 1.3 10.9.2 8 .2S2.5 1.3.5 3.4l1.3 1.3C3.4 3.1 5.6 2.2 8 2.2zm0 3.6c1.4 0 2.7.5 3.7 1.4l1.3-1.3C11.6 4.6 9.9 3.8 8 3.8s-3.6.8-5 2.1l1.3 1.3C5.3 6.3 6.6 5.8 8 5.8zm0 3.6c-.5 0-1 .2-1.4.5L8 11.8l1.4-1.9c-.4-.3-.9-.5-1.4-.5z" /></svg>
        <svg width="27" height="13" viewBox="0 0 27 13"><rect x="0.5" y="0.5" width="23" height="12" rx="3.5" fill="none" stroke="rgba(255,255,255,0.45)" /><rect x="2" y="2" width="20" height="9" rx="2.2" fill="#fff" /><path d="M25 4.5v4c.8-.3 1.3-1.1 1.3-2s-.5-1.7-1.3-2z" fill="rgba(255,255,255,0.45)" /></svg>
      </span>
    </div>
  );
}

// Minimal stroke icons in the spirit of Ionicons / Phosphor (24-unit grid).
const PATHS = {
  check: 'M5 12.5l4.5 4.5L19 7.5',
  close: 'M6 6l12 12M18 6L6 18',
  create: 'M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4',
  bulb: 'M9 18h6M10 21h4M12 3a6 6 0 00-3.6 10.8c.8.6 1.1 1.3 1.1 2.2h5c0-.9.3-1.6 1.1-2.2A6 6 0 0012 3z',
  heart: 'M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0112 7.4 4.3 4.3 0 0119.5 10c0 5.4-7.5 10-7.5 10z',
  refresh: 'M19.5 12a7.5 7.5 0 11-2.2-5.3M19.5 4.5v4h-4',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  back: 'M15 5l-7 7 7 7',
  share: 'M12 15V3M8 7l4-4 4 4M6 11H5v10h14V11h-1',
  house: 'M4 10.5L12 4l8 6.5V20h-5.5v-5.5h-5V20H4z',
  camera: 'M4 8h3.5l1.5-2.5h6L16.5 8H20v11H4zM12 17a3.5 3.5 0 100-7 3.5 3.5 0 000 7z',
  book: 'M4 5.5C6.5 4 9.5 4 12 5.5 14.5 4 17.5 4 20 5.5V19c-2.5-1.5-5.5-1.5-8 0-2.5-1.5-5.5-1.5-8 0zM12 5.5V19',
  user: 'M12 12a4 4 0 100-8 4 4 0 000 8zM4.5 20c1.3-3.3 4.1-5 7.5-5s6.2 1.7 7.5 5',
  lock: 'M6.5 11h11v9h-11zM8.5 11V8a3.5 3.5 0 017 0v3',
  play: 'M8 5.5v13l10.5-6.5z',
  pause: 'M8 5v14M16 5v14',
  flame: 'M12 21c-3.6 0-6-2.4-6-5.6 0-3.6 3-5.4 3.6-9.4 2.3 1.4 3.4 3.4 3.5 5.4.9-.7 1.5-1.8 1.6-3 1.9 1.6 3.3 4 3.3 6.9 0 3.3-2.4 5.7-6 5.7z',
  alert: 'M12 7.5v6M12 16.5v.5',
  sparkle: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z',
};

export function Icon({ name, size = 24, color = '#fff', width = 2, fill = 'none' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', flexShrink: 0 }}>
      <path d={PATHS[name]} />
    </svg>
  );
}

export function TabBar({ active = 'home' }) {
  const tab = (id, icon, label) => (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <Icon name={icon} size={24} color={active === id ? '#fff' : 'rgba(255,255,255,0.45)'} width={1.8} />
      <span style={{ fontSize: 11, fontWeight: 600, color: active === id ? '#fff' : 'rgba(255,255,255,0.45)' }}>{label}</span>
    </div>
  );
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 98, zIndex: 10, display: 'flex', alignItems: 'flex-start', paddingTop: 12, background: 'linear-gradient(180deg, rgba(8,10,15,0.95), rgba(5,7,12,0.98))', borderTop: '0.5px solid rgba(255,255,255,0.08)' }}>
      {tab('home', 'house', 'Home')}
      {tab('progress', 'camera', 'Progress')}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <div style={{ marginTop: -26, width: 56, height: 56, borderRadius: 28, background: 'linear-gradient(180deg, #C1FF72, #8FD65A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34, fontWeight: 300, color: '#0F172A', boxShadow: '0 6px 16px rgba(193,255,114,0.25)' }}>+</div>
      </div>
      {tab('library', 'book', 'Library')}
      {tab('profile', 'user', 'Profile')}
    </div>
  );
}

// Blue-gradient progress ring (AnimatedProgressRing / ProgressRing).
export function Ring({ size, stroke, value, track = 'rgba(255,255,255,0.08)', gradient = ['#00D4FF', '#0099FF', '#0066FF'], id }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          {gradient.map((g, i) => (
            <stop key={i} offset={i / (gradient.length - 1)} stopColor={g} />
          ))}
        </linearGradient>
      </defs>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`url(#${id})`} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={`${c * value} ${c}`} />
    </svg>
  );
}

export function WeekRow({ done = 7, today = -1, size = 28 }) {
  const letters = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      {letters.map((l, i) => {
        const complete = i < done;
        const isToday = i === today;
        return (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: size * 0.22 }}>
            <div
              style={{
                width: size,
                height: size,
                borderRadius: '50%',
                border: `${size * 0.054}px solid ${complete || isToday ? C.lime : 'rgba(255,255,255,0.3)'}`,
                background: complete ? 'rgba(193,255,114,0.15)' : 'rgba(255,255,255,0.08)',
                boxShadow: complete ? `0 0 ${size * 0.3}px rgba(193,255,114,0.45)` : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {complete && <Icon name="check" size={size * 0.5} color={C.lime} width={3} />}
              {isToday && !complete && <div style={{ width: size * 0.15, height: size * 0.15, borderRadius: '50%', background: C.lime }} />}
            </div>
            <span style={{ fontSize: size * 0.39, fontWeight: isToday ? 600 : 500, color: isToday ? C.lime : C.secondary }}>{l}</span>
          </div>
        );
      })}
    </div>
  );
}

export function PanicPill({ width = 314, scale = 1 }) {
  return (
    <div
      style={{
        position: 'relative',
        width,
        padding: `${16 * scale}px ${24 * scale}px`,
        borderRadius: 32 * scale,
        background: 'linear-gradient(180deg, #F05555 0%, #E02E2E 50%, #B61818 100%)',
        border: `${scale}px solid rgba(255,255,255,0.12)`,
        boxShadow: `0 ${12 * scale}px ${24 * scale}px rgba(0,0,0,0.5)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10 * scale,
        overflow: 'hidden',
        fontFamily: APP_FONT,
      }}
    >
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '55%', background: 'linear-gradient(180deg, rgba(255,255,255,0.28), rgba(255,255,255,0.06) 70%, transparent)' }} />
      <div style={{ position: 'relative', width: 28 * scale, height: 28 * scale, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width={18 * scale} height={18 * scale} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#fff" /><path d="M12 7v6M12 16.5v.3" stroke="#D12828" strokeWidth="2.6" strokeLinecap="round" /></svg>
      </div>
      <span style={{ position: 'relative', fontSize: 18 * scale, fontWeight: 700, color: '#fff', letterSpacing: 0.2 * scale }}>Panic Button</span>
    </div>
  );
}
