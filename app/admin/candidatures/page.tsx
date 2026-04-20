"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, User, Mail, Phone, Building2, Briefcase, Clock, MapPin, Calendar } from "lucide-react"
import Link from "next/link"
import type { Application } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"

type AdminApplication = Application & {
  typeContrat?: string
  competences?: string[]
  cvUrl?: string | null
  candidatAdresse?: string
  candidatDateNaissance?: string
  candidatNiveauEtude?: string
  candidatExperience?: string
  candidatVillePays?: string
  lettreMotivation?: string
  candidatId?: string
}

const statusConfig: Record<string, { label: string; class: string }> = {
  envoyee: { label: "Envoyee", class: "bg-blue-100 text-blue-700" },
  vue: { label: "Vue", class: "bg-amber-100 text-amber-700" },
  acceptee: { label: "Acceptee", class: "bg-emerald-100 text-emerald-700" },
  refusee: { label: "Refusee", class: "bg-red-100 text-red-700" },
}

export default function AdminCandidatures() {
  const [applications, setApplications] = useState<AdminApplication[]>([])

  useEffect(() => {
    const loadApplications = async () => {
      try {
        const response = await fetch("/api/admin/applications")
        const data = await response.json()
        if (!response.ok) return
        setApplications(data as AdminApplication[])
      } catch {
        setApplications([])
      }
    }

    void loadApplications()
    const interval = setInterval(() => {
      if (document.hidden) return
      void loadApplications()
    }, 10000)
    const handleVisibility = () => {
      if (!document.hidden) void loadApplications()
    }
    document.addEventListener("visibilitychange", handleVisibility)
    return () => {
      clearInterval(interval)
      document.removeEventListener("visibilitychange", handleVisibility)
    }
  }, [])

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Candidatures</h1>
          <p className="mt-1 text-muted-foreground">
            {applications.length} candidature{applications.length > 1 ? "s" : ""} au total
          </p>
        </div>
        <Button
          variant="outline"
          className="rounded-xl"
          onClick={() => {
            const headers = [
              "id",
              "jobTitre",
              "entrepriseNom",
              "candidatNom",
              "candidatEmail",
              "candidatTelephone",
              "candidatAdresse",
              "candidatDateNaissance",
              "candidatNiveauEtude",
              "candidatExperience",
              "candidatVillePays",
              "lettreMotivation",
              "cvUrl",
              "createdAt",
              "status",
            ]
            const rows = applications.map((a) => [
              a.id,
              a.jobTitre,
              a.entrepriseNom,
              a.candidatNom,
              a.candidatEmail,
              a.candidatTelephone,
              a.candidatAdresse || "",
              a.candidatDateNaissance || "",
              a.candidatNiveauEtude || "",
              a.candidatExperience || "",
              a.candidatVillePays || "",
              (a.lettreMotivation || "").replace(/\r?\n/g, " "),
              a.cvUrl || "",
              a.createdAt,
              a.status,
            ])
            const csv = [headers, ...rows]
              .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
              .join("\n")
            const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
            const url = URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.href = url
            link.download = "candidatures.csv"
            link.click()
            URL.revokeObjectURL(url)
          }}
        >
          Export CSV
        </Button>
      </div>

      {applications.length > 0 ? (
        <div className="mt-8 flex flex-col gap-4">
          {applications.map((app) => {
            const config = statusConfig[app.status]
            return (
              <div
                key={app.id}
                className="rounded-2xl border border-border bg-card p-5 transition-shadow hover:shadow-md"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-accent/10">
                        <FileText className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-card-foreground">{app.jobTitre}</h3>
                        <p className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Building2 className="h-3.5 w-3.5" />
                          {app.entrepriseNom}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 rounded-xl bg-muted/50 p-4">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Candidat</p>
                      <div className="mt-2 flex flex-col gap-1.5">
                        <p className="flex items-center gap-2 text-sm text-foreground">
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-medium">{app.candidatNom}</span>
                        </p>
                        <p className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-3.5 w-3.5" />
                          {app.candidatEmail}
                        </p>
                        <p className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-3.5 w-3.5" />
                          {app.candidatTelephone}
                        </p>
                        <p className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Briefcase className="h-3.5 w-3.5" />
                          {app.candidatNiveauEtude || "-"}
                        </p>
                        <p className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5" />
                          {app.candidatVillePays || "-"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground">
                      <div>Adresse: {app.candidatAdresse || "-"}</div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5" />
                        {app.candidatDateNaissance || "-"}
                      </div>
                      <div>Experience/Competence: {app.candidatExperience || "-"}</div>
                    </div>

                    <div className="mt-3">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">CV</p>
                      {app.cvUrl ? (
                        <a
                          href={app.cvUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 inline-flex text-sm font-medium text-primary hover:underline"
                        >
                          Telecharger le CV
                        </a>
                      ) : (
                        <p className="mt-1 text-sm text-muted-foreground">Aucun CV</p>
                      )}
                    </div>

                    <div className="mt-3">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Lettre de motivation</p>
                      <p className="mt-1 text-sm text-foreground">{app.lettreMotivation || "-"}</p>
                    </div>

                    <div className="mt-4">
                      <Link href={`/admin/candidatures/${app.id}`} className="text-sm font-medium text-primary hover:underline">
                        Voir details
                      </Link>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {app.typeContrat && (
                        <Badge variant="outline" className="rounded-lg text-xs">
                          {app.typeContrat}
                        </Badge>
                      )}
                      {(app.competences || []).slice(0, 4).map((c) => (
                        <Badge key={c} variant="secondary" className="rounded-lg text-xs">
                          {c}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 lg:flex-col lg:items-end">
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
        <div className="mt-16 flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-foreground">Aucune candidature</h3>
          <p className="mt-1 text-muted-foreground">
            Les candidatures des postulants apparaitront ici
          </p>
        </div>
      )}
    </div>
  )
}
