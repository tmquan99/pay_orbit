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
  assert.deepEqual(await page.evaluate(() => window.__homeEntrances),[650,650,650,650]);
  const image = page.locator('.home-panorama img');
  await image.evaluate(el => el.decode());
  assert.ok(await image.evaluate(el => el.naturalWidth >= el.getBoundingClientRect().width),'Panoramic illustration is sharp at desktop size');
  assert.equal(await page.locator('[data-connection-scene],[data-connection-signal]').count(),0,'Home A uses its new shared solution illustration rather than the former cable scene');
  await page.locator('.home-map-art').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.querySelector('.home-map-art').dataset.revealPlayed === 'true' && document.querySelector('.home-map-art').getAnimations().length === 0);
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.reload({waitUntil:'networkidle'});
  assert.deepEqual(await page.evaluate(() => window.__homeEntrances),[]);
  assert.equal(await page.locator('main').evaluate(el => el.getAnimations({subtree:true}).length),0);
  assert.equal(await page.locator('#core_solutions .solution-card:visible').count(),4);
  await context.close();
  console.log('PASS: Home A retains four gentle hero entrances, sharp panorama, readable static solution map and reduced-motion fallback');
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
