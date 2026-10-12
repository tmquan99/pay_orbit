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
  const response = await fetch(origin + '/about');
  assert.equal(new URL(response.url).pathname, '/about/', 'Slash normalization keeps the English root route');
  assert.match(await response.text(), /<html lang="en">/, 'English is the actual default HTML, without a language redirect');
  for (const javaScriptEnabled of [true, false]) {
    const context = await browser.newContext({ javaScriptEnabled });
    // Old browser preferences must never override the language in the URL.
    await context.addInitScript(() => localStorage.setItem(`pay-orbit-language:${location.pathname}`, 'vi'));
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    if (base) await page.route(`${origin}${base}/**`, async route => {
      const url = new URL(route.request().url());
      url.pathname = url.pathname.slice(base.length);
      await route.fulfill({ response: await route.fetch({ url: url.href }) });
    });
    for (const route of ['/', '/about/', '/solutions/', '/services/', '/products/', '/contact/']) {
      await page.goto(`${origin}${base}${route}`);
      assert.equal(new URL(page.url()).pathname, `${base}${route}`, 'English stays at the root URL');
      assert.equal(await page.locator('html').getAttribute('lang'), 'en');
      assert.equal(await page.locator('[data-language], .language-switch').count(), 0);
      assert.ok(!/[À-ỹ]/u.test(await page.locator('body').innerText()));
      await page.reload();
      assert.equal(await page.locator('html').getAttribute('lang'), 'en');
    }
    if (javaScriptEnabled) {
      await page.goto(`${origin}${base}/solutions/#cybersecurity`);
      assert.equal(new URL(page.url()).hash, '#cybersecurity');
      await page.locator('#site_navigation a[href$="/services/"]').click();
      await page.waitForURL(`${origin}${base}/services/`);
      await page.goBack();
      assert.equal(new URL(page.url()).hash, '#cybersecurity');
    }
    assert.deepEqual(errors, [], 'Language navigation has no uncaught errors');
    await context.close();
  }
  console.log(`PASS: English-only root URLs, anchors, native navigation and no-JS under ${base || '/'}`);
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
