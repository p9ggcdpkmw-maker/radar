/* RADAR Service Worker v4 */
const V='radar-v4';
const SHELL=['./','./index.html','./radar.css','./radar.js','./manifest.json',
 './icon-192.png','./icon-512.png','./icon-maskable-512.png','./apple-touch-icon.png','./favicon-32.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>Promise.allSettled(SHELL.map(u=>c.add(u)))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
 const r=e.request;if(r.method!=='GET')return;
 const u=new URL(r.url);if(u.origin!==self.location.origin)return;if(r.headers.has('range'))return;
 if(r.mode==='navigate'){e.respondWith(fetch(r).then(res=>{const c=res.clone();caches.open(V).then(x=>x.put('./index.html',c));return res})
  .catch(()=>caches.match('./index.html').then(x=>x||caches.match('./'))));return}
 if(u.pathname.endsWith('.json')){const key=new Request(u.pathname);
  e.respondWith(fetch(r).then(res=>{if(res&&res.ok){const c=res.clone();caches.open(V).then(x=>x.put(key,c))}return res})
   .catch(()=>caches.match(key).then(x=>x||new Response('{"items":[]}',{headers:{'Content-Type':'application/json'}}))));return}
 e.respondWith(caches.match(r).then(hit=>{
  const net=fetch(r).then(res=>{if(res&&res.ok){const c=res.clone();caches.open(V).then(x=>x.put(r,c))}return res}).catch(()=>hit);
  return hit||net}));
});
