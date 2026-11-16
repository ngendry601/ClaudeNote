// Service worker : fonctionnement hors-ligne (réseau d'abord, cache en secours) + clic sur notifications
const CACHE = 'claudenote-v1';
const SHELL = [
  './', 'index.html', 'css/style.css', 'icon.svg', 'manifest.webmanifest',
  'js/app.js', 'js/db.js', 'js/store.js', 'js/srs.js', 'js/ui.js', 'js/md.js', 'js/news.js', 'js/notify.js', 'js/timer.js', 'js/theme.js',
  'js/views/dashboard.js', 'js/views/courses.js', 'js/views/flashcards.js', 'js/views/review.js',
  'js/views/news.js', 'js/views/pomodoro.js', 'js/views/settings.js', 'js/views/search.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then((r) => r || caches.match('index.html'))),
  );
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const hash = e.notification.data?.hash || '#/';
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        c.postMessage({ hash });
        return c.focus();
      }
      return self.clients.openWindow('./' + hash);
    }),
  );
});
