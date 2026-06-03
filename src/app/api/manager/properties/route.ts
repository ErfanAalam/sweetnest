import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, managedPropertyIds } from '@/lib/calendar-access';

/**
 * GET /api/manager/properties
 * Properties the current user may manage the calendar for.
 * Admins receive all properties; managers receive only assigned ones.
 */
export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const ids = await managedPropertyIds(user.userId);

    const properties = await prisma.property.findMany({
      where: ids === 'ALL' ? {} : { id: { in: ids } },
      select: {
        id: true,
        name: true,
        address: true,
        isActive: true,
        media: {
          where: { isCover: true },
          select: { url: true },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, isAdmin: ids === 'ALL', properties });
  } catch (err) {
    console.error('GET /api/manager/properties error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
