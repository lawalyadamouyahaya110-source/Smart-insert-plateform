"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import type { PartnerCompany } from "@/lib/types"

export default function AdminPartenaires() {
  const [partners, setPartners] = useState<PartnerCompany[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [partnerFile, setPartnerFile] = useState<File | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    nom: "",
    imageUrl: "",
    siteUrl: "",
    description: "",
    isActive: true,
  })

  const loadPartners = async () => {
    try {
      const res = await fetch("/api/partners?all=1", { cache: "no-store" })
      const data = await res.json()
      if (!res.ok) return
      setPartners(data as PartnerCompany[])
    } catch {
      setPartners([])
    }
  }

  useEffect(() => {
    void loadPartners()
  }, [])

  const update = (key: string, value: string | boolean) => setForm((prev) => ({ ...prev, [key]: value }))

  const uploadImage = async (file: File | null) => {
    if (!file) return null
    setUploading(true)
    try {
      const body = new FormData()
      body.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Upload echoue")
      }
      return String(data.url)
    } finally {
      setUploading(false)
    }
  }

  const resetForm = () => {
    setForm({
      nom: "",
      imageUrl: "",
      siteUrl: "",
      description: "",
      isActive: true,
    })
    setPartnerFile(null)
    setEditingId(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const uploadedUrl = await uploadImage(partnerFile)
      const finalImageUrl = uploadedUrl || form.imageUrl

      if (!finalImageUrl) {
        toast.error("Ajoute une image pour ce partenaire")
        return
      }

      const res = await fetch(editingId ? `/api/partners/${editingId}` : "/api/partners", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom: form.nom,
          imageUrl: finalImageUrl,
          siteUrl: form.siteUrl,
          description: form.description,
          isActive: form.isActive,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Erreur lors de l'enregistrement")
        return
      }

      toast.success(editingId ? "Partenaire modifie" : "Partenaire ajoute")
      resetForm()
      await loadPartners()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de l'enregistrement")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/partners/${id}`, { method: "DELETE" })
    const data = await res.json()
    if (!res.ok) {
      toast.error(data.error || "Suppression impossible")
      return
    }
    toast.success("Partenaire supprime")
    await loadPartners()
  }

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-foreground">Entreprises partenaires</h1>
      <p className="mt-1 text-muted-foreground">
        Ajoutez les logos des entreprises a afficher sur la page d'accueil dans un carrousel deroulant.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-card-foreground">
          {editingId ? "Modifier un partenaire" : "Ajouter un partenaire"}
        </h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label>Nom de l'entreprise</Label>
            <Input value={form.nom} onChange={(e) => update("nom", e.target.value)} required className="rounded-xl" />
          </div>
          <div className="flex items-center gap-3 pt-7">
            <input
              id="partner-active"
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => update("isActive", e.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            <Label htmlFor="partner-active">Afficher ce partenaire sur la page d'accueil</Label>
          </div>
          <div className="flex flex-col gap-2 lg:col-span-2">
            <Label>Image du logo</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setPartnerFile(e.target.files?.[0] || null)}
              className="rounded-xl"
            />
            <p className="text-xs text-muted-foreground">Ou coller une URL ci-dessous</p>
            <Input
              value={form.imageUrl}
              onChange={(e) => update("imageUrl", e.target.value)}
              placeholder="/uploads/logo.png ou https://..."
              className="rounded-xl"
            />
          </div>
          <div className="flex flex-col gap-2 lg:col-span-2">
            <Label>Site web (optionnel)</Label>
            <Input
              value={form.siteUrl}
              onChange={(e) => update("siteUrl", e.target.value)}
              placeholder="https://entreprise.com"
              className="rounded-xl"
            />
          </div>
          <div className="flex flex-col gap-2 lg:col-span-2">
            <Label>Description (optionnel)</Label>
            <Textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              rows={3}
              className="rounded-xl"
            />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="submit" disabled={submitting || uploading} className="rounded-xl">
            {submitting || uploading ? "Enregistrement..." : editingId ? "Enregistrer" : "Ajouter"}
          </Button>
          {editingId && (
            <Button type="button" variant="outline" className="rounded-xl" onClick={resetForm}>
              Annuler
            </Button>
          )}
        </div>
      </form>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {partners.map((partner) => (
          <div key={partner.id} className="rounded-2xl border border-border bg-card p-5">
            <div className="relative flex h-36 items-center justify-center overflow-hidden rounded-2xl border border-border/70 bg-white">
              <Image
                src={partner.imageUrl}
                alt={partner.nom}
                fill
                className="object-contain p-4"
                sizes="(min-width: 1280px) 320px, (min-width: 768px) 45vw, 90vw"
              />
            </div>
            <div className="mt-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-card-foreground">{partner.nom}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {partner.isActive ? "Visible sur l'accueil" : "Masque sur l'accueil"}
                  </p>
                </div>
              </div>
              {partner.description && (
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{partner.description}</p>
              )}
              {partner.siteUrl && (
                <a
                  href={partner.siteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
                >
                  Visiter le site
                </a>
              )}
              <div className="mt-4 flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => {
                    setEditingId(partner.id)
                    setForm({
                      nom: partner.nom,
                      imageUrl: partner.imageUrl,
                      siteUrl: partner.siteUrl || "",
                      description: partner.description || "",
                      isActive: partner.isActive,
                    })
                    setPartnerFile(null)
                  }}
                >
                  Modifier
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => void handleDelete(partner.id)}
                >
                  Supprimer
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
