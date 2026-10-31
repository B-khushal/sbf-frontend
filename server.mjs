import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ── Global Error Trapping ────────────────────────────────────────────────
// Prevent uncaught errors or stream disconnects from crashing the process
process.on('uncaughtException', (err) => {
  console.error('[SBF Frontend Server] Uncaught Exception:', err?.message || err);
});

process.on('unhandledRejection', (reason) => {
  console.error('[SBF Frontend Server] Unhandled Rejection:', reason);
});

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

const safeWriteHeaders = (res, statusCode, headers) => {
  try {
    if (!res.headersSent && !res.writableEnded) {
      res.writeHead(statusCode, headers);
      return true;
    }
  } catch (err) {
    console.warn('[SBF Frontend Server] Failed to write headers:', err?.message);
  }
  return false;
};

const safeEnd = (res, data = null) => {
  try {
    if (!res.writableEnded) {
      res.end(data);
    }
  } catch (err) {
    // Client already disconnected
  }
};

const serveFile = (req, res, filePath, contentTypeOverride = null, cacheControl = 'public, max-age=3600') => {
  try {
    if (!fs.existsSync(filePath)) {
      return false;
    }
    const stat = fs.statSync(filePath);
    if (!stat.isFile()) {
      return false;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = contentTypeOverride || MIME_TYPES[ext] || 'application/octet-stream';

    const written = safeWriteHeaders(res, 200, {
      'Content-Type': contentType,
      'Content-Length': stat.size,
      'Cache-Control': cacheControl,
      'Strict-Transport-Security': 'max-age=31536000',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    });

    if (!written) return true;

    // For HEAD requests, do not write body
    if (req.method === 'HEAD') {
      safeEnd(res);
      return true;
    }

    const stream = fs.createReadStream(filePath);
    stream.on('error', (err) => {
      console.warn('[SBF Frontend Server] File stream read error:', err?.message);
      safeEnd(res);
    });

    res.on('error', (err) => {
      // Client disconnected during pipe
      stream.destroy();
    });

    stream.pipe(res);
    return true;
  } catch (err) {
    console.warn('[SBF Frontend Server] serveFile error:', err?.message);
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

        safeWriteHeaders(res, statusCode, outHeaders);

        if (req.method === 'HEAD') {
          proxyRes.resume();
          safeEnd(res);
          return;
        }

        proxyRes.on('error', () => {
          safeEnd(res);
        });

        res.on('error', () => {
          proxyRes.destroy();
        });

        proxyRes.pipe(res);
      }
    );

    proxyReq.on('error', () => onFallback());
    proxyReq.on('timeout', () => {
      proxyReq.destroy();
      onFallback();
    });

    req.on('error', () => {
      proxyReq.destroy();
    });

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      req.pipe(proxyReq);
    } else {
      proxyReq.end();
    }
  } catch (err) {
    onFallback();
  }
};

