import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

function getAdminUser(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  const user = verifyToken(auth.slice(7));
  if (!user || user.role !== 'ADMIN') return null;
  return user;
}

// GET /api/admin/properties — list all properties with media
export async function GET(req: NextRequest) {
  try {
    const user = getAdminUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const properties = await prisma.property.findMany({
      include: { media: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, properties });
  } catch (error) {
    console.error('GET /api/admin/properties error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/properties — create property
export async function POST(req: NextRequest) {
  try {
    const user = getAdminUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const {
      name,
      description,
      address,
      googleMapsUrl,
      pricePerNight,
      taxPercent,
      discountPercent,
      maxGuests,
      bedrooms,
      bathrooms,
      sqft,
      isActive,
      amenities,
      checkInTime,
      checkOutTime,
    } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Property name is required' }, { status: 400 });
    }

    const property = await prisma.property.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        address: address?.trim() || null,
        googleMapsUrl: googleMapsUrl?.trim() || null,
        pricePerNight: Number(pricePerNight) || 5000,
        taxPercent: Number(taxPercent) ?? 18,
        discountPercent: Number(discountPercent) ?? 0,
        maxGuests: Number(maxGuests) || 2,
        bedrooms: Number(bedrooms) || 1,
        bathrooms: Number(bathrooms) || 1,
        sqft: sqft ? Number(sqft) : null,
        isActive: isActive !== false,
        amenities: Array.isArray(amenities) ? JSON.stringify(amenities) : (amenities || '[]'),
        checkInTime: checkInTime || '12:00',
        checkOutTime: checkOutTime || '11:00',
      },
      include: { media: true },
    });

    return NextResponse.json({ success: true, property }, { status: 201 });
  } catch (error) {
    console.error('POST /api/admin/properties error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/admin/properties — update property
export async function PUT(req: NextRequest) {
  try {
    const user = getAdminUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { id, ...rest } = body;

    if (!id) return NextResponse.json({ error: 'Property id is required' }, { status: 400 });

    const existing = await prisma.property.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Property not found' }, { status: 404 });

    const updateData: Record<string, unknown> = {};

    if (rest.name !== undefined) updateData.name = rest.name.trim();
    if (rest.description !== undefined) updateData.description = rest.description?.trim() || null;
    if (rest.address !== undefined) updateData.address = rest.address?.trim() || null;
    if (rest.googleMapsUrl !== undefined) updateData.googleMapsUrl = rest.googleMapsUrl?.trim() || null;
    if (rest.pricePerNight !== undefined) updateData.pricePerNight = Number(rest.pricePerNight);
    if (rest.taxPercent !== undefined) updateData.taxPercent = Number(rest.taxPercent);
    if (rest.discountPercent !== undefined) updateData.discountPercent = Number(rest.discountPercent);
    if (rest.maxGuests !== undefined) updateData.maxGuests = Number(rest.maxGuests);
    if (rest.bedrooms !== undefined) updateData.bedrooms = Number(rest.bedrooms);
    if (rest.bathrooms !== undefined) updateData.bathrooms = Number(rest.bathrooms);
    if (rest.sqft !== undefined) updateData.sqft = rest.sqft ? Number(rest.sqft) : null;
    if (rest.isActive !== undefined) updateData.isActive = Boolean(rest.isActive);
    if (rest.amenities !== undefined) {
      updateData.amenities = Array.isArray(rest.amenities)
        ? JSON.stringify(rest.amenities)
        : (rest.amenities || '[]');
    }
    if (rest.checkInTime !== undefined) updateData.checkInTime = rest.checkInTime;
    if (rest.checkOutTime !== undefined) updateData.checkOutTime = rest.checkOutTime;

    const property = await prisma.property.update({
      where: { id },
      data: updateData,
      include: { media: { orderBy: { sortOrder: 'asc' } } },
    });

    return NextResponse.json({ success: true, property });
  } catch (error) {
    console.error('PUT /api/admin/properties error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/admin/properties?id=xxx — delete property
export async function DELETE(req: NextRequest) {
  try {
    const user = getAdminUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const id = req.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Property id is required' }, { status: 400 });

    const existing = await prisma.property.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Property not found' }, { status: 404 });

    await prisma.property.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/admin/properties error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
