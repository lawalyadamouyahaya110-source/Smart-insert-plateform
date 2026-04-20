"use client"

import { useEffect, useState } from "react"
import { getCurrentUser } from "@/lib/auth"
import { getApplicationsByCandidat } from "@/lib/store"
import { Badge } from "@/components/ui/badge"
import { FileText, Briefcase, Building2, Clock } from "lucide-react"
import type { Application } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const statusConfig: Record<string, { label: string; class: string }> = {
  envoyee: { label: "Envoyee", class: "bg-blue-100 text-blue-700" },
  vue: { label: "Vue", class: "bg-amber-100 text-amber-700" },
  acceptee: { label: "Acceptee", class: "bg-emerald-100 text-emerald-700" },
  refusee: { label: "Refusee", class: "bg-red-100 text-red-700" },
}

export default function CandidatDashboard() {
  const [applications, setApplications] = useState<Application[]>([])

  useEffect(() => {
    const user = getCurrentUser()
    if (user) {
      setApplications(
        getApplicationsByCandidat(user.id).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      )
    }
  }, [])

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mes Candidatures</h1>
          <p className="mt-1 text-muted-foreground">
            Suivez l{"'"}avancement de vos candidatures
          </p>
        </div>
        <Link href="/offres">
          <Button className="gap-2">
            <Briefcase className="h-4 w-4" />
            Voir les offres
          </Button>
        </Link>
      </div>

      {applications.length > 0 ? (
        <div className="mt-8 flex flex-col gap-4">
          {applications.map((app) => {
            const config = statusConfig[app.status]
            return (
              <div
                key={app.id}
                className="rounded-3xl border border-border/80 bg-card/90 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/10"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/12">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-card-foreground">{app.jobTitre}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Building2 className="h-3.5 w-3.5" />
                          {app.entrepriseNom}
                        </div>
                      </div>
                    </div>
                    <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                      {app.lettreMotivation}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${config.class}`}>
                      {config.label}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(app.createdAt), { addSuffix: true, locale: fr })}
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
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-foreground">Aucune candidature</h3>
          <p className="mt-1 text-muted-foreground">
            Consultez les offres d{"'"}emploi pour postuler
          </p>
          <Link href="/offres" className="mt-4">
            <Button variant="outline" className="gap-2">
              <Briefcase className="h-4 w-4" />
              Voir les offres
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
