import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const data = JSON.parse(await fs.readFile(new URL('../content/services.json', import.meta.url), 'utf8'));
const html = await fs.readFile(new URL('../services/index.html', import.meta.url), 'utf8');
const normalize = value => value.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/<\/?strong>/g, '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
const text = normalize(html);
assert.equal(data.source.sheet, '04_Services.');
assert.equal(data.services.length, 5);
assert.ok(text.includes(normalize(data.intro.description)), 'The complete new Services introduction remains available');
for (const item of data.services) {
  assert.ok(html.includes(`id="${item.id}"`), `Direct service anchor: ${item.id}`);
  assert.ok(text.includes(item.title), `New service title: ${item.title}`);
  assert.ok(text.includes(item.cta), `Workbook CTA: ${item.cta}`);
  for (const paragraph of item.paragraphs) assert.ok(text.includes(normalize(paragraph)), `Complete source paragraph for ${item.title}`);
  for (const area of item.keyAreas) assert.ok(text.includes(area), `Key area retained: ${area}`);
}
assert.ok(!text.includes('Product Supply'), 'Supply is no longer a primary Services section');
assert.ok(!html.includes('data-service-controls'), 'The approved vertical design has no carousel controls');
console.log('PASS: complete revised Services copy, five consultation CTAs, all key areas and native anchors');
