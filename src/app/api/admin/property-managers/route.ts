import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, isAdmin } from '@/lib/calendar-access';

async function requireAdmin(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  if (!(await isAdmin(user.userId)))
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  return { user };
}

// GET /api/admin/property-managers?propertyId=xxx — managers assigned to a property
export async function GET(request: NextRequest) {
  try {
    const { error } = await requireAdmin(request);
    if (error) return error;

    const propertyId = request.nextUrl.searchParams.get('propertyId');
    if (!propertyId) return NextResponse.json({ error: 'propertyId is required' }, { status: 400 });

    const managers = await prisma.propertyManager.findMany({
      where: { propertyId },
      include: { user: { select: { id: true, name: true, phone: true } } },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ success: true, managers });
  } catch (err) {
    console.error('GET /api/admin/property-managers error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/property-managers — assign a user to a property
export async function POST(request: NextRequest) {
  try {
    const { error } = await requireAdmin(request);
    if (error) return error;

    const { userId, propertyId } = await request.json();
    if (!userId || !propertyId)
      return NextResponse.json({ error: 'userId and propertyId are required' }, { status: 400 });

    const [user, property] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.property.findUnique({ where: { id: propertyId } }),
    ]);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    if (!property) return NextResponse.json({ error: 'Property not found' }, { status: 404 });

    const manager = await prisma.propertyManager.upsert({
      where: { userId_propertyId: { userId, propertyId } },
      update: {},
      create: { userId, propertyId },
      include: { user: { select: { id: true, name: true, phone: true } } },
    });

    return NextResponse.json({ success: true, manager }, { status: 201 });
  } catch (err) {
    console.error('POST /api/admin/property-managers error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/admin/property-managers?userId=xxx&propertyId=yyy — unassign
export async function DELETE(request: NextRequest) {
  try {
    const { error } = await requireAdmin(request);
    if (error) return error;

    const userId = request.nextUrl.searchParams.get('userId');
    const propertyId = request.nextUrl.searchParams.get('propertyId');
    if (!userId || !propertyId)
      return NextResponse.json({ error: 'userId and propertyId are required' }, { status: 400 });

    await prisma.propertyManager.deleteMany({ where: { userId, propertyId } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/admin/property-managers error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
