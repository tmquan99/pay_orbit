import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderPages, pageRoutes } from './render-pages.mjs';
import { normalizeBasePath, rebaseSiteFile } from './site-base.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const destination = path.join(root, 'dist');
const basePath = normalizeBasePath(process.env.SITE_BASE_PATH);
await renderPages();
await fs.mkdir(destination, { recursive: true });
for (const route of pageRoutes) {
  const relative = route === '/' ? 'index.html' : route.slice(1) + 'index.html';
  await fs.mkdir(path.dirname(path.join(destination, relative)), { recursive: true });
  await fs.copyFile(path.join(root, relative), path.join(destination, relative));
}
await fs.cp(path.join(root, 'src'), path.join(destination, 'src'), { recursive: true });
await fs.cp(path.join(root, 'public'), destination, { recursive: true });
if (basePath) {
  const rebaseDirectory = async directory => {
    for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
      const filename = path.join(directory, entry.name);
      if (entry.isDirectory()) await rebaseDirectory(filename);
      else if (['.html', '.css', '.js', '.webmanifest'].includes(path.extname(filename))) {
        const source = await fs.readFile(filename, 'utf8');
        await fs.writeFile(filename, rebaseSiteFile(source, path.extname(filename), basePath));
      }
    }
  };
  await rebaseDirectory(destination);
}
await fs.writeFile(path.join(destination, '.nojekyll'), '');
console.log('Build complete: dist/ (12 static pages in Vietnamese and English, CSS, JavaScript and local assets)');
