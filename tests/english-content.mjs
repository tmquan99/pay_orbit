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
  // Home A uses the customer-needs copy approved on 2026-10-12.
  // Rows 6:9 use the approved grouped story copy rather than workbook paragraphs.
  ['/about/', '02_Company_Intro', [5]],
  ['/solutions/', '03_Solutions', [5, 6, 7, 8]],
  ['/services/', '04_Services', [5, 6, 7, 8, 9]],
  ['/products/', '05_Products_Tech', [5, 6, 7, 8, 9, 10, 11]],
  ['/contact/', '06_Contact', [5, 6, 7, 8]],
];
const normalize = text => text.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
const localized = (route, language) => route;
const pages = new Map();
for (const language of ['en']) {
  for (const route of routes) {
    const url = localized(route, language);
    const html = await fs.readFile(path.join(site, url.slice(1), 'index.html'), 'utf8').catch(() => null);
    assert.ok(html, `Missing ${language} counterpart at ${url}`);
    pages.set(url, html);
    assert.ok(html.includes(`<html lang="${language}">`), `Document language at ${url}`);
    assert.equal((html.match(/<h1\b/g) || []).length, 1);
    assert.ok(!/<figcaption\b/i.test(html), `Image captions removed at ${url}`);
    assert.ok(!html.includes('aria-labelledby="connection_caption"'), `No removed caption references at ${url}`);
    assert.ok(!html.includes('[To be updated]'));
    for (const destination of routes) assert.ok(html.includes(`href="${localized(destination, language)}"`), `Same-language menu from ${url}`);
    const column = 'B';
    for (const [sourceRoute, sheet, rows] of coverage.filter(([sourceRoute]) => sourceRoute === route)) {
      for (const row of rows) assert.ok(normalize(html).includes(normalize(workbook.sheets[sheet][column + row])), `${sheet}!${column}${row} must appear in full at ${url}`);
    }
    const footer = workbook.sheets['07_SEO_Dev_Notes'][column + '7'];
    assert.ok(normalize(html).includes(normalize(footer)), `Original trademark notice at ${url}`);
    if (language === 'en') {
      const body = normalize(html.split(/<body[^>]*>/)[1]);
      assert.ok(!/[À-ỹ]/u.test(body), `Untranslated Vietnamese visible on ${url}`);
      assert.ok(html.includes('Connecting Business. Securing the Future.'));
    }
  }
}
for (const language of ['en']) {
  const about = normalize(pages.get(localized('/about/', language)));
  for (const copy of [
    "We bring connectivity, security and technical services together in one integrated infrastructure solution.",
    "Connectivity:", "enterprise and data center networking.",
    "Security:", "secure access, cybersecurity and cloud security.",
    "Services:", "consulting, implementation and technical support.",
    "Starting with your operating environment, PAY ORBIT recommends a suitable solution that is easy to deploy and manage.",
    "PAY ORBIT focuses on widely adopted enterprise technologies from Cisco and Palo Alto Networks.",
    "meet core connectivity requirements.",
    "address modern cybersecurity needs.",
    "Bring both needs together within a coherent technology architecture.",
    "We work with you from requirement assessment through post-implementation support.",
    "Infrastructure that meets technical requirements at deployment and remains manageable and scalable throughout its operating lifecycle.",
    "Three principles guide how PAY ORBIT works with customers.",
    "Solution clarity.", "Reliable execution.", "Long-term technical support.",
    "Simplify technology choices so customers can focus on business operations with a secure, dependable digital foundation.",
  ]) assert.ok(about.includes(copy), `Approved About summary copy in ${language}: ${copy}`);
}
for (const [url, html] of pages) {
  for (const [, tag, href] of html.matchAll(/(<a\b[^>]*href="([^"]+)"[^>]*>)/g)) {
    if (href.startsWith('tel:')) continue;
    const parsed = new URL(href, `https://pay-orbit.invalid${url}`);
    const destination = parsed.pathname;
    const anchor = parsed.hash.slice(1);
    const target = pages.get(destination || url);
    assert.ok(target, `Working page link ${href} on ${url}`);
    if (anchor) assert.ok(target.includes(`id="${anchor}"`), `Working anchor ${href} on ${url}`);
  }
}
for (let row = 5; row <= 9; row += 1) {
  for (const scope of workbook.sheets['04_Services']['D' + row].replace(/\.$/, '').split(';')) {
    const label = scope.trim();
    const sentenceCase = label.charAt(0).toUpperCase() + label.slice(1);
    assert.ok(normalize(pages.get('/services/')).includes(sentenceCase), `Original service scope D${row}, sentence case: ${scope}`);
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
  console.log('PASS: six English routes, original workbook content, approved About summaries and service scopes');
} finally { await new Promise(resolve => server.close(resolve)); }
