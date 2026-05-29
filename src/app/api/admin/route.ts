import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

function getAuthUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  return verifyToken(authHeader.substring(7));
}

async function requireAdmin(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return user?.role === 'ADMIN';
}

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!(await requireAdmin(user.userId))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { searchParams } = request.nextUrl;
    const type = searchParams.get('type');

    if (type === 'bookings') {
      const bookings = await prisma.booking.findMany({
        include: { user: { select: { id: true, name: true, phone: true } }, payment: true, kyc: true },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json({ success: true, bookings });
    }

    if (type === 'kyc') {
      const kycs = await prisma.kYC.findMany({
        include: { user: { select: { id: true, name: true, phone: true } } },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json({ success: true, kycs });
    }

    if (type === 'users') {
      const users = await prisma.user.findMany({
        select: { id: true, name: true, phone: true, role: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json({ success: true, users });
    }

    if (type === 'payments') {
      const payments = await prisma.payment.findMany({
        include: { booking: { include: { user: { select: { name: true, phone: true } } } } },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json({ success: true, payments });
    }

    if (type === 'support') {
      const tickets = await prisma.supportTicket.findMany({
        include: { user: { select: { name: true, phone: true } } },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json({ success: true, tickets });
    }

    if (type === 'stats') {
      const [totalBookings, totalUsers, pendingKYC, openTickets, revenue] = await Promise.all([
        prisma.booking.count(),
        prisma.user.count({ where: { role: 'USER' } }),
        prisma.kYC.count({ where: { verificationStatus: 'SUBMITTED' } }),
        prisma.supportTicket.count({ where: { status: 'OPEN' } }),
        prisma.payment.aggregate({
          where: { status: 'SUCCESS' },
          _sum: { amount: true },
        }),
      ]);
      return NextResponse.json({
        success: true,
        stats: { totalBookings, totalUsers, pendingKYC, openTickets, totalRevenue: revenue._sum.amount || 0 },
      });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error) {
    console.error('Admin GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!(await requireAdmin(user.userId))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const { action, id, reason, date, available, status, reply } = body;

    if (action === 'approve-kyc') {
      const kyc = await prisma.kYC.update({
        where: { id },
        data: { verificationStatus: 'VERIFIED', verifiedBy: user.userId, verifiedAt: new Date() },
        include: { user: true },
      });
      if (kyc.bookingId) {
        await prisma.booking.update({
          where: { id: kyc.bookingId },
          data: { kycStatus: 'VERIFIED', status: 'CONFIRMED' },
        });
      }
      return NextResponse.json({ success: true, kyc });
    }

    if (action === 'reject-kyc') {
      const kyc = await prisma.kYC.update({
        where: { id },
        data: { verificationStatus: 'REJECTED', verifiedBy: user.userId, verifiedAt: new Date(), rejectionReason: reason || 'Documents not acceptable' },
      });
      return NextResponse.json({ success: true, kyc });
    }

    if (action === 'update-booking') {
      const booking = await prisma.booking.update({
        where: { id },
        data: { status },
      });
      return NextResponse.json({ success: true, booking });
    }

    if (action === 'toggle-calendar') {
      const entry = await prisma.calendar.upsert({
        where: { date: new Date(date) },
        update: { available, blockedReason: available ? null : reason || 'Blocked by admin' },
        create: { date: new Date(date), available, blockedReason: available ? null : reason || 'Blocked by admin' },
      });
      return NextResponse.json({ success: true, entry });
    }

    if (action === 'reply-support') {
      const ticket = await prisma.supportTicket.update({
        where: { id },
        data: { adminReply: reply, repliedAt: new Date(), status: 'IN_PROGRESS' },
        include: { user: true },
      });
      return NextResponse.json({ success: true, ticket });
    }

    if (action === 'close-support') {
      const ticket = await prisma.supportTicket.update({
        where: { id },
        data: { status: 'CLOSED' },
      });
      return NextResponse.json({ success: true, ticket });
    }

    if (action === 'resolve-support') {
      const ticket = await prisma.supportTicket.update({
        where: { id },
        data: { status: 'RESOLVED' },
      });
      return NextResponse.json({ success: true, ticket });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Admin PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
