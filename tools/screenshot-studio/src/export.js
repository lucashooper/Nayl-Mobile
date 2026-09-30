import { toCanvas, getFontEmbedCSS } from 'html-to-image';
import JSZip from 'jszip';
import { TARGETS } from './config.js';
import { encodePng } from './png.js';

export const DPI = 300;

// Renders one full-size frame node to an RGB PNG at the target's exact pixel size
// (1242 x 2688, 1290 x 2796 or 2048 x 2732) with 300 DPI metadata.
export async function renderFrame(node, target, fontEmbedCSS) {
  const { width, height } = TARGETS[target];
  await document.fonts.ready;
  const opts = {
    width,
    height,
    canvasWidth: width,
    canvasHeight: height,
    pixelRatio: 1,
    skipAutoScale: true,
    fontEmbedCSS,
  };
  const canvas = await toCanvas(node, opts);
  if (canvas.width !== width || canvas.height !== height) {
    throw new Error(`Rendered ${canvas.width}x${canvas.height}, expected ${width}x${height}`);
  }
  return encodePng(canvas, DPI);
}

export function fileName(index, frame, target) {
  const { device, width, height } = TARGETS[target];
  return `nayl-${device}-${String(index + 1).padStart(2, '0')}-${frame.id}-${width}x${height}.png`;
}

function zipName(target) {
  const { device, label, width, height } = TARGETS[target];
  const inches = /[\d.]+/.exec(label)[0];
  return `nayl-app-store-${device}-${inches}in-${width}x${height}.zip`;
}

function save(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export async function exportOne(node, index, frame, target) {
  save(await renderFrame(node, target, await getFontEmbedCSS(node)), fileName(index, frame, target));
}

// True when the studio is served by its own dev server, which can write files.
export async function canSaveToDisk() {
  try {
    const res = await fetch('/__studio/ping');
    return res.ok && (await res.json()).ok === true;
  } catch {
    return false;
  }
}

async function saveToDisk(dir, name, blob) {
  const res = await fetch(`/__studio/save?dir=${encodeURIComponent(dir)}&name=${encodeURIComponent(name)}`, { method: 'POST', body: blob });
  const out = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(out.error || `Saving ${name} failed (${res.status})`);
  return out.dir;
}

function zipFolder(dir) {
  return dir.replace(/\\/g, '/').replace(/^(\.\/)+/, '').replace(/^\/+|\/+$/g, '').split('/').filter((p) => p && p !== '..' && p !== '.').join('/');
}

// mode: 'disk' (write into `dir` via the dev server), 'zip' (one download) or
// 'files' (five PNG downloads). Returns where the files went, for the status line.
export async function exportAll(nodes, frames, target, { mode, dir }, onProgress) {
  const fontEmbedCSS = await getFontEmbedCSS(nodes[0]);
  const rendered = [];
  for (let i = 0; i < nodes.length; i++) {
    onProgress?.(i, nodes.length);
    rendered.push({ name: fileName(i, frames[i], target), blob: await renderFrame(nodes[i], target, fontEmbedCSS) });
  }
  onProgress?.(nodes.length, nodes.length);

  if (mode === 'disk') {
    let written = '';
    for (const { name, blob } of rendered) written = await saveToDisk(dir, name, blob);
    return written;
  }
  if (mode === 'files') {
    for (const { name, blob } of rendered) {
      save(blob, name);
      await new Promise((r) => setTimeout(r, 350)); // browsers drop rapid-fire downloads
    }
    return '';
  }
  const zip = new JSZip();
  const folder = zipFolder(dir);
  for (const { name, blob } of rendered) zip.file(folder ? `${folder}/${name}` : name, blob);
  save(await zip.generateAsync({ type: 'blob' }), zipName(target));
  return '';
}
