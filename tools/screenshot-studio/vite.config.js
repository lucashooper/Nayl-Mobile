import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import studioSaveEndpoint from './studio-server.js';

const repoRoot = fileURLToPath(new URL('../..', import.meta.url));

// The device screens import artwork straight from the app's own assets/ folder,
// so the studio always uses the same images the app ships with.
export default defineConfig({
  plugins: [react(), studioSaveEndpoint(repoRoot)],
  resolve: { alias: { '@app-assets': `${repoRoot}assets` } },
  server: { port: 5178, fs: { allow: [repoRoot] } },
});
