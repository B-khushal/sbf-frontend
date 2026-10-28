import { spawn } from 'child_process';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

export const EXPECTED_ROUTES = [
  { path: '/', expectedH1: 'Flower Delivery in Hyderabad for Every Special Occasion', expectedCanonical: 'https://sbflorist.in/' },
  { path: '/shop', expectedH1: 'Shop Flowers, Bouquets, Cakes & Gifts Online', expectedCanonical: 'https://sbflorist.in/shop' },
  { path: '/about', expectedH1: 'About Spring Blossoms Florist', expectedCanonical: 'https://sbflorist.in/about' },
  { path: '/contact', expectedH1: 'Contact Spring Blossoms Florist', expectedCanonical: 'https://sbflorist.in/contact' },
  { path: '/shipping', expectedH1: 'Flower & Gift Delivery Information', expectedCanonical: 'https://sbflorist.in/shipping' },
  { path: '/refund-policy', expectedH1: 'Refund Policy', expectedCanonical: 'https://sbflorist.in/refund-policy' },
  { path: '/cancellation-policy', expectedH1: 'Cancellation Policy', expectedCanonical: 'https://sbflorist.in/cancellation-policy' },
  { path: '/flower-delivery-hyderabad', expectedH1: 'Flower Delivery in Hyderabad', expectedCanonical: 'https://sbflorist.in/flower-delivery-hyderabad' },
  { path: '/flower-delivery-secunderabad', expectedH1: 'Flower Delivery in Secunderabad', expectedCanonical: 'https://sbflorist.in/flower-delivery-secunderabad' },
  { path: '/shop/cakes', expectedH1: 'Order Cakes Online', expectedCanonical: 'https://sbflorist.in/shop/cakes' },
  { path: '/shop/combos', expectedH1: 'Flowers, Cakes & Gift Combos', expectedCanonical: 'https://sbflorist.in/shop/combos' },
  { path: '/shop/plants', expectedH1: 'Shop Plants Online', expectedCanonical: 'https://sbflorist.in/shop/plants' },
  { path: '/shop/bouquets', expectedH1: 'Fresh Flower Bouquets', expectedCanonical: 'https://sbflorist.in/shop/bouquets' },
  { path: '/shop/chocolates', expectedH1: 'Shop Chocolates Online', expectedCanonical: 'https://sbflorist.in/shop/chocolates' },
  { path: '/occasions/romance', expectedH1: 'Romantic Flowers & Gifts', expectedCanonical: 'https://sbflorist.in/occasions/romance' },
  { path: '/occasions/birthday', expectedH1: 'Birthday Flowers & Gifts', expectedCanonical: 'https://sbflorist.in/occasions/birthday' },
  { path: '/occasions/sympathy', expectedH1: 'Sympathy Flowers & Condolence Gifts', expectedCanonical: 'https://sbflorist.in/occasions/sympathy' },
  { path: '/occasions/anniversary', expectedH1: 'Anniversary Flowers & Gifts', expectedCanonical: 'https://sbflorist.in/occasions/anniversary' },
  { path: '/occasions/get-well-soon', expectedH1: 'Get Well Soon Flowers & Gifts', expectedCanonical: 'https://sbflorist.in/occasions/get-well-soon' },
  { path: '/occasions/congratulations', expectedH1: 'Congratulations Flowers & Gifts', expectedCanonical: 'https://sbflorist.in/occasions/congratulations' },
];

const decodeEntities = (str) =>
  str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();

const fetchInitialHtml = (baseUrl, routePath) =>
  new Promise((resolve, reject) => {
    const req = http.get(`${baseUrl}${routePath}`, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, html: body }));
    });
    req.on('error', reject);
  });

const fetchBinaryAsset = (baseUrl, assetPath) =>
  new Promise((resolve, reject) => {
    const req = http.get(`${baseUrl}${assetPath}`, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () =>
        resolve({
          statusCode: res.statusCode,
          contentType: res.headers['content-type'] || '',
          byteLength: Buffer.concat(chunks).length,
        })
      );
    });
    req.on('error', reject);
  });

