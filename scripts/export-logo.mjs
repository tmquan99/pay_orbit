import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { startServer } from './serve.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
let chromium;
for (const candidate of ['playwright', path.join(process.env.USERPROFILE || '', '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')]) {
  try { ({ chromium } = require(candidate)); break; } catch {}
}
assert.ok(chromium, 'Use the available browser runtime to export the actual brand font');
const server = await startServer({ port: 0, host: '127.0.0.1', directory: '.' });
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
try {
  const page = await browser.newPage({ viewport: { width: 1600, height: 700 }, deviceScaleFactor: 2 });
  await page.goto(origin);
  await page.setContent(`<!doctype html><html><head><style>
    @font-face { font-family: 'Bricolage Grotesque'; src: url('${origin}/assets/fonts/bricolage-grotesque/BricolageGrotesque-Variable.ttf') format('truetype'); font-weight: 200 800; font-style: normal; }
    html, body { margin: 0; background: transparent; }
    .logo-export { width: fit-content; display: inline-flex; align-items: center; gap: 48px; padding: 32px; color: #0D1218; font: 700 96px/1 'Bricolage Grotesque'; font-synthesis: none; letter-spacing: .035em; white-space: nowrap; }
    img { width: 160px; height: 160px; object-fit: contain; }
  </style></head><body><div class="logo-export"><img src="${origin}/assets/brand/pay-orbit-mark.png" alt=""><span>PAY ORBIT</span></div></body></html>`, { waitUntil: 'networkidle' });
  const font = await page.evaluate(async () => {
    await document.fonts.ready;
    return { loaded: document.fonts.check('700 96px "Bricolage Grotesque"'), faces: [...document.fonts].map(face => ({ family: face.family, status: face.status })) };
  });
  assert.ok(font.loaded && font.faces.some(face => face.family === 'Bricolage Grotesque' && face.status === 'loaded'));
  assert.ok(await page.locator('img').evaluate(element => element.complete && element.naturalWidth > 0));
  const destination = path.join(root, 'public/assets/brand');
  await fs.mkdir(destination, { recursive: true });
  for (const [variant, color] of [['on-light', '#0D1218'], ['on-dark', '#E5ECF6']]) {
    await page.locator('.logo-export').evaluate((element, value) => { element.style.color = value; }, color);
    await page.locator('.logo-export').screenshot({ path: path.join(destination, `pay-orbit-logo-${variant}.png`), omitBackground: true });
    console.log(`Exported public/assets/brand/pay-orbit-logo-${variant}.png with the loaded Bricolage Grotesque font`);
  }
  // Export the same native image frame at web sizes, retaining the full-size
  // generated source separately and preserving the transparent background.
  for (const [name, size] of [['pay-orbit-mark-web', 96], ['pay-orbit-favicon', 32]]) {
    await page.locator('img').evaluate((element, pixels) => {
      element.style.width = `${pixels}px`;
      element.style.height = `${pixels}px`;
    }, size);
    await page.locator('img').screenshot({ path: path.join(destination, `${name}.png`), omitBackground: true });
    console.log(`Exported public/assets/brand/${name}.png at ${size * 2}x${size * 2}`);
  }
  await page.close();
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
