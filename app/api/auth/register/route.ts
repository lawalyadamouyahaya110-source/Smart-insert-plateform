import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '@/lib/db';
import { attachAuthCookie, authErrorResponse, createAuthToken } from '@/lib/server-auth';
import type { AuthRole } from '@/lib/server-auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const { email, motDePasse, role, nom, prenom, nomEntreprise, description, telephone, secteur, siteWeb, adresse } =
      await request.json();

    if (!email || !motDePasse || !role || !telephone) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
    }
    if (!['entreprise', 'candidat'].includes(role)) {
      return NextResponse.json({ error: 'Role invalide' }, { status: 400 });
    }

    const db = await getDb();
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'Email deja utilise' }, { status: 409 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: motDePasse,
      email_confirm: true,
    });

    if (authError || !authData.user) {
      return NextResponse.json({ error: authError?.message || "Impossible de creer l'utilisateur" }, { status: 400 });
    }

    const userId = authData.user.id;

    await db.collection('users').insertOne({
      id: userId,
      email,
      role,
      telephone,
      createdAt: new Date(),
    });

    let profileNom: string | null = null;
    let profilePrenom: string | null = null;

    if (role === 'candidat') {
      const candidateId = uuidv4();
      profileNom = nom || '';
      profilePrenom = prenom || '';
      await db
        .collection('candidate_profiles')
        .insertOne({ _id: candidateId, id: candidateId, nom: profileNom, prenom: profilePrenom, userId });
    }

    if (role === 'entreprise') {
      const companyId = uuidv4();
      profileNom = nomEntreprise || '';
      await db.collection('company_profiles').insertOne({
        _id: companyId,
        id: companyId,
        nom: profileNom,
        description: description || null,
        secteur: secteur || null,
        siteWeb: siteWeb || null,
        adresse: adresse || null,
        userId,
      });
    }

    const token = createAuthToken({ id: userId, role: role as AuthRole });

    const response = NextResponse.json(
      {
        token,
        user: {
          id: userId,
          email,
          role,
          nom: profileNom,
          prenom: profilePrenom,
          nomEntreprise: role === 'entreprise' ? profileNom : null,
          secteur: role === 'entreprise' ? secteur || null : null,
          siteWeb: role === 'entreprise' ? siteWeb || null : null,
          adresse: role === 'entreprise' ? adresse || null : null,
          telephone: telephone || null,
        },
      },
      { status: 201 },
    );
    attachAuthCookie(response, token);
    return response;
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    console.error('POST /api/auth/register error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

