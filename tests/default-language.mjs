import assert from 'node:assert/strict';
import path from 'node:path';
import { createRequire } from 'node:module';
import { startServer } from '../scripts/serve.mjs';

const require = createRequire(import.meta.url);
let chromium;
for (const candidate of ['playwright', path.join(process.env.USERPROFILE || '', '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')]) {
  try { ({ chromium } = require(candidate)); break; } catch {}
}
assert.ok(chromium, 'Playwright is required for language navigation verification');
const base = process.env.SITE_BASE_PATH || '';
const server = await startServer({ port: 0, directory: process.env.TEST_DIST === '1' ? 'dist' : '.' });
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
try {
  for (const blockedStorage of [false, true]) {
    const context = await browser.newContext();
    if (blockedStorage) await context.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Storage blocked', 'SecurityError'); } });
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    if (base) await page.route(`${origin}${base}/**`, async route => {
      const url = new URL(route.request().url());
      url.pathname = url.pathname.slice(base.length);
      await route.fulfill({ response: await route.fetch({ url: url.href }) });
    });
    await page.goto(`${origin}${base}/?source=test#footer`);
    await page.waitForURL(`${origin}${base}/en/?source=test#footer`);
    assert.equal(await page.locator('html').getAttribute('lang'), 'en', 'First visit defaults to English');
    await page.locator('[data-language="vi"]').click();
    await page.waitForFunction(() => document.documentElement.lang === 'vi');
    assert.equal(new URL(page.url()).pathname, `${base}/`, 'VI switch reaches Vietnamese home');
    assert.equal(new URL(page.url()).hash, '#footer', 'Language switch preserves anchor');
    await page.reload();
    assert.equal(await page.locator('html').getAttribute('lang'), 'vi', 'Reload keeps explicit VI choice');
    if (!blockedStorage) {
      await page.goto(`${origin}${base}/`);
      assert.equal(await page.locator('html').getAttribute('lang'), 'vi', 'Return visit remembers VI');
    }
    await page.goto(`${origin}${base}/solutions/`);
    assert.equal(await page.locator('html').getAttribute('lang'), 'vi', 'Direct Vietnamese links remain available');
    await page.locator('[data-language="en"]').click();
    await page.waitForURL(`${origin}${base}/en/solutions/`);
    await page.goto(`${origin}${base}/`);
    await page.waitForURL(`${origin}${base}/en/`);
    assert.equal(await page.locator('html').getAttribute('lang'), 'en', 'EN selection restores English entry');
    assert.deepEqual(errors, [], 'Language navigation has no uncaught errors');
    await context.close();
  }
  console.log(`PASS: English default, remembered VI selection, anchors, deep links and blocked storage under ${base || '/'}`);
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
