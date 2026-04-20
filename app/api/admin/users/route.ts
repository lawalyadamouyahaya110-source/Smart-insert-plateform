import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { authErrorResponse, requireAuth } from '@/lib/server-auth';

export async function GET(request: Request) {
  try {
    requireAuth(request, ['admin']);
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');

    const db = await getDb();
    const filter = role && role !== 'all' ? { role } : {};
    const users = await db.collection('users').find(filter).sort({ email: 1 }).toArray();

    const userIds = users.map((u) => String(u.id));
    const [candidates, companies] = await Promise.all([
      db.collection('candidate_profiles').find({ userId: { $in: userIds } }).toArray(),
      db.collection('company_profiles').find({ userId: { $in: userIds } }).toArray(),
    ]);

    const candidateByUserId = new Map<string, Record<string, unknown>>();
    const companyByUserId = new Map<string, Record<string, unknown>>();
    candidates.forEach((c) => candidateByUserId.set(String(c.userId), c));
    companies.forEach((c) => companyByUserId.set(String(c.userId), c));

    const rows = users.map((u) => ({
      id: String(u.id),
      email: String(u.email),
      role: String(u.role),
      candidatNom: candidateByUserId.get(String(u.id))?.nom || null,
      candidatPrenom: candidateByUserId.get(String(u.id))?.prenom || null,
      entrepriseNom: companyByUserId.get(String(u.id))?.nom || null,
      entrepriseDescription: companyByUserId.get(String(u.id))?.description || null,
      entrepriseSecteur: companyByUserId.get(String(u.id))?.secteur || null,
      entrepriseSiteWeb: companyByUserId.get(String(u.id))?.siteWeb || null,
      entrepriseAdresse: companyByUserId.get(String(u.id))?.adresse || null,
    }));

    return NextResponse.json(rows);
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    console.error('GET /api/admin/users error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
