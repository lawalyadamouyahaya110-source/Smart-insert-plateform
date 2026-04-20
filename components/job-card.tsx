"use client"

import { useState } from "react"
import { Building2, MapPin, Briefcase, Clock, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { getCurrentUser } from "@/lib/auth"
import { addApplication, hasApplied } from "@/lib/store"
import type { Job } from "@/lib/types"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"

const contractColors: Record<string, string> = {
  CDI: "bg-emerald-100 text-emerald-700",
  CDD: "bg-blue-100 text-blue-700",
  Stage: "bg-amber-100 text-amber-700",
  Freelance: "bg-orange-100 text-orange-700",
  Alternance: "bg-rose-100 text-rose-700",
}

export function JobCard({ job, onApplied }: { job: Job; onApplied?: () => void }) {
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    adresse: "",
    dateNaissance: "",
    niveauEtude: "",
    experience: "",
    villePays: "",
    motivation: "",
  })

  const handlePostuler = () => {
    const user = getCurrentUser()
    if (!user) {
      toast.info("Connectez-vous pour postuler")
      router.push("/connexion")
      return
    }
    if (user.role !== "candidat") {
      toast.error("Seuls les candidats peuvent postuler")
      return
    }
    if (hasApplied(user.id, job.id)) {
      toast.info("Vous avez deja postule a cette offre")
      return
    }
    setDialogOpen(true)
  }

  const handleSubmitApplication = async () => {
    const user = getCurrentUser()
    if (!user) return
    if (!cvFile) {
      toast.error("Veuillez joindre votre CV")
      return
    }
    if (
      !form.nom.trim() ||
      !form.prenom.trim() ||
      !form.email.trim() ||
      !form.telephone.trim() ||
      !form.adresse.trim() ||
      !form.dateNaissance.trim() ||
      !form.niveauEtude.trim() ||
      !form.experience.trim() ||
      !form.villePays.trim() ||
      !form.motivation.trim()
    ) {
      toast.error("Veuillez remplir tous les champs")
      return
    }
    setSubmitting(true)
    try {
      const body = new FormData()
      body.append("file", cvFile)
      const uploadRes = await fetch("/api/upload", { method: "POST", body })
      const uploadData = await uploadRes.json()
      if (!uploadRes.ok) {
        toast.error(uploadData.error || "Erreur lors de l'upload du CV")
        return
      }

      const response = await fetch("/api/applications/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobOfferId: job.id,
          statut: "en_attente",
          cvUrl: uploadData.url,
          candidatNom: form.nom,
          candidatPrenom: form.prenom,
          candidatEmail: form.email,
          candidatTelephone: form.telephone,
          candidatAdresse: form.adresse,
          candidatDateNaissance: form.dateNaissance,
          candidatNiveauEtude: form.niveauEtude,
          candidatExperience: form.experience,
          candidatVillePays: form.villePays,
          lettreMotivation: form.motivation,
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        toast.error(data.error || "Erreur lors de l'envoi de la candidature")
        return
      }

      addApplication({
        id: String(data.id || Date.now()),
        candidatId: user.id,
        candidatNom: `${user.prenom || ""} ${user.nom}`.trim(),
        candidatEmail: user.email,
        candidatTelephone: user.telephone,
        jobId: job.id,
        jobTitre: job.titre,
        entrepriseNom: job.entrepriseNom,
        lettreMotivation: "",
        status: "envoyee",
        createdAt: new Date().toISOString(),
      })

      toast.success("Candidature envoyee avec succes !")
      setDialogOpen(false)
      setCvFile(null)
      setForm({
        nom: "",
        prenom: "",
        email: "",
        telephone: "",
        adresse: "",
        dateNaissance: "",
        niveauEtude: "",
        experience: "",
        villePays: "",
        motivation: "",
      })
      onApplied?.()
    } catch {
      toast.error("Erreur lors de l'envoi de la candidature")
    } finally {
      setSubmitting(false)
    }
  }

  const timeAgo = formatDistanceToNow(new Date(job.createdAt), { addSuffix: true, locale: fr })

  return (
    <>
      <div className="group flex flex-col rounded-3xl border border-border/80 bg-card/90 p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10">
        <div className="flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/12">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${contractColors[job.typeContrat] || "bg-muted text-muted-foreground"}`}>
            {job.typeContrat}
          </span>
        </div>
        <h3 className="mt-4 text-lg font-semibold text-card-foreground group-hover:text-primary transition-colors">
          {job.titre}
        </h3>
        <p className="mt-1 text-sm font-medium text-muted-foreground">{job.entrepriseNom}</p>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {job.lieu}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {timeAgo}
          </span>
        </div>
        {job.salaire && (
          <p className="mt-2 text-sm font-semibold text-primary">{job.salaire}</p>
        )}
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {job.description}
        </p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {job.competences.slice(0, 4).map((c) => (
            <Badge key={c} variant="secondary" className="rounded-xl text-xs font-medium">
              {c}
            </Badge>
          ))}
          {job.competences.length > 4 && (
            <Badge variant="outline" className="rounded-xl text-xs">
              +{job.competences.length - 4}
            </Badge>
          )}
        </div>
        <div className="mt-auto pt-5">
          <Button
            onClick={handlePostuler}
            className="w-full gap-2"
          >
            <Send className="h-4 w-4" />
            Postuler
          </Button>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="rounded-3xl border-border/80 bg-card/95 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">Postuler - {job.titre}</DialogTitle>
            <DialogDescription>
              {job.entrepriseNom} &middot; {job.lieu}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="nom">Nom</Label>
                <input
                  id="nom"
                  className="rounded-xl border border-border/80 bg-background/80 px-3 py-2 text-sm"
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="prenom">Prenom</Label>
                <input
                  id="prenom"
                  className="rounded-xl border border-border/80 bg-background/80 px-3 py-2 text-sm"
                  value={form.prenom}
                  onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <input
                  id="email"
                  type="email"
                  className="rounded-xl border border-border/80 bg-background/80 px-3 py-2 text-sm"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="telephone">Telephone</Label>
                <input
                  id="telephone"
                  className="rounded-xl border border-border/80 bg-background/80 px-3 py-2 text-sm"
                  value={form.telephone}
                  onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="adresse">Adresse</Label>
                <input
                  id="adresse"
                  className="rounded-xl border border-border/80 bg-background/80 px-3 py-2 text-sm"
                  value={form.adresse}
                  onChange={(e) => setForm({ ...form, adresse: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="dateNaissance">Date de naissance</Label>
                <input
                  id="dateNaissance"
                  type="date"
                  className="rounded-xl border border-border/80 bg-background/80 px-3 py-2 text-sm"
                  value={form.dateNaissance}
                  onChange={(e) => setForm({ ...form, dateNaissance: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="niveau">Niveau d'etude</Label>
                <input
                  id="niveau"
                  className="rounded-xl border border-border/80 bg-background/80 px-3 py-2 text-sm"
                  value={form.niveauEtude}
                  onChange={(e) => setForm({ ...form, niveauEtude: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="experience">Experience / Competence</Label>
                <input
                  id="experience"
                  className="rounded-xl border border-border/80 bg-background/80 px-3 py-2 text-sm"
                  value={form.experience}
                  onChange={(e) => setForm({ ...form, experience: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="villePays">Ville / Pays</Label>
                <input
                  id="villePays"
                  className="rounded-xl border border-border/80 bg-background/80 px-3 py-2 text-sm"
                  value={form.villePays}
                  onChange={(e) => setForm({ ...form, villePays: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-2 sm:col-span-2">
                <Label htmlFor="motivation">Lettre de motivation</Label>
                <textarea
                  id="motivation"
                  className="rounded-xl border border-border/80 bg-background/80 px-3 py-2 text-sm"
                  rows={4}
                  value={form.motivation}
                  onChange={(e) => setForm({ ...form, motivation: e.target.value })}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="cv">CV (PDF ou image)</Label>
              <input
                id="cv"
                type="file"
                accept=".pdf,image/*"
                onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                className="rounded-xl border border-border/80 bg-background/80 px-3 py-2 text-sm"
              />
            </div>
            <Button
              onClick={handleSubmitApplication}
              disabled={submitting || !cvFile}
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              {submitting ? "Envoi en cours..." : "Envoyer ma candidature"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
