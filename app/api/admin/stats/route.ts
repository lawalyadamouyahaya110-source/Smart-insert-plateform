import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { authErrorResponse, requireAuth } from '@/lib/server-auth';

export async function GET(request: Request) {
  try {
    requireAuth(request, ['admin']);
    const db = await getDb();
    const [totalJobs, approvedJobs, pendingJobs, refusedJobs, totalCandidats, totalEntreprises, totalApplications] =
      await Promise.all([
        db.collection('job_offers').countDocuments({}),
        db.collection('job_offers').countDocuments({ status: 'approuve' }),
        db.collection('job_offers').countDocuments({ status: 'en_attente' }),
        db.collection('job_offers').countDocuments({ status: 'refuse' }),
        db.collection('users').countDocuments({ role: 'candidat' }),
        db.collection('users').countDocuments({ role: 'entreprise' }),
        db.collection('applications').countDocuments({}),
      ]);

    return NextResponse.json({
      totalJobs,
      approvedJobs,
      pendingJobs,
      refusedJobs,
      totalCandidats,
      totalEntreprises,
      totalApplications,
    });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    console.error('GET /api/admin/stats error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
