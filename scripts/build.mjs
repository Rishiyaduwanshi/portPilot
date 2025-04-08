import * as esbuild from 'esbuild';
import { readdirSync } from 'fs';
import { join } from 'path';

const srcDir = './lib';
const distCjs = './dist/cjs';
const distEsm = './dist/esm';

const cliEntry = 'bin/cli.js';
const mainEntry = 'main.js';

const libFiles = readdirSync(srcDir, { recursive: true })
  .filter(file => file.endsWith('.js'))
  .map(file => join(srcDir, file));

const commonOptions = {
  platform: 'node',
  target: 'node14',
  bundle: true,
  outbase: '.',
  external: ['node:*']  // Exclude built-ins
};

async function buildAll() {
  // --- CJS CLI (with shebang) ---
  await esbuild.build({
    entryPoints: [cliEntry],
    outfile: `${distCjs}/bin/cli.js`, 
    format: 'cjs',
    banner: { js: '#!/usr/bin/env node' },
    ...commonOptions
  });

  // --- ESM CLI ---
  await esbuild.build({
    entryPoints: [cliEntry],
    outfile: `${distEsm}/bin/cli.js`, 
    format: 'esm',
    ...commonOptions
  });

  // --- CJS main + lib ---
  await esbuild.build({
    entryPoints: [mainEntry, ...libFiles],
    outdir: distCjs,
    format: 'cjs',
    ...commonOptions
  });

  // --- ESM main + lib ---
  await esbuild.build({
    entryPoints: [mainEntry, ...libFiles],
    outdir: distEsm,
    format: 'esm',
    ...commonOptions
  });
}

buildAll();
