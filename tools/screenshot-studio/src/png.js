// Our own PNG encoder, because canvas.toBlob() always writes RGBA with no
// resolution metadata. App Store screenshots should have no alpha channel, and
// we want an honest 300 DPI, so this writes 8-bit RGB with a pHYs chunk.

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes) {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const out = new Uint8Array(12 + data.length);
  const view = new DataView(out.buffer);
  view.setUint32(0, data.length);
  for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i);
  out.set(data, 8);
  view.setUint32(8 + data.length, crc32(out.subarray(4, 8 + data.length)));
  return out;
}

async function zlib(bytes) {
  const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

export async function encodePng(canvas, dpi = 300) {
  const { width, height } = canvas;
  const rgba = canvas.getContext('2d').getImageData(0, 0, width, height).data;

  // Scanlines: filter byte + RGB. The "Up" filter keeps gradients small.
  const stride = width * 3;
  const raw = new Uint8Array((stride + 1) * height);
  const prev = new Uint8Array(stride);
  const row = new Uint8Array(stride);
  for (let y = 0; y < height; y++) {
    for (let x = 0, s = y * width * 4; x < width; x++, s += 4) {
      // Composite any transparency onto black so no pixel depends on alpha.
      const a = rgba[s + 3] / 255;
      row[x * 3] = rgba[s] * a;
      row[x * 3 + 1] = rgba[s + 1] * a;
      row[x * 3 + 2] = rgba[s + 2] * a;
    }
    const o = y * (stride + 1);
    raw[o] = 2;
    for (let i = 0; i < stride; i++) raw[o + 1 + i] = (row[i] - prev[i]) & 0xff;
    prev.set(row);
  }

  const ihdr = new Uint8Array(13);
  const iv = new DataView(ihdr.buffer);
  iv.setUint32(0, width);
  iv.setUint32(4, height);
  ihdr.set([8, 2, 0, 0, 0], 8); // 8-bit, truecolour RGB, deflate, no filter method, no interlace

  const ppm = Math.round(dpi / 0.0254); // 300 dpi = 11811 px/m
  const phys = new Uint8Array(9);
  const pv = new DataView(phys.buffer);
  pv.setUint32(0, ppm);
  pv.setUint32(4, ppm);
  phys[8] = 1; // unit: metre

  return new Blob(
    [
      new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      chunk('IHDR', ihdr),
      chunk('pHYs', phys),
      chunk('IDAT', await zlib(raw)),
      chunk('IEND', new Uint8Array(0)),
    ],
    { type: 'image/png' },
  );
}
