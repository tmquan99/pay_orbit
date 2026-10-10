import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import { gunzipSync } from 'node:zlib';

// Pin the official npm distribution; static hosting needs no bundler or runtime CDN.
const version = '1.3.26';
const registry = `https://registry.npmjs.org/lenis/${version}`;
const metadataResponse = await fetch(registry);
assert.ok(metadataResponse.ok, `Cannot fetch ${registry}`);
const metadata = await metadataResponse.json();
const archiveResponse = await fetch(metadata.dist.tarball);
assert.ok(archiveResponse.ok, 'Cannot download Lenis package');
const archive = Buffer.from(await archiveResponse.arrayBuffer());
assert.equal(`sha512-${createHash('sha512').update(archive).digest('base64')}`, metadata.dist.integrity, 'Package integrity must match npm metadata');
const tar = gunzipSync(archive);
const wanted = new Map([
  ['package/dist/lenis.mjs', 'lenis.js'],
  ['package/dist/lenis.css', 'lenis.css'],
  ['package/LICENSE', 'LICENSE'],
]);
const destination = new URL('../public/assets/vendor/lenis/', import.meta.url);
await fs.mkdir(destination, { recursive: true });
const files = [];
for (let offset = 0; offset + 512 <= tar.length;) {
  const name = tar.subarray(offset, offset + 100).toString().replace(/\0.*$/, '');
  if (!name) break;
  const size = parseInt(tar.subarray(offset + 124, offset + 136).toString().replace(/\0.*$/, '').trim(), 8) || 0;
  const filename = wanted.get(name);
  if (filename) {
    const bytes = tar.subarray(offset + 512, offset + 512 + size);
    await fs.writeFile(new URL(filename, destination), bytes);
    files.push({ path: `public/assets/vendor/lenis/${filename}`, sha256: createHash('sha256').update(bytes).digest('hex') });
    wanted.delete(name);
  }
  offset += 512 + Math.ceil(size / 512) * 512;
}
assert.equal(wanted.size, 0, 'All expected package files must exist');
await fs.writeFile(new URL('provenance.json', destination), JSON.stringify({ package: 'lenis', version, source: registry, tarball: metadata.dist.tarball, integrity: metadata.dist.integrity, license: 'MIT', files }, null, 2) + '\n');
console.log(`Vendored official Lenis ${version}, verified npm integrity and retained MIT license`);
