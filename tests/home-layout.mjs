import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import path from 'node:path';
import { startServer } from '../scripts/serve.mjs';

const require = createRequire(import.meta.url);
const { chromium } = require(path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const server = await startServer({ port: 0, directory: process.env.TEST_DIST === '1' ? 'dist' : '.' });
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
try {
  for (const language of ['en']) {
    const prefix = '';
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${origin}${prefix}/`, { waitUntil: 'networkidle' });
    assert.equal(await page.locator('#customer_needs a').count(), 3, 'Home A offers three real customer-needs destinations');
    assert.deepEqual(await page.locator('main > section').evaluateAll(elements => elements.map(element => element.id)), ['hero', 'customer_needs', 'core_solutions', 'why_pay_orbit', 'technology_focus', 'company_intro', 'home_contact']);
    assert.equal(await page.locator('#hero .actions a').count(), 1, 'Hero has one primary action');
    assert.ok(await page.locator('#hero').evaluate(el => el.querySelector('.home-panorama').getBoundingClientRect().top >= el.querySelector('.actions').getBoundingClientRect().bottom), 'Panorama must not cover the hero action');
    assert.equal(await page.locator('#hero .hero-media').count(), 0, 'Home A replaces the old rack-photo split hero');
    assert.equal(await page.locator('#hero').evaluate(el => getComputedStyle(el).backgroundColor), 'rgb(252, 253, 255)');
    assert.equal(await page.locator('.site-header').evaluate(el => getComputedStyle(el).backgroundColor), 'rgb(2, 6, 15)');
    const vendors = page.locator('.home-vendors a');
    assert.equal(await vendors.count(), 2);
    for (const [index, name, anchor] of [[0, 'Cisco', 'cisco'], [1, 'Palo Alto Networks', 'palo-alto-networks']]) {
      const vendor = vendors.nth(index);
      assert.equal(await vendor.locator('img').getAttribute('alt'), name, 'Vendor logo preserves an accessible brand name');
      assert.equal(await vendor.getAttribute('href'), `/products/#${anchor}`, 'Vendor destination remains unchanged');
    }
    const arrows = page.locator('main a > svg[data-icon^="arrow-"]');
    assert.deepEqual([...new Set(await arrows.evaluateAll(elements => elements.map(el => el.dataset.icon)))], ['arrow-up-right'], 'All Home action arrows point diagonally like the detail pages');
    const mismatchedArrowColors = await page.locator('main .home-text-link, main .button').evaluateAll(links => links.filter(link => {
      const arrow = link.querySelector('.home-action-arrow');
      return getComputedStyle(arrow).stroke !== getComputedStyle(link.querySelector('span')).color;
    }).map(link => link.textContent.trim()));
    assert.deepEqual(mismatchedArrowColors, [], 'Home text links and buttons use the same ink for their arrow and label');
    for (const arrow of await arrows.all()) {
      await arrow.locator('..').hover();
      await page.waitForFunction(el => {
        const matrix = new DOMMatrixReadOnly(getComputedStyle(el).transform);
        return matrix.e > 1.9 && matrix.f < -1.9;
      }, await arrow.elementHandle());
      assert.ok(await arrow.evaluate(el => parseFloat(getComputedStyle(el).transitionDuration) > 0), 'Home arrows animate on hover');
    }
    await page.emulateMedia({ reducedMotion: 'reduce' });
    for (const arrow of await arrows.all()) {
      await arrow.locator('..').hover();
      assert.equal(await arrow.evaluate(el => getComputedStyle(el).transform), 'none', 'Reduced motion keeps hovered arrows still');
      assert.equal(await arrow.evaluate(el => getComputedStyle(el).transitionDuration), '0s');
    }
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.keyboard.press('Tab');
    await page.locator('.home-contact-button').focus();
    assert.equal(await page.locator('.home-contact-button').evaluate(el => getComputedStyle(el).outlineColor), 'rgb(255, 255, 255)', 'Contact focus ring contrasts with the blue section');
    for (const [index, anchor] of ['enterprise-networking', 'data-center-networking', 'cybersecurity'].entries()) {
      assert.equal(await page.locator('#customer_needs a').nth(index).getAttribute('href'), `${prefix}/solutions/#${anchor}`);
    }
    const nodes = page.locator('#core_solutions .solution-card');
    assert.equal(await nodes.count(), 4);
    for (const [index, anchor] of ['enterprise-networking', 'data-center-networking', 'cybersecurity', 'cloud-security'].entries()) {
      assert.equal(await nodes.nth(index).locator('a').getAttribute('href'), `${prefix}/solutions/#${anchor}`);
    }
    const steps = page.locator('.home-service-steps a');
    assert.equal(await steps.count(), 5);
    for (const [index, anchor] of ['consulting', 'design', 'supply', 'implementation', 'support'].entries()) {
      assert.equal(await steps.nth(index).getAttribute('href'), anchor === 'supply' ? `${prefix}/products/` : `${prefix}/services/#${anchor}`);
    }
    await page.locator('#customer_needs a').first().focus();
    await page.keyboard.press('Enter');
    await page.waitForURL(`${origin}${prefix}/solutions/#enterprise-networking`);
    await page.goBack({ waitUntil: 'networkidle' });
    assert.equal(new URL(page.url()).pathname, `${prefix}/`);
    for (const width of [1440, 1024, 768, 390, 360, 320]) {
      await page.setViewportSize({ width, height: 900 });
      await page.evaluate(() => document.fonts.ready);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Home A fits ${language} ${width}px`);
      const clipped = await page.locator('h1,h2,h3,.need-copy,.home-needs-list a').evaluateAll(elements => elements.filter(el => el.scrollWidth > el.clientWidth + 1).map(el => el.textContent));
      assert.deepEqual(clipped, [], `Home copy wraps at ${language} ${width}px`);
      for (const img of await page.locator('main img:visible').all()) {
        await img.scrollIntoViewIfNeeded();
        await img.evaluate(el => el.decode());
        assert.ok(await img.evaluate(el => el.naturalWidth > 0));
      }
      for (const vendor of await vendors.all()) {
        const layout = await vendor.evaluate(link => {
          const img = link.querySelector('img');
          const logo = img.getBoundingClientRect();
          const copy = link.querySelector('.vendor-capabilities').getBoundingClientRect();
          const row = link.getBoundingClientRect();
          return {
            aspectError: Math.abs(logo.width / logo.height - img.naturalWidth / img.naturalHeight),
            withinRow: logo.left >= row.left && logo.right <= row.right && logo.top >= row.top && logo.bottom <= row.bottom,
            separated: innerWidth <= 767 ? copy.top >= logo.bottom : copy.left >= logo.right,
          };
        });
        assert.ok(layout.aspectError < .02 && layout.withinRow && layout.separated, `Vendor logos keep their proportions and stay clear of copy at ${width}px`);
      }
      // Captions intentionally overlay the panorama's empty floor, while the
      // complete image and the neighbouring solution nodes remain visible.
      await page.waitForTimeout(750);
      const panoramaLayout = await page.locator('.home-panorama').evaluate(figure => {
        const image = figure.querySelector('img');
        const art = image.getBoundingClientRect();
        const captions = figure.querySelector('.home-panorama-labels').getBoundingClientRect();
        // Hand-checked artwork landmark: all foreground buildings end at 80%.
        return {
          aspectError: Math.abs(art.height - art.width * image.naturalHeight / image.naturalWidth),
          captionGap: captions.top - (art.top + art.height * .8),
          overlaysFloor: captions.top < art.bottom,
          staysInFigure: captions.bottom <= figure.getBoundingClientRect().bottom + 1,
        };
      });
      assert.ok(panoramaLayout.aspectError < 1, `Complete panorama is shown without cropping at ${language} ${width}px`);
      assert.ok(panoramaLayout.captionGap >= 0 && panoramaLayout.captionGap <= 24, `Captions sit just below the buildings at ${language} ${width}px: ${panoramaLayout.captionGap}px`);
      assert.ok(panoramaLayout.overlaysFloor && panoramaLayout.staysInFigure, `Captions overlay the empty floor and fit the figure at ${language} ${width}px`);
      const imageCollisions = await page.evaluate(() => {
        const collisions = [];
        const image = document.querySelector('.home-map-art img');
        const bounds = image.getBoundingClientRect().toJSON();
        // Account for actual clipping ancestors when measuring painted bounds.
        for (let ancestor = image.parentElement; ancestor; ancestor = ancestor.parentElement) {
          const style = getComputedStyle(ancestor);
          const rect = ancestor.getBoundingClientRect();
          if (['hidden', 'clip', 'auto', 'scroll'].includes(style.overflowX)) {
            bounds.left = Math.max(bounds.left, rect.left);
            bounds.right = Math.min(bounds.right, rect.right);
          }
          if (['hidden', 'clip', 'auto', 'scroll'].includes(style.overflowY)) {
            bounds.top = Math.max(bounds.top, rect.top);
            bounds.bottom = Math.min(bounds.bottom, rect.bottom);
          }
        }
        for (const node of document.querySelectorAll('.home-solution-node')) {
          const rect = node.getBoundingClientRect();
          if (bounds.left < rect.right && bounds.right > rect.left && bounds.top < rect.bottom && bounds.bottom > rect.top) collisions.push(`solution image overlaps ${node.querySelector('h3').textContent}`);
        }
        return collisions;
      });
      assert.deepEqual(imageCollisions, [], `Images stay clear of content at ${language} ${width}px`);
    }
    await page.emulateMedia({ reducedMotion: 'reduce' });
    assert.equal(await page.locator('main').evaluate(el => el.getAnimations({ subtree: true }).filter(a => a.playState === 'running').length), 0);
    assert.deepEqual(errors, []);
    await context.close();

    const staticContext = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const staticPage = await staticContext.newPage();
    await staticPage.goto(`${origin}${prefix}/`);
    assert.equal(await staticPage.locator('#customer_needs a:visible').count(), 3);
    assert.equal(await staticPage.locator('#core_solutions a:visible').count(), 4);
    assert.equal(await staticPage.locator('.home-service-steps a:visible').count(), 5);
    await staticPage.locator('#home_contact a').click();
    await staticPage.waitForURL(`${origin}${prefix}/contact/#consultation_form`);
    await staticContext.close();
  }
  console.log('PASS: Home A localized needs, solution/service deep links, keyboard navigation, responsive imagery, reduced motion and no-JS contact journey');
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
