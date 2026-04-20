"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Briefcase, Building2, Users, CheckCircle, Search, Send, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import type { ContractType, Job, PartnerCompany } from "@/lib/types"

function HeroSection() {
  return (
    <section className="relative overflow-hidden px-4 py-20 lg:py-28">
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-[color:color-mix(in_oklab,var(--primary)_78%,black)] to-secondary" />
      <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/12 blur-3xl" />
      <div className="absolute -bottom-24 -left-20 h-80 w-80 rounded-full bg-secondary/30 blur-3xl" />
      <div className="relative mx-auto max-w-7xl text-center">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-secondary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-secondary" />
          </span>
          Plateforme de recrutement nouvelle generation
        </div>
        <h1 className="mt-6 text-balance text-4xl font-extrabold tracking-tight text-white md:text-5xl lg:text-6xl">
          Trouvez le talent ideal.
          <br />
          <span className="text-[color:color-mix(in_oklab,var(--secondary)_60%,white)]">Decrochez le poste parfait.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-white/80">
          Smart Insert connecte les meilleurs candidats aux entreprises innovantes. Publiez vos offres, postulez en quelques clics et lancez votre carriere.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/offres">
            <Button size="lg" className="gap-2 bg-white px-8 text-primary hover:bg-white/95">
              <Search className="h-5 w-5" />
              Voir les offres
            </Button>
          </Link>
          <Link href="/connexion">
            <Button size="lg" variant="outline" className="gap-2 border-white/35 bg-white/10 px-8 text-white backdrop-blur-sm hover:bg-white/20 hover:text-white">
              <ArrowRight className="h-5 w-5" />
              Espace Connexion
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

function HowItWorksSection() {
  const steps = [
    {
      icon: Users,
      title: "Candidats",
      description: "Creez votre compte, parcourez les offres et postulez en un clic avec votre lettre de motivation.",
      color: "bg-primary/10 text-primary",
    },
    {
      icon: Building2,
      title: "Entreprises",
      description: "Inscrivez votre entreprise, publiez vos offres et recevez directement les candidatures qualifiees.",
      color: "bg-secondary/15 text-secondary",
    },
    {
      icon: ShieldCheck,
      title: "Administration",
      description: "Chaque offre est verifiee et approuvee par notre equipe avant d'etre publiee aux candidats.",
      color: "bg-accent/10 text-accent",
    },
  ]

  return (
    <section className="px-4 py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground md:text-4xl">Comment ca marche ?</h2>
          <p className="mt-3 text-muted-foreground">Un processus simple et transparent en 3 etapes</p>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {steps.map((step, i) => (
            <div
              key={i}
              className="group rounded-3xl border border-border/80 bg-card/90 p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10"
            >
              <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${step.color}`}>
                <step.icon className="h-7 w-7" />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-card-foreground">{step.title}</h3>
              <p className="mt-2 leading-relaxed text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function RecentJobsSection({ jobs }: { jobs: Job[] }) {
  return (
    <section className="px-4 py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">Offres recentes</h2>
            <p className="mt-2 text-muted-foreground">Decouvrez les dernieres opportunites</p>
          </div>
          <Link href="/offres" className="hidden md:block">
            <Button variant="outline" className="gap-2">
              Voir toutes les offres
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {jobs.slice(0, 3).map((job) => (
            <div
              key={job.id}
              className="group rounded-3xl border border-border/80 bg-card/90 p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <span className="rounded-full bg-secondary/15 px-3 py-1 text-xs font-medium text-secondary">
                  {job.typeContrat}
                </span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-card-foreground group-hover:text-primary transition-colors">
                {job.titre}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">{job.entrepriseNom}</p>
              <div className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
                <Briefcase className="h-3.5 w-3.5" />
                {job.lieu}
              </div>
              {job.salaire && (
                <p className="mt-2 text-sm font-medium text-primary">{job.salaire}</p>
              )}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {job.competences.slice(0, 3).map((c) => (
                  <span
                    key={c}
                  className="rounded-xl bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
                >
                  {c}
                </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center md:hidden">
          <Link href="/offres">
            <Button variant="outline" className="gap-2">
              Voir toutes les offres
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

function StatsSection({
  stats,
}: {
  stats: {
    approvedJobs: number
    totalCandidats: number
    totalEntreprises: number
    totalApplications: number
  }
}) {
  const items = [
    { label: "Offres publiees", value: stats.approvedJobs, icon: Briefcase },
    { label: "Candidats inscrits", value: stats.totalCandidats, icon: Users },
    { label: "Entreprises partenaires", value: stats.totalEntreprises, icon: Building2 },
    { label: "Candidatures envoyees", value: stats.totalApplications, icon: Send },
  ]

  return (
    <section className="px-4 py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-3xl bg-gradient-to-br from-primary to-secondary p-10 shadow-xl shadow-primary/20 md:p-14">
          <h2 className="text-center text-3xl font-bold text-white md:text-4xl">Smart Insert en chiffres</h2>
          <div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-4">
            {items.map((item) => (
              <div key={item.label} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
                  <item.icon className="h-6 w-6 text-white" />
                </div>
                <p className="mt-3 text-3xl font-extrabold text-white md:text-4xl">{item.value}</p>
                <p className="mt-1 text-sm text-white/70">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function CTASection() {
  return (
    <section className="px-4 py-20 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-bold text-foreground md:text-4xl">
          Pret a commencer ?
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          Rejoignez Smart Insert et donnez un nouvel elan a votre carriere ou trouvez le talent ideal pour votre entreprise.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/connexion">
            <Button size="lg" className="gap-2 px-8">
              <CheckCircle className="h-5 w-5" />
              Creer mon compte
            </Button>
          </Link>
          <Link href="/offres">
            <Button size="lg" variant="outline" className="gap-2 px-8">
              <Search className="h-5 w-5" />
              Explorer les offres
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

function PartnersSection({ partners }: { partners: PartnerCompany[] }) {
  if (partners.length === 0) return null

  const marqueePartners = partners.length > 1 ? [...partners, ...partners] : partners

  return (
    <section className="px-4 py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-[2rem] border border-border/80 bg-card/90 p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Partenaires</p>
              <h2 className="mt-2 text-3xl font-bold text-foreground md:text-4xl">Entreprises partenaires</h2>
            </div>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-right">
              Les entreprises et structures qui nous font confiance pour le recrutement, la formation et le developpement des talents.
            </p>
          </div>

          <div className="partner-marquee-shell mt-8 rounded-[1.75rem] border border-border/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(248,244,238,0.95))] p-4 md:p-6">
            <div className="partner-marquee-track">
              {marqueePartners.map((partner, index) => {
                const card = (
                  <div className="group flex h-full min-h-40 w-[260px] shrink-0 flex-col justify-between rounded-[1.5rem] border border-border/70 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10 md:w-[280px]">
                    <div className="relative h-20 w-full">
                      <Image
                        src={partner.imageUrl}
                        alt={partner.nom}
                        fill
                        className="object-contain"
                        sizes="280px"
                      />
                    </div>
                    <div className="mt-5">
                      <p className="text-base font-semibold text-card-foreground">{partner.nom}</p>
                      {partner.description && (
                        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                          {partner.description}
                        </p>
                      )}
                    </div>
                  </div>
                )

                return partner.siteUrl ? (
                  <a
                    key={`${partner.id}-${index}`}
                    href={partner.siteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block"
                  >
                    {card}
                  </a>
                ) : (
                  <div key={`${partner.id}-${index}`}>{card}</div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function HomePage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [partners, setPartners] = useState<PartnerCompany[]>([])
  const [stats, setStats] = useState({
    approvedJobs: 0,
    totalCandidats: 0,
    totalEntreprises: 0,
    totalApplications: 0,
  })

  useEffect(() => {
    fetch("/api/jobs?status=approuve")
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) return
        const mapped = (data as Array<Record<string, unknown>>).map((row) => ({
          id: String(row.id || ""),
          entrepriseId: String(row.companyId || ""),
          entrepriseNom: String(row.entrepriseNom || "Entreprise"),
          titre: String(row.titre || ""),
          description: String(row.description || ""),
          lieu: String(row.lieu || ""),
          typeContrat: String(row.typeContrat || "CDI") as ContractType,
          salaire: row.salaire == null ? undefined : String(row.salaire),
          competences: Array.isArray(row.competences) ? (row.competences as string[]) : [],
          status: String(row.status || "approuve") as Job["status"],
          createdAt: String(row.createdAt || new Date().toISOString()),
        }))
        setJobs(mapped)
      })
      .catch(() => setJobs([]))

    fetch("/api/stats/public", { cache: "no-store" })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) return
        setStats({
          approvedJobs: Number(data.approvedJobs || 0),
          totalCandidats: Number(data.totalCandidats || 0),
          totalEntreprises: Number(data.totalEntreprises || 0),
          totalApplications: Number(data.totalApplications || 0),
        })
      })
      .catch(() => undefined)

    fetch("/api/partners", { cache: "no-store" })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) return
        setPartners(data as PartnerCompany[])
      })
      .catch(() => setPartners([]))
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <HowItWorksSection />
        <RecentJobsSection jobs={jobs} />
        <PartnersSection partners={partners} />
        <StatsSection stats={stats} />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
