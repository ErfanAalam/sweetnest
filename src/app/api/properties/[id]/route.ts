import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/** Public endpoint — returns a single active property with its media.
 *  No auth required (used by the public suite detail page). */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const property = await prisma.property.findFirst({
      where: { id, isActive: true },
      include: {
        media: { orderBy: [{ isCover: 'desc' }, { sortOrder: 'asc' }] },
      },
    });

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, property });
  } catch (error) {
    console.error('[/api/properties/[id]]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
