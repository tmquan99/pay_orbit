import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import tls from 'node:tls';
import net from 'node:net';
import { spawn, spawnSync } from 'node:child_process';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bundledPhp = path.join(root, 'tmp/php/php.exe');
const php = process.env.PHP_PATH || (await fs.stat(bundledPhp).catch(() => null) ? bundledPhp : 'php');
const openssl = process.env.OPENSSL_PATH || 'openssl';
const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'payorbit-smtp-'));
const messages = [];
let server, worker;
let rejectMessage = false;
try {
  const unit = spawnSync(php, [path.join(root, 'tests/enquiry.php')], { cwd: root, encoding: 'utf8' });
  assert.equal(unit.status, 0, unit.stdout + unit.stderr);
  console.log(unit.stdout.trim());
  for (const filename of ['api/enquiry.php', 'api/lib/enquiry.php', 'config/payorbit-mail.example.php']) {
    const syntax = spawnSync(php, ['-l', path.join(root, filename)], { encoding: 'utf8' });
    assert.equal(syntax.status, 0, syntax.stdout + syntax.stderr);
  }
  const keyPath = path.join(directory, 'key.pem'), certPath = path.join(directory, 'cert.pem');
  const certificate = spawnSync(openssl, ['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-keyout', keyPath, '-out', certPath, '-days', '1', '-subj', '/CN=localhost', '-addext', 'subjectAltName=DNS:localhost,IP:127.0.0.1'], { encoding: 'utf8' });
  assert.equal(certificate.status, 0, certificate.stderr || 'OpenSSL is required for the local TLS test');
  server = tls.createServer({ key: await fs.readFile(keyPath), cert: await fs.readFile(certPath) }, socket => {
    let buffer = '', dataMode = false, message = '', authStep = 0;
    socket.setEncoding('utf8');
    socket.on('error', () => {});
    socket.write('220 local-test ESMTP\r\n');
    socket.on('data', chunk => {
      buffer += chunk;
      while (buffer.includes('\r\n')) {
        const at = buffer.indexOf('\r\n');
        const line = buffer.slice(0, at); buffer = buffer.slice(at + 2);
        if (dataMode) {
          if (line === '.') { dataMode = false; messages.push(message); socket.write(rejectMessage ? '550 Rejected for test\r\n' : '250 Queued locally\r\n'); }
          else message += line + '\r\n';
        } else if (authStep) { authStep++; socket.write(authStep === 2 ? '334 UGFzc3dvcmQ6\r\n' : '235 Authenticated\r\n'); if (authStep === 3) authStep = 0; }
        else if (line.startsWith('EHLO')) socket.write('250-local-test\r\n250 AUTH LOGIN\r\n');
        else if (line.startsWith('AUTH LOGIN')) { authStep = 1; socket.write('334 VXNlcm5hbWU6\r\n'); }
        else if (line.startsWith('MAIL FROM')) { assert.ok(line.includes('sales@payorbit.com.au')); socket.write('250 OK\r\n'); }
        else if (line.startsWith('RCPT TO')) { assert.ok(line.includes('sales@payorbit.com.au')); socket.write('250 OK\r\n'); }
        else if (line === 'DATA') { dataMode = true; message = ''; socket.write('354 Send data\r\n'); }
        else if (line === 'QUIT') socket.end('221 Bye\r\n');
        else socket.write('250 OK\r\n');
      }
    });
  });
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  const listener = net.createServer(); listener.listen(0, '127.0.0.1'); await once(listener, 'listening');
  const port = listener.address().port; await new Promise(resolve => listener.close(resolve));
  const origin = `http://127.0.0.1:${port}`;
  const configPath = path.join(directory, 'mail.php');
  const config = { smtp_host: 'localhost', smtp_port: server.address().port, smtp_password: 'local-test-password', allowed_origins: [origin], rate_directory: path.join(directory, 'quota') };
  const writeConfig = async value => fs.writeFile(configPath, `<?php return json_decode(${JSON.stringify(JSON.stringify(value))}, true);`);
  // PHP double-quoted strings would interpolate dollars; these test values contain none.
  await writeConfig(config);
  const args = [];
  if (php === bundledPhp) args.push('-d', `extension_dir=${path.join(root, 'tmp/php/ext')}`, '-d', 'extension=openssl');
  args.push('-d', `openssl.cafile=${certPath}`, '-S', `127.0.0.1:${port}`, '-t', process.env.TEST_DIST === '1' ? path.join(root, 'dist') : root);
  worker = spawn(php, args, { cwd: root, env: { ...process.env, PAYORBIT_MAIL_CONFIG: configPath }, stdio: ['ignore', 'pipe', 'pipe'] });
  let workerError = ''; worker.stderr.on('data', chunk => { workerError += chunk; });
  worker.on('error', error => { workerError += error.message; });
  for (let i = 0; i < 80; i++) {
    if (await fetch(origin + '/api/enquiry.php').then(response => response.status === 405).catch(() => false)) break;
    if (i === 79) throw new Error('PHP server unavailable: ' + workerError);
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  const valid = { name: 'Test customer', email: 'customer@example.com', company: 'Example Ltd', phone: '', requirement: 'Branch network upgrade', website: '' };
  const post = (data, overrides = {}) => fetch(origin + '/api/enquiry.php', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: origin }, body: JSON.stringify(data), ...overrides });
  assert.equal((await post({ ...valid, email: '' })).status, 422);
  assert.equal((await post({ ...valid, email: 'invalid' })).status, 422);
  assert.equal((await post({ ...valid, email: 'customer@example.com\r\nBcc: bad@example.com' })).status, 422);
  assert.equal((await post({ ...valid, website: 'spam.example' })).status, 422);
  assert.equal((await post(valid, { headers: { 'Content-Type': 'application/json', Origin: 'https://other.example' } })).status, 403);
  assert.equal((await post(valid, { headers: { 'Content-Type': 'text/plain' } })).status, 415);
  assert.equal((await post(valid, { body: '{broken' })).status, 400);
  assert.equal((await post(valid, { body: 'a'.repeat(32769) })).status, 413);
  assert.equal(messages.length, 0, 'Rejected requests never contact SMTP');
  let response = await post({ ...valid, to: 'attacker@example.com' });
  assert.equal(response.status, 200, await response.clone().text());
  assert.deepEqual(await response.json(), { ok: true });
  assert.equal(messages.length, 1);
  assert.ok(messages[0].includes('Reply-To: Test customer <customer@example.com>'));
  assert.ok(messages[0].includes('Branch network upgrade'));
  assert.ok(!messages[0].includes('local-test-password'));
  rejectMessage = true;
  response = await post(valid);
  assert.equal(response.status, 502);
  assert.deepEqual(await response.json(), { ok: false }, 'SMTP failure cannot report success');
  rejectMessage = false;
  for (let i = 0; i < 3; i++) assert.equal((await post(valid)).status, 200);
  assert.equal((await post(valid)).status, 429, 'Five attempts consume the quota, including SMTP failure');
  assert.equal((await post(valid, { headers: { 'Content-Type': 'application/json', Origin: origin, 'X-Forwarded-For': '192.0.2.123' } })).status, 429, 'Untrusted proxy headers cannot bypass quota');
  await writeConfig({ ...config, smtp_password: '' });
  response = await post(valid);
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { ok: false }, 'Missing credentials fail closed');
  console.log('PASS: real PHP HTTP endpoint → authenticated TLS SMTP, fixed recipient, validation, origin, size limits, delivery failure, quota and missing credentials');
} finally {
  if (worker && worker.exitCode === null) { worker.kill(); await once(worker, 'exit').catch(() => {}); }
  if (server) await new Promise(resolve => server.close(resolve));
  await fs.rm(directory, { recursive: true, force: true });
}
