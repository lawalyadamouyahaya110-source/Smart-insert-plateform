"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { getCurrentUser } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { Promotion, TrainingOffer } from "@/lib/types"

export default function FormationsPage() {
  const [trainings, setTrainings] = useState<TrainingOffer[]>([])
  const [promos, setPromos] = useState<Promotion[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedTraining, setSelectedTraining] = useState<TrainingOffer | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    adresse: "",
    villePays: "",
  })
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      try {
        const [tRes, pRes] = await Promise.all([
          fetch("/api/trainings", { cache: "no-store" }),
          fetch("/api/promotions", { cache: "no-store" }),
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
    void load()
    const interval = setInterval(() => {
      if (document.hidden) return
      void load()
    }, 10000)
    const handleVisibility = () => {
      if (!document.hidden) void load()
    }
    document.addEventListener("visibilitychange", handleVisibility)
    return () => {
      clearInterval(interval)
      document.removeEventListener("visibilitychange", handleVisibility)
    }
  }, [])

  const refresh = async () => {
    try {
      const [tRes, pRes] = await Promise.all([
        fetch("/api/trainings", { cache: "no-store" }),
        fetch("/api/promotions", { cache: "no-store" }),
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

  const handleParticiper = (training: TrainingOffer) => {
    const user = getCurrentUser()
    if (!user) {
      toast.info("Connectez-vous pour participer")
      router.push("/connexion")
      return
    }
    if (user.role !== "candidat") {
      toast.error("Seuls les candidats peuvent participer")
      return
    }
    setSelectedTraining(training)
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    const user = getCurrentUser()
    if (!user || !selectedTraining) return
    if (
      !form.nom.trim() ||
      !form.prenom.trim() ||
      !form.email.trim() ||
      !form.telephone.trim() ||
      !form.adresse.trim() ||
      !form.villePays.trim()
    ) {
      toast.error("Veuillez remplir tous les champs")
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch("/api/trainings/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          trainingId: selectedTraining.id,
          candidatNom: form.nom,
          candidatPrenom: form.prenom,
          candidatEmail: form.email,
          candidatTelephone: form.telephone,
          candidatAdresse: form.adresse,
          candidatVillePays: form.villePays,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Erreur lors de l'inscription")
        return
      }
      toast.success("Inscription envoyee")
      setDialogOpen(false)
      setForm({
        nom: "",
        prenom: "",
        email: "",
        telephone: "",
        adresse: "",
        villePays: "",
      })
      setSelectedTraining(null)
    } catch {
      toast.error("Erreur lors de l'inscription")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 px-4 py-10 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl border border-border/80 bg-card/85 p-6 shadow-sm backdrop-blur-sm md:p-8">
            <span className="inline-flex rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
              Programme de formation
            </span>
            <h1 className="text-3xl font-bold text-foreground md:text-4xl">Formations</h1>
            <p className="mt-2 text-muted-foreground">Decouvrez nos formations disponibles</p>
            <div className="mt-4">
            <button
              onClick={refresh}
              className="rounded-xl border border-border/80 bg-background/80 px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted"
            >
              Rafraichir
            </button>
            </div>
          </div>

          {promos.length > 0 && (
            <section className="mt-8 rounded-3xl border border-border/80 bg-gradient-to-br from-primary/10 to-secondary/15 p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-foreground">Promos</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {promos.map((p) => (
                  <div key={p.id} className="rounded-2xl border border-border/80 bg-card/90 p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-card-foreground">{p.titre}</p>
                      {p.isActive && <Badge className="rounded-lg">Promo</Badge>}
                    </div>
                    {p.imageUrl && (
                      <Image
                        src={p.imageUrl}
                        alt={p.titre}
                        width={720}
                        height={320}
                        unoptimized
                        loading="lazy"
                        className="mt-3 h-40 w-full rounded-xl object-cover"
                      />
                    )}
                    {p.description && <p className="mt-2 text-sm text-muted-foreground">{p.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-foreground">Offres de formation</h2>
            <div className="mt-4 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {trainings.map((t) => (
                <div key={t.id} className="rounded-3xl border border-border/80 bg-card/90 p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10">
                  {t.imageUrl && (
                    <Image
                      src={t.imageUrl}
                      alt={t.titre}
                      width={720}
                      height={320}
                      unoptimized
                      loading="lazy"
                      className="h-40 w-full rounded-xl object-cover"
                    />
                  )}
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-lg font-semibold text-card-foreground">{t.titre}</p>
                    <Badge variant="secondary" className="rounded-lg text-xs">{t.categorie}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{t.description}</p>
                  <div className="mt-4">
                    <Button onClick={() => handleParticiper(t)}>
                      Participer
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="rounded-3xl border-border/80 bg-card/95 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">Participer - {selectedTraining?.titre}</DialogTitle>
            <DialogDescription>
              {selectedTraining?.categorie}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label>Confirmation</Label>
              <p className="text-sm text-muted-foreground">
                Confirmez votre inscription a cette formation.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="f-nom">Nom</Label>
                <input
                  id="f-nom"
                  className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="f-prenom">Prenom</Label>
                <input
                  id="f-prenom"
                  className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
                  value={form.prenom}
                  onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="f-email">Email</Label>
                <input
                  id="f-email"
                  type="email"
                  className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="f-telephone">Telephone</Label>
                <input
                  id="f-telephone"
                  className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
                  value={form.telephone}
                  onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-2 sm:col-span-2">
                <Label htmlFor="f-adresse">Adresse</Label>
                <input
                  id="f-adresse"
                  className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
                  value={form.adresse}
                  onChange={(e) => setForm({ ...form, adresse: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-2 sm:col-span-2">
                <Label htmlFor="f-villePays">Ville / Pays</Label>
                <input
                  id="f-villePays"
                  className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
                  value={form.villePays}
                  onChange={(e) => setForm({ ...form, villePays: e.target.value })}
                />
              </div>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {submitting ? "Envoi..." : "Envoyer ma demande"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
