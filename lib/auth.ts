import type { User, UserRole } from "./types"
import { getUserByEmail, addUser, getUserById, setSession, getSession, clearSession, upsertUser } from "./store"

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9)
}

export interface RegisterCandidatData {
  nom: string
  prenom: string
  email: string
  telephone: string
  password: string
}

export interface RegisterEntrepriseData {
  nomEntreprise: string
  secteur: string
  siteWeb: string
  adresse: string
  email: string
  telephone: string
  password: string
}

export function registerCandidat(data: RegisterCandidatData): { success: boolean; error?: string; user?: User } {
  const existing = getUserByEmail(data.email)
  if (existing) {
    return { success: false, error: "Un compte avec cet email existe deja." }
  }

  const user: User = {
    id: generateId(),
    email: data.email,
    password: data.password,
    role: "candidat",
    nom: data.nom,
    prenom: data.prenom,
    telephone: data.telephone,
    createdAt: new Date().toISOString(),
  }

  addUser(user)
  setSession(user.id)
  return { success: true, user }
}

export function registerEntreprise(data: RegisterEntrepriseData): { success: boolean; error?: string; user?: User } {
  const existing = getUserByEmail(data.email)
  if (existing) {
    return { success: false, error: "Un compte avec cet email existe deja." }
  }

  const user: User = {
    id: generateId(),
    email: data.email,
    password: data.password,
    role: "entreprise",
    nom: data.nomEntreprise,
    nomEntreprise: data.nomEntreprise,
    secteur: data.secteur,
    siteWeb: data.siteWeb,
    adresse: data.adresse,
    telephone: data.telephone,
    createdAt: new Date().toISOString(),
  }

  addUser(user)
  setSession(user.id)
  return { success: true, user }
}

export function login(email: string, password: string): { success: boolean; error?: string; user?: User } {
  const user = getUserByEmail(email)
  if (!user) {
    return { success: false, error: "Aucun compte trouve avec cet email." }
  }
  if (user.password !== password) {
    return { success: false, error: "Mot de passe incorrect." }
  }
  setSession(user.id)
  return { success: true, user }
}

export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth_token")
    fetch("/api/auth/logout", {
      method: "POST",
      keepalive: true,
    }).catch(() => undefined)
  }
  clearSession()
}

export function getCurrentUser(): User | null {
  const sessionId = getSession()
  if (!sessionId) return null
  return getUserById(sessionId) || null
}

function toLocalUser(apiUser: Partial<User> & { id: string; email: string; role: UserRole }): User {
  return {
    id: apiUser.id,
    email: apiUser.email,
    password: "",
    role: apiUser.role,
    nom: apiUser.nom || apiUser.nomEntreprise || "Utilisateur",
    prenom: apiUser.prenom,
    telephone: apiUser.telephone || "",
    nomEntreprise: apiUser.nomEntreprise,
    secteur: apiUser.secteur,
    siteWeb: apiUser.siteWeb,
    adresse: apiUser.adresse,
    createdAt: apiUser.createdAt || new Date().toISOString(),
  }
}

export function persistAuthenticatedUser(apiUser: Partial<User> & { id: string; email: string; role: UserRole }, token?: string | null) {
  const localUser = toLocalUser(apiUser)
  upsertUser(localUser)
  setSession(localUser.id)
  if (typeof window !== "undefined" && token) {
    localStorage.setItem("auth_token", token)
  }
  return localUser
}

export async function refreshCurrentUser(): Promise<User | null> {
  if (typeof window === "undefined") return null

  try {
    const response = await fetch("/api/auth/me", {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    })

    if (response.status === 401) {
      localStorage.removeItem("auth_token")
      clearSession()
      return null
    }

    if (!response.ok) {
      return getCurrentUser()
    }

    const data = await response.json()
    if (!data?.user) {
      return null
    }

    return persistAuthenticatedUser(data.user)
  } catch {
    return getCurrentUser()
  }
}

export function isAuthenticated(): boolean {
  return getCurrentUser() !== null
}

export function hasRole(role: UserRole): boolean {
  const user = getCurrentUser()
  return user?.role === role
}

export function getRedirectPath(role: UserRole): string {
  switch (role) {
    case "candidat":
      return "/candidat"
    case "entreprise":
      return "/entreprise"
    case "admin":
      return "/admin"
    default:
      return "/"
  }
}