function validateHomepageFloristSchema(rawScripts, contextLabel) {
  if (!Array.isArray(rawScripts) || rawScripts.length === 0) {
    throw new Error(`[${contextLabel}] No application/ld+json scripts found on homepage`);
  }

  const parsedSchemas = rawScripts.map((raw, idx) => {
    try {
      return JSON.parse(raw);
    } catch (err) {
      throw new Error(`[${contextLabel}] Invalid JSON in application/ld+json script #${idx + 1}: ${err.message}`);
    }
  });

  const floristSchemas = parsedSchemas.filter((s) => s && s['@type'] === 'Florist');
  if (floristSchemas.length !== 1) {
    throw new Error(
      `[${contextLabel}] Expected exactly 1 top-level Florist schema on homepage, found ${floristSchemas.length}`
    );
  }

  const florist = floristSchemas[0];
  if (florist['@context'] !== 'https://schema.org') {
    throw new Error(`[${contextLabel}] Expected @context "https://schema.org", got "${florist['@context']}"`);
  }
  if (florist['@id'] !== 'https://sbflorist.in/#business') {
    throw new Error(`[${contextLabel}] Expected canonical @id "https://sbflorist.in/#business", got "${florist['@id']}"`);
  }
  if (florist.name !== 'Spring Blossoms Florist') {
    throw new Error(`[${contextLabel}] Expected name "Spring Blossoms Florist", got "${florist.name}"`);
  }
  if (florist.url !== 'https://sbflorist.in/') {
    throw new Error(`[${contextLabel}] Expected url "https://sbflorist.in/", got "${florist.url}"`);
  }
  if (florist.telephone !== '+919949683222') {
    throw new Error(`[${contextLabel}] Expected telephone "+919949683222", got "${florist.telephone}"`);
  }
  if (florist.image !== 'https://sbflorist.in/images/logo_final.png') {
    throw new Error(
      `[${contextLabel}] Expected verified image URL "https://sbflorist.in/images/logo_final.png", got "${florist.image}"`
    );
  }
  if (florist.logo !== 'https://sbflorist.in/images/logo_final.png') {
    throw new Error(
      `[${contextLabel}] Expected verified logo URL "https://sbflorist.in/images/logo_final.png", got "${florist.logo}"`
    );
  }
  if (!florist.address || florist.address['@type'] !== 'PostalAddress') {
    throw new Error(`[${contextLabel}] Missing or invalid PostalAddress in Florist schema`);
  }
  if (
    florist.address.streetAddress !==
      'Pillar Number 32, Najam Centre, A/B, Door No. 12-2, 786, Rethi Bowli Road, Mehdipatnam' ||
    florist.address.addressLocality !== 'Hyderabad' ||
    florist.address.addressRegion !== 'Telangana' ||
    florist.address.postalCode !== '500006' ||
    florist.address.addressCountry !== 'IN'
  ) {
    throw new Error(`[${contextLabel}] PostalAddress mismatch: ${JSON.stringify(florist.address)}`);
  }
  if (
    !florist.geo ||
    florist.geo['@type'] !== 'GeoCoordinates' ||
    florist.geo.latitude !== 17.395077 ||
    florist.geo.longitude !== 78.433996
  ) {
    throw new Error(`[${contextLabel}] GeoCoordinates mismatch: ${JSON.stringify(florist.geo)}`);
  }
  if (florist.hasMap !== 'https://www.google.com/maps?cid=8660521669298042697') {
    throw new Error(`[${contextLabel}] hasMap mismatch: "${florist.hasMap}"`);
  }
  if (
    !Array.isArray(florist.openingHoursSpecification) ||
    florist.openingHoursSpecification.length !== 1 ||
    florist.openingHoursSpecification[0].opens !== '08:00' ||
    florist.openingHoursSpecification[0].closes !== '23:00' ||
    florist.openingHoursSpecification[0].dayOfWeek?.length !== 7
  ) {
    throw new Error(
      `[${contextLabel}] openingHoursSpecification mismatch: ${JSON.stringify(florist.openingHoursSpecification)}`
    );
  }

  console.log(
    `[PASS Florist Schema - ${contextLabel}] @id="${florist['@id']}" @type="${florist['@type']}" image="${florist.image}"`
  );
}

