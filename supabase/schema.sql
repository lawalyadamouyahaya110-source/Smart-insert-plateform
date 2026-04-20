create extension if not exists "pgcrypto";

create table if not exists public.users (
  id text primary key,
  email text not null unique,
  role text not null check (role in ('admin', 'entreprise', 'candidat')),
  telephone text,
  created_at timestamptz not null default now()
);

create table if not exists public.candidate_profiles (
  id text primary key,
  user_id text not null unique references public.users(id) on delete cascade,
  nom text,
  prenom text
);

create table if not exists public.company_profiles (
  id text primary key,
  user_id text not null unique references public.users(id) on delete cascade,
  nom text not null,
  description text,
  secteur text,
  site_web text,
  adresse text
);

create table if not exists public.job_offers (
  id text primary key,
  company_id text not null references public.company_profiles(id) on delete cascade,
  titre text not null,
  description text not null,
  lieu text not null,
  type_contrat text not null,
  salaire text,
  status text not null default 'en_attente' check (status in ('en_attente', 'approuve', 'refuse')),
  created_at timestamptz not null default now()
);

create table if not exists public.job_competences (
  id text primary key,
  job_offer_id text not null references public.job_offers(id) on delete cascade,
  competence text not null
);

create table if not exists public.applications (
  id text primary key,
  candidate_id text not null references public.candidate_profiles(id) on delete cascade,
  job_offer_id text not null references public.job_offers(id) on delete cascade,
  statut text not null default 'en_attente',
  cv_url text,
  candidat_nom text,
  candidat_prenom text,
  candidat_email text,
  candidat_telephone text,
  candidat_adresse text,
  candidat_date_naissance text,
  candidat_niveau_etude text,
  candidat_experience text,
  candidat_ville_pays text,
  lettre_motivation text,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id text primary key,
  user_id text not null references public.users(id) on delete cascade,
  message text not null,
  type text not null,
  is_read boolean not null default false,
  link text,
  created_at timestamptz not null default now()
);

create table if not exists public.training_offers (
  id text primary key,
  titre text not null,
  description text not null,
  categorie text not null,
  image_url text,
  status text not null default 'approuve',
  created_at timestamptz not null default now()
);

create table if not exists public.training_applications (
  id text primary key,
  training_id text not null references public.training_offers(id) on delete cascade,
  candidate_id text not null references public.candidate_profiles(id) on delete cascade,
  candidat_nom text,
  candidat_prenom text,
  candidat_email text,
  candidat_telephone text,
  candidat_adresse text,
  candidat_ville_pays text,
  status text not null default 'en_attente',
  created_at timestamptz not null default now()
);

create table if not exists public.promotions (
  id text primary key,
  titre text not null,
  description text,
  image_url text,
  link text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.partners (
  id text primary key,
  nom text not null,
  image_url text not null,
  site_url text,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_job_offers_company_id on public.job_offers(company_id);
create index if not exists idx_job_offers_status on public.job_offers(status);
create index if not exists idx_notifications_user_id on public.notifications(user_id);
create index if not exists idx_applications_job_offer_id on public.applications(job_offer_id);
create index if not exists idx_applications_candidate_id on public.applications(candidate_id);
create index if not exists idx_training_applications_training_id on public.training_applications(training_id);
create index if not exists idx_training_applications_candidate_id on public.training_applications(candidate_id);
