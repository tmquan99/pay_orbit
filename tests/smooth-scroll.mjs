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
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const prefix of ['']) {
    await page.goto(`${origin}${prefix}/about/`);
    await page.waitForFunction(() => document.documentElement.classList.contains('lenis'), null, { timeout: 2500 });
    const sample = page.evaluate(async () => {
      const positions = [scrollY];
      const start = performance.now();
      await new Promise(resolve => {
        const frame = now => { positions.push(scrollY); if (now - start < 1000) requestAnimationFrame(frame); else resolve(); };
        requestAnimationFrame(frame);
      });
      return positions;
    });
    await page.mouse.move(100, 500);
    await page.mouse.wheel(0, 600);
    const positions = await sample;
    assert.ok(new Set(positions.filter(y => y > 5 && y < 590)).size >= 4, 'Wheel scrolling traverses intermediate positions');
    assert.ok(Math.abs(positions.at(-1) - 600) < 2, 'Smoothing preserves wheel distance without overshoot');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForFunction(() => !document.documentElement.classList.contains('lenis'));
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.waitForFunction(() => document.documentElement.classList.contains('lenis'));
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForFunction(() => !document.documentElement.classList.contains('lenis'));
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForFunction(() => document.documentElement.classList.contains('lenis'));
  }
  await page.goto(`${origin}/about/?scroll=native`);
  await page.waitForTimeout(100);
  assert.equal(await page.locator('html.lenis').count(), 0, 'Native comparison URL disables the experiment');
  await page.goto(`${origin}/services/#consulting`);
  await page.waitForFunction(() => document.documentElement.classList.contains('lenis'));
  await page.locator('[data-service-nav] a[href="#consulting"]').click();
  await page.waitForTimeout(500);
  const y = await page.evaluate(() => scrollY);
  await page.mouse.move(100,500);
  await page.mouse.wheel(0,200);
  await page.waitForFunction(y => scrollY > y + 150,y);
  assert.equal(await page.locator('[data-service-track]').evaluate(el => el.scrollWidth <= el.clientWidth), true, 'Services remains a vertical reading flow');
  await page.goto(`${origin}/contact/`);
  await page.locator('textarea').first().evaluate(el => {
    const event = new WheelEvent('wheel', { deltaY: 100, bubbles: true, cancelable: true });
    el.dispatchEvent(event);
    window.__textareaWheelPrevented = event.defaultPrevented;
  });
  assert.equal(await page.evaluate(() => window.__textareaWheelPrevented), false, 'Textarea wheel is not intercepted');
  await page.goto(`${origin}/about/`);
  await page.waitForFunction(() => document.documentElement.classList.contains('lenis'));
  await page.evaluate(() => addEventListener('pageshow', e => { window.__smoothRestored = e.persisted; }));
  await page.locator('.site-header a[href="/contact/"]').click();
  await page.waitForURL(`${origin}/contact/`);
  await page.goBack({ waitUntil: 'commit' });
  await page.waitForFunction(() => window.__smoothRestored && document.documentElement.classList.contains('lenis'));
  assert.deepEqual(errors, []);
  const touch = await browser.newPage({ viewport: { width: 1440, height: 900 }, hasTouch: true });
  await touch.goto(`${origin}/about/`);
  await touch.waitForTimeout(150);
  assert.equal(await touch.locator('html.lenis').count(), 0, 'Coarse pointer retains native touch scrolling even at desktop width');
  await touch.close();
  console.log('PASS: Lenis wheel smoothing, distance, native comparison, mobile/touch, reduced motion, vertical Services, textarea and BFCache');
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
