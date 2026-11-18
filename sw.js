// Service worker : hors-ligne (réseau d'abord, cache en secours), notifications push et clic sur notification
const CACHE = 'claudenote-v7';
const SHELL = [
  './', 'index.html', 'css/style.css', 'icon.svg', 'manifest.webmanifest',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/maskable-512.png', 'icons/apple-touch-icon.png',
  'data/cejm.md',
  'js/app.js', 'js/db.js', 'js/store.js', 'js/sources.js', 'js/srs.js', 'js/ui.js', 'js/md.js', 'js/news.js', 'js/notify.js',
  'js/timer.js', 'js/theme.js', 'js/packs.js', 'js/cardview.js', 'js/push.js', 'js/ai.js', 'js/a4.js', 'js/library.js',
  'js/views/home.js', 'js/views/courses.js', 'js/views/course.js', 'js/views/revise.js', 'js/views/review.js', 'js/views/quiz.js',
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
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return res;
      })
      .catch(() =>
        caches.match(e.request, { ignoreSearch: true }).then((r) => r || (e.request.mode === 'navigate' ? caches.match('index.html') : Response.error())),
      ),
  );
});

/* ---------- Push ---------- */
function readState() {
  return new Promise((resolve) => {
    const req = indexedDB.open('claudenote', 1);
    req.onerror = () => resolve(null);
    req.onsuccess = () => {
      try {
        const g = req.result.transaction('kv').objectStore('kv').get('state');
        g.onsuccess = () => resolve(g.result || null);
        g.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    };
  });
}

async function reminderContent() {
  const st = await readState();
  const now = Date.now();
  const due = st ? st.cards.filter((c) => c.due <= now).length : 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exam = st?.exams
    ?.map((x) => ({ ...x, days: Math.round((new Date(x.date + 'T00:00').getTime() - today.getTime()) / 864e5) }))
    .filter((x) => x.days >= 0)
    .sort((a, b) => a.days - b.days)[0];
  const examTxt = exam ? `${exam.title} ${exam.days === 0 ? "aujourd'hui" : `dans ${exam.days} j`}` : '';
  if (due)
    return {
      title: `📚 ${due} carte${due > 1 ? 's' : ''} à réviser`,
      body: examTxt ? `${examTxt} — une petite session de 10 min ?` : 'Une petite session de 10 min ?',
      hash: '#/reviser/all',
    };
  return { title: '✅ Rien à réviser aujourd’hui', body: examTxt ? `${examTxt}. Un quiz pour t'entraîner ?` : 'Un petit quiz pour garder le rythme ?', hash: '#/quiz' };
}

self.addEventListener('push', (e) => {
  let d = {};
  try {
    d = e.data ? e.data.json() : {};
  } catch {
    d = { title: 'ClaudeNote', body: e.data?.text() || '' };
  }
  e.waitUntil(
    (async () => {
      let n = d;
      if (d.type === 'reminder') n = { ...d, ...(await reminderContent()) };
      await self.registration.showNotification(n.title || 'ClaudeNote', {
        body: n.body || '',
        icon: 'icons/icon-192.png',
        badge: 'icons/icon-192.png',
        tag: n.tag || n.type || 'claudenote',
        data: { hash: n.hash || '#/veille', url: n.url || '' },
      });
    })(),
  );
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const { hash = '#/', url = '' } = e.notification.data || {};
  e.waitUntil(
    (async () => {
      if (url) return self.clients.openWindow(url);
      const list = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const c of list) {
        c.postMessage({ hash });
        return c.focus();
      }
      return self.clients.openWindow('./' + hash);
    })(),
  );
});
