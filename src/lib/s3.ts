import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

// NOTE: env vars are prefixed S3_ (not AWS_) because AWS Amplify reserves the
// "AWS" prefix and rejects any variable starting with it.
const region    = process.env.S3_REGION            ?? '';
const bucket    = process.env.S3_BUCKET            ?? '';
const accessKey = process.env.S3_ACCESS_KEY_ID     ?? '';
const secretKey = process.env.S3_SECRET_ACCESS_KEY ?? '';

/**
 * True when real S3 credentials are present (i.e. not blank and not the
 * placeholder "your-..." values shipped in .env.local). When false the
 * caller should fall back to the base64 data-URL dev mode.
 */
export const s3Ready =
  !!region    && !region.includes('your-') &&
  !!bucket    && !bucket.includes('your-') &&
  !!accessKey && !accessKey.includes('your-') &&
  !!secretKey && !secretKey.includes('your-');

let _client: S3Client | null = null;
function client(): S3Client {
  if (!_client) {
    _client = new S3Client({
      region,
      credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
    });
  }
  return _client;
}

/** Public URL for an object key. Honours S3_PUBLIC_URL (e.g. a CloudFront
 *  domain) and otherwise builds the default virtual-hosted S3 URL. */
export function publicUrl(key: string): string {
  const base = process.env.S3_PUBLIC_URL?.replace(/\/$/, '');
  if (base) return `${base}/${key}`;
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

/** Upload a buffer to S3 and return its public URL. `key` is the full object
 *  key including any folder prefix (e.g. "sweetnest/properties/abc.jpg"). */
export async function uploadToS3(
  buffer: Buffer,
  key: string,
  mimeType: string
): Promise<string> {
  await client().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    })
  );
  return publicUrl(key);
}

/** Best-effort delete of an object given its public URL. Returns true if a
 *  delete was attempted, false if the URL does not point at our bucket. */
export async function deleteFromS3(url: string): Promise<boolean> {
  const key = keyFromUrl(url);
  if (!key) return false;
  await client().send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
  return true;
}

/** Extract the object key from a public S3 (or custom-domain) URL. Returns
 *  null for data: URLs or URLs that don't belong to our bucket/base. */
export function keyFromUrl(url: string): string | null {
  if (!url || url.startsWith('data:')) return null;

  const base = process.env.S3_PUBLIC_URL?.replace(/\/$/, '');
  if (base && url.startsWith(base + '/')) {
    return url.slice(base.length + 1);
  }

  try {
    const u = new URL(url);
    const host = u.hostname;
    // virtual-hosted style:  <bucket>.s3.<region>.amazonaws.com/<key>
    if (host.startsWith(`${bucket}.s3`) && host.endsWith('amazonaws.com')) {
      return decodeURIComponent(u.pathname.replace(/^\//, ''));
    }
    // path style:  s3.<region>.amazonaws.com/<bucket>/<key>
    if (host.startsWith('s3') && host.endsWith('amazonaws.com')) {
      const path = u.pathname.replace(/^\//, '');
      if (path.startsWith(`${bucket}/`)) {
        return decodeURIComponent(path.slice(bucket.length + 1));
      }
    }
  } catch {
    /* not a parseable URL */
  }
  return null;
}
