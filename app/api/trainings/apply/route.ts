import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '@/lib/db';
import { authErrorResponse, requireAuth } from '@/lib/server-auth';
import { sendEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const session = requireAuth(request, ['candidat']);
    const {
      trainingId,
      candidatNom,
      candidatPrenom,
      candidatEmail,
      candidatTelephone,
      candidatAdresse,
      candidatVillePays,
    } = await request.json();
    if (!trainingId) {
      return NextResponse.json({ error: 'trainingId requis' }, { status: 400 });
    }

    const db = await getDb();
    const candidate = await db.collection('candidate_profiles').findOne({ userId: session.id });
    if (!candidate) {
      return NextResponse.json({ error: 'Profil candidat introuvable' }, { status: 400 });
    }

    const existing = await db.collection('training_applications').findOne({ candidateId: candidate.id, trainingId });
    if (existing) {
      return NextResponse.json({ error: 'Deja inscrit' }, { status: 409 });
    }

    const id = uuidv4();
    await db.collection('training_applications').insertOne({
      _id: id,
      id,
      trainingId,
      candidateId: candidate.id,
      candidatNom: candidatNom || null,
      candidatPrenom: candidatPrenom || null,
      candidatEmail: candidatEmail || null,
      candidatTelephone: candidatTelephone || null,
      candidatAdresse: candidatAdresse || null,
      candidatVillePays: candidatVillePays || null,
      status: 'en_attente',
      createdAt: new Date(),
    });

    const [training, admins] = await Promise.all([
      db.collection('training_offers').findOne({ id: trainingId }),
      db.collection('users').find({ role: 'admin' }).toArray(),
    ]);

    if (admins.length > 0) {
      await db.collection('notifications').insertMany(
        admins.map((admin) => {
          const notifId = uuidv4();
          return {
            _id: notifId,
            id: notifId,
            userId: admin.id,
            message: `Nouvelle inscription a la formation "${String(training?.titre || 'formation')}"`,
            type: 'nouvelle_candidature',
            isRead: false,
            link: '/admin/formations',
            createdAt: new Date(),
          };
        }),
      );
    }

    const notifId = uuidv4();
    await db.collection('notifications').insertOne({
      _id: notifId,
      id: notifId,
      userId: session.id,
      message: `Votre demande pour la formation "${String(training?.titre || 'formation')}" a ete envoyee.`,
      type: 'candidature',
      isRead: false,
      link: '/candidat/notifications',
      createdAt: new Date(),
    });

    if (candidatEmail) {
      await sendEmail({
        to: candidatEmail,
        subject: `Demande envoyee pour ${String(training?.titre || 'une formation')}`,
        html: `<p>Votre demande pour la formation <strong>${String(training?.titre || 'une formation')}</strong> a bien ete envoyee.</p>`,
      });
    }

    return NextResponse.json({ id, trainingId, status: 'en_attente' }, { status: 201 });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    console.error('POST /api/trainings/apply error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
