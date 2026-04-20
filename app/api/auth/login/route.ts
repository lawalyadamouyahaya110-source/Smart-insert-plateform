import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { attachAuthCookie, authErrorResponse, createAuthToken } from '@/lib/server-auth';
import type { AuthRole } from '@/lib/server-auth';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const { email, motDePasse } = await request.json();

    if (!email || !motDePasse) {
      return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password: motDePasse,
    });

    if (authError || !authData.user) {
      return NextResponse.json({ error: 'Identifiants invalides' }, { status: 401 });
    }

    const db = await getDb();
    const user = (await db.collection('users').findOne({ id: authData.user.id })) as {
      id: string;
      email: string;
      role: string;
    } | null;

    if (!user) {
      return NextResponse.json({ error: 'Profil utilisateur introuvable' }, { status: 404 });
    }

    const token = createAuthToken({ id: user.id, role: user.role as AuthRole });

    let nom: string | null = null;
    let prenom: string | null = null;
    let nomEntreprise: string | null = null;
    let secteur: string | null = null;
    let siteWeb: string | null = null;
    let adresse: string | null = null;

    if (user.role === 'candidat') {
      const candidate = (await db.collection('candidate_profiles').findOne({ userId: user.id })) as {
        nom?: string;
        prenom?: string;
      } | null;
      nom = candidate?.nom || null;
      prenom = candidate?.prenom || null;
    }

    if (user.role === 'entreprise') {
      const company = (await db.collection('company_profiles').findOne({ userId: user.id })) as {
        nom?: string;
        secteur?: string;
        siteWeb?: string;
        adresse?: string;
      } | null;
      nom = company?.nom || null;
      nomEntreprise = company?.nom || null;
      secteur = company?.secteur || null;
      siteWeb = company?.siteWeb || null;
      adresse = company?.adresse || null;
    }

    const response = NextResponse.json({
      token,
      user: { id: user.id, email: user.email, role: user.role, nom, prenom, nomEntreprise, secteur, siteWeb, adresse },
    });
    attachAuthCookie(response, token);
    return response;
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    console.error('POST /api/auth/login error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

