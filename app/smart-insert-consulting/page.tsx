import Image from "next/image"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

const smartInsertServices = [
  "Recrutement",
  "Placement de personnel (administratif, terrain...)",
  "Gestion RH",
  "Interim",
  "Coaching emploi",
  "Team building",
  "Formation pour entreprise et ONG",
  "Visa de travail",
]

const smartAlternanceServices = [
  "Bourse d'etude internationale",
  "Octroi des bourses d'etude",
  "Formation complementaire (informatique, comptabilite, art oratoire, anglais, etc.)",
  "Accompagnement entrepreneurial",
  "Stage academique",
  "Stage d'immersion",
  "Contrat d'alternance",
  "Visa d'etude",
]

const smartGrowthServices = [
  "Developpement commercial",
  "Recrutement commercial",
  "Formation des equipes commerciales",
]

const packEntrepriseServices = [
  "Etude de marche",
  "Constitution d'equipe commerciale",
  "Elaboration de plan commercial",
  "Prospection et suivi post-prospects",
  "Developpement de portefeuille client",
  "Fidelisation client",
]

export default function SmartInsertConsultingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 px-4 py-10 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <section className="overflow-hidden rounded-3xl border border-border bg-card">
            <div className="grid items-center gap-8 p-6 md:p-10 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Presentation</p>
                <h1 className="mt-3 text-3xl font-bold text-foreground md:text-5xl">Smart Insert Consulting</h1>
                <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
                  Smart Insert accompagne les entreprises, les ONG, les etudiants et les professionnels avec des
                  services de recrutement, de formation et de developpement commercial.
                </p>
              </div>

              <div className="relative mx-auto flex w-full max-w-md items-center justify-center">
                <div className="absolute inset-8 rounded-full bg-primary/15 blur-3xl" />
                <div className="absolute -right-6 top-10 h-24 w-24 rounded-full bg-secondary/25 blur-2xl" />
                <div className="absolute -left-4 bottom-8 h-20 w-20 rounded-full bg-primary/20 blur-2xl" />
                <div className="relative w-full rounded-[2rem] border border-border/70 bg-white p-6 shadow-2xl shadow-primary/15 md:p-8">
                  <div className="relative aspect-square w-full overflow-hidden rounded-[1.5rem] bg-white">
                    <Image
                      src="/1737076354945.jpg"
                      alt="Logo Smart Insert"
                      fill
                      className="object-contain"
                      sizes="(min-width: 1024px) 420px, (min-width: 768px) 360px, 80vw"
                      priority
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-8 grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-xl font-semibold text-foreground">Smart Insert</h2>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {smartInsertServices.map((service) => (
                  <li key={service}>- {service}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-xl font-semibold text-foreground">Smart Alternance</h2>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {smartAlternanceServices.map((service) => (
                  <li key={service}>- {service}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-xl font-semibold text-foreground">Smart Growth</h2>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {smartGrowthServices.map((service) => (
                  <li key={service}>- {service}</li>
                ))}
              </ul>

              <h3 className="mt-6 text-base font-semibold text-foreground">Pack Entreprise</h3>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {packEntrepriseServices.map((service) => (
                  <li key={service}>- {service}</li>
                ))}
              </ul>
            </div>
          </section>

          <section className="mt-8 rounded-2xl border border-border bg-card p-6 md:p-8">
            <h2 className="text-xl font-semibold text-foreground">Contact</h2>
            <div className="mt-4 grid gap-4 text-sm text-muted-foreground md:grid-cols-2">
              <p>
                <span className="font-medium text-foreground">Disponibilite :</span> Niamey, Maradi et Tahoua
              </p>
              <p>
                <span className="font-medium text-foreground">Email :</span> smartinsert24@gmail.com
              </p>
              <p>
                <span className="font-medium text-foreground">Telephones :</span> 99369051 / 91764591 / 86366706
              </p>
              <p>
                <span className="font-medium text-foreground">Adresse :</span> Bobiel 2eme pompe
              </p>
            </div>
          </section>

          <section className="mt-8 rounded-2xl border border-border bg-primary/5 p-6 md:p-8">
            <h2 className="text-2xl font-bold text-foreground">Contactez-nous</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Besoin d'un accompagnement en recrutement, formation ou developpement commercial ? Notre equipe est
              disponible pour vous repondre rapidement.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href="mailto:smartinsert24@gmail.com"
                className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Envoyer un email
              </a>
              <a
                href="tel:+22799369051"
                className="rounded-xl border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
              >
                Appeler maintenant
              </a>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
