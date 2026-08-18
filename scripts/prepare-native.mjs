import { cp, mkdir, rm, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = process.cwd();
const output = resolve(root, 'native/www');
const entries = ['index.html', 'manifest.json', 'sw.js', 'privacy.html', 'support.html', 'css', 'icons', 'js', 'vendor'];

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const entry of entries) {
  const source = resolve(root, entry);
  try {
    await stat(source);
    await cp(source, resolve(output, entry), { recursive: true, force: true });
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}
console.log(`PetHouse pronto para Capacitor em ${output}`);
