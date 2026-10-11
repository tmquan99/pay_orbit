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
  for (const prefix of ['/vi', '']) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [];
    page.on('pageerror', e => errors.push(e.stack || e.message));
    await page.goto(`${origin}${prefix}/services/`);
    await page.evaluate(() => document.fonts.ready);
    const track = page.locator('[data-service-track]');
    const current = async id => {
      try {
        await page.waitForFunction(id => document.querySelector('[data-service-nav] [aria-current]')?.hash === `#${id}`, id, { timeout: 5000 });
        await page.waitForFunction(id => {
          const track = document.querySelector('[data-service-track]');
          const rect = document.getElementById(id).getBoundingClientRect();
          return Math.abs(rect.left + rect.width / 2 - track.getBoundingClientRect().left - track.clientWidth / 2) < 3;
        }, id, { timeout: 5000 });
      }
      catch (error) {
        console.log(await page.evaluate(() => ({ hash: location.hash, selected: document.querySelector('[data-service-nav] [aria-current]')?.hash, scroll: document.querySelector('[data-service-track]').scrollLeft, sections: [...document.querySelectorAll('[data-service]')].map(el => ({ id: el.id, x: el.getBoundingClientRect().left, width: el.offsetWidth })) })));
        throw error;
      }
    };
    const clickControl = async (selector, id) => {
      await page.evaluate(() => {
        const controls = document.querySelector('[data-service-controls]');
        scrollTo({ top: scrollY + controls.getBoundingClientRect().top - innerHeight * .75, behavior: 'instant' });
      });
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      const positions = page.evaluate(() => new Promise(resolve => {
        const samples = [scrollY];
        const start = performance.now();
        const sample = now => {
          samples.push(scrollY);
          if (now - start < 700) requestAnimationFrame(sample);
          else resolve(samples);
        };
        requestAnimationFrame(sample);
      }));
      await page.locator(selector).click();
      await current(id);
      const samples = await positions;
      assert.ok(Math.max(...samples) - Math.min(...samples) < 1, 'Carousel buttons preserve vertical scroll throughout the horizontal transition');
    };
    assert.equal(await track.count(), 1, 'Desktop has a horizontal service list');
    assert.ok(await track.evaluate(el => el.scrollWidth > el.clientWidth * 3), 'Five services occupy a horizontal track');
    const progress = page.locator('.service-progress-fill');
    assert.equal(await progress.count(), 1, 'Journey has one continuous position bar');
    const progressAt = expected => page.waitForFunction(expected => {
      const fill = document.querySelector('.service-progress-fill');
      const scale = new DOMMatrixReadOnly(getComputedStyle(fill).transform).a;
      return Math.abs(scale - expected) < .004;
    }, expected);
    await progressAt(0);
    assert.equal(await page.locator('[data-service-prev]').isDisabled(), true);
    await clickControl('[data-service-next]', 'design');
    await progressAt(.25);
    const depth = await page.evaluate(() => ['consulting', 'design', 'supply'].map(id => {
      const grid = document.querySelector(`#${id} .service-detail-grid`);
      const style = getComputedStyle(grid);
      return { id, opacity: Number(style.opacity), height: grid.getBoundingClientRect().height / grid.offsetHeight, shadow: style.boxShadow, transform: style.transform };
    }));
    assert.ok(depth[1].height > .99 && depth[1].opacity === 1, 'Centered service stays full size and clear');
    assert.ok(depth[0].height < .9 && depth[2].height < .9, 'Both neighboring service surfaces recede visibly');
    assert.ok(depth[0].opacity < .65 && depth[2].opacity < .65, 'Neighboring services stay subdued');
    assert.notEqual(depth[1].shadow, 'none', 'Center service has a raised surface');
    const shadowSpacing = await page.evaluate(() => {
      const track = document.querySelector('[data-service-track]');
      const controls = document.querySelector('.service-carousel-controls');
      const cardsBottom = Math.max(...[...track.querySelectorAll('[data-service]')].map(el => el.getBoundingClientRect().bottom));
      return { paintRoom: track.getBoundingClientRect().bottom - cardsBottom, gap: controls.getBoundingClientRect().top - cardsBottom };
    });
    assert.ok(shadowSpacing.paintRoom >= 35.5, 'Track reserves room for the raised card shadow without clipping');
    assert.ok(Math.abs(shadowSpacing.gap - 36) < 1, 'Shadow clearance preserves the compact card-to-controls gap');
    assert.ok(depth[0].transform.startsWith('matrix3d') && depth[2].transform.startsWith('matrix3d'), 'Side surfaces have perspective depth');
    await track.evaluate(el => {
      el.style.scrollSnapType = 'none';
      el.scrollTo({ left: el.scrollLeft + (document.getElementById('design').offsetWidth + 24) / 4, behavior: 'instant' });
    });
    await page.waitForFunction(() => {
      const opacity = Number(getComputedStyle(document.querySelector('#design .service-detail-grid')).opacity);
      return opacity > .65 && opacity < .99;
    });
    await progressAt(.3125);
    await track.evaluate(el => { el.style.scrollSnapType = ''; });
    await page.locator('[data-service-nav] a[href="#design"]').click();
    await current('design');
    assert.equal(await page.locator('#consulting .service-detail-grid').getAttribute('inert'), '');
    assert.equal(await page.locator('#design .service-detail-grid').getAttribute('inert'), null);
    assert.ok(await page.locator('#supply').evaluate(el => el.getBoundingClientRect().left < innerWidth), 'Next service peeks into view');
    const peek = await page.locator('#supply').evaluate(el => ({ x: Math.min(innerWidth - 24, el.getBoundingClientRect().left + 24), y: Math.max(document.querySelector('[data-service-nav]').getBoundingClientRect().bottom + 24, el.getBoundingClientRect().top + 90) }));
    await page.mouse.click(peek.x, peek.y);
    await current('supply');
    await clickControl('[data-service-prev]', 'design');
    await track.focus();
    await page.keyboard.press('End');
    await current('support');
    await progressAt(1);
    await page.waitForFunction(() => document.querySelector('[data-service-next]').disabled);
    await page.keyboard.press('ArrowLeft');
    await current('implementation');
    await page.locator('[data-service-nav] a[href="#supply"]').click();
    await current('supply');
    assert.equal(await page.locator('#supply details').count(), 1, 'The full description belongs to its service card');
    const readingPosition = await track.evaluate(el => el.scrollLeft);
    await page.locator('#supply summary').click();
    assert.notEqual(await page.locator('#supply-description').getAttribute('open'), null);
    assert.equal(await page.locator('#supply-description').evaluate(el => el.closest('[data-service]').id), 'supply', 'Long copy opens inside the current card');
    assert.equal(await page.locator('[data-service-description-host]').count(), 0, 'No separate description panel');
    assert.ok(Math.abs(await track.evaluate(el => el.scrollLeft) - readingPosition) < 3, 'Expanding copy preserves horizontal reading position');
    assert.ok(await track.evaluate(el => el.scrollHeight <= el.clientHeight + 1), 'Expanded cards never create nested vertical scrolling');
    await page.locator('[data-service-nav] a[href="#design"]').click();
    await current('design');
    assert.equal(await page.locator('#supply-description').getAttribute('open'), null, 'Previous description collapses when switching services');
    await page.goBack();
    await current('supply');
    await track.focus();
    const beforeWheel = await track.evaluate(el => ({ x: el.scrollLeft, y: scrollY }));
    await page.mouse.move(700, 450);
    await page.mouse.wheel(0, 200);
    await page.waitForTimeout(150);
    const afterWheel = await track.evaluate(el => ({ x: el.scrollLeft, y: scrollY }));
    assert.ok(Math.abs(afterWheel.x - beforeWheel.x) < 3, 'Vertical wheel is never converted to horizontal movement');
    assert.ok(afterWheel.y > beforeWheel.y, 'Vertical wheel continues down the page');
    await page.locator('[data-service-nav] a[href="#consulting"]').click();
    await current('consulting');
    await page.mouse.move(700, 450);
    const distance = await page.locator('#design').evaluate(el => el.offsetWidth + 24);
    await page.mouse.wheel(distance, 0);
    await current('design');
    try {
      await page.waitForFunction(() => location.hash === '#design' && [...document.querySelectorAll('[data-language]')].every(link => new URL(link.href).hash === '#design'), null, { timeout: 3000 });
    } catch (error) {
      console.log(await page.evaluate(() => ({ hash: location.hash, languages: [...document.querySelectorAll('[data-language]')].map(link => link.href), selected: document.querySelector('[data-service-nav] [aria-current]')?.hash, smooth: document.documentElement.className, x: document.querySelector('[data-service-track]').scrollLeft })));
      throw error;
    }
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForFunction(() => [...document.querySelectorAll('[data-service] .service-detail-grid')].every(el => !el.getAnimations().length));
    await page.locator('[data-service-next]').click();
    await current('supply');
    assert.equal(await page.locator('[data-service] .service-detail-grid').evaluateAll(els => els.some(el => el.getAnimations().length)), false);
    await progressAt(.5);
    assert.equal(await progress.evaluate(el => el.getAnimations().length), 0, 'Reduced motion uses the current service position without animation');
    assert.equal(await page.locator('[data-service] .service-detail-grid').evaluateAll(els => els.every(el => getComputedStyle(el).transform === 'none' && getComputedStyle(el).opacity === '1')), true, 'Reduced motion keeps every surface static and clear');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.locator('#supply summary').click();
    await page.evaluate(() => addEventListener('pageshow', e => { window.__servicesRestored = e.persisted; }));
    await page.locator('#supply .service-actions a').click();
    await page.waitForURL(`${origin}${prefix}/contact/#consultation_form`);
    await page.goBack({ waitUntil: 'commit' });
    await page.waitForFunction(() => window.__servicesRestored === true);
    await current('supply');
    await progressAt(.5);
    assert.notEqual(await page.locator('#supply-description').getAttribute('open'), null, 'Browser Back preserves the expanded description inside the card');
    for (const width of [1024, 768, 390, 320, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.waitForFunction(() => document.querySelector('[data-service-experience]').hasAttribute('data-horizontal') === matchMedia('(min-width: 1024px)').matches, null, { timeout: 5000 });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `No page overflow at ${width}px`);
      const readability = await page.evaluate(() => ({
        clipped: [...document.querySelectorAll('h1,h2,h3,p,a,button,summary')].filter(el => el.getClientRects().length && el.clientWidth > 0 && el.scrollWidth > el.clientWidth + 1).map(el => ({ text: el.textContent.trim(), id: el.closest('[id]')?.id, width: el.clientWidth, scrollWidth: el.scrollWidth })),
        targets: [...document.querySelectorAll('a,button,summary')].filter(el => el.getClientRects().length && (el.getBoundingClientRect().width < 43.5 || el.getBoundingClientRect().height < 43.5)).map(el => el.textContent.trim()),
      }));
      assert.deepEqual(readability.clipped, [], `All service text fits at ${width}px`);
      assert.deepEqual(readability.targets, [], `44px targets remain after panel zoom at ${width}px`);
      if (width < 1024) {
        assert.equal(await progress.isVisible(), false, 'Mobile keeps the compact service links');
        assert.equal(await page.locator('[data-service-next]').isVisible(), false);
        assert.equal(await page.locator('[data-service] details').count(), 5, 'Mobile restores native descriptions inside services');
        assert.equal(await page.locator('[data-service] [inert]').count(), 0, 'All mobile services are available');
        assert.ok(await page.locator('#design').evaluate(el => el.getBoundingClientRect().top > document.querySelector('#consulting').getBoundingClientRect().bottom - 2));
      } else assert.equal(await page.locator('[data-service] details').count(), 5, 'All descriptions remain inside desktop cards');
    }
    assert.deepEqual(errors, []);
    await page.close();
  }
  console.log('PASS: Horizontal services, centered panels/peek, controls, keyboard, native wheel, inline descriptions, history/BFCache, resize, mobile and reduced motion');
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
