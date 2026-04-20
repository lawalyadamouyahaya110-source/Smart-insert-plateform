import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { authErrorResponse, requireAuth } from '@/lib/server-auth';

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    requireAuth(request, ['admin']);
    const { id } = await context.params;
    const { titre, description, categorie, imageUrl, status } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'id requis' }, { status: 400 });
    }

    const db = await getDb();
    await db.collection('training_offers').updateOne(
      { id },
      {
        $set: {
          titre: titre || '',
          description: description || '',
          categorie: categorie || '',
          imageUrl: imageUrl || null,
          status: status || 'approuve',
        },
      },
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    console.error('PATCH /api/trainings/[id] error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    requireAuth(request, ['admin']);
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: 'id requis' }, { status: 400 });
    }
    const db = await getDb();
    await db.collection('training_offers').deleteOne({ id });
    return NextResponse.json({ success: true });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    console.error('DELETE /api/trainings/[id] error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
