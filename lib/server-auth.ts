import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

export type AuthRole = 'admin' | 'entreprise' | 'candidat';

export type AuthSession = {
  id: string;
  role: AuthRole;
};

class AuthError extends Error {
  status: number;

  constructor(message: string, status = 401) {
    super(message);
    this.status = status;
  }
}

const AUTH_COOKIE_NAME = 'smartinsert_auth';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret === 'your_jwt_secret_key') {
    throw new Error('JWT_SECRET must be configured with a strong value.');
  }
  return secret;
}

export function createAuthToken(session: AuthSession): string {
  return jwt.sign(session, getJwtSecret(), { expiresIn: '7d' });
}

export function attachAuthCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearAuthCookie(response: NextResponse) {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
}

function getTokenFromRequest(request: Request): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }

  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').map((cookie) => cookie.trim());
  const authCookie = cookies.find((cookie) => cookie.startsWith(`${AUTH_COOKIE_NAME}=`));
  if (!authCookie) return null;

  return decodeURIComponent(authCookie.slice(AUTH_COOKIE_NAME.length + 1));
}

export function getAuthSession(request: Request): AuthSession {
  const token = getTokenFromRequest(request);
  if (!token) {
    throw new AuthError('Authentification requise', 401);
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret()) as Partial<AuthSession>;
    if (!decoded.id || !decoded.role) {
      throw new AuthError('Session invalide', 401);
    }
    if (!['admin', 'entreprise', 'candidat'].includes(decoded.role)) {
      throw new AuthError('Role invalide', 403);
    }
    return { id: decoded.id, role: decoded.role as AuthRole };
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    throw new AuthError('Session invalide', 401);
  }
}

export function requireAuth(request: Request, allowedRoles?: AuthRole[]): AuthSession {
  const session = getAuthSession(request);
  if (allowedRoles && !allowedRoles.includes(session.role)) {
    throw new AuthError('Acces interdit', 403);
  }
  return session;
}

export function ensureSelfOrAdmin(session: AuthSession, userId: string) {
  if (session.role !== 'admin' && session.id !== userId) {
    throw new AuthError('Acces interdit', 403);
  }
}

export function authErrorResponse(error: unknown) {
  if (error instanceof AuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  return null;
}
