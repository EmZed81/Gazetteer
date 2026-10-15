// Keeps a copy of the app on the phone so it opens without signal.
// Always tries the network first (so updates arrive), and falls back to the saved copy when offline.
// Map backgrounds aren't saved, so the map needs a connection.
const CACHE = 'gazetteer-v1';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  const mine = url.origin === self.location.origin || /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (e.request.method !== 'GET' || !mine) return;
  e.respondWith(
    fetch(e.request)
      .then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return res; })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
