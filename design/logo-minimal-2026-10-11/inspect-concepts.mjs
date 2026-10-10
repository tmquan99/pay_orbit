import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const directory = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const { chromium } = require(path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(path.join(directory, 'tests.html')).href);
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map(img => img.decode()));
  });
  const sections = page.locator('.concept');
  const count = await sections.count();
  for (let index = 0; index < count; index++) {
    await sections.nth(index).screenshot({ path: path.join(directory, `tests-${index + 1}.png`) });
  }
  console.log(`Rendered ${count} test panels: scales, reversed, blur, mirror, rotation, and UI contexts.`);

  const artwork = {};
  for (const key of ['a', 'b', 'c']) {
    artwork[key] = {};
    for (const kind of ['symbol', 'lockup']) {
      artwork[key][kind] = await fs.readFile(path.join(directory, `concept-${key}-${kind}-v2.svg`), 'utf8');
    }
  }
  const data = raw => `data:image/svg+xml;base64,${Buffer.from(raw).toString('base64')}`;
  const colored = (raw, color) => data(raw.replaceAll('#101820', color));
  const cards = ['a', 'b', 'c'].map((key, i) => `<article><small>${['A — Relay · đề xuất', 'B — Twin pillars', 'C — Quiet wordmark'][i]}</small><img class="mark" src="${colored(artwork[key].symbol, '#4098FF')}" alt=""><img class="lockup" src="${colored(artwork[key].lockup, '#E5ECF6')}" alt="PAY ORBIT"></article>`).join('');
  // The real lockup is shown in the header as one vector; keep a matching icon-to-type ratio.
  const previewHeader = light => `<div class="header ${light ? 'light' : ''}"><img class="full" src="${colored(artwork.a.lockup, light ? '#1768E8' : '#4098FF')}" alt="PAY ORBIT"><nav>Giới thiệu <span>Giải pháp</span> Dịch vụ <span>Sản phẩm</span></nav><b>Liên hệ ↗</b></div>`;
  const html = `<!doctype html><html lang="vi"><meta charset="utf-8"><title>PAY ORBIT · Thử tông xanh</title><style>*{box-sizing:border-box}body{margin:0;background:#F2F7FF;color:#0D1218;font:16px/1.5 'Segoe UI',sans-serif}.wrap{padding:36px 40px}h1{font-size:27px;margin:0 0 5px}p{margin:0 0 26px;color:#484D55}.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}article{background:#02060F;padding:20px 22px 26px;border-radius:12px;color:#E5ECF6}small{font-size:14px}.mark{display:block;width:124px;height:124px;margin:24px auto}.lockup{display:block;width:100%;height:68px;object-fit:contain}h2{font-size:18px;margin:30px 0 12px}.header{display:flex;align-items:center;gap:20px;padding:10px 28px;background:#02060F;color:#E5ECF6;min-height:78px;margin-top:12px;border-radius:8px}.header.light{background:#FCFDFF;color:#0D1218;border:1px solid #CFD8E5}.header .full{width:228px;height:48px;object-fit:contain}.header nav{margin-left:auto;display:flex;gap:26px;font-size:14px}.header b{font-size:14px;padding:10px 18px;border:1px solid #606A78;border-radius:6px;font-weight:500}</style><div class="wrap"><h1>PAY ORBIT / Thử với tông xanh hiện tại</h1><p>Màu phẳng · SVG hình học · Ba hướng để chọn</p><div class="cards">${cards}</div><h2>A — Relay trong thanh điều hướng</h2>${previewHeader(false)}${previewHeader(true)}</div></html>`;
  await fs.writeFile(path.join(directory, 'color-preview.html'), html);
  await page.setViewportSize({ width: 1280, height: 760 });
  await page.setContent(html, { waitUntil: 'load' });
  await page.evaluate(async () => Promise.all([...document.images].map(img => img.decode())));
  await page.screenshot({ path: path.join(directory, 'color-preview.png'), fullPage: true });
  console.log('Rendered color-preview.png using existing website blue colors.');
} finally {
  await browser.close();
}
