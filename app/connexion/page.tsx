"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Briefcase, Eye, EyeOff, LogIn, UserPlus, Building2, Sparkles, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getRedirectPath, persistAuthenticatedUser } from "@/lib/auth"
import { initializeStore } from "@/lib/store"
import type { UserRole } from "@/lib/types"
import { toast } from "sonner"
import { useLanguage } from "@/components/language-provider"
import { LanguageSwitcher } from "@/components/language-switcher"

const secteurs = [
  "Technologies de l'information",
  "Finance & Banque",
  "Sante",
  "Education",
  "Commerce & Distribution",
  "Industrie",
  "BTP & Construction",
  "Transport & Logistique",
  "Media & Communication",
  "Autre",
]

export default function ConnexionPage() {
  const router = useRouter()
  const { t } = useLanguage()

  const [initialized, setInitialized] = useState(false)
  const [tab, setTab] = useState("connexion")
  const [profile, setProfile] = useState<"candidat" | "pme" | "grande_structure">("candidat")

  if (!initialized && typeof window !== "undefined") {
    initializeStore()
    setInitialized(true)
  }

  const onboarding = [
    {
      key: "candidat" as const,
      title: t("onboarding_candidate_title"),
      description: t("onboarding_candidate_desc"),
      cta: t("onboarding_cta_candidate"),
      tab: "candidat",
      steps: [t("onboarding_candidate_step_1"), t("onboarding_candidate_step_2"), t("onboarding_candidate_step_3")],
    },
    {
      key: "pme" as const,
      title: t("onboarding_pme_title"),
      description: t("onboarding_pme_desc"),
      cta: t("onboarding_cta_company"),
      tab: "entreprise",
      steps: [t("onboarding_pme_step_1"), t("onboarding_pme_step_2"), t("onboarding_pme_step_3")],
    },
    {
      key: "grande_structure" as const,
      title: t("onboarding_enterprise_title"),
      description: t("onboarding_enterprise_desc"),
      cta: t("onboarding_cta_company"),
      tab: "entreprise",
      steps: [t("onboarding_enterprise_step_1"), t("onboarding_enterprise_step_2"), t("onboarding_enterprise_step_3")],
    },
  ]
  const selectedGuide = onboarding.find((p) => p.key === profile) || onboarding[0]

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,color-mix(in_oklab,var(--primary)_18%,transparent),transparent_45%),radial-gradient(circle_at_95%_10%,color-mix(in_oklab,var(--secondary)_22%,transparent),transparent_38%)]" />
      <Link href="/" className="relative mb-8 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/25">
          <Briefcase className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="text-2xl font-bold tracking-tight text-foreground">
          Smart <span className="text-primary">Insert</span>
        </span>
      </Link>
      <div className="relative mb-5">
        <LanguageSwitcher />
      </div>

      <div className="relative w-full max-w-2xl rounded-3xl border border-border/80 bg-card/90 p-5 shadow-xl shadow-primary/10 backdrop-blur-sm md:p-7">
        <section className="mb-6 rounded-2xl border border-border/70 bg-background/70 p-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="text-base font-semibold text-foreground">{t("onboarding_title")}</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{t("onboarding_subtitle")}</p>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {onboarding.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setProfile(item.key)}
                className={`rounded-xl border p-3 text-left transition-colors ${
                  item.key === profile
                    ? "border-primary/40 bg-primary/10"
                    : "border-border/70 bg-card/70 hover:border-primary/30 hover:bg-primary/5"
                }`}
              >
                <p className="text-sm font-semibold text-foreground">{item.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
              </button>
            ))}
          </div>

          <div className="mt-4 rounded-xl border border-border/70 bg-card/70 p-4">
            <p className="text-sm font-semibold text-foreground">{t("onboarding_steps")}</p>
            <ul className="mt-2 space-y-2">
              {selectedGuide.steps.map((step) => (
                <li key={step} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-secondary" />
                  <span>{step}</span>
                </li>
              ))}
            </ul>
            <Button className="mt-4" onClick={() => setTab(selectedGuide.tab)}>
              {selectedGuide.cta}
            </Button>
          </div>
        </section>

        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 rounded-2xl border border-border/80 bg-muted/80 p-1">
            <TabsTrigger value="connexion" className="gap-1.5 rounded-xl text-xs font-semibold sm:text-sm">
              <LogIn className="h-3.5 w-3.5" />
              {t("auth_tab_login")}
            </TabsTrigger>
            <TabsTrigger value="candidat" className="gap-1.5 rounded-xl text-xs font-semibold sm:text-sm">
              <UserPlus className="h-3.5 w-3.5" />
              {t("auth_tab_candidate")}
            </TabsTrigger>
            <TabsTrigger value="entreprise" className="gap-1.5 rounded-xl text-xs font-semibold sm:text-sm">
              <Building2 className="h-3.5 w-3.5" />
              {t("auth_tab_company")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="connexion" className="mt-6">
            <LoginForm onSuccess={(role) => router.push(getRedirectPath(role))} />
          </TabsContent>
          <TabsContent value="candidat" className="mt-6">
            <CandidatForm onSuccess={() => router.push("/candidat")} />
          </TabsContent>
          <TabsContent value="entreprise" className="mt-6">
            <EntrepriseForm onSuccess={() => router.push("/entreprise")} />
          </TabsContent>
        </Tabs>
      </div>

      <p className="relative mt-8 text-center text-sm text-muted-foreground">
        <Link href="/" className="text-primary hover:underline">
          {t("auth_back_home")}
        </Link>
      </p>
    </div>
  )
}

