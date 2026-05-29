import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import { notifyKYCSubmitted } from '@/lib/discord';

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
    const { bookingId, documents } = body;

    if (!documents) {
      return NextResponse.json({ error: 'Missing documents' }, { status: 400 });
    }

    if (!documents.aadharUrl && !documents.panUrl && !documents.passportUrl && !documents.drivingLicenseUrl) {
      return NextResponse.json({ error: 'Please upload at least one document' }, { status: 400 });
    }

    // If bookingId provided, verify it belongs to this user
    if (bookingId) {
      const booking = await prisma.booking.findFirst({
        where: { id: bookingId, userId: user.userId },
      });
      if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const kyc = await prisma.kYC.upsert({
      where: { userId: user.userId },
      update: {
        aadharUrl: documents.aadharUrl || null,
        panUrl: documents.panUrl || null,
        passportUrl: documents.passportUrl || null,
        drivingLicenseUrl: documents.drivingLicenseUrl || null,
        verificationStatus: 'SUBMITTED',
        ...(bookingId ? { bookingId } : {}),
      },
      create: {
        userId: user.userId,
        aadharUrl: documents.aadharUrl || null,
        panUrl: documents.panUrl || null,
        passportUrl: documents.passportUrl || null,
        drivingLicenseUrl: documents.drivingLicenseUrl || null,
        verificationStatus: 'SUBMITTED',
        ...(bookingId ? { bookingId } : {}),
      },
    });

    // Update the booking's KYC status only if a bookingId was given
    if (bookingId) {
      await prisma.booking.update({
        where: { id: bookingId },
        data: { kycStatus: 'SUBMITTED' },
      });
    }

    // Fetch user details for the Discord notification
    const kycUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { name: true, phone: true },
    });

    // Discord notification — fire-and-forget
    notifyKYCSubmitted({
      userId:            user.userId,
      userName:          kycUser?.name ?? null,
      userPhone:         kycUser?.phone ?? '',
      bookingId:         bookingId ?? null,
      aadharUrl:         documents.aadharUrl  ?? null,
      panUrl:            documents.panUrl     ?? null,
      passportUrl:       documents.passportUrl ?? null,
      drivingLicenseUrl: documents.drivingLicenseUrl ?? null,
    }).catch(console.error);

    return NextResponse.json({ success: true, kyc }, { status: 200 });
  } catch (error) {
    console.error('KYC upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const kyc = await prisma.kYC.findUnique({
      where: { userId: user.userId },
    });

    return NextResponse.json({ success: true, kyc });
  } catch (error) {
    console.error('KYC fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
