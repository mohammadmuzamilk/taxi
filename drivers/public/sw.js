/* global clients */
const CACHE_NAME = 'taxigo-driver-v1';
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

// Background Sync for pending ride updates
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-ride-status') {
    event.waitUntil(syncRideStatus());
  }
});

async function syncRideStatus() {
  const cache = await caches.open('pending-sync-actions');
  const requests = await cache.keys();
  
  return Promise.all(
    requests.map(async (request) => {
      try {
        const response = await fetch(request);
        if (response.ok) {
          await cache.delete(request);
        }
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        console.error('Background sync failed for request:', request.url);
      }
    })
  );
}

// Push Notification Handling
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: 'New Ride Request', body: 'You have a new ride request!' };
  
  const options = {
    body: data.body,
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});

// Fetch with Network First for Driver API
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // ── BYPASS VITE / DEV ASSETS ──
  // Do NOT handle Vite internal paths or HMR requests in the Service Worker
  if (url.pathname.startsWith('/@vite') || url.pathname.startsWith('/src') || url.pathname.startsWith('/node_modules')) {
    return;
  }
  if (url.hostname === 'localhost' && url.port === '5174' && !url.pathname.startsWith('/api')) {
     // Let Vite handle its own static assets in dev
     return;
  }

  if (url.pathname.includes('/api/driver/')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(event.request))
    );
  } else {
    event.respondWith(
      caches.match(event.request).then((res) => {
        return res || fetch(event.request).catch(() => {
          return new Response('Network error', { status: 408 });
        });
      })
    );
  }
});
