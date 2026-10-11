import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import path from 'node:path';
import { startServer } from '../scripts/serve.mjs';

const require = createRequire(import.meta.url);
const { chromium } = require(path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const server = await startServer({ port: 0, directory: process.env.TEST_DIST === '1' ? 'dist' : '.' });
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, ignoreDefaultArgs: ['--disable-back-forward-cache'] });
const toggleWithoutScroll = summary => summary.evaluate(async el => {
  // Scroll timelines update after layout, so settle the preceding instant
  // scroll before measuring whether the disclosure itself changes zoom.
  await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  const grid = el.closest('[data-solution]').querySelector('.solution-detail-grid');
  const scales = [new DOMMatrixReadOnly(getComputedStyle(grid).transform).a];
  const positions = [scrollY];
  el.click();
  const start = performance.now();
  await new Promise(resolve => {
    const sample = now => {
      scales.push(new DOMMatrixReadOnly(getComputedStyle(grid).transform).a);
      positions.push(scrollY);
      if (now - start < 440) requestAnimationFrame(sample);
      else resolve();
    };
    requestAnimationFrame(sample);
  });
  return { scales, positions };
});
try {
  for (const width of [1440, 1024, 768, 390, 360, 320]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.stack || error.message));
    for (const prefix of ['/vi', '']) {
      await page.goto(`${origin}${prefix}/solutions/`);
      await page.evaluate(() => document.fonts.ready);
      // A disclosure may stay open/focused after the reader moves on.
      // Neither state should override the active section's opacity.
      const previous = page.locator('#enterprise-networking');
      await page.evaluate(() => scrollTo({ top: document.querySelector('#data-center-networking').offsetTop - 250, behavior: 'instant' }));
      await previous.locator('summary').evaluate(el => el.focus({ preventScroll: true }));
      for (const state of ['Opening', 'Closing', 'Reopening']) {
        const zoom = await toggleWithoutScroll(previous.locator('summary'));
        assert.ok(Math.max(...zoom.positions) - Math.min(...zoom.positions) < 1, `${state} keeps the scroll position stable: ${JSON.stringify(zoom)}`);
        assert.ok(Math.max(...zoom.scales) - Math.min(...zoom.scales) < .002, `${state} alone does not zoom an inactive solution at ${width}px ${prefix}: ${JSON.stringify(zoom)}`);
      }
      await page.evaluate(() => scrollTo({ top: document.querySelector('#data-center-networking').offsetTop - 250, behavior: 'instant' }));
      await page.waitForFunction(() => document.querySelector('#data-center-networking').hasAttribute('data-solution-active'));
      await page.waitForTimeout(320);
      const previousOpacity = () => previous.locator('.solution-detail-grid').evaluate(el => Number(getComputedStyle(el).opacity));
      const previousZoom = () => previous.locator('.solution-detail-grid').evaluate(el => ({ animation: getComputedStyle(el).animationName, scale: new DOMMatrixReadOnly(getComputedStyle(el).transform).a }));
      assert.notEqual(await previous.locator('details').getAttribute('open'), null, 'The previous description remains open while reading the next solution');
      assert.ok(await previous.evaluate(el => el.contains(document.activeElement)), 'The previous summary retains focus after scrolling');
      assert.ok(Math.abs((await previousOpacity()) - (width >= 1024 ? .6 : .75)) < .01, `An open, focused inactive solution still recedes at ${width}px ${prefix}: ${JSON.stringify(await page.locator('[data-solution]').evaluateAll(els => els.map(el => ({ id: el.id, active: el.hasAttribute('data-solution-active'), top: el.getBoundingClientRect().top, height: el.offsetHeight, opacity: getComputedStyle(el.querySelector('.solution-detail-grid')).opacity }))))}`);
      assert.equal((await previousZoom()).animation, 'solution-scroll-focus', 'Opening/focusing an inactive solution must not override its scroll zoom');
      assert.ok((await previousZoom()).scale < (width >= 1024 ? 1.02 : 1.009), 'An open inactive solution does not jump to foreground scale');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(460);
      assert.equal(await previous.locator('details').getAttribute('open'), null);
      assert.ok(Math.abs((await previousOpacity()) - (width >= 1024 ? .6 : .75)) < .01, 'Closing while retaining focus does not lock opacity at 100%');
      assert.equal((await previousZoom()).animation, 'solution-scroll-focus', 'Closing while focused preserves the scroll timeline');
      const grid = page.locator('#data-center-networking .solution-detail-grid');
      const read = () => grid.evaluate(el => ({
        scale: new DOMMatrixReadOnly(getComputedStyle(el).transform).a,
        opacity: Number(getComputedStyle(el).opacity),
        highlight: Number(getComputedStyle(el.closest('[data-solution]'), '::before').opacity),
        titleColor: getComputedStyle(el.querySelector('h2')).color,
        marker: Number(getComputedStyle(el.querySelector('h2'), '::before').opacity),
      }));
      const sample = async top => {
        await page.evaluate(top => {
          document.activeElement?.blur();
          scrollTo({ top: document.querySelector('#data-center-networking').offsetTop - top, behavior: 'instant' });
        }, top);
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
        await page.waitForTimeout(320);
        return read();
      };
      const samples = [];
      for (const top of [850, 650, 450, 250, width >= 1024 ? 100 : 24]) samples.push(await sample(top));
      assert.ok(samples[0].scale < samples.at(-1).scale - .015, `Solution grows into reading region at ${width}px: ${JSON.stringify(samples)}`);
      assert.ok(samples[0].scale < (width >= 1024 ? .91 : .97), 'Surrounding solutions recede visibly');
      assert.ok(samples.at(-1).scale >= (width >= 1024 ? 1.02 : 1.009), 'Reading solution gains a clear foreground zoom');
      assert.ok(samples[0].opacity < samples.at(-1).opacity, 'Reading copy grows clearer as the solution approaches');
      assert.ok(Math.abs(samples[0].opacity - (width >= 1024 ? .6 : .75)) < .01, `Peripheral solutions use a gentler fade, including actions at ${width}px ${prefix}: ${JSON.stringify(samples)}`);
      assert.ok(samples.at(-1).highlight > .95 && samples[0].highlight < .1, 'The reading region gains a blue background');
      assert.equal(await page.locator('[data-solution-active]').count(), 1, 'Only one solution receives the active background');
      assert.notEqual(samples[0].titleColor, samples.at(-1).titleColor, 'Title gains brand color near the reading region');
      assert.ok(samples.at(-1).marker > samples[0].marker + .5, 'Title accent strengthens with reading focus');
      assert.ok(new Set(samples.map(s => s.scale.toFixed(4))).size >= 4, 'Zoom includes intermediate scroll values');
      assert.ok(samples.every(s => s.scale <= 1.03 && s.opacity >= .6), 'Peripheral solutions remain visible without excessive oversizing');
      await page.waitForTimeout(200);
      assert.ok(Math.abs((await read()).scale - samples.at(-1).scale) < .001, 'Stationary scroll does not animate on a timer');
      assert.ok(Math.abs((await sample(650)).scale - samples[1].scale) < .001, 'Reverse scroll retraces the same scale');
      await sample(width >= 1024 ? 100 : 24);
      const copyContrast = await grid.evaluate(el => {
        const rgb = value => value.match(/[\d.]+/g).slice(0, 3).map(Number);
        const blend = (front, back, opacity) => front.map((channel, i) => channel * opacity + back[i] * (1 - opacity));
        const luminance = color => color.map(channel => channel / 255).map(channel => channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4).reduce((sum, value, i) => sum + value * [.2126, .7152, .0722][i], 0);
        const section = el.closest('[data-solution]');
        const base = rgb(getComputedStyle(section).backgroundColor);
        const overlay = getComputedStyle(section, '::before');
        const surface = blend(rgb(overlay.backgroundColor), base, Number(overlay.opacity));
        return [...el.querySelectorAll('.solution-audience, .solution-family, .solution-lead, .solution-scope h3, .solution-scope li, .solution-benefits h3, .solution-benefits li span')].map(node => {
          let opacity = 1;
          for (let parent = node; parent !== section; parent = parent.parentElement) opacity *= Number(getComputedStyle(parent).opacity);
          const style = getComputedStyle(node);
          const background = style.backgroundColor === 'rgba(0, 0, 0, 0)' ? surface : blend(rgb(style.backgroundColor), surface, opacity);
          const text = blend(rgb(style.color), surface, opacity);
          const values = [luminance(text), luminance(background)].sort((a, b) => b - a);
          return { text: node.textContent.trim(), ratio: (values[0] + .05) / (values[1] + .05) };
        });
      });
      assert.ok(copyContrast.every(item => item.ratio >= 4.5), `Active text retains AA contrast: ${JSON.stringify(copyContrast)}`);
      await sample(250);
      const depth = await page.locator('.solution-detail-grid').evaluateAll(els => els.map(el => new DOMMatrixReadOnly(getComputedStyle(el).transform).a));
      assert.ok(depth[1] > depth[0] && depth[1] > depth[2], 'The current solution stands ahead of its neighbors');
      const surfaces = await page.locator('[data-solution]').evaluateAll(els => els.map(el => ({ active: el.hasAttribute('data-solution-active'), background: Number(getComputedStyle(el, '::before').opacity) })));
      assert.ok(surfaces.every(item => item.background === (item.active ? 1 : 0)), `Active and inactive backgrounds differ: ${JSON.stringify(surfaces)}`);
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
      const buttonContrast = await page.locator('[data-solution-active] .solution-actions .button').evaluate(el => {
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
      assert.ok(buttonContrast >= 4.5, `Active CTA retains text contrast: ${buttonContrast}`);
      const beforeFocus = await read();
      await page.locator('#data-center-networking summary').evaluate(el => el.focus({ preventScroll: true }));
      assert.ok(Math.abs((await read()).scale - beforeFocus.scale) < .001, 'Keyboard focus does not trigger a separate zoom');
      assert.equal((await read()).opacity, 1, 'The active solution remains fully readable during keyboard interaction');
      await page.keyboard.press('Enter');
      await sample(-150);
      assert.equal(await grid.evaluate(el => getComputedStyle(el).animationName), 'solution-scroll-focus', 'Expanded technical copy continues to follow scroll zoom');
      await page.emulateMedia({ reducedMotion: 'reduce' });
      assert.equal(await grid.evaluate(el => getComputedStyle(el).transform), 'none');
      assert.equal(await page.locator('#cybersecurity .solution-heading').evaluate(el => getComputedStyle(el).opacity), '1');
      assert.equal(await grid.evaluate(el => getComputedStyle(el.closest('[data-solution]'), '::before').animationName), 'none');
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
