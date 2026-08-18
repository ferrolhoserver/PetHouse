import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

const root = process.cwd();
const indexPath = join(root, 'index.html');
const workerPath = join(root, 'sw.js');

function toPublicPath(value) {
  return `/${value.replace(/^\.\//, '').replaceAll('\\', '/')}`;
}

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolute = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(absolute));
    else files.push(toPublicPath(relative(root, absolute).split(sep).join('/')));
  }
  return files;
}

const html = await readFile(indexPath, 'utf8');
const activeAssets = [...html.matchAll(/<(?:script|link)\b[^>]+(?:src|href)=["']([^"']+)["'][^>]*>/gi)]
  .map(match => match[1])
  .filter(value => value.startsWith('./'))
  .map(toPublicPath);

const bundledRuntimeAssets = [
  '/vendor/tesseract/worker.min.js',
  '/vendor/tesseract/tesseract-core-lstm.wasm.js',
  '/vendor/tesseract/tesseract-core-lstm.wasm',
  '/vendor/tesseract/lang/por.traineddata'
];

const staticAssets = [
  '/', '/index.html', '/manifest.json', '/privacy.html', '/support.html',
  '/icons/icon-192.png', '/icons/icon-512.png',
  ...activeAssets,
  ...bundledRuntimeAssets,
  ...await walk(join(root, 'css'))
];

const shell = [...new Set(staticAssets)].sort();
const worker = await readFile(workerPath, 'utf8');
const replacement = `const SHELL = ${JSON.stringify(shell, null, 2)};`;
const shellPattern = /const SHELL = \[[\s\S]*?\];/;
if (!shellPattern.test(worker)) throw new Error('Não foi possível localizar a lista SHELL no service worker.');
const updated = worker.replace(shellPattern, replacement);
await writeFile(workerPath, updated);
console.log(`Pré-cache atualizado com ${shell.length} recursos.`);
