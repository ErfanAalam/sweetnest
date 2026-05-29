/* PWA + VAPID push subscription utilities */

const STORAGE_KEY = 'sn_scheduled_notifs';

export interface ScheduledNotif {
  id:     string;
  fireAt: number;
  title:  string;
  body:   string;
  url:    string;
  tag:    string;
}

// ── localStorage helpers ──────────────────────────────────────────────────────
function load(): ScheduledNotif[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}
function save(list: ScheduledNotif[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

// ── VAPID helper ──────────────────────────────────────────────────────────────
function urlBase64ToUint8Array(base64: string): ArrayBuffer {
  const padded  = base64.replace(/-/g, '+').replace(/_/g, '/');
  const padLen  = (4 - (padded.length % 4)) % 4;
  const decoded = atob(padded + '='.repeat(padLen));
  const arr     = new Uint8Array(decoded.length);
  for (let i = 0; i < decoded.length; i++) arr[i] = decoded.charCodeAt(i);
  return arr.buffer as ArrayBuffer;
}

// ── Register service worker ───────────────────────────────────────────────────
export async function registerSW(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    return reg;
  } catch (err) {
    console.error('[PWA] SW registration failed:', err);
    return null;
  }
}

// ── Request notification permission ──────────────────────────────────────────
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied';
  if (Notification.permission === 'granted') return 'granted';
  return Notification.requestPermission();
}

// ── Subscribe to VAPID push and save subscription to server ──────────────────
export async function subscribeToPush(token: string): Promise<boolean> {
  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapidKey) {
    console.warn('[PWA] NEXT_PUBLIC_VAPID_PUBLIC_KEY not set — using local-only notifications');
    return false;
  }

  try {
    const reg = await navigator.serviceWorker.ready;
    const existing = await reg.pushManager.getSubscription();
    const sub = existing ?? await reg.pushManager.subscribe({
      userVisibleOnly:      true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey),
    });

    const res = await fetch('/api/push', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body:    JSON.stringify(sub.toJSON()),
    });

    return res.ok;
  } catch (err) {
    console.error('[PWA] Push subscription failed:', err);
    return false;
  }
}

// ── Unsubscribe ───────────────────────────────────────────────────────────────
export async function unsubscribeFromPush(token: string): Promise<void> {
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (!sub) return;
    await fetch('/api/push', {
      method:  'DELETE',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body:    JSON.stringify({ endpoint: sub.endpoint }),
    });
    await sub.unsubscribe();
  } catch (err) {
    console.error('[PWA] Unsubscribe failed:', err);
  }
}

// ── LOCAL fallback: schedule SW setTimeout notification ──────────────────────
// Used as a backup when push is unavailable (app open in browser)
export function scheduleCheckInReminder(booking: { id: string; checkInDate: string }) {
  const checkIn = new Date(booking.checkInDate);
  const fireAt  = checkIn.getTime() - 60 * 60 * 1000; // 1 hr before
  if (fireAt <= Date.now()) return;

  const notif: ScheduledNotif = {
    id:    `checkin-${booking.id}`,
    fireAt,
    title: '🏡 Check-in in 1 hour!',
    body:  `Your Sweet Nest stay begins at 12:00 PM. Booking #${booking.id.slice(0, 8).toUpperCase()}.`,
    url:   `/booking/confirmation?bookingId=${booking.id}`,
    tag:   `checkin-${booking.id}`,
  };

  const list = load().filter(n => n.id !== notif.id);
  save([...list, notif]);
  dispatchToSW(notif);
}

export function cancelCheckInReminder(bookingId: string) {
  const id = `checkin-${bookingId}`;
  save(load().filter(n => n.id !== id));
  navigator.serviceWorker?.ready.then(reg => {
    reg.active?.postMessage({ type: 'CANCEL_NOTIFICATION', id });
  });
}

// ── Rehydrate all stored local notifications to SW on app load ───────────────
export async function rehydrateScheduledNotifs() {
  if (!('serviceWorker' in navigator)) return;
  const sw    = await navigator.serviceWorker.ready;
  const now   = Date.now();
  const valid = load().filter(n => n.fireAt > now);
  save(valid);
  for (const n of valid) dispatchToSW(n, sw);
}

function dispatchToSW(n: ScheduledNotif, reg?: ServiceWorkerRegistration) {
  const send = (r: ServiceWorkerRegistration) => {
    r.active?.postMessage({
      type:    'SCHEDULE_NOTIFICATION',
      id:      n.id,
      delayMs: Math.max(0, n.fireAt - Date.now()),
      title:   n.title,
      body:    n.body,
      url:     n.url,
      tag:     n.tag,
    });
  };
  if (reg) { send(reg); return; }
  navigator.serviceWorker?.ready.then(send).catch(() => {});
}
