// Canvas renderer for Nayl App Store screenshots.
// Everything is drawn in export pixels, so the preview and the exported PNG
// are the same picture at different scales.
(function () {
  const SIZES = [
    { id: 'iphone-6.7', label: 'iPhone 6.7"', w: 1290, h: 2796, device: 'iphone' },
    { id: 'iphone-6.5', label: 'iPhone 6.5"', w: 1284, h: 2778, device: 'iphone' },
    { id: 'ipad-12.9', label: 'iPad Pro 12.9"', w: 2048, h: 2732, device: 'ipad' },
  ];

  // Outer frame geometry, as fractions of the frame width.
  const FRAMES = {
    iphone: { screenAspect: 1290 / 2796, bezel: 0.034, radius: 0.16 },
    ipad: { screenAspect: 2048 / 2732, bezel: 0.03, radius: 0.052 },
  };

  function frameHeightRatio(kind) {
    const f = FRAMES[kind];
    return (1 - 2 * f.bezel) / f.screenAspect + 2 * f.bezel;
  }

  function mulberry32(seed) {
    return function () {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function hashString(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
    return h >>> 0;
  }

  function rrect(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  let grainTile = null;
  function getGrainTile() {
    if (grainTile) return grainTile;
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const g = c.getContext('2d');
    const img = g.createImageData(256, 256);
    const rnd = mulberry32(7);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = rnd() < 0.5 ? 40 : 255;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = Math.floor(rnd() * 22);
    }
    g.putImageData(img, 0, 0);
    grainTile = c;
    return c;
  }

  // ---------- Background: parchment gradient, soft creases, grain, halftone ----------
  function drawBackground(ctx, W, H, style, seed) {
    const g = ctx.createLinearGradient(0, 0, W * 0.3, H);
    g.addColorStop(0, style.bgFrom);
    g.addColorStop(1, style.bgTo);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    if (style.texture) {
      const rnd = mulberry32(seed);
      // Soft paper creases: large, faint light and shadow blobs.
      for (let i = 0; i < 16; i++) {
        const cx = rnd() * W;
        const cy = rnd() * H * 0.75;
        const rx = W * (0.25 + rnd() * 0.45);
        const ry = rx * (0.18 + rnd() * 0.3);
        const light = i % 2 === 0;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate((rnd() - 0.5) * 1.2);
        ctx.scale(1, ry / rx);
        const rg = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
        rg.addColorStop(0, light ? 'rgba(255,255,255,0.55)' : 'rgba(120,100,70,0.07)');
        rg.addColorStop(1, light ? 'rgba(255,255,255,0)' : 'rgba(120,100,70,0)');
        ctx.fillStyle = rg;
        ctx.fillRect(-rx, -rx, rx * 2, rx * 2);
        ctx.restore();
      }
      // A few crisp fold lines.
      for (let i = 0; i < 5; i++) {
        const y0 = rnd() * H * 0.7;
        const ang = (rnd() - 0.5) * 0.9;
        ctx.save();
        ctx.translate(W / 2, y0);
        ctx.rotate(ang);
        const lg = ctx.createLinearGradient(0, -W * 0.02, 0, W * 0.02);
        lg.addColorStop(0, 'rgba(255,255,255,0)');
        lg.addColorStop(0.48, 'rgba(255,255,255,0.35)');
        lg.addColorStop(0.52, 'rgba(110,90,60,0.06)');
        lg.addColorStop(1, 'rgba(110,90,60,0)');
        ctx.fillStyle = lg;
        ctx.fillRect(-W, -W * 0.02, W * 2, W * 0.04);
        ctx.restore();
      }
      ctx.save();
      ctx.fillStyle = ctx.createPattern(getGrainTile(), 'repeat');
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }

    if (style.dots) {
      const step = W / 88;
      const top = H * 0.6;
      ctx.fillStyle = 'rgba(120,100,72,1)';
      for (let y = top; y < H; y += step) {
        const t = (y - top) / (H - top);
        const r = step * (0.08 + 0.14 * t);
        ctx.globalAlpha = 0.1 + 0.18 * t;
        const offset = (Math.round((y - top) / step) % 2) * step * 0.5;
        for (let x = offset; x < W; x += step) {
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    }
  }

  // ---------- Device frames ----------
  function drawImageCover(ctx, img, x, y, w, h) {
    const k = Math.max(w / img.width, h / img.height);
    const dw = img.width * k;
    const dh = img.height * k;
    const dx = x + (w - dw) / 2;
    const dy = y; // top-align so the status bar stays in view
    ctx.drawImage(img, dx, dy, dw, dh);
    return { dx, dy, k };
  }

  function drawDevice(ctx, kind, x, y, PW, img) {
    const f = FRAMES[kind];
    const PH = PW * frameHeightRatio(kind);
    const b = PW * f.bezel;
    const R = PW * f.radius;
    const sx = x + b;
    const sy = y + b;
    const sw = PW - 2 * b;
    const sh = PH - 2 * b;
    const sr = Math.max(R - b * 0.95, 0);

    // Hardware buttons sit behind the frame edge.
    ctx.fillStyle = '#2a2a2e';
    const btnW = PW * 0.014;
    const buttons =
      kind === 'iphone'
        ? [[-1, 0.165, 0.035], [-1, 0.235, 0.065], [-1, 0.315, 0.065], [1, 0.27, 0.1]]
        : [[1, 0.035, 0.05], [1, 0.1, 0.05], [-1, 0.02, 0.07]];
    for (const [side, t, len] of buttons) {
      if (kind === 'ipad' && side === -1) {
        // iPad top button runs along the top edge.
        rrect(ctx, x + PW * 0.82, y - btnW * 0.6, PW * len, btnW * 1.2, btnW * 0.5);
      } else {
        const bx = side < 0 ? x - btnW * 0.6 : x + PW - btnW * 0.6;
        rrect(ctx, bx, y + PH * t, btnW * 1.2, PH * len, btnW * 0.5);
      }
      ctx.fill();
    }

    // Soft drop shadow.
    ctx.save();
    ctx.shadowColor = 'rgba(70,50,25,0.30)';
    ctx.shadowBlur = PW * 0.08;
    ctx.shadowOffsetY = PW * 0.04;
    rrect(ctx, x, y, PW, PH, R);
    ctx.fillStyle = '#1b1b1e';
    ctx.fill();
    ctx.restore();

    // Titanium band.
    const band = ctx.createLinearGradient(x, 0, x + PW, 0);
    band.addColorStop(0, '#4b4a50');
    band.addColorStop(0.04, '#1d1d20');
    band.addColorStop(0.5, '#2c2c30');
    band.addColorStop(0.96, '#1d1d20');
    band.addColorStop(1, '#4b4a50');
    rrect(ctx, x, y, PW, PH, R);
    ctx.fillStyle = band;
    ctx.fill();
    ctx.lineWidth = Math.max(1, PW * 0.004);
    ctx.strokeStyle = 'rgba(255,255,255,0.22)';
    rrect(ctx, x + ctx.lineWidth, y + ctx.lineWidth, PW - 2 * ctx.lineWidth, PH - 2 * ctx.lineWidth, R);
    ctx.stroke();

    // Black glass border.
    const inset = b * 0.4;
    rrect(ctx, x + inset, y + inset, PW - 2 * inset, PH - 2 * inset, R - inset);
    ctx.fillStyle = '#050506';
    ctx.fill();

    // Screen.
    ctx.save();
    rrect(ctx, sx, sy, sw, sh, sr);
    ctx.clip();
    ctx.fillStyle = '#000';
    ctx.fillRect(sx, sy, sw, sh);
    let map = null;
    if (img) map = drawImageCover(ctx, img, sx, sy, sw, sh);
    ctx.restore();

    if (kind === 'iphone') {
      const iw = sw * 0.3;
      const ih = sw * 0.086;
      rrect(ctx, sx + (sw - iw) / 2, sy + sw * 0.028, iw, ih, ih / 2);
      ctx.fillStyle = '#000';
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(x + PW / 2, y + b * 0.5, b * 0.12, 0, Math.PI * 2);
      ctx.fillStyle = '#1a1a1f';
      ctx.fill();
    }

    return { x, y, w: PW, h: PH, sx, sy, sw, sh, map, img };
  }

  // ---------- Text ----------
  // "*word*" marks accent-coloured words.
  function tokenize(text) {
    const out = [];
    const lines = String(text || '').split('\n');
    lines.forEach((line, li) => {
      if (li > 0) out.push({ br: true });
      let accent = false;
      for (const part of line.split(/(\*)/)) {
        if (part === '*') {
          accent = !accent;
          continue;
        }
        for (const w of part.split(/(\s+)/)) {
          if (!w) continue;
          if (/^\s+$/.test(w)) out.push({ space: true });
          else out.push({ text: w, accent });
        }
      }
    });
    return out;
  }

  function layoutText(ctx, tokens, font, maxW) {
    ctx.font = font;
    const spaceW = ctx.measureText(' ').width;
    const lines = [[]];
    let lineW = 0;
    let pendingSpace = false;
    for (const t of tokens) {
      if (t.br) {
        lines.push([]);
        lineW = 0;
        pendingSpace = false;
        continue;
      }
      if (t.space) {
        pendingSpace = true;
        continue;
      }
      const w = ctx.measureText(t.text).width;
      const cur = lines[lines.length - 1];
      const addW = (cur.length && pendingSpace ? spaceW : 0) + w;
      if (cur.length && lineW + addW > maxW) {
        lines.push([{ ...t, w, gap: 0 }]);
        lineW = w;
      } else {
        cur.push({ ...t, w, gap: cur.length && pendingSpace ? spaceW : 0 });
        lineW += addW;
      }
      pendingSpace = false;
    }
    return lines
      .filter((l) => l.length)
      .map((l) => ({ tokens: l, width: l.reduce((s, t) => s + t.gap + t.w, 0) }));
  }

  function fitText(ctx, text, family, weight, size, maxW, maxLines) {
    const tokens = tokenize(text);
    let s = size;
    for (let i = 0; i < 30; i++) {
      const font = `${weight} ${s}px ${family}`;
      const lines = layoutText(ctx, tokens, font, maxW);
      const widest = Math.max(0, ...lines.map((l) => l.width));
      if ((lines.length <= maxLines && widest <= maxW) || s < size * 0.4) return { lines, font, size: s };
      s *= 0.94;
    }
    const font = `${weight} ${s}px ${family}`;
    return { lines: layoutText(ctx, tokens, font, maxW), font, size: s };
  }

  function drawTextBlock(ctx, block, cx, y, lineHeight, color, accent) {
    ctx.font = block.font;
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';
    const lh = block.size * lineHeight;
    block.lines.forEach((line, i) => {
      let x = cx - line.width / 2;
      const by = y + block.size * 0.9 + i * lh;
      for (const t of line.tokens) {
        x += t.gap;
        ctx.fillStyle = t.accent ? accent : color;
        ctx.fillText(t.text, x, by);
        x += t.w;
      }
    });
    return block.lines.length ? block.size * 0.9 + (block.lines.length - 1) * lh + block.size * 0.28 : 0;
  }

  // ---------- Laurel badge ----------
  function goldGradient(ctx, x, y, h) {
    const g = ctx.createLinearGradient(x, y - h / 2, x, y + h / 2);
    g.addColorStop(0, '#DDB95F');
    g.addColorStop(0.35, '#B98A34');
    g.addColorStop(0.65, '#9C6D24');
    g.addColorStop(1, '#CFA650');
    return g;
  }

  function leaf(ctx, len, wid) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(len * 0.45, -wid, len, 0);
    ctx.quadraticCurveTo(len * 0.45, wid, 0, 0);
    ctx.closePath();
    ctx.fill();
  }

  // Left branch, curving up from the bottom; right branch is its mirror.
  function drawLaurelBranch(ctx, h, fill) {
    const R = h * 0.62;
    const a0 = (-58 * Math.PI) / 180;
    const a1 = (58 * Math.PI) / 180;
    const xc = R; // rightmost point of the arc ends near x = R - R*cos(58°)
    const pt = (a) => [xc - R * Math.cos(a), -R * Math.sin(a)];
    ctx.fillStyle = fill;
    ctx.strokeStyle = fill;
    ctx.lineWidth = h * 0.025;
    ctx.lineCap = 'round';
    ctx.beginPath();
    for (let i = 0; i <= 40; i++) {
      const [px, py] = pt(a0 + ((a1 - a0) * i) / 40);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    const n = 7;
    for (let i = 0; i < n; i++) {
      const t = (i + 0.35) / n;
      const a = a0 + (a1 - a0) * t;
      const [px, py] = pt(a);
      const tangent = Math.atan2(-Math.cos(a), Math.sin(a)); // points up the arc
      const len = h * (0.24 - 0.08 * t);
      const wid = len * 0.34;
      for (const dir of [-1, 1]) {
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(tangent + dir * 0.62);
        leaf(ctx, len, wid);
        ctx.restore();
      }
    }
    const [tx, ty] = pt(a1);
    ctx.save();
    ctx.translate(tx, ty);
    ctx.rotate(Math.atan2(-Math.cos(a1), Math.sin(a1)));
    leaf(ctx, h * 0.17, h * 0.055);
    ctx.restore();
    return R - R * Math.cos(a1); // horizontal extent of the stem
  }

  function measureBadge(ctx, badge, u, fonts) {
    const big = badge.big || '';
    const small = badge.small || '';
    const bigSize = 78 * u;
    const smallSize = 40 * u;
    ctx.font = `800 ${bigSize}px ${fonts.sans}`;
    const bw = ctx.measureText(big).width;
    ctx.font = `600 ${smallSize}px ${fonts.sans}`;
    const sw = ctx.measureText(small).width;
    const textW = Math.max(bw, sw);
    const h = 215 * u;
    return { w: textW + h * 1.05, h, textW, bigSize, smallSize };
  }

  function drawBadge(ctx, badge, cx, y, u, style, fonts) {
    const m = measureBadge(ctx, badge, u, fonts);
    const cy = y + m.h / 2;
    const fill = goldGradient(ctx, cx, cy, m.h);
    const gap = m.h * 0.12;
    // Left laurel
    ctx.save();
    ctx.translate(cx - m.textW / 2 - gap - m.h * 0.42, cy);
    drawLaurelBranch(ctx, m.h, fill);
    ctx.restore();
    // Right laurel (mirrored)
    ctx.save();
    ctx.translate(cx + m.textW / 2 + gap + m.h * 0.42, cy);
    ctx.scale(-1, 1);
    drawLaurelBranch(ctx, m.h, fill);
    ctx.restore();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = style.text;
    const hasSmall = !!badge.small;
    ctx.font = `800 ${m.bigSize}px ${fonts.sans}`;
    ctx.fillText(badge.big || '', cx, cy + (hasSmall ? -m.bigSize * 0.08 : m.bigSize * 0.35));
    if (hasSmall) {
      ctx.font = `600 ${m.smallSize}px ${fonts.sans}`;
      ctx.fillStyle = style.subtext;
      ctx.fillText(badge.small, cx, cy + m.smallSize * 1.25);
    }
    ctx.textAlign = 'left';
    return m.h;
  }

  // ---------- Zoom call-outs and pills ----------
  function drawZoom(ctx, dev, z, W, u) {
    if (!dev.img || !dev.map) return;
    const img = dev.img;
    const { dx, dy, k } = dev.map;
    const srcX = z.x * img.width;
    const srcY = z.y * img.height;
    const srcW = z.w * img.width;
    const srcH = z.h * img.height;
    const onScreenCX = dx + (srcX + srcW / 2) * k;
    const onScreenCY = dy + (srcY + srcH / 2) * k;
    const cw = srcW * k * z.scale;
    const ch = srcH * k * z.scale;
    let cx = onScreenCX + (z.side || 0) * dev.sw * (z.offset ?? 0.18);
    const margin = 36 * u;
    cx = Math.min(Math.max(cx, margin + cw / 2), W - margin - cw / 2);
    const x = cx - cw / 2;
    const y = onScreenCY - ch / 2;
    const pad = 10 * u;
    const r = 38 * u;

    ctx.save();
    ctx.shadowColor = 'rgba(60,40,20,0.35)';
    ctx.shadowBlur = 60 * u;
    ctx.shadowOffsetY = 24 * u;
    rrect(ctx, x - pad, y - pad, cw + pad * 2, ch + pad * 2, r + pad);
    ctx.fillStyle = '#FBFAF6';
    ctx.fill();
    ctx.restore();

    ctx.save();
    rrect(ctx, x, y, cw, ch, r);
    ctx.clip();
    ctx.fillStyle = '#000';
    ctx.fillRect(x, y, cw, ch);
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, srcX, srcY, srcW, srcH, x, y, cw, ch);
    ctx.restore();
  }

  function drawPills(ctx, dev, pills, W, u, style, fonts) {
    const size = 70 * u;
    ctx.font = `400 ${size}px ${fonts.serif}`;
    const slots = [0.2, 0.44, 0.68, 0.86];
    pills.slice(0, 4).forEach((text, i) => {
      const tw = ctx.measureText(text).width;
      const pw = tw + size * 1.1;
      const ph = size * 1.55;
      const side = i % 2 === 0 ? 1 : -1;
      let x = side > 0 ? dev.x + dev.w - pw * 0.55 : dev.x - pw * 0.45;
      x = Math.min(Math.max(x, 24 * u), W - 24 * u - pw);
      const y = dev.y + dev.h * slots[i] - ph / 2;
      ctx.save();
      ctx.shadowColor = 'rgba(60,40,20,0.22)';
      ctx.shadowBlur = 40 * u;
      ctx.shadowOffsetY = 14 * u;
      rrect(ctx, x, y, pw, ph, ph / 2);
      ctx.fillStyle = 'rgba(253,252,248,0.97)';
      ctx.fill();
      ctx.restore();
      ctx.lineWidth = 2 * u;
      ctx.strokeStyle = 'rgba(90,70,45,0.18)';
      rrect(ctx, x, y, pw, ph, ph / 2);
      ctx.stroke();
      ctx.fillStyle = style.text;
      ctx.textBaseline = 'middle';
      ctx.fillText(text, x + (pw - tw) / 2, y + ph / 2 + size * 0.04);
      ctx.textBaseline = 'alphabetic';
    });
  }

  // ---------- Slide ----------
  function renderSlide(ctx, slide, size, style, images, scale = 1) {
    const W = size.w;
    const H = size.h;
    const isPad = size.device === 'ipad';
    const u = isPad ? W / 1290 * 0.8 : W / 1290;
    const fonts = {
      serif: `"${style.serif}", Georgia, serif`,
      sans: '"Inter", system-ui, sans-serif',
    };

    ctx.save();
    ctx.scale(scale, scale);
    drawBackground(ctx, W, H, style, hashString(slide.id));

    // Pick the screenshot and frame for this size.
    const padImg = isPad ? images[slide.ipadImage] : null;
    const kind = padImg ? 'ipad' : 'iphone';
    const img = padImg || images[slide.phoneImage] || null;

    // Measure the text stack.
    const maxTextW = W - 2 * (isPad ? 200 : 110) * u;
    const head = fitText(ctx, slide.headline, fonts.serif, style.serifWeight, 138 * u * (slide.headlineScale || 1), maxTextW, 3);
    const headLH = 1.04;
    const headH = head.lines.length ? head.size * 0.9 + (head.lines.length - 1) * head.size * headLH + head.size * 0.28 : 0;
    const sub = slide.subheadline
      ? fitText(ctx, slide.subheadline, fonts.sans, 500, 44 * u, maxTextW * 0.9, 2)
      : null;
    const subLH = 1.3;
    const subH = sub ? sub.size * 0.9 + (sub.lines.length - 1) * sub.size * subLH + sub.size * 0.28 : 0;
    const badgeOn = slide.badge && slide.badge.on && (slide.badge.big || slide.badge.small);
    const badgeH = badgeOn ? measureBadge(ctx, slide.badge, u, fonts).h : 0;
    const gapHS = 30 * u;
    const gapSB = 46 * u;
    const stackH = headH + (sub ? gapHS + subH : 0) + (badgeOn ? gapSB + badgeH : 0);

    const topMargin = (isPad ? 150 : 170) * u;
    const bottomMargin = (isPad ? 120 : 130) * u;
    const deviceGap = 80 * u;
    let stackY;
    let region;
    if (slide.layout === 'bottom') {
      stackY = H - bottomMargin - stackH;
      region = { top: 110 * u, bottom: stackY - deviceGap };
    } else {
      stackY = topMargin;
      region = { top: stackY + stackH + deviceGap, bottom: H - 70 * u };
    }

    // Fit the device into its region, then apply the per-slide scale.
    const ratio = frameHeightRatio(kind);
    const maxW = kind === 'ipad' ? W * 0.8 : W * (isPad ? 0.5 : 0.78);
    const regionH = region.bottom - region.top;
    let PW = Math.min(maxW, regionH / ratio) * (slide.deviceScale || 1);
    const PH = PW * ratio;
    const dx = (W - PW) / 2;
    let dy;
    if (slide.layout === 'bottom') dy = region.bottom - PH;
    else dy = region.top;
    if ((slide.deviceScale || 1) <= 1 && slide.layout !== 'bottom') dy = region.top + Math.max(0, (regionH - PH) / 2);

    const dev = drawDevice(ctx, kind, dx, dy, PW, img);

    for (const z of slide.zooms || []) if (z.on !== false) drawZoom(ctx, dev, z, W, u);
    if (slide.pills && slide.pills.length) drawPills(ctx, dev, slide.pills, W, u, style, fonts);

    // Text stack (drawn last so it sits above a bleeding device).
    let y = stackY;
    drawTextBlock(ctx, head, W / 2, y, headLH, style.text, style.accent);
    y += headH;
    if (sub) {
      y += gapHS;
      drawTextBlock(ctx, sub, W / 2, y, subLH, style.subtext, style.accent);
      y += subH;
    }
    if (badgeOn) {
      y += gapSB;
      drawBadge(ctx, slide.badge, W / 2, y, u, style, fonts);
    }

    ctx.restore();
  }

  window.NaylShots = { SIZES, renderSlide };
})();
