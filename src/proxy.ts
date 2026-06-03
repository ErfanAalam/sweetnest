import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-default-secret'
);

// Pages anyone can open without logging in (exact match).
const PUBLIC_PAGE_EXACT = [
  '/', '/login', '/signup',
  '/about', '/amenities', '/pricing', '/faqs', '/terms',
  '/booking', // date selection + availability is public; sub-steps below stay protected
];

// Public pages that also cover nested routes (e.g. /suites/<id>).
const PUBLIC_PAGE_PREFIX = ['/suites'];

// API routes that must stay open: auth, public catalogue/availability data,
// and external payment webhooks (called by Cashfree with no session).
const PUBLIC_API_PREFIX = ['/api/auth', '/api/properties', '/api/calendar', '/api/payment/webhook'];

const ADMIN_PATHS = ['/admin'];
// Protected user areas. Booking sub-steps are listed individually so the
// public /booking date page stays open while terms/payment/kyc require login.
const USER_PATHS = [
  '/dashboard', '/support', '/kyc', '/payment', '/confirmation', '/manager',
  '/booking/terms', '/booking/payment', '/booking/kyc', '/booking/confirmation',
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isApiPath = pathname.startsWith('/api/');

  // 1. Public API endpoints bypass auth entirely.
  if (isApiPath && PUBLIC_API_PREFIX.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next();
  }

  // 2. Public pages bypass auth (exact + nested prefixes).
  if (!isApiPath) {
    const isPublicPage =
      PUBLIC_PAGE_EXACT.includes(pathname) ||
      PUBLIC_PAGE_PREFIX.some((p) => pathname === p || pathname.startsWith(p + '/'));
    if (isPublicPage) return NextResponse.next();
  }

  const isAdminPath = ADMIN_PATHS.some((p) => pathname.startsWith(p));
  const isUserPath = USER_PATHS.some((p) => pathname.startsWith(p));

  // Anything that isn't an admin area, a protected user area, or an API call
  // is treated as public by default.
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