async function runAudit() {
  console.log('=== 1. Verifying Generated Static Dist HTML Files & Homepage Florist Schema ===');
  const distDir = path.join(projectRoot, 'dist');
  for (const route of EXPECTED_ROUTES) {
    const rel = route.path === '/' ? 'index.html' : path.join(route.path.slice(1), 'index.html');
    const fullPath = path.join(distDir, rel);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Missing pre-rendered HTML file: ${fullPath}`);
    }
    const html = fs.readFileSync(fullPath, 'utf-8');
    const h1Matches = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)];
    if (h1Matches.length !== 1) {
      throw new Error(`Expected exactly 1 <h1> in ${rel}, found ${h1Matches.length}`);
    }
    const h1Text = decodeEntities(h1Matches[0][1].replace(/<[^>]+>/g, ''));
    if (h1Text !== route.expectedH1) {
      throw new Error(`Initial HTML H1 mismatch in ${rel}: expected "${route.expectedH1}", got "${h1Text}"`);
    }
    const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
    const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i);
    const canonMatch = html.match(/<link\s+rel="canonical"\s+href="([^"]*)"/i);
    if (!titleMatch || !decodeEntities(titleMatch[1])) {
      throw new Error(`Missing <title> in ${rel}`);
    }
    if (!descMatch || !decodeEntities(descMatch[1])) {
      throw new Error(`Missing meta description in ${rel}`);
    }
    if (!canonMatch) {
      throw new Error(`Missing canonical link in ${rel}`);
    }
    if (route.path === '/') {
      const ldMatches = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)].map(
        (m) => m[1].trim()
      );
      validateHomepageFloristSchema(ldMatches, 'Static dist/index.html');
    }
    console.log(`[PASS Initial HTML] ${route.path} -> <h1>${h1Text}</h1>`);
  }

  console.log('\n=== 2. Starting Production Preview Server & Running Browser DOM Verification ===');
  const PORT = 4173;
  const BASE_URL = `http://127.0.0.1:${PORT}`;
  const viteBin = path.join(projectRoot, 'node_modules', 'vite', 'bin', 'vite.js');
  const serverProc = spawn(process.execPath, [viteBin, 'preview', '--host', '127.0.0.1', '--port', String(PORT)], {
    cwd: projectRoot,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Preview server startup timeout')), 15000);
    const checkReady = async () => {
      try {
        const res = await fetchInitialHtml(BASE_URL, '/');
        if (res.statusCode === 200) {
          clearTimeout(timeout);
          resolve();
          return;
        }
      } catch (_) {}
      setTimeout(checkReady, 300);
    };
    checkReady();
  });

  try {
    // Verify image URL resolves with HTTP 200 and image/png
    const imageCheck = await fetchBinaryAsset(BASE_URL, '/images/logo_final.png');
    if (imageCheck.statusCode !== 200 || !imageCheck.contentType.includes('image/png') || imageCheck.byteLength < 10000) {
      throw new Error(
        `Business image verification failed for /images/logo_final.png: ${JSON.stringify(imageCheck)}`
      );
    }
    console.log(
      `[PASS Verified Business Image] /images/logo_final.png -> HTTP ${imageCheck.statusCode} (${imageCheck.contentType}, ${imageCheck.byteLength} bytes)`
    );

    // Verify HTTP responses from live server
    for (const route of EXPECTED_ROUTES) {
      const { statusCode, html } = await fetchInitialHtml(BASE_URL, route.path);
      if (statusCode !== 200) {
        throw new Error(`HTTP status ${statusCode} for ${route.path}`);
      }
      const h1Matches = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)];
      if (h1Matches.length !== 1) {
        throw new Error(`HTTP response for ${route.path} has ${h1Matches.length} <h1> tags`);
      }
      const h1Text = decodeEntities(h1Matches[0][1].replace(/<[^>]+>/g, ''));
      if (h1Text !== route.expectedH1) {
        throw new Error(`HTTP response H1 mismatch for ${route.path}: expected "${route.expectedH1}", got "${h1Text}"`);
      }
      if (route.path === '/') {
        const ldMatches = [
          ...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi),
        ].map((m) => m[1].trim());
        validateHomepageFloristSchema(ldMatches, 'Server HTTP GET /');
      }
    }

    // Try launching headless Chromium/Edge via Playwright if available, or CDP headless browser
    let browserTested = false;
    try {
      const { chromium } = await import('playwright');
      const browser = await chromium.launch();
      await runPlaywrightChecks(browser, BASE_URL);
      await browser.close();
      browserTested = true;
    } catch (e) {
      // Fallback: use local Edge/Chrome via Chrome DevTools Protocol (CDP)
      await runCdpBrowserChecks(BASE_URL);
      browserTested = true;
    }

    if (!browserTested) {
      throw new Error('Browser verification did not run');
    }
    console.log('\nALL 20 ROUTES + HOMEPAGE FLORIST JSON-LD SCHEMA PASSED INITIAL HTML + RENDERED DOM CHECKS!');
  } finally {
    serverProc.kill();
  }
}

