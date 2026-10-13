import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
for (const file of ['tests/default-language.mjs', 'src/smooth-scroll.js', 'src/back-to-top.js', 'src/products.js', 'src/hero-graphics.js', 'src/footer.js', 'scripts/footer-graphic.mjs', 'scripts/vendor-lenis.mjs', 'scripts/site-base.mjs', 'scripts/production-assets.mjs', 'tests/deployment.mjs', 'tests/smooth-scroll.mjs', 'tests/back-to-top.mjs', 'tests/products-motion.mjs', 'tests/hero-graphics.mjs', 'tests/connection-regression.mjs']) {
  const result = spawnSync(process.execPath, ['--check', path.join(root, file)], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
}
const lenis = JSON.parse(await fs.readFile(path.join(root, 'public/assets/vendor/lenis/provenance.json'), 'utf8'));
assert.equal(lenis.version, '1.3.26');
for (const file of lenis.files) {
  const bytes = await fs.readFile(path.join(root, file.path));
  assert.equal(createDigest(bytes), file.sha256, `Lenis asset integrity: ${file.path}`);
}
function createDigest(bytes) { return crypto.createHash('sha256').update(bytes).digest('hex'); }
function webpDimensions(bytes) {
  for (let offset = 12; offset + 8 <= bytes.length;) {
    const type = bytes.toString('ascii', offset, offset + 4);
    const size = bytes.readUInt32LE(offset + 4);
    const start = offset + 8;
    assert.ok(start + size <= bytes.length, 'Complete WebP chunk');
    if (type === 'VP8X') return [bytes.readUIntLE(start + 4, 3) + 1, bytes.readUIntLE(start + 7, 3) + 1];
    if (type === 'VP8 ') return [bytes.readUInt16LE(start + 6) & 0x3fff, bytes.readUInt16LE(start + 8) & 0x3fff];
    if (type === 'VP8L') {
      const bits = bytes.readUInt32LE(start + 1);
      return [(bits & 0x3fff) + 1, ((bits >>> 14) & 0x3fff) + 1];
    }
    offset = start + size + (size % 2);
  }
  throw new Error('WebP image dimensions not found');
}
for (const file of ['src/main.js', 'src/reveals.js', 'src/connection-scene.js', 'src/about-story.js', 'src/solutions.js', 'src/services.js', 'scripts/serve.mjs', 'scripts/build.mjs', 'scripts/render-pages.mjs', 'scripts/home-markup.mjs', 'tests/home-layout.mjs', 'scripts/visuals.mjs', 'scripts/about-story-markup.mjs', 'scripts/solutions-markup.mjs', 'scripts/services-markup.mjs', 'scripts/html.mjs', 'scripts/export-logo.mjs', 'tests/pages.mjs', 'tests/english-only.mjs', 'tests/english-content.mjs', 'tests/logo.mjs', 'tests/browser.mjs', 'tests/home-motion.mjs', 'tests/about-story.mjs', 'tests/solutions.mjs', 'tests/services.mjs']) {
  const result = spawnSync(process.execPath, ['--check', path.join(root, file)], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
}
const css = (await Promise.all(['src/site.css', 'src/home.css', 'src/about-story.css', 'src/solutions.css', 'src/services.css', 'src/products.css', 'src/hero-graphics.css'].map(file => fs.readFile(path.join(root, file), 'utf8')))).join('\n');
assert.ok(!/transition\s*:\s*all\b/.test(css), 'Do not animate every CSS property');
assert.ok(!/scale\(0\)/.test(css), 'Do not enter from zero scale');
const bodyFont = JSON.parse(await fs.readFile(path.join(root, 'public/assets/fonts/be-vietnam-pro/provenance.json'), 'utf8'));
assert.ok((await fs.stat(path.join(root, bodyFont.licenseFile))).isFile());
for (const font of bodyFont.files) {
  const bytes = await fs.readFile(path.join(root, font.path));
  assert.equal(bytes.toString('ascii', 0, 4), 'wOF2', `Real WOFF2 font: ${font.path}`);
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), font.sha256, `Font provenance: ${font.path}`);
}
for (const family of ['bricolage-grotesque', 'manrope']) {
  assert.ok((await fs.stat(path.join(root, 'public/assets/fonts', family, 'OFL.txt'))).isFile());
}
const visuals = JSON.parse(await fs.readFile(path.join(root, 'content/visual-assets.json'), 'utf8'));
for (const asset of visuals.images) {
  const bytes = await fs.readFile(path.join(root, asset.destination));
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), asset.metadata.sha256);
  assert.equal(bytes.toString('ascii', 0, 4), 'RIFF');
  assert.equal(bytes.toString('ascii', 8, 12), 'WEBP');
  assert.deepEqual(webpDimensions(bytes), [asset.metadata.width, asset.metadata.height], `Image dimensions match: ${asset.destination}`);
}
const icons = JSON.parse(await fs.readFile(path.join(root, visuals.icons.provenance), 'utf8'));
for (const asset of icons.files) {
  const bytes = await fs.readFile(path.join(root, asset.path));
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), asset.sha256);
}
const vendorLogos = JSON.parse(await fs.readFile(path.join(root, 'public/assets/brand/vendors/provenance.json'), 'utf8'));
for (const asset of vendorLogos.files) {
  const bytes = await fs.readFile(path.join(root, asset.path));
  assert.equal(createDigest(bytes), asset.sha256, `Vendor logo integrity: ${asset.path}`);
}
assert.ok((await fs.stat(path.join(root, visuals.icons.licenseFile))).isFile());
console.log('PASS: JavaScript syntax, motion policy, image dimensions and provenance, sourced icons and license');
