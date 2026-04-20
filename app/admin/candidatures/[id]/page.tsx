"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Mail, MapPin, Phone, Briefcase } from "lucide-react"

type AdminApplication = {
  id: string
  jobTitre: string
  entrepriseNom: string
  candidatNom: string
  candidatEmail: string
  candidatTelephone: string
  candidatAdresse?: string
  candidatDateNaissance?: string
  candidatNiveauEtude?: string
  candidatExperience?: string
  candidatVillePays?: string
  lettreMotivation?: string
  cvUrl?: string | null
  status: string
  createdAt: string
  typeContrat?: string
  competences?: string[]
}

export default function AdminCandidatureDetail() {
  const params = useParams<{ id: string }>()
  const [item, setItem] = useState<AdminApplication | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/admin/applications")
        const data = await res.json()
        if (!res.ok) return
        const found = (data as AdminApplication[]).find((a) => a.id === params.id)
        setItem(found || null)
      } catch {
        setItem(null)
      }
    }
    void load()
  }, [params.id])

  if (!item) {
    return <div className="p-6 lg:p-8">Candidature introuvable</div>
  }

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-foreground">Candidature - Details</h1>
      <p className="mt-1 text-muted-foreground">{item.jobTitre} • {item.entrepriseNom}</p>

      <div className="mt-6 rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold">{item.candidatNom}</p>
            <p className="text-sm text-muted-foreground">{item.candidatEmail}</p>
          </div>
          <Badge className="rounded-lg">{item.status}</Badge>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2"><Mail className="h-4 w-4" /> {item.candidatEmail}</div>
          <div className="flex items-center gap-2"><Phone className="h-4 w-4" /> {item.candidatTelephone}</div>
          <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {item.candidatVillePays || "-"}</div>
          <div className="flex items-center gap-2"><Calendar className="h-4 w-4" /> {item.candidatDateNaissance || "-"}</div>
          <div className="flex items-center gap-2"><Briefcase className="h-4 w-4" /> {item.candidatNiveauEtude || "-"}</div>
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          Adresse: {item.candidatAdresse || "-"}
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          Experience/Competence: {item.candidatExperience || "-"}
        </div>

        <div className="mt-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Lettre de motivation</p>
          <p className="mt-1 text-sm text-foreground">{item.lettreMotivation || "-"}</p>
        </div>

        <div className="mt-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">CV</p>
          {item.cvUrl ? (
            <a href={item.cvUrl} target="_blank" rel="noreferrer" className="text-sm font-medium text-primary hover:underline">
              Telecharger le CV
            </a>
          ) : (
            <p className="text-sm text-muted-foreground">Aucun CV</p>
          )}
        </div>
      </div>

      <div className="mt-6">
        <Button variant="outline" className="rounded-xl" onClick={() => history.back()}>
          Retour
        </Button>
      </div>
    </div>
  )
}