async function runPlaywrightChecks(browser, baseUrl) {
  const viewports = [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'mobile', width: 390, height: 844 },
  ];

  for (const vp of viewports) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();

    for (const route of EXPECTED_ROUTES) {
      const response = await page.goto(`${baseUrl}${route.path}`, { waitUntil: 'domcontentloaded' });
      if (!response || response.status() !== 200) {
        throw new Error(`[${vp.name}] Failed to load ${route.path}`);
      }
      const headings = page.locator('h1');
      const count = await headings.count();
      if (count !== 1) {
        throw new Error(`[${vp.name}] Expected 1 <h1> on ${route.path}, found ${count}`);
      }
      const isVisible = await headings.first().isVisible();
      if (!isVisible) {
        throw new Error(`[${vp.name}] <h1> on ${route.path} is not visible`);
      }
      const text = (await headings.first().textContent())?.replace(/\s+/g, ' ').trim();
      if (text !== route.expectedH1) {
        throw new Error(`[${vp.name}] H1 mismatch on ${route.path}: expected "${route.expectedH1}", got "${text}"`);
      }
      if (route.path === '/') {
        const ldScripts = await page.locator('script[type="application/ld+json"]').allTextContents();
        validateHomepageFloristSchema(ldScripts, `Playwright Live DOM (${vp.name})`);
      }
      console.log(`[PASS Browser ${vp.name}] ${route.path} -> "${text}" (count=1, visible=true)`);
    }
    await context.close();
  }
}

