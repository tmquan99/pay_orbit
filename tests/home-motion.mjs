import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import path from 'node:path';
import { startServer } from '../scripts/serve.mjs';
const require = createRequire(import.meta.url);
const { chromium } = require(path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const server = await startServer({port:0, directory:process.env.TEST_DIST === '1' ? 'dist' : '.'});
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({headless:true, executablePath:process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try {
  const context = await browser.newContext({viewport:{width:1440,height:900}});
  const page = await context.newPage();
  await context.addInitScript(() => {
    window.__homeEntrances = [];
    const animate = Element.prototype.animate;
    Element.prototype.animate = function(...args) {
      const animation = animate.apply(this,args);
      if(this.hasAttribute('data-hero')) window.__homeEntrances.push(animation.effect.getTiming().duration);
      return animation;
    };
  });
  await page.goto(origin+'/',{waitUntil:'networkidle'});
  assert.deepEqual(await page.evaluate(() => window.__homeEntrances),[650,650,650,650,650]);
  const image = page.locator('.home-panorama img');
  await image.evaluate(el => el.decode());
  assert.ok(await image.evaluate(el => el.naturalWidth >= el.getBoundingClientRect().width),'Panoramic illustration is sharp at desktop size');
  assert.equal(await page.locator('.home-panorama [data-connection-signal]').count(),4,'The panorama follows its four visible cable gaps');
  await page.locator('[data-hero-graphic="panorama"]').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => [...document.querySelectorAll('.home-panorama [data-connection-signal]')].every(path => path.getAnimations()[0]?.playState === 'running'));
  const samples = await page.evaluate(() => {
    const paths = [...document.querySelectorAll('.home-panorama [data-connection-signal]')];
    const animations = paths.map(path => path.getAnimations()[0]);
    const durations = animations.map(animation => animation.effect.getTiming().duration);
    const dashLengths = paths.map(path => parseFloat(getComputedStyle(path).strokeDasharray));
    const startTimes = animations.map(animation => animation.startTime);
    animations.forEach(animation => animation.pause());
    const frames = [];
    for (let time = 0; time <= 9100; time += 50) {
      animations.forEach(animation => { animation.currentTime = time; });
      frames.push({ time, visible: paths.flatMap((path,index) => Number(getComputedStyle(path).opacity) > .01 ? [index] : []) });
    }
    animations.forEach(animation => { animation.currentTime = 0; animation.play(); });
    return { startTimes, frames, durations, dashLengths };
  });
  assert.deepEqual(samples.durations,[9000,9000,9000,9000], 'The panorama uses a slower nine-second cycle');
  assert.deepEqual(samples.dashLengths,[7,7,7,7], 'The bright trail is shorter on every cable segment');
  assert.ok(samples.startTimes.every(time => time === samples.startTimes[0]), 'All segments share a single clock');
  assert.ok(samples.frames.every(frame => frame.visible.length <= 1), 'Only one signal is visible, including at the loop boundary');
  assert.deepEqual([...new Set(samples.frames.flatMap(frame => frame.visible))],[0,1,2,3], 'The signal travels through all four gaps in order');
  assert.deepEqual(samples.frames.find(frame => frame.time === 9000).visible,[], 'The loop resets without a flash on an earlier segment');
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({width,height:900});
    const aligned = await page.locator('[data-hero-graphic="panorama"]').evaluate(frame => {
      const image=frame.querySelector('img').getBoundingClientRect();
      const overlay=frame.querySelector('svg').getBoundingClientRect();
      return ['x','y','width','height'].every(key => Math.abs(image[key]-overlay[key]) < 1);
    });
    assert.ok(aligned, `The cable overlay stays aligned at ${width}px`);
  }
  await page.locator('.home-map-art').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => [...document.querySelectorAll('.home-panorama [data-connection-signal]')].every(path => path.getAnimations()[0]?.playState === 'paused'));
  await page.waitForFunction(() => document.querySelector('.home-map-art').dataset.revealPlayed === 'true' && document.querySelector('.home-map-art').getAnimations().length === 0);
  await page.locator('[data-hero-graphic="panorama"]').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => [...document.querySelectorAll('.home-panorama [data-connection-signal]')].every(path => path.getAnimations()[0]?.playState === 'running'));
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.reload({waitUntil:'networkidle'});
  assert.deepEqual(await page.evaluate(() => window.__homeEntrances),[]);
  assert.equal(await page.locator('main').evaluate(el => el.getAnimations({subtree:true}).length),0);
  assert.equal(await page.locator('#core_solutions .solution-card:visible').count(),4);
  await context.close();
  const noJS = await browser.newContext({javaScriptEnabled:false});
  const staticPage = await noJS.newPage();
  await staticPage.goto(origin + '/');
  assert.equal(await staticPage.locator('.home-panorama img').isVisible(),true);
  assert.ok(await staticPage.locator('.home-panorama [data-connection-signal]').evaluateAll(paths => paths.every(path => getComputedStyle(path).opacity === '0')), 'No-JS keeps the original illustration without stationary highlights');
  await noJS.close();
  console.log('PASS: sequential panorama signal with no overlaps or loop flashes, responsive alignment, viewport pause/resume, hero entrances, reduced motion and no-JS fallback');
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
