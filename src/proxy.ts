import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-default-secret'
);

const PUBLIC_PATHS = ['/', '/login', '/signup', '/api/auth'];
const ADMIN_PATHS = ['/admin'];
const USER_PATHS = ['/dashboard', '/booking', '/kyc', '/support'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith('/api/auth')
  );
  if (isPublic) return NextResponse.next();

  const isAdminPath = ADMIN_PATHS.some((p) => pathname.startsWith(p));
  const isUserPath = USER_PATHS.some((p) => pathname.startsWith(p));
  const isApiPath = pathname.startsWith('/api/');

  if (!isAdminPath && !isUserPath && !isApiPath) return NextResponse.next();

  const authHeader = request.headers.get('authorization');
  const cookieToken = request.cookies.get('token')?.value;
  const token = authHeader?.replace('Bearer ', '') || cookieToken;

  if (!token) {
    if (isApiPath) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    if (isAdminPath && payload.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
  } catch {
    if (isApiPath) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
