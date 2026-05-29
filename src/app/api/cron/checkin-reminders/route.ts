import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendPushToUser } from '@/lib/webpush';

/**
 * Called by Vercel Cron every 15 minutes (see vercel.json).
 * Finds all CONFIRMED bookings whose check-in is 50–70 minutes away
 * and haven't been notified yet, then sends a VAPID push + marks them.
 */
export async function GET(req: NextRequest) {
  // Protect the endpoint — only Vercel cron (or internal calls) should hit this
  const cronSecret = req.headers.get('x-cron-secret');
  if (
    process.env.NODE_ENV === 'production' &&
    cronSecret !== process.env.CRON_SECRET
  ) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const now     = new Date();
  const from    = new Date(now.getTime() + 50 * 60 * 1000);   // 50 min from now
  const to      = new Date(now.getTime() + 70 * 60 * 1000);   // 70 min from now

  // Find bookings to notify
  const bookings = await prisma.booking.findMany({
    where: {
      status:                 'CONFIRMED',
      paymentStatus:          'SUCCESS',
      checkinReminderSentAt:  null,           // not yet notified
      checkInDate:            { gte: from, lte: to },
    },
    include: {
      user: { select: { id: true, name: true } },
    },
  });

  if (bookings.length === 0) {
    return NextResponse.json({ notified: 0 });
  }

  let notified = 0;

  await Promise.all(
    bookings.map(async booking => {
      const checkInLabel = booking.checkInDate.toLocaleDateString('en-IN', {
        day:   '2-digit',
        month: 'short',
        year:  'numeric',
      });

      try {
        await sendPushToUser(booking.userId, {
          title: '🏡 Check-in in 1 hour — Sweet Nest',
          body:  `Get ready! Your stay begins today at 12:00 PM on ${checkInLabel}. Booking #${booking.id.slice(0, 8).toUpperCase()}.`,
          url:   `/booking/confirmation?bookingId=${booking.id}`,
          tag:   `checkin-${booking.id}`,
        });

        // Mark as notified so we don't send again
        await prisma.booking.update({
          where: { id: booking.id },
          data:  { checkinReminderSentAt: new Date() },
        });

        notified++;
      } catch (err) {
        console.error('[cron] push failed for booking', booking.id, err);
      }
    })
  );

  return NextResponse.json({ notified, checked: bookings.length });
}
