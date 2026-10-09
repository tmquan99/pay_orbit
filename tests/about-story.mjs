import assert from 'node:assert/strict';
import path from 'node:path';
import { createRequire } from 'node:module';
import { startServer } from '../scripts/serve.mjs';

const require = createRequire(import.meta.url);
let chromium;
for (const candidate of ['playwright', path.join(process.env.USERPROFILE || '', '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')]) {
  try { ({ chromium } = require(candidate)); break; } catch {}
}
assert.ok(chromium, 'Playwright is required for the scrolltelling behavior test');
const server = await startServer({ port: 0, host: '127.0.0.1', directory: process.env.TEST_DIST === '1' ? 'dist' : '.' });
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ headless: true, ignoreDefaultArgs: ['--disable-back-forward-cache'], executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' });
const page = await context.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
async function moveToChapter(index, nearEnd = false) {
  await page.locator('[data-story-chapter]').nth(index).evaluate((chapter, end) => {
    const rect = chapter.getBoundingClientRect();
    scrollTo({ top: scrollY + rect.top + (end ? rect.height - 90 : rect.height / 2) - innerHeight / 2, behavior: 'instant' });
  }, nearEnd);
}
async function stage(index) {
  await page.waitForFunction(expected => document.querySelector('[data-story-desktop]')?.dataset.storyStage === String(expected) && document.querySelector(`[data-story-chapter="${expected}"]`)?.dataset.storyCurrent === 'true', index);
}
async function focusMetrics(index) {
  return page.locator('[data-story-chapter]').nth(index).evaluate(chapter => ({
    font: parseFloat(getComputedStyle(chapter.querySelector('.story-heading-label') || chapter.querySelector('h2')).fontSize),
    height: chapter.getBoundingClientRect().height,
    headingHeight: chapter.querySelector('h2').getBoundingClientRect().height,
    background: getComputedStyle(chapter, '::after').backgroundColor,
    opacity: getComputedStyle(chapter, '::after').opacity,
  }));
}
async function assertChapterFocus(index, before) {
  await page.waitForFunction(expected => document.querySelector(`[data-story-chapter="${expected}"]`)?.dataset.storyCurrent === 'true', index);
  await page.waitForFunction(({ index, start }) => {
    const chapter = document.querySelector(`[data-story-chapter="${index}"]`);
    const font = parseFloat(getComputedStyle(chapter.querySelector('.story-heading-label')).fontSize);
    const target = parseFloat(getComputedStyle(chapter.querySelector('h2')).fontSize);
    return font > start + .05 && font < target - .05;
  }, { index, start: before.font }, { timeout: 2000 });
  const during = await focusMetrics(index);
  assert.ok(Math.abs(during.height - before.height) < 1 && Math.abs(during.headingHeight - before.headingHeight) < 1, 'Font interpolation must not shift the chapter layout');
  await page.waitForFunction(expected => {
    const chapter = document.querySelector(`[data-story-chapter="${expected}"]`);
    return Math.abs(parseFloat(getComputedStyle(chapter.querySelector('.story-heading-label')).fontSize) - parseFloat(getComputedStyle(chapter.querySelector('h2')).fontSize)) < .01;
  }, index);
  const after = await focusMetrics(index);
  assert.ok(after.font > before.font * 1.05, 'The current chapter heading must grow visibly');
  assert.ok(Math.abs(after.height - before.height) < 1 && Math.abs(after.headingHeight - before.headingHeight) < 1, 'Heading emphasis must reserve its space without shifting chapter geometry');
  assert.notEqual(after.background, 'rgba(0, 0, 0, 0)', 'The current chapter needs a distinct background');
  await page.waitForFunction(expected => getComputedStyle(document.querySelector(`[data-story-chapter="${expected}"]`), '::after').opacity === '1', index);
  assert.equal(await page.locator('[data-story-current="true"]').count(), 1, 'Only one reading chapter may be emphasized');
}
async function staticFigures() {
  await page.waitForFunction(() => !document.querySelector('[data-about-story]')?.hasAttribute('data-story-enhanced'), null, { timeout: 3000 });
  assert.equal(await page.locator('[data-about-story]').getAttribute('data-story-enhanced'), null);
  const mobile = page.viewportSize().width < 768;
  assert.equal(await page.locator('[data-story-inline]:visible').count(), mobile ? 0 : 4);
  if (mobile) {
    assert.equal(await page.locator('.story-mobile-step:visible').count(), 4);
    assert.equal(await page.locator('.story-mobile-diagram').count(), 0);
    assert.equal(await page.locator('.story-scene:visible').count(), 0, 'Mobile must show the timeline without diagrams');
  }
  assert.equal(await page.locator('[data-story-desktop]:visible').count(), 0);
  // CTA hover feedback can run independently; only the explanatory figures must settle.
  const running = await page.locator('.story-scene').evaluateAll(figures => figures.flatMap(figure => figure.getAnimations({ subtree: true }).filter(animation => animation.playState === 'running').map(animation => animation.transitionProperty)));
  assert.deepEqual(running, []);
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Story must not overflow horizontally');
}
try {
  await page.goto(origin + '/about/');
  assert.equal(await page.locator('[data-about-story]').count(), 1, 'About must contain the approved four-chapter story');
  assert.equal(await page.locator('[data-story-chapter]').count(), 4);
  await page.waitForFunction(() => document.querySelector('[data-about-story]')?.dataset.storyEnhanced === 'true');
  await page.evaluate(() => document.fonts.ready);
  assert.equal(await page.locator('[data-story-desktop]').evaluate(figure => getComputedStyle(figure).position), 'sticky');
  assert.equal(await page.locator('[data-story-inline]:visible').count(), 0);
  assert.equal(await page.locator('[data-about-story]').evaluate(root => root.getAnimations({ subtree: true }).length), 0, 'Below-fold scene must not animate early');

  await page.locator('[data-story-chapter="0"]').evaluate(chapter => scrollTo({ top: scrollY + chapter.getBoundingClientRect().top - innerHeight * .51, behavior: 'instant' }));
  await page.waitForFunction(() => document.querySelector('[data-story-chapter="0"]').dataset.storyCurrent === 'true', null, { timeout: 3000 });
  await moveToChapter(0, true);
  await stage(0);
  const firstTop = await page.locator('[data-story-desktop]').evaluate(figure => figure.getBoundingClientRect().top);
  const openingFocus = await focusMetrics(1);
  await moveToChapter(1);
  await stage(1);
  await page.waitForFunction(() => [...document.querySelectorAll('[data-story-desktop] [data-story-flow]')].some(flow => flow.getAnimations().some(animation => animation.playState === 'running')), null, { timeout: 3000 });
  await assertChapterFocus(1, openingFocus);
  const secondTop = await page.locator('[data-story-desktop]').evaluate(figure => figure.getBoundingClientRect().top);
  assert.ok(secondTop <= firstTop + 3 && secondTop >= 24 && secondTop <= 40, 'Illustration must reach its sticky inset as the shorter opening chapter scrolls away');
  await page.waitForTimeout(1000);
  assert.equal(await page.locator('[data-story-desktop] [data-story-copy="1"]:visible').count(), 3);
  assert.equal(await page.locator('[data-story-desktop] [data-story-copy="0"]:visible').count(), 0);

  for (const [index, symbol, detail] of [[2, 'cable', 'Kiểm thử'], [3, 'headset', 'Tối ưu']]) {
    await moveToChapter(index);
    await stage(index);
    await page.waitForFunction(() => document.querySelector('[data-story-desktop] .story-gateway-symbol').getAnimations({ subtree: true }).some(animation => animation.playState === 'running'), null, { timeout: 3000 });
    await page.waitForTimeout(800);
    assert.equal(await page.locator(`[data-story-desktop] [data-story-copy="${index}"]:visible`).count(), 3);
    assert.ok((await page.locator('[data-story-desktop] [data-story-detail]:visible').innerText()).includes(detail));
    assert.equal(await page.locator(`[data-story-desktop] .story-gateway-symbol [data-icon="${symbol}"]`).evaluate(icon => getComputedStyle(icon).opacity), '1');
    await page.waitForFunction(() => [...document.querySelectorAll('[data-story-desktop] .story-deployment-mark')].every(mark => getComputedStyle(mark).opacity === '1'), null, { timeout: 3000 });
    assert.equal(await page.locator('[data-story-desktop] .story-security-zone').evaluate(zone => getComputedStyle(zone).opacity), '1', 'Deployment and support must keep the security layer');
    assert.ok(await page.locator('[data-story-desktop]').evaluate(figure => figure.getBoundingClientRect().bottom <= innerHeight), 'Every chapter must keep the whole pinned illustration in view');
    assert.ok(Math.abs(await page.locator('[data-story-desktop]').evaluate(figure => figure.getBoundingClientRect().top) - secondTop) < 3, 'Illustration must stay pinned through the remaining chapters');
  }

  await moveToChapter(2);
  await stage(2);
  await moveToChapter(3);
  await stage(3);

  await moveToChapter(0, true);
  await stage(0);
  await page.waitForTimeout(1000);
  assert.equal(await page.locator('[data-story-desktop] [data-story-copy="0"]:visible').count(), 3, 'Scrolling back must restore the needs chapter');
  assert.ok(await page.locator('[data-story-desktop] .story-deployment-mark').evaluateAll(marks => marks.every(mark => getComputedStyle(mark).opacity === '0')), 'Scrolling back must clear deployment marks');
  await moveToChapter(3);
  await stage(3);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await staticFigures();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.waitForFunction(() => document.querySelector('[data-about-story]')?.dataset.storyEnhanced === 'true');
  await stage(3);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForFunction(() => !document.querySelector('[data-about-story]')?.hasAttribute('data-story-enhanced'));
  await staticFigures();
  await page.goto(origin + '/en/about/');
  await staticFigures();
  assert.equal(await page.locator('[data-story-chapter]').count(), 4);
  assert.ok(!/[À-ỹ]/u.test(await page.locator('[data-about-story]').innerText()), 'English story must be fully localized');
  assert.ok((await page.locator('[data-story-chapter]').nth(1).innerText()).includes('Cisco'));

  const mobileFocus = await focusMetrics(3);
  await moveToChapter(3);
  await page.waitForFunction(() => document.querySelector('[data-story-chapter="3"] .story-chapter-copy').getAnimations().some(animation => animation.playState === 'running'), null, { timeout: 3000 });
  await assertChapterFocus(3, mobileFocus);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForFunction(() => [...document.querySelectorAll('.story-chapter-copy')].every(copy => copy.getAnimations().length === 0), null, { timeout: 3000 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });

  await page.setViewportSize({ width: 320, height: 568 });
  for (const route of ['/about/', '/en/about/']) {
    await page.goto(origin + route);
    await staticFigures();
    await page.evaluate(() => document.fonts.ready);
    const collapsed = await page.locator('[data-about-story]').evaluate(story => story.getBoundingClientRect().height);
    assert.ok(collapsed < (route === '/about/' ? 4279 : 4338) * .75, 'The mobile story must be at least 25% shorter than the repeated-diagram layout at 320px');
    assert.equal(await page.locator('.about-lifecycle a:visible').count(), 5, 'All five service links must remain available');
    assert.ok(await page.locator('.about-lifecycle').evaluate(flow => flow.getBoundingClientRect().height < 160), 'Mobile deployment links must fit in a compact text flow');
    await moveToChapter(2);
    await page.waitForFunction(() => document.querySelector('[data-story-chapter="2"]').dataset.storyCurrent === 'true');
    const reverseFocus = await focusMetrics(1);
    await moveToChapter(1);
    await assertChapterFocus(1, reverseFocus);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await moveToChapter(0);
    await page.waitForFunction(() => document.querySelector('[data-story-chapter="0"]').dataset.storyCurrent === 'true');
    assert.ok(await page.locator('[data-about-story]').evaluate(story => story.getAnimations({ subtree: true }).every(animation => animation.playState !== 'running')), 'Reduced motion must retain active chapter styling without animations');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
  }

  await page.setViewportSize({ width: 768, height: 844 });
  await staticFigures();
  assert.ok(await page.locator('.story-chapter-copy').evaluateAll(copies => copies.every(copy => copy.getAnimations().length === 0)), 'Leaving mobile must cancel chapter entrances');
  assert.equal(await page.locator('.story-mobile-diagram:visible').count(), 0, 'Tablet must retain the existing inline diagrams');

  await page.setViewportSize({ width: 1280, height: 760 });
  await page.goto(origin + '/about/');
  await page.waitForFunction(() => document.querySelector('[data-about-story]')?.dataset.storyEnhanced === 'true');
  await moveToChapter(2);
  await stage(2);
  await page.evaluate(() => {
    window.__aboutCacheMarker = true;
    addEventListener('pageshow', event => { window.__aboutBFCacheRestored = event.persisted; });
  });
  for (let visit = 0; visit < 2; visit++) {
    const before = await page.locator('[data-story-chapter="2"]').evaluate(chapter => ({ scroll: scrollY, top: chapter.getBoundingClientRect().top }));
    await page.locator('[data-story-chapter="2"] .story-chapter-copy > a').click();
    await page.waitForURL(origin + '/services/');
    await page.goBack({ waitUntil: 'commit', timeout: 5000 });
    await page.waitForFunction(() => window.__aboutBFCacheRestored === true);
    assert.equal(await page.evaluate(() => window.__aboutCacheMarker), true, 'Back must actually use BFCache, not reload the page');
    await page.waitForFunction(() => document.querySelector('[data-about-story]')?.dataset.storyEnhanced === 'true', null, { timeout: 3000 });
    await stage(2);
    const after = await page.locator('[data-story-chapter="2"]').evaluate(chapter => ({ scroll: scrollY, top: chapter.getBoundingClientRect().top }));
    assert.ok(Math.abs(before.scroll - after.scroll) < 3 && Math.abs(before.top - after.top) < 3, 'Back must preserve the chapter reading position');
    await moveToChapter(3);
    await stage(3);
    await moveToChapter(2);
    await stage(2);
  }
  await moveToChapter(3);
  await stage(3);
  await page.evaluate(() => dispatchEvent(new PageTransitionEvent('pagehide', { persisted: false })));
  await staticFigures();

  const noJS = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
  const plain = await noJS.newPage();
  await plain.goto(origin + '/about/');
  assert.equal(await plain.locator('[data-story-inline]:visible').count(), 4, 'Without JavaScript each chapter must retain its own readable illustration');
  assert.equal(await plain.locator('.story-chapter-copy > a').count(), 4);
  assert.ok((await plain.locator('[data-about-story]').innerText()).includes('Palo Alto Networks'));
  await plain.setViewportSize({ width: 390, height: 844 });
  assert.equal(await plain.locator('.story-scene:visible').count(), 0);
  assert.equal(await plain.locator('.story-mobile-step:visible').count(), 4);
  assert.equal(await plain.locator('.story-mobile-diagram').count(), 0);
  await noJS.close();
  assert.deepEqual(errors, []);
  console.log('PASS: desktop story reverses/restores BFCache; mobile timeline has no diagram control, preserves service links without JavaScript and cancels entrances for reduced motion or resize');
} finally {
  await context.close();
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
