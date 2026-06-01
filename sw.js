const CACHE = 'bracu-cgpa-v1';
const ASSETS = [
  '/bracu-cgpa-calculator/',
  '/bracu-cgpa-calculator/index.html',
  '/bracu-cgpa-calculator/style.css',
  '/bracu-cgpa-calculator/script.js',
  '/bracu-cgpa-calculator/manifest.json',
  '/bracu-cgpa-calculator/favicon.svg',
  '/bracu-cgpa-calculator/favicon-32x32.png',
  '/bracu-cgpa-calculator/favicon-16x16.png',
  '/bracu-cgpa-calculator/apple-touch-icon.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request))
  );
});
