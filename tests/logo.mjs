import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const site = process.env.TEST_DIST === '1' ? path.join(root, 'dist') : root;
const routes = ['/', '/about/', '/solutions/', '/services/', '/products/', '/contact/'];
for (const route of [...routes, ...routes.map(route => '/en' + route)]) {
  const html = await fs.readFile(path.join(site, route.slice(1), 'index.html'), 'utf8');
  assert.ok(/<a class="wordmark"[^>]*>\s*<img class="brand-symbol"/.test(html), `Logo must appear in the header at ${route}`);
  assert.ok(/class="footer-name"[^>]*>\s*<span class="brand-lockup">\s*<img class="brand-symbol"/.test(html), `Matching logo must appear in the footer at ${route}`);
  assert.ok(html.includes('rel="icon" type="image/svg+xml" href="/assets/brand/pay-orbit-favicon.svg"'), `Vector tab icon at ${route}`);
  assert.ok(html.includes('src="/assets/brand/pay-orbit-mark.svg"'), `Scalable approved symbol at ${route}`);
  assert.equal((html.match(/class="brand-symbol"/g) || []).length, 2, `No extra decorative logos on ${route}`);
  assert.ok(html.includes('alt="" aria-hidden="true"'), 'The mark must not duplicate the accessible brand name');
}
const bytes = await fs.readFile(path.join(root, 'public/assets/brand/pay-orbit-mark.png'));
const ledger = JSON.parse(await fs.readFile(path.join(root, 'content/brand-assets.json'), 'utf8'));
assert.equal(bytes.subarray(1, 4).toString(), 'PNG');
assert.equal(bytes.readUInt32BE(16), bytes.readUInt32BE(20), 'Square brand symbol must not stretch');
assert.ok(bytes.readUInt32BE(16) >= 512, 'Retain a usable source resolution');
assert.ok([4, 6].includes(bytes[25]), 'Logo must carry an alpha channel');
assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), ledger.symbol.sha256);
for (const asset of [...ledger.lockups, ...ledger.webAssets]) {
  const image = await fs.readFile(path.join(root, asset.path));
  assert.equal(image.readUInt32BE(16), asset.width);
  assert.equal(image.readUInt32BE(20), asset.height);
  assert.equal(image[25], 6, 'Exported logo retains transparency');
  assert.equal(crypto.createHash('sha256').update(image).digest('hex'), asset.sha256);
}
for (const asset of ledger.vectorAssets) {
  const vector = await fs.readFile(path.join(root, asset.path), 'utf8');
  assert.ok(vector.includes('<svg') && vector.includes('viewBox='));
  assert.ok(!/<(?:text|image|filter)\b/.test(vector), `Portable outlined artwork: ${asset.path}`);
  assert.equal(crypto.createHash('sha256').update(vector).digest('hex'), asset.sha256);
}
console.log('PASS: approved vector logo and favicon on 12 routes, accessible labels, transparent PNGs and outlined SVG provenance');
