import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(_request: NextRequest) {
  // Keep this as a lightweight pass-through.
  // API routes enforce auth server-side and the client hydrates its session from /api/auth/me.
  return NextResponse.next();
}
