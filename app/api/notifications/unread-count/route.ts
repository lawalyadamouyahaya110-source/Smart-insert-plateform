import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { authErrorResponse, ensureSelfOrAdmin, requireAuth } from '@/lib/server-auth';

export async function GET(request: Request) {
  try {
    const session = requireAuth(request);
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'userId requis' }, { status: 400 });
    }
    ensureSelfOrAdmin(session, userId);

    const db = await getDb();
    const unreadCount = await db.collection('notifications').countDocuments({ userId, isRead: false });

    return NextResponse.json({ unreadCount });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    console.error('GET /api/notifications/unread-count error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
