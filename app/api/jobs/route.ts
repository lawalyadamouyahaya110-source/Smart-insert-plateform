import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '@/lib/db';
import { authErrorResponse, ensureSelfOrAdmin, requireAuth } from '@/lib/server-auth';

async function notifyAllAdmins(message: string, type: string, link?: string) {
  const db = await getDb();
  const adminRows = await db.collection('users').find({ role: 'admin' }).toArray();
  if (adminRows.length === 0) return;
  await db.collection('notifications').insertMany(
    adminRows.map((admin) => ({
      _id: uuidv4(),
      id: uuidv4(),
      userId: admin.id,
      message,
      type,
      isRead: false,
      link: link || null,
      createdAt: new Date(),
    })),
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const status = searchParams.get('status');

  try {
    if (userId) {
      const session = requireAuth(request, ['admin', 'entreprise']);
      ensureSelfOrAdmin(session, userId);
    } else if (status === 'all') {
      requireAuth(request, ['admin']);
    }

    const db = await getDb();

    let companyIds: string[] | null = null;
    if (userId) {
      const companies = await db.collection('company_profiles').find({ userId }).toArray();
      companyIds = companies.map((c) => String(c.id));
      if (companyIds.length === 0) return NextResponse.json([]);
    }

    const filter: Record<string, unknown> = {};
    if (companyIds) filter.companyId = { $in: companyIds };
    if (status && status !== 'all') filter.status = status;

    const typedJobs = await db.collection('job_offers').find(filter).sort({ createdAt: -1 }).toArray();
    if (typedJobs.length === 0) {
      return NextResponse.json([]);
    }

    const jobIds = typedJobs.map((j) => String(j.id));
    const [companies, typedCompetences] = await Promise.all([
      db
        .collection('company_profiles')
        .find({ id: { $in: typedJobs.map((j) => String(j.companyId)) } })
        .toArray(),
      db.collection('job_competences').find({ jobOfferId: { $in: jobIds } }).toArray(),
    ]);

    const companyById = new Map<string, string>();
    companies.forEach((c) => companyById.set(String(c.id), String(c.nom || '')));

    const competencesByJob = new Map<string, string[]>();
    typedCompetences.forEach((row) => {
      const jobOfferId = String(row.jobOfferId);
      const list = competencesByJob.get(jobOfferId) || [];
      list.push(String(row.competence));
      competencesByJob.set(jobOfferId, list);
    });

    const payload = typedJobs.map((job) => ({
      ...job,
      entrepriseNom: companyById.get(String(job.companyId)) || null,
      competences: competencesByJob.get(String(job.id)) || [],
    }));

    return NextResponse.json(payload);
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    console.error('GET /api/jobs error:', error);
    if (!userId && status === 'approuve') {
      return NextResponse.json([]);
    }
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = requireAuth(request, ['admin', 'entreprise']);
    const { titre, description, lieu, typeContrat, salaire, companyId, competences = [] } = await request.json();

    if (!titre || !description || !lieu || !typeContrat) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
    }

    const db = await getDb();
    const id = uuidv4();
    let finalCompanyId = companyId as string | undefined;

    if (session.role === 'entreprise') {
      const company = await db.collection('company_profiles').findOne({ userId: session.id });
      finalCompanyId = company?.id as string | undefined;
    } else if (!finalCompanyId) {
      return NextResponse.json({ error: 'companyId requis pour un administrateur' }, { status: 400 });
    }

    if (!finalCompanyId) {
      return NextResponse.json({ error: "Profil entreprise introuvable pour cet utilisateur" }, { status: 400 });
    }

    const companyExists = await db.collection('company_profiles').findOne({ id: finalCompanyId });
    if (!companyExists) {
      return NextResponse.json({ error: 'Entreprise introuvable' }, { status: 404 });
    }

    await db.collection('job_offers').insertOne({
      _id: id,
      id,
      titre,
      description,
      lieu,
      typeContrat,
      salaire: salaire ?? null,
      companyId: finalCompanyId,
      status: 'en_attente',
      createdAt: new Date(),
    });

    const cleanedCompetences = Array.isArray(competences)
      ? competences.map((c) => String(c).trim()).filter(Boolean)
      : [];

    if (cleanedCompetences.length > 0) {
      await db.collection('job_competences').insertMany(
        cleanedCompetences.map((competence) => {
          const compId = uuidv4();
          return {
            _id: compId,
            id: compId,
            jobOfferId: id,
            competence,
          };
        }),
      );
    }

    await notifyAllAdmins(
      `Nouvelle offre soumise : ${titre}`,
      'nouvelle_offre',
      '/admin/offres',
    );

    return NextResponse.json(
      { id, titre, description, lieu, typeContrat, salaire, companyId: finalCompanyId, status: 'en_attente', competences: cleanedCompetences },
      { status: 201 },
    );
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    console.error('POST /api/jobs error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
