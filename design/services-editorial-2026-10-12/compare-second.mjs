import { createRequire } from 'node:module'; const sharp=createRequire(import.meta.url)('C:/Users/tmq/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const dir='design/services-editorial-2026-10-12/';
const ref=await sharp(dir+'selected-mockup.png').resize({width:720}).png().toBuffer();
const impl=await sharp(dir+'implementation-second.png').resize({width:720}).png().toBuffer();
const a=await sharp(ref).metadata(),b=await sharp(impl).metadata();
await sharp({create:{width:1440,height:Math.max(a.height,b.height),channels:3,background:'#ddd'}}).composite([{input:ref,left:0,top:0},{input:impl,left:720,top:0}]).png().toFile(dir+'comparison-second.png');