const handleRequest = (req, res) => {
  // Listen for socket errors on client connection
  req.on('error', (err) => {
    console.warn('[SBF Frontend Server] Incoming request socket error:', err?.message);
  });
  res.on('error', (err) => {
    console.warn('[SBF Frontend Server] Response socket error:', err?.message);
  });

  const rawUrl = req.url || '/';
  const pathname = rawUrl.split('?')[0];

  // 1. Healthcheck endpoint (used by Dokploy, Docker Swarm, Traefik, AWS, K8s)
  if (pathname === '/health' || pathname === '/healthz' || pathname === '/ping') {
    safeWriteHeaders(res, 200, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache, no-store'
    });
    safeEnd(res, 'healthy\n');
    return;
  }

  // 2. XML Sitemap endpoints — ALWAYS return application/xml (never HTML)
  if (/^\/sitemap.*\.xml$/i.test(pathname)) {
    const filename = pathname.replace(/^\/+/, '');
    const fallbackXml = () => {
      const distXml = path.join(DIST_DIR, filename);
      const publicXml = path.join(PUBLIC_DIR, filename);
      if (serveFile(req, res, distXml, 'application/xml; charset=utf-8', 'public, max-age=3600')) return;
      if (serveFile(req, res, publicXml, 'application/xml; charset=utf-8', 'public, max-age=3600')) return;
      if (serveFile(req, res, path.join(DIST_DIR, 'sitemap.xml'), 'application/xml; charset=utf-8', 'public, max-age=3600')) return;
      safeWriteHeaders(res, 404, { 'Content-Type': 'application/xml; charset=utf-8' });
      safeEnd(res, '<?xml version="1.0" encoding="UTF-8"?><error>Sitemap not found</error>');
    };

    proxyToBackend(req, res, rawUrl, fallbackXml, true);
    return;
  }

  // 3. robots.txt
  if (pathname === '/robots.txt') {
    const fallbackRobots = () => {
      if (serveFile(req, res, path.join(DIST_DIR, 'robots.txt'), 'text/plain; charset=utf-8', 'public, max-age=86400')) return;
      if (serveFile(req, res, path.join(PUBLIC_DIR, 'robots.txt'), 'text/plain; charset=utf-8', 'public, max-age=86400')) return;
      safeWriteHeaders(res, 200, { 'Content-Type': 'text/plain; charset=utf-8' });
      safeEnd(res, 'User-agent: *\nAllow: /\nSitemap: https://sbflorist.in/sitemap.xml\n');
    };

    proxyToBackend(req, res, '/robots.txt', fallbackRobots, false);
    return;
  }

  // 4. Proxy /api/* requests to backend
  if (pathname.startsWith('/api/')) {
    proxyToBackend(req, res, rawUrl, () => {
      safeWriteHeaders(res, 502, { 'Content-Type': 'application/json; charset=utf-8' });
      safeEnd(res, JSON.stringify({ success: false, message: 'Backend API unavailable' }));
    }, false);
    return;
  }

  // 5. Static files in dist/
  const safeRelPath = path.normalize(pathname).replace(/^(\.\.(\/|\\|$))+/, '').replace(/^[/\\]+/, '');
  if (safeRelPath) {
    const candidateFile = path.join(DIST_DIR, safeRelPath);
    const isHashedAsset = safeRelPath.startsWith('assets/');
    const cacheHeader = isHashedAsset ? 'public, max-age=31536000, immutable' : 'public, max-age=3600';
    if (serveFile(req, res, candidateFile, null, cacheHeader)) {
      return;
    }

    // Check pre-rendered route index.html (e.g., dist/shop/index.html)
    const routeIndexFile = path.join(DIST_DIR, safeRelPath, 'index.html');
    if (serveFile(req, res, routeIndexFile, 'text/html; charset=utf-8', 'no-cache')) {
      return;
    }
  }

  // 6. SPA Fallback to dist/index.html
  const rootIndex = path.join(DIST_DIR, 'index.html');
  if (serveFile(req, res, rootIndex, 'text/html; charset=utf-8', 'no-cache')) {
    return;
  }

  safeWriteHeaders(res, 404, { 'Content-Type': 'text/plain; charset=utf-8' });
  safeEnd(res, 'Not Found');
};

// ── Multi-Port Listener ──────────────────────────────────────────────────
// Automatically binds to primary port (process.env.PORT) and fallback ports (3000, 8080)
// gracefully ignoring permission errors if running unprivileged without crashing.
const primaryPort = Number(process.env.PORT) || 3000;
const rawCandidatePorts = [primaryPort, 3000, 8080, 80, 8081];
const candidatePorts = Array.from(new Set(rawCandidatePorts.filter(p => !isNaN(p) && p > 0)));

let boundCount = 0;

for (const port of candidatePorts) {
  try {
    const srv = http.createServer(handleRequest);

    srv.on('error', (err) => {
      if (err.code === 'EACCES') {
        console.warn(`[SBF Frontend Server] Cannot bind privileged port ${port} (permission denied, skipping)`);
      } else if (err.code === 'EADDRINUSE') {
        console.warn(`[SBF Frontend Server] Port ${port} is already in use, skipping`);
      } else {
        console.error(`[SBF Frontend Server] Error on port ${port}:`, err.message);
      }
    });

    srv.listen(port, '0.0.0.0', () => {
      boundCount++;
      console.log(`[SBF Frontend Server] Ready and listening on 0.0.0.0:${port}`);
    });
  } catch (err) {
    console.warn(`[SBF Frontend Server] Failed to initiate listener for port ${port}:`, err?.message);
  }
}
