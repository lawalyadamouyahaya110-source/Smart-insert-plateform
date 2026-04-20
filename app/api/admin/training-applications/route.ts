import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { authErrorResponse, requireAuth } from '@/lib/server-auth';

export async function GET(request: Request) {
  try {
    requireAuth(request, ['admin']);
    const db = await getDb();
    const rows = await db.collection('training_applications').find({}).sort({ createdAt: -1 }).toArray();
    if (rows.length === 0) return NextResponse.json([]);

    const trainingIds = Array.from(new Set(rows.map((r) => String(r.trainingId))));
    const candidateIds = Array.from(new Set(rows.map((r) => String(r.candidateId))));

    const [trainings, candidates] = await Promise.all([
      db.collection('training_offers').find({ id: { $in: trainingIds } }).toArray(),
      db.collection('candidate_profiles').find({ id: { $in: candidateIds } }).toArray(),
    ]);

    const userIds = candidates.map((c) => String(c.userId));
    const users = await db.collection('users').find({ id: { $in: userIds } }).toArray();

    const trainingById = new Map<string, Record<string, unknown>>();
    const candidateById = new Map<string, Record<string, unknown>>();
    const userById = new Map<string, Record<string, unknown>>();
    trainings.forEach((t) => trainingById.set(String(t.id), t));
    candidates.forEach((c) => candidateById.set(String(c.id), c));
    users.forEach((u) => userById.set(String(u.id), u));

    const payload = rows.map((ta) => {
      const candidate = candidateById.get(String(ta.candidateId));
      const training = trainingById.get(String(ta.trainingId));
      const user = candidate?.userId ? userById.get(String(candidate.userId)) : null;

      return {
        id: ta.id,
        status: ta.status,
        createdAt: ta.createdAt,
        candidatNom: ta.candidatNom || candidate?.nom || null,
        candidatPrenom: ta.candidatPrenom || candidate?.prenom || null,
        candidatEmail: ta.candidatEmail || user?.email || null,
        candidatTelephone: ta.candidatTelephone,
        candidatAdresse: ta.candidatAdresse,
        candidatVillePays: ta.candidatVillePays,
        trainingId: training?.id,
        trainingTitre: training?.titre,
        trainingCategorie: training?.categorie,
        candidateId: candidate?.id,
      };
    });
    return NextResponse.json(payload);
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    console.error('GET /api/admin/training-applications error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
