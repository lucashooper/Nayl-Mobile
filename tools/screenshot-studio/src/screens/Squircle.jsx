import { useLayoutEffect, useRef, useState } from 'react';

// iOS "continuous corner" (squircle) outline, using the Figma corner-smoothing
// construction. smoothing 0.6 matches Apple's app-icon / UIKit continuous curve.
export function squirclePath(w, h, radius, smoothing = 0.6) {
  const budget = Math.min(w, h) / 2;
  const R = Math.min(radius, budget);
  let s = smoothing;
  let p = Math.min((1 + s) * R, budget);
  if (R > 0) s = Math.min(s, budget / R - 1);
  const rad = (deg) => (deg * Math.PI) / 180;
  const arcMeasure = 90 * (1 - s);
  const arc = Math.sin(rad(arcMeasure / 2)) * R * Math.SQRT2;
  const alpha = (90 - arcMeasure) / 2;
  const p3p4 = R * Math.tan(rad(alpha / 2));
  const beta = 45 * s;
  const c = p3p4 * Math.cos(rad(beta));
  const d = c * Math.tan(rad(beta));
  const b = (p - arc - c - d) / 3;
  const a = 2 * b;
  const n = (v) => +v.toFixed(3);
  const [A, AB, ABC, C, D, BC, ARC] = [a, a + b, a + b + c, c, d, b + c, arc].map(n);
  return [
    `M ${n(w - p)} 0`,
    `c ${A} 0 ${AB} 0 ${ABC} ${D}`,
    `a ${n(R)} ${n(R)} 0 0 1 ${ARC} ${ARC}`,
    `c ${D} ${C} ${D} ${BC} ${D} ${ABC}`,
    `L ${n(w)} ${n(h - p)}`,
    `c 0 ${A} 0 ${AB} ${-D} ${ABC}`,
    `a ${n(R)} ${n(R)} 0 0 1 ${-ARC} ${ARC}`,
    `c ${-C} ${D} ${-BC} ${D} ${-ABC} ${D}`,
    `L ${n(p)} ${n(h)}`,
    `c ${-A} 0 ${-AB} 0 ${-ABC} ${-D}`,
    `a ${n(R)} ${n(R)} 0 0 1 ${-ARC} ${-ARC}`,
    `c ${-D} ${-C} ${-D} ${-BC} ${-D} ${-ABC}`,
    `L 0 ${n(p)}`,
    `c 0 ${-A} 0 ${-AB} ${D} ${-ABC}`,
    `a ${n(R)} ${n(R)} 0 0 1 ${ARC} ${-ARC}`,
    `c ${C} ${-D} ${BC} ${-D} ${ABC} ${-D}`,
    'Z',
  ].join(' ');
}

let uid = 0;

// A card whose background, hairline border and drop shadow follow the squircle
// outline. `shadow` is a CSS drop-shadow() list already expressed in this
// element's own (pre-transform) units.
export default function Squircle({ radius = 24, fill, stroke = 'rgba(255,255,255,0.16)', highlight = true, shadow, style, children }) {
  const ref = useRef(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [id] = useState(() => `sq${++uid}`);

  useLayoutEffect(() => {
    const el = ref.current;
    const measure = () => setSize({ w: el.offsetWidth, h: el.offsetHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { w, h } = size;
  const d = w && h ? squirclePath(w, h, radius) : '';
  return (
    <div ref={ref} style={{ position: 'relative', ...style }}>
      {d && (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: 'absolute', inset: 0, overflow: 'visible', filter: shadow || 'none' }}>
          <defs>
            <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1">
              {fill.map((col, i) => (
                <stop key={i} offset={i / (fill.length - 1)} stopColor={col} />
              ))}
            </linearGradient>
            <linearGradient id={`${id}-hl`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="rgba(255,255,255,0.10)" />
              <stop offset="0.45" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
          </defs>
          <path d={d} fill={`url(#${id}-fill)`} />
          {highlight && <path d={d} fill={`url(#${id}-hl)`} />}
          <path d={d} fill="none" stroke={stroke} strokeWidth="1" />
        </svg>
      )}
      <div style={{ position: 'relative' }}>{children}</div>
    </div>
  );
}
