import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

const repoRoot = fileURLToPath(new URL('../..', import.meta.url));

// The device screens import artwork straight from the app's own assets/ folder,
// so the studio always uses the same images the app ships with.
export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@app-assets': `${repoRoot}assets` } },
  server: { port: 5178, fs: { allow: [repoRoot] } },
});
