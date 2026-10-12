import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer } from '../scripts/serve.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const site = process.env.TEST_DIST === '1' ? path.join(root, 'dist') : root;
const routes = ['/', '/about/', '/solutions/', '/services/', '/products/', '/contact/'];
const server = await startServer({ port: 0, directory: process.env.TEST_DIST === '1' ? 'dist' : '.' });
try {
  const origin = `http://127.0.0.1:${server.address().port}`;
  for (const route of routes) {
    const response = await fetch(origin + route);
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.match(html, /<html lang="en">/);
    assert.ok(!/data-language=|class="language-switch"|hreflang=|href="\/vi(?:\/|")/.test(html), `No language switch or Vietnamese alternate at ${route}`);
    assert.ok(!/[À-ỹ]/u.test(html), `All published copy, metadata, alt text and form messages are English at ${route}`);
    assert.equal((await fetch(origin + '/vi' + route)).status, 404, `Vietnamese route removed: /vi${route}`);
  }
  assert.equal(await fs.stat(path.join(site, 'vi')).catch(() => null), null, 'No stale Vietnamese output directory');
  console.log('PASS: six English-only pages, accessible copy and metadata, no language switch or Vietnamese routes');
} finally {
  await new Promise(resolve => server.close(resolve));
}
