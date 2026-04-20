import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { authErrorResponse, requireAuth } from '@/lib/server-auth';

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = requireAuth(request);
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: 'id requis' }, { status: 400 });
    }

    const db = await getDb();
    const filter = session.role === 'admin' ? { id } : { id, userId: session.id };
    const result = await db.collection('notifications').updateOne(filter, { $set: { isRead: true } });
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Notification introuvable' }, { status: 404 });
    }
    return NextResponse.json({ success: true, id });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    console.error('PATCH /api/notifications/[id]/read error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
