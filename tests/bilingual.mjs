import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer } from '../scripts/serve.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const site = process.env.TEST_DIST === '1' ? path.join(root, 'dist') : root;
const workbook = JSON.parse(await fs.readFile(path.join(root, 'content/workbook.json'), 'utf8'));
const routes = ['/', '/about/', '/solutions/', '/services/', '/products/', '/contact/'];
const coverage = [
  ['/', '01_Home', [5, 7, 8]],
  ['/about/', '02_Company_Intro', [5, 6, 7, 8, 9]],
  ['/solutions/', '03_Solutions', [5, 6, 7, 8]],
  ['/services/', '04_Services', [5, 6, 7, 8, 9]],
  ['/products/', '05_Products_Tech', [5, 6, 7, 8, 9, 10, 11]],
  ['/contact/', '06_Contact', [5, 6, 7, 8]],
];
const normalize = text => text.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
const localized = (route, language) => language === 'en' ? `/en${route}` : route;
const pages = new Map();
for (const language of ['vi', 'en']) {
  for (const route of routes) {
    const url = localized(route, language);
    const html = await fs.readFile(path.join(site, url.slice(1), 'index.html'), 'utf8').catch(() => null);
    assert.ok(html, `Missing ${language} counterpart at ${url}`);
    pages.set(url, html);
    assert.ok(html.includes(`<html lang="${language}">`), `Document language at ${url}`);
    assert.equal((html.match(/<h1\b/g) || []).length, 1);
    for (const alternate of ['vi', 'en']) {
      const destination = localized(route, alternate);
      assert.ok(html.includes(`hreflang="${alternate}" href="${destination}"`), `Search alternate ${alternate} on ${url}`);
      assert.ok(html.includes(`data-language="${alternate}" href="${destination}"`), `Same-page language switch ${alternate} on ${url}`);
    }
    assert.ok(html.includes('aria-label="English"'));
    assert.ok(!html.includes('[To be updated]') && !html.includes('[Cập nhật sau]'));
    for (const destination of routes) assert.ok(html.includes(`href="${localized(destination, language)}"`), `Same-language menu from ${url}`);
    const column = language === 'en' ? 'B' : 'C';
    for (const [sourceRoute, sheet, rows] of coverage.filter(([sourceRoute]) => sourceRoute === route)) {
      for (const row of rows) assert.ok(normalize(html).includes(normalize(workbook.sheets[sheet][column + row])), `${sheet}!${column}${row} must appear in full at ${url}`);
    }
    const footer = workbook.sheets['07_SEO_Dev_Notes'][column + '7'];
    assert.ok(normalize(html).includes(normalize(footer)), `Original trademark notice at ${url}`);
    if (language === 'en') {
      const body = normalize(html.split('<body>')[1]);
      assert.ok(!/[À-ỹ]/u.test(body), `Untranslated Vietnamese visible on ${url}`);
      assert.ok(html.includes('Connecting Business. Securing the Future.'));
    }
  }
}
for (const [url, html] of pages) {
  for (const [, tag, href] of html.matchAll(/(<a\b[^>]*href="([^"]+)"[^>]*>)/g)) {
    if (href.startsWith('tel:')) continue;
    const [destination, anchor] = href.split('#');
    const target = pages.get(destination || url);
    assert.ok(target, `Working page link ${href} on ${url}`);
    if (anchor) assert.ok(target.includes(`id="${anchor}"`), `Working anchor ${href} on ${url}`);
    if (!tag.includes('data-language=') && destination) assert.equal(destination.startsWith('/en/'), url.startsWith('/en/'), `Content link must retain language: ${href} on ${url}`);
  }
}
for (let row = 5; row <= 9; row += 1) {
  for (const scope of workbook.sheets['04_Services']['D' + row].replace(/\.$/, '').split(';')) {
    assert.ok(normalize(pages.get('/en/services/')).includes(scope.trim()), `Original service scope D${row}: ${scope}`);
  }
}
const server = await startServer({ port: 0, host: '127.0.0.1', directory: process.env.TEST_DIST === '1' ? 'dist' : '.' });
try {
  const origin = `http://127.0.0.1:${server.address().port}`;
  for (const [url, html] of pages) {
    const response = await fetch(origin + url);
    assert.equal(response.status, 200, `Direct language URL ${url}`);
    assert.equal(await response.text(), html);
  }
  console.log('PASS: 12 bilingual routes, original workbook content, same-page language switches, localized navigation and service scopes');
} finally { await new Promise(resolve => server.close(resolve)); }
