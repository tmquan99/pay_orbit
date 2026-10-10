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
for (const route of [...routes, ...routes.map(route => '/en' + route)]) {
  const html = await fs.readFile(path.join(destination, route.slice(1), 'index.html'), 'utf8');
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
const css = await fs.readFile(path.join(destination, 'src/site.css'), 'utf8');
assert.ok(css.includes(`url('${base}/assets/fonts/`), 'Published font URLs use the deployment path');
const smoothScroll = await fs.readFile(path.join(destination, 'src/smooth-scroll.js'), 'utf8');
assert.ok(smoothScroll.includes(`import('${base}/assets/vendor/lenis/lenis.js')`), 'Dynamic Lenis import uses the deployment path');
const manifest = JSON.parse(await fs.readFile(path.join(destination, 'assets/brand/site.webmanifest'), 'utf8'));
assert.equal(manifest.start_url, `${base}/`);
assert.ok(manifest.icons.every(icon => icon.src.startsWith(`${base}/assets/brand/`)));
assert.ok((await fs.stat(path.join(destination, '.nojekyll'))).isFile());
console.log(`PASS: all 12 published routes, assets, fonts, dynamic imports and manifest under ${base || '/'}`);