function LoginForm({ onSuccess }: { onSuccess: (role: UserRole) => void }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, motDePasse: password }),
      })
      const data = await response.json()
      if (!response.ok) {
        toast.error(data.error || "Erreur de connexion")
        return
      }

      const apiUser = data.user as { id: string; email: string; role: UserRole; nom?: string; prenom?: string; telephone?: string }
      persistAuthenticatedUser(apiUser, data.token)

      toast.success("Connexion reussie")
      onSuccess(apiUser.role)
    } catch {
      toast.error("Erreur de connexion")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-border/80 bg-card/85 p-6 shadow-sm backdrop-blur-sm">
      <h2 className="text-xl font-semibold text-card-foreground">Se connecter</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Accedez a votre espace personnel
      </p>
      <div className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="login-email">Email</Label>
          <Input
            id="login-email"
            type="email"
            placeholder="votre@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-11 rounded-xl border-border/80 bg-background/80"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="login-password">Mot de passe</Label>
          <div className="relative">
            <Input
              id="login-password"
              type={showPassword ? "text" : "password"}
              placeholder="Votre mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-11 rounded-xl border-border/80 bg-background/80 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <Button type="submit" disabled={loading} className="mt-2">
          {loading ? "Connexion..." : "Se connecter"}
        </Button>
      </div>
      <div className="mt-4 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
      </div>
    </form>
  )
}

function CandidatForm({ onSuccess }: { onSuccess: () => void }) {
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const update = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas")
      return
    }
    if (form.password.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caracteres")
      return
    }
    setLoading(true)
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          motDePasse: form.password,
          role: "candidat",
          nom: form.nom,
          prenom: form.prenom,
          telephone: form.telephone,
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        toast.error(data.error || "Erreur lors de l'inscription")
        return
      }

      const apiUser = data.user as { id: string; email: string; role: UserRole; nom?: string; prenom?: string; telephone?: string }
      persistAuthenticatedUser(
        {
          ...apiUser,
          nom: apiUser.nom || form.nom,
          prenom: apiUser.prenom || form.prenom,
          telephone: form.telephone,
        },
        data.token,
      )

      toast.success("Compte candidat cree avec succes !")
      onSuccess()
    } catch {
      toast.error("Erreur lors de l'inscription")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-border/80 bg-card/85 p-6 shadow-sm backdrop-blur-sm">
      <h2 className="text-xl font-semibold text-card-foreground">Inscription Candidat</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Creez votre compte pour postuler aux offres
      </p>
      <div className="mt-6 flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="c-nom">Nom</Label>
            <Input id="c-nom" placeholder="Dupont" value={form.nom} onChange={(e) => update("nom", e.target.value)} required className="h-11 rounded-xl border-border/80 bg-background/80" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="c-prenom">Prenom</Label>
            <Input id="c-prenom" placeholder="Jean" value={form.prenom} onChange={(e) => update("prenom", e.target.value)} required className="h-11 rounded-xl border-border/80 bg-background/80" />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="c-email">Email</Label>
          <Input id="c-email" type="email" placeholder="jean.dupont@email.com" value={form.email} onChange={(e) => update("email", e.target.value)} required className="h-11 rounded-xl border-border/80 bg-background/80" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="c-tel">Telephone</Label>
          <Input id="c-tel" type="tel" placeholder="06 12 34 56 78" value={form.telephone} onChange={(e) => update("telephone", e.target.value)} required className="h-11 rounded-xl border-border/80 bg-background/80" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="c-pw">Mot de passe</Label>
          <div className="relative">
            <Input id="c-pw" type={showPassword ? "text" : "password"} placeholder="Min. 6 caracteres" value={form.password} onChange={(e) => update("password", e.target.value)} required className="h-11 rounded-xl border-border/80 bg-background/80 pr-10" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-label="Toggle password">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="c-cpw">Confirmer le mot de passe</Label>
          <Input id="c-cpw" type="password" placeholder="Confirmer" value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} required className="h-11 rounded-xl border-border/80 bg-background/80" />
        </div>
        <Button type="submit" disabled={loading} className="mt-2">
          {loading ? "Inscription..." : "S'inscrire comme candidat"}
        </Button>
      </div>
    </form>
  )
}

