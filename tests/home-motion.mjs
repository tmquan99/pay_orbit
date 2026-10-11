import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import path from 'node:path';
import { startServer } from '../scripts/serve.mjs';
import { checkConnectionRegression } from './connection-regression.mjs';

const require = createRequire(import.meta.url);
const { chromium } = require(path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const server = await startServer({ port: 0, directory: process.env.TEST_DIST === '1' ? 'dist' : '.' });
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', ignoreDefaultArgs: ['--disable-back-forward-cache'] });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
const sceneRunning = () => page.locator('[data-connection-diagram]').evaluate(element => element.getAnimations({ subtree: true }).filter(animation => animation.playState === 'running').length);
const cableRunning = () => page.locator('[data-hero-graphic="connection"]').evaluate(element => element.getAnimations({ subtree: true }).filter(animation => animation.playState === 'running').length);
try {
  await page.goto(origin + '/vi/', { waitUntil: 'networkidle' });
  const heroResolution = await page.locator('.hero-media img').evaluate(image => {
    const frame = image.getBoundingClientRect();
    return Math.min(image.naturalWidth / frame.width, image.naturalHeight / frame.height);
  });
  assert.ok(heroResolution >= 1, 'Desktop cover image must have enough source pixels for both frame dimensions');
  assert.equal(await page.locator('[data-connection-scene]').count(), 1, 'Home must explain the infrastructure groups with a connection scene');
  assert.equal(await sceneRunning(), 0, 'Below-fold connection motion must wait for the scene');
  assert.equal(await cableRunning(), 0, 'Below-fold cable motion waits for the illustration');
  assert.equal(await page.locator('[data-connection-signal]').count(), 3, 'Home uses the same three cable segments as Solutions');
  await page.locator('[data-hero-graphic="connection"]').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.querySelector('[data-hero-graphic="connection"]').getAnimations({ subtree: true }).filter(animation => animation.playState === 'running').length === 4);
  await checkConnectionRegression(page);
  await page.locator('[data-connection-diagram]').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.querySelector('[data-connection-diagram]').getAnimations({ subtree: true }).some(animation => animation.playState === 'running'));
  assert.equal(await page.locator('[data-connection-flow]').evaluate(el => el.getAnimations()[0].effect.getTiming().iterations), Infinity, 'The visible diagram must repeat');
  await page.waitForFunction(() => document.querySelector('[data-connection-flow]').getAnimations()[0]?.effect.getComputedTiming().currentIteration >= 1, null, { timeout: 7000 });
  assert.equal(await sceneRunning(), 5, 'The same flow and four halos continue into a second cycle');
  await page.locator('h1').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.querySelector('[data-connection-scene]').getAnimations({ subtree: true }).every(animation => animation.playState === 'paused'));
  assert.equal(await cableRunning(), 0, 'Cable motion pauses with the offscreen illustration');
  const pausedTime = await page.locator('[data-connection-flow]').evaluate(el => el.getAnimations()[0].currentTime);
  await page.waitForTimeout(180);
  assert.equal(await page.locator('[data-connection-flow]').evaluate(el => el.getAnimations()[0].currentTime), pausedTime, 'Offscreen playback must stop advancing');
  await page.locator('[data-connection-diagram]').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.querySelector('[data-connection-diagram]').getAnimations({ subtree: true }).filter(animation => animation.playState === 'running').length === 5);
  assert.equal(await page.locator('[data-connection-diagram]').evaluate(el => el.getAnimations({ subtree: true }).length), 5, 'Returning resumes without duplicating animations');
  await page.waitForFunction(() => document.querySelector('[data-hero-graphic="connection"]').getAnimations({ subtree: true }).filter(animation => animation.playState === 'running').length === 4);
  await page.evaluate(() => addEventListener('pageshow', event => { window.__homeRestored = event.persisted; }));
  await page.locator('#technology_focus a.button').click();
  await page.waitForURL(origin + '/vi/products/');
  await page.goBack({ waitUntil: 'commit' });
  await page.waitForFunction(() => window.__homeRestored === true);
  await page.locator('[data-connection-diagram]').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.querySelector('[data-connection-diagram]').getAnimations({ subtree: true }).filter(animation => animation.playState === 'running').length === 5);
  await page.waitForFunction(() => document.querySelector('[data-hero-graphic="connection"]').getAnimations({ subtree: true }).filter(animation => animation.playState === 'running').length === 4);

  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.locator('h1').scrollIntoViewIfNeeded();
  await page.reload({ waitUntil: 'networkidle' });
  await page.locator('[data-connection-diagram]').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.querySelector('[data-connection-scene]').getAnimations({ subtree: true }).some(animation => animation.playState === 'running'));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  // Media-query change notifications are delivered on the next browser frame.
  await page.waitForFunction(() => document.querySelector('[data-connection-scene]').getAnimations({ subtree: true }).every(animation => animation.playState !== 'running'), null, { timeout: 1000 });
  assert.equal(await sceneRunning(), 0, 'Reduced motion must cancel an explanation already running');
  assert.equal(await cableRunning(), 0, 'Reduced motion also cancels the cable signal');
  await page.reload({ waitUntil: 'networkidle' });
  await page.locator('[data-connection-diagram]').scrollIntoViewIfNeeded();
  assert.equal(await sceneRunning(), 0, 'Reduced motion must never start the explanation');
  assert.equal(await page.locator('[data-connection-stage]:visible').count(), 4, 'All four domains must remain readable without motion');

  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.waitForFunction(() => document.querySelector('[data-connection-flow]').getAnimations().some(animation => animation.playState === 'running'));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(origin + '/', { waitUntil: 'networkidle' });
  await page.locator('[data-hero-graphic="connection"]').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.querySelector('[data-hero-graphic="connection"]').getAnimations({ subtree: true }).filter(animation => animation.playState === 'running').length === 4);
  await page.locator('[data-connection-diagram]').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.querySelector('[data-connection-flow]').getAnimations().some(animation => animation.playState === 'running'));
  const mobile = await page.locator('[data-connection-stage]').evaluateAll(elements => elements.map(element => ({ top: element.getBoundingClientRect().top, left: element.getBoundingClientRect().left, text: element.innerText })));
  assert.ok(mobile.every((item, index) => index === 0 || item.top > mobile[index - 1].top), 'Mobile domains must follow a readable vertical order');
  assert.ok(mobile.every(item => !/[À-ỹ]/u.test(item.text)), 'English diagram labels must be localized');
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Mobile diagram must fit the viewport');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.locator('[data-connection-diagram]').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.querySelector('[data-connection-flow]').getAnimations().some(animation => animation.playState === 'running' && animation.effect.getKeyframes()[0].transform === 'scaleX(0)'));
  assert.equal(await page.locator('[data-connection-diagram]').evaluate(el => el.getAnimations({ subtree: true }).length), 5, 'Changing axis rebuilds one loop without leftover animations');

  const noScript = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  try {
    const staticPage = await noScript.newPage();
    await staticPage.goto(origin + '/vi/', { waitUntil: 'networkidle' });
    assert.equal(await staticPage.locator('[data-connection-stage]:visible').count(), 4);
    assert.equal(await staticPage.locator('.connection-art').isVisible(), true, 'Home graphic retains its image without JavaScript');
    assert.equal(await staticPage.locator('#core_solutions a[href^="/vi/solutions/#"]').count(), 4);
  } finally { await noScript.close(); }
  console.log('PASS: Home shares the sequential Solutions cable motion without trailing flashes; diagram repeats, pauses offscreen, restores BFCache, adapts its axis, respects reduced motion and stays readable without JavaScript');
} finally {
  await context.close();
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
