const CACHE_NAME = 'frank-drop-v1';
const ASSETS = [
  '/',
  '/manifest.json',
  '/globals.css',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Frank Drop';
  const options = {
    body: data.body || 'Transfer complete!',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
  };
  event.waitUntil(self.registration.showNotification(title, options));
});
