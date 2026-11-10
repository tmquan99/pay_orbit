import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { startServer } from '../scripts/serve.mjs';

export async function verifyContactForm(page, origin) {
  const requests = [];
  let mode = 'success';
  let release;
  await page.route('**/api/enquiry.php', async route => {
    requests.push(route.request().postDataJSON());
    if (mode === 'pending') await new Promise(resolve => { release = resolve; });
    if (mode === 'network') return route.abort();
    if (mode === 'html') return route.fulfill({ status: 200, contentType: 'text/html', body: '<html>Static host</html>' });
    return route.fulfill({ status: mode === 'error' ? 502 : mode === 'rate' ? 429 : 200, contentType: 'application/json', body: JSON.stringify({ ok: !['error', 'rate'].includes(mode) }) });
  });
  await page.goto(origin + '/contact/', { waitUntil: 'networkidle' });
  const button = page.getByRole('button', { name: 'Send enquiry', exact: true });
  assert.equal(await page.locator('#email').getAttribute('required'), '');
  assert.equal(await page.locator('#website').isHidden(), true, 'Bot field stays hidden from people');
  await button.click();
  for (const field of ['name', 'email', 'requirement']) assert.equal(await page.locator(`#${field}`).getAttribute('aria-invalid'), 'true');
  assert.equal(requests.length, 0, 'Empty required fields must never send');
  await page.locator('#name').fill('Test person');
  await page.locator('#company').fill('Example Ltd');
  await page.locator('#requirement').fill('Office networking enquiry.');
  await page.locator('#email').fill('invalid');
  await button.click();
  assert.equal(await page.locator('#email_error').textContent(), 'Enter a valid email address.');
  assert.equal(requests.length, 0, 'Invalid email must never send');
  await page.locator('#email').fill('customer@example.com');
  mode = 'pending';
  await button.click();
  await page.waitForFunction(() => document.querySelector('#send_button').disabled);
  assert.equal(await page.locator('#send_button').textContent().then(text => text.trim()), 'Sending…');
  await page.locator('#consultation_form').evaluate(form => form.requestSubmit());
  assert.equal(requests.length, 1, 'Repeated submit cannot send twice while pending');
  assert.equal(requests[0].email, 'customer@example.com');
  assert.equal(requests[0].company, 'Example Ltd');
  assert.equal(requests[0].requirement, 'Office networking enquiry.');
  mode = 'success';
  release();
  await page.waitForFunction(() => document.querySelector('#form_status').textContent.includes('has been sent'));
  assert.equal(await button.isEnabled(), true);
  for (mode of ['error', 'rate', 'html', 'network']) {
    await button.click();
    await page.waitForFunction(() => !document.querySelector('#send_button').disabled);
    const status = await page.locator('#form_status').textContent();
    assert.ok(!status.includes('has been sent'), `No false success on ${mode}`);
    assert.ok(status.includes(mode === 'rate' ? 'Too many' : "couldn’t send"));
    assert.equal(await page.locator('#email').inputValue(), 'customer@example.com');
    assert.equal(await page.locator('#requirement').inputValue(), 'Office networking enquiry.');
  }
  await page.unroute('**/api/enquiry.php');
  const noPhp = await page.request.post(origin + '/api/enquiry.php', { data: requests[0] });
  assert.equal(noPhp.status(), 503, 'Node preview cannot send or expose PHP source');
  assert.deepEqual(await noPhp.json(), { ok: false });
  assert.equal((await page.request.get(origin + '/api/lib/enquiry.php')).status(), 403);
  assert.equal((await page.request.get(origin + '/config/payorbit-mail.example.php')).status(), 403);
  console.log('PASS: required email, actual POST payload, sending state, duplicate-submit guard, success and failure recovery');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const require = createRequire(import.meta.url);
  let chromium;
  for (const candidate of ['playwright', path.join(process.env.USERPROFILE || '', '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')]) {
    try { ({ chromium } = require(candidate)); break; } catch {}
  }
  assert.ok(chromium, 'Playwright is required');
  const server = await startServer({ port: 0, directory: process.env.TEST_DIST === '1' ? 'dist' : '.' });
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  try {
    for (const width of [1440, 390]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      await verifyContactForm(page, `http://127.0.0.1:${server.address().port}`);
      await page.close();
    }
  } finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
}
