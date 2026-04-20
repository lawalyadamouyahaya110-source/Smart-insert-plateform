"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, X, ArrowLeft, Send } from "lucide-react"
import { toast } from "sonner"
import type { ContractType } from "@/lib/types"

const contractTypes: ContractType[] = ["CDI", "CDD", "Stage", "Freelance", "Alternance", "Interim"]

export default function PublierOffrePage() {
  const router = useRouter()
  const [form, setForm] = useState({
    titre: "",
    description: "",
    lieu: "",
    typeContrat: "" as string,
    salaire: "",
    competenceInput: "",
    competences: [] as string[],
  })
  const [loading, setLoading] = useState(false)

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const user = getCurrentUser()
    if (!user) return

    if (!form.typeContrat) {
      toast.error("Veuillez selectionner un type de contrat")
      return
    }
    if (form.competences.length === 0) {
      toast.error("Ajoutez au moins une competence requise")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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
        toast.error(data.error || "Erreur lors de la soumission")
        return
      }

      toast.success("Offre soumise avec succes.")
      router.push("/entreprise")
    } catch {
      toast.error("Erreur lors de la soumission")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour
      </button>

      <h1 className="text-2xl font-bold text-foreground">Publier une offre</h1>
      <p className="mt-1 text-muted-foreground">
        Votre offre sera soumise a validation avant publication
      </p>

      <form onSubmit={handleSubmit} className="mt-8 max-w-2xl">
        <div className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="titre">Titre du poste <span className="text-destructive">*</span></Label>
            <Input
              id="titre"
              placeholder="Ex: Developpeur Full-Stack React"
              value={form.titre}
              onChange={(e) => update("titre", e.target.value)}
              required
              className="rounded-xl"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Description du poste <span className="text-destructive">*</span></Label>
            <Textarea
              id="description"
              placeholder="Decrivez le poste, les responsabilites, les avantages..."
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              required
              rows={6}
              className="rounded-xl"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="lieu">Lieu <span className="text-destructive">*</span></Label>
              <Input
                id="lieu"
                placeholder="Ex: Niamey, Niger"
                value={form.lieu}
                onChange={(e) => update("lieu", e.target.value)}
                required
                className="rounded-xl"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="type">Type de contrat <span className="text-destructive">*</span></Label>
              <Select value={form.typeContrat} onValueChange={(v) => update("typeContrat", v)}>
                <SelectTrigger id="type" className="rounded-xl">
                  <SelectValue placeholder="Choisir un type" />
                </SelectTrigger>
                <SelectContent>
                  {contractTypes.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="salaire">Salaire (optionnel)</Label>
            <Input
              id="salaire"
              placeholder="Ex: 45 000 - 100 000 FCFA/an"
              value={form.salaire}
              onChange={(e) => update("salaire", e.target.value)}
              className="rounded-xl"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Competences requises <span className="text-destructive">*</span></Label>
            <div className="flex gap-2">
              <Input
                placeholder="Ajouter une competence et appuyer sur Entree"
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

          <Button
            type="submit"
            disabled={loading}
            className="gap-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Send className="h-4 w-4" />
            {loading ? "Envoi en cours..." : "Soumettre l'offre"}
          </Button>
        </div>
      </form>
    </div>
  )
}
