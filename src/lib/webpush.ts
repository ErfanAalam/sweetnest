import webpush from 'web-push';
import { prisma } from '@/lib/prisma';

let configured = false;

function ensureConfigured() {
  if (configured) return;
  const pub     = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv    = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || 'mailto:support@sweetne.st';
  if (!pub || !priv) throw new Error('VAPID keys not set in environment variables');
  webpush.setVapidDetails(subject, pub, priv);
  configured = true;
}

export interface PushPayload {
  title: string;
  body:  string;
  url?:  string;
  tag?:  string;
  icon?: string;
}

/** Send to all subscriptions of a user. Removes expired/invalid ones automatically. */
export async function sendPushToUser(userId: string, payload: PushPayload) {
  ensureConfigured();

  const subs = await prisma.pushSubscription.findMany({ where: { userId } });
  if (!subs.length) return;

  const data = JSON.stringify({
    ...payload,
    icon:  payload.icon  ?? '/logo.png',
    badge: '/logo.png',
    tag:   payload.tag   ?? 'sweetnest',
    vibrate: [200, 100, 200],
  });

  await Promise.all(
    subs.map(async sub => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          data
        );
      } catch (err: any) {
        // 410 Gone or 404 → subscription expired — remove it
        if (err.statusCode === 410 || err.statusCode === 404) {
          await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
        } else {
          console.error('[webpush] send error', err.statusCode, sub.endpoint.slice(-30));
        }
      }
    })
  );
}
