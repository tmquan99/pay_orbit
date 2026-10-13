import fs from 'node:fs/promises';
import path from 'node:path';

async function files(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map(entry => {
    const filename = path.join(directory, entry.name);
    return entry.isDirectory() ? files(filename) : filename;
  }))).flat();
}

/** Include live page assets and redistribution notices, never design sources. */
export async function collectProductionAssets(root, routes) {
  const required = new Set();
  const collect = text => {
    for (const [url] of text.matchAll(/\/assets\/[A-Za-z0-9_./-]+/g)) {
      const relative = url.slice(1);
      if (relative.split('/').includes('..')) throw new Error(`Invalid asset path: ${url}`);
      required.add(relative);
    }
  };
  const documents = routes.map(route => path.join(root, route.slice(1), 'index.html'));
  const sourceFiles = (await files(path.join(root, 'src'))).filter(file => /\.(css|js)$/.test(file));
  for (const filename of [...documents, ...sourceFiles]) collect(await fs.readFile(filename, 'utf8'));

  // Web app icons are referenced by the manifest rather than by page markup.
  const manifestPath = 'assets/brand/site.webmanifest';
  if (required.has(manifestPath)) {
    const manifest = JSON.parse(await fs.readFile(path.join(root, 'public', manifestPath), 'utf8'));
    for (const icon of manifest.icons || []) collect(icon.src);
  }
  for (const filename of await files(path.join(root, 'public', 'assets'))) {
    if (/^(?:LICENSE(?:\.[\w-]+)?|OFL\.txt|provenance\.json)$/i.test(path.basename(filename))) {
      required.add(path.relative(path.join(root, 'public'), filename).split(path.sep).join('/'));
    }
  }
  for (const relative of required) {
    if (!(await fs.stat(path.join(root, 'public', relative))).isFile()) throw new Error(`Missing production asset: ${relative}`);
  }
  return [...required].sort();
}
