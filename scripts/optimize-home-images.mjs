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
const directory = 'public/assets/images';
const sources = ['hero_infrastructure_photo', 'company_infrastructure_photo', 'infrastructure-team-illustration', 'enterprise-ecosystem', 'digital-infrastructure-protection'];
const webImages = [];
for (const name of sources) {
  const source = `${directory}/${name}.png`;
  for (const width of [null, 720]) {
    const destination = `${directory}/${name}${width ? '-720' : ''}.webp`;
    let pipeline = sharp(path.join(root, source));
    if (width) pipeline = pipeline.resize({ width, withoutEnlargement: true });
    const info = await pipeline.webp({ quality: 82, effort: 5 }).toFile(path.join(root, destination));
    const bytes = await fs.readFile(path.join(root, destination));
    webImages.push({ source, destination, quality: 82, width: info.width, height: info.height, bytes: bytes.length, sha256: crypto.createHash('sha256').update(bytes).digest('hex') });
  }
}
const ledgerPath = path.join(root, 'content/visual-assets.json');
const ledger = JSON.parse(await fs.readFile(ledgerPath, 'utf8'));
ledger.webImages = webImages;
await fs.writeFile(ledgerPath, JSON.stringify(ledger, null, 2) + '\n');
console.log(`Exported ${webImages.length} WebP files; full-size Home imagery: ${Math.round(webImages.filter(image => !image.destination.includes('-720.')).reduce((sum, image) => sum + image.bytes, 0) / 1024)} KiB`);
