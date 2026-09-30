import { toCanvas, getFontEmbedCSS } from 'html-to-image';
import JSZip from 'jszip';
import { CANVAS } from './config.js';
import { encodePng } from './png.js';

export const DPI = 300;

// Renders one full-size frame node to a 1290 x 2796 RGB PNG with 300 DPI metadata.
export async function renderFrame(node, fontEmbedCSS) {
  await document.fonts.ready;
  const opts = {
    width: CANVAS.width,
    height: CANVAS.height,
    canvasWidth: CANVAS.width,
    canvasHeight: CANVAS.height,
    pixelRatio: 1,
    skipAutoScale: true,
    fontEmbedCSS,
  };
  const canvas = await toCanvas(node, opts);
  if (canvas.width !== CANVAS.width || canvas.height !== CANVAS.height) {
    throw new Error(`Rendered ${canvas.width}x${canvas.height}, expected ${CANVAS.width}x${CANVAS.height}`);
  }
  return encodePng(canvas, DPI);
}

export function fileName(index, frame) {
  return `nayl-${String(index + 1).padStart(2, '0')}-${frame.id}-1290x2796.png`;
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

export async function exportOne(node, index, frame) {
  save(await renderFrame(node, await getFontEmbedCSS(node)), fileName(index, frame));
}

// mode: 'zip' (one download) or 'files' (five PNG downloads).
export async function exportAll(nodes, frames, mode, onProgress) {
  const fontEmbedCSS = await getFontEmbedCSS(nodes[0]);
  const rendered = [];
  for (let i = 0; i < nodes.length; i++) {
    onProgress?.(i, nodes.length);
    rendered.push({ name: fileName(i, frames[i]), blob: await renderFrame(nodes[i], fontEmbedCSS) });
  }
  if (mode === 'files') {
    for (const { name, blob } of rendered) {
      save(blob, name);
      await new Promise((r) => setTimeout(r, 350)); // browsers drop rapid-fire downloads
    }
  } else {
    const zip = new JSZip();
    for (const { name, blob } of rendered) zip.file(name, blob);
    save(await zip.generateAsync({ type: 'blob' }), 'nayl-app-store-6.7in-1290x2796.zip');
  }
  onProgress?.(nodes.length, nodes.length);
  return rendered;
}
