import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.ttf': 'font/ttf', '.txt': 'text/plain; charset=utf-8' };
export async function startServer({ port = 3000, host = '127.0.0.1', directory = '.' } = {}) {
  const siteRoot = path.resolve(root, directory);
  const server = http.createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
      const assetRoot = directory === '.' && relative.startsWith('assets/') ? path.join(siteRoot, 'public') : siteRoot;
      let filename = path.resolve(assetRoot, relative);
      if (!filename.startsWith(assetRoot + path.sep) || relative.split(/[\\/]/).some(part => part.startsWith('.'))) {
        response.writeHead(403); response.end('Forbidden'); return;
      }
      if ((await fs.stat(filename)).isDirectory()) {
        if (!pathname.endsWith('/')) {
          response.writeHead(308, { Location: pathname + '/' + new URL(request.url, 'http://localhost').search });
          response.end(); return;
        }
        filename = path.join(filename, 'index.html');
      }
      const data = await fs.readFile(filename);
      response.writeHead(200, { 'Content-Type': types[path.extname(filename)] || 'application/octet-stream', 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' });
      response.end(request.method === 'HEAD' ? undefined : data);
    } catch { response.writeHead(404); response.end('Not found'); }
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, host, resolve); });
  return server;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const argumentsList = process.argv.slice(2);
  const option = (name, fallback) => {
    const index = argumentsList.indexOf(name);
    return index >= 0 && argumentsList[index + 1] ? argumentsList[index + 1] : fallback;
  };
  const server = await startServer({ port: Number(option('--port', process.env.PORT || 3000)), host: option('--host', process.env.HOST || '127.0.0.1'), directory: option('--dir', '.') });
  console.log(`PAY ORBIT available at http://${server.address().address}:${server.address().port}`);
}
