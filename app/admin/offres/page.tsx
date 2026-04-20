"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, XCircle, Clock, Building2, MapPin, Briefcase, PlusCircle, X } from "lucide-react"
import type { ContractType, Job } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getCurrentUser } from "@/lib/auth"

const statusConfig: Record<string, { label: string; class: string }> = {
  en_attente: { label: "En attente", class: "bg-amber-100 text-amber-700" },
  approuve: { label: "Approuvee", class: "bg-emerald-100 text-emerald-700" },
  refuse: { label: "Refusee", class: "bg-red-100 text-red-700" },
}

const contractTypes: ContractType[] = ["CDI", "CDD", "Stage", "Freelance", "Alternance", "Interim"]

export default function AdminOffres() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [form, setForm] = useState({
    companyName: "",
    companyDescription: "",
    titre: "",
    description: "",
    lieu: "",
    typeContrat: "" as string,
    salaire: "",
    competenceInput: "",
    competences: [] as string[],
  })
  const [submitting, setSubmitting] = useState(false)

  const mapJob = (row: Record<string, unknown>): Job => {
    return {
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
    }
  }

  const loadJobs = async () => {
    try {
      const response = await fetch("/api/jobs?status=all")
      const data = await response.json()
      if (!response.ok) return
      setJobs((data as Array<Record<string, unknown>>).map(mapJob))
    } catch {
      setJobs([])
    }
  }

  useEffect(() => {
    void loadJobs()
  }, [])

  const handleApprove = async (job: Job) => {
    const response = await fetch(`/api/jobs/${job.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "approuve" }),
    })
    if (!response.ok) {
      toast.error("Erreur lors de la mise a jour")
      return
    }

    toast.success(`Offre "${job.titre}" approuvee`)
    await loadJobs()
  }

  const handleRefuse = async (job: Job) => {
    const response = await fetch(`/api/jobs/${job.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "refuse" }),
    })
    if (!response.ok) {
      toast.error("Erreur lors de la mise a jour")
      return
    }

    toast.success(`Offre "${job.titre}" refusee`)
    await loadJobs()
  }

  const update = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }))

  const addCompetence = () => {
    const val = form.competenceInput.trim()
    if (val && !form.competences.includes(val)) {
      setForm((p) => ({
        ...p,
        competences: [...p.competences, val],
        competenceInput: "",
      }))
    }
  }

  const removeCompetence = (c: string) => {
    setForm((p) => ({
      ...p,
      competences: p.competences.filter((x) => x !== c),
    }))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addCompetence()
    }
  }

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault()
    const currentUser = getCurrentUser()
    if (!currentUser) return
    if (!form.companyName.trim()) {
      toast.error("Veuillez saisir le nom de l'entreprise")
      return
    }
    if (!form.typeContrat) {
      toast.error("Veuillez selectionner un type de contrat")
      return
    }
    if (form.competences.length === 0) {
      toast.error("Ajoutez au moins une competence requise")
      return
    }

    setSubmitting(true)
    try {
      const companyRes = await fetch("/api/admin/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom: form.companyName.trim(),
          description: form.companyDescription.trim() || null,
          userId: currentUser.id,
        }),
      })
      const companyData = await companyRes.json()
      if (!companyRes.ok) {
        toast.error(companyData.error || "Erreur lors de la creation de l'entreprise")
        return
      }

      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: companyData.id,
          titre: form.titre,
          description: form.description,
          lieu: form.lieu,
          typeContrat: form.typeContrat,
          salaire: form.salaire ? Number(form.salaire.replace(/[^\d.-]/g, "")) : null,
          competences: form.competences,
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        toast.error(data.error || "Erreur lors de la publication")
        return
      }

      await fetch(`/api/jobs/${data.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approuve" }),
      })

      toast.success("Offre publiee avec succes")
      setForm({
        companyName: "",
        companyDescription: "",
        titre: "",
        description: "",
        lieu: "",
        typeContrat: "",
        salaire: "",
        competenceInput: "",
        competences: [],
      })
      await loadJobs()
    } catch {
      toast.error("Erreur lors de la publication")
    } finally {
      setSubmitting(false)
    }
  }

  const pending = jobs.filter((j) => j.status === "en_attente")
  const approved = jobs.filter((j) => j.status === "approuve")
  const refused = jobs.filter((j) => j.status === "refuse")

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-foreground">Gestion des offres</h1>
      <p className="mt-1 text-muted-foreground">
        Approuvez ou refusez les offres soumises par les entreprises
      </p>

      <form onSubmit={handleCreateJob} className="mt-8 rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-card-foreground">Publier une offre (Admin)</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          L{"'"}offre sera publiee directement en statut approuve.
        </p>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label>Nom de l'entreprise</Label>
            <Input
              value={form.companyName}
              onChange={(e) => update("companyName", e.target.value)}
              required
              className="rounded-xl"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Description entreprise (optionnel)</Label>
            <Input
              value={form.companyDescription}
              onChange={(e) => update("companyDescription", e.target.value)}
              className="rounded-xl"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Type de contrat</Label>
            <Select value={form.typeContrat} onValueChange={(v) => update("typeContrat", v)}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Choisir un type" />
              </SelectTrigger>
              <SelectContent>
                {contractTypes.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Titre</Label>
            <Input value={form.titre} onChange={(e) => update("titre", e.target.value)} required className="rounded-xl" />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Lieu</Label>
            <Input value={form.lieu} onChange={(e) => update("lieu", e.target.value)} required className="rounded-xl" />
          </div>
          <div className="flex flex-col gap-2 lg:col-span-2">
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              required
              rows={4}
              className="rounded-xl"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Salaire (optionnel)</Label>
            <Input value={form.salaire} onChange={(e) => update("salaire", e.target.value)} className="rounded-xl" />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Competences</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Ajouter une competence"
                value={form.competenceInput}
                onChange={(e) => update("competenceInput", e.target.value)}
                onKeyDown={handleKeyDown}
                className="rounded-xl"
              />
              <Button type="button" variant="outline" onClick={addCompetence} className="rounded-xl">
                <PlusCircle className="h-4 w-4" />
              </Button>
            </div>
            {form.competences.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {form.competences.map((c) => (
                  <Badge key={c} variant="secondary" className="gap-1 rounded-lg py-1 pl-3 pr-1">
                    {c}
                    <button
                      type="button"
                      onClick={() => removeCompetence(c)}
                      className="rounded p-0.5 hover:bg-muted"
                      aria-label={`Supprimer ${c}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="mt-4">
          <Button type="submit" disabled={submitting} className="rounded-xl">
            {submitting ? "Publication..." : "Publier l'offre"}
          </Button>
        </div>
      </form>

      <Tabs defaultValue="pending" className="mt-8">
        <TabsList className="rounded-xl bg-muted p-1">
          <TabsTrigger value="pending" className="gap-2 rounded-lg">
            <Clock className="h-3.5 w-3.5" />
            En attente ({pending.length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="gap-2 rounded-lg">
            <CheckCircle className="h-3.5 w-3.5" />
            Approuvees ({approved.length})
          </TabsTrigger>
          <TabsTrigger value="refused" className="gap-2 rounded-lg">
            <XCircle className="h-3.5 w-3.5" />
            Refusees ({refused.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          <JobList jobs={pending} showActions onApprove={handleApprove} onRefuse={handleRefuse} />
        </TabsContent>
        <TabsContent value="approved" className="mt-6">
          <JobList jobs={approved} />
        </TabsContent>
        <TabsContent value="refused" className="mt-6">
          <JobList jobs={refused} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function JobList({
  jobs,
  showActions,
  onApprove,
  onRefuse,
}: {
  jobs: Job[]
  showActions?: boolean
  onApprove?: (job: Job) => void
  onRefuse?: (job: Job) => void
}) {
  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
          <Briefcase className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-foreground">Aucune offre</h3>
        <p className="mt-1 text-muted-foreground">Pas d{"'"}offres dans cette categorie</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {jobs.map((job) => {
        const config = statusConfig[job.status]
        return (
          <div
            key={job.id}
            className="rounded-2xl border border-border bg-card p-5 transition-shadow hover:shadow-md"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <Briefcase className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-card-foreground">{job.titre}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3.5 w-3.5" />
                        {job.entrepriseNom}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {job.lieu}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {job.description}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="rounded-lg text-xs">
                    {job.typeContrat}
                  </Badge>
                  {job.salaire && (
                    <span className="text-sm font-medium text-primary">{job.salaire}</span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true, locale: fr })}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {job.competences.map((c) => (
                    <Badge key={c} variant="secondary" className="rounded-lg text-xs">
                      {c}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 lg:flex-col lg:items-end">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${config.class}`}>
                  {config.label}
                </span>
                {showActions && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => onApprove?.(job)}
                      className="gap-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      Approuver
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onRefuse?.(job)}
                      className="gap-1.5 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Refuser
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
