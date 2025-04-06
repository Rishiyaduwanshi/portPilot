import * as esbuild from 'esbuild';
import { readdirSync } from 'fs';
import { join } from 'path';

const srcDir = './lib';
const distCjs = './dist/cjs';
const distEsm = './dist/esm';

// Build all files in lib directory
async function buildAll() {
  const files = readdirSync(srcDir, { recursive: true })
    .filter(file => file.endsWith('.js'));

  // Build CJS version
  await esbuild.build({
    entryPoints: ['main.js', 'bin/cli.js', ...files.map(f => join(srcDir, f))],
    outdir: distCjs,
    format: 'cjs',
    platform: 'node',
    target: 'node14',
  });

  // Build ESM version
  await esbuild.build({
    entryPoints: ['main.js', 'bin/cli.js', ...files.map(f => join(srcDir, f))],
    outdir: distEsm,
    format: 'esm',
    platform: 'node',
    target: 'node14',
  });
}

buildAll();