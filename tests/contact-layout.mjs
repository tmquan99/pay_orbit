import assert from 'node:assert/strict';
import path from 'node:path';
import { createRequire } from 'node:module';
import { startServer } from '../scripts/serve.mjs';

const require = createRequire(import.meta.url);
let chromium;
for (const candidate of ['playwright', path.join(process.env.USERPROFILE || '', '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')]) {
  try { ({ chromium } = require(candidate)); break; } catch {}
}
assert.ok(chromium, 'Playwright is required');
const server = await startServer({ port: 0, directory: process.env.TEST_DIST === '1' ? 'dist' : '.' });
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
try {
  for (const [width, height] of [[1920, 1080], [2560, 1440], [2400, 1350], [1440, 900], [1024, 1366], [390, 844], [320, 568]]) {
    for (const javaScriptEnabled of [true, false]) {
      const page = await browser.newPage({ viewport: { width, height }, javaScriptEnabled });
      await page.goto(`http://127.0.0.1:${server.address().port}/contact/`, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      const layout = await page.evaluate(() => {
        const box = selector => { const r = document.querySelector(selector).getBoundingClientRect(); return { top: r.top + scrollY, bottom: r.bottom + scrollY }; };
        return { viewport: innerHeight, scrollWidth: document.documentElement.scrollWidth, contact: box('#contact'), footer: box('.site-footer'), button: box('#send_button'), bodyHeight: document.body.getBoundingClientRect().height };
      });
      assert.ok(layout.footer.bottom >= height - 1, `Footer cannot leave an empty strip below the page at ${width}×${height}: ${JSON.stringify(layout)}`);
      assert.ok(Math.abs(layout.footer.top - layout.contact.bottom) < 1, 'Contact background meets footer without a gap');
      assert.ok(layout.button.bottom <= layout.contact.bottom, 'Form fits without overlapping footer');
      assert.ok(layout.scrollWidth <= width, 'No horizontal overflow');
      // The no-JS fallback adds an email instruction, which can require natural scrolling.
      if (width >= 1440 && height >= 1080 && javaScriptEnabled) assert.ok(Math.abs(layout.footer.bottom - height) <= 1, `Short desktop content fills the viewport without extra scrolling: ${JSON.stringify(layout)}`);
      await page.close();
    }
  }
  console.log('PASS: Contact fills tall desktop screens, preserves natural mobile scrolling and form/footer separation, with and without JavaScript');
} finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
