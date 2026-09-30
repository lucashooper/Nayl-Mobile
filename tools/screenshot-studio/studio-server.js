import fs from 'node:fs/promises';
import path from 'node:path';

// Local-only endpoints so "Export All" can write straight into the repo
// (e.g. ./assets/app-store-screenshots/). Paths resolve against the repo root and
// may not escape it; only .png files are written.
export default function studioSaveEndpoint(repoRoot) {
  const root = path.resolve(repoRoot);

  const handler = async (req, res, next) => {
    const url = new URL(req.url, 'http://localhost');
    const send = (status, body) => {
      res.statusCode = status;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(body));
    };

    if (url.pathname === '/__studio/ping') return send(200, { ok: true, root });
    if (url.pathname !== '/__studio/save') return next();
    if (req.method !== 'POST') return send(405, { error: 'POST only' });

    const dir = url.searchParams.get('dir') || '.';
    const name = url.searchParams.get('name') || '';
    if (!/^[\w.-]+\.png$/i.test(name)) return send(400, { error: `Bad file name: ${name}` });

    const target = path.resolve(root, dir);
    if (target !== root && !target.startsWith(root + path.sep)) {
      return send(400, { error: `Export folder must be inside the repo (${root})` });
    }

    try {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      const body = Buffer.concat(chunks);
      if (body.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') return send(400, { error: 'Not a PNG' });
      await fs.mkdir(target, { recursive: true });
      await fs.writeFile(path.join(target, name), body);
      send(200, { ok: true, dir: path.relative(root, target) || '.' });
    } catch (e) {
      send(500, { error: e.message });
    }
  };

  return {
    name: 'nayl-studio-save',
    configureServer(server) {
      server.middlewares.use(handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler);
    },
  };
}
