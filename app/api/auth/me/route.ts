import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { authErrorResponse, requireAuth } from '@/lib/server-auth';

export async function GET(request: Request) {
  try {
    const session = requireAuth(request);
    const db = await getDb();

    const user = (await db.collection('users').findOne({ id: session.id })) as {
      id: string;
      email: string;
      role: 'admin' | 'entreprise' | 'candidat';
      telephone?: string;
      createdAt?: string;
    } | null;

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
    }

    const payload: Record<string, string | null> = {
      id: user.id,
      email: user.email,
      role: user.role,
      telephone: user.telephone || '',
      createdAt: user.createdAt || new Date().toISOString(),
    };

    if (user.role === 'candidat') {
      const candidate = (await db.collection('candidate_profiles').findOne({ userId: user.id })) as {
        nom?: string;
        prenom?: string;
      } | null;
      payload.nom = candidate?.nom || 'Utilisateur';
      payload.prenom = candidate?.prenom || null;
    } else if (user.role === 'entreprise') {
      const company = (await db.collection('company_profiles').findOne({ userId: user.id })) as {
        nom?: string;
        description?: string;
        secteur?: string;
        siteWeb?: string;
        adresse?: string;
      } | null;
      payload.nom = company?.nom || 'Entreprise';
      payload.nomEntreprise = company?.nom || 'Entreprise';
      payload.description = company?.description || null;
      payload.secteur = company?.secteur || null;
      payload.siteWeb = company?.siteWeb || null;
      payload.adresse = company?.adresse || null;
    } else {
      payload.nom = 'Administrateur';
    }

    return NextResponse.json({ user: payload });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    console.error('GET /api/auth/me error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
