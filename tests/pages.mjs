import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer } from '../scripts/serve.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const site = process.env.TEST_DIST === '1' ? path.join(root, 'dist') : root;
const workbook = JSON.parse(await fs.readFile(path.join(root, 'content/workbook.json'), 'utf8'));
const routes = ['/', '/about/', '/solutions/', '/services/', '/products/', '/contact/'];
const coverage = [
  // C6:C9 use the concise, grouped story copy approved for readability.
  ['/about/', '02_Company_Intro', ['B5']],
  ['/solutions/', '03_Solutions', ['B5', 'B6', 'B7', 'B8']],
  ['/products/', '05_Products_Tech', ['B5', 'B6', 'B7', 'B8', 'B9', 'B10', 'B11']],
];
const normalize = text => text.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
const pages = new Map();
for (const route of routes) {
  const file = path.join(site, route.slice(1), 'index.html');
  const html = await fs.readFile(file, 'utf8').catch(() => null);
  assert.ok(html, `Missing standalone page ${route}`);
  pages.set(route, html);
  assert.equal((html.match(/<h1\b/g) || []).length, 1, `Exactly one h1 at ${route}`);
  assert.equal((html.match(/aria-current="page"/g) || []).length, 1, `Active menu item at ${route}`);
  for (const destination of routes) assert.ok(html.includes(`href="${destination}"`), `Menu destination ${destination} on ${route}`);
}
for (const [route, sheet, cells] of coverage) {
  const text = normalize(pages.get(route));
  for (const cell of cells) assert.ok(text.includes(normalize(workbook.sheets[sheet][cell])), `${sheet}!${cell} must appear in full at ${route}`);
}
// Home A replaces the previous overview with the approved needs-led composition.
for (const copy of ["What does your business need?", "Network and cybersecurity services", "Technology that fits your needs"]) assert.ok(normalize(pages.get('/')).includes(copy), `Approved Home A copy: ${copy}`);
const linkPages = pages;
for (const [route, html] of pages) {
  for (const [, href] of html.matchAll(/href="([^"]+)"/g)) {
    if (href.startsWith('tel:') || href.startsWith('/src/') || href.startsWith('/assets/')) continue;
    const parsed = new URL(href, `https://pay-orbit.invalid${route}`);
    const anchor = parsed.hash.slice(1);
    const target = linkPages.get(parsed.pathname);
    assert.ok(target, `Internal page exists: ${href} on ${route}`);
    if (anchor) assert.ok(target.includes(`id="${anchor}"`), `Anchor exists: ${href} on ${route}`);
  }
  assert.ok(!html.includes('[Cập nhật sau]'), 'Do not publish placeholder email');
}
assert.ok(!pages.get('/').includes('id="consultation_form"'), 'Home must remain an overview, not a combined contact page');
assert.ok(!pages.get('/').includes('Cortex XSIAM'), 'Detailed product names belong on Products, not Home');
assert.ok(pages.get('/contact/').includes('id="consultation_form"'));
assert.ok(pages.get('/contact/').includes('tel:+61433024689'));
for (const [route, html] of pages) {
  assert.ok(html.includes('data-icon='), `Meaningful icon cues must render at ${route}`);
  for (const svg of html.matchAll(/<svg\b[^>]*>/g)) {
    assert.ok(svg[0].includes('aria-hidden="true"'), 'Decorative icons must not duplicate accessible labels');
    const footerGraphic = /data-footer-graphic="upper"[^>]*viewBox="40 40 176 104"|data-footer-graphic="lower"[^>]*viewBox="40 112 176 104"/.test(svg[0]);
    const connectionGraphic = svg[0].includes('data-connection-graphic') && ((route === '/' && svg[0].includes('viewBox="0 0 2172 724"')) || (route === '/solutions/' && svg[0].includes('viewBox="0 0 1536 1024"')));
    assert.ok(svg[0].includes('data-icon=') || footerGraphic || connectionGraphic, 'Icons must come from the recorded library; cable and approved logo backgrounds are separate graphics');
  }
}
for (const route of ['/about/']) {
  assert.ok(pages.get(route).includes('class="lifecycle'), `Readable lifecycle at ${route}`);
  for (const anchor of ['consulting', 'design', 'implementation', 'support']) assert.ok(pages.get(route).includes(`/services/#${anchor}`), `Lifecycle link ${anchor} at ${route}`);
}
assert.ok(pages.get('/services/').includes('data-service-nav'), 'Compact service journey navigation');
for (const anchor of ['consulting', 'cybersecurity-consulting', 'design', 'implementation', 'support']) assert.ok(pages.get('/services/').includes(`href="#${anchor}"`), `Service journey link ${anchor}`);
assert.ok(pages.get('/solutions/').includes('enterprise-ecosystem.webp'));
assert.ok(pages.get('/solutions/').includes('class="solution-overview"'));
assert.ok(pages.get('/products/').includes('class="technology-overview"'));
assert.ok(pages.get('/services/').includes('services-editorial-hero.webp'));
const server = await startServer({ port: 0, host: '127.0.0.1', directory: process.env.TEST_DIST === '1' ? 'dist' : '.' });
try {
  const origin = `http://127.0.0.1:${server.address().port}`;
  for (const route of routes) {
    const response = await fetch(origin + route);
    assert.equal(response.status, 200, `Direct route ${route}`);
    assert.equal(await response.text(), pages.get(route), `Route serves its own HTML ${route}`);
    if (route !== '/') {
      const redirect = await fetch(origin + route.slice(0, -1), { redirect: 'manual' });
      assert.equal(redirect.status, 308, `Normalize trailing slash ${route}`);
      assert.equal(redirect.headers.get('location'), route);
    }
  }
  assert.equal((await fetch(origin + '/not-a-page/')).status, 404);
  console.log('PASS: six direct page routes, shared navigation, active states and preserved workbook content');
} finally { await new Promise(resolve => server.close(resolve)); }
