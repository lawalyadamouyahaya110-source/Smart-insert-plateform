import type { User, Job, Notification } from "./types"

const adminUser: User = {
  id: "admin-001",
  email: "admin@smartinsert.com",
  password: "admin123",
  role: "admin",
  nom: "Administrateur",
  telephone: "0600000000",
  createdAt: new Date().toISOString(),
}

const sampleEntreprise: User = {
  id: "ent-001",
  email: "contact@techcorp.com",
  password: "tech123",
  role: "entreprise",
  nom: "TechCorp Solutions",
  nomEntreprise: "TechCorp Solutions",
  secteur: "Technologies de l'information",
  siteWeb: "https://techcorp.com",
  adresse: "12 Rue de la Tech, Paris 75001",
  telephone: "0145678900",
  createdAt: new Date().toISOString(),
}

const sampleEntreprise2: User = {
  id: "ent-002",
  email: "rh@greenfinance.com",
  password: "green123",
  role: "entreprise",
  nom: "GreenFinance",
  nomEntreprise: "GreenFinance",
  secteur: "Finance & Banque",
  siteWeb: "https://greenfinance.com",
  adresse: "45 Avenue des Champs, Lyon 69000",
  telephone: "0478901234",
  createdAt: new Date().toISOString(),
}

const sampleJobs: Job[] = [
  {
    id: "job-001",
    entrepriseId: "ent-001",
    entrepriseNom: "TechCorp Solutions",
    titre: "Developpeur Full-Stack React/Node.js",
    description:
      "Nous recherchons un developpeur Full-Stack passionne pour rejoindre notre equipe dynamique. Vous travaillerez sur des projets innovants en utilisant React pour le frontend et Node.js pour le backend. Responsabilites: Developper des fonctionnalites frontend et backend, participer aux code reviews, collaborer avec l'equipe produit.",
    lieu: "Paris, France",
    typeContrat: "CDI",
    salaire: "45 000 - 55 000 EUR/an",
    competences: ["React", "Node.js", "TypeScript", "PostgreSQL", "Git"],
    status: "approuve",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "job-002",
    entrepriseId: "ent-001",
    entrepriseNom: "TechCorp Solutions",
    titre: "Designer UX/UI Senior",
    description:
      "Rejoignez notre equipe design pour creer des experiences utilisateur exceptionnelles. Vous serez en charge de la conception des interfaces de nos produits numeriques, de la recherche utilisateur a la livraison des maquettes finales.",
    lieu: "Paris, France",
    typeContrat: "CDI",
    salaire: "50 000 - 60 000 EUR/an",
    competences: ["Figma", "Adobe XD", "Prototypage", "Recherche UX", "Design System"],
    status: "approuve",
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "job-003",
    entrepriseId: "ent-002",
    entrepriseNom: "GreenFinance",
    titre: "Analyste Financier Junior",
    description:
      "GreenFinance recherche un analyste financier junior pour rejoindre son equipe. Vous participerez a l'analyse des marches financiers, la preparation de rapports et le suivi des investissements durables.",
    lieu: "Lyon, France",
    typeContrat: "CDD",
    salaire: "32 000 - 38 000 EUR/an",
    competences: ["Excel", "Analyse financiere", "Bloomberg", "Python", "SQL"],
    status: "approuve",
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: "job-004",
    entrepriseId: "ent-002",
    entrepriseNom: "GreenFinance",
    titre: "Stage - Assistant Marketing Digital",
    description:
      "Stage de 6 mois au sein du departement marketing. Vous aiderez a la gestion des reseaux sociaux, la creation de contenu et l'analyse des performances des campagnes digitales.",
    lieu: "Lyon, France",
    typeContrat: "Stage",
    salaire: "800 EUR/mois",
    competences: ["Marketing digital", "Reseaux sociaux", "Canva", "Google Analytics"],
    status: "en_attente",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "job-005",
    entrepriseId: "ent-001",
    entrepriseNom: "TechCorp Solutions",
    titre: "DevOps Engineer - Alternance",
    description:
      "Alternance de 12 mois pour un profil DevOps. Vous apprendrez a mettre en place des pipelines CI/CD, gerer l'infrastructure cloud et automatiser les deployements.",
    lieu: "Paris, France",
    typeContrat: "Alternance",
    salaire: "1 200 EUR/mois",
    competences: ["Docker", "Kubernetes", "AWS", "CI/CD", "Linux"],
    status: "en_attente",
    createdAt: new Date(Date.now() - 86400000 * 0.5).toISOString(),
  },
]

const sampleNotifications: Notification[] = [
  {
    id: "notif-001",
    userId: "admin-001",
    message: "Nouvelle offre soumise par GreenFinance : Stage - Assistant Marketing Digital",
    type: "nouvelle_offre",
    read: false,
    link: "/admin/offres",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "notif-002",
    userId: "admin-001",
    message: "Nouvelle offre soumise par TechCorp Solutions : DevOps Engineer - Alternance",
    type: "nouvelle_offre",
    read: false,
    link: "/admin/offres",
    createdAt: new Date(Date.now() - 86400000 * 0.5).toISOString(),
  },
]

export const seedData = {
  users: [adminUser, sampleEntreprise, sampleEntreprise2],
  jobs: sampleJobs,
  notifications: sampleNotifications,
}
