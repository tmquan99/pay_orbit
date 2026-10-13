import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeBasePath, rebaseSiteFile } from '../scripts/site-base.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const base = normalizeBasePath(process.env.SITE_BASE_PATH);
assert.equal(normalizeBasePath('/'), '');
assert.equal(normalizeBasePath('pay_orbit/'), '/pay_orbit');
assert.throws(() => normalizeBasePath('https://example.com'));
assert.throws(() => normalizeBasePath('/../outside'));
assert.equal(rebaseSiteFile('<a href="//example.com">x</a><a href="#section">y</a>', '.html', '/pay_orbit'), '<a href="//example.com">x</a><a href="#section">y</a>');

const destination = path.join(root, 'dist');
const routes = ['/', '/about/', '/solutions/', '/services/', '/products/', '/contact/'];
for (const route of routes) {
  const html = await fs.readFile(path.join(destination, route.slice(1), 'index.html'), 'utf8');
  assert.ok(html.includes(`<html lang="${'en'}">`), `Published language matches URL: ${route}`);
  assert.ok(!html.includes('/src/language.js'), 'Language is served directly without preference redirects');
  for (const match of html.matchAll(/\b(href|src|srcset)="([^"]*)"/g)) {
    const urls = match[1] === 'srcset' ? match[2].split(',').map(value => value.trim().split(/\s+/)[0]) : [match[2]];
    for (const url of urls) {
      if (!url.startsWith('/') || url.startsWith('//')) continue;
      assert.ok(url.startsWith(`${base}/`), `Published URL stays within the site: ${url}`);
      const relative = new URL(url, 'http://localhost').pathname.slice(base.length + 1);
      assert.ok((await fs.stat(path.join(destination, decodeURIComponent(relative)))).isFile() || (await fs.stat(path.join(destination, decodeURIComponent(relative), 'index.html'))).isFile());
    }
  }
}
assert.equal(await fs.stat(path.join(destination, 'vi')).catch(() => null), null, 'Vietnamese output must not survive rebuilding');
const css = await fs.readFile(path.join(destination, 'src/site.css'), 'utf8');
assert.equal(await fs.stat(path.join(destination, 'en/index.html')).catch(() => null), null, 'Removed /en/ output must not survive rebuilding');
assert.equal(await fs.stat(path.join(destination, 'src/language.js')).catch(() => null), null, 'Removed language redirect must not survive rebuilding');
assert.ok(css.includes(`url('${base}/assets/fonts/`), 'Published font URLs use the deployment path');
const smoothScroll = await fs.readFile(path.join(destination, 'src/smooth-scroll.js'), 'utf8');
assert.ok(smoothScroll.includes(`import('${base}/assets/vendor/lenis/lenis.js')`), 'Dynamic Lenis import uses the deployment path');
const manifest = JSON.parse(await fs.readFile(path.join(destination, 'assets/brand/site.webmanifest'), 'utf8'));
assert.equal(manifest.start_url, `${base}/`);
assert.ok(manifest.icons.every(icon => icon.src.startsWith(`${base}/assets/brand/`)));
assert.ok((await fs.stat(path.join(destination, '.nojekyll'))).isFile());
// Production bundles contain runtime files and required notices only.
for (const directory of ['design', 'docs', 'content', 'tests', 'scripts', '.taste']) {
  assert.equal(await fs.stat(path.join(destination, directory)).catch(() => null), null, `No development directory in production: ${directory}`);
}
const imageFiles = await fs.readdir(path.join(destination, 'assets/images'));
assert.ok(imageFiles.every(filename => filename.endsWith('.webp')), 'Only optimized WebP illustrations are published');
assert.ok(!imageFiles.some(filename => /hero_infrastructure|infrastructure-team|digital-infrastructure|security-gateway|service-lifecycle/.test(filename)), 'Retired illustrations stay out of the bundle');
for (const filename of await fs.readdir(path.join(destination, 'src'))) {
  if (!/\.(css|js)$/.test(filename)) continue;
  const source = await fs.readFile(path.join(destination, 'src', filename), 'utf8');
  for (const [url] of source.matchAll(/\/assets\/[A-Za-z0-9_./-]+/g)) {
    const relative = url.startsWith(`${base}/`) ? url.slice(base.length + 1) : url.slice(1);
    assert.ok((await fs.stat(path.join(destination, relative))).isFile(), `Published stylesheet/module asset exists: ${url}`);
  }
}
for (const license of ['assets/fonts/be-vietnam-pro/OFL.txt', 'assets/fonts/bricolage-grotesque/OFL.txt', 'assets/fonts/manrope/OFL.txt', 'assets/icons/lucide/LICENSE.txt', 'assets/vendor/lenis/LICENSE']) {
  assert.ok((await fs.stat(path.join(destination, license))).isFile(), `Redistribution license retained: ${license}`);
}
console.log(`PASS: all six published routes, assets, fonts, dynamic imports and manifest under ${base || '/'}`);
