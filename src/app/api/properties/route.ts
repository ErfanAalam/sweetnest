import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/** Public endpoint — returns all active properties with media.
 *  No auth required (used by user-facing pages). */
export async function GET() {
  try {
    const properties = await prisma.property.findMany({
      where: { isActive: true },
      include: {
        media: {
          orderBy: [{ isCover: 'desc' }, { sortOrder: 'asc' }],
        },
      },
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json({ success: true, properties });
  } catch (error) {
    console.error('[/api/properties]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
