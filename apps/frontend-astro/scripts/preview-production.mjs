import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

// Read-only loopback preview of the existing Nginx layout: homepage at /,
// the generated Astro tree and its assets at /retire. Never a production server.
const root = fileURLToPath(new URL('../dist/', import.meta.url));
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.xml': 'application/xml; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};
const port = Number(process.argv[2] || 4322);
createServer(async (request, response) => {
  try {
    const path = decodeURIComponent(
      new URL(request.url, 'http://127.0.0.1').pathname,
    );
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      response.writeHead(405).end();
      return;
    }
    if (path !== '/' && !path.startsWith('/retire/')) {
      response.writeHead(404).end('Not found');
      return;
    }
    let file = resolve(
      root,
      path === '/' ? 'index.html' : path.slice('/retire/'.length),
    );
    if (file !== resolve(root) && !file.startsWith(resolve(root) + sep)) {
      response.writeHead(404).end();
      return;
    }
    if ((await stat(file)).isDirectory()) file = resolve(file, 'index.html');
    const body = await readFile(file);
    response.writeHead(200, {
      'Content-Type': types[extname(file)] || 'application/octet-stream',
      'Cache-Control': 'no-store',
      'Content-Length': body.length,
    });
    response.end(request.method === 'HEAD' ? undefined : body);
  } catch {
    response.writeHead(404).end('Not found');
  }
}).listen(port, '127.0.0.1', () =>
  console.log(`Production-layout preview: http://127.0.0.1:${port}`),
);
