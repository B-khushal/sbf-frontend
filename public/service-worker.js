const CACHE_VERSION = "v1";
const UI_CACHE = `sbf-ui-${CACHE_VERSION}`;
const APP_CACHE = `sbf-app-${CACHE_VERSION}`;
const API_CACHE = `sbf-api-${CACHE_VERSION}`;

const OFFLINE_PAGE_URL = "/admin-offline.html";
const ADMIN_VENDOR_ROUTE = /^\/(admin|vendor)(\/|$)/;

const PRECACHE_URLS = [
  OFFLINE_PAGE_URL,
  "/admin",
  "/vendor",
  "/manifest.json",
  "/manifest-admin.json",
  "/manifest-vendor.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

const isStaticAssetRequest = (request, pathname) => {
  if (
    request.destination === "script" ||
    request.destination === "style" ||
    request.destination === "image" ||
    request.destination === "font"
  ) {
    return true;
  }

  if (pathname.startsWith("/assets/")) {
    return true;
  }

  return /\.(?:js|css|png|jpg|jpeg|svg|webp|gif|woff2?|ttf|eot|ico)$/i.test(
    pathname,
  );
};

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(APP_CACHE);
      await Promise.allSettled(PRECACHE_URLS.map((url) => cache.add(url)));
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter(
            (key) =>
              key !== UI_CACHE && key !== APP_CACHE && key !== API_CACHE,
          )
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

const cacheFirst = async (request, cacheName) => {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  const networkResponse = await fetch(request);
  if (networkResponse && networkResponse.ok) {
    cache.put(request, networkResponse.clone());
  }
  return networkResponse;
};

const networkFirst = async (request, cacheName) => {
  const cache = await caches.open(cacheName);
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
};

const adminRouteCacheFirst = async (request) => {
  const cache = await caches.open(APP_CACHE);
  const url = new URL(request.url);
  const routeRequest = new Request(`${url.origin}${url.pathname}`);
  const cachedResponse = await cache.match(routeRequest);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.ok) {
      cache.put(routeRequest, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    return (
      (await cache.match(OFFLINE_PAGE_URL)) ||
      new Response("Offline", { status: 503, statusText: "Offline" })
    );
  }
};

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  const { pathname } = url;

  if (pathname.startsWith("/api/")) {
    event.respondWith(
      networkFirst(request, API_CACHE).catch(
        () =>
          new Response(JSON.stringify({ error: "Offline" }), {
            status: 503,
            headers: { "Content-Type": "application/json" },
          }),
      ),
    );
    return;
  }

  if (request.mode === "navigate" && ADMIN_VENDOR_ROUTE.test(pathname)) {
    event.respondWith(adminRouteCacheFirst(request));
    return;
  }

  if (isStaticAssetRequest(request, pathname)) {
    event.respondWith(cacheFirst(request, UI_CACHE));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(
        async () =>
          (await caches.match(request)) ||
          new Response("Offline", { status: 503, statusText: "Offline" }),
      ),
    );
  }
});
