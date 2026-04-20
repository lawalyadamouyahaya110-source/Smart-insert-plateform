import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '@/lib/db';
import { authErrorResponse, requireAuth } from '@/lib/server-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all');
    if (all === '1') {
      requireAuth(request, ['admin']);
    }
    const db = await getDb();
    const filter = all === '1' ? {} : { isActive: true };
    const rows = await db.collection('promotions').find(filter).sort({ createdAt: -1 }).toArray();
    return NextResponse.json(rows, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    console.error('GET /api/promotions error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    requireAuth(request, ['admin']);
    const { titre, description, imageUrl, link, isActive } = await request.json();
    if (!titre) {
      return NextResponse.json({ error: 'titre requis' }, { status: 400 });
    }

    const db = await getDb();
    const id = uuidv4();
    await db.collection('promotions').insertOne({
      _id: id,
      id,
      titre,
      description: description || null,
      imageUrl: imageUrl || null,
      link: link || null,
      isActive: !!isActive,
      createdAt: new Date(),
    });

    return NextResponse.json({ id, titre, description, imageUrl, link, isActive: !!isActive }, { status: 201 });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    console.error('POST /api/promotions error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
