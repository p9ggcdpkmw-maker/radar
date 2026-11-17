/* RADAR Service Worker v3 */
const CACHE_VERSION = 'radar-v3';
const SHELL = ['./', './index.html', './manifest.json',
               './icon-192.png', './icon-512.png', './icon-maskable-512.png',
               './apple-touch-icon.png', './favicon-32.png'];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(function(c) {
      return Promise.allSettled(SHELL.map(function(u) { return c.add(u); }));
    }).then(function() { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.filter(function(k) { return k !== CACHE_VERSION; })
        .map(function(k) { return caches.delete(k); }));
    }).then(function() { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(event) {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (req.headers.has('range')) return;

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).then(function(res) {
        const copy = res.clone();
        caches.open(CACHE_VERSION).then(function(c) { c.put('./index.html', copy); });
        return res;
      }).catch(function() {
        return caches.match('./index.html').then(function(r) { return r || caches.match('./'); });
      })
    );
    return;
  }

  if (url.pathname.endsWith('.json')) {
    const key = new Request(url.pathname);
    event.respondWith(
      fetch(req).then(function(res) {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then(function(c) { c.put(key, copy); });
        }
        return res;
      }).catch(function() {
        return caches.match(key).then(function(r) {
          return r || new Response('{"items":[]}', { headers: { 'Content-Type': 'application/json' } });
        });
      })
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(function(cached) {
      const net = fetch(req).then(function(res) {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then(function(c) { c.put(req, copy); });
        }
        return res;
      }).catch(function() { return cached; });
      return cached || net;
    })
  );
});
