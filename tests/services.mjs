import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import path from 'node:path';
import { startServer } from '../scripts/serve.mjs';

const require = createRequire(import.meta.url);
const { chromium } = require(path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const server = await startServer({ port: 0, directory: process.env.TEST_DIST === '1' ? 'dist' : '.' });
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, ignoreDefaultArgs: ['--disable-back-forward-cache'] });
const ids = ['consulting', 'design', 'supply', 'implementation', 'support'];
async function checkDescriptionMotion(page) {
  const measure = () => page.locator('#consulting details').evaluate(async details => {
    const card = details.closest('[data-service]');
    const heights = [card.getBoundingClientRect().height];
    const unanimatedSpace = [];
    details.querySelector('summary').click();
    const start = performance.now();
    await new Promise(resolve => {
      const sample = now => {
        heights.push(card.getBoundingClientRect().height);
        const contentHeight = parseFloat(getComputedStyle(details, '::details-content').blockSize) || 0;
        unanimatedSpace.push(details.getBoundingClientRect().height - details.querySelector('summary').getBoundingClientRect().height - contentHeight);
        if (now - start < 460) requestAnimationFrame(sample);
        else resolve();
      };
      requestAnimationFrame(sample);
    });
    return { heights, unanimatedSpace };
  });
  for (const state of ['opening', 'closing']) {
    const { heights, unanimatedSpace } = await measure();
    const low = Math.min(heights[0], heights.at(-1));
    const high = Math.max(heights[0], heights.at(-1));
    assert.ok(high - low > 50, `${state}: full description changes card height`);
    assert.ok(heights.filter(height => height > low + 2 && height < high - 2).length >= 3, `${state}: card height changes gradually across frames`);
    assert.ok(unanimatedSpace.every(space => Math.abs(space) < 1), `${state}: spacing follows the animated content without a final jump (${Math.max(...unanimatedSpace)}px outside the animation)`);
  }
}
try {
  for (const language of ['en']) {
    const prefix = '';
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${origin}${prefix}/services/`);
    const nav = page.locator('[data-service-nav]');
    const centeredAt = id => page.waitForFunction(id => {
      const track = document.querySelector('[data-service-track]');
      const rect = document.getElementById(id).getBoundingClientRect();
      return Math.abs(rect.left + rect.width / 2 - track.getBoundingClientRect().left - track.clientWidth / 2) < 2;
    }, id, { timeout: 5000 });
    assert.equal(await nav.count(), 1, 'Service journey must provide navigation between five stages');
    assert.equal(await page.locator('.page-intro a[href="' + prefix + '/contact/#consultation_form"]').count(), 1, 'Consultation action belongs in the hero');
    assert.ok(await page.locator('.page-intro .button').evaluate(el => el.getBoundingClientRect().bottom < innerHeight), 'Hero action visible without scrolling');
    assert.equal(await page.locator('[data-service] [data-reveal]').count(), 0, 'Horizontal panel depth replaces one-off entrances');
    await nav.locator('a[href="#consulting"]').click();
    await centeredAt('consulting');
    await checkDescriptionMotion(page);
    for (const id of ids) {
      await nav.locator(`a[href="#${id}"]`).click();
      await centeredAt(id);
      await page.waitForFunction(id => document.querySelector('[data-service-nav] [aria-current="location"]')?.hash === `#${id}`, id);
      const section = page.locator(`#${id}`);
      assert.equal(await nav.locator('[aria-current="location"]').count(), 1);
      await page.waitForFunction(id => document.getElementById(id).getBoundingClientRect().top >= document.querySelector('[data-service-nav]').getBoundingClientRect().bottom - 2, id);
      assert.ok(await section.evaluate(el => el.getBoundingClientRect().top >= document.querySelector('[data-service-nav]').getBoundingClientRect().bottom - 2), 'Heading clears sticky journey');
      assert.equal(await section.locator(`.service-actions a[href="${prefix}/contact/#consultation_form"]`).count(), 1, 'Localized action for each service');
      assert.ok(await section.locator('.service-scope li').count() <= 4, 'Scope is grouped for scanning');
      assert.ok(await section.locator('.service-outcome').innerText());
      const details = page.locator(`#${id}-description`);
      assert.equal(await section.locator('details').count(), 1, 'Full description stays inside its service card');
      const collapsedHeight = await section.evaluate(el => el.getBoundingClientRect().height);
      await details.locator('summary').focus();
      await page.keyboard.press('Enter');
      assert.notEqual(await details.getAttribute('open'), null, 'Original description accessible by keyboard');
      await page.waitForFunction(({ id, collapsedHeight }) => document.getElementById(id).getBoundingClientRect().height > collapsedHeight + 10, { id, collapsedHeight });
      await page.keyboard.press('Enter');
      await page.waitForFunction(id => document.activeElement === document.querySelector(`#${id} summary`), id, { timeout: 2000 });
    }
    await nav.locator('a[href="#design"]').click();
    await centeredAt('design');
    await page.waitForFunction(() => document.querySelector('[data-service-nav] [aria-current="location"]')?.hash === '#design');
    assert.equal(await nav.locator('[data-before]').count(), 1, 'Earlier service markers reverse with the reading position');
    await page.evaluate(() => addEventListener('pageshow', event => { window.__serviceBFCacheRestored = event.persisted; }));
    await page.locator('#design .service-actions a').click();
    await page.waitForURL(`${origin}${prefix}/contact/#consultation_form`);
    await page.goBack({ waitUntil: 'commit' });
    await page.waitForFunction(() => window.__serviceBFCacheRestored === true);
    await nav.locator('a[href="#supply"]').click();
    await page.waitForFunction(() => document.querySelector('[data-service-nav] [aria-current="location"]')?.hash === '#supply');
    // Browsers can briefly report a tiny viewport during window transitions.
    await page.setViewportSize({ width: 1440, height: 1 });
    await page.waitForTimeout(80);
    assert.deepEqual(errors, [], 'Reading observer handles a one-pixel viewport');
    await page.setViewportSize({ width: 1440, height: 900 });
    // Resize must rebuild the reading line and retain working navigation.
    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(`${origin}${prefix}/services/`);
      await page.evaluate(() => document.fonts.ready);
      const layout = await page.evaluate(() => ({
        first: document.querySelector('[data-service]').getBoundingClientRect().top + scrollY,
        overflow: document.documentElement.scrollWidth > innerWidth,
        illustration: getComputedStyle(document.querySelector('.services-page .infographic-art')).display,
        navPosition: getComputedStyle(document.querySelector('[data-service-nav]')).position,
        clipped: [...document.querySelectorAll('h1,h2,h3,p,a,summary')].filter(el => el.getClientRects().length && el.clientWidth > 0 && el.scrollWidth > el.clientWidth + 1).map(el => el.textContent.trim()),
      }));
      assert.ok(layout.first < 760, `Mobile service starts early: ${layout.first}px at ${width}px`);
      assert.equal(layout.overflow, false);
      assert.equal(layout.illustration, 'none');
      assert.notEqual(layout.navPosition, 'sticky', 'Mobile navigation must not occupy the reading viewport');
      assert.deepEqual(layout.clipped, []);
      await page.locator('#consulting summary').scrollIntoViewIfNeeded();
      await checkDescriptionMotion(page);
      await nav.locator('a[href="#support"]').click();
      await page.waitForFunction(() => document.querySelector('[data-service-nav] [aria-current="location"]')?.hash === '#support');
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.waitForFunction(() => document.getAnimations().every(a => a.playState !== 'running' && a.playState !== 'paused'));
      await page.reload();
      assert.equal(await page.evaluate(() => document.getAnimations().length), 0, 'Reduced motion has no prepared or running animations');
      await page.locator('#consulting summary').click();
      assert.equal(await page.locator('#consulting details').evaluate(el => getComputedStyle(el, '::details-content').transitionDuration), '0s', 'Reduced motion opens descriptions immediately');
      await page.emulateMedia({ reducedMotion: 'no-preference' });
    }
    assert.deepEqual(errors, []);
    await page.close();
    for (const width of [1440, 390]) {
      const plain = await browser.newPage({ javaScriptEnabled: false, viewport: { width, height: 844 } });
      await plain.goto(`${origin}${prefix}/services/#support`);
      assert.equal(await plain.locator('[data-service]').count(), 5);
      await plain.locator('#support summary').click();
      assert.notEqual(await plain.locator('#support details').getAttribute('open'), null);
      assert.equal(await plain.locator('#support .service-body').evaluate(el => getComputedStyle(el).opacity), '1');
      await plain.close();
    }
  }
  console.log('PASS: Services journey/BFCache, keyboard details, localized CTAs, compact mobile, reduced motion and no-JS content');
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
