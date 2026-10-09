import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderPages, pageRoutes } from './render-pages.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const destination = path.join(root, 'dist');
await renderPages();
await fs.mkdir(destination, { recursive: true });
for (const route of pageRoutes) {
  const relative = route === '/' ? 'index.html' : route.slice(1) + 'index.html';
  await fs.mkdir(path.dirname(path.join(destination, relative)), { recursive: true });
  await fs.copyFile(path.join(root, relative), path.join(destination, relative));
}
await fs.cp(path.join(root, 'src'), path.join(destination, 'src'), { recursive: true });
await fs.cp(path.join(root, 'public'), destination, { recursive: true });
console.log('Build complete: dist/ (12 static pages in Vietnamese and English, CSS, JavaScript and local assets)');
