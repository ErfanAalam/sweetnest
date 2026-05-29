/* Sweet Nest Service Worker */
const CACHE = 'sn-v1';
const OFFLINE_URL = '/';

// ── Install ──────────────────────────────────────────────────────────────────
self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll([OFFLINE_URL, '/logo.png']))
  );
});

// ── Activate ─────────────────────────────────────────────────────────────────
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// ── Fetch — network-first, cache fallback ────────────────────────────────────
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/_next/')) return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request).then(r => r || fetch(e.request)))
  );
});

// ── Messages from main thread ─────────────────────────────────────────────────
// { type: 'SCHEDULE_NOTIFICATION', id, delayMs, title, body, url }
const scheduled = new Map();

self.addEventListener('message', e => {
  if (!e.data) return;

  if (e.data.type === 'SCHEDULE_NOTIFICATION') {
    const { id, delayMs, title, body, url, tag } = e.data;
    if (delayMs <= 0) return;

    // Clear any existing timer for this id to avoid duplicates
    if (scheduled.has(id)) clearTimeout(scheduled.get(id));

    const timer = setTimeout(() => {
      self.registration.showNotification(title, {
        body,
        icon: '/logo.png',
        badge: '/logo.png',
        tag: tag || id,
        renotify: true,
        data: { url: url || '/dashboard' },
        vibrate: [200, 100, 200, 100, 200],
        actions: [
          { action: 'open',    title: '🏡 Open App' },
          { action: 'dismiss', title: 'Dismiss' },
        ],
      });
      scheduled.delete(id);
    }, delayMs);

    scheduled.set(id, timer);
  }

  if (e.data.type === 'CANCEL_NOTIFICATION') {
    if (scheduled.has(e.data.id)) {
      clearTimeout(scheduled.get(e.data.id));
      scheduled.delete(e.data.id);
    }
  }
});

// ── Push (server-side push, future use) ──────────────────────────────────────
self.addEventListener('push', e => {
  if (!e.data) return;
  const { title, body, url } = e.data.json();
  e.waitUntil(
    self.registration.showNotification(title || 'Sweet Nest', {
      body,
      icon: '/logo.png',
      badge: '/logo.png',
      data: { url: url || '/dashboard' },
      vibrate: [200, 100, 200],
    })
  );
});

// ── Notification click ────────────────────────────────────────────────────────
self.addEventListener('notificationclick', e => {
  e.notification.close();
  if (e.action === 'dismiss') return;

  const url = e.notification.data?.url || '/dashboard';
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      const existing = clients.find(c => c.url.includes('/'));
      if (existing) { existing.focus(); existing.navigate(url); return; }
      return self.clients.openWindow(url);
    })
  );
});