function EntrepriseForm({ onSuccess }: { onSuccess: () => void }) {
  const [form, setForm] = useState({
    nomEntreprise: "",
    secteur: "",
    siteWeb: "",
    adresse: "",
    email: "",
    telephone: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const update = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas")
      return
    }
    if (form.password.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caracteres")
      return
    }
    if (!form.secteur) {
      toast.error("Veuillez selectionner un secteur d'activite")
      return
    }
    setLoading(true)
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          motDePasse: form.password,
          role: "entreprise",
          nomEntreprise: form.nomEntreprise,
          telephone: form.telephone,
          secteur: form.secteur,
          siteWeb: form.siteWeb,
          adresse: form.adresse,
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        toast.error(data.error || "Erreur lors de l'inscription")
        return
      }

      const apiUser = data.user as { id: string; email: string; role: UserRole; nom?: string; telephone?: string }
      persistAuthenticatedUser(
        {
          ...apiUser,
          nom: apiUser.nom || form.nomEntreprise,
          nomEntreprise: form.nomEntreprise,
          secteur: form.secteur,
          siteWeb: form.siteWeb,
          adresse: form.adresse,
          telephone: form.telephone,
        },
        data.token,
      )

      toast.success("Compte entreprise cree avec succes !")
      onSuccess()
    } catch {
      toast.error("Erreur lors de l'inscription")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-border/80 bg-card/85 p-6 shadow-sm backdrop-blur-sm">
      <h2 className="text-xl font-semibold text-card-foreground">Inscription Entreprise</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Enregistrez votre entreprise pour publier des offres
      </p>
      <div className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="e-nom">Nom de l{"'"}entreprise <span className="text-destructive">*</span></Label>
          <Input id="e-nom" placeholder="Ex: TechCorp Solutions" value={form.nomEntreprise} onChange={(e) => update("nomEntreprise", e.target.value)} required className="h-11 rounded-xl border-border/80 bg-background/80" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="e-secteur">Secteur d{"'"}activite <span className="text-destructive">*</span></Label>
          <Select value={form.secteur} onValueChange={(v) => update("secteur", v)}>
            <SelectTrigger id="e-secteur" className="h-11 rounded-xl border-border/80 bg-background/80">
              <SelectValue placeholder="Choisir un secteur" />
            </SelectTrigger>
            <SelectContent>
              {secteurs.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="e-web">Site web <span className="text-destructive"></span></Label>
            <Input id="e-web" type="url" placeholder="https://..." value={form.siteWeb} onChange={(e) => update("siteWeb", e.target.value)}  className="h-11 rounded-xl border-border/80 bg-background/80" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="e-tel">Telephone <span className="text-destructive">*</span></Label>
            <Input id="e-tel" type="tel" placeholder="01 23 45 67 89" value={form.telephone} onChange={(e) => update("telephone", e.target.value)} required className="h-11 rounded-xl border-border/80 bg-background/80" />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="e-addr">Adresse <span className="text-destructive">*</span></Label>
          <Input id="e-addr" placeholder="Niamey, Niger" value={form.adresse} onChange={(e) => update("adresse", e.target.value)} required className="h-11 rounded-xl border-border/80 bg-background/80" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="e-email">Email professionnel <span className="text-destructive">*</span></Label>
          <Input id="e-email" type="email" placeholder="contact@entreprise.com" value={form.email} onChange={(e) => update("email", e.target.value)} required className="h-11 rounded-xl border-border/80 bg-background/80" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="e-pw">Mot de passe <span className="text-destructive">*</span></Label>
          <div className="relative">
            <Input id="e-pw" type={showPassword ? "text" : "password"} placeholder="Min. 6 caracteres" value={form.password} onChange={(e) => update("password", e.target.value)} required className="h-11 rounded-xl border-border/80 bg-background/80 pr-10" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-label="Toggle password">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="e-cpw">Confirmer le mot de passe <span className="text-destructive">*</span></Label>
          <Input id="e-cpw" type="password" placeholder="Confirmer" value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} required className="h-11 rounded-xl border-border/80 bg-background/80" />
        </div>
        <Button type="submit" disabled={loading} className="mt-2">
          {loading ? "Inscription..." : "Enregistrer l'entreprise"}
        </Button>
      </div>
    </form>
  )
}
