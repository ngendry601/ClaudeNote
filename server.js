#!/usr/bin/env node
// Petit serveur sans dépendance : sert l'appli et relaie les flux RSS (contourne le blocage CORS).
// Usage : node server.js   puis ouvre http://localhost:8080
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT) || 8080;
const HOST = process.env.HOST || '127.0.0.1';
const ROOT = __dirname;
const MAX_BYTES = 5 * 1024 * 1024;
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.png': 'image/png',
  '.md': 'text/markdown; charset=utf-8',
};

async function proxy(req, res, target) {
  let url;
  try {
    url = new URL(target);
    if (!/^https?:$/.test(url.protocol)) throw new Error();
  } catch {
    res.writeHead(400).end('URL invalide');
    return;
  }
  try {
    const r = await fetch(url, {
      headers: { 'User-Agent': 'ClaudeNote-RSS/1.0', Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*' },
      redirect: 'follow',
      signal: AbortSignal.timeout(15000),
    });
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.length > MAX_BYTES) {
      res.writeHead(413).end('Trop volumineux');
      return;
    }
    res.writeHead(r.status, {
      'Content-Type': r.headers.get('content-type') || 'text/xml',
      'Cache-Control': 'max-age=300',
    });
    res.end(buf);
  } catch (e) {
    res.writeHead(502).end('Échec : ' + e.message);
  }
}

http
  .createServer((req, res) => {
    const u = new URL(req.url, `http://${req.headers.host}`);
    if (u.pathname === '/proxy') return proxy(req, res, u.searchParams.get('url'));
    let file = path.normalize(path.join(ROOT, decodeURIComponent(u.pathname)));
    if (!file.startsWith(ROOT + path.sep) || /[\\/]\./.test(file.slice(ROOT.length))) return res.writeHead(403).end();
    if (u.pathname === '/' ) file = path.join(ROOT, 'index.html');
    fs.readFile(file, (err, data) => {
      if (err) return res.writeHead(404).end('Introuvable');
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
      res.end(data);
    });
  })
  .listen(PORT, HOST, () => console.log(`ClaudeNote prêt : http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`));
