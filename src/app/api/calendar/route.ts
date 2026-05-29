import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

function getAuthUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  return verifyToken(authHeader.substring(7));
}

export async function GET() {
  try {
    const blockedEntries = await prisma.calendar.findMany({
      where: { available: false },
      select: { date: true },
    });

    const bookedDates = await prisma.booking.findMany({
      where: {
        status: { in: ['PENDING', 'CONFIRMED'] },
        paymentStatus: 'SUCCESS',
      },
      select: { checkInDate: true, checkOutDate: true },
    });

    // Also include dates held by active temporary reservations
    const activeReservations = await prisma.booking.findMany({
      where: {
        status: 'PENDING',
        paymentStatus: 'PENDING',
        reservedUntil: { gt: new Date() },
      },
      select: { checkInDate: true, checkOutDate: true },
    });

    const blocked = new Set<string>();

    // Admin-blocked dates
    blockedEntries.forEach((entry: { date: Date }) => {
      blocked.add(entry.date.toISOString().split('T')[0]);
    });

    // Dates occupied by confirmed bookings
    bookedDates.forEach((b: { checkInDate: Date; checkOutDate: Date }) => {
      const start = new Date(b.checkInDate);
      const end = new Date(b.checkOutDate);
      const cur = new Date(start);
      while (cur < end) {
        blocked.add(cur.toISOString().split('T')[0]);
        cur.setDate(cur.getDate() + 1);
      }
    });

    // Dates held by active temporary reservations
    activeReservations.forEach((b: { checkInDate: Date; checkOutDate: Date }) => {
      const start = new Date(b.checkInDate);
      const end = new Date(b.checkOutDate);
      const cur = new Date(start);
      while (cur < end) {
        blocked.add(cur.toISOString().split('T')[0]);
        cur.setDate(cur.getDate() + 1);
      }
    });

    return NextResponse.json({
      success: true,
      blockedDates: Array.from(blocked),
    });
  } catch (error) {
    console.error('Calendar fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const dbUser = await prisma.user.findUnique({ where: { id: user.userId } });
    if (dbUser?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const { date, available, reason, price } = body;

    const entry = await prisma.calendar.upsert({
      where: { date: new Date(date) },
      update: { available, blockedReason: reason || null, price: price ?? undefined },
      create: {
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
