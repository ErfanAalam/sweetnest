import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, canManagePropertyCalendar } from '@/lib/calendar-access';

/** Expand every night between two dates into YYYY-MM-DD keys. */
function addRange(set: Set<string>, checkIn: Date, checkOut: Date) {
  const cur = new Date(checkIn);
  while (cur < checkOut) {
    set.add(cur.toISOString().split('T')[0]);
    cur.setDate(cur.getDate() + 1);
  }
}

/**
 * GET /api/calendar[?propertyId=xxx]
 * Public availability. With a propertyId, returns that property's
 * admin/manager-blocked dates. Booking-occupied dates are global (bookings
 * are not yet scoped per property) and always included.
 */
export async function GET(request: NextRequest) {
  try {
    const propertyId = request.nextUrl.searchParams.get('propertyId');
    const blocked = new Set<string>();

    // Per-property blocked dates (only when a property is specified).
    if (propertyId) {
      const blockedEntries = await prisma.calendar.findMany({
        where: { propertyId, available: false },
        select: { date: true },
      });
      blockedEntries.forEach((entry: { date: Date }) => {
        blocked.add(entry.date.toISOString().split('T')[0]);
      });
    }

    // Dates occupied by confirmed/paid bookings (global).
    const bookedDates = await prisma.booking.findMany({
      where: { status: { in: ['PENDING', 'CONFIRMED'] }, paymentStatus: 'SUCCESS' },
      select: { checkInDate: true, checkOutDate: true },
    });
    bookedDates.forEach((b: { checkInDate: Date; checkOutDate: Date }) =>
      addRange(blocked, b.checkInDate, b.checkOutDate)
    );

    // Dates held by active temporary reservations (global).
    const activeReservations = await prisma.booking.findMany({
      where: { status: 'PENDING', paymentStatus: 'PENDING', reservedUntil: { gt: new Date() } },
      select: { checkInDate: true, checkOutDate: true },
    });
    activeReservations.forEach((b: { checkInDate: Date; checkOutDate: Date }) =>
      addRange(blocked, b.checkInDate, b.checkOutDate)
    );

    return NextResponse.json({ success: true, blockedDates: Array.from(blocked) });
  } catch (error) {
    console.error('Calendar fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/calendar
 * Block or unblock a date for a specific property.
 * Allowed for admins (any property) or users assigned to that property.
 */
export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { propertyId, date, available, reason, price } = body;

    if (!propertyId || !date) {
      return NextResponse.json({ error: 'propertyId and date are required' }, { status: 400 });
    }

    if (!(await canManagePropertyCalendar(user.userId, propertyId))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const entry = await prisma.calendar.upsert({
      where: { propertyId_date: { propertyId, date: new Date(date) } },
      update: { available, blockedReason: reason || null, price: price ?? undefined },
      create: {
        propertyId,
        date: new Date(date),
        available,
        blockedReason: reason || null,
        price: price ?? 5000,
      },
    });

    return NextResponse.json({ success: true, entry });
  } catch (error) {
    console.error('Calendar update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
