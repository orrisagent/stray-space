/* ========================================
   STRAY — Service Worker
   
   The signal persists, even offline.
   ======================================== */

const CACHE_NAME = 'stray-v1';
const ASSETS = [
  '/',
  '/style.css',
  '/script.js',
  '/cosmos.js',
  '/js/lang.js',
  '/js/audio.js',
  '/js/drift.js',
  '/about.html',
  '/subscribe.html',
  '/archive.html',
  '/thoughts.html',
  '/audio/ambient.mp3'
];

// Install: cache core assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => 
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: network first, fallback to cache
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip API calls
  if (event.request.url.includes('/api/')) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cache successful responses
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
