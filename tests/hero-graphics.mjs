import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import path from 'node:path';
import { startServer } from '../scripts/serve.mjs';
import { checkConnectionRegression } from './connection-regression.mjs';

const require = createRequire(import.meta.url);
const { chromium } = require(path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const server = await startServer({ port: 0, directory: process.env.TEST_DIST === '1' ? 'dist' : '.' });
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, ignoreDefaultArgs: ['--disable-back-forward-cache'] });
try {
  for (const width of [1440, 1024, 768, 390, 360, 320]) {
    for (const prefix of ['', '/en']) {
      for (const [route, kind, count] of [['solutions', 'connection', 4], ['products', 'technology', 7]]) {
        const page = await browser.newPage({ viewport: { width, height: 900 } });
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.goto(`${origin}${prefix}/${route}/`);
        await page.evaluate(() => document.fonts.ready);
        const graphic = page.locator('[data-hero-graphic]');
        assert.equal(await graphic.getAttribute('data-hero-graphic'), kind);
        assert.equal(await page.locator('[data-hero-graphic]').count(), 1);
        if (kind === 'connection' && width <= 1023) {
          assert.equal(await graphic.isVisible(), false, 'Existing compact Solutions hero stays hidden on mobile/tablet');
          assert.equal(await graphic.evaluate(el => el.getAnimations({ subtree: true }).length), 0, 'Hidden connection art never runs');
          await page.close();
          continue;
        }
        await graphic.scrollIntoViewIfNeeded();
        await page.waitForFunction(count => document.querySelector('[data-hero-graphic]').getAnimations({ subtree: true }).filter(animation => animation.playState === 'running').length === count, count);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${route} has no horizontal overflow at ${width}px`);
        if (kind === 'technology') {
          assert.equal(await page.locator('[data-connection-signal]').count(), 0);
          assert.equal(await page.locator('.technology-board').count(), 2);
          assert.equal(await page.locator('[data-technology-module]').count(), 7);
          const bounds = await graphic.evaluate(el => {
            const frame = el.getBoundingClientRect();
            const boards = [...el.querySelectorAll('.technology-board')].map(board => board.getBoundingClientRect());
            return { frame: frame.toJSON(), boards: boards.map(box => box.toJSON()), contained: boards.every(box => box.left >= frame.left - 3 && box.right <= frame.right + 3 && box.bottom <= frame.bottom + 3), separate: boards[0].bottom < boards[1].top, readable: [...el.querySelectorAll('.technology-module span')].every(label => label.scrollWidth <= label.clientWidth + 1) };
          });
          assert.ok(bounds.contained, `Technology boards stay within their frame at ${width}px ${prefix}: ${JSON.stringify(bounds)}`);
          assert.ok(bounds.separate, `Technology boards do not obscure one another at ${width}px ${prefix}: ${JSON.stringify(bounds)}`);
          assert.ok(bounds.readable, `Technology labels fit at ${width}px ${prefix}`);
          if (width === 1440 && !prefix) {
            const sequence = await graphic.evaluate(el => {
              const modules = [...el.querySelectorAll('[data-technology-module]')];
              const animations = modules.map(module => module.getAnimations()[0]);
              animations.forEach(animation => animation.pause());
              const selected = [];
              let maximum = 0;
              for (let time = 0; time < 21000; time += 30) {
                animations.forEach(animation => { animation.currentTime = time; });
                const raised = modules.map((module, index) => new DOMMatrix(getComputedStyle(module).transform).m42 < -.1 ? index : -1).filter(index => index >= 0);
                maximum = Math.max(maximum, raised.length);
                if (raised.length === 1 && selected.at(-1) !== raised[0]) selected.push(raised[0]);
                if (modules.some(module => getComputedStyle(module).opacity !== '1')) throw new Error('Technology groups must remain legible throughout the cycle');
              }
              animations.forEach(animation => { animation.currentTime = 0; animation.play(); });
              return { maximum, selected };
            });
            assert.equal(sequence.maximum, 1, 'One catalogue group is emphasized at a time');
            assert.deepEqual(sequence.selected, [0, 1, 2, 3, 4, 5, 6, 0, 1, 2, 3, 4, 5, 6]);
          }
        } else if (width === 1440 && !prefix) {
          await page.waitForFunction(() => document.querySelector('[data-connection-signal]').getAnimations()[0].effect.getComputedTiming().currentIteration >= 1, null, { timeout: 8000 });
          await checkConnectionRegression(page);
        }
        await page.evaluate(() => scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }));
        await page.waitForFunction(() => document.querySelector('[data-hero-graphic]').getAnimations({ subtree: true }).every(animation => animation.playState !== 'running'));
        await graphic.scrollIntoViewIfNeeded();
        await page.waitForFunction(count => document.querySelector('[data-hero-graphic]').getAnimations({ subtree: true }).filter(animation => animation.playState === 'running').length === count, count);
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.waitForFunction(() => document.querySelector('[data-hero-graphic]').getAnimations({ subtree: true }).length === 0);
        await page.emulateMedia({ reducedMotion: 'no-preference' });
        await page.waitForFunction(count => document.querySelector('[data-hero-graphic]').getAnimations({ subtree: true }).length === count, count);
        if (width === 1440 && !prefix) {
          await page.goto(`${origin}/contact/`);
          await page.goBack({ waitUntil: 'commit' });
          await page.locator('[data-hero-graphic]').scrollIntoViewIfNeeded();
          await page.waitForFunction(count => document.querySelector('[data-hero-graphic]').getAnimations({ subtree: true }).filter(animation => animation.playState === 'running').length === count, count);
        }
        assert.deepEqual(errors, []);
        await page.close();
      }
    }
  }
  for (const route of ['solutions', 'products']) {
    const page = await browser.newPage({ javaScriptEnabled: false, viewport: { width: 320, height: 900 } });
    await page.goto(`${origin}/${route}/`);
    assert.equal(await page.locator('[data-hero-graphic]').count(), 1);
    if (route === 'products') assert.equal(await page.locator('[data-technology-module]:visible').count(), 7);
    else assert.ok(await page.locator('[data-connection-signal]').evaluateAll(paths => paths.every(el => getComputedStyle(el).opacity === '0')));
    await page.close();
  }
  console.log('PASS: Distinct hero graphics in VI/EN at six widths; sequential motion, no trailing flashes, readable frames, viewport pause, reduced motion, BFCache and no-JS fallback');
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
