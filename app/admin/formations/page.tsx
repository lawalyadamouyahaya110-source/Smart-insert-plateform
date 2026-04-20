"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import type { TrainingCategory, TrainingOffer, Promotion } from "@/lib/types"

const categories: TrainingCategory[] = [
  "Informatique (Bureautique)",
  "Comptabilite",
  "Art oratoire",
  "Langue - Anglais",
  "Langue - Francaise",
  "Langue - Chinoise",
  "Langue - Espagnole",
]

export default function AdminFormations() {
  const [trainings, setTrainings] = useState<TrainingOffer[]>([])
  const [promos, setPromos] = useState<Promotion[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [promoSubmitting, setPromoSubmitting] = useState(false)
  const [trainingFile, setTrainingFile] = useState<File | null>(null)
  const [promoFile, setPromoFile] = useState<File | null>(null)
  const [form, setForm] = useState({
    titre: "",
    description: "",
    categorie: "" as TrainingCategory | "",
    imageUrl: "",
  })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [promo, setPromo] = useState({
    titre: "",
    description: "",
    imageUrl: "",
    link: "",
    isActive: true,
  })
  const [promoEditingId, setPromoEditingId] = useState<string | null>(null)

  const load = async () => {
    try {
      const [tRes, pRes] = await Promise.all([
        fetch("/api/trainings?all=1", { cache: "no-store" }),
        fetch("/api/promotions?all=1", { cache: "no-store" }),
      ])
      const tData = await tRes.json()
      const pData = await pRes.json()
      if (tRes.ok) setTrainings(tData as TrainingOffer[])
      if (pRes.ok) setPromos(pData as Promotion[])
    } catch {
      setTrainings([])
      setPromos([])
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const update = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }))
  const updatePromo = (key: string, value: string | boolean) => setPromo((p) => ({ ...p, [key]: value }))

  const uploadImage = async (file: File | null) => {
    if (!file) return null
    const body = new FormData()
    body.append("file", file)
    const res = await fetch("/api/upload", { method: "POST", body })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Upload echoue")
    return data.url as string
  }

  const handleCreateTraining = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.categorie) {
      toast.error("Veuillez choisir une categorie")
      return
    }
    setSubmitting(true)
    try {
      const uploadedUrl = await uploadImage(trainingFile)
      const res = await fetch(editingId ? `/api/trainings/${editingId}` : "/api/trainings", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titre: form.titre,
          description: form.description,
          categorie: form.categorie,
          imageUrl: uploadedUrl || form.imageUrl || null,
          status: "approuve",
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Erreur lors de la publication")
        return
      }
      toast.success(editingId ? "Formation modifiee" : "Formation publiee")
      setForm({ titre: "", description: "", categorie: "", imageUrl: "" })
      setTrainingFile(null)
      setEditingId(null)
      await load()
    } catch {
      toast.error("Erreur lors de la publication")
    } finally {
      setSubmitting(false)
    }
  }

  const handleCreatePromo = async (e: React.FormEvent) => {
    e.preventDefault()
    setPromoSubmitting(true)
    try {
      const uploadedUrl = await uploadImage(promoFile)
      const res = await fetch(promoEditingId ? `/api/promotions/${promoEditingId}` : "/api/promotions", {
        method: promoEditingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...promo,
          imageUrl: uploadedUrl || promo.imageUrl || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Erreur lors de la creation")
        return
      }
      toast.success(promoEditingId ? "Promo modifiee" : "Promo ajoutee")
      setPromo({ titre: "", description: "", imageUrl: "", link: "", isActive: true })
      setPromoFile(null)
      setPromoEditingId(null)
      await load()
    } catch {
      toast.error("Erreur lors de la creation")
    } finally {
      setPromoSubmitting(false)
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-foreground">Formations</h1>
      <p className="mt-1 text-muted-foreground">Publier et gerer les offres de formation</p>

      <form onSubmit={handleCreateTraining} className="mt-8 rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-card-foreground">
          {editingId ? "Modifier une formation" : "Publier une formation"}
        </h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label>Titre</Label>
            <Input value={form.titre} onChange={(e) => update("titre", e.target.value)} required className="rounded-xl" />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Categorie</Label>
            <Select value={form.categorie} onValueChange={(v) => update("categorie", v)}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Choisir une categorie" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2 lg:col-span-2">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={(e) => update("description", e.target.value)} required rows={4} className="rounded-xl" />
          </div>
          <div className="flex flex-col gap-2 lg:col-span-2">
            <Label>Image (fichier)</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setTrainingFile(e.target.files?.[0] || null)}
              className="rounded-xl"
            />
            <p className="text-xs text-muted-foreground">Ou coller une URL ci-dessous</p>
            <Input value={form.imageUrl} onChange={(e) => update("imageUrl", e.target.value)} className="rounded-xl" />
          </div>
        </div>
        <div className="mt-4">
          <Button type="submit" disabled={submitting} className="rounded-xl">
            {submitting ? "Enregistrement..." : (editingId ? "Enregistrer" : "Publier")}
          </Button>
          {editingId && (
            <Button
              type="button"
              variant="outline"
              className="ml-2 rounded-xl"
              onClick={() => {
                setForm({ titre: "", description: "", categorie: "", imageUrl: "" })
                setTrainingFile(null)
                setEditingId(null)
              }}
            >
              Annuler
            </Button>
          )}
        </div>
      </form>

      <form onSubmit={handleCreatePromo} className="mt-8 rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-card-foreground">
          {promoEditingId ? "Modifier une promo" : "Espace Promo"}
        </h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label>Titre</Label>
            <Input value={promo.titre} onChange={(e) => updatePromo("titre", e.target.value)} required className="rounded-xl" />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Lien (optionnel)</Label>
            <Input value={promo.link} onChange={(e) => updatePromo("link", e.target.value)} className="rounded-xl" />
          </div>
          <div className="flex flex-col gap-2 lg:col-span-2">
            <Label>Description</Label>
            <Textarea value={promo.description} onChange={(e) => updatePromo("description", e.target.value)} rows={3} className="rounded-xl" />
          </div>
          <div className="flex flex-col gap-2 lg:col-span-2">
            <Label>Image (fichier)</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setPromoFile(e.target.files?.[0] || null)}
              className="rounded-xl"
            />
            <p className="text-xs text-muted-foreground">Ou coller une URL ci-dessous</p>
            <Input value={promo.imageUrl} onChange={(e) => updatePromo("imageUrl", e.target.value)} className="rounded-xl" />
          </div>
        </div>
        <div className="mt-4">
          <Button type="submit" disabled={promoSubmitting} className="rounded-xl">
            {promoSubmitting ? "Enregistrement..." : (promoEditingId ? "Enregistrer" : "Ajouter une promo")}
          </Button>
          {promoEditingId && (
            <Button
              type="button"
              variant="outline"
              className="ml-2 rounded-xl"
              onClick={() => {
                setPromo({ titre: "", description: "", imageUrl: "", link: "", isActive: true })
                setPromoFile(null)
                setPromoEditingId(null)
              }}
            >
              Annuler
            </Button>
          )}
        </div>
      </form>

      <div className="mt-10">
        <h3 className="text-lg font-semibold text-foreground">Formations publiees</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {trainings.map((t) => (
            <div key={t.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold">{t.titre}</p>
                <Badge variant="secondary" className="rounded-lg text-xs">{t.categorie}</Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{t.description}</p>
              <div className="mt-3 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setForm({
                      titre: t.titre,
                      description: t.description,
                      categorie: t.categorie,
                      imageUrl: t.imageUrl || "",
                    })
                    setTrainingFile(null)
                    setEditingId(t.id)
                  }}
                  className="rounded-xl"
                >
                  Modifier
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={async () => {
                    if (!confirm("Supprimer cette formation ?")) return
                    const res = await fetch(`/api/trainings/${t.id}`, { method: "DELETE" })
                    if (!res.ok) {
                      toast.error("Erreur lors de la suppression")
                      return
                    }
                    toast.success("Formation supprimee")
                    await load()
                  }}
                  className="rounded-xl"
                >
                  Supprimer
                </Button>
              </div>
            </div>
          ))}
        </div>
        <h3 className="mt-8 text-lg font-semibold text-foreground">Promos actives</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {promos.map((p) => (
            <div key={p.id} className="rounded-2xl border border-border bg-card p-4">
              <p className="font-semibold">{p.titre}</p>
              {p.description && <p className="mt-2 text-sm text-muted-foreground">{p.description}</p>}
              <div className="mt-3 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPromo({
                      titre: p.titre,
                      description: p.description || "",
                      imageUrl: p.imageUrl || "",
                      link: p.link || "",
                      isActive: p.isActive,
                    })
                    setPromoFile(null)
                    setPromoEditingId(p.id)
                  }}
                  className="rounded-xl"
                >
                  Modifier
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={async () => {
                    if (!confirm("Supprimer cette promo ?")) return
                    const res = await fetch(`/api/promotions/${p.id}`, { method: "DELETE" })
                    if (!res.ok) {
                      toast.error("Erreur lors de la suppression")
                      return
                    }
                    toast.success("Promo supprimee")
                    await load()
                  }}
                  className="rounded-xl"
                >
                  Supprimer
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
