"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

type TrainingApplicationRow = {
  id: string
  status: "en_attente" | "acceptee" | "refusee"
  createdAt: string
  trainingId: string
  trainingTitre: string
  trainingCategorie: string
  candidateId: string
  candidatNom: string
  candidatPrenom: string
  candidatEmail: string
  candidatTelephone?: string | null
  candidatAdresse?: string | null
  candidatVillePays?: string | null
}

const statusConfig: Record<string, { label: string; class: string }> = {
  en_attente: { label: "En attente", class: "bg-amber-100 text-amber-700" },
  acceptee: { label: "Acceptee", class: "bg-emerald-100 text-emerald-700" },
  refusee: { label: "Refusee", class: "bg-red-100 text-red-700" },
}

export default function AdminInscriptionsFormations() {
  const [items, setItems] = useState<TrainingApplicationRow[]>([])

  const load = async () => {
    try {
      const res = await fetch("/api/admin/training-applications")
      const data = await res.json()
      if (res.ok) setItems(data as TrainingApplicationRow[])
    } catch {
      setItems([])
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const updateStatus = async (id: string, status: "en_attente" | "acceptee" | "refusee") => {
    const res = await fetch(`/api/admin/training-applications/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    if (!res.ok) {
      toast.error("Erreur lors de la mise a jour")
      return
    }
    toast.success("Statut mis a jour")
    await load()
  }

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-foreground">Inscriptions Formations</h1>
      <p className="mt-1 text-muted-foreground">Valider ou refuser les demandes</p>

      <div className="mt-6 flex flex-col gap-4">
        {items.map((i) => {
          const cfg = statusConfig[i.status]
          return (
            <div key={i.id} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{i.trainingCategorie}</p>
                  <p className="text-lg font-semibold">{i.trainingTitre}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${cfg.class}`}>
                  {cfg.label}
                </span>
              </div>
              <div className="mt-3 text-sm text-muted-foreground">
                Candidat: {i.candidatPrenom} {i.candidatNom} • {i.candidatEmail}
              </div>
              <div className="mt-3 rounded-xl bg-muted/50 p-3 text-sm">
                <div>Telephone: {i.candidatTelephone || "-"}</div>
                <div>Adresse: {i.candidatAdresse || "-"}</div>
                <div>Ville/Pays: {i.candidatVillePays || "-"}</div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button size="sm" onClick={() => updateStatus(i.id, "acceptee")} className="rounded-xl">
                  Accepter
                </Button>
                <Button size="sm" variant="outline" onClick={() => updateStatus(i.id, "refusee")} className="rounded-xl">
                  Refuser
                </Button>
              </div>
            </div>
          )
        })}
        {items.length === 0 && (
          <div className="rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
            Aucune inscription
          </div>
        )}
      </div>
    </div>
  )
}
