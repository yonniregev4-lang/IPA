// Pip Playground offline cache. Rebuilt with every deploy.
const CACHE = 'pip-01e43c6629';
const ASSETS = ["/", "/assets/app.49284f4e4e.js", "/assets/styles.0082454dd6.css", "/icon.svg", "/manifest.webmanifest"];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('pip-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  if (/^\/(auth|api|\.netlify)\//.test(url.pathname)) return;
  if (req.mode === 'navigate') {
    // newest page when online, saved copy when offline
    e.respondWith(fetch(req).then(res => {
      if (res.ok && (url.pathname === '/' || url.pathname === '/index.html')) { const copy = res.clone(); caches.open(CACHE).then(c => c.put('/', copy)); }
      return res;
    }).catch(() => caches.match('/')));
    return;
  }
  if (url.pathname.startsWith('/assets/') || ASSETS.includes(url.pathname)) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    })));
  }
});
