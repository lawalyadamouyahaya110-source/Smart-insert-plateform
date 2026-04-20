import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { authErrorResponse, requireAuth } from '@/lib/server-auth';
import { sendEmail } from '@/lib/email';

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    requireAuth(request, ['admin']);
    const { id } = await context.params;
    const { status } = await request.json();
    if (!id || !status) {
      return NextResponse.json({ error: 'id et status requis' }, { status: 400 });
    }
    if (!['en_attente', 'acceptee', 'refusee'].includes(status)) {
      return NextResponse.json({ error: 'Status invalide' }, { status: 400 });
    }

    const db = await getDb();
    await db.collection('training_applications').updateOne({ id }, { $set: { status } });

    const application = await db.collection('training_applications').findOne({ id });
    const candidate = application?.candidateId
      ? await db.collection('candidate_profiles').findOne({ id: String(application.candidateId) })
      : null;
    const user = candidate?.userId ? await db.collection('users').findOne({ id: String(candidate.userId) }) : null;
    const training = application?.trainingId
      ? await db.collection('training_offers').findOne({ id: String(application.trainingId) })
      : null;

    const row = user ? { userId: user.id, trainingTitre: String(training?.titre || 'formation') } : null;
    if (row?.userId) {
      const statusLabel = status === 'acceptee' ? 'acceptee' : status === 'refusee' ? 'refusee' : 'mise en attente';
      const notifId = uuidv4();
      await db.collection('notifications').insertOne({
        _id: notifId,
        id: notifId,
        userId: row.userId,
        message: `Votre demande pour la formation "${row.trainingTitre}" a ete ${statusLabel}.`,
        type: 'candidature',
        isRead: false,
        link: '/candidat/notifications',
        createdAt: new Date(),
      });

      if (user?.email) {
        await sendEmail({
          to: String(user.email),
          subject: `Mise a jour de votre demande pour ${row.trainingTitre}`,
          html: `<p>Votre demande pour la formation <strong>${row.trainingTitre}</strong> a ete ${statusLabel}.</p>`,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    console.error('PATCH /api/admin/training-applications/[id]/status error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
