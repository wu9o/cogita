import { createReadStream, existsSync, statSync } from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, '..');
const demosRoot = path.join(repositoryRoot, 'demos');
const port = Number(process.env.PORT || process.argv[2] || 3100);
const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function safeResolve(root, relativePath) {
  const resolved = path.resolve(root, relativePath);
  const relative = path.relative(root, resolved);
  if (relative.startsWith('..') || path.isAbsolute(relative)) return null;
  return resolved;
}

function sendFile(response, filePath) {
  if (!filePath || !existsSync(filePath) || !statSync(filePath).isFile()) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
    return;
  }
  response.writeHead(200, {
    'Cache-Control': 'no-cache',
    'Content-Type': contentTypes[path.extname(filePath)] || 'application/octet-stream',
  });
  createReadStream(filePath).pipe(response);
}

const server = http.createServer((request, response) => {
  let requestUrl;
  try {
    requestUrl = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);
  } catch {
    response.writeHead(400);
    response.end('Bad request');
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(requestUrl.pathname);
  } catch {
    response.writeHead(400);
    response.end('Bad request');
    return;
  }

  if (pathname === '/') {
    sendFile(response, path.join(demosRoot, 'landing', 'index.html'));
    return;
  }

  if (pathname === '/social-card.svg') {
    sendFile(response, path.join(demosRoot, 'landing', 'social-card.svg'));
    return;
  }

  const demoMatch = pathname.match(/^\/demos\/([^/]+)(\/.*)?$/);
  if (!demoMatch) {
    sendFile(response, null);
    return;
  }

  const slug = demoMatch[1];
  const suffix = demoMatch[2] || '';
  if (!suffix) {
    response.writeHead(302, { Location: `/demos/${slug}/` });
    response.end();
    return;
  }

  const outputRoot = path.join(demosRoot, slug, 'doc_build');
  const relativePath = suffix === '/' ? 'index.html' : suffix.slice(1);
  const filePath = safeResolve(outputRoot, relativePath);
  sendFile(response, filePath);
});

server.listen(port, () => {
  console.log(`主题 Demo 总览：http://localhost:${port}/`);
  console.log('单主题 Demo：/demos/docs/  /demos/lucid/  /demos/editorial/  /demos/knowledge/');
});

function stop() {
  server.close(() => process.exit(0));
}

process.on('SIGINT', stop);
process.on('SIGTERM', stop);
