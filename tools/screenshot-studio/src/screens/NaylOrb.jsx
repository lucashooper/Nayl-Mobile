import coolOrb from '@app-assets/cool-orb.webp';

// Port of the production home-screen orb: src/components/SwirlingOrb.tsx with the
// ProgressRing (src/components/ProgressRing.tsx) HomeScreen.tsx renders inside it,
// clipped by HomeScreen's orbWrapper and lit by SHADOWS.orbGlow (src/constants/theme.ts).
//
// In the app every layer spins (20s, orb image 30s); this is the t = 0 frame, where
// all rotations are 0deg. expo-linear-gradient start/end points map to CSS angles:
// (0,0)->(1,1) = 135deg, (0.5,0)->(0.5,1) = 180deg, (1,0)->(0,1) = 225deg,
// (0,0.5)->(1,0.5) = 90deg, (1,0.5)->(0,0.5) = 270deg. Layer 5 starts at the centre,
// (0.5,0.5)->(1,0), so its stops sit on the second half of a 45deg line.
const LAYERS = [
  { opacity: 0.4, bg: 'linear-gradient(135deg, rgba(59,130,246,0.9) 0%, rgba(29,78,216,0.8) 50%, transparent 100%)' },
  { opacity: 0.35, bg: 'linear-gradient(180deg, rgba(139,92,246,0.9) 0%, rgba(168,85,247,0.7) 50%, transparent 100%)' },
  { opacity: 0.3, bg: 'linear-gradient(225deg, rgba(236,72,153,0.8) 0%, rgba(192,132,252,0.6) 50%, transparent 100%)' },
  { opacity: 0.25, bg: 'linear-gradient(90deg, rgba(59,130,246,0.7) 0%, rgba(168,85,247,0.5) 50%, transparent 100%)' },
  { opacity: 0.3, bg: 'linear-gradient(45deg, rgba(236,72,153,0.6) 50%, rgba(139,92,246,0.4) 75%, transparent 100%)' },
  { opacity: 0.15, bg: 'linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(59,130,246,0.4) 50%, transparent 100%)' },
  { opacity: 0.35, bg: 'linear-gradient(270deg, rgba(236,72,153,0.8) 0%, rgba(168,85,247,0.6) 50%, rgba(59,130,246,0.5) 100%)' },
  { opacity: 0.25, bg: 'linear-gradient(135deg, rgba(59,130,246,0.6) 0%, rgba(168,85,247,0.5) 50%, rgba(236,72,153,0.4) 100%)' },
];

// ColorContext DEFAULT_COLORS ("Ocean Blue"); HomeScreen passes the lime track.
const RING_COLORS = ['#00D4FF', '#0099FF', '#0066FF'];

// progress: 0-100, the share of the current 24h (HomeScreen calculateProgress).
export default function NaylOrb({ size = 180, strokeWidth = 10, progress = 27.9, glow = true, id = 'orb' }) {
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div style={{ width: size, height: size, borderRadius: size / 2, boxShadow: glow ? `0 0 ${size / 3}px rgba(255,255,255,${0.55 * 0.8})` : 'none' }}>
      <div style={{ position: 'relative', width: size, height: size, borderRadius: size / 2, overflow: 'hidden' }}>
        <img src={coolOrb} alt="" style={{ position: 'absolute', inset: 0, width: size, height: size, objectFit: 'cover', borderRadius: size / 2, display: 'block' }} />
        {LAYERS.map((l, i) => (
          <div key={i} style={{ position: 'absolute', inset: 0, borderRadius: size / 2, opacity: l.opacity, background: l.bg }} />
        ))}
        <svg width={size} height={size} style={{ position: 'absolute', inset: 0 }}>
          <defs>
            <linearGradient id={`${id}-ring`} x1="0%" y1="0%" x2="100%" y2="0%">
              {RING_COLORS.map((col, i) => (
                <stop key={i} offset={`${(i / (RING_COLORS.length - 1)) * 100}%`} stopColor={col} />
              ))}
            </linearGradient>
          </defs>
          <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(193,255,114,0.2)" strokeWidth={strokeWidth} fill="transparent" />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={`url(#${id}-ring)`}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={c}
            strokeDashoffset={c - (progress / 100) * c}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </svg>
      </div>
    </div>
  );
}
