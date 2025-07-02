// Service Worker for SBF Florist
// Version 1.0.0

const CACHE_NAME = 'sbf-cache-v1';
const STATIC_CACHE_NAME = 'sbf-static-v1.0.0';
const API_CACHE_NAME = 'sbf-api-v1.0.0';

// Add Google OAuth URLs to the allowed list
const allowedOrigins = [
  'https://accounts.google.com',
  'https://oauth2.googleapis.com'
];

// Assets to cache immediately
const PRECACHE_ASSETS = [
  '/',
  '/images/logosbf.png',
  '/images/placeholder.svg',
  '/images/1.jpg',
  '/images/2.jpg',
  '/images/3.jpg',
  // Add more critical assets here
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /\/api\/products/,
  /\/api\/categories/,
  /\/api\/settings/,
];

// Install event - cache critical assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Precaching static assets...');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        console.log('Static assets precached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Failed to precache assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && 
                cacheName !== STATIC_CACHE_NAME && 
                cacheName !== API_CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - handle requests with caching strategies
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin) && 
      !allowedOrigins.some(origin => event.request.url.startsWith(origin))) {
    return;
  }

  // Don't cache Google OAuth requests
  if (event.request.url.includes('accounts.google.com') || 
      event.request.url.includes('oauth2.googleapis.com')) {
    return;
  }

  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip unsupported schemes (chrome-extension, moz-extension, etc.)
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return;
  }

  // Handle different types of requests
  if (request.url.includes('/api/')) {
    // API requests - Network First with cache fallback
    event.respondWith(handleAPIRequest(request));
  } else if (request.destination === 'image') {
    // Image requests - Cache First
    event.respondWith(handleImageRequest(request));
  } else if (request.destination === 'document') {
    // HTML requests - Network First with cache fallback
    event.respondWith(handleDocumentRequest(request));
  } else if (request.destination === 'script' || request.destination === 'style') {
    // JS/CSS requests - Cache First with network fallback
    event.respondWith(handleStaticAssetRequest(request));
  } else {
    // Other requests - Network First
    event.respondWith(handleOtherRequests(request));
  }
});

// Handle API requests with Network First strategy
async function handleAPIRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(API_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Network failed, try cache
    console.log('API network failed, trying cache:', request.url);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline response for API failures
    return new Response(
      JSON.stringify({ 
        error: 'Offline', 
        message: 'No network connection available' 
      }),
      { 
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle image requests with Cache First strategy
async function handleImageRequest(request) {
  // Skip caching for unsupported schemes
  const url = new URL(request.url);
  if (url.protocol === 'chrome-extension:' || url.protocol === 'moz-extension:' || url.protocol === 'safari-extension:') {
    return fetch(request);
  }

  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok && url.protocol === 'https:' || url.protocol === 'http:') {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Return placeholder image on failure
    console.log('Image load failed, using placeholder:', request.url);
    return caches.match('/images/placeholder.svg');
  }
}

// Handle document requests with Network First strategy
async function handleDocumentRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Try cache for offline access
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return cached index.html for SPA routing
    return caches.match('/');
  }
}

// Handle static assets with Cache First strategy
async function handleStaticAssetRequest(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Failed to load static asset:', request.url);
    throw error;
  }
}

// Handle other requests with Network First strategy
async function handleOtherRequests(request) {
  try {
    return await fetch(request);
  } catch (error) {
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response('Offline', { status: 503 });
  }
}

// Background sync for failed requests (if supported)
if ('sync' in self.registration) {
  self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
      console.log('Background sync triggered');
      // Handle background sync here
    }
  });
}

// Push notifications (if supported)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New notification from SBF Florist',
    icon: '/images/logosbf.png',
    badge: '/images/logosbf.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification('SBF Florist', options)
  );
});

// Message handler for communication with main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
}); 