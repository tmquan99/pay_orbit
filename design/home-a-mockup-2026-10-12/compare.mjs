// Normalize evidence only; source mockups and generated assets stay untouched.
import { createRequire } from 'node:module';
import path from 'node:path';
const require = createRequire(import.meta.url);
const sharp = require(path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp'));
const directory = path.dirname(new URL(import.meta.url).pathname).replace(/^\/(\w:)/, '$1');
const [kind = 'desktop', state = 'initial'] = process.argv.slice(2);
const width = kind === 'desktop' ? 804 : 390;
const source = await sharp(path.join(directory, `home-a-${kind}.png`)).resize({ width }).png().toBuffer();
let implementation = await sharp(path.join(directory, 'verification', `${kind}-${state}.jpg`)).resize({ width }).png().toBuffer();
if (kind === 'mobile') implementation = await sharp(implementation).extract({left:0,top:0,width,height:1200}).png().toBuffer();
const sm = await sharp(source).metadata();
const im = await sharp(implementation).metadata();
await sharp({ create: { width: width * 2 + 16, height: Math.max(sm.height, im.height), channels: 3, background: '#dce7f4' } }).composite([{input:source,left:0,top:0},{input:implementation,left:width+16,top:0}]).png().toFile(path.join(directory,'verification',`${kind}-${state}-comparison.png`));
console.log(JSON.stringify({kind,state,source:{width:sm.width,height:sm.height},implementation:{width:im.width,height:im.height}}));
if (kind === 'desktop' && state === 'final') {
  const left = await sharp(source).extract({left:0,top:748,width:804,height:400}).png().toBuffer();
  const right = await sharp(implementation).extract({left:0,top:732,width:804,height:400}).png().toBuffer();
  await sharp({create:{width:1624,height:400,channels:3,background:'#dce7f4'}}).composite([{input:left,left:0,top:0},{input:right,left:820,top:0}]).png().toFile(path.join(directory,'verification','desktop-solutions-comparison.png'));
}
