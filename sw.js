// Offline support. Network first: online you always get the newest files (the cache is bypassed with
// cache:'no-cache'); offline you get the last copy that was downloaded.
const CACHE = 'fce-practice';

async function precache() {
  const cache = await caches.open(CACHE);
  for (const key of await cache.keys()) await cache.delete(key); // drop copies of older versions
  const shell = ['./', 'manifest.webmanifest', 'favicon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-180.png'];
  try {
    // Every script/stylesheet index.html references, with its current ?v=
    const html = await (await fetch('./', { cache: 'no-cache' })).text();
    for (const m of html.matchAll(/(?:src|href)="((?:js|css|data)\/[^"]+)"/g)) shell.push(m[1]);
  } catch (e) { /* offline during install: the files are cached as they are used */ }
  await Promise.all(shell.map((url) => fetch(url, { cache: 'no-cache' }).then((r) => (r.ok ? cache.put(url, r) : null)).catch(() => null)));
}

self.addEventListener('install', (e) => { e.waitUntil(precache().then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(self.clients.claim()); });

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith((async () => {
    try {
      const res = await fetch(req, { cache: 'no-cache' });
      if (res.ok) (await caches.open(CACHE)).put(req, res.clone());
      return res;
    } catch (err) {
      const cache = await caches.open(CACHE);
      return (await cache.match(req)) || (req.mode === 'navigate' ? await cache.match('./') : undefined) || Response.error();
    }
  })());
});
