export type UserRole = "candidat" | "entreprise" | "admin"

export type ContractType = "CDI" | "CDD" | "Stage" | "Freelance" | "Alternance" | "Interim"

export type JobStatus = "en_attente" | "approuve" | "refuse"

export type ApplicationStatus = "envoyee" | "vue" | "acceptee" | "refusee"

export type NotificationType =
  | "candidature"
  | "offre_approuvee"
  | "offre_refusee"
  | "nouvelle_candidature"
  | "nouvelle_offre"

export type TrainingCategory =
  | "Informatique (Bureautique)"
  | "Comptabilite"
  | "Art oratoire"
  | "Langue - Anglais"
  | "Langue - Francaise"
  | "Langue - Chinoise"
  | "Langue - Espagnole"

export interface TrainingOffer {
  id: string
  titre: string
  description: string
  categorie: TrainingCategory
  imageUrl?: string
  status: "approuve" | "en_attente"
  createdAt: string
}

export interface Promotion {
  id: string
  titre: string
  description?: string
  imageUrl?: string
  link?: string
  createdAt: string
  isActive: boolean
}

export interface PartnerCompany {
  id: string
  nom: string
  imageUrl: string
  siteUrl?: string
  description?: string
  isActive: boolean
  createdAt: string
}

export interface User {
  id: string
  email: string
  password: string
  role: UserRole
  nom: string
  prenom?: string
  telephone: string
  nomEntreprise?: string
  secteur?: string
  siteWeb?: string
  adresse?: string
  createdAt: string
}

export interface Job {
  id: string
  entrepriseId: string
  entrepriseNom: string
  titre: string
  description: string
  lieu: string
  typeContrat: ContractType
  salaire?: string
  competences: string[]
  status: JobStatus
  createdAt: string
}

export interface Application {
  id: string
  candidatId: string
  candidatNom: string
  candidatEmail: string
  candidatTelephone: string
  jobId: string
  jobTitre: string
  entrepriseNom: string
  lettreMotivation: string
  status: ApplicationStatus
  createdAt: string
}

export interface Notification {
  id: string
  userId: string
  message: string
  type: NotificationType
  read: boolean
  link?: string
  createdAt: string
}
