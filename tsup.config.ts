import { join, resolve } from 'node:path';
import { defineConfig } from 'tsup';

const srcDir = resolve('src');

export default defineConfig({
  entry: [join(srcDir, 'index.ts')],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: false,
  clean: false,
  bundle: true,
  splitting: false,
  target: 'node18',
  platform: 'node',
});
