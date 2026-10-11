import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer } from '../scripts/serve.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const site = process.env.TEST_DIST === '1' ? path.join(root, 'dist') : root;
const workbook = JSON.parse(await fs.readFile(path.join(root, 'content/workbook.json'), 'utf8'));
const routes = ['/vi/', '/vi/about/', '/vi/solutions/', '/vi/services/', '/vi/products/', '/vi/contact/'];
const coverage = [
  // C6:C9 use the concise, grouped story copy approved for readability.
  ['/vi/about/', '02_Company_Intro', ['C5']],
  ['/vi/solutions/', '03_Solutions', ['C5', 'C6', 'C7', 'C8']],
  ['/vi/services/', '04_Services', ['C5', 'C6', 'C7', 'C8', 'C9']],
  ['/vi/products/', '05_Products_Tech', ['C5', 'C6', 'C7', 'C8', 'C9', 'C10', 'C11']],
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
// Home C5 was replaced by the concise hero approved on 2026-10-09.
for (const cell of ['C7', 'C8']) assert.ok(normalize(pages.get('/vi/')).includes(normalize(workbook.sheets['01_Home'][cell])), `Home content ${cell}`);
const linkPages = new Map(pages);
for (const route of routes) {
  const english = route.slice(3);
  linkPages.set(english, await fs.readFile(path.join(site, english.slice(1), 'index.html'), 'utf8'));
}
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
assert.ok(!pages.get('/vi/').includes('id="consultation_form"'), 'Home must remain an overview, not a combined contact page');
assert.ok(!pages.get('/vi/').includes('Cortex XSIAM'), 'Detailed product names belong on Products, not Home');
assert.ok(pages.get('/vi/contact/').includes('id="consultation_form"'));
assert.ok(pages.get('/vi/contact/').includes('tel:+61433024689'));
for (const [route, html] of pages) {
  assert.ok(html.includes('data-icon='), `Meaningful icon cues must render at ${route}`);
  for (const svg of html.matchAll(/<svg\b[^>]*>/g)) {
    assert.ok(svg[0].includes('aria-hidden="true"'), 'Decorative icons must not duplicate accessible labels');
    const footerGraphic = /data-footer-graphic="upper"[^>]*viewBox="40 40 176 104"|data-footer-graphic="lower"[^>]*viewBox="40 112 176 104"/.test(svg[0]);
    assert.ok(svg[0].includes('data-icon=') || footerGraphic || (['/vi/', '/vi/solutions/'].includes(route) && svg[0].includes('data-connection-graphic') && svg[0].includes('viewBox="0 0 1536 1024"')), 'Icons must come from the recorded library; cable and approved logo backgrounds are separate graphics');
  }
}
for (const route of ['/vi/about/']) {
  assert.ok(pages.get(route).includes('class="lifecycle'), `Readable lifecycle at ${route}`);
  for (const anchor of ['consulting', 'design', 'supply', 'implementation', 'support']) assert.ok(pages.get(route).includes(`/vi/services/#${anchor}`), `Lifecycle link ${anchor} at ${route}`);
}
assert.ok(pages.get('/vi/services/').includes('data-service-nav'), 'Compact service journey navigation');
for (const anchor of ['consulting', 'design', 'supply', 'implementation', 'support']) assert.ok(pages.get('/vi/services/').includes(`href="#${anchor}"`), `Service journey link ${anchor}`);
assert.ok(pages.get('/vi/solutions/').includes('enterprise-ecosystem.webp'));
assert.ok(pages.get('/vi/solutions/').includes('class="solution-overview"'));
assert.ok(pages.get('/vi/products/').includes('class="technology-overview"'));
assert.ok(pages.get('/vi/services/').includes('service-lifecycle.webp'));
const server = await startServer({ port: 0, host: '127.0.0.1', directory: process.env.TEST_DIST === '1' ? 'dist' : '.' });
try {
  const origin = `http://127.0.0.1:${server.address().port}`;
  for (const route of routes) {
    const response = await fetch(origin + route);
    assert.equal(response.status, 200, `Direct route ${route}`);
    assert.equal(await response.text(), pages.get(route), `Route serves its own HTML ${route}`);
    if (route !== '/vi/') {
      const redirect = await fetch(origin + route.slice(0, -1), { redirect: 'manual' });
      assert.equal(redirect.status, 308, `Normalize trailing slash ${route}`);
      assert.equal(redirect.headers.get('location'), route);
    }
  }
  assert.equal((await fetch(origin + '/not-a-page/')).status, 404);
  console.log('PASS: six direct page routes, shared navigation, active states and preserved workbook content');
} finally { await new Promise(resolve => server.close(resolve)); }
