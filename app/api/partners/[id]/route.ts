import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { authErrorResponse, requireAuth } from '@/lib/server-auth';

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    requireAuth(request, ['admin']);
    const { id } = await context.params;
    const { nom, imageUrl, siteUrl, description, isActive } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'id requis' }, { status: 400 });
    }
    if (!nom || !imageUrl) {
      return NextResponse.json({ error: 'nom et imageUrl requis' }, { status: 400 });
    }

    const db = await getDb();
    await db.collection('partners').updateOne(
      { id },
      {
        $set: {
          nom,
          imageUrl,
          siteUrl: siteUrl || null,
          description: description || null,
          isActive: isActive !== false,
        },
      },
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    console.error('PATCH /api/partners/[id] error:', error);
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
    await db.collection('partners').deleteOne({ id });
    return NextResponse.json({ success: true });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    console.error('DELETE /api/partners/[id] error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
