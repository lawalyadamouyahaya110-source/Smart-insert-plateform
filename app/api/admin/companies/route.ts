import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '@/lib/db';
import { authErrorResponse, requireAuth } from '@/lib/server-auth';

export async function GET(request: Request) {
  try {
    requireAuth(request, ['admin']);
    const db = await getDb();
    const rows = await db.collection('company_profiles').find({}).sort({ nom: 1 }).toArray();
    const payload = rows.map((row) => ({
      id: row.id,
      nom: row.nom,
      secteur: row.secteur || null,
      siteWeb: row.siteWeb || null,
      adresse: row.adresse || null,
    }));
    return NextResponse.json(payload);
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    console.error('GET /api/admin/companies error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    requireAuth(request, ['admin']);
    const { nom, description, userId, secteur, siteWeb, adresse } = await request.json();
    if (!nom || !userId) {
      return NextResponse.json({ error: 'nom et userId requis' }, { status: 400 });
    }

    const db = await getDb();
    const id = uuidv4();
    await db.collection('company_profiles').insertOne({
      _id: id,
      id,
      nom,
      description: description || null,
      secteur: secteur || null,
      siteWeb: siteWeb || null,
      adresse: adresse || null,
      userId,
    });

    return NextResponse.json({ id, nom }, { status: 201 });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    console.error('POST /api/admin/companies error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
