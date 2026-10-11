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
  for (const width of [1440, 768, 390, 320]) {
    for (const prefix of ['/vi', '']) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(`${origin}${prefix}/products/`);
      await page.evaluate(() => document.fonts.ready);
      assert.equal(await page.locator('[data-products]').count(), 1, 'Products enhancement stays scoped to this page');
      assert.equal(await page.locator('.product-card').count(), 7);
      const geometry = () => page.locator('.intro-grid, .product-section, .product-card, .product-card h3, .product-card p, .product-card .button').evaluateAll(els => els.map(el => {
        let x = 0; let y = 0;
        for (let node = el; node; node = node.offsetParent) { x += node.offsetLeft; y += node.offsetTop; }
        return { x, y, width: el.offsetWidth, height: el.offsetHeight };
      }));
      const styled = await geometry();
      await page.evaluate(() => { document.querySelector('link[href="/src/products.css"]').disabled = true; });
      const baseline = await geometry();
      assert.ok(baseline.every((box, index) => Object.keys(box).every(key => Math.abs(box[key] - styled[index][key]) <= 1)), 'Card styling preserves existing layout');
      await page.evaluate(() => { document.querySelector('link[href="/src/products.css"]').disabled = false; });
      assert.equal(await page.locator('[data-connection-signal]').count(), 0, 'Connection motion belongs exclusively to Solutions');
      assert.equal(await page.locator('[data-technology-module]').count(), 7);
      await page.locator('[data-hero-graphic="technology"]').scrollIntoViewIfNeeded();
      await page.waitForFunction(() => document.querySelector('[data-technology-module]').getAnimations().some(a => a.playState === 'running'));
      if (width === 1440 && !prefix) {
        const vendors = page.locator('.vendor-summary');
        const borders = await vendors.evaluateAll(elements => elements.map(el => ({ border: getComputedStyle(el).border, shadow: getComputedStyle(el).boxShadow })));
        assert.deepEqual(borders[0], borders[1], 'Both vendors share the same resting border');
        for (const vendor of await vendors.all()) {
          await vendor.hover();
          await page.waitForTimeout(260);
          assert.ok(await vendor.evaluate(el => getComputedStyle(el).backgroundColor !== getComputedStyle(el.querySelector('.icon-badge')).backgroundColor), 'Icon badge stays distinct from the hovered vendor background');
        }
      }
      const heroBox = await page.locator('[data-hero-graphic="technology"]').boundingBox();
      const expectedHeroHeight = heroBox.width <= 380 ? heroBox.width / .85 : heroBox.width <= 460 ? Math.max(340, heroBox.width / 1.25) : heroBox.width / 1.5;
      assert.ok(Math.abs(heroBox.height - expectedHeroHeight) < 1, 'Technology graphic preserves its responsive frame');
      await page.evaluate(() => scrollTo({ top: document.querySelector('.product-card').getBoundingClientRect().top + scrollY - 40, behavior: 'instant' }));
      await page.waitForFunction(() => document.querySelector('[data-hero-graphic="technology"]').getAnimations({ subtree: true }).every(a => a.playState !== 'running'));
      await page.waitForFunction(() => document.querySelector('.product-card').dataset.productSeen === 'true');
      await page.waitForTimeout(950);
      const first = page.locator('.product-card').first();
      await first.locator('a').focus();
      await page.waitForFunction(() => document.querySelector('.product-card .icon-badge').getAnimations({ subtree: true }).some(a => a.playState === 'running'));
      await page.waitForTimeout(1000);
      assert.equal(await first.locator('.icon-badge').evaluate(el => el.getAnimations({ subtree: true }).length), 0, 'Card icon returns to a clean static state');
      if (width === 1440 && !prefix) {
        const collaboration = page.locator('[data-product-kind="collaboration"]');
        await collaboration.scrollIntoViewIfNeeded();
        await page.waitForTimeout(1100);
        await collaboration.locator('a').focus();
        await page.waitForFunction(() => document.querySelector('[data-product-kind="collaboration"] .icon-badge').getAnimations({ subtree: true }).some(animation => animation.playState === 'running'));
        const cameraMotion = await collaboration.locator('.icon-badge .icon').evaluate(icon => {
          const animations = icon.getAnimations({ subtree: true });
          animations.forEach(animation => { animation.pause(); animation.currentTime = 350; });
          const result = {
            opacity: [...icon.children].map(part => Number(getComputedStyle(part).opacity)),
            transform: getComputedStyle(icon).transform,
            drawing: animations.every(animation => animation.effect.getKeyframes().some(frame => Number(frame.strokeDashoffset) > 0)),
            timings: animations.map(animation => ({ duration: animation.effect.getTiming().duration, delay: animation.effect.getTiming().delay })),
          };
          animations.forEach(animation => animation.play());
          return result;
        });
        assert.ok(cameraMotion.opacity.every(value => value === 1), 'Camera parts stay fully visible throughout the motion');
        assert.equal(cameraMotion.transform, 'none', 'Camera uses the shared line-drawing treatment without zoom');
        assert.ok(cameraMotion.drawing, 'Camera outlines use the same stroke-drawing animation as other line icons');
        assert.ok(cameraMotion.timings.every(timing => timing.duration === 520 && timing.delay === 0), 'Camera outlines draw together at the shared icon tempo');
        await page.waitForTimeout(1000);
        assert.equal(await collaboration.locator('.icon-badge').evaluate(el => el.getAnimations({ subtree: true }).length), 0, 'Camera finishes with no lingering animation');
        assert.equal(await collaboration.locator('.icon-badge .icon').evaluate(el => getComputedStyle(el).transform), 'none', 'Camera returns to its original resting pose without a final jump');
      }
      await page.evaluate(() => scrollTo({ top: document.querySelector('#palo-alto-networks').offsetTop - 80, behavior: 'instant' }));
      await page.waitForFunction(() => document.querySelector('.vendor-summary[aria-current="location"]')?.hash === '#palo-alto-networks');
      assert.equal(await page.locator('.vendor-summary[aria-current="location"]').count(), 1);
      if (width === 1440 && !prefix) {
        await page.waitForTimeout(800);
        const productCards = page.locator('.product-card');
        for (const index of [0, 1]) {
          await productCards.nth(index).hover();
          await page.waitForFunction(index => [...document.querySelectorAll('.product-card')].every((element, cardIndex) => Math.abs(Number(getComputedStyle(element).opacity) - (cardIndex === index ? 1 : .75)) < .01), index);
          const opacity = await productCards.evaluateAll(elements => elements.map(element => Number(getComputedStyle(element).opacity)));
          assert.ok(opacity.every((value, cardIndex) => Math.abs(value - (cardIndex === index ? 1 : .75)) < .01), `Only the hovered product stays at full opacity across both vendors: ${JSON.stringify({ index, opacity })}`);
        }
        await page.mouse.move(0, 0);
        await page.waitForFunction(() => [...document.querySelectorAll('.product-card')].every(element => getComputedStyle(element).opacity === '1'));
        assert.ok(await productCards.evaluateAll(elements => elements.every(element => getComputedStyle(element).opacity === '1')), 'All products restore to full opacity when the pointer leaves the cards');
        await first.locator('a').focus();
        assert.ok(await productCards.evaluateAll(elements => elements.every(element => getComputedStyle(element).opacity === '1')), 'Keyboard focus alone does not leave other cards dimmed');
      }
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `No horizontal overflow at ${width}px`);
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.locator('[data-hero-graphic="technology"]').scrollIntoViewIfNeeded();
      await page.waitForTimeout(60);
      assert.equal(await page.locator('[data-products]').evaluate(el => el.getAnimations({ subtree: true }).filter(a => a.playState === 'running').length), 0, 'Reduced motion cancels all product animations');
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await page.waitForFunction(() => document.querySelector('[data-technology-module]').getAnimations().some(a => a.playState === 'running'));
      const expectedTitle = await first.locator('h3').textContent();
      await first.locator('a').click();
      await page.waitForURL(`${origin}${prefix}/contact/?product=switching#consultation_form`);
      await page.waitForFunction(() => document.querySelector('#requirement').value.length > 0);
      assert.ok((await page.locator('#requirement').inputValue()).includes(expectedTitle), `Quote request carries the selected technology in the same language: ${JSON.stringify({ expectedTitle, value: await page.locator('#requirement').inputValue(), errors })}`);
      if (width === 1440 && !prefix) {
        await page.goBack({ waitUntil: 'commit' });
        await page.locator('[data-hero-graphic="technology"]').scrollIntoViewIfNeeded();
        await page.waitForFunction(() => document.querySelector('[data-hero-graphic="technology"]').getAnimations({ subtree: true }).filter(a => a.playState === 'running').length === 7);
        await first.locator('a').click();
        await page.waitForURL(`${origin}/contact/?product=switching#consultation_form`);
      }
      await page.locator('#requirement').fill('Existing draft');
      await page.evaluate(() => addEventListener('pageshow', event => { window.__productsRestored = event.persisted; }));
      await page.goto(`${origin}${prefix}/products/`);
      await page.goBack({ waitUntil: 'commit' });
      await page.waitForFunction(() => window.__productsRestored === true);
      assert.equal(await page.locator('#requirement').inputValue(), 'Existing draft', 'Returning never overwrites an existing inquiry');
      assert.deepEqual(errors, []);
      await page.close();
    }
  }
  const plain = await browser.newPage({ javaScriptEnabled: false, isMobile: true, hasTouch: true, viewport: { width: 390, height: 844 } });
  await plain.goto(`${origin}/products/`);
  assert.equal(await plain.locator('.product-card:visible').count(), 7);
  await plain.locator('.product-card h3').first().tap();
  assert.ok(await plain.locator('.product-card').evaluateAll(elements => elements.every(element => getComputedStyle(element).opacity === '1')), 'Touch interaction never leaves product cards dimmed');
  assert.equal(await plain.locator('[data-technology-module]:visible').count(), 7, 'No-JS catalogue retains all technology groups');
  await plain.close();
  console.log('PASS: Products layout preserved at four widths in VI/EN, visible hero motion, finite icons, vendor navigation, reduced motion, quote context, draft preservation and no-JS content');
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
