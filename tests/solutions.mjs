import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import path from 'node:path';
import { startServer } from '../scripts/serve.mjs';

const require = createRequire(import.meta.url);
const { chromium } = require(path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const server = await startServer({ port: 0, directory: process.env.TEST_DIST === '1' ? 'dist' : '.' });
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const ids = ['enterprise-networking', 'data-center-networking', 'cybersecurity', 'cloud-security'];
async function checkDescriptionMotion(page, id = 'enterprise-networking') {
  const details = page.locator(`#${id} details`);
  await details.locator('summary').focus();
  await page.waitForFunction(id => parseFloat(getComputedStyle(document.querySelector(`#${id} details`), '::details-content').blockSize) === 0, id);
  const collapsed = await details.evaluate(el => el.offsetHeight);
  for (const state of ['opening', 'closing']) {
    const motion = await details.evaluate(async el => {
      const summary = el.querySelector('summary');
      const actions = el.parentElement.querySelector('.solution-actions');
      const heights = [el.offsetHeight];
      const unanimatedSpace = [];
      const gaps = [];
      summary.click();
      const start = performance.now();
      await new Promise(resolve => {
        const sample = now => {
          const style = getComputedStyle(el);
          const content = parseFloat(getComputedStyle(el, '::details-content').blockSize) || 0;
          heights.push(el.offsetHeight);
          unanimatedSpace.push(el.offsetHeight - summary.offsetHeight - content - parseFloat(style.borderTopWidth) - parseFloat(style.borderBottomWidth));
          gaps.push(actions.offsetTop - el.offsetTop - el.offsetHeight);
          if (now - start < 460) requestAnimationFrame(sample);
          else resolve();
        };
        requestAnimationFrame(sample);
      });
      return { heights, unanimatedSpace, gaps };
    });
    const low = Math.min(motion.heights[0], motion.heights.at(-1));
    const high = Math.max(motion.heights[0], motion.heights.at(-1));
    assert.ok(high - low > 40, `${state}: full description changes height`);
    assert.ok(motion.heights.filter(height => height > low + 2 && height < high - 2).length >= 3, `${state}: disclosure moves gradually across frames: ${JSON.stringify(motion.heights)}`);
    assert.ok(motion.unanimatedSpace.every(space => Math.abs(space) < 1), `${state}: all spacing collapses with content, avoiding a final jump: ${JSON.stringify(motion.unanimatedSpace)}`);
    assert.ok(Math.max(...motion.gaps) - Math.min(...motion.gaps) <= 1, `${state}: action buttons follow the content without a separate jump`);
  }
  assert.equal(await details.evaluate(el => el.offsetHeight), collapsed, 'Closing returns exactly to the original height');
  await details.evaluate(async el => {
    for (let index = 0; index < 4; index++) {
      el.querySelector('summary').click();
      await new Promise(resolve => setTimeout(resolve, 90));
    }
  });
  await page.waitForFunction(id => parseFloat(getComputedStyle(document.querySelector(`#${id} details`), '::details-content').blockSize) === 0, id);
  assert.equal(await details.getAttribute('open'), null, 'Rapid toggles settle closed');
  assert.equal(await details.evaluate(el => el.offsetHeight), collapsed, 'Interrupted closing leaves no residual spacing');
}
try {
  for (const language of ['vi', 'en']) {
    const prefix = language === 'en' ? '/en' : '';
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${origin}${prefix}/solutions/`);
    await page.locator('.solutions-page .infographic-art img').evaluate(image => image.decode());
    // Srcset reports density-corrected intrinsic dimensions, not the file's pixel width.
    assert.ok(await page.locator('.solutions-page .infographic-art img').evaluate(image => image.naturalWidth > 0 && image.currentSrc.endsWith('.webp')), 'Desktop illustration must decode from the optimized asset');
    const nav = page.locator('[data-solution-nav]');
    assert.equal(await nav.count(), 1, 'Solutions need local navigation for switching between topics');
    await checkDescriptionMotion(page);
    const settledAt = id => page.waitForFunction(id => {
      const section = document.getElementById(id);
      return Math.abs(section.getBoundingClientRect().top - parseFloat(getComputedStyle(section).scrollMarginTop)) < 2;
    }, id, { timeout: 5000 });
    const traceScroll = () => page.evaluate(() => {
      window.__solutionScrollSamples = [scrollY];
      window.__solutionScrollSampling = true;
      const sample = () => {
        window.__solutionScrollSamples.push(scrollY);
        if (window.__solutionScrollSampling) requestAnimationFrame(sample);
      };
      requestAnimationFrame(sample);
      return scrollY;
    });
    const assertSmooth = async (start, label) => {
      const samples = await page.evaluate(() => { window.__solutionScrollSampling = false; return window.__solutionScrollSamples; });
      const end = await page.evaluate(() => scrollY);
      const middle = samples.filter(value => value > Math.min(start, end) + 5 && value < Math.max(start, end) - 5);
      assert.ok(new Set(middle).size >= 3, `${label} traverses intermediate positions instead of jumping`);
    };
    const heroStart = await traceScroll();
    await page.locator('.solution-overview a[href$="#cloud-security"]').click();
    await settledAt('cloud-security');
    await assertSmooth(heroStart, 'Hero solution navigation');
    for (const id of ids) {
      const article = page.locator(`#${id}`);
      const start = await traceScroll();
      await nav.locator(`a[href="#${id}"]`).click();
      await settledAt(id);
      await assertSmooth(start, 'Sticky solution navigation');
      await page.waitForFunction(id => document.querySelector(`[data-solution-nav] a[aria-current="location"]`)?.hash === `#${id}`, id);
      assert.equal(await nav.locator('[aria-current="location"]').count(), 1, 'Exactly one current topic');
      assert.ok(await article.evaluate(element => element.getBoundingClientRect().top >= document.querySelector('[data-solution-nav]').getBoundingClientRect().bottom - 2), 'Anchor must clear sticky navigation');
      assert.equal(await article.locator(`.solution-actions a[href="${prefix}/contact/#consultation_form"]`).count(), 1, 'Every solution offers a localized consultation action');
      const details = article.locator('details');
      assert.equal(await details.getAttribute('open'), null, 'Long technical copy starts collapsed');
      await details.locator('summary').focus();
      await page.keyboard.press('Enter');
      assert.notEqual(await details.getAttribute('open'), null, 'Technical details work with keyboard');
      await page.keyboard.press('Enter');
    }
    await checkDescriptionMotion(page, 'cloud-security');
    // Reading by normal scroll also updates the current topic.
    await page.locator('#enterprise-networking').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => document.querySelector('[data-solution-nav] [aria-current="location"]')?.hash === '#enterprise-networking');
    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(`${origin}${prefix}/solutions/`);
      const layout = await page.evaluate(() => ({
        width: innerWidth, scrollWidth: document.documentElement.scrollWidth,
        first: document.querySelector('[data-solution]').getBoundingClientRect().top + scrollY,
        illustration: getComputedStyle(document.querySelector('.solutions-page .infographic-art')).display,
        nav: getComputedStyle(document.querySelector('[data-solution-nav]')).display,
      }));
      assert.ok(layout.scrollWidth <= layout.width, `No overflow at ${width}px`);
      assert.ok(layout.first < 920, `Mobile content must be reachable early: ${layout.first}px`);
      assert.equal(layout.illustration, 'none');
      assert.equal(layout.nav, 'none', 'Mobile does not reserve height for a duplicate navigation bar');
      const readability = await page.evaluate(() => {
        const elements = [...document.querySelectorAll('a,button,summary,h1,h2,h3,p')].filter(element => element.getClientRects().length);
        return {
          clipped: elements.filter(element => element.clientWidth > 0 && element.scrollWidth > element.clientWidth + 1).map(element => element.textContent.trim()),
          smallTargets: elements.filter(element => element.matches('a,button,summary') && (element.getBoundingClientRect().width < 43.5 || element.getBoundingClientRect().height < 43.5)).map(element => element.textContent.trim()),
        };
      });
      assert.deepEqual(readability.clipped, [], `Text must not clip at ${width}px`);
      assert.deepEqual(readability.smallTargets, [], `Touch targets at least 44px at ${width}px`);
      await checkDescriptionMotion(page);
      await page.locator('.solution-overview a').last().click();
      assert.ok(await page.locator('#cloud-security h2').isVisible());
    }
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.reload();
    assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior), 'auto', 'Reduced motion preserves instant navigation');
    assert.equal(await page.locator('[data-solution]').evaluateAll(elements => elements.some(element => element.getAnimations({ subtree: true }).some(animation => animation.playState === 'running'))), false);
    await page.locator('#cloud-security summary').click();
    assert.equal(await page.locator('#cloud-security details').evaluate(el => getComputedStyle(el, '::details-content').transitionDuration), '0s', 'Reduced motion opens descriptions instantly');
    assert.deepEqual(errors, []);
    await page.close();
    const plain = await browser.newPage({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    await plain.goto(`${origin}${prefix}/solutions/`);
    assert.equal(await plain.locator('[data-solution]').count(), 4);
    await plain.locator('#cloud-security summary').click();
    assert.notEqual(await plain.locator('#cloud-security details').getAttribute('open'), null, 'Full content stays available without JavaScript');
    await plain.close();
  }
  console.log('PASS: Solutions navigation, scroll tracking, keyboard details, contextual actions, VI/EN, mobile 320/390, reduced motion and no-JS content');
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
