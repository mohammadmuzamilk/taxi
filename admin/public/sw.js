const CACHE_NAME = 'taxigo-admin-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/pwa-192x192.png',
  '/pwa-512x512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
  );
});

// Admin typically needs fresh data, so Network Only for API or Network First
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // ── BYPASS VITE / DEV ASSETS ──
  if (url.hostname === 'localhost' && url.port === '5175' && (url.pathname.startsWith('/@vite') || url.pathname.startsWith('/src') || url.pathname.startsWith('/node_modules'))) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((res) => {
      return res || fetch(event.request).catch(() => {
        return new Response('Network error', { status: 408 });
      });
    })
  );
});
