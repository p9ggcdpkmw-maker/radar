/* RADAR Service Worker v6 — tek dosya index.html */
const V = 'radar-v13';
const SHELL = [
  './', './index.html', './manifest.json',
  './icon-192.png', './icon-512.png', './icon-maskable-512.png',
  './apple-touch-icon.png', './favicon-32.png', './logo.png'
];
const INDEX = './index.html';

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(V)
      .then(c => Promise.allSettled(SHELL.map(u => c.add(new Request(u, { cache: 'reload' })))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== V).map(k => caches.delete(k)));
    if (self.registration.navigationPreload) {
      try { await self.registration.navigationPreload.enable(); } catch (_) {}
    }
    await self.clients.claim();
  })());
});

self.addEventListener('message', e => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});

const jsonFallback = path => new Response(
  path.endsWith('archive/index.json') ? '{"dates":[]}' : '{"items":[]}',
  { status: 200, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
);

self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;

  const u = new URL(r.url);
  if (u.origin !== self.location.origin) return;
  if (r.headers.has('range')) return;
  if (u.pathname.endsWith('/sw.js')) return;

  /* Sayfa gezinmesi: önce ağ, çevrimdışıysa önbellek */
  if (r.mode === 'navigate') {
    e.respondWith((async () => {
      try {
        const pre = await e.preloadResponse;
        const res = pre || await fetch(r);
        if (res && res.ok) {
          const c = await caches.open(V);
          await c.put(INDEX, res.clone());
        }
        return res;
      } catch (_) {
        const c = await caches.open(V);
        return (await c.match(INDEX)) || (await c.match('./')) ||
          new Response('<!doctype html><meta charset="utf-8"><title>RADAR</title><body style="font:600 16px system-ui;padding:40px;background:#0B1020;color:#EEF2FF">Çevrimdışısın ve önbellek boş. Bağlanıp bir kez aç.</body>',
            { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
      }
    })());
    return;
  }

  /* JSON ve RSS: önce ağ, önbellek anahtarı sorgusuz (?t= yok sayılır) */
  if (u.pathname.endsWith('.json') || u.pathname.endsWith('.xml')) {
    const key = new Request(u.pathname);
    const isJson = u.pathname.endsWith('.json');
    e.respondWith((async () => {
      const c = await caches.open(V);
      try {
        const res = await fetch(r);
        if (res && res.ok) await c.put(key, res.clone());
        return res;
      } catch (_) {
        const hit = await c.match(key);
        if (hit) return hit;
        return isJson ? jsonFallback(u.pathname) : new Response('', { status: 504 });
      }
    })());
    return;
  }

  /* Kabuk varlıkları: önbellekten hemen ver, arka planda tazele */
  e.respondWith((async () => {
    const c = await caches.open(V);
    const hit = await c.match(r);
    const net = fetch(r).then(res => {
      if (res && res.ok && res.type === 'basic') c.put(r, res.clone());
      return res;
    }).catch(() => null);
    return hit || (await net) || new Response('', { status: 504 });
  })());
});
