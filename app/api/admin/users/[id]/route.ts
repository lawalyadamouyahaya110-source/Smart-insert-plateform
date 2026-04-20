import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '@/lib/db';
import { authErrorResponse, requireAuth } from '@/lib/server-auth';

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    requireAuth(request, ['admin']);
    const { id } = await context.params;
    const { email, role, nom, prenom, entrepriseNom, entrepriseDescription, entrepriseSecteur, entrepriseSiteWeb, entrepriseAdresse } =
      await request.json();

    if (!id) {
      return NextResponse.json({ error: 'id requis' }, { status: 400 });
    }

    const db = await getDb();
    if (email) await db.collection('users').updateOne({ id }, { $set: { email } });
    if (role) await db.collection('users').updateOne({ id }, { $set: { role } });

    if (role === 'candidat') {
      const existing = await db.collection('candidate_profiles').findOne({ userId: id });
      if (!existing) {
        const candidateId = uuidv4();
        await db
          .collection('candidate_profiles')
          .insertOne({ _id: candidateId, id: candidateId, nom: nom || '', prenom: prenom || '', userId: id });
      } else {
        await db
          .collection('candidate_profiles')
          .updateOne({ userId: id }, { $set: { nom: nom || '', prenom: prenom || '' } });
      }
      await db.collection('company_profiles').deleteOne({ userId: id });
    }

    if (role === 'entreprise') {
      const existing = await db.collection('company_profiles').findOne({ userId: id });
      if (!existing) {
        const companyId = uuidv4();
        await db.collection('company_profiles').insertOne({
          _id: companyId,
          id: companyId,
          nom: entrepriseNom || '',
          description: entrepriseDescription || null,
          secteur: entrepriseSecteur || null,
          siteWeb: entrepriseSiteWeb || null,
          adresse: entrepriseAdresse || null,
          userId: id,
        });
      } else {
        await db.collection('company_profiles').updateOne(
          { userId: id },
          {
            $set: {
              nom: entrepriseNom || '',
              description: entrepriseDescription || null,
              secteur: entrepriseSecteur || null,
              siteWeb: entrepriseSiteWeb || null,
              adresse: entrepriseAdresse || null,
            },
          },
        );
      }
      await db.collection('candidate_profiles').deleteOne({ userId: id });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    console.error('PATCH /api/admin/users/[id] error:', error);
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
    await db.collection('users').deleteOne({ id });
    await db.collection('candidate_profiles').deleteMany({ userId: id });
    await db.collection('company_profiles').deleteMany({ userId: id });
    return NextResponse.json({ success: true });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    console.error('DELETE /api/admin/users/[id] error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
