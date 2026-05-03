/* global clients */
const CACHE_NAME = 'taxigo-client-v1'; // Bumped version forces new SW install
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/pwa-192x192.png',
  '/pwa-512x512.png'
];

// Install Event
self.addEventListener('install', (event) => {
  // Force the new SW to become active immediately
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Opened cache v2');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activate Event
self.addEventListener('activate', (event) => {
  // Take control of all open pages immediately
  event.waitUntil(
    clients.claim().then(() =>
      caches.keys().then((cacheNames) =>
        Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        )
      )
    )
  );
});

// Fetch Event
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const method = event.request.method;

  // ── BYPASS VITE / DEV ASSETS ──
  // We bypass everything that looks like a Vite/Dev asset or if we're in dev mode (port 5173) 
  // EXCEPT for the manifest and icons which are needed for PWA installability.
  const isDevPort = url.port === '5173' || url.port === '5174';
  const isViteAsset = url.pathname.startsWith('/@vite') ||
    url.pathname.startsWith('/src') ||
    url.pathname.startsWith('/node_modules') ||
    url.pathname.endsWith('.jsx') ||
    url.pathname.endsWith('.js') && !url.pathname.endsWith('sw.js');

  if ((isDevPort || isViteAsset) && !url.pathname.startsWith('/api') && !url.pathname.includes('manifest.json') && !url.pathname.includes('pwa-')) {
    return; // Let the browser handle these normally
  }

  // Only handle GET requests — Cache API does NOT support POST/PUT/PATCH/DELETE
  if (method !== 'GET') return;

  // API Calls (GET only): Network First, fallback to cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Only cache valid successful responses
          if (response && response.status === 200 && response.type !== 'opaque') {
            const resClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, resClone);
            });
          }
          return response;
        })
        .catch(async (err) => {
          const cachedResponse = await caches.match(event.request);
          if (cachedResponse) return cachedResponse;
          // If no cache, re-throw so the browser shows the network error instead of a SW crash
          throw err;
        })
    );
  } else {
    // Static Assets: Cache First, then Network
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request).catch(() => {
          // If both fail, return a basic offline response or just let it fail silently
          return new Response('Network error occurred', { status: 408 });
        });
      })
    );
  }
});
