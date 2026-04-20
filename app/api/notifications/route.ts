import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
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
    const rows = await db.collection('notifications').find({ userId }).sort({ createdAt: -1 }).toArray();

    const payload = rows.map((row) => ({
      id: String(row.id || row._id),
      userId: String(row.userId),
      message: String(row.message || ''),
      type: String(row.type || 'notification'),
      read: Boolean(row.isRead),
      link: row.link ? String(row.link) : undefined,
      createdAt: String(row.createdAt || new Date().toISOString()),
    }));

    return NextResponse.json(payload);
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    console.error('GET /api/notifications error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    requireAuth(request, ['admin']);
    const { userId, message, type, link } = await request.json();
    if (!userId || !message || !type) {
      return NextResponse.json({ error: 'userId, message, type requis' }, { status: 400 });
    }

    const db = await getDb();
    const id = uuidv4();
    await db.collection('notifications').insertOne({
      _id: id,
      id,
      userId,
      message,
      type,
      isRead: false,
      link: link || null,
      createdAt: new Date(),
    });

    return NextResponse.json({ id, userId, message, type, read: false, link: link || undefined }, { status: 201 });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    console.error('POST /api/notifications error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = requireAuth(request);
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: 'userId requis' }, { status: 400 });
    }
    ensureSelfOrAdmin(session, userId);

    const db = await getDb();
    await db.collection('notifications').updateMany({ userId }, { $set: { isRead: true } });
    return NextResponse.json({ success: true });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    console.error('PATCH /api/notifications error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
