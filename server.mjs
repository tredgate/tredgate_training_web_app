import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { createServer } from 'node:http';

const host = '0.0.0.0';
const port = Number(process.env.PORT || 4173);
const distDir = join(process.cwd(), 'dist');

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function isSafePath(pathname) {
  const normalized = normalize(pathname);
  return !normalized.includes('..');
}

function sendFile(response, absolutePath) {
  const extension = extname(absolutePath);
  const contentType = contentTypes[extension] || 'application/octet-stream';

  response.writeHead(200, {
    'Content-Type': contentType,
    'Cache-Control': extension === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable',
  });

  createReadStream(absolutePath).pipe(response);
}

function sendNotFound(response) {
  response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  response.end('Not found');
}

const server = createServer((request, response) => {
  const requestUrl = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);
  const pathname = decodeURIComponent(requestUrl.pathname);

  if (!isSafePath(pathname)) {
    sendNotFound(response);
    return;
  }

  const requestedPath = pathname === '/' ? '/index.html' : pathname;
  const absolutePath = join(distDir, requestedPath);

  if (existsSync(absolutePath) && statSync(absolutePath).isFile()) {
    sendFile(response, absolutePath);
    return;
  }

  const indexPath = join(distDir, 'index.html');
  if (existsSync(indexPath)) {
    sendFile(response, indexPath);
    return;
  }

  response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
  response.end('Build output not found. Run "npm run build" first.');
});

server.listen(port, host, () => {
  // Log format expected by most platforms for quick diagnosis.
  console.log(`Static server running on http://${host}:${port}`);
});
