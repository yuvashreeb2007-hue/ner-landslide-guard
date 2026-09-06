/**
 * Service Worker for NER LandslideGuard PWA
 * Provides offline caching, application shell persistence, and offline fallback for emergency disaster operations.
 */

const CACHE_NAME = 'ner-landslideguard-v1';

const APP_SHELL_URLS = [
  '/',
  '/map',
  '/predictions',
  '/weather',
  '/sensors',
  '/reports',
  '/roads',
  '/alerts',
  '/emergency',
  '/field-report',
  '/offline-queue',
  '/manifest.json',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg'
];

// Install Event: Pre-cache core application shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Pre-caching Application Shell');
      return cache.addAll(APP_SHELL_URLS).catch((err) => {
        console.warn('[ServiceWorker] Some non-critical shell URLs failed to cache:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate Event: Clean up stale cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache version:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Network-first with cache fallback for navigation & stale-while-revalidate for static assets
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Only handle GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle HTML navigation requests (Network-first with cached fallback)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(async () => {
          console.log('[ServiceWorker] Offline navigation: serving from cache for', url.pathname);
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          // Fallback to cached root shell or offline-queue
          const fallbackShell = await caches.match('/') || await caches.match('/offline-queue');
          return fallbackShell;
        })
    );
    return;
  }

  // Handle static assets & scripts (Stale-While-Revalidate)
  if (
    url.pathname.startsWith('/_next/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.includes('.css') ||
    url.pathname.includes('.js') ||
    url.hostname.includes('unpkg.com') ||
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com')
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const clone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // Default fetch handler
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});

// Background sync / Push notifications support placeholder
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-field-reports') {
    console.log('[ServiceWorker] Background sync event triggered for field reports');
  }
});
