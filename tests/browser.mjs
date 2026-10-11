import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
assert.ok(await fs.stat(path.join(root, 'index.html')).catch(() => null), 'The company page must have a real index.html entry point');
const require = createRequire(import.meta.url);
let chromium;
for (const candidate of ['playwright', path.join(process.env.USERPROFILE || '', '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')]) {
  try { ({ chromium } = require(candidate)); break; } catch {}
}
assert.ok(chromium, 'A browser verification runtime is required; set NODE_PATH to an available Playwright installation');
const { startServer } = await import('../scripts/serve.mjs');
const server = await startServer({ port: 0, host: '127.0.0.1', directory: process.env.TEST_DIST === '1' ? 'dist' : '.' });
const origin = `http://127.0.0.1:${server.address().port}`;
const executablePath = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const browser = await chromium.launch({ headless: true, executablePath });
const evidenceDirectory = path.resolve(root, process.env.VERIFICATION_DIR || '.taste/verification');
await fs.mkdir(evidenceDirectory, { recursive: true });
const checks = [];
const record = (name, detail) => checks.push({ name, detail });
const context = await browser.newContext({ viewport: { width: 1440, height: 760 }, reducedMotion: 'no-preference' });
await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin });
await context.addInitScript(() => {
  window.__motionChecks = [];
  const animate = Element.prototype.animate;
  Element.prototype.animate = function (...args) {
    const animation = animate.apply(this, args);
    const entry = { hero: this.hasAttribute('data-hero'), reveal: this.dataset.reveal || null, played: 0, duration: animation.effect.getTiming().duration, keyframes: animation.effect.getKeyframes() };
    window.__motionChecks.push(entry);
    const play = animation.play.bind(animation);
    animation.play = () => { entry.played += 1; return play(); };
    return animation;
  };
});
const page = await context.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.stack || error.message));
const missing = [];
page.on('response', response => { if (response.status() >= 400) missing.push(`${response.status()} ${response.url()}`); });
const routes = ['/', '/about/', '/solutions/', '/services/', '/products/', '/contact/'];
const reviewRoutes = [...routes, ...routes.map(route => '/en' + route)];
const ids = ['hero', 'company_intro', 'core_solutions', 'technology_focus', 'why_pay_orbit', 'footer'];
async function assertVisibleContent() {
  const hidden = await page.evaluate(ids => ids.filter(id => {
    const element = document.getElementById(id);
    if (!element) return false;
    const style = getComputedStyle(element);
    return style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0;
  }), ids);
  assert.deepEqual(hidden, []);
  const hiddenGroups = await page.locator('[data-reveal-played="true"]').evaluateAll(elements => elements.filter(element => getComputedStyle(element).opacity !== '1').length);
  assert.equal(hiddenGroups, 0, 'Already visited groups must remain fully visible');
}
try {
  // This suite verifies the Vietnamese home contract before both language routes.
  await page.goto(origin + '/en/');
  await page.locator('[data-language="vi"]').click();
  await page.waitForURL(origin + '/');
  await page.goto(origin, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__motionChecks.filter(entry => entry.hero).length === 4);
  const heroPlayback = await page.locator('h1').evaluate(element => ({ transform: getComputedStyle(element).transform, running: element.getAnimations().some(animation => animation.playState === 'running' && animation.currentTime !== null) }));
  assert.ok(heroPlayback.running && heroPlayback.transform !== 'none', 'Hero must visibly move, not merely declare a timeline');
  record('Hero actual playback', heroPlayback);
  assert.equal(await page.locator('h1').count(), 1);
  for (const id of ids) assert.equal(await page.locator(`#${id}`).count(), 1);
  assert.equal(await page.locator('.solution-card').count(), 4);
  assert.equal(await page.locator('#consultation_form').count(), 0);
  assert.equal(await page.locator('#site_navigation a[aria-current="page"]').getAttribute('href'), '/');
  assert.ok(await page.locator('.hero .actions').evaluate(element => element.getBoundingClientRect().bottom <= innerHeight), 'Primary hero actions must fit the first desktop viewport');
  record('Home contract', 'Company overview, four solution previews, technology focus and approach lead to standalone pages');
  const font = await page.evaluate(async () => {
    await document.fonts.ready;
    await document.fonts.load('600 64px "Bricolage Grotesque"');
    return { checks: [400, 500, 600, 700].map(weight => document.fonts.check(`${weight} 18px "Bricolage Grotesque"`)), faces: [...document.fonts].map(face => ({ family: face.family, status: face.status, weight: face.weight })), heading: getComputedStyle(document.querySelector('h1')).fontFamily, body: getComputedStyle(document.body).fontFamily };
  });
  assert.ok(font.checks.every(Boolean));
  assert.ok(font.faces.some(face => face.family.includes('Bricolage Grotesque') && face.status === 'loaded'));
  assert.ok(font.heading.includes('Bricolage Grotesque'));
  assert.ok(font.body.includes('Be Vietnam Pro'), 'Approved B typography uses Be Vietnam Pro for reading text');
  for (const weight of ['400', '500', '600']) assert.ok(font.faces.some(face => face.family.includes('Be Vietnam Pro') && face.weight === weight && face.status === 'loaded'), `Real body font weight ${weight} loads without synthetic bold`);
  record('Font load', font);
  const images = await page.locator('main img').evaluateAll(elements => elements.map(element => ({ src: element.getAttribute('src'), complete: element.complete, width: element.naturalWidth, height: element.naturalHeight })));
  assert.equal(images.length, 5);
  await page.waitForFunction(() => {
    const hero = document.querySelector('main img');
    return hero.complete && hero.naturalWidth >= 360 && hero.naturalHeight >= 200;
  });
  record('Initial imagery', 'Hero decodes; lazy team, solution photography and the connection illustration are checked after scrolling');
  const hero = await page.evaluate(() => window.__motionChecks.filter(entry => entry.hero));
  assert.equal(hero.length, 4);
  assert.ok(hero.every(entry => entry.duration === 650 && entry.keyframes.some(frame => frame.transform !== 'none')));
  record('Hero entrance', hero.map(entry => ({ duration: entry.duration, keyframes: entry.keyframes })));
  await page.locator('#company_intro').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => Number(getComputedStyle(document.querySelector('.company-media')).opacity) > 0 && Number(getComputedStyle(document.querySelector('.company-media')).opacity) < 1);
  const mediaPlayback = await page.locator('.company-media').evaluate(element => ({ opacity: getComputedStyle(element).opacity, transform: getComputedStyle(element).transform }));
  record('Media actual playback', mediaPlayback);
  await page.waitForTimeout(850);
  await page.waitForFunction(() => {
    const team = document.querySelector('.team-media img');
    return team.complete && team.naturalWidth >= 360 && team.naturalHeight >= 200;
  });
  record('Team imagery', 'Lazy illustrative team photograph decodes after entering its section');
  await page.locator('#core_solutions').scrollIntoViewIfNeeded();
  await page.waitForTimeout(850);
  const reveals = await page.evaluate(() => window.__motionChecks.filter(entry => entry.reveal && entry.played > 0));
  assert.ok(reveals.some(entry => entry.reveal === 'slide'));
  assert.ok(reveals.some(entry => entry.reveal === 'rise'));
  record('Distinct scroll entrances', reveals.map(entry => ({ reveal: entry.reveal, duration: entry.duration, played: entry.played })));
  for (let cycle = 0; cycle < 2; cycle += 1) {
    await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(90);
    await page.evaluate(() => scrollTo(0, 0));
    await page.waitForTimeout(90);
  }
  await page.waitForTimeout(850);
  await assertVisibleContent();
  const playedBefore = await page.evaluate(() => window.__motionChecks.filter(entry => entry.reveal).map(entry => entry.played));
  await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(150);
  await page.evaluate(() => scrollTo(0, 0));
  assert.deepEqual(await page.evaluate(() => window.__motionChecks.filter(entry => entry.reveal).map(entry => entry.played)), playedBefore);
  record('Rapid scrolling', 'Two down/up cycles and a further cycle preserve visibility without replay');
  for (const width of [1440, 1024, 768, 390, 360, 320]) {
    await page.setViewportSize({ width, height: 960 });
    for (const route of reviewRoutes) {
      await page.goto(origin + route, { waitUntil: 'networkidle' });
      assert.equal(await page.locator('h1').count(), 1);
      const typeRoles = await page.evaluate(() => ({ headings: [...document.querySelectorAll('h1,h2,h3,h4')].every(element => getComputedStyle(element).fontFamily.includes('Bricolage Grotesque')), navigation: getComputedStyle(document.querySelector('#site_navigation a')).fontFamily, reading: getComputedStyle(document.querySelector('main p')).fontFamily, brand: getComputedStyle(document.querySelector('.wordmark')).fontFamily }));
      assert.ok(typeRoles.headings && typeRoles.brand.includes('Manrope'), `Approved Manrope logo and existing heading typography at ${route}`);
      assert.ok(await page.evaluate(() => document.fonts.check('600 24px "Manrope"') && [...document.fonts].some(face => face.family.includes('Manrope') && face.status === 'loaded')), `Real brand font loaded at ${route}`);
      assert.ok(typeRoles.navigation.includes('Be Vietnam Pro') && typeRoles.reading.includes('Be Vietnam Pro'), `Body and UI use approved B typography at ${route}`);
      assert.equal(await page.locator('#site_navigation a[aria-current="page"]').getAttribute('href'), route);
      if (width === 1440) {
        await page.mouse.move(0, 0);
        const active = page.locator('#site_navigation a[aria-current="page"]');
        const colors = link => link.evaluate(element => ({ color: getComputedStyle(element).color, background: getComputedStyle(element).backgroundColor }));
        const resting = await colors(active);
        await active.hover();
        await page.waitForTimeout(200);
        assert.deepEqual(await colors(active), resting, `Active menu colors stay readable on hover at ${route}`);
        await page.mouse.move(0, 0);
      }
      const logos = await page.locator('.brand-symbol').evaluateAll(elements => elements.map(element => ({
        decoded: element.complete && element.naturalWidth >= 192,
        width: element.getBoundingClientRect().width,
        height: element.getBoundingClientRect().height,
        decorative: element.alt === '' && element.getAttribute('aria-hidden') === 'true',
      })));
      assert.equal(logos.length, 2, `Shared brand lockups on ${route}`);
      assert.ok(logos.every(logo => logo.decoded && logo.width === logo.height && logo.width >= 32 && logo.decorative), `Crisp, square logo without duplicated accessible name on ${route} at ${width}px`);
      assert.equal(await page.locator('.wordmark').getAttribute('href'), route.startsWith('/en/') ? '/en/' : '/');
      const favicon = await page.locator('link[rel="icon"]').getAttribute('href');
      assert.equal((await page.request.get(origin + favicon)).status(), 200, `Loaded favicon on ${route}`);
      const iconIssues = await page.locator('svg.icon').evaluateAll(elements => elements.filter(element => element.getClientRects().length).filter(element => element.getAttribute('aria-hidden') !== 'true' || !element.dataset.icon || element.getBoundingClientRect().width < 16).map(element => element.dataset.icon));
      assert.ok(await page.locator('svg.icon').count() > 0, `Icon cues at ${route}`);
      assert.deepEqual(iconIssues, [], `Sourced icons must render accessibly at ${width}px on ${route}`);
      await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
      // Wait for the actual entrance completion, including stagger, under browser load.
      await page.waitForFunction(() => [...document.querySelectorAll('[data-reveal]')].every(element => getComputedStyle(element).opacity === '1'), null, { timeout: 2500 });
      const hiddenAfterScroll = await page.locator('[data-reveal]').evaluateAll(elements => elements.filter(element => getComputedStyle(element).opacity !== '1').map(element => ({ type: element.dataset.reveal, played: element.dataset.revealPlayed, top: element.getBoundingClientRect().top, bottom: element.getBoundingClientRect().bottom, opacity: getComputedStyle(element).opacity })));
      assert.deepEqual(hiddenAfterScroll, [], `Every traversed group must be visible on ${route} at ${width}px`);
      // Visit visible lazy media; Solutions and Services omit hero art on mobile.
      for (const media of await page.locator('main img:visible').all()) {
        await media.scrollIntoViewIfNeeded();
        await media.evaluate(element => element.decode());
        await page.waitForTimeout(80);
      }
      const unloadedImages = await page.locator('main img:visible').evaluateAll(elements => elements.filter(element => !element.complete || element.naturalWidth === 0).map(element => element.currentSrc || element.src));
      assert.deepEqual(unloadedImages, [], `Images must load when visited on ${route} at ${width}px`);
      await page.evaluate(() => scrollTo(0, 0));
      await page.waitForTimeout(100);
      const layout = await page.evaluate(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth, hits: [...document.querySelectorAll('a,button,summary,input,textarea')].filter(element => element.getClientRects().length).map(element => ({ label: element.textContent.trim().slice(0, 45) || element.id, width: element.getBoundingClientRect().width, height: element.getBoundingClientRect().height })) }));
      assert.ok(layout.scrollWidth <= width, `Horizontal overflow at ${width}px`);
      assert.deepEqual(layout.hits.filter(hit => hit.width < 43.5 || hit.height < 43.5), [], `Undersized hit target at ${width}px`);
      const readability = await page.evaluate(() => {
        const rgb = value => value.match(/[\d.]+/g).map(Number);
        const luminance = values => values.slice(0, 3).map(value => {
          const channel = value / 255;
          return channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4;
        }).reduce((sum, value, index) => sum + value * [.2126, .7152, .0722][index], 0);
        const background = element => {
          // The compact language pill paints its visible fill in ::before.
          // Measure that surface rather than the dark header behind the pill.
          if (element.matches('.language-switch a[aria-current="true"]')) return rgb(getComputedStyle(element, '::before').backgroundColor);
          for (let parent = element; parent; parent = parent.parentElement) {
            const color = rgb(getComputedStyle(parent).backgroundColor);
            if (color.length === 3 || color[3] === 1) return color;
          }
          return [255, 255, 255];
        };
        const elements = [...document.querySelectorAll('h1,h2,h3,p,label,a,button,summary,input,textarea')].filter(element => element.getClientRects().length);
        const ratios = elements.map(element => {
          const foreground = luminance(rgb(getComputedStyle(element).color));
          const surface = luminance(background(element));
          return (Math.max(foreground, surface) + .05) / (Math.min(foreground, surface) + .05);
        });
        return { minimumContrast: Math.min(...ratios), lowContrast: ratios.map((ratio, index) => ({ ratio, label: elements[index].textContent.trim().slice(0, 60) })).filter(item => item.ratio < 4.5), clipped: elements.filter(element => !['INPUT', 'TEXTAREA'].includes(element.tagName) && element.clientWidth > 0 && element.scrollWidth > element.clientWidth + 1).map(element => element.textContent.trim().slice(0, 60)) };
      });
      assert.ok(readability.minimumContrast >= 4.5, `Insufficient rendered text contrast at ${width}px on ${route}: ${JSON.stringify(readability.lowContrast)}`);
      assert.deepEqual(readability.clipped, [], `Clipped text at ${width}px`);
      await assertVisibleContent();
      assert.deepEqual(errors, [], `Runtime health on ${route} at ${width}px`);
      const name = route === '/' ? 'home' : route === '/en/' ? 'en-home' : route.slice(1, -1).replaceAll('/', '-');
      await page.screenshot({ path: path.join(evidenceDirectory, `${name}-${width}.png`), fullPage: true });
      record(`Viewport ${width} ${route}`, { overflow: false, interactiveTargets: layout.hits.length, minimumHitSize: 44, minimumTextContrast: readability.minimumContrast, clippedText: false, capture: path.relative(root, path.join(evidenceDirectory, `${name}-${width}.png`)).replaceAll('\\', '/') });
    }
    console.log(`PASS: 12 VI/EN routes at ${width}px`);
  }
  await page.goto(origin, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Menu', exact: true }).click();
  assert.equal(await page.getByRole('button', { name: 'Menu', exact: true }).getAttribute('aria-expanded'), 'true');
  const menuHits = await page.locator('#site_navigation a').evaluateAll(elements => elements.map(element => ({ width: element.getBoundingClientRect().width, height: element.getBoundingClientRect().height })));
  assert.ok(menuHits.every(hit => hit.width >= 44 && hit.height >= 44));
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await page.screenshot({ path: path.join(evidenceDirectory, 'menu-360.png'), fullPage: false });
  await page.keyboard.press('Escape');
  assert.equal(await page.getByRole('button', { name: 'Menu', exact: true }).getAttribute('aria-expanded'), 'false');
  assert.ok(await page.getByRole('button', { name: 'Menu', exact: true }).evaluate(element => element === document.activeElement));
  record('Compact navigation', 'Menu opens, Escape closes it and focus returns to its button');
  await page.setViewportSize({ width: 1440, height: 960 });
  for (const route of routes.slice(1)) {
    await page.locator(`#site_navigation a[href="${route}"]`).click();
    await page.waitForURL(origin + route);
    assert.equal(await page.locator('#site_navigation a[aria-current="page"]').getAttribute('href'), route);
    assert.equal(await page.locator('#site_navigation a').count(), 6);
  }
  record('Standalone navigation', 'Every menu link changes URL and active state; pages without a form run without script errors');
  await page.goto(origin + '/solutions/#cybersecurity', { waitUntil: 'networkidle' });
  assert.ok(await page.locator('#cybersecurity').evaluate(element => element.getBoundingClientRect().top < innerHeight));
  await page.goto(origin + '/services/', { waitUntil: 'networkidle' });
  assert.equal(await page.locator('[data-service]').count(), 5);
  assert.equal(await page.locator('[data-service] h2').first().textContent(), 'Tư vấn công nghệ');
  await page.goto(origin + '/products/', { waitUntil: 'networkidle' });
  assert.equal(await page.locator('#cisco .product-card').count(), 4);
  assert.equal(await page.locator('#palo-alto-networks .product-card').count(), 3);
  record('Detail pages', 'Solutions deep links resolve; consulting is the first of five services; technology shows four Cisco and three Palo Alto Networks groups');
  await page.goto(origin + '/contact/', { waitUntil: 'networkidle' });
  assert.equal(await page.locator('a[href="tel:+61433024689"]').count(), 2);
  await page.getByRole('button', { name: 'Sao chép nội dung trao đổi', exact: true }).click();
  assert.equal(await page.locator('#name').getAttribute('aria-invalid'), 'true');
  assert.equal(await page.locator('#requirement').getAttribute('aria-invalid'), 'true');
  assert.equal(await page.locator('#form_status').textContent(), '');
  await page.locator('#name').fill('Người kiểm thử');
  await page.locator('#requirement').fill('Tư vấn kết nối mạng cho văn phòng.');
  await page.locator('#email').fill('invalid');
  await page.getByRole('button', { name: 'Sao chép nội dung trao đổi', exact: true }).click();
  assert.equal(await page.locator('#email').getAttribute('aria-invalid'), 'true');
  await page.locator('#email').fill('');
  await page.getByRole('button', { name: 'Sao chép nội dung trao đổi', exact: true }).click();
  await page.waitForFunction(() => document.querySelector('#form_status').textContent === 'Đã sao chép nội dung trao đổi.');
  const clipboard = await page.evaluate(() => navigator.clipboard.readText());
  assert.ok(clipboard.includes('Người kiểm thử') && clipboard.includes('Tư vấn kết nối mạng cho văn phòng.'));
  await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: () => Promise.reject(new Error('Clipboard denied')) } }));
  await page.getByRole('button', { name: 'Sao chép nội dung trao đổi', exact: true }).click();
  await page.waitForFunction(() => !document.querySelector('#copy_fallback').hidden);
  assert.ok((await page.locator('#copy_text').inputValue()).includes('Người kiểm thử'));
  assert.ok(!(await page.locator('#form_status').textContent()).includes('Đã sao chép'));
  record('Contact preparation', 'Required fields and optional email validate; actual clipboard succeeds; denied clipboard exposes manual copy without false success');
  for (const route of routes) {
    await page.goto(origin + route, { waitUntil: 'networkidle' });
    await page.locator('[data-language="en"]').focus();
    await page.keyboard.press('Enter');
    await page.waitForURL(origin + '/en' + route);
    assert.equal(await page.locator('html').getAttribute('lang'), 'en');
    assert.equal(await page.locator('[data-language="en"]').getAttribute('aria-current'), 'true');
    assert.equal(await page.locator('#site_navigation a[aria-current="page"]').getAttribute('href'), '/en' + route);
    const destinations = await page.locator('#site_navigation a').evaluateAll(elements => elements.map(element => element.getAttribute('href')));
    assert.deepEqual(destinations, routes.map(destination => '/en' + destination));
    await page.locator('[data-language="vi"]').click();
    await page.waitForURL(origin + route);
    assert.equal(await page.locator('html').getAttribute('lang'), 'vi');
  }
  record('Bilingual switching', 'Keyboard switching on all six pages retains the page and localizes every navigation destination; Vietnamese links return to the same page');
  await page.goto(origin + '/solutions/#cybersecurity', { waitUntil: 'networkidle' });
  await page.locator('[data-language="en"]').click();
  await page.waitForURL(origin + '/en/solutions/#cybersecurity');
  await page.waitForFunction(() => document.getElementById('cybersecurity')?.getBoundingClientRect().top < innerHeight, null, { timeout: 3000 });
  assert.ok(await page.locator('#cybersecurity').evaluate(element => element.getBoundingClientRect().top < innerHeight));
  await page.goBack({ waitUntil: 'networkidle' });
  assert.equal(new URL(page.url()).pathname, '/solutions/');
  assert.equal(await page.locator('html').getAttribute('lang'), 'vi');
  record('Bilingual deep links and history', 'The selected section survives language switching and Back restores the Vietnamese page');
  await page.goto(origin + '/en/contact/', { waitUntil: 'networkidle' });
  assert.equal(await page.locator('a[href="tel:+61433024689"]').count(), 2);
  await page.getByRole('button', { name: 'Copy enquiry', exact: true }).click();
  assert.equal(await page.locator('#name_error').textContent(), 'Enter your name.');
  assert.equal(await page.locator('#requirement_error').textContent(), 'Enter your requirements.');
  await page.locator('#name').fill('Test contact');
  await page.locator('#requirement').fill('Networking for a branch office.');
  await page.locator('#email').fill('invalid');
  await page.getByRole('button', { name: 'Copy enquiry', exact: true }).click();
  assert.equal(await page.locator('#email_error').textContent(), 'Enter a valid email address.');
  await page.locator('#email').fill('');
  await page.getByRole('button', { name: 'Copy enquiry', exact: true }).click();
  await page.waitForFunction(() => document.querySelector('#form_status').textContent === 'Enquiry copied.');
  // Windows normalizes clipboard line endings; compare semantic lines with
  // the textarea, whose DOM value uses LF on all supported platforms.
  const englishClipboard = (await page.evaluate(() => navigator.clipboard.readText())).replaceAll('\r\n', '\n');
  assert.equal(englishClipboard, 'Name: Test contact\nRequirement: Networking for a branch office.');
  await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: () => Promise.reject(new Error('Clipboard denied')) } }));
  await page.getByRole('button', { name: 'Copy enquiry', exact: true }).click();
  await page.waitForFunction(() => !document.querySelector('#copy_fallback').hidden);
  assert.equal(await page.locator('#form_status').textContent(), 'Select the text below to copy it manually.');
  assert.equal(await page.locator('#copy_text').inputValue(), englishClipboard);
  assert.equal(await page.locator('#name').inputValue(), 'Test contact');
  record('English contact form', 'Field names, required and invalid-email messages, clipboard labels, success and denied-clipboard fallback are English; data survives validation and clipboard errors');
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.goto(origin, { waitUntil: 'networkidle' });
  await page.locator('#core_solutions').scrollIntoViewIfNeeded();
  await page.reload({ waitUntil: 'networkidle' });
  await assertVisibleContent();
  record('Restored scroll', { scrollY: await page.evaluate(() => scrollY), visible: true });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForTimeout(80);
  await assertVisibleContent();
  assert.equal(await page.evaluate(() => document.getAnimations().filter(animation => animation.playState === 'running').length), 0);
  await page.evaluate(() => scrollTo(0, 0));
  await page.reload({ waitUntil: 'networkidle' });
  assert.equal(await page.evaluate(() => window.__motionChecks.length), 0);
  await assertVisibleContent();
  await page.screenshot({ path: path.join(evidenceDirectory, 'reduced-motion.png'), fullPage: true });
  record('Reduced motion', 'No hero or reveal animation; all content and equivalent controls remain visible');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForTimeout(50);
  await assertVisibleContent();
  assert.equal(await page.evaluate(() => document.getAnimations().filter(animation => animation.playState === 'running').length), 0);
  record('Preference change during playback', 'Owned animations cancel and visibility restores');
  const noScriptContext = await browser.newContext({ viewport: { width: 390, height: 960 }, javaScriptEnabled: false });
  try {
    const noScriptPage = await noScriptContext.newPage();
    const submittedQueries = [];
    noScriptPage.on('request', request => { if (new URL(request.url()).search) submittedQueries.push(request.url()); });
    for (const route of reviewRoutes) {
      await noScriptPage.goto(origin + route, { waitUntil: 'networkidle' });
      assert.equal(await noScriptPage.locator('h1').count(), 1);
      assert.equal(await noScriptPage.locator('#site_navigation a:visible').count(), 6);
    }
    await noScriptPage.goto(origin + '/en/services/', { waitUntil: 'networkidle' });
    await noScriptPage.locator('[data-language="vi"]').click();
    await noScriptPage.waitForURL(origin + '/services/');
    assert.equal(await noScriptPage.locator('html').getAttribute('lang'), 'vi');
    record('Language switch without JavaScript', 'All 12 routes render native content and the language links work without scripting');
    await noScriptPage.goto(origin + '/contact/', { waitUntil: 'networkidle' });
    await noScriptPage.locator('#name').fill('Người kiểm thử');
    await noScriptPage.locator('#requirement').fill('Nhu cầu riêng tư');
    await noScriptPage.locator('#name').press('Enter');
    await noScriptPage.waitForTimeout(200);
    assert.deepEqual(submittedQueries, [], 'A script failure must never send form values in a GET request');
    assert.equal(await noScriptPage.locator('#site_navigation a:visible').count(), 6);
    assert.equal(await noScriptPage.locator('a[href="tel:+61433024689"]:visible').count(), 2);
    record('Script failure fallback', 'Content, navigation and phone links stay available; Enter does not transmit personal form values');
  } finally { await noScriptContext.close(); }
  assert.deepEqual(errors, []);
  assert.deepEqual(missing, []);
  record('Runtime health', 'No page errors or missing resources');
  await fs.writeFile(path.join(evidenceDirectory, 'checks.json'), JSON.stringify({ checkedAt: new Date().toISOString(), checks, limitations: ['No UI mockup was supplied. Captures verify the implemented document-led layout, not pixel fidelity to an unavailable reference.'] }, null, 2));
  console.log(`PASS: ${checks.length} browser checks. Evidence: ${path.relative(root, evidenceDirectory)}/checks.json`);
} finally {
  await context.close();
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
