import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '@/lib/db';
import { authErrorResponse, requireAuth } from '@/lib/server-auth';
import { sendEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const session = requireAuth(request, ['candidat']);
    const {
      jobOfferId,
      statut,
      cvUrl,
      candidatNom,
      candidatPrenom,
      candidatEmail,
      candidatTelephone,
      candidatAdresse,
      candidatDateNaissance,
      candidatNiveauEtude,
      candidatExperience,
      candidatVillePays,
      lettreMotivation,
    } = await request.json();

    if (!jobOfferId) {
      return NextResponse.json({ error: 'jobOfferId requis' }, { status: 400 });
    }

    const db = await getDb();
    const id = uuidv4();
    const finalStatut = statut || 'en_attente';
    const candidate = await db.collection('candidate_profiles').findOne({ userId: session.id });
    const finalCandidateId = candidate?.id as string | undefined;

    if (!finalCandidateId) {
      return NextResponse.json({ error: "Profil candidat introuvable pour cet utilisateur" }, { status: 400 });
    }

    const existing = await db.collection('applications').findOne({ candidateId: finalCandidateId, jobOfferId });
    if (existing) {
      return NextResponse.json({ error: 'Candidature deja envoyee' }, { status: 409 });
    }

    await db.collection('applications').insertOne({
      _id: id,
      id,
      candidateId: finalCandidateId,
      jobOfferId,
      statut: finalStatut,
      cvUrl: cvUrl || null,
      candidatNom: candidatNom || null,
      candidatPrenom: candidatPrenom || null,
      candidatEmail: candidatEmail || null,
      candidatTelephone: candidatTelephone || null,
      candidatAdresse: candidatAdresse || null,
      candidatDateNaissance: candidatDateNaissance || null,
      candidatNiveauEtude: candidatNiveauEtude || null,
      candidatExperience: candidatExperience || null,
      candidatVillePays: candidatVillePays || null,
      lettreMotivation: lettreMotivation || null,
      createdAt: new Date(),
    });

    const [job, candidateProfile] = await Promise.all([
      db.collection('job_offers').findOne({ id: jobOfferId }),
      db.collection('candidate_profiles').findOne({ id: finalCandidateId }),
    ]);

    const company = job?.companyId
      ? await db.collection('company_profiles').findOne({ id: String(job.companyId) })
      : null;
    const companyUser = company?.userId
      ? await db.collection('users').findOne({ id: String(company.userId) })
      : null;
    const adminRows = await db.collection('users').find({ role: 'admin' }).toArray();

    if (adminRows.length > 0) {
      await db.collection('notifications').insertMany(
        adminRows.map((admin) => {
          const notifId = uuidv4();
          return {
            _id: notifId,
            id: notifId,
            userId: admin.id,
            message:
              `Nouvelle candidature de ${(candidateProfile?.prenom || '')} ${(candidateProfile?.nom || '')}`.trim() +
              ` pour "${String(job?.titre || 'une offre')}"`,
            type: 'nouvelle_candidature',
            isRead: false,
            link: '/admin/candidatures',
            createdAt: new Date(),
          };
        }),
      );
    }

    if (candidateProfile?.userId) {
      const notifId = uuidv4();
      await db.collection('notifications').insertOne({
        _id: notifId,
        id: notifId,
        userId: candidateProfile.userId,
        message: `Votre candidature pour "${String(job?.titre || 'une offre')}" chez ${
          String(company?.nom || 'Entreprise')
        } a ete envoyee.`,
        type: 'candidature',
        isRead: false,
        link: '/candidat/notifications',
        createdAt: new Date(),
      });
    }

    await Promise.all([
      candidateProfile?.userId && candidatEmail
        ? sendEmail({
            to: candidatEmail,
            subject: `Candidature envoyee pour ${String(job?.titre || 'une offre')}`,
            html: `<p>Bonjour ${candidatPrenom || ''} ${candidatNom || ''},</p><p>Votre candidature pour <strong>${String(
              job?.titre || 'une offre',
            )}</strong> chez <strong>${String(company?.nom || 'Entreprise')}</strong> a bien ete envoyee.</p>`,
          })
        : Promise.resolve(),
      companyUser?.email
        ? sendEmail({
            to: String(companyUser.email),
            subject: `Nouvelle candidature pour ${String(job?.titre || 'une offre')}`,
            html: `<p>Vous avez recu une nouvelle candidature pour <strong>${String(job?.titre || 'une offre')}</strong>.</p>`,
          })
        : Promise.resolve(),
    ]);

    return NextResponse.json({ id, candidateId: finalCandidateId, jobOfferId, statut: finalStatut }, { status: 201 });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    console.error('POST /api/applications/apply error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

