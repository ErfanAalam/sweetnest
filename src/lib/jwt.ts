import jwt, { SignOptions } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret';

export interface TokenPayload {
  userId: string;
  phone: string;
  role: string;
  iat?: number;
  exp?: number;
}

export function generateToken(
  payload: Omit<TokenPayload, 'iat' | 'exp'>,
  expiresIn: SignOptions['expiresIn'] = '7d'
): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export function decodeToken(token: string): TokenPayload | null {
  try {
    return jwt.decode(token) as TokenPayload;
  } catch {
    return null;
  }
}
