"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { getCurrentUser } from "@/lib/auth"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PlusCircle, Briefcase, MapPin, Clock, Users } from "lucide-react"
import type { ContractType, Job } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"

const statusConfig: Record<string, { label: string; class: string }> = {
  en_attente: { label: "En attente", class: "bg-amber-100 text-amber-700" },
  approuve: { label: "Approuvee", class: "bg-emerald-100 text-emerald-700" },
  refuse: { label: "Refusee", class: "bg-red-100 text-red-700" },
}

export default function EntrepriseDashboard() {
  const [jobs, setJobs] = useState<Job[]>([])

  useEffect(() => {
    const user = getCurrentUser()
    if (user) {
      fetch(`/api/jobs?userId=${encodeURIComponent(user.id)}&status=all`)
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
            status: String(row.status || "en_attente") as Job["status"],
            createdAt: String(row.createdAt || new Date().toISOString()),
          }))
          setJobs(mapped)
        })
        .catch(() => setJobs([]))
    }
  }, [])

  const pending = jobs.filter((j) => j.status === "en_attente").length
  const approved = jobs.filter((j) => j.status === "approuve").length

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mes Offres</h1>
          <p className="mt-1 text-muted-foreground">
            {jobs.length} offre{jobs.length > 1 ? "s" : ""} &middot; {approved} approuvee{approved > 1 ? "s" : ""} &middot; {pending} en attente
          </p>
        </div>
        <Link href="/entreprise/publier">
          <Button className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Publier une offre
          </Button>
        </Link>
      </div>

      {jobs.length > 0 ? (
        <div className="mt-8 flex flex-col gap-4">
          {jobs.map((job) => {
            const config = statusConfig[job.status]
            return (
              <div
                key={job.id}
                className="rounded-3xl border border-border/80 bg-card/90 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/10"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/12">
                        <Briefcase className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-card-foreground">{job.titre}</h3>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {job.lieu}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {job.typeContrat}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                      {job.description}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {job.competences.slice(0, 4).map((c) => (
                        <Badge key={c} variant="secondary" className="rounded-lg text-xs">
                          {c}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${config.class}`}>
                      {config.label}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true, locale: fr })}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="mt-16 rounded-3xl border border-dashed border-border bg-card/70 p-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <Briefcase className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-foreground">Aucune offre publiee</h3>
          <p className="mt-1 text-muted-foreground">
            Publiez votre premiere offre d{"'"}emploi
          </p>
          <Link href="/entreprise/publier" className="mt-4">
            <Button variant="outline" className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Publier une offre
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
