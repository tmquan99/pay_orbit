import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
let sharp;
try { sharp = require('sharp'); }
catch { sharp = require(path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp')); }
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ledgerPath = path.join(root, 'content/visual-assets.json');
const ledger = JSON.parse(await fs.readFile(ledgerPath, 'utf8'));
const prompts = JSON.parse(await fs.readFile(path.join(root, 'design/home-a-mockup-2026-10-12/asset-prompts.json'), 'utf8'));
const sources = [...prompts.assets, prompts.companyCorner];
ledger.images = ledger.images.filter(asset => !asset.id.startsWith('home-a-'));
ledger.webImages = ledger.webImages.filter(asset => !path.basename(asset.destination).startsWith('home-a-'));
for (const asset of sources) {
  const source = asset.path;
  const bytes = await fs.readFile(path.join(root, source));
  const metadata = await sharp(bytes).metadata();
  ledger.images.push({ id: path.basename(source, '.png'), purpose: 'Home A conceptual illustration; not an actual company project', destination: source, source: { kind: 'generated', tool: 'image_gen.imagegen', reference: asset.generatedSource }, prompt: asset.prompt, metadata: { width: metadata.width, height: metadata.height, bytes: bytes.length, sha256: crypto.createHash('sha256').update(bytes).digest('hex') } });
  for (const width of [null, 720]) {
    const destination = source.replace('.png', `${width ? '-720' : ''}.webp`);
    let pipeline = sharp(bytes);
    if (width) pipeline = pipeline.resize({ width, withoutEnlargement: true });
    const info = await pipeline.webp({ quality: 88, effort: 5 }).toFile(path.join(root, destination));
    const output = await fs.readFile(path.join(root, destination));
    ledger.webImages.push({ source, destination, quality: 88, width: info.width, height: info.height, bytes: output.length, sha256: crypto.createHash('sha256').update(output).digest('hex') });
  }
}
await fs.writeFile(ledgerPath, JSON.stringify(ledger, null, 2) + '\n');
console.log('Exported six Home A WebP images and recorded PNG/WebP provenance');
