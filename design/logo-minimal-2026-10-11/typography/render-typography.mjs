import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const { chromium } = require(path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const markRaw = await fs.readFile(path.join(root, '../concept-a-symbol-v2.svg'), 'utf8');
const mark = color => `data:image/svg+xml;base64,${Buffer.from(markRaw.replaceAll('#101820', color)).toString('base64')}`;
const faces = [
  ['Manrope', 'fonts/manrope/Manrope[wght].ttf'],
  ['Plus Jakarta Sans', 'fonts/plusjakartasans/PlusJakartaSans[wght].ttf'],
  ['Sora', 'fonts/sora/Sora[wght].ttf'],
  ['Bricolage Grotesque', '../../../public/assets/fonts/bricolage-grotesque/BricolageGrotesque-Variable.ttf'],
];
const fonts = faces.map(([name, relative]) => `@font-face{font-family:'${name}';src:url('${pathToFileURL(path.resolve(root, relative)).href}');font-weight:200 800;font-display:block}`).join('');
const base = `${fonts}*{box-sizing:border-box}body{margin:0;background:#F2F7FF;color:#0D1218;font:16px/1.5 'Segoe UI',sans-serif}img{display:block}.brand{display:flex;align-items:center;gap:18px;white-space:nowrap}.brand img{flex:none;object-fit:contain}.word{font-family:var(--family);font-weight:var(--weight);letter-spacing:var(--tracking);font-kerning:normal;font-optical-sizing:auto;font-synthesis:none;line-height:1.15}.pay{margin-right:var(--word-gap,0px)}h1,h2,p{margin:0}`;
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
try {
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 }, deviceScaleFactor: 1 });
  const screenshot = async (name, html) => {
    const file = path.join(root, `${name}.html`);
    await fs.writeFile(file, html);
    await page.goto(pathToFileURL(file).href, { waitUntil: 'load' });
    const loaded = await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all([...document.images].map(img => img.decode()));
      return [...document.fonts].filter(face => face.status === 'loaded').map(face => face.family);
    });
    if (loaded.length < 3) throw new Error(`Font loading failed: ${loaded}`);
    console.log(`${name}: real fonts loaded: ${loaded.join(', ')}`);
    await page.screenshot({ path: path.join(root, `${name}.png`), fullPage: true });
    return loaded;
  };

  const studyRows = faces.flatMap(([family]) => [450, 550, 650].flatMap(weight => ['PAY ORBIT', 'PayOrbit'].map(text => `<article style="--family:'${family}';--weight:${weight};--tracking:${text === 'PAY ORBIT' ? '.015em' : '-.035em'}"><small>${family} / ${weight} / ${text === 'PAY ORBIT' ? 'uppercase' : 'title case'}</small><div class="brand"><img width="52" height="52" src="${mark('#1768E8')}" alt=""><span class="word">${text}</span></div></article>`))).join('');
  await screenshot('type-study', `<!doctype html><html lang="vi"><meta charset="utf-8"><title>PAY ORBIT — 24 type studies</title><style>${base}.wrap{padding:40px}h1{font-size:28px}p{color:#484D55;margin:5px 0 26px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}article{background:#FCFDFF;border:1px solid #CFD8E5;border-radius:10px;padding:18px 24px}small{font-size:13px;color:#484D55}.brand{margin-top:16px}.word{font-size:44px}</style><div class="wrap"><h1>PAY ORBIT / Nghiên cứu typography</h1><p>Giữ biểu tượng A · 4 font × 3 độ đậm × 2 cách viết</p><div class="grid">${studyRows}</div></div></html>`);

  const choices = [
    { id: '01', family: 'Manrope', weight: 600, tracking: '.015em', gap: '15px', casing: 'upper', title: 'Gọn & vững', note: 'Đề xuất · Chữ đầy đặn, nét rõ, khoảng cách vừa đủ.', recommended: true },
    { id: '02', family: 'Plus Jakarta Sans', weight: 600, tracking: '-.04em', gap: '0px', casing: 'title', title: 'Mềm & hiện đại', note: 'PayOrbit · Chữ hoa–thường, nhịp chữ liền mạch.' },
    { id: '03', family: 'Sora', weight: 500, tracking: '.075em', gap: '17px', casing: 'upper', title: 'Thoáng & kỹ thuật', note: 'PAY ORBIT · Khoảng chữ rộng hơn, cảm giác chính xác.' },
  ];
  const word = choice => choice.casing === 'title' ? 'PayOrbit' : '<span class="pay">PAY</span><span>ORBIT</span>';
  const brand = (choice, small=false) => `<div class="brand ${small ? 'small' : ''}"><img src="${mark(small ? '#4098FF' : '#1768E8')}" alt=""><span class="word">${word(choice)}</span></div>`;
  const cards = choices.map(choice => `<article class="choice ${choice.recommended ? 'recommended' : ''}" style="--family:'${choice.family}';--weight:${choice.weight};--tracking:${choice.tracking};--word-gap:${choice.gap}"><div class="meta"><h2>${choice.id} — ${choice.title}</h2><span>${choice.family} · ${choice.weight}</span></div>${brand(choice)}<div class="bottom"><p>${choice.note}</p><div class="header-preview">${brand(choice,true)}<span class="menu">Menu ☰</span></div></div></article>`).join('');
  await page.setViewportSize({ width: 1280, height: 1100 });
  const loaded = await screenshot('typography-options-v1', `<!doctype html><html lang="vi"><meta charset="utf-8"><title>PAY ORBIT — Typography mới</title><style>${base}.wrap{padding:34px 40px 40px}h1{font-size:28px;letter-spacing:-.02em}.intro{margin:6px 0 26px;color:#484D55}.choice{background:#FCFDFF;border:1px solid #CFD8E5;padding:24px 30px;margin-top:18px;border-radius:12px}.choice.recommended{border:2px solid #1768E8;padding:23px 29px}.meta{display:flex;justify-content:space-between;align-items:center}.meta h2{font-size:19px}.meta>span{font-size:13px;color:#606A78}.brand{margin:24px 0 30px;gap:20px}.brand img{width:94px;height:94px}.word{font-size:72px}.bottom{display:grid;grid-template-columns:1fr 420px;gap:24px;align-items:center}.bottom p{font-size:14px;color:#484D55}.header-preview{padding:12px 16px;background:#02060F;border-radius:7px;display:flex;justify-content:space-between;align-items:center;color:#E5ECF6}.brand.small{margin:0;gap:8px;--word-gap:5px}.brand.small img{width:32px;height:32px}.brand.small .word{font-size:22px}.menu{font-size:12px;color:#999FA8}</style><div class="wrap"><h1>PAY ORBIT / Typography mới cho biểu tượng A</h1><p class="intro">Cùng một biểu tượng · Ba cách xử lý chữ · Có bản xem ở kích thước header</p>${cards}</div></html>`);
  const overflow = await page.evaluate(() => [...document.querySelectorAll('.choice,.header-preview,.brand')].filter(el => el.scrollWidth > el.clientWidth + 1).map(el => el.className));
  if (overflow.length) throw new Error(`Overflow: ${overflow.join(', ')}`);
  const report = { symbol: '../concept-a-symbol-v2.svg', unchangedSymbol: true, fontsLoaded: loaded, typeStudies: 24, choices, horizontalOverflow: overflow, stage: 'Typography exploration; live font rendering in HTML, not final outlined SVG artwork.', license: 'Downloaded fonts include SIL OFL license files alongside the fonts.', websiteModified: false };
  await fs.writeFile(path.join(root, 'review.json'), JSON.stringify(report,null,2)+'\n');
  console.log('Saved typography comparison, 24-type study, and review.json; no overflow.');
} finally {
  await browser.close();
}
