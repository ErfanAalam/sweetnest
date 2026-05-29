import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

function getAuthUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  return verifyToken(authHeader.substring(7));
}

export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { checkInDate, checkOutDate, numberOfGuests, totalPrice } = body;

    if (!checkInDate || !checkOutDate || !totalPrice) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (checkOut <= checkIn) {
      return NextResponse.json({ error: 'Check-out must be after check-in' }, { status: 400 });
    }

    // Expire old pending reservations
    await prisma.booking.updateMany({
      where: {
        status: 'PENDING',
        paymentStatus: 'PENDING',
        reservedUntil: { lt: new Date() },
      },
      data: { reservedUntil: null },
    });

    // Check for conflicting bookings (confirmed/paid OR active temporary reservation)
    const conflict = await prisma.booking.findFirst({
      where: {
        AND: [
          { OR: [{ checkInDate: { lt: checkOut }, checkOutDate: { gt: checkIn } }] },
          {
            OR: [
              { paymentStatus: 'SUCCESS' },
              { status: 'CONFIRMED' },
              { status: 'PENDING', paymentStatus: 'PENDING', reservedUntil: { gt: new Date() } },
            ],
          },
        ],
      },
    });

    if (conflict) {
      return NextResponse.json({ error: 'Selected dates are not available' }, { status: 409 });
    }

    const reservedUntil = new Date(Date.now() + 10 * 60 * 1000);

    const booking = await prisma.booking.create({
      data: {
        userId: user.userId,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        numberOfGuests: numberOfGuests ?? 1,
        totalPrice,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        kycStatus: 'PENDING',
        reservedUntil,
      },
    });

    return NextResponse.json({ success: true, booking }, { status: 201 });
  } catch (error) {
    console.error('Booking error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const bookings = await prisma.booking.findMany({
      where: { userId: user.userId },
      include: { payment: true, kyc: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, bookings });
  } catch (error) {
    console.error('Fetch bookings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
