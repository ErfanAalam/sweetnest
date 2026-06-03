import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, type TokenPayload } from '@/lib/jwt';

/** Extract and verify the bearer token from a request. */
export function getAuthUser(request: NextRequest): TokenPayload | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  return verifyToken(authHeader.substring(7));
}

/** True if the user is a global admin. */
export async function isAdmin(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return user?.role === 'ADMIN';
}

/** True if the user is assigned as a calendar manager for the property. */
export async function isPropertyManager(userId: string, propertyId: string): Promise<boolean> {
  const assignment = await prisma.propertyManager.findUnique({
    where: { userId_propertyId: { userId, propertyId } },
  });
  return !!assignment;
}

/**
 * Whether a user may edit the calendar of a given property.
 * Admins can edit any property; managers only their assigned ones.
 */
export async function canManagePropertyCalendar(
  userId: string,
  propertyId: string
): Promise<boolean> {
  if (await isAdmin(userId)) return true;
  return isPropertyManager(userId, propertyId);
}

/** Property ids a user may manage. Admins get every property. */
export async function managedPropertyIds(userId: string): Promise<string[] | 'ALL'> {
  if (await isAdmin(userId)) return 'ALL';
  const assignments = await prisma.propertyManager.findMany({
    where: { userId },
    select: { propertyId: true },
  });
  return assignments.map((a) => a.propertyId);
}
