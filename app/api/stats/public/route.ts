import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = await getDb();
    const [approvedJobs, totalCandidats, totalEntreprises, totalApplications] = await Promise.all([
      db.collection('job_offers').countDocuments({ status: 'approuve' }),
      db.collection('users').countDocuments({ role: 'candidat' }),
      db.collection('users').countDocuments({ role: 'entreprise' }),
      db.collection('applications').countDocuments({}),
    ]);

    return NextResponse.json({
      approvedJobs,
      totalCandidats,
      totalEntreprises,
      totalApplications,
    });
  } catch (error) {
    console.error('GET /api/stats/public error:', error);
    return NextResponse.json({
      approvedJobs: 0,
      totalCandidats: 0,
      totalEntreprises: 0,
      totalApplications: 0,
    });
  }
}
