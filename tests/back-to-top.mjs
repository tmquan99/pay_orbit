import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import path from 'node:path';
import { startServer } from '../scripts/serve.mjs';

const require = createRequire(import.meta.url);
const { chromium } = require(path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const server = await startServer({ port: 0, directory: process.env.TEST_DIST === '1' ? 'dist' : '.' });
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, ignoreDefaultArgs: ['--disable-back-forward-cache'] });
try {
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce', hasTouch: width === 390 });
    for (const prefix of ['']) {
      for (const route of ['/', '/about/', '/solutions/', '/services/', '/products/', '/contact/']) {
        await page.goto(origin + prefix + route);
        await page.evaluate(() => document.fonts.ready);
        const button = page.locator('[data-back-to-top]');
        assert.equal(await button.count(), 1, `One shared control at ${prefix}${route}`);
        assert.equal(await button.getAttribute('aria-label'), prefix ? "Back to top" : 'Back to top');
        assert.equal(await button.isVisible(), false, 'The control stays hidden at the top');
        await page.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
        await page.waitForFunction(() => document.querySelector('[data-back-to-top]').dataset.visible === 'true');
        const box = await button.boundingBox();
        assert.ok(box.width >= 44 && box.height >= 44 && box.x >= 0 && box.x + box.width <= width, 'Touch target fits the viewport');
        await button.focus();
        await button.press('Enter');
        await page.waitForFunction(() => scrollY === 0 && !document.querySelector('[data-back-to-top]').hasAttribute('data-visible'));
        assert.equal(await page.evaluate(() => document.activeElement.matches('.site-header .wordmark')), true, 'Keyboard focus returns to the header');
        assert.equal(await page.evaluate(() => location.hash), '', 'Returning to the top does not rewrite the URL');
      }
    }
    await page.close();
  }
  for (const [width, suffix] of [[1440, ''], [1440, '?scroll=native'], [390, '']]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, hasTouch: width === 390 });
    await page.goto(origin + '/about/' + suffix + '#about_story');
    if (width === 1440 && !suffix) await page.waitForFunction(() => document.documentElement.classList.contains('lenis'));
    await page.evaluate(() => scrollTo({ top: 1400, behavior: 'instant' }));
    await page.waitForFunction(() => document.querySelector('[data-back-to-top]').dataset.visible === 'true');
    const sampling = page.evaluate(() => new Promise(resolve => {
      const positions = [scrollY];
      const start = performance.now();
      const frame = now => { positions.push(scrollY); if (now - start < 1200) requestAnimationFrame(frame); else resolve(positions); };
      requestAnimationFrame(frame);
    }));
    await page.locator('[data-back-to-top]').click();
    const positions = await sampling;
    assert.ok(new Set(positions.filter(y => y > 2 && y < 1398)).size >= 4, 'Back-to-top traverses intermediate positions smoothly');
    assert.ok(positions.at(-1) < 2, 'Smooth scrolling reaches the actual page top');
    assert.equal(await page.evaluate(() => location.hash), '#about_story', 'Existing anchor history is preserved');
    await page.close();
  }
  const cached = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await cached.goto(origin + '/about/');
  await cached.evaluate(() => addEventListener('pageshow', event => { window.__topRestored = event.persisted; }));
  await cached.evaluate(() => scrollTo({ top: 1600, behavior: 'instant' }));
  await cached.waitForFunction(() => document.querySelector('[data-back-to-top]').dataset.visible === 'true');
  await cached.goto(origin + '/products/');
  await cached.goBack({ waitUntil: 'commit' });
  await cached.waitForFunction(() => window.__topRestored && document.querySelector('[data-back-to-top]').dataset.visible === 'true');
  await cached.locator('[data-back-to-top]').click();
  await cached.waitForFunction(() => scrollY === 0);
  await cached.close();
  const plain = await browser.newPage({ javaScriptEnabled: false });
  await plain.goto(origin);
  assert.equal(await plain.locator('[data-back-to-top]').isVisible(), false, 'No nonfunctional control is shown without JavaScript');
  await plain.close();
  console.log('PASS: Back-to-top on all six routes, desktop/mobile, keyboard focus, reduced motion, Lenis/native smooth motion, anchor history, BFCache and no-JS fallback');
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
