import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { startServer } from '../../../scripts/serve.mjs';

const directory = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const { chromium } = require(path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const server = await startServer({ port: 0, host: '127.0.0.1' });
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(origin, { waitUntil: 'networkidle' });
  await page.locator('.site-header').screenshot({ path: path.join(directory, 'header-desktop.png') });
  await page.locator('.site-footer').screenshot({ path: path.join(directory, 'footer-desktop.png') });
  for (const width of [390,320]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto(origin, { waitUntil: 'networkidle' });
    await page.locator('.site-header').screenshot({ path: path.join(directory, `header-${width}.png`) });
    await page.locator('.site-footer').screenshot({ path: path.join(directory, `footer-${width}.png`) });
  }
  const encoded = {};
  for (const name of ['pay-orbit-logo-on-light.svg','pay-orbit-logo-on-dark.svg']) encoded[name] = `data:image/svg+xml;base64,${(await fs.readFile(path.resolve(directory,'../../../public/assets/brand',name))).toString('base64')}`;
  const svgFile = name => encoded[name];
  const html = `<!doctype html><html lang="vi"><meta charset="utf-8"><title>PAY ORBIT — Logo đã chốt</title><style>*{box-sizing:border-box}body{margin:0;font:16px 'Segoe UI',sans-serif;background:#F2F7FF;color:#0D1218;padding:28px 40px}h1{font-size:24px;margin:0 0 8px}p{margin:0 0 22px;color:#484D55}.tile{display:flex;align-items:center;justify-content:center;height:190px;background:#FCFDFF;border-radius:10px;margin-top:16px}.tile.dark{background:#02060F}.tile img{width:660px;max-width:85%;height:auto}</style><h1>PAY ORBIT / Logo đã chốt</h1><p>Biểu tượng Relay · Manrope 600 · Tông xanh hiện tại</p><div class="tile"><img src="${svgFile('pay-orbit-logo-on-light.svg')}" alt="PAY ORBIT trên nền sáng"></div><div class="tile dark"><img src="${svgFile('pay-orbit-logo-on-dark.svg')}" alt="PAY ORBIT trên nền tối"></div></html>`;
  await page.setViewportSize({ width: 1080, height: 540 });
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.evaluate(async () => Promise.all([...document.images].map(img => img.decode())));
  await page.screenshot({ path: path.join(directory,'approved-logo.png'), fullPage:true });
  await fs.writeFile(path.join(directory,'approved-logo.html'),html);
  console.log('Captured approved logo and real website header/footer at desktop, 390px, 320px.');
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
