import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import { deleteFromS3 } from '@/lib/s3';

function getAdminUser(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  const user = verifyToken(auth.slice(7));
  if (!user || user.role !== 'ADMIN') return null;
  return user;
}

// POST — save media record after upload
export async function POST(req: NextRequest) {
  try {
    const user = getAdminUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { propertyId, url, type, caption, isCover, sortOrder } = body;

    if (!propertyId || !url) {
      return NextResponse.json({ error: 'propertyId and url are required' }, { status: 400 });
    }

    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) return NextResponse.json({ error: 'Property not found' }, { status: 404 });

    // If this is set as cover, unset existing covers first
    if (isCover) {
      await prisma.propertyMedia.updateMany({
        where: { propertyId, isCover: true },
        data: { isCover: false },
      });
    }

    const media = await prisma.propertyMedia.create({
      data: {
        propertyId,
        url,
        type: type || 'PHOTO',
        caption: caption?.trim() || null,
        isCover: Boolean(isCover),
        sortOrder: Number(sortOrder) || 0,
      },
    });

    return NextResponse.json({ success: true, media }, { status: 201 });
  } catch (error) {
    console.error('POST /api/admin/properties/media error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE — delete media record (body: { id, propertyId })
export async function DELETE(req: NextRequest) {
  try {
    const user = getAdminUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { id, propertyId } = body;

    if (!id || !propertyId) {
      return NextResponse.json({ error: 'id and propertyId are required' }, { status: 400 });
    }

    const media = await prisma.propertyMedia.findFirst({ where: { id, propertyId } });
    if (!media) return NextResponse.json({ error: 'Media not found' }, { status: 404 });

    await prisma.propertyMedia.delete({ where: { id } });

    // Best-effort removal of the underlying S3 object so we don't orphan files.
    try {
      await deleteFromS3(media.url);
    } catch (e) {
      console.error('DELETE /api/admin/properties/media — S3 cleanup failed:', e);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/admin/properties/media error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT — set a media item as cover (body: { id, propertyId })
export async function PUT(req: NextRequest) {
  try {
    const user = getAdminUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { id, propertyId } = body;

    if (!id || !propertyId) {
      return NextResponse.json({ error: 'id and propertyId are required' }, { status: 400 });
    }

    const media = await prisma.propertyMedia.findFirst({ where: { id, propertyId } });
    if (!media) return NextResponse.json({ error: 'Media not found' }, { status: 404 });

    // Unset all covers for this property, then set the selected one
    await prisma.propertyMedia.updateMany({
      where: { propertyId, isCover: true },
      data: { isCover: false },
    });

    const updated = await prisma.propertyMedia.update({
      where: { id },
      data: { isCover: true },
    });

    return NextResponse.json({ success: true, media: updated });
  } catch (error) {
    console.error('PUT /api/admin/properties/media error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
