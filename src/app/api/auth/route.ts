import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateToken } from '@/lib/jwt';
import { adminAuth } from '@/lib/firebase-admin';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 24 * 7,
  path: '/',
};

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  return digits.startsWith('91') && digits.length === 12 ? digits.slice(2) : digits;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'logout') {
      const response = NextResponse.json({ success: true });
      response.cookies.delete('token');
      return response;
    }

    if (action === 'firebase-auth') {
      const { idToken, name: nameInput, mode } = body;

      if (!idToken) {
        return NextResponse.json({ error: 'Firebase ID token is required' }, { status: 400 });
      }

      let decoded: { phone_number?: string };
      try {
        decoded = await adminAuth.verifyIdToken(idToken);
      } catch (err) {
        console.error('[Auth] Firebase token verification failed:', err);
        return NextResponse.json({ error: 'OTP verification failed. Please try again.' }, { status: 401 });
      }

      const phone = normalizePhone(decoded.phone_number || '');
      if (!/^\d{10}$/.test(phone)) {
        return NextResponse.json(
          { error: 'Could not extract a valid 10-digit number from verified token' },
          { status: 400 }
        );
      }

      let user = await prisma.user.findUnique({ where: { phone } });

      if (mode === 'login') {
        if (!user) {
          return NextResponse.json(
            { error: 'No account found for this number. Please sign up first.' },
            { status: 404 }
          );
        }
      } else {
        // signup
        if (user) {
          return NextResponse.json(
            { error: 'This number is already registered. Please log in.' },
            { status: 400 }
          );
        }
        if (!nameInput?.trim()) {
          return NextResponse.json({ error: 'Full name is required' }, { status: 400 });
        }
        user = await prisma.user.create({
          data: { phone, name: nameInput.trim(), role: 'USER' },
        });
      }

      const token = generateToken({ userId: user.id, phone: user.phone, role: user.role });
      const userData = { id: user.id, phone: user.phone, name: user.name, role: user.role };

      const response = NextResponse.json(
        { success: true, user: userData, token },
        { status: mode === 'signup' ? 201 : 200 }
      );
      response.cookies.set('token', token, COOKIE_OPTIONS);
      return response;
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('[Auth] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
