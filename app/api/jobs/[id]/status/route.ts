import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '@/lib/db';
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

    if (!['en_attente', 'approuve', 'refuse'].includes(status)) {
      return NextResponse.json({ error: 'Status invalide' }, { status: 400 });
    }

    const db = await getDb();
    const job = await db.collection('job_offers').findOne({ id });
    await db.collection('job_offers').updateOne({ id }, { $set: { status } });

    if (job?.companyId) {
      const company = await db.collection('company_profiles').findOne({ id: String(job.companyId) });
      const companyUserId = company?.userId ? String(company.userId) : null;
      const companyUser = companyUserId ? await db.collection('users').findOne({ id: companyUserId }) : null;
      if (!companyUserId) {
        return NextResponse.json({ success: true, id, status });
      }
      const type = status === 'approuve' ? 'offre_approuvee' : status === 'refuse' ? 'offre_refusee' : 'offre_statut';
      const statusLabel = status === 'approuve' ? 'approuvee' : status === 'refuse' ? 'refusee' : 'mise en attente';
      const notifId = uuidv4();
      await db.collection('notifications').insertOne({
        _id: notifId,
        id: notifId,
        userId: companyUserId,
        message: `Votre offre "${String(job.titre || '')}" a ete ${statusLabel}.`,
        type,
        isRead: false,
        link: '/entreprise',
        createdAt: new Date(),
      });

      if (companyUser?.email) {
        await sendEmail({
          to: String(companyUser.email),
          subject: `Mise a jour de votre offre ${String(job.titre || '')}`,
          html: `<p>Votre offre <strong>${String(job.titre || '')}</strong> a ete ${statusLabel}.</p>`,
        });
      }
    }

    return NextResponse.json({ success: true, id, status });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    console.error('PATCH /api/jobs/[id]/status error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
