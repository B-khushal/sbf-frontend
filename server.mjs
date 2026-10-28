import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.resolve(__dirname, 'dist');
const PUBLIC_DIR = path.resolve(__dirname, 'public');
const BACKEND_URL = process.env.VITE_BACKEND_URL || 'https://api.sbflorist.in';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.webmanifest': 'application/manifest+json'
};

const serveFile = (res, filePath, contentTypeOverride = null, cacheControl = 'public, max-age=3600') => {
  try {
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      return false;
    }
    const ext = path.extname(filePath).toLowerCase();
    const contentType = contentTypeOverride || MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': cacheControl,
      'Strict-Transport-Security': 'max-age=31536000',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    });
    fs.createReadStream(filePath).pipe(res);
    return true;
  } catch (err) {
    return false;
  }
};

const proxyToBackend = (req, res, targetPath, onFallback, forceXml = false) => {
  try {
    const targetUrl = new URL(targetPath, BACKEND_URL);
    const client = targetUrl.protocol === 'https:' ? https : http;
    const headers = {
      ...req.headers,
      host: targetUrl.host
    };
    if (forceXml) {
      headers.accept = 'application/xml, text/xml;q=0.9, */*;q=0.8';
    }

    const proxyReq = client.request(
      targetUrl,
      {
        method: req.method || 'GET',
        headers,
        timeout: 8000
      },
      (proxyRes) => {
        const statusCode = proxyRes.statusCode || 500;
        const contentType = String(proxyRes.headers['content-type'] || '').toLowerCase();

        if (statusCode >= 500 || (forceXml && (statusCode >= 400 || !contentType.includes('xml')))) {
          proxyRes.resume();
          onFallback();
          return;
        }

        const outHeaders = { ...proxyRes.headers };
        if (forceXml) {
          outHeaders['content-type'] = 'application/xml; charset=utf-8';
        }
        res.writeHead(statusCode, outHeaders);
        proxyRes.pipe(res);
      }
    );

    proxyReq.on('error', () => onFallback());
    proxyReq.on('timeout', () => {
      proxyReq.destroy();
      onFallback();
    });
    req.pipe(proxyReq);
  } catch (err) {
    onFallback();
  }
};

const handleRequest = (req, res) => {
  const rawUrl = req.url || '/';
  const pathname = rawUrl.split('?')[0];

  // 1. Healthcheck endpoint
  if (pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('healthy\n');
    return;
  }

  // 2. XML Sitemap endpoints — ALWAYS return application/xml (never HTML)
  if (/^\/sitemap.*\.xml$/i.test(pathname)) {
    const filename = pathname.replace(/^\/+/, '');
    const fallbackXml = () => {
      const distXml = path.join(DIST_DIR, filename);
      const publicXml = path.join(PUBLIC_DIR, filename);
      if (serveFile(res, distXml, 'application/xml; charset=utf-8', 'public, max-age=3600')) return;
      if (serveFile(res, publicXml, 'application/xml; charset=utf-8', 'public, max-age=3600')) return;
      if (serveFile(res, path.join(DIST_DIR, 'sitemap.xml'), 'application/xml; charset=utf-8', 'public, max-age=3600')) return;
      res.writeHead(404, { 'Content-Type': 'application/xml; charset=utf-8' });
      res.end('<?xml version="1.0" encoding="UTF-8"?><error>Sitemap not found</error>');
    };

    proxyToBackend(req, res, rawUrl, fallbackXml, true);
    return;
  }

  // 3. robots.txt
  if (pathname === '/robots.txt') {
    const fallbackRobots = () => {
      if (serveFile(res, path.join(DIST_DIR, 'robots.txt'), 'text/plain; charset=utf-8', 'public, max-age=86400')) return;
      if (serveFile(res, path.join(PUBLIC_DIR, 'robots.txt'), 'text/plain; charset=utf-8', 'public, max-age=86400')) return;
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('User-agent: *\nAllow: /\nSitemap: https://sbflorist.in/sitemap.xml\n');
    };

    proxyToBackend(req, res, '/robots.txt', fallbackRobots, false);
    return;
  }

  // 4. Proxy /api/* requests to backend
  if (pathname.startsWith('/api/')) {
    proxyToBackend(req, res, rawUrl, () => {
      res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ success: false, message: 'Backend API unavailable' }));
    }, false);
    return;
  }

  // 5. Static files in dist/
  const safeRelPath = path.normalize(pathname).replace(/^(\.\.(\/|\\|$))+/, '').replace(/^[/\\]+/, '');
  if (safeRelPath) {
    const candidateFile = path.join(DIST_DIR, safeRelPath);
    const isHashedAsset = safeRelPath.startsWith('assets/');
    const cacheHeader = isHashedAsset ? 'public, max-age=31536000, immutable' : 'public, max-age=3600';
    if (serveFile(res, candidateFile, null, cacheHeader)) {
      return;
    }

    // Check pre-rendered route index.html (e.g., dist/shop/index.html)
    const routeIndexFile = path.join(DIST_DIR, safeRelPath, 'index.html');
    if (serveFile(res, routeIndexFile, 'text/html; charset=utf-8', 'no-cache')) {
      return;
    }
  }

  // 6. SPA Fallback to dist/index.html
  const rootIndex = path.join(DIST_DIR, 'index.html');
  if (serveFile(res, rootIndex, 'text/html; charset=utf-8', 'no-cache')) {
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Not Found');
};

const primaryPort = Number(process.env.PORT) || 3000;
const candidatePorts = Array.from(new Set([primaryPort, 3000, 80, 8081]));

for (const port of candidatePorts) {
  const srv = http.createServer(handleRequest);
  srv.on('error', (err) => {
    if (port === primaryPort) {
      console.error(`Failed to bind primary port ${port}:`, err.message);
    }
  });
  srv.listen(port, () => {
    console.log(`SBF Frontend production server listening on port ${port}`);
  });
}

