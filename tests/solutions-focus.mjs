import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import path from 'node:path';
import { startServer } from '../scripts/serve.mjs';

const require = createRequire(import.meta.url);
const { chromium } = require(path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const server = await startServer({ port: 0, directory: process.env.TEST_DIST === '1' ? 'dist' : '.' });
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, ignoreDefaultArgs: ['--disable-back-forward-cache'] });
try {
  for (const width of [1440, 1024, 768, 390, 360, 320]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.stack || error.message));
    for (const prefix of ['', '/en']) {
      await page.goto(`${origin}${prefix}/solutions/`);
      await page.evaluate(() => document.fonts.ready);
      const grid = page.locator('#data-center-networking .solution-detail-grid');
      const read = () => grid.evaluate(el => ({ scale: new DOMMatrixReadOnly(getComputedStyle(el).transform).a, opacity: Number(getComputedStyle(el.querySelector('.solution-heading')).opacity) }));
      const sample = async top => {
        await page.evaluate(top => {
          document.activeElement?.blur();
          scrollTo({ top: document.querySelector('#data-center-networking').offsetTop - top, behavior: 'instant' });
        }, top);
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
        return read();
      };
      const samples = [];
      for (const top of [850, 650, 450, 250, width >= 1024 ? 100 : 24]) samples.push(await sample(top));
      assert.ok(samples[0].scale < samples.at(-1).scale - .015, `Solution grows into reading region at ${width}px: ${JSON.stringify(samples)}`);
      assert.ok(samples[0].scale < (width >= 1024 ? .91 : .97), 'Surrounding solutions recede visibly');
      assert.ok(samples.at(-1).scale >= (width >= 1024 ? 1.02 : 1.009), 'Reading solution gains a clear foreground zoom');
      assert.ok(samples[0].opacity < samples.at(-1).opacity, 'Reading copy grows clearer as the solution approaches');
      assert.ok(new Set(samples.map(s => s.scale.toFixed(4))).size >= 4, 'Zoom includes intermediate scroll values');
      assert.ok(samples.every(s => s.scale <= 1.03 && s.opacity >= .8), 'Text remains visible without excessive oversizing');
      await page.waitForTimeout(200);
      assert.ok(Math.abs((await read()).scale - samples.at(-1).scale) < .001, 'Stationary scroll does not animate on a timer');
      assert.ok(Math.abs((await sample(650)).scale - samples[1].scale) < .001, 'Reverse scroll retraces the same scale');
      await sample(250);
      const depth = await page.locator('.solution-detail-grid').evaluateAll(els => els.map(el => new DOMMatrixReadOnly(getComputedStyle(el).transform).a));
      assert.ok(depth[1] > depth[0] && depth[1] > depth[2], 'The current solution stands ahead of its neighbors');
      if (width >= 1024) {
        await page.waitForFunction(() => document.querySelector('[data-solution-nav] [aria-current]')?.hash === '#data-center-networking');
        assert.equal(await page.locator('[data-solution-nav] [aria-current]').count(), 1);
      }
      const layout = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > innerWidth,
        clipped: [...document.querySelectorAll('h1,h2,h3,p,a,summary')].filter(el => el.getClientRects().length && el.clientWidth > 0 && el.scrollWidth > el.clientWidth + 1).map(el => el.textContent.trim()),
        targets: [...document.querySelectorAll('a,button,summary')].filter(el => el.getClientRects().length && (el.getBoundingClientRect().width < 43.5 || el.getBoundingClientRect().height < 43.5)).map(el => el.textContent.trim()),
      }));
      assert.equal(layout.overflow, false);
      assert.deepEqual(layout.clipped, [], `Unclipped text at ${width}px`);
      assert.deepEqual(layout.targets, [], `44px visual targets after scaling at ${width}px`);
      const buttonContrast = await page.locator('#enterprise-networking .solution-actions .button').evaluate(el => {
        const rgb = value => value.match(/[\d.]+/g).slice(0, 3).map(Number);
        const style = getComputedStyle(el);
        let opacity = 1;
        for (let node = el; node; node = node.parentElement) opacity *= Number(getComputedStyle(node).opacity);
        const canvas = rgb(getComputedStyle(el.closest('[data-solution]')).backgroundColor);
        const blend = color => color.map((channel, i) => channel * opacity + canvas[i] * (1 - opacity));
        const luminance = color => color.map(channel => channel / 255).map(channel => channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4).reduce((sum, value, i) => sum + value * [.2126, .7152, .0722][i], 0);
        const values = [luminance(blend(rgb(style.color))), luminance(blend(rgb(style.backgroundColor)))].sort((a, b) => b - a);
        return (values[0] + .05) / (values[1] + .05);
      });
      assert.ok(buttonContrast >= 4.5, `Receding CTA retains text contrast: ${buttonContrast}`);
      await page.locator('#data-center-networking summary').focus();
      assert.equal((await read()).scale, width >= 1024 ? 1.025 : 1.01, 'Keyboard focus keeps foreground reading size');
      await page.keyboard.press('Enter');
      await sample(-150);
      assert.equal((await read()).scale, width >= 1024 ? 1.025 : 1.01, 'Expanded technical copy remains at foreground reading size');
      await page.emulateMedia({ reducedMotion: 'reduce' });
      assert.equal(await grid.evaluate(el => getComputedStyle(el).transform), 'none');
      assert.equal(await page.locator('#cybersecurity .solution-heading').evaluate(el => getComputedStyle(el).opacity), '1');
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      if (width === 1440) {
        await page.evaluate(() => addEventListener('pageshow', event => { window.__solutionRestored = event.persisted; }));
        await page.locator('#data-center-networking .solution-actions .button').click();
        await page.waitForURL(`${origin}${prefix}/contact/#consultation_form`);
        await page.goBack({ waitUntil: 'commit' });
        await page.waitForFunction(() => window.__solutionRestored === true);
        await page.locator('[data-solution-nav] a[href="#cloud-security"]').click();
        await page.waitForFunction(() => document.querySelector('[data-solution-nav] [aria-current]')?.hash === '#cloud-security');
        await page.setViewportSize({ width, height: 1 });
        await page.waitForTimeout(80);
        await page.setViewportSize({ width, height: 900 });
      }
    }
    assert.deepEqual(errors, [], 'Scroll, resize and restored pages remain error free');
    await page.close();
  }
  console.log('PASS: Solution focus at six widths in VI/EN, continuous/reverse scroll, visual depth, keyboard, expanded copy, reduced motion, BFCache, resize and touch targets');
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
