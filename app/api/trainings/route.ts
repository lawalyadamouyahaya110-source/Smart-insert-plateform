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
    const filter = all === '1' ? {} : { status: 'approuve' };
    const rows = await db.collection('training_offers').find(filter).sort({ createdAt: -1 }).toArray();
    return NextResponse.json(rows, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    console.error('GET /api/trainings error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    requireAuth(request, ['admin']);
    const { titre, description, categorie, imageUrl } = await request.json();
    if (!titre || !description || !categorie) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
    }

    const db = await getDb();
    const id = uuidv4();
    await db.collection('training_offers').insertOne({
      _id: id,
      id,
      titre,
      description,
      categorie,
      imageUrl: imageUrl || null,
      status: 'approuve',
      createdAt: new Date(),
    });

    return NextResponse.json({ id, titre, description, categorie, imageUrl, status: 'approuve' }, { status: 201 });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    console.error('POST /api/trainings error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
