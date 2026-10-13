import assert from 'node:assert/strict';
import path from 'node:path';
import { createRequire } from 'node:module';
import { startServer } from '../scripts/serve.mjs';

const require = createRequire(import.meta.url);
let chromium;
for (const candidate of ['playwright', path.join(process.env.USERPROFILE || '', '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')]) {
  try { ({ chromium } = require(candidate)); break; } catch {}
}
assert.ok(chromium, 'Playwright is required for CTA motion verification');
const server = await startServer({ port: 0 });
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
try {
  for (const width of [390, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'no-preference' });
    await context.addInitScript(() => {
      window.__ctaPlays = 0;
      const animate = Element.prototype.animate;
      Element.prototype.animate = function (...args) {
        const animation = animate.apply(this, args);
        if (this.closest('.closing-layout')) {
          const play = animation.play.bind(animation);
          animation.play = () => { window.__ctaPlays++; return play(); };
        }
        return animation;
      };
    });
    const page = await context.newPage();
    await page.goto(origin + '/');
    const invitationStyles = () => page.locator('.home-contact').evaluate(element => {
      const pick = (node, properties) => Object.fromEntries(properties.map(property => [property, getComputedStyle(node)[property]]));
      return {
        section: pick(element, ['backgroundColor', 'color', 'paddingTop', 'paddingBottom']),
        layout: pick(element.querySelector('.home-contact-layout'), ['display', 'gridTemplateColumns', 'gap']),
        heading: pick(element.querySelector('h2'), ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight']),
        copy: pick(element.querySelector('p'), ['color', 'fontSize', 'marginTop']),
        button: pick(element.querySelector('.button'), ['color', 'backgroundColor', 'fontSize']),
      };
    });
    const homeStyles = await invitationStyles();
    for (const route of ['/services/', '/', '/about/', '/solutions/', '/products/']) {
      await page.goto(origin + route);
      await page.evaluate(() => document.fonts.ready);
      assert.deepEqual(await invitationStyles(), homeStyles, `Contact invitation must match Home on ${route} at ${width}px`);
      assert.equal(await page.locator('.home-contact h2').innerText(), "Let's talk about your infrastructure.");
      assert.deepEqual((await page.locator('.home-contact-checklist li').allTextContents()).map(text => text.trim()), ['Your current environment', 'Your priorities', 'Your expected scope']);
      assert.equal(await page.locator('.home-contact .button').getAttribute('href'), '/contact/#consultation_form');
      assert.equal(await page.locator('.home-contact .button').innerText(), 'Talk to Our Team');
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `No horizontal overflow on ${route}`);
      await page.locator('.closing-layout').evaluate(element => scrollTo({ top: scrollY + element.getBoundingClientRect().top - innerHeight - 50, behavior: 'instant' }));
      await page.waitForTimeout(850);
      assert.equal(await page.evaluate(() => window.__ctaPlays), 0, `CTA must not finish offscreen at ${width}px on ${route}`);
      const entrance = await page.locator('.closing-layout').evaluate(element => element.getAnimations({ subtree: true }).map(animation => ({
        target: animation.effect.target.tagName,
        delay: animation.effect.getTiming().delay,
        duration: animation.effect.getTiming().duration,
        from: animation.effect.getKeyframes()[0].transform,
      })));
      assert.deepEqual(entrance.map(item => item.target), ['H2', 'P', 'A', 'LI', 'LI', 'LI'], 'Left copy and each checklist row must animate separately');
      assert.deepEqual(entrance.map(item => item.delay), [0, 160, 320, 160, 320, 480], 'Checklist follows the heading closely, with rows entering in order');
      assert.ok(entrance.every(item => item.duration >= 900 && item.from === 'translateY(40px)'), 'Entrance must have a visible travel distance and duration');
      await page.locator('.closing-layout').evaluate(element => scrollTo({ top: scrollY + element.getBoundingClientRect().top - innerHeight + 280, behavior: 'instant' }));
      await page.waitForFunction(() => {
        const element = document.querySelector('.closing-layout h2');
        const opacity = Number(getComputedStyle(element).opacity);
        return opacity > .05 && opacity < .95 && getComputedStyle(element).transform !== 'none';
      });
      assert.ok(await page.locator('.closing-layout').evaluate(element => Number(getComputedStyle(element.querySelector('h2')).opacity) > Number(getComputedStyle(element.querySelector('.button')).opacity)), 'Heading must visibly lead the button');
      await page.waitForFunction(() => {
        const rows = [...document.querySelectorAll('.home-contact-checklist li')];
        const first = Number(getComputedStyle(rows[0]).opacity);
        return first > .05 && first < .95;
      });
      assert.ok(await page.locator('.closing-layout .button').evaluate(element => Number(getComputedStyle(element).opacity) < 1), 'Checklist begins while the left column is still entering');
      assert.ok(await page.locator('.home-contact-checklist').evaluate(element => Number(getComputedStyle(element.children[0]).opacity) > Number(getComputedStyle(element.children[2]).opacity)), 'Checklist rows visibly enter in sequence');
      await page.waitForFunction(() => document.querySelector('.closing-layout').dataset.revealPlayed === 'true' && document.querySelector('.closing-layout').getAnimations({ subtree: true }).length === 0);
      assert.equal(await page.evaluate(() => window.__ctaPlays), 6);
      await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
      await page.locator('.home-contact').scrollIntoViewIfNeeded();
      assert.equal(await page.evaluate(() => window.__ctaPlays), 6, 'Revisiting the CTA must not replay its entrance');
      await page.goto(origin + '/contact/');
      await page.goto(origin + route + '#footer');
      await page.waitForFunction(() => window.__ctaPlays === 6);
      await page.waitForFunction(() => document.querySelector('.closing-layout').getAnimations({ subtree: true }).length === 0);
    }
    await context.close();
  }
  for (const options of [{ reducedMotion: 'reduce' }, { javaScriptEnabled: false }]) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, ...options });
    const page = await context.newPage();
    await page.goto(origin + '/products/#footer');
    assert.ok(await page.locator('.closing-layout').isVisible());
    assert.equal(await page.locator('.closing-layout').evaluate(element => getComputedStyle(element).opacity), '1');
    assert.equal(await page.locator('.closing-layout').evaluate(element => element.getAnimations({ subtree: true }).length), 0);
    assert.ok(await page.locator('.closing-layout').evaluate(element => [...element.querySelectorAll('h2, p, .button, .home-contact-checklist li')].every(child => getComputedStyle(child).opacity === '1')));
    await context.close();
  }
  console.log('PASS: CTA checklist follows the heading with a short overlapping stagger on Home and all four detail pages at desktop/mobile sizes, support footer links, play once and remain readable with reduced motion or no JavaScript');
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
