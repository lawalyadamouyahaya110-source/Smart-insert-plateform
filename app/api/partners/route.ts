import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '@/lib/db';
import { authErrorResponse, requireAuth } from '@/lib/server-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const all = searchParams.get('all');

  try {
    if (all === '1') {
      requireAuth(request, ['admin']);
    }

    const db = await getDb();
    const filter = all === '1' ? {} : { isActive: true };
    const rows = await db.collection('partners').find(filter).sort({ createdAt: -1 }).toArray();
    return NextResponse.json(
      rows.map((row) => ({
        id: String(row.id),
        nom: String(row.nom || ''),
        imageUrl: String(row.imageUrl || ''),
        siteUrl: row.siteUrl ? String(row.siteUrl) : undefined,
        description: row.description ? String(row.description) : undefined,
        isActive: Boolean(row.isActive),
        createdAt: String(row.createdAt || new Date().toISOString()),
      })),
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      },
    );
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    console.error('GET /api/partners error:', error);
    if (all !== '1') {
      return NextResponse.json([]);
    }
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    requireAuth(request, ['admin']);
    const { nom, imageUrl, siteUrl, description, isActive } = await request.json();
    if (!nom || !imageUrl) {
      return NextResponse.json({ error: 'nom et imageUrl requis' }, { status: 400 });
    }

    const db = await getDb();
    const id = uuidv4();
    await db.collection('partners').insertOne({
      _id: id,
      id,
      nom,
      imageUrl,
      siteUrl: siteUrl || null,
      description: description || null,
      isActive: isActive !== false,
      createdAt: new Date(),
    });

    return NextResponse.json(
      { id, nom, imageUrl, siteUrl: siteUrl || null, description: description || null, isActive: isActive !== false },
      { status: 201 },
    );
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    console.error('POST /api/partners error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
