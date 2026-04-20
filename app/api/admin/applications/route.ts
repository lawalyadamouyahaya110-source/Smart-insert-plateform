import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { authErrorResponse, requireAuth } from '@/lib/server-auth';

function mapStatus(statut: string): 'envoyee' | 'vue' | 'acceptee' | 'refusee' {
  if (statut === 'en_attente') return 'envoyee';
  if (statut === 'acceptee') return 'acceptee';
  if (statut === 'refusee') return 'refusee';
  if (statut === 'vue') return 'vue';
  return 'envoyee';
}

export async function GET(request: Request) {
  try {
    requireAuth(request, ['admin']);
    const db = await getDb();
    const applications = await db.collection('applications').find({}).sort({ createdAt: -1 }).toArray();

    if (applications.length === 0) {
      return NextResponse.json([]);
    }

    const candidateIds = Array.from(new Set(applications.map((a) => String(a.candidateId))));
    const jobIds = Array.from(new Set(applications.map((a) => String(a.jobOfferId))));

    const [candidates, jobs, competences] = await Promise.all([
      db.collection('candidate_profiles').find({ id: { $in: candidateIds } }).toArray(),
      db.collection('job_offers').find({ id: { $in: jobIds } }).toArray(),
      db.collection('job_competences').find({ jobOfferId: { $in: jobIds } }).toArray(),
    ]);

    const userIds = candidates.map((c) => String(c.userId));
    const companyIds = jobs.map((j) => String(j.companyId));
    const [users, companies] = await Promise.all([
      db.collection('users').find({ id: { $in: userIds } }).toArray(),
      db.collection('company_profiles').find({ id: { $in: companyIds } }).toArray(),
    ]);

    const candidateById = new Map<string, Record<string, unknown>>();
    const jobById = new Map<string, Record<string, unknown>>();
    const userById = new Map<string, Record<string, unknown>>();
    const companyById = new Map<string, Record<string, unknown>>();
    candidates.forEach((c) => candidateById.set(String(c.id), c));
    jobs.forEach((j) => jobById.set(String(j.id), j));
    users.forEach((u) => userById.set(String(u.id), u));
    companies.forEach((c) => companyById.set(String(c.id), c));

    const competencesByJob = new Map<string, string[]>();
    competences.forEach((c) => {
      const jobOfferId = String(c.jobOfferId);
      const list = competencesByJob.get(jobOfferId) || [];
      list.push(String(c.competence));
      competencesByJob.set(jobOfferId, list);
    });

    const payload = applications.map((a) => ({
      id: String(a.id),
      candidatId: String(a.candidateId),
      candidatNom: `${a.candidatPrenom || candidateById.get(String(a.candidateId))?.prenom || ''} ${
        a.candidatNom || candidateById.get(String(a.candidateId))?.nom || ''
      }`.trim(),
      candidatEmail:
        a.candidatEmail ||
        userById.get(String(candidateById.get(String(a.candidateId))?.userId || ''))?.email ||
        '',
      candidatTelephone: a.candidatTelephone || '',
      jobId: String(a.jobOfferId),
      jobTitre: String(jobById.get(String(a.jobOfferId))?.titre || ''),
      entrepriseNom: String(
        companyById.get(String(jobById.get(String(a.jobOfferId))?.companyId || ''))?.nom || 'Entreprise',
      ),
      lettreMotivation: a.lettreMotivation || '',
      candidatAdresse: a.candidatAdresse || '',
      candidatDateNaissance: a.candidatDateNaissance || '',
      candidatNiveauEtude: a.candidatNiveauEtude || '',
      candidatExperience: a.candidatExperience || '',
      candidatVillePays: a.candidatVillePays || '',
      cvUrl: a.cvUrl || null,
      status: mapStatus(String(a.statut || '')),
      createdAt: String(a.createdAt || new Date().toISOString()),
      typeContrat: String(jobById.get(String(a.jobOfferId))?.typeContrat || ''),
      competences: competencesByJob.get(String(a.jobOfferId)) || [],
    }));

    return NextResponse.json(payload);
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    console.error('GET /api/admin/applications error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
