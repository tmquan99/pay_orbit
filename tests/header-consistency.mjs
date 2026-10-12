import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import path from 'node:path';
import { startServer } from '../scripts/serve.mjs';

const require = createRequire(import.meta.url);
const { chromium } = require(path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const server = await startServer({ port: 0, directory: process.env.TEST_DIST === '1' ? 'dist' : '.' });
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const home = await browser.newPage();
const detail = await browser.newPage();
// Compare settled styles, independent of how two tabs advance hover transitions.
for (const page of [home, detail]) await page.emulateMedia({ reducedMotion: 'reduce' });
const appearance = page => page.locator('.site-header').evaluate(header => {
  const style = (selector, properties) => {
    const element = header.querySelector(selector);
    const computed = getComputedStyle(element);
    return Object.fromEntries(properties.map(property => [property, computed[property]]));
  };
  return {
    background: getComputedStyle(header).backgroundColor,
    height: header.getBoundingClientRect().height,
    container: header.firstElementChild.getBoundingClientRect().toJSON(),
    logo: header.querySelector('.brand-symbol').getAttribute('src'),
    wordmark: style('.wordmark', ['color', 'fontSize', 'gap']),
    active: style('[aria-current="page"]', ['color', 'backgroundColor', 'textDecorationLine', 'borderRadius']),
    contact: style('.navigation-contact', ['color', 'backgroundColor']),
    menu: style('.menu-toggle', ['color', 'backgroundColor', 'borderColor', 'fontSize', 'padding', 'display']),
  };
});
try {
  for (const width of [1440, 1024, 768, 390, 360, 320]) {
    for (const page of [home, detail]) await page.setViewportSize({ width, height: 900 });
    await Promise.all([home.goto(origin, { waitUntil: 'networkidle' }), detail.goto(`${origin}/about/`, { waitUntil: 'networkidle' })]);
    await Promise.all([home.evaluate(() => document.fonts.ready), detail.evaluate(() => document.fonts.ready)]);
    assert.deepEqual(await appearance(home), await appearance(detail), `Home header matches shared header at ${width}px`);
    if (width <= 1100) {
      for (const page of [home, detail]) await page.locator('.menu-toggle').click();
      assert.equal(await home.locator('.site-header nav a:visible').count(), 6);
      assert.deepEqual(await appearance(home), await appearance(detail), `Expanded Home menu matches detail menu at ${width}px`);
    }
    for (const page of [home, detail]) await page.locator('.navigation-contact').hover();
    await Promise.all([home.waitForTimeout(200), detail.waitForTimeout(200)]);
    assert.deepEqual(await appearance(home), await appearance(detail), `Home header hover matches at ${width}px`);
    for (const page of [home, detail]) await page.locator('.wordmark').focus();
    const focus = page => page.locator('.wordmark').evaluate(el => ({ color: getComputedStyle(el).outlineColor, style: getComputedStyle(el).outlineStyle }));
    assert.deepEqual(await focus(home), await focus(detail), `Header focus matches at ${width}px`);
    assert.ok(await home.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `No Home overflow at ${width}px`);
  }
  console.log('PASS: Home and shared detail header match across six widths, including logo, active link, hover, focus and expanded mobile menu');
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
