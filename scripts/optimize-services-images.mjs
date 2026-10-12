import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const sharp = require(path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp'));
const ledgerPath = 'content/visual-assets.json';
const ledger = JSON.parse(await fs.readFile(ledgerPath,'utf8'));
const sources = (await Promise.all(['hero-deployment','network-support','security-design'].map(async name => JSON.parse(await fs.readFile('design/services-editorial-2026-10-12/assets-'+name+'.json','utf8')).assets))).flat();
ledger.images = ledger.images.filter(asset => !asset.id.startsWith('services-editorial-'));
ledger.webImages = ledger.webImages.filter(asset => !path.basename(asset.destination).startsWith('services-editorial-'));
for (const asset of sources) {
 const bytes = await fs.readFile(asset.path);
 const meta = await sharp(bytes).metadata();
 ledger.images.push({id:path.basename(asset.path,'.png'), purpose:'Services editorial illustration; conceptual imagery, not actual customer projects',destination:asset.path,source:{kind:'generated',tool:'image_gen.imagegen',reference:asset.generatedSource},prompt:asset.prompt,metadata:{width:meta.width,height:meta.height,bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex')}});
 for (const width of [null,720]) {
  const destination = asset.path.replace('.png', (width ? '-720' : '')+'.webp');
  let pipeline=sharp(bytes);
  if(width) pipeline=pipeline.resize({width,withoutEnlargement:true});
  const info=await pipeline.webp({quality:88,effort:5}).toFile(destination);
  const output=await fs.readFile(destination);
  ledger.webImages.push({source:asset.path,destination,quality:88,width:info.width,height:info.height,bytes:output.length,sha256:crypto.createHash('sha256').update(output).digest('hex')});
 }
}
await fs.writeFile(ledgerPath,JSON.stringify(ledger,null,2)+'\n');
console.log('Exported six Services WebP images and recorded PNG/WebP provenance');
