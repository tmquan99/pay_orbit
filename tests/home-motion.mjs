import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import path from 'node:path';
import { startServer } from '../scripts/serve.mjs';

const require = createRequire(import.meta.url);
const { chromium } = require(path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const server = await startServer({ port: 0, directory: process.env.TEST_DIST === '1' ? 'dist' : '.' });
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
const sceneRunning = () => page.locator('[data-connection-scene]').evaluate(element => element.getAnimations({ subtree: true }).filter(animation => animation.playState === 'running').length);
try {
  await page.goto(origin, { waitUntil: 'networkidle' });
  const heroResolution = await page.locator('.hero-media img').evaluate(image => {
    const frame = image.getBoundingClientRect();
    return Math.min(image.naturalWidth / frame.width, image.naturalHeight / frame.height);
  });
  assert.ok(heroResolution >= 1, 'Desktop cover image must have enough source pixels for both frame dimensions');
  assert.equal(await page.locator('[data-connection-scene]').count(), 1, 'Home must explain the infrastructure groups with a connection scene');
  assert.equal(await sceneRunning(), 0, 'Below-fold connection motion must wait for the scene');
  await page.locator('[data-connection-diagram]').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.querySelector('[data-connection-scene]').getAnimations({ subtree: true }).some(animation => animation.playState === 'running'));
  await page.waitForFunction(() => document.querySelector('[data-connection-scene]').dataset.connectionPlayed === 'true');
  assert.equal(await sceneRunning(), 0, 'A completed explanation must settle without perpetual motion');
  await page.locator('h1').scrollIntoViewIfNeeded();
  await page.locator('[data-connection-diagram]').scrollIntoViewIfNeeded();
  assert.equal(await sceneRunning(), 0, 'Returning to the scene must not replay it');

  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.locator('h1').scrollIntoViewIfNeeded();
  await page.reload({ waitUntil: 'networkidle' });
  await page.locator('[data-connection-diagram]').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.querySelector('[data-connection-scene]').getAnimations({ subtree: true }).some(animation => animation.playState === 'running'));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  // Media-query change notifications are delivered on the next browser frame.
  await page.waitForFunction(() => document.querySelector('[data-connection-scene]').getAnimations({ subtree: true }).every(animation => animation.playState !== 'running'), null, { timeout: 1000 });
  assert.equal(await sceneRunning(), 0, 'Reduced motion must cancel an explanation already running');
  await page.reload({ waitUntil: 'networkidle' });
  await page.locator('[data-connection-diagram]').scrollIntoViewIfNeeded();
  assert.equal(await sceneRunning(), 0, 'Reduced motion must never start the explanation');
  assert.equal(await page.locator('[data-connection-stage]:visible').count(), 4, 'All four domains must remain readable without motion');

  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(origin + '/en/', { waitUntil: 'networkidle' });
  await page.locator('[data-connection-diagram]').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.querySelector('[data-connection-flow]').getAnimations().some(animation => animation.playState === 'running'));
  const mobile = await page.locator('[data-connection-stage]').evaluateAll(elements => elements.map(element => ({ top: element.getBoundingClientRect().top, left: element.getBoundingClientRect().left, text: element.innerText })));
  assert.ok(mobile.every((item, index) => index === 0 || item.top > mobile[index - 1].top), 'Mobile domains must follow a readable vertical order');
  assert.ok(mobile.every(item => !/[À-ỹ]/u.test(item.text)), 'English diagram labels must be localized');
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Mobile diagram must fit the viewport');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForFunction(() => document.querySelector('[data-connection-scene]').getAnimations({ subtree: true }).every(animation => animation.playState !== 'running'), null, { timeout: 1000 });
  assert.equal(await sceneRunning(), 0, 'Switching diagram axis must settle the current explanation');

  const noScript = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  try {
    const staticPage = await noScript.newPage();
    await staticPage.goto(origin, { waitUntil: 'networkidle' });
    assert.equal(await staticPage.locator('[data-connection-stage]:visible').count(), 4);
    assert.equal(await staticPage.locator('#core_solutions a[href^="/solutions/#"]').count(), 4);
  } finally { await noScript.close(); }
  console.log('PASS: connection explanation waits for viewport, runs once, cancels on reduced motion and axis change, and stays readable on mobile and without JavaScript');
} finally {
  await context.close();
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
