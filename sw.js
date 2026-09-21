// Chhattisgadhiya Cloud - Progressive Web App Service Worker
// Version: 1.0.0
const CACHE_NAME = 'cgcloud-pwa-v1';

const PRECACHE_ASSETS = [
  './',
  './index.html',
  './en/',
  './hi/',
  './manifest.webmanifest',
  './favicon.svg',
  './apple-touch-icon.png',
  './src/styles.css',
  './src/app.js',
  './src/reader/hybrid-reader.js',
  './src/assets/icons/icon-192.png',
  './src/assets/icons/icon-512.png',
  './src/assets/icons/icon-192-maskable.png',
  './src/assets/icons/icon-512-maskable.png',
  './src/assets/images/hero-art.svg',
  './src/assets/images/festival-jashrang.svg',
  './src/assets/images/festival-kavita.svg',
  './src/assets/images/camp-ullas.svg',
  './src/assets/images/play-vasu.svg',
  './src/assets/images/play-vincent.svg',
  './src/assets/images/play-gabar.svg',
  './src/assets/images/play-raja.svg'
];

// Offline Fallback HTML response when navigating without internet
const OFFLINE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Offline | Chhattisgadhiya Cloud</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0; padding: 2rem; background: #FAF8F5; color: #202124;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      min-height: 80vh; text-align: center;
    }
    .offline-icon { font-size: 3.5rem; margin-bottom: 1rem; }
    h1 { color: #FF4500; font-size: 1.8rem; margin-bottom: 0.5rem; }
    p { max-width: 480px; font-size: 1rem; color: #5F6368; line-height: 1.6; }
    .btn {
      margin-top: 1.5rem; background: #FF4500; color: #fff; text-decoration: none;
      padding: 0.75rem 1.5rem; border-radius: 9999px; font-weight: 700;
      border: none; cursor: pointer; display: inline-block;
    }
  </style>
</head>
<body>
  <div class="offline-icon">📡</div>
  <h1>You are currently offline</h1>
  <p>You can still browse previously visited pages and issues of Chhattisgadhiya Cloud from your device cache.</p>
  <button class="btn" onclick="window.location.reload()">Retry Connection</button>
</body>
</html>`;

// Install Event: precache core shell
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Add assets safely one by one so single 404 does not break entire installation
      for (const asset of PRECACHE_ASSETS) {
        try {
          await cache.add(asset);
        } catch (err) {
          console.warn('[SW] Could not precache:', asset, err);
        }
      }
    })
  );
});

// Activate Event: purge stale caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event Strategy:
// - Navigation requests: Network-First with Cache fallback, then Offline Page
// - Static assets (CSS/JS/images/fonts): Stale-While-Revalidate
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Ignore non-GET or chrome-extension schemes
  if (request.method !== 'GET' || !request.url.startsWith('http')) {
    return;
  }

  // 1. Navigation requests (HTML pages)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // Attempt to find in cache
          const cached = await caches.match(request);
          if (cached) return cached;

          // Attempt fallback to root or localized home
          const fallbackEn = await caches.match('./en/');
          if (fallbackEn) return fallbackEn;

          return new Response(OFFLINE_HTML, {
            headers: { 'Content-Type': 'text/html; charset=utf-8' }
          });
        })
    );
    return;
  }

  // 2. Static Assets (CSS, JS, SVG, Images, Webmanifest)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
