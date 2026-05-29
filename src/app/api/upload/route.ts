import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { uploadToS3, s3Ready } from '@/lib/s3';

function getAuthUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  return verifyToken(authHeader.substring(7));
}

/** Accept any image or video MIME type. */
function isAllowedType(mimeType: string): boolean {
  return (
    mimeType.startsWith('image/') ||
    mimeType.startsWith('video/') ||
    mimeType === 'application/pdf'
  );
}

/** Build a collision-resistant, URL-safe object key inside the given folder. */
function buildKey(folder: string, fileName: string): string {
  const dot = fileName.lastIndexOf('.');
  const ext = dot >= 0 ? fileName.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, '') : '';
  const base = (dot >= 0 ? fileName.slice(0, dot) : fileName)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'file';
  const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  return `${folder}/${base}-${unique}${ext ? '.' + ext : ''}`;
}

export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await request.formData();
    const file    = formData.get('file')    as File   | null;
    const docType = formData.get('docType') as string | null;

    if (!file)    return NextResponse.json({ error: 'No file provided' },        { status: 400 });
    if (!docType) return NextResponse.json({ error: 'Document type required' },  { status: 400 });

    if (!isAllowedType(file.type)) {
      return NextResponse.json(
        { error: `Unsupported file type: ${file.type || '(unknown)'}. Use any image, video or PDF.` },
        { status: 400 }
      );
    }

    const MAX_MB   = 50;  // 50 MB cap for property photos/videos
    const maxBytes = MAX_MB * 1024 * 1024;
    if (file.size > maxBytes) {
      return NextResponse.json(
        { error: `File too large. Maximum ${MAX_MB} MB allowed.` },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const folder = docType === 'property' ? 'sweetnest/properties' : `sweetnest/kyc/${docType}`;

    let url: string;

    if (s3Ready) {
      // Upload to AWS S3
      const key = buildKey(folder, file.name);
      url = await uploadToS3(buffer, key, file.type);
    } else {
      // Dev / unconfigured fallback — return a base64 data URL
      console.warn('[upload] AWS S3 not configured — using base64 fallback. Set S3_BUCKET / S3_ACCESS_KEY_ID / S3_SECRET_ACCESS_KEY / S3_REGION in .env.local');
      url = `data:${file.type};base64,${buffer.toString('base64')}`;
    }

    return NextResponse.json({ success: true, url });
  } catch (err: any) {
    console.error('[upload] Error:', err);
    return NextResponse.json(
      { error: err?.message ?? 'Upload failed' },
      { status: 500 }
    );
  }
}
