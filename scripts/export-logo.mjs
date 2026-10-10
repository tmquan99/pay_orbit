import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
let sharp;
for (const candidate of ['sharp', path.join(process.env.USERPROFILE || '', '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp')]) {
  try { sharp = require(candidate); break; } catch {}
}
if (!sharp) throw new Error('Logo PNG export requires sharp in the development environment. SVG website assets need no runtime dependency.');
const destination = path.join(root, 'public/assets/brand');
const relative = file => path.relative(root, file).replaceAll('\\', '/');
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const raster = async (source, name, width, height) => {
  const pipeline = sharp(path.join(destination, source)).resize(width, height, { fit: 'contain', background: '#00000000' }).ensureAlpha().png();
  const output = path.join(destination, name);
  await pipeline.toFile(output);
  const data = await fs.readFile(output);
  const meta = await sharp(data).metadata();
  return { path: relative(output), width: meta.width, height: meta.height, bytes: data.length, sha256: digest(data), background: 'transparent' };
};

const symbol = await raster('pay-orbit-mark.svg', 'pay-orbit-mark.png', 1024, 1024);
const lockups = [];
for (const variant of ['on-light', 'on-dark']) lockups.push(await raster(`pay-orbit-logo-${variant}.svg`, `pay-orbit-logo-${variant}.png`, 1600));
const webAssets = [
  await raster('pay-orbit-mark.svg', 'pay-orbit-mark-web.png', 192, 192),
  await raster('pay-orbit-favicon.svg', 'pay-orbit-favicon.png', 64, 64),
];
for (const size of [16, 32, 48]) await raster('pay-orbit-favicon.svg', `favicon-${size}.png`, size, size);
for (const [name, size] of [['apple-touch-icon',180], ['icon-192',192], ['icon-512',512], ['maskable-512',512]]) await raster(name === 'maskable-512' || name === 'apple-touch-icon' ? 'pay-orbit-maskable.svg' : 'pay-orbit-app-icon.svg', `${name}.png`, size, size);
const pngFrames = await Promise.all([16,32,48].map(size => fs.readFile(path.join(destination, `favicon-${size}.png`))));
const icoHeader = Buffer.alloc(6 + pngFrames.length*16);
icoHeader.writeUInt16LE(1,2); icoHeader.writeUInt16LE(pngFrames.length,4);
let offset = icoHeader.length;
pngFrames.forEach((frame, index) => {
  const entry = 6 + index*16; const size = [16,32,48][index];
  icoHeader[entry] = size; icoHeader[entry+1] = size;
  icoHeader.writeUInt16LE(1,entry+4); icoHeader.writeUInt16LE(32,entry+6);
  icoHeader.writeUInt32LE(frame.length,entry+8); icoHeader.writeUInt32LE(offset,entry+12);
  offset += frame.length;
});
await fs.writeFile(path.join(destination,'favicon.ico'),Buffer.concat([icoHeader,...pngFrames]));
await fs.writeFile(path.join(destination,'site.webmanifest'), JSON.stringify({
  name:'PAY ORBIT', short_name:'PAY ORBIT', start_url:'/', display:'browser', background_color:'#02060F', theme_color:'#02060F',
  icons:[{src:'/assets/brand/icon-192.png',sizes:'192x192',type:'image/png'},{src:'/assets/brand/icon-512.png',sizes:'512x512',type:'image/png'},{src:'/assets/brand/maskable-512.png',sizes:'512x512',type:'image/png',purpose:'maskable'}]
},null,2)+'\n');
const vectorAssets = [];
for (const file of (await fs.readdir(destination)).filter(name => name.endsWith('.svg')).sort()) {
  const full = path.join(destination,file); const data = await fs.readFile(full);
  vectorAssets.push({path:relative(full),bytes:data.length,sha256:digest(data)});
}
const ledger = {
  version:2, name:'PAY ORBIT', approved:'2026-10-11: Biểu tượng A Relay và typography 01 Manrope 600.',
  decision:'Hai nhánh kết nối phẳng màu xanh; tên PAY ORBIT bằng Manrope 600, tracking .015em, chữ SVG đã outline.',
  symbol:{...symbol,kind:'original geometric vector rendered to transparent PNG',source:'public/assets/brand/pay-orbit-mark.svg',transparent:true},
  lockups, webAssets, vectorAssets,
  typesetting:{family:'Manrope',weight:600,trackingEm:.015,wordGapEm:15/72,method:'Static Manrope 600 shaped with HarfBuzz and outlined with fontTools',font:'public/assets/fonts/manrope/Manrope-600-brand.woff2',license:'public/assets/fonts/manrope/OFL.txt',exportScript:'scripts/export-logo.mjs',vectorBuildScript:'scripts/build-logo-vectors.py'},
  colors:{lightBlue:'#1768E8',darkBlue:'#4098FF',lightText:'#0D1218',darkText:'#E5ECF6',darkBackground:'#02060F'},
  websiteUse:['Shared header and footer on all 12 VI/EN routes','SVG favicon with PNG fallback, Apple touch icon, webmanifest'],
};
await fs.writeFile(path.join(root,'content/brand-assets.json'),JSON.stringify(ledger,null,2)+'\n');
console.log(`Exported ${vectorAssets.length} outlined SVG masters, transparent PNG logo variants, icon set and provenance.`);