async function runCdpBrowserChecks(baseUrl) {
  const edgePaths = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  ];
  const browserBin = edgePaths.find((p) => fs.existsSync(p));
  if (!browserBin) {
    throw new Error('No Chromium/Edge binary found for headless DOM testing');
  }

  const debugPort = 9229;
  const userDataDir = path.join(projectRoot, 'dist', '.tmp-chrome-profile');
  fs.mkdirSync(userDataDir, { recursive: true });

  const browserProc = spawn(
    browserBin,
    [
      '--headless=new',
      '--disable-gpu',
      '--no-first-run',
      '--no-default-browser-check',
      `--remote-debugging-port=${debugPort}`,
      `--user-data-dir=${userDataDir}`,
      'about:blank',
    ],
    { stdio: 'ignore' }
  );

  try {
    // Wait for CDP endpoint
    let targets = null;
    for (let i = 0; i < 40; i++) {
      try {
        const res = await new Promise((resolve, reject) => {
          http.get(`http://127.0.0.1:${debugPort}/json/list`, (r) => {
            let d = '';
            r.on('data', (c) => (d += c));
            r.on('end', () => resolve(JSON.parse(d)));
          }).on('error', reject);
        });
        if (Array.isArray(res) && res.length > 0) {
          const pageTarget = res.find((t) => t.type === 'page' && (t.url === 'about:blank' || t.url.startsWith('http'))) || res.find((t) => t.type === 'page');
          if (pageTarget) {
            targets = [pageTarget];
            break;
          }
        }
      } catch (_) {}
      await new Promise((r) => setTimeout(r, 250));
    }

    if (!targets || !targets[0]?.webSocketDebuggerUrl) {
      throw new Error('Failed to connect to headless browser CDP');
    }

    const wsUrl = targets[0].webSocketDebuggerUrl;
    const ws = new WebSocket(wsUrl);
    await new Promise((resolve, reject) => {
      ws.addEventListener('open', resolve);
      ws.addEventListener('error', reject);
    });

    let msgId = 1;
    const pending = new Map();
    ws.addEventListener('message', (event) => {
      const data = JSON.parse(event.data);
      if (data.id && pending.has(data.id)) {
        const { resolve, reject } = pending.get(data.id);
        pending.delete(data.id);
        if (data.error) reject(new Error(data.error.message));
        else resolve(data.result);
      }
    });

    const sendCdp = (method, params = {}) =>
      new Promise((resolve, reject) => {
        const id = msgId++;
        pending.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params }));
      });

    await sendCdp('Page.enable');
    await sendCdp('Runtime.enable');

    ws.addEventListener('message', (event) => {
      const data = JSON.parse(event.data);
      if (data.method === 'Runtime.exceptionThrown') {
        console.error('[Browser Exception]', JSON.stringify(data.params.exceptionDetails));
      }
    });

    const viewports = [
      { name: 'desktop', width: 1440, height: 900, mobile: false },
      { name: 'tablet', width: 768, height: 1024, mobile: true },
      { name: 'mobile', width: 390, height: 844, mobile: true },
    ];

    for (const vp of viewports) {
      await sendCdp('Emulation.setDeviceMetricsOverride', {
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: 1,
        mobile: vp.mobile,
      });

      for (const route of EXPECTED_ROUTES) {
        await sendCdp('Page.navigate', { url: `${baseUrl}${route.path}` });

        // Poll until React mounts and renders the expected H1 visibly
        let lastResult = null;
        for (let attempt = 0; attempt < 30; attempt++) {
          await new Promise((r) => setTimeout(r, 200));
          const evalRes = await sendCdp('Runtime.evaluate', {
            expression: `(() => {
              const root = document.getElementById('root');
              const isReactMounted = Boolean(root && root.firstElementChild && !root.firstElementChild.getAttribute('style')?.includes('max-width: 1200px'));
              const h1s = Array.from(document.querySelectorAll('h1'));
              const details = h1s.map(el => {
                const style = window.getComputedStyle(el);
                const rect = el.getBoundingClientRect();
                const visible = style.display !== 'none' &&
                                style.visibility !== 'hidden' &&
                                parseFloat(style.opacity || '1') > 0 &&
                                rect.width > 0 &&
                                rect.height > 0;
                return {
                  text: (el.textContent || '').replace(/\\s+/g, ' ').trim(),
                  visible,
                  insideMain: Boolean(el.closest('main')),
                  fontSize: style.fontSize,
                };
              });
              const ldScripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map(s => s.textContent || '');
              return {
                url: window.location.href,
                isReactMounted,
                count: h1s.length,
                details,
                ldScripts,
                title: document.title,
                canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') || '',
                metaDesc: document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
              };
            })()`,
            returnByValue: true,
          });
          lastResult = evalRes?.result?.value;
          if (
            lastResult &&
            lastResult.isReactMounted &&
            lastResult.count === 1 &&
            lastResult.details[0]?.visible &&
            lastResult.details[0]?.text === route.expectedH1 &&
            (route.path !== '/' || (Array.isArray(lastResult.ldScripts) && lastResult.ldScripts.length === 3))
          ) {
            break;
          }
        }

        if (!lastResult || !lastResult.isReactMounted || lastResult.count !== 1) {
          throw new Error(
            `[${vp.name}] Route ${route.path} rendered (isReactMounted=${lastResult?.isReactMounted}, count=${lastResult?.count}): ${JSON.stringify(lastResult)}`
          );
        }
        const h1Info = lastResult.details[0];
        if (!h1Info.visible) {
          throw new Error(`[${vp.name}] Route ${route.path} <h1> is not visible: ${JSON.stringify(h1Info)}`);
        }
        if (!h1Info.insideMain) {
          throw new Error(`[${vp.name}] Route ${route.path} <h1> is not inside <main>: ${JSON.stringify(h1Info)}`);
        }
        if (h1Info.text !== route.expectedH1) {
          throw new Error(
            `[${vp.name}] Route ${route.path} H1 mismatch: expected "${route.expectedH1}", got "${h1Info.text}"`
          );
        }
        if (route.path === '/') {
          if (lastResult.canonical !== 'https://sbflorist.in/') {
            throw new Error(`[${vp.name}] Homepage canonical mismatch: expected "https://sbflorist.in/", got "${lastResult.canonical}"`);
          }
          validateHomepageFloristSchema(lastResult.ldScripts, `Rendered DOM (${vp.name})`);
        }
        console.log(
          `[PASS Rendered DOM ${vp.name}] ${route.path} -> H1="${h1Info.text}" (count=1, visible=true, inMain=true, title="${lastResult.title}")`
        );
      }
    }

    // Client-side SPA navigation test (without full page reload)
    await sendCdp('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await sendCdp('Page.navigate', { url: `${baseUrl}/shop` });
    await new Promise((r) => setTimeout(r, 800));

    for (const navRoute of EXPECTED_ROUTES.slice(1)) {
      await sendCdp('Runtime.evaluate', {
        expression: `(() => {
          window.history.pushState({}, '', '${navRoute.path}');
          window.dispatchEvent(new PopStateEvent('popstate'));
        })()`,
      });
      let navResult = null;
      for (let attempt = 0; attempt < 25; attempt++) {
        await new Promise((r) => setTimeout(r, 150));
        const evalRes = await sendCdp('Runtime.evaluate', {
          expression: `(() => {
            const h1s = Array.from(document.querySelectorAll('h1'));
            if (h1s.length !== 1) return { count: h1s.length };
            const el = h1s[0];
            const style = window.getComputedStyle(el);
            const rect = el.getBoundingClientRect();
            return {
              count: 1,
              text: (el.textContent || '').replace(/\\s+/g, ' ').trim(),
              visible: style.display !== 'none' && style.visibility !== 'hidden' && parseFloat(style.opacity || '1') > 0 && rect.width > 0 && rect.height > 0,
            };
          })()`,
          returnByValue: true,
        });
        navResult = evalRes?.result?.value;
        if (navResult?.count === 1 && navResult?.visible && navResult?.text === navRoute.expectedH1) {
          break;
        }
      }
      if (!navResult || navResult.count !== 1 || !navResult.visible || navResult.text !== navRoute.expectedH1) {
        throw new Error(`Client-side navigation to ${navRoute.path} failed: ${JSON.stringify(navResult)}`);
      }
      console.log(`[PASS SPA Client Navigation] -> ${navRoute.path}: "${navResult.text}"`);
    }

    ws.close();
  } finally {
    browserProc.kill();
    try {
      await new Promise((r) => setTimeout(r, 300));
      fs.rmSync(userDataDir, { recursive: true, force: true });
    } catch (_) {}
  }
}

runAudit().catch((err) => {
  console.error('SEO Audit Failed:', err);
  process.exit(1);
});
